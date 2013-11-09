
/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index', { title: 'Express' });
};

/*
 * GET video page: /<videoid>
 */
exports.video = function(req, res){
    console.log(req.ip)
    res.render('video', {title: 'Title', video: req.params.id});
};