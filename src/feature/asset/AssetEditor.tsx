import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
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
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { useSnackbar } from "notistack";
import { collection, orderBy, query } from "firebase/firestore";

import { Asset, AssetRepository } from "./Asset";
import { minimize, Type, TypeCore } from "../type/Type";
import TypePicker from "../type/TypePicker";
import QrCodeViewComponent from "../qrcode/QrCodeViewComponent";
import { typeCollection, typeName } from "../../shared/const";
import { firestore } from "../../index";
import { isDev } from "../../shared/utils";
import { usePagination } from "use-pagination-firestore";
import { ArrowDropDownRounded, CurrencyRubleRounded, ExpandMoreRounded } from "@mui/icons-material";

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
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>();
  const [type, setType] = useState<TypeCore | undefined>(props.asset?.type);
  const [isPickerOpen, setPickerOpen] = useState(false);
  const [isQRCodeOpen, setQRCodeOpen] = useState(false);

  const onPickerView = () => setPickerOpen(true);
  const onPickerDismiss = () => setPickerOpen(false);

  const onQRCodeView = () => setQRCodeOpen(true);
  const onQRCodeDismiss = () => setQRCodeOpen(false);

  const { items, isLoading, isStart, isEnd, getPrev, getNext } = usePagination<Type>(
    query(collection(firestore, typeCollection), orderBy(typeName, "asc")),
    { limit: 15 }
  );

  let previousTypeId: string | undefined = undefined;
  const onSubmit = (data: FormValues) => {
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
      AssetRepository.create(asset)
        .then(() => enqueueSnackbar(t("feedback.asset_created")))
        .catch((error) => {
          enqueueSnackbar(t("feedback.asset_create_error"))
          if (isDev) console.log(error)
        })
        .finally(props.onDismiss)
    } else {
      AssetRepository.update(asset, previousTypeId)
        .then(() => enqueueSnackbar(t("feedback.asset_updated")))
        .catch((error) => {
          enqueueSnackbar(t("feedback.asset_update_error"))
          if (isDev) console.log(error)
        })
        .finally(props.onDismiss)
    }
  }

  const onTypeChanged = (newType: Type) => {
    if (props.asset?.type !== undefined && props.asset?.type?.typeId !== newType.typeId)
      previousTypeId = props.asset?.type?.typeId;

    setType(minimize(newType));
    onPickerDismiss();
  }

  return (
    <>
      <Dialog
        fullScreen={smBreakpoint}
        fullWidth={true}
        maxWidth={smBreakpoint ? "xs" : "md"}
        open={props.isOpen}
        onClose={props.onDismiss}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogTitle>{t("dialog.details_asset")}</DialogTitle>
          <DialogContent dividers={true}>
            <Container>
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
                    autoFocus
                    id="stockNumber"
                    type="text"
                    label={t("field.stock_number")}
                    error={errors.stockNumber !== undefined}
                    helperText={errors.stockNumber?.message !== undefined ? t(errors.stockNumber.message) : undefined}
                    defaultValue={props.asset && props.asset.stockNumber}
                    placeholder={t('placeholder.stock_number')}
                    {...register("stockNumber", { required: "feedback.empty_asset_stock_number" })}/>
                  <TextField
                    id="description"
                    type="text"
                    label={t("field.asset_description")}
                    error={errors.description !== undefined}
                    helperText={errors.description?.message !== undefined ? t(errors.description.message) : undefined}
                    defaultValue={props.asset !== undefined ? props.asset.description : ""}
                    placeholder={t('placeholder.asset_description')}
                    {...register("description", { required: "feedback.empty_asset_description" })} />
                  <TextField
                    value={type?.typeName !== undefined ? type?.typeName : t("button.not_set")}
                    label={t("field.type")}
                    InputProps={{
                      readOnly: true,
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={onPickerView}>
                            <ArrowDropDownRounded/>
                          </IconButton>
                        </InputAdornment>
                      )
                    }}/>
                  <TextField
                    id="classification"
                    type="text"
                    label={t("field.classification")}
                    error={errors.classification !== undefined}
                    helperText={errors.classification?.message !== undefined ? t(errors.classification.message) : undefined}
                    defaultValue={props.asset && props.asset.classification}
                    placeholder={t('placeholder.classification')}
                    {...register('classification', { required: "feedback.empty_classification" })}/>
                </Grid>
                <Grid
                  item
                  xs={6}
                  sx={{ maxWidth: '100%', pt: 0, pl: 0 }}>
                  <TextField
                    id="unitOfMeasure"
                    type="text"
                    label={t("field.unit_of_measure")}
                    error={errors.unitOfMeasure !== undefined}
                    helperText={errors.unitOfMeasure?.message !== undefined ? t(errors.unitOfMeasure.message) : undefined}
                    defaultValue={props.asset && props.asset.unitOfMeasure}
                    placeholder={t('placeholder.unit_of_measure')}
                    {...register('unitOfMeasure', { required: 'feedback.empty_unit_of_measure' })}/>
                  <TextField
                    id="unitValue"
                    label={t("field.unit_value")}
                    error={errors.unitValue !== undefined}
                    helperText={errors.unitValue?.message !== undefined ? t(errors.unitValue.message) : undefined}
                    defaultValue={props.asset && props.asset.unitValue}
                    inputProps={{
                      inputMode: 'numeric',
                      pattern: '[0-9]*',
                      min: 0,
                      step: 0.01,
                      type: "number",
                    }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <CurrencyRubleRounded fontSize="small"/>
                        </InputAdornment>
                      )
                    }}
                    {...register('unitValue', { required: 'feedback.empty_unit_value' })}/>
                  <TextField
                    id='remarks'
                    type="text"
                    multiline
                    rows={4}
                    label={t('field.remarks')}
                    defaultValue={props.asset && props.asset.remarks}
                    {...register('remarks', { required: 'feedback.empty_asset_remarks' })}/>
                </Grid>
              </Grid>
            </Container>
          </DialogContent>

          <DialogActions>
            <Button
              color="primary"
              onClick={onQRCodeView}
              disabled={props.asset?.stockNumber === undefined}>{t("button.view_qr_code")}</Button>
            <div style={{ flex: '1 0 0' }}/>
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
      {isPickerOpen &&
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
      }
      {isQRCodeOpen && props.asset !== undefined &&
        <QrCodeViewComponent
          isOpened={isQRCodeOpen}
          assetId={props.asset.stockNumber}
          onClose={onQRCodeDismiss}/>
      }
    </>
  );
}

export default AssetEditor;