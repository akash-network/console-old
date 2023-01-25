import { FastifyInstance, FastifyLoggerInstance } from "fastify";
import fp from "fastify-plugin";
import { Server, IncomingMessage, ServerResponse } from "http";
import From from "./from";
import WebSocket from "ws";
import https from 'node:https';

const httpMethods = [
  "DELETE",
  "GET",
  "HEAD",
  "PATCH",
  "POST",
  "PUT",
  "OPTIONS",
];

const urlPattern = /^https?:\/\//;

export type Options = {
  replyOptions: {
    getUpstream: () => void;
  };
};

function convertUrlToWebSocket(urlString: string) {
  if (typeof urlString !== "string") return urlString;
  return urlString.replace(/^(http)(s)?:\/\//, "ws$2://");
}

function liftErrorCode(code: number) {
  if (typeof code !== "number") {
    // Sometimes "close" event emits with a non-numeric value
    return 1011;
  } else if (code === 1004 || code === 1005 || code === 1006) {
    // ws module forbid those error codes usage, lift to "application level" (4xxx)
    return 4000 + (code % 1000);
  } else {
    return code;
  }
}

function closeWebSocket(
  socket: { readyState: any; close: (arg0: number, arg1: any) => void },
  code: number,
  reason: any
) {
  if (socket.readyState === WebSocket.OPEN) {
    socket.close(liftErrorCode(code), reason);
  }
}

function waitConnection(
  socket: { readyState: any; once: (arg0: string, arg1: any) => void },
  write: { (): any; (): any; (): any; (): void }
) {
  if (socket.readyState === WebSocket.CONNECTING) {
    socket.once("open", write);
  } else {
    write();
  }
}

function isExternalUrl(url = "") {
  return urlPattern.test(url);
}

function proxyWebSockets(source: any, target: any) {
  function close(code: number, reason: string) {
    closeWebSocket(source, code, reason);
    closeWebSocket(target, code, reason);
  }

  source.on("message", (data: any) =>
    waitConnection(target, () => target.send(data))
  );
  source.on("ping", (data: any) =>
    waitConnection(target, () => target.ping(data))
  );
  source.on("pong", (data: any) =>
    waitConnection(target, () => target.pong(data))
  );
  source.on("close", close);
  source.on("error", (error: any) => close(1011, error.message));
  source.on("unexpected-response", () => close(1011, "unexpected response"));

  // source WebSocket is already connected because it is created by ws server
  target.on("message", (data: any) => source.send(data));
  target.on("ping", (data: any) => source.ping(data));
  target.on("pong", (data: any) => source.pong(data));
  target.on("close", close);
  target.on("error", (error: any) => close(1011, error.message));
  target.on("unexpected-response", () => close(1011, "unexpected response"));
}

function setupWebSocketProxy(
  fastify: FastifyInstance<
    Server,
    IncomingMessage,
    ServerResponse,
    FastifyLoggerInstance
  >,
  options: { wsServerOptions?: any; wsClientOptions?: any; replyOptions: { getUpstream: any } },
  rewritePrefix: string
) {
  const server = new WebSocket.Server({
    server: fastify.server,
    ...options.wsServerOptions,
  });

  fastify.addHook("onClose", (instance, done) => server.close(done));

  // To be able to close the HTTP server,
  // all WebSocket clients need to be disconnected.
  // Fastify is missing a pre-close event, or the ability to
  // add a hook before the server.close call. We need to resort
  // to monkeypatching for now.
  const oldClose = fastify.server.close;
  (fastify.server as any).close = function (
    done: ((err?: Error | undefined) => void) | undefined
  ) {
    for (const client of server.clients) {
      client.close();
    }
    oldClose.call(this, done);
  };

  server.on("error", (err: unknown) => {
    fastify.log.error(err);
  });

  server.on(
    "connection",
    (source: any, request: { url: string; headers: { cookie: any } }) => {
      if (fastify.prefix && !request.url.startsWith(fastify.prefix)) {
        fastify.log.debug({ url: request.url }, "not matching prefix");
        source.close();
        return;
      }

      source.on("message", (data: any) => {
        const msg = JSON.parse(data.toString());
        const url = options.replyOptions.getUpstream(request, "wss://");

        if (msg.type !== "certificate") return;

        const cert = msg.certificate;
        let optionsWs = {};

        if (request.headers.cookie) {
          const headers = { cookie: request.headers.cookie };
          optionsWs = { ...options.wsClientOptions, headers };
        } else {
          optionsWs = options.wsClientOptions;
        }

        const agent = new https.Agent({
          key: cert.privateKey,
          cert: cert.csr,
          rejectUnauthorized: false,
        });

        const target = new WebSocket(url, {
          ...optionsWs,
          agent
        });

        target.on("open", (data: any) => {
          fastify.log.info({ url }, "proxy websocket established");
        })

        fastify.log.debug({ url }, "proxy websocket starting...");
        proxyWebSockets(source, target);
      });
    }
  );
}

function generateRewritePrefix(
  prefix: string,
  opts: { rewritePrefix?: any; upstream?: any }
) {
  if (!prefix) {
    return "";
  }

  let rewritePrefix =
    opts.rewritePrefix ||
    (opts.upstream ? new URL(opts.upstream).pathname : "/");

  if (!prefix.endsWith("/") && rewritePrefix.endsWith("/")) {
    rewritePrefix = rewritePrefix.slice(0, -1);
  }

  return rewritePrefix;
}

export default fp(
  async (fastify, opts: any) => {
    if (
      !opts.upstream &&
      !(
        opts.replyOptions && typeof opts.replyOptions.getUpstream === "function"
      )
    ) {
      opts.replyOptions = {
        ...opts.replyOptions,
        getUpstream: (req: any, base: string) => {
          let pathParts: Array<string> = (req.url as string)
            .replace("/upstream/", "")
            .split("/");

          const [protocol, host, port] = pathParts;

          const url: any =
            req.url.indexOf("http") === 0
              ? new URL(`${req.url}`)
              : new URL(`${base}${req.url}`);

          const dst = `${base}${url.pathname.replace(
            `/upstream/${protocol}/${host}/${port}`,
            ""
          )}`;

          const query = url.searchParams.toString();
          const upstream = query !== '' ? `${dst}?${query}` : dst;

          return upstream;
        },
      };
    }

    const preHandler = opts.preHandler || opts.beforeHandler;
    const rewritePrefix = generateRewritePrefix(fastify.prefix, opts);

    const fromOpts = Object.assign({}, opts);
    fromOpts.base = opts.upstream;
    fromOpts.prefix = undefined;

    const oldRewriteHeaders = (opts.replyOptions || {}).rewriteHeaders;
    const replyOpts = Object.assign({}, opts.replyOptions, {
      rewriteHeaders,
    });
    fromOpts.rewriteHeaders = rewriteHeaders;

    fastify.register(From, fromOpts);

    function rewriteHeaders(headers: { location: any }) {
      const location = headers.location;
      if (location && !isExternalUrl(location)) {
        headers.location = location.replace(rewritePrefix, fastify.prefix);
      }
      if (oldRewriteHeaders) {
        headers = oldRewriteHeaders(headers);
      }
      return headers;
    }

    function bodyParser(
      req: any,
      payload: any,
      done: (arg0: null, arg1: any) => void
    ) {
      done(null, payload);
    }

    fastify.route({
      url: "/",
      method: opts.httpMethods || httpMethods,
      preHandler,
      config: opts.config || {},
      constraints: opts.constraints || {},
      handler,
    } as any);

    fastify.route({
      url: "/*",
      method: opts.httpMethods || httpMethods,
      preHandler,
      config: opts.config || {},
      constraints: opts.constraints || {},
      handler,
    } as any);

    function handler(
      this: any,
      request: { raw: { url: string | string[] }; headers: any; body: any },
      reply: {
        from: (arg0: any, arg1: any) => void;
        code: (arg0: any) => void;
      }
    ) {
      const queryParamIndex = request.raw.url.indexOf("?");
      let dest: any = request.raw.url.slice(
        0,
        queryParamIndex !== -1 ? queryParamIndex : undefined
      );
      dest = dest.replace(this.prefix, rewritePrefix);

      // if no upstream specified, or this path wasn't already handled then return 404
      if (
        !request.headers.upstream &&
        request.raw.url.indexOf("upstream") === -1
      ) {
        reply.code(404);
      }

      if (request.raw.url.indexOf("upstream") !== -1) {
        // do a quick check to see if upstream is passed in as a path
        // this is so we can proxy RPC requests where query params are not passed along
        let pathParts: Array<string> = (request.raw.url as string)
          .replace("/upstream/", "")
          .split("/");

        const [protocol, host, port] = pathParts;

        dest = "/"; // @todo: fix this
        if (protocol && host && port) {
          replyOpts.upstream = `${protocol}://${host}:${port}`;
        }
      }

      reply.from(dest || "/", replyOpts);
    }

    setupWebSocketProxy(fastify, opts, rewritePrefix);
  },
  {
    fastify: "3.x",
    name: "@dmikey/fastify-mtls-proxy",
  }
);
