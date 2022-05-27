import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Box } from "@mui/material";
import {
  DataGrid,
  GridRowParams,
  GridSelectionModel,
  GridValueGetterParams,
  GridLoadingOverlay,
  GridState,
} from "@mui/x-data-grid";
import { InventoryReportItem } from "./InventoryReport";
import { Asset } from "../asset/Asset";
import { getEditorDataGridTheme } from "../core/Core";
import useDensity from "../shared/hooks/useDensity";
import { EditorDataGridProps, EditorGridToolbar } from "../../components/editor/EditorGridToolbar";
import useColumnVisibilityModel from "../shared/hooks/useColumnVisibilityModel";
import { currencyFormatter, escapeRegExp } from "../../shared/utils";
import {
  article,
  assetDescription,
  assetStockNumber,
  assetCategory,
  assetUnitOfMeasure,
  assetUnitValue,
  balancePerCard,
  onHandCount
} from "../../shared/const";

type InventoryReportItemDataGridProps = EditorDataGridProps<InventoryReportItem> & {
  items: InventoryReportItem[],
  onCheckedRowsChanged: (model: GridSelectionModel) => void,
}

const InventoryReportItemDataGrid = (props: InventoryReportItemDataGridProps) => {
  const { t } = useTranslation();
  const [hasChecked, setHasChecked] = useState(false);
  const [items, setItems] = useState<InventoryReportItem[]>(props.items);
  const { density, onDensityChanged } = useDensity('inventoryEditorDensity');

  useEffect(() => {
    setItems(props.items);
  }, [props.items]);

  const columns = [
    { field: article, headerName: t("field.article"), flex: 1 },
    { field: assetDescription, headerName: t("field.asset_description"), flex: 3 },
    {
      field: assetCategory,
      headerName: t("field.category"),
      flex: 1,
      valueGetter: (params: GridValueGetterParams) => {
        let asset = params.row as Asset;
        return asset.category?.categoryName === undefined ? t("unknown") : asset.category?.categoryName;
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
  ]
  const { visibleColumns, onVisibilityChange } = useColumnVisibilityModel('inventoryReportItemColumns', columns);

  const onSearchChanged = (query: string) => {
    if (query.length > 0) {
      const searchRegEx = new RegExp(escapeRegExp(query));
      let currentItems = props.items.filter((row: InventoryReportItem) => {
        return Object.keys(row).some((field: any) => {
          const value = row[field as keyof InventoryReportItem];
          if (value) return searchRegEx.test(value.toString());
          else return false;
        });
      })

      setItems(currentItems);
    } else setItems(props.items);
  }

  const onRowSelected = (params: GridRowParams) => {
    props.onItemSelected(params.row as InventoryReportItem)
  }

  const onCheckedRowsChanged = (model: GridSelectionModel) => {
    setHasChecked(Array.from(model).length > 0)
    props.onCheckedRowsChanged(model);
  }

  const onHandleGridStateChange = (state: GridState) => onDensityChanged(state.density.value);

  return (
    <Box sx={(theme) => ({ marginTop: theme.spacing(1), height: '100%', ...getEditorDataGridTheme(theme)})}>
      <DataGrid
        checkboxSelection
        disableSelectionOnClick
        components={{
          LoadingOverlay: GridLoadingOverlay,
          Toolbar: EditorGridToolbar
        }}
        componentsProps={{
          toolbar: {
            onAddAction: props.onAddAction,
            onRemoveAction: hasChecked ? props.onRemoveAction : undefined,
            onSearchChanged: onSearchChanged
          }
        }}
        loading={props.isLoading}
        columns={columns}
        rows={items}
        density={density}
        columnVisibilityModel={visibleColumns}
        getRowId={(row) => row.stockNumber}
        onRowDoubleClick={onRowSelected}
        onSelectionModelChange={onCheckedRowsChanged}
        onStateChange={onHandleGridStateChange}
        onColumnVisibilityModelChange={onVisibilityChange}/>
    </Box>
  )
}

export default InventoryReportItemDataGrid;