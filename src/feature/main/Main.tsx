import { BrowserRouter, Route, Switch } from 'react-router-dom'
import { createTheme, ThemeProvider } from '@material-ui/core/styles'

import AuthComponent from '../auth/Auth'
import CoreComponent from '../core/Core'
import { CssBaseline } from '@material-ui/core'

const lightTheme = createTheme({
    palette: {
        primary: {
            main: '#6272a4'
        },
        error: {
            main: '#ffb86c'
        },
        background: {
            default: '#f8f8f2'
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
    return (
        <div>
            <ThemeProvider theme={lightTheme}>
                <CssBaseline/>
                <BrowserRouter>
                    <Switch>
                        <Route path="/" exact component={CoreComponent}/>
                        <Route path="/auth" component={AuthComponent}/>
                    </Switch>
                </BrowserRouter>
            </ThemeProvider>
        </div>
    )
}