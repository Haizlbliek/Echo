from datetime import datetime
import socketio
import sys
import os
import time
from pynput.keyboard import Key, Controller
from pynput.mouse import Controller as MouseController
from pynput.mouse import Button as MouseButton

class bcolors:
    MAGENTA = '\033[95m'
    BLUE = '\033[94m'
    CYAN = '\033[96m'
    GREEN = '\033[92m'
    YELLOW = '\033[93m'
    RED = '\033[91m'
    CLEAR = '\033[0m'
    BOLD = '\033[1m'
    UNDERLINE = '\033[4m'

def print_coloured(text, colour):
	print(colour + text + bcolors.CLEAR)

ERROR_TYPE_NONE = 0
ERROR_TYPE_CONNECTION_ERROR = 1

keyboard = Controller()
mouse = MouseController()

errorType = ERROR_TYPE_NONE

hostName = input("Host Name: ")
if hostName == "":
	print_coloured("Host name empty... exiting.", bcolors.YELLOW)
	quit()

password = input("Password: ")
if password == "":
	print_coloured("Password empty... exiting.", bcolors.YELLOW)
	quit()

siteUrl = input("Server Url: ")
if siteUrl == "":
	print_coloured("Server url empty... exiting.", bcolors.YELLOW)
	quit()

def mapKey(key):
	if key == "space" or key == " ": return Key.space
	if key == "enter": return Key.enter
	if key == "shift": return Key.shift
	if key == "arrowleft": return Key.left
	if key == "arrowright": return Key.right
	if key == "arrowup": return Key.up
	if key == "arrowdown": return Key.down
	if key == "escape": return Key.esc
	if key == "backspace": return Key.backspace
	if key == "tab": return Key.tab

	if key in "abcdefghijklmnopqrstuvwxyz0123456789": return key

	return ""

def main():
	print_coloured("Running...", bcolors.GREEN)
	sio = socketio.Client()

	@sio.event
	def connect():
		print_coloured("Connected to server!", bcolors.GREEN)

	@sio.event
	def disconnect():
		print_coloured("Disconnected from server!", bcolors.YELLOW)

	@sio.event
	def connect_error(data):
		global errorType

		errorType = ERROR_TYPE_CONNECTION_ERROR
		# print(f"Connection failed: {data}")

	@sio.event
	def key(data):
		key = mapKey(data["code"])

		if key == "": return

		if data["pressed"]:
			keyboard.press(key)
		else:
			keyboard.release(key)

	@sio.event
	def mouseEvent(data):
		if data["type"] == 0:
			button = MouseButton.left

			if data["button"] == 0: button = MouseButton.left
			if data["button"] == 1: button = MouseButton.middle
			if data["button"] == 2: button = MouseButton.right

			if data["pressed"]:
				mouse.press(button)
			else:
				mouse.release(button)
		elif data["type"] == 1:
			mouse.move(data["offsetX"], data["offsetY"])

	try:
		sio.connect(siteUrl)

		while True:
			sio.emit("host", [ hostName, password ])

			time.sleep(0.5)
	except Exception as e:
		pass
		# print(f"An error occurred: {e}")
	finally:
		sio.disconnect()


try:
	main()
except KeyboardInterrupt as e:
	print(e)

if errorType == ERROR_TYPE_NONE:
	print_coloured("Finished with no errors!", bcolors.GREEN)
else:
	print()
	print_coloured("Program Crashed!", bcolors.RED)

	if errorType == ERROR_TYPE_CONNECTION_ERROR:
		print_coloured("Error: Connection Error", bcolors.RED)