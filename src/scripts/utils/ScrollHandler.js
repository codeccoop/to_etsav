const ScrollHandler = (function() {
    // PRIVATE CODE BLOCK
    function addWindow(el, callback) {
        document.body.style.overflow = "hidden";
        const onScroll = (function(delta) {
            var lastTrigger = Date.now();
            return function() {
                if (event.type == "keydown") {
                    if (event.keyCode != 40 && event.keyCode != 38) return;
                    event.deltaY = event.keyCode === 38 ? -1 : 1;
                }
                if (Date.now() - lastTrigger >= delta) {
                    callback.apply(null, arguments);
                    lastTrigger = Date.now();
                }
            };
        })(500);
        window.addEventListener("DOMMouseScroll", onScroll);
        window.addEventListener("touchmove", onScroll);
        window.addEventListener("keydown", onScroll);
        window.addEventListener("wheel", onScroll);
        window.addEventListener("mousewheel", onScroll);
    }

    // PUBLIC OBJECT
    const ScrollHandler = function(el, sections) {
        const self = this;
        this.el = el;
        this.sections = Array.apply(null, sections);
        this.onScroll = this.onScroll.bind(this);
        var currentSection = 0;
        Object.defineProperty(this, "currentSection", {
            set: function (val) {
                currentSection = Math.max(0, Math.min(this.sections.length - 1, val));
            },
            get: function () {
                return currentSection;
            }
        });
        this.scrolling = false;
        window.addEventListener("scroll", (function () {
            var lastTrigger = Date.now();
            return function () {
                if (Date.now() - lastTrigger < 200) return;
                if (!self.scrolling) {
                    console.log("scroll");
                    setTimeout(function () {
                    }, 800);
                }
                lastTrigger = Date.now();
            };
        })());
    };

    ScrollHandler.prototype.patch = function() {
        addWindow(this.el, this.onScroll);
    };

    ScrollHandler.prototype.onScroll = function(ev) {
        const self = this;
        this.currentSection += (ev.deltaY < 0 ? -1 : 1);
        this.scrolling = true;
        window.scrollTo({
            top: this.sections[this.currentSection].offsetTop,
            behavior: "smooth"
        });
        setTimeout(function () {
            self.scrolling = false;
        }, 600);
    };

    return ScrollHandler;
})();

module.exports = ScrollHandler;
