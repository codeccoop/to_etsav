// VENDOR
const Mustache = require("mustache");

// SOURCE
const Dispatcher = require("./Dispatcher.js");


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
    };

    /// END OF PRIVATE BLOCK CODE

    const BaseView = function BaseView (el, template, data) {
        const self = this;
        new Dispatcher(this);
        this.el = el;
        this.template = template;
        data = data || new Object();

        this.app = data.app;
        this.url = data.url;
        this.query = data.query;
        delete data.url;
        delete data.query;
        delete data.app;

        var private_data = reactive.call(this, new Object());
        Object.defineProperty(this, "data", {
            get: function () {
                return private_data;
            },
            set: function (data) {
                private_data = reactive.call(self, data);
                self.dispatch("update");
            }
        });

        this.on("before:render", this.beforeRender, this);
        this.on("render", this.onRender, this);
        this.on("before:remove", this.beforeRemove, this);
        this.on("remove", this.onRemove, this);
        this.on("before:update", this.beforeUpdate, this);
        this.on("update", this.onUpdate, this);
    };

    BaseView.prototype.render = function render () {
        this.dispatch("before:render", this.el);
        const renderer = document.createElement("template");
        renderer.innerHTML = this.translate(Mustache.render(this.template, this.data));
        this.el.innerHTML = "";
        this.el.appendChild(renderer.content);
        this.content = render.content;
        this.dispatch("render", this.el);
        return this;
    };

    BaseView.prototype.remove = function remove () {
        this.dispatch("before:remove", this.el);
        this.el.innerHTML = "";
        delete this.data;
        this.dispatch("remove", this.el);
        this.haltListeners();
        return this;
    };

    BaseView.prototype.beforeRender = function beforeRender () {
        // TO OVERWRITE
    };

    BaseView.prototype.onRender = function onRender () {
        // TO OVERWRITE
    };

    BaseView.prototype.beforeRemove = function beforeRemove () {
        // TO OVERWRITE
    };

    BaseView.prototype.onRemove = function onRemove () {
        // TO OVERWRITE
    };

    BaseView.prototype.beforeUpdate = function beforeUpdate () {
        // TO OVERWRITE
    };

    BaseView.prototype.onUpdate = function onUpdate () {
        // TO OVERWRITE
    };

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
            };
            ajax.send(data);
        });
    };

    BaseView.extend = function extend (Class) {
        const Wrapper = function () {
            BaseView.apply(this, arguments);
            Class.apply(this, arguments);
        };

        Class.prototype = Object.create(BaseView.prototype);
        Wrapper.prototype = Class.prototype;
        Wrapper.extend = BaseView.prototype.extend;
        return Wrapper;
    };

    return BaseView;
})();

module.exports = BaseView;
