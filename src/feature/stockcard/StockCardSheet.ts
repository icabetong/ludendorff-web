import { StockCard } from "./StockCard";
import { t } from "../../localization";
import { formatDate } from "../../shared/utils";
import * as Excel from "exceljs";
import { numToLetter } from "../../shared/spreadsheet";

// TODO: fix the Excel generation to accommodate the new Stock Card logic
const convertStockCardToWorkSheet = (workBook: Excel.Workbook, name: string, stockCard: StockCard) => {
  const workSheet = workBook.addWorksheet(stockCard.stockNumber);
  workSheet.columns = [
    { width: 18 }, { width: 24 }, { width: 10 }, { width: 12 }, { width: 10 }, { width: 20 }, { width: 16 }, { width: 22 }, { width: 14 }
  ]

  // create header
  workSheet.addRow([t("document.stock_card").toUpperCase()]);
  workSheet.mergeCells('A1:I1');
  workSheet.getCell('A1').fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'ffffff00' }
  }
  workSheet.getCell('A1').font = { bold: true, size: 20 }
  workSheet.getCell('A1').alignment = {
    vertical: 'middle',
    horizontal: 'center'
  }
  workSheet.getCell('A1').border = {
    top: { style: 'thick' }, bottom: { style: 'thick' }, left: { style: 'thick' }, right: { style: 'thick' },
  }
  workSheet.getRow(1).height = 40;

  // create form
  workSheet.addRow([t("field.entity_name"), stockCard.entityName]);
  workSheet.mergeCells('B2:I2');
  workSheet.getCell('B2').font = { bold: true }
  workSheet.addRow([
      t("field.item"),
      stockCard.description,
      ...Array(4).fill(""),
      t("field.stock_number"),
      stockCard.stockNumber
    ]);
  workSheet.getCell('A2').border = {
    top: { style: 'thick' }, bottom: { style: 'thick' }, left: { style: 'thick' },
  }
  workSheet.getCell('B2').border = {
    top: { style: 'thick' }, bottom: { style: 'thick' }, right: { style: 'thick' },
  }

  workSheet.addRow([
    t("field.asset_description"),
    ...Array(5).fill(""),
    t("field.reorder_point"),
  ]);

  workSheet.addRow([
    t("field.unit_of_measure"), "",
    stockCard.unitOfMeasure,
    ...Array(3).fill(""),
    t("field.unit_price"),
    stockCard.unitPrice
  ])

  // add gray colour on the form
  let from = 2, to = 5;
  for (let row = from; row <= to; row++) {
    for (let col = 1; col <= 8; col++) {
      workSheet.getCell(`${numToLetter(col)}${row}`).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'ff9ca3af' }
      }
    }
  }

  workSheet.getCell('B3').alignment = {
    vertical: 'middle',
    horizontal: 'center',
  }
  workSheet.mergeCells('B3:F4'); // description value
  workSheet.mergeCells('H3:I3'); // stock number value
  workSheet.mergeCells('A5:B5'); // unit of measurement field name
  workSheet.mergeCells('C5:F5'); // unit of measurement value
  workSheet.mergeCells('H4:I4'); //
  workSheet.mergeCells('H5:I5'); // unit price value

  for (let row = 3; row <= 5; row++) {
    workSheet.getCell(`A${row}`).border = { left: { style: 'thick' } }
    workSheet.getCell(`I${row}`).border = { right: { style: 'thick' } }
  }

  workSheet.addRow([
    t("field.date"),
    t("field.reference"),
    t("field.receipt"),
    t("field.requested"),
    t("field.issue"), "",
    t("field.balance"), "",
    t("field.days_to_consume")
  ]);
  workSheet.addRow([
    "", "",
    t("field.quantity"),
    t("field.quantity"),
    t("field.quantity"),
    t("field.office"),
    t("field.quantity"),
    t("field.total_price"),
    ""
  ])

  for (let row = 6; row <= 7; row++) {
    for (let col = 1; col <= 9; col++) {
      let cell = workSheet.getCell(`${numToLetter(col)}${row}`);
      cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'ffffff00' }};
      cell.border = {
        top: { style: col === 1 || col === 2 || col === 9 || row === 6 ? 'thick' : 'thin' },
        left: { style: col === 1 ? 'thick' : 'thin' },
        right: { style: col === 9 ? 'thick' : 'thin' },
        bottom: { style: row === 7 ? 'thick' : 'thin' }
      };
    }
  }

  workSheet.mergeCells('A6:A7'); // Date Header
  workSheet.mergeCells('B6:B7'); // Reference Header
  workSheet.mergeCells('E6:F6'); // Issue Columns (join)
  workSheet.mergeCells('G6:H6'); // Balance Columns (join)
  workSheet.mergeCells('I6:I7'); // Days to Consume Header

  workSheet.addRows([
    ...stockCard.entries.map((entry) => {
      return [
        formatDate(entry.date),
        entry.reference,
        entry.receivedQuantity,
        entry.requestedQuantity,
        entry.issueQuantity,
        entry.issueOffice,
        ""
      ]
    })
  ])

  let prefixedRows = 7;
  let entryRowCount = stockCard.entries.length + prefixedRows; // 7 is the previous rows before the data entries
  for (let row = prefixedRows + 1; row <= entryRowCount; row++) {
    for (let col = 1; col <= 9; col++) {
      workSheet.getCell(`${numToLetter(col)}${row}`).border = {
        top: { style: row === prefixedRows + 1 ? 'thick' : 'thin' },
        left: { style: 'thin' }, right: { style: 'thin' }, bottom: { style: 'thin' }
      }
    }
  }
}

export {
  convertStockCardToWorkSheet
}