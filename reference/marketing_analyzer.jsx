import { useState, useMemo, useCallback, useRef } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, Cell } from "recharts";
import Papa from "papaparse";

/* ── helpers ─────────────────────────────────────────────── */
const groupBy = (arr, fn) => {
  const r = {};
  for (const item of arr) { const k = typeof fn === "function" ? fn(item) : item[fn]; (r[k] || (r[k] = [])).push(item); }
  return r;
};
const sumBy = (arr, fn) => { const g = typeof fn === "function" ? fn : (o) => o[fn] || 0; return arr.reduce((s, i) => s + (g(i) || 0), 0); };
const countBy = (arr, fn) => { const r = {}; for (const i of arr) { const k = fn(i); r[k] = (r[k] || 0) + 1; } return r; };
const $ = (n) => n == null || isNaN(n) ? "—" : Math.abs(n) >= 1e6 ? `$${(n/1e6).toFixed(1)}M` : Math.abs(n) >= 1e4 ? `$${(n/1e3).toFixed(0)}K` : `$${Math.round(n).toLocaleString()}`;
const N = (n) => n == null ? "—" : n.toLocaleString();
const P = (n) => n == null || isNaN(n) ? "—" : `${n.toFixed(1)}%`;
const pct = (a, b) => b > 0 ? (a / b) * 100 : 0;

/* ── column detection ────────────────────────────────────── */
function detect(headers, rows) {
  const c = { id:null, contactId:null, channel:null, campaign:null, meetingBooked:null, oppId:null, pipeline:null, closedWon:null, oppStage:null, interactionStatus:null, dimensions:[] };
  const L = headers.map(h => h.toLowerCase().replace(/[^a-z0-9]/g,""));
  headers.forEach((h,i) => {
    const l = L[i];
    if (!c.id && (l.includes("memberid") || (l.includes("id") && i===0))) c.id=h;
    else if (!c.contactId && l.includes("contactid")) c.contactId=h;
    else if (!c.channel && (l.includes("channel") || l.includes("source"))) c.channel=h;
    else if (!c.campaign && l.includes("campaign") && !l.includes("member")) c.campaign=h;
    else if (!c.meetingBooked && l.includes("meeting") && !l.includes("date")) { const v=rows.map(r=>String(r[h]).toLowerCase()); if(v.some(x=>x==="yes"||x==="no")) c.meetingBooked=h; }
    else if (!c.pipeline && (l.includes("pipeline") || (l.includes("revenue") && l.includes("share")))) c.pipeline=h;
    else if (!c.closedWon && (l.includes("closedwon") || l.includes("woncarr"))) c.closedWon=h;
    else if (!c.oppStage && (l.includes("stage") && (l.includes("opp") || l.includes("opportunity")))) c.oppStage=h;
    else if (!c.oppId && (l.includes("opportunityid") || l.includes("oppid"))) c.oppId=h;
    else if (!c.interactionStatus && (l.includes("interaction") || (l.includes("status") && !l.includes("opp")))) c.interactionStatus=h;
  });
  headers.forEach(h => {
    if (Object.values(c).flat().includes(h)) return;
    const vals = rows.map(r=>r[h]).filter(Boolean);
    const u = new Set(vals);
    if (!vals.every(v=>!isNaN(parseFloat(v))) && u.size>=2 && u.size<=40) c.dimensions.push(h);
  });
  return c;
}

/* ── analysis engine ─────────────────────────────────────── */
function analyze(data, cols, dim) {
  const groups = groupBy(data, r => r[dim] || "(blank)");
  const rows = Object.entries(groups).map(([name, rr]) => {
    const touches=rr.length;
    const meetings=rr.filter(r=>String(r[cols.meetingBooked]).toLowerCase()==="yes").length;
    const opps=cols.oppId?rr.filter(r=>r[cols.oppId]).length:0;
    const pipeline=cols.pipeline?sumBy(rr,r=>parseFloat(r[cols.pipeline])||0):0;
    const closedWon=cols.closedWon?sumBy(rr,r=>parseFloat(r[cols.closedWon])||0):0;
    const wonCount=cols.closedWon?rr.filter(r=>parseFloat(r[cols.closedWon])>0).length:0;
    return { name, touches, meetings, opps, pipeline, closedWon, wonCount,
      mtgRate:pct(meetings,touches), mtgToOpp:pct(opps,meetings),
      ppt:touches>0?pipeline/touches:0, ppm:meetings>0?pipeline/meetings:0,
      winRate:opps>0?pct(wonCount,opps):0, avgDeal:wonCount>0?closedWon/wonCount:0, pipeShare:0, touchShare:0 };
  }).sort((a,b)=>b.pipeline-a.pipeline);
  const tp=sumBy(rows,"pipeline"), tt=sumBy(rows,"touches");
  rows.forEach(r=>{ r.pipeShare=pct(r.pipeline,tp); r.touchShare=pct(r.touches,tt); });
  return rows;
}

function dropOffAnalysis(data, cols) {
  if (!cols.interactionStatus||!cols.meetingBooked) return null;
  const engaged=data.filter(r=>{const s=String(r[cols.interactionStatus]).toLowerCase(); return s.includes("attended")||s.includes("visited")||s.includes("badge");});
  const noMtg=engaged.filter(r=>String(r[cols.meetingBooked]).toLowerCase()!=="yes");
  const bds=[];
  if(cols.channel) bds.push({label:`By ${cols.channel}`,data:countBy(noMtg,r=>r[cols.channel]),total:noMtg.length});
  cols.dimensions.forEach(d=>{const bd=countBy(noMtg,r=>r[d]||"(blank)");if(Object.keys(bd).length>=2&&Object.keys(bd).length<=15) bds.push({label:`By ${d}`,data:bd,total:noMtg.length});});
  return {attended:engaged.length, noMeeting:noMtg.length, breakdowns:bds};
}

/* ── styles ──────────────────────────────────────────────── */
const S = { bg:"#0d1117", surf:"#161b22", bdr:"#30363d", txt:"#e6edf3", mut:"#8b949e", accent:"#58a6ff", green:"#3fb950", red:"#f85149", orange:"#d29922", purple:"#bc8cff" };
const TH = {textAlign:"right",padding:"10px 12px",fontSize:10,textTransform:"uppercase",letterSpacing:0.8,color:S.mut,borderBottom:`2px solid ${S.bdr}`,whiteSpace:"nowrap",fontWeight:600};
const TD = {textAlign:"right",padding:"9px 12px",fontFamily:"monospace",fontSize:12};
const Card = ({label,value,sub,color}) => (
  <div style={{background:S.surf,border:`1px solid ${S.bdr}`,borderRadius:8,padding:"12px 14px"}}>
    <div style={{fontSize:10,textTransform:"uppercase",letterSpacing:1,color:S.mut,marginBottom:3}}>{label}</div>
    <div style={{fontSize:20,fontWeight:700,fontFamily:"monospace",color:color||S.txt}}>{value}</div>
    {sub&&<div style={{fontSize:11,color:S.mut,marginTop:2}}>{sub}</div>}
  </div>
);
const Callout = ({color,children}) => (
  <div style={{marginTop:12,padding:"11px 15px",background:`${color}11`,borderLeft:`3px solid ${color}`,borderRadius:"0 6px 6px 0",fontSize:12,color:S.mut,lineHeight:1.7}}>{children}</div>
);
const Sel = ({value,onChange,options}) => (
  <select value={value||""} onChange={e=>onChange(e.target.value)} style={{background:S.surf,border:`1px solid ${S.bdr}`,color:S.txt,padding:"6px 12px",borderRadius:6,fontSize:12,fontFamily:"system-ui"}}>{options.map(d=><option key={d} value={d}>{d}</option>)}</select>
);

/* ── main ────────────────────────────────────────────────── */
export default function App() {
  const [rawData, setRawData] = useState(null);
  const [cols, setCols] = useState(null);
  const [tab, setTab] = useState("ai");
  const [dim, setDim] = useState(null);
  const [crossDim, setCrossDim] = useState(null);
  const [fileName, setFileName] = useState("");
  const [msgs, setMsgs] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatEnd = useRef(null);

  const onFile = useCallback((f) => {
    setFileName(f.name);
    Papa.parse(f, { header:true, skipEmptyLines:true, complete:(res) => {
      const d=detect(res.meta.fields,res.data.slice(0,100));
      setCols(d); setRawData(res.data); setDim(d.channel||res.meta.fields[0]); setCrossDim(d.dimensions[0]||null);
    }});
  },[]);

  const funnel = useMemo(() => rawData&&dim ? analyze(rawData,cols,dim) : [], [rawData,cols,dim]);
  const totals = useMemo(() => !funnel.length?null:{touches:sumBy(funnel,"touches"),meetings:sumBy(funnel,"meetings"),opps:sumBy(funnel,"opps"),pipeline:sumBy(funnel,"pipeline"),closedWon:sumBy(funnel,"closedWon")},[funnel]);
  const cross = useMemo(() => rawData&&crossDim ? analyze(rawData,cols,crossDim) : [], [rawData,crossDim,cols]);
  const drop = useMemo(() => rawData&&cols ? dropOffAnalysis(rawData,cols) : null, [rawData,cols]);
  const variance = useMemo(() => { if(!cross.length) return null; const r=cross.filter(x=>x.touches>=20).map(x=>x.ppt); if(r.length<2) return null; const mn=Math.min(...r.filter(x=>x>0)); return mn>0?(Math.max(...r)/mn).toFixed(1):null; },[cross]);
  const allDims = useMemo(() => cols ? [cols.channel,cols.campaign,cols.interactionStatus,...cols.dimensions].filter(Boolean) : [], [cols]);

  /* ── data context for AI ── */
  const dataCtx = useMemo(() => {
    if (!rawData||!cols||!totals) return "";
    const cf = cols.channel ? analyze(rawData,cols,cols.channel) : funnel;
    const ct = cf.map(r=>`${r.name}: ${r.touches} touches (${r.touchShare.toFixed(1)}%), ${r.meetings} mtgs (${r.mtgRate.toFixed(1)}%), ${r.opps} opps, $${Math.round(r.pipeline).toLocaleString()} pipeline (${r.pipeShare.toFixed(1)}%), $${Math.round(r.ppt).toLocaleString()}/touch, $${Math.round(r.closedWon).toLocaleString()} won (${r.winRate.toFixed(1)}% win)`).join("\n");
    const ds = [cols.interactionStatus,...cols.dimensions.slice(0,4)].filter(Boolean).map(d=>{
      const df=analyze(rawData,cols,d);
      return `\n${d}:\n${df.map(r=>`  ${r.name}: ${r.touches} touches, ${r.mtgRate.toFixed(1)}% mtg rate, $${Math.round(r.pipeline).toLocaleString()} pipeline, $${Math.round(r.ppt).toLocaleString()}/touch`).join("\n")}`;
    }).join("");
    let dd="";
    if(drop&&drop.attended>0){dd=`\nDROP-OFF: ${drop.attended} engaged, ${drop.noMeeting} (${(drop.noMeeting/drop.attended*100).toFixed(1)}%) no meeting.\n`;drop.breakdowns.forEach(b=>{dd+=`${b.label}: ${Object.entries(b.data).sort((a,b)=>b[1]-a[1]).map(([k,v])=>`${k}=${v}`).join(", ")}\n`;});}
    return `DATA (${rawData.length} records):\nFUNNEL: ${N(totals.touches)} touches > ${N(totals.meetings)} meetings (${P(pct(totals.meetings,totals.touches))}) > ${N(totals.opps)} opps > $${Math.round(totals.pipeline).toLocaleString()} pipeline > $${Math.round(totals.closedWon).toLocaleString()} won\n\nCHANNELS:\n${ct}\n\nDIMENSIONS:${ds}\n${dd}`;
  },[rawData,cols,totals,funnel,drop]);

  /* ── AI query ── */
  const askAI = useCallback(async(q) => {
    if(!q.trim()||!dataCtx) return;
    const um={role:"user",content:q};
    setMsgs(p=>[...p,um]); setInput(""); setLoading(true);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:1500,
          system:`You are a Senior Marketing Operations analyst. Answer with specific numbers from the data. Be direct and actionable. Structure recommendations as: WHAT'S HAPPENING > WHY IT MATTERS > WHAT TO DO > HOW TO MEASURE.\n\n${dataCtx}`,
          messages:[...msgs,um].map(m=>({role:m.role,content:m.content}))})});
      const d = await res.json();
      setMsgs(p=>[...p,{role:"assistant",content:d.content?.map(b=>b.text||"").join("\n")||"No response."}]);
    } catch(e) { setMsgs(p=>[...p,{role:"assistant",content:`Error: ${e.message}`}]); }
    finally { setLoading(false); setTimeout(()=>chatEnd.current?.scrollIntoView({behavior:"smooth"}),100); }
  },[dataCtx,msgs]);

  /* ── upload screen ── */
  if (!rawData) return (
    <div style={{minHeight:"100vh",background:S.bg,color:S.txt,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"system-ui"}}>
      <div onDrop={e=>{e.preventDefault();if(e.dataTransfer.files[0])onFile(e.dataTransfer.files[0]);}} onDragOver={e=>e.preventDefault()}
        onClick={()=>document.getElementById("fi").click()}
        style={{border:`2px dashed ${S.bdr}`,borderRadius:16,padding:"60px 80px",textAlign:"center",cursor:"pointer",maxWidth:500}}>
        <div style={{fontSize:48,marginBottom:16}}>📊</div>
        <div style={{fontSize:20,fontWeight:700,marginBottom:8}}>Marketing Data Analyzer</div>
        <div style={{color:S.mut,fontSize:14,marginBottom:24}}>Drop a CSV file here or click to upload</div>
        <div style={{color:S.mut,fontSize:12}}>Auto-detects funnel stages, channels, dimensions</div>
        <input id="fi" type="file" accept=".csv" style={{display:"none"}} onChange={e=>{if(e.target.files[0])onFile(e.target.files[0]);}}/>
      </div>
    </div>
  );

  const tabs = [{id:"ai",label:"🤖 AI Analyst"},{id:"funnel",label:"Funnel"},{id:"charts",label:"Charts"},{id:"crosscut",label:"Cross-Cut"},{id:"dropoff",label:"Drop-Off"},{id:"config",label:"Fields"}];

  return (
    <div style={{minHeight:"100vh",background:S.bg,color:S.txt,fontFamily:"system-ui",fontSize:13}}>
      {/* header */}
      <div style={{padding:"14px 20px",borderBottom:`1px solid ${S.bdr}`,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div><span style={{fontWeight:700,fontSize:15}}>📊 Marketing Data Analyzer</span><span style={{color:S.mut,marginLeft:10,fontSize:12}}>{fileName} · {N(rawData.length)} records</span></div>
        <button onClick={()=>{setRawData(null);setCols(null);setFileName("");setMsgs([]);}} style={{background:"#21262d",border:`1px solid ${S.bdr}`,color:S.mut,padding:"5px 12px",borderRadius:6,cursor:"pointer",fontSize:11}}>New File</button>
      </div>
      {/* KPIs */}
      {totals && <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:10,padding:"12px 20px"}}>
        <Card label="Touches" value={N(totals.touches)}/><Card label="Meetings" value={N(totals.meetings)} sub={`${P(pct(totals.meetings,totals.touches))} rate`}/><Card label="Opps" value={N(totals.opps)} sub={`${P(pct(totals.opps,totals.meetings))} mtg>opp`}/><Card label="Pipeline" value={$(totals.pipeline)} color={S.accent}/><Card label="Closed Won" value={$(totals.closedWon)} color={S.green}/>
      </div>}
      {/* tabs */}
      <div style={{display:"flex",gap:0,padding:"0 20px",borderBottom:`1px solid ${S.bdr}`,overflowX:"auto"}}>
        {tabs.map(t=><button key={t.id} onClick={()=>setTab(t.id)} style={{padding:"9px 16px",background:"transparent",border:"none",borderBottom:tab===t.id?`2px solid ${S.accent}`:"2px solid transparent",color:tab===t.id?S.txt:S.mut,cursor:"pointer",fontSize:12,fontWeight:tab===t.id?600:400,fontFamily:"system-ui",whiteSpace:"nowrap"}}>{t.label}</button>)}
      </div>
      <div style={{padding:"16px 20px"}}>

      {/* ═══ AI TAB ═══ */}
      {tab==="ai" && <div style={{display:"flex",flexDirection:"column",height:"calc(100vh - 260px)"}}>
        {msgs.length===0 && <div style={{marginBottom:14}}>
          <div style={{fontSize:14,fontWeight:600,marginBottom:10}}>Ask anything about your data</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
            {["What are the 3 most important insights about marketing performance, channel efficiency, and pipeline contribution?",
              "Which channels are underperforming relative to their touch volume?",
              "Design a reporting framework to monitor channel efficiency. What metrics, cadence, and stakeholders?",
              "Recommend one operational or process change based on this data.",
              "Analyze the drop-off between event attendance and meetings. What's the nurture opportunity?",
              "Compare Account Tier performance. Are we targeting the right accounts?",
              "What's broken with Direct Mail? How would you fix it?",
              "Present this data as if briefing a VP of Revenue Operations."
            ].map(p=><button key={p} onClick={()=>askAI(p)} style={{background:S.surf,border:`1px solid ${S.bdr}`,borderRadius:8,padding:"9px 12px",color:S.mut,fontSize:12,textAlign:"left",cursor:"pointer",lineHeight:1.5,fontFamily:"system-ui"}}
              onMouseEnter={e=>{e.currentTarget.style.borderColor=S.accent;e.currentTarget.style.color=S.txt;}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor=S.bdr;e.currentTarget.style.color=S.mut;}}>{p}</button>)}
          </div>
        </div>}
        <div style={{flex:1,overflowY:"auto",marginBottom:10,display:"flex",flexDirection:"column",gap:10}}>
          {msgs.map((m,i)=><div key={i} style={{display:"flex",gap:10,alignItems:"flex-start"}}>
            <div style={{width:26,height:26,borderRadius:6,background:m.role==="user"?"#1f6feb":S.surf,border:m.role==="assistant"?`1px solid ${S.bdr}`:"none",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,flexShrink:0}}>{m.role==="user"?"👤":"🤖"}</div>
            <div style={{flex:1,background:m.role==="user"?"rgba(31,111,235,0.08)":S.surf,border:`1px solid ${m.role==="user"?"rgba(31,111,235,0.2)":S.bdr}`,borderRadius:8,padding:"10px 14px",fontSize:13,lineHeight:1.7,whiteSpace:"pre-wrap"}}>
              {m.content.split("\n").map((line,j)=>{
                if(line.startsWith("## ")||line.startsWith("### ")) return <div key={j} style={{fontWeight:700,fontSize:14,marginTop:j>0?10:0,marginBottom:3,color:S.accent}}>{line.replace(/^#+\s/,"")}</div>;
                if(line.match(/^\*\*.+\*\*$/)) return <div key={j} style={{fontWeight:600,marginTop:6,marginBottom:2}}>{line.replace(/\*\*/g,"")}</div>;
                if(line.startsWith("- ")||line.startsWith("• ")) return <div key={j} style={{paddingLeft:14}}><span style={{position:"relative",left:-8,color:S.mut}}>•</span>{line.replace(/^[-•]\s/,"")}</div>;
                if(!line.trim()) return <div key={j} style={{height:6}}/>;
                return <div key={j}>{line}</div>;
              })}
            </div>
          </div>)}
          {loading && <div style={{display:"flex",gap:10,alignItems:"center",padding:"10px 14px",background:S.surf,border:`1px solid ${S.bdr}`,borderRadius:8,width:"fit-content"}}>
            <span style={{fontSize:12}}>🤖</span><span style={{fontSize:12,color:S.mut}}>Analyzing your data...</span>
          </div>}
          <div ref={chatEnd}/>
        </div>
        <div style={{display:"flex",gap:8}}>
          <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&!loading){e.preventDefault();askAI(input);}}}
            placeholder="Ask about your marketing data..." disabled={loading}
            style={{flex:1,background:S.surf,border:`1px solid ${S.bdr}`,color:S.txt,padding:"9px 12px",borderRadius:8,fontSize:13,fontFamily:"system-ui",outline:"none"}}/>
          <button onClick={()=>askAI(input)} disabled={loading||!input.trim()}
            style={{background:loading||!input.trim()?"#21262d":"#1f6feb",border:"none",color:loading||!input.trim()?S.mut:"#fff",padding:"9px 18px",borderRadius:8,cursor:loading?"not-allowed":"pointer",fontSize:13,fontWeight:600,fontFamily:"system-ui"}}>{loading?"...":"Ask"}</button>
          {msgs.length>0&&<button onClick={()=>setMsgs([])} style={{background:"#21262d",border:`1px solid ${S.bdr}`,color:S.mut,padding:"9px 12px",borderRadius:8,cursor:"pointer",fontSize:11,fontFamily:"system-ui"}}>Clear</button>}
        </div>
      </div>}

      {/* ═══ FUNNEL TAB ═══ */}
      {tab==="funnel" && <div>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14}}>
          <span style={{color:S.mut,fontSize:12}}>Group by:</span>
          <Sel value={dim} onChange={setDim} options={allDims}/>
        </div>
        <div style={{background:S.surf,border:`1px solid ${S.bdr}`,borderRadius:8,overflowX:"auto"}}>
          <table style={{width:"100%",borderCollapse:"collapse"}}>
            <thead><tr>
              {[dim,"Touches","% Tot","Mtgs","Mtg%","Opps","M>O%","Pipeline","Pipe%","$/Touch","Won","Win%"].map((h,i)=>
                <th key={h} style={{...TH,textAlign:i===0?"left":"right"}}>{h}</th>)}
            </tr></thead>
            <tbody>{funnel.map(r=>{
              const hi=r.pipeShare>30, warn=r.touchShare>20&&r.pipeShare<10;
              return <tr key={r.name} style={{background:hi?"rgba(88,166,255,0.04)":warn?"rgba(248,81,73,0.03)":"transparent",borderBottom:`1px solid ${S.bdr}`}}>
                <td style={{padding:"9px 12px",fontWeight:500}}>{r.name}</td>
                <td style={TD}>{N(r.touches)}</td><td style={{...TD,color:S.mut}}>{P(r.touchShare)}</td>
                <td style={TD}>{N(r.meetings)}</td><td style={{...TD,color:r.mtgRate>15?S.green:r.mtgRate<5?S.red:S.txt}}>{P(r.mtgRate)}</td>
                <td style={TD}>{N(r.opps)}</td><td style={{...TD,color:r.mtgToOpp>70?S.green:r.mtgToOpp<50?S.red:S.txt}}>{P(r.mtgToOpp)}</td>
                <td style={{...TD,color:S.accent}}>{$(r.pipeline)}</td><td style={{...TD,color:r.pipeShare>40?S.accent:S.mut}}>{P(r.pipeShare)}</td>
                <td style={{...TD,color:r.ppt>10000?S.green:r.ppt<2000?S.red:S.txt}}>{$(r.ppt)}</td>
                <td style={{...TD,color:S.green}}>{$(r.closedWon)}</td><td style={TD}>{P(r.winRate)}</td>
              </tr>;})}
            </tbody>
          </table>
        </div>
        {funnel[0]?.pipeShare>50 && <Callout color={S.red}><strong style={{color:S.txt}}>⚠️ Concentration Risk:</strong> {funnel[0].name} = {P(funnel[0].pipeShare)} of pipeline.</Callout>}
      </div>}

      {/* ═══ CHARTS TAB ═══ */}
      {tab==="charts" && funnel.length>0 && <div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
          {[
            {title:"Pipeline by "+dim, key:"pipeline", fmt:v=>`$${(v/1e6).toFixed(1)}M`, color:(r)=>r.pipeShare>40?S.accent:"#1f6feb"},
            {title:"Touch% vs Pipeline%", dual:true},
            {title:"Meeting Rate", key:"mtgRate", fmt:v=>`${v}%`, color:(r)=>r.mtgRate>15?S.green:r.mtgRate<5?S.red:S.mut},
            {title:"Pipeline per Touch", key:"ppt", fmt:v=>`$${(v/1e3).toFixed(0)}K`, color:(r)=>r.ppt>10000?S.green:r.ppt<2000?S.red:"#1f6feb"},
          ].map((ch,ci)=>(
            <div key={ci} style={{background:S.surf,border:`1px solid ${S.bdr}`,borderRadius:8,padding:14}}>
              <div style={{fontSize:12,fontWeight:600,marginBottom:8}}>{ch.title}</div>
              <ResponsiveContainer width="100%" height={280}>
                {ch.dual ? (
                  <BarChart data={funnel.slice(0,10)} margin={{bottom:60}}>
                    <XAxis dataKey="name" tick={{fill:S.mut,fontSize:10}} angle={-35} textAnchor="end" interval={0}/>
                    <YAxis tick={{fill:S.mut,fontSize:10}} tickFormatter={v=>`${v.toFixed(0)}%`}/>
                    <Tooltip formatter={(v,n)=>[`${v.toFixed(1)}%`,n]} contentStyle={{background:S.surf,border:`1px solid ${S.bdr}`,borderRadius:6,fontSize:12}}/>
                    <Legend wrapperStyle={{fontSize:11}}/>
                    <Bar dataKey="touchShare" name="% Touches" fill={S.orange} radius={[4,4,0,0]}/>
                    <Bar dataKey="pipeShare" name="% Pipeline" fill={S.accent} radius={[4,4,0,0]}/>
                  </BarChart>
                ) : (
                  <BarChart data={funnel.slice(0,10)} margin={{bottom:60}}>
                    <XAxis dataKey="name" tick={{fill:S.mut,fontSize:10}} angle={-35} textAnchor="end" interval={0}/>
                    <YAxis tick={{fill:S.mut,fontSize:10}} tickFormatter={ch.fmt}/>
                    <Tooltip formatter={v=>[ch.key==="pipeline"?`$${Math.round(v).toLocaleString()}`:ch.key==="ppt"?`$${Math.round(v).toLocaleString()}`:`${v.toFixed(1)}%`,ch.title]} contentStyle={{background:S.surf,border:`1px solid ${S.bdr}`,borderRadius:6,fontSize:12}}/>
                    <Bar dataKey={ch.key} radius={[4,4,0,0]}>{funnel.slice(0,10).map((r,i)=><Cell key={i} fill={ch.color(r)}/>)}</Bar>
                  </BarChart>
                )}
              </ResponsiveContainer>
            </div>
          ))}
        </div>
      </div>}

      {/* ═══ CROSS-CUT TAB ═══ */}
      {tab==="crosscut" && <div>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14}}>
          <span style={{color:S.mut,fontSize:12}}>Dimension:</span>
          <Sel value={crossDim} onChange={setCrossDim} options={allDims}/>
          {variance && <span style={{fontSize:11,padding:"3px 10px",borderRadius:20,fontWeight:600,
            background:parseFloat(variance)>=3?"rgba(63,185,80,0.15)":parseFloat(variance)>=1.5?"rgba(210,153,34,0.15)":"rgba(139,148,158,0.15)",
            color:parseFloat(variance)>=3?S.green:parseFloat(variance)>=1.5?S.orange:S.mut}}>
            {parseFloat(variance)>=3?"🟢 STRONG":parseFloat(variance)>=1.5?"🟡 MODERATE":"🔇 LOW"} — {variance}x gap</span>}
        </div>
        <div style={{background:S.surf,border:`1px solid ${S.bdr}`,borderRadius:8,overflowX:"auto"}}>
          <table style={{width:"100%",borderCollapse:"collapse"}}>
            <thead><tr>{[crossDim,"Touches","% Tot","Mtgs","Mtg%","Pipeline","Pipe%","$/Touch","Won","Avg Deal"].map((h,i)=>
              <th key={h} style={{...TH,textAlign:i===0?"left":"right"}}>{h}</th>)}</tr></thead>
            <tbody>{cross.map(r=><tr key={r.name} style={{borderBottom:`1px solid ${S.bdr}`}}>
              <td style={{padding:"9px 12px",fontWeight:500}}>{r.name}</td>
              <td style={TD}>{N(r.touches)}</td><td style={{...TD,color:S.mut}}>{P(r.touchShare)}</td>
              <td style={TD}>{N(r.meetings)}</td><td style={{...TD,color:r.mtgRate>15?S.green:r.mtgRate<5?S.red:S.txt}}>{P(r.mtgRate)}</td>
              <td style={{...TD,color:S.accent}}>{$(r.pipeline)}</td><td style={{...TD,color:S.mut}}>{P(r.pipeShare)}</td>
              <td style={{...TD,color:r.ppt>10000?S.green:r.ppt<2000?S.red:S.txt}}>{$(r.ppt)}</td>
              <td style={{...TD,color:S.green}}>{$(r.closedWon)}</td><td style={TD}>{r.avgDeal>0?$(r.avgDeal):"—"}</td>
            </tr>)}</tbody>
          </table>
        </div>
        <Callout color={S.accent}><strong style={{color:S.txt}}>Variance test:</strong> Badge shows best/worst $/Touch ratio (20+ touch segments). 3x+ = strong signal. Below 1.5x = noise.</Callout>
      </div>}

      {/* ═══ DROP-OFF TAB ═══ */}
      {tab==="dropoff" && <div>
        {drop&&drop.attended>0 ? <>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:16}}>
            <Card label="Engaged Contacts" value={N(drop.attended)} sub="Attended / Visited / Badge Scan"/>
            <Card label="Dropped (No Meeting)" value={N(drop.noMeeting)} color={S.red} sub={`${P(pct(drop.noMeeting,drop.attended))} of engaged`}/>
            <Card label="Est. Pipeline if 10% Recovered" value={totals?.meetings>0?$(Math.round(drop.noMeeting*0.1)*(totals.pipeline/totals.meetings)):"—"} color={S.green} sub="Based on avg $/meeting"/>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:14}}>
            {drop.breakdowns.map(bd=><div key={bd.label} style={{background:S.surf,border:`1px solid ${S.bdr}`,borderRadius:8,overflow:"hidden"}}>
              <div style={{padding:"9px 12px",borderBottom:`1px solid ${S.bdr}`,fontSize:12,fontWeight:600,color:S.purple}}>{bd.label}</div>
              <table style={{width:"100%",borderCollapse:"collapse"}}>
                <thead><tr><th style={{...TH,textAlign:"left"}}>Segment</th><th style={TH}>Count</th><th style={TH}>%</th></tr></thead>
                <tbody>{Object.entries(bd.data).sort((a,b)=>b[1]-a[1]).map(([seg,ct])=>
                  <tr key={seg} style={{borderBottom:`1px solid ${S.bdr}`}}><td style={{padding:"7px 12px",fontWeight:500}}>{seg}</td><td style={{...TD,color:S.purple}}>{N(ct)}</td><td style={{...TD,color:S.mut}}>{P(pct(ct,bd.total))}</td></tr>
                )}</tbody>
              </table>
            </div>)}
          </div>
          <Callout color={S.purple}><strong style={{color:S.txt}}>🎯 Nurture Opportunity:</strong> These contacts engaged but never booked. A post-event follow-up SLA could recover 10-15% into active pipeline.</Callout>
        </> : <div style={{padding:40,textAlign:"center",color:S.mut}}><p>Requires Interaction Status + Meeting Booked fields. Check Fields tab.</p></div>}
      </div>}

      {/* ═══ CONFIG TAB ═══ */}
      {tab==="config" && cols && <div>
        <div style={{fontSize:14,fontWeight:600,marginBottom:14}}>Auto-Detected Field Mapping</div>
        <div style={{background:S.surf,border:`1px solid ${S.bdr}`,borderRadius:8,overflow:"hidden"}}>
          <table style={{width:"100%",borderCollapse:"collapse"}}>
            <thead><tr><th style={{...TH,textAlign:"left"}}>Role</th><th style={{...TH,textAlign:"left"}}>Column</th><th style={{...TH,textAlign:"left"}}>Status</th></tr></thead>
            <tbody>{[{r:"Channel",c:cols.channel},{r:"Campaign",c:cols.campaign},{r:"Interaction Status",c:cols.interactionStatus},{r:"Meeting Booked",c:cols.meetingBooked},{r:"Opportunity ID",c:cols.oppId},{r:"Pipeline Revenue",c:cols.pipeline},{r:"Closed Won",c:cols.closedWon},{r:"Opp Stage",c:cols.oppStage}].map(m=>
              <tr key={m.r} style={{borderBottom:`1px solid ${S.bdr}`}}><td style={{padding:"9px 12px",fontWeight:500}}>{m.r}</td><td style={{padding:"9px 12px",fontFamily:"monospace",fontSize:12,color:m.c?S.txt:S.mut}}>{m.c||"Not detected"}</td><td style={{padding:"9px 12px"}}><span style={{fontSize:11,padding:"2px 8px",borderRadius:12,background:m.c?"rgba(63,185,80,0.15)":"rgba(248,81,73,0.15)",color:m.c?S.green:S.red}}>{m.c?"✓ Mapped":"✕ Missing"}</span></td></tr>
            )}</tbody>
          </table>
        </div>
        <div style={{fontSize:13,fontWeight:600,marginTop:20,marginBottom:10}}>Dimensions ({cols.dimensions.length})</div>
        <div style={{display:"flex",flexWrap:"wrap",gap:6}}>{cols.dimensions.map(d=><span key={d} style={{padding:"3px 10px",background:S.surf,border:`1px solid ${S.bdr}`,borderRadius:20,fontSize:11}}>{d}</span>)}</div>
      </div>}

      </div>
    </div>
  );
}
