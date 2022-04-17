import GridEmptyRow from "../../components/datagrid/GridEmptyRows";
import { useTranslation } from "react-i18next";
import EmptyStateComponent from "../state/EmptyStates";
import { Inventory2Outlined } from "@mui/icons-material";

const InventoryReportEmptyState = () => {
  const { t } = useTranslation();

  return (
    <EmptyStateComponent
      icon={Inventory2Outlined}
      title={t("empty.inventory_header")}
      subtitle={t("empty.inventory_summary")}/>
  )
}

const InventoryReportDataGridEmptyState = () => {
  return (
    <GridEmptyRow>
      <InventoryReportEmptyState/>
    </GridEmptyRow>
  )
}

export { InventoryReportEmptyState, InventoryReportDataGridEmptyState }