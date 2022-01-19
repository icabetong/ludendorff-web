import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";

import { User } from "./User";

type UserListProps = {
  users: User[],
  onItemSelect: (user: User) => void,
}

const UserList = (props: UserListProps) => {
  return (
    <List>{
      props.users.map((user: User) => {
        return (
          <UserItem
            key={user.userId}
            user={user}
            onItemSelect={props.onItemSelect} />
        );
      })
    }</List>
  )
}

type UserItemProps = {
  user: User,
  onItemSelect: (user: User) => void
}

const UserItem = (props: UserItemProps) => {
  return (
    <ListItem
      button
      key={props.user.userId}
      onClick={() => props.onItemSelect(props.user)}>
      <ListItemText
        primary={`${props.user.firstName} ${props.user.lastName}`}
        secondary={props.user.email} />
    </ListItem>
  )
}

export default UserList;