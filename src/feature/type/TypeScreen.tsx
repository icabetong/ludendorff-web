import { useReducer, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Box,
  Dialog,
  DialogContent,
  LinearProgress
} from "@mui/material";
import { InstantSearch } from "react-instantsearch-dom";
import { collection, orderBy, query } from "firebase/firestore";
import { Type } from "./Type";
import TypeEditor from "./TypeEditor";
import { ActionType, initialState, reducer } from "./TypeEditorReducer";
import TypeList from "./TypeList";
import { usePermissions } from "../auth/AuthProvider";
import { ErrorNoPermissionState } from "../state/ErrorStates";
import { Provider } from "../../components/Search";
import { typeCollection, typeName } from "../../shared/const";
import { firestore } from "../../index";
import { usePagination } from "use-pagination-firestore";
import { PaginationController } from "../../components/PaginationController";
import useQueryLimit from "../shared/hooks/useQueryLimit";
import DialogToolbar from "../../components/DialogToolbar";
import { Transition } from "../../components/EditorComponent";
import TypeSearchList from "./TypeSearchList";

type TypeScreenProps = {
  isOpen: boolean,
  onDismiss: () => void,
}

const TypeScreen = (props: TypeScreenProps) => {
  const { t } = useTranslation();
  const [search, setSearch] = useState(false);
  const [state, dispatch] = useReducer(reducer, initialState);
  const { canRead, canWrite } = usePermissions();
  const { limit } = useQueryLimit('typeQueryLimit');

  const { items, isLoading, isStart, isEnd, getPrev, getNext } = usePagination<Type>(
    query(collection(firestore, typeCollection), orderBy(typeName, "asc")),
    { limit: limit }
  );

  const onSearchInvoked = () => setSearch(!search);

  const onEditorCreate = () => dispatch({ type: ActionType.CREATE })
  const onEditorDismiss = () => dispatch({ type: ActionType.DISMISS })
  const onEditorUpdate = (type: Type) => dispatch({ type: ActionType.UPDATE, payload: type })

  return (
    <InstantSearch searchClient={Provider} indexName="types">
      <Dialog
        fullScreen={true}
        open={props.isOpen}
        TransitionComponent={Transition}>
        <DialogToolbar
          title={t("navigation.types")}
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
              ? <Box>
                  { search
                    ? <TypeSearchList onItemSelect={onEditorUpdate}/>
                    : <>
                      <TypeList types={items} onItemSelect={onEditorUpdate}/>
                      { isEnd && items.length > 0 && items.length === limit &&
                        <PaginationController
                          canBack={isStart}
                          canForward={isEnd}
                          onBackward={getPrev}
                          onForward={getNext}/>
                      }
                    </>
                  }
                </Box>
              : <LinearProgress/>
            : <ErrorNoPermissionState/>
          }
        </DialogContent>
      </Dialog>
      <TypeEditor
        isOpen={state.isOpen}
        isCreate={state.isCreate}
        type={state.type}
        onDismiss={onEditorDismiss}/>
    </InstantSearch>
  )
}
export default TypeScreen;