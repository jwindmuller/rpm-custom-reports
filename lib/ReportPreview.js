ReportPreview = {
  preview: function(container) {
    this.renderActionDirectives(container);
  },

  renderActionDirectives: function(container) {
    var actionDirectives = container.getChildren('.actions-directive');
    actionDirectives.each(function(actionDirective, i) {
      this.renderActionDirective(actionDirective);
    }, this);
  },
  renderActionDirective: function(directive) {
    var format = directive.get('data-format');
    this.cleanupDirective(directive, format);
    this.renderDirective(directive, format);
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
      var children = directive.getChildren();
      directive
        .empty()
        .adopt(children);
    }
  },

  renderDirective: function(directive, format) {
    this.getFormatRenderer(format)(directive);
  },

  getFormatRenderer: function(format) {
    var formatUppercaseFirst = format[0].toUpperCase() + format.slice(1),
        functionName = 'formatAs' + formatUppercaseFirst;
    return this[functionName];
  },

  formatAsTable: function(directive) {
    var fields = directive.getChildren(),
        fieldNames = fields.map(function(item, index, array) {
          return item.get('id');
        }),
        tableTpl = $('table-template').get('text'),
        data = {
          headers: fieldNames,
          rows: [0,1,2].map(function(item, index, array) {
            var cells = fieldNames;
            cells = cells.map(function(cellValue) {
              if (item == 1) {
                cellValue = '...';
              }
              return {
                cssClass: item == 1 ? 'dotdotdot': '',
                text:     item == 1 ? '...': cellValue
              }
            });
            return {
              cells: cells
            }
          })
        }

    directive.set('html', Mustache.render(tableTpl, data));
    console.debug(fieldNames);
  }

}