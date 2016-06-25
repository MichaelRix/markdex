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
            callback();
        });
    },
    filename: function(path) {
        return path.substr(path.lastIndexOf('/') + 1);
    },
    close: function() {
        $('.title').html('* no file is open');
        $('#editor').value = '';
    },
    open: function(path, callback = function() {}) {
        url = '__editor__?act=r&p=' + encodeURI(path);
        _.get(url, function(x) {
            x = JSON.parse(x);
            if (x.status == 'ok') {
                content = x.content;
                $('.title').html(util.filename(path));
                $('#editor').value = content;
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

app = {
    workingfile: '',
    workingdir: 'root',
    fpath: function(fn) {
        return app.workingdir + '/' + fn;
    },
    f_attach_event: function() {},
    f_enter_dir: function(dn) {
        if (dn == '.') {
            console.log(app.workingdir)
            path = app.workingdir;
        }
        else if (dn == '..') {
            path = app.workingdir.substr(0, app.workingdir.lastIndexOf('/'))
        } else {
            path = app.workingdir + '/' + dn;
        }
        util.fetch(path, app.f_attach_event);
        app.workingdir = path;
    },
    f_open_file: function(fn) {
        if (app.workingfile) {
            util.close();
        }
        util.open(app.fpath(fn), function(x) { app.workingfile = fn; });
    },
    f_save_file: function() {
        if (app.workingfile) {
            util.commit(app.fpath(app.workingfile), $('#editor').value);
        }
    },
    f_remove_file: function() {
        if (app.workingfile) {
            util.delete(app.fpath(app.workingfile), function() { app.f_enter_dir('.'); });
        }
    },
    init: function() {
        $('.save').on('click', app.f_save_file);
        $('.remove').on('click', app.f_remove_file);
        app.f_attach_event = function() {
            $('.folder').each(function(x) {
                x.onclick = function() { app.f_enter_dir(this.innerHTML); };
            });
            $('.file').each(function(x) {
                x.onclick = function() { app.f_open_file(this.innerHTML); };
            });
        };
        app.f_attach_event();
    }
}

util.close();
app.init();
