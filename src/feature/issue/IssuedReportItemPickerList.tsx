import { useState, useEffect } from "react";
import {
  GroupedIssuedReportItem,
  groupIssuedReportItemsByStockNumber,
  IssuedReport,
  IssuedReportItem,
  IssuedReportRepository
} from "./IssuedReport";
import { Box, List, ListItemButton, ListItemIcon, ListItemText } from "@mui/material";
import { ArrowBackRounded } from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import IssuedReportList from "./IssuedReportList";
import { PaginationController, PaginationControllerProps } from "../../components/data/PaginationController";
import { isDev } from "../../shared/utils";

type IssuedReportItemPickerListProps = PaginationControllerProps & {
  reports: IssuedReport[],
  limit: number,
  onItemSelect: (report: IssuedReportItem[]) => void
}
const IssuedReportItemPickerList = (props: IssuedReportItemPickerListProps) => {
  const { t } = useTranslation();
  const [report, setReport] = useState<IssuedReport | undefined>(undefined);
  const [issuedItems, setIssuedItems] = useState<IssuedReportItem[]>([]);
  const [items, setItems] = useState<GroupedIssuedReportItem>({});

  useEffect(() => {
    const fetch = async () => {
      return report ? await IssuedReportRepository.fetch(report.issuedReportId)
        : [];
    }

    fetch().then(data => setIssuedItems(data))
      .catch((error) => {
        if (isDev) console.log(error);
      });
  }, [report]);

  useEffect(() => {
    setItems(groupIssuedReportItemsByStockNumber(issuedItems));
  }, [issuedItems]);

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
        : <>
          <IssuedReportList
            reports={props.reports}
            onItemSelect={setReport}
            onItemRemove={() => {}}/>
          {props.canBack && props.reports.length > 0 && props.reports.length === props.limit &&
            <PaginationController
              canBack={props.canBack}
              canForward={props.canForward}
              onBackward={props.onBackward}
              onForward={props.onForward}/>
          }
        </>
      }
    </Box>
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
    } else return "";
  }

  return (
    <ListItemButton onClick={() => props.onItemSelect(props.item)}>
      <ListItemText
        primary={props.stockNumber}
        secondary={getDescription()}/>
    </ListItemButton>
  )
}

export default IssuedReportItemPickerList;