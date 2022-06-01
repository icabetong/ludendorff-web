import { useState } from "react";
import { useTranslation } from "react-i18next";
import { InstantSearch } from "react-instantsearch-core";
import {
  Box, LinearProgress,
} from "@mui/material";
import { GridRowParams } from "@mui/x-data-grid";
import { collection, query, orderBy } from "firebase/firestore";
import { usePagination } from "use-pagination-firestore";
import { useSnackbar } from "notistack";
import { AuditLog, AuditLogRepository } from "./Audit";
import AuditDataGrid from "./AuditDataGrid";
import { usePermissions } from "../auth/AuthProvider";
import { getDataGridTheme } from "../core/Core";
import Client from "../search/Client";
import useSort from "../shared/hooks/useSort";
import { ScreenProps } from "../shared/types/ScreenProps";
import { ErrorNoPermissionState } from "../state/ErrorStates";
import { AdaptiveHeader } from "../../components/AdaptiveHeader";
import { useDialog } from "../../components/dialog/DialogProvider";
import { isDev } from "../../shared/utils";
import { firestore } from "../../index";
import AuditLogViewer from "./AuditLogViewer";
import { AuditEmptyState } from "./AuditEmptyState";
import AuditList from "./AuditList";

type AuditScreenProps = ScreenProps;
const AuditScreen = (props: AuditScreenProps) => {
  const { t } = useTranslation();
  const { isAdmin } = usePermissions();
  const show = useDialog();
  const [searchMode, setSearchMode] = useState(false);
  const {sortMethod, onSortMethodChange } = useSort("auditSort");
  const { enqueueSnackbar } = useSnackbar();
  const [auditLog, setAuditLog] = useState<AuditLog<any> | undefined>(undefined);

  const onAuditLogViewerDismiss = () => setAuditLog(undefined);

  const { items, isLoading, isStart, isEnd, getPrev, getNext } = usePagination<AuditLog<any>>(
    query(collection(firestore, "logs"), orderBy("logEntryId", "asc")),
    { limit: 25 }
  )

  const onAuditLogRemove = async (auditLog: AuditLog<any>) => {
    try {
      let result = await show({
        title: t("dialog.audit_log_remove"),
        description: t("dialog.audit_log_remove_summary"),
        confirmButtonText: t("button.delete"),
        dismissButtonText: t("button.cancel")
      });

      if (result) {
        await AuditLogRepository.remove(auditLog);
        enqueueSnackbar(t("feedback.audit_log_removed"));
      }
    } catch (error) {
      enqueueSnackbar(t("feedback.audit_log_remove_error"))
      if (isDev) console.log(error)
    }
  }

  const onDataGridRowDoubleClicked = (params: GridRowParams) => {
    setAuditLog(params.row as AuditLog<any>);
  }

  return (
    <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <InstantSearch searchClient={Client} indexName={"logs"}>
        <AdaptiveHeader
          title={t("navigation.audit_logs")}
          onDrawerTriggered={props.onDrawerToggle}
          onSearchFocusChanged={setSearchMode}/>
        {isAdmin
          ? <>
            <Box sx={(theme) => ({ flex: 1, padding: 3, display: { xs: 'none', sm: 'block' }, ...getDataGridTheme(theme)})}>
              <AuditDataGrid
                items={items}
                canBack={isStart}
                canForward={isEnd}
                isLoading={isLoading}
                isSearching={searchMode}
                sortMethod={sortMethod}
                onBackward={getPrev}
                onForward={getNext}
                onItemSelect={onDataGridRowDoubleClicked}
                onRemoveInvoke={onAuditLogRemove}
                onSortMethodChanged={onSortMethodChange}/>
            </Box>
            <Box sx={{ display: { xs: 'block', sm: 'none' }, height: 'inherit' }}>
              {!isLoading
                ? items.length < 1
                  ? <AuditEmptyState/>
                  : <AuditList auditLogs={items} onItemSelect={setAuditLog}/>
                : <LinearProgress/>
              }
            </Box>
            </>
          : <ErrorNoPermissionState/>
        }
      </InstantSearch>
      { auditLog &&
        <AuditLogViewer
          isOpen={Boolean(auditLog)}
          auditLog={auditLog}
          onDismiss={onAuditLogViewerDismiss}/>
      }
    </Box>
  )
}

export default AuditScreen;