%lex

%s directive

%%

/* directives */
\[(Actions|RepeatingFields)\]
%{
  this.yy.directiveContent = false;
  return 'DIRECTIVE_END'
%}
\[(Actions|RepeatingFields)[^\]]+\]
%{
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
      $$ = ReportParser.Directive.parseSimple($1);
    }
  ;

directive_contents
  : 
    { $$ = 'cosa'; }
  | directive_content
    {$$ = $1;}
  | directive_contents directive_content
    {$$ =  ReportParser.join($1, $2);}
  ;
directive_content
  : CONTENT
    {$$ = $1;}
  | SIMPLE_DIRECTIVE
    {$$ = ReportParser.Directive.parseSimple($1);}
  ;
