/* Offline MathML for the course's explicitly delimited notation; never inject content HTML. */
function mathText(text){
 const safe=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 function formula(source){
  const tokens=source.match(/\[\[.*?\]\]|\d+(?:[.,]\d+)?|sin|cos|tan|log|ln|lim|det|[a-zA-Zα-ωΑ-Ω]|[⁰¹²³⁴⁵⁶⁷⁸⁹⁻]+|[ᵢⱼ₀₁₂₃₄₅₆₇₈₉]+|[^\s]/g)||[];let i=0;
  function group(){if(tokens[i]==='{'){i++;return sequence('}')}return atom(false)}
  function atom(scripts=true){let t=tokens[i++];if(t===undefined)return '<mrow></mrow>';let out;
   if(t.startsWith('[[')){try{let rows=JSON.parse(t);if(!rows.every(r=>Array.isArray(r)&&r.every(Number.isFinite)))throw Error();out='<mrow><mo>[</mo><mtable>'+rows.map(row=>'<mtr>'+row.map(n=>'<mtd><mn>'+n+'</mn></mtd>').join('')+'</mtr>').join('')+'</mtable><mo>]</mo></mrow>';}catch{out='<mtext>'+safe(t)+'</mtext>';}}
   else if(t==='('){out='<mrow><mo>(</mo>'+sequence(')')+'<mo>)</mo></mrow>';}
   else if(t==='{')out=sequence('}');
   else if(t==='√')out='<msqrt>'+group()+'</msqrt>';
   else if(/^(sin|cos|tan|log|ln|lim|det)$/.test(t))out='<mi mathvariant="normal">'+t+'</mi>';
   else if(/^[a-zA-Zα-ωΑ-Ω]$/.test(t))out='<mi>'+t+'</mi>';
   else if(/^\d/.test(t))out='<mn>'+safe(t)+'</mn>';
   else out='<mo>'+safe(t)+'</mo>';
   if(scripts){let sub='',sup='';while(i<tokens.length){let n=tokens[i];if(n==='^'||n==='_'){i++;if(n==='^')sup=group();else sub=group();}
    else if(/^[⁰¹²³⁴⁵⁶⁷⁸⁹⁻]+$/.test(n)){i++;sup='<mn>'+[...n].map(c=>'0123456789-'['⁰¹²³⁴⁵⁶⁷⁸⁹⁻'.indexOf(c)]).join('')+'</mn>';}
    else if(/^[ᵢⱼ₀₁₂₃₄₅₆₇₈₉]+$/.test(n)){i++;sub='<mtext>'+[...n].map(c=>'ij0123456789'['ᵢⱼ₀₁₂₃₄₅₆₇₈₉'.indexOf(c)]).join('')+'</mtext>';}
    else break;
   }if(sub&&sup)out='<msubsup>'+out+sub+sup+'</msubsup>';else if(sub)out='<msub>'+out+sub+'</msub>';else if(sup)out='<msup>'+out+sup+'</msup>';}
   return out;
  }
  function sequence(stop){let out='';while(i<tokens.length&&tokens[i]!==stop){let a=atom();while(tokens[i]==='/'){i++;a='<mfrac>'+a+atom()+'</mfrac>'}out+=a;}if(stop&&tokens[i]===stop)i++;return '<mrow>'+out+'</mrow>'}
  return '<math xmlns="http://www.w3.org/1998/Math/MathML" aria-label="'+safe(source)+'">'+sequence()+'</math>';
 }
 return String(text).split(/(\$[^$]+\$)/g).map(s=>s.startsWith('$')&&s.endsWith('$')?formula(s.slice(1,-1)):safe(s)).join('');
}
if(typeof module!=='undefined')module.exports={mathText};
