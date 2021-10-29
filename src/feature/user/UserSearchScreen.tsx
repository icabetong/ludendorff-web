import {
    Container,
    Dialog,
    DialogContent,
    ListItem,
    ListItemText,
    makeStyles
} from "@material-ui/core";
import { InstantSearch, connectHits } from "react-instantsearch-dom";
import { HitsProvided } from "react-instantsearch-core";
import { SearchBox, Highlight, Provider, Results } from "../../components/Search";
import { User } from "./User";
import { lastName, firstName, email } from "../../shared/const";

const useStyles = makeStyles((theme) => ({
    container: {
        padding: theme.spacing(2),
        minHeight: '80vh'
    }
}))

type UserSearchScreenProps = {
    isOpen: boolean,
    onEditorInvoke: (user: User) => void,
    onDismiss: () => void,
}

const UserSearchScreen = (props: UserSearchScreenProps) => {
    const classes = useStyles();
    
    return (
        <Dialog 
            open={props.isOpen} 
            onClose={props.onDismiss}
            fullWidth={true}
            maxWidth="md">
            <DialogContent dividers={true}>
                <Container className={classes.container}>
                    <InstantSearch searchClient={Provider} indexName="users">
                        <SearchBox/>
                        <Results>
                            <UserHits onItemSelect={props.onEditorInvoke}/>
                        </Results>
                    </InstantSearch>
                </Container>
            </DialogContent>
        </Dialog>
    )
}

type UserListProps = HitsProvided<User> & {
    onItemSelect: (user: User) => void
}
const UserList = (props: UserListProps) => {
    return (
        <>
        {
            props.hits.map((u: User) => (
                <UserListItem user={u} onItemSelect={props.onItemSelect}/>
            ))
        }
        </>
    )
}
const UserHits = connectHits<UserListProps, User>(UserList);

type UserListItemProps = {
    user: User,
    onItemSelect: (user: User) => void
}
const UserListItem = (props: UserListItemProps) => {
    return (
        <ListItem
            button
            key={props.user.userId}
            onClick={() => props.onItemSelect(props.user)}>
            <ListItemText
                primary={
                    <>
                        <span><Highlight attribute={firstName} hit={props.user}/></span>&nbsp;
                        <span><Highlight attribute={lastName} hit={props.user}/></span>
                    </>
                }
                secondary={<Highlight attribute={email} hit={props.user}/>}/>
        </ListItem>
    )
}

export default UserSearchScreen;