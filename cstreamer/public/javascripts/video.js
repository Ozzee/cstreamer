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
        $("#table-peers").html(getPeers().map(function(peer) {
          return "[" + peer.readyState + " " + peer.id + "]";
        }).join(" ,"));

        var status = ytplayer.getPlayerState();
        if (status == 1){
          $("#btn-play span").removeClass();
          $("#btn-play span").addClass("glyphicon glyphicon-pause");
        } else {
          $("#btn-play span").removeClass();
          $("#btn-play span").addClass("glyphicon glyphicon-play");
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
          sendMessage({time: ytplayer.getCurrentTime(), play: "pause"});
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
        var percent = $("#time").val();
        var time = percent/100.0 * ytplayer.getDuration();
        
        sendMessage({time: time});
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
    height: '768',
    width: '1024',
    videoId: getVideoId(),
    playerVars: {
        controls: 0,
        modestbranding: 1,
        html5: 1,
    },
    events: {
      'onReady': onYouTubePlayerReady,
      'onError': onYouTubePlayerError,
      'onStateChange': onPlayerStateChange
    }
  });
}

function onPlayerStateChange(){
    ytplayer.setPlaybackQuality('hd720');
}

function onYouTubePlayerReady() {
    console.log('YouTube Player ready');
    setInterval(player.updateInfo, 250);
    ytplayer.cueVideoById(getVideoId());
    
    var iframe = document.getElementById("iframe-placeholder");
    var doc = iframe.contentWindow.document;
    html5video = doc.getElementsByClassName("html5-main-video")[0];
    
    $("#btn-play").click(function(){
        player.toggle();
    });
    
    var canvaselement = document.getElementById('video-canvas'),
        canvas = canvaselement.getContext('2d'),
        interval;
    var splitted = false;

    $("#btn-split").click(function(){
        splitted = !splitted;
    });

    var halfHeight, halfWidth;
    
    function updateCanvasDimensions() {
      // Set canvas height and width to match the inner dimensions of the window -> full-screen
      document.getElementById("video-canvas").width = window.innerWidth-3;
      document.getElementById("video-canvas").height = window.innerHeight-3;
      
      halfHeight = window.innerHeight/2;
      halfWidth = window.innerWidth/2;
    }

    updateCanvasDimensions();
    $(window).resize(function () { updateCanvasDimensions(); });
    function processFrame() {

        if (splitted) {
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
        
        } else {
            canvas.drawImage(html5video, 0,         0,          window.innerWidth, window.innerHeight);
        }
    }

    html5video.addEventListener('play', function() {
        clearInterval(interval);
        interval = setInterval(processFrame, 40)
    }, false);  
    
    $("input#time").change(function(){
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
          ytplayer.seekTo(parseInt(obj.time));
        }
        if (obj.play) {
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
        if(channel.readyState === "open") {
          channel.send(JSON.stringify(message));
        }
    }
}

function getPeers() {
    var peerConnections = rtc.peerConnections;
    var peers = [];
    for (var connectionId in peerConnections) {
        if (peerConnections.hasOwnProperty(connectionId)) {
            var dataChannel = rtc.dataChannels[connectionId];
            var readyState;
            if(dataChannel) {
              readyState = dataChannel.readyState;
            }
            peers.push({id: connectionId, readyState: readyState});
        }
    }
    return peers;
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

    $("#controls-wrapper").draggable();
        
});