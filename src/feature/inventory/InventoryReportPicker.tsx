import { useTranslation } from "react-i18next";
import { InventoryReport } from "./InventoryReport";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, LinearProgress } from "@mui/material";
import { usePagination } from "use-pagination-firestore";
import { collection, orderBy, query, where } from "firebase/firestore";
import { firestore } from "../../index";
import { assetStockNumber, fundCluster, inventoryCollection } from "../../shared/const";
import InventoryReportList from "./InventoryReportList";
import { usePermissions } from "../auth/AuthProvider";
import useQueryLimit from "../shared/hooks/useQueryLimit";
import { PaginationController } from "../../components/PaginationController";
import { InventoryReportEmptyState } from "./InventoryReportEmptyState";
import { ErrorNoPermissionState } from "../state/ErrorStates";

type InventoryReportPickerProps = {
  isOpen: boolean,
  stockNumber?: string,
  onItemSelected: (report: InventoryReport) => void,
  onDismiss: () => void,
}
const InventoryReportPicker = (props: InventoryReportPickerProps) => {
  const { t } = useTranslation();
  const { canRead } = usePermissions();
  const { limit } = useQueryLimit('inventoryQueryLimit');

  const { items, isLoading, isStart, isEnd, getPrev, getNext } = usePagination<InventoryReport>(
    query(collection(firestore, inventoryCollection),
      orderBy(fundCluster, "asc")), { limit: limit }
  );

  return (
    <Dialog open={props.isOpen} maxWidth="xs" fullWidth>
      <DialogTitle>{t("dialog.select_inventory_report")}</DialogTitle>
      <DialogContent
        dividers={true}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          minHeight: '60vh',
          paddingX: 0,
          '& .MuiList-padding': { padding: 0 }
        }}>
        { canRead ?
          !isLoading
          ? items.length > 0
            ? <>
                <InventoryReportList
                  reports={items}
                  onItemSelect={props.onItemSelected}
                  onItemRemove={() => {}}/>
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
        <Button onClick={props.onDismiss}>{t("button.cancel")}</Button>
      </DialogActions>
    </Dialog>
  )
}

export default InventoryReportPicker;