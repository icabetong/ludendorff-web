import React, { useContext } from "react";
import { Router, Route, Switch } from 'react-router-dom';
import {CssBaseline, PaletteMode, Theme} from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';

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

const baseTheme = (mode: PaletteMode) => createTheme({
  palette: {
    mode: mode,
    primary: {
      light: mode === 'dark' ? teal300 : teal400,
      main: mode === 'dark' ? teal500 : teal600,
      dark: mode === 'dark' ? teal700 :  teal800,
      contrastText: mode === 'dark' ? gray800 : white
    },
    secondary: {
      light: mode === 'dark' ? teal300 : teal400,
      main: mode === 'dark' ? teal500 : teal600,
      dark: mode === 'dark' ? teal700 :  teal800
    },
    error: errorColors,
    background: {
      default: mode === 'dark' ? gray800 : gray50,
      paper: mode === 'dark' ? gray700 : white,
    },
    text: {
      primary: mode === 'dark' ? gray100 : gray700,
      secondary: mode === 'dark' ? gray300: gray500,
    },
    divider: mode === 'dark' ? gray600 : gray300,
  },
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
    ].join(','),
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
      fontWeight: 500,
    }
  },
  components: {
    MuiDialogContent: {
      styleOverrides: {
        dividers: {
          padding: '16px 0'
        }
      }
    },
    MuiTextField: {
      defaultProps: {
        fullWidth: true,
        variant: 'outlined',
        size: 'small'
      },
      styleOverrides: {
        root: {
          margin: '0.6em 0'
        }
      }
    },
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

  return <>
    {/* https://stackoverflow.com/questions/60909608/material-ui-theme-does-not-change-back */}
    <ThemeProvider theme={baseTheme(userPreferences.preferences.theme === 'dark' ? 'dark' : 'light')}>
      <CssBaseline />
      <Router history={history}>
        <Switch>
          <Route path="/" component={RootComponent} exact />
          <Route path="/auth" component={AuthComponent} />
          <Route path="*" component={ErrorNotFoundState} exact />
        </Switch>
      </Router>
    </ThemeProvider>
  </>;
}

export const getDataGridTheme = (theme: Theme) => {
  return {
    '& .MuiDataGrid-toolbarContainer': {
      paddingTop: theme.spacing(1),
      paddingBottom: theme.spacing(1),
      backgroundColor: theme.palette.mode === 'dark' ? gray700: gray100,
      borderBottom: '1px',
      borderBottomStyle: 'solid',
      borderBottomColor: theme.palette.divider
    },
    '& .MuiDataGrid-root': {
      backgroundColor: 'transparent',
      borderColor: theme.palette.divider,
    },
    '& .MuiDataGrid-columnHeaders': {
      borderBottom: 'none'
    },
    '& .MuiDataGrid-columnHeader': {
      fontWeight: 700,
      '& .MuiDataGrid-columnSeparator': {
        color: theme.palette.divider
      },
    },
    '& .MuiDataGrid-row': {
      borderColor: theme.palette.divider,
      borderBottomColor: 'transparent',
      borderBottomStyle: 'none',
      borderTopWidth: 'thin',
      borderTopStyle: 'solid',
      fontWeight: 400,

      '& .MuiDataGrid-cell': {
        borderBottomColor: theme.palette.divider
      }
    },
    '& .MuiDataGrid-columnsContainer': {
      borderBottomColor: theme.palette.divider
    },
  }
}