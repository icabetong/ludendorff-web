import * as Excel from "exceljs";
import { t } from "../../localization";
import { IssuedReport } from "./IssuedReport";
import { chunck } from "../../shared/utils";

// TODO: Fix border issues
const convertIssuedReportToSpreadsheet = (workBook: Excel.Workbook, name: string, issuedReport: IssuedReport) => {
  const maximumRowsForItems = 40;
  const workSheet = workBook.addWorksheet(name);
  workSheet.columns = [
    { width: 8 }, { width: 12 }, { width: 16 }, { width: 32 }, { width: 10 }, { width: 10 }, { width: 12 }, { width: 16 }
  ];

  function addDocumentHeader() {
    let row = workSheet.addRow([
      ...Array(6).fill(""),
      "Appendix 64"
    ]);
    row.height = 32;
    workSheet.getCell(row.number, 7).font = { italic: true, size: 20 }

    workSheet.addRow(['']);
    row = workSheet.addRow([t('document.issued').toUpperCase()]);
    workSheet.mergeCells(row.number, 1, row.number, 8);
    row.height = 30;
    let cell = workSheet.getCell(row.number, 1);
    cell.font = { bold: true, size: 18 };
    cell.alignment = { vertical: 'middle', horizontal: 'center' };

    workSheet.addRow(['']);
    workSheet.addRow(['']);

    row = workSheet.addRow([
      t("field.entity_name"), "",
      issuedReport.entityName, ...Array(3).fill(""),
      t("field.serial_number"), ""
    ]);
    workSheet.mergeCells(row.number, 1, row.number, 2);
    workSheet.mergeCells(row.number, 3, row.number, 6);

    row = workSheet.addRow([
      t("field.fund_cluster"), "",
      issuedReport.fundCluster, ...Array(3).fill(""),
      t("field.date"), ""
    ]);
    workSheet.mergeCells(row.number, 1, row.number, 2);
    workSheet.mergeCells(row.number, 3, row.number, 6);

    workSheet.addRow([]);

    row = workSheet.addRow([
      "To be filled up by the Supply and/or Property Division", ...Array(5).fill(""),
      "To be filled up by the Accounting Division",
    ]);
    workSheet.mergeCells(row.number, 1, row.number, 6);
    workSheet.mergeCells(row.number, 7, row.number, 8);
    row.height = 22;
    cell = workSheet.getCell(row.number, 1);
    cell.font = { italic: true, size: 8 };
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
    cell.border = {
      top: { style: 'thick' }, bottom: { style: 'thick' }, left: { style: 'thick' }, right: { style: 'thick' }
    };

    cell = workSheet.getCell(row.number, 7);
    cell.font = { italic: true, size: 8 };
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
    cell.border = {
      top: { style: 'thick' }, bottom: { style: 'thick' }, left: { style: 'thick' }, right: { style: 'thick' }
    };

    row = workSheet.addRow([
      t("field.ris_no"),
      t("field.responsibility_center"),
      t("field.stock_number"),
      t("field.item"),
      t("field.unit"),
      t("field.quantity_issued"),
      t("field.unit_cost"),
      t("field.amount")
    ]);
    row.height = 40;
    for (let col = 1; col <= 8; col++) {
      const headerCell = workSheet.getCell(row.number, col);
      headerCell.font = { bold: true };
      headerCell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
      headerCell.border = {
        top: { style: 'thick' }, bottom: { style: 'thick' }, left: { style: 'thick' }, right: { style: 'thick' }
      };
    }
  }
  function addDocumentSignatureArea() {
    let row = workSheet.addRow([
      "", t("field.recapitulation"), "", "", "", t("field.recapitulation")
    ]);
    workSheet.mergeCells(row.number, 2, row.number, 3);
    workSheet.mergeCells(row.number, 6, row.number, 8);
    for (let col = 1; col <= 8; col++) {
      const cell = workSheet.getCell(row.number, col);
      cell.border = {
        top: { style: 'thin' },
        bottom: { style: 'thin' },
        left: { style: 'thin' },
        right: { style: 'thin' }
      }
    }
    for (let col = 1; col <= 8; col++) {
      const cell = workSheet.getCell(row.number, col);
      if (col === 2 || col === 3 || col === 6 || col === 7 || col === 8) {
        cell.border = {
          top: { style: 'thick' }, bottom: { style: 'thick' }, left: { style: 'thick' }, right: { style: 'thick' }
        }
      }
    }

    row = workSheet.addRow([
      "", t("field.stock_number"), t("field.quantity"), "", "",
      t("field.unit_cost"), t("field.total_cost"), t("field.uacs_object_code")
    ]);
    row.height = 40;
    for (let col = 1; col <= 8; col++) {
      const cell = workSheet.getCell(row.number, col);
      cell.border = {
        top: { style: 'thin' },
        bottom: { style: 'thin' },
        left: { style: 'thin' },
        right: { style: 'thin' }
      }
    }
    for (let col = 1; col <= 8; col++) {
      const cell = workSheet.getCell(row.number, col);
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
      if (col === 2 || col === 3 || col === 6 || col === 7 || col === 8) {
        cell.border = {
          top: { style: 'thick' }, bottom: { style: 'thick' }, left: { style: 'thick' }, right: { style: 'thick' }
        }
      }
    }

    for (let i = 0; i <= 10; i++) {
      row = workSheet.addRow([""]);
      for (let col = 1; col <= 8; col++) {
        const cell = workSheet.getCell(row.number, col);
        cell.border = {
          top: { style: 'thin' },
          bottom: { style: 'thin' },
          left: { style: 'thin' },
          right: { style: 'thin' }
        }
      }
      for (let col = 1; col <= 8; col++) {
        const cell = workSheet.getCell(row.number, col);
        if (col === 2 || col === 3 || col === 6 || col === 7 || col === 8) {
          cell.border = {
            left: { style: 'thick' }, right: { style: 'thick' },
            bottom: { style: i === 10 ? undefined : 'thin' }
          }
        }
      }
    }

    row = workSheet.addRow([
      ...Array(5).fill(""), t("field.posted_by"), "", "",
    ]);
    for (let col = 1; col <= 8; col++) {
      const cell = workSheet.getCell(row.number, col);
      cell.border = {
        top: { style: 'thick' }
      }
    }

    row = workSheet.addRow([
      "I hereby certify to the correctness of the above information"
    ]);
    let cell = workSheet.getCell(row.number, 1);
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
    workSheet.mergeCells(row.number, 1, row.number, 5);
    workSheet.addRow([""]);
    workSheet.addRow([""]);

    row = workSheet.addRow([
      issuedReport.entityName
    ]);
    cell = workSheet.getCell(row.number, 1);
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
    workSheet.mergeCells(row.number, 1, row.number, 5);
    row = workSheet.addRow([
      "Chief, Property and Supply Office", ...Array(4).fill(""),
      "Signature Over Printed Name", "", "Date"
    ]);
    cell = workSheet.getCell(row.number, 1);
    cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };

    cell = workSheet.getCell(row.number, 6);
    cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };

    cell = workSheet.getCell(row.number, 8);
    cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };

    workSheet.addRow([""]);
    workSheet.mergeCells(row.number, 1, row.number + 1, 5);
    workSheet.mergeCells(row.number, 6, row.number + 1, 7);
    workSheet.mergeCells(row.number, 8, row.number + 1, 8);
  }

  if (issuedReport.issuedItems) {
    let sorted = issuedReport.issuedItems.sort((a, b): number => {
      if (a.responsibilityCenter && b.responsibilityCenter) {
        if (a.responsibilityCenter < b.responsibilityCenter) return -1;
        if (a.responsibilityCenter > b.responsibilityCenter) return 1;
        return 0;
      } else return 0;
    })
    let items = chunck(sorted, maximumRowsForItems);

    items.forEach((i, index) => {
      addDocumentHeader();
      let rows = workSheet.addRows([
        ...i.map((item) => {
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
      rows.forEach((row, index) => {
        for (let col = 1; col <= 8; col++) {
          workSheet.getCell(row.number, col).border = {
            top: { style: index === 0 ? 'thick' : 'thin' },
            bottom: { style: 'thin' },
            left: { style: 'thin' },
            right: { style: 'thin' }
          }
        }
      });

      // check if it is the last array item
      // if is not, then add some separators
      if (items.length - 1 !== index) {
        workSheet.addRows(Array(2).fill([""]));
      }
    });

    let lastItems = items[items.length - 1];
    if (lastItems.length < maximumRowsForItems - 20) {
      let spaces = maximumRowsForItems - lastItems.length;
      let rows = workSheet.addRows(Array(spaces).fill([""]));
      rows.forEach((row) => {
        for (let col = 1; col <= 8; col++) {
          workSheet.getCell(row.number, col).border = {
            top: { style: 'thin' },
            bottom: { style: 'thin' },
            left: { style: 'thin' },
            right: { style: 'thin' }
          }
        }
      });
      addDocumentSignatureArea();
    } else {
      addDocumentHeader();
      let rows = workSheet.addRows(Array(maximumRowsForItems).fill([""]));
      rows.forEach((row) => {
        for (let col = 1; col <= 8; col++) {
          workSheet.getCell(row.number, col).border = {
            top: { style: 'thin' },
            bottom: { style: 'thin' },
            left: { style: 'thin' },
            right: { style: 'thin' }
          }
        }
      });
      addDocumentSignatureArea();
    }
  }
}

export {
  convertIssuedReportToSpreadsheet
}