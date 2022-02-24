import React, { useState, FunctionComponent, ComponentClass } from "react";
import {
  Box,
  Button,
  Grid,
  IconButton,
  Menu,
  Typography,
} from "@material-ui/core";
import {
  MoreVert
} from "@material-ui/icons";

type PageHeaderPropsType = {
  title: String,
  buttonText?: String,
  buttonIcon?: string | FunctionComponent<any> | ComponentClass<any, any>,
  buttonOnClick?: React.MouseEventHandler, 
  menuItems?: JSX.Element[]
}

const PageHeader = (props: PageHeaderPropsType) => {
  const { title, buttonText: label, buttonIcon: icon, menuItems, buttonOnClick: event } = props;
  const [anchor, setAnchor] = useState<null | HTMLElement>(null);

  const onMenuOpen = (event: React.MouseEvent<HTMLButtonElement>) => setAnchor(event.currentTarget);
  const onMenuClose = () => setAnchor(null);

  return (
    <Box mx={3} pt={4}>
      <Grid container direction="row" justifyContent="space-between">
        <Grid item>
          <Typography variant="h5">{title}</Typography>
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
            <IconButton onClick={onMenuOpen}>
              <MoreVert/>
            </IconButton>
          </Grid>
        }
      </Grid>
      { menuItems &&
        <Menu
          id="simple-menu"
          anchorEl={anchor}
          keepMounted
          open={Boolean(anchor)}
          onClose={onMenuClose}>
          {menuItems}
        </Menu>
      }
    </Box>
  )
}

export default PageHeader;