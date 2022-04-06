import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
} from "@mui/material";

type DuplicationDialogProps = {
  isOpen: boolean,
  onConfirm: (copies: number) => void,
  onDismiss: () => void
}

export type FormValues = {
  copies: string
}

const DuplicationDialog = (props: DuplicationDialogProps) => {
  const { t } = useTranslation();
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>();

  const onSubmit = (data: FormValues) => {
    props.onConfirm(Number(data.copies));
  }

  return (
    <Dialog
      maxWidth="xs"
      fullWidth={true}
      open={props.isOpen}
      onClose={props.onDismiss}>
      <DialogTitle>{t("dialog.duplicate_title")}</DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          <DialogContentText>{t("dialog.duplicate_summary")}</DialogContentText>

          <TextField
            id="copies"
            type="number"
            label={t("field.copies")}
            error={errors.copies !== undefined}
            helperText={errors.copies?.message !== undefined ? t(errors.copies.message) : undefined}
            defaultValue={1}
            InputProps={{ inputProps: { min: 1, max: 20 } }}
            {...register("copies", { required: "feeedback.empty_copies" })}
          />
        </DialogContent>
        <DialogActions>
          <Button
            color="primary"
            onClick={props.onDismiss}>
            {t("button.cancel")}
          </Button>
          <Button
            color="primary"
            type="submit">
            {t("button.duplicate")}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

export default DuplicationDialog;