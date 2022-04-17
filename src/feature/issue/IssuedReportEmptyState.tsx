import GridEmptyRow from "../../components/GridEmptyRows";
import { useTranslation } from "react-i18next";
import EmptyStateComponent from "../state/EmptyStates";
import { UploadFileOutlined } from "@mui/icons-material";


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