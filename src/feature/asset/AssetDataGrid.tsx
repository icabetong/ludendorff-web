import { useTranslation } from "react-i18next";
import { Asset } from "./Asset";
import { DataGridProps } from "../shared/types/DataGridProps";
import { HitsProvided } from "react-instantsearch-core";
import { DataGrid, GridActionsCellItem, GridRowParams, GridValueGetterParams } from "@mui/x-data-grid";
import { connectHits } from "react-instantsearch-dom";
import GridLinearProgress from "../../components/datagrid/GridLinearProgress";
import GridToolbar from "../../components/datagrid/GridToolbar";
import { Button } from "@mui/material";
import { DeleteOutlineRounded, CategoryRounded, UploadRounded } from "@mui/icons-material";
import { AssetDataGridEmptyState } from "./AssetEmptyState";
import {
  assetSubcategory,
  assetDescription, assetRemarks,
  assetStockNumber,
  assetCategory,
  assetUnitOfMeasure, assetUnitValue
} from "../../shared/const";
import { currencyFormatter } from "../../shared/utils";
import useColumnVisibilityModel from "../shared/hooks/useColumnVisibilityModel";
import useDensity from "../shared/hooks/useDensity";
import { DataGridPaginationController } from "../../components/PaginationController";

type AssetDataGridProps = HitsProvided<Asset> & DataGridProps<Asset> & {
  onItemSelect: (params: GridRowParams) => void,
  onRemoveInvoke: (asset: Asset) => void,
  onTypesInvoke: () => void,
  onImportsInvoke: () => void,
}

const AssetDataGridCore = (props: AssetDataGridProps) => {
  const { t } = useTranslation();
  const columns = [
    { field: assetStockNumber, headerName: t("field.stock_number"), flex: 1 },
    { field: assetDescription, headerName: t("field.asset_description"), flex: 1.5 },
    {
      field: assetCategory,
      headerName: t("field.category"),
      flex: 1,
      valueGetter: (params: GridValueGetterParams) => {
        let asset = params.row as Asset;
        return asset.category?.categoryName === undefined ? t("unknown") : asset.category?.categoryName;
      }
    },
    {
      field: assetSubcategory,
      headerName: t("field.subcategory"),
      flex: 1,
    },
    {
      field: assetUnitOfMeasure,
      headerName: t("field.unit_of_measure"),
      flex: 1
    },
    {
      field: assetUnitValue,
      headerName: t("field.unit_value"),
      flex: 1,
      valueGetter: (params: GridValueGetterParams) => currencyFormatter.format(params.value)
    },
    {
      field: assetRemarks,
      headerName: t("field.remarks"),
      flex: 1
    },
    {
      field: "actions",
      type: "actions",
      flex: 0.5,
      getActions: (params: GridRowParams) => [
        <GridActionsCellItem
          icon={<DeleteOutlineRounded/>}
          label={t("button.delete")}
          onClick={() => props.onRemoveInvoke(params.row as Asset)}/>
      ],
    }
  ];
  const { density, onDensityChanged } = useDensity('assetDensity');
  const { visibleColumns, onVisibilityChange } = useColumnVisibilityModel('assetColumns', columns);

  const hideFooter = props.isSearching || (props.canForward && props.items.length > 0 && props.items.length <= props.size)
  return (
    <DataGrid
      hideFooter={hideFooter}
      hideFooterPagination={hideFooter}
      components={{
        LoadingOverlay: GridLinearProgress,
        NoRowsOverlay: AssetDataGridEmptyState,
        Toolbar: GridToolbar,
        Pagination: props.canForward && props.items.length > 0 && props.items.length <= props.size ? DataGridPaginationController : null,
      }}
      componentsProps={{
        toolbar: {
          destinations: [
            <Button
              key="types"
              color="primary"
              size="small"
              startIcon={<CategoryRounded fontSize="small"/>}
              onClick={props.onTypesInvoke}>
              {t("navigation.categories")}
            </Button>,
            <Button
              key="imports"
              color="primary"
              size="small"
              startIcon={<UploadRounded/>}
              onClick={props.onImportsInvoke}>
              {t("button.import")}
            </Button>
          ]
        },
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
      columns={columns}
      rows={props.isSearching ? props.hits : props.items}
      loading={props.isLoading}
      density={density}
      sortModel={props.sortMethod}
      columnVisibilityModel={visibleColumns}
      getRowId={(r) => r.stockNumber}
      onSortModelChange={(m, d) => {
        props?.onSortMethodChanged && props?.onSortMethodChanged(m)
      }}
      onRowDoubleClick={props.onItemSelect}
      onStateChange={(v) => onDensityChanged(v.density.value)}
      onColumnVisibilityModelChange={(c) => onVisibilityChange(c)}
    />
  )
}
const AssetDataGrid = connectHits<AssetDataGridProps, Asset>(AssetDataGridCore);
export default AssetDataGrid;