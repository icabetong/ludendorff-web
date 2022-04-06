import { useReducer, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  LinearProgress,
  ListItem,
  ListItemText,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import makeStyles from '@mui/styles/makeStyles';
import { connectHits, InstantSearch } from "react-instantsearch-dom";
import { HitsProvided } from "react-instantsearch-core";
import { collection, orderBy, query } from "firebase/firestore";

import { Type } from "./Type";
import CategoryEditorComponent from "./TypeEditor";
import { ActionType, initialState, reducer } from "./TypeEditorReducer";
import TypeList from "./TypeList";
import { usePermissions } from "../auth/AuthProvider";
import { ErrorNoPermissionState } from "../state/ErrorStates";
import CustomDialogTitle from "../../components/CustomDialogTitle";
import { Highlight, Provider, Results, SearchBox } from "../../components/Search";
import { typeCollection, typeName } from "../../shared/const";

import { firestore } from "../../index";
import { usePagination } from "use-pagination-firestore";
import { PaginationController } from "../../components/PaginationController";
import useQueryLimit from "../shared/useQueryLimit";

const useStyles = makeStyles(() => ({
  root: {
    minHeight: '60vh',
    paddingTop: 0,
    paddingBottom: 0,
    '& .MuiList-padding': {
      padding: 0
    }
  },
  search: {
    minHeight: '60vh'
  },
  searchBox: {
    margin: '0.6em 1em'
  }
}));

type TypeScreenProps = {
  isOpen: boolean,
  onDismiss: () => void,
}

const TypeScreen = (props: TypeScreenProps) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [search, setSearch] = useState(false);
  const [state, dispatch] = useReducer(reducer, initialState);
  const { canRead, canWrite } = usePermissions();
  const { limit } = useQueryLimit('typeQueryLimit');
  const classes = useStyles();

  const { items, isLoading, isStart, isEnd, getPrev, getNext } = usePagination<Type>(
    query(collection(firestore, typeCollection), orderBy(typeName, "asc")),
    { limit: limit }
  );

  const onSearchInvoked = () => setSearch(!search);

  const onEditorCreate = () => dispatch({ type: ActionType.CREATE })
  const onEditorDismiss = () => dispatch({ type: ActionType.DISMISS })
  const onEditorUpdate = (category: Type) => dispatch({ type: ActionType.UPDATE, payload: category })

  return (
    <>
      <Dialog
        fullScreen={isMobile}
        fullWidth={true}
        maxWidth="xs"
        open={props.isOpen}
        onClose={props.onDismiss}>
        <CustomDialogTitle onSearch={onSearchInvoked}>{t("navigation.types")}</CustomDialogTitle>
        <DialogContent
          dividers={true}
          className={classes.root}>
          {search
            ? <InstantSearch
              searchClient={Provider}
              indexName="types">
              <Box className={classes.searchBox}>
                <SearchBox/>
              </Box>
              <Box className={classes.search}>
                <Results>
                  <TypeHits onItemSelect={onEditorUpdate}/>
                </Results>
              </Box>
            </InstantSearch>
            : canRead
              ? !isLoading
                ? <>
                  <TypeList
                    types={items}
                    onItemSelect={onEditorUpdate}/>
                  <PaginationController
                    canBack={isStart}
                    canForward={isEnd}
                    onBackward={getPrev}
                    onForward={getNext}/>
                </>
                : <LinearProgress/>
              : <ErrorNoPermissionState/>
          }
        </DialogContent>
        <DialogActions>
          <Button
            color="primary"
            onClick={onEditorCreate}
            disabled={!canWrite}>{t("button.add")}</Button>
          <div style={{ flex: '1 0 0' }}/>
          <Button
            color="primary"
            onClick={props.onDismiss}>{t("button.close")}</Button>
        </DialogActions>
      </Dialog>
      <CategoryEditorComponent
        isOpen={state.isOpen}
        isCreate={state.isCreate}
        type={state.type}
        onDismiss={onEditorDismiss}/>
    </>
  )
}
export default TypeScreen;

type TypeHitsListProps = HitsProvided<Type> & {
  onItemSelect: (category: Type) => void
}
const CategoryHitsList = (props: TypeHitsListProps) => {
  return (
    <>
      {props.hits.map((c: Type) => (
        <TypeListItem
          type={c}
          onItemSelect={props.onItemSelect}/>
      ))
      }
    </>
  )
}
const TypeHits = connectHits<TypeHitsListProps, Type>(CategoryHitsList);

type TypeListItemProps = {
  type: Type,
  onItemSelect: (category: Type) => void
}
const TypeListItem = (props: TypeListItemProps) => {
  const { t } = useTranslation();

  return (
    <ListItem
      button
      key={props.type.typeId}
      onClick={() => props.onItemSelect(props.type)}>
      <ListItemText
        primary={<Highlight
          attribute={typeName}
          hit={props.type}/>}
        secondary={t("template.count", { count: props.type.count })}/>
    </ListItem>
  )
}