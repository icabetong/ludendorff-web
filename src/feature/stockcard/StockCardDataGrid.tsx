import { HitsProvided } from "react-instantsearch-core";
import { StockCard } from "./StockCard";
import { DataGridProps } from "../shared/types/DataGridProps";
import { DataGrid, GridActionsCellItem, GridRowParams, GridValueGetterParams } from "@mui/x-data-grid";
import { useTranslation } from "react-i18next";
import useDensity from "../shared/hooks/useDensity";
import { assetDescription, assetStockNumber, assetUnitOfMeasure, entityName, unitPrice } from "../../shared/const";
import { currencyFormatter } from "../../shared/utils";
import { DeleteOutlineRounded } from "@mui/icons-material";
import { ExcelIcon } from "../../components/CustomIcons";
import useColumnVisibilityModel from "../shared/hooks/useColumnVisibilityModel";
import GridLinearProgress from "../../components/datagrid/GridLinearProgress";
import GridToolbar from "../../components/datagrid/GridToolbar";
import { connectHits } from "react-instantsearch-dom";
import React from "react";
import { StockCardEmptyState } from "./StockCardEmptyState";
import { DataGridPaginationController } from "../../components/PaginationController";

type StockCardDataGridProps = HitsProvided<StockCard> & DataGridProps<StockCard> & {
  onItemSelect: (params: GridRowParams) => void,
  onExportSpreadsheet: (stockCard: StockCard) => void,
  onRemoveInvoke: (stockCard: StockCard) => void,
}
const StockCardDataGridCore = (props: StockCardDataGridProps) => {
  const { t } = useTranslation();
  const columns = [
    { field: entityName, headerName: t("field.entity_name"), flex: 1 },
    { field: assetStockNumber, headerName: t("field.stock_number"), flex: 1 },
    { field: assetDescription, headerName: t("field.asset_description"), flex: 2 },
    {
      field: unitPrice,
      headerName: t("field.unit_price"),
      flex: 0.5,
      valueGetter: (params: GridValueGetterParams) => currencyFormatter.format(params.value)
    },
    { field: assetUnitOfMeasure, headerName: t("field.unit_of_measure"), flex: 0.5 },
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

  const hideFooter = props.isSearching || (props.canForward && props.items.length > 0 && props.items.length <= props.size)
  return (
    <DataGrid
      hideFooter={hideFooter}
      hideFooterPagination={hideFooter}
      components={{
        LoadingOverlay: GridLinearProgress,
        NoRowsOverlay: StockCardEmptyState,
        Toolbar: GridToolbar,
        Pagination: props.canForward && props.items.length > 0 && props.items.length <= props.size ? DataGridPaginationController : null,
      }}
      componentsProps={{
        pagination: {
          size: props.size,
          canBack: props.canBack,
          canForward: props.canForward,
          onBackward: props.onBackward,
          onForward: props.onForward,
          onPageSizeChanged: props.onPageSizeChanged
        }
      }}
      sortingMode="server"
      sortModel={props.sortMethod}
      columns={columns}
      rows={props.isSearching ? props.hits : props.items}
      density={density}
      columnVisibilityModel={visibleColumns}
      getRowId={(r) => r.stockCardId}
      onSortModelChange={(m, d) => {
        props?.onSortMethodChanged && props?.onSortMethodChanged(m)
      }}
      onRowDoubleClick={props.onItemSelect}
      onStateChange={(v) => onDensityChanged(v.density.value)}
      onColumnVisibilityModelChange={(c) => onVisibilityChange(c)}/>
  )
}
const StockCardDataGrid = connectHits<StockCardDataGridProps, StockCard>(StockCardDataGridCore);
export default StockCardDataGrid;