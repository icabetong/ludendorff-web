import CircularProgress from "@mui/material/CircularProgress";
import Grid from "@mui/material/Grid";
import LinearProgress from "@mui/material/LinearProgress";
import { useTheme } from "@mui/material/styles";

import makeStyles from '@mui/styles/makeStyles';

import { ReactComponent as Logo } from "../../shared/icon.svg";
import { Theme } from "@mui/material";

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    width: '100vw',
    height: '100vh'
  },
  rootContent: {
    width: '100%',
    height: '100%',
  },
  wrapper: {
    width: 'fit-content',
    height: 'fit-content'
  },
  icon: {
    display: 'block',
    margin: '2em auto',
    width: '8em',
    height: '8em',
    color: theme.palette.primary.main
  },
  progress: {
    margin: 'auto'
  },
}));

export const MainLoadingStateComponent = () => {
  const classes = useStyles();
  const theme = useTheme();

  return (
    <Grid
      container
      direction="row"
      alignItems="center"
      justifyContent="center"
      className={classes.root}>
      <Grid
        item
        className={classes.wrapper}>
        <Logo
          stroke={theme.palette.primary.main}
          className={classes.icon}/>
        <LinearProgress className={classes.progress}/>
      </Grid>
    </Grid>
  )
}

export const ContentLoadingStateComponent = () => {
  const classes = useStyles();

  return (
    <Grid
      container
      direction="column"
      alignItems="center"
      justifyContent="center"
      className={classes.rootContent}>
      <Grid
        item
        className={classes.wrapper}>
        <CircularProgress className={classes.progress}/>
      </Grid>
    </Grid>
  )
}