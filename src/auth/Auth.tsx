import React, { useState } from 'react';
import { Button, Grid, Typography, Container } from '@material-ui/core';
import { TextInput } from '../components/TextInput';
import firebase from 'firebase/app';
import './Auth.scss';

const AuthComponent = () => {
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [isAuthenticating, setIsAuthenticating] = useState<boolean>(false);
    const [error, setError] = useState<firebase.auth.Error | null>(null);

    const onAuthTriggered = (event: React.SyntheticEvent) => {
        event.preventDefault();
        setIsAuthenticating(true);
        firebase.auth().signInWithEmailAndPassword(email, password)
            .then(() => {
                setIsAuthenticating(false);
            })
            .catch((error: firebase.auth.Error) => {
                setError(error);
                setIsAuthenticating(false);
            })
    }

    const onEmailInputChanged = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (error != null)
            setPassword("");
        setError(null);
        setEmail(event.target.value)
    }
    const onPasswordInputChanged = (event: React.ChangeEvent<HTMLInputElement>) => {
        setError(null);
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
                    <Grid xs={12} item>
                        <div className="container">
                            <Typography variant="h5">Hello.</Typography>
                            <Typography variant="h5">Welcome Back.</Typography>
                        </div>
                        <div className="container">
                            {
                                error != null && 
                                <Typography variant="body2">
                                    { error.message }
                                </Typography>
                            }
                            <br/>
                            <TextInput
                                style={{ marginBottom: '1em', marginTop: '1em' }}
                                id="_inputEmail"
                                type="text"
                                value={email}
                                label="Email"
                                error={error}
                                disabled={isAuthenticating}
                                onChange={onEmailInputChanged}/>
                            <br/>
                            <TextInput
                                id="_inputPassword"
                                type="password"
                                value={password}
                                label="Password"
                                error={error}
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
                    </Grid>
                </Grid>
            </form>
        </Container>
    );
}

export default AuthComponent