import { useTranslation } from "react-i18next";
import { HitsProvided, connectHits } from "react-instantsearch-core";
import {
  DataGrid,
  GridActionsCellItem,
  GridRowParams,
  GridSortModel,
  GridState,
  GridValueGetterParams
} from "@mui/x-data-grid";
import {
  DeleteOutlineRounded,
  UnarchiveOutlined
} from "@mui/icons-material";
import { Asset } from "../asset/Asset";
import { AssetDataGridEmptyState } from "../asset/AssetEmptyState";
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
import { usePermissions } from "../auth/AuthProvider";
import { ArchivedDataGridEmptyState } from "./ArchivedEmptyState";

type ArchivedDataGridProps = HitsProvided<Asset> & DataGridProps<Asset> & {
  onScroll?: () => void,
  onItemSelect: (params: GridRowParams) => void,
  onArchive: (asset: Asset) => void,
  onRemove: (asset: Asset) => void,
}

const ArchivedDataGridCore = (props: ArchivedDataGridProps) => {
  const { t } = useTranslation();
  const { isAdmin } = usePermissions();
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
          icon={<UnarchiveOutlined/>}
          label={t("button.unarchive")}
          onClick={() => props.onArchive(params.row as Asset)}/>,
        // conditionally add the option to remove if it is admin
        ...(isAdmin ? [
          <GridActionsCellItem
            showInMenu
            icon={<DeleteOutlineRounded/>}
            label={t("button.delete")}
            onClick={() => props.onRemove(params.row as Asset)}/>,
        ] : [])
      ],
    }
  ];
  const { density, onDensityChanged } = useDensity('assetDensity');
  const { visibleColumns, onVisibilityChange } = useColumnVisibilityModel('assetColumns', columns);

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
        NoRowsOverlay: ArchivedDataGridEmptyState,
        Toolbar: GridToolbar,
        Pagination: hideFooter ? null : GridPaginationController
      }}
      componentsProps={{
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
      onSortModelChange={onHandleSortModelChange}
      onRowDoubleClick={props.onItemSelect}
      onStateChange={onHandleGridStateChange}
      onColumnVisibilityModelChange={onVisibilityChange}
    />
  )
}
const ArchivedDataGrid = connectHits<ArchivedDataGridProps, Asset>(ArchivedDataGridCore);
export default ArchivedDataGrid;