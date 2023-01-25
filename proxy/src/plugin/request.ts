import semver from "semver";
import http from "http";
import https from "https";
import querystring from "querystring";
import eos from "end-of-stream";
import pump from "pump";
import undici from "undici";
import { stripHttp1ConnectionHeaders } from "./utils";
import http2 from "http2";

class TimeoutError extends Error {}

function shouldUseUndici(opts: { undici: boolean; http: any; http2: any }) {
  if (opts.undici === false || opts.http || opts.http2) {
    return false;
  }
  return true;
}

function isUndiciInstance(obj: any) {
  return (
    obj instanceof undici.Pool ||
    obj instanceof undici.Client ||
    obj instanceof undici.Dispatcher
  );
}

function buildRequest(opts: any) {
  const isHttp2 = !!opts.http2;
  const hasUndiciOptions = shouldUseUndici(opts);
  const requests = {
    "http:": http,
    "https:": https,
    "unix+http:": { base: http, request: unixRequest },
    "unix+https:": { base: https, request: unixRequest },
  };
  const http2Opts = getHttp2Opts(opts);
  const httpOpts = getHttpOpts(opts);
  const baseUrl = opts.base && new URL(opts.base).origin;

  // setting the default to something bigger so it doesn't have to be
  // set by the user
  const undiciOpts = opts.undici || {
    timeout: "300000",
  };
  let http2Client: {
    destroy: () => void;
    destroyed: any;
    once: (arg0: string, arg1: () => void) => void;
    setMaxListeners: (arg0: number) => void;
    setTimeout: (arg0: any, arg1: () => void) => void;
    removeListener: (arg0: string, arg1: any) => void;
    request: (arg0: any, arg1: any) => any;
  };
  let undiciAgent: { destroy: () => any };
  let undiciInstance: { destroy: () => any };
  let agents: { [x: string]: any };

  if (isHttp2) {
    if (semver.lt(process.version, "9.0.0")) {
      throw new Error("Http2 support requires Node version >= 9.0.0");
    }
    if (!opts.base)
      throw new Error("Option base is required when http2 is true");
    if (opts.base.startsWith("unix+")) {
      throw new Error(
        "Unix socket destination is not supported when http2 is true"
      );
    }
  } else {
    agents = {
      "http:": new http.Agent(httpOpts.agentOptions),
      "https:": new https.Agent(httpOpts.agentOptions),
      ...httpOpts.agents,
    };
  }

  if (isHttp2) {
    return { request: handleHttp2Req, close, retryOnError: "ECONNRESET" };
  } else if (hasUndiciOptions) {
    if (opts.base && opts.base.startsWith("unix+")) {
      const undiciOpts = getUndiciOptions(opts.undici);
      (undiciOpts as any).socketPath = decodeURIComponent(
        new URL(opts.base).host
      );
      const protocol = opts.base.startsWith("unix+https") ? "https" : "http";
      undiciInstance = new undici.Pool(protocol + "://localhost", undiciOpts);
    } else if (isUndiciInstance(opts.undici)) {
      undiciInstance = opts.undici;
    } else {
      undiciAgent = new undici.Agent(getUndiciOptions(opts.undici));
    }
    return { request: handleUndici, close, retryOnError: "UND_ERR_SOCKET" };
  } else {
    return { request: handleHttp1Req, close, retryOnError: "ECONNRESET" };
  }

  function close() {
    if (hasUndiciOptions) {
      undiciAgent && undiciAgent.destroy();
      undiciInstance && undiciInstance.destroy();
    } else if (!isHttp2) {
      agents["http:"].destroy();
      agents["https:"].destroy();
    } else if (http2Client) {
      http2Client.destroy();
    }
  }

  function handleHttp1Req(
    opts: {
      url: { protocol: string; port: any; pathname: any; hostname: any };
      method: any;
      qs: any;
      headers: any;
      body: any;
    },
    done: (
      arg0: TimeoutError | null,
      arg1: { statusCode: any; headers: any; stream: any } | undefined
    ) => void
  ) {
    const req = (requests as any)[opts.url.protocol].request({
      method: opts.method,
      port: opts.url.port,
      path: opts.url.pathname + opts.qs,
      hostname: opts.url.hostname,
      headers: opts.headers,
      agent: agents[opts.url.protocol.replace(/^unix:/, "")],
      ...httpOpts.requestOptions,
    });
    req.on("error", done);
    req.on("response", (res: { statusCode: any; headers: any }) => {
      done(null, {
        statusCode: res.statusCode,
        headers: res.headers,
        stream: res,
      });
    });
    req.once("timeout", () => {
      const err = new TimeoutError("HTTP request timed out");
      req.abort();
      done(err, undefined);
    });

    end(req, opts.body, done as any);
  }

  function handleUndici(
    opts: {
      url: { origin: any; pathname: any; protocol: string };
      qs: any;
      method: any;
      headers: any;
      body: any;
    },
    done: (
      arg0: Error | null,
      arg1: { statusCode: any; headers: any; stream: any } | undefined
    ) => void
  ) {
    const req = {
      origin: baseUrl || opts.url.origin,
      path: opts.url.pathname + opts.qs,
      method: opts.method,
      headers: Object.assign({}, opts.headers),
      body: opts.body,
      headersTimeout: undiciOpts.headersTimeout,
      bodyTimeout: undiciOpts.bodyTimeout,
    };

    let pool;

    if (undiciInstance) {
      pool = undiciInstance;
    } else if (!baseUrl && opts.url.protocol.startsWith("unix")) {
      done(new Error("unix socket not supported with undici yet"), undefined);
      return;
    } else {
      pool = undiciAgent;
    }

    // remove forbidden headers
    req.headers.connection = undefined;
    req.headers["transfer-encoding"] = undefined;

    (pool as any).request(
      req,
      function (
        err: any,
        res: { headers: { [x: string]: any }; statusCode: any; body: any }
      ) {
        if (err) {
          done(err, undefined);
          return;
        }

        // using delete, otherwise it will render as an empty string
        delete res.headers["transfer-encoding"];

        done(null, {
          statusCode: res.statusCode,
          headers: res.headers,
          stream: res.body,
        });
      }
    );
  }

  function handleHttp2Req(
    opts: {
      method: string;
      url: { pathname: any };
      qs: any;
      headers: any;
      body: any;
    },
    done: (
      arg0: TimeoutError | null,
      arg1: { statusCode: any; headers: any; stream: any } | undefined
    ) => void
  ) {
    let cancelRequest: (() => void) | undefined;
    let sessionTimedOut = false;

    if (!http2Client || http2Client.destroyed) {
      http2Client = http2.connect(baseUrl, http2Opts.sessionOptions);
      http2Client.once("error", done as any);
      // we might enqueue a large number of requests in this connection
      // before it's connected
      http2Client.setMaxListeners(0);
      http2Client.setTimeout(http2Opts.sessionTimeout, function () {
        if (cancelRequest) {
          cancelRequest();
          cancelRequest = undefined;
          sessionTimedOut = true;
        }
        http2Client.destroy();
      });
      http2Client.once("connect", () => {
        // reset the max listener to 10 on connect
        http2Client.setMaxListeners(10);
        http2Client.removeListener("error", done);
      });
    }
    const req = http2Client.request(
      {
        ":method": opts.method,
        ":path": opts.url.pathname + opts.qs,
        ...stripHttp1ConnectionHeaders(opts.headers),
      },
      http2Opts.requestOptions
    );
    const isGet = opts.method === "GET" || opts.method === "get";
    if (!isGet) {
      end(req, opts.body, done as any);
    }
    req.setTimeout(http2Opts.requestTimeout, () => {
      const err = new TimeoutError("HTTP/2 request timed out");
      req.close(http2.constants.NGHTTP2_CANCEL);
      done(err, undefined);
    });
    req.once("close", () => {
      if (sessionTimedOut) {
        const err = new TimeoutError("HTTP/2 session timed out");
        done(err, undefined);
      }
    });
    cancelRequest = eos(req, (err: any) => {
      if (err) done(err, undefined);
    });
    req.on("response", (headers: { [x: string]: any }) => {
      const statusCode = headers[":status"];
      done(null, { statusCode, headers, stream: req });
    });
  }
}

module.exports = buildRequest;
module.exports.TimeoutError = TimeoutError;

function unixRequest(
  this: {
    base: typeof http | typeof https;
    request: (opts: { port: any; socketPath: string; hostname: string }) => any;
  },
  opts: {
    port: any;
    socketPath: string;
    hostname: string;
  }
) {
  delete opts.port;
  opts.socketPath = querystring.unescape(opts.hostname);
  delete (opts as any).hostname;
  return this.base.request(opts);
}

function end(
  req: { end: (arg0: any) => void },
  body: { pipe: any; constructor: any },
  cb: (arg0: Error) => void
) {
  if (!body || typeof body === "string" || body instanceof Uint8Array) {
    req.end(body);
  } else if (body.pipe) {
    pump(body as any, req as any, (err: any) => {
      if (err) cb(err);
    });
  } else {
    cb(new Error(`type unsupported for body: ${body.constructor}`));
  }
}

function getHttp2Opts(opts: { http2: any; sessionTimeout: number }) {
  if (!opts.http2) {
    return {};
  }

  let http2Opts = opts.http2;
  if (typeof http2Opts === "boolean") {
    http2Opts = {};
  }
  http2Opts.sessionOptions = http2Opts.sessionOptions || {};

  if (!http2Opts.sessionTimeout) {
    http2Opts.sessionTimeout = opts.sessionTimeout || 6000;
  }
  if (!http2Opts.requestTimeout) {
    http2Opts.requestTimeout = 10000;
  }
  http2Opts.sessionOptions.rejectUnauthorized =
    http2Opts.sessionOptions.rejectUnauthorized || false;

  return http2Opts;
}

function getHttpOpts(opts: { http: any }) {
  const httpOpts = typeof opts.http === "object" ? opts.http : {};
  httpOpts.requestOptions = httpOpts.requestOptions || {};

  if (!httpOpts.requestOptions.timeout) {
    httpOpts.requestOptions.timeout = 10000;
  }

  httpOpts.requestOptions.rejectUnauthorized =
    httpOpts.requestOptions.rejectUnauthorized || false;

  httpOpts.agentOptions = getAgentOptions(opts);

  return httpOpts;
}

function getAgentOptions(opts: { http: { agentOptions: any } }) {
  return {
    keepAlive: true,
    keepAliveMsecs: 60 * 1000, // 1 minute
    maxSockets: 2048,
    maxFreeSockets: 2048,
    ...(opts.http && opts.http.agentOptions),
  };
}

function getUndiciOptions(opts = {}) {
  const res = {
    pipelining: 1,
    connections: 128,
    tls: {} as any,
    ...opts,
  };

  res.tls.rejectUnauthorized = res.tls.rejectUnauthorized || false;

  return res;
}

module.exports.getUndiciOptions = getUndiciOptions;
