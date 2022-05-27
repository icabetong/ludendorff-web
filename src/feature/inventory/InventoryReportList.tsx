import { InventoryReport } from "./InventoryReport";
import { List, ListItemButton, ListItemText } from "@mui/material";

type InventoryReportListProps = {
  reports: InventoryReport[],
  onItemSelect: (report: InventoryReport) => void,
}
const InventoryReportList = (props: InventoryReportListProps) => {
  return (
    <List>
      {
        props.reports.map((report) => {
          return (
            <InventoryReportItem
              key={report.inventoryReportId}
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
}
const InventoryReportItem = (props: InventoryReportItemProps) => {
  const onHandleItemSelect = () => props.onItemSelect(props.report);

  return (
    <ListItemButton key={props.report.inventoryReportId} onClick={onHandleItemSelect}>
      <ListItemText
        primary={props.report.fundCluster}
        secondary={props.report.entityName}/>
    </ListItemButton>
  )
}

export default InventoryReportList