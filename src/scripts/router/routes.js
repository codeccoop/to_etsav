// VIEWS
const Home = require("../views/Home.js");
const Project = require("../views/Project.js");
const Gallery = require("../views/Gallery.js");
const Equip = require("../views/Equip.js");

module.exports = {
    "home": {
        as: "home",
        uses: {
            el: "#content",
            template: "home.html",
            view: Home
        }
    },
    "home/:section": {
        as: "home-section",
        uses: {
            el: "#content",
            template: "home.html",
            view: Home
        }
    },
    "project": {
        as: "project",
        uses: {
            el: "#content",
            template: "project.html",
            view: Project
        }
    },
    "gallery": {
        as: "gallery",
        uses: {
            el: "#content",
            template: "gallery.html",
            view: Gallery
        }
    },
    "team": {
        as: "team",
        uses: {
            el: "#content",
            template: "equip.html",
            view: Equip
        }
    }
}
