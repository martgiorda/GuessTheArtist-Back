const MongoClient = require('mongodb').MongoClient;

// Connection url

const url = 'mongodb://localhost:27017';

// Database Name

const dbName = 'deezer';
// Connect using MongoClient

var _db;

const connectDB = async (callback) => {
    try {
        MongoClient.connect(url, (err, db) => {
            _db = db.db(dbName);
            return callback(err)
        })
    } catch (e) {
        throw e
    }
}

function getConnection () {

    return _db
}   

module.exports = {connectDB,getConnection};