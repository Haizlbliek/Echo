const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const cors = require('cors');

const corsOptions = {
	origin: function (origin, callback) {
		if (!origin || origin.startsWith('file://')) {
			callback(null, true);
		} else {
			callback(null, true);
		}
	}
};

app.use(cors(corsOptions));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

server.listen(process.env.port, () => {
	console.log("App listening on " + process.env.port);
});

// app.use("/", function (request, response, next) {
// 	console.log(request.method + " " + request.url);
// 	next();
// });

app.use("/", function (request, response) {
	console.log(request.method, request.body);
	response.send("Thank you for contacting GoofyBox HQ!");
});

io.on('connection', function (socket) {
	console.log("CONNECTION!!!");

	socket.on('disconnect', function () {
	});
});