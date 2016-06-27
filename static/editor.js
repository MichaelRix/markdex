/* Fake jQuery */
$ = function(selector) {
    els = document.querySelectorAll(selector);
    for (i = 0; i < els.length; i++) {
        el = els[i];
        el.addClass = function(x) {
            if (el.classList) { el.classList.add(x); }
            else { el.className += ' ' + x; }
            return el;
        };
        el.removeClass = function(x) {
            if (el.classList) {
                el.classList.remove(x);
            }
            else {
                el.className = el.className.replace(new RegExp('(^|\\b)' + x.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
            }
            return el;
        };
        el.hasClass = function(x) {
            if (el.classList) {
                return el.classList.contains(x);
            } else {
                return new RegExp('(^| )' + x + '( |$)', 'gi').test(el.className);
            }
        };
        el.remove = function(x) {
            el.parentNode.removeChild(el);
        };
        el.attr = function(a, b) {
            el.setAttribute(a, b);
        };
        el.html = function(x) {
            el.innerHTML = x;
        };
        el.on = function(a, b) {
            el.addEventListener(a, b);
        };
        el.off = function(a, b) {
            el.removeEventListener(a, b);
        };
        el.forEach = function(x) { x(el); };
        el.each = function(x) { x(el); };
    }
    if (els.length == 1) return els.item(0);
    else {
        els.each = function(x) {
            for(i = 0; i < els.length; i++) {
                x(els[i]);
            }
        };
        return els;
    }
};
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
/* End fake jQuery */

util = {
    fetch: function(path, callback = function() {}) {
        url = '__editor__?act=l&p=' + encodeURI(path);
        _.get(url, function(x) {
            x = JSON.parse(x);
            hypertext = '';
            x.folders.forEach(function(a) {
                hypertext += '<li><a class="folder">' + a + '</a></li>\n';
            });
            x.files.forEach(function(a) {
                hypertext += '<li><a class="file">' + a + '</a></li>\n';
            });
            $('.dirlist').html(hypertext);
            callback(x);
        });
    },
    filename: function(path) {
        return path.substr(path.lastIndexOf('/') + 1);
    },
    close: function() {
        $('.title').html('* no file is open');
        $('#editor').value = '';
        $('.chars').html('0');
    },
    open: function(path, callback = function() {}) {
        url = '__editor__?act=r&p=' + encodeURI(path);
        _.get(url, function(x) {
            x = JSON.parse(x);
            if (x.status == 'ok') {
                content = x.content;
                $('.title').html(util.filename(path));
                $('#editor').value = content;
                $('.chars').html(content.length);
                $('.fpath').html(path);
                callback(x);
            } else {
                console.log('An error occured while opening file `' + path + '`;');
            }
        });
    },
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
    locked: false,
    lock: function() { dir.locked = true; },
    unlock: function() { dir.locked = false; }
}

app = {
    workingfile: '',
    workingdir: 'root',
    savestate: false,
    saved: function(bool) {
        app.savestate = bool;
        if (bool) {
            $('.savestate').html('Saved to server');
        } else {
            $('.savestate').html('Changes unsaved');
        }
    },
    fpath: function(fn) {
        return app.workingdir + '/' + fn;
    },
    f_attach_event: function() {},
    f_close: function(bool = true) {
        app.workingfile = '';
        if (bool) {
            util.close();
            $('.fpath').html('* None');
        }
    },
    f_enter_dir: function(dn) {
        if (dir.locked) return false;
        if (dn == '.') {
            path = app.workingdir;
        }
        else if (dn == '..') {
            path = app.workingdir.substr(0, app.workingdir.lastIndexOf('/'))
        } else {
            path = app.workingdir + '/' + dn;
        }
        dir.lock();
        util.fetch(path, function() {
            app.f_attach_event();
            app.workingdir = path;
            dir.unlock();
        });
    },
    f_open_file: function(fn) {
        if (app.workingfile) {
            app.f_close(false);
        }
        util.open(app.fpath(fn), function(x) {
            app.workingfile = fn;
            app.saved(true);
        });
    },
    f_save_file: function() {
        if (app.workingfile) {
            util.commit(app.fpath(app.workingfile), $('#editor').value, function(x) {
                app.saved(true);
            });
        }
    },
    f_remove_file: function() {
        if (app.workingfile) {
            util.delete(app.fpath(app.workingfile), function() {
                app.f_enter_dir('.');
            });
        }
    },
    init: function() {
        $('.save').on('click', app.f_save_file);
        $('.remove').on('click', app.f_remove_file);
        $('#editor').on('input', function() {
            $('.chars').html(this.value.length);
            if (app.savestate) {
                app.saved(false);
            }
        });
        app.f_attach_event = function() {
            $('.folder').each(function(x) {
                x.onclick = function() { app.f_enter_dir(this.innerHTML); };
            });
            $('.file').each(function(x) {
                x.onclick = function() { app.f_open_file(this.innerHTML); };
            });
        };
        $('.title').on('click', function() {
            setTimeout('$(".left").addClass("show")', 100);
        });
        $('.right').on('click', function() {
            if ($('.left').hasClass('show')) {
                $('.left').removeClass('show');
            }
        });
        app.f_attach_event();
    }
}

app.init();
