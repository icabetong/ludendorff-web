import React, { FunctionComponent, ComponentClass, useState } from "react";
import { useTranslation } from "react-i18next";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Button from "@material-ui/core/Button";
import IconButton from "@material-ui/core/IconButton";
import Hidden from "@material-ui/core/Hidden";
import Menu from "@material-ui/core/Menu";
import Typography from "@material-ui/core/Typography";
import makeStyles from "@material-ui/core/styles/makeStyles";
import clsx from "clsx";

import DotsVerticalIcon from "@heroicons/react/outline/DotsVerticalIcon";
import MenuIcon from "@heroicons/react/outline/MenuIcon";

type ComponentHeaderPropsType = {
    title: string,
    onDrawerToggle: () => void,
    buttonText?: string,
    buttonIcon?: FunctionComponent<any> | ComponentClass<any, any>,
    buttonOnClick?: React.MouseEventHandler,
    menuItems?: JSX.Element[]
}

const useStyles = makeStyles((theme) => ({
    appBar: {
        zIndex: theme.zIndex.drawer + 1,
    },
    toolbar: theme.mixins.toolbar,
    navigationButton: {
        marginRight: theme.spacing(2),
        [theme.breakpoints.up('md')]: {
            display: 'none'
        },
    },
    icon: {
        width: '1em',
        height: '1em'
    },
    actionButton: {
        marginLeft: 'auto'
    },
    overflowButton: {
        marginLeft: theme.spacing(1)
    },
    title: {
        width: '100%',
    },
    toolbarButtonIcon: {
        color: theme.palette.text.primary
    },
    actionButtonIcon: {
        color: theme.palette.primary.contrastText
    }
}));

const ComponentHeader = (props: ComponentHeaderPropsType) => {
    const { t } = useTranslation();
    const classes = useStyles();

    const [anchor, setAnchor] = useState<null | HTMLElement>(null);
    const menuOpen = Boolean(anchor);
    const anchorProperties = {
        vertical: 'top',
        horizontal: 'right'
    } as const

    return (
        <AppBar position="static" className={classes.appBar} color="transparent" elevation={0}>
            <Toolbar>
                <IconButton
                    edge="start"
                    onClick={props.onDrawerToggle}
                    className={classes.navigationButton}
                    aria-label={ t("show_drawer") }>
                    <MenuIcon className={clsx(classes.toolbarButtonIcon, classes.icon)}/>
                </IconButton>
                <Hidden xsDown>
                    <Typography variant="h5" className={classes.title}>
                        {props.title}
                    </Typography>
                </Hidden>
                <Hidden smUp>
                    <Typography variant="h6">
                        {props.title}
                    </Typography>
                </Hidden>
                { props.buttonText &&
                    <Button 
                        variant="contained"
                        color="primary"
                        className={classes.actionButton}
                        startIcon={ props.buttonIcon &&
                            React.createElement(props.buttonIcon,
                                { className: clsx(classes.icon, classes.actionButtonIcon) })
                        }
                        onClick={props.buttonOnClick}
                        aria-label={props.buttonText}>
                        {props.buttonText}
                    </Button>
                }
                { props.menuItems &&
                    <div>
                        <IconButton
                            className={classes.overflowButton}
                            aria-haspopup="true"
                            aria-label={ t("show_menu") }
                            onClick={(e: React.MouseEvent<HTMLElement>) => setAnchor(e.currentTarget)}>
                            <DotsVerticalIcon className={clsx(classes.icon, classes.toolbarButtonIcon)}/>
                        </IconButton>
                        <Menu
                            keepMounted
                            anchorEl={anchor}
                            anchorOrigin={anchorProperties}
                            transformOrigin={anchorProperties}
                            open={menuOpen}
                            onClose={() => setAnchor(null)}
                            onMouseLeave={() => setAnchor(null)}>
                            {props.menuItems && 
                                props.menuItems.map((menuItem) => {
                                return menuItem
                                })
                            }
                        </Menu>
                    </div>
                }
            </Toolbar>
        </AppBar>
    )
}

export default ComponentHeader;