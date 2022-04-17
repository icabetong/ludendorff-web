import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useForm, Controller } from "react-hook-form";
import { RouteComponentProps } from "react-router";
import { withRouter } from "react-router-dom";
import {
  Alert,
  Box,
  Container,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  Typography,
  useMediaQuery,
  useTheme
} from "@mui/material";
import { AuthError, signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../index";
import { LoadingButton } from "@mui/lab";
import { LockOutlined, MailOutlineRounded } from "@mui/icons-material";
import { ReactComponent as Logo } from "../../shared/icon.svg";

type FormData = {
  email: string,
  password: string
}

const AuthComponent: React.FunctionComponent<RouteComponentProps> = ({ history }) => {
  const { t } = useTranslation();
  const { handleSubmit, formState: { errors }, control } = useForm<FormData>();
  const [isAuthenticating, setIsAuthenticating] = useState<boolean>(false);
  const [error, setError] = useState<AuthError | undefined>(undefined);
  const theme = useTheme();
  const smBreakpoint = useMediaQuery(theme.breakpoints.down('sm'));

  const onSubmit = (data: FormData) => {
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
            maxWidth={smBreakpoint ? undefined : "sm"}>
            <Paper
              sx={{
                height: '100%',
                padding: { xs: 4, md: 8 },
                backgroundColor: 'rgba(255, 255, 255, 0.75)',
                backgroundFilter: 'blur(20px)'
              }}
              elevation={8}>
              <Box sx={{
                paddingY: 2,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center' }}>
                <Box
                  component={Logo}
                  sx={{
                    width: '6em',
                    height: '6em',
                    marginBottom: 4,
                    color: (theme) => theme.palette.text.primary
                  }}
                />
                <Typography variant="h5" align="center">{t("auth.title")}</Typography>
                <Typography variant="body1" align="center" sx={{ marginTop: 2 }}>{t("auth.summary")}</Typography>
              </Box>
              {error != null &&
                <Box sx={{ paddingY: 2 }}>
                  <Alert severity="error">
                    {error.message}
                  </Alert>
                </Box>
              }
              <Box sx={{ paddingY: 2 }}>
                <Controller
                  name="email"
                  control={control}
                  render={({ field: { ref, ...inputProps}}) => (
                    <TextField
                      {...inputProps}
                      sx={{ my: 1 }}
                      type="text"
                      inputRef={ref}
                      placeholder={t("field.email")}
                      error={errors.email !== undefined}
                      disabled={isAuthenticating}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <MailOutlineRounded/>
                          </InputAdornment>
                        )
                      }}/>
                  )}
                  rules={{ required: true }}/>
                <Controller
                  name="password"
                  control={control}
                  render={({ field: { ref, ...inputProps }}) => (
                    <TextField
                      {...inputProps}
                      type="password"
                      inputRef={ref}
                      placeholder={t("field.password")}
                      error={errors.password !== undefined}
                      disabled={isAuthenticating}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <LockOutlined/>
                          </InputAdornment>
                        )
                      }}/>
                  )}
                  rules={{ required: true }}/>
              </Box>
              <LoadingButton
                size="large"
                type="submit"
                variant="contained"
                color="primary"
                aria-label={t("button.sign_in")}
                fullWidth={true}
                loading={isAuthenticating}>
                {t("button.sign_in")}
              </LoadingButton>
            </Paper>
          </Container>
        </Stack>
      </Container>
    </Box>
  );
}

export default withRouter(AuthComponent)