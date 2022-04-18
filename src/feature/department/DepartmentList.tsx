import { useTranslation } from "react-i18next";
import { IconButton, List, ListItem, ListItemSecondaryAction, ListItemText, Tooltip } from "@mui/material";
import { DeleteOutlineRounded, DomainOutlined } from "@mui/icons-material";
import EmptyStateComponent from "../state/EmptyStates";
import { usePermissions } from "../auth/AuthProvider";
import { Department } from "./Department";

type DepartmentListProps = {
  departments: Department[],
  onItemSelect: (department: Department) => void,
  onRemoveInvoke?: (department: Department) => void,
}

const DepartmentList = (props: DepartmentListProps) => {
  const { t } = useTranslation();
  return (
    <>
      {props.departments.length > 0
        ? <List sx={{ minHeight: '100%' }}>
          {
            props.departments.map((department: Department) => {
              return (
                <DepartmentItem
                  key={department.departmentId}
                  department={department}
                  onItemSelect={props.onItemSelect}
                  onItemRemove={props.onRemoveInvoke}/>
              )
            })
          }
        </List>
        : <EmptyStateComponent
          icon={DomainOutlined}
          title={t("empty.department")}
          subtitle={t("empty.department_summary")}/>
      }
    </>
  );
}

type DepartmentItemProps = {
  department: Department,
  onItemSelect: (department: Department) => void,
  onItemRemove?: (department: Department) => void
}

const DepartmentItem = (props: DepartmentItemProps) => {
  const { t } = useTranslation();
  const { canDelete } = usePermissions();

  const deleteButton = (
    <IconButton
      edge="end"
      disabled={props.department.count > 0}
      aria-label={t("delete")}
      onClick={() => {
        props.onItemRemove && props.onItemRemove(props.department)
      }}>
      <DeleteOutlineRounded/>
    </IconButton>
  );

  return (
    <ListItem
      button
      key={props.department.departmentId}
      onClick={() => props.onItemSelect(props.department)}>
      <ListItemText
        primary={props.department.name}
        secondary={props.department.manager?.name}/>
      {canDelete &&
        <ListItemSecondaryAction>
          {props.department.count > 0
            ? <Tooltip title={<>{t("info.department_count_not_zero")}</>}>
              <span>{deleteButton}</span>
            </Tooltip>
            : <>{deleteButton}</>
          }
        </ListItemSecondaryAction>
      }
    </ListItem>
  )
}

export default DepartmentList;