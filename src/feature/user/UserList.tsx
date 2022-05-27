import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";

import { User } from "./User";

type UserListProps = {
  users: User[],
  onItemSelect: (user: User) => void,
}

const UserList = (props: UserListProps) => {
  return (
    <List>
    {
      props.users.map((user: User) => {
        return (
          <UserItem
            key={user.userId}
            user={user}
            onItemSelect={props.onItemSelect}/>
        );
      })
    }
    </List>
  )
}

type UserItemProps = {
  user: User,
  onItemSelect: (user: User) => void
}

const UserItem = (props: UserItemProps) => {
  const onHandleItemClick = () => props.onItemSelect(props.user);

  return (
    <ListItemButton
      key={props.user.userId}
      onClick={onHandleItemClick}>
      <ListItemText
        primary={`${props.user.firstName} ${props.user.lastName}`}
        secondary={props.user.email}/>
    </ListItemButton>
  )
}

export default UserList;