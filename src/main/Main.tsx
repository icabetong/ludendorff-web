import { useContext } from 'react';
import { BrowserRouter, Route } from 'react-router-dom';
import { createTheme, ThemeProvider } from '@material-ui/core/styles'
import AuthComponent from '../auth/Auth';
import { AuthContext } from '../auth/AuthProvider';
import CoreComponent from '../core/Core';
import { CssBaseline } from '@material-ui/core';

const theme = createTheme({
    palette: {
        primary: {
            main: '#3d5afe'
        },
        error: {
            main: '#B00020'
        },
        background: {
            default: '#e0e0e0'
        }
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
    },
    overrides: {
        MuiTypography: {
            h6: {
                fontWeight: 600,
                fontFamily: 'Inter'
            },
            h5: {
                fontWeight: 700
            },
            body2: {
                fontWeight: 500
            }
        }
    }
})

export const MainComponent = () => {
    const user = useContext(AuthContext)

    return (
        <div>
            <ThemeProvider theme={theme}>
                <CssBaseline/>
                <BrowserRouter>
                    <Route exact path="/">
                        {user ? <CoreComponent/> : <AuthComponent/> }
                    </Route>
                </BrowserRouter>
            </ThemeProvider>
        </div>
    )
}