// CORE
const BaseView = require("../core/BaseView.js");

// VIEWS
const Cover = require("./home-sections/Cover.js");
const Manifest = require("./home-sections/Manifest.js");
const Project = require("./home-sections/Project.js");
const Gallery = require("./home-sections/Gallery.js");
const Team = require("./home-sections/Team.js");
const Sponsors = require("./home-sections/Sponsors.js");
const Documents = require("./home-sections/Documents.js");


const Home = (function () {

    const Home = BaseView.extend(function (el, template, data) {
        const self = this;
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
        if (!this.url.params || sections.map(d => d.id).indexOf(this.url.params.section) == -1) {
            this.app.router.silent("#home/cover");
            this.url.params = {
                section: "cover"
            };
        }

        this.app.header.setSections(sections);
        this.fetchChilds(sections).then(function () {
            self.data.sections = sections;
        });
    });

    Home.prototype.onUpdate = function onUpdate () {
        this.render();
    };

    Home.prototype.onRender = function onRender () {
        for (let section of this.data.sections) {
            section._proto = section.view;
            section.view = new section.view(this.el.querySelector(`#${section.id}`), section.template, {
                app: this.app
            });
        }
        this.app.header.el.querySelector(`[link=${this.url.params.section}]`)
            .dispatchEvent(new CustomEvent("click", {
                detail: {
                    smooth: false
                }
            }));
        this.app.scroll.patch();
    };

    Home.prototype.beforeRemove = function onRemove () {
        const self = this;
        this.data.sections.forEach(function (section) {
            section.view.remove();
            section.view = section._proto;
        });
        this.app.scroll.unpatch();
    };

    Home.prototype.fetchChilds = function fetchChilds (sections) {
        const self = this;
        return Promise.all(sections.map(function (section) {
            return new Promise(function (done, error) {
                fetch(_env.publicURL + `templates/home-sections/${section.id}.html`)
                    .then(function (res) {
                        res.text().then(function (template) {
                            section.template = template;
                            done(section);
                        });
                    });
            });
        }));
    };

    return Home;
})();

module.exports = Home;
