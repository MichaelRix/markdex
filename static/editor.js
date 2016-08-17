/* youdontneedjquery */
$ = document.querySelector.bind(document);
$all = document.querySelectorAll.bind(document);

_ = {
    get: function(url, callback, error = function() {}) {
        req = new XMLHttpRequest();
        req.open('GET', url, true);
        req.onload = function() {
            if (req.status >= 200 && req.status < 400) {
                callback(req.responseText);
            }
        };
        req.onerror = error;
        req.send();
    },
    post: function(url, data, callback) {
        req = new XMLHttpRequest();
        req.open('POST', url, true);
        req.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=utf-8');
        req.onload = function() {
            if (req.status >= 200 && req.status < 400) {
                callback(req.responseText);
            }
        };
        req.send(data);
    }
};

util = {
    /* Get directory content from server, and show in dirlist
     * callback
     */
    fetch: function(path, callback = function() {}) {
        url = '__editor__?act=l&p=' + encodeURI(path);
        _.get(url, function(x) {
            x = JSON.parse(x);
            if (x.status == 'ok') {
                hypertext = '';
                x.folders.forEach(function(a) {
                    hypertext += '<li><a class="folder">' + a + '</a></li>\n';
                });
                x.files.forEach(function(a) {
                    hypertext += '<li><a class="file">' + a + '</a></li>\n';
                });
                $('.dirlist').innerHTML = hypertext;
                callback(x);
            }
        });
    },
    /* Get current filename
     * from file path
     */
    filename: function(path) {
        return path.substr(path.lastIndexOf('/') + 1);
    },
    /* Close current file
     * reset editor
     */
    close: function() {
        $('.title').innerHTML = '* no file is open';
        $('#editor').value = '';
        $('.chars').innerHTML = '0';
    },
    /* Open a file <- path
     * Init editor with values
     * callback
     */
    open: function(path, callback = function() {}) {
        url = '__editor__?act=r&p=' + encodeURI(path);
        _.get(url, function(x) {
            x = JSON.parse(x);
            if (x.status == 'ok') {
                content = x.content;
                $('.title').innerHTML = util.filename(path);
                $('#editor').value = content;
                $('.chars').innerHTML = content.length;
                $('.fpath').innerHTML = path;
                callback(x);
            } else {
                console.log('An error occured while opening file `' + path + '`;');
            }
        });
    },
    /* Create a file <- path
     * callback
     */
    create: function(path, callback = function() {}) {
        url = '__editor__?act=c&p=' + encodeURI(path);
        _.get(url, function(x) {
            x = JSON.parse(x);
            if (x.status == 'ok') {
                callback(x);
            } else {
                console.log('An error occured while creating file `' + path + '`;');
            }
        });
    },
    /* Commit changes to a file <- path content
     * callback
     */
    commit: function(path, content, callback = function() {}) {
        url = '__editor__?act=w&p=' + encodeURI(path);
        _.post(url, 'content=' + encodeURIComponent(content), function(x) {
            x = JSON.parse(x);
            if (x.status == 'ok') {
                callback(x);
            } else {
                console.log('An error occured while pushing file `' + path + '`;');
            }
        });
    },
    /* Delete a file <- path
     * callback
     */
    delete: function(path, callback = function() {}) {
        url = '__editor__?act=d&p=' + encodeURI(path);
        _.get(url, function(x) {
            x = JSON.parse(x);
            if (x.status == 'ok') {
                util.close();
                callback(x);
            } else {
                console.log('An error occured while deleting file `' + path + '`;');
            }
        });
    }
};

dir = {
    locked: false, // is in open process
    lock: function() { dir.locked = true; },
    unlock: function() { dir.locked = false; }
}

app = {
    workingfile: '', // working file's NAME
    workingdir: '/', // RELATIVE to `root` and endsWith '/'
    savestate: false, // is SAVED or CHANGED but not SAVED
    saved: function(bool) {
        app.savestate = bool;
        if (bool) {
            $('.savestate').innerHTML = 'Saved to server';
        } else {
            $('.savestate').innerHTML = 'Changes unsaved';
        }
    },
    // Get file full path <- filename
    fpath: function(fn) {
        return app.workingdir + fn;
    },
    // Will be set in future
    f_attach_event: function() {},
    // Close a file
    f_close: function(bool = true) {
        app.workingfile = '';
        if (bool) { // Need to clean the workspace?
            util.close();
            $('.fpath').innerHTML = '* None';
        }
        c = $('.current');
        if (c != null) {
            c.classList.remove('current');
        }
    },
    // Enter a directory <- dirname relative
    f_enter_dir: function(dn) {
        if (dir.locked) return false;
        if (dn == '.') {
            path = app.workingdir;
        }
        else if (dn == '..') {
            path = app.workingdir.replace(/[^\/]+?\/$/, '');
        } else {
            path = app.workingdir + dn + '/';
        }
        dir.lock();
        util.fetch(path, function() {
            app.f_attach_event();
            app.workingdir = path;
            dir.unlock();
        });
    },
    /* Open file <- filename
     * ano_element <- user clicked <a class="file"> element
     */
    f_open_file: function(fn, ano_element = null) {
        if (app.workingfile) {
            app.f_close(false);
        }
        util.open(app.fpath(fn), function(x) {
            app.workingfile = fn;
            app.saved(true);
        });
        if (ano_element) {
            ano_element.classList.add('current');
        }
    },
    // Commit file changes (current file)
    f_save_file: function() {
        if (app.workingfile) {
            util.commit(app.fpath(app.workingfile), $('#editor').value, function(x) {
                app.saved(true);
            });
        }
    },
    // Delete current file <- WORKING FILE
    f_remove_file: function() {
        if (app.workingfile) {
            util.delete(app.fpath(app.workingfile), function() {
                app.f_enter_dir('.');
            });
        }
    },
    // Initialize
    init: function() {
        $('.save').addEventListener('click', app.f_save_file);
        $('.remove').addEventListener('click', app.f_remove_file);
        $('#editor').addEventListener('input', function() {
            $('.chars').innerHTML = this.value.length;
            if (app.savestate) {
                app.saved(false); // state to UNSAVED
            }
        });
        app.f_attach_event = function() {
            $all('.folder').forEach(function(x) {
                x.addEventListener('click', (function() {
                    app.f_enter_dir(this.innerHTML);
                }).bind(x));
            });
            $all('.file').forEach(function(x) {
                x.addEventListener('click', (function() {
                    app.f_open_file(this.innerHTML, this);
                }).bind(x));
            });
        };
        $('.title').addEventListener('click', function() {
            // Stupid design but it works
            setTimeout(function() { $('.left').classList.add('show') }, 100);
        });
        $('.right').addEventListener('click', function() {
            if ($('.left').classList.contains('show')) {
                $('.left').classList.remove('show');
            }
        });
        app.f_attach_event();
    }
}

app.init();
