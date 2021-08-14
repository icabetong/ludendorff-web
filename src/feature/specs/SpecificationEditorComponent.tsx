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
    isOpen: boolean,
    onSubmit: (specification: [string, string], isUpdate: boolean) => void,
    onCancel: () => void,
    specificationKey: string,
    specificationValue: string
    onSpecificationKeyChanged: (key: string) => void,
    onSpecificationValueChanged: (value: string) => void,
}

const SpecificationEditorComponent = (props: SpecificationEditorComponentPropsType) => {
    const { t } = useTranslation();
    const classes = useStyles();
    
    const isInUpdateMode = Boolean(props.specificationKey && props.specificationValue);

    const onDismiss = () => {
        props.onCancel();
    }

    const onPreSubmit = () => {
        let specification: [string, string] = [props.specificationKey, props.specificationValue];
        props.onSubmit(specification, isInUpdateMode);
    }

    return (
        <Dialog
            fullWidth={true}
            maxWidth="xs"
            open={props.isOpen}
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
                        value={props.specificationKey}
                        variant="outlined"
                        size="small"
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => props.onSpecificationKeyChanged(e.target.value)}
                        className={classes.textField}/>
                    <TextField
                        id="editor-specification-value"
                        type="text"
                        label={ t("specification_value") }
                        value={props.specificationValue}
                        variant="outlined"
                        size="small"
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => props.onSpecificationValueChanged(e.target.value)}
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