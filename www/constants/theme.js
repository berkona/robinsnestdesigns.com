import { createMuiTheme } from '@material-ui/core/styles'

// Create a theme instance.
const theme = createMuiTheme({
  palette: {
    primary: {
      main: '#006699',
    },
    secondary: {
      main: '#343a40',
    },
    error: {
      main: 'rgb(204, 51, 0)',
    },
    background: {
      default: '#8BA8BC',
    },
  },
  typography: {
    fontFamily: ['Arial','sans-serif']
  }
});

export default theme;
