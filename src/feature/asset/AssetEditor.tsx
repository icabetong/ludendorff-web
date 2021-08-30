import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import Button from "@material-ui/core/Button";
import Container from "@material-ui/core/Container";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import FormControl from "@material-ui/core/FormControl";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import FormLabel from "@material-ui/core/FormLabel";
import Grid from "@material-ui/core/Grid";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import Radio from "@material-ui/core/Radio";
import RadioGroup from "@material-ui/core/RadioGroup";
import TextField from "@material-ui/core/TextField";
import Typography from "@material-ui/core/Typography";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import { makeStyles, useTheme } from "@material-ui/core/styles";

import PlusIcon from "@heroicons/react/outline/PlusIcon";

import SpecificationList from "../specs/SpecificationList";

import { Status } from "./Asset";
import { CategoryCore } from "../category/Category";
import { Specification } from "../specs/Specification";

const useStyles = makeStyles((theme) => ({
    textField: {
        width: '100%',
        margin: '0.6em 0',
        '& .MuiListItem-root': {
            borderRadius: theme.spacing(1)
        }
    },
    icon: {
        width: '1em',
        height: '1em',
        color: theme.palette.text.primary
    },
    gridItem: {
        maxWidth: '100%'
    }
}));

type AssetEditorProps = {
    isOpen: boolean,
    id?: string,
    name?: string,
    status?: Status,
    category?: CategoryCore,
    specs?: Specification,
    onCancel: () => void,
    onSubmit: () => void,
    onViewQrCode: () => void,
    onCategorySelect: () => void,
    onAddSpecification: () => void,
    onSelectSpecification: (specification: [string, string]) => void,
    onNameChanged: (name: string) => void,
    onStatusChanged: (status: Status) => void,
}

const AssetEditor = (props: AssetEditorProps) => {
    const { t } = useTranslation();
    const classes = useStyles();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('xs'));
    const [nameError, setNameError] = useState(false);

    const onNameChanged = (event: React.ChangeEvent<HTMLInputElement>) => {
        let name = event.target.value;
        if (name !== '' && nameError)
            setNameError(false);

        props.onNameChanged(name);
    }

    const onStatusChanged = (event: React.ChangeEvent<HTMLInputElement>) => {
        props.onStatusChanged(event.target.value as Status)
    }

    const onPreSubmit = () => {
        if (props.name === undefined) {
            setNameError(true);
            return;
        }

        props.onSubmit();
    }

    return (
        <Dialog
            fullScreen={isMobile}
            fullWidth={true}
            maxWidth={isMobile ? "xs" : "md" }
            open={props.isOpen}
            onClose={props.onCancel}>
            <DialogTitle>{ t("asset_details") }</DialogTitle>
            <DialogContent dividers={true}>
                <Container>
                    <Grid container direction={isMobile ? "column" : "row"} alignItems="stretch" justifyContent="center" spacing={isMobile ? 0 : 4}>
                        <Grid item xs={6} className={classes.gridItem}>
                            <TextField
                                autoFocus
                                id="editor-asset-name"
                                type="text"
                                label={ t("field.asset_name") }
                                value={props.name}
                                className={classes.textField}
                                error={nameError}
                                helperText={nameError ? t("feedback.empty_asset_name") : undefined}
                                onChange={onNameChanged}/>

                            <FormControl component="fieldset" className={classes.textField}>
                                <FormLabel component="legend">
                                    <Typography variant="body2">{ t("field.status") }</Typography>
                                </FormLabel>
                                <RadioGroup 
                                    aria-label={ t("field.status") } 
                                    name="editor-status" 
                                    value={props.status} 
                                    onChange={onStatusChanged}>
                                    <FormControlLabel control={<Radio/>} value={Status.OPERATIONAL} label={ t("status.operational") } />
                                    <FormControlLabel control={<Radio/>} value={Status.IDLE} label={ t("status.idle") }/>
                                    <FormControlLabel control={<Radio/>} value={Status.UNDER_MAINTENANCE} label={ t("status.under_maintenance") } />
                                    <FormControlLabel control={<Radio/>} value={Status.RETIRED} label={ t("status.retired") } />
                                </RadioGroup>
                            </FormControl>

                            <FormControl component="fieldset" className={classes.textField}>
                                <FormLabel component="legend">
                                    <Typography variant="body2">{ t("field.category") }</Typography>
                                </FormLabel>
                                <ListItem button onClick={props.onCategorySelect}>
                                    <Typography variant="body2">
                                        { props.category?.categoryName !== undefined ? props.category?.categoryName : t("not_set")  }
                                    </Typography>
                                </ListItem>
                            </FormControl>
                            
                        </Grid>
                        <Grid item xs={6} className={classes.gridItem}>
                            <FormLabel component="legend">
                                <Typography variant="body2">{ t("field.specification") }</Typography>
                            </FormLabel>
                            <List>
                                <SpecificationList 
                                    specifications={props.specs} 
                                    onItemSelected={props.onSelectSpecification}/>
                                <Button
                                    className={classes.textField}
                                    startIcon={<PlusIcon className={classes.icon}/>}
                                    onClick={props.onAddSpecification}>
                                        { t("add") }
                                </Button>
                            </List>
                        </Grid>
                    </Grid>
                </Container>
            </DialogContent>

            <DialogActions>
                <Button color="primary" onClick={props.onViewQrCode} disabled={props.id === undefined}>{ t("view_qr_code")}</Button>
                <div style={{flex: '1 0 0'}}></div>
                <Button color="primary" onClick={props.onCancel}>{ t("cancel") }</Button>
                <Button color="primary" onClick={onPreSubmit}>{ t("save") }</Button>
            </DialogActions>

        </Dialog>
    );
}

export default AssetEditor;