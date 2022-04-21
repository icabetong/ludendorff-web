import React, { useEffect, } from "react";
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
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  TextField,
  useTheme,
  useMediaQuery
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
import { useSnackbar } from "notistack";
import { Category, CategoryRepository } from "./Category";
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
  const theme = useTheme();
  const smBreakpoint = useMediaQuery(theme.breakpoints.down('sm'));
  const { enqueueSnackbar } = useSnackbar();
  const [isWritePending, setWritePending] = React.useState(false);
  const [subcategories, setSubcategories] = React.useState<string[]>([]);
  const { handleSubmit, formState: { errors }, control, setValue } = useForm<FormData>();

  useEffect(() => {
    if (props.isOpen) {
      setValue("categoryName", props.category ? props.category?.categoryName : "")
    }
  }, [setValue, props.category, props.isOpen])

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
    <Dialog
      fullWidth={true}
      maxWidth="xs"
      open={props.isOpen}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogTitle>{t("dialog.details_category")}</DialogTitle>
        <DialogContent>
          <Container disableGutters>
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
            <List>
              { subcategories.map((string) => {
                return (
                  <ListItem>
                    <ListItemText primary={string}/>
                  </ListItem>
                )
              })
              }
              <Button fullWidth>{t("button.add")}</Button>
            </List>
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
            loading={isWritePending}>
            {t("button.save")}
          </LoadingButton>
        </DialogActions>
      </form>
    </Dialog>
  )
}

export default CategoryEditor;