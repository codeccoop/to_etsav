const Injector = (function () {
    const _Injector = function () {
        this.parser = document.createElement("template");
        this.renders = new Map();
        this.url = window._env.staticURL + "templates/";
        Object.defineProperty(this, "ajax", {
            get: function () {
                return new XMLHttpRequest();
            }
        });
    }

    _Injector.prototype.render = function render (el, template, data) {
        const self = this;
        ftemplate = typeof template === "function" ? template : function () {return template};
        data = data || new Object();

        return new Promise(function (res, rej) {
            try {
                self.parser.innerHTML = ftemplate(data);
                el.innerHTML = "";
                el.appendChild(self.parser.content);
                res(el);
            } catch (err) {
                rej(err);
            }
        });
    }

    _Injector.prototype.load = function load (template_name) {
        const self = this;
        return new Promise(function (res, rej) {
            const ajax = self.ajax;
            ajax.open("GET", self.url + template_name);
            ajax.onreadystatechange = function () {
                if (this.readyState === 4) {
                    if (this.status === 200) {
                        res(this.response);
                    } else {
                        rej(this.status);
                    }
                }
            }
            ajax.send();
        });
        
    }

    return _Injector;
})();

module.exports = Injector;