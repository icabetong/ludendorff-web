import { StockCard, StockCardEntry, StockCardRepository } from "./StockCard";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { useReducer, useState } from "react";
import { Asset } from "../asset/Asset";
import { usePagination } from "use-pagination-firestore";
import { collection, orderBy, query } from "firebase/firestore";
import { assetCollection, assetStockNumber } from "../../shared/const";
import { firestore } from "../../index";
import {
  Button,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormLabel,
  List,
  ListItem,
  TextField,
  Typography,
  useMediaQuery,
  useTheme
} from "@mui/material";
import StockCardEntryList from "./StockCardEntryList";
import { AddRounded } from "@mui/icons-material";
import { ActionType, initialState, reducer } from "./StockCardEntryEditorReducer";
import { StockCardEntryEditor } from "./StockCardEntryEditor";
import AssetPicker from "../asset/AssetPicker";
import { isDev, newId } from "../../shared/utils";
import { useSnackbar } from "notistack";

export type FormValues = {
  entityName?: string,
}

type StockCardEditorProps = {
  isOpen: boolean,
  isCreate: boolean,
  stockCard?: StockCard
  onDismiss: () => void,
}

export const StockCardEditor = (props: StockCardEditorProps) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>();
  const [asset, setAsset] = useState<Asset | null>(null);
  const [isOpen, setOpen] = useState(false);
  const [entries, setEntries] = useState<StockCardEntry[]>([]);
  const [state, dispatch] = useReducer(reducer, initialState);
  const { enqueueSnackbar } = useSnackbar();

  const onEditorCreate = () => dispatch({ type: ActionType.CREATE });
  const onEditorDismiss = () => dispatch({ type: ActionType.DISMISS });
  const onEditorUpdate = (entry: StockCardEntry) => dispatch({ type: ActionType.UPDATE, payload: entry });
  const onEditorCommit = (entry: StockCardEntry) => {
    let currentEntries = entries;
    let index = currentEntries.findIndex((i) => i.stockCardEntryId === entry.stockCardEntryId);
    if (index < 0) {
      currentEntries.push(entry);
    } else {
      currentEntries[index] = entry;
    }
    setEntries(currentEntries);
  }

  const onPickerInvoke = () => setOpen(true);
  const onPickerDismiss = () => setOpen(false);

  const { items, isLoading, isStart, isEnd, getPrev, getNext } = usePagination<Asset>(
      query(collection(firestore, assetCollection), orderBy(assetStockNumber, "asc")), {
        limit: 15
    }
  )

  const onSubmit = (values: FormValues) => {
    if (!asset) {
      return;
    }

    const { unitValue, ...remain } = asset;
    const stockCard: StockCard = {
      stockCardId: props.stockCard ? props.stockCard.stockCardId : newId(),
      ...values,
      unitPrice: unitValue,
      ...remain,
      entries: entries,
    }

    if (props.isCreate) {
      StockCardRepository.create(stockCard)
        .then(() => enqueueSnackbar(t("feedback.stock_card_created")))
        .catch((error) => {
          enqueueSnackbar(t("feedback.stock_card_create_error"))
          if (isDev) console.log(error)
        })
        .finally(props.onDismiss)
    } else {
      StockCardRepository.update(stockCard)
        .then(() => enqueueSnackbar(t("feedback.stock_card_updated")))
        .catch((error) => {
          enqueueSnackbar(t("feedback.stock_card_update_error"))
          if (isDev) console.log(error);
        })
        .finally(props.onDismiss)
    }
  }

  return (
    <>
      <Dialog
        open={props.isOpen}
        fullWidth={true}
        fullScreen={isMobile}
        maxWidth="xs"
        onClose={props.onDismiss}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogTitle>{t("dialog.details_stock_card")}</DialogTitle>
          <DialogContent>
            <Container disableGutters>
              <FormLabel component="legend">{t("field.asset")}</FormLabel>
              <ListItem button onClick={onPickerInvoke}>
                { asset?.description ? asset?.description : t("button.not_set") }
              </ListItem>
              <TextField
                autoFocus
                id="entityName"
                type="text"
                label={t("field.entity_name")}
                defaultValue={props.stockCard && props.stockCard?.entityName}
                error={errors.entityName !== undefined}
                helperText={errors.entityName?.message && t(errors.entityName?.message)}
                disabled={!asset}
                {...register("entityName", { required: "feedback.empty_entity_name" })}/>
              <FormLabel component="legend">
                <Typography variant="body2">{t("field.entries")}</Typography>
              </FormLabel>
              <List>
                <StockCardEntryList
                  entries={entries}
                  onItemSelected={onEditorUpdate}/>
              </List>
              <Button
                fullWidth
                startIcon={ <AddRounded/> }
                onClick={ onEditorCreate }>
                { t("add") }
              </Button>
            </Container>
          </DialogContent>
          <DialogActions>
            <Button
              color="primary"
              onClick={props.onDismiss}>
              {t("button.cancel")}
            </Button>
            <Button
              color="primary"
              type="submit">
              {t("button.save")}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
      <AssetPicker
        isOpen={isOpen}
        assets={items}
        isLoading={isLoading}
        canBack={isStart}
        canForward={isEnd}
        onBackward={getPrev}
        onForward={getNext}
        onSelectItem={setAsset}
        onDismiss={onPickerDismiss}/>
      <StockCardEntryEditor
        isOpen={state.isOpen}
        isCreate={state.isCreate}
        onSubmit={onEditorCommit}
        onDismiss={onEditorDismiss}/>
    </>
  )
}