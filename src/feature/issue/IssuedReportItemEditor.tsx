import { IssuedReportItem } from "./IssuedReport";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { Asset } from "../asset/Asset";
import { useState } from "react";
import { usePagination } from "use-pagination-firestore";
import { collection, orderBy, query } from "firebase/firestore";
import { assetCollection, assetStockNumber } from "../../shared/const";
import { firestore } from "../../index";
import {
  Button,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  InputAdornment,
  TextField
} from "@mui/material";
import AssetPicker from "../asset/AssetPicker";
import { useSnackbar } from "notistack";
import { ExpandMoreRounded } from "@mui/icons-material";

export type FormValues = {
  quantityIssued: number,
  responsibilityCenter?: string,
}

type IssuedReportItemEditorProps = {
  isOpen: boolean,
  isCreate: boolean,
  item?: IssuedReportItem,
  onSubmit: (item: IssuedReportItem) => void,
  onDismiss: () => void,
}

export const IssuedReportItemEditor = (props: IssuedReportItemEditorProps) => {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>();
  const [asset, setAsset] = useState<Asset | undefined>(undefined);
  const [isOpen, setOpen] = useState(false);

  const onPickerInvoke = () => setOpen(true);
  const onPickerDismiss = () => setOpen(false);

  const { items, isLoading, isStart, isEnd, getPrev, getNext } = usePagination<Asset>(
    query(collection(firestore, assetCollection), orderBy(assetStockNumber, "asc")), {
      limit: 15
    }
  );

  const onSubmit = (data: FormValues) => {
    if (!asset) {
      enqueueSnackbar(t("feedback.empty_asset"));
      return;
    }

    let item: IssuedReportItem = {
      ...data,
      stockNumber: asset.stockNumber,
      description: asset.description,
      unitOfMeasure: asset.unitOfMeasure,
      unitCost: asset.unitValue,
      quantityIssued: parseInt(`${data.quantityIssued}`)
    }
    props.onSubmit(item)
    props.onDismiss()
  }

  return (
    <>
      <Dialog
        fullWidth={true}
        maxWidth="xs"
        open={props.isOpen}
        onClose={props.onDismiss}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogTitle>{t("dialog.details_issued_item")}</DialogTitle>
          <DialogContent>
            <Container disableGutters>
              <TextField
                value={asset?.description ? asset?.description : t("field.not_set")}
                label={t("field.asset")}
                InputProps={{
                  readOnly: true,
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={onPickerInvoke} edge="end">
                        <ExpandMoreRounded/>
                      </IconButton>
                    </InputAdornment>
                  )
                }}/>
              <Divider sx={{ my: 2 }}/>
              <TextField
                autoFocus
                id="quantityIssued"
                type="number"
                label={t("field.quantity_issued")}
                defaultValue={props.item && props.item.quantityIssued}
                error={errors.quantityIssued !== undefined}
                helperText={errors.quantityIssued?.message && t(errors.quantityIssued?.message)}
                disabled={!asset}
                {...register('quantityIssued', { required: "feedback.empty_quantity_issued" })}/>
              <TextField
                id="responsibilityCenter"
                type="text"
                label={t("field.responsibility_center")}
                defaultValue={props.item && props.item.responsibilityCenter}
                error={errors.responsibilityCenter !== undefined}
                helperText={errors.responsibilityCenter?.message && t(errors.responsibilityCenter?.message)}
                disabled={!asset}
                {...register('responsibilityCenter', { required: 'feedback.empty_responsibility_center' })}/>
            </Container>
          </DialogContent>
          <DialogActions>
            <Button
              color="primary"
              onClick={props.onDismiss}>
              {t("button.cancel")}
            </Button>
            <Button
              color="primary"
              type="submit">
              {t("button.save")}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
      <AssetPicker
        isOpen={isOpen}
        assets={items}
        isLoading={isLoading}
        canBack={isStart}
        canForward={isEnd}
        onBackward={getPrev}
        onForward={getNext}
        onDismiss={onPickerDismiss}
        onSelectItem={setAsset}/>
    </>
  )
}