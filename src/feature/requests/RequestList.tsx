import { useTranslation } from "react-i18next";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction";
import ListItemText from "@material-ui/core/ListItemText";
import { makeStyles } from "@material-ui/core/styles";

import { MailOpenIcon, TrashIcon } from "@heroicons/react/outline";

import EmptyStateComponent from "../state/EmptyStates";
import PaginationController from "../../components/PaginationController";
import HeroIconButton from "../../components/HeroIconButton";

import { usePermissions } from "../auth/AuthProvider";
import { Request } from "./Request";

const useStyles = makeStyles((theme) => ({
    root: {
        minHeight: '60vh'
    },
}));

type RequestListProps = {
    requests: Request[],
    hasPrevious: boolean,
    hasNext: boolean,
    onPrevious: () => void,
    onNext: () => void,
    onItemSelect: (request: Request) => void,
    onItemRemove: (request: Request) => void
}

const RequestList = (props: RequestListProps) => {
    const classes = useStyles();
    const { t } = useTranslation();

    return (
        <>
            { props.requests.length > 0
            ? <>
                <List className={classes.root}>{
                    props.requests.map((request: Request) => {
                        return (
                            <RequestItem
                                key={request.requestId}
                                request={request}
                                onItemSelect={props.onItemSelect}
                                onItemRemove={props.onItemRemove}/>
                        );
                    })
                }</List>
                { !props.hasNext && !props.hasPrevious &&
                    <PaginationController
                        hasPrevious={props.hasPrevious}
                        hasNext={props.hasNext}
                        getPrevious={props.onPrevious}
                        getNext={props.onNext}/>
                }
                </>
            : <EmptyStateComponent
                icon={MailOpenIcon}
                title={t("empty.requests")}
                subtitle={t("empty.requests_summary")}/>
            }
        </>
    )
}

type RequestItemProps = {
    request: Request,
    onItemSelect: (request: Request) => void,
    onItemRemove: (request: Request) => void
}

const RequestItem = (props: RequestItemProps) => {
    const { t } = useTranslation();
    const { isAdmin } = usePermissions();

    return (
        <ListItem
            button
            key={props.request.requestId}
            onClick={() => props.onItemRemove(props.request)}>
            <ListItemText
                primary={props.request.asset?.assetName}
                secondary={props.request.petitioner?.name}/>
            { isAdmin &&
                <ListItemSecondaryAction>
                    <HeroIconButton
                        icon={TrashIcon}
                        edge="end"
                        aria-label={t("delete")}
                        onClick={() => props.onItemRemove(props.request)}
                    />
                </ListItemSecondaryAction>
            }
        </ListItem>
    )
}

export default RequestList;