import React from "react";
import { Box } from "@material-ui/core";
import { HeaderBarComponent } from "../../components/HeaderBar";

export const HomeComponent: React.FC = () => {
    return (
        <Box>
            <HeaderBarComponent title="Home"/>
        </Box>
    )
}