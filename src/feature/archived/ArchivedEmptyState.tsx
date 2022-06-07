import { useTranslation } from "react-i18next";
import EmptyStateComponent from "../state/EmptyStates";
import { DevicesOtherRounded } from "@mui/icons-material";
import { GridEmptyRows } from "../../components/datagrid/GridEmptyRows";

const ArchivedEmptyState = () => {
  const { t } = useTranslation();

  return (
    <EmptyStateComponent
      icon={DevicesOtherRounded}
      title={t("empty.archived_header")}
      subtitle={t("empty.archived_summary")}/>
  );
}

const ArchivedDataGridEmptyState = () => {
  return (
    <GridEmptyRows>
      <ArchivedEmptyState/>
    </GridEmptyRows>
  )
}

export { ArchivedEmptyState, ArchivedDataGridEmptyState }