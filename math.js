/* Small, offline MathML typesetter for the notation used in these lessons.
   Delimit formulas with $...$. No HTML from content is trusted. */
function mathText(text){
 const safe=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 function formula(source){
  const tokens=source.match(/\[\[.*?\]\]|\[[\d ,]+\]|\d+(?:,\d+)?|[a-zA-Z]|[²ᵢⱼ₁₂]+|[^\s]/g)||[];let i=0;
  function atom(){let t=tokens[i++];if(t===undefined)return '';
   let out;
   if(t.startsWith('[[')){let rows=JSON.parse(t);out='<mrow><mo>[</mo><mtable>'+rows.map(row=>'<mtr>'+row.map(n=>'<mtd><mn>'+n+'</mn></mtd>').join('')+'</mtr>').join('')+'</mtable><mo>]</mo></mrow>';}
   else if(t==='('){let inner=sequence(')');out='<mrow><mo>(</mo>'+inner+'<mo>)</mo></mrow>';}
   else if(/^[a-zA-Z]$/.test(t))out='<mi>'+t+'</mi>';
   else if(/^\d/.test(t))out='<mn>'+safe(t)+'</mn>';
   else out='<mo>'+safe(t)+'</mo>';
   if(tokens[i]==='²'){i++;out='<msup>'+out+'<mn>2</mn></msup>'}
   else if(/^[ᵢⱼ₁₂]+$/.test(tokens[i]||'')){let sub=tokens[i++].replaceAll('ᵢ','i').replaceAll('ⱼ','j').replaceAll('₁','1').replaceAll('₂','2');out='<msub>'+out+'<mrow>'+[...sub].map(c=>/\d/.test(c)?'<mn>'+c+'</mn>':'<mi>'+c+'</mi>').join('')+'</mrow></msub>'}
   return out;
  }
  function sequence(stop){let out='';while(i<tokens.length&&tokens[i]!==stop){let a=atom();if(tokens[i]==='/'){i++;a='<mfrac>'+a+atom()+'</mfrac>'}out+=a;}if(stop&&tokens[i]===stop)i++;return '<mrow>'+out+'</mrow>'}
  return '<math xmlns="http://www.w3.org/1998/Math/MathML" aria-label="'+safe(source)+'">'+sequence()+'</math>';
 }
 return String(text).split(/(\$[^$]+\$)/g).map(s=>s.startsWith('$')&&s.endsWith('$')?formula(s.slice(1,-1)):safe(s)).join('');
}
