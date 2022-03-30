import { useTranslation } from "react-i18next";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import makeStyles from '@mui/styles/makeStyles';
import {
  ChevronRightRounded,
  ErrorOutlineRounded,
} from "@mui/icons-material";

import history from "../navigation/History";
import EmptyStateComponent from "./EmptyStates";
import { ReactComponent as Logo } from "./404.svg";
import {Theme, useTheme} from "@mui/material";

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    width: '100%', height: '100%',
    padding: theme.spacing(6)
  },
  wrapper: {
    height: '100%',
  },
  image: {
    width: '32em',
    height: '32em',
     [theme.breakpoints.down('sm')]: {
       width: '24em',
       height: '24em'
     }
  },
  actionWrapper: {
    marginTop: theme.spacing(6),
  },
  action: {
    marginTop: theme.spacing(4),
    marginBottom: theme.spacing(6)
  },
}));

export const ErrorNoPermissionState = () => {
  const { t } = useTranslation();

  return (
    <EmptyStateComponent
      icon={ErrorOutlineRounded}
      title={t("error.no_permissions_header")}
      subtitle={t("error.no_permissions_summary_read")} />
  );
}

export const ErrorNotFoundState = () => {
  const classes = useStyles();
  const theme = useTheme();
  const { t } = useTranslation();

  return (
    <Box className={classes.root}>
      <Grid container direction="row" alignItems="center" justifyContent="center" className={classes.wrapper}>
        <Grid item md={6} lg={4}>
          <Logo className={classes.image} />
        </Grid>
        <Grid item md={6} lg={4}>
          <Typography variant="h2">{t("error.not_found_header")}</Typography>
          <Typography variant="h6">{t("error.not_found_summary")}</Typography>

          <Box className={classes.actionWrapper}>
            <Typography variant="body1">{t("error.not_found_info")}</Typography>
            <Button
              sx={{mt: theme.spacing(4), mb: theme.spacing(6)}}
              variant="outlined"
              color="primary"
              endIcon={<ChevronRightRounded/>}
              onClick={() => history.push('/')} >
              {t("button.go_to_home")}
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  )
}