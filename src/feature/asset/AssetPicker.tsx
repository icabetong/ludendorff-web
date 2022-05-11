import { useState } from "react";
import { useTranslation } from "react-i18next";
import { InstantSearch } from "react-instantsearch-core";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  LinearProgress,
  useMediaQuery,
  useTheme,
} from "@mui/material";

import { Asset } from "./Asset";
import AssetList from "./AssetList";

import { ErrorNoPermissionState } from "../state/ErrorStates";
import { usePermissions } from "../auth/AuthProvider";
import { PaginationController, PaginationControllerProps } from "../../components/PaginationController";
import useQueryLimit from "../shared/hooks/useQueryLimit";
import SearchDialogTitle from "../../components/SearchDialogTitle";
import Client from "../search/Client";
import AssetSearchList from "./AssetSearchList";
import { AssetEmptyState } from "./AssetEmptyState";

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
  const { limit } = useQueryLimit('assetQueryLimit');

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
        PaperProps={{ sx: { minHeight: '60vh' }}}>
        <SearchDialogTitle
          hasSearchFocus={searchMode}
          onSearchFocusChanged={setSearchMode}>
          {t("dialog.select_asset")}
        </SearchDialogTitle>
        <DialogContent
          dividers={true}
          sx={{
            height: '100%',
            paddingX: 0,
            '& .MuiList-padding': { padding: 0 }
          }}>
          {canRead
            ? searchMode
              ? <AssetSearchList onItemSelect={onSelect}/>
                : !props.isLoading
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
                : <AssetEmptyState/>
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
    </InstantSearch>
  );
}

export default AssetPicker;