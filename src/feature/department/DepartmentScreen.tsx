import { useReducer, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Box,
  Dialog,
  DialogContent, Fab,
  LinearProgress,
} from "@mui/material";
import { InstantSearch } from "react-instantsearch-dom";
import { collection, orderBy, query } from "firebase/firestore";
import { Department, DepartmentRepository } from "./Department";
import DepartmentEditor from "./DepartmentEditor";
import { ActionType, initialState, reducer } from "./DepartmentEditorReducer";
import DepartmentList from "./DepartmentList";
import { usePermissions } from "../auth/AuthProvider";
import { Provider } from "../../components/Search";
import { departmentCollection, departmentName } from "../../shared/const";
import { firestore } from "../../index";
import { PaginationController } from "../../components/PaginationController";
import { usePagination } from "use-pagination-firestore";
import useQueryLimit from "../shared/hooks/useQueryLimit";
import DialogToolbar from "../../components/DialogToolbar";
import { Transition } from "../../components/EditorComponent";
import DepartmentDataGrid from "./DepartmentDataGrid";
import useSort from "../shared/hooks/useSort";
import { getEditorDataGridTheme } from "../core/Core";
import { isDev } from "../../shared/utils";
import ConfirmationDialog from "../shared/ConfirmationDialog";
import { useSnackbar } from "notistack";
import { ErrorNoPermissionState } from "../state/ErrorStates";
import { AddRounded } from "@mui/icons-material";
import DepartmentSearchList from "./DepartmentSearchList";

type DepartmentScreenProps =   {
  isOpen: boolean,
  onDismiss: () => void
}

const DepartmentScreen = (props: DepartmentScreenProps) => {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const { canRead, canWrite } = usePermissions();
  const { limit, onLimitChanged } = useQueryLimit('departmentQueryLimit');
  const [state, dispatch] = useReducer(reducer, initialState);
  const [department, setDepartment] = useState<Department | undefined>(undefined);
  const [search, setSearch] = useState(false);
  const { sortMethod, onSortMethodChange } = useSort('departmentSort');

  const { items, isLoading, isStart, isEnd, getPrev, getNext } = usePagination<Department>(
    query(collection(firestore, departmentCollection), orderBy(departmentName, "asc")), {
      limit: limit,
    }
  )

  const onSearchInvoked = () => setSearch(!search);

  const onEditorCreate = () => dispatch({ type: ActionType.CREATE })
  const onEditorDismiss = () => dispatch({ type: ActionType.DISMISS })
  const onEditorUpdate = (department: Department) => dispatch({
    type: ActionType.UPDATE,
    payload: department
  });

  const onRemoveInvoke = (department: Department) => setDepartment(department);
  const onRemoveDismiss = () => setDepartment(undefined);

  const onDepartmentRemove = () => {
    if (department !== undefined) {
      DepartmentRepository.remove(department)
        .then(() => enqueueSnackbar(t("feedback.department_removed")))
        .catch((error) => {
          enqueueSnackbar(t("feedback.department_remove_error"));
          if (isDev) console.log(error)
        })
        .finally(onRemoveDismiss)
    }
  }

  return (
    <InstantSearch searchClient={Provider} indexName="departments">
      <Dialog
        fullScreen={true}
        open={props.isOpen}
        TransitionComponent={Transition}>
        <DialogToolbar
          title={t("navigation.departments")}
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
            ? <>
                <Box sx={(theme) => ({
                  maxWidth: { xl: '1600px' },
                  display: { xs: 'none', md: 'block' },
                  p: 2,
                  height: '100%',
                  margin: '0 auto',
                  ...getEditorDataGridTheme(theme),
                })}>
                  <DepartmentDataGrid
                    items={items}
                    size={limit}
                    isSearching={search}
                    sortMethod={sortMethod}
                    canBack={isStart}
                    canForward={isEnd}
                    onBackward={getPrev}
                    onForward={getNext}
                    onPageSizeChanged={onLimitChanged}
                    onItemSelect={onEditorUpdate}
                    onRemoveInvoke={onRemoveInvoke}
                    onSortMethodChanged={onSortMethodChange}/>
                </Box>
                <Box sx={{ height: '100%', display: { xs: 'block', md: 'none' }}}>
                { !isLoading
                  ? <>
                    { search
                      ? <DepartmentSearchList onItemSelect={onEditorUpdate}/>
                      : <>
                          <DepartmentList
                            departments={items}
                            onItemSelect={onEditorUpdate}
                            onRemoveInvoke={onRemoveInvoke}/>
                        { isEnd && items.length > 0 && items.length === limit &&
                          <PaginationController
                            canBack={isStart}
                            canForward={isEnd}
                            onBackward={getPrev}
                            onForward={getNext}/>
                        }
                        </>
                    }
                    { canWrite &&
                      <Fab color="primary" aria-label={t("button.add")} onClick={onEditorCreate}>
                        <AddRounded/>
                      </Fab>
                    }
                  </>
                  : <LinearProgress/>
                }
              </Box>
              </>
            : <ErrorNoPermissionState/>
          }

        </DialogContent>
      </Dialog>
      <DepartmentEditor
        isOpen={state.isOpen}
        isCreate={state.isCreate}
        department={state.department}
        onDismiss={onEditorDismiss}/>
      <ConfirmationDialog
        isOpen={department !== undefined}
        title="dialog.department_remove"
        summary="dialog.department_remove_summary"
        onDismiss={onRemoveDismiss}
        onConfirm={onDepartmentRemove}/>
    </InstantSearch>
  )
}

export default DepartmentScreen;