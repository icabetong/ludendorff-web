import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import Button from "@material-ui/core/Button";
import Container from "@material-ui/core/Container";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import TextField from "@material-ui/core/TextField";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles(() => ({
    textField: {
        margin: '0.6em 0',
        width: '100%'
    }
}));

type CategoryEditorProps = {
    editorOpened: boolean,
    categoryId: string,
    categoryName: string,
    count: number,
    onSubmit: () => void,
    onCancel: () => void,
    onCategoryNameChanged: (name: string) => void,
}

const CategoryEditor = (props: CategoryEditorProps) => {
    const { t } = useTranslation();
    const classes = useStyles();
    const [nameError, setNameError] = useState(false);

    const onNameChanged = (event: React.ChangeEvent<HTMLInputElement>) => {
        const name = event.target.value;
        if (name !== '' && nameError)
            setNameError(false);

        props.onCategoryNameChanged(name);
    }

    const onPreSubmit = () => {
        if (props.categoryName === '') {
            setNameError(true);
            return;
        }

        props.onSubmit();
    }

    return (
        <Dialog
            fullWidth={true}
            maxWidth="xs"
            open={props.editorOpened}
            onClose={props.onCancel}>
            <DialogTitle>{ t("category_details") }</DialogTitle>
            <DialogContent>
                <Container disableGutters>
                    <TextField
                        autoFocus
                        id="editor-category-name"
                        type="text"
                        label={ t("field.category_name") }
                        value={props.categoryName}
                        error={nameError}
                        helperText={nameError ? t("feedback.empty_category_name") : undefined }
                        onChange={onNameChanged}
                        className={classes.textField}/>
                </Container>
            </DialogContent>
            <DialogActions>
                <Button color="primary" onClick={props.onCancel}>{ t("button.cancel") }</Button>
                <Button color="primary" onClick={onPreSubmit}>{ t("button.save") }</Button>
            </DialogActions>
        </Dialog>
    )
}

export default CategoryEditor;