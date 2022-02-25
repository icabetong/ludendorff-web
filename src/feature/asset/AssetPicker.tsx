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
  makeStyles
} from "@material-ui/core";
import { DesktopWindowsRounded } from "@material-ui/icons";

import { Asset } from "./Asset";
import AssetList from "./AssetList";

import { ErrorNoPermissionState } from "../state/ErrorStates";
import EmptyStateComponent from "../state/EmptyStates";
import { usePermissions } from "../auth/AuthProvider";

const useStyles = makeStyles(() => ({
  root: {
    minHeight: '60vh',
    paddingTop: 0,
    paddingBottom: 0,
    '& .MuiList-padding': {
      padding: 0
    }
  }
}))

type AssetPickerProps = {
  isOpen: boolean,
  assets: Asset[],
  isLoading: boolean,
  onDismiss: () => void,
  onSelectItem: (asset: Asset) => void
}

const AssetPicker = (props: AssetPickerProps) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('xs'));
  const classes = useStyles();
  const { canRead } = usePermissions();

  const onSelect = (asset: Asset) => {
    props.onSelectItem(asset);
    props.onDismiss();
  }

  return (
    <Dialog
      fullScreen={isMobile}
      fullWidth={true}
      maxWidth="xs"
      open={props.isOpen}
      onClose={props.onDismiss}>
      <DialogTitle>{t("asset_select")}</DialogTitle>
      <DialogContent dividers={true} className={classes.root}>
        {canRead ?
          !props.isLoading
            ? props.assets.length > 0
              ? <AssetList
                  assets={props.assets}
                  onItemSelect={onSelect} />
              : <EmptyStateComponent
                icon={DesktopWindowsRounded}
                title={t("empty_asset")}
                subtitle={t("empty_asset_summary")} />
            : <LinearProgress />
          : <ErrorNoPermissionState />
        }
      </DialogContent>
      <DialogActions>
        <Button color="primary" onClick={props.onDismiss}>{t("close")}</Button>
      </DialogActions>
    </Dialog>
  );
}

export default AssetPicker;