import { useTranslation } from "react-i18next";
import Box from "@material-ui/core/Box";
import Button from "@material-ui/core/Button";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/core/styles";

import { ArrowRightIcon, ExclamationIcon } from "@heroicons/react/outline";

import history from "../navigation/History";
import EmptyStateComponent from "./EmptyStates";
import { ReactComponent as Logo } from "./404.svg";

const useStyles = makeStyles((theme) => ({
  root: {
    width: '100vw', height: '100vh',
    padding: theme.spacing(6)
  },
  wrapper: {
    height: '100%',
  },
  image: {
    width: '32em',
    height: '32em',
    [theme.breakpoints.down('xs')]: {
      width: '24em',
      height: '24em'
    }
  },
  cta_wrapper: {
    marginTop: theme.spacing(6),
  },
  cta: {
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(6)
  },
  cta_icon: {
    width: '1em', height: '1em',
    color: theme.palette.primary.main
  }
}));

export const ErrorNoPermissionState = () => {
  const { t } = useTranslation();

  return (
    <EmptyStateComponent
      icon={ExclamationIcon}
      title={t("error.no_permissions_header")}
      subtitle={t("error.no_permissions_summary_read")} />
  );
}

export const ErrorNotFoundState = () => {
  const classes = useStyles();
  const { t } = useTranslation();

  return (
    <Box className={classes.root}>
      <Grid container direction="row" alignItems="center" justifyContent="center" className={classes.wrapper}>
        <Grid item md={6} lg={4}>
          <Logo className={classes.image} />
        </Grid>
        <Grid item md={6} lg={4}>
          <Typography variant="h2">{t("error.not_found_header")}</Typography>
          <Typography variant="h4">{t("error.not_found_summary")}</Typography>

          <Box className={classes.cta_wrapper}>
            <Typography variant="h6">{t("error.not_found_info")}</Typography>

            <Button
              variant="outlined"
              color="primary"
              endIcon={<ArrowRightIcon className={classes.cta_icon} />}
              className={classes.cta}
              onClick={() => history.push('/')} >
              {t("button.go_to_home")}
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  )
}