import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import { Style } from "@react-pdf/types";
import { useTranslation } from "react-i18next";
import { Table, TableRow } from "../../components/PDFRendering";
import { IssuedReport, IssuedReportItem } from "./IssuedReport";
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
    flexDirection: 'column',
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
  yearMonthText: {
    fontFamily: "Inter",
    fontSize: '9pt',
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
});

type IssuedReportPDFProps = {
  issuedReport: IssuedReport
}
const IssuedReportPDF = (props: IssuedReportPDFProps ) => {
  const { t } = useTranslation();
  const { issuedReport } = props;
  const cellStyle: Style = {
    padding: '6pt',
    border: '1px solid #efefef',
    textAlign: 'center',
    fontFamily: 'Inter',
  }
  const headerStyle: Style = {
    fontWeight: 'medium',
    ...cellStyle,
  }

  return (
    <Document>
      <Page style={styles.page} orientation="landscape">
        <View style={styles.headerContainer}>
          <Text style={styles.headerText}>{t("document.issued")}</Text>
        </View>
        <View style={styles.container}>
          <View style={styles.fieldColumn}>
            <Text style={styles.field}>{t("field.entity_name")}</Text>
            <Text style={styles.field}>{t("field.fund_cluster")}</Text>
            <Text style={styles.field}>{t("field.asset_description")}</Text>
            <Text style={styles.field}>{t("field.unit_of_measure")}</Text>
          </View>
          <View style={styles.valueColumn}>
            <Text style={styles.value}>{issuedReport.entityName}</Text>
            <Text style={styles.value}>{issuedReport.fundCluster}</Text>
          </View>
          <View style={styles.fieldColumn}>
            <Text style={styles.field}>{t("field.serial_number")}</Text>
            <Text style={styles.field}>{t("field.date")}</Text>
          </View>
          <View style={styles.valueColumn}>
            <Text style={styles.value}>{issuedReport.serialNumber}</Text>
            <Text style={styles.value}>{formatDate(issuedReport.date)}</Text>
          </View>
        </View>
        <Table>
          <TableRow>
            <Text style={{flex: 0.5, ...headerStyle}}>{t("field.responsibility_center")}</Text>
            <Text style={{flex: 1, ...headerStyle}}>{t("field.stock_number")}</Text>
            <Text style={{flex: 3, ...headerStyle}}>{t("field.item")}</Text>
            <Text style={{flex: 0.5, ...headerStyle}}>{t("field.unit")}</Text>
            <Text style={{flex: 0.5, ...headerStyle}}>{t("field.quantity_issued")}</Text>
            <Text style={{flex: 1, ...headerStyle}}>{t("field.unit_cost")}</Text>
            <Text style={{flex: 1, ...headerStyle}}>{t("field.amount")}</Text>
          </TableRow>
          <>
            { issuedReport.items.map((row: IssuedReportItem) => {
              return (
                <TableRow key={row.stockNumber}>
                  <Text style={{flex: 0.5, ...cellStyle}}>{row.responsibilityCenter}</Text>
                  <Text style={{flex: 1, ...cellStyle}}>{row.stockNumber}</Text>
                  <Text style={{flex: 3, ...cellStyle}}>{row.description}</Text>
                  <Text style={{flex: 0.5, ...cellStyle}}>{row.unitOfMeasure}</Text>
                  <Text style={{flex: 0.5, ...cellStyle}}>{row.quantityIssued}</Text>
                  <Text style={{flex: 1, ...cellStyle}}>{row.unitCost}</Text>
                  <Text style={{flex: 1, ...cellStyle}}>{row.quantityIssued * row.unitCost}</Text>
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
export default IssuedReportPDF;