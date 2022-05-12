import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useForm, Controller } from "react-hook-form";
import { Button, Container, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from "@mui/material";
import { Entity } from "./Entity";
import { LoadingButton } from "@mui/lab";
import { useEntity } from "./UseEntity";

type EntityEditorProps = {
  isOpen: boolean,
  onDismiss: () => void
}

const EntityEditor = (props: EntityEditorProps) => {
  const { t } = useTranslation();
  const { entity, onEntityChanged } = useEntity();
  const [isWriting, setWriting] = useState(false);
  const { handleSubmit, formState: { errors }, control, reset } = useForm<Entity>();

  useEffect(() => {
    if (entity) reset(entity);
  }, [entity, reset]);

  const onSubmit = async (entity: Entity) => {
    setWriting(true);
    await onEntityChanged(entity);
    setWriting(false);
    props.onDismiss();
  }

  return (
    <Dialog open={props.isOpen} maxWidth="sm">
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogTitle>{t("dialog.entity_update")}</DialogTitle>
        <DialogContent>
          <Container disableGutters>
            <Controller
              name="entityName"
              control={control}
              render={({ field: { ref, ...inputProps }}) => (
                <TextField
                  {...inputProps}
                  type="text"
                  inputRef={ref}
                  label={t("field.entity_name")}
                  error={errors.entityName !== undefined}
                  disabled={isWriting}
                  helperText={errors.entityName?.message && t(errors.entityName?.message)}
                />
              )}
              rules={{ required: { value: true, message: "feedback.empty_entity_name" }}}/>
            <Controller
              name="entityPosition"
              control={control}
              render={({ field: { ref, ...inputProps }}) => (
                <TextField
                  {...inputProps}
                  type="text"
                  label={t("field.entity_position")}
                  error={errors.entityPosition !== undefined}
                  disabled={isWriting}
                  helperText={errors.entityPosition?.message && t(errors.entityPosition?.message)}/>
              )}
              rules={{ required: { value: true, message: "feedback.empty_entity_position" }}}/>
          </Container>
        </DialogContent>
        <DialogActions>
          <Button onClick={props.onDismiss}>
            {t("button.cancel")}
          </Button>
          <LoadingButton variant="contained" type="submit" loading={isWriting}>
            {t("button.save")}
          </LoadingButton>
        </DialogActions>
      </form>
    </Dialog>
  )
}

export default EntityEditor;