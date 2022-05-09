import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContentText,
  DialogContent,
  DialogTitle,
  Grid,
  TextField,
  Typography,
} from "@mui/material";
import { useSnackbar } from "notistack";
import { AssetImport } from "./AssetImport";
import { groupBy } from "../../shared/utils";
import { GroupedArray } from "../shared/types/GroupedArray";
import AssetImportDuplicateList from "./AssetImportDuplicateList";

type AssetImportDuplicateProps = {
  isOpen: boolean,
  assets: AssetImport[],
  onContinue: (assets: GroupedArray<AssetImport>) => void,
}
const AssetImportDuplicate = (props: AssetImportDuplicateProps) => {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const [duplicates, setDuplicates] = useState<GroupedArray<AssetImport>>({});
  const [asset, setAsset] = useState<AssetImport | undefined>(undefined);

  useEffect(() => {
    let grouped = groupBy(props.assets, "stockNumber");
    setDuplicates(Object.fromEntries(grouped));
  }, [props.assets]);

  const onItemSelected = (asset: AssetImport) => setAsset(asset);
  const onItemRemoved = (asset: AssetImport) => {
    let current = duplicates;
    let assets = current[asset.stockNumber];
    if (!assets)
      return;

    if (assets.length <= 1) {
      enqueueSnackbar(t("feedback.cannot_delete_asset"));
      return;
    }

    assets = assets.filter((item: AssetImport) => item !== asset);
    current[asset.stockNumber] = assets;
    setDuplicates(prevState => {
      return {
        ...prevState,
        [asset.stockNumber]: assets,
      }
    });
  }

  const onContinue = () => {
    if (Object.values(duplicates).some((arr) => arr.length > 1)) {
      enqueueSnackbar(t("feedback.duplicate_items_exists"))
      return;
    }

    props.onContinue(duplicates);
  }

  return (
    <Dialog open={props.isOpen} maxWidth="md" fullWidth>
      <DialogTitle>{t("dialog.duplicate_asset_items")}</DialogTitle>
      <DialogContent>
        <DialogContentText>{t("dialog.duplicate_asset_items_summary")}</DialogContentText>
        <Box sx={{ marginTop: 2 }}>
          <Typography variant="body2">{t("field.duplicate_items")}</Typography>
          <Grid container>
            <Grid item xs={6}>
              <AssetImportDuplicateList
                assets={duplicates}
                selected={asset}
                onItemSelected={onItemSelected}
                onItemRemoved={onItemRemoved}/>
            </Grid>
            <Grid item xs={6}>
              { asset &&
                <Box sx={{ marginX: 2 }}>
                  <TextField
                    value={asset ? asset.description : ""}
                    label={t("field.asset_description")}
                    InputProps={{ readOnly: true }}/>
                  <TextField
                    value={asset ? asset.category?.categoryName : ""}
                    label={t("field.category")}
                    InputProps={{ readOnly: true }}/>
                  <TextField
                    value={asset ? asset.subcategory : ""}
                    label={t("field.subcategory")}
                    InputProps={{ readOnly: true }}/>
                  <TextField
                    value={asset ? asset.unitOfMeasure : ""}
                    label={t("field.unit_of_measure")}
                    InputProps={{ readOnly: true }}/>
                  <TextField
                    value={asset ? asset.unitValue : ""}
                    label={t("field.unit_value")}
                    InputProps={{ readOnly: true }}/>
                  <TextField
                    value={asset ? asset.remarks : ""}
                    label={t("field.remarks")}
                    InputProps={{ readOnly: true }}/>
                </Box>
              }
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button
          variant="contained"
          onClick={onContinue}>
          {t("button.continue")}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default AssetImportDuplicate;