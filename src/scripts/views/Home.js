// CORE
const BaseView = require("../core/BaseView.js");

const Home = (function () {

    const Home = BaseView.extend(function (el, template, data) {
        const self = this;
        if (!this.url.params || this.app.homeSections.map(d => d.id).indexOf(this.url.params.section) == -1) {
            this.app.router.silentNavigation("#home/cover");
            this.url.params = {
                section: "cover"
            };
        }

        this.fetchChilds(this.app.homeSections).then(function () {
            self.data.sections = self.app.homeSections;
        });
    });

    Home.prototype.onUpdate = function onUpdate () {
        this.render();
    };

    Home.prototype.beforeRender = function beforeRender () {
        this.app.header.setSections(this.data.sections);
    };

    Home.prototype.onRender = function onRender () {
        let currentSection, i = 0;
        for (let section of this.data.sections) {
            section._proto = section.view;
            section.view = new section.view(this.el.querySelector(`#${section.id}`), section.template, {
                app: this.app,
                name: section.id
            });
            if (section.id === this.url.params.section) {
                currentSection = i;
            }
            i++;
        }

        this.app.scroll.patch(currentSection);
        window.scrollTo({
            top: this.el.querySelector(`#${this.url.params.section}`).offsetTop,
            behavior: "auto"
        });
    };

    Home.prototype.beforeRemove = function beforeRemove () {
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
