import React, { FunctionComponent, ComponentClass, useState } from "react";
import { useTranslation } from "react-i18next";
import { AppBar, Button, Hidden, IconButton, Menu, Theme, Toolbar, Typography } from "@mui/material";
import makeStyles from '@mui/styles/makeStyles';
import {
  MoreVert,
  MenuRounded,
  SearchOutlined
} from "@mui/icons-material";

type ComponentHeaderPropsType = {
  title: string,
  onDrawerToggle: () => void,
  buttonText?: string,
  buttonIcon?: FunctionComponent<any> | ComponentClass<any, any>,
  buttonOnClick?: React.MouseEventHandler,
  onSearch?: React.MouseEventHandler,
  menuItems?: JSX.Element[]
}

const useStyles = makeStyles((theme: Theme) => ({
  appBar: {
    zIndex: theme.zIndex.drawer + 1,
  },
  toolbar: theme.mixins.toolbar,
  navigationButton: {
    marginRight: theme.spacing(2),
    [theme.breakpoints.up('md')]: {
      display: 'none'
    },
  },
  actionButton: {
    marginLeft: 'auto'
  },
  searchButton: {
    marginLeft: theme.spacing(2)
  },
  title: {
    flexGrow: 1,
  },
  toolbarButtonIcon: {
    color: theme.palette.text.primary
  },
  actionButtonIcon: {
    color: theme.palette.primary.contrastText
  }
}));

const ComponentHeader = (props: ComponentHeaderPropsType) => {
  const { t } = useTranslation();
  const classes = useStyles();

  const [anchor, setAnchor] = useState<null | HTMLElement>(null);
  const menuOpen = Boolean(anchor);
  const anchorProperties = {
    vertical: 'top',
    horizontal: 'right'
  } as const

  return (
    <AppBar position="static" className={ classes.appBar } color="transparent" elevation={ 0 }>
      <Toolbar>
        <IconButton
          edge="start"
          onClick={ props.onDrawerToggle }
          className={ classes.navigationButton }
          aria-label={ t("button.show_drawer") }
          size="large">
          <MenuRounded className={ classes.toolbarButtonIcon }/>
        </IconButton>
        <Hidden smDown>
          <Typography variant="h5" className={ classes.title }>
            { props.title }
          </Typography>
        </Hidden>
        <Hidden smUp>
          <Typography variant="h6" className={ classes.title }>
            { props.title }
          </Typography>
        </Hidden>
        <Hidden xsUp>
          { props.buttonText &&
              <Button
                  variant="contained"
                  color="primary"
                  className={ classes.actionButton }
                  startIcon={ props.buttonIcon &&
                    React.createElement(props.buttonIcon,
                      { className: classes.actionButtonIcon })
                  }
                  onClick={ props.buttonOnClick }
                  aria-label={ props.buttonText }>
                { props.buttonText }
              </Button>
          }
        </Hidden>
        { props.onSearch &&
            <IconButton className={ classes.searchButton } onClick={ props.onSearch } size="large">
                <SearchOutlined/>
            </IconButton>
        }
        { props.menuItems &&
            <div>
                <IconButton
                    aria-haspopup="true"
                    aria-label={ t("button.show_menu") }
                    onClick={ (e: React.MouseEvent<HTMLElement>) => setAnchor(e.currentTarget) }
                    size="large">
                    <MoreVert className={ classes.toolbarButtonIcon }/>
                </IconButton>
                <Menu
                    keepMounted
                    anchorEl={ anchor }
                    anchorOrigin={ anchorProperties }
                    transformOrigin={ anchorProperties }
                    open={ menuOpen }
                    onClose={ () => setAnchor(null) }
                    onMouseLeave={ () => setAnchor(null) }>
                  { props.menuItems &&
                    props.menuItems.map((menuItem) => {
                      return menuItem
                    })
                  }
                </Menu>
            </div>
        }
      </Toolbar>
    </AppBar>
  );
}

export default ComponentHeader;