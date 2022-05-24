import { useTranslation } from "react-i18next";
import EmptyStateComponent from "../state/EmptyStates";
import { DevicesOtherRounded } from "@mui/icons-material";
import { GridEmptyRows } from "../../components/datagrid/GridEmptyRows";

const AssetEmptyState = () => {
  const { t } = useTranslation();

  return (
    <EmptyStateComponent
      icon={DevicesOtherRounded}
      title={t("empty.asset_header")}
      subtitle={t("empty.asset_summary")}/>
  );
}

const AssetDataGridEmptyState = () => {
  return (
    <GridEmptyRows>
      <AssetEmptyState/>
    </GridEmptyRows>
  )
}

export { AssetEmptyState, AssetDataGridEmptyState }