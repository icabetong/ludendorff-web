import { useTranslation } from "react-i18next";
import { Inventory2Outlined } from "@mui/icons-material";
import EmptyStateComponent from "../state/EmptyStates";
import { GridEmptyRow } from "../../components";

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