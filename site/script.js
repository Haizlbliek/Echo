let PASSWORD = "";

if (localStorage.getItem("PASSWORD") != null) {
	PASSWORD = localStorage.getItem("PASSWORD");
} else {
	PASSWORD = prompt("Enter Password");
	
	if (prompt("Save password? (y/N) ").toLowerCase()[0] == "y") {
		localStorage.setItem("PASSWORD", PASSWORD);
	}
}

function post(body) {
	const requestTime = Date.now();

	fetch(URL, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			"Authorization": PASSWORD
		},
		body: JSON.stringify(body),
	});
}

function ping() {
	const requestTime = Date.now();

	fetch(URL + "/getHost", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			"Authorization": PASSWORD
		}
	})
	.then((response) => {
		return response.text();
	})
	.then((hostName) => {
		parseHost(hostName);

		console.log("Pinged!");

		const responseTime = Date.now();

		const ping = (responseTime - requestTime);

		$("#ping").innerText = "Ping: " + ping + "ms";
	});
}

function $(query) {
  return document.querySelector(query);
}

const keyCodesElement = $("#keybinds");

const URL = prompt("Enter server URL:");
const CURRENT_GAME = "rainworld";

Input.add_action("left_stick_left", [Input.AXIS_GAMEPAD_LEFT_STICK_LEFT]);
Input.add_action("left_stick_right", [Input.AXIS_GAMEPAD_LEFT_STICK_RIGHT]);
Input.add_action("left_stick_up", [Input.AXIS_GAMEPAD_LEFT_STICK_UP]);
Input.add_action("left_stick_down", [Input.AXIS_GAMEPAD_LEFT_STICK_DOWN]);
Input.add_action("right_stick_left", [Input.AXIS_GAMEPAD_RIGHT_STICK_LEFT]);
Input.add_action("right_stick_right", [Input.AXIS_GAMEPAD_RIGHT_STICK_RIGHT]);
Input.add_action("right_stick_up", [Input.AXIS_GAMEPAD_RIGHT_STICK_UP]);
Input.add_action("right_stick_down", [Input.AXIS_GAMEPAD_RIGHT_STICK_DOWN]);

Input.add_action("button_a", [Input.BUTTON_GAMEPAD_NINTENDO_A]);
Input.add_action("button_b", [Input.BUTTON_GAMEPAD_NINTENDO_B]);
Input.add_action("button_y", [Input.BUTTON_GAMEPAD_NINTENDO_Y]);
Input.add_action("button_x", [Input.BUTTON_GAMEPAD_NINTENDO_X]);

let reloadDelay = 240;

let keysList = {};
let emitBuffer = [];

let currentHost = null;

const customKeys = [
  "left_stick_left",
  "left_stick_right",
  "left_stick_up",
  "left_stick_down",
  "right_stick_left",
  "right_stick_right",
  "right_stick_up",
  "right_stick_down",
  
  "button_a",
  "button_b",
  "button_y",
  "button_x",
];

function parseHost(hostName) {
	if (hostName == "") hostName = null;
		
	if (currentHost == hostName) return;

	currentHost = hostName;
	// console.log("New Host: " + hostName);

	const notification = $("#newHostNotification");

	if (hostName == null) {
		notification.innerHTML = "<h2>Host disconnected!";
	} else {
		notification.innerHTML = "<h2>New host connected!</h2>Host Name: " + hostName;
	}

	notification.classList.remove("hidden");

	setTimeout(() => {
		notification.classList.add("hidden");
	}, 2500);
}

function addKey(from, to) {
  keysList[from] = to;
  
  const element = document.createElement("span");
  
  element.innerHTML = from + " -> " + to;

  keyCodesElement.appendChild(element);
}

function loadKeybinds(keybinds) {
  while (keyCodesElement.firstElementChild) keyCodesElement.removeChild(keyCodesElement.firstElementChild);
  
  for (let from in keybinds) {
    const to = keybinds[from];
    
    const element = document.createElement("span");

    element.innerHTML = (from.padStart(to.length, "*") + " -> " + to.padEnd(from.length, "*")).replaceAll("*", "&nbsp;");

    keyCodesElement.appendChild(element);
  }
  
  keysList = keybinds;
}

function parseKey(pressed, eventKey) {
  let key = "";
  let keyCode = eventKey.toLowerCase();
  
  if (keyCode == " ") keyCode == "space";
  
  if (keysList[keyCode] != undefined) keyCode = keysList[keyCode];
  
  // if ("abcdefghijklmnopqrstuvwxyz0123456789".includes(keyCode)) key = keyCode;
  // if (keyCode == "space") key = keyCode;
  
  if (keyCode == "") return;
  
  // emitBuffer.push([emit, keyCode]);
  // console.log(emit, keyCode);
  post({
  	type: 0,
  	pressed: pressed,
  	key: keyCode,
  });
}

document.onkeydown = function (event) {
  if (event.code == "KeyR" && event.metaKey) return;
  
  event.preventDefault();
  
  if (event.repeat) return;
  
  parseKey(true, event.key);
}

document.onkeyup = function (event) {
  event.preventDefault();
  
  parseKey(false, event.key);
}

document.onmousedown = function (event) {
	post({
		type: 1,
		button: event.button,
		pressed: true,
	});
}

document.onmouseup = function (event) {
	post({
		type: 1,
		button: event.button,
		pressed: false,
	});
}

document.onmousemove = function (event) {
	post({
		type: 2,
		offsetX: event.movementX,
		offsetY: event.movementY
	});
}

hideMouse.onclick = function () {
	document.body.requestPointerLock();
}

// socket.on("givePacket", function () {
//   socket.emit("emitBuffer", emitBuffer);
  
//   emitBuffer.length = 0;
// });

removeKeybindButton.onclick = function () {
  keyRemovePrompt.classList.remove("promptHidden");
}

keyRemoveInput.addEventListener("keydown", function (event) {
  let key = event.key.toLowerCase();
  if (key == " ") key = "space";
  keyRemoveInput.value = key;
  event.preventDefault();
  event.stopPropagation();
}, true);

removeCode.onclick = function () {
  keyRemovePrompt.classList.add("promptHidden");
  keysList[keyRemoveInput.value] = undefined;
  for (let child of keyCodesElement.children) {
    if (child.innerHTML.startsWith(keyRemoveInput.value + ":")) keyCodesElement.removeChild(child);
  }
}

cancelRemoveCode.onclick = function () {
  keyRemovePrompt.classList.add("promptHidden");
}

addKeybindButton.onclick = function () {
  keyCodePrompt.classList.remove("promptHidden");
}

cancelAddKeyCode.onclick = function () {
  keyCodePrompt.classList.add("promptHidden");
}

cancelAddKeyCode.onclick = function () {
  keyCodePrompt.classList.add("promptHidden");
}

addKeyCode.onclick = function () {
  const from = keyCodeInput.value;
  const to = keyCodeReplaceInput.value;
  
  keyCodeInput.value = "";
  keyCodeReplaceInput.value = "";
  
  if (from == "" || to == "") return;
  
  addKey(from, to);
  keyCodePrompt.classList.add("promptHidden");
}

keyCodeInput.addEventListener("keydown", function (event) {
  let key = event.key.toLowerCase();
  if (key == " ") key = "space";
  keyCodeInput.value = key;
  event.preventDefault();
  event.stopPropagation();
}, true);

keyCodeReplaceInput.addEventListener("keydown", function (event) {
  let key = event.key.toLowerCase();
  if (key == " ") key = "space";
  keyCodeReplaceInput.value = key;
  event.preventDefault();
  event.stopPropagation();
}, true);

defaultKeybindsButton.onclick = function () {
  const player = +prompt("Enter player number");
  let binds = {};
  
  switch (player) {
    case 1:
      binds = {
        arrowleft: "a",
        arrowright: "d",
        arrowup: "w",
        arrowdown: "s",
        shift: "q",
        z: "e",
        x: "k",
        tab: "x",
        left_stick_left: "a",
        left_stick_right: "d",
        left_stick_up: "w",
        left_stick_down: "s",
        button_a: "z",
        button_b: "e",
        button_y: "q",
        // left_stick_left: "j",
        // left_stick_right: "l",
        // left_stick_up: "i",
        // left_stick_down: "k",
        // button_a: "u",
        // button_b: "o",
        // button_y: "b",
      };
      break;
    case 2:
      binds = {
        arrowleft: "f",
        arrowright: "h",
        arrowup: "t",
        arrowdown: "g",
        shift: "r",
        z: "y",
        x: "c"
      };
      break;
    case 3:
      binds = {
        arrowleft: "j",
        arrowright: "l",
        arrowup: "i",
        arrowdown: "k",
        shift: "u",
        z: "o",
        x: "b"
      };
      break;
    case 4:
      binds = {
        arrowleft: "p",
        arrowright: "m",
        arrowup: "space",
        arrowdown: "z",
        shift: "n",
        z: "1",
        x: "2"
      };
      break;
  }

  loadKeybinds(binds);
}

let lastActions = [];

function animate() {
  requestAnimationFrame(animate);

  const newActions = [];
  
  for (let key of customKeys) {
    if (Input.is_action_pressed(key)) {
      newActions.push(key);

      if (!lastActions.includes(key)) parseKey("keyDown", key);
    } else {
      if (lastActions.includes(key)) parseKey("keyUp", key);
    }
  }
  
  // reloadDelay -= 1;
  // if (!socket.connected && reloadDelay <= 0) {
  //   location.href = OTHER_SERVER_LINK;
  // }
  
  lastActions = newActions;
}

animate();

setInterval(() => {
	ping();
}, 1000);