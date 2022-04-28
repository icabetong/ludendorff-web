import { Box } from "@mui/material";
import { getEditorDataGridTheme } from "../core/Core";
import { EditorDataGridProps, EditorGridToolbar } from "../../components/EditorComponent";
import { IssuedReportItem } from "./IssuedReport";
import {
  DataGrid,
  GridLoadingOverlay,
  GridRowParams,
  GridSelectionModel,
  GridValueGetterParams
} from "@mui/x-data-grid";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import {
  assetDescription,
  assetStockNumber,
  assetUnitOfMeasure,
  quantityIssued,
  responsibilityCenter,
  unitCost,
} from "../../shared/const";
import useDensity from "../shared/hooks/useDensity";
import useColumnVisibilityModel from "../shared/hooks/useColumnVisibilityModel";
import { currencyFormatter } from "../../shared/utils";

type IssuedReportItemDataGridProps = EditorDataGridProps<IssuedReportItem> & {
  items: IssuedReportItem[],
  onCheckedRowsChanged: (model: GridSelectionModel) => void,
}

const IssuedReportItemDataGrid = (props: IssuedReportItemDataGridProps) => {
  const { t } = useTranslation();
  const { density, onDensityChanged } = useDensity('issuedEditorDensity');
  const [hasChecked, setHasChecked] = useState(false);

  const columns = [
    { field: assetStockNumber, headerName: t("field.stock_number"), flex: 1 },
    { field: assetDescription, headerName: t("field.asset_description"), flex: 3 },
    { field: assetUnitOfMeasure, headerName: t("field.unit_of_measure"), flex: 1 },
    { field: quantityIssued, headerName: t("field.quantity_issued"), flex: 1 },
    {
      field: unitCost,
      headerName: t("field.unit_cost"),
      flex: 1,
      valueGetter: (params: GridValueGetterParams) => currencyFormatter.format(params.value)
    },
    { field: responsibilityCenter, headerName: t("field.responsibility_center"), flex: 1, },
    {
      field: "amount",
      headerName: t("field.amount"),
      flex: 1,
      valueGetter: (params: GridValueGetterParams) => {
        let item = params.row as IssuedReportItem;
        return currencyFormatter.format(item.quantityIssued * item.unitCost)
      }
    },
  ];
  const { visibleColumns, onVisibilityChange } = useColumnVisibilityModel('issuedReportItemColumns', columns);

  const onRowSelected = (params: GridRowParams) => {
    props.onItemSelected(params.row as IssuedReportItem)
  }

  const onCheckedRowChanged = (model: GridSelectionModel) => {
    setHasChecked(Array.from(model).length > 0)
    props.onCheckedRowsChanged(model);
  }

  return (
    <Box sx={(theme) => ({ marginTop: theme.spacing(1), height: '100%', ...getEditorDataGridTheme(theme)})}>
      <DataGrid
        checkboxSelection
        disableSelectionOnClick
        components={{
          Toolbar: EditorGridToolbar,
          LoadingOverlay: GridLoadingOverlay
        }}
        componentsProps={{
          toolbar: {
            onAddAction: props.onAddAction,
            onRemoveAction: hasChecked ? props.onRemoveAction : undefined,
          }
        }}
        loading={props.isLoading}
        columns={columns}
        rows={props.items}
        density={density}
        columnVisibilityModel={visibleColumns}
        getRowId={(row) => row.issuedReportItemId}
        onRowDoubleClick={onRowSelected}
        onSelectionModelChange={onCheckedRowChanged}
        onStateChange={(v) => onDensityChanged(v.density.value)}
        onColumnVisibilityModelChange={(m) => onVisibilityChange(m)}/>
    </Box>
  )
}

export default IssuedReportItemDataGrid;