import React, { useState } from "react";

function word({
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
  let className = " p-1 btn btn-lg ";
  if ((playPoint >= st && playPoint < et) || selectedWord.includes(wordData)) {
    className += "btn-outline-primary";
  } else if (include === false) {
    className += "exclude";
  }

  const isPunct = contentType === "punctuation" ? true : false;

  if (!isPunct) {
    return (
      <div>
        <button
          className={className}
          onClick={onClick}
          onKeyDown={onKeyDown}
          type="button"
          onMouseDown={onMouseDown}
          onMouseUp={onMouseUp}
          onMouseEnter={onMouseEnter}
        >
          {value}
        </button>
      </div>
    );
  } else {
    return (
      <div className="d-flex flex-column justify-content-center">
        <span>{value}</span>
      </div>
    );
  }
}

export default word;
