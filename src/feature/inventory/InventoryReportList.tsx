import { InventoryReport } from "./InventoryReport";
import { List, ListItem, ListItemText } from "@mui/material";

type InventoryReportListProps = {
  reports: InventoryReport[],
  onItemSelect: (report: InventoryReport) => void,
  onItemRemove: (report: InventoryReport) => void,
}

const InventoryReportList = (props: InventoryReportListProps) => {
  return (
    <List>
      {
        props.reports.map((report) => {
          return (
            <InventoryReportItem
              report={report}
              onItemSelect={props.onItemSelect}/>
          )
        })
      }
    </List>
  )
}

type InventoryReportItemProps = {
  report: InventoryReport,
  onItemSelect: (report: InventoryReport) => void,
  onItemRemove?: (report: InventoryReport) => void,
}
const InventoryReportItem = (props: InventoryReportItemProps) => {
  return (
    <ListItem button key={props.report.inventoryReportId} onClick={() => props.onItemSelect(props.report)}>
      <ListItemText
        primary={props.report.fundCluster}
        secondary={props.report.entityName}/>
    </ListItem>
  )
}

export default InventoryReportList