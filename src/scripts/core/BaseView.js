const Mustache = require("mustache");

const BaseView = (function () {

    /// PRIVATE BLOCK CODE
    function reactive (obj) {
        const self = this;
        return new Proxy(obj, {
            get: function (self, key) {
                return self[key];
            },
            set: function (obj, key, value) {
                const old = obj[key];
                const change = old !== value;
                if (typeof value === "object") {
                    value = reactive.call(self, value);
                }
                obj[key] = value;
                if (change) {
                    self.dispatch("update", {
                        key: key,
                        to: value,
                        from: old
                    });
                };
            }
        });
    }

    var privata_data;
    /// END OF PRIVATE BLOCK CODE

    const BaseView = function BaseView (el, template) {
        const self = this;
        this.el = el;
        this.template = template;
        
        private_data = reactive.call(this, new Object());
        Object.defineProperty(this, "data", {
            get: function () {
                return privata_data;
            },
            set: function (data) {
                privata_data = reactive.call(self, data);
                self.dispatch("update");
            }
        });

        this.eventBounds = new Map();
        this.on("before:render", this.beforeRender, this);
        this.on("render", this.onRender, this);
        this.on("before:remove", this.beforeRemove, this);
        this.on("remove", this.onRemove, this);
        this.on("before:update", this.beforeUpdate, this);
        this.on("update", this.onUpdate, this);
    }

    BaseView.prototype.render = function render () {
        this.dispatch("before:render", this.el);
        const renderer = document.createElement("template");
        renderer.innerHTML = Mustache.render(this.template, this.data);
        this.el.innerHTML = "";
        this.el.appendChild(renderer.content);
        this.dispatch("render", this.el);
        return this;
    }

    BaseView.prototype.remove = function remove () {
        this.dispatch("before:remove", this.el);
        for (let entry of this.eventBounds.entries()) {
            this.el.removeEventListener(...entry)
        }
        this.dispatch("remove", this.el);
        return this;
    }

    BaseView.prototype.beforeRender = function beforeRender () {
        // TO OVERWRITE
    }

    BaseView.prototype.onRender = function onRender () {
        // TO OVERWRITE
    }

    BaseView.prototype.beforeRemove = function beforeRemove () {
        // TO OVERWRITE
    }

    BaseView.prototype.onRemove = function onRemove () {
        // TO OVERWRITE
    }

    BaseView.prototype.beforeUpdate = function beforeUpdate () {
        // TO OVERWRITE
    }

    BaseView.prototype.onUpdate = function onUpdate () {
        // TO OVERWRITE
    }

    BaseView.prototype.on = function on (event, callback, context=null) {
        this.eventBounds.set(event, function (ev) {
            callback.call(context, event, ev.details, ev);
        });
        this.el.addEventListener(event, this.eventBounds.get(event));
        return this;
    }

    BaseView.prototype.off = function off (event) {
        this.el.removeEventListener(event, this.eventBounds.get(event));
        return this;
    }

    BaseView.prototype.dispatch = function dispatch (event, data) {
        this.el.dispatchEvent(new CustomEvent(event, {
            detail: data
        }));
        return this;
    }

    BaseView.prototype.load = function load (path, type, data) {
        const self = this;
        type = type || "GET";
        return new Promise(function (res, rej) {
            const ajax = new XMLHttpRequest();
            ajax.open(type, path);
            ajax.onreadystatechange = function () {
                if (this.readyState === 4) {
                    if (this.status === 200) {
                        res(this.response);
                    } else {
                        rej(this.status);
                    }
                }
            }
            ajax.send(data);
        });
    }

    BaseView.extend = function extend (Class) {
        const Wrapper = function (el, template) {
            BaseView.call(this, el, template);
            Class.call(this, el, template);
        }

        Class.prototype = Object.create(BaseView.prototype);
        Wrapper.prototype = Class.prototype;
        Wrapper.extend = BaseView.prototype.extend;
        return Wrapper
    }

    return BaseView;
})();

module.exports = BaseView;