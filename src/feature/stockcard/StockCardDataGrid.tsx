import React from "react";
import { useTranslation } from "react-i18next";
import { HitsProvided, connectHits} from "react-instantsearch-core";
import {
  DataGrid,
  GridActionsCellItem,
  GridRowParams,
  GridSortModel,
  GridState,
  GridValueGetterParams
} from "@mui/x-data-grid";
import { DeleteOutlineRounded } from "@mui/icons-material";
import { StockCard } from "./StockCard";
import { StockCardDataGridEmptyState } from "./StockCardEmptyState";
import { DataGridProps } from "../shared/types/DataGridProps";
import useColumnVisibilityModel from "../shared/hooks/useColumnVisibilityModel";
import useDensity from "../shared/hooks/useDensity";
import { GridLinearProgress } from "../../components/datagrid/GridLinearProgress";
import { GridPaginationController } from "../../components/datagrid/GridPaginationController";
import { GridToolbar } from "../../components/datagrid/GridToolbar";
import { ExcelIcon } from "../../components/CustomIcons";
import { assetDescription, assetStockNumber, assetUnitOfMeasure, entityName, unitPrice } from "../../shared/const";
import { currencyFormatter } from "../../shared/utils";

type StockCardDataGridProps = HitsProvided<StockCard> & DataGridProps<StockCard> & {
  onItemSelect: (params: GridRowParams) => void,
  onExportSpreadsheet: (stockCard: StockCard) => void,
  onRemoveInvoke: (stockCard: StockCard) => void,
}
const StockCardDataGridCore = (props: StockCardDataGridProps) => {
  const { t } = useTranslation();
  const columns = [
    {
      field: entityName,
      headerName: t("field.entity_name"),
      sortable: false,
      flex: 1 },
    {
      field: assetStockNumber,
      headerName: t("field.stock_number"),
      sortable: false,
      flex: 1 },
    {
      field: assetDescription,
      headerName: t("field.asset_description"),
      sortable: false,
      flex: 2
    },
    {
      field: unitPrice,
      headerName: t("field.unit_price"),
      sortable: false,
      flex: 0.5,
      valueGetter: (params: GridValueGetterParams) => currencyFormatter.format(params.value)
    },
    {
      field: assetUnitOfMeasure,
      headerName: t("field.unit_of_measure"),
      sortable: false,
      flex: 0.5
    },
    {
      field: "actions",
      type: "actions",
      flex: 0.5,
      getActions: (params: GridRowParams) => [
        <GridActionsCellItem
          icon={<DeleteOutlineRounded/>}
          label={t("button.delete")}
          onClick={() => props.onRemoveInvoke(params.row as StockCard)}/>,
        <GridActionsCellItem
          showInMenu
          icon={<ExcelIcon/>}
          label={t("button.export_spreadsheet")}
          onClick={() => props.onExportSpreadsheet(params.row as StockCard)}/>
      ],
    }
  ];
  const { density, onDensityChanged } = useDensity('stockCardDensity');
  const { visibleColumns, onVisibilityChange } = useColumnVisibilityModel('stockCardColumns', columns);

  const onHandleSortModelChange = (model: GridSortModel) => props.onSortMethodChanged && props.onSortMethodChanged(model);
  const onHandleGridStateChange = (state: GridState) => onDensityChanged(state.density.value);

  const hideFooter = props.isSearching || props.items.length === 0
  return (
    <DataGrid
      disableColumnFilter
      hideFooter={hideFooter}
      hideFooterPagination={hideFooter}
      components={{
        LoadingOverlay: GridLinearProgress,
        NoRowsOverlay: StockCardDataGridEmptyState,
        Toolbar: GridToolbar,
        Pagination: hideFooter ? null : GridPaginationController
      }}
      componentsProps={{
        pagination: {
          canBack: props.canBack,
          canForward: props.canForward,
          onBackward: props.onBackward,
          onForward: props.onForward
        }
      }}
      sortingMode="server"
      sortModel={props.sortMethod}
      columns={columns}
      rows={props.isSearching ? props.hits : props.items}
      density={density}
      columnVisibilityModel={visibleColumns}
      getRowId={(r) => r.stockCardId}
      onSortModelChange={onHandleSortModelChange}
      onRowDoubleClick={props.onItemSelect}
      onStateChange={onHandleGridStateChange}
      onColumnVisibilityModelChange={onVisibilityChange}/>
  )
}
const StockCardDataGrid = connectHits<StockCardDataGridProps, StockCard>(StockCardDataGridCore);
export default StockCardDataGrid;