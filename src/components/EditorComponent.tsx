import React, { ReactNode, useState } from "react";
import { AppBar, Box, Button, IconButton, Menu, Slide, Theme, Toolbar, Typography } from "@mui/material";
import { TransitionProps } from "@mui/material/transitions";
import {
  AddRounded,
  CloseRounded,
  DeleteOutlineRounded,
  MoreVert,
  SaveRounded
} from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import { makeStyles } from "@mui/styles";
import {
  GridToolbarColumnsButton,
  GridToolbarContainer,
  GridToolbarDensitySelector,
  GridToolbarFilterButton,
  useGridRootProps
} from "@mui/x-data-grid";
import { LoadingButton } from "@mui/lab";

type EditorAppBarProps = {
  title?: string,
  loading?: boolean,
  menuItems?: JSX.Element[],
  onDismiss?: () => void,
  onConfirm?: () => void,
}

const EditorAppBar = (props: EditorAppBarProps) => {
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
    padding: theme.spacing(2)
  }
}));

type EditorRootProps = {
  children: JSX.Element | ReactNode
  onSubmit?: () => void,
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

// TODO: Properly rename this type
type GridEditorComponentProps = {
  onAddAction: () => void,
  onRemoveAction: () => void,
  onSelectAction: () => void,
}
const EditorGridToolbar = () => {
  const { t } = useTranslation();
  const props = useGridRootProps().componentsProps;

  return (
    <GridToolbarContainer>
      {props && props.toolbar &&
        (props.toolbar as GridEditorComponentProps).onAddAction &&
        <Button
          size="small"
          startIcon={<AddRounded/>}
          onClick={(props.toolbar as GridEditorComponentProps).onAddAction}>
          {t("button.add")}
        </Button>
      }
      {
        props && props.toolbar &&
        (props.toolbar as GridEditorComponentProps).onRemoveAction &&
        <Button
          size="small"
          startIcon={<DeleteOutlineRounded/>}
          onClick={(props.toolbar as GridEditorComponentProps).onRemoveAction}>
          {t("button.delete")}
        </Button>
      }
      <GridToolbarColumnsButton/>
      <GridToolbarDensitySelector/>
      <GridToolbarFilterButton/>
    </GridToolbarContainer>
  )
}

type EditorDataGridProps<T> = {
  isLoading?: boolean,
  onAddAction: () => void,
  onRemoveAction: () => void,
  onItemSelected: (t: T) => void,
}

export { EditorRoot, EditorAppBar, EditorContent, EditorGridToolbar, EditorDataGridProps, Transition }