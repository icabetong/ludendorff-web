import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { RouteComponentProps } from "react-router";
import { withRouter } from "react-router-dom";
import {
  Button,
  Box,
  Container,
  Grid,
  Paper,
  TextField,
  Typography,
  makeStyles
} from "@material-ui/core";

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

type FormValues = {
  email: string,
  password: string
}

const AuthComponent: React.FunctionComponent<RouteComponentProps> = ({ history }) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>();
  const [isAuthenticating, setIsAuthenticating] = useState<boolean>(false);
  const [error, setError] = useState<firebase.auth.Error | undefined>(undefined);

  const onSubmit = (data: FormValues) => {
    setIsAuthenticating(true)
    auth.signInWithEmailAndPassword(data.email, data.password)
      .then(() => {
        setIsAuthenticating(false);
        history.push('/');
      })
      .catch((error: firebase.auth.Error) => {
        setError(error);
        setIsAuthenticating(false);
      })
  }

  return (
    <Box className="auth">
      <Container>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid
            container
            spacing={4}
            direction="column"
            alignItems="center"
            justifyContent="center"
            className={classes.root}>
            <Grid xs={12} sm={8} md={6} lg={4} item>
              <Paper className={classes.containerPaper}>
                <div className={classes.container}>
                  <Typography variant="h5">{t("auth.hello")}</Typography>
                  <Typography variant="h5">{t("auth.welcome_back")}</Typography>
                </div>
                <div className={classes.container}>
                  {error != null &&
                    <Typography variant="body2" color="error">
                      {error.message}
                    </Typography>
                  }
                  <br />
                  <TextField
                    style={{ marginBottom: '1em', marginTop: '1em' }}
                    id="email"
                    type="text"
                    label={t("field.email")}
                    error={errors.email !== undefined}
                    disabled={isAuthenticating}
                    {...register("email", { required: true })} />
                  <br />
                  <TextField
                    id="password"
                    type="password"
                    label={t("field.password")}
                    error={errors.password !== undefined}
                    disabled={isAuthenticating}
                    {...register("password", { required: false })} />
                </div>
                <div className={classes.container}>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    aria-label={t("button.signin")}
                    fullWidth={true}
                    disabled={isAuthenticating}>
                    {isAuthenticating ? t("feedback.authenticating") : t("button.signin")}
                  </Button>
                </div>
              </Paper>
            </Grid>
          </Grid>
        </form>
      </Container>
    </Box>
  );
}

export default withRouter(AuthComponent)