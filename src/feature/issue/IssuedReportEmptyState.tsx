import { useTranslation } from "react-i18next";
import { UploadFileOutlined } from "@mui/icons-material";
import EmptyStateComponent from "../state/EmptyStates";
import { GridEmptyRow } from "../../components";

const IssuedReportEmptyState = () => {
  const { t } = useTranslation();

  return (
    <EmptyStateComponent
      icon={UploadFileOutlined}
      title={t("empty.issued_reports_header")}
      subtitle={t("empty.issued_reports_summary")}/>
  )
}
const IssuedReportDataGridEmptyState = () => {
  return (
    <GridEmptyRow>
      <IssuedReportEmptyState/>
    </GridEmptyRow>
  )
}

export { IssuedReportEmptyState, IssuedReportDataGridEmptyState }