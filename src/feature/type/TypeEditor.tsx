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
import { Type, TypesRepository } from "./Type";
import { newId } from "../../shared/utils";

type FormValues = {
  name?: string
}

type TypeEditorProps = {
  isOpen: boolean,
  isCreate: boolean,
  type: Type | undefined,
  onDismiss: () => void,
}

const TypeEditor = (props: TypeEditorProps) => {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const [isWritePending, setWritePending] = React.useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = (data: FormValues) => {
    setWritePending(true)

    let type: Type = {
      typeId: props.type ? props.type.typeId : newId(),
      count: props.type ? props.type.count : 0,
      typeName: data.name,
    }
    if (props.isCreate) {
      TypesRepository.create(type)
        .then(() =>
          enqueueSnackbar(t("feedback.category_created"))
        ).catch(() =>
          enqueueSnackbar(t("feedback.category_create_error"))
        ).finally(() => {
          setWritePending(false);
          props.onDismiss();
        })
    } else {
      TypesRepository.update(type)
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
        <DialogTitle>{t("dialog.type_details")}</DialogTitle>
        <DialogContent>
          <Container disableGutters>
            <TextField
              disabled={isWritePending}
              autoFocus
              id="name"
              type="text"
              label={t("field.category_name")}
              defaultValue={props.type ? props.type.typeName : ""}
              error={errors.name}
              helperText={errors.name ? t(errors.name.message) : undefined}
              {...register("name", { required: "feedback.empty_type_name" })} />
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

export default TypeEditor;