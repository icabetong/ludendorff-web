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

import { Department } from "./Department";
import DepartmentEditor from "./DepartmentEditor";
import { ActionType, initialState, reducer } from "./DepartmentEditorReducer";
import DepartmentList from "./DepartmentList";
import { usePermissions } from "../auth/AuthProvider";
import { ErrorNoPermissionState } from "../state/ErrorStates";
import CustomDialogTitle from "../../components/CustomDialogTitle";
import { Highlight, Provider, Results, SearchBox } from "../../components/Search";
import { departmentCollection, departmentManagerName, departmentName } from "../../shared/const";

import { firestore } from "../../index";
import { PaginationController } from "../../components/PaginationController";
import { usePagination } from "use-pagination-firestore";

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

type DepartmentScreenProps = {
  isOpen: boolean,
  onDismiss: () => void
}

const DepartmentScreen = (props: DepartmentScreenProps) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const classes = useStyles();
  const { canRead, canWrite } = usePermissions();
  const [state, dispatch] = useReducer(reducer, initialState);
  const [search, setSearch] = useState(false);

  const { items, isLoading, isStart, isEnd, getPrev, getNext } = usePagination<Department>(
    query(collection(firestore, departmentCollection), orderBy(departmentName, "asc")),
    { limit: 15 }
  )

  const onSearchInvoked = () => setSearch(!search);

  const onEditorCreate = () => dispatch({ type: ActionType.CREATE })
  const onEditorDismiss = () => dispatch({ type: ActionType.DISMISS })
  const onEditorUpdate = (department: Department) => dispatch({
    type: ActionType.UPDATE,
    payload: department
  })

  return (
    <>
      <Dialog
        fullScreen={ isMobile }
        fullWidth={ true }
        maxWidth="xs"
        open={ props.isOpen }
        onClose={ props.onDismiss }>
        <CustomDialogTitle onSearch={ onSearchInvoked }>{ t("navigation.departments") }</CustomDialogTitle>
        <DialogContent
          dividers={ true }
          className={ classes.root }>
          { search
            ?
            <Box>
              <InstantSearch
                searchClient={ Provider }
                indexName="departments">
                <Box className={ classes.searchBox }>
                  <SearchBox/>
                </Box>
                <Box className={ classes.search }>
                  <Results>
                    <DepartmentHits onItemSelect={ onEditorUpdate }/>
                  </Results>
                </Box>
              </InstantSearch>
            </Box>
            : canRead
              ? !isLoading
                ? <>
                    <DepartmentList
                      departments={ items }
                      onItemSelect={ onEditorUpdate }/>
                    <PaginationController
                      canBack={ isStart }
                      canForward={ isEnd }
                      onBackward={ getPrev }
                      onForward={ getNext }/>
                  </>
                : <LinearProgress/>
              : <ErrorNoPermissionState/>
          }
        </DialogContent>
        <DialogActions>
          <Button
            color="primary"
            onClick={ onEditorCreate }
            disabled={ !canWrite }>{ t("button.add") }</Button>
          <div style={ { flex: '1 0 0' } }/>
          <Button
            color="primary"
            onClick={ props.onDismiss }>{ t("button.close") }</Button>
        </DialogActions>
      </Dialog>
      { state.isOpen &&
        <DepartmentEditor
          isOpen={ state.isOpen }
          isCreate={ state.isCreate }
          department={ state.department }
          onDismiss={ onEditorDismiss }/>
      }
    </>
  )
}

export default DepartmentScreen;

type DepartmentHitsListProps = HitsProvided<Department> & {
  onItemSelect: (department: Department) => void
}
const DepartmentHitsList = (props: DepartmentHitsListProps) => {
  return (
    <>
      { props.hits.map((d: Department) => (
        <DepartmentListItem
          department={ d }
          onItemSelect={ props.onItemSelect }/>
      ))
      }
    </>
  )
}
const DepartmentHits = connectHits<DepartmentHitsListProps, Department>(DepartmentHitsList)

type DepartmentListItemProps = {
  department: Department,
  onItemSelect: (department: Department) => void
}
const DepartmentListItem = (props: DepartmentListItemProps) => {
  return (
    <ListItem
      button
      key={ props.department.departmentId }
      onClick={ () => props.onItemSelect(props.department) }>
      <ListItemText
        primary={ <Highlight
          attribute={ departmentName }
          hit={ props.department }/> }
        secondary={ <Highlight
          attribute={ departmentManagerName }
          hit={ props.department }/> }/>
    </ListItem>
  )
}