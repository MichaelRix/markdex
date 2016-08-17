#!/usr/bin/python3
# -*- coding: utf-8 -*-

if __name__ != '__main__': exit()

from config import *
if 'version' not in dir():
    print('[ CRITICAL ] Init failed.')
    exit()

from flask import Flask, Response, render_template, redirect

app = Flask(__name__, static_folder = static_folder, template_folder = template_folder)

from shared import * # shared functions
from auth import * # auth modules

@app.route('/__login__', methods = ['GET'])
def login_page():
    if request.args.get('error'):
        return render_template('login.html', error = True)
    else: return render_template('login.html')

@app.route('/__login__', methods = ['POST'])
def _login_page():
    return auth_login()

from editor import * # editor modules

@app.route('/__editor__', methods = ['GET'])
def editor_page():
    if auth_still():
        act = request.args.get('act')
        if act == None:
            return backend_listdir('/')
        else:
            path = request.args.get('p')
            if path != None:
                if act == 'r':
                    return backend_openfile(path)
                elif act == 'l':
                    return backend_listdir(path, ajax = True)
                elif act == 'c':
                    return backend_createfile(path)
                elif act == 'd':
                    return backend_deletefile(path)
            return 'excited'
    else:
        return redirect('/__login__')

@app.route('/__editor__', methods = ['POST'])
def _editor_page():
    if auth_still():
        act = request.args.get('act')
        path = request.args.get('p')
        if act == 'w' and path != None:
            content = request.form.get('content')
            return backend_commitfile(path, content)
    else:
        return redirect('/__login__')

try:
    style_css = readfile('style.css')
    favicon_ico = readfile('favicon.ico', 'rb')
except:
    message('An error occured while reading files.')
else:
    message('Resources successfully loaded.')

@app.route('/style.css')
def _style_css():
    return Response(style_css, mimetype='text/css')

@app.route('/favicon.ico')
def _favicon_ico():
    return Response(favicon_ico, mimetype='image/x-icon')

@app.route('/<path:request_uri>')
def handle(request_uri):
    request_uri = '/' + request_uri
    if isfile(uri.u2f(request_uri)):
        return process_file(request_uri)
    elif isdir(uri.d2f(request_uri)):
        return process_dir(request_uri)
    else:
        return page_404(request_uri)

@app.route('/')
def index():
    if isfile(uri.cf('/index')):
        return process_file(uri.cu('/index'), True)
    else:
        return render_template('index.html')

if __name__ == '__main__':
	app.run(host = host, port = port)
