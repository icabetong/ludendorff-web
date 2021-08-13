import { useState, useEffect } from "react";
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
    categoryId: string,
    categoryName: string
}

const CategoryEditorComponent = (props: CategoryEditorComponentPropsType) => {
    const { t } = useTranslation();
    const classes = useStyles();
    
    const [id, setId] = useState<string>(props.categoryId);
    const [name, setName] = useState<string>(props.categoryName);
    const isInUpdateMode = Boolean(props.categoryId && props.categoryName);
    
    useEffect(() => {
        setId(props.categoryId);
        setName(props.categoryName);
    }, [props.categoryId, props.categoryName]);

    const onNameChanged = (event: React.ChangeEvent<HTMLInputElement>) => {
        setName(event.target.value);
    }

    const onDismiss = () => {

        props.onCancel();
    }

    const onPreSubmit = () => {
        let category = new Category(id);
        category.categoryName = name;

        setId('');
        setName('');
        props.onSubmit(category, !isInUpdateMode);
    }

    return (
        <Dialog
            fullWidth={true}
            maxWidth="xs"
            open={props.editorOpened}
            onClose={() => onDismiss() }>
            <DialogTitle>{ t(isInUpdateMode ? "category_update" : "category_create") }</DialogTitle>
            <DialogContent dividers={true}>
                <Container disableGutters>
                    <TextField
                        autoFocus
                        id="editor-category-name"
                        type="text"
                        label={ t("category_name") }
                        value={name}
                        onChange={onNameChanged}
                        variant="outlined"
                        size="small"
                        className={classes.textField}/>
                </Container>
            </DialogContent>
            <DialogActions>
                <Button color="primary" onClick={() => onDismiss()}>{ t("cancel") }</Button>
                <Button color="primary" onClick={() => onPreSubmit()}>{ t("save") }</Button>
            </DialogActions>
        </Dialog>
    )
}

export default CategoryEditorComponent