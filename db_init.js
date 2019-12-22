const pg = require('pg');
const connectionString = process.env.DATABASE_URL || 'postgres://localhost:5432/todo';



let _db;

function initDB(callback) {
    if (_db) {
        console.warn("trying to init DB redundantly");
        return callback(null, _db);
    }

    // (mongo syntax)
	// client.connect(config.db.url, config.options, function (err, connected_client) {
    //     if (err) {
    //         return callback(err);
    //     }
    //     _db = connected_client.db('ecc');
    //     return callback(null, _db);
    // })
}

function getDB() {
    assert.ok(_db, "DB has not been initialized, call init first");
    return _db;
}

module.exports = {
    getDB,
    initDB
};