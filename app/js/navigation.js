var navigation = function() {
    this.controller = function() {
        this.logout = function() {
            session.setKey(null);
            session.setName(null);
            m.route("/login")
        }
    }
    this.view = function(ctrl) {
        return [
            m.if(session.key,[
                m("div[class='column column-50'][id='navbar']",[
                    m("a", {href: '/scaffold',  text:"Admin", config: m.route}),
                    m("a", {href: '/logout', onclick: ctrl.logout, text:"Log Out", config: m.route})
                ]),
                m("div[class='column column-50']", m("h6", "Welcome back " + session.name))
            ])
        ];
              
    }
}
