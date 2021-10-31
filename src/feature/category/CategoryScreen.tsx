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
    makeStyles,
} from "@material-ui/core";
import { InstantSearch, connectHits } from "react-instantsearch-dom";
import { HitsProvided } from "react-instantsearch-core";

import { Category } from "./Category";
import CategoryEditorComponent from "./CategoryEditor";
import { ActionType, initialState, reducer } from "./CategoryEditorReducer";
import CategoryList from "./CategoryList";
import { usePermissions } from "../auth/AuthProvider";
import { ErrorNoPermissionState } from "../state/ErrorStates";
import CustomDialogTitle from "../../components/CustomDialogTitle";
import { SearchBox, Highlight, Provider, Results } from "../../components/Search";
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
    },
    search: {
        minHeight: '60vh'
    },
    searchBox: {
        margin: '0.6em 1em'
    }
}));

type CategoryScreenProps = {
    isOpen: boolean,
    onDismiss: () => void,
}

const CategoryScreen = (props: CategoryScreenProps) => {
    const { t } = useTranslation();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('xs'));
    const [search, setSearch] = useState(false);
    const [state, dispatch] = useReducer(reducer, initialState);
    const { canRead, canWrite } = usePermissions();
    const classes = useStyles();

    const onSearchInvoked = () => setSearch(!search)

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
                <CustomDialogTitle onSearch={onSearchInvoked}>{ t("navigation.categories") }</CustomDialogTitle>
                <DialogContent dividers={true} className={classes.root}>
                    { search
                        ?   <InstantSearch searchClient={Provider} indexName="categories">
                                <Box className={classes.searchBox}>
                                    <SearchBox/>
                                </Box>
                                <Box className={classes.search}>
                                    <Results>
                                        <CategoryHits onItemSelect={onEditorUpdate}/>
                                    </Results>
                                </Box>
                            </InstantSearch>
                        : canRead 
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

type CategoryHitsListProps = HitsProvided<Category> & {
    onItemSelect: (category: Category) => void
}
const CategoryHitsList = (props: CategoryHitsListProps) => {
    return (
        <>
        { props.hits.map((c: Category) => (
            <CategoryListItem category={c} onItemSelect={props.onItemSelect}/>
        ))
        }
        </>
    )
}
const CategoryHits = connectHits<CategoryHitsListProps, Category>(CategoryHitsList);

type CategoryListItemProps = {
    category: Category,
    onItemSelect: (category: Category) => void
}
const CategoryListItem = (props: CategoryListItemProps) => {
    const { t } = useTranslation();

    return (
        <ListItem
            button
            key={props.category.categoryId}
            onClick={() => props.onItemSelect(props.category)}>
            <ListItemText
                primary={<Highlight attribute={categoryName} hit={props.category}/>}
                secondary={ t("template.count", { count: props.category.count }) }/>
        </ListItem>
    )
}