import React, { useContext } from "react";
import { Router, Route, Switch } from 'react-router-dom';
import { CssBaseline } from '@material-ui/core'
import { createTheme, ThemeProvider } from '@material-ui/core/styles';

import AuthComponent from '../auth/AuthComponent'
import RootComponent from '../root/Root';
import history from "../navigation/History";
import { ErrorNotFoundState } from "../state/ErrorStates";
import { PreferenceContext } from "../settings/Preference";

const teal300 = '#5eead4';
const teal400 = '#2dd4bf';
const teal500 = '#14b8a6';
const teal600 = '#0d9488';
const teal700 = '#0f766e';
const teal800 = '#115e59';
const gray900 = '#111827';
const gray800 = '#1f2937';
const gray700 = '#374151';
const gray600 = '#4b5563';
const gray500 = '#6b7280';
const gray400 = '#9ca3af';
const gray300 = '#d1d5db';
 
const errorColors = {
  main: '#ff5555',
  dark: '#c5162c',
  light: '#ff8982'
}

const baseTheme = createTheme({
  typography: {
    fontFamily: [
      'Inter',
      'apple-system',
      'Segoe UI',
      'Roboto',
      'Oxygen',
      'Ubuntu',
      'Cantarell',
      'Fira Sans',
      'Droid Sans',
      'Helvetica Neue',
      'sans-serif'
    ].join(',')
  },
  props: {
    MuiTextField: {
      fullWidth: true,
      variant: "outlined",
      size: "small"
    }
  },
  overrides: {
    MuiTypography: {
      h6: {
        fontWeight: 600,
      },
      h5: {
        fontWeight: 700,
        fontSize: '2em'
      },
      body2: {
        fontWeight: 600
      },
      subtitle1: {
        fontSize: '1em'
      },
      subtitle2: {
        fontSize: '1em',
        fontWeight: 500
      },
    },
    MuiDialogContent: {
      dividers: {
        padding: '16px 0'
      }
    },
    MuiTextField: {
      root: {
        margin: '0.6em 0'
      }
    },
  }
})

const lightTheme = createTheme({
  ...baseTheme,
  palette: {
    type: 'light',
    primary: {
      light: teal400,
      main: teal600,
      dark: teal800
    },
    secondary: {
      light: teal400,
      main: teal600,
      dark: teal800
    },
    error: errorColors,
    info: {
      main: '#6272a4'
    },
    background: {
      default: '#ffffff',
      paper: '#ffffff'
    },
    text: {
      primary: '#374151',
      secondary: '#6b7280'
    }
  },
})
const darkTheme = createTheme({
  ...baseTheme,
  palette: {
    type: 'dark',
    primary: {
      main: teal500,
      light: teal300,
      dark: teal700
    },
    secondary: {
      main: teal500,
      light: teal300,
      dark: teal700
    },
    error: errorColors,
    info: {
      main: '#8be9fd'
    },
    background: {
      default: gray800,
      paper: gray700
    },
    text: {
      primary: '#f8f8f2'
    },
    divider: '#6f7287'
  }
})

type ThemeContextType = {
  theme: string,
  setTheme: Function
}

export const ThemeContext = React.createContext<ThemeContextType>({
  theme: 'dark',
  setTheme: () => { }
});

export const CoreComponent = () => {
  const userPreferences = useContext(PreferenceContext);

  return (
    <>
      {/* https://stackoverflow.com/questions/60909608/material-ui-theme-does-not-change-back */}
      <ThemeProvider theme={userPreferences.preferences.theme === 'dark' ? { ...darkTheme } : { ...lightTheme }}>
        <CssBaseline />
        <Router history={history}>
          <Switch>
            <Route path="/" component={RootComponent} exact />
            <Route path="/auth" component={AuthComponent} />
            <Route path="*" component={ErrorNotFoundState} exact />
          </Switch>
        </Router>
      </ThemeProvider>
    </>
  )
}