const fs = require("fs");
if (!fs.existsSync("env.json")) {
    fs.writeFileSync("env.json", fs.readFileSync("default_env.json", "utf8"));
}
const env = require("./env.json");

const express = require('express');
const session = require('express-session');
const sharedsession = require('express-socket.io-session');
const MemoryStore = require('memorystore')(session);
const cookie = require('cookie');
const cookieParser = require('cookie-parser');
// const bodyParser = require('body-parser'); // is this still needed?
const app = express();
const pg = require('pg');
const path = require('path');
const http = require("http").createServer(app);
const io = require("socket.io")(http);

console.log('env === ', env);

const WebSocket = require('ws');
const wss = new WebSocket.Server({
    port: env.websocket_port
});

const DB = require('./db_init.js');

// MIDDLEWARE

app.use(express.json());
app.use(express.static(__dirname));

const STORE = new MemoryStore({
    checkPeriod: 1000 * 60 * 60 * 24 * 2 // prune expired entries every 24h
});
const LRU_SESSION = session({
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 2
    },
    resave: false,
    saveUninitialized: true,
    store: STORE,
    secret: env.secret
});
app.use(LRU_SESSION);

io.use(sharedsession(LRU_SESSION, {
    autoSave:true
})); 

// HTTP ROUTING
app.get('/', function (request, response) { // one individual game
    const html = fs.readFileSync(path.join(__dirname, "/sample_client/index.html"), "utf8");
    response.send(html);
});
app.get('/2x2', function (request, response) { // four iframes displaying '/'
    const html = fs.readFileSync(path.join(__dirname, "/sample_client/2x2.html"), "utf8")
        .split("PORT_GOES_HERE")
        .join(env.express_port);
    response.send(html);
});

app.get('/read', function (request, response) {
    const table = request.body.table;
    const readableTables = ["items", "quests", "npcs", "monsters", "locations"];
    if (readableTables.includes(table)) {
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

// Making sure db is ready before listening to web requests
DB.initDB(function(err, pg){
    if(err) return console.error('DB error: ', err);

    http.listen(env.express_port, function () {
        console.log('Express is listening to port: ' + env.express_port);
        console.log('Postgres is listening to port: ' + env.postgres_port);
        console.log('WebSocket is listening to port: ' + env.websocket_port);

        // SOCKET ROUTING
        const playerColors = ["rgb(26, 188, 156)", "rgb(46, 204, 113)", "rgb(52, 152, 219)", "rgb(155, 89, 182)", "rgb(52, 73, 94)", "rgb(22, 160, 133)", "rgb(39, 174, 96)", "rgb(41, 128, 185)", "rgb(142, 68, 173)", "rgb(44, 62, 80)", "rgb(241, 196, 15)", "rgb(230, 126, 34)", "rgb(231, 76, 60)", "rgb(236, 240, 241)", "rgb(149, 165, 166)", "rgb(243, 156, 18)", "rgb(211, 84, 0)", "rgb(192, 57, 43)", "rgb(189, 195, 199)", "rgb(127, 140, 141)"];
        const players = {};
        io.on('connection', function(socket){
            console.log('a user connected: ' + socket.id);
            socket.on('disconnect', function(data){
                console.log('user disconnected: '+socket.id);
                delete players[socket.id];
                io.sockets.emit('remove-player', socket.id);
            });
            socket.on('move', function(player){
                players[player.id] = player;
                socket.broadcast.emit('move', player);
            });
            const player = {
                id: socket.id,
                x: (150 * Math.random()) + 50,
                y: (150 * Math.random()) + 50,
                speed: 100,
                vx: -1,
                vy: 0,
                color: playerColors[Object.keys(players).length] 
            };
            players[player.id] = player;

            socket.emit("init", {
                player,
                players
            });
        });
        // wss.on('connection', (ws, req) => {
        //     const cookies = cookie.parse(req.headers.cookie)
        //     const sid = cookieParser.signedCookie(cookies['connect.sid'], env.secret)
    
        //     STORE.get(sid, function (err, ss) {
        //         if (err) {
        //             ws.send(JSON.stringify({
        //                 type: 'error',
        //                 msg: 'error retrieving player'
        //             }))
        //         }
        //         STORE.createSession(req, ss) //creates the session object AND append on req (!)
        //         ws.request = req
    
        //         // ta da, ws now has session and is ready for action
        //         console.log("user connected");
    
        //         ws.on('message', (message) => {
        //             console.log(`Received message => ${message}`);
        //             const msg = JSON.parse(message);
        //             switch (msg.type) {
        //                 case "move":
    
        //                     break;
        //                 case "action":
        //                     break;
        //             }
        //             ws.send(message); //TODO: Send to players on a "need to know" basis
        //         })
        //         ws.send('player joined');
        //     })
        // })
    });
})
