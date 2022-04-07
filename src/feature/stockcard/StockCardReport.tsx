import { useEffect, useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from "@mui/material";
import { StockCard, StockCardEntry, StockCardRepository } from "./StockCard";
import StockCardPDF from "./StockCardPDF";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { useTranslation } from "react-i18next";
import { isDev } from "../../shared/utils";

type StockCardReportProps = {
  isOpen: boolean,
  stockCard?: StockCard,
  onDismiss: () => void,
}
const StockCardReport = ({ isOpen, stockCard, onDismiss }: StockCardReportProps ) => {
  const { t } = useTranslation();
  const [entries, setEntries] = useState<StockCardEntry[] | undefined>(undefined);

  useEffect(() => {
    const fetch = async () => {
      return stockCard?.stockCardId
        ? await StockCardRepository.fetch(stockCard.stockCardId)
        : undefined
    }

    fetch()
      .then((data) => setEntries(data))
      .catch((error) => {
        if (isDev) console.log(error)
      })
  }, [stockCard?.stockCardId])

  return (
    <Dialog open={isOpen} onClose={onDismiss} maxWidth="xs">
      <DialogTitle>{t("dialog.generate_stock_card")}</DialogTitle>
      <DialogContent>
        <DialogContentText>
          {t(entries ? "dialog.generate_stock_card_summary" : "dialog.generate_stock_card_summary_fetching")}
        </DialogContentText>
        <Box sx={{my: 2, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          { stockCard &&
            entries ?
            <Button
              variant="contained"
              component={PDFDownloadLink}
              document={<StockCardPDF stockCard={stockCard}/>}>
              {t("button.download")}
            </Button> : <CircularProgress/>
          }
        </Box>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={onDismiss}>
          {t("button.cancel")}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
export default StockCardReport;