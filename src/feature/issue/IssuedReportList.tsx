import { ReactNode } from "react";
import { IssuedReport } from "./IssuedReport";
import { List, ListItemButton, ListItemText, ListItemSecondaryAction } from "@mui/material";

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
  active?: boolean,
  secondaryAction?: JSX.Element | ReactNode,
  onItemSelect: (report: IssuedReport) => void,
  onItemRemove?: (report: IssuedReport) => void,
}
const IssuedReportListItem = (props: IssuedReportListItemProps) => {
  return (
    <ListItemButton
      selected={props.active}
      onClick={() => props.onItemSelect(props.report)}>
      <ListItemText
        primary={props.report.serialNumber}
        secondary={props.report.fundCluster}/>
    </ListItemButton>
  )
}

export default IssuedReportList;