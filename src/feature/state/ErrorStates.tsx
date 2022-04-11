import { useTranslation } from "react-i18next";
import { Box, Button, Typography, useTheme } from "@mui/material";
import { ChevronRightRounded, ErrorOutlineRounded, } from "@mui/icons-material";
import history from "../navigation/History";
import EmptyStateComponent from "./EmptyStates";
import { ReactComponent as Logo } from "./404.svg";

export const ErrorNoPermissionState = () => {
  const { t } = useTranslation();

  return (
    <EmptyStateComponent
      icon={ErrorOutlineRounded}
      title={t("error.no_permissions_header")}
      subtitle={t("error.no_permissions_summary_read")}/>
  );
}

export const ErrorNotFoundState = () => {
  const theme = useTheme();
  const { t } = useTranslation();

  return (
    <Box sx={{ width: '100%', height: '100vh', padding: 2 }}>
      <Box sx={{
        height: '100%',
        display: 'flex',
        flexDirection: {
          xs: 'column',
          md: 'row'
        },
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <Box component={Logo} sx={{
          width: {
            xs: '12em',
            md: '24em',
          },
          marginBottom: {
            xs: '1em',
            md: 0
          }
        }}/>
        <Box sx={{ mx: 4 }}>
          <Typography variant="h2">{t("error.not_found_header")}</Typography>
          <Typography variant="h6">{t("error.not_found_summary")}</Typography>

          <Box sx={{ marginTop: 6 }}>
            <Typography variant="body1">{t("error.not_found_info")}</Typography>
            <Button
              sx={{ mt: theme.spacing(4), mb: theme.spacing(6) }}
              variant="outlined"
              color="primary"
              endIcon={<ChevronRightRounded/>}
              onClick={() => history.push('/')}>
              {t("button.go_to_home")}
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}