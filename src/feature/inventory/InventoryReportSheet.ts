import * as Excel from "exceljs";
import { t } from "../../localization";
import { InventoryReport } from "./InventoryReport";
import { formatDate } from "../../shared/utils";

const convertInventoryReportToSpreadsheet = (workBook: Excel.Workbook, inventoryReport: InventoryReport) => {
  const workSheet = workBook.addWorksheet(inventoryReport.fundCluster);
  workSheet.columns = [
    { width: 18 }, { width: 68 }, { width: 32 }, { width: 10 }, { width: 12 }, { width: 12 }, { width: 12 },
    { width: 10 }, { width: 10 }, { width: 24 }, { width: 30 }
  ]

  let row = workSheet.addRow([
    t("document.inventory").toUpperCase()
  ]);
  row.font = { bold: true };
  row = workSheet.addRow([
    `(${t("document.type_of_inventory_item")})`
  ]);
  row.font = { size: 8 };
  workSheet.addRow([
    t("template.as_of_year_month", { yearMonth: inventoryReport.yearMonth })
  ]);
  workSheet.mergeCells('A1:K1');
  workSheet.mergeCells('A2:K2');
  workSheet.mergeCells('A3:K3');
  workSheet.mergeCells('A4:K4');
  for (let row = 1; row <= 4; row++) {
    let cell = workSheet.getCell(`A${row}`);
    cell.font = { bold: true };
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
  }

  workSheet.addRow([""]);

  workSheet.addRow([
    t("field.fund_cluster"),
    inventoryReport.fundCluster
  ]);
  workSheet.addRow([
    t("template.inventory_entity", {
      name: inventoryReport.entityName,
      position: inventoryReport.entityPosition,
      date: formatDate(inventoryReport.accountabilityDate)
    })
  ]);
  workSheet.addRow([""]);

  workSheet.addRow([
    t("field.article"),
    t("field.asset_description"),
    t("field.stock_number"),
    t("field.unit_of_measure"),
    t("field.unit_value"),
    t("field.balance_per_card"),
    t("field.on_hand_count"),
    t("field.shortage_overage"), "",
    t("field.total_value"),
    t("field.remarks")
  ]);
  workSheet.addRow([
    ...Array(5).fill(""),
    t("field.quantity"),
    t("field.quantity"),
    t("field.quantity"),
    t("field.value"),
    ...Array(2).fill("")
  ]);
  workSheet.getRow(9).height = 40;
  workSheet.mergeCells('A9:A10');
  workSheet.mergeCells('B9:B10');
  workSheet.mergeCells('C9:C10');
  workSheet.mergeCells('D9:D10');
  workSheet.mergeCells('E9:E10');
  workSheet.mergeCells('J9:J10');
  workSheet.mergeCells('K9:K10');

  workSheet.addRows([
    ...inventoryReport.items.map((item) => {
      return [
        item.article,
        item.description,
        item.stockNumber,
        item.unitOfMeasure,
        item.unitValue,
        item.balancePerCard,
        item.onHandCount,
        "", "",
        item.unitValue * item.balancePerCard,
        item.remarks
      ];
    })
  ]);

  let prefixRow = 10;
  let rows = inventoryReport.items.length + prefixRow;
  for (let r = prefixRow + 1; r <= rows; r++) {
    let row = workSheet.getRow(r);
    row.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    row.border = {
      top: { style: 'thin' }, bottom: { style: 'thin' },
      left: { style: 'thin' }, right: { style: 'thin' }
    }
  }

  for (let r = 9; r <= 10; r++) {
    for (let c = 1; c <= 11; c++) {
      let cell = workSheet.getCell(r, c);
      cell.font = { bold: true };
      cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
      cell.border = {
        top: { style: 'thick' }, bottom: { style: 'thick' },
        left: { style: 'thick' }, right: { style: 'thick' }
      }
    }
  }
}

export {
  convertInventoryReportToSpreadsheet
}