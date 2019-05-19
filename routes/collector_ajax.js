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

var foo = function (req, res, next) {
  return global.imageRanker.GetNearKeywords(req);
}

exports.find = function(req, res) 
{
  var word = req.query.queryValue;

  var itemss = foo(word);

  // Send response
  res.jsonp(itemss);
};

