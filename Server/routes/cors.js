const express = require('express');
const cors = require('cors');
const app = express();

const whitelist = ['http://localhost:3000', 'https://localhost:3443', 'http://LAPTOP-PBIM0UDM:3001','http://localhost:3006'];
var corsOptionsDelgate = (req, callback) => {
    var corsOptions;

    if(whitelist.indexOf(req.header('Origin')) !== -1) {
        corsOptions = { origin: true};  //Origin in header is in whitelist
    }
    else {
        corsOptions = {origin: false}
    }
    callback(null, corsOptions);
};

exports.cors = cors(); //Ok for get functions returns * wildcard 
exports.corsWithOptions = cors(corsOptionsDelgate);//For cors with specific routes
