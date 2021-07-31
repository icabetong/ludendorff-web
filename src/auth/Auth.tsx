import React, { useState } from 'react';
import { Button, Grid, Typography, Container } from '@material-ui/core';
import { TextInput } from '../components/TextInput';
import firebase from 'firebase/app';
import './Auth.scss';

const AuthComponent = () => {
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [isAuthenticating, setIsAuthenticating] = useState<boolean>(false);

    const onAuthTriggered = (event: React.SyntheticEvent) => {
        event.preventDefault();
        setIsAuthenticating(true);
        firebase.auth().signInWithEmailAndPassword(email, password)
            .then(() => {
                setIsAuthenticating(false);
            })
            .catch((error) => {
                setIsAuthenticating(false);
            })
    }

    const onEmailInputChanged = (event: React.ChangeEvent<HTMLInputElement>) => {
        setEmail(event.target.value)
    }
    const onPasswordInputChanged = (event: React.ChangeEvent<HTMLInputElement>) => {
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
                            <TextInput
                                style={{ marginBottom: '1em' }}
                                id="_inputEmail"
                                type="text"
                                value={email}
                                label="Email"
                                disabled={isAuthenticating}
                                onChange={onEmailInputChanged}/>
                            <br/>
                            <TextInput
                                id="_inputPassword"
                                type="password"
                                value={password}
                                label="Password"
                                disabled={isAuthenticating}
                                onChange={onPasswordInputChanged}/>
                        </div>
                        <div className="container action">
                            <Button 
                                type="submit" 
                                variant="contained" 
                                color="primary"
                                disabled={isAuthenticating}>
                                    Sign in
                            </Button>
                        </div>
                    </Grid>
                </Grid>
            </form>
        </Container>
    );
}

export default AuthComponent