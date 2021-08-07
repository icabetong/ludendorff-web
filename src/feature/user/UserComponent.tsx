import React, { useState, useEffect } from "react";
import { User, UserRepository } from "./User";

export const UserComponent = () => {
    const [users, setUsers] = useState<User[]>([]);

    useEffect(() => {
        UserRepository.fetch()
            .then((data) => {
                setUsers(data);
            })
    }, []);

    return (
        <div>
            { users.map((user: User) => { return <div key={user.userId}>{user.getDisplayName()}</div>}) }
        </div>
    )
}