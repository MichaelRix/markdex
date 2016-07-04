#!/usr/bin/python3
# -*- coding: utf-8 -*-

if __name__ == '__main__': exit()

from os import listdir
from os.path import isdir, isfile
from flask import render_template
from markdown import markdown
from config import *

def readfile(filename, fileop = 'r'):
    try:
        if ('b' in fileop): f = open(filename, fileop)
        else: f = open(filename, fileop, encoding = 'utf-8')
        data = f.read()
        f.close()
        return data
    except:
        raise

def message(text):
    print('[ SERVER ] %s' % (text))

def page_404(request_uri):
    message('Issued a 404 while handling /%s .' % (request_uri))
    return render_template('404.html', uri = request_uri)

def page_403(request_uri):
    message('Issued a 403 while handling /%s .' % (request_uri))
    return render_template('403.html', uri = request_uri)

def u2path(request_uri):
    # Returns path starts at root
    if request_uri == '/': return root
    return root + request_uri

def u2fpath(request_uri):
    # Returns real file path according to request uri
    if with_extname: return root + request_uri
    else: return root + request_uri + '.md'

def ucreate(uri_noext):
    # Returns a request uri according to uri without ext
    if with_extname: return uri_noext + '.md'
    else: return uri_noext

def un2fpath(uri_noext):
    # Returns real file path according to uri without ext
    return u2fpath(ucreate(uri_noext))

def get_flist(dir_uri):
    dirs, files = [], []
    if dir_uri != '/':
        dirs.append('..')
    for name in listdir(u2path(dir_uri)):
        if isdir(u2path(dir_uri + name)): dirs.append(name)
        if (name.endswith('.md')):
            if not with_extname: name = name[:-3]
            # 秘製賣萌 233333~
            files.append(name)
    dirs.sort()
    files.sort()
    things = dirs + files
    return things

def process_file(request_uri):
    try:
        md = readfile(u2fpath(request_uri))
    except:
        return page_404(request_uri)
    else:
        html = markdown(md)
        return render_template('page.html', title = request_uri, content = html)

def process_dir(dir_uri):
    if not dir_uri.endswith('/'): dir_uri = dir_uri + '/'
    if isfile(u2path(dir_uri) + 'index.md'):
        return process_file(ucreate(dir_uri + 'index'))
    elif dir_listing:
        things = get_flist(dir_uri)
        if isfile(u2path(dir_uri + dl_header)):
            header = readfile(u2path(dir_uri + dl_header))
            return render_template('listing.html', path = '/' + dir_uri, things = things, header = header)
        else:
            return render_template('listing.html', path = '/' + dir_uri, things = things)
    else:
        return page_403(dir_uri)
