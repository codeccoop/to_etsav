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

module.exports = function startApp () {
    new Router(sections).on(function () {
        window.location.hash = "home";
    }).resolve();

    fetch(_env.publicURL + "templates/components/header.html").then(function (res) {
        res.text().then(function (template) {
            const el = document.querySelector("header");
            const view = new Header(el, template, sections);
        });
    });

    fetch(_env.publicURL + "templates/components/footer.html").then(function (res) {
        res.text().then(function (template) {
            const el = document.querySelector("footer");
            const view = new Footer(el, template);
        });
    });
};
