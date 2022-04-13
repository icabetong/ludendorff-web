import * as Excel from "exceljs";

function numToLetter(num: number) {
  return String.fromCharCode(65 + (num - 1))
}

function letterToNum(letter: string) {
  if (letter.length > 1)
    return 0;

  return (letter.charCodeAt(0) - 65) + 1
}

async function convertWorkbookToBlob(workbook: Excel.Workbook) {
  const buffer = await workbook.xlsx.writeBuffer();
  return new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  });
}

export {
  letterToNum,
  numToLetter,
  convertWorkbookToBlob
}