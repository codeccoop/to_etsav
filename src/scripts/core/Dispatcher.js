const Dispatcher = (function () {
    // PRIVATE CODE BLOCK

    // PUBLIC OBJECT
    const Dispatcher = function (obj) {
        obj.dispatch = this.dispatch.bind(obj);
        obj.on = this.on.bind(obj);
        obj.off = this.off.bind(obj);
        obj.haltListeners = this.haltListeners.bind(obj);
        obj._eventBounds = new Map();
    };

    Dispatcher.prototype.on = function on (event, callback, context=null) {
        this._eventBounds.set(event, function (ev) {
            callback.call(context, ev.detail, ev);
        });
        this.el.addEventListener(event, this._eventBounds.get(event));
        return this;
    };

    Dispatcher.prototype.off = function off (event) {
        this.el.removeEventListener(event, this._eventBounds.get(event));
        return this;
    };

    Dispatcher.prototype.haltListeners = function halt () {
        for (let entry of this._eventBounds.entries()) {
            this.el.removeEventListener(...entry);
        }
    };

    Dispatcher.prototype.dispatch = function dispatch (event, data) {
        this.el.dispatchEvent(new CustomEvent(event, {
            detail: data
        }));
        return this;
    };

    return Dispatcher;
})();

module.exports = Dispatcher;
