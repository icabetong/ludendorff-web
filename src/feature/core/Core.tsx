import React, { useContext } from "react";
import { Route, Router, Switch } from 'react-router-dom';
import { CssBaseline, PaletteMode, Theme } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';

import AuthComponent from '../auth/AuthComponent'
import RootComponent from '../root/Root';
import history from "../navigation/History";
import { ErrorNotFoundState } from "../state/ErrorStates";
import { PreferenceContext } from "../settings/Preference";

const white = '#ffffff';
const main50 = '#e3f2fd';
const main200 = '#90caf9';
const main400 = '#42a5f5';
const main500 = '#2196f3';
const main600 = '#1e88e5';
const main700 = '#1976d2';
const main800 = '#1565c0';
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

const baseTheme = (mode: PaletteMode) => createTheme({
  palette: {
    mode: mode,
    primary: {
      light: mode === 'dark' ? main50 : main400,
      main: mode === 'dark' ? main200 : main700,
      dark: mode === 'dark' ? main400 : main800,
      contrastText: mode === 'dark' ? gray800 : white
    },
    secondary: {
      light: mode === 'dark' ? main50 : main400,
      main: mode === 'dark' ? main200 : main700,
      dark: mode === 'dark' ? main400 : main800,
      contrastText: mode === 'dark' ? gray800 : white
    },
    error: errorColors,
    background: {
      default: mode === 'dark' ? gray800 : gray50,
      paper: mode === 'dark' ? gray700 : white,
    },
    text: {
      primary: mode === 'dark' ? gray100 : gray700,
      secondary: mode === 'dark' ? gray300 : gray500,
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
      fontWeight: 500
    },
  },
  components: {
    MuiFab: {
      styleOverrides: {
        root: {
          position: 'absolute',
          bottom: '1rem',
          right: '1rem',
        }
      }
    },
    MuiDialogContent: {
      styleOverrides: {
        dividers: {
          padding: '0'
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
    MuiListSubheader: {
      styleOverrides: {
        root: {
          background: 'transparent'
        }
      }
    }
  }
})

export const CoreComponent = () => {
  const userPreferences = useContext(PreferenceContext);

  return <>
    {/* https://stackoverflow.com/questions/60909608/material-ui-theme-does-not-change-back */}
    <ThemeProvider theme={baseTheme(userPreferences.preferences.theme === 'dark' ? 'dark' : 'light')}>
      <CssBaseline/>
      <Router history={history}>
        <Switch>
          <Route
            path="/"
            component={RootComponent}
            exact/>
          <Route
            path="/auth"
            component={AuthComponent}/>
          <Route
            path="*"
            component={ErrorNotFoundState}
            exact/>
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
      backgroundColor: theme.palette.mode === 'dark' ? gray700 : gray100,
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
    '& .MuiDataGrid-footerContainer': {
      border: 'none'
    }
  }
}

export const getEditorDataGridTheme = (theme: Theme) => {
  return {
    '& .MuiDataGrid-toolbarContainer': {
      paddingTop: theme.spacing(1),
      paddingBottom: theme.spacing(1),
      backgroundColor: theme.palette.mode === 'dark' ? gray700 : gray100,
      borderBottom: '1px',
      borderBottomStyle: 'solid',
      borderBottomColor: theme.palette.mode === 'dark' ? gray600 : gray300,
    },
    '& .MuiDataGrid-root': {
      backgroundColor: theme.palette.mode === 'dark' ? gray700 : gray100,
      borderColor: theme.palette.divider,
    },
    '& .MuiDataGrid-columnHeaders': {
      borderBottom: 'none'
    },
    '& .MuiDataGrid-columnHeader': {
      fontWeight: 700,
      backgroundColor: theme.palette.mode === 'dark' ? gray700 : gray100,
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
    '& .MuiDataGrid-footerContainer': {
      border: 'none'
    }
  }
}