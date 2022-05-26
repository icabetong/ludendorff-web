import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { InventoryReport, InventoryReportItem, InventoryReportRepository } from "./InventoryReport";
import { formatDate, formatTimestamp, isDev } from "../../shared/utils";
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
  TextField, Typography,
  useMediaQuery,
  useTheme
} from "@mui/material";
import { useEntity } from "../entity/UseEntity";
import { Timestamp } from "firebase/firestore";

type InventoryReportViewerProps = {
  isOpen: boolean,
  report: InventoryReport | null,
  onDismiss: () => void,
}
const InventoryReportViewer = (props: InventoryReportViewerProps) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const { entity } = useEntity();
  const smBreakpoint = useMediaQuery(theme.breakpoints.down('sm'));
  const [inventoryItems, setInventoryItems] = useState<InventoryReportItem[]>([]);

  useEffect(() => {
    if (props.isOpen && props.report) {
      InventoryReportRepository.fetch(props.report.inventoryReportId)
        .then((items) => setInventoryItems(items))
        .catch((error) => {
          if (isDev) console.log(error)
      })
    }
  }, [props.report, props.isOpen]);

  const inputProps = { readOnly: true }

  const format = () => {
    let date = props.report?.accountabilityDate;
    if (date) {
      if (date instanceof Timestamp)
        return formatTimestamp(date);
      else return formatDate(new Date(date));
    } else return "";
  }

  return (
    <Dialog open={props.isOpen} maxWidth="sm" fullWidth={true} onClose={props.onDismiss}>
      <DialogTitle>{t("dialog.view_inventory_report")}</DialogTitle>
      <DialogContent dividers={true}>
        <Container sx={{ py: 1 }}>
          <Grid
            container
            direction={smBreakpoint ? "column" : "row"}
            alignItems="stretch"
            justifyContent="center"
            spacing={smBreakpoint ? 0 : 4}>
            <Grid item xs={6} sx={{ maxWidth: '100%', pt: 0, pl: 0}}>
              <TextField
                fullWidth
                value={props.report ? props.report?.fundCluster : ""}
                label={t("field.fund_cluster")}
                InputProps={inputProps}/>
              <TextField
                fullWidth
                value={t("template.entity", { name: entity?.entityName, position: entity?.entityPosition })}
                label={t("field.entity")}
                InputProps={inputProps}/>
              <TextField
                fullWidth
                value={props.report ? props.report?.yearMonth : ""}
                label={t("field.year_month")}
                InputProps={inputProps}/>
              <TextField
                fullWidth
                value={format()}
                label={t("field.accountability_date")}
                InputProps={inputProps}/>
            </Grid>
            <Grid item xs={6} sx={{ maxWidth: '100%', pt: 0, pl: 0}}>
              <Typography variant="body2">{t("field.items")}</Typography>
              <List>
                { inventoryItems.map((item) => {
                  return (
                    <ListItem key={item.stockNumber} dense>
                      <ListItemText primary={item.description} secondary={item.stockNumber}/>
                    </ListItem>
                  )
                })
                }
              </List>
            </Grid>
          </Grid>
        </Container>
      </DialogContent>
      <DialogActions>
        <Button onClick={props.onDismiss}>{t("button.close")}</Button>
      </DialogActions>
    </Dialog>
  );
}
export default InventoryReportViewer;