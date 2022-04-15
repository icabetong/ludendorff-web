import React, { useState } from "react";
import {
  AppBar,
  Box,
  Button,
  IconButton,
  Menu,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { AddRounded, MenuRounded, MoreVert } from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import { SearchBox, SearchBoxInputBase } from "./Search";

type AdaptiveHeaderProps = CoreHeaderProps & MediumScreenHeaderProps & LargeScreenHeaderProps;
type CoreHeaderProps = {
  title?: string,
  actionText?: string,
  onActionEvent?: React.MouseEventHandler,
  onSearchFocusChanged?: (hasFocus: boolean) => void,
}
type MediumScreenHeaderProps = CoreHeaderProps & {
  menuItems?: JSX.Element[],
  onDrawerTriggered?: () => void,
}
type LargeScreenHeaderProps = CoreHeaderProps

const AdaptiveHeader = (props: AdaptiveHeaderProps) => {
  const { title, menuItems, actionText, onActionEvent, onDrawerTriggered, onSearchFocusChanged } = props;

  return (
    <>
      <Box sx={{ display: { xs: 'none', lg: 'block' }}}>
        <LargeScreenHeader
          title={title}
          actionText={actionText}
          onActionEvent={onActionEvent}
          onSearchFocusChanged={onSearchFocusChanged}/>
      </Box>
      <Box sx={{ display: { xs: 'block', lg: 'none' }}}>
        <MediumScreenHeader
          title={title}
          menuItems={menuItems}
          actionText={actionText}
          onActionEvent={onActionEvent}
          onDrawerTriggered={onDrawerTriggered}
          onSearchFocusChanged={onSearchFocusChanged}/>
      </Box>
    </>
  )
}


const MediumScreenHeader = (props: MediumScreenHeaderProps) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const smBreakpoint = useMediaQuery(theme.breakpoints.up('sm'));
  const mdBreakpoint = useMediaQuery(theme.breakpoints.up('md'));
  const { title, actionText, onActionEvent, menuItems, onDrawerTriggered, onSearchFocusChanged } = props;
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const isOpen = Boolean(anchor);
  const anchorProperties = { vertical: 'top', horizontal: 'right' } as const

  return (
    <AppBar
      position="static"
      color="transparent"
      elevation={0}
      sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
      <Toolbar>
        <IconButton
          edge="start"
          onClick={onDrawerTriggered}
          aria-label={t("button.show_drawer")}
          size="large">
          <MenuRounded/>
        </IconButton>
        <Box sx={{ display: { xs: 'none', lg: 'block' }}}>
          <Typography variant="h5" sx={{ flexGrow: 1 }}>
            {title}
          </Typography>
        </Box>
        <Box sx={{ display: { xs: 'block', lg: 'none' }}}>
          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{ flexGrow: 1, display: 'block' }}>
            {title}
          </Typography>
        </Box>
        {smBreakpoint && onSearchFocusChanged &&
          <SearchBoxInputBase onFocusChanged={onSearchFocusChanged}/>
        }
        {smBreakpoint && actionText && onActionEvent &&
          <Button
            variant="contained"
            startIcon={mdBreakpoint ? <AddRounded/> : undefined}
            onClick={onActionEvent}>
            {mdBreakpoint ? actionText : <AddRounded/>}
          </Button>
        }
        {menuItems &&
          <>
            <IconButton
              size="large"
              edge="end"
              aria-haspopup="true"
              aria-label={t("button.show_menu")}
              onClick={(e: React.MouseEvent<HTMLElement>) => setAnchor(e.currentTarget)}>
              <MoreVert/>
            </IconButton>
            <Menu
              keepMounted
              anchorEl={anchor}
              anchorOrigin={anchorProperties}
              transformOrigin={anchorProperties}
              open={isOpen}
              onClose={() => setAnchor(null)}
              onMouseLeave={() => setAnchor(null)}>
              {props.menuItems &&
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
      <Box flexGrow={3}>
        <Typography variant="h4">{title}</Typography>
      </Box>
      {onSearchFocusChanged &&
        <Box sx={{ mx: 2 }}>
          <SearchBox onFocusChanged={props.onSearchFocusChanged}/>
        </Box>
      }
      {actionText && onActionEvent &&
        <Box>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddRounded/>}
            onClick={onActionEvent}>
            {actionText}
          </Button>
        </Box>
      }
    </Box>
  )
}

export default AdaptiveHeader;