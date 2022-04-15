import { IssuedReport } from "./IssuedReport";
import { List, ListItem, ListItemText } from "@mui/material";

type IssuedReportListProps = {
  reports: IssuedReport[],
  onItemSelect: (report: IssuedReport) => void,
  onItemRemove: (report: IssuedReport) => void
}
const IssuedReportList = (props: IssuedReportListProps) => {
  return (
    <List>
      {
        props.reports.map((report) => {
          return (
            <IssuedReportListItem
              key={report.issuedReportId}
              report={report}
              onItemSelect={props.onItemSelect}/>
          )
        })
      }
    </List>
  )
}

type IssuedReportListItemProps = {
  report: IssuedReport,
  onItemSelect: (report: IssuedReport) => void,
  onItemRemove?: (report: IssuedReport) => void,
}
const IssuedReportListItem = (props: IssuedReportListItemProps) => {
  return (
    <ListItem
      button
      key={props.report.issuedReportId}
      onClick={() => props.onItemSelect(props.report)}>
      <ListItemText
        primary={props.report.fundCluster}
        secondary={props.report.serialNumber}/>
    </ListItem>
  )
}

export default IssuedReportList;