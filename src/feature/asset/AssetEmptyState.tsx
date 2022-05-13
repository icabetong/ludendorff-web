import { useTranslation } from "react-i18next";
import EmptyStateComponent from "../state/EmptyStates";
import { DevicesOtherRounded } from "@mui/icons-material";
import { GridEmptyRow } from "../../components";

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
    <GridEmptyRow>
      <AssetEmptyState/>
    </GridEmptyRow>
  )
}

export { AssetEmptyState, AssetDataGridEmptyState }