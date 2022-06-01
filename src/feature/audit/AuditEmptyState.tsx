import { useTranslation } from "react-i18next";
import EmptyStateComponent from "../state/EmptyStates";
import { QueryStatsRounded } from "@mui/icons-material";
import { GridEmptyRows } from "../../components/datagrid/GridEmptyRows";

const AuditEmptyState = () => {
  const { t } = useTranslation();
  return (
    <EmptyStateComponent
      icon={QueryStatsRounded}
      title={t("empty.audit_logs_header")}
      subtitle={t("empty.audit_logs_summary")}/>
  )
}
const AuditDataGridEmptyState = () => {
  return (
    <GridEmptyRows>
      <AuditEmptyState/>
    </GridEmptyRows>
  )
}

export { AuditEmptyState, AuditDataGridEmptyState }