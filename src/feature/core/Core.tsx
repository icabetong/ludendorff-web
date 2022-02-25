import React, { useContext } from "react";
import { Router, Route, Switch } from 'react-router-dom';
import { CssBaseline, Theme } from '@material-ui/core'
import { createTheme, ThemeProvider } from '@material-ui/core/styles';

import AuthComponent from '../auth/AuthComponent'
import RootComponent from '../root/Root';
import history from "../navigation/History";
import { ErrorNotFoundState } from "../state/ErrorStates";
import { PreferenceContext } from "../settings/Preference";

const white = '#ffffff';
const teal300 = '#5eead4';
const teal400 = '#2dd4bf';
const teal500 = '#14b8a6';
const teal600 = '#0d9488';
const teal700 = '#0f766e';
const teal800 = '#115e59';
const gray50 = '#f9fafb';
const gray100 = '#f3f4f6';
const gray200 = '#e5e7eb';
const gray300 = '#d1d5db';
const gray500 = '#6b7280';
const gray600 = '#4b5563';
const gray700 = '#374151';
const gray800 = '#1f2937';
 
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
      h4: {
        fontWeight: 700,
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
    background: {
      default: gray50,
      paper: white,
    },
    text: {
      primary: gray700,
      secondary: gray500,
    },
    divider: gray300,
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
    background: {
      default: gray800,
      paper: gray700
    },
    text: {
      primary: gray100
    },
    divider: gray600
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

export const getDataGridTheme = (theme: Theme) => {
  return {
    '& .MuiDataGrid-toolbarContainer': {
      paddingTop: theme.spacing(1),
      paddingBottom: theme.spacing(1),
      backgroundColor: theme.palette.type === 'dark' ? gray700: gray100,
      borderBottom: '1px',
      borderBottomStyle: 'solid',
      borderBottomColor: theme.palette.divider
    },
    '& .MuiDataGrid-root': {
      backgroundColor: 'transparent',
      borderColor: theme.palette.divider
    },
    '& .MuiDataGrid-columnsContainer': {
      borderBottomColor: theme.palette.divider
    },
    '& .MuiDataGrid-columnSeparator': {
      color: theme.palette.divider
    },
    '& .MuiDataGrid-cell': {
      borderBottomColor: theme.palette.divider
    }
  }
}