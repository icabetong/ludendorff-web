import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useForm, Controller } from "react-hook-form";
import {
  Button,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  TextField,
} from "@mui/material";
import { collection, orderBy, query } from "firebase/firestore";
import { ArrowDropDown } from "@mui/icons-material";
import { Asset } from "../asset/Asset";
import AssetPicker from "../asset/AssetPicker";
import { IssuedReportItem } from "./IssuedReport";
import { assetCollection, assetStockNumber } from "../../shared/const";
import { firestore } from "../../index";
import { newId } from "../../shared/utils";
import { usePagination } from "use-pagination-firestore";

export type FormValues = {
  unitCost: number,
  quantityIssued: number,
  responsibilityCenter: string,
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
  const { handleSubmit, formState: { errors }, reset, control, setValue, setError } = useForm<FormValues>();
  const [asset, setAsset] = useState<Asset | undefined>(undefined);
  const [isOpen, setOpen] = useState(false);

  useEffect(() => {
    if (props.isOpen) {
      reset({
        unitCost: props.item?.unitCost ? props.item?.unitCost : 0,
        quantityIssued: props.item?.quantityIssued ? props.item?.quantityIssued : 0,
        responsibilityCenter: props.item?.responsibilityCenter ? props.item?.responsibilityCenter : ""
      })
    }
  }, [props.isOpen, props.item, reset])

  const onDismiss = () => {
    reset();
    setAsset(undefined);
    props.onDismiss();
  }

  const onPickerInvoke = () => setOpen(true);
  const onPickerDismiss = () => setOpen(false);

  const { items, isLoading, isStart, isEnd, getPrev, getNext } = usePagination<Asset>(
    query(collection(firestore, assetCollection), orderBy(assetStockNumber, "asc")), { limit: 25 }
  );

  const onSubmit = (data: FormValues) => {
    if (data.unitCost < 0.01) {
      setError('unitCost', { type: 'focus', message: "feedback.cost_cannot_zero"});
      return;
    }

    if (asset) {
      let item: IssuedReportItem = {
        ...data,
        issuedReportItemId: props.item ? props.item.issuedReportItemId : newId(),
        stockNumber: asset.stockNumber,
        description: asset.description,
        unitOfMeasure: asset.unitOfMeasure,
        unitCost: data.unitCost,
        quantityIssued: parseInt(`${data.quantityIssued}`)
      }
      props.onSubmit(item);
    } else if (props.item) {
      let item: IssuedReportItem = {
        ...props.item,
        ...data,
        issuedReportItemId: props.item ? props.item.issuedReportItemId : newId(),
        quantityIssued: parseInt(`${data.quantityIssued}`),
      }
      props.onSubmit(item);
    }
    onDismiss()
  }

  const onAssetPicked = (asset: Asset) => {
    setAsset(asset);
    setValue("unitCost", asset.unitValue);
  }

  return (
    <>
      <Dialog
        fullWidth={true}
        maxWidth="xs"
        open={props.isOpen}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogTitle>{t(props.isCreate ? "dialog.issued_item_create" : "dialog.issued_item_update")}</DialogTitle>
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
                        <ArrowDropDown/>
                      </IconButton>
                    </InputAdornment>
                  )
                }}/>
              <Controller
                name="unitCost"
                control={control}
                render={({ field: { ref, ...inputProps }}) => (
                  <TextField
                    {...inputProps}
                    inputRef={ref}
                    label={t("field.unit_cost")}
                    error={errors.unitCost !== undefined}
                    disabled={!props.item ? !asset : false}
                    helperText={errors.unitCost?.message !== undefined ? t(errors.unitCost.message) : undefined}
                    inputProps={{
                      inputMode: 'numeric',
                      pattern: '[0-9]*',
                      min: 0,
                      step: 0.01,
                      type: "number"
                    }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">₱</InputAdornment>
                      )
                    }}/>
                )}/>
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
              variant="contained"
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
        onSelectItem={onAssetPicked}/>
    </>
  )
}