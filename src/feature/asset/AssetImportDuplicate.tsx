import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useForm, Controller } from "react-hook-form";
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContentText,
  DialogContent,
  DialogTitle,
  Grid,
  Snackbar,
  TextField,
  Typography,
  InputAdornment,
  IconButton,
  MenuItem,
} from "@mui/material";
import { useSnackbar } from "notistack";
import { ArrowDropDownOutlined, ContentCopyRounded } from "@mui/icons-material";
import { query, collection, orderBy, limit } from "firebase/firestore";
import { AssetImport } from "./AssetImport";
import AssetImportDuplicateList from "./AssetImportDuplicateList";
import { Category, CategoryCore, CategoryRepository, minimize } from "../category/Category";
import CategoryPicker from "../category/CategoryPicker";
import usePagination from "../shared/hooks/usePagination";
import { GroupedArray } from "../shared/types/GroupedArray";
import { CurrencyFormatCustom } from "../../components";
import { categoryCollection, categoryId, } from "../../shared/const";
import { groupBy, isDev } from "../../shared/utils";
import { firestore } from "../../index";
import EmptyStates from "../state/EmptyStates";

type FormValues = {
  id: string,
  status: "exists" | "duplicate" | "absent"
  stockNumber: string,
  description?: string,
  subcategory?: string,
  unitOfMeasure?: string,
  unitValue: number,
  remarks?: string
}

type AssetImportDuplicateProps = {
  isOpen: boolean,
  assets: AssetImport[],
  stockNumbers: string[],
  onContinue: (assets: GroupedArray<AssetImport>) => void,
}
const AssetImportDuplicate = (props: AssetImportDuplicateProps) => {
  const { t } = useTranslation();
  const { handleSubmit, formState: { errors }, control, reset, watch, setError } = useForm<FormValues>();
  const { enqueueSnackbar } = useSnackbar();
  const [duplicates, setDuplicates] = useState<GroupedArray<AssetImport>>({});
  const [category, setCategory] = useState<CategoryCore | undefined>(undefined);
  const [subcategories, setSubcategories] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  let hasDuplicate = Array.from(Object.values(duplicates)).every((item: AssetImport[]) => item.length > 1);

  const { items, isLoading, error, canBack, canForward, onBackward, onForward } = usePagination<Category>(
    query(collection(firestore, categoryCollection), orderBy(categoryId, "asc"), limit(25)),
    categoryId, 25
  );

  const onCategoryPickerInvoke = () => setOpen(true);
  const onCategoryPickerDismiss = () => setOpen(false);
  const onCategoryPickerSelect = (category: Category) => setCategory(minimize(category));

  useEffect(() => {
    reset({
      id: "",
      status: "absent",
      stockNumber: "",
      description: "",
      subcategory: "",
      unitOfMeasure: "",
      unitValue: 0,
      remarks: "",
    })
  }, [reset]);

  useEffect(() => {
    let grouped = groupBy(props.assets, "stockNumber");
    setDuplicates(Object.fromEntries(grouped));
  }, [props.assets]);

  useEffect(() => {
    let categoryId = category?.categoryId;
    if (categoryId) {
      CategoryRepository.fetch(categoryId)
        .then((data) => {
          if (data) setSubcategories(data.subcategories);
        }).catch((err) => {
        if (isDev) console.log(err);
      });
    }
  }, [category]);

  const onSubmit = async (data: FormValues) => {
    if (props.stockNumbers.includes(data.stockNumber)) {
      setError('stockNumber', { type: 'focus', message: "feedback.stock_number_already_exists"});
      return;
    }
    
    if (!category) {
      return;
    }

    let imported: AssetImport = {
      ...data,
      category: category,
    }
    let current: GroupedArray<AssetImport> = duplicates;
    Array.from(Object.keys(current)).forEach((stockNumber) => {
      let assets: AssetImport[] = current[stockNumber];
      assets = assets.filter((item) => item.id !== data.id);
      current[stockNumber] = assets;
    });

    let assets: AssetImport[] = current[data.stockNumber];
    if (assets) {
      assets = assets.filter((item) => item.id !== data.id);
    } else assets = [];

    assets = assets.concat([imported]);
    setDuplicates(() => {
      return {
        ...current,
        [data.stockNumber]: assets,
      }
    })
  }

  const onItemSelected = (asset: AssetImport) => {
    reset({
      id: asset.id,
      status: asset.status,
      stockNumber: asset.stockNumber,
      description: asset.description,
      subcategory: asset.subcategory,
      unitOfMeasure: asset.unitOfMeasure,
      unitValue: asset.unitValue,
      remarks: asset.remarks,
    });

    if (asset.category?.categoryId !== category?.categoryId)
      setCategory(asset.category);
  }

  const onItemRemoved = (asset: AssetImport) => {
    let assets = duplicates[asset.stockNumber];
    if (!assets)
      return;

    if (assets.length <= 1) {
      enqueueSnackbar(t("feedback.cannot_delete_asset"));
      return;
    }

    assets = assets.filter((item: AssetImport) => item !== asset);
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
    <>
      <Dialog open={props.isOpen} maxWidth="md" fullWidth>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogTitle>{t("dialog.duplicate_asset_items")}</DialogTitle>
          <DialogContent>
            <DialogContentText>{t("dialog.duplicate_asset_items_summary")}</DialogContentText>
            { hasDuplicate
             ? <Box sx={{ marginTop: 2 }}>
              <Typography variant="body2">{t("field.duplicate_items")}</Typography>
                 <Grid container>
                    <Grid item xs={6}>
                      <AssetImportDuplicateList
                        assets={duplicates}
                        currentId={watch('id')}
                        onItemSelected={onItemSelected}
                        onItemRemoved={onItemRemoved}/>
                    </Grid>
                    <Grid item xs={6}>
                      <Box sx={{ marginX: 2, display: 'flex', flexDirection: "column", alignItems: 'end' }}>
                        <Controller
                          name="id"
                          control={control}
                          render={({ field: { ref, ...inputProps }}) => (
                            <input hidden ref={ref} {...inputProps}/>
                          )}/>
                        <Controller
                          name="status"
                          control={control}
                          render={({ field: { ref, ...inputProps }}) => (
                            <input hidden ref={ref} {...inputProps}/>
                          )}/>
                        <Controller
                          name="stockNumber"
                          control={control}
                          render={({ field: { ref, ...inputProps }}) => (
                            <TextField
                              {...inputProps}
                              autoFocus
                              type="text"
                              inputRef={ref}
                              label={t("field.stock_number")}
                              helperText={errors.stockNumber?.message ? t(errors.stockNumber.message) : undefined}
                            />
                          )}
                          rules={{ required: { value: true, message: "feedback.empty_asset_stock_number" } }}/>
                        <Controller
                          name="description"
                          control={control}
                          render={({ field: { ref, ...inputProps }}) => (
                            <TextField
                              {...inputProps}
                              type="text"
                              inputRef={ref}
                              label={t("field.asset_description")}
                              helperText={errors.description?.message ? t(errors.description.message) : undefined}/>
                          )}
                          rules={{ required: { value: true, message: "feedback.empty_asset_description" }}}/>
                        <TextField
                          value={category?.categoryName ? category?.categoryName : t("field.not_set")}
                          label={t("field.category")}
                          InputProps={{
                            readOnly: true,
                            endAdornment: (
                              <InputAdornment position="end">
                                <IconButton onClick={onCategoryPickerInvoke} edge="end">
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
                                label={t("field.subcategory")}>
                                {subcategories.map((subcategory) => {
                                  return (
                                    <MenuItem
                                      key={subcategory}
                                      value={subcategory}>
                                      {subcategory}
                                    </MenuItem>
                                  );
                                })
                                }
                              </TextField>
                            )}
                            rules={{ required: { value: true, message: "feedback.empty_subcategory" }}}/>
                        }
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
                              helperText={errors.unitOfMeasure?.message ? t(errors.unitOfMeasure.message) : undefined }/>
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
                              InputProps={{
                                startAdornment: (
                                  <InputAdornment position="start">₱</InputAdornment>
                                ),
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
                              label={t('field.remarks')}/>
                          )}/>
                        <Button
                          variant="outlined"
                          type="submit">
                          {t("button.save")}
                        </Button>
                      </Box>
                    </Grid>
                  </Grid>
              </Box>
              : <EmptyStates
                  icon={ContentCopyRounded}
                  title={t("empty.no_duplicates_header")}
                  subtitle={t("empty.no_duplicates_summary")}/>
            }
          </DialogContent>
          <DialogActions>
            <Button
              variant="contained"
              disabled={hasDuplicate}
              onClick={onContinue}>
              {t("button.continue")}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
      <CategoryPicker
        isOpen={open}
        categories={items}
        isLoading={isLoading}
        canBack={canBack}
        canForward={canForward}
        onBackward={onBackward}
        onForward={onForward}
        onDismiss={onCategoryPickerDismiss}
        onSelectItem={onCategoryPickerSelect}/>
      <Snackbar open={Boolean(error)}>
        <Alert severity="error">
          {error?.message}
        </Alert>
      </Snackbar>
    </>
  )
}

export default AssetImportDuplicate;