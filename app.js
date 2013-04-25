
/**
 * Module dependencies.
 */

var express = require('express'),
  routes = require('./routes'),
  restful = require('node-restful'),
  api = require('./routes/api');

var app = module.exports = express(),
    mongooseuri = process.env.MONGOLAB_URI || process.env.MONGOHQ_URL || 
                  'mongodb://localhost/etike';
restful.mongoose.connect(mongooseuri);

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.static(__dirname + '/public'));
  app.use(app.router);
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});



var Post = restful.model('posts', restful.mongoose.Schema({
  url: { type: 'string', required: true },
  description: { type: 'string', required: true },
  published: { type: 'boolean', 'default': false },
  pub_date: { type: 'Date' },
  votes: { type: 'number', 'default': 0 }
}))
  .methods(['get', 'post'])
  .route('current', function(req, res, next) {
    this.findOne({published: true}).sort('-pub_date').exec(function(err, post) {
      if (err) {
        res.json(err);
      } else {
        res.json(post);
      }
    });
  })
  .route('unpublished', function(req, res, next) {
    this.find({published: false}).limit(20).sort('-votes -pub_date').exec(function(err, posts) {
      if (err) {
        res.json(err);
      } else {
        res.json(posts);
      }
    });
  });

Post.register(app, '/api/posts');

// Routes

app.get('/', routes.index);
app.get('/partials/:name', routes.partials);

// JSON API

app.get('/api/name', api.name);

// redirect all others to the index (HTML5 history)
app.get('*', routes.index);

// Start server

app.listen(3000, function(){
  console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
});
