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
const Lng = require("./utils/Lng.js");
const AppRouter = require("./router/AppRouter.js");
const ScrollHandler = require("./utils/ScrollHandler.js");

// COMPONENTS
const Header = require("./components/Header.js");
const Footer = require("./components/Footer.js");

// VIEWS
const Cover = require("./views/home-sections/Cover.js");
const Manifest = require("./views/home-sections/Manifest.js");
const Project = require("./views/home-sections/Project.js");
const Gallery = require("./views/home-sections/Gallery.js");
const Team = require("./views/home-sections/Team.js");
const Sponsors = require("./views/home-sections/Sponsors.js");
const Documents = require("./views/home-sections/Documents.js");


const homeSections = [
    {
        id: "cover",
        view: Cover,
    },
    {
        id: "manifest",
        view: Manifest
    },
    {
        id: "project",
        view: Project
    },
    {
        id: "gallery",
        view: Gallery
    },
    {
        id: "team",
        view: Team
    },
    {
        id: "sponsors",
        view: Sponsors
    },
    {
        id: "documents",
        view: Documents
    }
];

function startLng (app) {
    return new Promise(function (done, err) {
        fetch(_env.apiURL + "lng.json").then(function (res) {
            res.json().then(function (dictionaries) {
                app.lng = new Lng(dictionaries);
                done(app);
            });
        });
    });
};

function startComponents (app) {
    return new Promise(function (done, err) {
        const parsers = new Array();
        Promise.all([
            fetch(_env.publicURL + "templates/components/header.html").then(function (res) {
                parsers.push(res.text().then(function (template) {
                    const el = document.querySelector("header");
                    app.header = new Header(el, template, {
                        app: app
                    });
                }));
            }),
            fetch(_env.publicURL + "templates/components/footer.html").then(function (res) {
                parsers.push(res.text().then(function (template) {
                    const el = document.querySelector("footer");
                    app.footer = new Footer(el, template, {
                        app: app
                    });
                }));
            })
        ]).then(function () {
            Promise.all(parsers).then(function () {
                done(app);
            });
        });
    });
};

function startApp (app) {
    return new Promise(function (done, error) {
        app.router = new AppRouter(app).on(function () {
            app.router.navigate(app.router.generate("home-section", {
                section: "cover"
            }));
        });
        app.router.hooks({
            before: function (done, params) {
                app.router.ev.dispatch("before:navigate");
                done();
            },
            after: function () {
                app.router.ev.dispatch("navigate");
            }
        });

        function firstNavigation () {
            app.router.ev.off("navigate", firstNavigation);
            app.router.ev.on("navigate", onNavigate);
            app.header.onNavigate();
            done(app);
        };

        function onNavigate () {
            !(app.router.silent || app.scroll.scrolling) && app.header.onNavigate();
        };

        app.router.ev.on("navigate", firstNavigation);
        app.router.resolve();
    });
};

function scrollPatch (app) {
    app.scroll= new ScrollHandler(app);
    return app;
}


module.exports = function App () {
    const app = new Object();
    app.el = document.getElementById("app");
    app.homeSections = homeSections;
    app.touchable = 'ontouchstart' in window
        || navigator.maxTouchPoints > 0
        || navigator.msMaxTouchPoints > 0;
    new Promise(function (done, err) {
        done(app);
    }).then(startLng)
        .then(scrollPatch)
        .then(startComponents)
        .then(startApp);
};

},{"./components/Footer.js":5,"./components/Header.js":6,"./router/AppRouter.js":11,"./utils/Lng.js":13,"./utils/ScrollHandler.js":14,"./views/home-sections/Cover.js":19,"./views/home-sections/Documents.js":20,"./views/home-sections/Gallery.js":21,"./views/home-sections/Manifest.js":22,"./views/home-sections/Project.js":23,"./views/home-sections/Sponsors.js":24,"./views/home-sections/Team.js":25}],5:[function(require,module,exports){
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
},{"../core/BaseView.js":8}],6:[function(require,module,exports){
const BaseView = require("../core/BaseView.js");
const LngMenu = require("./LngMenu.js");


const Header = (function () {

    const Header = BaseView.extend(function (el, template, data) {
        const self = this;
        this.navReset = this.navReset.bind(this);
        this.onScroll = this.onScroll.bind(this);
        this.onClickLink = this.onClickLink.bind(this);
        this.data.sections = data.sections || [];
    });

    Header.prototype.onUpdate = function onUpdate () {
        this.render();
    };

    Header.prototype.beforeRender = function beforeRender () {
        this.app.scroll.on("update:section", this.onScroll);
    };

    Header.prototype.onRender = function onRender () {
        const self = this;
        Array.apply(null, this.el.getElementsByClassName("header__link"))
            .forEach(link => link.addEventListener("click", this.onClickLink));
        this.el.querySelector(".header__icon")
            .addEventListener("click", this.navReset);
        fetch(_env.publicURL + "templates/components/lng-menu.html")
            .then(res => {
                res.text().then(template => {
                    self.lngMenu = new LngMenu(
                        self.el.querySelector(".header__lng-menu"),
                        template,
                        {
                            app: self.app
                        }
                    );
                    self.lngMenu.render();
                });
            });

        this.el.querySelector(".header__nav-btn")
            .addEventListener("click", this.onBreadcrumb);
    };

    Header.prototype.beforeRemove = function beforeRemove () {
        this.el.querySelector(".header__nav-btn")
            .removeEventListener("click", this.onBreadcrumb);
        Array.apply(null, this.el.getElementsByClassName("header__link"))
            .forEach(link => link.removeEventListener("click", this.onClickLink));

    };

    Header.prototype.onRemove = function onRemove () {
        this.app.scroll.off("update:section", this.onScroll);
    };

    Header.prototype.setSections = function setSection (sections) {
        const change = this.data.sections.length != sections.length || !this.data.sections
              .reduce(function (acum, section, i) {
                  return acum && section.id == sections[i].id;
              }, true);
        if (change) this.data.sections = sections;
    };

    Header.prototype.onNavigate = function onNavigate () {
        const isHome = this.app.router.isOnHome();
        if (isHome) {
            this.setSections(this.app.homeSections);
        } else {
            this.setSections([{id: this.app.router.lastRouteResolved().name}]);
            this.addClass("dark", true);
        }
        this.addClass("breadcrumb", !isHome);
    };

    Header.prototype.onScroll = function onScroll (section) {
        this.addClass("dark", [1, 5, 6, 7].indexOf(section) != -1);
        this.addClass("green", [3, 5, 6].indexOf(section) != -1);
        this.updateMenus(section);
    };

    Header.prototype.addClass = function turnDark (val, bool) {
        this.el.classList[bool === true ? "add" : "remove"](val);
    };

    Header.prototype.navReset = function navReset () {
        this.app.router.navigate("#home/cover");
    };

    Header.prototype.onBreadcrumb = function onBreadcrumb () {
        history.back();
    };

    Header.prototype.updateMenus = function updateMenus (section) {
        Array.apply(null, this.el.querySelectorAll(".header__link"))
            .forEach(function (el, i) {
                el.classList[i % 7 === section ? "add" : "remove"]("active");
            });
    };

    Header.prototype.onClickLink = function onClickLink (ev) {
        this.app.scroll.currentSection = this.data.sections
            .map(d => d.id).indexOf(ev.srcElement.getAttribute("link"));
        this.app.router.silentNavigation(this.app.router.generate("home-section", {
            section: ev.srcElement.getAttribute("link")
        }));
    };

    return Header;
})();

module.exports = Header;

},{"../core/BaseView.js":8,"./LngMenu.js":7}],7:[function(require,module,exports){
const BaseView = require("../core/BaseView.js");

const LngMenu = (function () {
    // PRIVATE CODE BLOCK

    // PUBLIC CLASS
    const LngMenu = BaseView.extend(function (el, template, data) {
        const languages = new Array();
        for (let dict of this.app.lng.dictionaries.entries()) {
            languages.push({
                id: dict[0],
                name: this.app.lng.translate(dict[0])
            });
        }
        this.data.languages = languages;
        this.data.currentLanguage = this.data.languages.filter(lng => {
            return lng.id == this.app.lng.currentLanguage;
        }).pop() || "en";
        this.onClickItem = this.onClickItem.bind(this);
        this.render();
    });

    LngMenu.prototype.onRender = function () {
        this.el.setAttribute("lang", this.data.currentLanguage.id);
        for (let item of this.el.querySelectorAll(".lng-menu__list-item")) {
            item.addEventListener("click", this.onClickItem);
        };
    };

    LngMenu.prototype.onClickItem = function onClickItem (ev) {
        this.app.lng.currentLanguage = ev.currentTarget.getAttribute("lang");
    };

    return LngMenu;
})();

module.exports = LngMenu;

},{"../core/BaseView.js":8}],8:[function(require,module,exports){
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

},{"./Dispatcher.js":9,"mustache":1}],9:[function(require,module,exports){
const Dispatcher = (function () {
    // PRIVATE CODE BLOCK

    // PUBLIC OBJECT
    const Dispatcher = function (obj) {
        obj.el = obj.el || document.body;
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

},{}],10:[function(require,module,exports){
// VENDOR
const Navigo = require("navigo");

// ROUTES
const routes = require("../router/routes.js");

// SOURCE
const Dispatcher = require("../core/Dispatcher.js");


const Router = (function () {
    // PRIVATE CODE BLOCK
    function clearContent (cssEl) {
        const el = document.querySelector(cssEl);
        if (el && this.views.get(el)) {
            this.views.get(el).remove();
        }
    }
    const cache = new Map();
    // END OF PRIVATE CODE BLOCK

    const Router = function Router (app) {
        Navigo.call(this, null, true, "#");

        const self = this;
        this.app = app;
        this.views = new Map();

        this.ev = new Object();
        new Dispatcher(this.ev);

        this.onNavigate = this.onNavigate.bind(this);
        this.on(this.parseRoutes(routes));

        this.notFound(function (query) {
            self.views.forEach(function (view) {
                view.remove();
            });
            self.navigate("#home/cover");
        });
    };

    Router.prototype = Object.create(Navigo.prototype);

    Router.prototype.parseRoutes = function parseRoutes (routes) {
        const self = this;
        return Object.keys(routes).reduce(function (acum, route) {
            acum[route] = routes[route];
            acum[route].uses = self.onNavigate(
                acum[route].uses.template,
                acum[route].uses.el,
                acum[route].uses.view,
                acum[route].uses.data
            );
            return acum;
        }, new Object());
    };

    Router.prototype.onNavigate = function onNavigate (
        templateName,
        cssEl,
        View,
        data
    ) {
        const self = this;
        data = data || new Object();
        return function (params, query) {
            if (self.silent === true) {
                self.silent = false;
                return;
            }
            if (cache.get(templateName)) {
                clearContent.call(self, cssEl);
                const el = document.querySelector(cssEl);
                const view = new View(
                    el,
                    cache.get(templateName),
                    Object.assign(data, {
                        app: self.app,
                        url: {
                            params: params,
                            query: query
                        }
                    })
                );
                self.views.set(el, view);
            } else {
                fetch(_env.publicURL + "templates/" + templateName)
                    .then(function (res) {
                        res.text().then(function (template) {
                            cache.set(templateName, template);
                            clearContent.call(self, cssEl);
                            const el = document.querySelector(cssEl);
                            const view = new View(
                                el,
                                template,
                                Object.assign(data, {
                                    app: self.app,
                                    url: {
                                        params: params,
                                        query: query
                                    }
                                })
                            );
                            self.views.set(el, view);
                    });
                });
            }
            window.scrollTo(0, 0);
        };
    };

    Router.prototype.navigate = function navigate (route, absolute) {
        route = this.app.lng.onNavigate(route);
        Navigo.prototype.navigate.call(this, route, absolute);
    };

    Router.prototype.silentNavigation = function silent (route) {
        this.silent = true;
        this.navigate(route);
    };

    return Router;
})();

module.exports = Router;

},{"../core/Dispatcher.js":9,"../router/routes.js":12,"navigo":2}],11:[function(require,module,exports){
// COURE
const Router = require("../core/Router.js")

// ROUTES
const routes = require("./routes.js");


const AppRouter = (function () {
    // PRIVATE CODE BLOCK
    function clearContent (cssEl) {
        const el = document.querySelector(cssEl);
        if (el && this.views.get(el)) {
            this.views.get(el).remove();
        }
    }
    const cache = new Map();
    // END OF PRIVATE CODE BLOCK

    const AppRouter = function AppRouter (app) {
        Router.apply(this, arguments);

        const self = this;
        this.notFound(function (query) {
            self.views.forEach(function (view) {
                view.remove();
            });
            self.navigate("#home/cover");
        });
    };

    AppRouter.prototype = Object.create(Router.prototype);

    AppRouter.prototype.onNavigate = function onNavigate (
        templateName,
        cssEl,
        View,
        data
    ) {
        const self = this;
        data = data || new Object();
        return function (params, query) {
            if (self.silent === true) {
                self.silent = false;
                return;
            }
            if (cache.get(templateName)) {
                clearContent.call(self, cssEl);
                const el = document.querySelector(cssEl);
                const view = new View(
                    el,
                    cache.get(templateName),
                    Object.assign(data, {
                        app: self.app,
                        url: {
                            params: params,
                            query: query
                        }
                    })
                );
                self.views.set(el, view);
            } else {
                fetch(_env.publicURL + "templates/" + templateName)
                    .then(function (res) {
                        res.text().then(function (template) {
                            cache.set(templateName, template);
                            clearContent.call(self, cssEl);
                            const el = document.querySelector(cssEl);
                            const view = new View(
                                el,
                                template,
                                Object.assign(data, {
                                    app: self.app,
                                    url: {
                                        params: params,
                                        query: query
                                    }
                                })
                            );
                            self.views.set(el, view);
                    });
                });
            }
        };
    };

    AppRouter.prototype.isOnHome = function isOnHome () {
        const lastRoute = this.lastRouteResolved();
        return !lastRoute.name || lastRoute.name.indexOf("home") > -1;
    };

    return AppRouter;
})();

module.exports = AppRouter;

},{"../core/Router.js":10,"./routes.js":12}],12:[function(require,module,exports){
// VIEWS
const Home = require("../views/Home.js");
const Project = require("../views/Project.js");
const Gallery = require("../views/Gallery.js");
const Equip = require("../views/Equip.js");

module.exports = {
    "home": {
        as: "home",
        uses: {
            el: "#content",
            template: "home.html",
            view: Home
        }
    },
    "home/:section": {
        as: "home-section",
        uses: {
            el: "#content",
            template: "home.html",
            view: Home
        }
    },
    "project": {
        as: "project",
        uses: {
            el: "#content",
            template: "project.html",
            view: Project
        }
    },
    "gallery": {
        as: "gallery",
        uses: {
            el: "#content",
            template: "gallery.html",
            view: Gallery
        }
    },
    "team": {
        as: "team",
        uses: {
            el: "#content",
            template: "equip.html",
            view: Equip
        }
    }
}

},{"../views/Equip.js":15,"../views/Gallery.js":16,"../views/Home.js":17,"../views/Project.js":18}],13:[function(require,module,exports){
const BaseView = require("../core/BaseView.js");


const Lng = (function () {
    // PRIVATE CODE BLOCK

    // PUBLIC CLASS
    const Lng = function (dictionaries) {
        const self = this;

        this.dictionaries = new Map();
        for (let lng in dictionaries) {
            this.dictionaries.set(lng, new Map(Object.entries(dictionaries[lng])));
        };

        Object.defineProperty(self, "dictionary", {
            get: function () {
                return self.dictionaries.get(self.currentLanguage);
            }
        });

        Object.defineProperty(this, "currentLanguage", {
            get: function () {
                return location.hash.indexOf("?lng=") > -1 ? location.hash.match(/\?lng\=([a-z]{2})/)[1] : "en";
            },
            set: function (lng) {
                var currentLocation = location.hash.replace(/(?<=\?lng\=).*$/, '');
                if (currentLocation.indexOf("?lng=") == -1) currentLocation += "?lng=";
                location.hash = currentLocation + lng;
                location.reload();
            }
        });

        if (location.hash.match(/\?lng=[a-zA-Z]{2}/)) {
            if (Object.keys(dictionaries).indexOf(location.hash.match(/\?lng=([a-zA-Z]{2})/)[1]) == -1) {
                this.currentLanguage = "en";
            }
        } else {
            this.currentLanguage = "en";
        }
        BaseView.prototype.translate = this.parse.bind(this);
    };

    Lng.prototype.translate = function translate (key) {
        return this.dictionary.get(key) || "lng-" + key;
    };

    Lng.prototype.parse = function parse (template) {
        const keys = template.match(/\$lng\([^\)]*\)/g);
        if (!keys) return template;
        for (let key of keys) {
            template = template.replace(key, this.translate(key.substr(5).slice(0, -1)));
        };
        return template;
    };

    Lng.prototype.onNavigate = function onNavigate (route) {
        if (route.indexOf("?lng=") == -1) route += "?lng=" + this.currentLanguage;
        return route;
    };

    return Lng;
})();

module.exports = Lng;

},{"../core/BaseView.js":8}],14:[function(require,module,exports){
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
        this.onResize = this.onResize.bind(this);

        var currentSection = 0, tmpVal;
        Object.defineProperty(this, "currentSection", {
            set: function (val) {
                tmpVal = Math.max(0, Math.min(this.sections.length - 1, val));
                if (tmpVal == currentSection) return;
                currentSection = tmpVal;
                if (val !== null) {
                    window.scrollTo({
                        top: this.sections[currentSection].offsetTop,
                        behavior: "smooth"
                    });
                    this.dispatch("update:section", currentSection);
                } else {
                    window.scrollTo({
                        top: 0,
                        behavior: "auto"
                    });
                }
            },
            get: function () {
                return currentSection;
            }
        });


        Object.defineProperty(this, "isActive", {
            get: function () {
                return this.sections.length > 0;
            }
        });

        this.scrolling = false;
    };

    ScrollHandler.prototype.patch = function (targetSection, auto) {
        this.sections = Array.apply(null, document.getElementsByClassName("scroll-section"));
        if (auto) {
            window.scrollTo({
                top: this.sections[targetSection].offsetTop,
                behavior: "auto"
            });
        }
        this.currentSection = targetSection;
        addWindow(this.el, this.onWheel);
        window.addEventListener("scroll", this.onScroll);
        window.addEventListener("resize", this.onResize);
        document.body.classList.add("fixed-viewport");
    };

    ScrollHandler.prototype.unpatch = function unpatch () {
        this.sections = new Array();
        dropWindow();
        window.removeEventListener("scroll", this.onScroll);
        window.removeEventListener("resize", this.onResize);
        document.body.classList.remove("fixed-viewport");
        this.currentSection = null;
    };

    ScrollHandler.prototype.onWheel = function onWheel (ev) {
        if (this.scrolling) return;
        this.currentSection += (ev.deltaY < 0 ? -1 : 1);
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
        this.app.router.isOnHome() ? this.patch(0) : this.unpatch();
    };

    ScrollHandler.prototype.onResize = function onResize () {
        window.scrollTo({
            top: this.isActive ? this.sections[this.currentSection].offsetTop : 0,
            behavior: "auto"
        });
    };

    return ScrollHandler;
})();

module.exports = ScrollHandler;

},{"../core/Dispatcher.js":9}],15:[function(require,module,exports){
const BaseView = require("../core/BaseView.js");


const Equip = (function () {

    /// PRIVATE BLOCK CODE
    var renderCount = 0;
    /// END OF PRIVATE BLOCK CODE

    var Equip = function (el, template) {
        const self = this;
        this.load(_env.apiURL + "equip_images.json").then(function (response) { 
            const data = JSON.parse(response);
            data.images.forEach(img => img.file = _env.publicURL + "images/equip/" + img.file);
            data.images2.forEach(img => img.file = _env.publicURL + "images/equip/col·laboradors/" + img.file);
            self.data = data;
        });
    };

    Equip = BaseView.extend(Equip);

    Equip.prototype.onUpdate = function onUpdate () {
        this.render();
    };

    Equip.prototype.onRender = function onRender () {
        const self = this;
        for (let img of self.el.querySelectorAll(".img-row")) {
            img.addEventListener("click", self.onClickImage);
        }
    };

    Equip.prototype.beforeRemove = function onRemove () {
        for (let img of this.el.querySelectorAll(".img-row")) {
            img.removeEventListener("click", this.onClickImage);
        }
    };

    Equip.prototype.onClickImage = function (ev) {
        const carouselImages = document.querySelector('.img-row')
    };

    return Equip;
})();

module.exports = Equip;

},{"../core/BaseView.js":8}],16:[function(require,module,exports){
const BaseView = require("../core/BaseView.js");


const Gallery = (function () {

    /// PRIVATE BLOCK CODE
    var renderCount = 0;
    /// END OF PRIVATE BLOCK CODE

    var Gallery = function (el, template) {
        const self = this;
        this.load(_env.apiURL + "gallery_images.json").then(function (response) {
            var data = JSON.parse(response);
            data.rows = [];
            var rowindex = -1;
            var index = 0;
            for (let img of data.images){
                if (index % 3 == 0) {
                    data.rows.push({images: []});
                    rowindex++;
                }
                img.id = "imatge" + index;
                img.smallfile = img.file.split(".")[0]+"--small."+img.file.split(".")[1]
                data.rows[rowindex].images.push(img);
                index = index + 1;
            }
            self.data = data;
        });
        this.onClickImage = this.onClickImage.bind(this);
        this.onCloseOverlay = this.onCloseOverlay.bind(this);
    };

    Gallery = BaseView.extend(Gallery);

    Gallery.prototype.onUpdate = function onUpdate () {
        this.render();
    };

    Gallery.prototype.onRender = function onRender () {
        const self = this;
        for (let img of self.el.querySelectorAll(".img-container img")) {
            img.addEventListener("click", self.onClickImage);
        }
        this.app.header.addClass("green", true);
        this.app.header.addClass("breadcrumb", true);
        this.app.header.setSections([{id: "gallery"}]);
    };

    Gallery.prototype.beforeRemove = function onRemove () {
        const self = this;
        for (let img of self.el.querySelectorAll(".img-row")) {
            img.removeEventListener("click", self.onClickImage);
        }
    };

    Gallery.prototype.onClickImage = function () {
        var overlay = document.querySelector('.overlay');
        overlay.classList.add('activo');
        document.body.style.overflowY = "hidden";
        this.carousel = $(".carousel").slick({
            adaptiveHeight: true,
            mobileFirst: true,
            dots: true,
            appendDots: ".overlay .dots"
        });
        var boton = document.querySelector('#boton-cerrar');
        boton.removeEventListener('click', this.onCloseOverlay);
        boton.addEventListener('click', this.onCloseOverlay);
        overlay.removeEventListener('click', this.onCloseOverlay);
        overlay.addEventListener('click', this.onCloseOverlay);
    };

    Gallery.prototype.onCloseOverlay = function onCloseOverlay (ev) {
        var overlay = document.querySelector('.overlay');
        var boton = document.querySelector('#boton-cerrar');
        if (overlay === ev.target || ev.target.id == "boton-cerrar") {
            overlay.classList.remove('activo');
            document.body.style.overflowY = null;
            boton.removeEventListener('click', this.onCloseOverlay);
            overlay.removeEventListener('click', this.onCloseOverlay);
            $(".carousel").slick("unslick");
            this.carousel = null;
        }
    };

    return Gallery;
})();

module.exports = Gallery;

},{"../core/BaseView.js":8}],17:[function(require,module,exports){
// CORE
const BaseView = require("../core/BaseView.js");

const Home = (function () {

    const Home = BaseView.extend(function (el, template, data) {
        const self = this;
        if (!this.url.params || this.app.homeSections.map(d => d.id).indexOf(this.url.params.section) == -1) {
            this.app.router.silentNavigation("#home/cover");
            this.url.params = {
                section: "cover"
            };
        }

        this.fetchChilds(this.app.homeSections).then(function () {
            self.data.sections = self.app.homeSections;
        });

        this.lazyLoadSectionBackground = this.lazyLoadSectionBackground.bind(this);
        this.app.scroll.on("update:section", function (section) {
            self.lazyLoadSectionBackground(section);
            self.el.children[0].classList[[1, 5, 6, 7].indexOf(section) >= 0 ? "add" : "remove"]("dark");
        });
        this.onMobileScroll = this.onMobileScroll.bind(this);
    });

    Home.prototype.onUpdate = function onUpdate () {
        this.render();
    };

    Home.prototype.beforeRender = function beforeRender () {
        this.app.header.setSections(this.data.sections);
        document.body.getElementsByTagName("footer")[0].classList.add("scroll-section");
    };

    Home.prototype.onRender = function onRender () {
        let currentSection, i = 0;
        for (let section of this.data.sections) {
            section._proto = section.view;
            section.view = new section.view(this.el.querySelector(`#${section.id}`), section.template, {
                app: this.app,
                name: section.id
            });
            section.view.el.classList.add("lazy");
            if (section.id === this.url.params.section) {
                currentSection = i;
                this.lazyLoadSectionBackground(i);
                this.app.header.updateMenus(i);
            } else {
                i++;
            }
        }

        this.app.scroll.patch(currentSection, true);

        this.el.querySelectorAll(".home__nav-btn").forEach(btn => {
            btn.addEventListener("click", this.onMobileScroll);
        });
    };

    Home.prototype.beforeRemove = function beforeRemove () {
        const self = this;
        this.data.sections.forEach(function (section) {
            section.view.remove();
            section.view = section._proto;
        });
        this.app.scroll.unpatch();
    };

    Home.prototype.onRemove = function onRemove () {
        document.body.getElementsByTagName("footer")[0].classList.remove("scroll-section");
    };

    Home.prototype.fetchChilds = function fetchChilds (sections) {
        const self = this;
        return Promise.all(sections.map(function (section) {
            return new Promise(function (done, error) {
                fetch(_env.publicURL + `templates/home-sections/${section.id}.html`)
                    .then(function (res) {
                        res.text().then(function (template) {
                            section.template = template;
                            done(section);
                        });
                    });
            });
        }));
    };

    Home.prototype.lazyLoadSectionBackground = function lazyLoadSectionBackground (section) {
        this.data.sections[section] && this.data.sections[section].view.el.classList.remove("lazy");
    };

    Home.prototype.onMobileScroll = function onMobileScroll (ev) {
        if (ev.currentTarget.getAttribute("dir") == "top") {
            this.app.scroll.currentSection--;
        } else {
            this.app.scroll.currentSection++;
        }
    };

    return Home;
})();

module.exports = Home;

},{"../core/BaseView.js":8}],18:[function(require,module,exports){
const BaseView = require("../core/BaseView.js");


const Project = (function () {
    const Project = BaseView.extend(function Project (el) {
        const self = this;
        this.render();
    });

    Project.prototype.onUpdate = function onUpdate () {
        console.log("Project updated");
    };

    Project.prototype.onRender = function onRender () {
        console.log("Project rendered");
    };

    Project.prototype.onRemove = function onRemove () {
        console.log("Project removed");
    };

    return Project;
})();

module.exports = Project;

},{"../core/BaseView.js":8}],19:[function(require,module,exports){
const BaseView = require("../../core/BaseView.js");


const Cover = (function() {
    const Cover = BaseView.extend(function Cover(el) {
        const self = this;
        this.render();
    });

    return Cover;
})();

module.exports = Cover;

},{"../../core/BaseView.js":8}],20:[function(require,module,exports){
const BaseView = require("../../core/BaseView.js");


const Documents = (function () {

    /// PRIVATE BLOCK CODE
    var renderCount = 0;
    /// END OF PRIVATE BLOCK CODE

    var Documents = function (el, template) {
        const self = this;
        this.onClickMain = this.onClickMain.bind(this);
        this.onMouseLeave = this.onMouseLeave.bind(this);
        this.onClickDocument = this.onClickDocument.bind(this);

        this.load(_env.apiURL + "documents.json").then(function (response) {
            self.data = JSON.parse(response);
        });
    };

    Documents = BaseView.extend(Documents);

    Documents.prototype.onUpdate = function onUpdate () {
        console.log("Documents updated");
        this.render();
    };

    Documents.prototype.onRender = function onRender () {
        const self = this;
        for (let doc of self.el.querySelectorAll(".has_file")) {
            doc.addEventListener("click", self.onClickDocument);
        }
        for (let doc of self.el.querySelectorAll(".doc-col-main")) {
            doc.addEventListener("mouseover", self.onClickMain);
        }
        console.log("Documents rendered");
    };

    Documents.prototype.beforeRemove = function beforeRemove () {
        for (let doc of this.el.querySelectorAll(".doc-row")) {
            doc.removeEventListener("mouseover", self.onClickDocument);
        }
        console.log("Documents removed");
    };

    Documents.prototype.onClickDocument = function (ev) {
        window.open("public/data/" + ev.currentTarget.dataset.file);
        document.getElementsByClassName('.doc-col-main').style.display = 'block';
    };

    Documents.prototype.onClickMain = function (ev) {
        ev.currentTarget.style.display = 'None' ;
        subs=ev.currentTarget.parentElement.getElementsByClassName("has_file");
        for (let sub of subs){
              sub.style.display = 'block';
              sub.style.borderColor = '#67A64B';
		    }
        ev.currentTarget.parentElement
            .addEventListener("mouseleave",this.onMouseLeave);
    };

    Documents.prototype.onMouseLeave = function (ev) {
        ev.currentTarget.getElementsByClassName("has_file");
        for (let sub of subs) {
              sub.style.display = 'none';
		    }
        ev.currentTarget
            .getElementsByClassName("doc-col-main")[0].style.display = "block";
        ev.currentTarget
            .removeEventListener("mouseleave",this.onMouseLeave);
    };

    return Documents;
})();

module.exports = Documents;

},{"../../core/BaseView.js":8}],21:[function(require,module,exports){
const BaseView = require("../../core/BaseView.js");


const Gallery = (function() {
    const Gallery = BaseView.extend(function Gallery (el, template, data) {
        const self = this;
        this.data = data;
        this.goToGallery = this.goToGallery.bind(this);
        this.render();
    });

    Gallery.prototype.onRender = function onRender () {
        this.el.querySelector(".nav-pannel__btn")
            .addEventListener("click", this.goToGallery);
    };

    Gallery.prototype.beforeRemove = function onRemove () {
        this.el.querySelector(".nav-pannel__btn")
            .removeEventListener("click", this.goToGallery);
    };

    Gallery.prototype.goToGallery = function goToGallery () {
        this.app.router.navigate("#gallery");
    };

    Gallery.id = "gallery";
    return Gallery;
})();

module.exports = Gallery;

},{"../../core/BaseView.js":8}],22:[function(require,module,exports){
const BaseView = require("../../core/BaseView.js");

const Manifest = (function () {
  const Manifest = BaseView.extend(function Manifest(el) {
    const self = this;
    fetch(_env.apiURL + "manifest.json").then(function (res) {
      res.json().then(function (data) {
        data.language = location.hash.match(/lng=([^&]+)/)[1];
        self.data = data;
      });
    });
  });

  Manifest.prototype.onUpdate = function onUpdate() {
    this.render();
  };

  Manifest.prototype.beforeRender = function beforeRender() {
    var css = "";
    this.data.principles.forEach(function (principle) {
      css += `#manifest .manifest__principle[principle=${principle.id}] .manifest__principle-image {
                background-image: url(${_env.publicURL}images/home-sections/${principle.image});
            }`;
    });
    const style = document.createElement("style");
    style.id = "manifestStyle";
    style.innerHTML = css;
    document.head.appendChild(style);
  };

  Manifest.prototype.onRender = function onRender() {};

  Manifest.prototype.beforeRemove = function beforeRemove() {
    const style = document.getElementById("manifestStyle");
    style.parentElement.removeChild(style);
  };

  Manifest.id = "manifest";
  return Manifest;
})();

module.exports = Manifest;

},{"../../core/BaseView.js":8}],23:[function(require,module,exports){
const BaseView = require("../../core/BaseView.js");


const Project = (function() {
    const Project = BaseView.extend(function Project (el, template, data) {
        const self = this;
        this.data = data;
        this.goToProject = this.goToProject.bind(this);
        this.render();
    });

    Project.prototype.onRender = function onRender () {
        this.el.querySelector(".nav-pannel__btn")
            .addEventListener("click", this.goToProject);
    };

    Project.prototype.beforeRemove = function onRemove () {
        this.el.querySelector(".nav-pannel__btn")
            .removeEventListener("click", this.goToProject);
    };

    Project.prototype.goToProject = function goToProject () {
        this.app.router.navigate(this.app.router.generate("project"));
        this.app.header.setSections([]);
    };

    return Project;
})();

module.exports = Project;

},{"../../core/BaseView.js":8}],24:[function(require,module,exports){
const BaseView = require("../../core/BaseView.js");


const Patrocinadors = (function () {

    /// PRIVATE BLOCK CODE
    var renderCount = 0;
    /// END OF PRIVATE BLOCK CODE

    var Patrocinadors = function (el, template) {
        const self = this;
        this.load(_env.apiURL + "sponsors_images.json").then(function (response) {
                const data = JSON.parse(response);
                data.institutional.forEach(img => img.file = _env.publicURL + "images/logos/institucionals/" + img.file);
                data.main.forEach(img => img.file = _env.publicURL + "images/logos/main/" + img.file);
                data.or.forEach(img => img.file = _env.publicURL + "images/logos/or/" + img.file);
                data.plata.forEach(img => img.file = _env.publicURL + "images/logos/plata/" + img.file);
                data.bronze.forEach(img => img.file = _env.publicURL + "images/logos/bronze/" + img.file);
                self.data = data;
            });
    };

    Patrocinadors = BaseView.extend(Patrocinadors);

    Patrocinadors.prototype.onUpdate = function onUpdate () {
        console.log("Patrocinadors updated");
        this.render();
    };

    Patrocinadors.prototype.onRender = function onRender () {
        const self = this;
        for (let img of self.el.querySelectorAll(".logo-container")) {
            img.addEventListener("click", self.onClickImage);
        }
        console.log("Equip rendered");
    };

    Patrocinadors.prototype.beforeRemove = function beforeRemove () {
        for (let img of this.el.querySelectorAll(".logo-container")) {
            img.removeEventListener("click", self.onClickImage);
        }
        console.log("Equip removed");
    };

    Patrocinadors.prototype.onClickImage = function (ev) {
        console.log("Has clicat sobre una imàtge!");
        const carouselImages = document.querySelector('');
    };

    return Patrocinadors;
})();

module.exports = Patrocinadors;

},{"../../core/BaseView.js":8}],25:[function(require,module,exports){
const BaseView = require("../../core/BaseView.js");


const Team = (function() {
    const Team = BaseView.extend(function Team (el, template, data) {
        const self = this;
        this.data = data;
        this.goToTeam = this.goToTeam.bind(this);
        this.render();
    });

    Team.prototype.onRender = function onRender () {
        this.el.querySelector(".nav-pannel__btn")
            .addEventListener("click", this.goToTeam);
    };

    Team.prototype.beforeRemove = function onRemove () {
        this.el.querySelector(".nav-pannel__btn")
            .removeEventListener("click", this.goToTeam);
    };

    Team.prototype.goToTeam = function goToTeam () {
        this.app.router.navigate(this.app.router.generate("team"));
        this.app.header.setSections([]);
    };

    return Team;
})();

module.exports = Team;

},{"../../core/BaseView.js":8}]},{},[3]);
