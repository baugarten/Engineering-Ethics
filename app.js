
/**
 * Module dependencies.
 */

var express = require('express'),
  routes = require('./routes'),
  restful = require('node-restful'),
  api = require('./routes/api'),
  ObjectId = restful.mongoose.Schema.ObjectId;

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

function todayDate() {
  var ret = new Date();
  res.setHours(0);
  res.setMinutes(0);
  res.setMilliseconds(0);
  res.setSeconds(0);
  return ret;
}

function before(date1, date2) {
  return date1.getFullYear() < date2.getFullYear() ||
    date1.getMonth() < date2.getMonth() ||
    date1.getDate() < date2.getDate();
}

var Comment = restful.model('comments', restful.mongoose.Schema({
    methodology: { type: 'String', required: true },
    votes: { type: 'number', 'default': 0 },
    body: 'String',
    date: { type: 'Date', 'default': Date.now },
    comments: [ { type: ObjectId, ref: 'comments' } ]
}))
  .methods(['get'])
  .route('get', function(req, res, next) {
    Comment.findById(req.params.id).populate('comments').exec(function(err, comment) {
      res.json(comment || err);
    }); 
  });

var Category = restful.model('categories', restful.mongoose.Schema({
  name: { type: 'string', unique: true, required: true },
  items: [ { 
    name: 'string',
    definition: 'string'
  } ]
}))
  .methods(['get', 'post', 'put'])
  .route('item.post', function(req, res, next) {
    Category.findOneAndUpdate({ name: req.body.category },
      { $push: { items: req.body } }, function(err, category) {
      res.json(err || category);
    });
  });


var Post = restful.model('posts', restful.mongoose.Schema({
  url: { type: 'string', required: true },
  title: { type: 'string', required: true },
  description: { type: 'string', required: true },
  questions: [ { text: 'string' } ],
  published: { type: 'boolean', 'default': false },
  pub_date: { type: 'Date' },
  votes: { type: 'number', 'default': 0 },
  comments: [ { type: ObjectId, ref: 'comments' } ]
}))
  .methods(['get', 'post'])
  .route('current', function(req, res, next) {
    Post.find().populate('comments').populate('comments.comments').findOne({published: true}).sort('-pub_date').exec(function(err, post) {
      if (err) {
        res.json(err);
      } else {
        res.json(post || {});
      }
    });
  })
  .route('unpublished', function(req, res, next) {
    Post.find().populate('comments').populate('comments.comments').find({published: false}).limit(20).sort('-votes -pub_date').exec(function(err, posts) {
      console.log(posts);
      if (err) {
        res.json(err);
      } else {
        res.json(posts);
      }
    });
  })
  .route('vote.post', {
    detail: true,
    handler: function(req, res, next) {
      Post.find().populate('comments').populate('comments.comments').findByIdAndUpdate(req.params.id, {
        $inc: { votes: (req.body.up ? 1 : -1) }
      }, function(err, post) {
        res.json(err || post);
      });   
    }
  })
  .route('comment', {
    detail: true,
    handler: function(req, res, next) {
      console.log(req.body);
      var Model = Comment,
          id = req.body.parent._id;
      if (req.body.parent.url) {
        console.log("WE HAVE A POST HERE");
        Model = Post;
      }
      var comment = new Comment(req.body);
      comment.save(function(err, comment) {
        console.log(id);
        console.log(comment._id);
        Model.findByIdAndUpdate(id, {
          $push: { comments: comment._id}
        }).populate('comments').exec(function(err, comment) {
          console.log(err);
          console.log(comment);
          if (!req.body.parent.url) {
            console.log("Getting the post");
            Post.findById(req.params.id).populate('comments').populate('comments.comments').exec(function(err, post) {
              console.log(err);
              console.log(post);
              res.json(err || post);
            });
          } else {
            console.log("Already have the post");
            res.json(err || comment); // actually a post
          }
        });
      });
    }
  });

  Post.register(app, '/api/posts');
  Comment.register(app, '/api/comments');
  Category.register(app, '/api/categories');

// Routes

app.get('/', routes.index);
app.get('/partials/:name', routes.partials);

// JSON API

app.get('/api/name', api.name);

// redirect all others to the index (HTML5 history)
app.get('*', routes.index);

// Start server

app.listen(process.env.PORT || 3000, function(){
  console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
});
