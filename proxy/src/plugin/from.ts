const fp = require("fastify-plugin");
const lru = require("tiny-lru");
const querystring = require("querystring");
const Stream = require("stream");
const createError = require("http-errors");
const buildRequest = require("./request");
const Url = require("url");
const https = require("https");
const {
  filterPseudoHeaders,
  copyHeaders,
  stripHttp1ConnectionHeaders,
  buildURL,
} = require("./utils");

const { TimeoutError } = buildRequest;

export default fp(
  function from(
    fastify: {
      decorateReply: (
        arg0: string,
        arg1: (source: any, opts: any) => any
      ) => void;
      addHook: (arg0: string, arg1: (done: any) => void) => void;
      log: { warn: (arg0: string) => void };
      onClose: (arg0: (fastify: any, next: any) => void) => void;
    },
    opts: {
      contentTypesToEncode: any;
      retryMethods: any;
      disableCache: any;
      cacheURLs: any;
      base: any;
      http: any;
      http2: any;
      undici: any;
    },
    next: () => void
  ) {
    const contentTypesToEncode = new Set([
      "application/json",
      ...(opts.contentTypesToEncode || []),
    ]);

    const retryMethods = new Set(
      opts.retryMethods || ["GET", "HEAD", "OPTIONS", "TRACE"]
    );

    const cache = opts.disableCache ? undefined : lru(opts.cacheURLs || 100);
    const base = opts.base;

    fastify.decorateReply("from", function (this: any, source, opts) {
      opts = opts || {};

      source =
        source.indexOf("http") === 0
          ? source
          : this.request.headers.upstream
            ? `${this.request.headers.upstream}${source}`
            : this.request.query.upstream
              ? `${this.request.query.upstream}${source}`
              : `${opts.upstream}${source}`;

      const sourceURL = new Url.URL(source);
      const base = `${sourceURL.protocol}//${sourceURL.host}`;
      const req = this.request.raw;
      const getUpstream = opts.getUpstream || upstreamNoOp;

      const { proxy_key, proxy_cert, rewrite_method, rewrite_body, ...restBody } = this.request.body || {};

      if (rewrite_method !== 'undefined') {
        req.method = rewrite_method;

        if (rewrite_method === 'GET') {
          this.request.body = null;
        }

        if (rewrite_method === 'PUT') {
          this.request.body = rewrite_body ? rewrite_body : { ...restBody }
        }
      }

      // // we can forward the cert and key here, if we have them
      if (proxy_cert && proxy_key) {
        opts.body = req.method !== 'GET'
          ? rewrite_body ? rewrite_body : { ...restBody }
          : null;
        opts.http = {
          ...opts.http,
          agents: {
            ["https:"]: new https.Agent({
              key: proxy_key,
              cert: proxy_cert,
              rejectUnauthorized: false,
            }),
          },
        };
      }

      const { request, close, retryOnError } = buildRequest({
        http: opts.http,
        http2: opts.http2,
        upstream: sourceURL.host,
        undici: opts.undici,
      });

      const onResponse = opts.onResponse;
      const rewriteHeaders = opts.rewriteHeaders || headersNoOp;
      const rewriteRequestHeaders =
        opts.rewriteRequestHeaders || requestHeadersNoOp;
      const onError = opts.onError || onErrorDefault;
      const retriesCount = opts.retriesCount || 0;
      const maxRetriesOn503 = opts.maxRetriesOn503 || 10;

      source = sourceURL.pathname;

      // we leverage caching to avoid parsing the destination URL
      const dest = getUpstream(req, base);
      let url;
      if (cache) {
        url = cache.get(source) || buildURL(source, dest);
        cache.set(source, url);
      } else {
        url = buildURL(source, dest);
      }

      const sourceHttp2 = req.httpVersionMajor === 2;
      const headers = sourceHttp2
        ? filterPseudoHeaders(req.headers)
        : req.headers;
      headers.host = url.host;
      const qs = getQueryString(url.search, req.url, opts);
      let body: any = "";

      if (opts.body !== undefined) {
        if (opts.body !== null) {
          if (typeof opts.body.pipe === "function") {
            throw new Error(
              "sending a new body as a stream is not supported yet"
            );
          }

          if (opts.contentType) {
            body = opts.body;
          } else {
            body = JSON.stringify(opts.body);
            opts.contentType = "application/json";
          }

          headers["content-length"] = Buffer.byteLength(body);
          headers["content-type"] = opts.contentType;
        } else {
          body = undefined;
          headers["content-length"] = 0;
          delete headers["content-type"];
        }
      } else if (this.request.body) {
        if (this.request.body instanceof Stream) {
          body = this.request.body;
        } else {
          // Per RFC 7231 §3.1.1.5 if this header is not present we MAY assume application/octet-stream
          const contentType =
            req.headers["content-type"] || "application/octet-stream";
          // detect if body should be encoded as JSON
          // supporting extended content-type header formats:
          // - https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Type
          const lowerCaseContentType = contentType.toLowerCase();
          const plainContentType =
            lowerCaseContentType.indexOf(";") > -1
              ? lowerCaseContentType.slice(0, lowerCaseContentType.indexOf(";"))
              : lowerCaseContentType;
          const shouldEncodeJSON = contentTypesToEncode.has(plainContentType);
          // transparently support JSON encoding
          body = shouldEncodeJSON
            ? JSON.stringify(this.request.body)
            : this.request.body;
          // update origin request headers after encoding
          headers["content-length"] = Buffer.byteLength(body);
          headers["content-type"] = contentType;
        }
      }

      // according to https://tools.ietf.org/html/rfc2616#section-4.3
      // fastify ignore message body when it's a GET or HEAD request
      // when proxy this request, we should reset the content-length to make it a valid http request
      // discussion: https://github.com/fastify/fastify/issues/953
      if (req.method === "GET" || req.method === "HEAD") {
        // body will be populated here only if opts.body is passed.
        // if we are doing that with a GET or HEAD request is a programmer error
        // and as such we can throw immediately.
        if (body) {
          throw new Error(
            `Rewriting the body when doing a ${req.method} is not allowed`
          );
        }
      }

      const t0 = performance.now();
      this.request.log.info(
        { source, method: req.method, headers },
        "fetching from remote server"
      );

      const requestHeaders = rewriteRequestHeaders(req, headers);
      const contentLength = requestHeaders["content-length"];
      let requestImpl;
      if (retryMethods.has(req.method) && !contentLength) {
        requestImpl = createRequestRetry(
          request,
          this,
          retriesCount,
          retryOnError,
          maxRetriesOn503
        );
      } else {
        requestImpl = request;
      }

      requestImpl(
        { method: req.method, url, qs, headers: requestHeaders, body },
        (
          err: { code: string },
          res: { headers: any; statusCode: any; stream: any }
        ) => {
          if (err) {
            this.request.log.warn(err, "response errored");
            if (!this.sent) {
              if (
                err.code === "ERR_HTTP2_STREAM_CANCEL" ||
                err.code === "ENOTFOUND"
              ) {
                onError(this, { error: new createError.ServiceUnavailable() });
              } else if (
                err instanceof TimeoutError ||
                err.code === "UND_ERR_HEADERS_TIMEOUT"
              ) {
                onError(this, { error: new createError.GatewayTimeout() });
              } else {
                onError(this, { error: createError(500, err) });
              }
            }
            return;
          }
          const t1 = performance.now();
          this.request.log.info(`upstream response received`);
          this.request.log.info({
            upstreamResponseTime: t1 - t0,
            upstreamResponseCode: res.statusCode,
            upstreamHeaders: res.headers,
          });
          if (sourceHttp2) {
            copyHeaders(
              rewriteHeaders(stripHttp1ConnectionHeaders(res.headers), req),
              this
            );
          } else {
            copyHeaders(rewriteHeaders(res.headers, req), this);
          }
          this.code(res.statusCode);
          if (onResponse) {
            onResponse(this.request, this, res.stream);
          } else {
            this.send(res.stream);
          }
        }
      );
      return this;
    });

    fastify.addHook("onReady", (done) => {
      if (isFastifyMultipartRegistered(fastify)) {
        fastify.log.warn(
          "@dmikey/fasity-mtls-proxy/reply-from might not behave as expected when used with @fastify/multipart"
        );
      }
      done();
    });

    fastify.onClose((_fastify, next) => {
      close();
      // let the event loop do a full run so that it can
      // actually destroy those sockets
      setImmediate(next);
    });

    next();
  },
  {
    fastify: "3.x",
    name: "@dmikey/fastify-mtls-proxy/reply-from",
  }
);

function getQueryString(
  search: string | any[],
  reqUrl: string | string[],
  opts: { queryString: (arg0: any, arg1: any) => string }
) {
  if (typeof opts.queryString === "function") {
    return "?" + opts.queryString(search, reqUrl);
  }

  if (opts.queryString) {
    return "?" + querystring.stringify(opts.queryString);
  }

  if (search.length > 0) {
    return search;
  }

  const queryIndex = reqUrl.indexOf("?");

  if (queryIndex > 0) {
    return reqUrl.slice(queryIndex);
  }

  return "";
}

function headersNoOp(headers: any, _originalReq: any) {
  return headers;
}

function requestHeadersNoOp(_originalReq: any, headers: any) {
  return headers;
}

function upstreamNoOp(_req: any, base: any) {
  return base;
}

function onErrorDefault(reply: { send: (arg0: any) => void }, { error }: any) {
  reply.send(error);
}

function isFastifyMultipartRegistered(fastify: {
  decorateReply?: (arg0: string, arg1: (source: any, opts: any) => any) => void;
  addHook?: (arg0: string, arg1: (done: any) => void) => void;
  log?: { warn: (arg0: string) => void };
  onClose?: (arg0: (fastify: any, next: any) => void) => void;
  hasContentTypeParser?: any;
  hasRequestDecorator?: any;
}) {
  return (
    fastify.hasContentTypeParser("multipart") &&
    fastify.hasRequestDecorator("multipart")
  );
}

function createRequestRetry(
  requestImpl: (arg0: any, arg1: (err: any, res: any) => void) => void,
  reply: { sent: any },
  retriesCount: number,
  retryOnError: any,
  maxRetriesOn503: number
) {
  function requestRetry(
    req: { method: string },
    cb: (arg0: any, arg1: any) => void
  ) {
    let retries = 0;

    function run() {
      requestImpl(req, function (err, res) {
        // Magic number, so why not 42? We might want to make this configurable.
        let retryAfter = 42 * Math.random() * (retries + 1);

        if (res && res.headers["retry-after"]) {
          retryAfter = res.headers["retry-after"];
        }
        if (!reply.sent) {
          // always retry on 503 errors
          if (res && res.statusCode === 503 && req.method === "GET") {
            if (retriesCount === 0 && retries < maxRetriesOn503) {
              // we should stop at some point
              return retry(retryAfter);
            }
          } else if (
            retriesCount > retries &&
            err &&
            err.code === retryOnError
          ) {
            return retry(retryAfter);
          }
        }
        cb(err, res);
      });
    }

    function retry(after: number | undefined) {
      retries += 1;
      setTimeout(run, after);
    }

    run();
  }

  return requestRetry;
}
