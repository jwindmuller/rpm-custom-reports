%lex

%s directive

%%

/* directives */
<directive>(Actions|RepeatingFields)
%{
  this.popState();
  return ReportParser.npState(this.yy.npOn, 'CONTENT', 'DIRECTIVE_END');
%}
(Actions|RepeatingFields)
%{
  this.begin('directive');
  return ReportParser.npState(this.yy.npOn, 'CONTENT', 'DIRECTIVE_START');
%}

/*\[[^\]]+\]                    return 'SIMPLE_DIRECTIVE'*/

\[                    return 'DIRECTIVE_OPEN'
\]                    return 'DIRECTIVE_CLOSE'
/*
\s[^:]+:[^:\s]+       return 'DIRECTIVE_OPTION'
*/
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
  | DIRECTIVE_OPEN DIRECTIVE_START directive_options DIRECTIVE_CLOSE 
      directive_contents 
    DIRECTIVE_OPEN DIRECTIVE_END  DIRECTIVE_CLOSE
    { $$ = ReportParser.Directive.parse($2, $3, $5); } 
  ;
directive_options
  :
  | directive_option
    {$$ = $1;}
  | directive_options directive_option
    {$$ =  ReportParser.join($1, $2);}
  ;
directive_option
  : CONTENT
    {$$ = $1;}
  ;

directive_contents
  : 
  | directive_content
    {$$ = $1;}
  | directive_contents directive_content
    {$$ =  ReportParser.join($1, $2);}
  ;
directive_content
  : CONTENT
    {$$ = $1;}
  | DIRECTIVE_OPEN simple_directive_contents DIRECTIVE_CLOSE
    {$$ = ReportParser.Directive.parseSimple($2);}
  ;
simple_directive_contents
  :
  | simple_directive_content
    {$$ = $1;}
  | simple_directive_contents CONTENT
    {$$ =  ReportParser.join($1, $2);}
  ;