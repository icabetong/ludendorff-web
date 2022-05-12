import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { AppBar, IconButton, Menu, Toolbar, Typography } from "@mui/material";
import { CloseRounded, MoreVert, SaveRounded } from "@mui/icons-material";
import { LoadingButton } from "@mui/lab";

type EditorAppBarProps = {
  title?: string,
  loading?: boolean,
  menuItems?: JSX.Element[],
  onDismiss?: () => void,
  onConfirm?: () => void,
}

export const EditorAppBar = (props: EditorAppBarProps) => {
  const { t } = useTranslation();
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const isOpen = Boolean(anchor);
  const anchorProperties = { vertical: 'top', horizontal: 'right' } as const

  return (
    <AppBar sx={{ position: 'relative' }} elevation={0} color='transparent'>
      <Toolbar>
        <IconButton edge="start" color="inherit" onClick={props.onDismiss} aria-label={t("button.close")}>
          <CloseRounded/>
        </IconButton>
        <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
          {props.title}
        </Typography>
        <LoadingButton
          autoFocus
          loading={props.loading}
          color="primary"
          variant="contained"
          size="large"
          onClick={props.onConfirm}
          type={props.onConfirm ? "button" : "submit"}
          startIcon={<SaveRounded/>}>
          {t("button.save")}
        </LoadingButton>
        {props.menuItems &&
        <>
          <IconButton
            size="large"
            edge="end"
            aria-haspopup="true"
            aria-label={t("button.show_menu")}
            onClick={(e) => setAnchor(e.currentTarget)}>
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
              props.menuItems.map((item) => {
                return item
              })
            }
          </Menu>
        </>
        }
      </Toolbar>
    </AppBar>
  )
}