// var mongo = require('mongodb');

// var Server = mongo.Server,
//         Db = mongo.Db,
//         BSON = mongo.BSONPure;

// var server = new Server('localhost', 27017, {auto_reconnect: true});
// db = new Db('redsocial', server);

// db.open(function(err, db) {
//     if (!err) {
//         console.log("Connected to 'mydb' database");
//         db.collection('publication', {strict: true}, function(err, collection) {
//             if (err) {
//                 console.log("error");
//             }
//         });
//     }
// });
const util = require('util')

function test() 
{
  return "fuuuu";
}


var foo = function (req, res, next) {
  return global.imageRanker.GetNearKeywords(req);
}

var bar = function (req, res, next) {
  return foo();
}

exports.find = function(req, res) 
{
  // var b=req.params.search;
  // db.collection('publication', function(err, collection) {
  //     collection.find({type:'pub',content: new RegExp(b,'i')}).limit(5).toArray(function(err, items) {
  //         res.jsonp(items);
  //     });
  // });

  var word = req.query.term;
  //console.log(global.imageRanker);

  //console.log(util.inspect(req, {showHidden: false, depth: null}))
  //console.log("word = " + req.params);

  //if (!!word){
    var itemss = foo(word);
  //}


  //console.log("ITEMS" + itemss);

  // for (var i = 0; i < arrayIds.length; ++i) 
  // {
  //     console.log("wordnetId = " + arrayIds[i][0]);
  //     console.log("word = " + arrayIds[i][1]);
  //     console.log("description = " + arrayIds[i][2]);
  // }

  var items ="aaa";

  // Send response
  res.jsonp(itemss);
};