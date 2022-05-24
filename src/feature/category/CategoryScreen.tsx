import { useReducer, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  Box,
  Dialog,
  DialogContent,
  LinearProgress,
  Snackbar,
} from "@mui/material";
import { InstantSearch } from "react-instantsearch-core";
import { collection, orderBy, query, limit } from "firebase/firestore";
import { Category } from "./Category";
import CategoryEditor from "./CategoryEditor";
import { initialState, reducer } from "./CategoryEditorReducer";
import CategoryList from "./CategoryList";
import CategorySearchList from "./CategorySearchList";
import { usePermissions } from "../auth/AuthProvider";
import Client from "../search/Client";
import { ErrorNoPermissionState } from "../state/ErrorStates";
import { categoryCollection, categoryId } from "../../shared/const";
import { firestore } from "../../index";
import { DialogToolbar } from "../../components/dialog/DialogToolbar";
import { SlideUpTransition } from "../../components/transition/SlideUpTransition";
import { PaginationController } from "../../components/data/PaginationController";
import usePagination from "../shared/hooks/usePagination";

type CategoryScreenProps = {
  isOpen: boolean,
  onDismiss: () => void,
}

const CategoryScreen = (props: CategoryScreenProps) => {
  const { t } = useTranslation();
  const [search, setSearch] = useState(false);
  const [state, dispatch] = useReducer(reducer, initialState);
  const { canRead, canWrite } = usePermissions();

  const { items, isLoading, error, canBack, canForward, onBackward, onForward } = usePagination<Category>(
    query(collection(firestore, categoryCollection), orderBy(categoryId, "asc"), limit(25)),
    categoryId, 25
  );

  const onSearchInvoked = () => setSearch(!search);

  const onEditorCreate = () => dispatch({ type: "create" })
  const onEditorDismiss = () => dispatch({ type: "dismiss" })
  const onEditorUpdate = (type: Category) => dispatch({ type: "update", payload: type })

  return (
    <InstantSearch searchClient={Client} indexName="categories">
      <Dialog
        fullScreen={true}
        open={props.isOpen}
        TransitionComponent={SlideUpTransition}>
        <DialogToolbar
          title={t("navigation.categories")}
          onAdd={canWrite ? onEditorCreate : undefined}
          onDismiss={props.onDismiss}
          onSearchFocusChanged={onSearchInvoked}/>
        <DialogContent
          dividers={true}
          sx={{
            minHeight: '60vh',
            paddingX: 0,
            '& .MuiList-padding': { padding: 0 }
          }}>
          { canRead
            ? !isLoading
              ? <Box sx={{ height: '100%' }}>
                  { search
                    ? <CategorySearchList onItemSelect={onEditorUpdate}/>
                    : <>
                      <CategoryList categories={items} onItemSelect={onEditorUpdate}/>
                      { canForward && items.length > 0 && items.length === 25 &&
                        <PaginationController
                          canBack={canBack}
                          canForward={canForward}
                          onBackward={onBackward}
                          onForward={onForward}/>
                      }
                      </>
                  }
                </Box>
              : <LinearProgress/>
            : <ErrorNoPermissionState/>
          }
        </DialogContent>
      </Dialog>
      <CategoryEditor
        isOpen={state.isOpen}
        isCreate={state.isCreate}
        category={state.category}
        onDismiss={onEditorDismiss}/>
      <Snackbar open={Boolean(error)}>
        <Alert severity="error">
          {error?.message}
        </Alert>
      </Snackbar>
    </InstantSearch>
  )
}
export default CategoryScreen;