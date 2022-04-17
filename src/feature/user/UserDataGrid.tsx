import { HitsProvided } from "react-instantsearch-core";
import { User } from "./User";
import { DataGrid, GridActionsCellItem, GridRowParams, GridValueGetterParams } from "@mui/x-data-grid";
import { useTranslation } from "react-i18next";
import useDensity from "../shared/hooks/useDensity";
import { department, email, firstName, lastName, position, userId } from "../../shared/const";
import { DeleteOutlineRounded, DomainRounded, VisibilityOffOutlined, VisibilityOutlined } from "@mui/icons-material";
import useColumnVisibilityModel from "../shared/hooks/useColumnVisibilityModel";
import GridLinearProgress from "../../components/datagrid/GridLinearProgress";
import GridToolbar from "../../components/datagrid/GridToolbar";
import { Button } from "@mui/material";
import { connectHits } from "react-instantsearch-dom";
import { UserDataGridEmptyState } from "./UserEmptyState";
import { DataGridPaginationController } from "../../components/PaginationController";
import { DataGridProps } from "../shared/types/DataGridProps";

type UserDataGridProps = HitsProvided<User> & DataGridProps<User> & {
  onItemSelect: (params: GridRowParams) => void,
  onModificationInvoke: (user: User) => void,
  onRemoveInvoke: (user: User) => void,
  onDepartmentInvoke: () => void,
}
const UserDataGridCore = (props: UserDataGridProps) => {
  const { t } = useTranslation();
  const { density, onDensityChanged } = useDensity('userDensity');

  const columns = [
    { field: userId, headerName: t("field.id"), hide: true },
    { field: lastName, headerName: t("field.last_name"), flex: 1 },
    { field: firstName, headerName: t("field.first_name"), flex: 1 },
    { field: email, headerName: t("field.email"), flex: 1 },
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
      field: department,
      headerName: t("field.department"),
      flex: 1,
      valueGetter: (params: GridValueGetterParams) => {
        let user = params.row as User;
        return user.department?.name === undefined ? t("unknown") : user.department?.name;
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

  return (
    <DataGrid
      hideFooterPagination={props.isSearching}
      components={{
        LoadingOverlay: GridLinearProgress,
        NoRowsOverlay: UserDataGridEmptyState,
        Toolbar: GridToolbar,
        Pagination: props.canForward && props.items.length > 0 && props.items.length === props.size ? DataGridPaginationController : null,
      }}
      componentsProps={{
        toolbar: {
          destinations: [
            <Button
              key="departments"
              color="primary"
              size="small"
              startIcon={<DomainRounded fontSize="small"/>}
              onClick={props.onDepartmentInvoke}>
              {t("navigation.departments")}
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