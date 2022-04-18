import { useTranslation } from "react-i18next";
import EmptyStateComponent from "../state/EmptyStates";
import { DomainOutlined } from "@mui/icons-material";
import GridEmptyRow from "../../components/datagrid/GridEmptyRows";

const DepartmentEmptyState = () => {
  const { t } = useTranslation();
  return (
    <EmptyStateComponent
      icon={DomainOutlined}
      title={t("empty.department")}
      subtitle={t("empty.department_summary")}/>
  )
}

const DepartmentDataGridEmptyState = () => {
  return (
    <GridEmptyRow>
      <DepartmentEmptyState/>
    </GridEmptyRow>
  )
}

export { DepartmentEmptyState, DepartmentDataGridEmptyState }