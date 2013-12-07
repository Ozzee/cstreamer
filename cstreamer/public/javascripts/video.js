/*
 * JS related to video playback
 */

function onYouTubePlayerReady(playerId) {
  var players = Array(document.getElementById("ytplayer"), document.getElementById("ytplayer2"));
  players[1].mute();

  function updateIcon(){
    $("#btn-play span").removeClass("glyphicon-play");
    $("#btn-play span").removeClass("glyphicon-pause");
    $("#btn-play span").removeClass("glyphicon-exclamation-sign");

    var status = players[0].getPlayerState();
    if (status == 1){
      $("#btn-play span").addClass("glyphicon-pause");
    } else if (status == 2) {
      $("#btn-play span").addClass("glyphicon-play");
    } else {
      $("#btn-play span").addClass("glyphicon-exclamation-sign");
    }
  }

  player = {
    updateInfo: function(){
                  $("#table-length").html(players[0].getDuration().toFixed(2));
                  $("#table-position").html(players[0].getCurrentTime().toFixed(2));
                  $("#table-volume").html(players[0].getVolume());
                  $("input#time").val(players[0].getCurrentTime()/players[0].getDuration()*100);
                  $("#table-myid").html(rtc._me);
                  $("#table-peers").html(getPeerIds().join(" ,"));
                  updateIcon();
    },
    play: function(){
      sendMessage({play: "play"});
      $(players).each(function(){this.playVideo()});
      updateIcon();
    },
    pause: function(){
      sendMessage({play: "pause"});
      $(players).each(function(){this.pauseVideo()});
      updateIcon();
    },
    toggle: function(){
      if (players[0].getPlayerState() == 1){
        $(players).each(function(){this.pauseVideo()});
        sendMessage({play: "pause"});
      } else {
        $(players).each(function(){this.playVideo()});
        sendMessage({play: "play"});
      }
    },
    jump: function(time){
      $(players).each(function(){this.seekTo(parseInt(time));});
    }

  }

  setInterval(player.updateInfo, 250);

  $(players).each(function(){this.addEventListener("onError", "onPlayerError");});

  $(players).each(function(){this.cueVideoById(getVideoId());});

  $("#btn-play").click(function(){
    player.toggle();
  });

  $("input#time").change(function(){
    var percent = $("#time").val();
    var time = percent/100.0 * ytplayer.getDuration();
    
    sendMessage({time: time});
    player.jump(time);
  });

  $("#video-clone").hide();
  $("#btn-duplicate").click(function(){
    $("#video-div").css("height", "50%");
    $("#video-clone").css("height", "50%");
    $("#video-clone").show();
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
                     "version=3&enablejsapi=1&playerapiid=player1&wmode=opaque&html5=1", 
                     "video-div", "100%", "100%", "9", null, null, params, atts);

    var atts2 = { id: "ytplayer2" };
    swfobject.embedSWF("http://www.youtube.com/apiplayer?" +
                     "version=3&enablejsapi=1&playerapiid=player2&wmode=opaque&html5=1", 
                     "video-div2", "100%", "100%", "9", null, null, params, atts2);
    
    initWebRtc();

    $("#hidden-toggle").click(function(){
      $("#hidden-wrapper").toggle();
    });
    $("#hidden-wrapper").toggle();



});