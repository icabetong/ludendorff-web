import React, { useState } from "react";
import { Router, Route, Switch } from 'react-router-dom';
import { createTheme, ThemeProvider } from '@material-ui/core/styles';

import AuthComponent from '../auth/Auth'
import RootComponent from '../root/Root';
import history from "../navigation/History";
import { CssBaseline } from '@material-ui/core'
import { ErrorComponent } from "../error/ErrorComponent";

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
            main: '#bd93f9',
            dark: '#344775'
        },
        secondary: secondaryColors,
        error: errorColors,
        background: {
            default: '#f8f8f2'
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
        }
    },
    typography: {
        fontFamily: fonts
    },
    overrides: {
        MuiTypography: typographyOverrides
    }
})

type ThemeContextType = {
    themeIsDark: Boolean,
    setTheme: Function
}

export const ThemeContext = React.createContext<ThemeContextType>({
    themeIsDark: false,
    setTheme: () => {}
});

export const CoreComponent = () => {
    const [isThemeDark, setDarkTheme] = useState<Boolean>(false);
    
    return (
        <div>
            <ThemeProvider theme={isThemeDark ? darkTheme : lightTheme}>
                <ThemeContext.Provider value={{themeIsDark: isThemeDark, setTheme: setDarkTheme}}>
                    <CssBaseline/>                    
                        <Router history={history}>
                            <Switch>
                                <Route path="/" component={RootComponent} exact/>
                                <Route path="/auth" component={AuthComponent}/>
                                <Route path="/error" component={ErrorComponent}/>
                            </Switch>
                        </Router>
                </ThemeContext.Provider>
           </ThemeProvider>
        </div>
    )
}