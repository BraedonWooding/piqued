import DateFnsUtils from "@date-io/date-fns";
import { CssBaseline, MuiThemeProvider } from "@material-ui/core";
import { MuiPickersUtilsProvider } from "@material-ui/pickers";
import "styles/globals.css";
import { theme } from "theme";
import "util/axios";

const MyApp = ({ Component, pageProps }: any) => (
  <MuiThemeProvider theme={theme}>
    <CssBaseline />
    <MuiPickersUtilsProvider utils={DateFnsUtils}>
      <Component {...pageProps} />
    </MuiPickersUtilsProvider>
  </MuiThemeProvider>
);

export default MyApp;
