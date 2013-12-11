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
  res.render('video', {title: 'Title', video: req.params.id});
};