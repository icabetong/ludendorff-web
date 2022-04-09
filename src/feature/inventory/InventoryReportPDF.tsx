import { Document, Page, View, Text, StyleSheet } from "@react-pdf/renderer";
import { useTranslation } from "react-i18next";
import { Table, TableRow } from "../../components/PDFRendering";
import { formatDate } from "../../shared/utils";
import { InventoryReport } from "./InventoryReport";

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

type InventoryPDFProps = {
  inventoryReport: InventoryReport
}
const InventoryReportPDF = (props: InventoryPDFProps) => {
  const { t } = useTranslation();
  const { inventoryReport } = props;

  return (
    <Document>
      <Page style={styles.page} orientation="landscape">
        <View style={styles.headerContainer}>
          <Text style={styles.headerText}>{t("document.inventory")}</Text>
          <Text style={styles.yearMonthText}>
            {t("template.as_of_year_month", { yearMonth: inventoryReport.yearMonth })}
          </Text>
        </View>
        <View style={styles.container}>
          <View style={styles.fieldColumn}>
            <Text style={styles.field}>{t("field.fund_cluster")}</Text>
          </View>
          <View style={styles.valueColumn}>
            <Text style={styles.value}>{inventoryReport.fundCluster}</Text>
          </View>
        </View>
        <View style={{display: 'flex'}}>
          <Text>
            {t("template.inventory_entity", {
              name: inventoryReport.entityName,
              position: inventoryReport.entityPosition,
            })}
          </Text>
        </View>
      </Page>
    </Document>
  )
}

export default InventoryReportPDF;