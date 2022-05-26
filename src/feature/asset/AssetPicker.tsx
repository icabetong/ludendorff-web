import { useState } from "react";
import { useTranslation } from "react-i18next";
import { InstantSearch } from "react-instantsearch-core";
import {
  Dialog,
  DialogActions,
  DialogContent,
  LinearProgress,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { Asset } from "./Asset";
import AssetList from "./AssetList";
import AssetSearchList from "./AssetSearchList";
import { AssetEmptyState } from "./AssetEmptyState";
import { usePermissions } from "../auth/AuthProvider";
import { ErrorNoPermissionState } from "../state/ErrorStates";
import Client from "../search/Client";
import { DialogSearchTitle } from "../../components/dialog/DialogSearchTitle";
import { PaginationController, PaginationControllerProps } from "../../components/data/PaginationController";

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
  const [searchMode, setSearchMode] = useState(false);
  const { canRead } = usePermissions();

  const onSelect = (asset: Asset) => {
    props.onSelectItem(asset);
    props.onDismiss();
  }

  return (
    <InstantSearch searchClient={Client} indexName="assets">
      <Dialog
        fullWidth
        fullScreen={smBreakpoint}
        maxWidth="xs"
        open={props.isOpen}
        PaperProps={{ sx: { minHeight: '60vh' }}}
        onClose={props.onDismiss}>
        <DialogSearchTitle
          hasSearchFocus={searchMode}
          onSearchFocusChanged={setSearchMode}>
          {t("dialog.select_asset")}
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
          {canRead
            ? searchMode
              ? <AssetSearchList onItemSelect={onSelect}/>
              : !props.isLoading
                ? props.assets.length > 0
                  ? <AssetList assets={props.assets} onItemSelect={onSelect}/>
                  : <AssetEmptyState/>
                : <LinearProgress/>
            : <ErrorNoPermissionState/>
          }
        </DialogContent>
        <DialogActions>
          <PaginationController
            canBack={props.canBack}
            canForward={props.canForward}
            onBackward={props.onBackward}
            onForward={props.onForward}/>
        </DialogActions>
      </Dialog>
    </InstantSearch>
  );
}

export default AssetPicker;