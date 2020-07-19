import React, { useState, useEffect, useRef } from "react";
import "./App.css";
import Word from "./components/word";
import ReactPlayer from "react-player";

function App() {
  const player = useRef(null);
  const [playPoint, setPlayPoint] = useState(0);
  const [data, setData] = useState([]);
  const [playing, setPlaying] = useState(false);
  const [timeBlock, setTimeBlock] = useState([]);
  const [index, setIndex] = useState(0);
  const [previewMode, setPreviewMode] = useState(false);
  const [url, setUrl] = useState(
    "https://inputvid.s3.us-east-2.amazonaws.com/1mintedtalk.mp4"
  );

  const handleSetTimeBlock = () => {
    let includeWord = data.filter((w) => w.type !== "punctuation");
    includeWord.forEach((w, i) => (w.index = parseInt(i)));
    includeWord = includeWord.filter((w) => w.include === true);

    let timeBlockLocal = [];
    let block = [includeWord[0].start_time];
    try {
      for (let i = 0; i < includeWord.length - 1; i++) {
        if (includeWord[i].index + 1 !== includeWord[i + 1].index) {
          block.push(includeWord[i].end_time);
          timeBlockLocal.push(block);
          block = [includeWord[i + 1].start_time];
        } else if (includeWord[i].index + 1 === includeWord[i + 1].index) {
          continue;
        }
      }
    } finally {
      block.push(includeWord[includeWord.length - 1].end_time);
      timeBlockLocal.push(block);
    }
    setTimeBlock(timeBlockLocal);
    console.log("timeBlockLocal set");
  };

  // need to make a async to wait for the video to play to the point

  const handleClick = (w) => {
    player.current.seekTo(w.start_time);
    setPlayPoint(w.start_time);
  };

  const handleProgress = (progress) => {
    // console.log(progress.playedSeconds);
    setPlayPoint(progress.playedSeconds);
  };

  // change include to false when Del is pressed
  const handleKeyDown = (e, w) => {
    if (e.keyCode === 8) {
      const index = data.indexOf(w);
      const dataClone = data.slice();
      dataClone[index].include = false;
      setData(dataClone);
      handleSetTimeBlock();
    }
  };

  const handlePause = () => {
    setPlaying(false);
  };

  const handlePreviewClicked = () => {
    if (!previewMode) {
      setPreviewMode(true);
      playPreview();
    } else {
      setPreviewMode(false);
    }
  };

  const playPreview = () => {
    if (timeBlock.length > 0) {
      console.log("playPreview", timeBlock);
      for (let i = 1; i < timeBlock.length; i++) {
        if (playPoint >= timeBlock[i - 1][0] && playPoint < timeBlock[i][0]) {
          setIndex(i - 1);
          console.log("index is ", i, index);
          if (
            // this block check if playPoint is in the exclude zone.
            playPoint > timeBlock[index][1] - 0.1 && // the 0.1 is the tolerance of the word, change it to have more or less of the word
            playPoint < timeBlock[index + 1][0] // index 0 is start_time
          ) {
            console.log("playpoint matched");
            player.current.seekTo(timeBlock[index + 1][0]);
          }
        } else continue;
      }
    }
  };

  // fetch json file
  useEffect(() => {
    // put the json file to data state
    fetch(
      "https://transcriptionfornick.s3.us-east-2.amazonaws.com/asrOutput.json"
    )
      .then((response) => response.json())
      .then((json) =>
        setData(
          json.results.items.map((word) => {
            word.include = true;
            return word;
          })
        )
      );
  }, []);

  //watch playPoint and timeBlock match
  useEffect(() => {
    if (previewMode) {
      console.log(playPoint);
      playPreview();
    }
  }, [playPoint]);

  return (
    <div className="flex-h">
      <div className="column">
        {data.map((w) => (
          <Word
            key={w.alternatives[0].content + w.start_time + data.indexOf(w)}
            value={w.alternatives[0].content}
            st={w.start_time}
            et={w.end_time}
            include={w.include}
            playPoint={playPoint}
            onClick={() => handleClick(w)}
            onKeyDown={(e) => handleKeyDown(e, w)}
          />
        ))}
      </div>
      <div className="column">
        <ReactPlayer
          ref={player}
          url={url}
          controls={true}
          progressInterval={10}
          onProgress={handleProgress}
          playing={playing}
        />
        <button onClick={handlePreviewClicked}>Preview</button>
        <span>{previewMode ? "True" : "False"}</span>
        <button onClick={handlePause}>Pause</button>
      </div>
    </div>
  );
}

export default App;
