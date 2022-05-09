import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useForm, Controller } from "react-hook-form";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from "@mui/material";

type FormValues = {
  subcategory: string
}
type SubcategoryEditorProps = {
  subcategory?: string,
  isOpen: boolean,
  isCreate: boolean,
  onSubmit: (subcategory: string) => void,
  onDismiss: () => void,
}

const SubcategoryEditor = (props: SubcategoryEditorProps) => {
  const { t } = useTranslation();
  const { handleSubmit, formState: { errors }, control, setValue } = useForm<FormValues>();

  const onSubmit = (data: FormValues) => {
    props.onSubmit(data.subcategory);
  }

  useEffect(() => {
    if (props.isOpen) {
      setValue("subcategory", props.subcategory ? props.subcategory : "");
    }
  }, [setValue, props.subcategory, props.isOpen])

  return (
    <Dialog open={props.isOpen} maxWidth="xs">
      <form onSubmit={handleSubmit(onSubmit)}>
      <DialogTitle>{t("dialog.details_subcategory")}</DialogTitle>
        <DialogContent>
          <Controller
            name="subcategory"
            control={control}
            render={({ field: { ref, ...inputProps }}) => (
              <TextField
                {...inputProps}
                type="text"
                inputRef={ref}
                label={t("field.subcategory_name")}
                error={errors.subcategory !== undefined}
                helperText={errors.subcategory?.message && t(errors.subcategory.message)}/>
            )}
            rules={{ required: { value: true, message: "feedback.empty_subcategory_name" }}}/>
        </DialogContent>
        <DialogActions>
          <Button onClick={props.onDismiss}>{t("button.cancel")}</Button>
          <Button variant="contained" type="submit">{t("button.save")}</Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}

export default SubcategoryEditor;