var Directive = new Class({
	name: '',
	options: [],
	validOptions: [],
	content: '',
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
		console.debug(html);
		return html.join(' ');
	},
	tag: function() {
		return '<span id=":id" :options>:content</span>';
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
				id: '__',
				options: this.optionsToHtml(),
				content: this.content
			}
		);
	}
});
var ActionsDirective = new Class({
	Implements: Directive,
	validOptions: ['format', 'show']
});
var SimpleDirective = new Class({
	Implements: Directive,
	initialize: function(directiveContent) {

	}
});
var Directives = {
	ActionsDirective:ActionsDirective,
	SimpleDirective:SimpleDirective
};
var ReportParser = {
	formatContent: function($content) {
		return $content;
	},
	substring: function($val, $left, $right) {
		return $val.substring($left, $val.length + $right);
	},
	match: function($pattern, $subject) {
		return $subject.match($pattern);
	},
	replace: function($search, $replace, $subject) {
		return $subject.replace($search, $replace);
	},
	split: function($delimiter, $string) {
		return $string.split($delimiter);
	},
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
		parse: function($directiveName, $options, $content) {

			var actionName = this.parseName($directiveName),
				options = this.parseOptions($options),
				className = actionName + 'Directive';
				content = $content.substring( $content.indexOf(']') + 1 ),
				d = new Directives[className](actionName, options, content);
			
			return d.toHtml();
		},
		parseSimple: function($directive) {
			var simple = new SimpleDirective($directive)
			return 'jojo' + $directive + 'jojo';
		}
	}
};