/*
 * JS related to video playback
 */

function onYouTubePlayerReady(playerId) {
  ytplayer = document.getElementById("ytplayer");

  player = {
    updateInfo: function(){
                  $("#table-length").html(ytplayer.getDuration().toFixed(2));
                  $("#table-position").html(ytplayer.getCurrentTime().toFixed(2));
                  $("#table-volume").html(ytplayer.getVolume());
                  $("input#time").val(ytplayer.getCurrentTime()/ytplayer.getDuration()*100);
                  $("#table-myid").html(rtc._me);
                  $("#table-peers").html(getPeerIds().join(" ,"));

                  var status = ytplayer.getPlayerState();
                  if (status == 1){
                    $("#btn-play").css("glyphicon glyphicon-pause");
                  } else if (status == 2) {
                    $("#btn-play").css("glyphicon glyphicon-play");
                  } else {
                    $("#btn-play").css("glyphicon glyphicon-exclamation-sign");
                  }
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
      sendMessage({play: "play"});
      ytplayer.playVideo();
    },
    pause: function(){
      sendMessage({play: "pause"});
      ytplayer.pauseVideo();
    },
    toggle: function(){
      if (ytplayer.getPlayerState() == 1){
        sendMessage({play: "pause"});
        ytplayer.pauseVideo();
      } else {
        sendMessage({play: "play"});
        ytplayer.playVideo();
      }
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

  ytplayer.cueVideoById(getVideoId());

  $("#btn-play").click(function(){
    player.toggle();
  });

  $("input#time").change(function(){
    var percent = $("#time").val();
    var time = percent/100.0 * ytplayer.getDuration();
    
    sendMessage({time: time});
    player.jump(time);
  });

}

function onPlayerError(errorCode) {
  console.log("An error occured of type:" + errorCode);
}

function initWebRtc() {
    rtc.connect("ws:" + window.location.href.substring(window.location.protocol.length).split('#')[0], "videoroom-" + getVideoId());
    
    if(PeerConnection) {
        rtc.createStream({
            "video": {"mandatory": {}, "optional": []},
            "audio": false
        }, function(stream) {
        });
    } else {
        alert('no WebRTC support');
    }
    
    rtc.on('data stream data', function(channel, data) {
        console.log(data);
    
        var obj=eval("("+data+")");
        if(obj.time){
          player.jump(obj.time);
        } else if (obj.play) {
          if (obj.play === "play")
            player.play();
          else if (obj.play === "pause")
            player.pause();
        }
    });
}

function sendMessage(message) {
    for(var connection in rtc.dataChannels) {
        var channel = rtc.dataChannels[connection];
        channel.send(JSON.stringify(message));
    }
}

function getPeerIds() {
    return Object.keys(rtc.peerConnections);
}

function getVideoId() {
    return $("#video-id").val();
}

$(document).ready(function(){
    var params = { allowScriptAccess: "always" };
    var atts = { id: "ytplayer" };
    swfobject.embedSWF("http://www.youtube.com/apiplayer?" +
                     "version=3&enablejsapi=1&playerapiid=player1&wmode=opaque", 
                     "videoDiv", "100%", "100%", "9", null, null, params, atts);
    
    initWebRtc();
});