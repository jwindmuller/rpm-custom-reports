%lex

%s directive

%%

/* directives */
\[(Actions|RepeatingFields|Referenced|FieldGroup)\]
%{
  this.yy.directiveContent = false;
  this.yy.match = undefined;
  this.yy.directive = undefined;
  return 'DIRECTIVE_END'
%}
\[(Actions|RepeatingFields|Referenced|FieldGroup)[^\]]+\]
%{
  if (ReportParser.Directive.directiveIsFieldName(this.match)) {
    return 'SIMPLE_DIRECTIVE';
  }
  this.yy.directive = ReportParser.Directive.parseName(this.match);
  this.yy.match = this.match;
  this.yy.directiveContent = true;
  return 'DIRECTIVE_START'
%}

\[\w+[^\]]+\]
%{
  return 'SIMPLE_DIRECTIVE';
%}

/* The rest */
(.)                     return 'CONTENT'
(\n)                    return 'CONTENT'
(\r)                    return 'CONTENT'
<<EOF>>                 return 'EOF'

/lex

%%

report
 : report_contents EOF
  {return $1;}
 ;

report_contents
  :
  | contents
    {$$ = $1;}
  ;

contents
  : content
    {$$ = $1;}
  | contents content
    {$$ =  ReportParser.join($1, $2);}
  ;

content
  : CONTENT
    {$$ = $1;}
  | DIRECTIVE_START
      directive_contents
    DIRECTIVE_END
    {
      $$ = ReportParser.Directive.parse($1, $2);
    }
  | SIMPLE_DIRECTIVE
    {
      $$ = ReportParser.Directive.parseSimple($1, yy.directive, yy.match);
    }
  ;

directive_contents
  : 
    { $$ = ''; }
  | directive_content
    {$$ = $1;}
  | directive_contents directive_content
    {$$ =  ReportParser.join($1, $2);}
  ;
directive_content
  : CONTENT
    {$$ = $1;}
  | DIRECTIVE_START
      directive_contents
    DIRECTIVE_END
    {
      $$ = ReportParser.Directive.parse($1, $2);
    }
  | SIMPLE_DIRECTIVE
    {
      $$ = ReportParser.Directive.parseSimple($1, yy.directive, yy.match);
    }
  ;
