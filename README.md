# Router Tablao App

A light web application boilerplate based on on the historyAPI and the hash url to handle state modifications. 

With two dependencies, **navigo** for the router and **mustache** for the templates, the proposed framework relay on the *MVC* pattern; with the router rolling the controller role, and the views rolling an hybrid role that aggregates responsabilities of the *MV* components of the *MVC* especification. It's designed to be little imperative, non-blackbox, and with broad delegation on the developer, who is the responsible of the biggest part when structure code.

#### Repository structure
```
root
|   tablaorc.js         ## Configuration file for the tablao CLI.
|   envs.js             ## Configuration file where our client environment variables may be defined.
|   README.md           ## Description of the boilerplate.
└───globals             ## Folder with global variables declared for each required compilation environment.
|   global.dev.js       ## Development global variables.
└───public              ## Folder to save documents, data an any kind of worthy files related to the project and required by the client.
|   └───data            ## Folder where our static data (json, csv, xml...) files will be placed.
|   └───templates       ## Folder where our templates will be placed.
|   └───images          ## Folder where our images will be placed.
|   └───fonts           ## Folder where our fonts will be placed.
└───src                 ## Folder where all our app source will be placed.
    |   index.html      ## index.html is our index file.
    |   index.js        ## index.js is our index file for our JS scripts.
    |   index.css       ## index.css is our index file for our Stylus stylesheets.
    └───scripts         ## Folder where our js scripts will be placed.
    |   |   app.js      ## JS application module.
    |   └───components  ## JS component modules of the application. 
    |   └───core        ## JS modules with basic functionalities.
    |   └───router      ## JS modules for the router tasks.
    |   └───views       ## JS view modules of the application.
    └───styles          ## Folder where our stylus scripts will be placed.
        |   app.styl    ## Stylesheet for the application module.
        └───components  ## Stylesheets for the components.
        └───reset       ## Stylesheets with basic style rules and variables.
        └───views       ## Stylesheets for the views.
```

### API

#### BaseView

The **BaseView** is the blueprint of all the application views/components. On top of prototypes, the static method `extend` leads to an easy, pseudo class inheritance, way to extend this blueprint to create new views with reutilization.
```javascript
new BaseView(el: HTMLNode, template: string);
```

**extend**
```javascript
BaseView.extend(view: function);
```
This method is a static method, not to be inherit on the child views, and allow to extend new views with the BaseView attributes. It waits for an view function as an input parametter.

```javascript
// Example about how to extend a new View prototype from the BaseView prototype.
const View = BaseView.extend(function (el, template) {
    // Do something on the initialization
});

View.prototype.onRender = function () {
    // Do something on render
}

View.prototype.customMethod = function () {
    // Do something
}
```

**render**
```javascript
BaseView.prototype.render();
```
Call this method to fire the injection process of the view inside its root *el*.

**remove**
```javascript
BaseView.prototype.remove();
```
Call this method to fire the dettach process of the view from its root *el*. When the view was removed, it perform an unbinding of all its listeners initialized with the method **on**.

**on**
```javascript
BaseView.prototype.on(event: string, callback: function);
```
Bind a custom event to the view with a callback function to be executed each time the event is dispatched.

**off**
```javascript
BaseView.prototype.off(event: string);
```
Remove an existing bind between arraound an event on the view.

**dispatch**
```javascript
BaseView.prototype.dispatch(event: string, [data: object]);
```
Manual dispatching of a custom event.

**load**
```javascript
BaseView.prototype.load(url: string, [type: string], [data: string]);
```
Load performs an ajax request.

##### To overwrite on inheritance
The following methods are designed to be overwriten on the inheritane moment and allow structured access to the view lifecycle.

**onRender**
```javascript
BaseView.prototype.onRender();
```

**beforeRender**
```javascript
BaseView.prototype.beforeRender();
```

**onUpdate**
```javascript
BaseView.prototype.onUpdate();
```

**beforeUpdate**
```javascript
BaseView.prototype.onUpdate();
```

**onRemove**
```javascript
BaseView.prototype.onRemove();
```

**beforeRemove**
```javascript
BaseView.prototype.onRemove();
```

#### Router

See [Navigo](https://github.com/krasimir/navigo) to more references.