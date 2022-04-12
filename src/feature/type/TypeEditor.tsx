import React, { useEffect, } from "react";
import { useTranslation } from "react-i18next";
import { useForm, Controller } from "react-hook-form";
import { Button, Container, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from "@mui/material";
import { LoadingButton } from "@mui/lab";
import { useSnackbar } from "notistack";
import { Type, TypesRepository } from "./Type";
import { isDev, newId } from "../../shared/utils";

type FormData = {
  typeName?: string
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
  const { handleSubmit, formState: { errors }, control, setValue } = useForm<FormData>();

  useEffect(() => {
    if (props.isOpen) {
      setValue("typeName", props.type ? props.type?.typeName : "")
    }
  }, [setValue, props.type, props.isOpen])

  const onDismiss = () => {
    setWritePending(false);
    props.onDismiss();
  }

  const onSubmit = (data: FormData) => {
    setWritePending(true);

    let type: Type = {
      typeId: props.type ? props.type.typeId : newId(),
      count: props.type ? props.type.count : 0,
      typeName: data.typeName,
    }
    if (props.isCreate) {
      TypesRepository.create(type).then(() =>
        enqueueSnackbar(t("feedback.type_created"))
      ).catch((error) => {
          enqueueSnackbar(t("feedback.type_create_error"))
          if (isDev) console.log(error)
        }
      ).finally(onDismiss)
    } else {
      TypesRepository.update(type).then(() =>
        enqueueSnackbar(t("feedback.type_updated"))
      ).catch((error) => {
          enqueueSnackbar(t("feedback.type_update_error"))
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
        <DialogTitle>{t("dialog.details_type")}</DialogTitle>
        <DialogContent>
          <Container disableGutters>
            <Controller
              control={control}
              name="typeName"
              render={({ field: { ref, ...inputProps } }) => (
                <TextField
                  {...inputProps}
                  type="text"
                  inputRef={ref}
                  label={t("field.type_name")}
                  error={errors.typeName !== undefined}
                  helperText={errors.typeName?.message && t(errors.typeName.message)}
                  disabled={isWritePending}/>
              )}
              rules={{ required: { value: true, message: "feedback.empty_type_name" }}}/>
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

export default TypeEditor;