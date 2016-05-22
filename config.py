#!/bin/python
# -*- coding: utf-8 -*-

if __name__ == '__main__': exit()

version = '1.0.0.1'
# Mainline version: no need to be modified.

host = '0.0.0.0'
# WSGI host:
# 127.0.0.1 -> localhost
# 0.0.0.0 -> all

port = 5000
# SERVER port

root = 'root/'
# Document root: Where you place .md files

dir_listing = True
# Allow dir listing if no index is found

with_extname = True
# Url routing for .md files.
# True -> must have the .md extension
# False -> must not have the .md extension
