import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useForm, Controller } from "react-hook-form";
import {
  Box,
  Button,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  InputAdornment,
  TextField, Tooltip,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
import { useSnackbar } from "notistack";
import { collection, doc, orderBy, query, getDoc } from "firebase/firestore";

import { Asset, AssetRepository } from "./Asset";
import { minimize, Type, TypeCore } from "../type/Type";
import TypePicker from "../type/TypePicker";
import QrCodeViewComponent from "../qrcode/QrCodeViewComponent";
import { assetCollection, typeCollection, typeName } from "../../shared/const";
import { firestore } from "../../index";
import { isDev } from "../../shared/utils";
import { usePagination } from "use-pagination-firestore";
import { ExpandMoreRounded } from "@mui/icons-material";

type AssetEditorProps = {
  isOpen: boolean,
  isCreate: boolean,
  asset: Asset | undefined,
  onDismiss: () => void,
}

export type FormValues = {
  stockNumber: string,
  description: string,
  classification: string,
  unitOfMeasure: string,
  unitValue: number,
  remarks?: string,
}

const AssetEditor = (props: AssetEditorProps) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();
  const smBreakpoint = useMediaQuery(theme.breakpoints.down('sm'));
  const { handleSubmit, formState: { errors }, control, reset } = useForm<FormValues>();
  const [type, setType] = useState<TypeCore | undefined>(props.asset?.type);
  const [isPickerOpen, setPickerOpen] = useState(false);
  const [isQRCodeOpen, setQRCodeOpen] = useState(false);
  const [isWriting, setWriting] = useState(false);

  useEffect(() => {
    setType(props.asset?.type)
  }, [props.asset])

  useEffect(() => {
    if (props.isOpen) {
      reset({
        stockNumber: props.asset ? props.asset.stockNumber : "",
        description: props.asset?.description ? props.asset.description : "",
        classification: props.asset?.classification ? props.asset.classification : "",
        unitOfMeasure: props.asset?.unitOfMeasure ? props.asset.unitOfMeasure : "",
        unitValue: props.asset?.unitValue ? props.asset.unitValue : 0,
        remarks: props.asset?.remarks ? props.asset.remarks : ""
      })
    }
  }, [props.isOpen, props.asset, reset])

  const onDismiss = () => {
    setWriting(false);
    props.onDismiss();
  }

  const onPickerView = () => setPickerOpen(true);
  const onPickerDismiss = () => setPickerOpen(false);

  const onQRCodeView = () => setQRCodeOpen(true);
  const onQRCodeDismiss = () => setQRCodeOpen(false);

  const { items, isLoading, isStart, isEnd, getPrev, getNext } = usePagination<Type>(
    query(collection(firestore, typeCollection), orderBy(typeName, "asc")),
    { limit: 15 }
  );

  let previousTypeId: string | undefined = undefined;
  const onSubmit = async (data: FormValues) => {
    if (!data.stockNumber) {
      return;
    }

    const asset: Asset = {
      ...data,
      stockNumber: props.asset ? props.asset?.stockNumber : data.stockNumber,
      type: type !== undefined ? type : undefined,
      unitValue: parseFloat(`${data.unitValue}`)
    }


    if (props.isCreate) {
      let reference = doc(firestore, assetCollection, data.stockNumber);
      let snapshot = await getDoc(reference);
      if (snapshot.exists()) {
        enqueueSnackbar(t("feedback.stock_number_already_exists"), { variant: "error" } );
        return;
      }

      setWriting(true);
      AssetRepository.create(asset)
        .then(() => enqueueSnackbar(t("feedback.asset_created")))
        .catch((error) => {
          enqueueSnackbar(t("feedback.asset_create_error"))
          if (isDev) console.log(error)
        })
        .finally(onDismiss)
    } else {
      setWriting(true);
      AssetRepository.update(asset, previousTypeId)
        .then(() => enqueueSnackbar(t("feedback.asset_updated")))
        .catch((error) => {
          enqueueSnackbar(t("feedback.asset_update_error"))
          if (isDev) console.log(error)
        })
        .finally(onDismiss)
    }
  }

  const onTypeChanged = (newType: Type) => {
    if (props.asset?.type !== undefined && props.asset?.type?.typeId !== newType.typeId)
      previousTypeId = props.asset?.type?.typeId;

    setType(minimize(newType));
    onPickerDismiss();
  }

  const stockNumberField = (
    <Controller
      control={control}
      name="stockNumber"
      render={( { field: { ref, ...inputProps } }) => (
        <TextField
          {...inputProps}
          autoFocus
          type="text"
          inputRef={ref}
          label={t("field.stock_number")}
          error={errors.stockNumber !== undefined}
          disabled={isWriting || Boolean(props.asset)}
          helperText={errors.stockNumber?.message !== undefined ? t(errors.stockNumber.message) : undefined}
          placeholder={t('placeholder.stock_number')}/>
      )}
      rules={{ required: { value: true, message: "feedback.empty_asset_stock_number" }}}/>
  )

  return (
    <>
      <Dialog
        fullWidth={true}
        maxWidth={smBreakpoint ? "xs" : "md"}
        open={props.isOpen}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogTitle>{t("dialog.details_asset")}</DialogTitle>
          <DialogContent dividers={true}>
            <Container sx={{ py: 1 }}>
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
                  { props.asset
                    ? <Tooltip title={<>{t("info.stock_number_cannot_be_changed")}</>}>
                        <span>{stockNumberField}</span>
                      </Tooltip>
                    : stockNumberField
                  }
                  <Controller
                    control={control}
                    name="description"
                    render={( { field: { ref, ...inputProps }}) => (
                      <TextField
                        {...inputProps}
                        type="text"
                        inputRef={ref}
                        label={t("field.asset_description")}
                        error={errors.description !== undefined}
                        disabled={isWriting}
                        helperText={errors.description?.message !== undefined ? t(errors.description.message) : undefined}
                        placeholder={t('placeholder.asset_description')} />
                    )}
                    rules={{ required: { value: true, message: "feedback.empty_asset_description" }}}/>
                  <TextField
                    value={type?.typeName !== undefined ? type?.typeName : t("field.not_set")}
                    label={t("field.type")}
                    disabled={isWriting}
                    InputProps={{
                      readOnly: true,
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={onPickerView} edge="end">
                            <ExpandMoreRounded/>
                          </IconButton>
                        </InputAdornment>
                      )
                    }}/>
                  <Controller
                    control={control}
                    name="classification"
                    render={({ field: { ref, ...inputProps }}) => (
                      <TextField
                        {...inputProps}
                        type="text"
                        inputRef={ref}
                        label={t("field.classification")}
                        error={errors.classification !== undefined}
                        disabled={isWriting}
                        helperText={errors.classification?.message !== undefined ? t(errors.classification.message) : undefined}
                        placeholder={t('placeholder.classification')}/>
                    )}
                    rules={{ required: { value: true, message: "feedback.empty_classification" }}}/>
                </Grid>
                <Grid
                  item
                  xs={6}
                  sx={{ maxWidth: '100%', pt: 0, pl: 0 }}>
                  <Controller
                    control={control}
                    name="unitOfMeasure"
                    render={({ field: { ref, ...inputProps }}) => (
                      <TextField
                        {...inputProps}
                        type="text"
                        inputRef={ref}
                        label={t("field.unit_of_measure")}
                        error={errors.unitOfMeasure !== undefined}
                        disabled={isWriting}
                        helperText={errors.unitOfMeasure?.message !== undefined ? t(errors.unitOfMeasure.message) : undefined}
                        placeholder={t('placeholder.unit_of_measure')}/>
                    )}
                    rules={{ required: { value: true, message: "feedback.empty_unit_of_measure" }}}/>
                  <Controller
                    control={control}
                    name="unitValue"
                    render={({ field: { ref, ...inputProps }}) => (
                      <TextField
                        {...inputProps}
                        inputRef={ref}
                        label={t("field.unit_value")}
                        error={errors.unitValue !== undefined}
                        disabled={isWriting}
                        helperText={errors.unitValue?.message !== undefined ? t(errors.unitValue.message) : undefined}
                        inputProps={{
                          inputMode: 'numeric',
                          pattern: '[0-9]*',
                          min: 0,
                          step: 0.01,
                          type: "number",
                        }}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">₱</InputAdornment>
                          )
                        }}/>
                    )}
                    rules={{ required: { value: true, message: "feedback.empty_unit_value" }}}/>
                  <Controller
                    control={control}
                    name="remarks"
                    render={({ field: { ref, ...inputProps } }) => (
                      <TextField
                        {...inputProps}
                        multiline
                        type="text"
                        inputRef={ref}
                        rows={4}
                        label={t('field.remarks')}
                        disabled={isWriting}/>
                    )}/>
                </Grid>
              </Grid>
            </Container>
          </DialogContent>
          <DialogActions>
            <Button
              color="primary"
              onClick={onQRCodeView}
              disabled={props.asset?.stockNumber === undefined || isWriting}>
              {t("button.view_qr_code")}
            </Button>
            <Box sx={{ flex: '1 0 0' }}/>
            <Button
              color="primary"
              disabled={isWriting}
              onClick={props.onDismiss}>
              {t("button.cancel")}
            </Button>
            <LoadingButton
              loading={isWriting}
              color="primary"
              type="submit">
              {t("button.save")}
            </LoadingButton>
          </DialogActions>
        </form>
      </Dialog>
      <TypePicker
        isOpen={isPickerOpen}
        types={items}
        isLoading={isLoading}
        onDismiss={onPickerDismiss}
        onSelectItem={onTypeChanged}
        canBack={isStart}
        canForward={isEnd}
        onBackward={getPrev}
        onForward={getNext}/>
      { props.asset &&
        <QrCodeViewComponent
          isOpened={isQRCodeOpen}
          assetId={props.asset.stockNumber}
          onClose={onQRCodeDismiss}/>
      }
    </>
  );
}

export default AssetEditor;