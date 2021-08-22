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
import { newId } from "../../shared/utils";

const useStyles = makeStyles(() => ({
    textField: {
        margin: '0.6em 0',
        width: '100%'
    }
}));

type CategoryEditorComponentPropsType = {
    editorOpened: boolean,
    categoryId: string,
    categoryName: string,
    count: number,
    onSubmit: () => void,
    onCancel: () => void,
    onCategoryNameChanged: (name: string) => void,
}

const CategoryEditorComponent = (props: CategoryEditorComponentPropsType) => {
    const { t } = useTranslation();
    const classes = useStyles();

    return (
        <Dialog
            fullWidth={true}
            maxWidth="xs"
            open={props.editorOpened}
            onClose={() => props.onCancel() }>
            <DialogTitle>{ t("category_details") }</DialogTitle>
            <DialogContent dividers={true}>
                <Container disableGutters>
                    <TextField
                        autoFocus
                        id="editor-category-name"
                        type="text"
                        label={ t("category_name") }
                        value={props.categoryName}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            props.onCategoryNameChanged(e.target.value)
                        }}
                        className={classes.textField}/>
                </Container>
            </DialogContent>
            <DialogActions>
                <Button color="primary" onClick={() => props.onCancel()}>{ t("cancel") }</Button>
                <Button color="primary" onClick={() => props.onSubmit()}>{ t("save") }</Button>
            </DialogActions>
        </Dialog>
    )
}

export default CategoryEditorComponent