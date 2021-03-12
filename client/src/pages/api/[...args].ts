/*
    Why the f*** does this work you may ask?

    Who goddamn knows, but it does.  Roughly my guess is that either [...args].js
    is some special path magic where it collates all the args into a variadic
    or it doesn't matter whatsoever (doubtful)

    Anyways this just proxies all api requests to backend
 */

import { createProxyMiddleware } from "http-proxy-middleware";

export const config = {
  api: {
    bodyParser: false,
  },
};

const proxy = createProxyMiddleware({
  target: process.env.NEXT_PUBLIC_API_URL,
  pathRewrite: { "^/api/": "" },
  // some other config
  ws: true, // proxy websockets
  onProxyReq: (proxyReq) => {
    // some stupid person felt it was a good idea to have it so that
    // it will trim any trailing '/'s almost certainly because
    // the author fixed this bug badly https://github.com/chimurai/http-proxy-middleware/issues/368#issuecomment-541461108
    // since django doesn't handle post requests with trailing /'s correctly sadly.
    let position = proxyReq.path.lastIndexOf("?");
    if (position < 0) position = proxyReq.path.length;
    proxyReq.path = proxyReq.path.substring(0, position) + "/" + proxyReq.path.substring(position);
  },
});

export default proxy;
