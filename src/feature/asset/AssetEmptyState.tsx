import { useTranslation } from "react-i18next";
import EmptyStateComponent from "../state/EmptyStates";
import { DesktopWindowsRounded } from "@mui/icons-material";
import GridEmptyRow from "../../components/GridEmptyRows";

const AssetEmptyState = () => {
  const { t } = useTranslation();

  return (
    <EmptyStateComponent
      icon={DesktopWindowsRounded}
      title={t("empty.asset")}
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