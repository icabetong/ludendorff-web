import React, { useState, useEffect } from "react";
import Box from "@material-ui/core/Box";
import { HeaderBarComponent } from "../../components/HeaderBar";
import { User, UserRepository } from "./User";

export const UserComponent: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);

    useEffect(() => {
        UserRepository.fetch()
            .then((data) => {
                setUsers(data);
            })
    }, []);

    return (
        <Box>
            <HeaderBarComponent title="Users"/>
            { users.map((user: User) => { return <div key={user.userId}>{user.getDisplayName()}</div>}) }
        </Box>
    )
}