import { useTranslation } from "react-i18next";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  LinearProgress,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { DesktopWindowsRounded } from "@mui/icons-material";

import { Asset } from "./Asset";
import AssetList from "./AssetList";

import { ErrorNoPermissionState } from "../state/ErrorStates";
import EmptyStateComponent from "../state/EmptyStates";
import { usePermissions } from "../auth/AuthProvider";
import { PaginationController, PaginationControllerProps } from "../../components/PaginationController";
import useQueryLimit from "../shared/useQueryLimit";

type AssetPickerProps = PaginationControllerProps & {
  isOpen: boolean,
  assets: Asset[],
  isLoading: boolean,
  onDismiss: () => void,
  onSelectItem: (asset: Asset) => void
}

const AssetPicker = (props: AssetPickerProps) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const smBreakpoint = useMediaQuery(theme.breakpoints.down('sm'));
  const { canRead } = usePermissions();
  const { limit } = useQueryLimit('assetQueryLimit');

  const onSelect = (asset: Asset) => {
    props.onSelectItem(asset);
    props.onDismiss();
  }

  return (
    <Dialog
      fullScreen={smBreakpoint}
      fullWidth={true}
      maxWidth="xs"
      open={props.isOpen}
      onClose={props.onDismiss}>
      <DialogTitle>{t("dialog.select_asset")}</DialogTitle>
      <DialogContent dividers={true}>
        {canRead ?
          !props.isLoading
            ? props.assets.length > 0
              ? <>
                <AssetList
                  assets={props.assets}
                  onItemSelect={onSelect}/>
                {props.canForward && props.assets.length > 0 && props.assets.length === limit &&
                  <PaginationController
                    canBack={props.canBack}
                    canForward={props.canForward}
                    onBackward={props.onBackward}
                    onForward={props.onForward}/>
                }
              </>
              : <EmptyStateComponent
                icon={DesktopWindowsRounded}
                title={t("empty.asset")}
                subtitle={t("empty.asset_summary")}/>
            : <LinearProgress/>
          : <ErrorNoPermissionState/>
        }
      </DialogContent>
      <DialogActions>
        <Button
          color="primary"
          onClick={props.onDismiss}>{t("button.close")}</Button>
      </DialogActions>
    </Dialog>
  );
}

export default AssetPicker;