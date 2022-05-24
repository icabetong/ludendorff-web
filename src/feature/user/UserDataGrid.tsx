import { useTranslation } from "react-i18next";
import { HitsProvided, connectHits } from "react-instantsearch-core";
import { DataGrid, GridActionsCellItem, GridRowParams, GridValueGetterParams } from "@mui/x-data-grid";
import { DeleteOutlineRounded, VisibilityOffOutlined, VisibilityOutlined } from "@mui/icons-material";
import { User } from "./User";
import { UserDataGridEmptyState } from "./UserEmptyState";
import useColumnVisibilityModel from "../shared/hooks/useColumnVisibilityModel";
import useDensity from "../shared/hooks/useDensity";
import { DataGridProps } from "../shared/types/DataGridProps";
import { GridLinearProgress } from "../../components/datagrid/GridLinearProgress";
import { GridPaginationController } from "../../components/datagrid/GridPaginationController";
import { GridToolbar } from "../../components/datagrid/GridToolbar";
import { email, firstName, lastName, position, userId } from "../../shared/const";

type UserDataGridProps = HitsProvided<User> & DataGridProps<User> & {
  onItemSelect: (params: GridRowParams) => void,
  onModificationInvoke: (user: User) => void,
  onRemoveInvoke: (user: User) => void,
}
const UserDataGridCore = (props: UserDataGridProps) => {
  const { t } = useTranslation();
  const { density, onDensityChanged } = useDensity('userDensity');

  const columns = [
    {
      field: userId,
      headerName: t("field.id"),
      sortable: false,
      hide: true
    },
    {
      field: lastName,
      headerName: t("field.last_name"),
      sortable: false,
      flex: 1
    },
    {
      field: firstName,
      headerName: t("field.first_name"),
      sortable: false,
      flex: 1
    },
    {
      field: email,
      headerName: t("field.email"),
      sortable: false,
      flex: 1
    },
    {
      field: position,
      headerName: t("field.position"),
      flex: 1,
      valueGetter: (params: GridValueGetterParams) => {
        let user = params.row as User;
        return user.position === undefined ? t("unknown") : user.position;
      }
    },
    {
      field: "actions",
      type: "actions",
      flex: 0.5,
      getActions: (params: GridRowParams) => {
        const user = params.row as User;
        return [
          <GridActionsCellItem
            showInMenu
            icon={<DeleteOutlineRounded/>}
            label={t("button.delete")}
            onClick={() => props.onRemoveInvoke(user)}/>,
          <GridActionsCellItem
            showInMenu
            icon={params.row.disabled ? <VisibilityOutlined/> : <VisibilityOffOutlined/>}
            label={params.row.disabled ? t("button.enable") : t("button.disable")}
            onClick={() => props.onModificationInvoke(user)}/>
        ]
      },
    },
  ]
  const { visibleColumns, onVisibilityChange } = useColumnVisibilityModel('userColumns', columns);

  const hideFooter = props.isSearching
  return (
    <DataGrid
      hideFooter={hideFooter}
      hideFooterPagination={hideFooter}
      components={{
        LoadingOverlay: GridLinearProgress,
        NoRowsOverlay: UserDataGridEmptyState,
        Toolbar: GridToolbar,
        Pagination: hideFooter ? null : GridPaginationController,
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
      rows={props.hits}
      density={density}
      columnVisibilityModel={visibleColumns}
      getRowId={(r) => r.userId}
      onSortModelChange={(m, d) => {
        props?.onSortMethodChanged && props?.onSortMethodChanged(m)
      }}
      onRowDoubleClick={props.onItemSelect}
      onStateChange={(v) => onDensityChanged(v.density.value)}
      onColumnVisibilityModelChange={(c) => onVisibilityChange(c)}/>
  )
}

const UserDataGrid = connectHits<UserDataGridProps, User>(UserDataGridCore);
export default UserDataGrid;