const Lng = require("./utils/Lng.js");
const Router = require("./router/Router.js");
const ScrollHandler = require("./utils/ScrollHandler.js");

// COMPONENTS
const Header = require("./components/Header.js");
const Footer = require("./components/Footer.js");

function startLng (app) {
    return new Promise(function (done, err) {
        fetch(_env.apiURL + "lng.json").then(function (res) {
            res.json().then(function (dictionaries) {
                app.lng = new Lng(dictionaries);
                done(app);
            });
        });
    });
};

function startComponents (app) {
    return new Promise(function (done, err) {
        return Promise.all([
            fetch(_env.publicURL + "templates/components/header.html").then(function (res) {
                res.text().then(function (template) {
                    const el = document.querySelector("header");
                    app.header = new Header(el, template, {
                        app: app
                    });
                });
            }),
            fetch(_env.publicURL + "templates/components/footer.html").then(function (res) {
                res.text().then(function (template) {
                    const el = document.querySelector("footer");
                    app.footer = new Footer(el, template, {
                        app: app
                    });
                });
            })
        ]).then(function () {
            done(app);
        });
    });
};

function startApp (app) {
    return new Promise(function (done, error) {
        app.router = new Router(app).on(function () {
            app.router.navigate(app.router.generate("home-section", {
                section: "cover"
            }));
        });
        app.router.hooks({
            after: (function (count) {
                return function () {
                    count += 1;
                    if (count > 1) return;
                    done(app);
                };
            })(0)
        });
        app.router.resolve();
    });
};

function scrollPatch (app) {
    app.scroll= new ScrollHandler(app);
}

module.exports = function App () {
    const app = new Object();
    app.el = document.getElementById("app");
    new Promise(function (done, err) {
        done(app);
    }).then(startLng)
        .then(startComponents)
        .then(startApp)
        .then(scrollPatch);
};
