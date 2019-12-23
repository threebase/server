// server.js
// where your node app starts

// init project
const fs = require("fs");
const env = require(fs.existsSync("env.json") ? "./env.json" : "./default_env.json");

const express = require('express');
const fs = require('fs');

const app = express();
const http = require("http").createServer(app);
http.listen(8088, function(){
    console.log('listening on *:8088');
});
const app = express();

app.use(express.static(__dirname));

wss.on('connection', (ws, req) => {
    console.log("user connected");
    ws.on('message', (message) => {
        console.log(`Received message => ${message}`);
        switch (message.type) {
            case "move":
                break;
            case "action":
                break;
        }
        ws.send(message); //TODO: Send to players on a "need to know" basis
    })
    ws.send('player joined');
})


app.get('/', function (request, response) {

    const html = fs.readFileSync(path.join(__dirname, "index.html"), "utf8").split("PORT_GOES_HERE").join(env.port);

    response.send(html);
});

