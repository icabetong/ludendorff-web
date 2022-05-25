import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Box, Button, Chip, Tooltip } from "@mui/material";
import {
  DataGrid,
  GridActionsCellItem,
  GridLoadingOverlay,
  GridRenderCellParams, GridRowId,
  GridRowParams,
  GridSelectionModel,
  GridValueGetterParams
} from "@mui/x-data-grid";
import { DeleteOutlineRounded, CategoryRounded, WarningRounded } from "@mui/icons-material";
import { AssetImport } from "./AssetImport";
import useDensity from "../shared/hooks/useDensity";
import {
  assetSubcategory,
  assetDescription, assetRemarks,
  assetStockNumber,
  assetCategory,
  assetUnitOfMeasure, assetUnitValue
} from "../../shared/const";
import { currencyFormatter } from "../../shared/utils";
import { getEditorDataGridTheme } from "../core/Core";
import { ImporterGridToolbar } from "../../components/importer/ImporterGridToolbar";
import useColumnVisibilityModel from "../shared/hooks/useColumnVisibilityModel";
import { Category } from "../category/Category";
import { AssetImportDataGridEmptyState } from "./AssetImportEmptyState";


type AssetImportDataGridProps = {
  assets: AssetImport[],
  isLoading?: boolean,
  onItemSelect: (asset: AssetImport) => void,
  onItemRemove: (asset: AssetImport) => void,
  onItemsChecked: (ids: string[]) => void,
  onRemovedChecked: () => void,
  onBulkCategoryPick: () => void,
  onAssetCategoryPick: (stockNumber: string) => void,
}

const AssetImportDataGrid = (props: AssetImportDataGridProps) => {
  const { t } = useTranslation();
  const { density, onDensityChanged } = useDensity('assetDensity');
  const [hasChecked, setHasChecked] = useState(false);
  const columns = [
    {
      field: assetStockNumber,
      headerName: t("field.stock_number"),
      flex: 1.5,
      renderCell: (params: GridRenderCellParams<string>) => {
        let asset = params.row as AssetImport;
        if (asset.status === 'exists')
          return (
            <Tooltip title={t("info.stock_number_exists")}>
              <Box
                sx={{
                  color: (theme) => theme.palette.warning.main,
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center'}}>
                <WarningRounded/>
                <Box component="span" sx={{ marginLeft: 2 }}>{params.value}</Box>
              </Box>
            </Tooltip>
          )
        else return <span>{params.value}</span>
      }
    },
    { field: assetDescription, headerName: t("field.asset_description"), flex: 2 },
    {
      field: assetCategory,
      headerName: t("field.category"),
      flex: 1,
      renderCell: (params: GridRenderCellParams<Category>) => {
        if (!params.value) {
          return (
            <Chip
              color="error"
              label={t("unknown")}
              icon={<WarningRounded/>}
              size={density === 'compact' ? 'small' : 'medium' }
              onClick={() => props.onAssetCategoryPick(params.row.stockNumber)}/>
          )
        } else return params.value?.categoryName
      },
    },
    {
      field: assetSubcategory,
      headerName: t("field.subcategory"),
      flex: 1,
    },
    {
      field: assetUnitOfMeasure,
      headerName: t("field.unit_of_measure"),
      flex: 1
    },
    {
      field: assetUnitValue,
      headerName: t("field.unit_value"),
      flex: 1,
      valueGetter: (params: GridValueGetterParams) => currencyFormatter.format(params.value)
    },
    {
      field: assetRemarks,
      headerName: t("field.remarks"),
      flex: 1
    },
    {
      field: "actions",
      type: "actions",
      flex: 0.5,
      getActions: (params: GridRowParams) => [
        ...(!params.row.category
          ? [
              <GridActionsCellItem
                showInMenu
                icon={<CategoryRounded/>}
                label={t("button.set_category")}
                onClick={() => props.onAssetCategoryPick(params.row.stockNumber)}/>
            ] : [ ]
        ),
        <GridActionsCellItem
          showInMenu
          icon={<DeleteOutlineRounded/>}
          label={t("button.delete")}
          onClick={() => props.onItemRemove(params.row as AssetImport)}/>
      ],
    }
  ];
  const { visibleColumns, onVisibilityChange } = useColumnVisibilityModel('assetColumns', columns);

  const onCheckedRowsChanged = (model: GridSelectionModel) => {
    setHasChecked(Array.from(model).length > 0);
    props.onItemsChecked(model.map((id: GridRowId) => `${id}`));
  }

  const onRowDoubleClick = (params: GridRowParams) => props.onItemSelect(params.row as AssetImport);

  return (
    <Box sx={(theme) => ({ marginTop: theme.spacing(1), height: '100%', ...getEditorDataGridTheme(theme) })}>
      <DataGrid
        checkboxSelection
        disableSelectionOnClick
        components={{
          NoRowsOverlay: AssetImportDataGridEmptyState,
          LoadingOverlay: GridLoadingOverlay,
          Toolbar: ImporterGridToolbar,
        }}
        componentsProps={{
          toolbar: {
            actions: hasChecked && [
              <Button
                key="set_category"
                size="small"
                startIcon={<CategoryRounded/>}
                onClick={props.onBulkCategoryPick}>
                {t("button.set_category")}
              </Button>,
              <Button
                key="remove"
                size="small"
                startIcon={<DeleteOutlineRounded/>}
                onClick={props.onRemovedChecked}>
                {t("button.delete")}
              </Button>
            ]
          }
        }}
        loading={props.isLoading}
        columns={columns}
        rows={props.assets}
        density={density}
        columnVisibilityModel={visibleColumns}
        getRowId={(row) => row.stockNumber}
        onSelectionModelChange={onCheckedRowsChanged}
        onStateChange={(v) => onDensityChanged(v.density.value)}
        onRowDoubleClick={onRowDoubleClick}
        onColumnVisibilityModelChange={(m) => onVisibilityChange(m)}/>
    </Box>
  )
}

export default AssetImportDataGrid;