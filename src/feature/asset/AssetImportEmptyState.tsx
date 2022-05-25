import { useTranslation } from "react-i18next";
import EmptyStateComponent from "../state/EmptyStates";
import { DescriptionOutlined } from "@mui/icons-material";
import { GridEmptyRows } from "../../components/datagrid/GridEmptyRows";

const AssetImportEmptyState = () => {
  const { t } = useTranslation();

  return (
    <EmptyStateComponent
      icon={DescriptionOutlined}
      title={t("empty.asset_import_header")}
      subtitle={t("empty.asset_import_summary")}/>
  )
}

const AssetImportDataGridEmptyState = () => {
  return (
    <GridEmptyRows>
      <AssetImportEmptyState/>
    </GridEmptyRows>
  )
}

export { AssetImportEmptyState, AssetImportDataGridEmptyState }