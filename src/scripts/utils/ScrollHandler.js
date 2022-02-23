// SOURCE
const Dispatcher = require("../core/Dispatcher.js");

const ScrollHandler = (function() {
    // PRIVATE CODE BLOCK
    var dropWindow = function() {};

    function addWindow(el, callback) {
        const onWheel = (function(delta) {
            var lastTrigger = Date.now(),
                touchDelta = 0,
                lastTouch;
            return function() {
                if (event.type == "keydown") {
                    if (event.keyCode != 40 && event.keyCode != 38) return;
                    event.deltaY = event.keyCode === 38 ? -1 : 1;
                }
                if (event.type === "touchmove") {
                    touchDelta += lastTouch ? lastTouch - event.touches[0].clientY : 0;
                    if (Math.abs(touchDelta) > 200) {
                        event.deltaY = touchDelta * -1;
                        touchDelta = 0;
                        lastTouch = void 0;
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

        dropWindow = function() {
            window.removeEventListener("DOMMouseScroll", onWheel);
            window.removeEventListener("touchmove", onWheel);
            window.removeEventListener("keydown", onWheel);
            window.removeEventListener("wheel", onWheel);
            window.removeEventListener("mousewheel", onWheel);
        };
    }

    // PUBLIC OBJECT
    const ScrollHandler = function(app, disabled) {
        const self = this;
        new Dispatcher(this);
        this.app = app;
        this.el = this.app.el;
        this.sections = new Array();
        this.disabled = disabled;
        if (!this.disabled) {
            this.onWheel = this.onWheel.bind(this);
            this.onScroll = this.onScroll.bind(this);
            this.onResize = this.onResize.bind(this);
        }

        var currentSection = 0,
            tmpVal;
        Object.defineProperty(this, "currentSection", {
            set: function(val) {
                tmpVal = Math.max(0, Math.min(this.sections.length - 1, val));
                if (tmpVal == currentSection) return;
                currentSection = tmpVal;
                if (val !== null) {
                    window.scrollTo({
                        top: this.sections[currentSection].offsetTop,
                        behavior: "smooth",
                    });
                    if (this.disabled) this.syncURL(this.sections[currentSection].id);
                    this.dispatch("update:section", currentSection);
                } else {
                    window.scrollTo({
                        top: 0,
                        behavior: "auto",
                    });
                    // if (this.disabled) this.syncURL(this.sections[0].id);
                }
            },
            get: function() {
                return currentSection;
            },
        });

        Object.defineProperty(this, "isActive", {
            get: function() {
                return this.sections.length > 0;
            },
        });

        this.scrolling = false;
    };

    ScrollHandler.prototype.patch = function(targetSection, auto) {
        this.sections = Array.apply(
            null,
            document.getElementsByClassName("scroll-section")
        );
        if (auto) {
            window.scrollTo({
                top: this.sections[targetSection].offsetTop,
                behavior: "auto",
            });
        }
        this.currentSection = targetSection;
        addWindow(this.el, this.onWheel);
		if (!this.disabled) {
			window.addEventListener("scroll", this.onScroll);
			window.addEventListener("resize", this.onResize);
		}
        document.body.classList.add("fixed-viewport");
    };

    ScrollHandler.prototype.unpatch = function unpatch() {
        this.sections = new Array();
        dropWindow();
		if (!this.disabled) {
			window.removeEventListener("scroll", this.onScroll);
			window.removeEventListener("resize", this.onResize);
		}
        document.body.classList.remove("fixed-viewport");
        this.currentSection = null;
    };

    ScrollHandler.prototype.onWheel = function onWheel(ev) {
        if (this.scrolling) return;
        this.currentSection += ev.deltaY < 0 ? -1 : 1;
    };

    ScrollHandler.prototype.onScroll = function(ev) {
        this.scrolling = true;
        const targetEl = this.sections[this.currentSection];
        const bounding = targetEl.getBoundingClientRect();
        if (
            Math.abs(bounding.top) + Math.abs(window.innerHeight - bounding.bottom) ==
            0 ||
            // case when its on bottom of scroll
            window.scrollY === document.body.offsetHeight - window.innerHeight
        ) {
            this.scrolling = false;
            this.syncURL(targetEl.id);
            this.afterScroll(ev);
        }
    };

    ScrollHandler.prototype.afterScroll = function afterScroll(ev) {
        var bounding, fit, currentSection;
        this.sections.reduce(function(acum, section, i) {
            bounding = section.getBoundingClientRect();
            fit =
                Math.abs(bounding.top) + Math.abs(window.innerHeight - bounding.bottom);
            if (acum > fit) {
                currentSection = i;
                return fit;
            }
            return acum;
        }, Infinity);
        this.currentSection = currentSection;
    };

    ScrollHandler.prototype.onNavigate = function onNavigate() {
        this.app.router.isOnHome() ? this.patch(0) : this.unpatch();
    };

    ScrollHandler.prototype.onResize = function onResize() {
        window.scrollTo({
            top: this.isActive ? this.sections[this.currentSection].offsetTop : 0,
            behavior: "auto",
        });
    };

    ScrollHandler.prototype.syncURL = function syncURL(targetSection) {
        const targetURL = this.app.router.generate("home-section", {
            section: targetSection,
        });
        if (location.hash.replace(/\?.*$/, "") != targetURL)
            this.app.router.silentNavigation(targetURL);
    };

    return ScrollHandler;
})();

module.exports = ScrollHandler;
