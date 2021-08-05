import React, { useState } from 'react'
import { RouteComponentProps } from 'react-router'
import { Button, Grid, Typography, Container, Paper } from '@material-ui/core'
import firebase from 'firebase/app'

import './Auth.scss'
import { TextInput } from '../../components/TextInput'

const AuthComponent: React.FunctionComponent<RouteComponentProps> = ({ history }) => {
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [isAuthenticating, setIsAuthenticating] = useState<boolean>(false);
    const [error, setError] = useState<firebase.auth.Error | undefined>(undefined);

    const onAuthTriggered = (event: React.SyntheticEvent) => {
        event.preventDefault();
        setIsAuthenticating(true);
        firebase.auth().signInWithEmailAndPassword(email, password)
            .then(() => {
                setIsAuthenticating(false);
                history.push("/")
            })
            .catch((error: firebase.auth.Error) => {
                setError(error);
                setIsAuthenticating(false);
            })
    }

    const onEmailInputChanged = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (error != null)
            setPassword("");
        setError(undefined);
        setEmail(event.target.value)
    }
    const onPasswordInputChanged = (event: React.ChangeEvent<HTMLInputElement>) => {
        setError(undefined);
        setPassword(event.target.value)
    }
    
    return (
        <Container>
            <form onSubmit={onAuthTriggered}>
                <Grid 
                    container 
                    spacing={4} 
                    direction="column" 
                    alignItems="center" 
                    justifyContent="center" 
                    style={{minHeight: '100vh'}}>
                    <Grid xs={12} item >
                        <Paper className="container-wrapper">
                            <div className="container">
                                <Typography variant="h5">Hello.</Typography>
                                <Typography variant="h5">Welcome Back.</Typography>
                            </div>
                            <div className="container">
                                {
                                    error != null && 
                                    <Typography variant="body2" color="error">
                                        {error.message}
                                    </Typography>
                                }
                                <br/>
                                <TextInput
                                    style={{ marginBottom: '1em', marginTop: '1em' }}
                                    id="_inputEmail"
                                    type="text"
                                    value={email}
                                    label="Email"
                                    error={!!error}
                                    disabled={isAuthenticating}
                                    onChange={onEmailInputChanged}/>
                                <br/>
                                <TextInput
                                    id="_inputPassword"
                                    type="password"
                                    value={password}
                                    label="Password"
                                    error={!!error}
                                    disabled={isAuthenticating}
                                    onChange={onPasswordInputChanged}/>
                            </div>
                            <div className="container">
                                <Button 
                                    type="submit" 
                                    variant="contained" 
                                    color="primary"
                                    fullWidth={true}
                                    disabled={isAuthenticating}>
                                    { isAuthenticating ? "Authenticating" : "Sign in" }
                                </Button>
                            </div>
                        </Paper>
                    </Grid>
                </Grid>
            </form>
        </Container>
    );
}

export default AuthComponent