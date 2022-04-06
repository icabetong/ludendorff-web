import { InventoryReportItem } from "./InventoryReport";
import { DataGrid, GridRowParams, GridSelectionModel, GridValueGetterParams, GridActionsCellItem } from "@mui/x-data-grid";
import { assetStockNumber, article, assetDescription, assetType, assetUnitOfMeasure, balancePerCard, onHandCount, remarks } from "../../shared/const";
import { useTranslation } from "react-i18next";
import { makeStyles } from "@mui/styles";
import { Box, Theme } from "@mui/material";
import { getEditorDataGridTheme } from "../core/Core";
import { EditorDataGridProps, EditorGridToolbar } from "../../components/EditorComponent";
import { useState } from "react";
import { Asset } from "../asset/Asset";
import { usePreferences } from "../settings/Preference";

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
  const userPreferences = usePreferences();
  const [hasChecked, setHasChecked] = useState(false);

  const columns = [
    { field: assetStockNumber, headerName: t("field.stock_number"), flex: 1 },
    { field: article, headerName: t("field.article"), flex: 1 },
    { field: assetDescription, headerName: t("field.asset_description"), flex: 1 },
    {
      field: assetType,
      headerName: t("field.type"),
      flex: 1,
      valueGetter: (params: GridValueGetterParams) => {
        let asset = params.row as Asset;
        return asset.type?.typeName === undefined ? t("unknown") : asset.type?.typeName;
      }
    },
    { field: assetUnitOfMeasure, headerName: t("field.unit_of_measure"), flex: 1 },
    { field: balancePerCard, headerName: t("field.balance_per_card"), flex: 1 },
    { field: onHandCount, headerName: t("field.on_hand_count"), flex: 1 },
    { field: remarks, headerName: t("field.remarks"), flex: 1 },
  ]

  const onCheckedRowsChanged = (model: GridSelectionModel) => {
    setHasChecked(Array.from(model).length > 0)
    props.onCheckedRowsChanged(model);
  }

  return (
    <Box
      className={classes.dataGrid}>
      <DataGrid
        checkboxSelection
        components={{
          Toolbar: EditorGridToolbar
        }}
        componentsProps={{
          toolbar: {
            onAddAction: props.onAddAction,
            onRemoveAction: hasChecked ? props.onRemoveAction : undefined,
          }
        }}
        columns={columns}
        rows={props.items}
        density={userPreferences.density}
        getRowId={(row) => row.stockNumber}
        onSelectionModelChange={onCheckedRowsChanged}/>
    </Box>
  )
}

export default InventoryReportItemDataGrid;