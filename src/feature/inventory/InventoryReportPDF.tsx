import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import { Style } from "@react-pdf/types";
import { useTranslation } from "react-i18next";
import { Table, TableRow } from "../../components/PDFRendering";
import { InventoryReport, InventoryReportItem } from "./InventoryReport";

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
})

type InventoryPDFProps = {
  inventoryReport: InventoryReport
}
const InventoryReportPDF = (props: InventoryPDFProps) => {
  const { t } = useTranslation();
  const { inventoryReport } = props;
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
        <View style={{ display: 'flex' }}>
          <Text>
            {t("template.inventory_entity", {
              name: inventoryReport.entityName,
              position: inventoryReport.entityPosition,
            })}
          </Text>
        </View>
        <Table>
          <TableRow>
            <Text style={{ flex: 2, ...headerStyle }}>{t("field.article")}</Text>
            <Text style={{ flex: 4, ...headerStyle }}>{t("field.asset_description")}</Text>
            <Text style={{ flex: 2, ...headerStyle }}>{t("field.stock_number")}</Text>
            <Text style={{ flex: 1, ...headerStyle }}>{t("field.unit_of_measure")}</Text>
            <Text style={{ flex: 1, ...headerStyle }}>{t("field.unit_value")}</Text>
            <Text style={{ flex: 1, ...headerStyle }}>{t("field.balance_per_card")}</Text>
            <Text style={{ flex: 1, ...headerStyle }}>{t("field.on_hand_count")}</Text>
            <Text style={{ flex: 1.5, ...headerStyle }}>{t("field.total_price")}</Text>
          </TableRow>
          <>
            {props.inventoryReport.items.map((row: InventoryReportItem) => {
              return (
                <TableRow key={row.stockNumber}>
                  <Text style={{ flex: 2, ...cellStyle }}>{row.article}</Text>
                  <Text style={{ flex: 4, ...cellStyle }}>{row.description}</Text>
                  <Text style={{ flex: 2, ...cellStyle }}>{row.stockNumber}</Text>
                  <Text style={{ flex: 1, ...cellStyle }}>{row.unitOfMeasure}</Text>
                  <Text style={{ flex: 1, ...cellStyle }}>{row.unitValue}</Text>
                  <Text style={{ flex: 1, ...cellStyle }}>{row.balancePerCard}</Text>
                  <Text style={{ flex: 1, ...cellStyle }}>{row.onHandCount}</Text>
                  <Text style={{ flex: 1.5, ...cellStyle }}>{row.balancePerCard * row.unitValue}</Text>
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

export default InventoryReportPDF;