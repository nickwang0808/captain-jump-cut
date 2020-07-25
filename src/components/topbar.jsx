import React from "react";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import IconButton from "@material-ui/core/IconButton";
import Typography from "@material-ui/core/Typography";
import { fade, makeStyles } from "@material-ui/core/styles";
import { Button, Box } from "@material-ui/core";
import UndoIcon from "@material-ui/icons/Undo";
import DeleteIcon from "@material-ui/icons/Delete";
import { grey } from "@material-ui/core/colors";

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  title: {
    flexGrow: 1,
    display: "none",
    [theme.breakpoints.up("xs")]: {
      display: "block",
    },
  },
  search: {
    position: "relative",
    borderRadius: theme.shape.borderRadius,
    backgroundColor: fade(theme.palette.common.white, 0.15),
    "&:hover": {
      backgroundColor: fade(theme.palette.common.white, 0.25),
    },
    marginLeft: 0,
    width: "100%",
    [theme.breakpoints.up("sm")]: {
      marginLeft: theme.spacing(1),
      width: "auto",
    },
  },
  searchIcon: {
    padding: theme.spacing(0, 2),
    height: "100%",
    position: "absolute",
    pointerEvents: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  inputRoot: {
    color: "inherit",
  },
  inputInput: {
    padding: theme.spacing(1, 1, 1, 0),
    // vertical padding + font size from searchIcon
    paddingLeft: `calc(1em + ${theme.spacing(4)}px)`,
    transition: theme.transitions.create("width"),
    width: "100%",
    [theme.breakpoints.up("sm")]: {
      width: "12ch",
      "&:focus": {
        width: "20ch",
      },
    },
  },
  buttonBox: {
    flexGrow: 1,
    display: "flex",
    flexDirection: "row-reverse",
  },
  exportButton: {
    marginRight: theme.spacing(2),
    marginLeft: theme.spacing(2),
  },
  IconButton: {},
}));

export default function TopBar({ clickUndo, clickDelete, selectedWord }) {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <AppBar position="static">
        <Toolbar variant="dense">
          <Typography className={classes.title} variant="h6" noWrap>
            Captain JumpCut
          </Typography>
          <Box className={classes.buttonBox}>
            <Button
              className={classes.exportButton}
              variant="contained"
              color="secondary"
            >
              Export
            </Button>
            <IconButton
              className={classes.IconButton}
              onClick={clickDelete}
              disabled={
                selectedWord.length === 0 || selectedWord[0].include === false
                  ? true
                  : false
              }
            >
              <DeleteIcon />
            </IconButton>
            <IconButton
              className={classes.IconButton}
              onClick={clickUndo}
              disabled={
                selectedWord.length === 0 || selectedWord[0].include === true
                  ? true
                  : false
              }
            >
              <UndoIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>
    </div>
  );
}
