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
  Grid,
  IconButton,
  InputAdornment,
  TextField,
  useTheme,
  useMediaQuery
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
  unitValue: number,
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
  const theme = useTheme();
  const smBreakpoint = useMediaQuery(theme.breakpoints.down('sm'));
  const { handleSubmit, formState: { errors }, reset, control, setValue } = useForm<FormValues>();
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
    if (asset) {
      let item: InventoryReportItem = {
        stockNumber: asset.stockNumber,
        article: asset.subcategory,
        description: asset.description,
        category: asset.category,
        unitOfMeasure: asset.unitOfMeasure,
        unitValue: asset.unitValue,
        remarks: asset.remarks,
        balancePerCard: parseFloat(`${values.balancePerCard}`),
        onHandCount: parseFloat(`${values.onHandCount}`)
      }
      props.onSubmit(item);
    } else if (props.item) {
      let item: InventoryReportItem = {
        ...props.item,
        balancePerCard: parseFloat(`${values.balancePerCard}`),
        onHandCount: parseFloat(`${values.onHandCount}`)
      }
      props.onSubmit(item);
    }
  }

  const onAssetPicked = (asset: Asset) => {
    setAsset(asset);
    setValue("unitValue", asset.unitValue);
  }

  return (
    <>
      <Dialog
        fullWidth={true}
        maxWidth={smBreakpoint ? "xs" : "sm"}
        open={props.isOpen}
        onClose={onDismiss}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogTitle>{t("dialog.details_inventory_item")}</DialogTitle>
          <DialogContent>
            <Container disableGutters>
              <Grid
                container
                direction={smBreakpoint ? "column" : "row"}
                alignItems="stretch"
                justifyContent="center"
                spacing={smBreakpoint ? 0 : 4}>
                <Grid
                  item
                  xs={6}
                  sx={{ maxWidth: '100%', pt: 0, pl: 0 }}>
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
                  <Controller
                    name="unitValue"
                    control={control}
                    render={({ field: { ref, ...inputProps }}) => (
                      <TextField
                        {...inputProps}
                        inputRef={ref}
                        label={t("field.unit_value")}
                        error={errors.unitValue !== undefined}
                        disabled={!props.item ? !asset : false}
                        helperText={errors.unitValue?.message !== undefined ? t(errors.unitValue.message) : undefined}
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
                </Grid>
                <Grid
                  item
                  xs={6}
                  sx={{ maxWidth: '100%', pt: 0, pl: 0 }}>
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
                </Grid>
              </Grid>
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
        onSelectItem={onAssetPicked}/>
    </>
  );
}