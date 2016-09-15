var login = function() {
    var msg = m.prop("Welcome, please log in below.");

    var vm = {
        username : m.prop(""),
        password : m.prop("")
    };

    this.vm = vm;
    this.msg = msg;

    this.controller = function() {
        this.login = function() {
            return xhr.post("!user-auth",vm).then(function(json) {
                if (json.session) {
                    session.setKey(json.session);
                    session.setName(vm.username());
                    m.route("/scaffold"); //default route to admin
                }
                else {
                    msg("invalid username / password");
                }
            });
        };
    };

    this.view = function(c) {
        return [
            m("div", msg()),
            m("label", "username"),
            m("input[type='text']", { onchange: m.withAttr("value", vm.username) }),
            m("label", "password"),
            m("input[type='password']", { onchange: m.withAttr("value", vm.password) }),
            m("button", { onclick: c.login }, "Log In")
        ];
    };
}
