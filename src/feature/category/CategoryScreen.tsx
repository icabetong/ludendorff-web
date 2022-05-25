import { useReducer, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Box,
  Dialog,
  DialogContent,
} from "@mui/material";
import { InstantSearch } from "react-instantsearch-core";
import { Category } from "./Category";
import CategoryEditor from "./CategoryEditor";
import { initialState, reducer } from "./CategoryEditorReducer";
import CategoryList from "./CategoryList";
import CategorySearchList from "./CategorySearchList";
import { useCategories } from "./CategoryProvider";
import { usePermissions } from "../auth/AuthProvider";
import Client from "../search/Client";
import { ErrorNoPermissionState } from "../state/ErrorStates";
import { DialogToolbar } from "../../components/dialog/DialogToolbar";
import { SlideUpTransition } from "../../components/transition/SlideUpTransition";

type CategoryScreenProps = {
  isOpen: boolean,
  onDismiss: () => void,
}

const CategoryScreen = (props: CategoryScreenProps) => {
  const { t } = useTranslation();
  const [search, setSearch] = useState(false);
  const [state, dispatch] = useReducer(reducer, initialState);
  const categories = useCategories();
  const { canRead, canWrite } = usePermissions();

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
            ? <Box sx={{ height: '100%' }}>
                { search
                  ? <CategorySearchList onItemSelect={onEditorUpdate}/>
                  : <CategoryList categories={categories} onItemSelect={onEditorUpdate}/>
                }
                </Box>
            : <ErrorNoPermissionState/>
          }
        </DialogContent>
      </Dialog>
      <CategoryEditor
        isOpen={state.isOpen}
        isCreate={state.isCreate}
        category={state.category}
        onDismiss={onEditorDismiss}/>
    </InstantSearch>
  )
}
export default CategoryScreen;