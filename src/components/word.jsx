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
  let className = " p-1 btn  ";
  if ((playPoint >= st && playPoint < et) || selectedWord.includes(wordData)) {
    className += "btn-outline-primary";
  } else if (include === false) {
    className += "exclude";
  }

  const disable = contentType === "punctuation" ? true : false;

  return (
    <div>
      <button
        className={className}
        onClick={onClick}
        onKeyDown={onKeyDown}
        type="button"
        disabled={disable}
        onMouseDown={onMouseDown}
        onMouseUp={onMouseUp}
        onMouseEnter={onMouseEnter}
      >
        {value}
      </button>
    </div>
  );
}

export default word;
