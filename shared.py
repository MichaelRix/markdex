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
    message('Issued a 404 while handling %s .' % (request_uri))
    return render_template('404.html', uri = request_uri)

def page_403(request_uri):
    message('Issued a 403 while handling %s .' % (request_uri))
    return render_template('403.html', uri = request_uri)

class uri:
    '''
    / - Global var 'root'
    d - Directory uri
    u - User input uri
    f - Relative uri in filesystem
    n - No .md EXTN
    c - Creation of uri
    '''
    @staticmethod
    def d2f(d):
        return root + d

    @staticmethod
    def u2f(u): # User to Filesystem
        if with_extname:
            return root + u
        else:
            return root + u + '.md'

    @staticmethod
    def cf(n): # Create Fileuri
        return root + n + '.md'

    @staticmethod
    def cu(n):
        if with_extname:
            return n + '.md'
        else:
            return n

def get_flist(dir_uri):
    dirs, files = [], []
    if dir_uri != '/':
        dirs.append('..')
    for name in listdir(uri.d2f(dir_uri)):
        if isdir(uri.d2f(dir_uri + name)): dirs.append(name)
        if (name.endswith('.md')):
            if not with_extname: name = name[:-3]
            # 秘製賣萌 233333~
            files.append(name)
    dirs.sort()
    files.sort()
    things = dirs + files
    return things

def process_file(request_uri, is_index = False):
    try:
        md = readfile(uri.u2f(request_uri))
    except:
        return page_404(request_uri)
    else:
        html = markdown(md)
        return render_template('page.html', title = request_uri, content = html, dirlist = dir_listing and not is_index)

def process_dir(dir_uri):
    if not dir_uri.endswith('/'): dir_uri = dir_uri + '/'
    if isfile(uri.cf(dir_uri + 'index')):
        return process_file(uri.cf(dir_uri + 'index'), True)
    elif dir_listing:
        things = get_flist(dir_uri)
        if isfile(uri.d2f(dir_uri + dl_header)):
            header = readfile(uri.d2f(dir_uri + dl_header))
            return render_template('listing.html', path = dir_uri, things = things, header = header)
        else:
            return render_template('listing.html', path = dir_uri, things = things)
    else:
        return page_403(dir_uri)
