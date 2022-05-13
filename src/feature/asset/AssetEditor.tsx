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
  MenuItem,
  TextField,
  Tooltip,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
import { useSnackbar } from "notistack";
import { collection, doc, orderBy, query, getDoc } from "firebase/firestore";

import { Asset, AssetRepository } from "./Asset";
import { minimize, Category, CategoryCore, CategoryRepository } from "../category/Category";
import CategoryPicker from "../category/CategoryPicker";
import QrCodeViewComponent from "../qrcode/QrCodeViewComponent";
import { assetCollection, categoryCollection, categoryName } from "../../shared/const";
import { firestore } from "../../index";
import { isDev } from "../../shared/utils";
import { usePagination } from "use-pagination-firestore";
import { ArrowDropDownOutlined } from "@mui/icons-material";
import useQueryLimit from "../shared/hooks/useQueryLimit";
import { CurrencyFormatCustom } from "../../components";

type AssetEditorProps = {
  isOpen: boolean,
  isCreate: boolean,
  asset: Asset | undefined,
  onDismiss: () => void,
}

export type FormValues = {
  stockNumber: string,
  description: string,
  subcategory: string,
  unitOfMeasure: string,
  unitValue: number,
  remarks?: string,
}

const AssetEditor = (props: AssetEditorProps) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();
  const smBreakpoint = useMediaQuery(theme.breakpoints.down('sm'));
  const { handleSubmit, formState: { errors }, control, reset, setValue } = useForm<FormValues>();
  const [category, setCategory] = useState<CategoryCore | undefined>(props.asset?.category);
  const [subcategories, setSubcategories] = useState<string[]>([]);
  const [isPickerOpen, setPickerOpen] = useState(false);
  const [isQRCodeOpen, setQRCodeOpen] = useState(false);
  const [isWriting, setWriting] = useState(false);
  const { limit } = useQueryLimit('categoryQueryLimit');

  useEffect(() => {
    setCategory(props.asset?.category);
    let categoryId = category?.categoryId;
    if (categoryId) {
      CategoryRepository.fetch(categoryId)
        .then((data) => {
          if (data) setSubcategories(data.subcategories);
        }).catch((err) => {
        if (isDev) console.log(err);
      });
    }
  }, [props.asset]);

  useEffect(() => {
    if (props.isOpen) {
      reset({
        stockNumber: props.asset ? props.asset.stockNumber : "",
        description: props.asset?.description ? props.asset.description : "",
        subcategory: props.asset?.subcategory ? props.asset.subcategory : "",
        unitOfMeasure: props.asset?.unitOfMeasure ? props.asset.unitOfMeasure : "",
        unitValue: props.asset?.unitValue ? props.asset.unitValue : 0,
        remarks: props.asset?.remarks ? props.asset.remarks : ""
      })
    }
  }, [props.isOpen, props.asset, reset]);

  const onDismiss = () => {
    setWriting(false);
    props.onDismiss();
  }

  const onPickerView = () => setPickerOpen(true);
  const onPickerDismiss = () => setPickerOpen(false);

  const onQRCodeView = () => setQRCodeOpen(true);
  const onQRCodeDismiss = () => setQRCodeOpen(false);

  const { items, isLoading, isStart, isEnd, getPrev, getNext } = usePagination<Category>(
    query(collection(firestore, categoryCollection), orderBy(categoryName, "asc")),
    { limit: limit }
  );

  let previousTypeId: string | undefined = undefined;
  const onSubmit = async (data: FormValues) => {
    if (!data.stockNumber) {
      return;
    }

    const asset: Asset = {
      ...data,
      stockNumber: props.asset ? props.asset?.stockNumber : data.stockNumber,
      category: category !== undefined ? category : undefined,
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

  const onCategoryChanged = (newCategory: Category) => {
    if (props.asset?.category !== undefined && props.asset?.category?.categoryId !== newCategory.categoryId)
      previousTypeId = props.asset?.category?.categoryId;

    setCategory(minimize(newCategory));
    if (newCategory.subcategories.length > 0) {
      setSubcategories(newCategory.subcategories);
      if (newCategory !== category) {
        setValue("subcategory", newCategory.subcategories[0]);
      }
    }
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
          <DialogTitle>{t(props.isCreate ? "dialog.asset_create" : "dialog.asset_update")}</DialogTitle>
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
                    value={category?.categoryName !== undefined ? category?.categoryName : t("field.not_set")}
                    label={t("field.category")}
                    disabled={isWriting}
                    InputProps={{
                      readOnly: true,
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={onPickerView} edge="end">
                            <ArrowDropDownOutlined/>
                          </IconButton>
                        </InputAdornment>
                      )
                    }}/>
                  { category &&
                    <Controller
                      control={control}
                      name="subcategory"
                      render={({ field: { ref, ...inputProps } }) => (
                        <TextField
                          select
                          {...inputProps}
                          inputRef={ref}
                          label={t("field.subcategory")}
                          disabled={isWriting}>
                          {subcategories.map((subcategory) => {
                            return <MenuItem key={subcategory} value={subcategory}>{subcategory}</MenuItem>
                          })
                          }
                        </TextField>
                      )}
                      rules={{ required: { value: true, message: "feedback.empty_subcategory" }}}/>
                  }
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
                        InputProps={{
                          startAdornment: <InputAdornment position="start">₱</InputAdornment>,
                          inputComponent: CurrencyFormatCustom as any
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
              variant="contained"
              color="primary"
              type="submit">
              {t("button.save")}
            </LoadingButton>
          </DialogActions>
        </form>
      </Dialog>
      <CategoryPicker
        isOpen={isPickerOpen}
        categories={items}
        isLoading={isLoading}
        onDismiss={onPickerDismiss}
        onSelectItem={onCategoryChanged}
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