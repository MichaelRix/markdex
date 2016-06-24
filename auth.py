#!/bin/python
# -*- coding: utf-8 -*-

if __name__ == '__main__': exit()

from flask import request, redirect, Response
import json, hashlib
from time import time
from shared import readfile, message

auth_saved = {}

try:
    auth_json = readfile('auth_credentials')
    auth_pairs = json.loads(auth_json)
    del auth_json
except:
    message("Failed to load auth credentials.")
else:
    message("Auth mod: added credentials to pool.")

def md5(source):
    s = hashlib.md5()
    s.update(source.encode('utf-8'))
    return s.hexdigest()

def auth_try(uname, upass):
    message('Uname %s hash %s' % (uname, md5(upass)))
    message('Desired %s hash %s' % (uname, auth_pairs[uname]))
    if uname in auth_pairs and auth_pairs[uname] == md5(upass): return True
    return False

def auth_login(uname, upass, addr):
    if auth_try(uname, upass):
        auth_saved[uname] = addr
        response = Response('可以，這很清真。')
        response.set_cookie(key = uname, value = addr, expires = time() + 3600)
        response.status_code = 302
        response.location = '/__editor__'
        return response
    else:
        return redirect('/__login__?error=1')

def auth_still(uname, addr):
    if uname in auth_saved and auth_saved[uname] == addr: return True
    return False

def auth_logout():
    response = Response('不可以，這不清真。')
    response.set_cookie(key = 'uname', value = '', expires = time())
    return response
