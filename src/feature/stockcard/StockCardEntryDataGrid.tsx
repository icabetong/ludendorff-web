import { makeStyles } from "@mui/styles";
import { Box, Theme } from "@mui/material";
import { getEditorDataGridTheme } from "../core/Core";
import { EditorDataGridProps, EditorGridToolbar } from "../../components/EditorComponent";
import { StockCardEntry } from "./StockCard";
import { DataGrid, GridSelectionModel, GridValueGetterParams } from "@mui/x-data-grid";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  balanceQuantity,
  balanceTotalPrice,
  date,
  issueOffice,
  issueQuantity,
  receiptQuantity,
  reference,
  requestQuantity
} from "../../shared/const";
import { formatDate } from "../../shared/utils";
import useDensity from "../shared/useDensity";
import useColumnVisibilityModel from "../shared/useColumnVisibilityModel";

const useStyles = makeStyles((theme: Theme) => ({
  dataGrid: {
    marginTop: theme.spacing(1),
    height: '100%',
    ...getEditorDataGridTheme(theme)
  }
}));

type StockCardEntryDataGridProps = EditorDataGridProps<StockCardEntry> & {
  entries: StockCardEntry[],
  onCheckedRowsChanged: (model: GridSelectionModel) => void,
}
const StockCardEntryDataGrid = (props: StockCardEntryDataGridProps) => {
  const { t } = useTranslation();
  const classes = useStyles();
  const { density, onDensityChanged } = useDensity('stockCardEditorDensity');
  const [hasChecked, setHasChecked] = useState(false);

  const columns = [
    {
      field: date,
      headerName: t("field.date"),
      flex: 1,
      valueGetter: (params: GridValueGetterParams) => {
        const formatted = formatDate(params.row.date);
        return t(formatted)
      }
    },
    { field: reference, headerName: t("field.reference"), flex: 1 },
    { field: receiptQuantity, headerName: t("field.receipt_quantity"), flex: 1 },
    { field: requestQuantity, headerName: t("field.requested_quantity"), flex: 1 },
    { field: issueQuantity, headerName: t("field.issue_quantity"), flex: 1 },
    { field: issueOffice, headerName: t("field.issue_office"), flex: 1 },
    { field: balanceQuantity, headerName: t("field.balance_quantity"), flex: 1 },
    { field: balanceTotalPrice, headerName: t("field.balance_total_price"), flex: 1 }
  ]
  const { visibleColumns, onVisibilityChange } = useColumnVisibilityModel('stockCardEntriesColumns', columns);

  const onCheckedRowsChanged = (model: GridSelectionModel) => {
    setHasChecked(Array.from(model).length > 0)
    props.onCheckedRowsChanged(model)
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
        rows={props.entries}
        density={density}
        columnVisibilityModel={visibleColumns}
        getRowId={(row) => row.stockCardEntryId}
        onSelectionModelChange={onCheckedRowsChanged}
        onStateChange={(v) => onDensityChanged(v.density.value)}
        onColumnVisibilityModelChange={(m) => onVisibilityChange(m)}/>
    </Box>
  )
}

export default StockCardEntryDataGrid;