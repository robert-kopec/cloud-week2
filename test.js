//setup express
const express = require('express');
const app = express();
const port = 1000;

//setup zeromq
var zmq = require("zeromq"), sock = zmq.socket("pub");

//bind a publisher to port 3000 all IP addresses
sock.bindSync("tcp://*:3000");
console.log("ZeroMQ h Publisher bound to port 3000");

//Get the hostname of the node
var os = require("os");
var myhostname = os.hostname();

//print the hostname
console.log(myhostname);

//route for get page /
app.get('/', (req, res) => {
    //Send the response to the browser
    res.send('Hello this is node ' + myhostname);
})

//bind node to the port
app.listen(port, () => {
    console.log(`Express listening at port ` + port);
})

//based on the interval publish a status message
setInterval(function () {
    console.log("sending alive");
    sock.send(["status", myhostname + "=alive"]);
}, 2000);

//read the nodes.txt file
const fs = require('fs');
nodesTxtFile = fs.readFileSync('nodes.txt');
nodes = JSON.parse(nodesTxtFile);
console.log("nodes config file has " + nodes);

//for each key value in nodes
Object.entries(nodes).forEach(([hostname, ip]) => {
    //print the hostname IP
    console.log("hostname = " + hostname + " ip = " + ip);

    //create a number of subscribers to connect to publishers
    var subsockets = [];
    if (myhostname != hostname) {
        tempsoc = zmq.socket("sub");
        tempsoc.connect("tcp://" + ip + ":3000");
        tempsoc.subscribe("status");
        console.log("Subscriber connected to port 3000 of " + hostname);
        tempsoc.on("message", function (topic, message) {
            console.log(
                "received a message from " + hostname + " related to:",
                topic.toString("utf-8"),
                "containing message:",
                message.toString("utf-8")
            );
        });
        //push this instance of a sub socket to the list.
        subsockets.push(tempsoc);
    }
});
nodes.txt