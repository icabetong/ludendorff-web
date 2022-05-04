import { useState } from "react";
import { useTranslation } from "react-i18next";
import { AppBar, Box, Button, IconButton, Toolbar, Typography, useMediaQuery, useTheme } from "@mui/material";
import { AddRounded, CloseRounded, SearchRounded } from "@mui/icons-material";
import { SearchBoxInputBase } from "./InstantSearch";
import React from "react";

type DialogToolbarProps = {
  title?: string,
  onSearchFocusChanged?: (hasFocus: boolean) => void,
  onAdd?: () => void,
  onDismiss?: () => void,
}

const DialogToolbar = (props: DialogToolbarProps) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const mdBreakpoint = useMediaQuery(theme.breakpoints.up('sm'));
  const [expand, setExpand] = useState(false);

  return (
    <AppBar position="relative" elevation={0} color="transparent">
      <Toolbar>
        <IconButton edge="start" color="inherit" onClick={props.onDismiss} aria-label={t("button.dismiss")}>
          <CloseRounded/>
        </IconButton>
        { !expand &&
          <Typography variant="h6" component="div" sx={{ flex: 1, px: 1 }}>
            {props.title}
          </Typography>
        }
        {( mdBreakpoint || expand ) &&
          <Box>
            <SearchBoxInputBase onFocusChanged={props.onSearchFocusChanged}/>
          </Box>
        }
        { !mdBreakpoint &&
          <Box sx={{ display: { xs: 'block', sm: 'none' }}}>
            <IconButton edge="end" onClick={() => setExpand((prev) => !prev)}>
              { expand ? <CloseRounded/> : <SearchRounded/> }
            </IconButton>
          </Box>
        }
        { props.onAdd &&
          <Box sx={{ display: { xs: 'none', md: 'block' }}}>
            <Button
              variant="contained"
              startIcon={<AddRounded/>}
              onClick={props.onAdd}>
              {t("button.add")}
            </Button>
          </Box>
        }
      </Toolbar>
    </AppBar>
  )
}
export default DialogToolbar;