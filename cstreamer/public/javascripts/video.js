/*
 * JS related to video playback
 */

function onYouTubePlayerReady(playerId) {
  ytplayer = document.getElementById("ytplayer");

  var player = {
    updateInfo: function(){
                  $("#table-length").html(ytplayer.getDuration().toFixed(2));
                  $("#table-position").html(ytplayer.getCurrentTime().toFixed(2));
                  $("#table-volume").html(ytplayer.getVolume());
                  $("input#time").val(ytplayer.getCurrentTime()/ytplayer.getDuration()*100);
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
  $("input#time").change(function(){
    var percent = $("#time").val();
    player.jump(percent/100.0 * ytplayer.getDuration());
  });

}

function onPlayerError(errorCode) {
  console.log("An error occured of type:" + errorCode);
}

function initWebRtc() {
    rtc.connect("ws:" + window.location.href.substring(window.location.protocol.length).split('#')[0], "someRoom");
    
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
        alert(data);
    });
}

function sendMessage(message) {
    for(var connection in rtc.dataChannels) {
        var channel = rtc.dataChannels[connection];
        channel.send(message);
    }
}

$(document).ready(function(){
    var params = { allowScriptAccess: "always" };
    var atts = { id: "ytplayer" };
    swfobject.embedSWF("http://www.youtube.com/apiplayer?" +
                     "version=3&enablejsapi=1&playerapiid=player1&wmode=opaque", 
                     "videoDiv", "100%", "100%", "9", null, null, params, atts);
    
    initWebRtc();
});