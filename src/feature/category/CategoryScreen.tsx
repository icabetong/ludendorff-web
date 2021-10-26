import { useReducer } from "react";
import { useTranslation } from "react-i18next";
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    LinearProgress,
    useMediaQuery,
    useTheme,
    makeStyles
} from "@material-ui/core";

import { usePermissions } from "../auth/AuthProvider";
import { ErrorNoPermissionState } from "../state/ErrorStates";
import { Category } from "./Category";
import CategoryEditorComponent from "./CategoryEditor";
import CategoryList from "./CategoryList";
import { ActionType, initialState, reducer } from "./CategoryEditorReducer";
import { categoryCollection, categoryName } from "../../shared/const";
import { usePagination } from "../../shared/pagination";
import { firestore } from "../../index";

const useStyles = makeStyles(() => ({
    root: {
        minHeight: '60vh',
        paddingTop: 0,
        paddingBottom: 0,
        '& .MuiList-padding': {
            padding: 0
        }
    }
}));

type CategoryScreenProps = {
    isOpen: boolean,
    onDismiss: () => void,
}

const CategoryScreen = (props: CategoryScreenProps) => {
    const { t } = useTranslation();
    const [state, dispatch] = useReducer(reducer, initialState);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('xs'));
    const { canRead, canWrite } = usePermissions();
    const classes = useStyles();

    const { items, isLoading, isStart, isEnd, getPrev, getNext } = usePagination<Category>(
        firestore
            .collection(categoryCollection)
            .orderBy(categoryName, "asc"), { limit: 15 }   
    )

    const onEditorCreate = () => dispatch({ type: ActionType.CREATE })
    const onEditorDismiss = () => dispatch({ type: ActionType.DISMISS })
    const onEditorUpdate = (category: Category) => dispatch({ type: ActionType.UPDATE, payload: category })

    return (
        <>
            <Dialog
                fullScreen={isMobile}
                fullWidth={true}
                maxWidth="xs"
                open={props.isOpen}
                onClose={props.onDismiss}>
                <DialogTitle>{ t("navigation.categories") }</DialogTitle>
                <DialogContent dividers={true} className={classes.root}>
                    { canRead 
                        ? !isLoading
                            ? <CategoryList 
                                categories={items}
                                hasPrevious={isStart}
                                hasNext={isEnd}
                                onPrevious={getPrev}
                                onNext={getNext} 
                                onItemSelect={onEditorUpdate}/>
                            : <LinearProgress/>
                        :  <ErrorNoPermissionState/>
                    }
                </DialogContent>
                <DialogActions>
                    <Button color="primary" onClick={onEditorCreate} disabled={!canWrite}>{ t("button.add") }</Button>
                    <div style={{flex: '1 0 0'}}></div>
                    <Button color="primary" onClick={props.onDismiss}>{ t("button.close") }</Button>
                </DialogActions>
            </Dialog>
            {   state.isOpen &&
                <CategoryEditorComponent
                    isOpen={state.isOpen}
                    isCreate={state.isCreate}
                    category={state.category}
                    onDismiss={onEditorDismiss}/>
            }
        </>
    )
}
export default CategoryScreen;