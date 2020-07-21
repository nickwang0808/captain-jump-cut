import React, { useState, useEffect, useRef } from "react";
import Word from "./components/word";
import ReactPlayer from "react-player";

function App() {
  const player = useRef(null);
  const [playPoint, setPlayPoint] = useState(0);
  const [data, setData] = useState([]);
  const [playing, setPlaying] = useState(false);
  const [timeBlock, setTimeBlock] = useState([]);
  const [index, setIndex] = useState(0);
  const [previewMode, setPreviewMode] = useState(true);
  const [mouseIsDown, setMouseIsDown] = useState(false);
  const [selectedWord, setSelectedWord] = useState([]);
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

  const handleProgress = (progress) => {
    // console.log(progress.playedSeconds);
    setPlayPoint(progress.playedSeconds);
  };

  const handleClick = (w) => {
    player.current.seekTo(w.start_time);
    setPlayPoint(w.start_time);
  };

  const handleMouseDown = (e, w) => {
    setMouseIsDown(true);
    // add the clicked word to array, and check if word is in, if is then remove it.
    let selectedWordCopy = [...selectedWord];
    if (selectedWord.length !== 0) {
      setSelectedWord([]);
    } else if (!selectedWord.includes(w)) {
      selectedWordCopy.push(w);
      setSelectedWord(selectedWordCopy);
    } else {
      selectedWordCopy.splice(selectedWordCopy.indexOf(w), 1);
      setSelectedWord(selectedWordCopy);
    }
  };

  const handleMouseUp = (w) => {
    setMouseIsDown(false);
    handleClick(w);
  };

  const handleMouseEnter = (e, w) => {
    if (mouseIsDown) {
      let selectedWordCopy = [...selectedWord];
      if (selectedWord.includes(w)) {
        return;
      } else {
        selectedWordCopy.push(w);
        setSelectedWord(selectedWordCopy);
        console.log(selectedWord);
      }
    }
  };

  // change include to false when Del is pressed
  const handleKeyDown = (e, w) => {
    if (e.keyCode === 8) {
      let dataClone = [...data];
      for (let i = 0; i < selectedWord.length; i++) {
        let index = data.indexOf(selectedWord[i]);
        dataClone[index].include = false;
        setData(dataClone);
        setSelectedWord([]);
      }
      handleSetTimeBlock();
    }
  };

  const handlePreviewClicked = () => {
    if (!previewMode) {
      setPreviewMode(true);
      playPreview();
    } else {
      setPreviewMode(false);
    }
  };

  //watch playPoint and timeBlock match
  useEffect(() => {
    if (previewMode) {
      playPreview();
    }
  }, [playPoint]);

  const playPreview = () => {
    if (timeBlock.length > 0) {
      // console.log("playPreview", timeBlock);
      for (let i = 1; i < timeBlock.length; i++) {
        if (playPoint >= timeBlock[i - 1][0] && playPoint < timeBlock[i][0]) {
          setIndex(i - 1);
          // console.log("index is ", i, index);
          if (
            // this block check if playPoint is in the exclude zone.
            playPoint > timeBlock[index][1] - 0.1 && // the 0.1 is the tolerance of the word, change it to have more or less of the word
            playPoint < timeBlock[index + 1][0] // index 0 is start_time
          ) {
            // console.log("playpoint matched");
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
            // tweak this value to get rid of the sound of a removed word
            // word.end_time = parseFloat(word.end_time) - 0.2;
            return word;
          })
        )
      );
  }, []);

  // useEffect(() => {
  //   if (mouseIsDown) {
  //     document.addEventListener("onmouseenter", console.log("e"));
  //   }
  // }, [mouseIsDown]);

  useEffect(() => {
    console.log("Selected word", selectedWord);
  }, [selectedWord]);

  return (
    <div className="container">
      <div className="mt-4 d-flex flex-row ">
        <div className="d-flex flex-column mr-4 vid-box w-50 shadow">
          <ReactPlayer
            // fuck css, can't get his stupid fucking box to fit
            // className="d-flex flex-column justify-content-start"
            ref={player}
            url={url}
            controls={true}
            progressInterval={10}
            onProgress={handleProgress}
            playing={playing}
            height="100%"
            width="100%"
          />
          <div className="d-flex flex-row align-items-center m-2 ">
            <button
              className="m-2 btn btn-outline-primary"
              onClick={handlePreviewClicked}
            >
              Preview Mode
            </button>
            <span>{previewMode ? "On" : "Off"}</span>
            <button className="m-2 btn btn-outline-primary">
              Render and Export
            </button>
          </div>
        </div>
        <div className="ml-2 p-2 word-box w-50 shadow">
          {data.map((w) => (
            <Word
              key={w.alternatives[0].content + w.start_time + data.indexOf(w)}
              value={w.alternatives[0].content}
              st={w.start_time}
              et={w.end_time}
              contentType={w.type}
              include={w.include}
              playPoint={playPoint}
              // onClick={() => handleClick(w)}
              onKeyDown={(e) => handleKeyDown(e, w)}
              onMouseUp={() => handleMouseUp(w)}
              onMouseDown={(e) => handleMouseDown(e, w)}
              onMouseEnter={(e) => handleMouseEnter(e, w)}
              wordData={w}
              selectedWord={selectedWord}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;
