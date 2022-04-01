import React, { FunctionComponent, ComponentClass } from "react";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import makeStyles from '@mui/styles/makeStyles';
import { Theme } from "@mui/material";

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    minHeight: '60vh',
    padding: theme.spacing(4)
  },
  text: {
    textAlign: 'center'
  }
}));

type EmptyStateComponentPropsType = {
  icon: FunctionComponent<any> | ComponentClass<any, any>,
  title: string,
  subtitle: string
}

const EmptyStateComponent = (props: EmptyStateComponentPropsType) => {
  const classes = useStyles();

  return (
    <Grid
      container
      direction="column"
      alignItems="center"
      justifyContent="center"
      className={ classes.root }>
      <Grid item>
        { React.createElement(props.icon, { fontSize: "large" }) }
      </Grid>
      <Grid item>
        <Typography
          variant="h6"
          className={ classes.text }>{ props.title }</Typography>
      </Grid>
      <Grid item>
        <Typography
          variant="subtitle1"
          className={ classes.text }>{ props.subtitle }</Typography>
      </Grid>
    </Grid>
  )
}

export default EmptyStateComponent;