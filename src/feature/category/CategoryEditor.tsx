import React from "react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import {
  Button,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField
} from "@material-ui/core";
import { useSnackbar } from "notistack";
import { Category, CategoryRepository } from "../category/Category";
import { newId } from "../../shared/utils";

type FormValues = {
  name?: string
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
  const [isWritePending, setWritePending] = React.useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = (data: FormValues) => {
    setWritePending(true)

    let category: Category = {
      categoryId: props.category ? props.category.categoryId : newId(),
      count: props.category ? props.category.count : 0,
      categoryName: data.name,
    }
    if (props.isCreate) {
      CategoryRepository.create(category)
        .then(() =>
          enqueueSnackbar(t("feedback.category_created"))
        ).catch(() =>
          enqueueSnackbar(t("feedback.category_create_error"))
        ).finally(() => {
          setWritePending(false);
          props.onDismiss();
        })
    } else {
      CategoryRepository.update(category)
        .then(() =>
          enqueueSnackbar(t("feedback.category_updated"))
        ).catch(() =>
          enqueueSnackbar(t("feedback.category_update_error"))
        ).finally(() => {
          setWritePending(false);
          props.onDismiss();
        })
    }
  }

  return (
    <Dialog
      fullWidth={true}
      maxWidth="xs"
      open={props.isOpen}
      onClose={props.onDismiss}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogTitle>{t("category_details")}</DialogTitle>
        <DialogContent>
          <Container disableGutters>
            <TextField
              disabled={isWritePending}
              autoFocus
              id="name"
              type="text"
              label={t("field.category_name")}
              defaultValue={props.category ? props.category.categoryName : ""}
              error={errors.name}
              helperText={errors.name ? t(errors.name.message) : undefined}
              {...register("name", { required: "feedback.empty-category-name" })} />
          </Container>
        </DialogContent>
        <DialogActions>
          <Button
            color="primary"
            onClick={props.onDismiss}
            disabled={isWritePending}>
            {t("button.cancel")}
          </Button>
          <Button
            color="primary"
            type="submit"
            disabled={isWritePending}>
            {t("button.save")}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}

export default CategoryEditor;