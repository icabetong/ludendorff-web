import { useContext } from "react"
import { Redirect } from "react-router"
import { Grid, Paper, Button } from '@material-ui/core'
import { makeStyles } from "@material-ui/styles"
import firebase from "firebase/app"

import { AuthContext } from "../auth/AuthProvider"
import './Core.scss';

const CoreComponent = () => {
    const user = useContext(AuthContext);

    const onSignOut = () => {
        firebase.auth().signOut()
    }

    const styles = makeStyles(theme => ({
        container: { padding: '1em' }, 
        stretch: { height: '100%', padding: '1em' },
        item: { display: 'flex', flexDirection: 'column' }
    }));
    const classes = styles();
    console.log(user);

    if (user == null) {
        return <Redirect to="/auth"/>
    } else {
        return (
            <Grid 
                className={classes.container}
                container 
                direction="row"
                spacing={3}
                alignItems="stretch"
                justifyContent="center"
                style={{minHeight: '100vh'}}>
                <Grid item xs={3} className={classes.item}>
                    <Paper className={classes.stretch}>
                        <Button onClick={onSignOut}>Signout</Button>
                    </Paper>
                </Grid>
                <Grid item xs={6} className={classes.item}>
                    <Paper className={classes.stretch}>xs</Paper>
                </Grid>
                <Grid item xs={3} className={classes.item}>
                    <Paper className={classes.stretch}>xs</Paper>
                </Grid>
            </Grid>
        )
    }
}
export default CoreComponent