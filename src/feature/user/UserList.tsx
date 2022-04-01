import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";

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
            key={ user.userId }
            user={ user }
            onItemSelect={ props.onItemSelect }/>
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
      key={ props.user.userId }
      onClick={ () => props.onItemSelect(props.user) }>
      <ListItemText
        primary={ `${ props.user.firstName } ${ props.user.lastName }` }
        secondary={ props.user.email }/>
    </ListItem>
  )
}

export default UserList;