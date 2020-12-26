const express = require('express');
const app = express();
const fs = require('fs');

const configFile = fs.readFileSync('config.json');
const config = JSON.parse(configFile);

if (config.env === 'dev') {
    app.listen(3000, () => {
        console.log('HTTP Server running on port 3000');
    });

    app.use(express.urlencoded());
    app.use(express.json());

    app.use(function (request, response, next) {
        response.header('Access-Control-Allow-Origin', 'http://localhost');
        response.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
        next();
    });
} if (config.env === 'prod') {
    const http = require('http');
    const https = require('https');

    const privateKey = fs.readFileSync('privkey.pem', 'utf8');
    const certificate = fs.readFileSync('cert.pem', 'utf8');
    const ca = fs.readFileSync('chain.pem', 'utf8');

    const credentials = {
        key: privateKey,
        cert: certificate,
        ca: ca
    };

    const httpServer = http.createServer(app);
    const httpsServer = https.createServer(credentials, app);

    httpServer.listen(3001, () => {
        console.log('HTTP Server running on port 3001');
    });

    httpsServer.listen(3000, () => {
        console.log('HTTPS Server running on port 3000');
    });

    app.use(express.urlencoded());
    app.use(express.json());

    app.use(function (request, response, next) {
        response.header('Access-Control-Allow-Origin', '*');
        response.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
        next();
    });
}

app.use(require('./routes'));
