const express = require("express");
const app = express();
const server = require("http").createServer(app);
const io = require("socket.io")(server);
const cors = require("cors");
const bodyParser = require("body-parser");
const readline = require("readline");

const log = require("./logger.js");

const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout
});

rl.on("line", async (input) => {
	if (input === "quit" || input == "q") {
		console.log("Quitting...");

		await log.close();
		rl.close();

		process.exit();
	} else {
		console.log("Unknown command: " + input);
	}
});

rl.on("SIGINT", async () => {
	console.log("Quitting...");

	await log.close();
	rl.close();

	process.exit();
});

const corsOptions = {
	origin: function (origin, callback) {
		if (!origin || origin.startsWith("file://")) {
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

	log.init();
});

class Input {
	constructor(code, pressed) {
		this.code = code;
		this.pressed = pressed;
	}
}

let sockets = [];

let host = null;
let hostTime = -1;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post("/", function (request, response) {
	if (request.headers.authorization != process.env.password) {
		response.send("Invalid Password");

		log.warn("Invalid password while simulating key: " + request.headers.authorization);
		return;
	}

	if (request.body.type == 0) {
		const input = new Input(request.body.key, request.body.pressed);

		for (let socket of sockets) {
			socket.emit("key", input);
		}

		response.send("Thank you for contacting Echo!");

		log.key(input);
	} else if (request.body.type == 1) {
		const event = {
			type: 0,
			button: request.body.button,
			pressed: request.body.pressed
		};

		for (let socket of sockets) {
			socket.emit("mouseEvent", event);
		}

		response.send("Thank you for contacting Echo!");

		log.button(event);
	} else if (request.body.type == 2) {
		const event = {
			type: 1,
			offsetX: request.body.offsetX,
			offsetY: request.body.offsetY
		};

		for (let socket of sockets) {
			socket.emit("mouseEvent", event);
		}
		
		response.send("Thank you for contacting Echo!");
	}
});

app.post("/getHost", function (request, response) {
	if (request.headers.authorization != process.env.password) {
		log.warn("Invalid password while calling 'getHost': " + request.headers.authorization);

		response.send("Invalid Password");
		return
	}

	response.send(host);
});

io.on('connection', function (socket) {
	sockets.push(socket);

	console.log("Connected!");
	log.warn("Socket connected    IP: " + socket.handshake.address + "    Sockets: " + sockets.length);

	socket.on("host", function (data) {
		const [ hostName, password ] = data;

		if (password != process.env.password) {
			log.warn("Host \"" + hostName + "\" failed to connect: " + password);
			return;
		}

		if (hostName != host) {
			console.log("New host connected: " + hostName);
			log.warn("Host connected: " + hostName);
		}

		host = hostName;
		hostTime = 5;
	});

	socket.on('disconnect', function () {
		sockets.splice(sockets.indexOf(socket), 1);

		console.log("Disconnected!");
		log.warn("Socket disconnected    IP: " + socket.handshake.address + "    Sockets: " + sockets.length);
	});
});

setInterval(() => {
	hostTime--;

	if (hostTime <= 0) {
		host = null;
	}
}, 1000);