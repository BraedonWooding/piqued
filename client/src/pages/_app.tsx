import { CssBaseline, MuiThemeProvider } from "@material-ui/core";
import "../styles/globals.css";
import { theme } from "../theme";

const MyApp = ({ Component, pageProps }: any) => {
  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      <Component {...pageProps} />
    </MuiThemeProvider>
  );
};

export default MyApp;
