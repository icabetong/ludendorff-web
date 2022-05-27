import { InventoryReport } from "./InventoryReport";
import { IconButton, List, ListItem, ListItemSecondaryAction, ListItemText } from "@mui/material";
import { useTranslation } from "react-i18next";
import { FindInPageOutlined } from "@mui/icons-material";

type InventoryReportPickerListProps = {
  reports: InventoryReport[],
  onItemSelect: (report: InventoryReport) => void,
  onItemView: (report: InventoryReport) => void,
}

const InventoryReportPickerList = (props: InventoryReportPickerListProps) => {
  return (
    <List>
      {
        props.reports.map((report) => {
          return (
            <InventoryReportPickerListItem
              key={report.inventoryReportId}
              report={report}
              onItemSelect={props.onItemSelect}
              onItemView={props.onItemView}/>
          )
        })
      }
    </List>
  )
}

type InventoryReportPickerListItemProps = {
  report: InventoryReport,
  onItemSelect: (report: InventoryReport) => void,
  onItemView: (report: InventoryReport) => void,
}
const InventoryReportPickerListItem = (props: InventoryReportPickerListItemProps) => {
  const { t } = useTranslation();

  const onHandleItemSelect = () => props.onItemSelect(props.report);
  const onHandleItemView = () => props.onItemView(props.report);

  return (
    <ListItem button onClick={onHandleItemSelect}>
      <ListItemText
        primary={props.report.fundCluster}
        secondary={props.report.yearMonth}/>
      <ListItemSecondaryAction>
        <IconButton aria-label={t("button.view")} onClick={onHandleItemView}>
          <FindInPageOutlined/>
        </IconButton>
      </ListItemSecondaryAction>
    </ListItem>
  )
}

export default InventoryReportPickerList;