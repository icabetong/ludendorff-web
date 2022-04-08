import { makeStyles } from "@mui/styles";
import { Box, Theme } from "@mui/material";
import { getEditorDataGridTheme } from "../core/Core";
import { EditorDataGridProps, EditorGridToolbar } from "../../components/EditorComponent";
import { IssuedReportItem } from "./IssuedReport";
import { DataGrid, GridSelectionModel } from "@mui/x-data-grid";
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
import useDensity from "../shared/useDensity";
import useColumnVisibilityModel from "../shared/useColumnVisibilityModel";

const useStyles = makeStyles((theme: Theme) => ({
  dataGrid: {
    marginTop: theme.spacing(1),
    height: '100%',
    ...getEditorDataGridTheme(theme)
  }
}));

type IssuedReportItemDataGridProps = EditorDataGridProps<IssuedReportItem> & {
  items: IssuedReportItem[],
  onCheckedRowsChanged: (model: GridSelectionModel) => void,
}

const IssuedReportItemDataGrid = (props: IssuedReportItemDataGridProps) => {
  const { t } = useTranslation();
  const classes = useStyles();
  const { density, onDensityChanged } = useDensity('issuedEditorDensity');
  const [hasChecked, setHasChecked] = useState(false);

  const columns = [
    { field: assetStockNumber, headerName: t("field.stock_number"), flex: 1 },
    { field: assetDescription, headerName: t("field.asset_description"), flex: 1 },
    { field: assetUnitOfMeasure, headerName: t("field.unit_of_measure"), flex: 1 },
    { field: quantityIssued, headerName: t("field.quantity_issued"), flex: 1 },
    { field: unitCost, headerName: t("field.unit_cost"), flex: 1 },
    { field: responsibilityCenter, headerName: t("field.responsibility_center"), flex: 1 },
  ];
  const { visibleColumns, onVisibilityChange } = useColumnVisibilityModel('issuedReportItemColumns', columns);

  const onCheckedRowChanged = (model: GridSelectionModel) => {
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
            onRemoveAction: hasChecked ? props.onRemoveAction : undefined
          }
        }}
        columns={columns}
        rows={props.items}
        density={density}
        columnVisibilityModel={visibleColumns}
        getRowId={(row) => row.stockNumber}
        onSelectionModelChange={onCheckedRowChanged}
        onStateChange={(v) => onDensityChanged(v.density.value)}
        onColumnVisibilityModelChange={(m) => onVisibilityChange(m)}/>
    </Box>
  )
}

export default IssuedReportItemDataGrid;