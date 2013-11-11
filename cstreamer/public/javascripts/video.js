/*
 * JS related to video playback
 */

function onYouTubePlayerReady(playerId) {
  ytplayer = document.getElementById("ytPlayer");

  var player = {
    updateInfo: function(){
                  $("#table-length").html(ytplayer.getDuration().toFixed(2));
                  $("#table-position").html(ytplayer.getCurrentTime().toFixed(2));
                  $("#table-volume").html(ytplayer.getVolume());
    },
    setVolume: function(volume){
                  if(!isNaN(volume)){
                    if (volume<0){
                      ytplayer.setVolume(0);
                    } else if (volume>100){
                      ytplayer.setVolume(100);
                    } else {
                      ytPlayer.setVolume(volume);
                    }
                  }
    },
    play: function(){
      ytplayer.playVideo();
    },
    pause: function(){
      ytplayer.pauseVideo();
    },
    mute: function(){
      ytplayer.muteVideo();
    },
    unMute: function(){
      ytplayer.unMuteVideo();
    },
    jump: function(time){
      ytplayer.seekTo(parseInt(time));
    }

  }

  setInterval(player.updateInfo, 250);

  ytplayer.addEventListener("onError", "onPlayerError");

  ytplayer.cueVideoById($("#video-id").val());

  $("#btn-play").click(player.play);
  $("#btn-pause").click(player.pause);
  $("#btn-jump").click(function(){player.jump($("#time").val())});

}

function onPlayerError(errorCode) {
  console.log("An error occured of type:" + errorCode);
}

$(document).ready(function(){
    var params = { allowScriptAccess: "always" };
    var atts = { id: "ytPlayer" };
    swfobject.embedSWF("http://www.youtube.com/apiplayer?" +
                     "version=3&enablejsapi=1&playerapiid=player1", 
                     "videoDiv", "480", "295", "9", null, null, params, atts);
});