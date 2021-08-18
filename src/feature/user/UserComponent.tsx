import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import Box from "@material-ui/core/Box";
import MenuItem from "@material-ui/core/MenuItem";
import { makeStyles } from "@material-ui/core/styles";

import PlusIcon from "@heroicons/react/outline/PlusIcon";

import { User, UserRepository } from "./User";
import { ComponentHeader } from "../../components/ComponentHeader"

const useStyles = makeStyles((theme) => ({
    icon: {
        width: '1em',
        height: '1em',
        color: theme.palette.primary.contrastText
    },
}));

type UserComponentPropsType = {
    onDrawerToggle: () => void
}

const UserComponent = (props: UserComponentPropsType) => {
    const { t } = useTranslation();
    const classes = useStyles();
    
    const [users, setUsers] = useState<User[]>([]);

    useEffect(() => {
        UserRepository.fetch()
            .then((data) => {
                setUsers(data);
            })
    }, []);

    return (
        <Box>
            <ComponentHeader 
                title={ t("users") } 
                onDrawerToggle={props.onDrawerToggle}
                buttonText={ t("add") }
                buttonIcon={<PlusIcon className={classes.icon}/>}
                menuItems={[
                    <MenuItem key={0}>{ t("departments") }</MenuItem>
                ]}
            />
            { users.map((user: User) => { return <div key={user.userId}>{user.getDisplayName()}</div>}) }
        </Box>
    )
}

export default UserComponent