// server.js
// where your node app starts

// init project
const fs = require("fs");
const env = require(fs.existsSync("env.json") ? "./env.json" : "./default_env.json");

const express = require('express');
// const session = require('express-session');
const app = express();
const router = express.Router();
const pg = require('pg');
const path = require('path');

console.log('config === ', config);

const connectionString = process.env.DATABASE_URL || 'postgres://localhost:5432/threebase';
const client = new pg.Client(connectionString);
client.connect();

const WebSocket = require('ws');
const wss = new WebSocket.Server({
    port: 8080
});

// npm install these:
// const MemoryStore = require('memorystore')(session);
// const cookie = require('cookie')
// const cookieParser = require('cookie-parser')

const DB = require('./db_init.js');







// MIDDLEWARE
const STORE = new MemoryStore({
	checkPeriod: 1000 * 60 * 60 * 24 * 2// prune expired entries every 24h
})

// cached sessions
const lru_session = session({
	cookie: { maxAge: 1000 * 60 * 60 * 24 * 2 },
	resave: false,
	saveUninitialized: true,
	store: STORE,
	secret: env.SECRET
})

app.use(express.static('public'));
// app.use( bodyParser.json({ 
// 	type: 'application/json' 
// }))
// app.use( [[ validateSession ]] )  // add session info to request object
// app.use( [[ memoryStore ]] ) // choose memory store for requests




















// HTTP ROUTING
app.get('/', function (request, response) {

    const html = fs.readFileSync(path.join(__dirname,"index.html"),"utf8").split("PORT_GOES_HERE").join(env.port);

    response.send(html);
});

app.get('/update', function (request, response) {

});

app.get('/read', function (request, response) {
    const table = request.body.table;
    const readableTables = ["items","quests","npcs","monsters","locations"];
    if(readableTables.includes(table)) {
        const results = [];
        const query = client.query(`SELECT * FROM ${table} WHERE id = '$1' ORDER BY id ASC`, [request.body.id]);
        query.on('row', (row) => {
            results.push(row);
        });
        query.on('end', () => {
            response.json(results);
        });
    }
});

app.get('/create_new_user', function (request, response) {
    client.query('INSERT INTO users(type, subtype, json) values($1, $2)', ["player", "email_auth", {
        username: request.body.username,
    }]);
});

app.get('/create_db', function (request, response) {
    client.query(`
        CREATE TABLE users(id SERIAL PRIMARY KEY, type VARCHAR(40) not null, subtype VARCHAR(40) not null, json BLOB not null);
        CREATE TABLE items(id SERIAL PRIMARY KEY, type VARCHAR(40) not null, subtype VARCHAR(40) not null, json BLOB not null);
        CREATE TABLE quests(id SERIAL PRIMARY KEY, type VARCHAR(40) not null, subtype VARCHAR(40) not null, json BLOB not null);
        CREATE TABLE npcs(id SERIAL PRIMARY KEY, type VARCHAR(40) not null, subtype VARCHAR(40) not null, json BLOB not null);
        CREATE TABLE monsters(id SERIAL PRIMARY KEY, type VARCHAR(40) not null, subtype VARCHAR(40) not null, json BLOB not null);
        CREATE TABLE locations(id SERIAL PRIMARY KEY, type VARCHAR(40) not null, subtype VARCHAR(40) not null, json BLOB not null);
    `).on("end", () => {
        client.end();
    });
    client.query('INSERT INTO items(type, subtype, json) values($1, $2)', [data.text, data.complete]);
});






















// INIT SEQUENCE

DB.initDB(function(err, db){
	if(err) return console.error('no db: ', err)
    console.log('DB init:', Date.now())
    const listener = app.listen(env.port, function () {
        console.log('Your app is listening on port ' + listener.address().port);
        // SOCKET ROUTING
        wss.on('connection', (ws, req) => {
          const cookies = cookie.parse( req.headers.cookie )
          const sid = cookieParser.signedCookie( cookies['connect.sid'], env.secret )

          STORE.get( sid, function (err, ss) {
            if( err ){
              ws.send(JSON.stringify({
                type: 'error',
                msg: 'error retrieving player'
              }))
            }
            STORE.createSession( req, ss ) //creates the session object AND append on req (!)
            ws.request = req

            // tada, ws now has session and is ready for action
            console.log("user connected");
            
            ws.on('message', (message) => {
                console.log(`Received message => ${message}`);
                const msg = JSON.parse( message );
                switch (msg.type) {
                    case "move":
                        
                        break;
                    case "action":
                        break;
                }
                // ws.send(message); //TODO: Send to players on a "need to know" basis
            })
            ws.send('player joined');
          })

    })

  })











