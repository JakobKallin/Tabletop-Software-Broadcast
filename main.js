var WebSocketServer = require('ws').Server;
var server = new WebSocketServer({ host: '0.0.0.0', port: process.argv[2] });
var connections = {};

server.on('connection', function(connection) {
    var client = connection.upgradeReq.connection.remoteAddress;
    var session = connection.upgradeReq.url.substring(1);
    connections[session] = connections[session] || [];
    connections[session].push(connection);
    console.log('%s connected to session "%s"', client, session);
    showClientsInSession(session);

    connection.on('message', function(message) {
        console.log('received %s from %s', message, client);
        connections[session].forEach(function(c) {
            c.send(message);
        });
        console.log('sent "%s" from %s to: [%s]', message, client, clientsInSession(session).join(', '));
    });

    connection.on('close', function() {
        connections[session].splice(connections[session].indexOf(connection), 1);
        console.log('%s disconnected from "%s"', client, session);
        showClientsInSession(session);
    });

    function showClientsInSession(session) {
        console.log('clients in session "%s": [%s]', session, clientsInSession(session).join(', '));
    }

    function clientsInSession(session) {
        return connections[session].map(function(c) {
            return c.upgradeReq.connection.remoteAddress;
        });
    }
});
