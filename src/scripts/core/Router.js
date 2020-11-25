// VENDOR
const Navigo = require("navigo");

// ROUTES
const routes = require("../router/routes.js");

// SOURCE
const Dispatcher = require("../core/Dispatcher.js");


const Router = (function () {
    // PRIVATE CODE BLOCK
    function clearContent (cssEl) {
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

        this.ev = new Object();
        new Dispatcher(this.ev);

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

    Router.prototype.onNavigate = function onNavigate (
        templateName,
        cssEl,
        View,
        data
    ) {
        const self = this;
        data = data || new Object();
        return function (params, query) {
            if (self.silent === true) {
                self.silent = false;
                return;
            }
            if (cache.get(templateName)) {
                clearContent.call(self, cssEl);
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
                            clearContent.call(self, cssEl);
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

    Router.prototype.navigate = function navigate (route, absolute) {
        route = this.app.lng.onNavigate(route);
        Navigo.prototype.navigate.call(this, route, absolute);
    };

    Router.prototype.silentNavigation = function silent (route) {
        this.silent = true;
        this.navigate(route);
    };

    return Router;
})();

module.exports = Router;
