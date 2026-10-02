const ROLES={
"Financial Analyst":["4–12","financial analysis forecasting variance budgeting excel modeling reporting"],
"Investment Banking":["10–30","valuation dcf m&a financial modeling pitchbook due diligence comps"],
"Equity Research":["5–18","equity research valuation sector earnings model nse bse report"],
"Credit Analyst":["5–14","credit analysis underwriting risk ratios loan covenants rating"],
"Risk Analyst":["6–16","risk var stress testing basel compliance market risk credit risk sql python"],
"FP&A":["6–18","fp&a budgeting forecasting variance analysis kpi business partnering erp"],
"Audit & Accounting":["4–12","audit ifrs gaap ind as reconciliation tally sap tax gst controls"],
"Treasury":["6–18","treasury cash management liquidity forex hedging banking relationships"],
"Wealth / Relationship Mgmt":["4–15","wealth management portfolio clients mutual funds sales aum advisory"],
"Compliance & AML":["5–14","compliance aml kyc regulatory sebi rbi audit policy"]};
let role="Financial Analyst";
const $=id=>document.getElementById(id), enc=encodeURIComponent;
function render(){
 $("chips").innerHTML=Object.keys(ROLES).map(r=>`<button class="chip ${r==role?'on':''}" data-r="${r}">${r}</button>`).join("");
 $("chips").querySelectorAll("button").forEach(b=>b.onclick=()=>{role=b.dataset.r;render();$("target").value=role});
 $("roleInfo").innerHTML=`<table><tr><th>Role</th><th>Typical pay (₹ LPA)</th></tr><tr><td>${role}</td><td>${ROLES[role][0]}</td></tr></table>`;
 const c=$("company").value.trim(),l=$("loc").value.trim(),q=[c,role,"finance"].filter(Boolean).join(" ");
 const slug=(role+(c?" "+c:"")).toLowerCase().replace(/[^a-z0-9]+/g,"-");
 $("links").innerHTML=[
 ["LinkedIn",`https://www.linkedin.com/jobs/search/?keywords=${enc(q)}&location=${enc(l)}`],
 ["Naukri",`https://www.naukri.com/${slug}-jobs${l?"-in-"+l.toLowerCase().replace(/[^a-z0-9]+/g,"-"):""}`],
 ["Indeed",`https://in.indeed.com/jobs?q=${enc(q)}&l=${enc(l)}`],
 ["Google Jobs",`https://www.google.com/search?q=${enc(q+" jobs "+l)}&ibp=htl;jobs`],
 ["Glassdoor salaries",`https://www.google.com/search?q=${enc(role+" salary "+l+" glassdoor ambitionbox")}`]
 ].map(([n,u])=>`<a class="btn" target="_blank" rel="noopener" href="${u}">${n}</a>`).join("");
}
$("company").oninput=$("loc").oninput=render;
$("target").innerHTML=Object.keys(ROLES).map(r=>`<option>${r}</option>`).join("");
$("target").onchange=()=>{role=$("target").value;render()};
render();

$("check").onclick=()=>{
 const t=$("resume").value, low=t.toLowerCase(), words=(t.match(/\S+/g)||[]).length;
 if(words<30){$("result").innerHTML='<span class="bad">Paste more of your resume (at least a few lines).</span>';return}
 const tests=[];
 const add=(ok,pts,good,fix)=>tests.push({ok,pts,msg:ok?good:fix});
 add(/[\w.+-]+@[\w-]+\.[\w.]+/.test(t),8,"Email found.","Add a professional email address.");
 add(/(\+?\d[\d\s-]{8,})/.test(t),5,"Phone number found.","Add a phone number.");
 add(/linkedin\.com/.test(low),4,"LinkedIn link found.","Add your LinkedIn URL.");
 add(/education|b\.?com|mba|degree|university|college/.test(low),10,"Education section present.","Add a clear Education section.");
 add(/experience|internship|employment|work history/.test(low),12,"Experience/internship section present.","Add an Experience or Internships section.");
 add(/skills|tools|technical/.test(low),8,"Skills section present.","Add a Skills section (Excel, SQL, modeling, etc.).");
 add(/project|certif|cfa|frm|nism|ncfm/.test(low),5,"Projects/certifications present.","Add projects or certifications (CFA, FRM, NISM, etc.).");
 const nums=(t.match(/\d+(\.\d+)?\s?(%|lakh|cr|crore|k\b|m\b|mn|bn)|₹\s?\d|\$\s?\d/gi)||[]).length;
 add(nums>=4,14,`Good use of numbers (${nums} found).`,`Only ${nums} quantified results. Add figures (e.g. "cut reporting time by 30%", "analysed ₹5 Cr portfolio").`);
 const verbs=(low.match(/\b(analy[sz]ed|built|led|reduced|improved|prepared|managed|developed|automated|reconciled|forecast(ed)?|evaluated|designed|increased)\b/g)||[]).length;
 add(verbs>=5,8,"Strong action verbs used.","Start bullets with action verbs (analysed, built, reduced, automated).");
 add(!/\b(i am|i have|my name)\b/.test(low),3,"No first-person phrasing.","Remove 'I am / I have' style sentences.");
 add(words>=250&&words<=800,8,`Length is reasonable (${words} words).`,words<250?`Too short (${words} words). Aim for 300–600 for 1 page.`:`Too long (${words} words). Trim to one or two pages.`);
 const kw=ROLES[role][1].split(" "),hit=kw.filter(k=>low.includes(k)),miss=kw.filter(k=>!low.includes(k));
 const kscore=Math.round(15*hit.length/kw.length);
 tests.push({ok:hit.length>=kw.length*0.6,pts:kscore,msg:`Keyword match for ${role}: ${hit.length}/${kw.length}.`+(miss.length?` Missing: ${miss.join(", ")}.`:"")});
 const max=8+5+4+10+12+8+5+14+8+3+8+15;
 let got=tests.reduce((a,x)=>a+(x.ok&&x.pts!==kscore?x.pts:(x.pts===kscore&&x.msg.startsWith("Keyword")?kscore:0)),0);
 const s=Math.min(100,Math.round(got/max*100));
 const verdict=s>=75?["Good – ready to apply","ok"]:s>=50?["Decent – needs some fixes","warn"]:["Needs work before applying","bad"];
 $("result").innerHTML=`<div class="score ${verdict[1]}">${s}/100</div><div class="${verdict[1]}"><b>${verdict[0]}</b></div>`+
 tests.map(x=>`<div class="item ${x.ok?'ok':'warn'}">${x.ok?'✔':'✖'} ${x.msg}</div>`).join("")+
 `<p class="note">This is an automated checklist, not a recruiter's opinion. Use it to catch common gaps.</p>`;
};

// ---- Resume upload + experience + companies ----
const PDFJS="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/";
if(window.pdfjsLib)pdfjsLib.GlobalWorkerOptions.workerSrc=PDFJS+"pdf.worker.min.js";
$("file").onchange=async e=>{
 const f=e.target.files[0];if(!f)return;
 $("fstat").textContent="Reading "+f.name+"...";
 try{
  let txt="";const n=f.name.toLowerCase();
  if(n.endsWith(".pdf")){
   const pdf=await pdfjsLib.getDocument({data:await f.arrayBuffer()}).promise;
   for(let i=1;i<=pdf.numPages;i++){const pg=await pdf.getPage(i);const c=await pg.getTextContent();txt+=c.items.map(x=>x.str).join(" ")+"\n"}
  }else if(n.endsWith(".docx")){txt=(await mammoth.extractRawText({arrayBuffer:await f.arrayBuffer()})).value}
  else txt=await f.text();
  txt=txt.trim();$("resume").value=txt;
  $("fstat").textContent=txt?"Loaded "+f.name+" ("+(txt.match(/\S+/g)||[]).length+" words). Now click Check my resume.":"No text found. Scanned PDFs can't be read; paste the text instead.";
 }catch(err){$("fstat").textContent="Couldn't read that file. Paste the text instead."}
};
const KNOWN=["Deloitte","KPMG","EY","PwC","JPMorgan","Goldman Sachs","Morgan Stanley","Citi","Barclays","HSBC","HDFC","ICICI","Axis Bank","SBI","Kotak","Yes Bank","IDFC","Bajaj","Accenture","Infosys","TCS","Wipro","Cognizant","Amazon","Zerodha","Edelweiss","Motilal Oswal","CRISIL","ICRA","Mahindra"];
const CO_RE=/[A-Z][\w&.'-]*(?:\s+[A-Z&][\w&.'-]*){0,4}\s+(?:Pvt\.?\s*Ltd\.?|Private Limited|Limited|Ltd\.?|Inc\.?|LLP|LLC|Bank|Corporation|Corp\.?|Capital|Securities|Finance|Financial|Consulting|Industries|Partners)/g;
const EXPTIPS=[
 "Fresher: lead with internships, academic projects and certifications (CFA L1, NISM, Excel/SQL). Keep it to one page.",
 "0–2 years: show 2–3 achievements with numbers per role, plus tools used (Excel, SQL, Power BI, Tally).",
 "2–5 years: put impact first (cost saved, revenue, accuracy, turnaround) and show ownership of reports or models.",
 "5+ years: highlight team size, budgets or portfolio size handled, and leadership. Keep older roles brief."];
$("check").addEventListener("click",()=>setTimeout(()=>{
 const t=$("resume").value;if((t.match(/\S+/g)||[]).length<30)return;
 const low=t.toLowerCase(),set=new Set();
 (t.match(CO_RE)||[]).forEach(x=>set.add(x.trim()));
 KNOWN.forEach(k=>{if(new RegExp("\\b"+k+"\\b","i").test(t))set.add(k)});
 const cos=[...set].slice(0,12);
 const ys=[...low.matchAll(/(\d{1,2})(?:\.\d)?\+?\s*(?:years?|yrs?)/g)].map(m=>+m[1]).filter(n=>n<=40);
 const yrs=ys.length?Math.max(...ys):null;
 const lvl=$("exp").selectedIndex,co=$("co").value.trim();
 let h='<h3 style="margin:16px 0 6px">Experience & companies</h3>';
 h+=`<div class="item">Experience you selected: <b>${$("exp").value}</b>${yrs!==null?` · years mentioned in resume: <b>${yrs}</b>`:""}</div>`;
 if(yrs!==null){const m=yrs>=5?3:yrs>=2?2:yrs>=1?1:0;if(m!==lvl)h+='<div class="item warn">✖ The years in your resume don\'t match the level you selected. Check both.</div>'}
 h+=`<div class="item">${EXPTIPS[lvl]}</div>`;
 h+=`<div class="item">Companies found in your resume: <b>${cos.length?cos.join(", "):"none detected (add employer names clearly)"}</b></div>`;
 const q=(co||"")+" "+role+" finance",k=enc(q.trim());
 h+=`<div class="item">Jobs for ${role} at <b>${co||"all companies"}</b>:</div><div class="links">`+
 [["LinkedIn","https://www.linkedin.com/jobs/search/?keywords="+k],["Naukri","https://www.naukri.com/"+q.trim().toLowerCase().replace(/[^a-z0-9]+/g,"-")+"-jobs"],["Indeed","https://in.indeed.com/jobs?q="+k],["Google Jobs","https://www.google.com/search?q="+k+"&ibp=htl;jobs"]].map(([n,l])=>`<a class="btn" target="_blank" rel="noopener" href="${l}">${n}</a>`).join("")+"</div>";
 $("result").insertAdjacentHTML("beforeend",h);
},0));
