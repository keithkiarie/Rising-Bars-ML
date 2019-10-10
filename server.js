let express = require('express');
let app = express();
let server = require('http').createServer(app);
var io = require('socket.io').listen(server);

let users = [];
let connections = [];

server.listen(process.env.PORT || 3000);
console.log('Server started');


app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});


io.on('connection', function (socket) {
    connections.push(socket);
    console.log('\n Connected: %s sockets connected', connections.length);

    socket.on('disconnect', function (data) {
        connections.splice(connections.indexOf(socket), 1);
        console.log('\n Disconnected: %s sockets connected', connections.length);
    });
});