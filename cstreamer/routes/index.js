
/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index', { title: 'Express' });
};

exports.video = function(req, res){
  res.render('video', {title: 'Title', video: req.params.id});
};