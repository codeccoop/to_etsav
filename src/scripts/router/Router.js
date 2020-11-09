// VENDOR
const Navigo = require("navigo");

// ROUTES
const routes = require("./routes.js");


const Router = (function() {
    // PRIVATE CODE BLOCK
    function beforeNavigate (cssEl) {
        const el = document.querySelector(cssEl);
        if (el && this.views.get(el)) {
            this.views.get(el).remove();
        }
    }
    const cache = new Map();
    // END OF PRIVATE CODE BLOCK

    const Router = function Router (app) {
        Navigo.call(this, null, true, "#");

        const self = this;
        this.app = app;
        this.views = new Map();

        this.onNavigate = this.onNavigate.bind(this);
        this.on(this.parseRoutes(routes));

        this.notFound(function (query) {
            self.views.forEach(function (view) {
                view.remove();
            });
            self.navigate("#home/cover");
        });
    };

    Router.prototype = Object.create(Navigo.prototype);

    Router.prototype.parseRoutes = function parseRoutes (routes) {
        const self = this;
        return Object.keys(routes).reduce(function (acum, route) {
            acum[route] = routes[route];
            acum[route].uses = self.onNavigate(
                acum[route].uses.template,
                acum[route].uses.el,
                acum[route].uses.view,
                acum[route].uses.data
            );
            return acum;
        }, new Object());
    };

    Router.prototype.onNavigate = function onNavigate(
        templateName,
        cssEl,
        View,
        data
    ) {
        const self = this;
        data = data || new Object();
        return function (params, query) {
            if (self._silent === true) {
                self._silent = false;
                return;
            }
            if (cache.get(templateName)) {
                beforeNavigate.call(self, cssEl);
                const el = document.querySelector(cssEl);
                const view = new View(
                    el,
                    cache.get(templateName),
                    Object.assign(data, {
                        app: self.app,
                        url: {
                            params: params,
                            query: query
                        }
                    })
                );
                self.views.set(el, view);
            } else {
                fetch(_env.publicURL + "templates/" + templateName)
                    .then(function (res) {
                        res.text().then(function (template) {
                            cache.set(templateName, template);
                            beforeNavigate.call(self, cssEl);
                            const el = document.querySelector(cssEl);
                            const view = new View(
                                el,
                                template,
                                Object.assign(data, {
                                    app: self.app,
                                    url: {
                                        params: params,
                                        query: query
                                    }
                                })
                            );
                            self.views.set(el, view);
                    });
                });
            }
        };
    };

    Router.prototype.beforeNavigate = function beforeNavigate (route) {
        return this.app.lng.beforeNavigate(route);
    };

    Router.prototype.navigate = function navigate (route, absolute) {
        route = this.beforeNavigate(route);
        Navigo.prototype.navigate.call(this, route, absolute)
    };

    Router.prototype.silent = function silent (route) {
        this._silent = true;
        this.navigate(route);
    };

    return Router;
})();

module.exports = Router;
