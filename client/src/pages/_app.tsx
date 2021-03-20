import DateFnsUtils from "@date-io/date-fns";
import { CssBaseline, MuiThemeProvider } from "@material-ui/core";
import { MuiPickersUtilsProvider } from "@material-ui/pickers";
import { createProxyMiddleware } from "http-proxy-middleware";
import "../styles/globals.css";
import { theme } from "../theme";

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

const MyApp = ({ Component, pageProps }: any) => {
  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      <MuiPickersUtilsProvider utils={DateFnsUtils}>
        <Component {...pageProps} />
      </MuiPickersUtilsProvider>
    </MuiThemeProvider>
  );
};

export default MyApp;
