#!/usr/bin/python3
# -*- coding: utf-8 -*-

if __name__ == '__main__': exit()

from flask import render_template
from os import remove, rmdir
from os.path import isfile, isdir, getsize, abspath
from functools import wraps # 元編程出現辣！
from shared import *
import json

def path_qingzhen(func):
    @wraps(func)
    def qingzhen(*args, **kwargs):
        path = root + args[0]
        newargs = (path, *args[1:])
        qingzhen = abspath(uri.d2f('/'))
        if abspath(path).startswith(qingzhen):
            return func(*newargs, **kwargs) # 可以，這很清真
        else: return '無可奉告' # 這路徑不清真
    return qingzhen

@path_qingzhen
def backend_openfile(path):
    if isfile(path):
        if getsize(path) <= 60 * 1024: # 60 KB
            try:
                content = readfile(path, 'r')
            except:
                return json.dumps({'status': 'error', 'content': ''})
            else:
                return json.dumps({'status': 'ok', 'content': content})
    return 'FAILURE'

@path_qingzhen
def backend_listdir(path, ajax = False):
    # 又寫冗餘代碼了
    if isdir(path):
        if not path.endswith('/'): path = path + '/'
        dirs, files = [], []
        if path != uri.d2f('/'):
            dirs.append('..')
        for name in listdir(path):
            if isdir(path + name): dirs.append(name)
            else: files.append(name)
            # 不可能有 又不是目錄也不是文件的存在吧
        dirs.sort()
        files.sort()
        if ajax:
            return json.dumps({'status': 'ok', 'folders': dirs, 'files': files})
        else:
            return render_template('editor.html', folders = dirs, files = files)
    else: return json.dumps({'status': 'nok'})

@path_qingzhen
def backend_createfile(path):
    if isfile(path):
        return json.dumps({'status': 'nok'})
    else:
        f = open(path, 'w')
        f.close()
        return json.dumps({'status': 'ok'})

@path_qingzhen
def backend_commitfile(path, content):
    if isfile(path):
        try:
            f = open(path, 'w', encoding = 'utf-8')
            f.write(content)
            f.close()
        except:
            return json.dumps({'status': 'error'})
        else:
            return json.dumps({'status': 'ok'})
    else:
        return json.dumps({'status': 'ok'})

@path_qingzhen
def backend_deletefile(path):
    if isfile(path):
        try:
            remove(path)
        except:
            return json.dumps({'status': 'error'})
        else:
            return json.dumps({'status': 'ok'})
    return json.dumps({'status': 'nok'})

@path_qingzhen
def backend_rmdir(path):
    if isdir(path):
        try:
            rmdir(path)
        except:
            return json.dumps({'status': 'error'})
        else:
            return json.dumps({'status': 'ok'})
    return json.dumps({'status': 'nok'})
