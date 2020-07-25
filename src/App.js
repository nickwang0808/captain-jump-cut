import React, { useState, useEffect, useRef } from "react";
import Word from "./components/word";
import ReactPlayer from "react-player";
import { Grid, Box, CssBaseline, Typography } from "@material-ui/core";
import { Container } from "@material-ui/core";
import { Button } from "@material-ui/core";
import { Switch } from "@material-ui/core";
import TopBar from "./components/topbar";
import { makeStyles } from "@material-ui/core/styles";

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
      deleteWord();
    }
  };

  const deleteWord = () => {
    let dataClone = [...data];
    for (let i = 0; i < selectedWord.length; i++) {
      let index = data.indexOf(selectedWord[i]);
      dataClone[index].include = false;
      setData(dataClone);
      setSelectedWord([]);
    }
    handleSetTimeBlock();
  };

  const handleClickUndo = () => {
    console.log("clickedUndo");
    let dataClone = [...data];
    for (let i = 0; i < selectedWord.length; i++) {
      let index = data.indexOf(selectedWord[i]);
      dataClone[index].include = true;
      setData(dataClone);
      setSelectedWord([]);
    }
    handleSetTimeBlock();
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

  //  click on white space to cancel word selection
  // useEffect(() => {
  //   if (selectedWord.length !== 0 && mouseIsDown !== true) {
  //     document.addEventListener("mousedown", removeSelectedWord);
  //     document.addEventListener("mousedown", (e) => console.log(e.target));
  //   }
  // }, [mouseIsDown]);

  // const removeSelectedWord = () => {
  //   console.log("removeSelected word");
  //   setSelectedWord([]);
  // };

  return (
    <>
      <CssBaseline />
      <TopBar
        clickDelete={deleteWord}
        clickUndo={handleClickUndo}
        selectedWord={selectedWord}
      />
      <Container maxwidth="lg">
        <Box mt={4} overflow="hidden" height="85vh">
          <Grid container direction="row" spacing={4}>
            <Grid item md={6} xs={12}>
              <Box>
                <ReactPlayer
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
              </Box>
              <Box display="flex" alignItems="center">
                <Switch
                  variant="contained"
                  color="primary"
                  onChange={handlePreviewClicked}
                  checked={previewMode ? true : false}
                ></Switch>
                <Typography variant="body1">Preview Edits</Typography>
                {/* <Button variant="contained" color="primary">
              Render and Export
            </Button> */}
              </Box>
            </Grid>
            <Grid item md={6} xs={12}>
              <Grid container direction="row">
                {/* <Paper p={4} variant="outlined"> */}
                <Box
                  mt={-1}
                  display="flex"
                  flexWrap="wrap"
                  overflow="auto"
                  direction="row"
                  height="80vh"
                >
                  {data.map((w) => (
                    <Word
                      key={
                        w.alternatives[0].content +
                        w.start_time +
                        data.indexOf(w)
                      }
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
                </Box>
                {/* </Paper> */}
              </Grid>
            </Grid>
          </Grid>
        </Box>
      </Container>
    </>
  );
}

export default App;
