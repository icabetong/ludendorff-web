import { useTranslation } from "react-i18next";
import { Inventory2Outlined } from "@mui/icons-material";
import EmptyStateComponent from "../state/EmptyStates";
import { GridEmptyRows } from "../../components/datagrid/GridEmptyRows";

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
    <GridEmptyRows>
      <InventoryReportEmptyState/>
    </GridEmptyRows>
  )
}

export { InventoryReportEmptyState, InventoryReportDataGridEmptyState }