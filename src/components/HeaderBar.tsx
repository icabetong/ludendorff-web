import Box from "@material-ui/core/Box";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/core/styles"; 

type HeaderBarPropsType = {
    title: string
}

export const HeaderBarComponent = (props: HeaderBarPropsType) => {
    const useStyles = makeStyles((theme) => ({
        container: {
            padding: '1em'
        }
    }))
    const classes = useStyles();

    return (
        <Box className={classes.container}>
            <Typography variant="h5">{props.title}</Typography>
        </Box>
    );
}