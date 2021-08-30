import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import Button from "@material-ui/core/Button";
import Container from "@material-ui/core/Container";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import FormControl from "@material-ui/core/FormControl";
import FormLabel from "@material-ui/core/FormLabel";
import Grid from "@material-ui/core/Grid";
import ListItem from "@material-ui/core/ListItem";
import TextField from "@material-ui/core/TextField";
import Typography from "@material-ui/core/Typography";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import { makeStyles, useTheme } from "@material-ui/core/styles";
import { Timestamp } from "@firebase/firestore-types";

import { AssetCore } from "../asset/Asset";
import { UserCore } from "../user/User";

const useStyles = makeStyles(() => ({
    textField: {
        width: '100%',
        margin: '0.6em 0'
    },
}));

type AssignmentEditorProps = {
    isOpen: boolean,
    id?: string,
    asset?: AssetCore,
    user?: UserCore,
    dateAssigned?: Timestamp
    dateReturned?: Timestamp,
    location?: string,
    remarks?: string,
    onCancel: () => void,
    onSubmit: () => void,
    onAssetSelect: () => void,
    onUserSelect: () => void,
    onLocationChanged: (location: string) => void,
    onRemarksChanged: (remarks: string) => void
}

const AssignmentEditor = (props: AssignmentEditorProps) => {
    const { t } = useTranslation();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('xs'));
    const classes = useStyles();

    const [locationError, setLocationError] = useState(false);

    const onLocationChanged = (event: React.ChangeEvent<HTMLInputElement>) => {
        let location = event.target.value;
        if (location !== '' && locationError)
            setLocationError(false);
        
        props.onLocationChanged(location);
    }
    const onRemarksChanged = (event: React.ChangeEvent<HTMLInputElement>) => {
        let remarks = event.target.value;

        props.onRemarksChanged(remarks);
    }

    const onPreSubmit = () => {
        if (props.location === '') {
            setLocationError(true);
            return;
        }

        props.onSubmit();
    }

    return (
        <Dialog
            fullScreen={isMobile}
            fullWidth={true}
            maxWidth={isMobile ? "xs" : "md"}
            open={props.isOpen}
            onClose={props.onCancel}>
            <DialogTitle>{ t("assignment_details") }</DialogTitle>
            <DialogContent dividers={true}>
                <Container>
                    <Grid container direction={isMobile ? "column" : "row"} alignItems="stretch" justifyContent="center" spacing={isMobile ? 0 : 4}>
                        <Grid item xs={6}>
                            <FormControl component="fieldset" className={classes.textField}>
                                <FormLabel component="legend">
                                    <Typography variant="body2">{ t("field.asset") }</Typography>
                                </FormLabel>
                                <ListItem button onClick={props.onAssetSelect}>
                                    <Typography variant="body2">
                                        { props.asset?.assetName !== undefined ? props.asset?.assetName : t("not_set") }
                                    </Typography>
                                </ListItem>
                            </FormControl>

                            <FormControl component="fieldset" className={classes.textField}>
                                <FormLabel component="legend">
                                    <Typography variant="body2">{ t("field.user") }</Typography>
                                </FormLabel>
                                <ListItem button onClick={props.onUserSelect}>
                                    <Typography variant="body2">
                                        { props.user?.name !== undefined ? props.user?.name : t("not_set") }
                                    </Typography>
                                </ListItem>
                            </FormControl>
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                id="editor-location"
                                type="text"
                                label={t("field.location")}
                                value={props.location}
                                className={classes.textField}
                                onChange={onLocationChanged}/>

                            <TextField
                                multiline
                                rows={6}
                                id="editor-remarks"
                                type="text"
                                label={t("field.remarks")}
                                value={props.location}
                                className={classes.textField}
                                onChange={onRemarksChanged}/>
                        </Grid>
                    </Grid>
                </Container>
            </DialogContent>
            <DialogActions>
                <Button color="primary" onClick={props.onCancel}>{ t("cancel") }</Button>
                <Button color="primary" onClick={onPreSubmit}>{ t("save") }</Button>
            </DialogActions>
        </Dialog>
    );
}

export default AssignmentEditor;