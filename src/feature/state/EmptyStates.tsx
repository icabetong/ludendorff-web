import React, { ComponentClass, FunctionComponent } from "react";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";

type EmptyStateComponentPropsType = {
  icon: FunctionComponent<any> | ComponentClass<any, any>,
  title: string,
  subtitle: string
}

const EmptyStateComponent = (props: EmptyStateComponentPropsType) => {
  return (
    <Grid
      container
      direction="column"
      alignItems="center"
      justifyContent="center"
      sx={{
        height: '100%',
        flex: 1,
        padding: 4
      }}>
      <Grid item>
        {React.createElement(props.icon, { fontSize: "large" })}
      </Grid>
      <Grid item>
        <Typography
          variant="h6"
          sx={{ textAlign: 'center' }}>{props.title}</Typography>
      </Grid>
      <Grid item>
        <Typography
          variant="subtitle1"
          sx={{ textAlign: 'center' }}>{props.subtitle}</Typography>
      </Grid>
    </Grid>
  )
}

export default EmptyStateComponent;