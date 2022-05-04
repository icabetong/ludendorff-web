import { HitsProvided } from "react-instantsearch-core";
import { InventoryReport } from "./InventoryReport";
import { List, ListItemButton, ListItemText } from "@mui/material";
import { Highlight } from "../../components/InstantSearch";
import { fundCluster, yearMonth } from "../../shared/const";
import { connectHits } from "react-instantsearch-dom";

type InventoryReportSearchListProps = HitsProvided<InventoryReport> & {
  onItemSelect: (report: InventoryReport) => void,
}
const InventoryReportSearchListCore = (props: InventoryReportSearchListProps) => {
  return (
    <List>
      { props.hits.map((report) => {
        return (
          <InventoryReportSearchListItem
            key={report.inventoryReportId}
            report={report}
            onItemSelect={props.onItemSelect}/>
        )
      })
      }
    </List>
  )
}

type InventoryReportSearchListItemProps = {
  report: InventoryReport,
  onItemSelect: (report: InventoryReport) => void,
}
const InventoryReportSearchListItem = (props: InventoryReportSearchListItemProps) => {
  const onHandleItemClick = () => props.onItemSelect(props.report)

  return (
    <ListItemButton onClick={onHandleItemClick}>
      <ListItemText
        primary={<Highlight hit={props.report} attribute={fundCluster}/>}
        secondary={<Highlight hit={props.report} attribute={yearMonth}/>}/>
    </ListItemButton>
  )
}
const InventoryReportSearchList = connectHits<InventoryReportSearchListProps, InventoryReport>(InventoryReportSearchListCore);
export default InventoryReportSearchList;