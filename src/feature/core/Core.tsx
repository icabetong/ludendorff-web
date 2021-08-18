import React from "react";
import { Router, Route, Switch } from 'react-router-dom';
import { CssBaseline } from '@material-ui/core'
import { createTheme, ThemeProvider } from '@material-ui/core/styles';

import useLocalStorage from "../../shared/persistence";
import AuthComponent from '../auth/Auth'
import RootComponent from '../root/Root';
import history from "../navigation/History";
import { GenericErrorStateComponent } from "../state/ErrorStates";

const secondaryColors = {
    main: '#ff5555',
    dark: '#c5162c'
}
const errorColors = {
    main: '#ffb86c'
}
const fonts = [
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
const typographyOverrides = {
    h6: {
        fontWeight: 600,
        fontFamily: 'Inter'
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
    }
}

const lightTheme = createTheme({
    palette: {
        type: 'light',
        primary: {
            main: '#6272a4',
            dark: '#344775'
        },
        secondary: secondaryColors,
        error: errorColors,
        background: {
            default: '#ffffff',
            paper: '#ffffff'
        },
        text: {
            primary: '#282a36',
            secondary: '#44475a'
        }
    },
    typography: {
        fontFamily: fonts
    },
    overrides: {
        MuiTypography: typographyOverrides
    }
})
const darkTheme = createTheme({
    palette: {
        type: 'dark',
        primary: {
            main: '#bd93f9',
            dark: '#8b65c6'
        },
        secondary: secondaryColors,
        error: errorColors,
        background: {
            default: '#1e1f29',
            paper: '#44475a'
        },
        text: {
            primary: '#f8f8f2'
        },
        divider: '#6f7287'
    },
    typography: {
        fontFamily: fonts
    },
    overrides: {
        MuiTypography: typographyOverrides
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
    const [theme, setTheme] = useLocalStorage("preference:theme", 'dark');
    
    return (
        <div>
            <ThemeContext.Provider value={{theme, setTheme}}>
                {/* https://stackoverflow.com/questions/60909608/material-ui-theme-does-not-change-back */}
                <ThemeProvider theme={theme === 'dark' ? {...darkTheme} : {...lightTheme}}>
                    <CssBaseline/>                    
                        <Router history={history}>
                            <Switch>
                                <Route path="/" component={RootComponent} exact/>
                                <Route path="/auth" component={AuthComponent}/>
                                <Route path="/error" component={GenericErrorStateComponent}/>
                            </Switch>
                        </Router>
                </ThemeProvider>
           </ThemeContext.Provider>
        </div>
    )
}