import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Box } from "@mui/material";
import {
  DataGrid,
  GridLoadingOverlay,
  GridRowParams,
  GridSelectionModel,
  GridValueGetterParams
} from "@mui/x-data-grid";
import { IssuedReportItem } from "./IssuedReport";
import { getEditorDataGridTheme } from "../core/Core";
import { EditorDataGridProps, EditorGridToolbar } from "../../components/EditorComponent";
import useDensity from "../shared/hooks/useDensity";
import useColumnVisibilityModel from "../shared/hooks/useColumnVisibilityModel";
import { currencyFormatter, escapeRegExp } from "../../shared/utils";
import {
  assetDescription,
  assetStockNumber,
  assetUnitOfMeasure,
  quantityIssued,
  responsibilityCenter,
  unitCost,
} from "../../shared/const";

type IssuedReportItemDataGridProps = EditorDataGridProps<IssuedReportItem> & {
  items: IssuedReportItem[],
  onCheckedRowsChanged: (model: GridSelectionModel) => void,
}

const IssuedReportItemDataGrid = (props: IssuedReportItemDataGridProps) => {
  const { t } = useTranslation();
  const [hasChecked, setHasChecked] = useState(false);
  const [items, setItems] = useState<IssuedReportItem[]>(props.items);
  const { density, onDensityChanged } = useDensity('issuedEditorDensity');

  useEffect(() => {
    setItems(props.items);
  }, [props.items]);

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

  const onSearchChanged = (query: string) => {
    if (query.length > 0) {
      const searchRegEx = new RegExp(escapeRegExp(query));
      let currentItems = props.items.filter((row: IssuedReportItem) => {
        return Object.keys(row).some((field: any) => {
          const value = row[field as keyof IssuedReportItem];
          if (value) return searchRegEx.test(value.toString());
          else return false;
        });
      });

      setItems(currentItems);
    } else setItems(props.items);
  }

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
            onSearchChanged: onSearchChanged
          }
        }}
        loading={props.isLoading}
        columns={columns}
        rows={items}
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