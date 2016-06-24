#!/bin/python
# -*- coding: utf-8 -*-

if __name__ == '__main__': exit()

from flask import render_template
from os.path import isfile, isdir, getsize
from shared import *
import json

def backend_openfile(uri):
    if isfile(uri):
        if getsize(uri) <= 60 * 1024: # 60 KB
            try:
                content = readfile(uri, 'r')
            except:
                return False
            else:
                return content

def backend_listdir(uri, ajax = False):
    if isdir(uri):
        dirs, files = [], []
        if uri != '/':
            dirs.append('..')
        for name in listdir(u2path(uri)):
            if isdir(u2path(uri + name)): dirs.append(name)
            if (name.endswith('.md')):
                if not with_extname: name = name[:-3]
                # 秘製賣萌 233333~
                files.append(name)
        dirs.sort()
        files.sort()
        if ajax:
            return json.dumps({folders: dirs, files: files})
        else:
            return render_template('editor.html', folders = dirs, files = files)
    else: return False

def backend_createfile(uri):
    if isfile(uri):
        return False
    else:
        f = open(uri, 'w')
        f.close()
        return True

def backend_commitfile(uri, content):
    if isfile(uri):
        try:
            f = open(uri, w)
            f.write(content)
            f.close()
        except:
            return False
        else:
            return True
