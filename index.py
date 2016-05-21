#!/bin/python
# -*- coding: utf-8 -*-

if not __name__ == '__main__': exit()

from config import *
if not 'version' in dir():
    print('[ CRITICAL ] Init failed.');
    exit()

from flask import Flask, Response, render_template
from os import listdir, walk
from os.path import isdir, isfile
from markdown import markdown

def readfile(filename, fileop = 'r'):
    try:
        if ('b' in fileop): f = open(filename, fileop)
        else: f = open(filename, fileop, encoding = 'utf-8')
        return f.read()
    except:
        raise

def message(text):
    print('[ SERVER ] %s' % (text))

app = Flask(__name__)

try:
    style_css = readfile('style.css')
    favicon_ico = readfile('favicon.ico', 'rb')
except:
    message('An error occured while reading files.')
else:
    message('Resources successfully loaded.')

@app.route('/style.css')
def style():
    return Response(style_css, mimetype='text/css')

@app.route('/favicon.ico')
def favicon():
    return Response(favicon_ico, mimetype='image/x-icon')

def page_404(request_uri):
    message('Issued a 404 while handling /%s .' % (request_uri))
    return render_template('404.html', uri = request_uri)

def page_403(request_uri):
    message('Issued a 403 while handling /%s .' % (request_uri))
    return render_template('403.html', uri = request_uri)

def process_file(request_uri):
    try:
        md = readfile(root + request_uri + '.md')
    except:
        return page_404(request_uri)
    else:
        html = markdown(md)
        return render_template('markdown.html', title = request_uri, content = html)

def process_dir(dir_uri):
    if not dir_uri.endswith('/'): dir_uri = dir_uri + '/'
    if isfile(root + dir_uri + 'index.md'):
        return process_file(dir_uri + 'index')
    elif dir_listing:
        things = set()
        for r, dirs, files in walk(root + dir_uri):
            for name in dirs:
                if isdir(root + dir_uri + name): things.add(name)
            for name in files:
                if (name.endswith('.md')):
                    name = name[:-3]
                    things.add(name)
        return render_template('listing.html', path = '/' + dir_uri, things = things)
    else:
        return page_403(dir_uri)

@app.route('/<path:request_uri>')
def handle(request_uri):
    path = root + request_uri
    if isfile(path + '.md'):
        return process_file(request_uri)
    elif isdir(path):
        return process_dir(request_uri)
    else:
        return page_404(request_uri)

@app.route('/')
def index():
    return render_template('index.html')

if __name__ == '__main__':
	app.run(host = host, port = port)
