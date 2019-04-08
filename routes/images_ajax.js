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

var foo = function (req, res, next) 
{
  const id = Number(req);
  const result = global.imageRanker.GetImageDataById(id);

  for (var i = 0; i < result.probabilityVector.length; ++i) 
  {
    const keywordIndex = result.probabilityVector[i].index;

    result.probabilityVector[i].keyword = global.imageRanker.GetKeywordByVectorIndex(keywordIndex);
  }

  return result;
}

exports.find = function(req, res) 
{
  var word = req.query.imageId;

  var imageData = foo(word);



  


  // Send response
  res.jsonp(imageData);
};