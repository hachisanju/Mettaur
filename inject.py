from __future__ import print_function
import frida
import sys
import click
import time
import argparse
#import readline #hmm... this might be an issue on windows
import threading
import os
from colorama import init, Fore, Back, Style

parser = argparse.ArgumentParser(description='Interceptor for libssl write function')
parser.add_argument('--process', action='store', type=str, help='Process to inject')
parser.add_argument('--library', action='store', type=str, help='Library to inject')
args = parser.parse_args()

if args.process.isnumeric():

    session = frida.attach(int(args.process))
else:
    try:
        session = frida.attach(args.process)
    except:
        session = frida.attach(frida.spawn(args.process))

script = session.create_script(open(args.library + ".js").read())

intercept_mode = False

def editable_input(str):
    #Thread(target=pyautogui.write, args=(str,)).start()
    modified_input = click.edit(str)
    return modified_input
    #print("Waiting 10 seconds")
    #time.sleep(10)
    #return str

def on_message(message, data):
    #print(message)
    if message['payload'] == "prompt":
        show_prompt()
        return
    elif message['payload'] == "pass":
        pass_through()
        return
    #print(message['payload'])
    print(Style.RESET_ALL, end = "")
    #print("\r[!] Intercepting SSL_write()")
    if intercept_mode == True:
        str = editable_input(message['payload'])
    else:
        str = message['payload']
    #print("sending string")
    script.post({"type": "poke", "payload": str})

def pass_through():
    print(Style.RESET_ALL, end = "")
def show_prompt():
    print(Style.DIM + Fore.BLACK + Back.YELLOW + "\r" + args.process +Style.RESET_ALL + Fore.GREEN + " >>> ", end="")

os.system('cls')
script.on('message', on_message)
script.load()
init()
while True:
    print(Style.DIM + Fore.BLACK + Back.YELLOW + "\r" + args.process +Style.RESET_ALL + Fore.GREEN + " >>> ", end="")
    command = input()
    print(Style.RESET_ALL, end = "")
    if command == 'intercept.on':
        intercept_mode = True
        print("[>] Intercept mode active")
    elif command == 'intercept.off':
        intercept_mode = False
        print("[>] Intercept mode disabled")
    elif command == 'clear':
        os.system('cls')
    elif command == 'quit':
        os.system('cls')
        sys.exit()
