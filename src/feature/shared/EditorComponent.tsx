import React, { ReactNode } from "react";
import { AppBar, Box, Button, IconButton, Slide, Theme, Toolbar, Typography, useTheme } from "@mui/material";
import { TransitionProps } from "@mui/material/transitions";
import { AddRounded, CloseRounded, DeleteOutlineRounded, SaveRounded } from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import { makeStyles } from "@mui/styles";
import { GridToolbarContainer, useGridRootProps } from "@mui/x-data-grid";

type EditorAppBarProps = {
  title?: string,
  onDismiss?: () => void,
  onConfirm?: () => void,
}

const EditorAppBar = (props: EditorAppBarProps) => {
  const { t } = useTranslation();
  const theme = useTheme();

  return (
    <AppBar sx={{ position: 'relative' }}>
      <Toolbar>
        <IconButton edge="start" color="inherit" onClick={props.onDismiss} aria-label={t("button.close")}>
          <CloseRounded/>
        </IconButton>
        <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
          {props.title}
        </Typography>
        <Button
          autoFocus
          variant={theme.palette.mode === 'dark' ? "contained" : "text" }
          size="large"
          color={theme.palette.mode === 'dark' ? "primary" : "inherit" }
          onClick={props.onConfirm}
          type="submit"
          startIcon={<SaveRounded/>}>
          {t("button.save")}
        </Button>
      </Toolbar>
    </AppBar>
  )
}

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
  },
  content: {
    flex: '1',
    display: 'flex',
    flexDirection: 'column',
    padding: theme.spacing(2),
  }
}));

type EditorRootProps = {
  children: JSX.Element | ReactNode
  onSubmit: () => void,
}
const EditorRoot = (props: EditorRootProps) => {
  const classes = useStyles();

  return (
    <Box component="form" onSubmit={props.onSubmit} className={classes.root}>
      {props.children}
    </Box>
  )
}

type EditorContentProps = {
  children: JSX.Element | ReactNode
}
const EditorContent = (props: EditorContentProps) => {
  const classes = useStyles();

  return (
    <Box className={classes.content}>
      {props.children}
    </Box>
  )
}

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement;
  },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props}/>;
});

type GridEditorComponentProps = {
  onAddAction: () => void,
  onRemoveAction: () => void,
}
const EditorGridToolbar = () => {
  const { t } = useTranslation();
  const props = useGridRootProps().componentsProps;

  return (
    <GridToolbarContainer>
      { props && props.toolbar &&
        (props.toolbar as GridEditorComponentProps).onAddAction &&
        <Button
          startIcon={<AddRounded/>}
          onClick={(props.toolbar as GridEditorComponentProps).onAddAction}>
          {t("button.add")}
        </Button>
      }
      {
        props && props.toolbar &&
        (props.toolbar as GridEditorComponentProps).onRemoveAction &&
        <Button
          startIcon={<DeleteOutlineRounded/>}
          onClick={(props.toolbar as GridEditorComponentProps).onRemoveAction}>
          {t("button.delete")}
        </Button>
      }
    </GridToolbarContainer>
  )
}

type EditorDataGridProps<T> = {
  onAddAction: () => void,
  onRemoveAction: () => void,
  onItemSelected: (t: T) => void,
}

export { EditorRoot, EditorAppBar, EditorContent, EditorGridToolbar, EditorDataGridProps, Transition }