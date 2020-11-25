// SOURCE
const Dispatcher = require("../core/Dispatcher.js");


const ScrollHandler = (function() {
    // PRIVATE CODE BLOCK
    var dropWindow = function () {};
    function addWindow (el, callback) {
        const onWheel = (function (delta) {
            var lastTrigger = Date.now(),
                touchDelta = 0,
                lastTouch;
            return function () {
                if (event.type == "keydown") {
                    if (event.keyCode != 40 && event.keyCode != 38) return;
                    event.deltaY = event.keyCode === 38 ? -1 : 1;
                }
                if (event.type === "touchmove") {
                    touchDelta += lastTouch ? lastTouch - event.touches[0].clientY : 0;
                    if (Math.abs(touchDelta) > 200) {
                        event.deltaY = touchDelta * -1;
                        touchDelta = 0;
                        lastTouch = void(0);
                    } else {
                        lastTouch = event.touches[0].clientY;
                        return;
                    }
                }
                if (Date.now() - lastTrigger >= delta || event.type === "touchmove") {
                    callback.apply(null, arguments);
                    lastTrigger = Date.now();
                }
            };
        })(300);
        window.addEventListener("DOMMouseScroll", onWheel);
        window.addEventListener("touchmove", onWheel);
        window.addEventListener("keydown", onWheel);
        window.addEventListener("wheel", onWheel);
        window.addEventListener("mousewheel", onWheel);

        dropWindow = function () {
            window.removeEventListener("DOMMouseScroll", onWheel);
            window.removeEventListener("touchmove", onWheel);
            window.removeEventListener("keydown", onWheel);
            window.removeEventListener("wheel", onWheel);
            window.removeEventListener("mousewheel", onWheel);
        };
    }

    // PUBLIC OBJECT
    const ScrollHandler = function(app) {
        const self = this;
        new Dispatcher(this);
        this.app = app;
        this.el = this.app.el;
        this.sections = new Array();
        this.onWheel = this.onWheel.bind(this);
        this.onScroll = this.onScroll.bind(this);

        var currentSection = 0;
        Object.defineProperty(this, "currentSection", {
            set: function (val) {
                currentSection = Math.max(0, Math.min(this.sections.length - 1, val));
                self.dispatch("update:section", currentSection);
            },
            get: function () {
                return currentSection;
            }
        });

        this.scrolling = false;
    };

    ScrollHandler.prototype.patch = function (targetSection) {
        this.sections = Array.apply(null, document.getElementsByClassName("scroll-section"));
        this.currentSection = targetSection;
        addWindow(this.el, this.onWheel);
        window.addEventListener("scroll", this.onScroll);
        document.body.classList.add("fixed-viewport");
    };

    ScrollHandler.prototype.unpatch = function unpatch () {
        this.sections = new Array();
        dropWindow();
        window.removeEventListener("scroll", this.onScroll);
        document.body.classList.remove("fixed-viewport");
    };

    ScrollHandler.prototype.onWheel = function onWheel (ev) {
        if (this.scrolling) return;
        console.log(ev);
        this.currentSection += (ev.deltaY < 0 ? -1 : 1);
        window.scrollTo({
            top: this.sections[this.currentSection].offsetTop,
            behavior: "smooth"
        });
    };

    ScrollHandler.prototype.onScroll = function (ev) {
        this.scrolling = true;
        const targetEl = this.sections[this.currentSection];
        const bounding = targetEl.getBoundingClientRect();
        if (
            Math.abs(bounding.top) + Math.abs(window.innerHeight - bounding.bottom) == 0
            // case when its on bottom of scroll
                || window.scrollY === document.body.offsetHeight - window.innerHeight
        ) {
            this.scrolling = false;
            const targetURL = this.app.router.generate("home-section", {
                section: targetEl.id
            });
            if (location.hash.replace(/\?.*$/, '') != targetURL) this.app.router.silentNavigation(targetURL);
            this.afterScroll(ev);
        }
    };

    ScrollHandler.prototype.afterScroll = function afterScroll (ev) {
        var bounding, fit, currentSection;
        this.sections.reduce(function (acum, section, i) {
            bounding = section.getBoundingClientRect();
            fit = Math.abs(bounding.top) + Math.abs(window.innerHeight - bounding.bottom);
            if (acum > fit) {
                currentSection = i;
                return fit;
            }
            return acum;
        }, Infinity);
        this.currentSection = currentSection;
    };

    ScrollHandler.prototype.onNavigate = function onNavigate () {
        const isHome = this.app.router.lastRouteResolved().name.indexOf("home") > -1;
        isHome === true ? this.patch() : this.unpatch();
    };

    return ScrollHandler;
})();

module.exports = ScrollHandler;