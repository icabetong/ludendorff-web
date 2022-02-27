import React, { FunctionComponent, ComponentClass } from "react";
import {
  Box,
  Button,
  Grid,
  Typography,
} from "@material-ui/core";

type PageHeaderPropsType = {
  title: String,
  buttonText?: String,
  buttonIcon?: string | FunctionComponent<any> | ComponentClass<any, any>,
  buttonOnClick?: React.MouseEventHandler
}

const PageHeader = (props: PageHeaderPropsType) => {
  const { title, buttonText: label, buttonIcon: icon, buttonOnClick: event } = props;

  return (
    <Box mx={3} pt={4}>
      <Grid container direction="row" justifyContent="space-between">
        <Grid item>
          <Typography variant="h4">{title}</Typography>
        </Grid>
        { label &&
          <Grid item>
            <Button 
              variant="contained" 
              color="primary"
              startIcon={icon && React.createElement(icon)}
              onClick={event}>
              {label}
            </Button>
          </Grid>
        }
      </Grid>
    </Box>
  )
}

export default PageHeader;