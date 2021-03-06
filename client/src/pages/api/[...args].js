import { createProxyMiddleware } from "http-proxy-middleware";

export const config = {
  api: {
    bodyParser: false,
  },
}

const proxy = createProxyMiddleware({
  target: "http://localhost:8000",
  pathRewrite: { '^/api/': '' },
  // some other config
  ws: true, // proxy websockets
  onProxyReq: (proxyReq) => {
    var position = proxyReq.path.lastIndexOf('?');
    return proxyReq.path = proxyReq.path.substring(0, position) + '/' + proxyReq.path.substring(position);
  }
});

export default proxy;