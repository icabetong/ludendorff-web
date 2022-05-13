import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useForm, Controller } from "react-hook-form";
import {
  Button,
  Container,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  InputAdornment,
  IconButton,
  MenuItem,
  TextField,
  useTheme,
  useMediaQuery
} from "@mui/material";
import { useSnackbar } from "notistack";
import { ArrowDropDownOutlined } from "@mui/icons-material";
import { query, collection, orderBy, doc, getDoc } from "firebase/firestore";
import { usePagination } from "use-pagination-firestore";
import { AssetImport } from "./AssetImport";
import { Category, CategoryCore, minimize } from "../category/Category";
import { firestore } from "../../index";
import { categoryCollection, categoryName } from "../../shared/const";
import useQueryLimit from "../shared/hooks/useQueryLimit";
import CategoryPicker from "../category/CategoryPicker";
import { isDev } from "../../shared/utils";

type AssetImportEditorProps = {
  isOpen: boolean,
  asset?: AssetImport,
  onSubmit: (asset: AssetImport, previousStockNumber: string | undefined) => void,
  onDismiss: () => void,
}
type FormValues = {
  id: string,
  stockNumber: string,
  description: string,
  subcategory: string,
  unitOfMeasure: string,
  unitValue: number,
  remarks?: string,
}

const AssetImportEditor = (props: AssetImportEditorProps) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const smBreakpoint = useMediaQuery(theme.breakpoints.down('sm'));
  const { enqueueSnackbar } = useSnackbar();
  const { handleSubmit, formState: { errors }, control, reset, setValue } = useForm<FormValues>();
  const { limit } = useQueryLimit('categoryQueryLimit');
  const [isPickerOpen, setPickerOpen] = useState(false);
  const [category, setCategory] = useState<CategoryCore | undefined>(props.asset?.category);
  const [subcategories, setSubcategories] = useState<string[]>([]);
  const currentStockNumber = props.asset?.stockNumber;

  useEffect(() => {
    const onFetchSubcategories = async () => {
      if (props.asset?.category) {
        let reference = doc(firestore, categoryCollection, props.asset?.category.categoryId);
        let snapshot = await getDoc(reference);
        return snapshot.data() as Category;
      }
      return null;
    }

    setCategory(props.asset?.category);
    onFetchSubcategories()
      .then((data) => {
        if (data) setSubcategories(data.subcategories);
      }).catch((err) => {
      if (isDev) console.log(err);
    });
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

  const onPickerView = () => setPickerOpen(true);
  const onPickerDismiss = () => setPickerOpen(false);

  const onCategorySelected = (newCategory: Category) => {
    setCategory(minimize(newCategory));
    if (newCategory.subcategories.length > 0) {
      setSubcategories(newCategory.subcategories);
      if (category !== newCategory) {
        setValue("subcategory", newCategory.subcategories[0]);
      }
    }
    onPickerDismiss();
  }

  const { items, isLoading, isStart, isEnd, getPrev, getNext } = usePagination<Category>(
    query(collection(firestore, categoryCollection), orderBy(categoryName, "asc")), {
      limit: limit
    }
  );

  const onSubmit = (data: FormValues) => {
    if (!data.stockNumber) {
      return;
    }

    const asset: AssetImport = {
      ...data,
      stockNumber: data.stockNumber,
      category: category !== undefined ? category : undefined,
      unitValue: parseFloat(`${data.unitValue}`),
      status: props.asset ? props.asset?.status : "absent",
    }

    enqueueSnackbar(t("feedback.asset_saved"));
    props.onSubmit(asset, currentStockNumber);
  }

  return (
    <>
      <Dialog open={props.isOpen} maxWidth={smBreakpoint ? "xs" : "md"} fullWidth>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogTitle>{t("dialog.details_asset")}</DialogTitle>
          <DialogContent dividers={true}>
            <Container sx={{ py: 1}}>
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
                  <Controller
                    control={control}
                    name="id"
                    render={({ field: { ref, ...inputProps }}) => (
                      <input hidden ref={ref} {...inputProps}/>
                    )}/>
                  <Controller
                    control={control}
                    name="stockNumber"
                    render={({ field: { ref, ...inputProps }}) => (
                      <TextField
                        {...inputProps}
                        type="text"
                        inputRef={ref}
                        label={t("field.stock_number")}
                        error={errors.stockNumber !== undefined}
                        helperText={errors.stockNumber?.message !== undefined ? t(errors.stockNumber.message) : undefined}
                        placeholder={t('placeholder.stock_number')}/>
                    )}/>
                  <Controller
                    control={control}
                    name="description"
                    render={({ field: { ref, ...inputProps }}) => (
                      <TextField
                        {...inputProps}
                        type="text"
                        inputRef={ref}
                        label={t("field.asset_description")}
                        helperText={errors.description?.message !== undefined ? t(errors.description.message) : undefined}
                        error={errors.description !== undefined}/>
                    )}
                    rules={{ required: { value: true, message: "feedback.empty_asset_description" }}}/>
                  <TextField
                    value={category?.categoryName !== undefined ? category?.categoryName : t("field.not_set")}
                    label={t("field.category")}
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
                      render={({ field: { ref, ...inputProps }}) => (
                        <TextField
                          select
                          {...inputProps}
                          inputRef={ref}
                          label={t("field.subcategory")}>
                          { subcategories.map((sub) => {
                            return <MenuItem key={sub} value={sub}>{sub}</MenuItem>
                          })}
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
                        helperText={errors.unitOfMeasure?.message !== undefined ? t(errors.unitOfMeasure.message) : undefined}/>
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
                        label={t('field.remarks')}/>
                    )}/>
                </Grid>
              </Grid>
            </Container>
          </DialogContent>
          <DialogActions>
            <Button onClick={props.onDismiss}>{t("button.cancel")}</Button>
            <Button type="submit">{t("button.save")}</Button>
          </DialogActions>
        </form>
      </Dialog>
      <CategoryPicker
        categories={items}
        isOpen={isPickerOpen}
        isLoading={isLoading}
        canBack={isStart}
        canForward={isEnd}
        onBackward={getPrev}
        onForward={getNext}
        onDismiss={onPickerDismiss}
        onSelectItem={onCategorySelected}/>
    </>
  )
}

export default AssetImportEditor;