import React, { ReactNode, useState } from "react";
import { AppBar, Box, Button, IconButton, Menu, Slide, TextField, Toolbar, Typography } from "@mui/material";
import { TransitionProps } from "@mui/material/transitions";
import {
  AddRounded,
  CloseRounded,
  DeleteOutlineRounded,
  MoreVert,
  SaveRounded
} from "@mui/icons-material";
import { useTranslation } from "react-i18next";
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

type EditorRootProps = {
  children: JSX.Element | ReactNode
  onSubmit?: () => void,
}
const EditorRoot = (props: EditorRootProps) => {
  return (
    <Box
      component="form"
      onSubmit={props.onSubmit}
      sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {props.children}
    </Box>
  )
}

type EditorContentProps = {
  children: JSX.Element | ReactNode
}
const EditorContent = (props: EditorContentProps) => {
  return (
    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', padding: 2 }}>
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

type EditorGridToolbarProps = {
  onAddAction: () => void,
  onRemoveAction: () => void,
  onSelectAction: () => void,
  onSearchChanged: (query: string) => void
}
const EditorGridToolbar = () => {
  const { t } = useTranslation();
  const componentsProps = useGridRootProps().componentsProps;
  const props: EditorGridToolbarProps | undefined = componentsProps?.toolbar;

  const onHandleSearchField = (e: React.ChangeEvent<HTMLInputElement>) => {
    props && props.onSearchChanged(e.target.value);
  }

  return (
    <GridToolbarContainer>
      <Box sx={{ width: '100%', display: 'flex', flexDirection: 'row' }}>
        {props && props.onAddAction &&
          <Button
            size="small"
            startIcon={<AddRounded/>}
            onClick={props.onAddAction}>
            {t("button.add")}
          </Button>
        }
        {
          props && props.onRemoveAction &&
          <Button
            size="small"
            startIcon={<DeleteOutlineRounded/>}
            onClick={props.onRemoveAction}>
            {t("button.delete")}
          </Button>
        }
        <GridToolbarColumnsButton/>
        <GridToolbarDensitySelector/>
        <GridToolbarFilterButton/>
        <Box sx={{ width: '100%', flex: 1, display: 'flex', flexDirection: 'row' }}>
          <Box sx={{ flex: 1 }}/>
          <TextField
            size="small"
            placeholder={t("placeholder.search_entries")}
            sx={{ flex: 1, margin: 0 }}
            onChange={onHandleSearchField}/>
        </Box>
      </Box>
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