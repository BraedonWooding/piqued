import { createMuiTheme } from "@material-ui/core";
import { red } from "@material-ui/core/colors";

// A custom theme for this app
export const theme = createMuiTheme({
  palette: {
    background: {
      default: "#F0F2F5",
    },
    primary: {
      main: "#3578E5",
    },
    secondary: {
      main: "#19857b",
    },
    error: {
      main: red.A400,
    },
  },
  shape: {
    borderRadius: 4,
  },
});
