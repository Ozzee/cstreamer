/*
 * Change out the video that is playing
 */

// Update a particular HTML element with a new value
function updateHTML(elmId, value) {
  document.getElementById(elmId).innerHTML = value;
}
// This function is called when the player changes state
function onPlayerStateChange(newState) {
  //updateHTML("playerState", newState);
}
// Display information about the current state of the player
function updatePlayerInfo() {
  // Also check that at least one function exists since when IE unloads the
  // page, it will destroy the SWF before clearing the interval.
  if(ytplayer && ytplayer.getDuration) {
    updateHTML("table-length", ytplayer.getDuration());
    updateHTML("table-position", ytplayer.getCurrentTime());
    // updateHTML("bytesTotal", ytplayer.getVideoBytesTotal());
    // updateHTML("startBytes", ytplayer.getVideoStartBytes());
    // updateHTML("bytesLoaded", ytplayer.getVideoBytesLoaded());
    updateHTML("table-volume", ytplayer.getVolume());
  }
}
// Allow the user to set the volume from 0-100
function setVideoVolume() {
  var volume = parseInt(document.getElementById("volumeSetting").value);
  if(isNaN(volume) || volume < 0 || volume > 100) {
    alert("Please enter a valid volume between 0 and 100.");
  }
  else if(ytplayer){
    ytplayer.setVolume(volume);
  }
}

function playVideo() {
  if (ytplayer) {
    ytplayer.playVideo();
  }
}

function pauseVideo() {
  if (ytplayer) {
    ytplayer.pauseVideo();
  }
}

function muteVideo() {
  if(ytplayer) {
    ytplayer.mute();
  }
}

function unMuteVideo() {
  if(ytplayer) {
    ytplayer.unMute();
  }
}


// Jump to certain time
function jumpTo() {
  var timeBox = document.getElementById("time");
  var videoTime = timeBox.value;
  
  if(ytplayer) {
    ytplayer.seekTo(videoTime);
  }
}

// This function is called when an error is thrown by the player
function onPlayerError(errorCode) {
  console.log("An error occured of type:" + errorCode);
}

// This function is automatically called by the player once it loads
function onYouTubePlayerReady(playerId) {
  ytplayer = document.getElementById("ytPlayer");
  // This causes the updatePlayerInfo function to be called every 250ms to
  // get fresh data from the player
  setInterval(updatePlayerInfo, 250);
  updatePlayerInfo();
  ytplayer.addEventListener("onStateChange", "onPlayerStateChange");
  ytplayer.addEventListener("onError", "onPlayerError");
  //Load an initial video into the player
  var videoID = document.getElementById("video-id").value;
  ytplayer.cueVideoById(videoID);
}

// The "main method" of this sample. Called when someone clicks "Run".
function loadPlayer() {
  // The video to load
  var videoID = document.getElementById("video-id").value;
  // Lets Flash from another domain call JavaScript
  var params = { allowScriptAccess: "always" };
  // The element id of the Flash embed
  var atts = { id: "ytPlayer" };
  // All of the magic handled by SWFObject (http://code.google.com/p/swfobject/)
  swfobject.embedSWF("http://www.youtube.com/apiplayer?" +
                     "version=3&enablejsapi=1&playerapiid=player1", 
                     "videoDiv", "480", "295", "9", null, null, params, atts);
}
function _run() {
        loadPlayer();
}

google.setOnLoadCallback(_run);