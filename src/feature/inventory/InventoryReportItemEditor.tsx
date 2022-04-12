import { InventoryReportItem } from "./InventoryReport";
import { useTranslation } from "react-i18next";
import { useForm, Controller } from "react-hook-form";
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
import { Asset } from "../asset/Asset";
import { useState, useEffect } from "react";
import AssetPicker from "../asset/AssetPicker";
import { usePagination } from "use-pagination-firestore";
import { collection, orderBy, query } from "firebase/firestore";
import { firestore } from "../../index";
import { assetCollection, assetStockNumber } from "../../shared/const";
import { ExpandMoreRounded } from "@mui/icons-material";

export type FormValues = {
  balancePerCard: number,
  onHandCount: number,
  supplier: string,
}

type InventoryReportItemEditorProps = {
  isOpen: boolean,
  isCreate: boolean,
  item?: InventoryReportItem,
  onSubmit: (item: InventoryReportItem) => void,
  onDismiss: () => void,
}

export const InventoryReportItemEditor = (props: InventoryReportItemEditorProps) => {
  const { t } = useTranslation();
  const { register, handleSubmit, formState: { errors }, reset, control } = useForm<FormValues>();
  const [asset, setAsset] = useState<Asset | undefined>(undefined);
  const [isOpen, setOpen] = useState(false);

  useEffect(() => {
    if (props.isOpen) {
      reset({
        balancePerCard: props.item?.balancePerCard ? props.item?.balancePerCard : 0,
        onHandCount: props.item?.onHandCount ? props.item?.onHandCount : 0,
        supplier: props.item?.supplier ? props.item?.supplier : "",
      })
    }
  }, [props.isOpen, props.item, reset])

  const onPickerInvoke = () => setOpen(true);
  const onPickerDismiss = () => setOpen(false);

  const { items, isLoading, isStart, isEnd, getPrev, getNext } = usePagination<Asset>(
    query(collection(firestore, assetCollection), orderBy(assetStockNumber, "asc")), { limit: 15 }
  )

  const onDismiss = () => {
    props.onDismiss();
    reset();
  }

  const onSubmit = (values: FormValues) => {
    if (!asset) {
      return;
    }

    let item: InventoryReportItem = {
      stockNumber: asset.stockNumber,
      article: asset.classification,
      description: asset.description,
      type: asset.type,
      unitOfMeasure: asset.unitOfMeasure,
      unitValue: asset.unitValue,
      remarks: asset.remarks,
      balancePerCard: parseFloat(`${values.balancePerCard}`),
      onHandCount: parseFloat(`${values.onHandCount}`)
    }
    props.onSubmit(item);
    reset();
  }

  return (
    <>
      <Dialog
        fullWidth={true}
        maxWidth="xs"
        open={props.isOpen}
        onClose={onDismiss}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogTitle>{t("dialog.details_inventory_item")}</DialogTitle>
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
                name="balancePerCard"
                control={control}
                render={({ field: { ref, ...inputProps }}) => (
                  <TextField
                    {...inputProps}
                    autoFocus
                    type="number"
                    inputRef={ref}
                    label={t("field.balance_per_card")}
                    error={errors.balancePerCard !== undefined}
                    helperText={errors.balancePerCard?.message && t(errors.balancePerCard?.message)}
                    disabled={!props.item ? !asset : false}
                    inputProps={{ inputMode: 'numeric', pattern: '[0-9]*', min: 0 }}/>
                )}
                rules={{ required: { value: true, message: "feedback.empty_balance_per_card" }}}/>
              <Controller
                name="onHandCount"
                control={control}
                render={({ field: { ref, ...inputProps } }) => (
                  <TextField
                    {...inputProps}
                    type="number"
                    inputRef={ref}
                    label={t("field.on_hand_count")}
                    error={errors.onHandCount !== undefined}
                    helperText={errors.onHandCount?.message && t(errors.onHandCount?.message)}
                    disabled={!props.item ? !asset : false}
                    inputProps={{ inputMode: 'numeric', pattern: '[0-9]*', min: 0 }}/>
                )}
                rules={{ required: { value: true, message: "feedback.empty_on_hand_count" }}}/>
              <Controller
                name="supplier"
                control={control}
                render={({ field: { ref, ...inputProps }}) => (
                  <TextField
                    {...inputProps}
                    type="text"
                    inputRef={ref}
                    label={t("field.supplier")}
                    error={errors.supplier !== undefined}
                    helperText={errors.supplier?.message && t(errors.supplier?.message)}
                    disabled={!asset}/>
                )}/>
            </Container>
          </DialogContent>
          <DialogActions>
            <Button
              color="primary"
              onClick={onDismiss}>{t("button.cancel")}</Button>
            <Button
              color="primary"
              type="submit">{t("button.save")}</Button>
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
  );
}