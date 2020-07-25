import React from "react";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  root: {
    ...theme.typography.h6,
    margin: "4px 0px",
    padding: "2px 3px",
    boxSizing: "border-box",
    border: "1px solid none",
    borderRadius: theme.shape.borderRadius,
    userSelect: "none",
  },
  clicked: {
    // backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.main,
  },
  deleted: {
    // backgroundColor: "white",
    color: "lightgrey",
    textDecoration: "line-through",
  },
  synced: {
    backgroundColor: theme.palette.secondary.main,
    color: "white",
    borderColor: "red",
  },
}));

function Word({
  value,
  st,
  et,
  playPoint,
  onClick,
  include,
  onKeyDown,
  contentType,
  onMouseDown,
  onMouseUp,
  onMouseEnter,
  wordData,
  selectedWord,
}) {
  const classes = useStyles();

  let className = classes.root;
  if (selectedWord.includes(wordData)) {
    className = `${classes.root} ${classes.clicked}`;
  } else if (include === false) {
    className = `${classes.root} ${classes.deleted}`;
  } else if (playPoint >= st && playPoint < et) {
    // TODO: add a delay if clicked
    className = `${classes.root} ${classes.synced}`;
  }

  const isPunct = contentType === "punctuation" ? true : false;

  if (!isPunct) {
    return (
      <>
        <div
          className={className}
          onClick={onClick}
          onKeyDown={onKeyDown}
          tabIndex={0}
          // type="button"
          onMouseDown={onMouseDown}
          onMouseUp={onMouseUp}
          onMouseEnter={onMouseEnter}
        >
          {value}
        </div>
      </>
    );
  } else {
    return (
      <div className="d-flex flex-column justify-content-center">
        <span>{value}</span>
      </div>
    );
  }
}

export default Word;
