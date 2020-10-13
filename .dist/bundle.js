(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
// This file has been generated from mustache.mjs
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = global || self, global.Mustache = factory());
}(this, (function () { 'use strict';

  /*!
   * mustache.js - Logic-less {{mustache}} templates with JavaScript
   * http://github.com/janl/mustache.js
   */

  var objectToString = Object.prototype.toString;
  var isArray = Array.isArray || function isArrayPolyfill (object) {
    return objectToString.call(object) === '[object Array]';
  };

  function isFunction (object) {
    return typeof object === 'function';
  }

  /**
   * More correct typeof string handling array
   * which normally returns typeof 'object'
   */
  function typeStr (obj) {
    return isArray(obj) ? 'array' : typeof obj;
  }

  function escapeRegExp (string) {
    return string.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, '\\$&');
  }

  /**
   * Null safe way of checking whether or not an object,
   * including its prototype, has a given property
   */
  function hasProperty (obj, propName) {
    return obj != null && typeof obj === 'object' && (propName in obj);
  }

  /**
   * Safe way of detecting whether or not the given thing is a primitive and
   * whether it has the given property
   */
  function primitiveHasOwnProperty (primitive, propName) {
    return (
      primitive != null
      && typeof primitive !== 'object'
      && primitive.hasOwnProperty
      && primitive.hasOwnProperty(propName)
    );
  }

  // Workaround for https://issues.apache.org/jira/browse/COUCHDB-577
  // See https://github.com/janl/mustache.js/issues/189
  var regExpTest = RegExp.prototype.test;
  function testRegExp (re, string) {
    return regExpTest.call(re, string);
  }

  var nonSpaceRe = /\S/;
  function isWhitespace (string) {
    return !testRegExp(nonSpaceRe, string);
  }

  var entityMap = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
    '/': '&#x2F;',
    '`': '&#x60;',
    '=': '&#x3D;'
  };

  function escapeHtml (string) {
    return String(string).replace(/[&<>"'`=\/]/g, function fromEntityMap (s) {
      return entityMap[s];
    });
  }

  var whiteRe = /\s*/;
  var spaceRe = /\s+/;
  var equalsRe = /\s*=/;
  var curlyRe = /\s*\}/;
  var tagRe = /#|\^|\/|>|\{|&|=|!/;

  /**
   * Breaks up the given `template` string into a tree of tokens. If the `tags`
   * argument is given here it must be an array with two string values: the
   * opening and closing tags used in the template (e.g. [ "<%", "%>" ]). Of
   * course, the default is to use mustaches (i.e. mustache.tags).
   *
   * A token is an array with at least 4 elements. The first element is the
   * mustache symbol that was used inside the tag, e.g. "#" or "&". If the tag
   * did not contain a symbol (i.e. {{myValue}}) this element is "name". For
   * all text that appears outside a symbol this element is "text".
   *
   * The second element of a token is its "value". For mustache tags this is
   * whatever else was inside the tag besides the opening symbol. For text tokens
   * this is the text itself.
   *
   * The third and fourth elements of the token are the start and end indices,
   * respectively, of the token in the original template.
   *
   * Tokens that are the root node of a subtree contain two more elements: 1) an
   * array of tokens in the subtree and 2) the index in the original template at
   * which the closing tag for that section begins.
   *
   * Tokens for partials also contain two more elements: 1) a string value of
   * indendation prior to that tag and 2) the index of that tag on that line -
   * eg a value of 2 indicates the partial is the third tag on this line.
   */
  function parseTemplate (template, tags) {
    if (!template)
      return [];
    var lineHasNonSpace = false;
    var sections = [];     // Stack to hold section tokens
    var tokens = [];       // Buffer to hold the tokens
    var spaces = [];       // Indices of whitespace tokens on the current line
    var hasTag = false;    // Is there a {{tag}} on the current line?
    var nonSpace = false;  // Is there a non-space char on the current line?
    var indentation = '';  // Tracks indentation for tags that use it
    var tagIndex = 0;      // Stores a count of number of tags encountered on a line

    // Strips all whitespace tokens array for the current line
    // if there was a {{#tag}} on it and otherwise only space.
    function stripSpace () {
      if (hasTag && !nonSpace) {
        while (spaces.length)
          delete tokens[spaces.pop()];
      } else {
        spaces = [];
      }

      hasTag = false;
      nonSpace = false;
    }

    var openingTagRe, closingTagRe, closingCurlyRe;
    function compileTags (tagsToCompile) {
      if (typeof tagsToCompile === 'string')
        tagsToCompile = tagsToCompile.split(spaceRe, 2);

      if (!isArray(tagsToCompile) || tagsToCompile.length !== 2)
        throw new Error('Invalid tags: ' + tagsToCompile);

      openingTagRe = new RegExp(escapeRegExp(tagsToCompile[0]) + '\\s*');
      closingTagRe = new RegExp('\\s*' + escapeRegExp(tagsToCompile[1]));
      closingCurlyRe = new RegExp('\\s*' + escapeRegExp('}' + tagsToCompile[1]));
    }

    compileTags(tags || mustache.tags);

    var scanner = new Scanner(template);

    var start, type, value, chr, token, openSection;
    while (!scanner.eos()) {
      start = scanner.pos;

      // Match any text between tags.
      value = scanner.scanUntil(openingTagRe);

      if (value) {
        for (var i = 0, valueLength = value.length; i < valueLength; ++i) {
          chr = value.charAt(i);

          if (isWhitespace(chr)) {
            spaces.push(tokens.length);
            indentation += chr;
          } else {
            nonSpace = true;
            lineHasNonSpace = true;
            indentation += ' ';
          }

          tokens.push([ 'text', chr, start, start + 1 ]);
          start += 1;

          // Check for whitespace on the current line.
          if (chr === '\n') {
            stripSpace();
            indentation = '';
            tagIndex = 0;
            lineHasNonSpace = false;
          }
        }
      }

      // Match the opening tag.
      if (!scanner.scan(openingTagRe))
        break;

      hasTag = true;

      // Get the tag type.
      type = scanner.scan(tagRe) || 'name';
      scanner.scan(whiteRe);

      // Get the tag value.
      if (type === '=') {
        value = scanner.scanUntil(equalsRe);
        scanner.scan(equalsRe);
        scanner.scanUntil(closingTagRe);
      } else if (type === '{') {
        value = scanner.scanUntil(closingCurlyRe);
        scanner.scan(curlyRe);
        scanner.scanUntil(closingTagRe);
        type = '&';
      } else {
        value = scanner.scanUntil(closingTagRe);
      }

      // Match the closing tag.
      if (!scanner.scan(closingTagRe))
        throw new Error('Unclosed tag at ' + scanner.pos);

      if (type == '>') {
        token = [ type, value, start, scanner.pos, indentation, tagIndex, lineHasNonSpace ];
      } else {
        token = [ type, value, start, scanner.pos ];
      }
      tagIndex++;
      tokens.push(token);

      if (type === '#' || type === '^') {
        sections.push(token);
      } else if (type === '/') {
        // Check section nesting.
        openSection = sections.pop();

        if (!openSection)
          throw new Error('Unopened section "' + value + '" at ' + start);

        if (openSection[1] !== value)
          throw new Error('Unclosed section "' + openSection[1] + '" at ' + start);
      } else if (type === 'name' || type === '{' || type === '&') {
        nonSpace = true;
      } else if (type === '=') {
        // Set the tags for the next time around.
        compileTags(value);
      }
    }

    stripSpace();

    // Make sure there are no open sections when we're done.
    openSection = sections.pop();

    if (openSection)
      throw new Error('Unclosed section "' + openSection[1] + '" at ' + scanner.pos);

    return nestTokens(squashTokens(tokens));
  }

  /**
   * Combines the values of consecutive text tokens in the given `tokens` array
   * to a single token.
   */
  function squashTokens (tokens) {
    var squashedTokens = [];

    var token, lastToken;
    for (var i = 0, numTokens = tokens.length; i < numTokens; ++i) {
      token = tokens[i];

      if (token) {
        if (token[0] === 'text' && lastToken && lastToken[0] === 'text') {
          lastToken[1] += token[1];
          lastToken[3] = token[3];
        } else {
          squashedTokens.push(token);
          lastToken = token;
        }
      }
    }

    return squashedTokens;
  }

  /**
   * Forms the given array of `tokens` into a nested tree structure where
   * tokens that represent a section have two additional items: 1) an array of
   * all tokens that appear in that section and 2) the index in the original
   * template that represents the end of that section.
   */
  function nestTokens (tokens) {
    var nestedTokens = [];
    var collector = nestedTokens;
    var sections = [];

    var token, section;
    for (var i = 0, numTokens = tokens.length; i < numTokens; ++i) {
      token = tokens[i];

      switch (token[0]) {
        case '#':
        case '^':
          collector.push(token);
          sections.push(token);
          collector = token[4] = [];
          break;
        case '/':
          section = sections.pop();
          section[5] = token[2];
          collector = sections.length > 0 ? sections[sections.length - 1][4] : nestedTokens;
          break;
        default:
          collector.push(token);
      }
    }

    return nestedTokens;
  }

  /**
   * A simple string scanner that is used by the template parser to find
   * tokens in template strings.
   */
  function Scanner (string) {
    this.string = string;
    this.tail = string;
    this.pos = 0;
  }

  /**
   * Returns `true` if the tail is empty (end of string).
   */
  Scanner.prototype.eos = function eos () {
    return this.tail === '';
  };

  /**
   * Tries to match the given regular expression at the current position.
   * Returns the matched text if it can match, the empty string otherwise.
   */
  Scanner.prototype.scan = function scan (re) {
    var match = this.tail.match(re);

    if (!match || match.index !== 0)
      return '';

    var string = match[0];

    this.tail = this.tail.substring(string.length);
    this.pos += string.length;

    return string;
  };

  /**
   * Skips all text until the given regular expression can be matched. Returns
   * the skipped string, which is the entire tail if no match can be made.
   */
  Scanner.prototype.scanUntil = function scanUntil (re) {
    var index = this.tail.search(re), match;

    switch (index) {
      case -1:
        match = this.tail;
        this.tail = '';
        break;
      case 0:
        match = '';
        break;
      default:
        match = this.tail.substring(0, index);
        this.tail = this.tail.substring(index);
    }

    this.pos += match.length;

    return match;
  };

  /**
   * Represents a rendering context by wrapping a view object and
   * maintaining a reference to the parent context.
   */
  function Context (view, parentContext) {
    this.view = view;
    this.cache = { '.': this.view };
    this.parent = parentContext;
  }

  /**
   * Creates a new context using the given view with this context
   * as the parent.
   */
  Context.prototype.push = function push (view) {
    return new Context(view, this);
  };

  /**
   * Returns the value of the given name in this context, traversing
   * up the context hierarchy if the value is absent in this context's view.
   */
  Context.prototype.lookup = function lookup (name) {
    var cache = this.cache;

    var value;
    if (cache.hasOwnProperty(name)) {
      value = cache[name];
    } else {
      var context = this, intermediateValue, names, index, lookupHit = false;

      while (context) {
        if (name.indexOf('.') > 0) {
          intermediateValue = context.view;
          names = name.split('.');
          index = 0;

          /**
           * Using the dot notion path in `name`, we descend through the
           * nested objects.
           *
           * To be certain that the lookup has been successful, we have to
           * check if the last object in the path actually has the property
           * we are looking for. We store the result in `lookupHit`.
           *
           * This is specially necessary for when the value has been set to
           * `undefined` and we want to avoid looking up parent contexts.
           *
           * In the case where dot notation is used, we consider the lookup
           * to be successful even if the last "object" in the path is
           * not actually an object but a primitive (e.g., a string, or an
           * integer), because it is sometimes useful to access a property
           * of an autoboxed primitive, such as the length of a string.
           **/
          while (intermediateValue != null && index < names.length) {
            if (index === names.length - 1)
              lookupHit = (
                hasProperty(intermediateValue, names[index])
                || primitiveHasOwnProperty(intermediateValue, names[index])
              );

            intermediateValue = intermediateValue[names[index++]];
          }
        } else {
          intermediateValue = context.view[name];

          /**
           * Only checking against `hasProperty`, which always returns `false` if
           * `context.view` is not an object. Deliberately omitting the check
           * against `primitiveHasOwnProperty` if dot notation is not used.
           *
           * Consider this example:
           * ```
           * Mustache.render("The length of a football field is {{#length}}{{length}}{{/length}}.", {length: "100 yards"})
           * ```
           *
           * If we were to check also against `primitiveHasOwnProperty`, as we do
           * in the dot notation case, then render call would return:
           *
           * "The length of a football field is 9."
           *
           * rather than the expected:
           *
           * "The length of a football field is 100 yards."
           **/
          lookupHit = hasProperty(context.view, name);
        }

        if (lookupHit) {
          value = intermediateValue;
          break;
        }

        context = context.parent;
      }

      cache[name] = value;
    }

    if (isFunction(value))
      value = value.call(this.view);

    return value;
  };

  /**
   * A Writer knows how to take a stream of tokens and render them to a
   * string, given a context. It also maintains a cache of templates to
   * avoid the need to parse the same template twice.
   */
  function Writer () {
    this.templateCache = {
      _cache: {},
      set: function set (key, value) {
        this._cache[key] = value;
      },
      get: function get (key) {
        return this._cache[key];
      },
      clear: function clear () {
        this._cache = {};
      }
    };
  }

  /**
   * Clears all cached templates in this writer.
   */
  Writer.prototype.clearCache = function clearCache () {
    if (typeof this.templateCache !== 'undefined') {
      this.templateCache.clear();
    }
  };

  /**
   * Parses and caches the given `template` according to the given `tags` or
   * `mustache.tags` if `tags` is omitted,  and returns the array of tokens
   * that is generated from the parse.
   */
  Writer.prototype.parse = function parse (template, tags) {
    var cache = this.templateCache;
    var cacheKey = template + ':' + (tags || mustache.tags).join(':');
    var isCacheEnabled = typeof cache !== 'undefined';
    var tokens = isCacheEnabled ? cache.get(cacheKey) : undefined;

    if (tokens == undefined) {
      tokens = parseTemplate(template, tags);
      isCacheEnabled && cache.set(cacheKey, tokens);
    }
    return tokens;
  };

  /**
   * High-level method that is used to render the given `template` with
   * the given `view`.
   *
   * The optional `partials` argument may be an object that contains the
   * names and templates of partials that are used in the template. It may
   * also be a function that is used to load partial templates on the fly
   * that takes a single argument: the name of the partial.
   *
   * If the optional `tags` argument is given here it must be an array with two
   * string values: the opening and closing tags used in the template (e.g.
   * [ "<%", "%>" ]). The default is to mustache.tags.
   */
  Writer.prototype.render = function render (template, view, partials, tags) {
    var tokens = this.parse(template, tags);
    var context = (view instanceof Context) ? view : new Context(view, undefined);
    return this.renderTokens(tokens, context, partials, template, tags);
  };

  /**
   * Low-level method that renders the given array of `tokens` using
   * the given `context` and `partials`.
   *
   * Note: The `originalTemplate` is only ever used to extract the portion
   * of the original template that was contained in a higher-order section.
   * If the template doesn't use higher-order sections, this argument may
   * be omitted.
   */
  Writer.prototype.renderTokens = function renderTokens (tokens, context, partials, originalTemplate, tags) {
    var buffer = '';

    var token, symbol, value;
    for (var i = 0, numTokens = tokens.length; i < numTokens; ++i) {
      value = undefined;
      token = tokens[i];
      symbol = token[0];

      if (symbol === '#') value = this.renderSection(token, context, partials, originalTemplate);
      else if (symbol === '^') value = this.renderInverted(token, context, partials, originalTemplate);
      else if (symbol === '>') value = this.renderPartial(token, context, partials, tags);
      else if (symbol === '&') value = this.unescapedValue(token, context);
      else if (symbol === 'name') value = this.escapedValue(token, context);
      else if (symbol === 'text') value = this.rawValue(token);

      if (value !== undefined)
        buffer += value;
    }

    return buffer;
  };

  Writer.prototype.renderSection = function renderSection (token, context, partials, originalTemplate) {
    var self = this;
    var buffer = '';
    var value = context.lookup(token[1]);

    // This function is used to render an arbitrary template
    // in the current context by higher-order sections.
    function subRender (template) {
      return self.render(template, context, partials);
    }

    if (!value) return;

    if (isArray(value)) {
      for (var j = 0, valueLength = value.length; j < valueLength; ++j) {
        buffer += this.renderTokens(token[4], context.push(value[j]), partials, originalTemplate);
      }
    } else if (typeof value === 'object' || typeof value === 'string' || typeof value === 'number') {
      buffer += this.renderTokens(token[4], context.push(value), partials, originalTemplate);
    } else if (isFunction(value)) {
      if (typeof originalTemplate !== 'string')
        throw new Error('Cannot use higher-order sections without the original template');

      // Extract the portion of the original template that the section contains.
      value = value.call(context.view, originalTemplate.slice(token[3], token[5]), subRender);

      if (value != null)
        buffer += value;
    } else {
      buffer += this.renderTokens(token[4], context, partials, originalTemplate);
    }
    return buffer;
  };

  Writer.prototype.renderInverted = function renderInverted (token, context, partials, originalTemplate) {
    var value = context.lookup(token[1]);

    // Use JavaScript's definition of falsy. Include empty arrays.
    // See https://github.com/janl/mustache.js/issues/186
    if (!value || (isArray(value) && value.length === 0))
      return this.renderTokens(token[4], context, partials, originalTemplate);
  };

  Writer.prototype.indentPartial = function indentPartial (partial, indentation, lineHasNonSpace) {
    var filteredIndentation = indentation.replace(/[^ \t]/g, '');
    var partialByNl = partial.split('\n');
    for (var i = 0; i < partialByNl.length; i++) {
      if (partialByNl[i].length && (i > 0 || !lineHasNonSpace)) {
        partialByNl[i] = filteredIndentation + partialByNl[i];
      }
    }
    return partialByNl.join('\n');
  };

  Writer.prototype.renderPartial = function renderPartial (token, context, partials, tags) {
    if (!partials) return;

    var value = isFunction(partials) ? partials(token[1]) : partials[token[1]];
    if (value != null) {
      var lineHasNonSpace = token[6];
      var tagIndex = token[5];
      var indentation = token[4];
      var indentedValue = value;
      if (tagIndex == 0 && indentation) {
        indentedValue = this.indentPartial(value, indentation, lineHasNonSpace);
      }
      return this.renderTokens(this.parse(indentedValue, tags), context, partials, indentedValue, tags);
    }
  };

  Writer.prototype.unescapedValue = function unescapedValue (token, context) {
    var value = context.lookup(token[1]);
    if (value != null)
      return value;
  };

  Writer.prototype.escapedValue = function escapedValue (token, context) {
    var value = context.lookup(token[1]);
    if (value != null)
      return mustache.escape(value);
  };

  Writer.prototype.rawValue = function rawValue (token) {
    return token[1];
  };

  var mustache = {
    name: 'mustache.js',
    version: '4.0.1',
    tags: [ '{{', '}}' ],
    clearCache: undefined,
    escape: undefined,
    parse: undefined,
    render: undefined,
    Scanner: undefined,
    Context: undefined,
    Writer: undefined,
    /**
     * Allows a user to override the default caching strategy, by providing an
     * object with set, get and clear methods. This can also be used to disable
     * the cache by setting it to the literal `undefined`.
     */
    set templateCache (cache) {
      defaultWriter.templateCache = cache;
    },
    /**
     * Gets the default or overridden caching object from the default writer.
     */
    get templateCache () {
      return defaultWriter.templateCache;
    }
  };

  // All high-level mustache.* functions use this writer.
  var defaultWriter = new Writer();

  /**
   * Clears all cached templates in the default writer.
   */
  mustache.clearCache = function clearCache () {
    return defaultWriter.clearCache();
  };

  /**
   * Parses and caches the given template in the default writer and returns the
   * array of tokens it contains. Doing this ahead of time avoids the need to
   * parse templates on the fly as they are rendered.
   */
  mustache.parse = function parse (template, tags) {
    return defaultWriter.parse(template, tags);
  };

  /**
   * Renders the `template` with the given `view` and `partials` using the
   * default writer. If the optional `tags` argument is given here it must be an
   * array with two string values: the opening and closing tags used in the
   * template (e.g. [ "<%", "%>" ]). The default is to mustache.tags.
   */
  mustache.render = function render (template, view, partials, tags) {
    if (typeof template !== 'string') {
      throw new TypeError('Invalid template! Template should be a "string" ' +
                          'but "' + typeStr(template) + '" was given as the first ' +
                          'argument for mustache#render(template, view, partials)');
    }

    return defaultWriter.render(template, view, partials, tags);
  };

  // Export the escaping function so that the user may override it.
  // See https://github.com/janl/mustache.js/issues/244
  mustache.escape = escapeHtml;

  // Export these mainly for testing, but also for advanced usage.
  mustache.Scanner = Scanner;
  mustache.Context = Context;
  mustache.Writer = Writer;

  return mustache;

})));

},{}],2:[function(require,module,exports){
!function(e,t){"object"==typeof exports&&"undefined"!=typeof module?module.exports=t():"function"==typeof define&&define.amd?define(t):e.Navigo=t()}(this,function(){"use strict";var e="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e};function t(){return!("undefined"==typeof window||!window.history||!window.history.pushState)}function n(e,n,o){this.root=null,this._routes=[],this._useHash=n,this._hash=void 0===o?"#":o,this._paused=!1,this._destroyed=!1,this._lastRouteResolved=null,this._notFoundHandler=null,this._defaultHandler=null,this._usePushState=!n&&t(),this._onLocationChange=this._onLocationChange.bind(this),this._genericHooks=null,this._historyAPIUpdateMethod="pushState",e?this.root=n?e.replace(/\/$/,"/"+this._hash):e.replace(/\/$/,""):n&&(this.root=this._cLoc().split(this._hash)[0].replace(/\/$/,"/"+this._hash)),this._listen(),this.updatePageLinks()}function o(e){return e instanceof RegExp?e:e.replace(/\/+$/,"").replace(/^\/+/,"^/")}function i(e){return e.replace(/\/$/,"").split("/").length}function s(e,t){return i(t)-i(e)}function r(e,t){return function(e){return(arguments.length>1&&void 0!==arguments[1]?arguments[1]:[]).map(function(t){var i=function(e){var t=[];return{regexp:e instanceof RegExp?e:new RegExp(e.replace(n.PARAMETER_REGEXP,function(e,o,i){return t.push(i),n.REPLACE_VARIABLE_REGEXP}).replace(n.WILDCARD_REGEXP,n.REPLACE_WILDCARD)+n.FOLLOWED_BY_SLASH_REGEXP,n.MATCH_REGEXP_FLAGS),paramNames:t}}(o(t.route)),s=i.regexp,r=i.paramNames,a=e.replace(/^\/+/,"/").match(s),h=function(e,t){return 0===t.length?null:e?e.slice(1,e.length).reduce(function(e,n,o){return null===e&&(e={}),e[t[o]]=decodeURIComponent(n),e},null):null}(a,r);return!!a&&{match:a,route:t,params:h}}).filter(function(e){return e})}(e,t)[0]||!1}function a(e,t){var n=t.map(function(t){return""===t.route||"*"===t.route?e:e.split(new RegExp(t.route+"($|/)"))[0]}),i=o(e);return n.length>1?n.reduce(function(e,t){return e.length>t.length&&(e=t),e},n[0]):1===n.length?n[0]:i}function h(e,n,o){var i,s=function(e){return e.split(/\?(.*)?$/)[0]};return void 0===o&&(o="#"),t()&&!n?s(e).split(o)[0]:(i=e.split(o)).length>1?s(i[1]):s(i[0])}function u(t,n,o){if(n&&"object"===(void 0===n?"undefined":e(n))){if(n.before)return void n.before(function(){(!(arguments.length>0&&void 0!==arguments[0])||arguments[0])&&(t(),n.after&&n.after(o))},o);if(n.after)return t(),void(n.after&&n.after(o))}t()}return n.prototype={helpers:{match:r,root:a,clean:o,getOnlyURL:h},navigate:function(e,t){var n;return e=e||"",this._usePushState?(n=(n=(t?"":this._getRoot()+"/")+e.replace(/^\/+/,"/")).replace(/([^:])(\/{2,})/g,"$1/"),history[this._historyAPIUpdateMethod]({},"",n),this.resolve()):"undefined"!=typeof window&&(e=e.replace(new RegExp("^"+this._hash),""),window.location.href=window.location.href.replace(/#$/,"").replace(new RegExp(this._hash+".*$"),"")+this._hash+e),this},on:function(){for(var t=this,n=arguments.length,o=Array(n),i=0;i<n;i++)o[i]=arguments[i];if("function"==typeof o[0])this._defaultHandler={handler:o[0],hooks:o[1]};else if(o.length>=2)if("/"===o[0]){var r=o[1];"object"===e(o[1])&&(r=o[1].uses),this._defaultHandler={handler:r,hooks:o[2]}}else this._add(o[0],o[1],o[2]);else"object"===e(o[0])&&Object.keys(o[0]).sort(s).forEach(function(e){t.on(e,o[0][e])});return this},off:function(e){return null!==this._defaultHandler&&e===this._defaultHandler.handler?this._defaultHandler=null:null!==this._notFoundHandler&&e===this._notFoundHandler.handler&&(this._notFoundHandler=null),this._routes=this._routes.reduce(function(t,n){return n.handler!==e&&t.push(n),t},[]),this},notFound:function(e,t){return this._notFoundHandler={handler:e,hooks:t},this},resolve:function(e){var n,o,i=this,s=(e||this._cLoc()).replace(this._getRoot(),"");this._useHash&&(s=s.replace(new RegExp("^/"+this._hash),"/"));var a=function(e){return e.split(/\?(.*)?$/).slice(1).join("")}(e||this._cLoc()),l=h(s,this._useHash,this._hash);return!this._paused&&(this._lastRouteResolved&&l===this._lastRouteResolved.url&&a===this._lastRouteResolved.query?(this._lastRouteResolved.hooks&&this._lastRouteResolved.hooks.already&&this._lastRouteResolved.hooks.already(this._lastRouteResolved.params),!1):(o=r(l,this._routes))?(this._callLeave(),this._lastRouteResolved={url:l,query:a,hooks:o.route.hooks,params:o.params,name:o.route.name},n=o.route.handler,u(function(){u(function(){o.route.route instanceof RegExp?n.apply(void 0,o.match.slice(1,o.match.length)):n(o.params,a)},o.route.hooks,o.params,i._genericHooks)},this._genericHooks,o.params),o):this._defaultHandler&&(""===l||"/"===l||l===this._hash||function(e,n,o){if(t()&&!n)return!1;if(!e.match(o))return!1;var i=e.split(o);return i.length<2||""===i[1]}(l,this._useHash,this._hash))?(u(function(){u(function(){i._callLeave(),i._lastRouteResolved={url:l,query:a,hooks:i._defaultHandler.hooks},i._defaultHandler.handler(a)},i._defaultHandler.hooks)},this._genericHooks),!0):(this._notFoundHandler&&u(function(){u(function(){i._callLeave(),i._lastRouteResolved={url:l,query:a,hooks:i._notFoundHandler.hooks},i._notFoundHandler.handler(a)},i._notFoundHandler.hooks)},this._genericHooks),!1))},destroy:function(){this._routes=[],this._destroyed=!0,this._lastRouteResolved=null,this._genericHooks=null,clearTimeout(this._listeningInterval),"undefined"!=typeof window&&(window.removeEventListener("popstate",this._onLocationChange),window.removeEventListener("hashchange",this._onLocationChange))},updatePageLinks:function(){var e=this;"undefined"!=typeof document&&this._findLinks().forEach(function(t){t.hasListenerAttached||(t.addEventListener("click",function(n){if((n.ctrlKey||n.metaKey)&&"a"==n.target.tagName.toLowerCase())return!1;var o=e.getLinkPath(t);e._destroyed||(n.preventDefault(),e.navigate(o.replace(/\/+$/,"").replace(/^\/+/,"/")))}),t.hasListenerAttached=!0)})},generate:function(e){var t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{},n=this._routes.reduce(function(n,o){var i;if(o.name===e)for(i in n=o.route,t)n=n.toString().replace(":"+i,t[i]);return n},"");return this._useHash?this._hash+n:n},link:function(e){return this._getRoot()+e},pause:function(){var e=!(arguments.length>0&&void 0!==arguments[0])||arguments[0];this._paused=e,this._historyAPIUpdateMethod=e?"replaceState":"pushState"},resume:function(){this.pause(!1)},historyAPIUpdateMethod:function(e){return void 0===e?this._historyAPIUpdateMethod:(this._historyAPIUpdateMethod=e,e)},disableIfAPINotAvailable:function(){t()||this.destroy()},lastRouteResolved:function(){return this._lastRouteResolved},getLinkPath:function(e){return e.getAttribute("href")},hooks:function(e){this._genericHooks=e},_add:function(t){var n=arguments.length>1&&void 0!==arguments[1]?arguments[1]:null,o=arguments.length>2&&void 0!==arguments[2]?arguments[2]:null;return"string"==typeof t&&(t=encodeURI(t)),this._routes.push("object"===(void 0===n?"undefined":e(n))?{route:t,handler:n.uses,name:n.as,hooks:o||n.hooks}:{route:t,handler:n,hooks:o}),this._add},_getRoot:function(){return null!==this.root?this.root:(this.root=a(this._cLoc().split("?")[0],this._routes),this.root)},_listen:function(){var e=this;if(this._usePushState)window.addEventListener("popstate",this._onLocationChange);else if("undefined"!=typeof window&&"onhashchange"in window)window.addEventListener("hashchange",this._onLocationChange);else{var t=this._cLoc(),n=void 0,o=void 0;(o=function(){n=e._cLoc(),t!==n&&(t=n,e.resolve()),e._listeningInterval=setTimeout(o,200)})()}},_cLoc:function(){return"undefined"!=typeof window?void 0!==window.__NAVIGO_WINDOW_LOCATION_MOCK__?window.__NAVIGO_WINDOW_LOCATION_MOCK__:o(window.location.href):""},_findLinks:function(){return[].slice.call(document.querySelectorAll("[data-navigo]"))},_onLocationChange:function(){this.resolve()},_callLeave:function(){var e=this._lastRouteResolved;e&&e.hooks&&e.hooks.leave&&e.hooks.leave(e.params)}},n.PARAMETER_REGEXP=/([:*])(\w+)/g,n.WILDCARD_REGEXP=/\*/g,n.REPLACE_VARIABLE_REGEXP="([^/]+)",n.REPLACE_WILDCARD="(?:.*)",n.FOLLOWED_BY_SLASH_REGEXP="(?:/$|$)",n.MATCH_REGEXP_FLAGS="",n});


},{}],3:[function(require,module,exports){
const App = require('./scripts/App.js');


if (document.addEventListener) {
    document.addEventListener("DOMContentLoaded", App, false);
} else if (document.attachEvent) {
    document.attachEvent("onreadystatechange", App);
} else {
    window.onload = App;
}

},{"./scripts/App.js":4}],4:[function(require,module,exports){
const Router = require("./router/Router.js");

module.exports = function startApp () {
    new Router().on(function () {
        window.location.hash = "home";
    }).resolve();
}

},{"./router/Router.js":8}],5:[function(require,module,exports){
const BaseView = require("../core/BaseView.js");


const Footer = (function () {
    const Footer = BaseView.extend(function (el, template) {
        const self = this;
        this.render();
    });

    Footer.prototype.onRender = function onRender () {
        // TO OVERWRITE
    }

    return Footer;
})();

module.exports = Footer;
},{"../core/BaseView.js":7}],6:[function(require,module,exports){
const BaseView = require("../core/BaseView.js");


const Header = (function () {

    const Header = BaseView.extend(function (el, template) {
        const self = this;
        this.render();
    });

    Header.prototype.onRender = function onRender () {
        Array.apply(null, this.el.getElementsByClassName("header__link")).forEach(link => {
            link.addEventListener("click", function (ev) {
                ev.preventDefault();
                ev.stopPropagation();
                location.hash = this.children[0].getAttribute("href");
            });
        });
    }

    return Header;
})();

module.exports = Header;
},{"../core/BaseView.js":7}],7:[function(require,module,exports){
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
},{"mustache":1}],8:[function(require,module,exports){
// VENDOR
const Navigo = require("navigo");

// COMPONENTS
const Header = require("../components/Header.js");
const Footer = require("../components/Footer.js");

// VIEWS
const Home = require("../views/Home.js");
const Project = require("../views/Project.js");
const Documents = require("../views/Documents.js");
const Gallery = require("../views/Gallery.js");


const Router = (function () {
    // PRIVATE CODE BLOCK
    function beforeNavigate (cssEl) {
        const el = document.querySelector(cssEl);
        if (el && this.views.get(el)) {
            this.views.get(el).remove();
        }
    }
    const cache = new Map();
    // END OF PRIVATE CODE BLOCK
    
    const Router = function Router () {
        const self = this;
        this.views = new Map();
        this.navigo = new Navigo(null, true, "#");
    
        this.navigo.on("home", self.onNavigate("home.html", "#content", Home))
            .resolve();
    
        this.navigo.on("project", self.onNavigate("project.html", "#content", Project))
            .resolve();
    
        this.navigo.on("documents", self.onNavigate("documents.html", "#content", Documents))
            .resolve();

        this.navigo.on("gallery", self.onNavigate("gallery.html", "#content", Gallery))
            .resolve();

        self.ajax("templates/header.html").then(function (template) {
            const el = document.querySelector("header");
            const view = new Header(el, template);
            self.views.set(el, view);
        });
        
        self.ajax("templates/footer.html").then(function (template) {
            const el = document.querySelector("footer");
            const view = new Footer(el, template);
            self.views.set(el, view);
        });
    }

    Router.prototype.onNavigate = function onNavigate (templateName, cssEl, View) {
        const self = this;
        return function () {
            if (cache.get(templateName)) {
                beforeNavigate.call(self, cssEl);
                const el = document.querySelector(cssEl);
                const view = new View(el, cache.get(templateName));
                self.views.set(el, view);
            } else {
                self.ajax("templates/" + templateName)
                .then(function (template) {
                    cache.set(templateName, template);
                    beforeNavigate.call(self, cssEl);
                    const el = document.querySelector(cssEl);
                    const view = new View(el, template);
                    self.views.set(el, view);    
                });   
            }
        }
    }

    Router.prototype.ajax = function ajax (path) {
        return new Promise(function (res, rej) {
            var ajax = new XMLHttpRequest();
            ajax.open("GET", window._env.publicURL + path, true);
            ajax.onreadystatechange = function () {
                if (this.readyState === 4) {
                    if (this.status === 200) {
                        res(this.response);
                    } else {
                        rej(this);
                    }
                }
            }
            ajax.send();
        });
    }

    Router.prototype.on = function on () {
        return this.navigo.on.apply(this.navigo, arguments);
    }

    return Router;
})();

module.exports = Router;
},{"../components/Footer.js":5,"../components/Header.js":6,"../views/Documents.js":9,"../views/Gallery.js":10,"../views/Home.js":11,"../views/Project.js":12,"navigo":2}],9:[function(require,module,exports){
const BaseView = require("../core/BaseView.js");


const Documents = (function () {

    /// PRIVATE BLOCK CODE
    var renderCount = 0;
    /// END OF PRIVATE BLOCK CODE
    
    var Documents = function (el, template) {
        const self = this;
        this.load(_env.apiURL + "documents.json").then(function (response) { 
            // this == funció anonima
            // self == Documents
            self.data = JSON.parse(response);
        });
    };

    Documents = BaseView.extend(Documents);

    Documents.prototype.onUpdate = function onUpdate () {
        console.log("Documents updated");
        this.render();
    }

    Documents.prototype.onRender = function onRender () {
        const self = this;
        for (let doc of self.el.querySelectorAll(".doc-row")) {
            doc.addEventListener("click", self.onClickDocument);
        }
        // const list = document.createElement("ul");
        // self.data.forEach(function (doc) {
        //     var link = document.createElement("a");
        //     link.href = "statics/data/" + doc.file;
        //     link.setAttribute("target", "_blank");
        //     var listElement = document.createElement("li");
        //     listElement.innerText = doc.name;
        //     listElement.setAttribute("data-file", doc.file);
        //     link.appendChild(listElement);
        //     list.appendChild(link);
        // });
        // this.el.appendChild(list);
        console.log("Documents rendered");
    }

    Documents.prototype.onRemove = function onRemove () {
        for (let doc of self.el.querySelectorAll(".doc-row")) {
            doc.removeEventListener("click", self.onClickDocument);
        }
        console.log("Documents removed");
    }

    Documents.prototype.onClickDocument = function (ev) {
        window.open("statics/data/" + ev.currentTarget.dataset.file);
    }

    return Documents;
})();

module.exports = Documents;
},{"../core/BaseView.js":7}],10:[function(require,module,exports){
const BaseView = require("../core/BaseView.js");


const Gallery = (function () {

    /// PRIVATE BLOCK CODE
    var renderCount = 0;
    /// END OF PRIVATE BLOCK CODE
    
    var Gallery = function (el, template) {
        const self = this;
        this.load(_env.apiURL + "gallery_images.json").then(function (response) { 
            self.data = JSON.parse(response);
        });
    };

    Gallery = BaseView.extend(Gallery);

    Gallery.prototype.onUpdate = function onUpdate () {
        console.log("Gallery updated");
        this.render();
    }

    Gallery.prototype.onRender = function onRender () {
        const self = this;
        for (let img of self.el.querySelectorAll(".img-row")) {
            img.addEventListener("click", self.onClickImage);
        }
        console.log("Gallery rendered");
    }

    Gallery.prototype.onRemove = function onRemove () {
        for (let img of self.el.querySelectorAll(".img-row")) {
            img.removeEventListener("click", self.onClickImage);
        }
        console.log("Gallery removed");
    }

    Gallery.prototype.onClickImage = function (ev) {
        console.log("Has clicat sobre una imàtge!");
    }

    return Gallery;
})();

module.exports = Gallery;
},{"../core/BaseView.js":7}],11:[function(require,module,exports){
const BaseView = require("../core/BaseView.js");


const Home = (function () {
    const Home = BaseView.extend(function (el, template) {
        const self = this;
        this.render();
    });

    Home.prototype.onUpdate = function onUpdate () {
        console.log("Home updated");
    }

    Home.prototype.onRender = function onRender () {
        console.log("Home rendered");
    }

    Home.prototype.onRemove = function onRemove () {
        console.log("Home removed");
    }

    return Home;
})();

module.exports = Home;
},{"../core/BaseView.js":7}],12:[function(require,module,exports){
const BaseView = require("../core/BaseView.js");


const Project = (function () {
    const Project = BaseView.extend(function Project (el) {
        const self = this;
        this.render();
    });

    Project.prototype.onUpdate = function onUpdate () {
        console.log("Project updated");
    }

    Project.prototype.onRender = function onRender () {
        console.log("Project rendered");
    }

    Project.prototype.onRemove = function onRemove () {
        console.log("Project removed");
    }

    return Project;
})();

module.exports = Project;
},{"../core/BaseView.js":7}]},{},[3])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3Vzci9sb2NhbC9saWIvbm9kZV9tb2R1bGVzL3RhYmxhby9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwibm9kZV9tb2R1bGVzL211c3RhY2hlL211c3RhY2hlLmpzIiwibm9kZV9tb2R1bGVzL25hdmlnby9saWIvbmF2aWdvLm1pbi5qcyIsInNyYy9pbmRleC5qcyIsInNyYy9zY3JpcHRzL0FwcC5qcyIsInNyYy9zY3JpcHRzL2NvbXBvbmVudHMvRm9vdGVyLmpzIiwic3JjL3NjcmlwdHMvY29tcG9uZW50cy9IZWFkZXIuanMiLCJzcmMvc2NyaXB0cy9jb3JlL0Jhc2VWaWV3LmpzIiwic3JjL3NjcmlwdHMvcm91dGVyL1JvdXRlci5qcyIsInNyYy9zY3JpcHRzL3ZpZXdzL0RvY3VtZW50cy5qcyIsInNyYy9zY3JpcHRzL3ZpZXdzL0dhbGxlcnkuanMiLCJzcmMvc2NyaXB0cy92aWV3cy9Ib21lLmpzIiwic3JjL3NjcmlwdHMvdmlld3MvUHJvamVjdC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwdUJBO0FBQ0E7QUFDQTs7QUNGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCIvLyBUaGlzIGZpbGUgaGFzIGJlZW4gZ2VuZXJhdGVkIGZyb20gbXVzdGFjaGUubWpzXG4oZnVuY3Rpb24gKGdsb2JhbCwgZmFjdG9yeSkge1xuICB0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcgJiYgdHlwZW9mIG1vZHVsZSAhPT0gJ3VuZGVmaW5lZCcgPyBtb2R1bGUuZXhwb3J0cyA9IGZhY3RvcnkoKSA6XG4gIHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCA/IGRlZmluZShmYWN0b3J5KSA6XG4gIChnbG9iYWwgPSBnbG9iYWwgfHwgc2VsZiwgZ2xvYmFsLk11c3RhY2hlID0gZmFjdG9yeSgpKTtcbn0odGhpcywgKGZ1bmN0aW9uICgpIHsgJ3VzZSBzdHJpY3QnO1xuXG4gIC8qIVxuICAgKiBtdXN0YWNoZS5qcyAtIExvZ2ljLWxlc3Mge3ttdXN0YWNoZX19IHRlbXBsYXRlcyB3aXRoIEphdmFTY3JpcHRcbiAgICogaHR0cDovL2dpdGh1Yi5jb20vamFubC9tdXN0YWNoZS5qc1xuICAgKi9cblxuICB2YXIgb2JqZWN0VG9TdHJpbmcgPSBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nO1xuICB2YXIgaXNBcnJheSA9IEFycmF5LmlzQXJyYXkgfHwgZnVuY3Rpb24gaXNBcnJheVBvbHlmaWxsIChvYmplY3QpIHtcbiAgICByZXR1cm4gb2JqZWN0VG9TdHJpbmcuY2FsbChvYmplY3QpID09PSAnW29iamVjdCBBcnJheV0nO1xuICB9O1xuXG4gIGZ1bmN0aW9uIGlzRnVuY3Rpb24gKG9iamVjdCkge1xuICAgIHJldHVybiB0eXBlb2Ygb2JqZWN0ID09PSAnZnVuY3Rpb24nO1xuICB9XG5cbiAgLyoqXG4gICAqIE1vcmUgY29ycmVjdCB0eXBlb2Ygc3RyaW5nIGhhbmRsaW5nIGFycmF5XG4gICAqIHdoaWNoIG5vcm1hbGx5IHJldHVybnMgdHlwZW9mICdvYmplY3QnXG4gICAqL1xuICBmdW5jdGlvbiB0eXBlU3RyIChvYmopIHtcbiAgICByZXR1cm4gaXNBcnJheShvYmopID8gJ2FycmF5JyA6IHR5cGVvZiBvYmo7XG4gIH1cblxuICBmdW5jdGlvbiBlc2NhcGVSZWdFeHAgKHN0cmluZykge1xuICAgIHJldHVybiBzdHJpbmcucmVwbGFjZSgvW1xcLVxcW1xcXXt9KCkqKz8uLFxcXFxcXF4kfCNcXHNdL2csICdcXFxcJCYnKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBOdWxsIHNhZmUgd2F5IG9mIGNoZWNraW5nIHdoZXRoZXIgb3Igbm90IGFuIG9iamVjdCxcbiAgICogaW5jbHVkaW5nIGl0cyBwcm90b3R5cGUsIGhhcyBhIGdpdmVuIHByb3BlcnR5XG4gICAqL1xuICBmdW5jdGlvbiBoYXNQcm9wZXJ0eSAob2JqLCBwcm9wTmFtZSkge1xuICAgIHJldHVybiBvYmogIT0gbnVsbCAmJiB0eXBlb2Ygb2JqID09PSAnb2JqZWN0JyAmJiAocHJvcE5hbWUgaW4gb2JqKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTYWZlIHdheSBvZiBkZXRlY3Rpbmcgd2hldGhlciBvciBub3QgdGhlIGdpdmVuIHRoaW5nIGlzIGEgcHJpbWl0aXZlIGFuZFxuICAgKiB3aGV0aGVyIGl0IGhhcyB0aGUgZ2l2ZW4gcHJvcGVydHlcbiAgICovXG4gIGZ1bmN0aW9uIHByaW1pdGl2ZUhhc093blByb3BlcnR5IChwcmltaXRpdmUsIHByb3BOYW1lKSB7XG4gICAgcmV0dXJuIChcbiAgICAgIHByaW1pdGl2ZSAhPSBudWxsXG4gICAgICAmJiB0eXBlb2YgcHJpbWl0aXZlICE9PSAnb2JqZWN0J1xuICAgICAgJiYgcHJpbWl0aXZlLmhhc093blByb3BlcnR5XG4gICAgICAmJiBwcmltaXRpdmUuaGFzT3duUHJvcGVydHkocHJvcE5hbWUpXG4gICAgKTtcbiAgfVxuXG4gIC8vIFdvcmthcm91bmQgZm9yIGh0dHBzOi8vaXNzdWVzLmFwYWNoZS5vcmcvamlyYS9icm93c2UvQ09VQ0hEQi01NzdcbiAgLy8gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9qYW5sL211c3RhY2hlLmpzL2lzc3Vlcy8xODlcbiAgdmFyIHJlZ0V4cFRlc3QgPSBSZWdFeHAucHJvdG90eXBlLnRlc3Q7XG4gIGZ1bmN0aW9uIHRlc3RSZWdFeHAgKHJlLCBzdHJpbmcpIHtcbiAgICByZXR1cm4gcmVnRXhwVGVzdC5jYWxsKHJlLCBzdHJpbmcpO1xuICB9XG5cbiAgdmFyIG5vblNwYWNlUmUgPSAvXFxTLztcbiAgZnVuY3Rpb24gaXNXaGl0ZXNwYWNlIChzdHJpbmcpIHtcbiAgICByZXR1cm4gIXRlc3RSZWdFeHAobm9uU3BhY2VSZSwgc3RyaW5nKTtcbiAgfVxuXG4gIHZhciBlbnRpdHlNYXAgPSB7XG4gICAgJyYnOiAnJmFtcDsnLFxuICAgICc8JzogJyZsdDsnLFxuICAgICc+JzogJyZndDsnLFxuICAgICdcIic6ICcmcXVvdDsnLFxuICAgIFwiJ1wiOiAnJiMzOTsnLFxuICAgICcvJzogJyYjeDJGOycsXG4gICAgJ2AnOiAnJiN4NjA7JyxcbiAgICAnPSc6ICcmI3gzRDsnXG4gIH07XG5cbiAgZnVuY3Rpb24gZXNjYXBlSHRtbCAoc3RyaW5nKSB7XG4gICAgcmV0dXJuIFN0cmluZyhzdHJpbmcpLnJlcGxhY2UoL1smPD5cIidgPVxcL10vZywgZnVuY3Rpb24gZnJvbUVudGl0eU1hcCAocykge1xuICAgICAgcmV0dXJuIGVudGl0eU1hcFtzXTtcbiAgICB9KTtcbiAgfVxuXG4gIHZhciB3aGl0ZVJlID0gL1xccyovO1xuICB2YXIgc3BhY2VSZSA9IC9cXHMrLztcbiAgdmFyIGVxdWFsc1JlID0gL1xccyo9LztcbiAgdmFyIGN1cmx5UmUgPSAvXFxzKlxcfS87XG4gIHZhciB0YWdSZSA9IC8jfFxcXnxcXC98PnxcXHt8Jnw9fCEvO1xuXG4gIC8qKlxuICAgKiBCcmVha3MgdXAgdGhlIGdpdmVuIGB0ZW1wbGF0ZWAgc3RyaW5nIGludG8gYSB0cmVlIG9mIHRva2Vucy4gSWYgdGhlIGB0YWdzYFxuICAgKiBhcmd1bWVudCBpcyBnaXZlbiBoZXJlIGl0IG11c3QgYmUgYW4gYXJyYXkgd2l0aCB0d28gc3RyaW5nIHZhbHVlczogdGhlXG4gICAqIG9wZW5pbmcgYW5kIGNsb3NpbmcgdGFncyB1c2VkIGluIHRoZSB0ZW1wbGF0ZSAoZS5nLiBbIFwiPCVcIiwgXCIlPlwiIF0pLiBPZlxuICAgKiBjb3Vyc2UsIHRoZSBkZWZhdWx0IGlzIHRvIHVzZSBtdXN0YWNoZXMgKGkuZS4gbXVzdGFjaGUudGFncykuXG4gICAqXG4gICAqIEEgdG9rZW4gaXMgYW4gYXJyYXkgd2l0aCBhdCBsZWFzdCA0IGVsZW1lbnRzLiBUaGUgZmlyc3QgZWxlbWVudCBpcyB0aGVcbiAgICogbXVzdGFjaGUgc3ltYm9sIHRoYXQgd2FzIHVzZWQgaW5zaWRlIHRoZSB0YWcsIGUuZy4gXCIjXCIgb3IgXCImXCIuIElmIHRoZSB0YWdcbiAgICogZGlkIG5vdCBjb250YWluIGEgc3ltYm9sIChpLmUuIHt7bXlWYWx1ZX19KSB0aGlzIGVsZW1lbnQgaXMgXCJuYW1lXCIuIEZvclxuICAgKiBhbGwgdGV4dCB0aGF0IGFwcGVhcnMgb3V0c2lkZSBhIHN5bWJvbCB0aGlzIGVsZW1lbnQgaXMgXCJ0ZXh0XCIuXG4gICAqXG4gICAqIFRoZSBzZWNvbmQgZWxlbWVudCBvZiBhIHRva2VuIGlzIGl0cyBcInZhbHVlXCIuIEZvciBtdXN0YWNoZSB0YWdzIHRoaXMgaXNcbiAgICogd2hhdGV2ZXIgZWxzZSB3YXMgaW5zaWRlIHRoZSB0YWcgYmVzaWRlcyB0aGUgb3BlbmluZyBzeW1ib2wuIEZvciB0ZXh0IHRva2Vuc1xuICAgKiB0aGlzIGlzIHRoZSB0ZXh0IGl0c2VsZi5cbiAgICpcbiAgICogVGhlIHRoaXJkIGFuZCBmb3VydGggZWxlbWVudHMgb2YgdGhlIHRva2VuIGFyZSB0aGUgc3RhcnQgYW5kIGVuZCBpbmRpY2VzLFxuICAgKiByZXNwZWN0aXZlbHksIG9mIHRoZSB0b2tlbiBpbiB0aGUgb3JpZ2luYWwgdGVtcGxhdGUuXG4gICAqXG4gICAqIFRva2VucyB0aGF0IGFyZSB0aGUgcm9vdCBub2RlIG9mIGEgc3VidHJlZSBjb250YWluIHR3byBtb3JlIGVsZW1lbnRzOiAxKSBhblxuICAgKiBhcnJheSBvZiB0b2tlbnMgaW4gdGhlIHN1YnRyZWUgYW5kIDIpIHRoZSBpbmRleCBpbiB0aGUgb3JpZ2luYWwgdGVtcGxhdGUgYXRcbiAgICogd2hpY2ggdGhlIGNsb3NpbmcgdGFnIGZvciB0aGF0IHNlY3Rpb24gYmVnaW5zLlxuICAgKlxuICAgKiBUb2tlbnMgZm9yIHBhcnRpYWxzIGFsc28gY29udGFpbiB0d28gbW9yZSBlbGVtZW50czogMSkgYSBzdHJpbmcgdmFsdWUgb2ZcbiAgICogaW5kZW5kYXRpb24gcHJpb3IgdG8gdGhhdCB0YWcgYW5kIDIpIHRoZSBpbmRleCBvZiB0aGF0IHRhZyBvbiB0aGF0IGxpbmUgLVxuICAgKiBlZyBhIHZhbHVlIG9mIDIgaW5kaWNhdGVzIHRoZSBwYXJ0aWFsIGlzIHRoZSB0aGlyZCB0YWcgb24gdGhpcyBsaW5lLlxuICAgKi9cbiAgZnVuY3Rpb24gcGFyc2VUZW1wbGF0ZSAodGVtcGxhdGUsIHRhZ3MpIHtcbiAgICBpZiAoIXRlbXBsYXRlKVxuICAgICAgcmV0dXJuIFtdO1xuICAgIHZhciBsaW5lSGFzTm9uU3BhY2UgPSBmYWxzZTtcbiAgICB2YXIgc2VjdGlvbnMgPSBbXTsgICAgIC8vIFN0YWNrIHRvIGhvbGQgc2VjdGlvbiB0b2tlbnNcbiAgICB2YXIgdG9rZW5zID0gW107ICAgICAgIC8vIEJ1ZmZlciB0byBob2xkIHRoZSB0b2tlbnNcbiAgICB2YXIgc3BhY2VzID0gW107ICAgICAgIC8vIEluZGljZXMgb2Ygd2hpdGVzcGFjZSB0b2tlbnMgb24gdGhlIGN1cnJlbnQgbGluZVxuICAgIHZhciBoYXNUYWcgPSBmYWxzZTsgICAgLy8gSXMgdGhlcmUgYSB7e3RhZ319IG9uIHRoZSBjdXJyZW50IGxpbmU/XG4gICAgdmFyIG5vblNwYWNlID0gZmFsc2U7ICAvLyBJcyB0aGVyZSBhIG5vbi1zcGFjZSBjaGFyIG9uIHRoZSBjdXJyZW50IGxpbmU/XG4gICAgdmFyIGluZGVudGF0aW9uID0gJyc7ICAvLyBUcmFja3MgaW5kZW50YXRpb24gZm9yIHRhZ3MgdGhhdCB1c2UgaXRcbiAgICB2YXIgdGFnSW5kZXggPSAwOyAgICAgIC8vIFN0b3JlcyBhIGNvdW50IG9mIG51bWJlciBvZiB0YWdzIGVuY291bnRlcmVkIG9uIGEgbGluZVxuXG4gICAgLy8gU3RyaXBzIGFsbCB3aGl0ZXNwYWNlIHRva2VucyBhcnJheSBmb3IgdGhlIGN1cnJlbnQgbGluZVxuICAgIC8vIGlmIHRoZXJlIHdhcyBhIHt7I3RhZ319IG9uIGl0IGFuZCBvdGhlcndpc2Ugb25seSBzcGFjZS5cbiAgICBmdW5jdGlvbiBzdHJpcFNwYWNlICgpIHtcbiAgICAgIGlmIChoYXNUYWcgJiYgIW5vblNwYWNlKSB7XG4gICAgICAgIHdoaWxlIChzcGFjZXMubGVuZ3RoKVxuICAgICAgICAgIGRlbGV0ZSB0b2tlbnNbc3BhY2VzLnBvcCgpXTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHNwYWNlcyA9IFtdO1xuICAgICAgfVxuXG4gICAgICBoYXNUYWcgPSBmYWxzZTtcbiAgICAgIG5vblNwYWNlID0gZmFsc2U7XG4gICAgfVxuXG4gICAgdmFyIG9wZW5pbmdUYWdSZSwgY2xvc2luZ1RhZ1JlLCBjbG9zaW5nQ3VybHlSZTtcbiAgICBmdW5jdGlvbiBjb21waWxlVGFncyAodGFnc1RvQ29tcGlsZSkge1xuICAgICAgaWYgKHR5cGVvZiB0YWdzVG9Db21waWxlID09PSAnc3RyaW5nJylcbiAgICAgICAgdGFnc1RvQ29tcGlsZSA9IHRhZ3NUb0NvbXBpbGUuc3BsaXQoc3BhY2VSZSwgMik7XG5cbiAgICAgIGlmICghaXNBcnJheSh0YWdzVG9Db21waWxlKSB8fCB0YWdzVG9Db21waWxlLmxlbmd0aCAhPT0gMilcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIHRhZ3M6ICcgKyB0YWdzVG9Db21waWxlKTtcblxuICAgICAgb3BlbmluZ1RhZ1JlID0gbmV3IFJlZ0V4cChlc2NhcGVSZWdFeHAodGFnc1RvQ29tcGlsZVswXSkgKyAnXFxcXHMqJyk7XG4gICAgICBjbG9zaW5nVGFnUmUgPSBuZXcgUmVnRXhwKCdcXFxccyonICsgZXNjYXBlUmVnRXhwKHRhZ3NUb0NvbXBpbGVbMV0pKTtcbiAgICAgIGNsb3NpbmdDdXJseVJlID0gbmV3IFJlZ0V4cCgnXFxcXHMqJyArIGVzY2FwZVJlZ0V4cCgnfScgKyB0YWdzVG9Db21waWxlWzFdKSk7XG4gICAgfVxuXG4gICAgY29tcGlsZVRhZ3ModGFncyB8fCBtdXN0YWNoZS50YWdzKTtcblxuICAgIHZhciBzY2FubmVyID0gbmV3IFNjYW5uZXIodGVtcGxhdGUpO1xuXG4gICAgdmFyIHN0YXJ0LCB0eXBlLCB2YWx1ZSwgY2hyLCB0b2tlbiwgb3BlblNlY3Rpb247XG4gICAgd2hpbGUgKCFzY2FubmVyLmVvcygpKSB7XG4gICAgICBzdGFydCA9IHNjYW5uZXIucG9zO1xuXG4gICAgICAvLyBNYXRjaCBhbnkgdGV4dCBiZXR3ZWVuIHRhZ3MuXG4gICAgICB2YWx1ZSA9IHNjYW5uZXIuc2NhblVudGlsKG9wZW5pbmdUYWdSZSk7XG5cbiAgICAgIGlmICh2YWx1ZSkge1xuICAgICAgICBmb3IgKHZhciBpID0gMCwgdmFsdWVMZW5ndGggPSB2YWx1ZS5sZW5ndGg7IGkgPCB2YWx1ZUxlbmd0aDsgKytpKSB7XG4gICAgICAgICAgY2hyID0gdmFsdWUuY2hhckF0KGkpO1xuXG4gICAgICAgICAgaWYgKGlzV2hpdGVzcGFjZShjaHIpKSB7XG4gICAgICAgICAgICBzcGFjZXMucHVzaCh0b2tlbnMubGVuZ3RoKTtcbiAgICAgICAgICAgIGluZGVudGF0aW9uICs9IGNocjtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbm9uU3BhY2UgPSB0cnVlO1xuICAgICAgICAgICAgbGluZUhhc05vblNwYWNlID0gdHJ1ZTtcbiAgICAgICAgICAgIGluZGVudGF0aW9uICs9ICcgJztcbiAgICAgICAgICB9XG5cbiAgICAgICAgICB0b2tlbnMucHVzaChbICd0ZXh0JywgY2hyLCBzdGFydCwgc3RhcnQgKyAxIF0pO1xuICAgICAgICAgIHN0YXJ0ICs9IDE7XG5cbiAgICAgICAgICAvLyBDaGVjayBmb3Igd2hpdGVzcGFjZSBvbiB0aGUgY3VycmVudCBsaW5lLlxuICAgICAgICAgIGlmIChjaHIgPT09ICdcXG4nKSB7XG4gICAgICAgICAgICBzdHJpcFNwYWNlKCk7XG4gICAgICAgICAgICBpbmRlbnRhdGlvbiA9ICcnO1xuICAgICAgICAgICAgdGFnSW5kZXggPSAwO1xuICAgICAgICAgICAgbGluZUhhc05vblNwYWNlID0gZmFsc2U7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIE1hdGNoIHRoZSBvcGVuaW5nIHRhZy5cbiAgICAgIGlmICghc2Nhbm5lci5zY2FuKG9wZW5pbmdUYWdSZSkpXG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBoYXNUYWcgPSB0cnVlO1xuXG4gICAgICAvLyBHZXQgdGhlIHRhZyB0eXBlLlxuICAgICAgdHlwZSA9IHNjYW5uZXIuc2Nhbih0YWdSZSkgfHwgJ25hbWUnO1xuICAgICAgc2Nhbm5lci5zY2FuKHdoaXRlUmUpO1xuXG4gICAgICAvLyBHZXQgdGhlIHRhZyB2YWx1ZS5cbiAgICAgIGlmICh0eXBlID09PSAnPScpIHtcbiAgICAgICAgdmFsdWUgPSBzY2FubmVyLnNjYW5VbnRpbChlcXVhbHNSZSk7XG4gICAgICAgIHNjYW5uZXIuc2NhbihlcXVhbHNSZSk7XG4gICAgICAgIHNjYW5uZXIuc2NhblVudGlsKGNsb3NpbmdUYWdSZSk7XG4gICAgICB9IGVsc2UgaWYgKHR5cGUgPT09ICd7Jykge1xuICAgICAgICB2YWx1ZSA9IHNjYW5uZXIuc2NhblVudGlsKGNsb3NpbmdDdXJseVJlKTtcbiAgICAgICAgc2Nhbm5lci5zY2FuKGN1cmx5UmUpO1xuICAgICAgICBzY2FubmVyLnNjYW5VbnRpbChjbG9zaW5nVGFnUmUpO1xuICAgICAgICB0eXBlID0gJyYnO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdmFsdWUgPSBzY2FubmVyLnNjYW5VbnRpbChjbG9zaW5nVGFnUmUpO1xuICAgICAgfVxuXG4gICAgICAvLyBNYXRjaCB0aGUgY2xvc2luZyB0YWcuXG4gICAgICBpZiAoIXNjYW5uZXIuc2NhbihjbG9zaW5nVGFnUmUpKVxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1VuY2xvc2VkIHRhZyBhdCAnICsgc2Nhbm5lci5wb3MpO1xuXG4gICAgICBpZiAodHlwZSA9PSAnPicpIHtcbiAgICAgICAgdG9rZW4gPSBbIHR5cGUsIHZhbHVlLCBzdGFydCwgc2Nhbm5lci5wb3MsIGluZGVudGF0aW9uLCB0YWdJbmRleCwgbGluZUhhc05vblNwYWNlIF07XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0b2tlbiA9IFsgdHlwZSwgdmFsdWUsIHN0YXJ0LCBzY2FubmVyLnBvcyBdO1xuICAgICAgfVxuICAgICAgdGFnSW5kZXgrKztcbiAgICAgIHRva2Vucy5wdXNoKHRva2VuKTtcblxuICAgICAgaWYgKHR5cGUgPT09ICcjJyB8fCB0eXBlID09PSAnXicpIHtcbiAgICAgICAgc2VjdGlvbnMucHVzaCh0b2tlbik7XG4gICAgICB9IGVsc2UgaWYgKHR5cGUgPT09ICcvJykge1xuICAgICAgICAvLyBDaGVjayBzZWN0aW9uIG5lc3RpbmcuXG4gICAgICAgIG9wZW5TZWN0aW9uID0gc2VjdGlvbnMucG9wKCk7XG5cbiAgICAgICAgaWYgKCFvcGVuU2VjdGlvbilcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1Vub3BlbmVkIHNlY3Rpb24gXCInICsgdmFsdWUgKyAnXCIgYXQgJyArIHN0YXJ0KTtcblxuICAgICAgICBpZiAob3BlblNlY3Rpb25bMV0gIT09IHZhbHVlKVxuICAgICAgICAgIHRocm93IG5ldyBFcnJvcignVW5jbG9zZWQgc2VjdGlvbiBcIicgKyBvcGVuU2VjdGlvblsxXSArICdcIiBhdCAnICsgc3RhcnQpO1xuICAgICAgfSBlbHNlIGlmICh0eXBlID09PSAnbmFtZScgfHwgdHlwZSA9PT0gJ3snIHx8IHR5cGUgPT09ICcmJykge1xuICAgICAgICBub25TcGFjZSA9IHRydWU7XG4gICAgICB9IGVsc2UgaWYgKHR5cGUgPT09ICc9Jykge1xuICAgICAgICAvLyBTZXQgdGhlIHRhZ3MgZm9yIHRoZSBuZXh0IHRpbWUgYXJvdW5kLlxuICAgICAgICBjb21waWxlVGFncyh2YWx1ZSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgc3RyaXBTcGFjZSgpO1xuXG4gICAgLy8gTWFrZSBzdXJlIHRoZXJlIGFyZSBubyBvcGVuIHNlY3Rpb25zIHdoZW4gd2UncmUgZG9uZS5cbiAgICBvcGVuU2VjdGlvbiA9IHNlY3Rpb25zLnBvcCgpO1xuXG4gICAgaWYgKG9wZW5TZWN0aW9uKVxuICAgICAgdGhyb3cgbmV3IEVycm9yKCdVbmNsb3NlZCBzZWN0aW9uIFwiJyArIG9wZW5TZWN0aW9uWzFdICsgJ1wiIGF0ICcgKyBzY2FubmVyLnBvcyk7XG5cbiAgICByZXR1cm4gbmVzdFRva2VucyhzcXVhc2hUb2tlbnModG9rZW5zKSk7XG4gIH1cblxuICAvKipcbiAgICogQ29tYmluZXMgdGhlIHZhbHVlcyBvZiBjb25zZWN1dGl2ZSB0ZXh0IHRva2VucyBpbiB0aGUgZ2l2ZW4gYHRva2Vuc2AgYXJyYXlcbiAgICogdG8gYSBzaW5nbGUgdG9rZW4uXG4gICAqL1xuICBmdW5jdGlvbiBzcXVhc2hUb2tlbnMgKHRva2Vucykge1xuICAgIHZhciBzcXVhc2hlZFRva2VucyA9IFtdO1xuXG4gICAgdmFyIHRva2VuLCBsYXN0VG9rZW47XG4gICAgZm9yICh2YXIgaSA9IDAsIG51bVRva2VucyA9IHRva2Vucy5sZW5ndGg7IGkgPCBudW1Ub2tlbnM7ICsraSkge1xuICAgICAgdG9rZW4gPSB0b2tlbnNbaV07XG5cbiAgICAgIGlmICh0b2tlbikge1xuICAgICAgICBpZiAodG9rZW5bMF0gPT09ICd0ZXh0JyAmJiBsYXN0VG9rZW4gJiYgbGFzdFRva2VuWzBdID09PSAndGV4dCcpIHtcbiAgICAgICAgICBsYXN0VG9rZW5bMV0gKz0gdG9rZW5bMV07XG4gICAgICAgICAgbGFzdFRva2VuWzNdID0gdG9rZW5bM107XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgc3F1YXNoZWRUb2tlbnMucHVzaCh0b2tlbik7XG4gICAgICAgICAgbGFzdFRva2VuID0gdG9rZW47XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gc3F1YXNoZWRUb2tlbnM7XG4gIH1cblxuICAvKipcbiAgICogRm9ybXMgdGhlIGdpdmVuIGFycmF5IG9mIGB0b2tlbnNgIGludG8gYSBuZXN0ZWQgdHJlZSBzdHJ1Y3R1cmUgd2hlcmVcbiAgICogdG9rZW5zIHRoYXQgcmVwcmVzZW50IGEgc2VjdGlvbiBoYXZlIHR3byBhZGRpdGlvbmFsIGl0ZW1zOiAxKSBhbiBhcnJheSBvZlxuICAgKiBhbGwgdG9rZW5zIHRoYXQgYXBwZWFyIGluIHRoYXQgc2VjdGlvbiBhbmQgMikgdGhlIGluZGV4IGluIHRoZSBvcmlnaW5hbFxuICAgKiB0ZW1wbGF0ZSB0aGF0IHJlcHJlc2VudHMgdGhlIGVuZCBvZiB0aGF0IHNlY3Rpb24uXG4gICAqL1xuICBmdW5jdGlvbiBuZXN0VG9rZW5zICh0b2tlbnMpIHtcbiAgICB2YXIgbmVzdGVkVG9rZW5zID0gW107XG4gICAgdmFyIGNvbGxlY3RvciA9IG5lc3RlZFRva2VucztcbiAgICB2YXIgc2VjdGlvbnMgPSBbXTtcblxuICAgIHZhciB0b2tlbiwgc2VjdGlvbjtcbiAgICBmb3IgKHZhciBpID0gMCwgbnVtVG9rZW5zID0gdG9rZW5zLmxlbmd0aDsgaSA8IG51bVRva2VuczsgKytpKSB7XG4gICAgICB0b2tlbiA9IHRva2Vuc1tpXTtcblxuICAgICAgc3dpdGNoICh0b2tlblswXSkge1xuICAgICAgICBjYXNlICcjJzpcbiAgICAgICAgY2FzZSAnXic6XG4gICAgICAgICAgY29sbGVjdG9yLnB1c2godG9rZW4pO1xuICAgICAgICAgIHNlY3Rpb25zLnB1c2godG9rZW4pO1xuICAgICAgICAgIGNvbGxlY3RvciA9IHRva2VuWzRdID0gW107XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJy8nOlxuICAgICAgICAgIHNlY3Rpb24gPSBzZWN0aW9ucy5wb3AoKTtcbiAgICAgICAgICBzZWN0aW9uWzVdID0gdG9rZW5bMl07XG4gICAgICAgICAgY29sbGVjdG9yID0gc2VjdGlvbnMubGVuZ3RoID4gMCA/IHNlY3Rpb25zW3NlY3Rpb25zLmxlbmd0aCAtIDFdWzRdIDogbmVzdGVkVG9rZW5zO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgIGNvbGxlY3Rvci5wdXNoKHRva2VuKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gbmVzdGVkVG9rZW5zO1xuICB9XG5cbiAgLyoqXG4gICAqIEEgc2ltcGxlIHN0cmluZyBzY2FubmVyIHRoYXQgaXMgdXNlZCBieSB0aGUgdGVtcGxhdGUgcGFyc2VyIHRvIGZpbmRcbiAgICogdG9rZW5zIGluIHRlbXBsYXRlIHN0cmluZ3MuXG4gICAqL1xuICBmdW5jdGlvbiBTY2FubmVyIChzdHJpbmcpIHtcbiAgICB0aGlzLnN0cmluZyA9IHN0cmluZztcbiAgICB0aGlzLnRhaWwgPSBzdHJpbmc7XG4gICAgdGhpcy5wb3MgPSAwO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYHRydWVgIGlmIHRoZSB0YWlsIGlzIGVtcHR5IChlbmQgb2Ygc3RyaW5nKS5cbiAgICovXG4gIFNjYW5uZXIucHJvdG90eXBlLmVvcyA9IGZ1bmN0aW9uIGVvcyAoKSB7XG4gICAgcmV0dXJuIHRoaXMudGFpbCA9PT0gJyc7XG4gIH07XG5cbiAgLyoqXG4gICAqIFRyaWVzIHRvIG1hdGNoIHRoZSBnaXZlbiByZWd1bGFyIGV4cHJlc3Npb24gYXQgdGhlIGN1cnJlbnQgcG9zaXRpb24uXG4gICAqIFJldHVybnMgdGhlIG1hdGNoZWQgdGV4dCBpZiBpdCBjYW4gbWF0Y2gsIHRoZSBlbXB0eSBzdHJpbmcgb3RoZXJ3aXNlLlxuICAgKi9cbiAgU2Nhbm5lci5wcm90b3R5cGUuc2NhbiA9IGZ1bmN0aW9uIHNjYW4gKHJlKSB7XG4gICAgdmFyIG1hdGNoID0gdGhpcy50YWlsLm1hdGNoKHJlKTtcblxuICAgIGlmICghbWF0Y2ggfHwgbWF0Y2guaW5kZXggIT09IDApXG4gICAgICByZXR1cm4gJyc7XG5cbiAgICB2YXIgc3RyaW5nID0gbWF0Y2hbMF07XG5cbiAgICB0aGlzLnRhaWwgPSB0aGlzLnRhaWwuc3Vic3RyaW5nKHN0cmluZy5sZW5ndGgpO1xuICAgIHRoaXMucG9zICs9IHN0cmluZy5sZW5ndGg7XG5cbiAgICByZXR1cm4gc3RyaW5nO1xuICB9O1xuXG4gIC8qKlxuICAgKiBTa2lwcyBhbGwgdGV4dCB1bnRpbCB0aGUgZ2l2ZW4gcmVndWxhciBleHByZXNzaW9uIGNhbiBiZSBtYXRjaGVkLiBSZXR1cm5zXG4gICAqIHRoZSBza2lwcGVkIHN0cmluZywgd2hpY2ggaXMgdGhlIGVudGlyZSB0YWlsIGlmIG5vIG1hdGNoIGNhbiBiZSBtYWRlLlxuICAgKi9cbiAgU2Nhbm5lci5wcm90b3R5cGUuc2NhblVudGlsID0gZnVuY3Rpb24gc2NhblVudGlsIChyZSkge1xuICAgIHZhciBpbmRleCA9IHRoaXMudGFpbC5zZWFyY2gocmUpLCBtYXRjaDtcblxuICAgIHN3aXRjaCAoaW5kZXgpIHtcbiAgICAgIGNhc2UgLTE6XG4gICAgICAgIG1hdGNoID0gdGhpcy50YWlsO1xuICAgICAgICB0aGlzLnRhaWwgPSAnJztcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIDA6XG4gICAgICAgIG1hdGNoID0gJyc7XG4gICAgICAgIGJyZWFrO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgbWF0Y2ggPSB0aGlzLnRhaWwuc3Vic3RyaW5nKDAsIGluZGV4KTtcbiAgICAgICAgdGhpcy50YWlsID0gdGhpcy50YWlsLnN1YnN0cmluZyhpbmRleCk7XG4gICAgfVxuXG4gICAgdGhpcy5wb3MgKz0gbWF0Y2gubGVuZ3RoO1xuXG4gICAgcmV0dXJuIG1hdGNoO1xuICB9O1xuXG4gIC8qKlxuICAgKiBSZXByZXNlbnRzIGEgcmVuZGVyaW5nIGNvbnRleHQgYnkgd3JhcHBpbmcgYSB2aWV3IG9iamVjdCBhbmRcbiAgICogbWFpbnRhaW5pbmcgYSByZWZlcmVuY2UgdG8gdGhlIHBhcmVudCBjb250ZXh0LlxuICAgKi9cbiAgZnVuY3Rpb24gQ29udGV4dCAodmlldywgcGFyZW50Q29udGV4dCkge1xuICAgIHRoaXMudmlldyA9IHZpZXc7XG4gICAgdGhpcy5jYWNoZSA9IHsgJy4nOiB0aGlzLnZpZXcgfTtcbiAgICB0aGlzLnBhcmVudCA9IHBhcmVudENvbnRleHQ7XG4gIH1cblxuICAvKipcbiAgICogQ3JlYXRlcyBhIG5ldyBjb250ZXh0IHVzaW5nIHRoZSBnaXZlbiB2aWV3IHdpdGggdGhpcyBjb250ZXh0XG4gICAqIGFzIHRoZSBwYXJlbnQuXG4gICAqL1xuICBDb250ZXh0LnByb3RvdHlwZS5wdXNoID0gZnVuY3Rpb24gcHVzaCAodmlldykge1xuICAgIHJldHVybiBuZXcgQ29udGV4dCh2aWV3LCB0aGlzKTtcbiAgfTtcblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgdmFsdWUgb2YgdGhlIGdpdmVuIG5hbWUgaW4gdGhpcyBjb250ZXh0LCB0cmF2ZXJzaW5nXG4gICAqIHVwIHRoZSBjb250ZXh0IGhpZXJhcmNoeSBpZiB0aGUgdmFsdWUgaXMgYWJzZW50IGluIHRoaXMgY29udGV4dCdzIHZpZXcuXG4gICAqL1xuICBDb250ZXh0LnByb3RvdHlwZS5sb29rdXAgPSBmdW5jdGlvbiBsb29rdXAgKG5hbWUpIHtcbiAgICB2YXIgY2FjaGUgPSB0aGlzLmNhY2hlO1xuXG4gICAgdmFyIHZhbHVlO1xuICAgIGlmIChjYWNoZS5oYXNPd25Qcm9wZXJ0eShuYW1lKSkge1xuICAgICAgdmFsdWUgPSBjYWNoZVtuYW1lXTtcbiAgICB9IGVsc2Uge1xuICAgICAgdmFyIGNvbnRleHQgPSB0aGlzLCBpbnRlcm1lZGlhdGVWYWx1ZSwgbmFtZXMsIGluZGV4LCBsb29rdXBIaXQgPSBmYWxzZTtcblxuICAgICAgd2hpbGUgKGNvbnRleHQpIHtcbiAgICAgICAgaWYgKG5hbWUuaW5kZXhPZignLicpID4gMCkge1xuICAgICAgICAgIGludGVybWVkaWF0ZVZhbHVlID0gY29udGV4dC52aWV3O1xuICAgICAgICAgIG5hbWVzID0gbmFtZS5zcGxpdCgnLicpO1xuICAgICAgICAgIGluZGV4ID0gMDtcblxuICAgICAgICAgIC8qKlxuICAgICAgICAgICAqIFVzaW5nIHRoZSBkb3Qgbm90aW9uIHBhdGggaW4gYG5hbWVgLCB3ZSBkZXNjZW5kIHRocm91Z2ggdGhlXG4gICAgICAgICAgICogbmVzdGVkIG9iamVjdHMuXG4gICAgICAgICAgICpcbiAgICAgICAgICAgKiBUbyBiZSBjZXJ0YWluIHRoYXQgdGhlIGxvb2t1cCBoYXMgYmVlbiBzdWNjZXNzZnVsLCB3ZSBoYXZlIHRvXG4gICAgICAgICAgICogY2hlY2sgaWYgdGhlIGxhc3Qgb2JqZWN0IGluIHRoZSBwYXRoIGFjdHVhbGx5IGhhcyB0aGUgcHJvcGVydHlcbiAgICAgICAgICAgKiB3ZSBhcmUgbG9va2luZyBmb3IuIFdlIHN0b3JlIHRoZSByZXN1bHQgaW4gYGxvb2t1cEhpdGAuXG4gICAgICAgICAgICpcbiAgICAgICAgICAgKiBUaGlzIGlzIHNwZWNpYWxseSBuZWNlc3NhcnkgZm9yIHdoZW4gdGhlIHZhbHVlIGhhcyBiZWVuIHNldCB0b1xuICAgICAgICAgICAqIGB1bmRlZmluZWRgIGFuZCB3ZSB3YW50IHRvIGF2b2lkIGxvb2tpbmcgdXAgcGFyZW50IGNvbnRleHRzLlxuICAgICAgICAgICAqXG4gICAgICAgICAgICogSW4gdGhlIGNhc2Ugd2hlcmUgZG90IG5vdGF0aW9uIGlzIHVzZWQsIHdlIGNvbnNpZGVyIHRoZSBsb29rdXBcbiAgICAgICAgICAgKiB0byBiZSBzdWNjZXNzZnVsIGV2ZW4gaWYgdGhlIGxhc3QgXCJvYmplY3RcIiBpbiB0aGUgcGF0aCBpc1xuICAgICAgICAgICAqIG5vdCBhY3R1YWxseSBhbiBvYmplY3QgYnV0IGEgcHJpbWl0aXZlIChlLmcuLCBhIHN0cmluZywgb3IgYW5cbiAgICAgICAgICAgKiBpbnRlZ2VyKSwgYmVjYXVzZSBpdCBpcyBzb21ldGltZXMgdXNlZnVsIHRvIGFjY2VzcyBhIHByb3BlcnR5XG4gICAgICAgICAgICogb2YgYW4gYXV0b2JveGVkIHByaW1pdGl2ZSwgc3VjaCBhcyB0aGUgbGVuZ3RoIG9mIGEgc3RyaW5nLlxuICAgICAgICAgICAqKi9cbiAgICAgICAgICB3aGlsZSAoaW50ZXJtZWRpYXRlVmFsdWUgIT0gbnVsbCAmJiBpbmRleCA8IG5hbWVzLmxlbmd0aCkge1xuICAgICAgICAgICAgaWYgKGluZGV4ID09PSBuYW1lcy5sZW5ndGggLSAxKVxuICAgICAgICAgICAgICBsb29rdXBIaXQgPSAoXG4gICAgICAgICAgICAgICAgaGFzUHJvcGVydHkoaW50ZXJtZWRpYXRlVmFsdWUsIG5hbWVzW2luZGV4XSlcbiAgICAgICAgICAgICAgICB8fCBwcmltaXRpdmVIYXNPd25Qcm9wZXJ0eShpbnRlcm1lZGlhdGVWYWx1ZSwgbmFtZXNbaW5kZXhdKVxuICAgICAgICAgICAgICApO1xuXG4gICAgICAgICAgICBpbnRlcm1lZGlhdGVWYWx1ZSA9IGludGVybWVkaWF0ZVZhbHVlW25hbWVzW2luZGV4KytdXTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaW50ZXJtZWRpYXRlVmFsdWUgPSBjb250ZXh0LnZpZXdbbmFtZV07XG5cbiAgICAgICAgICAvKipcbiAgICAgICAgICAgKiBPbmx5IGNoZWNraW5nIGFnYWluc3QgYGhhc1Byb3BlcnR5YCwgd2hpY2ggYWx3YXlzIHJldHVybnMgYGZhbHNlYCBpZlxuICAgICAgICAgICAqIGBjb250ZXh0LnZpZXdgIGlzIG5vdCBhbiBvYmplY3QuIERlbGliZXJhdGVseSBvbWl0dGluZyB0aGUgY2hlY2tcbiAgICAgICAgICAgKiBhZ2FpbnN0IGBwcmltaXRpdmVIYXNPd25Qcm9wZXJ0eWAgaWYgZG90IG5vdGF0aW9uIGlzIG5vdCB1c2VkLlxuICAgICAgICAgICAqXG4gICAgICAgICAgICogQ29uc2lkZXIgdGhpcyBleGFtcGxlOlxuICAgICAgICAgICAqIGBgYFxuICAgICAgICAgICAqIE11c3RhY2hlLnJlbmRlcihcIlRoZSBsZW5ndGggb2YgYSBmb290YmFsbCBmaWVsZCBpcyB7eyNsZW5ndGh9fXt7bGVuZ3RofX17ey9sZW5ndGh9fS5cIiwge2xlbmd0aDogXCIxMDAgeWFyZHNcIn0pXG4gICAgICAgICAgICogYGBgXG4gICAgICAgICAgICpcbiAgICAgICAgICAgKiBJZiB3ZSB3ZXJlIHRvIGNoZWNrIGFsc28gYWdhaW5zdCBgcHJpbWl0aXZlSGFzT3duUHJvcGVydHlgLCBhcyB3ZSBkb1xuICAgICAgICAgICAqIGluIHRoZSBkb3Qgbm90YXRpb24gY2FzZSwgdGhlbiByZW5kZXIgY2FsbCB3b3VsZCByZXR1cm46XG4gICAgICAgICAgICpcbiAgICAgICAgICAgKiBcIlRoZSBsZW5ndGggb2YgYSBmb290YmFsbCBmaWVsZCBpcyA5LlwiXG4gICAgICAgICAgICpcbiAgICAgICAgICAgKiByYXRoZXIgdGhhbiB0aGUgZXhwZWN0ZWQ6XG4gICAgICAgICAgICpcbiAgICAgICAgICAgKiBcIlRoZSBsZW5ndGggb2YgYSBmb290YmFsbCBmaWVsZCBpcyAxMDAgeWFyZHMuXCJcbiAgICAgICAgICAgKiovXG4gICAgICAgICAgbG9va3VwSGl0ID0gaGFzUHJvcGVydHkoY29udGV4dC52aWV3LCBuYW1lKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChsb29rdXBIaXQpIHtcbiAgICAgICAgICB2YWx1ZSA9IGludGVybWVkaWF0ZVZhbHVlO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG5cbiAgICAgICAgY29udGV4dCA9IGNvbnRleHQucGFyZW50O1xuICAgICAgfVxuXG4gICAgICBjYWNoZVtuYW1lXSA9IHZhbHVlO1xuICAgIH1cblxuICAgIGlmIChpc0Z1bmN0aW9uKHZhbHVlKSlcbiAgICAgIHZhbHVlID0gdmFsdWUuY2FsbCh0aGlzLnZpZXcpO1xuXG4gICAgcmV0dXJuIHZhbHVlO1xuICB9O1xuXG4gIC8qKlxuICAgKiBBIFdyaXRlciBrbm93cyBob3cgdG8gdGFrZSBhIHN0cmVhbSBvZiB0b2tlbnMgYW5kIHJlbmRlciB0aGVtIHRvIGFcbiAgICogc3RyaW5nLCBnaXZlbiBhIGNvbnRleHQuIEl0IGFsc28gbWFpbnRhaW5zIGEgY2FjaGUgb2YgdGVtcGxhdGVzIHRvXG4gICAqIGF2b2lkIHRoZSBuZWVkIHRvIHBhcnNlIHRoZSBzYW1lIHRlbXBsYXRlIHR3aWNlLlxuICAgKi9cbiAgZnVuY3Rpb24gV3JpdGVyICgpIHtcbiAgICB0aGlzLnRlbXBsYXRlQ2FjaGUgPSB7XG4gICAgICBfY2FjaGU6IHt9LFxuICAgICAgc2V0OiBmdW5jdGlvbiBzZXQgKGtleSwgdmFsdWUpIHtcbiAgICAgICAgdGhpcy5fY2FjaGVba2V5XSA9IHZhbHVlO1xuICAgICAgfSxcbiAgICAgIGdldDogZnVuY3Rpb24gZ2V0IChrZXkpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2NhY2hlW2tleV07XG4gICAgICB9LFxuICAgICAgY2xlYXI6IGZ1bmN0aW9uIGNsZWFyICgpIHtcbiAgICAgICAgdGhpcy5fY2FjaGUgPSB7fTtcbiAgICAgIH1cbiAgICB9O1xuICB9XG5cbiAgLyoqXG4gICAqIENsZWFycyBhbGwgY2FjaGVkIHRlbXBsYXRlcyBpbiB0aGlzIHdyaXRlci5cbiAgICovXG4gIFdyaXRlci5wcm90b3R5cGUuY2xlYXJDYWNoZSA9IGZ1bmN0aW9uIGNsZWFyQ2FjaGUgKCkge1xuICAgIGlmICh0eXBlb2YgdGhpcy50ZW1wbGF0ZUNhY2hlICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgdGhpcy50ZW1wbGF0ZUNhY2hlLmNsZWFyKCk7XG4gICAgfVxuICB9O1xuXG4gIC8qKlxuICAgKiBQYXJzZXMgYW5kIGNhY2hlcyB0aGUgZ2l2ZW4gYHRlbXBsYXRlYCBhY2NvcmRpbmcgdG8gdGhlIGdpdmVuIGB0YWdzYCBvclxuICAgKiBgbXVzdGFjaGUudGFnc2AgaWYgYHRhZ3NgIGlzIG9taXR0ZWQsICBhbmQgcmV0dXJucyB0aGUgYXJyYXkgb2YgdG9rZW5zXG4gICAqIHRoYXQgaXMgZ2VuZXJhdGVkIGZyb20gdGhlIHBhcnNlLlxuICAgKi9cbiAgV3JpdGVyLnByb3RvdHlwZS5wYXJzZSA9IGZ1bmN0aW9uIHBhcnNlICh0ZW1wbGF0ZSwgdGFncykge1xuICAgIHZhciBjYWNoZSA9IHRoaXMudGVtcGxhdGVDYWNoZTtcbiAgICB2YXIgY2FjaGVLZXkgPSB0ZW1wbGF0ZSArICc6JyArICh0YWdzIHx8IG11c3RhY2hlLnRhZ3MpLmpvaW4oJzonKTtcbiAgICB2YXIgaXNDYWNoZUVuYWJsZWQgPSB0eXBlb2YgY2FjaGUgIT09ICd1bmRlZmluZWQnO1xuICAgIHZhciB0b2tlbnMgPSBpc0NhY2hlRW5hYmxlZCA/IGNhY2hlLmdldChjYWNoZUtleSkgOiB1bmRlZmluZWQ7XG5cbiAgICBpZiAodG9rZW5zID09IHVuZGVmaW5lZCkge1xuICAgICAgdG9rZW5zID0gcGFyc2VUZW1wbGF0ZSh0ZW1wbGF0ZSwgdGFncyk7XG4gICAgICBpc0NhY2hlRW5hYmxlZCAmJiBjYWNoZS5zZXQoY2FjaGVLZXksIHRva2Vucyk7XG4gICAgfVxuICAgIHJldHVybiB0b2tlbnM7XG4gIH07XG5cbiAgLyoqXG4gICAqIEhpZ2gtbGV2ZWwgbWV0aG9kIHRoYXQgaXMgdXNlZCB0byByZW5kZXIgdGhlIGdpdmVuIGB0ZW1wbGF0ZWAgd2l0aFxuICAgKiB0aGUgZ2l2ZW4gYHZpZXdgLlxuICAgKlxuICAgKiBUaGUgb3B0aW9uYWwgYHBhcnRpYWxzYCBhcmd1bWVudCBtYXkgYmUgYW4gb2JqZWN0IHRoYXQgY29udGFpbnMgdGhlXG4gICAqIG5hbWVzIGFuZCB0ZW1wbGF0ZXMgb2YgcGFydGlhbHMgdGhhdCBhcmUgdXNlZCBpbiB0aGUgdGVtcGxhdGUuIEl0IG1heVxuICAgKiBhbHNvIGJlIGEgZnVuY3Rpb24gdGhhdCBpcyB1c2VkIHRvIGxvYWQgcGFydGlhbCB0ZW1wbGF0ZXMgb24gdGhlIGZseVxuICAgKiB0aGF0IHRha2VzIGEgc2luZ2xlIGFyZ3VtZW50OiB0aGUgbmFtZSBvZiB0aGUgcGFydGlhbC5cbiAgICpcbiAgICogSWYgdGhlIG9wdGlvbmFsIGB0YWdzYCBhcmd1bWVudCBpcyBnaXZlbiBoZXJlIGl0IG11c3QgYmUgYW4gYXJyYXkgd2l0aCB0d29cbiAgICogc3RyaW5nIHZhbHVlczogdGhlIG9wZW5pbmcgYW5kIGNsb3NpbmcgdGFncyB1c2VkIGluIHRoZSB0ZW1wbGF0ZSAoZS5nLlxuICAgKiBbIFwiPCVcIiwgXCIlPlwiIF0pLiBUaGUgZGVmYXVsdCBpcyB0byBtdXN0YWNoZS50YWdzLlxuICAgKi9cbiAgV3JpdGVyLnByb3RvdHlwZS5yZW5kZXIgPSBmdW5jdGlvbiByZW5kZXIgKHRlbXBsYXRlLCB2aWV3LCBwYXJ0aWFscywgdGFncykge1xuICAgIHZhciB0b2tlbnMgPSB0aGlzLnBhcnNlKHRlbXBsYXRlLCB0YWdzKTtcbiAgICB2YXIgY29udGV4dCA9ICh2aWV3IGluc3RhbmNlb2YgQ29udGV4dCkgPyB2aWV3IDogbmV3IENvbnRleHQodmlldywgdW5kZWZpbmVkKTtcbiAgICByZXR1cm4gdGhpcy5yZW5kZXJUb2tlbnModG9rZW5zLCBjb250ZXh0LCBwYXJ0aWFscywgdGVtcGxhdGUsIHRhZ3MpO1xuICB9O1xuXG4gIC8qKlxuICAgKiBMb3ctbGV2ZWwgbWV0aG9kIHRoYXQgcmVuZGVycyB0aGUgZ2l2ZW4gYXJyYXkgb2YgYHRva2Vuc2AgdXNpbmdcbiAgICogdGhlIGdpdmVuIGBjb250ZXh0YCBhbmQgYHBhcnRpYWxzYC5cbiAgICpcbiAgICogTm90ZTogVGhlIGBvcmlnaW5hbFRlbXBsYXRlYCBpcyBvbmx5IGV2ZXIgdXNlZCB0byBleHRyYWN0IHRoZSBwb3J0aW9uXG4gICAqIG9mIHRoZSBvcmlnaW5hbCB0ZW1wbGF0ZSB0aGF0IHdhcyBjb250YWluZWQgaW4gYSBoaWdoZXItb3JkZXIgc2VjdGlvbi5cbiAgICogSWYgdGhlIHRlbXBsYXRlIGRvZXNuJ3QgdXNlIGhpZ2hlci1vcmRlciBzZWN0aW9ucywgdGhpcyBhcmd1bWVudCBtYXlcbiAgICogYmUgb21pdHRlZC5cbiAgICovXG4gIFdyaXRlci5wcm90b3R5cGUucmVuZGVyVG9rZW5zID0gZnVuY3Rpb24gcmVuZGVyVG9rZW5zICh0b2tlbnMsIGNvbnRleHQsIHBhcnRpYWxzLCBvcmlnaW5hbFRlbXBsYXRlLCB0YWdzKSB7XG4gICAgdmFyIGJ1ZmZlciA9ICcnO1xuXG4gICAgdmFyIHRva2VuLCBzeW1ib2wsIHZhbHVlO1xuICAgIGZvciAodmFyIGkgPSAwLCBudW1Ub2tlbnMgPSB0b2tlbnMubGVuZ3RoOyBpIDwgbnVtVG9rZW5zOyArK2kpIHtcbiAgICAgIHZhbHVlID0gdW5kZWZpbmVkO1xuICAgICAgdG9rZW4gPSB0b2tlbnNbaV07XG4gICAgICBzeW1ib2wgPSB0b2tlblswXTtcblxuICAgICAgaWYgKHN5bWJvbCA9PT0gJyMnKSB2YWx1ZSA9IHRoaXMucmVuZGVyU2VjdGlvbih0b2tlbiwgY29udGV4dCwgcGFydGlhbHMsIG9yaWdpbmFsVGVtcGxhdGUpO1xuICAgICAgZWxzZSBpZiAoc3ltYm9sID09PSAnXicpIHZhbHVlID0gdGhpcy5yZW5kZXJJbnZlcnRlZCh0b2tlbiwgY29udGV4dCwgcGFydGlhbHMsIG9yaWdpbmFsVGVtcGxhdGUpO1xuICAgICAgZWxzZSBpZiAoc3ltYm9sID09PSAnPicpIHZhbHVlID0gdGhpcy5yZW5kZXJQYXJ0aWFsKHRva2VuLCBjb250ZXh0LCBwYXJ0aWFscywgdGFncyk7XG4gICAgICBlbHNlIGlmIChzeW1ib2wgPT09ICcmJykgdmFsdWUgPSB0aGlzLnVuZXNjYXBlZFZhbHVlKHRva2VuLCBjb250ZXh0KTtcbiAgICAgIGVsc2UgaWYgKHN5bWJvbCA9PT0gJ25hbWUnKSB2YWx1ZSA9IHRoaXMuZXNjYXBlZFZhbHVlKHRva2VuLCBjb250ZXh0KTtcbiAgICAgIGVsc2UgaWYgKHN5bWJvbCA9PT0gJ3RleHQnKSB2YWx1ZSA9IHRoaXMucmF3VmFsdWUodG9rZW4pO1xuXG4gICAgICBpZiAodmFsdWUgIT09IHVuZGVmaW5lZClcbiAgICAgICAgYnVmZmVyICs9IHZhbHVlO1xuICAgIH1cblxuICAgIHJldHVybiBidWZmZXI7XG4gIH07XG5cbiAgV3JpdGVyLnByb3RvdHlwZS5yZW5kZXJTZWN0aW9uID0gZnVuY3Rpb24gcmVuZGVyU2VjdGlvbiAodG9rZW4sIGNvbnRleHQsIHBhcnRpYWxzLCBvcmlnaW5hbFRlbXBsYXRlKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIHZhciBidWZmZXIgPSAnJztcbiAgICB2YXIgdmFsdWUgPSBjb250ZXh0Lmxvb2t1cCh0b2tlblsxXSk7XG5cbiAgICAvLyBUaGlzIGZ1bmN0aW9uIGlzIHVzZWQgdG8gcmVuZGVyIGFuIGFyYml0cmFyeSB0ZW1wbGF0ZVxuICAgIC8vIGluIHRoZSBjdXJyZW50IGNvbnRleHQgYnkgaGlnaGVyLW9yZGVyIHNlY3Rpb25zLlxuICAgIGZ1bmN0aW9uIHN1YlJlbmRlciAodGVtcGxhdGUpIHtcbiAgICAgIHJldHVybiBzZWxmLnJlbmRlcih0ZW1wbGF0ZSwgY29udGV4dCwgcGFydGlhbHMpO1xuICAgIH1cblxuICAgIGlmICghdmFsdWUpIHJldHVybjtcblxuICAgIGlmIChpc0FycmF5KHZhbHVlKSkge1xuICAgICAgZm9yICh2YXIgaiA9IDAsIHZhbHVlTGVuZ3RoID0gdmFsdWUubGVuZ3RoOyBqIDwgdmFsdWVMZW5ndGg7ICsraikge1xuICAgICAgICBidWZmZXIgKz0gdGhpcy5yZW5kZXJUb2tlbnModG9rZW5bNF0sIGNvbnRleHQucHVzaCh2YWx1ZVtqXSksIHBhcnRpYWxzLCBvcmlnaW5hbFRlbXBsYXRlKTtcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcgfHwgdHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJyB8fCB0eXBlb2YgdmFsdWUgPT09ICdudW1iZXInKSB7XG4gICAgICBidWZmZXIgKz0gdGhpcy5yZW5kZXJUb2tlbnModG9rZW5bNF0sIGNvbnRleHQucHVzaCh2YWx1ZSksIHBhcnRpYWxzLCBvcmlnaW5hbFRlbXBsYXRlKTtcbiAgICB9IGVsc2UgaWYgKGlzRnVuY3Rpb24odmFsdWUpKSB7XG4gICAgICBpZiAodHlwZW9mIG9yaWdpbmFsVGVtcGxhdGUgIT09ICdzdHJpbmcnKVxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0Nhbm5vdCB1c2UgaGlnaGVyLW9yZGVyIHNlY3Rpb25zIHdpdGhvdXQgdGhlIG9yaWdpbmFsIHRlbXBsYXRlJyk7XG5cbiAgICAgIC8vIEV4dHJhY3QgdGhlIHBvcnRpb24gb2YgdGhlIG9yaWdpbmFsIHRlbXBsYXRlIHRoYXQgdGhlIHNlY3Rpb24gY29udGFpbnMuXG4gICAgICB2YWx1ZSA9IHZhbHVlLmNhbGwoY29udGV4dC52aWV3LCBvcmlnaW5hbFRlbXBsYXRlLnNsaWNlKHRva2VuWzNdLCB0b2tlbls1XSksIHN1YlJlbmRlcik7XG5cbiAgICAgIGlmICh2YWx1ZSAhPSBudWxsKVxuICAgICAgICBidWZmZXIgKz0gdmFsdWU7XG4gICAgfSBlbHNlIHtcbiAgICAgIGJ1ZmZlciArPSB0aGlzLnJlbmRlclRva2Vucyh0b2tlbls0XSwgY29udGV4dCwgcGFydGlhbHMsIG9yaWdpbmFsVGVtcGxhdGUpO1xuICAgIH1cbiAgICByZXR1cm4gYnVmZmVyO1xuICB9O1xuXG4gIFdyaXRlci5wcm90b3R5cGUucmVuZGVySW52ZXJ0ZWQgPSBmdW5jdGlvbiByZW5kZXJJbnZlcnRlZCAodG9rZW4sIGNvbnRleHQsIHBhcnRpYWxzLCBvcmlnaW5hbFRlbXBsYXRlKSB7XG4gICAgdmFyIHZhbHVlID0gY29udGV4dC5sb29rdXAodG9rZW5bMV0pO1xuXG4gICAgLy8gVXNlIEphdmFTY3JpcHQncyBkZWZpbml0aW9uIG9mIGZhbHN5LiBJbmNsdWRlIGVtcHR5IGFycmF5cy5cbiAgICAvLyBTZWUgaHR0cHM6Ly9naXRodWIuY29tL2phbmwvbXVzdGFjaGUuanMvaXNzdWVzLzE4NlxuICAgIGlmICghdmFsdWUgfHwgKGlzQXJyYXkodmFsdWUpICYmIHZhbHVlLmxlbmd0aCA9PT0gMCkpXG4gICAgICByZXR1cm4gdGhpcy5yZW5kZXJUb2tlbnModG9rZW5bNF0sIGNvbnRleHQsIHBhcnRpYWxzLCBvcmlnaW5hbFRlbXBsYXRlKTtcbiAgfTtcblxuICBXcml0ZXIucHJvdG90eXBlLmluZGVudFBhcnRpYWwgPSBmdW5jdGlvbiBpbmRlbnRQYXJ0aWFsIChwYXJ0aWFsLCBpbmRlbnRhdGlvbiwgbGluZUhhc05vblNwYWNlKSB7XG4gICAgdmFyIGZpbHRlcmVkSW5kZW50YXRpb24gPSBpbmRlbnRhdGlvbi5yZXBsYWNlKC9bXiBcXHRdL2csICcnKTtcbiAgICB2YXIgcGFydGlhbEJ5TmwgPSBwYXJ0aWFsLnNwbGl0KCdcXG4nKTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHBhcnRpYWxCeU5sLmxlbmd0aDsgaSsrKSB7XG4gICAgICBpZiAocGFydGlhbEJ5TmxbaV0ubGVuZ3RoICYmIChpID4gMCB8fCAhbGluZUhhc05vblNwYWNlKSkge1xuICAgICAgICBwYXJ0aWFsQnlObFtpXSA9IGZpbHRlcmVkSW5kZW50YXRpb24gKyBwYXJ0aWFsQnlObFtpXTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHBhcnRpYWxCeU5sLmpvaW4oJ1xcbicpO1xuICB9O1xuXG4gIFdyaXRlci5wcm90b3R5cGUucmVuZGVyUGFydGlhbCA9IGZ1bmN0aW9uIHJlbmRlclBhcnRpYWwgKHRva2VuLCBjb250ZXh0LCBwYXJ0aWFscywgdGFncykge1xuICAgIGlmICghcGFydGlhbHMpIHJldHVybjtcblxuICAgIHZhciB2YWx1ZSA9IGlzRnVuY3Rpb24ocGFydGlhbHMpID8gcGFydGlhbHModG9rZW5bMV0pIDogcGFydGlhbHNbdG9rZW5bMV1dO1xuICAgIGlmICh2YWx1ZSAhPSBudWxsKSB7XG4gICAgICB2YXIgbGluZUhhc05vblNwYWNlID0gdG9rZW5bNl07XG4gICAgICB2YXIgdGFnSW5kZXggPSB0b2tlbls1XTtcbiAgICAgIHZhciBpbmRlbnRhdGlvbiA9IHRva2VuWzRdO1xuICAgICAgdmFyIGluZGVudGVkVmFsdWUgPSB2YWx1ZTtcbiAgICAgIGlmICh0YWdJbmRleCA9PSAwICYmIGluZGVudGF0aW9uKSB7XG4gICAgICAgIGluZGVudGVkVmFsdWUgPSB0aGlzLmluZGVudFBhcnRpYWwodmFsdWUsIGluZGVudGF0aW9uLCBsaW5lSGFzTm9uU3BhY2UpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRoaXMucmVuZGVyVG9rZW5zKHRoaXMucGFyc2UoaW5kZW50ZWRWYWx1ZSwgdGFncyksIGNvbnRleHQsIHBhcnRpYWxzLCBpbmRlbnRlZFZhbHVlLCB0YWdzKTtcbiAgICB9XG4gIH07XG5cbiAgV3JpdGVyLnByb3RvdHlwZS51bmVzY2FwZWRWYWx1ZSA9IGZ1bmN0aW9uIHVuZXNjYXBlZFZhbHVlICh0b2tlbiwgY29udGV4dCkge1xuICAgIHZhciB2YWx1ZSA9IGNvbnRleHQubG9va3VwKHRva2VuWzFdKTtcbiAgICBpZiAodmFsdWUgIT0gbnVsbClcbiAgICAgIHJldHVybiB2YWx1ZTtcbiAgfTtcblxuICBXcml0ZXIucHJvdG90eXBlLmVzY2FwZWRWYWx1ZSA9IGZ1bmN0aW9uIGVzY2FwZWRWYWx1ZSAodG9rZW4sIGNvbnRleHQpIHtcbiAgICB2YXIgdmFsdWUgPSBjb250ZXh0Lmxvb2t1cCh0b2tlblsxXSk7XG4gICAgaWYgKHZhbHVlICE9IG51bGwpXG4gICAgICByZXR1cm4gbXVzdGFjaGUuZXNjYXBlKHZhbHVlKTtcbiAgfTtcblxuICBXcml0ZXIucHJvdG90eXBlLnJhd1ZhbHVlID0gZnVuY3Rpb24gcmF3VmFsdWUgKHRva2VuKSB7XG4gICAgcmV0dXJuIHRva2VuWzFdO1xuICB9O1xuXG4gIHZhciBtdXN0YWNoZSA9IHtcbiAgICBuYW1lOiAnbXVzdGFjaGUuanMnLFxuICAgIHZlcnNpb246ICc0LjAuMScsXG4gICAgdGFnczogWyAne3snLCAnfX0nIF0sXG4gICAgY2xlYXJDYWNoZTogdW5kZWZpbmVkLFxuICAgIGVzY2FwZTogdW5kZWZpbmVkLFxuICAgIHBhcnNlOiB1bmRlZmluZWQsXG4gICAgcmVuZGVyOiB1bmRlZmluZWQsXG4gICAgU2Nhbm5lcjogdW5kZWZpbmVkLFxuICAgIENvbnRleHQ6IHVuZGVmaW5lZCxcbiAgICBXcml0ZXI6IHVuZGVmaW5lZCxcbiAgICAvKipcbiAgICAgKiBBbGxvd3MgYSB1c2VyIHRvIG92ZXJyaWRlIHRoZSBkZWZhdWx0IGNhY2hpbmcgc3RyYXRlZ3ksIGJ5IHByb3ZpZGluZyBhblxuICAgICAqIG9iamVjdCB3aXRoIHNldCwgZ2V0IGFuZCBjbGVhciBtZXRob2RzLiBUaGlzIGNhbiBhbHNvIGJlIHVzZWQgdG8gZGlzYWJsZVxuICAgICAqIHRoZSBjYWNoZSBieSBzZXR0aW5nIGl0IHRvIHRoZSBsaXRlcmFsIGB1bmRlZmluZWRgLlxuICAgICAqL1xuICAgIHNldCB0ZW1wbGF0ZUNhY2hlIChjYWNoZSkge1xuICAgICAgZGVmYXVsdFdyaXRlci50ZW1wbGF0ZUNhY2hlID0gY2FjaGU7XG4gICAgfSxcbiAgICAvKipcbiAgICAgKiBHZXRzIHRoZSBkZWZhdWx0IG9yIG92ZXJyaWRkZW4gY2FjaGluZyBvYmplY3QgZnJvbSB0aGUgZGVmYXVsdCB3cml0ZXIuXG4gICAgICovXG4gICAgZ2V0IHRlbXBsYXRlQ2FjaGUgKCkge1xuICAgICAgcmV0dXJuIGRlZmF1bHRXcml0ZXIudGVtcGxhdGVDYWNoZTtcbiAgICB9XG4gIH07XG5cbiAgLy8gQWxsIGhpZ2gtbGV2ZWwgbXVzdGFjaGUuKiBmdW5jdGlvbnMgdXNlIHRoaXMgd3JpdGVyLlxuICB2YXIgZGVmYXVsdFdyaXRlciA9IG5ldyBXcml0ZXIoKTtcblxuICAvKipcbiAgICogQ2xlYXJzIGFsbCBjYWNoZWQgdGVtcGxhdGVzIGluIHRoZSBkZWZhdWx0IHdyaXRlci5cbiAgICovXG4gIG11c3RhY2hlLmNsZWFyQ2FjaGUgPSBmdW5jdGlvbiBjbGVhckNhY2hlICgpIHtcbiAgICByZXR1cm4gZGVmYXVsdFdyaXRlci5jbGVhckNhY2hlKCk7XG4gIH07XG5cbiAgLyoqXG4gICAqIFBhcnNlcyBhbmQgY2FjaGVzIHRoZSBnaXZlbiB0ZW1wbGF0ZSBpbiB0aGUgZGVmYXVsdCB3cml0ZXIgYW5kIHJldHVybnMgdGhlXG4gICAqIGFycmF5IG9mIHRva2VucyBpdCBjb250YWlucy4gRG9pbmcgdGhpcyBhaGVhZCBvZiB0aW1lIGF2b2lkcyB0aGUgbmVlZCB0b1xuICAgKiBwYXJzZSB0ZW1wbGF0ZXMgb24gdGhlIGZseSBhcyB0aGV5IGFyZSByZW5kZXJlZC5cbiAgICovXG4gIG11c3RhY2hlLnBhcnNlID0gZnVuY3Rpb24gcGFyc2UgKHRlbXBsYXRlLCB0YWdzKSB7XG4gICAgcmV0dXJuIGRlZmF1bHRXcml0ZXIucGFyc2UodGVtcGxhdGUsIHRhZ3MpO1xuICB9O1xuXG4gIC8qKlxuICAgKiBSZW5kZXJzIHRoZSBgdGVtcGxhdGVgIHdpdGggdGhlIGdpdmVuIGB2aWV3YCBhbmQgYHBhcnRpYWxzYCB1c2luZyB0aGVcbiAgICogZGVmYXVsdCB3cml0ZXIuIElmIHRoZSBvcHRpb25hbCBgdGFnc2AgYXJndW1lbnQgaXMgZ2l2ZW4gaGVyZSBpdCBtdXN0IGJlIGFuXG4gICAqIGFycmF5IHdpdGggdHdvIHN0cmluZyB2YWx1ZXM6IHRoZSBvcGVuaW5nIGFuZCBjbG9zaW5nIHRhZ3MgdXNlZCBpbiB0aGVcbiAgICogdGVtcGxhdGUgKGUuZy4gWyBcIjwlXCIsIFwiJT5cIiBdKS4gVGhlIGRlZmF1bHQgaXMgdG8gbXVzdGFjaGUudGFncy5cbiAgICovXG4gIG11c3RhY2hlLnJlbmRlciA9IGZ1bmN0aW9uIHJlbmRlciAodGVtcGxhdGUsIHZpZXcsIHBhcnRpYWxzLCB0YWdzKSB7XG4gICAgaWYgKHR5cGVvZiB0ZW1wbGF0ZSAhPT0gJ3N0cmluZycpIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0ludmFsaWQgdGVtcGxhdGUhIFRlbXBsYXRlIHNob3VsZCBiZSBhIFwic3RyaW5nXCIgJyArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICdidXQgXCInICsgdHlwZVN0cih0ZW1wbGF0ZSkgKyAnXCIgd2FzIGdpdmVuIGFzIHRoZSBmaXJzdCAnICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgJ2FyZ3VtZW50IGZvciBtdXN0YWNoZSNyZW5kZXIodGVtcGxhdGUsIHZpZXcsIHBhcnRpYWxzKScpO1xuICAgIH1cblxuICAgIHJldHVybiBkZWZhdWx0V3JpdGVyLnJlbmRlcih0ZW1wbGF0ZSwgdmlldywgcGFydGlhbHMsIHRhZ3MpO1xuICB9O1xuXG4gIC8vIEV4cG9ydCB0aGUgZXNjYXBpbmcgZnVuY3Rpb24gc28gdGhhdCB0aGUgdXNlciBtYXkgb3ZlcnJpZGUgaXQuXG4gIC8vIFNlZSBodHRwczovL2dpdGh1Yi5jb20vamFubC9tdXN0YWNoZS5qcy9pc3N1ZXMvMjQ0XG4gIG11c3RhY2hlLmVzY2FwZSA9IGVzY2FwZUh0bWw7XG5cbiAgLy8gRXhwb3J0IHRoZXNlIG1haW5seSBmb3IgdGVzdGluZywgYnV0IGFsc28gZm9yIGFkdmFuY2VkIHVzYWdlLlxuICBtdXN0YWNoZS5TY2FubmVyID0gU2Nhbm5lcjtcbiAgbXVzdGFjaGUuQ29udGV4dCA9IENvbnRleHQ7XG4gIG11c3RhY2hlLldyaXRlciA9IFdyaXRlcjtcblxuICByZXR1cm4gbXVzdGFjaGU7XG5cbn0pKSk7XG4iLCIhZnVuY3Rpb24oZSx0KXtcIm9iamVjdFwiPT10eXBlb2YgZXhwb3J0cyYmXCJ1bmRlZmluZWRcIiE9dHlwZW9mIG1vZHVsZT9tb2R1bGUuZXhwb3J0cz10KCk6XCJmdW5jdGlvblwiPT10eXBlb2YgZGVmaW5lJiZkZWZpbmUuYW1kP2RlZmluZSh0KTplLk5hdmlnbz10KCl9KHRoaXMsZnVuY3Rpb24oKXtcInVzZSBzdHJpY3RcIjt2YXIgZT1cImZ1bmN0aW9uXCI9PXR5cGVvZiBTeW1ib2wmJlwic3ltYm9sXCI9PXR5cGVvZiBTeW1ib2wuaXRlcmF0b3I/ZnVuY3Rpb24oZSl7cmV0dXJuIHR5cGVvZiBlfTpmdW5jdGlvbihlKXtyZXR1cm4gZSYmXCJmdW5jdGlvblwiPT10eXBlb2YgU3ltYm9sJiZlLmNvbnN0cnVjdG9yPT09U3ltYm9sJiZlIT09U3ltYm9sLnByb3RvdHlwZT9cInN5bWJvbFwiOnR5cGVvZiBlfTtmdW5jdGlvbiB0KCl7cmV0dXJuIShcInVuZGVmaW5lZFwiPT10eXBlb2Ygd2luZG93fHwhd2luZG93Lmhpc3Rvcnl8fCF3aW5kb3cuaGlzdG9yeS5wdXNoU3RhdGUpfWZ1bmN0aW9uIG4oZSxuLG8pe3RoaXMucm9vdD1udWxsLHRoaXMuX3JvdXRlcz1bXSx0aGlzLl91c2VIYXNoPW4sdGhpcy5faGFzaD12b2lkIDA9PT1vP1wiI1wiOm8sdGhpcy5fcGF1c2VkPSExLHRoaXMuX2Rlc3Ryb3llZD0hMSx0aGlzLl9sYXN0Um91dGVSZXNvbHZlZD1udWxsLHRoaXMuX25vdEZvdW5kSGFuZGxlcj1udWxsLHRoaXMuX2RlZmF1bHRIYW5kbGVyPW51bGwsdGhpcy5fdXNlUHVzaFN0YXRlPSFuJiZ0KCksdGhpcy5fb25Mb2NhdGlvbkNoYW5nZT10aGlzLl9vbkxvY2F0aW9uQ2hhbmdlLmJpbmQodGhpcyksdGhpcy5fZ2VuZXJpY0hvb2tzPW51bGwsdGhpcy5faGlzdG9yeUFQSVVwZGF0ZU1ldGhvZD1cInB1c2hTdGF0ZVwiLGU/dGhpcy5yb290PW4/ZS5yZXBsYWNlKC9cXC8kLyxcIi9cIit0aGlzLl9oYXNoKTplLnJlcGxhY2UoL1xcLyQvLFwiXCIpOm4mJih0aGlzLnJvb3Q9dGhpcy5fY0xvYygpLnNwbGl0KHRoaXMuX2hhc2gpWzBdLnJlcGxhY2UoL1xcLyQvLFwiL1wiK3RoaXMuX2hhc2gpKSx0aGlzLl9saXN0ZW4oKSx0aGlzLnVwZGF0ZVBhZ2VMaW5rcygpfWZ1bmN0aW9uIG8oZSl7cmV0dXJuIGUgaW5zdGFuY2VvZiBSZWdFeHA/ZTplLnJlcGxhY2UoL1xcLyskLyxcIlwiKS5yZXBsYWNlKC9eXFwvKy8sXCJeL1wiKX1mdW5jdGlvbiBpKGUpe3JldHVybiBlLnJlcGxhY2UoL1xcLyQvLFwiXCIpLnNwbGl0KFwiL1wiKS5sZW5ndGh9ZnVuY3Rpb24gcyhlLHQpe3JldHVybiBpKHQpLWkoZSl9ZnVuY3Rpb24gcihlLHQpe3JldHVybiBmdW5jdGlvbihlKXtyZXR1cm4oYXJndW1lbnRzLmxlbmd0aD4xJiZ2b2lkIDAhPT1hcmd1bWVudHNbMV0/YXJndW1lbnRzWzFdOltdKS5tYXAoZnVuY3Rpb24odCl7dmFyIGk9ZnVuY3Rpb24oZSl7dmFyIHQ9W107cmV0dXJue3JlZ2V4cDplIGluc3RhbmNlb2YgUmVnRXhwP2U6bmV3IFJlZ0V4cChlLnJlcGxhY2Uobi5QQVJBTUVURVJfUkVHRVhQLGZ1bmN0aW9uKGUsbyxpKXtyZXR1cm4gdC5wdXNoKGkpLG4uUkVQTEFDRV9WQVJJQUJMRV9SRUdFWFB9KS5yZXBsYWNlKG4uV0lMRENBUkRfUkVHRVhQLG4uUkVQTEFDRV9XSUxEQ0FSRCkrbi5GT0xMT1dFRF9CWV9TTEFTSF9SRUdFWFAsbi5NQVRDSF9SRUdFWFBfRkxBR1MpLHBhcmFtTmFtZXM6dH19KG8odC5yb3V0ZSkpLHM9aS5yZWdleHAscj1pLnBhcmFtTmFtZXMsYT1lLnJlcGxhY2UoL15cXC8rLyxcIi9cIikubWF0Y2gocyksaD1mdW5jdGlvbihlLHQpe3JldHVybiAwPT09dC5sZW5ndGg/bnVsbDplP2Uuc2xpY2UoMSxlLmxlbmd0aCkucmVkdWNlKGZ1bmN0aW9uKGUsbixvKXtyZXR1cm4gbnVsbD09PWUmJihlPXt9KSxlW3Rbb11dPWRlY29kZVVSSUNvbXBvbmVudChuKSxlfSxudWxsKTpudWxsfShhLHIpO3JldHVybiEhYSYme21hdGNoOmEscm91dGU6dCxwYXJhbXM6aH19KS5maWx0ZXIoZnVuY3Rpb24oZSl7cmV0dXJuIGV9KX0oZSx0KVswXXx8ITF9ZnVuY3Rpb24gYShlLHQpe3ZhciBuPXQubWFwKGZ1bmN0aW9uKHQpe3JldHVyblwiXCI9PT10LnJvdXRlfHxcIipcIj09PXQucm91dGU/ZTplLnNwbGl0KG5ldyBSZWdFeHAodC5yb3V0ZStcIigkfC8pXCIpKVswXX0pLGk9byhlKTtyZXR1cm4gbi5sZW5ndGg+MT9uLnJlZHVjZShmdW5jdGlvbihlLHQpe3JldHVybiBlLmxlbmd0aD50Lmxlbmd0aCYmKGU9dCksZX0sblswXSk6MT09PW4ubGVuZ3RoP25bMF06aX1mdW5jdGlvbiBoKGUsbixvKXt2YXIgaSxzPWZ1bmN0aW9uKGUpe3JldHVybiBlLnNwbGl0KC9cXD8oLiopPyQvKVswXX07cmV0dXJuIHZvaWQgMD09PW8mJihvPVwiI1wiKSx0KCkmJiFuP3MoZSkuc3BsaXQobylbMF06KGk9ZS5zcGxpdChvKSkubGVuZ3RoPjE/cyhpWzFdKTpzKGlbMF0pfWZ1bmN0aW9uIHUodCxuLG8pe2lmKG4mJlwib2JqZWN0XCI9PT0odm9pZCAwPT09bj9cInVuZGVmaW5lZFwiOmUobikpKXtpZihuLmJlZm9yZSlyZXR1cm4gdm9pZCBuLmJlZm9yZShmdW5jdGlvbigpeyghKGFyZ3VtZW50cy5sZW5ndGg+MCYmdm9pZCAwIT09YXJndW1lbnRzWzBdKXx8YXJndW1lbnRzWzBdKSYmKHQoKSxuLmFmdGVyJiZuLmFmdGVyKG8pKX0sbyk7aWYobi5hZnRlcilyZXR1cm4gdCgpLHZvaWQobi5hZnRlciYmbi5hZnRlcihvKSl9dCgpfXJldHVybiBuLnByb3RvdHlwZT17aGVscGVyczp7bWF0Y2g6cixyb290OmEsY2xlYW46byxnZXRPbmx5VVJMOmh9LG5hdmlnYXRlOmZ1bmN0aW9uKGUsdCl7dmFyIG47cmV0dXJuIGU9ZXx8XCJcIix0aGlzLl91c2VQdXNoU3RhdGU/KG49KG49KHQ/XCJcIjp0aGlzLl9nZXRSb290KCkrXCIvXCIpK2UucmVwbGFjZSgvXlxcLysvLFwiL1wiKSkucmVwbGFjZSgvKFteOl0pKFxcL3syLH0pL2csXCIkMS9cIiksaGlzdG9yeVt0aGlzLl9oaXN0b3J5QVBJVXBkYXRlTWV0aG9kXSh7fSxcIlwiLG4pLHRoaXMucmVzb2x2ZSgpKTpcInVuZGVmaW5lZFwiIT10eXBlb2Ygd2luZG93JiYoZT1lLnJlcGxhY2UobmV3IFJlZ0V4cChcIl5cIit0aGlzLl9oYXNoKSxcIlwiKSx3aW5kb3cubG9jYXRpb24uaHJlZj13aW5kb3cubG9jYXRpb24uaHJlZi5yZXBsYWNlKC8jJC8sXCJcIikucmVwbGFjZShuZXcgUmVnRXhwKHRoaXMuX2hhc2grXCIuKiRcIiksXCJcIikrdGhpcy5faGFzaCtlKSx0aGlzfSxvbjpmdW5jdGlvbigpe2Zvcih2YXIgdD10aGlzLG49YXJndW1lbnRzLmxlbmd0aCxvPUFycmF5KG4pLGk9MDtpPG47aSsrKW9baV09YXJndW1lbnRzW2ldO2lmKFwiZnVuY3Rpb25cIj09dHlwZW9mIG9bMF0pdGhpcy5fZGVmYXVsdEhhbmRsZXI9e2hhbmRsZXI6b1swXSxob29rczpvWzFdfTtlbHNlIGlmKG8ubGVuZ3RoPj0yKWlmKFwiL1wiPT09b1swXSl7dmFyIHI9b1sxXTtcIm9iamVjdFwiPT09ZShvWzFdKSYmKHI9b1sxXS51c2VzKSx0aGlzLl9kZWZhdWx0SGFuZGxlcj17aGFuZGxlcjpyLGhvb2tzOm9bMl19fWVsc2UgdGhpcy5fYWRkKG9bMF0sb1sxXSxvWzJdKTtlbHNlXCJvYmplY3RcIj09PWUob1swXSkmJk9iamVjdC5rZXlzKG9bMF0pLnNvcnQocykuZm9yRWFjaChmdW5jdGlvbihlKXt0Lm9uKGUsb1swXVtlXSl9KTtyZXR1cm4gdGhpc30sb2ZmOmZ1bmN0aW9uKGUpe3JldHVybiBudWxsIT09dGhpcy5fZGVmYXVsdEhhbmRsZXImJmU9PT10aGlzLl9kZWZhdWx0SGFuZGxlci5oYW5kbGVyP3RoaXMuX2RlZmF1bHRIYW5kbGVyPW51bGw6bnVsbCE9PXRoaXMuX25vdEZvdW5kSGFuZGxlciYmZT09PXRoaXMuX25vdEZvdW5kSGFuZGxlci5oYW5kbGVyJiYodGhpcy5fbm90Rm91bmRIYW5kbGVyPW51bGwpLHRoaXMuX3JvdXRlcz10aGlzLl9yb3V0ZXMucmVkdWNlKGZ1bmN0aW9uKHQsbil7cmV0dXJuIG4uaGFuZGxlciE9PWUmJnQucHVzaChuKSx0fSxbXSksdGhpc30sbm90Rm91bmQ6ZnVuY3Rpb24oZSx0KXtyZXR1cm4gdGhpcy5fbm90Rm91bmRIYW5kbGVyPXtoYW5kbGVyOmUsaG9va3M6dH0sdGhpc30scmVzb2x2ZTpmdW5jdGlvbihlKXt2YXIgbixvLGk9dGhpcyxzPShlfHx0aGlzLl9jTG9jKCkpLnJlcGxhY2UodGhpcy5fZ2V0Um9vdCgpLFwiXCIpO3RoaXMuX3VzZUhhc2gmJihzPXMucmVwbGFjZShuZXcgUmVnRXhwKFwiXi9cIit0aGlzLl9oYXNoKSxcIi9cIikpO3ZhciBhPWZ1bmN0aW9uKGUpe3JldHVybiBlLnNwbGl0KC9cXD8oLiopPyQvKS5zbGljZSgxKS5qb2luKFwiXCIpfShlfHx0aGlzLl9jTG9jKCkpLGw9aChzLHRoaXMuX3VzZUhhc2gsdGhpcy5faGFzaCk7cmV0dXJuIXRoaXMuX3BhdXNlZCYmKHRoaXMuX2xhc3RSb3V0ZVJlc29sdmVkJiZsPT09dGhpcy5fbGFzdFJvdXRlUmVzb2x2ZWQudXJsJiZhPT09dGhpcy5fbGFzdFJvdXRlUmVzb2x2ZWQucXVlcnk/KHRoaXMuX2xhc3RSb3V0ZVJlc29sdmVkLmhvb2tzJiZ0aGlzLl9sYXN0Um91dGVSZXNvbHZlZC5ob29rcy5hbHJlYWR5JiZ0aGlzLl9sYXN0Um91dGVSZXNvbHZlZC5ob29rcy5hbHJlYWR5KHRoaXMuX2xhc3RSb3V0ZVJlc29sdmVkLnBhcmFtcyksITEpOihvPXIobCx0aGlzLl9yb3V0ZXMpKT8odGhpcy5fY2FsbExlYXZlKCksdGhpcy5fbGFzdFJvdXRlUmVzb2x2ZWQ9e3VybDpsLHF1ZXJ5OmEsaG9va3M6by5yb3V0ZS5ob29rcyxwYXJhbXM6by5wYXJhbXMsbmFtZTpvLnJvdXRlLm5hbWV9LG49by5yb3V0ZS5oYW5kbGVyLHUoZnVuY3Rpb24oKXt1KGZ1bmN0aW9uKCl7by5yb3V0ZS5yb3V0ZSBpbnN0YW5jZW9mIFJlZ0V4cD9uLmFwcGx5KHZvaWQgMCxvLm1hdGNoLnNsaWNlKDEsby5tYXRjaC5sZW5ndGgpKTpuKG8ucGFyYW1zLGEpfSxvLnJvdXRlLmhvb2tzLG8ucGFyYW1zLGkuX2dlbmVyaWNIb29rcyl9LHRoaXMuX2dlbmVyaWNIb29rcyxvLnBhcmFtcyksbyk6dGhpcy5fZGVmYXVsdEhhbmRsZXImJihcIlwiPT09bHx8XCIvXCI9PT1sfHxsPT09dGhpcy5faGFzaHx8ZnVuY3Rpb24oZSxuLG8pe2lmKHQoKSYmIW4pcmV0dXJuITE7aWYoIWUubWF0Y2gobykpcmV0dXJuITE7dmFyIGk9ZS5zcGxpdChvKTtyZXR1cm4gaS5sZW5ndGg8Mnx8XCJcIj09PWlbMV19KGwsdGhpcy5fdXNlSGFzaCx0aGlzLl9oYXNoKSk/KHUoZnVuY3Rpb24oKXt1KGZ1bmN0aW9uKCl7aS5fY2FsbExlYXZlKCksaS5fbGFzdFJvdXRlUmVzb2x2ZWQ9e3VybDpsLHF1ZXJ5OmEsaG9va3M6aS5fZGVmYXVsdEhhbmRsZXIuaG9va3N9LGkuX2RlZmF1bHRIYW5kbGVyLmhhbmRsZXIoYSl9LGkuX2RlZmF1bHRIYW5kbGVyLmhvb2tzKX0sdGhpcy5fZ2VuZXJpY0hvb2tzKSwhMCk6KHRoaXMuX25vdEZvdW5kSGFuZGxlciYmdShmdW5jdGlvbigpe3UoZnVuY3Rpb24oKXtpLl9jYWxsTGVhdmUoKSxpLl9sYXN0Um91dGVSZXNvbHZlZD17dXJsOmwscXVlcnk6YSxob29rczppLl9ub3RGb3VuZEhhbmRsZXIuaG9va3N9LGkuX25vdEZvdW5kSGFuZGxlci5oYW5kbGVyKGEpfSxpLl9ub3RGb3VuZEhhbmRsZXIuaG9va3MpfSx0aGlzLl9nZW5lcmljSG9va3MpLCExKSl9LGRlc3Ryb3k6ZnVuY3Rpb24oKXt0aGlzLl9yb3V0ZXM9W10sdGhpcy5fZGVzdHJveWVkPSEwLHRoaXMuX2xhc3RSb3V0ZVJlc29sdmVkPW51bGwsdGhpcy5fZ2VuZXJpY0hvb2tzPW51bGwsY2xlYXJUaW1lb3V0KHRoaXMuX2xpc3RlbmluZ0ludGVydmFsKSxcInVuZGVmaW5lZFwiIT10eXBlb2Ygd2luZG93JiYod2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJwb3BzdGF0ZVwiLHRoaXMuX29uTG9jYXRpb25DaGFuZ2UpLHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKFwiaGFzaGNoYW5nZVwiLHRoaXMuX29uTG9jYXRpb25DaGFuZ2UpKX0sdXBkYXRlUGFnZUxpbmtzOmZ1bmN0aW9uKCl7dmFyIGU9dGhpcztcInVuZGVmaW5lZFwiIT10eXBlb2YgZG9jdW1lbnQmJnRoaXMuX2ZpbmRMaW5rcygpLmZvckVhY2goZnVuY3Rpb24odCl7dC5oYXNMaXN0ZW5lckF0dGFjaGVkfHwodC5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIixmdW5jdGlvbihuKXtpZigobi5jdHJsS2V5fHxuLm1ldGFLZXkpJiZcImFcIj09bi50YXJnZXQudGFnTmFtZS50b0xvd2VyQ2FzZSgpKXJldHVybiExO3ZhciBvPWUuZ2V0TGlua1BhdGgodCk7ZS5fZGVzdHJveWVkfHwobi5wcmV2ZW50RGVmYXVsdCgpLGUubmF2aWdhdGUoby5yZXBsYWNlKC9cXC8rJC8sXCJcIikucmVwbGFjZSgvXlxcLysvLFwiL1wiKSkpfSksdC5oYXNMaXN0ZW5lckF0dGFjaGVkPSEwKX0pfSxnZW5lcmF0ZTpmdW5jdGlvbihlKXt2YXIgdD1hcmd1bWVudHMubGVuZ3RoPjEmJnZvaWQgMCE9PWFyZ3VtZW50c1sxXT9hcmd1bWVudHNbMV06e30sbj10aGlzLl9yb3V0ZXMucmVkdWNlKGZ1bmN0aW9uKG4sbyl7dmFyIGk7aWYoby5uYW1lPT09ZSlmb3IoaSBpbiBuPW8ucm91dGUsdCluPW4udG9TdHJpbmcoKS5yZXBsYWNlKFwiOlwiK2ksdFtpXSk7cmV0dXJuIG59LFwiXCIpO3JldHVybiB0aGlzLl91c2VIYXNoP3RoaXMuX2hhc2grbjpufSxsaW5rOmZ1bmN0aW9uKGUpe3JldHVybiB0aGlzLl9nZXRSb290KCkrZX0scGF1c2U6ZnVuY3Rpb24oKXt2YXIgZT0hKGFyZ3VtZW50cy5sZW5ndGg+MCYmdm9pZCAwIT09YXJndW1lbnRzWzBdKXx8YXJndW1lbnRzWzBdO3RoaXMuX3BhdXNlZD1lLHRoaXMuX2hpc3RvcnlBUElVcGRhdGVNZXRob2Q9ZT9cInJlcGxhY2VTdGF0ZVwiOlwicHVzaFN0YXRlXCJ9LHJlc3VtZTpmdW5jdGlvbigpe3RoaXMucGF1c2UoITEpfSxoaXN0b3J5QVBJVXBkYXRlTWV0aG9kOmZ1bmN0aW9uKGUpe3JldHVybiB2b2lkIDA9PT1lP3RoaXMuX2hpc3RvcnlBUElVcGRhdGVNZXRob2Q6KHRoaXMuX2hpc3RvcnlBUElVcGRhdGVNZXRob2Q9ZSxlKX0sZGlzYWJsZUlmQVBJTm90QXZhaWxhYmxlOmZ1bmN0aW9uKCl7dCgpfHx0aGlzLmRlc3Ryb3koKX0sbGFzdFJvdXRlUmVzb2x2ZWQ6ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5fbGFzdFJvdXRlUmVzb2x2ZWR9LGdldExpbmtQYXRoOmZ1bmN0aW9uKGUpe3JldHVybiBlLmdldEF0dHJpYnV0ZShcImhyZWZcIil9LGhvb2tzOmZ1bmN0aW9uKGUpe3RoaXMuX2dlbmVyaWNIb29rcz1lfSxfYWRkOmZ1bmN0aW9uKHQpe3ZhciBuPWFyZ3VtZW50cy5sZW5ndGg+MSYmdm9pZCAwIT09YXJndW1lbnRzWzFdP2FyZ3VtZW50c1sxXTpudWxsLG89YXJndW1lbnRzLmxlbmd0aD4yJiZ2b2lkIDAhPT1hcmd1bWVudHNbMl0/YXJndW1lbnRzWzJdOm51bGw7cmV0dXJuXCJzdHJpbmdcIj09dHlwZW9mIHQmJih0PWVuY29kZVVSSSh0KSksdGhpcy5fcm91dGVzLnB1c2goXCJvYmplY3RcIj09PSh2b2lkIDA9PT1uP1widW5kZWZpbmVkXCI6ZShuKSk/e3JvdXRlOnQsaGFuZGxlcjpuLnVzZXMsbmFtZTpuLmFzLGhvb2tzOm98fG4uaG9va3N9Ontyb3V0ZTp0LGhhbmRsZXI6bixob29rczpvfSksdGhpcy5fYWRkfSxfZ2V0Um9vdDpmdW5jdGlvbigpe3JldHVybiBudWxsIT09dGhpcy5yb290P3RoaXMucm9vdDoodGhpcy5yb290PWEodGhpcy5fY0xvYygpLnNwbGl0KFwiP1wiKVswXSx0aGlzLl9yb3V0ZXMpLHRoaXMucm9vdCl9LF9saXN0ZW46ZnVuY3Rpb24oKXt2YXIgZT10aGlzO2lmKHRoaXMuX3VzZVB1c2hTdGF0ZSl3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcInBvcHN0YXRlXCIsdGhpcy5fb25Mb2NhdGlvbkNoYW5nZSk7ZWxzZSBpZihcInVuZGVmaW5lZFwiIT10eXBlb2Ygd2luZG93JiZcIm9uaGFzaGNoYW5nZVwiaW4gd2luZG93KXdpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwiaGFzaGNoYW5nZVwiLHRoaXMuX29uTG9jYXRpb25DaGFuZ2UpO2Vsc2V7dmFyIHQ9dGhpcy5fY0xvYygpLG49dm9pZCAwLG89dm9pZCAwOyhvPWZ1bmN0aW9uKCl7bj1lLl9jTG9jKCksdCE9PW4mJih0PW4sZS5yZXNvbHZlKCkpLGUuX2xpc3RlbmluZ0ludGVydmFsPXNldFRpbWVvdXQobywyMDApfSkoKX19LF9jTG9jOmZ1bmN0aW9uKCl7cmV0dXJuXCJ1bmRlZmluZWRcIiE9dHlwZW9mIHdpbmRvdz92b2lkIDAhPT13aW5kb3cuX19OQVZJR09fV0lORE9XX0xPQ0FUSU9OX01PQ0tfXz93aW5kb3cuX19OQVZJR09fV0lORE9XX0xPQ0FUSU9OX01PQ0tfXzpvKHdpbmRvdy5sb2NhdGlvbi5ocmVmKTpcIlwifSxfZmluZExpbmtzOmZ1bmN0aW9uKCl7cmV0dXJuW10uc2xpY2UuY2FsbChkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFwiW2RhdGEtbmF2aWdvXVwiKSl9LF9vbkxvY2F0aW9uQ2hhbmdlOmZ1bmN0aW9uKCl7dGhpcy5yZXNvbHZlKCl9LF9jYWxsTGVhdmU6ZnVuY3Rpb24oKXt2YXIgZT10aGlzLl9sYXN0Um91dGVSZXNvbHZlZDtlJiZlLmhvb2tzJiZlLmhvb2tzLmxlYXZlJiZlLmhvb2tzLmxlYXZlKGUucGFyYW1zKX19LG4uUEFSQU1FVEVSX1JFR0VYUD0vKFs6Kl0pKFxcdyspL2csbi5XSUxEQ0FSRF9SRUdFWFA9L1xcKi9nLG4uUkVQTEFDRV9WQVJJQUJMRV9SRUdFWFA9XCIoW14vXSspXCIsbi5SRVBMQUNFX1dJTERDQVJEPVwiKD86LiopXCIsbi5GT0xMT1dFRF9CWV9TTEFTSF9SRUdFWFA9XCIoPzovJHwkKVwiLG4uTUFUQ0hfUkVHRVhQX0ZMQUdTPVwiXCIsbn0pO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9bmF2aWdvLm1pbi5qcy5tYXBcbiIsImNvbnN0IEFwcCA9IHJlcXVpcmUoJy4vc2NyaXB0cy9BcHAuanMnKTtcblxuXG5pZiAoZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcikge1xuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJET01Db250ZW50TG9hZGVkXCIsIEFwcCwgZmFsc2UpO1xufSBlbHNlIGlmIChkb2N1bWVudC5hdHRhY2hFdmVudCkge1xuICAgIGRvY3VtZW50LmF0dGFjaEV2ZW50KFwib25yZWFkeXN0YXRlY2hhbmdlXCIsIEFwcCk7XG59IGVsc2Uge1xuICAgIHdpbmRvdy5vbmxvYWQgPSBBcHA7XG59XG4iLCJjb25zdCBSb3V0ZXIgPSByZXF1aXJlKFwiLi9yb3V0ZXIvUm91dGVyLmpzXCIpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHN0YXJ0QXBwICgpIHtcbiAgICBuZXcgUm91dGVyKCkub24oZnVuY3Rpb24gKCkge1xuICAgICAgICB3aW5kb3cubG9jYXRpb24uaGFzaCA9IFwiaG9tZVwiO1xuICAgIH0pLnJlc29sdmUoKTtcbn1cbiIsImNvbnN0IEJhc2VWaWV3ID0gcmVxdWlyZShcIi4uL2NvcmUvQmFzZVZpZXcuanNcIik7XG5cblxuY29uc3QgRm9vdGVyID0gKGZ1bmN0aW9uICgpIHtcbiAgICBjb25zdCBGb290ZXIgPSBCYXNlVmlldy5leHRlbmQoZnVuY3Rpb24gKGVsLCB0ZW1wbGF0ZSkge1xuICAgICAgICBjb25zdCBzZWxmID0gdGhpcztcbiAgICAgICAgdGhpcy5yZW5kZXIoKTtcbiAgICB9KTtcblxuICAgIEZvb3Rlci5wcm90b3R5cGUub25SZW5kZXIgPSBmdW5jdGlvbiBvblJlbmRlciAoKSB7XG4gICAgICAgIC8vIFRPIE9WRVJXUklURVxuICAgIH1cblxuICAgIHJldHVybiBGb290ZXI7XG59KSgpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEZvb3RlcjsiLCJjb25zdCBCYXNlVmlldyA9IHJlcXVpcmUoXCIuLi9jb3JlL0Jhc2VWaWV3LmpzXCIpO1xuXG5cbmNvbnN0IEhlYWRlciA9IChmdW5jdGlvbiAoKSB7XG5cbiAgICBjb25zdCBIZWFkZXIgPSBCYXNlVmlldy5leHRlbmQoZnVuY3Rpb24gKGVsLCB0ZW1wbGF0ZSkge1xuICAgICAgICBjb25zdCBzZWxmID0gdGhpcztcbiAgICAgICAgdGhpcy5yZW5kZXIoKTtcbiAgICB9KTtcblxuICAgIEhlYWRlci5wcm90b3R5cGUub25SZW5kZXIgPSBmdW5jdGlvbiBvblJlbmRlciAoKSB7XG4gICAgICAgIEFycmF5LmFwcGx5KG51bGwsIHRoaXMuZWwuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZShcImhlYWRlcl9fbGlua1wiKSkuZm9yRWFjaChsaW5rID0+IHtcbiAgICAgICAgICAgIGxpbmsuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGZ1bmN0aW9uIChldikge1xuICAgICAgICAgICAgICAgIGV2LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAgICAgZXYuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICAgICAgbG9jYXRpb24uaGFzaCA9IHRoaXMuY2hpbGRyZW5bMF0uZ2V0QXR0cmlidXRlKFwiaHJlZlwiKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICByZXR1cm4gSGVhZGVyO1xufSkoKTtcblxubW9kdWxlLmV4cG9ydHMgPSBIZWFkZXI7IiwiY29uc3QgTXVzdGFjaGUgPSByZXF1aXJlKFwibXVzdGFjaGVcIik7XG5cbmNvbnN0IEJhc2VWaWV3ID0gKGZ1bmN0aW9uICgpIHtcblxuICAgIC8vLyBQUklWQVRFIEJMT0NLIENPREVcbiAgICBmdW5jdGlvbiByZWFjdGl2ZSAob2JqKSB7XG4gICAgICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xuICAgICAgICByZXR1cm4gbmV3IFByb3h5KG9iaiwge1xuICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbiAoc2VsZiwga2V5KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHNlbGZba2V5XTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBzZXQ6IGZ1bmN0aW9uIChvYmosIGtleSwgdmFsdWUpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBvbGQgPSBvYmpba2V5XTtcbiAgICAgICAgICAgICAgICBjb25zdCBjaGFuZ2UgPSBvbGQgIT09IHZhbHVlO1xuICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgdmFsdWUgPT09IFwib2JqZWN0XCIpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFsdWUgPSByZWFjdGl2ZS5jYWxsKHNlbGYsIHZhbHVlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgb2JqW2tleV0gPSB2YWx1ZTtcbiAgICAgICAgICAgICAgICBpZiAoY2hhbmdlKSB7XG4gICAgICAgICAgICAgICAgICAgIHNlbGYuZGlzcGF0Y2goXCJ1cGRhdGVcIiwge1xuICAgICAgICAgICAgICAgICAgICAgICAga2V5OiBrZXksXG4gICAgICAgICAgICAgICAgICAgICAgICB0bzogdmFsdWUsXG4gICAgICAgICAgICAgICAgICAgICAgICBmcm9tOiBvbGRcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgdmFyIHByaXZhdGFfZGF0YTtcbiAgICAvLy8gRU5EIE9GIFBSSVZBVEUgQkxPQ0sgQ09ERVxuXG4gICAgY29uc3QgQmFzZVZpZXcgPSBmdW5jdGlvbiBCYXNlVmlldyAoZWwsIHRlbXBsYXRlKSB7XG4gICAgICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xuICAgICAgICB0aGlzLmVsID0gZWw7XG4gICAgICAgIHRoaXMudGVtcGxhdGUgPSB0ZW1wbGF0ZTtcbiAgICAgICAgXG4gICAgICAgIHByaXZhdGVfZGF0YSA9IHJlYWN0aXZlLmNhbGwodGhpcywgbmV3IE9iamVjdCgpKTtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsIFwiZGF0YVwiLCB7XG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcHJpdmF0YV9kYXRhO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHNldDogZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAgICAgICAgICAgICBwcml2YXRhX2RhdGEgPSByZWFjdGl2ZS5jYWxsKHNlbGYsIGRhdGEpO1xuICAgICAgICAgICAgICAgIHNlbGYuZGlzcGF0Y2goXCJ1cGRhdGVcIik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRoaXMuZXZlbnRCb3VuZHMgPSBuZXcgTWFwKCk7XG4gICAgICAgIHRoaXMub24oXCJiZWZvcmU6cmVuZGVyXCIsIHRoaXMuYmVmb3JlUmVuZGVyLCB0aGlzKTtcbiAgICAgICAgdGhpcy5vbihcInJlbmRlclwiLCB0aGlzLm9uUmVuZGVyLCB0aGlzKTtcbiAgICAgICAgdGhpcy5vbihcImJlZm9yZTpyZW1vdmVcIiwgdGhpcy5iZWZvcmVSZW1vdmUsIHRoaXMpO1xuICAgICAgICB0aGlzLm9uKFwicmVtb3ZlXCIsIHRoaXMub25SZW1vdmUsIHRoaXMpO1xuICAgICAgICB0aGlzLm9uKFwiYmVmb3JlOnVwZGF0ZVwiLCB0aGlzLmJlZm9yZVVwZGF0ZSwgdGhpcyk7XG4gICAgICAgIHRoaXMub24oXCJ1cGRhdGVcIiwgdGhpcy5vblVwZGF0ZSwgdGhpcyk7XG4gICAgfVxuXG4gICAgQmFzZVZpZXcucHJvdG90eXBlLnJlbmRlciA9IGZ1bmN0aW9uIHJlbmRlciAoKSB7XG4gICAgICAgIHRoaXMuZGlzcGF0Y2goXCJiZWZvcmU6cmVuZGVyXCIsIHRoaXMuZWwpO1xuICAgICAgICBjb25zdCByZW5kZXJlciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJ0ZW1wbGF0ZVwiKTtcbiAgICAgICAgcmVuZGVyZXIuaW5uZXJIVE1MID0gTXVzdGFjaGUucmVuZGVyKHRoaXMudGVtcGxhdGUsIHRoaXMuZGF0YSk7XG4gICAgICAgIHRoaXMuZWwuaW5uZXJIVE1MID0gXCJcIjtcbiAgICAgICAgdGhpcy5lbC5hcHBlbmRDaGlsZChyZW5kZXJlci5jb250ZW50KTtcbiAgICAgICAgdGhpcy5kaXNwYXRjaChcInJlbmRlclwiLCB0aGlzLmVsKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgQmFzZVZpZXcucHJvdG90eXBlLnJlbW92ZSA9IGZ1bmN0aW9uIHJlbW92ZSAoKSB7XG4gICAgICAgIHRoaXMuZGlzcGF0Y2goXCJiZWZvcmU6cmVtb3ZlXCIsIHRoaXMuZWwpO1xuICAgICAgICBmb3IgKGxldCBlbnRyeSBvZiB0aGlzLmV2ZW50Qm91bmRzLmVudHJpZXMoKSkge1xuICAgICAgICAgICAgdGhpcy5lbC5yZW1vdmVFdmVudExpc3RlbmVyKC4uLmVudHJ5KVxuICAgICAgICB9XG4gICAgICAgIHRoaXMuZGlzcGF0Y2goXCJyZW1vdmVcIiwgdGhpcy5lbCk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIEJhc2VWaWV3LnByb3RvdHlwZS5iZWZvcmVSZW5kZXIgPSBmdW5jdGlvbiBiZWZvcmVSZW5kZXIgKCkge1xuICAgICAgICAvLyBUTyBPVkVSV1JJVEVcbiAgICB9XG5cbiAgICBCYXNlVmlldy5wcm90b3R5cGUub25SZW5kZXIgPSBmdW5jdGlvbiBvblJlbmRlciAoKSB7XG4gICAgICAgIC8vIFRPIE9WRVJXUklURVxuICAgIH1cblxuICAgIEJhc2VWaWV3LnByb3RvdHlwZS5iZWZvcmVSZW1vdmUgPSBmdW5jdGlvbiBiZWZvcmVSZW1vdmUgKCkge1xuICAgICAgICAvLyBUTyBPVkVSV1JJVEVcbiAgICB9XG5cbiAgICBCYXNlVmlldy5wcm90b3R5cGUub25SZW1vdmUgPSBmdW5jdGlvbiBvblJlbW92ZSAoKSB7XG4gICAgICAgIC8vIFRPIE9WRVJXUklURVxuICAgIH1cblxuICAgIEJhc2VWaWV3LnByb3RvdHlwZS5iZWZvcmVVcGRhdGUgPSBmdW5jdGlvbiBiZWZvcmVVcGRhdGUgKCkge1xuICAgICAgICAvLyBUTyBPVkVSV1JJVEVcbiAgICB9XG5cbiAgICBCYXNlVmlldy5wcm90b3R5cGUub25VcGRhdGUgPSBmdW5jdGlvbiBvblVwZGF0ZSAoKSB7XG4gICAgICAgIC8vIFRPIE9WRVJXUklURVxuICAgIH1cblxuICAgIEJhc2VWaWV3LnByb3RvdHlwZS5vbiA9IGZ1bmN0aW9uIG9uIChldmVudCwgY2FsbGJhY2ssIGNvbnRleHQ9bnVsbCkge1xuICAgICAgICB0aGlzLmV2ZW50Qm91bmRzLnNldChldmVudCwgZnVuY3Rpb24gKGV2KSB7XG4gICAgICAgICAgICBjYWxsYmFjay5jYWxsKGNvbnRleHQsIGV2ZW50LCBldi5kZXRhaWxzLCBldik7XG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLmVsLmFkZEV2ZW50TGlzdGVuZXIoZXZlbnQsIHRoaXMuZXZlbnRCb3VuZHMuZ2V0KGV2ZW50KSk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIEJhc2VWaWV3LnByb3RvdHlwZS5vZmYgPSBmdW5jdGlvbiBvZmYgKGV2ZW50KSB7XG4gICAgICAgIHRoaXMuZWwucmVtb3ZlRXZlbnRMaXN0ZW5lcihldmVudCwgdGhpcy5ldmVudEJvdW5kcy5nZXQoZXZlbnQpKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgQmFzZVZpZXcucHJvdG90eXBlLmRpc3BhdGNoID0gZnVuY3Rpb24gZGlzcGF0Y2ggKGV2ZW50LCBkYXRhKSB7XG4gICAgICAgIHRoaXMuZWwuZGlzcGF0Y2hFdmVudChuZXcgQ3VzdG9tRXZlbnQoZXZlbnQsIHtcbiAgICAgICAgICAgIGRldGFpbDogZGF0YVxuICAgICAgICB9KSk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIEJhc2VWaWV3LnByb3RvdHlwZS5sb2FkID0gZnVuY3Rpb24gbG9hZCAocGF0aCwgdHlwZSwgZGF0YSkge1xuICAgICAgICBjb25zdCBzZWxmID0gdGhpcztcbiAgICAgICAgdHlwZSA9IHR5cGUgfHwgXCJHRVRcIjtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXMsIHJlaikge1xuICAgICAgICAgICAgY29uc3QgYWpheCA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xuICAgICAgICAgICAgYWpheC5vcGVuKHR5cGUsIHBhdGgpO1xuICAgICAgICAgICAgYWpheC5vbnJlYWR5c3RhdGVjaGFuZ2UgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMucmVhZHlTdGF0ZSA9PT0gNCkge1xuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5zdGF0dXMgPT09IDIwMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVzKHRoaXMucmVzcG9uc2UpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVqKHRoaXMuc3RhdHVzKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGFqYXguc2VuZChkYXRhKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgQmFzZVZpZXcuZXh0ZW5kID0gZnVuY3Rpb24gZXh0ZW5kIChDbGFzcykge1xuICAgICAgICBjb25zdCBXcmFwcGVyID0gZnVuY3Rpb24gKGVsLCB0ZW1wbGF0ZSkge1xuICAgICAgICAgICAgQmFzZVZpZXcuY2FsbCh0aGlzLCBlbCwgdGVtcGxhdGUpO1xuICAgICAgICAgICAgQ2xhc3MuY2FsbCh0aGlzLCBlbCwgdGVtcGxhdGUpO1xuICAgICAgICB9XG5cbiAgICAgICAgQ2xhc3MucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShCYXNlVmlldy5wcm90b3R5cGUpO1xuICAgICAgICBXcmFwcGVyLnByb3RvdHlwZSA9IENsYXNzLnByb3RvdHlwZTtcbiAgICAgICAgV3JhcHBlci5leHRlbmQgPSBCYXNlVmlldy5wcm90b3R5cGUuZXh0ZW5kO1xuICAgICAgICByZXR1cm4gV3JhcHBlclxuICAgIH1cblxuICAgIHJldHVybiBCYXNlVmlldztcbn0pKCk7XG5cbm1vZHVsZS5leHBvcnRzID0gQmFzZVZpZXc7IiwiLy8gVkVORE9SXG5jb25zdCBOYXZpZ28gPSByZXF1aXJlKFwibmF2aWdvXCIpO1xuXG4vLyBDT01QT05FTlRTXG5jb25zdCBIZWFkZXIgPSByZXF1aXJlKFwiLi4vY29tcG9uZW50cy9IZWFkZXIuanNcIik7XG5jb25zdCBGb290ZXIgPSByZXF1aXJlKFwiLi4vY29tcG9uZW50cy9Gb290ZXIuanNcIik7XG5cbi8vIFZJRVdTXG5jb25zdCBIb21lID0gcmVxdWlyZShcIi4uL3ZpZXdzL0hvbWUuanNcIik7XG5jb25zdCBQcm9qZWN0ID0gcmVxdWlyZShcIi4uL3ZpZXdzL1Byb2plY3QuanNcIik7XG5jb25zdCBEb2N1bWVudHMgPSByZXF1aXJlKFwiLi4vdmlld3MvRG9jdW1lbnRzLmpzXCIpO1xuY29uc3QgR2FsbGVyeSA9IHJlcXVpcmUoXCIuLi92aWV3cy9HYWxsZXJ5LmpzXCIpO1xuXG5cbmNvbnN0IFJvdXRlciA9IChmdW5jdGlvbiAoKSB7XG4gICAgLy8gUFJJVkFURSBDT0RFIEJMT0NLXG4gICAgZnVuY3Rpb24gYmVmb3JlTmF2aWdhdGUgKGNzc0VsKSB7XG4gICAgICAgIGNvbnN0IGVsID0gZG9jdW1lbnQucXVlcnlTZWxlY3Rvcihjc3NFbCk7XG4gICAgICAgIGlmIChlbCAmJiB0aGlzLnZpZXdzLmdldChlbCkpIHtcbiAgICAgICAgICAgIHRoaXMudmlld3MuZ2V0KGVsKS5yZW1vdmUoKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBjb25zdCBjYWNoZSA9IG5ldyBNYXAoKTtcbiAgICAvLyBFTkQgT0YgUFJJVkFURSBDT0RFIEJMT0NLXG4gICAgXG4gICAgY29uc3QgUm91dGVyID0gZnVuY3Rpb24gUm91dGVyICgpIHtcbiAgICAgICAgY29uc3Qgc2VsZiA9IHRoaXM7XG4gICAgICAgIHRoaXMudmlld3MgPSBuZXcgTWFwKCk7XG4gICAgICAgIHRoaXMubmF2aWdvID0gbmV3IE5hdmlnbyhudWxsLCB0cnVlLCBcIiNcIik7XG4gICAgXG4gICAgICAgIHRoaXMubmF2aWdvLm9uKFwiaG9tZVwiLCBzZWxmLm9uTmF2aWdhdGUoXCJob21lLmh0bWxcIiwgXCIjY29udGVudFwiLCBIb21lKSlcbiAgICAgICAgICAgIC5yZXNvbHZlKCk7XG4gICAgXG4gICAgICAgIHRoaXMubmF2aWdvLm9uKFwicHJvamVjdFwiLCBzZWxmLm9uTmF2aWdhdGUoXCJwcm9qZWN0Lmh0bWxcIiwgXCIjY29udGVudFwiLCBQcm9qZWN0KSlcbiAgICAgICAgICAgIC5yZXNvbHZlKCk7XG4gICAgXG4gICAgICAgIHRoaXMubmF2aWdvLm9uKFwiZG9jdW1lbnRzXCIsIHNlbGYub25OYXZpZ2F0ZShcImRvY3VtZW50cy5odG1sXCIsIFwiI2NvbnRlbnRcIiwgRG9jdW1lbnRzKSlcbiAgICAgICAgICAgIC5yZXNvbHZlKCk7XG5cbiAgICAgICAgdGhpcy5uYXZpZ28ub24oXCJnYWxsZXJ5XCIsIHNlbGYub25OYXZpZ2F0ZShcImdhbGxlcnkuaHRtbFwiLCBcIiNjb250ZW50XCIsIEdhbGxlcnkpKVxuICAgICAgICAgICAgLnJlc29sdmUoKTtcblxuICAgICAgICBzZWxmLmFqYXgoXCJ0ZW1wbGF0ZXMvaGVhZGVyLmh0bWxcIikudGhlbihmdW5jdGlvbiAodGVtcGxhdGUpIHtcbiAgICAgICAgICAgIGNvbnN0IGVsID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcImhlYWRlclwiKTtcbiAgICAgICAgICAgIGNvbnN0IHZpZXcgPSBuZXcgSGVhZGVyKGVsLCB0ZW1wbGF0ZSk7XG4gICAgICAgICAgICBzZWxmLnZpZXdzLnNldChlbCwgdmlldyk7XG4gICAgICAgIH0pO1xuICAgICAgICBcbiAgICAgICAgc2VsZi5hamF4KFwidGVtcGxhdGVzL2Zvb3Rlci5odG1sXCIpLnRoZW4oZnVuY3Rpb24gKHRlbXBsYXRlKSB7XG4gICAgICAgICAgICBjb25zdCBlbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCJmb290ZXJcIik7XG4gICAgICAgICAgICBjb25zdCB2aWV3ID0gbmV3IEZvb3RlcihlbCwgdGVtcGxhdGUpO1xuICAgICAgICAgICAgc2VsZi52aWV3cy5zZXQoZWwsIHZpZXcpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBSb3V0ZXIucHJvdG90eXBlLm9uTmF2aWdhdGUgPSBmdW5jdGlvbiBvbk5hdmlnYXRlICh0ZW1wbGF0ZU5hbWUsIGNzc0VsLCBWaWV3KSB7XG4gICAgICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgaWYgKGNhY2hlLmdldCh0ZW1wbGF0ZU5hbWUpKSB7XG4gICAgICAgICAgICAgICAgYmVmb3JlTmF2aWdhdGUuY2FsbChzZWxmLCBjc3NFbCk7XG4gICAgICAgICAgICAgICAgY29uc3QgZWwgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGNzc0VsKTtcbiAgICAgICAgICAgICAgICBjb25zdCB2aWV3ID0gbmV3IFZpZXcoZWwsIGNhY2hlLmdldCh0ZW1wbGF0ZU5hbWUpKTtcbiAgICAgICAgICAgICAgICBzZWxmLnZpZXdzLnNldChlbCwgdmlldyk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHNlbGYuYWpheChcInRlbXBsYXRlcy9cIiArIHRlbXBsYXRlTmFtZSlcbiAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbiAodGVtcGxhdGUpIHtcbiAgICAgICAgICAgICAgICAgICAgY2FjaGUuc2V0KHRlbXBsYXRlTmFtZSwgdGVtcGxhdGUpO1xuICAgICAgICAgICAgICAgICAgICBiZWZvcmVOYXZpZ2F0ZS5jYWxsKHNlbGYsIGNzc0VsKTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZWwgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGNzc0VsKTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgdmlldyA9IG5ldyBWaWV3KGVsLCB0ZW1wbGF0ZSk7XG4gICAgICAgICAgICAgICAgICAgIHNlbGYudmlld3Muc2V0KGVsLCB2aWV3KTsgICAgXG4gICAgICAgICAgICAgICAgfSk7ICAgXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBSb3V0ZXIucHJvdG90eXBlLmFqYXggPSBmdW5jdGlvbiBhamF4IChwYXRoKSB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbiAocmVzLCByZWopIHtcbiAgICAgICAgICAgIHZhciBhamF4ID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG4gICAgICAgICAgICBhamF4Lm9wZW4oXCJHRVRcIiwgd2luZG93Ll9lbnYucHVibGljVVJMICsgcGF0aCwgdHJ1ZSk7XG4gICAgICAgICAgICBhamF4Lm9ucmVhZHlzdGF0ZWNoYW5nZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5yZWFkeVN0YXRlID09PSA0KSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLnN0YXR1cyA9PT0gMjAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXModGhpcy5yZXNwb25zZSk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZWoodGhpcyk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBhamF4LnNlbmQoKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgUm91dGVyLnByb3RvdHlwZS5vbiA9IGZ1bmN0aW9uIG9uICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMubmF2aWdvLm9uLmFwcGx5KHRoaXMubmF2aWdvLCBhcmd1bWVudHMpO1xuICAgIH1cblxuICAgIHJldHVybiBSb3V0ZXI7XG59KSgpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJvdXRlcjsiLCJjb25zdCBCYXNlVmlldyA9IHJlcXVpcmUoXCIuLi9jb3JlL0Jhc2VWaWV3LmpzXCIpO1xuXG5cbmNvbnN0IERvY3VtZW50cyA9IChmdW5jdGlvbiAoKSB7XG5cbiAgICAvLy8gUFJJVkFURSBCTE9DSyBDT0RFXG4gICAgdmFyIHJlbmRlckNvdW50ID0gMDtcbiAgICAvLy8gRU5EIE9GIFBSSVZBVEUgQkxPQ0sgQ09ERVxuICAgIFxuICAgIHZhciBEb2N1bWVudHMgPSBmdW5jdGlvbiAoZWwsIHRlbXBsYXRlKSB7XG4gICAgICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xuICAgICAgICB0aGlzLmxvYWQoX2Vudi5hcGlVUkwgKyBcImRvY3VtZW50cy5qc29uXCIpLnRoZW4oZnVuY3Rpb24gKHJlc3BvbnNlKSB7IFxuICAgICAgICAgICAgLy8gdGhpcyA9PSBmdW5jacOzIGFub25pbWFcbiAgICAgICAgICAgIC8vIHNlbGYgPT0gRG9jdW1lbnRzXG4gICAgICAgICAgICBzZWxmLmRhdGEgPSBKU09OLnBhcnNlKHJlc3BvbnNlKTtcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIERvY3VtZW50cyA9IEJhc2VWaWV3LmV4dGVuZChEb2N1bWVudHMpO1xuXG4gICAgRG9jdW1lbnRzLnByb3RvdHlwZS5vblVwZGF0ZSA9IGZ1bmN0aW9uIG9uVXBkYXRlICgpIHtcbiAgICAgICAgY29uc29sZS5sb2coXCJEb2N1bWVudHMgdXBkYXRlZFwiKTtcbiAgICAgICAgdGhpcy5yZW5kZXIoKTtcbiAgICB9XG5cbiAgICBEb2N1bWVudHMucHJvdG90eXBlLm9uUmVuZGVyID0gZnVuY3Rpb24gb25SZW5kZXIgKCkge1xuICAgICAgICBjb25zdCBzZWxmID0gdGhpcztcbiAgICAgICAgZm9yIChsZXQgZG9jIG9mIHNlbGYuZWwucXVlcnlTZWxlY3RvckFsbChcIi5kb2Mtcm93XCIpKSB7XG4gICAgICAgICAgICBkb2MuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIHNlbGYub25DbGlja0RvY3VtZW50KTtcbiAgICAgICAgfVxuICAgICAgICAvLyBjb25zdCBsaXN0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInVsXCIpO1xuICAgICAgICAvLyBzZWxmLmRhdGEuZm9yRWFjaChmdW5jdGlvbiAoZG9jKSB7XG4gICAgICAgIC8vICAgICB2YXIgbGluayA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJhXCIpO1xuICAgICAgICAvLyAgICAgbGluay5ocmVmID0gXCJzdGF0aWNzL2RhdGEvXCIgKyBkb2MuZmlsZTtcbiAgICAgICAgLy8gICAgIGxpbmsuc2V0QXR0cmlidXRlKFwidGFyZ2V0XCIsIFwiX2JsYW5rXCIpO1xuICAgICAgICAvLyAgICAgdmFyIGxpc3RFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImxpXCIpO1xuICAgICAgICAvLyAgICAgbGlzdEVsZW1lbnQuaW5uZXJUZXh0ID0gZG9jLm5hbWU7XG4gICAgICAgIC8vICAgICBsaXN0RWxlbWVudC5zZXRBdHRyaWJ1dGUoXCJkYXRhLWZpbGVcIiwgZG9jLmZpbGUpO1xuICAgICAgICAvLyAgICAgbGluay5hcHBlbmRDaGlsZChsaXN0RWxlbWVudCk7XG4gICAgICAgIC8vICAgICBsaXN0LmFwcGVuZENoaWxkKGxpbmspO1xuICAgICAgICAvLyB9KTtcbiAgICAgICAgLy8gdGhpcy5lbC5hcHBlbmRDaGlsZChsaXN0KTtcbiAgICAgICAgY29uc29sZS5sb2coXCJEb2N1bWVudHMgcmVuZGVyZWRcIik7XG4gICAgfVxuXG4gICAgRG9jdW1lbnRzLnByb3RvdHlwZS5vblJlbW92ZSA9IGZ1bmN0aW9uIG9uUmVtb3ZlICgpIHtcbiAgICAgICAgZm9yIChsZXQgZG9jIG9mIHNlbGYuZWwucXVlcnlTZWxlY3RvckFsbChcIi5kb2Mtcm93XCIpKSB7XG4gICAgICAgICAgICBkb2MucmVtb3ZlRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIHNlbGYub25DbGlja0RvY3VtZW50KTtcbiAgICAgICAgfVxuICAgICAgICBjb25zb2xlLmxvZyhcIkRvY3VtZW50cyByZW1vdmVkXCIpO1xuICAgIH1cblxuICAgIERvY3VtZW50cy5wcm90b3R5cGUub25DbGlja0RvY3VtZW50ID0gZnVuY3Rpb24gKGV2KSB7XG4gICAgICAgIHdpbmRvdy5vcGVuKFwic3RhdGljcy9kYXRhL1wiICsgZXYuY3VycmVudFRhcmdldC5kYXRhc2V0LmZpbGUpO1xuICAgIH1cblxuICAgIHJldHVybiBEb2N1bWVudHM7XG59KSgpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IERvY3VtZW50czsiLCJjb25zdCBCYXNlVmlldyA9IHJlcXVpcmUoXCIuLi9jb3JlL0Jhc2VWaWV3LmpzXCIpO1xuXG5cbmNvbnN0IEdhbGxlcnkgPSAoZnVuY3Rpb24gKCkge1xuXG4gICAgLy8vIFBSSVZBVEUgQkxPQ0sgQ09ERVxuICAgIHZhciByZW5kZXJDb3VudCA9IDA7XG4gICAgLy8vIEVORCBPRiBQUklWQVRFIEJMT0NLIENPREVcbiAgICBcbiAgICB2YXIgR2FsbGVyeSA9IGZ1bmN0aW9uIChlbCwgdGVtcGxhdGUpIHtcbiAgICAgICAgY29uc3Qgc2VsZiA9IHRoaXM7XG4gICAgICAgIHRoaXMubG9hZChfZW52LmFwaVVSTCArIFwiZ2FsbGVyeV9pbWFnZXMuanNvblwiKS50aGVuKGZ1bmN0aW9uIChyZXNwb25zZSkgeyBcbiAgICAgICAgICAgIHNlbGYuZGF0YSA9IEpTT04ucGFyc2UocmVzcG9uc2UpO1xuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgR2FsbGVyeSA9IEJhc2VWaWV3LmV4dGVuZChHYWxsZXJ5KTtcblxuICAgIEdhbGxlcnkucHJvdG90eXBlLm9uVXBkYXRlID0gZnVuY3Rpb24gb25VcGRhdGUgKCkge1xuICAgICAgICBjb25zb2xlLmxvZyhcIkdhbGxlcnkgdXBkYXRlZFwiKTtcbiAgICAgICAgdGhpcy5yZW5kZXIoKTtcbiAgICB9XG5cbiAgICBHYWxsZXJ5LnByb3RvdHlwZS5vblJlbmRlciA9IGZ1bmN0aW9uIG9uUmVuZGVyICgpIHtcbiAgICAgICAgY29uc3Qgc2VsZiA9IHRoaXM7XG4gICAgICAgIGZvciAobGV0IGltZyBvZiBzZWxmLmVsLnF1ZXJ5U2VsZWN0b3JBbGwoXCIuaW1nLXJvd1wiKSkge1xuICAgICAgICAgICAgaW1nLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBzZWxmLm9uQ2xpY2tJbWFnZSk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc29sZS5sb2coXCJHYWxsZXJ5IHJlbmRlcmVkXCIpO1xuICAgIH1cblxuICAgIEdhbGxlcnkucHJvdG90eXBlLm9uUmVtb3ZlID0gZnVuY3Rpb24gb25SZW1vdmUgKCkge1xuICAgICAgICBmb3IgKGxldCBpbWcgb2Ygc2VsZi5lbC5xdWVyeVNlbGVjdG9yQWxsKFwiLmltZy1yb3dcIikpIHtcbiAgICAgICAgICAgIGltZy5yZW1vdmVFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgc2VsZi5vbkNsaWNrSW1hZ2UpO1xuICAgICAgICB9XG4gICAgICAgIGNvbnNvbGUubG9nKFwiR2FsbGVyeSByZW1vdmVkXCIpO1xuICAgIH1cblxuICAgIEdhbGxlcnkucHJvdG90eXBlLm9uQ2xpY2tJbWFnZSA9IGZ1bmN0aW9uIChldikge1xuICAgICAgICBjb25zb2xlLmxvZyhcIkhhcyBjbGljYXQgc29icmUgdW5hIGltw6B0Z2UhXCIpO1xuICAgIH1cblxuICAgIHJldHVybiBHYWxsZXJ5O1xufSkoKTtcblxubW9kdWxlLmV4cG9ydHMgPSBHYWxsZXJ5OyIsImNvbnN0IEJhc2VWaWV3ID0gcmVxdWlyZShcIi4uL2NvcmUvQmFzZVZpZXcuanNcIik7XG5cblxuY29uc3QgSG9tZSA9IChmdW5jdGlvbiAoKSB7XG4gICAgY29uc3QgSG9tZSA9IEJhc2VWaWV3LmV4dGVuZChmdW5jdGlvbiAoZWwsIHRlbXBsYXRlKSB7XG4gICAgICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xuICAgICAgICB0aGlzLnJlbmRlcigpO1xuICAgIH0pO1xuXG4gICAgSG9tZS5wcm90b3R5cGUub25VcGRhdGUgPSBmdW5jdGlvbiBvblVwZGF0ZSAoKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwiSG9tZSB1cGRhdGVkXCIpO1xuICAgIH1cblxuICAgIEhvbWUucHJvdG90eXBlLm9uUmVuZGVyID0gZnVuY3Rpb24gb25SZW5kZXIgKCkge1xuICAgICAgICBjb25zb2xlLmxvZyhcIkhvbWUgcmVuZGVyZWRcIik7XG4gICAgfVxuXG4gICAgSG9tZS5wcm90b3R5cGUub25SZW1vdmUgPSBmdW5jdGlvbiBvblJlbW92ZSAoKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwiSG9tZSByZW1vdmVkXCIpO1xuICAgIH1cblxuICAgIHJldHVybiBIb21lO1xufSkoKTtcblxubW9kdWxlLmV4cG9ydHMgPSBIb21lOyIsImNvbnN0IEJhc2VWaWV3ID0gcmVxdWlyZShcIi4uL2NvcmUvQmFzZVZpZXcuanNcIik7XG5cblxuY29uc3QgUHJvamVjdCA9IChmdW5jdGlvbiAoKSB7XG4gICAgY29uc3QgUHJvamVjdCA9IEJhc2VWaWV3LmV4dGVuZChmdW5jdGlvbiBQcm9qZWN0IChlbCkge1xuICAgICAgICBjb25zdCBzZWxmID0gdGhpcztcbiAgICAgICAgdGhpcy5yZW5kZXIoKTtcbiAgICB9KTtcblxuICAgIFByb2plY3QucHJvdG90eXBlLm9uVXBkYXRlID0gZnVuY3Rpb24gb25VcGRhdGUgKCkge1xuICAgICAgICBjb25zb2xlLmxvZyhcIlByb2plY3QgdXBkYXRlZFwiKTtcbiAgICB9XG5cbiAgICBQcm9qZWN0LnByb3RvdHlwZS5vblJlbmRlciA9IGZ1bmN0aW9uIG9uUmVuZGVyICgpIHtcbiAgICAgICAgY29uc29sZS5sb2coXCJQcm9qZWN0IHJlbmRlcmVkXCIpO1xuICAgIH1cblxuICAgIFByb2plY3QucHJvdG90eXBlLm9uUmVtb3ZlID0gZnVuY3Rpb24gb25SZW1vdmUgKCkge1xuICAgICAgICBjb25zb2xlLmxvZyhcIlByb2plY3QgcmVtb3ZlZFwiKTtcbiAgICB9XG5cbiAgICByZXR1cm4gUHJvamVjdDtcbn0pKCk7XG5cbm1vZHVsZS5leHBvcnRzID0gUHJvamVjdDsiXX0=
