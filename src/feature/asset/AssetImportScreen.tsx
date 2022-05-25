import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  Box,
  Button,
  Dialog,
  TextField,
  Stack,
} from "@mui/material";
import { FolderRounded } from "@mui/icons-material";
import { query, collection, doc, where, getDocs, getDoc } from "firebase/firestore";
import * as Excel from "exceljs";
import { useSnackbar } from "notistack";
import { AssetRepository } from "./Asset";
import AssetImportDataGrid from "./AssetImportDataGrid";
import { AssetImport } from "./AssetImport";
import AssetImportEditor from "./AssetImportEditor";
import { Category, CategoryCore, minimize } from "../category/Category";
import CategoryPicker from "../category/CategoryPicker";
import { useCategories } from "../category/CategoryProvider";
import { useDialog } from "../../components/dialog/DialogProvider";
import { EditorAppBar } from "../../components/editor/EditorAppBar";
import { EditorContent } from "../../components/editor/EditorContent";
import { EditorRoot } from "../../components/editor/EditorRoot";
import { SlideUpTransition } from "../../components/transition/SlideUpTransition";
import { firestore } from "../../index";
import { assetCollection, categoryCollection, categoryName } from "../../shared/const";
import { isDev, newId } from "../../shared/utils";
import AssetImportDuplicate from "./AssetImportDuplicate";
import { GroupedArray } from "../shared/types/GroupedArray";

type AssetImportScreenProps = {
  isOpen: boolean,
  onDismiss: () => void,
}

const AssetImportScreen = (props: AssetImportScreenProps) => {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const show = useDialog();
  const categories = useCategories();
  const [name, setName] = useState<String>("");
  const [isWorking, setWorking] = useState(false);
  const [assets, setAssets] = useState<AssetImport[]>([]);
  const [duplicates, setDuplicates] = useState<AssetImport[]>([]);
  const [importedAssets, setImportedAssets] = useState<AssetImport[]>([]);
  const [asset, setAsset] = useState<AssetImport | undefined>(undefined);
  const [checked, setChecked] = useState<string[]>([]);
  const [isPickerOpen, setPickerOpen] = useState(false);
  const [stockNumbers, setStockNumbers] = useState<string[]>(() => {
    return Array.from(new Set(importedAssets.map((asset) => asset.stockNumber)));
  });

  useEffect(() => {
    async function verify(stockNumber: string) {
      let snapshot = await getDoc(doc(firestore, assetCollection, stockNumber));
      return snapshot.exists();
    }
    async function check() {
      let current: AssetImport[] = [];
      for (let asset of assets) {
        let currentAsset = asset;
        let status = await verify(asset.stockNumber);

        currentAsset.status = status ? "exists" : "absent";
        current.push(asset);
      }
      return current;
    }

    check()
      .then((data) => {
        setImportedAssets(data);
        setStockNumbers(Array.from(new Set(data.map((asset) => asset.stockNumber))));
      })
      .catch(error => {
        if (isDev) console.log(error)
      }).finally(() => setWorking(false));
  }, [assets]);

  const onSubmit = async () => {
    try {
      let currentAssets = Array.from(assets);
      if (currentAssets.some((a) => !Boolean(a.category))) {
        let result = await show({
          title: t("dialog.assets_no_category"),
          description: t("dialog.assets_no_category_summary"),
          confirmButtonText: t("button.continue"),
          dismissButtonText: t("button.cancel")
        });
        if (!result) return;
      }

      setWorking(true);
      await AssetRepository.createFromArray(currentAssets);
      enqueueSnackbar(t("feedback.asset_imported"));
    } catch (error) {
      enqueueSnackbar(t("feedback.asset_import_error"));
      if (isDev) console.log(error);
    } finally  {
      setWorking(false);
      onDismiss();
    }
  }

  const onDismiss = () => {
    props.onDismiss();
  }

  const onCategoryPickerInvoke = () => setPickerOpen(true);
  const onCategoryPickerDismiss = () => setPickerOpen(false);
  const onCategorySelected = (category: Category) => {
    const categoryCore = minimize(category);
    let currentAssets = assets;
    checked.forEach((stockNumber) => {
      const index = currentAssets.findIndex((asset) => asset.stockNumber === stockNumber);
      if (index >= 0) {
        currentAssets[index].category = categoryCore;
      }
    });
    setAssets(currentAssets);
    setChecked([]);
    onCategoryPickerDismiss();
  }

  const onAssetEditorCommit = (asset: AssetImport, previousStockNumber: string | undefined) => {
    if (!previousStockNumber) return;

    let currentAssets = Array.from(assets);
    let index = currentAssets.findIndex(a => a.stockNumber === previousStockNumber);
    if (index >= 0) {
      currentAssets[index] = asset;
      setAssets(currentAssets);
    }
    onAssetEditorDismiss();
  }
  const onAssetEditorDismiss = () => setAsset(undefined);
  const onAssetSelect = (asset: AssetImport) => setAsset(asset);
  const onAssetRemove = (asset: AssetImport) => {
    let currentAssets = assets;
    currentAssets = currentAssets.filter((a) => {
      return asset.stockNumber !== a.stockNumber
    });
    setTimeout(() => { setAssets(currentAssets) });
  }
  const onAssetCategoryPicked = (stockNumber: string) => {
    const ids = [stockNumber];
    setChecked(ids);
    onCategoryPickerInvoke();
  }

  const onRemoveCheckedAssets = () => {
    let currentAssets = assets;
    currentAssets = currentAssets.filter((asset) => {
      return !checked.includes(asset.stockNumber);
    });
    setAssets(currentAssets);
  }

  const onParseWorkbook = async (workbook: Excel.Workbook, buffer: Buffer) => {
    let data = await workbook.xlsx.load(buffer as Buffer);
    if (data.worksheets.length > 0) {
      let sheet = data.worksheets[0];
      let assets = [];
      for (let row = 1; row <= sheet.actualRowCount; row++) {
        if (sheet.actualColumnCount >= 7) {
          const name = sheet.getCell(row, 3).text;
          let category: CategoryCore | null = null;
          let snapshot = await getDocs(query(collection(firestore, categoryCollection),
              where(categoryName, "==", name)));
          if (snapshot.docs.length > 0) {
            category = minimize(snapshot.docs[0].data() as Category);
          }

          let asset: AssetImport = {
            id: newId(),
            stockNumber: sheet.getCell(row, 1).text,
            description: sheet.getCell(row, 2).text,
            category: category ? category : undefined,
            subcategory: sheet.getCell(row, 4).text,
            unitOfMeasure: sheet.getCell(row, 5).text,
            unitValue: parseFloat(sheet.getCell(row, 6).text),
            remarks: sheet.getCell(row, 7).text,
            status: "absent",
          }
          assets.push(asset);
        }
      }

      let stockNumbers = assets.map((asset) => asset.stockNumber);
      let duplicates = stockNumbers.filter((s, index) => stockNumbers.indexOf(s) !== index);
      let references = new Set(duplicates);
      stockNumbers = Array.from(references);
      let duplicateAssets = assets.filter((item) => stockNumbers.includes(item.stockNumber));
      if (duplicateAssets.length > 0) {
        assets = assets.filter((item) => !duplicateAssets.includes(item));
        setDuplicates(duplicateAssets);
      }

      setAssets(assets);
    } else enqueueSnackbar(t("feedback.workbook_empty_worksheet"));
  }

  const onInputChanged = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      let files = [...e.target.files];
      if (files.length > 0) {
        let targetFile = files[0];
        setName(targetFile.name);

        const workbook = new Excel.Workbook();
        const reader = new FileReader();

        reader.readAsArrayBuffer(targetFile);
        reader.onload = () => {
          const buffer = reader.result;
          if (!buffer) {
            return;
          }
          setWorking(true);
          onParseWorkbook(workbook, buffer as Buffer)
            .catch((error) => { if (isDev) console.log(error) });
        }
      }
    }
  }

  const onCheckedRowsChanged = (ids: string[]) => setChecked(ids);
  const onDuplicatesCleared = (assets: GroupedArray<AssetImport>) => {
    let flatted = Object.values(assets).flat();
    setAssets(prevState => {
      return prevState.concat(flatted);
    });
    setDuplicates([]);
  }

  return (
    <>
      <Dialog open={props.isOpen} TransitionComponent={SlideUpTransition} fullScreen>
        <EditorRoot>
          <EditorAppBar
            title={t("dialog.import_assets")}
            loading={isWorking}
            onDismiss={onDismiss}
            onConfirm={onSubmit}/>
          <EditorContent>
            <Box>
              <Alert severity="info">
                {t("info.import_requirements_asset_spreadsheet")}
              </Alert>
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="stretch"
                sx={{ marginTop: 2 }}>
                <TextField
                  fullWidth={false}
                  label={t("field.spreadsheet_file")}
                  value={name}
                  sx={{ flex: 1 }}
                  disabled={isWorking}
                  InputProps={{ readOnly: true }}/>
                <Button
                  component="label"
                  variant="outlined"
                  startIcon={<FolderRounded/>}
                  disabled={isWorking}
                  sx={{ ml: 1 }}>
                  {t("button.choose_file")}
                  <input type="file" onChange={onInputChanged} hidden/>
                </Button>
              </Stack>
            </Box>
            <AssetImportDataGrid
              assets={importedAssets}
              isLoading={isWorking}
              onItemSelect={onAssetSelect}
              onItemRemove={onAssetRemove}
              onItemsChecked={onCheckedRowsChanged}
              onBulkCategoryPick={onCategoryPickerInvoke}
              onAssetCategoryPick={onAssetCategoryPicked}
              onRemovedChecked={onRemoveCheckedAssets}/>
          </EditorContent>
        </EditorRoot>
      </Dialog>
      <AssetImportEditor
        isOpen={Boolean(asset)}
        asset={asset}
        onSubmit={onAssetEditorCommit}
        onDismiss={onAssetEditorDismiss}/>
      <AssetImportDuplicate
        isOpen={duplicates.length > 0}
        assets={duplicates}
        stockNumbers={stockNumbers}
        onContinue={onDuplicatesCleared}/>
      <CategoryPicker
        categories={categories}
        isOpen={isPickerOpen}
        onDismiss={onCategoryPickerDismiss}
        onSelectItem={onCategorySelected}/>
    </>
  )
}

export default AssetImportScreen;