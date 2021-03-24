import DateFnsUtils from "@date-io/date-fns";
import { CssBaseline, MuiThemeProvider } from "@material-ui/core";
import { MuiPickersUtilsProvider } from "@material-ui/pickers";
import { useEffect, useState } from "react";
import { getUser } from "util/auth/user";
import "util/axios";
import "../styles/globals.css";
import { theme } from "../theme";

const MyApp = ({ Component, pageProps }: any) => {
  const [, setNotificationSocket] = useState<WebSocket | null>(null);

  // Connects to the websocket and refreshes content on first render only
  useEffect(() => {
    const user = getUser();
    if (user) {
      const newNotificationSocket = new WebSocket(
        `ws://${process.env.NEXT_PUBLIC_WS_URL}/ws/notifications/${user.id}/`
      );
      setNotificationSocket(newNotificationSocket);
      // when the component drops close the socket
      return () => newNotificationSocket.close();
    }
    return;
  }, []);

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
