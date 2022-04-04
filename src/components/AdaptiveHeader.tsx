import React, { useState } from "react";
import {
  AppBar,
  Box,
  Button,
  Hidden,
  IconButton,
  Menu,
  Theme,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme
} from "@mui/material";
import { SearchBox } from "./Search";
import { AddRounded, MenuRounded, MoreVert } from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import { makeStyles } from "@mui/styles";

const useStyles = makeStyles((theme: Theme) => ({
  appBar: {
    zIndex: theme.zIndex.drawer + 1,
  },
}))

type AdaptiveHeaderProps = CoreHeaderProps & MediumScreenHeaderProps & LargeScreenHeaderProps;
const AdaptiveHeader = (props: AdaptiveHeaderProps) => {
  const { title, menuItems, actionText, onActionEvent, onDrawerTriggered, onSearchFocusChanged } = props;

  return (
    <>
      <Hidden lgDown>
        <LargeScreenHeader
          title={title}
          actionText={actionText}
          onActionEvent={onActionEvent}
          onSearchFocusChanged={onSearchFocusChanged}/>
      </Hidden>
      <Hidden lgUp>
        <MediumScreenHeader
          title={title}
          menuItems={menuItems}
          actionText={actionText}
          onActionEvent={onActionEvent}
          onDrawerTriggered={onDrawerTriggered}/>
      </Hidden>
    </>
  )
}

type CoreHeaderProps = {
  title?: string,
  actionText?: string,
  onActionEvent?: React.MouseEventHandler,
}

type MediumScreenHeaderProps = CoreHeaderProps & {
  menuItems?: JSX.Element[],
  onDrawerTriggered?: () => void,
}

const MediumScreenHeader = (props: MediumScreenHeaderProps) => {
  const { t } = useTranslation();
  const classes = useStyles();
  const theme = useTheme();
  const smBreakpoint = useMediaQuery(theme.breakpoints.up('sm'));
  const { title, actionText, onActionEvent, menuItems, onDrawerTriggered } = props;
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const isOpen = Boolean(anchor);
  const anchorProperties = { vertical: 'top', horizontal: 'right' } as const

  return (
    <AppBar
      position="static"
      color="transparent"
      elevation={0}
      className={classes.appBar}>
      <Toolbar>
        <IconButton
          edge="start"
          onClick={ onDrawerTriggered }
          aria-label={ t("button.show_drawer") }
          size="large">
          <MenuRounded/>
        </IconButton>
        <Hidden lgDown>
          <Typography variant="h5" sx={{flexGrow: 1}}>
            { title }
          </Typography>
        </Hidden>
        <Hidden lgUp>
          <Typography variant="h6" sx={{flexGrow: 1}}>
            { title }
          </Typography>
        </Hidden>
        { smBreakpoint && actionText && onActionEvent &&
          <Button
            variant="contained"
            startIcon={<AddRounded/>}
            onClick={onActionEvent}>
            {actionText}
          </Button>
        }
        { menuItems &&
          <>
            <IconButton
              size="large"
              edge="end"
              aria-haspopup="true"
              aria-label={ t("button.show_menu") }
              onClick={ (e: React.MouseEvent<HTMLElement>) => setAnchor(e.currentTarget) }>
              <MoreVert/>
            </IconButton>
            <Menu
              keepMounted
              anchorEl={ anchor }
              anchorOrigin={ anchorProperties }
              transformOrigin={ anchorProperties }
              open={ isOpen }
              onClose={ () => setAnchor(null) }
              onMouseLeave={ () => setAnchor(null) }>
              { props.menuItems &&
                props.menuItems.map((menuItem) => {
                  return menuItem
                })
              }
            </Menu>
          </>
        }
      </Toolbar>
    </AppBar>
  )
}

type LargeScreenHeaderProps = CoreHeaderProps & {
  onSearchFocusChanged?: (hasFocus: boolean) => void,
}

const LargeScreenHeader = (props: LargeScreenHeaderProps) => {
  const { title, actionText, onActionEvent, onSearchFocusChanged } = props;

  return (
    <Box
      sx={{
        w: "100%",
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        mx: 3,
        pt: 4
      }}>
      <Box flexGrow={ 3 }>
        <Typography variant="h4">{ title }</Typography>
      </Box>
      { onSearchFocusChanged &&
        <Box sx={ { mx: 2 } }>
          <SearchBox onFocusChanged={ onSearchFocusChanged }/>
        </Box>
      }
      { actionText && onActionEvent &&
        <Box>
          <Button
            variant="contained"
            color="primary"
            startIcon={ <AddRounded/> }
            onClick={ onActionEvent }>
            { actionText }
          </Button>
        </Box>
      }
    </Box>
  )
}

export default AdaptiveHeader;