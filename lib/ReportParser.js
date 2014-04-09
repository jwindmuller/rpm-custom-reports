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
    if (!options || options.constructor !== Object) {
      options = {};
    };
    if (typeof content !== 'string') {
      content = '';
    };

    this.name = name;
    this.options = options;
    this.content = content;
  },
  className: 'Directive',
  getId: function() {
    return '';
  },
  optionsToHtml: function() {
    var html = [];

    this.validOptions.each(function(option, i) {
      var optionName = option,
          value = this.options[optionName],
          allowsString;

      if (typeof option !== 'string') {
        optionName = option.name;
        value = this.options[optionName];
        allowsString = option.validValues.contains('<string>');
        if (!option.validValues.contains(value)) {
          if (!allowsString || value === undefined) {
            value = option.validValues[0];
          }
        }
      }

      html.push(
        this.optionToHtml(optionName, value)
      );
    }, this);

    if (typeof this.extraOptionsCallback === 'function') {
      var extraOptions = this.extraOptionsCallback(this.name, this.className);
      Object.each(extraOptions, function(value, optionName) {
        html.push(this.optionToHtml(optionName, value));
      }, this);
    }

    return html.join(' ');
  },
  optionToHtml: function(optionName, value) {
    return 'data-{optionName}="{value}"'.substitute({
      optionName: optionName,
      value: value
    });
  },
  classNamesToHtml: function() {
    return this.classNames.reduce(
      function(previousValue, currentValue, index, array) {
        return previousValue + ' ' + currentValue;
      }
    );
  },
  tag: function() {
    return '<span class="directive :className" :options>:content</span>';
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
        name: this.name,
        options: this.optionsToHtml(),
        content: this.content,
        className: this.classNamesToHtml()
      }
    );
  }
}),
SimpleDirective = new Class({
  Extends: Directive,
  className: 'SimpleDirective',
  classNames: [],
  tag: function() {
    return '<span class="field :className" data-fieldName=":name" :options>:content</span>';
  },
  validNames: [],
  isValid: function() {
    return this.validNames.indexOf(this.name) >= 0;
  }
}),
RepeatingFieldsDirective = new Class({
  Extends: Directive,
  className: 'RepeatingFieldsDirective',
  classNames: ['repeating-fields-directive'],
  validOptions: [
    {
      name: 'format', validValues: ['table', 'custom']
    }
  ]
}),
FormSimpleDirective = new Class({
  Extends: SimpleDirective,
  className: 'FormSimpleDirective',
  classNames: ['form-field'],
  isValid: function() {
    if (typeof this.validate === 'function') {
      return this.validate(this.name);
    };
    return true; // Anything could be possible inside a RepeatingFieldsDirective
  }
}),
FormInformationDirective = new Class({
  Extends: FormSimpleDirective,
  className: 'FormInformationDirective',
  initialize: function(name, options, content){
    this.parent(name, options, content);
    this.content = options.display;
  },
  classNames: ['form-information'],
  validOptions: [
    {
      name: 'display',
      validValues: [
        'Process', 'Title', 'Number',
        'Status', 'Owner',
        'Started', 'Started by',
        'Modified', 'Modified by',
        'Approval result'
      ]
    },
    {
      name: 'format',
      validValues: [
        '%B %d, %Y', '<string>'
      ]
    }
  ]
}),
FormReferenceFieldSimpleDirective = new Class({
  Extends: FormSimpleDirective,
  className: 'FormReferenceFieldSimpleDirective',
  classNames: ['form-field', 'reference']
}),
RepeatingFieldsSimpleDirective = new Class({
  Extends: FormSimpleDirective,
  className: 'RepeatingFieldsSimpleDirective',
  classNames: ['form-field', 'repeating'],
}),
ActionsDirective = new Class({
  Extends: Directive,
  className: 'ActionsDirective',
  classNames: ['actions-directive'],
  validOptions: [
    {
      name: 'format', validValues: ['table', 'custom']
    },
    {
      name: 'show',   validValues: ['own', '<string>']
    }
  ],
}),
ActionsSimpleDirective = new Class({
  Extends: SimpleDirective,
  className: 'ActionsSimpleDirective',
  classNames: ['action-field'],
  initialize: function(name, options, content){
    this.parent(name, options, content);
    this.validNames = ActionsSimpleDirective.validNames;
  },
  getId: function() {
    return this.name;
  },
}).extend({
  validNames: [
    "Form Title",
    "Done",
    "Assignee",
    "Added By",
    "Type",
    "Description",
    "Result",
    "Priority",
    "Due",
    "Original Due",
    "Start",
    "Completed",
    "Duration"
  ]
}),
ReferencedDirective = new Class({
  Extends: Directive,
  className: 'ReferencedDirective',
  classNames: ['referenced-directive'],
  validOptions: [
    {
      name: 'in',     validValues: ['<string>']
    },
    {
      name: 'format', validValues: ['table', 'custom']
    }
  ]
}),
Directives = {
  ActionsDirective:                 ActionsDirective,
  RepeatingFieldsDirective:         RepeatingFieldsDirective,
  ReferencedDirective:              ReferencedDirective,
  // Simple
  ActionsSimpleDirective:           ActionsSimpleDirective,
  FormSimpleDirective:              FormSimpleDirective,
  FormReferenceFieldSimpleDirective:FormReferenceFieldSimpleDirective,
  RepeatingFieldsSimpleDirective:   RepeatingFieldsSimpleDirective,
  ReferencedSimpleDirective:        FormSimpleDirective,
  FormInformationDirective:         FormInformationDirective
};

var ReportParser = {
  extraOptionsCallback: null,
  parseText: function(text) {
    return parser.parse(text);
  },
  join: function() {
    var result = '';
    for (var i = 0; i < arguments.length; i++) {
      if (arguments[i]) result += arguments[i];
    }
    return result;
  },

  Directive: {
    parseOptions: function($directive, directiveName) {
      var parsed = {},
          options = $directive
              .replace('[' + directiveName, '')  // remove directive
              .replace(/([^\]]*)\]/, '$1')       // Remove trailing ]
              .replace(                          // values within "" get spaces removed w/%%
                /"([^"]+)"/,
                function(match, noQuotes) {
                  return noQuotes.replace(/ /g, '%%');
                }
              ).trim();

      if (options === '') {
        return parsed;
      }

      options.split(' ').each(function(option, i) {
        option = option.split(':');
        parsed[option[0]] = option[1].replace(/%%/g, ' ');
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
          options = this.parseOptions($directiveStart, directiveName),
          d = this.createDirective(directiveName, options, content);

      return d.toHtml();
    },
    createSimpledDirective: function(directiveName, options, containingDirective) {
      if (containingDirective === undefined) {
        containingDirective = 'Form';
      }
      var SimpleDirectiveClass = containingDirective + 'SimpleDirective';
      if (directiveName === 'Information') {
        SimpleDirectiveClass = containingDirective + 'InformationDirective';
      };
      if (directiveName.indexOf('.') >= 0) {
        SimpleDirectiveClass = 'FormReferenceFieldSimpleDirective';
      }
      if (!Directives[SimpleDirectiveClass]) {
        throw 'Directive "' + SimpleDirectiveClass + '" not found';
        return null;
      }

      var obj = new Directives[SimpleDirectiveClass](directiveName, options);
      if (SimpleDirectiveClass === 'FormSimpleDirective') {
        obj.validate = ReportParser.SimpleFieldsValidator;
      }
      if (SimpleDirectiveClass === 'FormReferenceFieldSimpleDirective') {
        obj.validate = ReportParser.ReferenceFieldsValidator;
      };
      if (!obj.isValid()) {
        return null;
      }

      return obj;
    },
    parseSimple: function($directive, containingDirective) {
      var directiveName = this.parseName($directive),
          options = this.parseOptions($directive, directiveName),
          simple = this.createSimpledDirective(directiveName, options, containingDirective);

      if (!simple) {
        return $directive;
      };

      simple.extraOptionsCallback = ReportParser.extraOptionsCallback;
      return simple.toHtml();
    }
  }
};