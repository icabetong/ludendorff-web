import React, { useContext } from "react";
import { Router, Route, Switch } from 'react-router-dom';
import { CssBaseline } from '@material-ui/core'
import { createTheme, ThemeProvider } from '@material-ui/core/styles';

import AuthComponent from '../auth/Auth'
import RootComponent from '../root/Root';
import history from "../navigation/History";
import { ErrorNotFoundState } from "../state/ErrorStates";
import { PreferenceContext } from "../settings/Preference";

const secondaryColors = {
    main: '#ff79c6',
    dark: '#c94695',
    light: '#ffacf9'
}
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
    }
})

const lightTheme = createTheme({
    ...baseTheme,
    palette: {
        type: 'light',
        primary: {
            main: '#6272a4',
            dark: '#344775'
        },
        secondary: secondaryColors,
        error: errorColors,
        info: {
            main: '#6272a4'
        },
        background: {
            default: '#ffffff',
            paper: '#ffffff'
        },
        text: {
            primary: '#282a36',
            secondary: '#44475a'
        }
    },
})
const darkTheme = createTheme({
    ...baseTheme,
    palette: {
        type: 'dark',
        primary: {
            main: '#bd93f9',
            dark: '#8b65c6'
        },
        secondary: secondaryColors,
        error: errorColors,
        info: {
            main: '#8be9fd'
        },
        background: {
            default: '#1e1f29',
            paper: '#44475a'
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
    setTheme: () => {}
});

export const CoreComponent = () => {
    const userPreferences = useContext(PreferenceContext);
    
    return (
        <>
        {/* https://stackoverflow.com/questions/60909608/material-ui-theme-does-not-change-back */} 
            <ThemeProvider theme={userPreferences.preferences.theme === 'dark' ? {...darkTheme} : {...lightTheme}}>
                <CssBaseline/>                    
                    <Router history={history}>
                        <Switch>
                            <Route path="/" component={RootComponent} exact/>
                            <Route path="/auth" component={AuthComponent}/>
                            <Route path="*" component={ErrorNotFoundState} exact/>
                        </Switch>
                    </Router>
            </ThemeProvider>
        </>
    )
}