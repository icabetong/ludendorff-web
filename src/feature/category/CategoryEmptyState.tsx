import { useTranslation } from "react-i18next";
import EmptyStateComponent from "../state/EmptyStates";
import { CategoryRounded } from "@mui/icons-material";

const CategoryEmptyState = () => {
  const { t } = useTranslation();
  return (
    <EmptyStateComponent
      icon={CategoryRounded}
      title={t("empty.category_header")}
      subtitle={t("empty.category_summary")}/>
  )
}

export { CategoryEmptyState }