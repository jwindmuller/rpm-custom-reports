var Directive = new Class({
  name: '',
  options: [],
  validOptions: [],
  content: '',
  classNames: ['directive'],
  initialize: function(name, options, content){
    if (!name) {
      name = '';
    };
    if (!options || options.constructor !== Array) {
      option = [];
    };
    if (typeof content !== 'string') {
      content = '';
    };

    this.name = name;
    this.options = options;
    this.content = content;
  },
  getId: function() {
    return '';
  },
  optionsToHtml: function() {
    var html = [];

    this.validOptions.each(function(optionName, i) {
      html.push(
        'data-{optionName}="{value}"'.substitute({
          optionName: optionName,
          value: this.options[optionName]
        })
      );
    }, this);
    return html.join(' ');
  },
  classNamesToHtml: function() {
    return this.classNames.reduce(
      function(previousValue, currentValue, index, array) {
        return previousValue + ' .' + currentValue;
      }
    );
  },
  tag: function() {
    return '<span class=":className" :options>:content</span>';
  },
  format: function(params) {
    var tag = this.tag();
    Object.each(params, function(item, key, object) {
      tag = tag.replace(':' + key, item);
    });
    return tag;
  },
  toHtml: function() {
    return this.format(
      {
        id: this.getId(),
        options: this.optionsToHtml(),
        content: this.content,
        className: this.classNamesToHtml()
      }
    );
  }
});
var ActionsDirective = new Class({
  Implements: Directive,
  classNames: ['actions-directive'],
  validOptions: ['format', 'show']
});
var RepeatingFieldsDirective = new Class({
  Implements: Directive,
  classNames: ['repeating-fields-directive'],
  validOptions: ['format']
});
var SimpleDirective = new Class({
  Implements: Directive,
  classNames: ['field'],
  tag: function() {
    return '<span id=":id" class=":className" :options />';
  },
  getId: function() {
    return '##RpmIdFor:' + this.name + '##';
  }
});
var Directives = {
  ActionsDirective:ActionsDirective,
  RepeatingFieldsDirective:RepeatingFieldsDirective,
  SimpleDirective:SimpleDirective
};
var ReportParser = {
  join: function() {
    var result = '';
    for (var i = 0; i < arguments.length; i++) {
      if (arguments[i]) result += arguments[i];
    }
    return result;
  },

  Directive: {
    parseOption: function(option) {
      var split = option.split(':'),
        ret = {};

      ret[split[0]] = split[1];
      return ret;
    },
    parseOptions: function($options) {
      var parsed = {},
        options = $options.replace(/\[[^\s]+\s([^\]]+)\]/, '$1')
                          .trim()
                          .split(' ');

      options.each(function(option, i) {
        option = option.split(':');
        parsed[option[0]] = option[1];
      });

      return parsed;
    },
    parseName: function(str) {
      return str.replace(/\[([^\s]+)[^\]]*\]/, '$1').trim();
    },
    createDirective: function(directiveName, options, content) {
      var className = directiveName + 'Directive';
      if (Directives[className] === undefined) {
        throw 'Directive "' + directiveName + '" not found';
      }
      return new Directives[className](directiveName, options, content);
    },
    parse: function($directiveStart, content) {
      var directiveName = this.parseName($directiveStart),
          options = this.parseOptions($directiveStart),
          d = this.createDirective(directiveName, options, content);

      return d.toHtml();
    },
    parseSimple: function($directive) {
      var directiveName = this.parseName($directive),
          simple = new SimpleDirective(directiveName);

      return simple.toHtml();
    }
  }
};