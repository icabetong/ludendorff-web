import { useTranslation } from "react-i18next";
import { List, ListItemButton, ListItemText } from "@mui/material";
import { AuditLog } from "./Audit";

type AuditLogListProps = {
  auditLogs: AuditLog<any>[],
  onItemSelect: (auditLog: AuditLog<any>) => void,
}
const AuditLogList = (props: AuditLogListProps) => {
  return (
    <List>
      {
        props.auditLogs.map((auditLog: AuditLog<any>) => {
          return (
            <AuditLogListItem
              key={auditLog.logEntryId}
              auditLog={auditLog}
              onItemSelect={props.onItemSelect}/>
          )
        })
      }
    </List>
  )
}

type AuditLogListItemProps = {
  auditLog: AuditLog<any>,
  onItemSelect: (auditLog: AuditLog<any>) => void,
}
const AuditLogListItem = (props: AuditLogListItemProps) => {
  const { t } = useTranslation();
  const onHandleItemSelect = () => props.onItemSelect(props.auditLog);

  return (
    <ListItemButton
      key={props.auditLog.logEntryId}
      onClick={onHandleItemSelect}>
      <ListItemText
        primary={props.auditLog.user.name}
        secondary={t("template.audit_log_operation_data", {
          operation: t(`operation.${props.auditLog.operation}`),
          type: t(`types.${props.auditLog.dataType}`),
          id: props.auditLog.identifier
        })}/>
    </ListItemButton>
  )
}

export default AuditLogList;