import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import { StockCard, StockCardEntry } from "./StockCard";
import { useTranslation } from "react-i18next";
import { Table, TableRow } from "../../components/PDFRendering";
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
    fontFamily: 'Inter',
    fontWeight: 'bold',
    fontSize: '17pt',
  },
  container: {
    display: 'flex',
    flexDirection: "row",
    margin: '3pt 0',
  },
  fieldColumn: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  field: {
    fontFamily: 'Inter',
    fontWeight: 'normal'
  },
  valueColumn: {
    flex: 3,
    display: 'flex',
    flexDirection: 'column',
  },
  value: {
    fontFamily: 'Inter',
    fontWeight: 'medium',
  },
  tableHeader: {
    flex: 1,
    padding: '6pt',
    border: '1px solid #efefef',
    textAlign: 'center',
    fontFamily: 'Inter',
    fontWeight: 'medium'
  },
  tableData: {
    flex: 1,
    padding: '6pt',
    border: '1px solid #efefef',
    textAlign: 'center',
    fontFamily: 'Inter',
  }
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
          <Text style={styles.headerText}>{t("document.stock_card")}</Text>
        </View>
        <View style={styles.container}>
          <View style={styles.fieldColumn}>
            <Text style={styles.field}>{t("field.entity_name")}</Text>
            <Text style={styles.field}>{t("field.item")}</Text>
            <Text style={styles.field}>{t("field.asset_description")}</Text>
            <Text style={styles.field}>{t("field.unit_of_measure")}</Text>
          </View>
          <View style={styles.valueColumn}>
            <Text style={styles.value}>{stockCard.entityName}</Text>
            <Text style={[styles.value, { flex: 1 }]}>{stockCard.description}</Text>
            <Text style={styles.value}>{stockCard.unitOfMeasure}</Text>
          </View>
          <View style={styles.fieldColumn}>
            <View style={{ display: 'flex', flexGrow: 1 }}/>
            <Text style={styles.field}>{t("field.stock_number")}</Text>
            <Text style={styles.field}>{t("field.reorder_point")}</Text>
            <Text style={styles.field}>{t("field.unit_price")}</Text>
          </View>
          <View style={styles.valueColumn}>
            <View style={{ display: 'flex', flexGrow: 1 }}/>
            <Text style={styles.value}>{stockCard.stockNumber}</Text>
            <Text style={styles.value}>{stockCard.stockCardId}</Text>
            <Text style={styles.value}>{stockCard.unitPrice}</Text>
          </View>
        </View>
        <Table>
          <TableRow>
            <Text style={styles.tableHeader}>{t("field.date")}</Text>
            <Text style={styles.tableHeader}>{t("field.reference")}</Text>
            <Text style={styles.tableHeader}>{t("field.receipt_quantity")}</Text>
            <Text style={styles.tableHeader}>{t("field.requested_quantity")}</Text>
            <Text style={styles.tableHeader}>{t("field.issue_quantity")}</Text>
            <Text style={styles.tableHeader}>{t("field.issue_office")}</Text>
            <Text style={styles.tableHeader}>{t("field.balance_quantity")}</Text>
            <Text style={styles.tableHeader}>{t("field.balance_total_price")}</Text>
          </TableRow>
          <>
            {stockCard.entries.map((row: StockCardEntry) => {
              return (
                <TableRow key={row.stockCardEntryId}>
                  <Text style={styles.tableData}>{formatDate(row.date)}</Text>
                  <Text style={styles.tableData}>{row.reference}</Text>
                  <Text style={styles.tableData}>{row.receiptQuantity.toString()}</Text>
                  <Text style={styles.tableData}>{row.requestedQuantity.toString()}</Text>
                  <Text style={styles.tableData}>{row.issueQuantity.toString()}</Text>
                  <Text style={styles.tableData}>{row.issueOffice}</Text>
                  <Text style={styles.tableData}>{row.balanceQuantity.toString()}</Text>
                  <Text style={styles.tableData}>{row.balanceTotalPrice.toString()}</Text>
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