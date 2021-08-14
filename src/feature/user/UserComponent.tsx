import { useState, useEffect } from "react";
import Box from "@material-ui/core/Box";
import { User, UserRepository } from "./User";
import { ComponentHeader } from "../../components/ComponentHeader"

type UserComponentPropsType = {
    onDrawerToggle: () => void
}

const UserComponent = (props: UserComponentPropsType) => {
    const [users, setUsers] = useState<User[]>([]);

    useEffect(() => {
        UserRepository.fetch()
            .then((data) => {
                setUsers(data);
            })
    }, []);

    return (
        <Box>
            <ComponentHeader title="Users" onDrawerToggle={props.onDrawerToggle}/>
            { users.map((user: User) => { return <div key={user.userId}>{user.getDisplayName()}</div>}) }
        </Box>
    )
}

export default UserComponent