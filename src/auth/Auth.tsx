import React, { useState } from 'react';
import { Button, TextField, Grid } from '@material-ui/core';
import firebase from 'firebase/app';
import './Auth.scss';

const AuthComponent = () => {
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");

    const onAuthTriggered = (event: React.SyntheticEvent) => {
        event.preventDefault();
        firebase.auth().signInWithEmailAndPassword(email, password)
            .catch((error) => {

            })
    }

    const onEmailInputChanged = (event: React.ChangeEvent<HTMLInputElement>) => {
        setEmail(event.target.value)
    }
    const onPasswordInputChanged = (event: React.ChangeEvent<HTMLInputElement>) => {
        setPassword(event.target.value)
    }

    return (
        <Grid container direction="column" alignItems="center" justify="center" style={{minHeight: '100vh'}}>
            <Grid item>
                <form onSubmit={onAuthTriggered}>
                    <TextField
                        id="_inputEmail"
                        type="text"
                        value={email}
                        label="Email"
                        onChange={onEmailInputChanged}/>
                    <br/>
                    <TextField
                        id="_inputPassword"
                        type="password"
                        value={password}
                        label="Password"
                        onChange={onPasswordInputChanged}/>
                    <p>
                        <Button type="submit" variant="contained" color="primary">Sign in</Button>
                    </p>
                </form>
            </Grid>
        </Grid>
    );
}

export default AuthComponent