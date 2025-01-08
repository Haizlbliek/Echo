const fs = require("fs");

let log = "";

let logIndex;
let logFile;

function addLine(line) {
	log += line + "\n";
}

function init() {
	logIndex = Date.now();
	logFile = "logs/log" + logIndex + ".log";

	addLine("##### LOG START #####");
}

async function close() {
	addLine("##### LOG END #####");

	return new Promise((resolve, reject) => {
		fs.writeFile(logFile, log, { flags: "w" }, function (error) {
			if (error) {
				reject(error);
				return;
			}

			resolve();
		});
	});
}

function key(input) {
	addLine("Input: " + input.code + " - " + input.pressed);
}

function button(input) {
	addLine("Mouse Button: " + input.button + " - " + input.pressed);
}

function warn(line) {
	addLine("WARN: " + line);
}

module.exports = {
	init,
	close,
	key,
	button,
	warn
};