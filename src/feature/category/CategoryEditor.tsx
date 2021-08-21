import React from "react";
import { useTranslation } from "react-i18next";
import Button from "@material-ui/core/Button";
import Container from "@material-ui/core/Container";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import TextField from "@material-ui/core/TextField";
import { makeStyles } from "@material-ui/core/styles";

import { Category } from "./Category";

const useStyles = makeStyles(() => ({
    textField: {
        margin: '0.6em 0',
        width: '100%'
    }
}));

type CategoryEditorComponentPropsType = {
    editorOpened: boolean,
    onSubmit: (category: Category, isNew: boolean) => void,
    onCancel: () => void,
    category?: Category,
    onCategoryChanged: (category: Category) => void
}

const CategoryEditorComponent = (props: CategoryEditorComponentPropsType) => {
    const { t } = useTranslation();
    const classes = useStyles();
    const isUpdate = props.category !== undefined;

    const onPreSubmit = () => {
        let category = new Category(isUpdate ? props.category?.categoryId : undefined);
        category.categoryName = props.category?.categoryName;
        category.count = props.category?.count !== undefined ? props.category?.count : 0;

        props.onSubmit(category, !isUpdate);
    }

    const onNameChanged = (event: React.ChangeEvent<HTMLInputElement>) => {
        let category = props.category;
        if (category === undefined) 
            category = new Category();
        else category = new Category(props.category?.categoryId);

        category.categoryName = event.target.value;
        props.onCategoryChanged(category);
    }

    return (
        <Dialog
            fullWidth={true}
            maxWidth="xs"
            open={props.editorOpened}
            onClose={() => props.onCancel() }>
            <DialogTitle>{ t(isUpdate ? "category_update" : "category_create") }</DialogTitle>
            <DialogContent dividers={true}>
                <Container disableGutters>
                    <TextField
                        autoFocus
                        id="editor-category-name"
                        type="text"
                        label={ t("category_name") }
                        value={props.category?.categoryName}
                        onChange={onNameChanged}
                        variant="outlined"
                        size="small"
                        className={classes.textField}/>
                </Container>
            </DialogContent>
            <DialogActions>
                <Button color="primary" onClick={() => props.onCancel()}>{ t("cancel") }</Button>
                <Button color="primary" onClick={() => onPreSubmit()}>{ t("save") }</Button>
            </DialogActions>
        </Dialog>
    )
}

export default CategoryEditorComponent