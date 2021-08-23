import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { RouteComponentProps } from "react-router";
import { withRouter } from "react-router-dom";
import Button from "@material-ui/core/Button";
import Grid from "@material-ui/core/Grid";
import Container from "@material-ui/core/Container";
import Paper from "@material-ui/core/Paper";
import TextField from "@material-ui/core/TextField";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/core/styles";

import firebase from "firebase/app";
import { auth } from "../../index";

const useStyles = makeStyles(() => ({
    root: {
        minHeight: '100vh',
    },
    containerPaper: {
        padding: '2em',
    },
    container: {
        padding: '1em 0em',
    },
}));
const AuthComponent: React.FunctionComponent<RouteComponentProps> = ({history}) => {
    const classes = useStyles();
    const { t } = useTranslation();

    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [isAuthenticating, setIsAuthenticating] = useState<boolean>(false);
    const [error, setError] = useState<firebase.auth.Error | undefined>(undefined);

    const onAuthTriggered = (event: React.SyntheticEvent) => {
        event.preventDefault();
        setIsAuthenticating(true);
        auth.signInWithEmailAndPassword(email, password)
            .then(() => {
                setIsAuthenticating(false);
                history.push('/');
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
                    className={classes.root}>
                    <Grid xs={12} sm={4} item>
                        <Paper className={classes.containerPaper}>
                            <div className={classes.container}>
                                <Typography variant="h5">{ t("hello") }</Typography>
                                <Typography variant="h5">{ t("welcome_back") }</Typography>
                            </div>
                            <div className={classes.container}>
                                { error != null && 
                                    <Typography variant="body2" color="error">
                                        {error.message}
                                    </Typography>
                                }
                                <br/>
                                <TextField
                                    style={{ marginBottom: '1em', marginTop: '1em' }}
                                    id="authentication-email"
                                    type="text"
                                    value={email}
                                    label={ t("email") }
                                    error={!!error}
                                    disabled={isAuthenticating}
                                    onChange={onEmailInputChanged}/>
                                <br/>
                                <TextField
                                    id="authentication-password"
                                    type="password"
                                    value={password}
                                    label={ t("password") }
                                    error={!!error}
                                    disabled={isAuthenticating}
                                    onChange={onPasswordInputChanged}/>
                            </div>
                            <div className={classes.container}>
                                <Button 
                                    type="submit" 
                                    variant="contained" 
                                    color="primary"
                                    aria-label={ t("sign_in") }
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

export default withRouter(AuthComponent)