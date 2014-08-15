ReportPreview = {
  preview: function(container) {
    this.renderRepeatingDirectives(container);
    this.renderSimpleDirectives(container)
  },
  renderSimpleDirectives: function(container) {
    container.getElements(
      '.form-field'
    ).each(function(formField, i) {
      formField.set('text', formField.get('data-fieldName'));
    });
  },
  renderRepeatingDirectives: function(container) {
    container.getElements(
      '.directive'
    ).each(function(directives, i) {
      this.renderDirective(directives);
    }, this);
  },
  renderDirective: function(directive) {
    var format = directive.get('data-format');
    if (format === null) {
      return;
    };
    this.cleanupDirective(directive, format);
    this.getFormatRenderer(format)(directive);
  },

  cleanupDirective: function(directive, format) {
    if (format === 'custom') {
      return;
    }
    if (format == 'native') {
      directive.empty();
      return;
    }
    if (format == 'table') {
      var children = directive.getElements('.field');
      directive
        .empty()
        .adopt(children)
        .addClass('table-wrapper');
    }
  },

  getFormatRenderer: function(format) {
    var formatUppercaseFirst = format[0].toUpperCase() + format.slice(1),
        functionName = 'formatAs' + formatUppercaseFirst;
    return this[functionName];
  },

  // Formatters - see renderDirective
  formatAsTable: function(directive) {
    var fields = directive.getChildren(),
        fieldNames = fields.map(function(item, index, array) {
          return item.get('data-fieldName');
        }),
        tableTpl = $('table-template').get('text'),
        data = {
          headers: fieldNames,
          rows: [0,1,2,3,4].map(function(item, index, array) {
            var cells = fieldNames;
            cells = cells.map(function(cellValue) {
              var showDots = item === 3;
              if (showDots) {
                cellValue = '...';
              }
              return {
                cssClass: showDots ? 'dotdotdot': '',
                text:     showDots ? '...'      : cellValue
              }
            });
            return {
              cells: cells
            }
          })
        }

    directive.set('html', Mustache.render(tableTpl, data));
  },

  formatAsCustom: function(directive) {
    var content = directive.getChildren();

    if (content.length !== 1) {
      content = new getElements('span').adopt(content);
    };

    content = content[0];
    content = [0,1,2,3,4].map(function(item, index, array) {
      var cloned = content.clone(),
          showDots = item === 3;
      if (showDots) {
        cloned
          .empty()
          .set('text', '...')
          .addClass('dotdotdot');
      };
      return cloned;
    });

    directive.empty();
    directive.adopt(content);
  }
  // End Formatters

}