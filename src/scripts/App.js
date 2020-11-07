const Lng = require("./utils/Lng.js");
const Router = require("./router/Router.js");

// COMPONENTS
const Header = require("./components/Header.js");
const Footer = require("./components/Footer.js");

// VIEWS
const Cover = require("./views/home/Cover.js");
const Manifest = require("./views/home/Manifest.js");
const Project = require("./views/home/Project.js");
const Gallery = require("./views/home/Gallery.js");
const Team = require("./views/home/Team.js");
const Sponsors = require("./views/home/Sponsors.js");
const Documents = require("./views/home/Documents.js");

const sections = [
    {
        id: "cover",
        view: Cover,
    },
    {
        id: "manifest",
        view: Manifest
    },
    {
        id: "project",
        view: Project
    },
    {
        id: "gallery",
        view: Gallery
    },
    {
        id: "team",
        view: Team
    },
    {
        id: "sponsors",
        view: Sponsors
    },
    {
        id: "documents",
        view: Documents
    }
];

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
                        sections: sections,
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
    app.router = new Router(sections, app).on(function () {
        window.location.hash = "home";
    }).resolve();
};

module.exports = function () {
    const app = new Object();
    new Promise(function (done, err) {
        done(app);
    }).then(startLng)
        .then(startComponents)
        .then(startApp);
};
