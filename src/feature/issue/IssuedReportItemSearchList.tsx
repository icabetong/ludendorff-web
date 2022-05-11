import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  GroupedIssuedReportItem,
  groupIssuedReportItemsByStockNumber,
  IssuedReport,
  IssuedReportItem,
} from "./IssuedReport";
import { Box, List, ListItemButton, ListItemIcon, ListItemText } from "@mui/material";
import { ArrowBackRounded } from "@mui/icons-material";
import { HitsProvided, connectHits } from "react-instantsearch-core";
import Highlight from "../search/Highlight";
import { fundCluster, serialNumber } from "../../shared/const";

type IssuedReportSearchListProps = HitsProvided<IssuedReport> & {
  onItemSelect: (report: IssuedReportItem[]) => void
}
const IssuedReportSearchListCore = (props: IssuedReportSearchListProps) => {
  const { t } = useTranslation();
  const [report, setReport] = useState<IssuedReport | undefined>(undefined);
  const [items, setItems] = useState<GroupedIssuedReportItem>({});

  useEffect(() => {
    if (report) {
      setItems(groupIssuedReportItemsByStockNumber(report.items));
    }
  }, [report]);

  const onDeselectReport = () => setReport(undefined);

  return (
    <Box>
      { report
        ? <List>
          <ListItemButton onClick={onDeselectReport}>
            <ListItemIcon><ArrowBackRounded/></ListItemIcon>
            <ListItemText primary={t("button.back")}/>
          </ListItemButton>
          {
            Object.keys(items).map((stockNumber) => {
              return (
                <IssuedReportItemPickerListItem
                  key={stockNumber}
                  stockNumber={stockNumber}
                  item={items[stockNumber]}
                  onItemSelect={props.onItemSelect}/>
              )
            })
          }
        </List>
        : <IssuedReportSearchListBase
            reports={props.hits}
            onItemSelect={setReport}/>
      }
    </Box>
  )
}

type IssuedReportSearchListBaseProps = {
  reports: IssuedReport[],
  onItemSelect: (report: IssuedReport) => void,
}
const IssuedReportSearchListBase = (props: IssuedReportSearchListBaseProps) => {
  return (
    <List>
      { props.reports.map((report) => {
        return (
          <IssuedReportSearchListBaseItem
            key={report.issuedReportId}
            report={report}
            onItemSelect={props.onItemSelect}/>
        );
      })
      }
    </List>
  )
}
type IssuedReportSearchListBaseItemProps = {
  report: IssuedReport,
  onItemSelect: (report: IssuedReport) => void
}
const IssuedReportSearchListBaseItem = (props: IssuedReportSearchListBaseItemProps) => {
  const onHandleItemClick = () => props.onItemSelect(props.report);

  return (
    <ListItemButton onClick={onHandleItemClick}>
      <ListItemText
        primary={<Highlight hit={props.report} attribute={serialNumber}/>}
        secondary={<Highlight hit={props.report} attribute={fundCluster}/>}/>
    </ListItemButton>
  )
}

type IssuedReportItemPickerListItemProps = {
  stockNumber: string,
  item: IssuedReportItem[],
  onItemSelect: (item: IssuedReportItem[]) => void,
}
const IssuedReportItemPickerListItem = (props: IssuedReportItemPickerListItemProps) => {
  const getDescription = () => {
    if (props.item.length > 0) {
      return props.item[0].description;
    } else return undefined;
  }

  return (
    <ListItemButton onClick={() => props.onItemSelect(props.item)}>
      <ListItemText
        primary={props.stockNumber}
        secondary={getDescription()}/>
    </ListItemButton>
  )
}
const IssuedReportItemSearchList = connectHits<IssuedReportSearchListProps, IssuedReport>(IssuedReportSearchListCore);
export default IssuedReportItemSearchList;