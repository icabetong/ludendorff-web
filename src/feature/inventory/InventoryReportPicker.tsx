import { useState } from "react";
import { useTranslation } from "react-i18next";
import { InventoryReport } from "./InventoryReport";
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  LinearProgress,
  Snackbar,
  useMediaQuery,
  useTheme
} from "@mui/material";
import { InstantSearch } from "react-instantsearch-dom";
import { collection, orderBy, query, limit } from "firebase/firestore";
import { firestore } from "../../index";
import { inventoryCollection, inventoryReportId } from "../../shared/const";
import { usePermissions } from "../auth/AuthProvider";
import { PaginationController, DialogSearchTitle } from "../../components";
import { InventoryReportEmptyState } from "./InventoryReportEmptyState";
import usePagination from "../shared/hooks/usePagination";
import { ErrorNoPermissionState } from "../state/ErrorStates";
import InventoryReportPickerList from "./InventoryReportPickerList";
import InventoryReportViewer from "./InventoryReportViewer";
import InventoryReportSearchList from "./InventoryReportSearchList";

import Client from "../search/Client";

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
  const [report, setReport] = useState<InventoryReport | null>(null);

  const { items, isLoading, error, canBack, canForward, onBackward, onForward } = usePagination<InventoryReport>(
    query(collection(firestore, inventoryCollection), orderBy(inventoryReportId, "asc"), limit(25)),
    inventoryReportId, 25
  );

  return (
    <InstantSearch searchClient={Client} indexName="inventories">
      <Dialog
        fullWidth
        fullScreen={smBreakpoint}
        maxWidth="xs"
        open={props.isOpen}
        PaperProps={{ sx: { minHeight: '60vh' }}}>
        <DialogSearchTitle
          hasSearchFocus={searchMode}
          onSearchFocusChanged={setSearchMode}>
          {t("dialog.select_inventory_report")}
        </DialogSearchTitle>
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
                    { canBack && items.length > 0 && items.length === 25 &&
                      <PaginationController
                        canBack={canBack}
                        canForward={canForward}
                        onBackward={onBackward}
                        onForward={onForward}/>
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
      <Snackbar open={Boolean(error)}>
        <Alert severity="error">
          {error?.message}
        </Alert>
      </Snackbar>
    </InstantSearch>
  )
}

export default InventoryReportPicker;