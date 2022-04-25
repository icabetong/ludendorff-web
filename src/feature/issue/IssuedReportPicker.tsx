import { useEffect, useState } from "react";
import { IssuedReport, IssuedReportItem, IssuedReportRepository } from "./IssuedReport";
import { useTranslation } from "react-i18next";
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  LinearProgress,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText
} from "@mui/material";
import IssuedReportList from "./IssuedReportList";
import { usePagination } from "use-pagination-firestore";
import useQueryLimit from "../shared/hooks/useQueryLimit";
import { collection, orderBy, query } from "firebase/firestore";
import { firestore } from "../../index";
import { issuedCollection } from "../../shared/const";

import { ArrowBackRounded, ChevronRightRounded } from "@mui/icons-material";
import { isDev } from "../../shared/utils";
import { GroupedIssuedReportItem, IssuedReportItemPickerList } from "./IssuedReportItemPickerList";
import { usePermissions } from "../auth/AuthProvider";
import { PaginationController } from "../../components/PaginationController";
import { IssuedReportEmptyState } from "./IssuedReportEmptyState";
import { ErrorNoPermissionState } from "../state/ErrorStates";

type IssuedReportPickerProps = {
  isOpen: boolean,
  onItemSelected: (item: GroupedIssuedReportItem) => void,
  onDismiss: () => void,
}

const IssuedReportPicker = (props: IssuedReportPickerProps) => {
  const { t } = useTranslation();
  const { canRead } = usePermissions();
  const { limit } = useQueryLimit('issuedQueryLimit');
  const [report, setReport] = useState<IssuedReport | undefined>(undefined);
  const [issuedItems, setIssuedItems] = useState<IssuedReportItem[]>([]);

  const onDeselectReport = () => setReport(undefined);

  const onItemSelected = (item: GroupedIssuedReportItem) => {
    props.onItemSelected(item);
    props.onDismiss();
  }

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

  const { items, isLoading, isStart, isEnd, getPrev, getNext } = usePagination<IssuedReport>(
    query(collection(firestore, issuedCollection), orderBy("fundCluster", "asc")), { limit: limit }
  )

  return (
    <Dialog open={props.isOpen} maxWidth="sm" fullWidth>
      <DialogTitle>{t("dialog.select_issued_report")}</DialogTitle>
      <DialogContent
        dividers={true}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          minHeight: '60vh',
          paddingX: 0,
          '& .MuiList-padding': { padding: 0 }
        }}>
        { canRead
          ? !isLoading
            ? items.length > 0
              ? report
                ? <List>
                    <ListItemButton onClick={onDeselectReport}>
                      <ListItemIcon><ArrowBackRounded/></ListItemIcon>
                      <ListItemText primary={t("button.back")}/>
                    </ListItemButton>
                    {isLoading
                      ? <Box sx={{
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <CircularProgress/>
                      </Box>
                      : <IssuedReportItemPickerList
                        items={issuedItems}
                        onItemSelect={onItemSelected}/>
                    }
                  </List>
                : <>
                    <IssuedReportList
                      reports={items}
                      checked={report}
                      secondaryAction={<ChevronRightRounded/>}
                      onItemSelect={setReport}
                      onItemRemove={() => {}}/>
                    { isStart && items.length > 0 && items.length === limit &&
                      <PaginationController
                        canBack={isStart}
                        canForward={isEnd}
                        onBackward={getPrev}
                        onForward={getNext}/>
                    }
                </>
              : <IssuedReportEmptyState/>
            : <LinearProgress/>
          : <ErrorNoPermissionState/>
        }
      </DialogContent>
      <DialogActions>
        <Button onClick={props.onDismiss}>{t("button.cancel")}</Button>
      </DialogActions>
    </Dialog>
  )
}

export default IssuedReportPicker;