/* Fake jQuery */
$ = function(selector) {
    el = document.querySelectorAll(selector);
    el.html = function(x) {
        el.innerHTML = x;
    };
    el.addClass = function(x) {
        if (el.classList) {
            el.classList.add(x);
        } else {
            el.className += ' ' + x;
        }
    }
    el.removeClass = function(x) {
        if (el.classList)
          el.classList.remove(x);
        else
          el.className = el.className.replace(new RegExp('(^|\\b)' + x.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
    }
}
$.xhr = {
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
        req.send();
    }
};
/* End fake jQuery */
