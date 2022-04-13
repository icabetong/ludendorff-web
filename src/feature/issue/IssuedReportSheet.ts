import * as Excel from "exceljs";
import { t } from "../../localization";
import { IssuedReport } from "./IssuedReport";

const convertIssuedReportToSpreadsheet = (workBook: Excel.Workbook, issuedReport: IssuedReport) => {
  const workSheet = workBook.addWorksheet(issuedReport.fundCluster);
  workSheet.columns = [
    { width: 8 }, { width: 12 }, { width: 16 }, { width: 32 }, { width: 10 }, { width: 10 }, { width: 12 }, { width: 16 }
  ]

  workSheet.addRow([
    ...Array(6).fill(""),
    "Appendix 64"
  ]);
  workSheet.getRow(1).height = 32
  workSheet.getCell('G1').font = { italic: true, size: 20 }

  workSheet.addRow(['']);
  workSheet.addRow([t('document.issued').toUpperCase()]);
  workSheet.mergeCells('A3:H3');
  workSheet.getCell('A3').font = { bold: true, size: 18 };
  workSheet.getCell('A3').alignment = { vertical: 'middle', horizontal: 'center' };
  workSheet.getRow(3).height = 30;

  workSheet.addRow(['']);
  workSheet.addRow(['']);

  workSheet.addRow([
    t("field.entity_name"), "",
    issuedReport.entityName, ...Array(3).fill(""),
    t("field.serial_number"), ""
  ]);
  workSheet.mergeCells('A6:B6');
  workSheet.mergeCells('C6:F6');

  workSheet.addRow([
    t("field.fund_cluster"), "",
    issuedReport.fundCluster, ...Array(3).fill(""),
    t("field.date"), ""
  ]);
  workSheet.mergeCells('A7:B7');
  workSheet.mergeCells('C7:F7');

  workSheet.addRow([]);

  workSheet.addRow([
    "To be filled up by the Supply and/or Property Division", ...Array(5).fill(""),
    "To be filled up by the Accounting Division",
  ]);
  workSheet.mergeCells('A9:F9');
  workSheet.mergeCells('G9:H9');
  workSheet.getRow(9).height = 22;
  let cell = workSheet.getCell('A9');
  cell.font = { italic: true, size: 8 };
  cell.alignment = { vertical: 'middle', horizontal: 'center' };
  cell.border = {
    top: { style: 'thick' }, bottom: { style: 'thick' }, left: { style: 'thick' }, right: { style: 'thick' }
  };

  cell = workSheet.getCell('G9');
  cell.font = { italic: true, size: 8 };
  cell.alignment = { vertical: 'middle', horizontal: 'center' };
  cell.border = {
    top: { style: 'thick' }, bottom: { style: 'thick' }, left: { style: 'thick' }, right: { style: 'thick' }
  };

  workSheet.addRow([
    t("field.ris_no"),
    t("field.responsibility_center"),
    t("field.stock_number"),
    t("field.item"),
    t("field.unit"),
    t("field.quantity_issued"),
    t("field.unit_cost"),
    t("field.amount")
  ]);

  if (issuedReport.items) {
    workSheet.addRows([
      ...issuedReport.items.map((item) => {
        return [
          "",
          item.responsibilityCenter,
          item.stockNumber,
          item.description,
          item.unitOfMeasure,
          item.quantityIssued,
          item.unitCost,
          item.quantityIssued * item.unitCost
        ]
      })
    ]);
  }

  let prefixedRows = 10;
  let entryRowCount = issuedReport.items.length + prefixedRows;
  for (let row = prefixedRows + 1; row <= entryRowCount; row++) {
    for (let col = 1; col <= 8; col++) {
      workSheet.getCell(row, col).border = {
        top: { style: 'thin' }, bottom: { style: 'thin' },
        left: { style: 'thin' }, right: { style: 'thin' }
      }
    }
  }

  workSheet.getRow(10).height = 40;
  for (let col = 1; col <= 8; col++) {
    const headerCell = workSheet.getCell(10, col);
    headerCell.font = { bold: true };
    headerCell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    headerCell.border = {
      top: { style: 'thick' }, bottom: { style: 'thick' }, left: { style: 'thick' }, right: { style: 'thick' }
    };
  }

}

export {
  convertIssuedReportToSpreadsheet
}