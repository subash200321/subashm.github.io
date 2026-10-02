
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

let hist=[],busy=false;
async function ask(){
 const q=$("q").value.trim();if(!q||busy)return;
 $("q").value="";busy=true;
 const log=$("log");
 const u=document.createElement("div");u.className="msg u";u.textContent=q;log.appendChild(u);
 const b=document.createElement("div");b.className="msg b";b.textContent="Thinking...";log.appendChild(b);log.scrollTop=log.scrollHeight;
 hist.push({role:"user",content:q});
 try{
  const res=await fetch("/api/chat",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({messages:hist})});
  const data=await res.json();
  if(!res.ok)throw new Error(data.error||"error");
  b.textContent=data.text;hist.push({role:"assistant",content:data.text});
 }catch(e){b.textContent="Sorry, I couldn't answer that ("+e.message+").";hist.pop()}
 const k=enc(q+" finance jobs");
 $("qlinks").innerHTML=[["LinkedIn","https://www.linkedin.com/jobs/search/?keywords="+k],["Naukri","https://www.naukri.com/"+q.toLowerCase().replace(/[^a-z0-9]+/g,"-")+"-jobs"],["Indeed","https://in.indeed.com/jobs?q="+k],["Google Jobs","https://www.google.com/search?q="+k+"&ibp=htl;jobs"]].map(([n,l])=>`<a class="btn" target="_blank" rel="noopener" href="${l}">${n}: live openings</a>`).join("");
 busy=false;
}
$("send").onclick=ask;$("q").onkeydown=e=>{if(e.key==="Enter")ask()};
