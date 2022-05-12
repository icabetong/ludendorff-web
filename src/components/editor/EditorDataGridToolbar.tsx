import React from "react";
import { useTranslation } from "react-i18next";
import {
  GridToolbarColumnsButton,
  GridToolbarContainer,
  GridToolbarDensitySelector, GridToolbarFilterButton,
  useGridRootProps
} from "@mui/x-data-grid";
import { Box, Button } from "@mui/material";
import { AddRounded, DeleteOutlineRounded, SearchRounded } from "@mui/icons-material";
import { GridSearchBox, SearchIconWrapper, SearchInputBase } from "../datagrid";

type EditorGridToolbarProps = {
  onAddAction: () => void,
  onRemoveAction: () => void,
  onSelectAction: () => void,
  onSearchChanged: (query: string) => void
}
export type EditorDataGridProps<T> = {
  isLoading?: boolean,
  onAddAction: () => void,
  onRemoveAction: () => void,
  onItemSelected: (t: T) => void,
}

export const EditorGridToolbar = () => {
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
          <GridSearchBox>
            <SearchIconWrapper><SearchRounded/></SearchIconWrapper>
            <SearchInputBase
              placeholder={t("placeholder.search_entries")}
              onChange={onHandleSearchField}
              inputProps={{ 'aria-label': t("field.search") }}/>
          </GridSearchBox>
        </Box>
      </Box>
    </GridToolbarContainer>
  )
}

