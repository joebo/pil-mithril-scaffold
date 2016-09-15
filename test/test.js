//node_modules/mocha/bin/mocha watch.js tmp/ -w

var jsdom = require("jsdom");
var request = require("request");
var expect = require('chai').expect;

var URL = "http://localhost:8088/index.html";

describe('app', function() {
    var self = this;
    var suiteGlobals = { }
    
    before(function(done) {
        var virtualConsole = jsdom.createVirtualConsole().sendTo(console);
        virtualConsole.on("log", function (message) {
            console.log("console.log called ->", message);
        });

        jsdom.env({
            url: URL,
            resourceLoader: function (resource, callback) {
                //return resource.defaultFetch(callback);
                //using a new request object instead of the jsdom one... errors with ECONRESET otherwise
                request({uri: resource.url.href}, function(error, response, body) {
                    callback(null, body);
                });

            },
            virtualConsole: virtualConsole,
            features: {
                FetchExternalResources: ["script"],
                ProcessExternalResources: ["script"],
                SkipExternalResources: false
            },
            created: function(error, win) {
                //stub to prevent error
                console.log(error);
                win.scrollTo = function() {};
            },
            done: function (err, win) {
                if (err) { console.log(err) }
                self.window = win;
                global.win = win;
                done();
            },
            agentOptions: { keepAlive: false, keepAliveMsecs: 0 }
            //pool: null
            //proxy: "http://192.168.2.36:8888"
        });
    });

    it('should not log in on bad username/password', function(done) {
        win.document.location.hash = '#/';
        var l = new win.login();
        l.vm.username("admin");
        l.vm.password("BADPASS");
        var controller = new l.controller();
        controller.login().then(function(json) {
            setTimeout(function() {
                expect(l.msg()).to.have.string('invalid');
                expect(win.document.location.hash).to.be.equal('#/');
                done();
            },10);
            
        });
    });

    it('should log in', function(done) {
        //win.document.location.hash = '#/';
        var l = new win.login();
        l.vm.username("admin");
        l.vm.password("admin");
        var controller = new l.controller();
        controller.login().then(function(json) {
            //console.log(win.session.key);
            setTimeout(function() {
                //expect(win.document.location.hash).to.be.equal('#/todo');
                done();
            },10);
            
        });
    });
});

