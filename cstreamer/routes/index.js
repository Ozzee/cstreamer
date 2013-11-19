var cache = require('../modules/cache')();

/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index', { title: 'Synchronized Video using WebRTC' });
};

/*
 * GET video page: /<videoid>
 */
exports.video = function(req, res){

    var clients = cache.get(req.params.id);
    if (clients=== undefined){
        clients = []
        console.log("No clients")
    }

    if (clients.indexOf(req.ip)<0)
        clients.push(req.ip)

    cache.set(req.params.id, clients)
    res.render('video', {title: 'Title', video: req.params.id, clients: clients});
};

exports.videoClients = function(req, res) {

    var clients = cache.get(req.params.id);
    if (clients=== undefined){
        clients = []
    }
    
    res.json({clients: clients});
}