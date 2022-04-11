import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { RouteComponentProps } from "react-router";
import { withRouter } from "react-router-dom";
import { Alert, Box, Button, Container, Paper, TextField, Typography, Stack } from "@mui/material";
import { AuthError, signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../index";

type FormValues = {
  email: string,
  password: string
}

const AuthComponent: React.FunctionComponent<RouteComponentProps> = ({ history }) => {
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
      <Container sx={{ height: '100%', margin: 'auto' }}>
        <Stack
          justifyContent="center"
          alignItems="center"
          sx={{ height: '100%', margin: 'auto' }}>
          <Container
            component="form"
            onSubmit={handleSubmit(onSubmit)}
            maxWidth="xs">
            <Paper
              sx={{height: '100%', padding: 4}}
              elevation={8}>
              <Box sx={{ paddingY: 2 }}>
                <Typography variant="h5">{t("auth.hello")}</Typography>
                <Typography variant="h5">{t("auth.welcome_back")}</Typography>
              </Box>
              {error != null &&
                <Box sx={{ paddingY: 2 }}>
                  <Alert severity="error">
                    {error.message}
                  </Alert>
                </Box>
              }
              <Box sx={{ paddingY: 4 }}>
                <TextField
                  sx={{ my: 1 }}
                  id="email"
                  type="text"
                  label={t("field.email")}
                  error={errors.email !== undefined}
                  disabled={isAuthenticating}
                  {...register("email", { required: true })} />
                <TextField
                  id="password"
                  type="password"
                  label={t("field.password")}
                  error={errors.password !== undefined}
                  disabled={isAuthenticating}
                  {...register("password", { required: false })} />
              </Box>
              <Button
                size="large"
                type="submit"
                variant="contained"
                color="primary"
                aria-label={t("button.sign_in")}
                fullWidth={true}
                disabled={isAuthenticating}>
                {isAuthenticating ? t("feedback.authenticating") : t("button.sign_in")}
              </Button>
            </Paper>
          </Container>
        </Stack>
      </Container>
    </Box>
  );
}

export default withRouter(AuthComponent)