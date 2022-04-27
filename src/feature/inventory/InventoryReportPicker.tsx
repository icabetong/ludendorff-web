import { useState } from "react";
import { useTranslation } from "react-i18next";
import { InventoryReport } from "./InventoryReport";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  LinearProgress,
  useMediaQuery,
  useTheme
} from "@mui/material";
import { usePagination } from "use-pagination-firestore";
import { collection, orderBy, query } from "firebase/firestore";
import { firestore } from "../../index";
import { fundCluster, inventoryCollection } from "../../shared/const";
import { usePermissions } from "../auth/AuthProvider";
import useQueryLimit from "../shared/hooks/useQueryLimit";
import { PaginationController } from "../../components/PaginationController";
import { InventoryReportEmptyState } from "./InventoryReportEmptyState";
import { ErrorNoPermissionState } from "../state/ErrorStates";
import InventoryReportPickerList from "./InventoryReportPickerList";
import InventoryReportViewer from "./InventoryReportViewer";
import { InstantSearch } from "react-instantsearch-dom";
import { Provider } from "../../components/Search";
import SearchDialogTitle from "../../components/SearchDialogTitle";
import InventoryReportSearchList from "./InventoryReportSearchList";

type InventoryReportPickerProps = {
  isOpen: boolean,
  stockNumber?: string,
  onItemSelected: (report: InventoryReport) => void,
  onDismiss: () => void,
}
const InventoryReportPicker = (props: InventoryReportPickerProps) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const smBreakpoint = useMediaQuery(theme.breakpoints.down('sm'));
  const { canRead } = usePermissions();
  const [searchMode, setSearchMode] = useState(false);
  const { limit } = useQueryLimit('inventoryQueryLimit');
  const [report, setReport] = useState<InventoryReport | null>(null);

  const { items, isLoading, isStart, isEnd, getPrev, getNext } = usePagination<InventoryReport>(
    query(collection(firestore, inventoryCollection),
      orderBy(fundCluster, "asc")), { limit: limit }
  );

  return (
    <InstantSearch searchClient={Provider} indexName="inventories">
      <Dialog
        fullWidth
        fullScreen={smBreakpoint}
        maxWidth="xs"
        open={props.isOpen}
        PaperProps={{ sx: { minHeight: '60vh' }}}>
        <SearchDialogTitle
          hasSearchFocus={searchMode}
          onSearchFocusChanged={setSearchMode}>
          {t("dialog.select_inventory_report")}
        </SearchDialogTitle>
        <DialogContent
          dividers={true}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            paddingX: 0,
            '& .MuiList-padding': { padding: 0 }
          }}>
          { canRead
            ? searchMode
              ? <InventoryReportSearchList
                  onItemSelect={props.onItemSelected}/>
              : !isLoading
                ? items.length > 0
                  ? <>
                    <InventoryReportPickerList
                      reports={items}
                      onItemSelect={props.onItemSelected}
                      onItemView={setReport}/>
                    { isStart && items.length > 0 && items.length === limit &&
                      <PaginationController
                        canBack={isStart}
                        canForward={isEnd}
                        onBackward={getPrev}
                        onForward={getNext}/>
                    }
                  </>
                  : <InventoryReportEmptyState/>
                : <LinearProgress/>
            : <ErrorNoPermissionState/>
          }
        </DialogContent>
        <DialogActions>
          <Button onClick={props.onDismiss}>{t("button.close")}</Button>
        </DialogActions>
      </Dialog>
      <InventoryReportViewer
        isOpen={Boolean(report)}
        report={report}
        onDismiss={() => setReport(null)}/>
    </InstantSearch>
  )
}

export default InventoryReportPicker;