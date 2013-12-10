/*
 * JS related to video playback
 */

var ytplayer;
var player = {
    updateInfo: function() {
        $("#table-length").html(ytplayer.getDuration().toFixed(2));
        $("#table-position").html(ytplayer.getCurrentTime().toFixed(2));
        $("#table-volume").html(ytplayer.getVolume());
        if(ytplayer.getCurrentTime() > 0 && ytplayer.getDuration() > 0) {
          $("input#time").val(ytplayer.getCurrentTime()/ytplayer.getDuration()*100);
        } else {
          $("input#time").val(0);
        }
        $("#table-myid").html(rtc._me);
        $("#table-peers").html(getPeerIds().join(" ,"));
    },
    setVolume: function(volume) {
        if(!isNaN(volume)){
            if (volume < 0){
                ytplayer.setVolume(0);
            } else if (volume > 100){
                ytplayer.setVolume(100);
            } else {
                ytPlayer.setVolume(volume);
            }
        }
    },
    play: function() {
        ytplayer.playVideo();
    },
    pause: function() {
        ytplayer.pauseVideo();
    },
    mute: function() {
        ytplayer.muteVideo();
    },
    unMute: function() {
        ytplayer.unMuteVideo();
    },
    jump: function(time) {
        ytplayer.seekTo(parseInt(time));
    }
};

function getVideoId() {
    return $("#video-id").val();
}

function loadYouTubeIframeAPI() {
    var tag = document.createElement('script');
    tag.src = "https://www.youtube.com/iframe_api";
    var firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
}

function onYouTubeIframeAPIReady() {
  console.log('YouTube Iframe API loaded');
  ytplayer = new YT.Player('iframe-placeholder', {
    height: '99%',
    width: '100%',
    videoId: getVideoId(),
    playerVars: {
        controls: 0,
        modestbranding: 1
    },
    events: {
      'onReady': onYouTubePlayerReady,
      'onError': onYouTubePlayerError,
      //'onStateChange': onPlayerStateChange
    }
  });
}

function onYouTubePlayerReady() {
    console.log('YouTube Player ready');
    setInterval(player.updateInfo, 250);
    ytplayer.cueVideoById(getVideoId());
    
    
    $("#btn-play").click(function(){
        sendMessage({play: "play"});
        player.play();
    });
    
    $("#btn-pause").click(function(){
        sendMessage({play: "pause"});
        player.pause();
    });
    
    $("input#time").change(function(){
        var percent = $("#time").val();
        var time = percent/100.0 * ytplayer.getDuration();
        
        sendMessage({time: time});
        player.jump(time);
    });
}

function onYouTubePlayerError(errorCode) {
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

$(document).ready(function(){
    loadYouTubeIframeAPI();
    initWebRtc();
});