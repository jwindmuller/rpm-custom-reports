var Directive = new Class({
  name: '',
  options: [],
  validOptions: [],
  content: '',
  classNames: ['directive'],
  containingDirective: null,
  containingDirectiveOptions : [],
  initialize: function(name, options, content, containingDirective, containingDirectiveOptions) {
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
    this.containingDirective = containingDirective;
    this.containingDirectiveOptions = containingDirectiveOptions;
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
      var extraOptions = this.extraOptionsCallback(this.name, this.className, this.options, this.containingDirective, this.containingDirectiveOptions);
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
    return '<span class="directive :className" data-directive-type=":directiveType" :options>:content</span>';
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
        className: this.classNamesToHtml(),
        directiveType: this.className
      }
    );
  }
}).extend({
  getValidOption: function (ClassObject, optionName) {
    var options = ClassObject.prototype.validOptions;
    var option = null;
    options.each(function (validOption) {
      if (validOption.name == optionName) {
        option = validOption;
      }
    });
    return option.validValues;
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
  },
  toHtml: function() {
    if (this.className === 'FormSimpleDirective' && !ReportParser.fieldNames.contains(this.name)) {
      return '[' + this.name + ']';
    }
    return this.parent();
  }
}),
FormInformationDirective = new Class({
  Extends: FormSimpleDirective,
  className: 'FormInformationDirective',
  initialize: function(name, options, content, containingDirective, containingDirectiveOptions) {
    this.parent(name, options, content, containingDirective, containingDirectiveOptions);
  },
  classNames: ['form-information'],
  validOptions: [
    {
      name: 'field',
      validValues: [
        'Process', 'Title', 'Number',
        'Status', 'Owner',
        'Started', 'Started by',
        'Modified', 'Modified by',
        'Approval result', '<string>'
      ]
    }
  ]
}),
FormReferenceFieldDirective = new Class({
  Extends: FormSimpleDirective,
  className: 'FormReferenceFieldDirective',
  classNames: ['form-field', 'reference']
}),
RepeatingFieldsReferenceFieldDirective = new Class({
  Extends: FormSimpleDirective,
  className: 'RepeatingFieldsReferenceFieldDirective',
  classNames: ['form-field', 'reference', 'repeating'],
}),
RepeatingFieldsInformationDirective = new Class({
  Extends: FormInformationDirective,
  className: 'RepeatingFieldsInformationDirective',
  classNames: ['form-information', 'repeating'],
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
  initialize: function(name, options, content, containingDirective, containingDirectiveOptions) {
    this.parent(name, options, content, containingDirective, containingDirectiveOptions);
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
ReferencedSimpleDirective = new Class({
  Extends: FormSimpleDirective,
  className : 'ReferencedSimpleDirective', 
  classNames: ['form-field', 'referenced']
}),
ReferencedInformationDirective = new Class({
  Extends: FormInformationDirective,
  className: 'ReferencedInformationDirective',
  classNames: ['form-information', 'referenced']
}),
FieldGroupDirective = new Class({
  Extends: Directive,
  className: 'FieldGroupDirective',
  classNames: ['field-group-directive'],
  validOptions: [
    {
      name: 'name', validValues: ['<string>']
    },
    {
      name: 'when', validValues: ['active', 'inactive']
    }
  ]
}),
Directives = {
  ActionsDirective:                       ActionsDirective,
  RepeatingFieldsDirective:               RepeatingFieldsDirective,
  ReferencedDirective:                    ReferencedDirective,
  // Simple
  ActionsSimpleDirective:                 ActionsSimpleDirective,
  FormSimpleDirective:                    FormSimpleDirective,
  FormReferenceFieldDirective:            FormReferenceFieldDirective,
  RepeatingFieldsSimpleDirective:         RepeatingFieldsSimpleDirective,
  RepeatingFieldsReferenceFieldDirective: RepeatingFieldsReferenceFieldDirective,
  RepeatingFieldsInformationDirective:    RepeatingFieldsInformationDirective,
  ReferencedSimpleDirective:              ReferencedSimpleDirective,
  ReferencedInformationDirective:         ReferencedInformationDirective,
  FormInformationDirective:               FormInformationDirective,
  FieldGroupDirective:                    FieldGroupDirective
};

var ReportParser = {
  extraOptionsCallback: null,
  fieldNames: [],
  referenceFieldNames: [],
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
      if ($directive === undefined || directiveName === undefined) {
        return {};
      };
      var parsed = {},
          options = $directive
              .replace('[' + directiveName, '')  // remove directive
              .replace(/([^\]]*)\]/, '$1')       // Remove trailing ]
              .replace(                          // values within "" get spaces removed w/%%
                /"([^"]+)"/g,
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
    parseNameFromKnownFields: function(str, nameCollection) {
      if (str.indexOf('[') === 0) {
        str = str.substring(1);
      }
      if (str.substring(str.length-1) == ']') {
        str = str.substring(0, str.length-1);
      };
      if (nameCollection.indexOf(str) >= 0) {
        return str;
      };
      return '';
    },
    directiveIsFieldName: function($diretive) {
      var fieldName = $diretive.substring(1, $diretive.length-1);
      return
        ReportParser.fieldNames.contains(fieldName) ||
        ReportParser.referenceFieldNames.contains(fieldName);
    },
    parseName: function(str) {
      var name;

      name = this.parseNameFromKnownFields(str, ReportParser.referenceFieldNames);
      if (name !== '') {
        return name;
      };
      name =  this.parseNameFromKnownFields(str, ReportParser.fieldNames);
      if (name !== '') {
        return name;
      };

      var hasOptions = str.indexOf(':') > 0;

      if (!hasOptions) {
        return str.replace(/\[|\]/g, '');
      }
      return str.replace(/\[([^\s]+)[^\]]*\]/, '$1').trim();
    },
    createDirective: function(directiveName, options, content) {
      var className = directiveName + 'Directive';
      if (Directives[className] === undefined) {
        throw 'Directive "' + directiveName + '" not found (create ' + className + ')';
      }
      return new Directives[className](directiveName, options, content);
    },
    parse: function($directiveStart, content) {
      var directiveName = this.parseName($directiveStart),
          options = this.parseOptions($directiveStart, directiveName),
          d = this.createDirective(directiveName, options, content);

      d.extraOptionsCallback = ReportParser.extraOptionsCallback;
      return d.toHtml();
    },
    createSimpledDirective: function(directiveName, options, containingDirective, containingDirectiveOptions) {
      if (containingDirective === undefined || containingDirective === 'FieldGroup') {
        containingDirective = 'Form';
      }
      var SimpleDirectiveClass = containingDirective + 'SimpleDirective';
      if (directiveName === 'Information') {
        SimpleDirectiveClass = containingDirective + 'InformationDirective';
      }

      var isFieldName = ReportParser.fieldNames.contains(directiveName);
      var isReferenceField = ReportParser.referenceFieldNames.contains(directiveName);
      if (!isFieldName && isReferenceField) {
        SimpleDirectiveClass = containingDirective + 'ReferenceFieldDirective';
      }
      if (!Directives[SimpleDirectiveClass]) {
        throw 'Directive "' + SimpleDirectiveClass + '" not found';
        return null;
      }

      var obj = new Directives[SimpleDirectiveClass](directiveName, options, '', containingDirective, containingDirectiveOptions);
      if (SimpleDirectiveClass === 'FormSimpleDirective') {
        obj.validate = ReportParser.SimpleFieldsValidator;
      }
      if (isReferenceField) {
        obj.validate = ReportParser.ReferenceFieldsValidator;
      };
      if (!obj.isValid()) {
        return null;
      }

      return obj;
    },
    parseSimple: function($directive, containingDirective, $containingDirective) {
      var directiveName = this.parseName($directive);
      var options = this.parseOptions($directive, directiveName);
      var containingDirectiveOptions = this.parseOptions($containingDirective, containingDirective);
      var simple = this.createSimpledDirective(directiveName, options, containingDirective, containingDirectiveOptions);

      if (!simple) {
        return $directive;
      };

      simple.extraOptionsCallback = ReportParser.extraOptionsCallback;
      return simple.toHtml();
    }
  }
};