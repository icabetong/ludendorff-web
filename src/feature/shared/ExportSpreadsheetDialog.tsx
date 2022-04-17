import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useForm, Controller } from "react-hook-form";
import {
  Autocomplete,
  Box,
  Button, Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle, FormControlLabel, FormGroup,
  InputAdornment,
  TextField
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
import { spreadsheetFileExtension } from "../../shared/spreadsheet";

type ExportParameters = {
  fileName: string,
  worksheetName: string,
}

type ExportSpreadsheetDialogProps = {
  key: string,
  isOpen: boolean,
  isWorking: boolean,
  fileName?: string,
  worksheetName?: string,
  fileNameOptions?: string[]
  worksheetOptions?: string[],
  onDismiss: () => void,
  onSubmit: (params: ExportParameters) => void,
}

const ExportSpreadsheetDialog = (props: ExportSpreadsheetDialogProps) => {
  const { t } = useTranslation();
  const { handleSubmit, formState: { errors }, control, reset } = useForm<ExportParameters>();


  useEffect(() => {
    reset({
      fileName: props.fileName ? props.fileName : "",
      worksheetName: props.worksheetName ? props.worksheetName : "",
    });
  }, [reset, props.fileName, props.worksheetName]);

  return (
    <Dialog open={props.isOpen} maxWidth="xs">
      <form onSubmit={handleSubmit(props.onSubmit)}>
        <DialogTitle>{t("dialog.export_spreadsheet")}</DialogTitle>
        <DialogContent>
          <DialogContentText>{t("dialog.export_spreadsheet_summary")}</DialogContentText>
          <Box sx={{ marginTop: 2 }}>
            <Controller
              name="fileName"
              control={control}
              render={({ field: { onChange, value }}) => (
                <Autocomplete
                  freeSolo
                  value={value}
                  disabled={props.isWorking}
                  options={props.fileNameOptions ? props.fileNameOptions : []}
                  renderInput={(params) => (
                  <TextField
                    {...params}
                    type="text"
                    label={t("field.filename")}
                    error={errors.fileName !== undefined}
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: <InputAdornment position="end">{spreadsheetFileExtension}</InputAdornment>
                    }}/>
                  )}
                  onChange={(e, i) => onChange(i)}/>
                )}
                rules={{ required: true }}/>
            <Controller
              name="worksheetName"
              control={control}
              render={({ field: { onChange, value }}) => (
                <Autocomplete
                  freeSolo
                  value={value}
                  disabled={props.isWorking}
                  options={props.worksheetOptions ? props.worksheetOptions : []}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      type="text"
                      label={t("field.worksheet_name")}
                      error={errors.worksheetName !== undefined}/>
                  )}
                  onChange={(e, i) => onChange(i)}/>
              )}
              rules={{ required: true }}/>
            <FormGroup>
              <FormControlLabel control={<Checkbox/>} label={t("field.remember_options")}/>
            </FormGroup>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={props.onDismiss} disabled={props.isWorking}>{t("button.cancel")}</Button>
          <LoadingButton type="submit" loading={props.isWorking}>
            {t("button.export")}
          </LoadingButton>
        </DialogActions>
      </form>
    </Dialog>
  )
}

export { ExportSpreadsheetDialog, ExportParameters }