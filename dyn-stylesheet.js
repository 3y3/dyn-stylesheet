(function(window, document, undefined) {
  var style,
      cache = {};
  
  function compound(source, mixin) {
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
  
  function Rule(object) {
    Object.defineProperty(object, 'toString', {
      enumerable: false,
      value: function(){
        return Object.keys(this).map(function(key) {
          return key+':'+this[key];
        }, this).join(';');
      }
    });
    return object;
  }
  
  
  /**
   * @param {String} selector css compatible selector string
   * @param {Object} object css properties
   *   Use {property: value} to setup common property
   *   Use {!property: value} to setup !important property
   *   Use {property: ''} to delete property
  */
  function CSS(selector, object) {
    object = typeof object == 'object' ? 
      object : //CSS(<string>, <object>)
      this[selector]; //[].forEach(CSS, object)
    
    var sheet, rule;
    
    style = style || document.head.appendChild(document.createElement('style'));
    sheet = style.sheet;
    
    if(cache[selector]) {
      rule = compound(cache[selector].object, object);
      sheet.deleteRule([].indexOf.call(sheet.rules, cache[selector].rule));
    } else {            
      rule = new Rule(compound({}, object));    
    }
    sheet.insertRule(selector+'{'+rule+'}', sheet.cssRules.length);
    cache[selector] = {
      rule: sheet.rules[sheet.cssRules.length - 1],
      object: rule
    }
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