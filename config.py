#!/usr/bin/python3
# -*- coding: utf-8 -*-

if __name__ == '__main__': exit()

version = '1.0.0.6'
# Mainline version: no need to be modified.

host = '0.0.0.0'
# WSGI host;
# 127.0.0.1 -> localhost
# 0.0.0.0 -> all

port = 5000
# SERVER port

root = 'root'
static_folder = 'static'
template_folder = 'template'
# Do not end with '/'

dir_listing = True
# Allow dir listing if no index is found

dl_header = '.desc'
# Dir listing header
# Show the content of which file before file listing

with_extname = True
# Url routing for .md files.
# True -> must have the .md extension
# Url like: http://localhost:5000/example/file1.md
# False -> must NOT have the .md extension
# Url like: http://localhost:5000/example/file1
# Whatever you set this value, the file (e.g. file1.md) must have .md extension.
