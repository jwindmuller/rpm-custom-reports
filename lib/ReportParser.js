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
}),
RepeatingFieldsDirective = new Class({
  Implements: Directive,
  classNames: ['repeating-fields-directive'],
  validOptions: ['format']
}),
SimpleDirective = new Class({
  Implements: Directive,
  classNames: ['field'],
  tag: function() {
    return '<span id=":id" class=":className" :options></span>';
  },
  getId: function() {
    return '##RpmIdFor:' + this.name + '##';
  },
  validNames: [],
  isValid: function() {
    return this.validNames.indexOf(this.name) >= 0;
  }
}),
ActionsDirective = new Class({
  Implements: Directive,
  classNames: ['actions-directive'],
  validOptions: ['format', 'show'],
}),
ActionsSimpleDirective = new Class({
  Implements: SimpleDirective,
  classNames: ['action-field'],
  validNames: [
    "FormTitle",
    "Done",
    "Assignee",
    "AddedBy",
    "Type",
    "Description",
    "Result",
    "Priority",
    "Due",
    "OriginalDue",
    "Start",
    "Completed",
    "Duration"
  ],
  getId: function() {
    return this.name;
  },
}),
Directives = {
  ActionsDirective:ActionsDirective,
  RepeatingFieldsDirective:RepeatingFieldsDirective,
  ActionsSimpleDirective:ActionsSimpleDirective
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
      var hasOptions = str.indexOf(':') > 0;

      if (!hasOptions) {
        return str.replace(/\[|\]/g, '');
      }
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
    createSimpledDirective: function(directiveName, containingDirective) {
      var SimpleDirectiveClass = containingDirective + 'SimpleDirective';
      if (!Directives[SimpleDirectiveClass]) {
        return null;
      }

      var obj = new Directives[SimpleDirectiveClass](directiveName);
      if (!obj.isValid()) {
        return null;
      }

      return obj;
    },
    parseSimple: function($directive, containingDirective) {
      var directiveName = this.parseName($directive),
          simple = this.createSimpledDirective(directiveName, containingDirective);

      if (!simple) {
        return $directive;
      };

      return simple.toHtml();
    }
  }
};