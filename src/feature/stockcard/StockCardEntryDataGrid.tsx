import { makeStyles } from "@mui/styles";
import { Box, Theme } from "@mui/material";
import { getEditorDataGridTheme } from "../core/Core";
import { EditorDataGridProps, EditorGridToolbar } from "../../components/EditorComponent";
import { StockCard, StockCardEntry } from "./StockCard";
import {
  DataGrid,
  GridRowParams,
  GridSelectionModel,
  GridValueGetterParams,
  GridLoadingOverlay,
  GridActionsCellItem
} from "@mui/x-data-grid";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  balanceQuantity,
  balanceTotalPrice,
  date,
  issueOffice,
  issueQuantity,
  receivedQuantity,
  reference,
  requestedQuantity
} from "../../shared/const";
import { formatDate } from "../../shared/utils";
import useDensity from "../shared/hooks/useDensity";
import useColumnVisibilityModel from "../shared/hooks/useColumnVisibilityModel";
import { QueryStatsRounded } from "@mui/icons-material";
import { Balances, Entry } from "../shared/types/Balances";
import { currencyFormatter } from "../../shared/utils";

const useStyles = makeStyles((theme: Theme) => ({
  dataGrid: {
    marginTop: theme.spacing(1),
    height: '100%',
    ...getEditorDataGridTheme(theme)
  }
}));

type StockCardEntryDataGridProps = EditorDataGridProps<StockCardEntry> & {
  entries: StockCardEntry[],
  balances: Balances,
  stockCard?: StockCard,
  onSourceSelect: (entry: StockCardEntry) => void,
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
      type: 'dateTime',
      flex: 1,
      valueGetter: (params: GridValueGetterParams) => {
        const formatted = formatDate(params.row.date);
        return t(formatted)
      }
    },
    {
      field: reference,
      headerName: t("field.reference"),
      flex: 1,
      valueGetter: (params: GridValueGetterParams) => {
        return params.row.reference ? params.row.reference : t("unknown")
      }
    },
    { field: receivedQuantity, headerName: t("field.received_quantity"), flex: 1 },
    { field: requestedQuantity, headerName: t("field.requested_quantity"), flex: 1 },
    { field: issueQuantity, headerName: t("field.issue_quantity"), flex: 1 },
    { field: issueOffice, headerName: t("field.issue_office"), flex: 1 },
    {
      field: balanceQuantity,
      headerName: t("field.balance_quantity"),
      flex: 1,
      valueGetter: (params: GridValueGetterParams) => {
        let entry: Entry = props.balances[params.row.inventoryReportSourceId];
        if (!entry) return 0;

        let quantityEntry = entry.entries[params.row.stockCardEntryId];
        return quantityEntry ? quantityEntry : 0;
      }
    },
    {
      field: balanceTotalPrice,
      headerName: t("field.balance_total_price"),
      flex: 1,
      valueGetter: (params: GridValueGetterParams) => {
        if (!props.stockCard?.stockNumber) return 0;
        let unitPrice = props.stockCard ? props.stockCard.unitPrice : 0;

        let entry: Entry = props.balances[params.row.inventoryReportSourceId];
        if (!entry) return 0;

        let quantityEntry = entry.entries[params.row.stockCardEntryId];
        return currencyFormatter.format(unitPrice * quantityEntry);
      }
    },
    {
      field: "actions",
      headerName: t("actions"),
      type: "actions",
      getActions: (params: GridRowParams) => [
        <GridActionsCellItem
          showInMenu
          icon={<QueryStatsRounded/>}
          label={t("button.set_quantity_source")}
          onClick={() => props.onSourceSelect(params.row as StockCardEntry)}/>
      ]
    }
  ]
  const { visibleColumns, onVisibilityChange } = useColumnVisibilityModel('stockCardEntriesColumns', columns);

  const onRowSelected = (params: GridRowParams) => {
    props.onItemSelected(params.row as StockCardEntry);
  }

  const onCheckedRowsChanged = (model: GridSelectionModel) => {
    setHasChecked(Array.from(model).length > 0)
    props.onCheckedRowsChanged(model)
  }

  return (
    <Box className={classes.dataGrid}>
      <DataGrid
        disableSelectionOnClick
        checkboxSelection
        components={{
          Toolbar: EditorGridToolbar,
          LoadingOverlay: GridLoadingOverlay
        }}
        componentsProps={{
          toolbar: {
            onRemoveAction: hasChecked ? props.onRemoveAction : undefined
          }
        }}
        loading={props.isLoading}
        columns={columns}
        rows={props.entries}
        density={density}
        columnVisibilityModel={visibleColumns}
        getRowId={(row) => row.stockCardEntryId}
        onRowDoubleClick={onRowSelected}
        onSelectionModelChange={onCheckedRowsChanged}
        onStateChange={(v) => onDensityChanged(v.density.value)}
        onColumnVisibilityModelChange={(m) => onVisibilityChange(m)}/>
    </Box>
  )
}

export default StockCardEntryDataGrid;