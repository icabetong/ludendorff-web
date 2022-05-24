import { useTranslation } from "react-i18next";
import { HitsProvided, connectHits } from "react-instantsearch-core";
import { Button } from "@mui/material";
import { DataGrid, GridActionsCellItem, GridRowParams, GridValueGetterParams } from "@mui/x-data-grid";
import { DeleteOutlineRounded, CategoryRounded, UploadRounded } from "@mui/icons-material";
import { Asset } from "./Asset";
import { AssetDataGridEmptyState } from "./AssetEmptyState";
import useColumnVisibilityModel from "../shared/hooks/useColumnVisibilityModel";
import useDensity from "../shared/hooks/useDensity";
import { DataGridProps } from "../shared/types/DataGridProps";
import { GridLinearProgress } from "../../components/datagrid/GridLinearProgress";
import { GridPaginationController } from "../../components/datagrid/GridPaginationController";
import { GridToolbar } from "../../components/datagrid/GridToolbar";
import {
  assetSubcategory,
  assetDescription, assetRemarks,
  assetStockNumber,
  assetCategory,
  assetUnitOfMeasure, assetUnitValue
} from "../../shared/const";
import { currencyFormatter } from "../../shared/utils";

type AssetDataGridProps = HitsProvided<Asset> & DataGridProps<Asset> & {
  onScroll?: () => void,
  onItemSelect: (params: GridRowParams) => void,
  onRemoveInvoke: (asset: Asset) => void,
  onTypesInvoke: () => void,
  onImportsInvoke: () => void,
}

const AssetDataGridCore = (props: AssetDataGridProps) => {
  const { t } = useTranslation();
  const columns = [
    {
      field: assetStockNumber,
      headerName: t("field.stock_number"),
      sortable: false,
      flex: 1
    },
    {
      field: assetDescription,
      headerName: t("field.asset_description"),
      sortable: false,
      flex: 1.5
    },
    {
      field: assetCategory,
      headerName: t("field.category"),
      sortable: false,
      flex: 1,
      valueGetter: (params: GridValueGetterParams) => {
        let asset = params.row as Asset;
        return asset.category?.categoryName === undefined ? t("unknown") : asset.category?.categoryName;
      }
    },
    {
      field: assetSubcategory,
      headerName: t("field.subcategory"),
      sortable: false,
      flex: 1,
    },
    {
      field: assetUnitOfMeasure,
      headerName: t("field.unit_of_measure"),
      sortable: false,
      flex: 1
    },
    {
      field: assetUnitValue,
      headerName: t("field.unit_value"),
      sortable: false,
      flex: 1,
      valueGetter: (params: GridValueGetterParams) => currencyFormatter.format(params.value)
    },
    {
      field: assetRemarks,
      headerName: t("field.remarks"),
      sortable: false,
      flex: 1
    },
    {
      field: "actions",
      type: "actions",
      sortable: false,
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

  const hideFooter = props.isSearching
  return (
    <DataGrid
      hideFooter={hideFooter}
      hideFooterPagination={hideFooter}
      components={{
        LoadingOverlay: GridLinearProgress,
        NoRowsOverlay: AssetDataGridEmptyState,
        Toolbar: GridToolbar,
        Pagination: hideFooter ? null : GridPaginationController
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
          canBack: props.canBack,
          canForward: props.canForward,
          onBackward: props.onBackward,
          onForward: props.onForward,
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