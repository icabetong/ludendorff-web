import { useTranslation } from "react-i18next";
import { HitsProvided, connectHits } from "react-instantsearch-core";
import { Chip, Stack } from "@mui/material";
import {
  DataGrid,
  GridActionsCellItem,
  GridRenderCellParams,
  GridRowParams,
  GridSortModel,
  GridState,
  GridValueGetterParams
} from "@mui/x-data-grid";
import { DeleteOutlineRounded, VisibilityOffOutlined, VisibilityOutlined, InfoOutlined } from "@mui/icons-material";
import { User } from "./User";
import { UserDataGridEmptyState } from "./UserEmptyState";
import useColumnVisibilityModel from "../shared/hooks/useColumnVisibilityModel";
import useDensity from "../shared/hooks/useDensity";
import { DataGridProps } from "../shared/types/DataGridProps";
import { GridLinearProgress } from "../../components/datagrid/GridLinearProgress";
import { GridPaginationController } from "../../components/datagrid/GridPaginationController";
import { GridToolbar } from "../../components/datagrid/GridToolbar";
import { disabled, email, firstName, lastName, position } from "../../shared/const";

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
      sortable: false,
      valueGetter: (params: GridValueGetterParams) => {
        let user = params.row as User;
        return user.position === undefined ? t("unknown") : user.position;
      }
    },
    {
      field: "permissions",
      headerName: t("field.permissions"),
      flex: 1.5,
      sortable: false,
      renderCell: (params: GridRenderCellParams<number[]>) => {
        const getPermissionName = (permission: number): string => {
          switch(permission) {
            case 1:
              return "permission.read";
            case 2:
              return "permission.write";
            case 4:
              return "permission.delete";
            case 8:
              return "permission.administrative";
            default:
              return ""
          }
        }

        const userData = params.row as User;
        let permissions = userData.permissions;
        permissions = permissions.filter((p) => p === 1 || p === 2 || p === 4 || p === 8);
        permissions.sort((a, b) => a - b);
        return (
          <Stack direction="row" spacing={1}>
            {
              permissions.map((permission) => {
                return (
                  <Chip
                    label={t(getPermissionName(permission))}
                    size={density === 'compact' ? 'small' : 'medium'}/>
                )
              })
            }
          </Stack>
        )
      }
    },
    {
      field: disabled,
      headerName: t("field.status"),
      flex: 1,
      renderCell: (params: GridRenderCellParams<boolean>) => {
        return (
          <Chip
            color={params.value ? "warning" : "success"}
            label={t(params.value ? "info.user_status_disabled" : "info.user_status_normal")}
            icon={<InfoOutlined/>}
            size={density === "compact" ? 'small' : 'medium'}/>
        )
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
      rows={props.isSearching ? props.hits : props.items}
      density={density}
      columnVisibilityModel={visibleColumns}
      getRowId={(r) => r.userId}
      onSortModelChange={onHandleSortModelChange}
      onRowDoubleClick={props.onItemSelect}
      onStateChange={onHandleGridStateChange}
      onColumnVisibilityModelChange={onVisibilityChange}/>
  )
}

const UserDataGrid = connectHits<UserDataGridProps, User>(UserDataGridCore);
export default UserDataGrid;