import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { RouteComponentProps } from "react-router";
import { withRouter } from "react-router-dom";
import { Button, Box, Container, Paper, TextField, Typography } from "@mui/material";
import makeStyles from '@mui/styles/makeStyles';
import { signInWithEmailAndPassword, AuthError } from "firebase/auth";
import { auth } from "../../index";

const useStyles = makeStyles(() => ({
  root: {
    minHeight: '100vh',
  },
  rootWrapper: {
    height: '100%',
    margin: 'auto'
  },
  containerPaper: {
    height: '100%',
    padding: '2em',
  },
  container: {
    padding: '1em 0em',
  },
}));

type FormValues = {
  email: string,
  password: string
}

const AuthComponent: React.FunctionComponent<RouteComponentProps> = ({ history }) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>();
  const [isAuthenticating, setIsAuthenticating] = useState<boolean>(false);
  const [error, setError] = useState<AuthError | undefined>(undefined);

  const onSubmit = (data: FormValues) => {
    setIsAuthenticating(true)
    signInWithEmailAndPassword(auth, data.email, data.password)
      .then(() => {
        setIsAuthenticating(false);
        history.push('/');
      })
      .catch((error: AuthError) => {
        setError(error);
        setIsAuthenticating(false);
      })
  }

  return (
    <Box className="auth">
      <Container className={ classes.rootWrapper }>
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          className={ classes.rootWrapper }>
          <Container
            component="form"
            onSubmit={ handleSubmit(onSubmit) }
            maxWidth="xs">
            <Paper
              className={ classes.containerPaper }
              elevation={ 8 }>
              <div className={ classes.container }>
                <Typography variant="h5">{ t("auth.hello") }</Typography>
                <Typography variant="h5">{ t("auth.welcome_back") }</Typography>
              </div>
              <div className={ classes.container }>
                { error != null &&
                  <Typography
                    variant="body2"
                    color="error"
                    paragraph>
                      { error.message }
                    </Typography>
                }
                <br/>
                <TextField
                  style={ { marginBottom: '1em', marginTop: '1em' } }
                  id="email"
                  type="text"
                  label={ t("field.email") }
                  error={ errors.email !== undefined }
                  disabled={ isAuthenticating }
                  { ...register("email", { required: true }) } />
                <br/>
                <TextField
                  id="password"
                  type="password"
                  label={ t("field.password") }
                  error={ errors.password !== undefined }
                  disabled={ isAuthenticating }
                  { ...register("password", { required: false }) } />
              </div>
              <div className={ classes.container }>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  aria-label={ t("button.sign_in") }
                  fullWidth={ true }
                  disabled={ isAuthenticating }>
                  { isAuthenticating ? t("feedback.authenticating") : t("button.sign_in") }
                </Button>
              </div>
            </Paper>
          </Container>
        </Box>
      </Container>
    </Box>
  );
}

export default withRouter(AuthComponent)