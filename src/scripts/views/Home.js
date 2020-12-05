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

        this.lazyLoadSectionBackground = this.lazyLoadSectionBackground.bind(this);
        this.app.scroll.on("update:section", this.lazyLoadSectionBackground);

        this.onMobileScroll = this.onMobileScroll.bind(this);
    });

    Home.prototype.onUpdate = function onUpdate () {
        this.render();
    };

    Home.prototype.beforeRender = function beforeRender () {
        this.app.header.setSections(this.data.sections);
        document.body.getElementsByTagName("footer")[0].classList.add("scroll-section");
    };

    Home.prototype.onRender = function onRender () {
        let currentSection, i = 0;
        for (let section of this.data.sections) {
            section._proto = section.view;
            section.view = new section.view(this.el.querySelector(`#${section.id}`), section.template, {
                app: this.app,
                name: section.id
            });
            section.view.el.classList.add("lazy");
            if (section.id === this.url.params.section) {
                currentSection = i;
                this.lazyLoadSectionBackground(i);
            } else {
                i++;
            }
        }

        this.app.scroll.patch(currentSection, true);

        this.el.querySelectorAll(".home__nav-btn").forEach(btn => {
            btn.addEventListener("click", this.onMobileScroll);
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

    Home.prototype.onRemove = function onRemove () {
        document.body.getElementsByTagName("footer")[0].classList.remove("scroll-section");
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

    Home.prototype.lazyLoadSectionBackground = function lazyLoadSectionBackground (section) {
        this.data.sections[section] && this.data.sections[section].view.el.classList.remove("lazy");
    };

    Home.prototype.onMobileScroll = function onMobileScroll (ev) {
        if (ev.currentTarget.getAttribute("dir") == "top") {
            this.app.scroll.currentSection--;
        } else {
            this.app.scroll.currentSection++;
        }
    };

    return Home;
})();

module.exports = Home;
