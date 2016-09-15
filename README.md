# Overview

A quick way to prototype applications using PicoLisp and mithril.js.

Tested on linux and windows (https://github.com/joebo/picoLisp-win-x86-64)

Dependencies: https://github.com/joebo/pil-bcrypt

Launching: `pil @lib/http.l @lib/xhtml.l @lib/json.l lib\bcrypt.l lib\web.l app\app.l -main -go`

Tests: `mocha test/test.js`
# app.l

An example app.l should include the entities (or in an er.l) and a call to `(api-gen-methods ...)` example:  `(api-gen-methods '(+Todo +Task))`

## demo

![demo](https://cloud.githubusercontent.com/assets/151573/18569188/17cbf45a-7b6f-11e6-822f-45b02fea9020.gif)

## Entities

Entities are defined similar to normal picoLisp entities. The key difference is to use +ApiEntity instead of +Entity. +ApiEntity includes some conventions to simplify programming. For example, every entity is reffered to by its nr key. Each entity also tracks the user that created it in the usr symbol

Special entity methods are used to override the default behavior of +ApiEntity

`show>` is used to convert the entity to json. If the property has a corresponding "-gui" property (e.g. tag and tag-gui), then the -gui version is used to show the data in the table. This is useful because the external symbol value (e.g. {2}) is not useful to show.

`cho>` is used in choice picklists to determine the text to show for the entity (default is 'nr).

`val>` is used to validate the entity prior to save and to set any defaults. The convention is to use json-out to return a message to the user. If `val>` is T then the transaction is committed. In the example below, done is defaulted to 0 and the text representation of the external symbol is converted to the external symbol with `ext`.


## api-gen-methods

The api-gen-methods call will generate the following methods for each of the +ApiEntity

1. -list-json
1. -add-json
1. -update-json
1. -del-json

# Scaffolding

Scaffolding is an optional way to enable and extend simple crud screens for entities. Scaffolding can be integrated into an app with custom screens as shown in https://github.com/joebo/pil-mithril-todo

# example app.l

    # this will reload after each request, not good for prod
    # (if *Dbg (daemon 'http (load "app.l")))


    (class +Tag +ApiEntity)
    (rel desc (+Need +String))
    (dm show> () (list
                  (cons "nr" (: nr) )
                  (cons "desc" (: desc) ) ) )

    (dm cho> ()  (cons "text" (: desc)))

    (class +Todo +ApiEntity)         # starts the entity definition
    (rel desc (+Need +String))
    (rel done (+Number))   # task status
    (rel tag (+Ref +Link) NIL (+Tag))

    (dm val> ()
        (if (: tag) (=: tag (extern (: tag)) ) )
        (=: done (or (: done) 0)) # sets done to be default 0
        (super))

    (dm show> ()
        (list (cons "nr" (: nr))
              (cons "desc" (: desc))
              (cons "done" (: done))
              (cons "tag" (pack (: tag)))
              (cons "tag-gui" (; (: tag ) desc) ) )) # gui output of tag key

    # generates (NIL (auth) (json-parse) (with (db-new-from-json '(+Todo)) (json-out "nr" (: nr))))
    (api-gen-methods '(+Todo +Tag))


# example app.js

Scaffolding can be extended with the following ScaffoldOptions methods

`buildTableCellHook` will override the default <span>value</span> and instead use the return value for the element

`buildInputHook` will override the form input value from the default input[type='text'] to the return value from the function

    //extend scaffold with checkbox for table
    ScaffoldOptions.buildTableCellHook = function(el, ctx) {
        if (ctx.table == '+Todo' && ctx.col == 'done') {
            el = m("input[type='checkbox'][disabled=disabled]", { checked: ctx.row.done() == 1 } );
        } 
        return el;
    }

    //extend scaffold with checkbox
    ScaffoldOptions.buildInputHook = function(el, ctx) {
        if (ctx.table == '+Todo' && ctx.col == 'done') {
            el = m("input[type='checkbox']", { checked: ctx.row.done() == 1, onclick: m.withAttr("checked", function(val) { ctx.row.done(val?1:0); }) } );
        } 
        return el;
    }



# auto refresh goodness

It can be helpful during development to have the page automatically refresh upon saving in a text editor. The following code added to index.html and emacs code will accomplish this

## index.html - refresh snippet
    <script>
    //used to auto-refresh on emacs file save as emacs has a websocket listener configured
    if (window.location.href.indexOf('localhost') >=0) {
        var ws = new WebSocket("ws://localhost:9999/asdasdf");
        ws.onopen = function(e) { console.log("opened"); }
        ws.onerror = function(e) { console.log("error"); }
        ws.onmessage = function(e) { console.log(e.data); window.location.reload(); }
    }
  </script>

## emacs - refresh snippet

    (add-to-list 'load-path "~/.emacs.d/emacs-websocket")
    (require 'websocket)
    (setq websocket-debug nil)
    (setq websocket-mask-frames nil)

    (setq ws-server (websocket-server 9999))

    (defvar websocket-save t)
    (defvar Socket nil)

    (defun refresh-save-hook ()
      (interactive)
      (if (and websocket-save Socket)
          (websocket-send-text Socket "foo")))

    (add-hook 'after-save-hook 'refresh-save-hook)


## picolisp autorefresh

    # this will reload after each request, not good for prod
    # (if *Dbg (daemon 'http (load "app.l")))
