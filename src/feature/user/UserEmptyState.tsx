import { useTranslation } from "react-i18next";
import EmptyStateComponent from "../state/EmptyStates";
import { PeopleOutlineRounded } from "@mui/icons-material";
import { GridEmptyRows } from "../../components/datagrid/GridEmptyRows";

const UserEmptyState = () => {
  const { t } = useTranslation();

  return (
    <EmptyStateComponent
      icon={PeopleOutlineRounded}
      title={t("empty.user_header")}
      subtitle={t("empty.user_summary")}/>
  );
}
const UserDataGridEmptyState = () => {
  return (
    <GridEmptyRows>
      <UserEmptyState/>
    </GridEmptyRows>
  )
}

export { UserEmptyState, UserDataGridEmptyState }