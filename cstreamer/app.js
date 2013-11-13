
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var http = require('http');
var path = require('path');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(require('stylus').middleware(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/:id', routes.video);

var httpServer = http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

var webRtcIoServer = require('webrtc.io').listen(httpServer);

webRtcIoServer.rtc.on('chat_msg', function(data, socket) {
    var roomList = webRTC.rtc.rooms[data.room] || [];
    
    for (var i = 0; i < roomList.length; i++) {
        var socketId = roomList[i];
        
        if (socketId !== socket.id) {
            var soc = webRTC.rtc.getSocket(socketId);
            
            if (soc) {
                soc.send(JSON.stringify({
                    "eventName": "receive_chat_msg",
                    "data": {
                        "messages": data.messages,
                        "color": data.color
                    }
                }), function(error) {
                    if (error) {
                        console.log(error);
                    }
                });
            }
        }
    }
});

