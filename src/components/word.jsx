import React, { useState } from "react";

function word({ value, st, et, playPoint, onClick, include, onKeyDown }) {
  let className = null;
  if (playPoint >= st && playPoint < et) {
    className = "highlight";
  } else if (include === false) {
    className = "exclude";
  }

  return (
    <div>
      <button className={className} onClick={onClick} onKeyDown={onKeyDown}>
        {value}
      </button>
    </div>
  );
}

export default word;
