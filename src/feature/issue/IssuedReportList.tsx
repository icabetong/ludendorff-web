import { ReactNode } from "react";
import { IssuedReport } from "./IssuedReport";
import { List, ListItemButton, ListItemText, ListItemSecondaryAction } from "@mui/material";

type IssuedReportListProps = {
  reports: IssuedReport[],
  checked?: IssuedReport,
  secondaryAction?: JSX.Element | ReactNode,
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
              active={Boolean(report === props.checked)}
              secondaryAction={props.secondaryAction}
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
        primary={props.report.fundCluster}
        secondary={props.report.serialNumber}/>
      { props.secondaryAction &&
        <ListItemSecondaryAction>
          {props.secondaryAction}
        </ListItemSecondaryAction>
      }
    </ListItemButton>
  )
}

export default IssuedReportList;