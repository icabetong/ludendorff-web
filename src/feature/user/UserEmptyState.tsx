import GridEmptyRow from "../../components/datagrid/GridEmptyRows";
import { useTranslation } from "react-i18next";
import EmptyStateComponent from "../state/EmptyStates";
import { PeopleOutlineRounded } from "@mui/icons-material";

const UserEmptyState = () => {
  const { t } = useTranslation();

  return (
    <EmptyStateComponent
      icon={PeopleOutlineRounded}
      title={t("empty.user")}
      subtitle={t("empty.user_summary")}/>
  );
}
const UserDataGridEmptyState = () => {
  return (
    <GridEmptyRow>
      <UserEmptyState/>
    </GridEmptyRow>
  )
}

export { UserEmptyState, UserDataGridEmptyState }