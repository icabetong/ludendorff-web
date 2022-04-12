import { InventoryReportItem } from "./InventoryReport";
import { DataGrid, GridRowParams, GridSelectionModel, GridValueGetterParams, GridActionsCellItem } from "@mui/x-data-grid";
import {
  article,
  assetDescription,
  assetStockNumber,
  assetType,
  assetUnitOfMeasure,
  assetUnitValue,
  balancePerCard,
  onHandCount
} from "../../shared/const";
import { useTranslation } from "react-i18next";
import { makeStyles } from "@mui/styles";
import { Box, Theme } from "@mui/material";
import { getEditorDataGridTheme } from "../core/Core";
import { EditorDataGridProps, EditorGridToolbar } from "../../components/EditorComponent";
import { useState } from "react";
import { Asset } from "../asset/Asset";
import useDensity from "../shared/useDensity";
import useColumnVisibilityModel from "../shared/useColumnVisibilityModel";
import { currencyFormatter } from "../../shared/utils";
import { EditRounded } from "@mui/icons-material";

const useStyles = makeStyles((theme: Theme) => ({
  dataGrid: {
    marginTop: theme.spacing(1),
    height: '100%',
    ...getEditorDataGridTheme(theme)
  }
}));

type InventoryReportItemDataGridProps = EditorDataGridProps<InventoryReportItem> & {
  items: InventoryReportItem[],
  onCheckedRowsChanged: (model: GridSelectionModel) => void,
}

const InventoryReportItemDataGrid = (props: InventoryReportItemDataGridProps) => {
  const { t } = useTranslation();
  const classes = useStyles();
  const { density, onDensityChanged } = useDensity('inventoryEditorDensity');
  const [hasChecked, setHasChecked] = useState(false);

  const columns = [
    { field: article, headerName: t("field.article"), flex: 1 },
    { field: assetDescription, headerName: t("field.asset_description"), flex: 3 },
    {
      field: assetType,
      headerName: t("field.type"),
      flex: 1,
      valueGetter: (params: GridValueGetterParams) => {
        let asset = params.row as Asset;
        return asset.type?.typeName === undefined ? t("unknown") : asset.type?.typeName;
      }
    },
    { field: assetStockNumber, headerName: t("field.stock_number"), flex: 2 },
    { field: assetUnitOfMeasure, headerName: t("field.unit_of_measure"), flex: 1 },
    {
      field: assetUnitValue,
      headerName: t("field.unit_value"),
      flex: 1,
      valueGetter: (params: GridValueGetterParams) => {
        return currencyFormatter.format(params.value);
      }
    },
    { field: balancePerCard, headerName: t("field.balance_per_card"), flex: 1 },
    { field: onHandCount, headerName: t("field.on_hand_count"), flex: 1 },
    {
      field: "totalValue",
      headerName: t("field.total_value"),
      flex: 1,
      valueGetter: (params: GridValueGetterParams) => {
        let item = params.row as InventoryReportItem;
        return currencyFormatter.format(item.unitValue * item.balancePerCard);
      }
    },
    {
      field: 'actions',
      type: 'actions',
      getActions: (params: GridRowParams) => [
        <GridActionsCellItem
          icon={<EditRounded/>}
          label={t("button.edit")}
          onClick={() => props.onItemSelected(params.row as InventoryReportItem)}/>
      ]
    }
  ]
  const { visibleColumns, onVisibilityChange } = useColumnVisibilityModel('inventoryReportItemColumns', columns);

  const onCheckedRowsChanged = (model: GridSelectionModel) => {
    setHasChecked(Array.from(model).length > 0)
    props.onCheckedRowsChanged(model);
  }

  return (
    <Box className={classes.dataGrid}>
      <DataGrid
        checkboxSelection
        components={{
          Toolbar: EditorGridToolbar
        }}
        componentsProps={{
          toolbar: {
            onAddAction: props.onAddAction,
            onRemoveAction: hasChecked ? props.onRemoveAction() : undefined,
          }
        }}
        columns={columns}
        rows={props.items}
        density={density}
        columnVisibilityModel={visibleColumns}
        getRowId={(row) => row.stockNumber}
        onSelectionModelChange={onCheckedRowsChanged}
        onStateChange={(v) => onDensityChanged(v.density.value)}
        onColumnVisibilityModelChange={(m) => onVisibilityChange(m)}/>
    </Box>
  )
}

export default InventoryReportItemDataGrid;