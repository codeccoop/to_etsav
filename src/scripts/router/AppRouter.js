// COURE
const Router = require("../core/Router.js")

// ROUTES
const routes = require("./routes.js");


const AppRouter = (function () {
    // PRIVATE CODE BLOCK
    function clearContent (cssEl) {
        const el = document.querySelector(cssEl);
        if (el && this.views.get(el)) {
            this.views.get(el).remove();
        }
    }
    const cache = new Map();
    // END OF PRIVATE CODE BLOCK

    const AppRouter = function AppRouter (app) {
        Router.apply(this, arguments);

        const self = this;
        this.notFound(function (query) {
            self.views.forEach(function (view) {
                view.remove();
            });
            self.navigate("#home/cover");
        });
    };

    AppRouter.prototype = Object.create(Router.prototype);

    AppRouter.prototype.onNavigate = function onNavigate (
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

    AppRouter.prototype.isOnHome = function isOnHome () {
        const lastRoute = this.lastRouteResolved();
        return !lastRoute.name || lastRoute.name.indexOf("home") > -1;
    };

    return AppRouter;
})();

module.exports = AppRouter;
