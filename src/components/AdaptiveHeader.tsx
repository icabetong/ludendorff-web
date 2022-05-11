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
import SearchBoxInputBase from "../feature/search/SearchBox";

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
  const { t } = useTranslation();
  const { title, menuItems, actionText, onActionEvent, onDrawerTriggered, onSearchFocusChanged } = props;
  const theme = useTheme();
  const smBreakpoint = useMediaQuery(theme.breakpoints.up('sm'));
  const mdBreakpoint = useMediaQuery(theme.breakpoints.up('md'));
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const isOpen = Boolean(anchor);
  const anchorProperties = { vertical: 'top', horizontal: 'right' } as const

  return (
    <AppBar
      elevation={0}
      color="transparent"
      position="sticky"
      sx={{
        paddingY: { lg: 2 }
      }}>
      <Toolbar>
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={onDrawerTriggered}
          sx={{ mr: 2, display: { lg: 'none' } }}>
          <MenuRounded/>
        </IconButton>
        <Box sx={{ mx: 1, flexGrow: 1 }}>
          <Typography
            variant={mdBreakpoint ? "h4" : "h6"}
            noWrap
            component="div"
            sx={{ display: 'block' }}>
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
              onMouseLeave={() => setAnchor(null)}
              PaperProps={{ sx: { width: 180 }}}>
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


export default AdaptiveHeader;