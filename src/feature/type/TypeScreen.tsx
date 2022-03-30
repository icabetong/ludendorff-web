import { useReducer, useState, useEffect } from "react";
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
  makeStyles,
} from "@material-ui/core";
import { InstantSearch, connectHits } from "react-instantsearch-dom";
import { HitsProvided } from "react-instantsearch-core";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";

import { Type } from "./Type";
import CategoryEditorComponent from "./TypeEditor";
import { ActionType, initialState, reducer } from "./TypeEditorReducer";
import TypeList from "./TypeList";
import { usePermissions } from "../auth/AuthProvider";
import { ErrorNoPermissionState } from "../state/ErrorStates";
import CustomDialogTitle from "../../components/CustomDialogTitle";
import { SearchBox, Highlight, Provider, Results } from "../../components/Search";
import { typeCollection, typeName } from "../../shared/const";

import { firestore } from "../../index";

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
  const isMobile = useMediaQuery(theme.breakpoints.down('xs'));
  const [search, setSearch] = useState(false);
  const [isLoading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Type[]>([]);
  const [state, dispatch] = useReducer(reducer, initialState);
  const { canRead, canWrite } = usePermissions();
  const classes = useStyles();

  useEffect(() => {
    let mounted = true;
    const unsubscribe = onSnapshot(query(collection(firestore, typeCollection), orderBy(typeName, "asc")), (snapshot) => {
      if (mounted) {
        setCategories(snapshot.docs.map((doc) => doc.data() as Type));
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      unsubscribe();
    }
  }, []);

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
        <DialogContent dividers={true} className={classes.root}>
          {search
            ? <InstantSearch searchClient={Provider} indexName="types">
              <Box className={classes.searchBox}>
                <SearchBox />
              </Box>
              <Box className={classes.search}>
                <Results>
                  <TypeHits onItemSelect={onEditorUpdate} />
                </Results>
              </Box>
            </InstantSearch>
            : canRead
              ? !isLoading
                ? <TypeList
                    categories={categories}
                    onItemSelect={onEditorUpdate} />
                : <LinearProgress />
              : <ErrorNoPermissionState />
          }
        </DialogContent>
        <DialogActions>
          <Button color="primary" onClick={onEditorCreate} disabled={!canWrite}>{t("button.add")}</Button>
          <div style={{ flex: '1 0 0' }}></div>
          <Button color="primary" onClick={props.onDismiss}>{t("button.close")}</Button>
        </DialogActions>
      </Dialog>
      {state.isOpen &&
        <CategoryEditorComponent
          isOpen={state.isOpen}
          isCreate={state.isCreate}
          type={state.category}
          onDismiss={onEditorDismiss} />
      }
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
        <TypeListItem type={c} onItemSelect={props.onItemSelect} />
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
        primary={<Highlight attribute={typeName} hit={props.type} />}
        secondary={t("template.count", { count: props.type.count })} />
    </ListItem>
  )
}