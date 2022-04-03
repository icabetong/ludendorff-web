import { IssuedReport, IssuedReportItem, IssuedReportRepository } from "./IssuedReport";
import { useTranslation } from "react-i18next";
import {
  Box,
  Button,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormLabel,
  Grid,
  List,
  TextField,
  Typography,
  useMediaQuery,
  useTheme
} from "@mui/material";
import { useSnackbar } from "notistack";
import { useForm } from "react-hook-form";
import { useEffect, useReducer, useState } from "react";
import { isDev, newId } from "../../shared/utils";
import { ActionType, initialState, reducer } from "./IssuedReportItemEditorReducer";
import { Timestamp } from "firebase/firestore";
import DateAdapter from "@mui/lab/AdapterDateFns";
import { DatePicker, LocalizationProvider } from "@mui/lab";
import IssuedReportItemList from "./IssuedReportItemList";
import { AddRounded } from "@mui/icons-material";
import { IssuedReportItemEditor } from "./IssuedReportItemEditor";

type IssuedReportEditorProps = {
  isOpen: boolean,
  isCreate: boolean,
  report: IssuedReport | undefined,
  onDismiss: () => void,
}

export type FormValues = {
  fundCluster: string,
  entityName: string,
  serialNumber: string,
}

const IssuedReportEditor = (props: IssuedReportEditorProps) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>();
  const [date, setDate] = useState<Date | null>(new Date());
  const [items, setItems] = useState<IssuedReportItem[]>([]);
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    const fetchItems = async () => {
      if (props.report) {
        const { issuedReportId } = props.report;

        return await IssuedReportRepository.fetch(issuedReportId);
      } else return [];
    }

    fetchItems()
      .then((arr) => setItems(arr))
      .catch((error) => {
        if (isDev) console.log(error);
      })
  }, [props.report]);

  const onEditorCreate = () => dispatch({ type: ActionType.CREATE });
  const onEditorDismiss = () => dispatch({ type: ActionType.DISMISS });
  const onEditorUpdate = (item: IssuedReportItem) => dispatch({ type: ActionType.UPDATE, payload: item });
  const onEditorCommit = (item: IssuedReportItem) => {
    let currentItems = items;
    let index = currentItems.findIndex((i) => i.stockNumber === item.stockNumber);
    if (index < 0) {
      currentItems.push(item);
    } else {
      currentItems[index] = item;
    }
    setItems(currentItems);
  }

  const onSubmit = (data: FormValues) => {
    if (!date) {
      return;
    }

    const issuedReport: IssuedReport = {
      issuedReportId: props.report ? props.report.issuedReportId : newId(),
      ...data,
      items: items,
      date: Timestamp.fromDate(date),
    }

    if (props.isCreate) {
      IssuedReportRepository.create(issuedReport)
        .then(() => enqueueSnackbar(t("feedback.issued_report_created")))
        .catch((error) => {
          enqueueSnackbar(t("feedback.issued_report_create_error"))
          if (isDev) console.log(error);
        })
        .finally(props.onDismiss)
    } else {
      IssuedReportRepository.update(issuedReport)
        .then(() => enqueueSnackbar(t("feedback.issued_report_updated")))
        .catch((error) => {
          enqueueSnackbar(t("feedback.issued_report_update_error"))
          if (isDev) console.log(error);
        })
        .finally(props.onDismiss)
    }
  }

  return (
    <>
      <Dialog
        fullScreen={isMobile}
        fullWidth={true}
        maxWidth={isMobile ? "xs" : "md"}
        open={props.isOpen}
        onClose={props.onDismiss}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogTitle>{t("dialog.details_issued")}</DialogTitle>
          <DialogContent dividers={true}>
            <Container>
              <Grid container direction={isMobile ? "column" : "row"} alignItems="stretch" justifyContent="center" spacing={isMobile ? 0 : 4}>
                <Grid item xs={6} sx={{maxWidth: '100%', pt: 0, pl: 0}}>
                  <TextField
                    autoFocus
                    id="fundCluster"
                    type="text"
                    label={t("field.fund_cluster")}
                    error={errors.fundCluster !== undefined}
                    helperText={errors.fundCluster?.message && t(errors.fundCluster?.message)}
                    defaultValue={props.report && props.report.fundCluster}
                    {...register('fundCluster', { required: "feedback.empty_fund_cluster"})}/>
                  <TextField
                    id="serialNumber"
                    type="text"
                    label={t("field.serial_number")}
                    error={errors.serialNumber !== undefined}
                    helperText={errors.serialNumber?.message && t(errors.serialNumber?.message)}
                    defaultValue={props.report && props.report.serialNumber}
                    {...register('serialNumber', { required: "feedback.empty_serial_number"})}/>
                  <TextField
                    id="entityName"
                    type="text"
                    label={t("field.entity_name")}
                    error={errors.entityName !== undefined}
                    helperText={errors.entityName?.message && t(errors.entityName?.message)}
                    defaultValue={props.report && props.report.entityName}
                    {...register('entityName', { required: "feedback.empty_entity_name"})}/>
                  <LocalizationProvider dateAdapter={ DateAdapter }>
                    <Box>
                      <DatePicker
                        inputFormat="MM/dd/yyyy"
                        mask="__/__/yyyy"
                        label={ t("field.date") }
                        value={ date }
                        onChange={ setDate }
                        renderInput={ (params) => <TextField { ...params } helperText={ null }/> }
                      />
                    </Box>
                  </LocalizationProvider>
                </Grid>
                <Grid item xs={6} sx={{maxWidth: '100%', pt: 0, pl: 0}}>
                  <FormLabel component="legend">
                    <Typography variant="body2">{t("field.items")}</Typography>
                  </FormLabel>
                  <List>
                    <IssuedReportItemList items={items} onItemSelected={onEditorUpdate}/>
                    <Button
                      fullWidth
                      startIcon={ <AddRounded/> }
                      onClick={ onEditorCreate }>
                        { t("button.add") }
                    </Button>
                  </List>
                </Grid>
              </Grid>
            </Container>
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
              {t("button.save")}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
      <IssuedReportItemEditor
        isOpen={state.isOpen}
        isCreate={state.isCreate}
        item={state.item}
        onSubmit={onEditorCommit}
        onDismiss={onEditorDismiss}/>
    </>
  )
}

export default IssuedReportEditor