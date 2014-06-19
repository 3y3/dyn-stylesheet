(function(window, document) {
  'use strict';
  var style
    , cache = {};
  
  function compose(source, mixin) {
    Object.keys(mixin).forEach(function(key) {
      if(/^!/.test(key)) {
        source[key.slice(1)] = mixin[key] + ' !important';
      } else if(mixin[key] === '') {
        delete source[key];
      } else {
        source[key] = mixin[key];
      }
    });
    return source;
  }
  
  function canonize(selector) {
    var matched = /^(@media\s)?(.*)/.exec(selector) 
      , prefix = matched[1] || '';
    var selectors = matched[2].
      split(',').
        map(function(selector) {
          return prefix + selector.trim().replace(/\s+/, ' ');
        });
    return selectors;
  }
  
  function Media(object) {
    object = object || {};
    Object.defineProperty(object, 'toString', {
      enumerable: false,
      value: function(){
        return Object.keys(this).map(function(key) {
          return this[key] + '';
        }, this).join('\n');
      }
    });
    return object;
  }
  
  function Rule(object) {
    object = object || {};
    Object.defineProperty(object, 'toString', {
      enumerable: false,
      value: function(){
        return Object.keys(this).map(function(key) {
          return key+':'+this[key];
        }, this).join(';\n');
      }
    });
    return object;
  }
  
  function updateMediaRules(selector, object, media) {
    var sheet = style.sheet;
    if (!cache[media]) {
      sheet.insertRule(media + ' {}', sheet.cssRules.length);
      cache[media] = {
        rule: sheet.cssRules[sheet.cssRules.length - 1],
        object: new Media()
      }
    }
    
    sheet = cache[media].rule;
    cache = cache[media].object;
    
    var selectors = canonize(selector);
    selectors.forEach(function(selector) {
      var rule;
      if(cache[selector]) {
        rule = compose(cache[selector].object, object);
        sheet.deleteRule([].indexOf.call(sheet.rules, cache[selector].rule));
      } else {            
        rule = compose(new Rule(), object);
      }
      sheet.insertRule(selector + ' {' + rule + '}', sheet.cssRules.length);
      cache[selector] = {
        rule: sheet.cssRules[sheet.cssRules.length - 1],
        object: rule
      }
    });
  }
  
  /**
   * @param {String} selector css compatible selector string
   * @param {Object} object css properties
   *   Use {property: value} to setup common property
   *   Use {!property: value} to setup !important property
   *   Use {property: ''} to delete property
  */
  function CSS(selector, object, media) {
    style = style || document.body.appendChild(document.createElement('style'));
    
    var medias = canonize('@media ' + (media || 'all'));
    medias.forEach(updateMediaRules.bind(null, selector, object));
  }
  
  /**
   * @param {...} selectors target selectors for convert to text
   * If no selectors specified - converts all rules to text
  */
  CSS.text = function() {
    var selectors = [].slice.call(arguments),
        rules = selectors.length ?
          selectors.map(function(selector){
            return cache[selector] && cache[selector].rule;
          }).filter(function(rule){return rule})
          : [].slice.call(style.sheet.rules);
    return rules.map(function(rule){
      return rule.cssText;
    });
  };
  
  window['CSS'] = CSS;
}(window, document));