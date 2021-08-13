import { useState } from "react";
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

type SpecificationEditorComponentPropsType = {
    editorOpened: boolean,
    onSubmit: (specification: [string, string], isUpdate: boolean) => void,
    onCancel: () => void,
    specificationKey: string,
    specificationValue: string,
}

const SpecificationEditorComponent = (props: SpecificationEditorComponentPropsType) => {
    const { t } = useTranslation();
    const classes = useStyles();
    
    const [key, setKey] = useState<string>(props.specificationKey);
    const [value, setValue] = useState<string>(props.specificationValue);
    const isInUpdateMode = Boolean(props.specificationKey && props.specificationValue);

    const onKeyChanged = (event: React.ChangeEvent<HTMLInputElement>) => {
        setKey(event.target.value);
    }
    const onValueChanged = (event: React.ChangeEvent<HTMLInputElement>) => {
        setValue(event.target.value);
    }

    const onDismiss = () => {
        setKey('');
        setValue('');
        props.onCancel();
    }

    const onPreSubmit = () => {
        let specification: [string, string] = [key, value];
        setKey('');
        setValue('');
        props.onSubmit(specification, isInUpdateMode);
    }

    return (
        <Dialog
            fullWidth={true}
            maxWidth="xs"
            open={props.editorOpened}
            onClose={() => onDismiss()}>
            <DialogTitle>
                { t(isInUpdateMode 
                    ? "specification_update" 
                    : "specification_create") 
                }
            </DialogTitle>
            <DialogContent dividers={true}>
                <Container disableGutters>
                    <TextField
                        autoFocus
                        id="editor-specification-key"
                        type="text"
                        label={ t("specification_key") }
                        value={key}
                        variant="outlined"
                        size="small"
                        onChange={onKeyChanged}
                        className={classes.textField}/>
                    <TextField
                        id="editor-specification-value"
                        type="text"
                        label={ t("specification_value") }
                        value={value}
                        variant="outlined"
                        size="small"
                        onChange={onValueChanged}
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

export default SpecificationEditorComponent