import { Document, Page, View, Text, StyleSheet } from "@react-pdf/renderer";
import { StockCard, StockCardEntry } from "./StockCard";
import { useTranslation } from "react-i18next";
import { Table, TableRow, TableCell } from "../../components/PDFRendering";
import { formatDate } from "../../shared/utils"

const styles = StyleSheet.create({
  page: {
    padding: '12pt',
    display: 'flex',
    flexDirection: 'column',
    fontSize: '11pt'
  },
  headerContainer: {
    display: 'flex',
    padding: '12pt',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    display: 'flex',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: '17pt',
  },
  container: {
    display: 'flex',
    flexDirection: "row",
    margin: '3pt 0',
  },
  field: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  value: {
    flex: 3,
    display: 'flex',
    flexDirection: 'column',
  },
})

type StockCardPDFProps = {
  stockCard: StockCard
}
const StockCardPDF = (props: StockCardPDFProps) => {
  const { t } = useTranslation();
  const { stockCard } = props;

  return (
    <Document>
      <Page style={styles.page} orientation="landscape">
        <View style={styles.headerContainer}>
          <Text style={styles.headerText}>{t("field.stock_card")}</Text>
        </View>
        <View style={styles.container}>
          <View style={styles.field}>
            <Text>{t("field.entity_name")}</Text>
            <Text>{t("field.item")}</Text>
            <Text>{t("field.asset_description")}</Text>
            <Text>{t("field.unit_of_measure")}</Text>
          </View>
          <View style={styles.value}>
            <Text>{stockCard.entityName}</Text>
            <Text style={{flex: 1}}>{stockCard.description}</Text>
            <Text>{stockCard.unitOfMeasure}</Text>
          </View>
          <View style={styles.field}>
            <View style={{display: 'flex', flexGrow: 1}}/>
            <Text>{t("field.stock_number")}</Text>
            <Text>{t("field.reorder_point")}</Text>
            <Text>{t("field.unit_price")}</Text>
          </View>
          <View style={styles.value}>
            <View style={{display: 'flex', flexGrow: 1}}/>
            <Text>{stockCard.stockNumber}</Text>
            <Text>{stockCard.stockCardId}</Text>
            <Text>{stockCard.unitPrice}</Text>
          </View>
        </View>
        <Table>
          <TableRow>
            <TableCell text={t("field.date")}/>
            <TableCell text={t("field.reference")}/>
            <TableCell text={t("field.receipt_quantity")}/>
            <TableCell text={t("field.requested_quantity")}/>
            <TableCell text={t("field.issue_quantity")}/>
            <TableCell text={t("field.issue_office")}/>
            <TableCell text={t("field.balance_quantity")}/>
            <TableCell text={t("field.balance_total_price")}/>
          </TableRow>
          <>
            { stockCard.entries.map((row: StockCardEntry) => {
              return (
                <TableRow key={row.stockCardEntryId}>
                  <TableCell text={formatDate(row.date)}/>
                  <TableCell text={row.reference}/>
                  <TableCell text={row.receiptQuantity.toString()}/>
                  <TableCell text={row.requestedQuantity.toString()}/>
                  <TableCell text={row.issueQuantity.toString()}/>
                  <TableCell text={row.issueOffice}/>
                  <TableCell text={row.balanceQuantity.toString()}/>
                  <TableCell text={row.balanceTotalPrice.toString()}/>
                </TableRow>
              )
            })
            }
          </>
        </Table>
      </Page>
    </Document>
  )
}

export default StockCardPDF;