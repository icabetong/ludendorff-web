import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import { useForm, Controller } from "react-hook-form";
import {
  Alert,
  Box,
  Button,
  Container,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  Typography,
  useMediaQuery,
  useTheme
} from "@mui/material";
import { AuthError, signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../../index";
import { LoadingButton } from "@mui/lab";
import { LockOutlined, MailOutlineRounded } from "@mui/icons-material";
import { ReactComponent as Logo } from "../../shared/icon.svg";
import PasswordReset from "./PasswordReset";
import SVGFeedbackDialog from "../../components/SVGFeedbackDialog";
import { ReactComponent as EmailSent } from "../../shared/message_sent.svg";
import { isDev } from "../../shared/utils";

type FormData = {
  email: string,
  password: string
}

const Authentication = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { handleSubmit, formState: { errors }, control, watch } = useForm<FormData>({
    defaultValues: { email: "", password: "" }
  });
  const [isAuthenticating, setIsAuthenticating] = useState<boolean>(false);
  const [requesting, setRequesting] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState<AuthError | undefined>(undefined);
  const theme = useTheme();
  const smBreakpoint = useMediaQuery(theme.breakpoints.down('sm'));

  const onShowRequestPassword = () => setRequesting(true);
  const onDismissRequestPassword = () => setRequesting(false);

  const onResetPassword = async (email: string) => {
    try {
      setWorking(true);
      await sendPasswordResetEmail(auth, email);
      setRequesting(false);
      setConfirm(true);
    } catch (error) {
      if (isDev) console.log(error);
    } finally {
      setWorking(false);
    }
  }

  const onSubmit = (data: FormData) => {
    setIsAuthenticating(true)
    signInWithEmailAndPassword(auth, data.email, data.password)
      .then(() => navigate('/'))
      .catch((error: AuthError) => setError(error))
      .finally(() => setIsAuthenticating(false));
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
              <Button
                fullWidth
                onClick={onShowRequestPassword}
                sx={{ marginTop: 2 }}>
                {t("button.forgot_password")}
              </Button>
            </Paper>
          </Container>
        </Stack>
      </Container>
      <PasswordReset
        isOpen={requesting}
        email={watch('email')}
        working={working}
        onSubmit={onResetPassword}
        onDismiss={onDismissRequestPassword}/>
      <SVGFeedbackDialog
        isOpen={confirm}
        svgImage={EmailSent}
        title={t("dialog.reset_email_sent")}
        description={t("dialog.reset_email_sent_summary")}
        onDismiss={() => setConfirm(false)}/>
    </Box>
  );
}

export default Authentication;