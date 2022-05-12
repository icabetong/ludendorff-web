import { useState, useEffect, useReducer } from "react";
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
  Divider,
  FormLabel,
  TextField,
  Typography,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
import { AddRounded } from "@mui/icons-material";
import { useSnackbar } from "notistack";
import { Category, CategoryRepository } from "./Category";
import SubcategoryEditor from "./SubcategoryEditor";
import { initialState, reducer } from "./SubcategoryEditorReducer";
import SubcategoryList from "./SubcategoryList";
import { isDev, newId } from "../../shared/utils";

type FormData = {
  categoryName?: string
}

type CategoryEditorProps = {
  isOpen: boolean,
  isCreate: boolean,
  category: Category | undefined,
  onDismiss: () => void,
}

const CategoryEditor = (props: CategoryEditorProps) => {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const [isWritePending, setWritePending] = useState(false);
  const [subcategories, setSubcategories] = useState<string[]>([]);
  const { handleSubmit, formState: { errors }, control, setValue } = useForm<FormData>();
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    if (props.isOpen) {
      setValue("categoryName", props.category ? props.category?.categoryName : "");
      setSubcategories(props.category ? props.category.subcategories : []);
    }
  }, [setValue, props.category, props.isOpen]);

  const onEditorCreate = () => dispatch({ type: "create" });
  const onEditorUpdate = (subcategory: string) => dispatch({ type: "update", payload: subcategory });
  const onEditorDismiss = () => dispatch({ type: "dismiss" });
  const onEditorCommit = (subcategory: string) => {
    let lowerCased = subcategory.toLowerCase();
    let result = subcategories.find(str => str.toLowerCase() === lowerCased);
    if (result) {
      enqueueSnackbar(t("feedback.subcategory_already_exists"))
      return;
    }
    setSubcategories((prev) => prev.concat(subcategory));
    onEditorDismiss();
  }
  const onSubcategoryRemove = (subcategory: string) => {
    let lowerCased = subcategory.toLowerCase();
    let sub = subcategories.filter((str) => str.toLowerCase() !== lowerCased);
    setSubcategories(sub);
    enqueueSnackbar(t("feedback.subcategory_removed"));
  }

  const onDismiss = () => {
    setWritePending(false);
    props.onDismiss();
  }

  const onSubmit = (data: FormData) => {
    setWritePending(true);

    let category: Category = {
      subcategories: subcategories,
      categoryId: props.category ? props.category.categoryId : newId(),
      categoryName: data.categoryName,
      count: props.category ? props.category.count : 0
    }
    if (props.isCreate) {
      CategoryRepository.create(category).then(() =>
        enqueueSnackbar(t("feedback.category_created"))
      ).catch((error) => {
          enqueueSnackbar(t("feedback.category_create_error"))
          if (isDev) console.log(error)
        }
      ).finally(onDismiss)
    } else {
      CategoryRepository.update(category).then(() =>
        enqueueSnackbar(t("feedback.category_updated"))
      ).catch((error) => {
          enqueueSnackbar(t("feedback.category_update_error"))
          if (isDev) console.log(error)
        }
      ).finally(onDismiss)
    }
  }

  return (
    <>
      <Dialog
        fullWidth={true}
        maxWidth="xs"
        open={props.isOpen}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogTitle>{t(props.isCreate ? "dialog.category_create" : "dialog.category_update")}</DialogTitle>
          <DialogContent dividers={true}>
            <Container disableGutters>
              <Box sx={{ mx: 2 }}>
                <Controller
                  control={control}
                  name="categoryName"
                  render={({ field: { ref, ...inputProps } }) => (
                    <TextField
                      {...inputProps}
                      type="text"
                      inputRef={ref}
                      label={t("field.category_name")}
                      error={errors.categoryName !== undefined}
                      helperText={errors.categoryName?.message && t(errors.categoryName.message)}
                      disabled={isWritePending}/>
                  )}
                  rules={{ required: { value: true, message: "feedback.empty_category_name" }}}/>
              </Box>
              <Divider sx={{ my: 1 }}/>
              <Box sx={{ mx: 2 }}>
                <FormLabel>
                  <Typography variant="body2">{t("field.subcategories")}</Typography>
                </FormLabel>
              </Box>
              <SubcategoryList
                subcategories={subcategories}
                onItemSelect={onEditorUpdate}
                onItemRemove={onSubcategoryRemove}/>
              <Button onClick={onEditorCreate} startIcon={<AddRounded/>} fullWidth>{t("button.add")}</Button>
            </Container>
          </DialogContent>
          <DialogActions>
            <Button
              color="primary"
              onClick={onDismiss}
              disabled={isWritePending}>
              {t("button.cancel")}
            </Button>
            <LoadingButton
              color="primary"
              type="submit"
              variant="contained"
              loading={isWritePending}>
              {t("button.save")}
            </LoadingButton>
          </DialogActions>
        </form>
      </Dialog>

      <SubcategoryEditor
        subcategory={state.subcategory}
        isOpen={state.isOpen}
        isCreate={state.isCreate}
        onSubmit={onEditorCommit}
        onDismiss={onEditorDismiss}/>
    </>
  )
}

export default CategoryEditor;