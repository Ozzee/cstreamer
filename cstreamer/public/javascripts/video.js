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

        var status = ytplayer.getPlayerState();
        if (status == 1){
          $("#btn-play").css("glyphicon glyphicon-pause");
        } else if (status == 2) {
          $("#btn-play").css("glyphicon glyphicon-play");
        } else {
          $("#btn-play").css("glyphicon glyphicon-exclamation-sign");
        }
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
    toggle: function(){
        if (ytplayer.getPlayerState() == 1){
          sendMessage({play: "pause"});
          ytplayer.pauseVideo();
        } else {
          sendMessage({play: "play"});
          ytplayer.playVideo();
        }
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
    height: '720',
    width: '480',
    videoId: getVideoId(),
    playerVars: {
        controls: 0,
        modestbranding: 1,
        html5: 1
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
    
    var iframe = document.getElementById("iframe-placeholder");
    var doc = iframe.contentWindow.document;
    html5video = doc.getElementsByClassName("html5-main-video")[0];
    
    $("#btn-play").click(function(){
        sendMessage({play: "play"});
        player.toggle();
    });
    
    var canvaselement = document.getElementById('video-canvas'),
        canvas = canvaselement.getContext('2d'),
        interval;

    // Set canvas height and width to match the inner dimensions of the window -> full-screen
    document.getElementById("video-canvas").width = window.innerWidth-3;
    document.getElementById("video-canvas").height = window.innerHeight-3;
    
    var halfHeight = window.innerHeight/2;
    var halfWidth = window.innerWidth/2;

    function processFrame() {
        canvas.save() // Save context to easily switch back

        // Rotate 180deg
        canvas.translate(halfWidth*2, halfHeight);
        canvas.rotate(Math.PI);

        // Draw upside down screens
        canvas.drawImage(html5video, 0,         0,          halfWidth, halfHeight);
        canvas.drawImage(html5video, halfWidth, 0,          halfWidth, halfHeight);

        // Rotate back
        canvas.restore()

        // Draw right side up screens
        canvas.drawImage(html5video, 0,         halfHeight, halfWidth, halfHeight);
        canvas.drawImage(html5video, halfWidth, halfHeight, halfWidth, halfHeight);
    }

    html5video.addEventListener('play', function() {
        clearInterval(interval);
        interval = setInterval(processFrame, 40)
    }, false);  
    
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

    $("#hidden-toggle").click(function(){
      $("#hidden-wrapper").toggle();
    });
    $("#hidden-wrapper").toggle();

    $("#btn-duplicate").click(function(){
        $("#video-primary").css("-webkit-transform", "rotate(90deg)");
    });

    
        
});