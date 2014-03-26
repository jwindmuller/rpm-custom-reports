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
    return '<span id=":id" class=":className" :options>:content</span>';
  }.protect(),
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
  npState: function(npState, ifTrue, ifFalse) {
    return (npState ? ifTrue : ifFalse);
  },
  //end state handlers

  Directive: {
    parseOption: function(option) {
      var split = option.split(':'),
        ret = {};

      ret[split[0]] = split[1];
      return ret;
    },
    parseOptions: function($options) {
      var parsed = {},
        options = $options.split(' ');

      options.each(function(option, i) {
        option = option.split(':');
        parsed[option[0]] = option[1];
      });

      return parsed;
    },
    parseName: function(str) {
      return str.replace(/[^\w]/, '').trim();
    },
    createDirective: function(directiveName, options, content) {
      var className = directiveName + 'Directive';
      if (Directives[className] === undefined) {
        throw 'Directive "' + directiveName + '" not found';
      }
      return new Directives[className](directiveName, options, content);
    },
    parse: function($directiveName, $options, $content) {

      var directiveName = this.parseName($directiveName),
        options = this.parseOptions($options),
        content = $content.substring( $content.indexOf(']') + 1 ),
        d = this.createDirective(directiveName, options, content);

      return d.toHtml();
    },
    parseSimple: function($directive) {
      var simple = new SimpleDirective($directive)
      return simple.toHtml();
    }
  }
};