const Injector = (function () {
    const Injector = function Injector () {
        this.parser = document.createElement("template");
        this.renders = new Map();
        this.url = 'templates/';
        this.ajax = new XMLHttpRequest();
    }

    Injector.prototype.render = function render (el, template, data) {
        const self = this;
        typeof template === "function" ? template : function () {return template};
        data = data || new Object();

        return new Promise(function (res, rej) {
            try {
                this.parser.innerHTML = template(data);
                el.innerHTML = "";
                el.appendChild(this.parser.content);
                res(el);
            } catch (err) {
                rej(err);
            }
        });
    }

    Injector.prototype.load = function load (template_name) {
        const self = this;
        return new Promise(function (res, rej) {
            self.ajax.open("GET", self.url + template_name);
            self.ajax.onreadystatechange = function () {
                if (this.readyState === 4) {
                    if (this.status === 200) {
                        res(this.response);
                    } else {
                        rej(this.status);
                    }
                }
            }
            self.ajax.send();
        });
        
    }

    return Injector;
})();

module.exports = Injector;