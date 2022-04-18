import { IssuedReportItem } from "./IssuedReport";
import { useTranslation } from "react-i18next";
import { useForm, Controller } from "react-hook-form";
import { Asset } from "../asset/Asset";
import { useState, useEffect } from "react";
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
  const { handleSubmit, formState: { errors }, reset, control } = useForm<FormValues>();
  const [asset, setAsset] = useState<Asset | undefined>(undefined);
  const [isOpen, setOpen] = useState(false);

  useEffect(() => {
    if (props.isOpen) {
      reset({
        quantityIssued: props.item?.quantityIssued ? props.item?.quantityIssued : 0,
        responsibilityCenter: props.item?.responsibilityCenter ? props.item?.responsibilityCenter : ""
      })
    }
  }, [props.isOpen, props.item, reset])

  const onDismiss = () => {
    props.onDismiss();
  }

  const onPickerInvoke = () => setOpen(true);
  const onPickerDismiss = () => setOpen(false);

  const { items, isLoading, isStart, isEnd, getPrev, getNext } = usePagination<Asset>(
    query(collection(firestore, assetCollection), orderBy(assetStockNumber, "asc")), {
      limit: 15
    }
  );

  const onSubmit = (data: FormValues) => {
    if (asset) {
      let item: IssuedReportItem = {
        ...data,
        stockNumber: asset.stockNumber,
        description: asset.description,
        unitOfMeasure: asset.unitOfMeasure,
        unitCost: asset.unitValue,
        quantityIssued: parseInt(`${data.quantityIssued}`)
      }
      props.onSubmit(item);
    } else if (props.item) {
      let item: IssuedReportItem = {
        ...data,
        ...props.item,
        quantityIssued: parseInt(`${data.quantityIssued}`)
      }
      props.onSubmit(item);
    }
  }

  return (
    <>
      <Dialog
        fullWidth={true}
        maxWidth="xs"
        open={props.isOpen}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogTitle>{t("dialog.details_issued_item")}</DialogTitle>
          <DialogContent>
            <Container disableGutters>
              <TextField
                value={!props.item ? asset?.description ? asset?.description : t("field.not_set") : props.item.description }
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
              <Controller
                name="quantityIssued"
                control={control}
                render={({ field: { ref, ...inputProps }}) => (
                  <TextField
                    {...inputProps}
                    autoFocus
                    type="number"
                    inputRef={ref}
                    label={t("field.quantity_issued")}
                    error={errors.quantityIssued !== undefined}
                    helperText={errors.quantityIssued?.message && t(errors.quantityIssued?.message)}
                    disabled={!props.item ? !asset : false}/>
                )}
                rules={{ required: { value: true, message: 'feedback.empty_quantity_issued' }}}/>
              <Controller
                name="responsibilityCenter"
                control={control}
                render={({ field: { ref, ...inputProps }}) => (
                  <TextField
                    {...inputProps}
                    type="text"
                    inputRef={ref}
                    label={t("field.responsibility_center")}
                    error={errors.responsibilityCenter !== undefined}
                    helperText={errors.responsibilityCenter?.message && t(errors.responsibilityCenter?.message)}
                    disabled={!props.item ? !asset : false}/>
                )}
                rules={{ required: { value: true, message: "feedback.empty_responsibility_center" }}}/>
            </Container>
          </DialogContent>
          <DialogActions>
            <Button
              color="primary"
              onClick={onDismiss}>
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