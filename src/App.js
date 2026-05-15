import { useState, useRef, useEffect, useCallback } from "react";

const P = {
  beige:"#F5F0E8",beigeDeep:"#EDE6D6",brown:"#7C5C3E",cream:"#F9F5EE",
  muted:"#9A8878",accent:"#C4855A",accentLight:"#E8C4A8",white:"#FAFAF7",
  success:"#5A8C6A",successLight:"#D4EBD9",danger:"#B85C4A",dangerLight:"#F2DDD9",
  warn:"#C4A240",warnLight:"#F5ECC8",purple:"#7B68C8",purpleLight:"#E8E4F8",
  brownDark:"#3E2C1A",
};

function useS(dark){
  return {
    bg:dark?"#241C14":P.cream, card:dark?"#2E2218":P.white,
    border:dark?"#3A2C1A":P.beigeDeep, text:dark?"#F0D9C0":P.brownDark, muted:dark?"#9A7A60":P.muted,
  };
}

const DAYS_SHORT=["Lun","Mar","Mié","Jue","Vie","Sáb","Dom"];
const MONTHS_ES=["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
const HOURS=Array.from({length:15},(_,i)=>`${(i+7).toString().padStart(2,"0")}:00`);
function daysInMonth(m){return[31,28,31,30,31,30,31,31,30,31,30,31][m];}
function firstDayOfMonth(m){return(new Date(2026,m,1).getDay()+6)%7;}

const INIT_EXAMS=[
  {id:"p1",name:"1er Parcial",status:"aprobado",topics:["Neuroanatomía","Locomotor","Bioética"],date:"Mayo 2026",score:78,notes:""},
  {id:"p2",name:"2do Parcial",status:"proximo",topics:["Sistema cardiovascular","Sistema respiratorio","Sistema digestivo","Sistema endócrino"],date:"",score:null,notes:""},
  {id:"final",name:"Examen Final",status:"futuro",topics:["Todos los sistemas"],date:"",score:null,notes:""},
];

const ANATOMY_INFO=`INFORMACIÓN GENERAL DE ANATOMÍA HUMANA:
Sistema óseo: 206 huesos en adultos. Funciones: soporte, protección, movimiento, hematopoyesis, reserva mineral. Huesos largos (fémur, húmero), cortos (carpo, tarso), planos (cráneo, esternón), irregulares (vértebras).
Sistema muscular: ~640 músculos. Tipos: esquelético (voluntario), liso (involuntario), cardíaco. Función: movimiento, postura, termogénesis.
Sistema nervioso: SNC (encéfalo + médula) y SNP (12 pares craneales, 31 pares espinales). Neurona: soma, axón, dendritas. Sinapsis química y eléctrica.
Sistema cardiovascular: Corazón 4 cámaras. Circulación mayor (sistémica) y menor (pulmonar). Válvulas: tricúspide, pulmonar, mitral, aórtica.
Sistema respiratorio: Vías aéreas superiores e inferiores. Pulmones: lóbulos (der:3, izq:2). Intercambio gaseoso en alvéolos.
Sistema digestivo: Boca→faringe→esófago→estómago→intestino delgado (duodeno, yeyuno, íleon)→intestino grueso→recto→ano. Glándulas: hígado, páncreas, vesícula.
Sistema endócrino: Hipotálamo, hipófisis, tiroides, paratiroides, suprarrenales, páncreas endócrino, gónadas.
Terminología: planos (sagital, coronal, transversal), posición anatómica, términos de dirección (superior/inferior, anterior/posterior, medial/lateral, proximal/distal).`;

const FLASHCARDS_DB=[
  {id:1,q:"¿Cuántos huesos tiene el adulto?",a:"206 huesos.",topic:"Sistema óseo",exam:"p2"},
  {id:2,q:"¿Cuál es el músculo más largo?",a:"El sartorio.",topic:"Sistema muscular",exam:"p2"},
  {id:3,q:"¿Cuántos pares de nervios craneales?",a:"12 pares (I al XII).",topic:"Sistema nervioso",exam:"p2"},
  {id:4,q:"¿Qué válvula separa aurícula y ventrículo derecho?",a:"La válvula tricúspide.",topic:"Sistema cardiovascular",exam:"p2"},
  {id:5,q:"¿Cuántos lóbulos tiene el pulmón derecho?",a:"3 lóbulos: superior, medio e inferior.",topic:"Sistema respiratorio",exam:"p2"},
  {id:6,q:"¿Qué estructura conecta músculo con hueso?",a:"El tendón.",topic:"Sistema muscular",exam:"p2"},
  {id:7,q:"¿Cuántas vértebras cervicales hay?",a:"7 vértebras cervicales (C1-C7).",topic:"Sistema óseo",exam:"p2"},
  {id:8,q:"¿Qué lóbulo cerebral procesa la visión?",a:"El lóbulo occipital.",topic:"Sistema nervioso",exam:"p2"},
];

const TEORICAS_DB=[
  {id:1,q:"¿Cuál es la función principal del corazón?",opts:["Filtrar la sangre","Bombear sangre","Producir glóbulos rojos","Regular temperatura"],correct:1,exam:"p2"},
  {id:2,q:"¿Cuántos lóbulos tiene el pulmón izquierdo?",opts:["1","2","3","4"],correct:1,exam:"p2"},
  {id:3,q:"¿Dónde ocurre el intercambio gaseoso?",opts:["Bronquios","Tráquea","Alvéolos","Pleura"],correct:2,exam:"p2"},
  {id:4,q:"¿Cuál es la válvula entre aurícula y ventrículo izquierdo?",opts:["Tricúspide","Aórtica","Pulmonar","Mitral"],correct:3,exam:"p2"},
];

const navItems=[
  {id:"dashboard",label:"Inicio",icon:"🏠"},
  {id:"chat",label:"Chat IA",icon:"💬"},
  {id:"estudio",label:"Estudiar",icon:"📚"},
  {id:"progreso",label:"Progreso",icon:"📊"},
  {id:"historial",label:"Historial",icon:"🏆"},
  {id:"planificador",label:"Agenda",icon:"📅"},
  {id:"roadmap",label:"Plan",icon:"🗺️"},
  {id:"fuentes",label:"Fuentes",icon:"📎"},
  {id:"anatomia",label:"Anatomía",icon:"🧬"},
];

// ── TOP BAR ───────────────────────────────────────────────
function TopBar({tab,setTab,dark,setDark}){
  const s=useS(dark);
  const [open,setOpen]=useState(false);
  return(
    <div style={{background:dark?"#1A1510":P.white,borderBottom:`1px solid ${s.border}`,padding:"0 10px",display:"flex",alignItems:"center",gap:8,height:50,position:"sticky",top:0,zIndex:20}}>
      <span style={{fontWeight:500,fontSize:15,color:s.text,flexShrink:0}}>Anatom<span style={{color:P.accent}}>IA</span></span>
      <div style={{flex:1,overflowX:"auto",display:"flex",gap:1}}>
        {navItems.map(n=>(
          <button key={n.id} onClick={()=>setTab(n.id)} style={{background:tab===n.id?(dark?"#3E2C1A":P.beigeDeep):"transparent",border:"none",borderRadius:7,padding:"4px 7px",cursor:"pointer",fontSize:10.5,fontWeight:tab===n.id?500:400,color:tab===n.id?(dark?"#F0D9C0":P.brown):s.muted,flexShrink:0,display:"flex",alignItems:"center",gap:3}}>
            <span style={{fontSize:11}}>{n.icon}</span><span>{n.label}</span>
          </button>
        ))}
      </div>
      <button onClick={()=>setDark(d=>!d)} style={{background:dark?"#3E2C1A":P.beigeDeep,border:"none",borderRadius:7,padding:"5px 8px",cursor:"pointer",fontSize:12,flexShrink:0}}>{dark?"☀️":"🌙"}</button>
    </div>
  );
}

// ── POMODORO + CRONÓMETRO ────────────────────────────────
function TimerWidgets({dark}){
  const s=useS(dark);
  // Pomodoro
  const [focusMins,setFocusMins]=useState(20);
  const [breakMins,setBreakMins]=useState(5);
  const [editing,setEditing]=useState(false);
  const [mins,setMins]=useState(20);
  const [secs,setSecs]=useState(0);
  const [running,setRunning]=useState(false);
  const [phase,setPhase]=useState("foco");
  const [cycles,setCycles]=useState(0);
  const pomRef=useRef(null);
  // Cronómetro
  const [studySecs,setStudySecs]=useState(0);
  const [studyRunning,setStudyRunning]=useState(false);
  const cronRef=useRef(null);

  useEffect(()=>{
    if(!running) return;
    pomRef.current=setInterval(()=>{
      setSecs(s=>{
        if(s>0) return s-1;
        setMins(m=>{
          if(m>0) return m-1;
          setRunning(false);
          if(phase==="foco"){setCycles(c=>c+1);setPhase("descanso");setMins(breakMins);}
          else{setPhase("foco");setMins(focusMins);}
          return 0;
        });
        return 59;
      });
    },1000);
    return()=>clearInterval(pomRef.current);
  },[running,phase,focusMins,breakMins]);

  useEffect(()=>{
    if(!studyRunning){clearInterval(cronRef.current);return;}
    cronRef.current=setInterval(()=>setStudySecs(s=>s+1),1000);
    return()=>clearInterval(cronRef.current);
  },[studyRunning]);

  const total=(phase==="foco"?focusMins:breakMins)*60;
  const elapsed=total-(mins*60+secs);
  const pct=total>0?elapsed/total:0;
  const sh=Math.floor(studySecs/3600);
  const sm=Math.floor((studySecs%3600)/60);
  const ss=studySecs%60;

  return(
    <div style={{display:"flex",flexDirection:"column",gap:10}}>
      {/* Pomodoro */}
      <div style={{background:s.card,border:`0.5px solid ${s.border}`,borderRadius:12,padding:"13px 15px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
          <p style={{fontWeight:500,color:s.text,margin:0,fontSize:14}}>⏱ Pomodoro TDAH</p>
          <div style={{display:"flex",alignItems:"center",gap:6}}>
            <span style={{fontSize:10,background:phase==="foco"?(dark?"#3E2218":P.accentLight):(dark?"#1A3A2A":P.successLight),color:phase==="foco"?P.accent:P.success,borderRadius:5,padding:"2px 7px"}}>{phase==="foco"?`Foco ${focusMins}m`:`Descanso ${breakMins}m`}</span>
            <button onClick={()=>setEditing(e=>!e)} style={{background:"transparent",border:"none",color:s.muted,cursor:"pointer",fontSize:13}}>⚙️</button>
          </div>
        </div>
        {editing&&(
          <div style={{display:"flex",gap:12,marginBottom:10,padding:"8px 10px",background:dark?"#3A2C1A":P.beigeDeep,borderRadius:8,alignItems:"center"}}>
            <label style={{fontSize:12,color:s.muted}}>Foco:</label>
            <input type="number" min="5" max="60" value={focusMins} onChange={e=>{const v=Number(e.target.value);setFocusMins(v);if(phase==="foco"&&!running){setMins(v);setSecs(0);}}} style={{width:48,border:`0.5px solid ${s.border}`,borderRadius:6,padding:"3px 6px",background:dark?"#241C14":P.cream,color:s.text,fontSize:12}}/>
            <label style={{fontSize:12,color:s.muted}}>Descanso:</label>
            <input type="number" min="1" max="30" value={breakMins} onChange={e=>{const v=Number(e.target.value);setBreakMins(v);if(phase==="descanso"&&!running){setMins(v);setSecs(0);}}} style={{width:48,border:`0.5px solid ${s.border}`,borderRadius:6,padding:"3px 6px",background:dark?"#241C14":P.cream,color:s.text,fontSize:12}}/>
          </div>
        )}
        <div style={{display:"flex",alignItems:"center",gap:13}}>
          <div style={{position:"relative",width:60,height:60,flexShrink:0}}>
            <svg width="60" height="60" style={{transform:"rotate(-90deg)"}}>
              <circle cx="30" cy="30" r="26" fill="none" stroke={dark?"#3A2C1A":P.beigeDeep} strokeWidth="5"/>
              <circle cx="30" cy="30" r="26" fill="none" stroke={phase==="foco"?P.accent:P.success} strokeWidth="5" strokeDasharray={`${2*Math.PI*26}`} strokeDashoffset={`${2*Math.PI*26*(1-pct)}`} strokeLinecap="round"/>
            </svg>
            <span style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:500,color:s.text}}>{mins.toString().padStart(2,"0")}:{secs.toString().padStart(2,"0")}</span>
          </div>
          <div style={{flex:1}}>
            <p style={{fontSize:12,color:s.muted,margin:"0 0 7px"}}>Ciclos hoy: <strong style={{color:s.text}}>{cycles}</strong></p>
            <div style={{display:"flex",gap:6}}>
              <button onClick={()=>setRunning(r=>!r)} style={{background:running?P.danger:P.accent,color:"#fff",border:"none",borderRadius:8,padding:"6px 14px",cursor:"pointer",fontSize:12,fontWeight:500}}>{running?"Pausar":"Iniciar"}</button>
              <button onClick={()=>{setRunning(false);setPhase("foco");setMins(focusMins);setSecs(0);}} style={{background:"transparent",border:`0.5px solid ${s.border}`,borderRadius:8,padding:"6px 10px",cursor:"pointer",color:s.muted,fontSize:12}}>↺</button>
            </div>
          </div>
        </div>
      </div>

      {/* Cronómetro */}
      <div style={{background:s.card,border:`0.5px solid ${s.border}`,borderRadius:12,padding:"13px 15px"}}>
        <p style={{fontWeight:500,color:s.text,margin:"0 0 10px",fontSize:14}}>⏲ Tiempo de estudio</p>
        <div style={{display:"flex",alignItems:"center",gap:13}}>
          <span style={{fontSize:28,fontWeight:500,color:studyRunning?P.accent:s.text,fontVariantNumeric:"tabular-nums",letterSpacing:1}}>
            {sh>0?`${sh.toString().padStart(2,"0")}:`:""}
            {sm.toString().padStart(2,"0")}:{ss.toString().padStart(2,"0")}
          </span>
          <div style={{display:"flex",gap:6}}>
            <button onClick={()=>setStudyRunning(r=>!r)} style={{background:studyRunning?P.danger:P.success,color:"#fff",border:"none",borderRadius:8,padding:"6px 14px",cursor:"pointer",fontSize:12,fontWeight:500}}>{studyRunning?"Pausar":"Iniciar"}</button>
            <button onClick={()=>{setStudyRunning(false);setStudySecs(0);}} style={{background:"transparent",border:`0.5px solid ${s.border}`,borderRadius:8,padding:"6px 10px",cursor:"pointer",color:s.muted,fontSize:12}}>↺</button>
          </div>
        </div>
        {studySecs>0&&<p style={{fontSize:11,color:s.muted,margin:"6px 0 0"}}>+{Math.floor(studySecs/600)} pts de estudio ganados</p>}
      </div>
    </div>
  );
}

// ── PUNTOS / GAMIFICACIÓN ────────────────────────────────
function PuntosWidget({dark,pts,setPts}){
  const s=useS(dark);
  const target=300;
  const pct=Math.min(pts/target*100,100);
  return(
    <div style={{background:s.card,border:`0.5px solid ${s.border}`,borderRadius:12,padding:"12px 15px"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
        <p style={{fontWeight:500,color:s.text,margin:0,fontSize:14}}>⭐ Mis puntos</p>
        <span style={{fontSize:16,fontWeight:500,color:P.warn}}>{pts}</span>
      </div>
      <div style={{background:dark?"#3A2C1A":P.beigeDeep,borderRadius:4,height:6,marginBottom:5}}>
        <div style={{width:`${pct}%`,height:6,borderRadius:4,background:P.warn,transition:"width 0.5s"}}/>
      </div>
      <p style={{fontSize:11,color:s.muted,margin:0}}>{pts>=target?"🎉 ¡Podés tomarte un día libre!":target-pts>0?`${target-pts} pts para el día libre`:"Meta alcanzada"}</p>
    </div>
  );
}

// ── PLAN IA MODAL ────────────────────────────────────────
function PlanIAModal({dark,onClose,exams,setExams,setAgendaItems}){
  const s=useS(dark);
  const [msgs,setMsgs]=useState([{role:"ai",text:"¡Vamos a armar tu plan! 📚\n\n¿Cuándo es tu próximo parcial/examen? (ej: '15 de julio')"}]);
  const [input,setInput]=useState("");
  const [loading,setLoading]=useState(false);
  const [step,setStep]=useState(1);
  const bottomRef=useRef(null);
  useEffect(()=>{bottomRef.current?.scrollIntoView({behavior:"smooth"});},[msgs]);

  async function send(){
    if(!input.trim()||loading) return;
    const userMsg=input.trim(); setInput("");
    const newMsgs=[...msgs,{role:"user",text:userMsg}];
    setMsgs(newMsgs); setLoading(true);
    try{
      const res=await fetch("/api/claude",{
        method:"POST",headers:{"Content-Type": "application/json"},
        body:JSON.stringify({
          model:"claude-sonnet-4-5",max_tokens:1000,
          system:`Sos AnatomIA, ayudando a crear un plan de estudio para anatomía. Hablás en español, de forma empática y clara para alguien con TDAH. Paso actual: ${step}. Flujo: 1=fecha parcial, 2=materias/recursos disponibles, 3=días disponibles y horas por día, 4=generá plan concreto semana a semana (máx 3h/día, descansos), preguntá si está de acuerdo. 5=cuando diga que sí, terminá con JSON <<<PLAN:{"parcial":"nombre","fecha":"fecha","bloques":[{"dia":"Lun","hora":"09:00","actividad":"texto"}]}>>> con 10-15 bloques. El plan debe ser realista, anti-burnout, con variedad de actividades.`,
          messages:newMsgs.map(m=>({role:m.role==="ai"?"assistant":"user",content:m.text}))
        })
      });
      const data=await res.json();
      let reply=data.content?.[0]?.text||"Sin respuesta.";
      const planMatch=reply.match(/<<<PLAN:([\s\S]+?)>>>/);
      if(planMatch){
        try{
          const plan=JSON.parse(planMatch[1]);
          setExams(prev=>prev.map(e=>e.id==="p2"?{...e,date:plan.fecha}:e));
          const newItems=plan.bloques.map((b,i)=>({
            id:`plan_${Date.now()}_${i}`,text:b.actividad,
            day:b.dia,dayIdx:DAYS_SHORT.indexOf(b.dia)+1,
            hora:b.hora,color:P.accent,fromPlan:true
          }));
          setAgendaItems(prev=>[...prev,...newItems]);
          reply=reply.replace(/<<<PLAN:[\s\S]+?>>>/,"")+"✅ ¡Listo! Plan guardado en tu Agenda y en Plan de estudio.";
          setTimeout(onClose,2500);
        }catch(e){}
      } else {
        if(step<5) setStep(s=>s+1);
      }
      setMsgs(prev=>[...prev,{role:"ai",text:reply}]);
    }catch{
      setMsgs(prev=>[...prev,{role:"ai",text:"Sin conexión en este momento."}]);
    }
    setLoading(false);
  }

  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
      <div style={{background:useS(dark).card,borderRadius:16,width:"100%",maxWidth:500,maxHeight:"80vh",display:"flex",flexDirection:"column",overflow:"hidden"}}>
        <div style={{padding:"14px 16px",borderBottom:`0.5px solid ${useS(dark).border}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <p style={{margin:0,fontWeight:500,color:useS(dark).text,fontSize:15}}>🗺️ Armar plan de estudio</p>
          <button onClick={onClose} style={{background:"transparent",border:"none",color:useS(dark).muted,cursor:"pointer",fontSize:18}}>×</button>
        </div>
        <div style={{flex:1,overflowY:"auto",padding:"12px 14px"}}>
          {msgs.map((m,i)=>(
            <div key={i} style={{display:"flex",justifyContent:m.role==="user"?"flex-end":"flex-start",marginBottom:9}}>
              {m.role==="ai"&&<div style={{width:22,height:22,borderRadius:"50%",background:P.accent,color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,marginRight:7,flexShrink:0,marginTop:2}}>A</div>}
              <div style={{maxWidth:"80%",background:m.role==="user"?P.accent:s.bg,color:m.role==="user"?"#fff":useS(dark).text,borderRadius:m.role==="user"?"12px 12px 4px 12px":"12px 12px 12px 4px",padding:"8px 12px",fontSize:13,lineHeight:1.6,whiteSpace:"pre-wrap"}}>{m.text}</div>
            </div>
          ))}
          {loading&&<div style={{fontSize:12,color:useS(dark).muted,marginLeft:30}}>escribiendo...</div>}
          <div ref={bottomRef}/>
        </div>
        <div style={{padding:10,borderTop:`0.5px solid ${useS(dark).border}`,display:"flex",gap:7}}>
          <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>{if(e.key==="Enter")send();}} placeholder="Respondé..." style={{flex:1,borderRadius:9,border:`0.5px solid ${useS(dark).border}`,padding:"9px 11px",fontSize:13,background:dark?"#241C14":P.cream,color:useS(dark).text,outline:"none"}}/>
          <button onClick={send} disabled={loading||!input.trim()} style={{background:P.accent,color:"#fff",border:"none",borderRadius:9,padding:"9px 14px",cursor:"pointer",fontSize:13,opacity:loading||!input.trim()?0.5:1}}>Enviar</button>
        </div>
      </div>
    </div>
  );
}

// ── DASHBOARD ─────────────────────────────────────────────
function Dashboard({dark,setTab,sources,exams,setExams,pts,setPts,agendaItems,setAgendaItems}){
  const s=useS(dark);
  const [showPlan,setShowPlan]=useState(false);
  const proximos=exams.filter(e=>e.status==="proximo"||e.status==="activo");
  return(
    <div style={{padding:"16px 16px 32px",background:s.bg,minHeight:"100%"}}>
      <p style={{color:s.muted,fontSize:13,margin:"0 0 3px"}}>Bienvenida de vuelta 👋</p>
      <h2 style={{color:s.text,fontSize:20,fontWeight:500,margin:"0 0 14px"}}>¿Qué estudiamos hoy?</h2>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:8,marginBottom:12}}>
        {[{label:"Sesiones",value:24},{label:"Racha",value:"7d 🔥"},{label:"Precisión",value:"74%"},{label:"Horas",value:"18h"}].map(st=>(
          <div key={st.label} style={{background:s.card,border:`0.5px solid ${s.border}`,borderRadius:10,padding:"9px 11px"}}>
            <p style={{fontSize:10,color:s.muted,margin:"0 0 2px"}}>{st.label}</p>
            <p style={{fontSize:17,fontWeight:500,color:s.text,margin:0}}>{st.value}</p>
          </div>
        ))}
      </div>

      <PuntosWidget dark={dark} pts={pts} setPts={setPts}/>

      <div style={{marginTop:10}}>
        <TimerWidgets dark={dark}/>
      </div>

      {/* Botón Plan IA */}
      <button onClick={()=>setShowPlan(true)} style={{width:"100%",marginTop:12,background:dark?"#3E2218":P.accentLight,border:`1px solid ${P.accent}`,borderRadius:12,padding:"13px 16px",cursor:"pointer",textAlign:"left",display:"flex",alignItems:"center",gap:12}}>
        <span style={{fontSize:22}}>🗺️</span>
        <div>
          <p style={{fontWeight:500,color:P.accent,margin:"0 0 2px",fontSize:14}}>Armar plan de estudio con IA</p>
          <p style={{fontSize:12,color:dark?"#C4855A99":P.brown,margin:0}}>La IA te hace preguntas y crea tu plan personalizado</p>
        </div>
        <span style={{marginLeft:"auto",color:P.accent,fontSize:18}}>→</span>
      </button>

      {proximos.length>0&&proximos.map(ex=>ex.date?(
        <div key={ex.id} style={{background:dark?"#3E2218":P.accentLight,border:`0.5px solid ${P.accent}55`,borderRadius:12,padding:"11px 14px",marginTop:10}}>
          <p style={{fontSize:11,color:P.accent,margin:"0 0 2px",fontWeight:500}}>Próximo</p>
          <p style={{fontWeight:500,color:s.text,margin:"0 0 2px",fontSize:14}}>{ex.name} — {ex.date}</p>
          <p style={{fontSize:12,color:s.muted,margin:0}}>{ex.topics.slice(0,3).join(" · ")}</p>
        </div>
      ):null)}

      <div style={{marginTop:12,display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
        {[{label:"Estudiar",sub:"Iniciar sesión",icon:"▶️",tab:"estudio"},{label:"Chat IA",sub:"Hablar o escribir",icon:"💬",tab:"chat"},{label:"Fuentes",sub:"Mis materiales",icon:"📎",tab:"fuentes"}].map(a=>(
          <button key={a.tab} onClick={()=>setTab(a.tab)} style={{background:s.card,border:`0.5px solid ${s.border}`,borderRadius:12,padding:"12px 8px",cursor:"pointer",textAlign:"left"}}>
            <span style={{fontSize:18}}>{a.icon}</span>
            <p style={{fontWeight:500,color:s.text,margin:"7px 0 2px",fontSize:12}}>{a.label}</p>
            <p style={{color:s.muted,fontSize:10,margin:0}}>{a.sub}</p>
          </button>
        ))}
      </div>

      {showPlan&&<PlanIAModal dark={dark} onClose={()=>setShowPlan(false)} exams={exams} setExams={setExams} setAgendaItems={setAgendaItems}/>}
    </div>
  );
}

// ── CHAT IA ───────────────────────────────────────────────
function ChatIA({dark,sources,exams}){
  const s=useS(dark);
  const [msgs,setMsgs]=useState([{role:"ai",text:"Hola 👋 Soy tu tutora de anatomía. Podés preguntarme cualquier cosa, pedirme explicaciones, mnemotecnias, resúmenes o que te haga preguntas. También podés hablarme con el micrófono."}]);
  const [input,setInput]=useState("");
  const [loading,setLoading]=useState(false);
  const [listening,setListening]=useState(false);
  const [tts,setTts]=useState(false);
  const bottomRef=useRef(null);
  const recRef=useRef(null);
  useEffect(()=>{bottomRef.current?.scrollIntoView({behavior:"smooth"});},[msgs]);

  function speak(t){
    if(!tts) return;
    window.speechSynthesis.cancel();
    const u=new SpeechSynthesisUtterance(t.replace(/\*\*/g,""));
    u.lang="es-ES"; window.speechSynthesis.speak(u);
  }
  function toggleListen(){
    if(listening){recRef.current?.stop();setListening(false);return;}
    const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
    if(!SR) return;
    const rec=new SR();
    rec.lang="es-ES"; rec.continuous=false; rec.interimResults=false;
    rec.onresult=e=>{setInput(e.results[0][0].transcript);setListening(false);};
    rec.onerror=()=>setListening(false); rec.onend=()=>setListening(false);
    recRef.current=rec; rec.start(); setListening(true);
  }
  async function sendMsg(){
    if(!input.trim()||loading) return;
    const userMsg=input.trim(); setInput("");
    const newMsgs=[...msgs,{role:"user",text:userMsg}];
    setMsgs(newMsgs); setLoading(true);
    try{
      const srcCtx=sources.length>0?`Material del estudiante: ${sources.map(s=>s.name||s.title).join(", ")}.`:"";
      const examCtx=exams.map(e=>`${e.name} (${e.status}): ${e.topics.join(", ")}`).join(" | ");
      const res=await fetch("/api/claude",{
        method:"POST",headers:{"Content-Type": "application/json"},
        body:JSON.stringify({
          model:"claude-sonnet-4-5",max_tokens:1000,
          system:`Sos AnatomIA, tutora experta en anatomía humana. ${ANATOMY_INFO} Contexto del estudiante: ${examCtx}. ${srcCtx} Respondés en español, de forma didáctica, empática y concisa. Usás analogías y mnemotecnias. Adaptás al TDAH: respuestas claras, estructuradas, con energía positiva.`,
          messages:newMsgs.map(m=>({role:m.role==="ai"?"assistant":"user",content:m.text}))
        })
      });
      const data=await res.json();
      const reply=data.content?.[0]?.text||"Sin respuesta.";
      setMsgs(prev=>[...prev,{role:"ai",text:reply}]);
      speak(reply);
    }catch{
      setMsgs(prev=>[...prev,{role:"ai",text:"Sin conexión. Modo offline 📴"}]);
    }
    setLoading(false);
  }

  return(
    <div style={{display:"flex",flexDirection:"column",height:"calc(100vh - 50px)",background:s.bg}}>
      <div style={{padding:"7px 12px",background:s.card,borderBottom:`0.5px solid ${s.border}`,display:"flex",gap:8,alignItems:"center"}}>
        <span style={{fontSize:11,color:s.muted}}>Respuesta en voz:</span>
        <button onClick={()=>setTts(t=>!t)} style={{background:tts?P.accent:(dark?"#3E2C1A":P.beigeDeep),color:tts?"#fff":s.muted,border:"none",borderRadius:6,padding:"3px 9px",fontSize:11,cursor:"pointer"}}>{tts?"🔊 On":"🔇 Off"}</button>
        {sources.length>0&&<span style={{fontSize:11,color:P.accent,marginLeft:"auto"}}>📎 {sources.length} fuente{sources.length>1?"s":""}</span>}
      </div>
      <div style={{flex:1,overflowY:"auto",padding:"12px 12px 0"}}>
        {msgs.map((m,i)=>(
          <div key={i} style={{display:"flex",justifyContent:m.role==="user"?"flex-end":"flex-start",marginBottom:9}}>
            {m.role==="ai"&&<div style={{width:23,height:23,borderRadius:"50%",background:P.accent,color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:500,marginRight:7,flexShrink:0,marginTop:2}}>A</div>}
            <div style={{maxWidth:"78%",background:m.role==="user"?P.accent:s.card,color:m.role==="user"?"#fff":s.text,borderRadius:m.role==="user"?"13px 13px 4px 13px":"13px 13px 13px 4px",padding:"8px 12px",fontSize:13,lineHeight:1.6,border:m.role==="ai"?`0.5px solid ${s.border}`:"none",whiteSpace:"pre-wrap"}}>{m.text.replace(/\*\*/g,"")}</div>
          </div>
        ))}
        {loading&&<div style={{display:"flex",alignItems:"center",gap:7,marginBottom:9}}><div style={{width:23,height:23,borderRadius:"50%",background:P.accent,color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",fontSize:9}}>A</div><div style={{background:s.card,border:`0.5px solid ${s.border}`,borderRadius:"13px 13px 13px 4px",padding:"8px 12px",fontSize:12,color:s.muted}}>escribiendo...</div></div>}
        <div ref={bottomRef}/>
      </div>
      <div style={{padding:9,background:dark?"#1A1510":P.white,borderTop:`1px solid ${s.border}`,display:"flex",gap:7}}>
        <button onClick={toggleListen} style={{width:36,height:36,borderRadius:"50%",border:`0.5px solid ${listening?P.danger:s.border}`,background:listening?P.dangerLight:(dark?"#3E2C1A":P.beigeDeep),cursor:"pointer",fontSize:14,flexShrink:0}}>{listening?"⏹":"🎤"}</button>
        <textarea value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();sendMsg();}}} placeholder={listening?"Escuchando...":"Escribí o hablá..."} rows={1} style={{flex:1,borderRadius:9,border:`0.5px solid ${s.border}`,padding:"8px 11px",fontSize:13,background:dark?"#2E2218":P.cream,color:s.text,outline:"none",resize:"none"}}/>
        <button onClick={sendMsg} disabled={loading||!input.trim()} style={{background:P.accent,color:"#fff",border:"none",borderRadius:9,padding:"8px 12px",cursor:"pointer",fontSize:13,fontWeight:500,opacity:loading||!input.trim()?0.5:1}}>→</button>
      </div>
    </div>
  );
}

// ── ESTUDIO ───────────────────────────────────────────────
function Estudio({dark,exams,pts,setPts}){
  const s=useS(dark);
  const [mode,setMode]=useState("menu");
  const [selExam,setSelExam]=useState("p2");
  const [cardIdx,setCardIdx]=useState(0);
  const [flipped,setFlipped]=useState(false);
  const [score,setScore]=useState({correct:0,total:0});
  const [difficulty,setDifficulty]=useState("normal");
  // Práctica libre
  const [practiceMode,setPracticeMode]=useState("flash"); // flash | qa
  const [qaInput,setQaInput]=useState("");
  const [qaAnswer,setQaAnswer]=useState("");
  const [qaLoading,setQaLoading]=useState(false);
  // Parcial
  const [parcialQ,setParcialQ]=useState(0);
  const [parcialAnswers,setParcialAnswers]=useState([]);
  const [parcialPhase,setParcialPhase]=useState("imagenes");
  const [selOpt,setSelOpt]=useState(null);
  const [timeLeft,setTimeLeft]=useState(70*60);
  const [timerRunning,setTimerRunning]=useState(false);
  const timerRef=useRef(null);

  const activeExams=exams.filter(e=>e.status!=="aprobado");
  const cards=FLASHCARDS_DB.filter(f=>f.exam===selExam||selExam==="all");
  const teoricas=TEORICAS_DB.filter(t=>t.exam===selExam||selExam==="all");
  const fc=cards[cardIdx%Math.max(cards.length,1)];
  const teoQ=teoricas[parcialQ%Math.max(teoricas.length,1)];

  useEffect(()=>{
    if(!timerRunning){clearInterval(timerRef.current);return;}
    timerRef.current=setInterval(()=>{
      setTimeLeft(t=>{
        if(t<=1){clearInterval(timerRef.current);setTimerRunning(false);setParcialPhase("resultado");return 0;}
        return t-1;
      });
    },1000);
    return()=>clearInterval(timerRef.current);
  },[timerRunning]);

  function startParcial(){
    setParcialPhase("imagenes");setParcialQ(0);setParcialAnswers([]);setSelOpt(null);
    setTimeLeft(70*60);setTimerRunning(true);setMode("parcial");
  }

  function nextCard(correct){
    setPts(p=>p+(correct?3:-5));
    setScore(prev=>({correct:prev.correct+(correct?1:0),total:prev.total+1}));
    setFlipped(false);
    setTimeout(()=>setCardIdx(i=>i+1),150);
  }

  function nextParcialQ(){
    if(selOpt===null&&parcialPhase!=="imagenes") return;
    const correct=parcialPhase==="imagenes"?true:(selOpt===teoQ.correct);
    setPts(p=>p+(correct?3:-5));
    setParcialAnswers(p=>[...p,{correct,phase:parcialPhase}]);
    setSelOpt(null);
    if(parcialPhase==="imagenes"){
      if(parcialQ>=14){setParcialPhase("teoricas");setParcialQ(0);}
      else setParcialQ(q=>q+1);
    } else {
      if(parcialQ>=19||parcialQ>=teoricas.length-1){setTimerRunning(false);setParcialPhase("resultado");}
      else setParcialQ(q=>q+1);
    }
  }

  async function askQA(){
    if(!qaInput.trim()||qaLoading) return;
    setQaLoading(true); setQaAnswer("");
    try{
      const res=await fetch("/api/claude",{
        method:"POST",headers:{"Content-Type": "application/json"},
        body:JSON.stringify({
          model:"claude-sonnet-4-5",max_tokens:600,
          system:`Sos tutora de anatomía. ${ANATOMY_INFO} Respondé en español, de forma concisa y didáctica. Máximo 3 párrafos cortos.`,
          messages:[{role:"user",content:qaInput}]
        })
      });
      const data=await res.json();
      setQaAnswer(data.content?.[0]?.text||"Sin respuesta.");
    }catch{setQaAnswer("Sin conexión.");}
    setQaLoading(false);
  }

  const tmins=Math.floor(timeLeft/60);
  const tsecs=timeLeft%60;

  if(mode==="flashcard") return(
    <div style={{padding:16,background:s.bg,minHeight:"100%"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
        <button onClick={()=>{setMode("menu");setCardIdx(0);setFlipped(false);setScore({correct:0,total:0});}} style={{background:"transparent",border:"none",color:s.muted,cursor:"pointer",fontSize:13}}>← volver</button>
        <span style={{fontSize:12,color:s.muted}}>✓{score.correct} ✗{score.total-score.correct}</span>
      </div>
      {fc?(
        <>
          <div style={{background:s.card,border:`0.5px solid ${s.border}`,borderRadius:14,padding:"24px 18px",minHeight:170,marginBottom:12,cursor:"pointer"}} onClick={()=>setFlipped(f=>!f)}>
            <p style={{fontSize:10,color:P.accent,marginBottom:8,fontWeight:500}}>{fc.topic}</p>
            <p style={{fontSize:14,color:s.text,lineHeight:1.6,margin:0}}>{flipped?fc.a:fc.q}</p>
            {!flipped&&<p style={{color:s.muted,fontSize:11,marginTop:12,marginBottom:0}}>Tocá para ver respuesta</p>}
          </div>
          {flipped&&(
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:9}}>
              <button onClick={()=>nextCard(false)} style={{background:dark?"#3A1A1A":P.dangerLight,border:`0.5px solid ${P.danger}`,borderRadius:10,padding:11,cursor:"pointer",color:P.danger,fontWeight:500,fontSize:13}}>✗ No lo sabía (-5pts)</button>
              <button onClick={()=>nextCard(true)} style={{background:dark?"#1A3A2A":P.successLight,border:`0.5px solid ${P.success}`,borderRadius:10,padding:11,cursor:"pointer",color:P.success,fontWeight:500,fontSize:13}}>✓ Lo sabía (+3pts)</button>
            </div>
          )}
        </>
      ):<p style={{color:s.muted,fontSize:13}}>No hay flashcards para este parcial todavía.</p>}
    </div>
  );

  if(mode==="practica") return(
    <div style={{padding:16,background:s.bg,minHeight:"100%"}}>
      <div style={{display:"flex",justifyContent:"space-between",marginBottom:14}}>
        <button onClick={()=>setMode("menu")} style={{background:"transparent",border:"none",color:s.muted,cursor:"pointer",fontSize:13}}>← volver</button>
      </div>
      <p style={{fontWeight:500,color:s.text,fontSize:15,margin:"0 0 12px"}}>Preguntas libres</p>
      <textarea value={qaInput} onChange={e=>setQaInput(e.target.value)} placeholder="Preguntá algo de anatomía, pedí que te explique un tema, que te haga una pregunta de práctica..." rows={3} style={{width:"100%",border:`0.5px solid ${s.border}`,borderRadius:10,padding:"10px 12px",fontSize:13,background:dark?"#241C14":P.cream,color:s.text,outline:"none",resize:"vertical",boxSizing:"border-box",marginBottom:8}}/>
      <button onClick={askQA} disabled={qaLoading||!qaInput.trim()} style={{background:P.accent,color:"#fff",border:"none",borderRadius:9,padding:"9px 20px",cursor:"pointer",fontSize:13,fontWeight:500,opacity:qaLoading||!qaInput.trim()?0.5:1,marginBottom:14}}>
        {qaLoading?"Pensando...":"Preguntar →"}
      </button>
      {qaAnswer&&(
        <div style={{background:s.card,border:`0.5px solid ${s.border}`,borderRadius:12,padding:"14px 15px"}}>
          <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:8}}>
            <div style={{width:22,height:22,borderRadius:"50%",background:P.accent,color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",fontSize:9}}>A</div>
            <span style={{fontSize:12,color:s.muted}}>AnatomIA</span>
          </div>
          <p style={{fontSize:13,color:s.text,lineHeight:1.7,margin:0,whiteSpace:"pre-wrap"}}>{qaAnswer}</p>
          <button onClick={()=>{setQaInput("");setQaAnswer("");}} style={{marginTop:10,background:"transparent",border:`0.5px solid ${s.border}`,borderRadius:7,padding:"5px 12px",cursor:"pointer",color:s.muted,fontSize:12}}>Nueva pregunta</button>
        </div>
      )}
    </div>
  );

  if(mode==="parcial"){
    const totalAnswered=parcialAnswers.length;
    if(parcialPhase==="resultado"){
      const correct=parcialAnswers.filter(a=>a.correct).length;
      const pct=totalAnswered>0?Math.round((correct/totalAnswered)*100):0;
      return(
        <div style={{padding:16,background:s.bg,minHeight:"100%"}}>
          <h2 style={{color:s.text,fontWeight:500,fontSize:17,margin:"0 0 16px"}}>Resultado simulacro</h2>
          <div style={{background:s.card,border:`0.5px solid ${s.border}`,borderRadius:14,padding:"22px 18px",textAlign:"center",marginBottom:14}}>
            <p style={{fontSize:42,margin:"0 0 6px"}}>{pct>=60?"✅":"❌"}</p>
            <p style={{fontSize:34,fontWeight:500,color:pct>=60?P.success:P.danger,margin:"0 0 4px"}}>{pct}%</p>
            <p style={{fontSize:13,color:s.muted,margin:0}}>{correct} de {totalAnswered} respondidas {totalAnswered<35&&`(${35-totalAnswered} sin tiempo)`}</p>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:9,marginBottom:12}}>
            <div style={{background:dark?"#1A3A2A":P.successLight,border:`0.5px solid ${P.success}55`,borderRadius:12,padding:"11px 13px",textAlign:"center"}}>
              <p style={{fontSize:11,color:P.success,margin:"0 0 3px"}}>Imágenes</p>
              <p style={{fontSize:20,fontWeight:500,color:P.success,margin:0}}>{parcialAnswers.filter(a=>a.phase==="imagenes"&&a.correct).length}/{parcialAnswers.filter(a=>a.phase==="imagenes").length}</p>
            </div>
            <div style={{background:dark?"#1A3A2A":P.successLight,border:`0.5px solid ${P.success}55`,borderRadius:12,padding:"11px 13px",textAlign:"center"}}>
              <p style={{fontSize:11,color:P.success,margin:"0 0 3px"}}>Teóricas</p>
              <p style={{fontSize:20,fontWeight:500,color:P.success,margin:0}}>{parcialAnswers.filter(a=>a.phase==="teoricas"&&a.correct).length}/{parcialAnswers.filter(a=>a.phase==="teoricas").length}</p>
            </div>
          </div>
          <button onClick={()=>{setMode("menu");setParcialPhase("imagenes");setParcialQ(0);setParcialAnswers([]);setSelOpt(null);}} style={{width:"100%",background:P.accent,color:"#fff",border:"none",borderRadius:10,padding:11,cursor:"pointer",fontSize:14,fontWeight:500}}>Volver al menú</button>
        </div>
      );
    }
    return(
      <div style={{padding:16,background:s.bg,minHeight:"100%"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
          <div>
            <p style={{margin:0,fontWeight:500,color:s.text,fontSize:14}}>Simulacro de parcial</p>
            <p style={{margin:0,fontSize:11,color:s.muted}}>{parcialPhase==="imagenes"?"Imágenes":+"Teóricas"} — {parcialQ+1}/{parcialPhase==="imagenes"?15:20}</p>
          </div>
          <div style={{background:timeLeft<600?(dark?"#3A1A1A":P.dangerLight):(dark?"#3A2C1A":P.beigeDeep),borderRadius:8,padding:"5px 10px",textAlign:"center"}}>
            <p style={{fontSize:14,fontWeight:500,color:timeLeft<600?P.danger:s.text,margin:0}}>{tmins.toString().padStart(2,"0")}:{tsecs.toString().padStart(2,"0")}</p>
            <p style={{fontSize:10,color:s.muted,margin:0}}>restante</p>
          </div>
        </div>
        <div style={{background:dark?"#3A2C1A":P.beigeDeep,borderRadius:4,height:4,marginBottom:14}}>
          <div style={{width:`${(totalAnswered/35)*100}%`,height:4,borderRadius:4,background:P.accent}}/>
        </div>
        {parcialPhase==="imagenes"?(
          <div>
            <div style={{background:s.card,border:`0.5px solid ${s.border}`,borderRadius:13,padding:"18px 15px",marginBottom:12,textAlign:"center"}}>
              <div style={{fontSize:60,marginBottom:10}}>🧠</div>
              <p style={{fontSize:14,color:s.text,margin:"0 0 5px"}}>¿Qué estructura es la que se señala?</p>
              <p style={{fontSize:12,color:s.muted}}>Pista: estructura del sistema nervioso central</p>
            </div>
            <div style={{background:s.card,border:`0.5px solid ${s.border}`,borderRadius:11,padding:"12px 14px",marginBottom:12}}>
              <p style={{fontSize:12,color:s.muted,margin:"0 0 4px",fontWeight:500}}>Respuesta modelo:</p>
              <p style={{fontSize:13,color:s.text,margin:0}}>El cerebelo: coordina el movimiento y el equilibrio.</p>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:9}}>
              <button onClick={()=>{setSelOpt(0);nextParcialQ();}} style={{background:dark?"#3A1A1A":P.dangerLight,border:`0.5px solid ${P.danger}`,borderRadius:10,padding:11,cursor:"pointer",color:P.danger,fontWeight:500}}>✗ No la conocía</button>
              <button onClick={()=>{setSelOpt(1);nextParcialQ();}} style={{background:dark?"#1A3A2A":P.successLight,border:`0.5px solid ${P.success}`,borderRadius:10,padding:11,cursor:"pointer",color:P.success,fontWeight:500}}>✓ La reconocí</button>
            </div>
          </div>
        ):(
          teoQ?(
            <div>
              <div style={{background:s.card,border:`0.5px solid ${s.border}`,borderRadius:13,padding:"16px 14px",marginBottom:12}}>
                <p style={{fontSize:14,color:s.text,margin:0,lineHeight:1.5}}>{teoQ.q}</p>
              </div>
              {teoQ.opts.map((opt,i)=>(
                <button key={i} onClick={()=>setSelOpt(i)} style={{width:"100%",marginBottom:7,background:selOpt===i?(i===teoQ.correct?(dark?"#1A3A2A":P.successLight):(dark?"#3A1A1A":P.dangerLight)):s.card,border:`0.5px solid ${selOpt===i?(i===teoQ.correct?P.success:P.danger):s.border}`,borderRadius:10,padding:"11px 14px",cursor:"pointer",textAlign:"left",fontSize:13,color:s.text,fontWeight:selOpt===i?500:400}}>
                  {String.fromCharCode(65+i)}. {opt}
                </button>
              ))}
              {selOpt!==null&&<button onClick={nextParcialQ} style={{width:"100%",marginTop:4,background:P.accent,color:"#fff",border:"none",borderRadius:10,padding:11,cursor:"pointer",fontSize:14,fontWeight:500}}>Siguiente →</button>}
            </div>
          ):<p style={{color:s.muted}}>No hay preguntas teóricas.</p>
        )}
      </div>
    );
  }

  return(
    <div style={{padding:16,background:s.bg,minHeight:"100%"}}>
      <h2 style={{color:s.text,fontWeight:500,fontSize:18,margin:"0 0 6px"}}>Modo de estudio</h2>
      <div style={{background:s.card,border:`0.5px solid ${s.border}`,borderRadius:11,padding:"11px 13px",marginBottom:12}}>
        <p style={{fontSize:12,color:s.muted,margin:"0 0 6px"}}>Estudiar para:</p>
        <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
          {[{id:"all",name:"Todo"},...activeExams].map(e=>(
            <button key={e.id} onClick={()=>setSelExam(e.id)} style={{background:selExam===e.id?P.accent:"transparent",color:selExam===e.id?"#fff":s.muted,border:`0.5px solid ${selExam===e.id?P.accent:s.border}`,borderRadius:7,padding:"5px 11px",cursor:"pointer",fontSize:12,fontWeight:selExam===e.id?500:400}}>{e.name}</button>
          ))}
        </div>
      </div>
      <div style={{background:s.card,border:`0.5px solid ${s.border}`,borderRadius:11,padding:"11px 13px",marginBottom:12}}>
        <p style={{fontSize:12,color:s.text,margin:"0 0 7px",fontWeight:500}}>Dificultad</p>
        <div style={{display:"flex",gap:7}}>
          {["fácil","normal","difícil"].map(d=>(
            <button key={d} onClick={()=>setDifficulty(d)} style={{flex:1,border:`0.5px solid ${difficulty===d?P.accent:s.border}`,background:difficulty===d?(dark?"#3E2218":P.accentLight):"transparent",borderRadius:8,padding:"6px",cursor:"pointer",color:difficulty===d?P.accent:s.muted,fontSize:12}}>{d}</button>
          ))}
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:9}}>
        {[
          {label:"Flashcards",icon:"🃏",sub:"Repaso rápido",action:()=>setMode("flashcard")},
          {label:"Preguntas libres",icon:"💬",sub:"Sin formato de examen",action:()=>setMode("practica")},
          {label:"Simulacro de parcial",icon:"📝",sub:"35 preguntas · 1h10",action:startParcial},
          {label:"Juego de memoria",icon:"🎮",sub:"Pares de conceptos",action:()=>{}},
        ].map(m=>(
          <button key={m.label} onClick={m.action} style={{background:s.card,border:`0.5px solid ${s.border}`,borderRadius:12,padding:13,cursor:"pointer",textAlign:"left"}}>
            <span style={{fontSize:20}}>{m.icon}</span>
            <p style={{fontWeight:500,color:s.text,margin:"7px 0 2px",fontSize:13}}>{m.label}</p>
            <p style={{color:s.muted,fontSize:11,margin:0}}>{m.sub}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

// ── PROGRESO ──────────────────────────────────────────────
function Progreso({dark,exams}){
  const s=useS(dark);
  const [sel,setSel]=useState(exams[0]?.id||"p1");
  const exam=exams.find(e=>e.id===sel);
  const topicsMap={
    p1:[{name:"Neuroanatomía",p:82,strong:true,e:"🧠"},{name:"Locomotor",p:76,strong:true,e:"🦴"},{name:"Bioética",p:90,strong:true,e:"⚖️"}],
    p2:[{name:"Cardiovascular",p:72,strong:true,e:"❤️"},{name:"Respiratorio",p:45,strong:false,e:"🫁"},{name:"Digestivo",p:20,strong:false,e:"🫄"},{name:"Endócrino",p:10,strong:false,e:"🔬"}],
    final:[{name:"Todos los sistemas",p:5,strong:false,e:"📚"}],
  };
  const topics=topicsMap[sel]||[];
  return(
    <div style={{padding:16,background:s.bg,minHeight:"100%"}}>
      <h2 style={{color:s.text,fontWeight:500,fontSize:17,margin:"0 0 12px"}}>Mi progreso</h2>
      <div style={{display:"flex",gap:6,marginBottom:14,overflowX:"auto",paddingBottom:2}}>
        {exams.map(e=>(
          <button key={e.id} onClick={()=>setSel(e.id)} style={{flexShrink:0,background:sel===e.id?P.accent:"transparent",color:sel===e.id?"#fff":s.muted,border:`0.5px solid ${sel===e.id?P.accent:s.border}`,borderRadius:8,padding:"5px 12px",cursor:"pointer",fontSize:12,fontWeight:sel===e.id?500:400}}>{e.status==="aprobado"?"✅ ":""}{e.name}</button>
        ))}
      </div>
      {exam?.status==="aprobado"&&<div style={{background:dark?"#1A3A2A":P.successLight,border:`0.5px solid ${P.success}44`,borderRadius:11,padding:"11px 14px",marginBottom:12,display:"flex",alignItems:"center",gap:10}}><span style={{fontSize:20}}>🏆</span><div><p style={{fontWeight:500,color:P.success,margin:"0 0 1px",fontSize:13}}>Aprobado — {exam.score}%</p><p style={{fontSize:11,color:dark?"#70A870":P.success,margin:0}}>{exam.date} · Archivado</p></div></div>}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:9,marginBottom:12}}>
        <div style={{background:s.card,border:`0.5px solid ${s.border}`,borderRadius:11,padding:"11px 13px"}}><p style={{fontSize:11,color:s.muted,margin:"0 0 2px"}}>Precisión</p><p style={{fontSize:26,fontWeight:500,color:P.success,margin:0}}>{exam?.status==="aprobado"?"82%":"38%"}</p></div>
        <div style={{background:s.card,border:`0.5px solid ${s.border}`,borderRadius:11,padding:"11px 13px"}}><p style={{fontSize:11,color:s.muted,margin:"0 0 2px"}}>Temas</p><p style={{fontSize:26,fontWeight:500,color:s.text,margin:0}}>{topics.length}</p></div>
      </div>
      <div style={{background:s.card,border:`0.5px solid ${s.border}`,borderRadius:11,padding:"13px 14px"}}>
        {topics.map(t=>(
          <div key={t.name} style={{marginBottom:10}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
              <span style={{fontSize:12,color:s.text}}>{t.e} {t.name}</span>
              <span style={{fontSize:10,padding:"1px 7px",borderRadius:5,background:t.strong?(dark?"#1A3A2A":P.successLight):(dark?"#3A2218":P.accentLight),color:t.strong?P.success:P.accent}}>{t.strong?"fuerte":"reforzar"}</span>
            </div>
            <div style={{background:dark?"#3A2C1A":P.beigeDeep,borderRadius:4,height:5}}><div style={{width:`${t.p}%`,height:5,borderRadius:4,background:t.strong?P.success:P.accent}}/></div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── HISTORIAL ─────────────────────────────────────────────
function Historial({dark,exams,setExams}){
  const s=useS(dark);
  const [editing,setEditing]=useState(null);
  const [editData,setEditData]=useState({});
  const [adding,setAdding]=useState(false);
  const [newExam,setNewExam]=useState({name:"",date:"",score:"",topics:"",status:"aprobado",notes:""});

  const pasados=exams.filter(e=>e.status==="aprobado");

  function saveEdit(){
    setExams(prev=>prev.map(e=>e.id===editing?{...e,...editData,score:Number(editData.score)||e.score}:e));
    setEditing(null);
  }
  function addExam(){
    const topics=newExam.topics.split(",").map(t=>t.trim()).filter(Boolean);
    setExams(prev=>[...prev,{id:`exam_${Date.now()}`,name:newExam.name,date:newExam.date,score:Number(newExam.score)||null,topics,status:"aprobado",notes:newExam.notes}]);
    setNewExam({name:"",date:"",score:"",topics:"",status:"aprobado",notes:""});
    setAdding(false);
  }
  function removeExam(id){ setExams(prev=>prev.filter(e=>e.id!==id)); }

  return(
    <div style={{padding:16,background:s.bg,minHeight:"100%"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
        <h2 style={{color:s.text,fontWeight:500,fontSize:17,margin:0}}>🏆 Historial de parciales</h2>
        <button onClick={()=>setAdding(true)} style={{background:P.accent,color:"#fff",border:"none",borderRadius:8,padding:"6px 13px",cursor:"pointer",fontSize:12,fontWeight:500}}>+ Agregar</button>
      </div>
      {pasados.length===0&&<p style={{color:s.muted,fontSize:13}}>No hay parciales aprobados registrados todavía.</p>}
      {pasados.map(e=>(
        <div key={e.id} style={{background:s.card,border:`0.5px solid ${s.border}`,borderRadius:12,padding:"13px 15px",marginBottom:10}}>
          {editing===e.id?(
            <div>
              <input value={editData.name||""} onChange={ev=>setEditData(d=>({...d,name:ev.target.value}))} placeholder="Nombre" style={{width:"100%",border:`0.5px solid ${s.border}`,borderRadius:7,padding:"7px 10px",fontSize:13,background:dark?"#241C14":P.cream,color:s.text,outline:"none",marginBottom:7,boxSizing:"border-box"}}/>
              <div style={{display:"flex",gap:8,marginBottom:7}}>
                <input value={editData.date||""} onChange={ev=>setEditData(d=>({...d,date:ev.target.value}))} placeholder="Fecha" style={{flex:1,border:`0.5px solid ${s.border}`,borderRadius:7,padding:"7px 10px",fontSize:13,background:dark?"#241C14":P.cream,color:s.text,outline:"none"}}/>
                <input type="number" value={editData.score||""} onChange={ev=>setEditData(d=>({...d,score:ev.target.value}))} placeholder="Nota %" style={{width:80,border:`0.5px solid ${s.border}`,borderRadius:7,padding:"7px 10px",fontSize:13,background:dark?"#241C14":P.cream,color:s.text,outline:"none"}}/>
              </div>
              <textarea value={editData.notes||""} onChange={ev=>setEditData(d=>({...d,notes:ev.target.value}))} placeholder="Notas..." rows={2} style={{width:"100%",border:`0.5px solid ${s.border}`,borderRadius:7,padding:"7px 10px",fontSize:13,background:dark?"#241C14":P.cream,color:s.text,outline:"none",resize:"vertical",boxSizing:"border-box",marginBottom:8}}/>
              <div style={{display:"flex",gap:7}}>
                <button onClick={()=>setEditing(null)} style={{flex:1,background:"transparent",border:`0.5px solid ${s.border}`,borderRadius:8,padding:8,cursor:"pointer",color:s.muted,fontSize:13}}>Cancelar</button>
                <button onClick={saveEdit} style={{flex:2,background:P.accent,color:"#fff",border:"none",borderRadius:8,padding:8,cursor:"pointer",fontSize:13,fontWeight:500}}>Guardar</button>
              </div>
            </div>
          ):(
            <div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:6}}>
                <div>
                  <p style={{fontWeight:500,color:s.text,margin:"0 0 2px",fontSize:14}}>{e.name}</p>
                  <p style={{fontSize:12,color:s.muted,margin:0}}>{e.date}</p>
                </div>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  {e.score&&<span style={{fontSize:20,fontWeight:500,color:e.score>=60?P.success:P.danger}}>{e.score}%</span>}
                  <button onClick={()=>{setEditing(e.id);setEditData({name:e.name,date:e.date,score:e.score,notes:e.notes});}} style={{background:"transparent",border:"none",color:s.muted,cursor:"pointer",fontSize:14}}>✏️</button>
                  <button onClick={()=>removeExam(e.id)} style={{background:"transparent",border:"none",color:P.danger,cursor:"pointer",fontSize:14}}>🗑</button>
                </div>
              </div>
              <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
                {e.topics.map(t=><span key={t} style={{fontSize:10,background:dark?"#3A2C1A":P.beigeDeep,borderRadius:5,padding:"2px 8px",color:s.muted}}>{t}</span>)}
              </div>
              {e.notes&&<p style={{fontSize:12,color:s.muted,margin:"7px 0 0",fontStyle:"italic"}}>{e.notes}</p>}
            </div>
          )}
        </div>
      ))}

      {adding&&(
        <div style={{background:s.card,border:`0.5px solid ${P.accent}`,borderRadius:12,padding:"14px 15px",marginTop:10}}>
          <p style={{fontWeight:500,color:s.text,margin:"0 0 10px",fontSize:14}}>Nuevo parcial aprobado</p>
          <input value={newExam.name} onChange={e=>setNewExam(n=>({...n,name:e.target.value}))} placeholder="Nombre del parcial" style={{width:"100%",border:`0.5px solid ${s.border}`,borderRadius:7,padding:"8px 10px",fontSize:13,background:dark?"#241C14":P.cream,color:s.text,outline:"none",marginBottom:7,boxSizing:"border-box"}}/>
          <div style={{display:"flex",gap:7,marginBottom:7}}>
            <input value={newExam.date} onChange={e=>setNewExam(n=>({...n,date:e.target.value}))} placeholder="Fecha (ej: Junio 2026)" style={{flex:1,border:`0.5px solid ${s.border}`,borderRadius:7,padding:"8px 10px",fontSize:13,background:dark?"#241C14":P.cream,color:s.text,outline:"none"}}/>
            <input type="number" value={newExam.score} onChange={e=>setNewExam(n=>({...n,score:e.target.value}))} placeholder="Nota %" style={{width:80,border:`0.5px solid ${s.border}`,borderRadius:7,padding:"8px 10px",fontSize:13,background:dark?"#241C14":P.cream,color:s.text,outline:"none"}}/>
          </div>
          <input value={newExam.topics} onChange={e=>setNewExam(n=>({...n,topics:e.target.value}))} placeholder="Temas (separados por coma)" style={{width:"100%",border:`0.5px solid ${s.border}`,borderRadius:7,padding:"8px 10px",fontSize:13,background:dark?"#241C14":P.cream,color:s.text,outline:"none",marginBottom:7,boxSizing:"border-box"}}/>
          <textarea value={newExam.notes} onChange={e=>setNewExam(n=>({...n,notes:e.target.value}))} placeholder="Notas opcionales..." rows={2} style={{width:"100%",border:`0.5px solid ${s.border}`,borderRadius:7,padding:"8px 10px",fontSize:13,background:dark?"#241C14":P.cream,color:s.text,outline:"none",resize:"vertical",boxSizing:"border-box",marginBottom:9}}/>
          <div style={{display:"flex",gap:7}}>
            <button onClick={()=>setAdding(false)} style={{flex:1,background:"transparent",border:`0.5px solid ${s.border}`,borderRadius:8,padding:9,cursor:"pointer",color:s.muted,fontSize:13}}>Cancelar</button>
            <button onClick={addExam} disabled={!newExam.name} style={{flex:2,background:P.accent,color:"#fff",border:"none",borderRadius:8,padding:9,cursor:"pointer",fontSize:13,fontWeight:500,opacity:!newExam.name?0.5:1}}>Guardar</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── PLANIFICADOR ──────────────────────────────────────────
function Planificador({dark,agendaItems,setAgendaItems}){
  const s=useS(dark);
  const [view,setView]=useState("dia");
  const [selDay,setSelDay]=useState(1);
  const [selMonth,setSelMonth]=useState(4);
  const [editing,setEditing]=useState(null);
  const [editText,setEditText]=useState("");
  const [editColor,setEditColor]=useState(P.accent);
  const [editHour,setEditHour]=useState("08:00");
  const colorOpts=[P.accent,P.success,P.danger,P.warn,P.purple,"#5A7AB8"];

  function getItems(dayIdx,hour){ return agendaItems.filter(it=>(DAYS_SHORT.indexOf(it.day)===dayIdx-1||(it.dayIdx!==undefined&&it.dayIdx===dayIdx))&&it.hora===hour); }
  function openNew(dayIdx,hour){ setEditing({new:true,dayIdx,hour});setEditText("");setEditColor(P.accent);setEditHour(hour); }
  function openEdit(item){ setEditing({...item,existing:true});setEditText(item.text);setEditColor(item.color||P.accent);setEditHour(item.hora); }
  function saveEdit(){
    if(editing.existing){setAgendaItems(prev=>prev.map(it=>it.id===editing.id?{...it,text:editText.trim(),color:editColor,hora:editHour}:it));}
    else if(editText.trim()){setAgendaItems(prev=>[...prev,{id:`ev_${Date.now()}`,text:editText.trim(),day:DAYS_SHORT[editing.dayIdx-1],dayIdx:editing.dayIdx,hora:editHour,color:editColor}]);}
    setEditing(null);
  }
  function remove(id){ setAgendaItems(prev=>prev.filter(it=>it.id!==id)); }

  const firstDay=firstDayOfMonth(selMonth);
  const totalDays=daysInMonth(selMonth);

  return(
    <div style={{padding:"13px 13px 28px",background:s.bg,minHeight:"100%"}}>
      <h2 style={{color:s.text,fontWeight:500,fontSize:17,margin:"0 0 11px"}}>📅 Mi agenda</h2>
      <div style={{display:"flex",gap:5,marginBottom:12}}>
        {["dia","semana","mes"].map(v=>(
          <button key={v} onClick={()=>setView(v)} style={{flex:1,border:`0.5px solid ${view===v?P.accent:s.border}`,background:view===v?(dark?"#3E2218":P.accentLight):"transparent",borderRadius:8,padding:"6px 0",cursor:"pointer",color:view===v?P.accent:s.muted,fontSize:12,fontWeight:view===v?500:400,textTransform:"capitalize"}}>{v}</button>
        ))}
      </div>

      {view==="dia"&&(
        <div>
          <div style={{display:"flex",gap:4,marginBottom:12,overflowX:"auto"}}>
            {DAYS_SHORT.map((d,i)=>(
              <button key={d} onClick={()=>setSelDay(i+1)} style={{flexShrink:0,background:selDay===i+1?P.accent:"transparent",color:selDay===i+1?"#fff":s.muted,border:`0.5px solid ${selDay===i+1?P.accent:s.border}`,borderRadius:7,padding:"5px 10px",cursor:"pointer",fontSize:11,fontWeight:selDay===i+1?500:400}}>{d}</button>
            ))}
          </div>
          {HOURS.map(h=>{
            const items=getItems(selDay,h);
            return(
              <div key={h} style={{display:"flex",gap:7,marginBottom:6}}>
                <span style={{fontSize:10,color:s.muted,width:40,flexShrink:0,paddingTop:12}}>{h}</span>
                <div style={{flex:1,display:"flex",flexDirection:"column",gap:3}}>
                  {items.length===0?<div onClick={()=>openNew(selDay,h)} style={{minHeight:38,background:s.card,border:`0.5px solid ${s.border}`,borderRadius:9,padding:"9px 12px",cursor:"pointer",display:"flex",alignItems:"center"}}><span style={{fontSize:11,color:s.muted}}>+ agregar</span></div>:items.map(item=>(
                    <div key={item.id} onClick={()=>openEdit(item)} style={{minHeight:38,background:item.color+"22",border:`0.5px solid ${item.color}88`,borderRadius:9,padding:"9px 12px",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                      <span style={{fontSize:12,color:item.color,fontWeight:500}}>{item.text}</span>
                      <button onClick={e=>{e.stopPropagation();remove(item.id);}} style={{background:"transparent",border:"none",color:s.muted,cursor:"pointer",fontSize:15,padding:2}}>×</button>
                    </div>
                  ))}
                  {items.length>0&&<div onClick={()=>openNew(selDay,h)} style={{height:24,background:"transparent",border:`0.5px dashed ${s.border}`,borderRadius:7,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{fontSize:10,color:s.muted}}>+ otro</span></div>}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {view==="semana"&&(
        <div>
          <div style={{display:"grid",gridTemplateColumns:`40px repeat(7,1fr)`,gap:"2px 3px",marginBottom:5}}>
            <div/>{DAYS_SHORT.map((d,i)=><div key={d} onClick={()=>{setSelDay(i+1);setView("dia");}} style={{textAlign:"center",fontSize:10,color:selDay===i+1?P.accent:s.muted,fontWeight:selDay===i+1?500:400,paddingBottom:4,cursor:"pointer"}}>{d}</div>)}
          </div>
          {HOURS.slice(0,9).map(h=>(
            <div key={h} style={{display:"grid",gridTemplateColumns:`40px repeat(7,1fr)`,gap:"2px 3px",marginBottom:3}}>
              <span style={{fontSize:9,color:s.muted,paddingTop:4}}>{h}</span>
              {DAYS_SHORT.map((_,di)=>{
                const items=getItems(di+1,h);
                const ev=items[0];
                return<div key={di} onClick={()=>{setSelDay(di+1);setView("dia");}} style={{minHeight:28,background:ev?(ev.color+"33"):(dark?"#2E2218":P.beigeDeep+"88"),border:`0.5px solid ${ev?(ev.color+"55"):s.border}`,borderRadius:4,cursor:"pointer",padding:ev?"2px 3px":0,display:"flex",alignItems:"center"}}>
                  {ev&&<span style={{fontSize:9,color:ev.color,lineHeight:1.2}}>{ev.text.slice(0,10)}</span>}
                </div>;
              })}
            </div>
          ))}
        </div>
      )}

      {view==="mes"&&(
        <div>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
            <button onClick={()=>setSelMonth(m=>Math.max(4,m-1))} style={{background:"transparent",border:`0.5px solid ${s.border}`,borderRadius:7,padding:"4px 10px",cursor:"pointer",color:s.text}}>←</button>
            <span style={{fontWeight:500,color:s.text,flex:1,textAlign:"center",fontSize:14}}>{MONTHS_ES[selMonth]} 2026</span>
            <button onClick={()=>setSelMonth(m=>Math.min(11,m+1))} style={{background:"transparent",border:`0.5px solid ${s.border}`,borderRadius:7,padding:"4px 10px",cursor:"pointer",color:s.text}}>→</button>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:2,marginBottom:4}}>
            {DAYS_SHORT.map(d=><div key={d} style={{textAlign:"center",fontSize:10,color:s.muted,paddingBottom:3}}>{d}</div>)}
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:2}}>
            {Array.from({length:firstDay},(_,i)=><div key={"e"+i}/>)}
            {Array.from({length:totalDays},(_,i)=>{
              const day=i+1;
              const dow=(firstDay+i)%7;
              const hasEv=agendaItems.some(it=>DAYS_SHORT.indexOf(it.day)===dow);
              return(
                <div key={day} onClick={()=>{setSelDay(dow===0?7:dow);setView("dia");}} style={{height:34,background:s.card,border:`0.5px solid ${s.border}`,borderRadius:6,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",cursor:"pointer",position:"relative"}}>
                  <span style={{fontSize:11,color:s.text}}>{day}</span>
                  {hasEv&&<span style={{width:4,height:4,borderRadius:"50%",background:P.accent,position:"absolute",bottom:3}}/>}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {editing&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.55)",display:"flex",alignItems:"flex-end",zIndex:100}} onClick={()=>setEditing(null)}>
          <div onClick={e=>e.stopPropagation()} style={{width:"100%",background:s.card,borderRadius:"14px 14px 0 0",padding:18,boxSizing:"border-box"}}>
            <p style={{fontWeight:500,color:s.text,margin:"0 0 10px"}}>{editing.existing?"Editar":"Nuevo"} bloque</p>
            <input value={editText} onChange={e=>setEditText(e.target.value)} placeholder="¿Qué vas a estudiar?" style={{width:"100%",border:`0.5px solid ${s.border}`,borderRadius:8,padding:"9px 11px",fontSize:13,background:dark?"#241C14":P.cream,color:s.text,outline:"none",boxSizing:"border-box",marginBottom:9}} autoFocus/>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:11}}>
              <span style={{fontSize:12,color:s.muted}}>Hora:</span>
              <select value={editHour} onChange={e=>setEditHour(e.target.value)} style={{border:`0.5px solid ${s.border}`,borderRadius:6,padding:"4px 7px",fontSize:12,background:dark?"#241C14":P.cream,color:s.text}}>
                {HOURS.map(h=><option key={h} value={h}>{h}</option>)}
              </select>
              <div style={{display:"flex",gap:6}}>
                {colorOpts.map(c=><div key={c} onClick={()=>setEditColor(c)} style={{width:20,height:20,borderRadius:"50%",background:c,border:editColor===c?`2.5px solid ${s.text}`:"2px solid transparent",cursor:"pointer"}}/>)}
              </div>
            </div>
            <div style={{display:"flex",gap:7}}>
              <button onClick={()=>setEditing(null)} style={{flex:1,background:"transparent",border:`0.5px solid ${s.border}`,borderRadius:9,padding:10,cursor:"pointer",color:s.muted,fontSize:13}}>Cancelar</button>
              <button onClick={saveEdit} style={{flex:2,background:P.accent,border:"none",borderRadius:9,padding:10,color:"#fff",cursor:"pointer",fontSize:13,fontWeight:500}}>Guardar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── ROADMAP ───────────────────────────────────────────────
function Roadmap({dark,exams,setExams,agendaItems}){
  const s=useS(dark);
  const [view,setView]=useState("general");
  const [selExam,setSelExam]=useState(exams[0]?.id);
  const [editingExam,setEditingExam]=useState(null);
  const [editData,setEditData]=useState({});

  function saveExam(){
    setExams(prev=>prev.map(e=>e.id===editingExam?{...e,...editData,score:editData.score?Number(editData.score):e.score}:e));
    setEditingExam(null);
  }
  function addExam(){
    setExams(prev=>[...prev,{id:`exam_${Date.now()}`,name:"Nuevo examen",date:"",status:"futuro",topics:["Sin temas"],score:null,notes:""}]);
  }
  function removeExam(id){ setExams(prev=>prev.filter(e=>e.id!==id)); }

  const exam=exams.find(e=>e.id===selExam);
  const planItems=agendaItems.filter(it=>it.fromPlan&&DAYS_SHORT.indexOf(it.day)>=0);

  return(
    <div style={{padding:16,background:s.bg,minHeight:"100%"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
        <h2 style={{color:s.text,fontWeight:500,fontSize:17,margin:0}}>Plan de estudio</h2>
        <button onClick={addExam} style={{background:"transparent",border:`0.5px solid ${s.border}`,borderRadius:8,padding:"5px 11px",cursor:"pointer",color:P.accent,fontSize:12}}>+ Examen</button>
      </div>
      <div style={{display:"flex",gap:5,marginBottom:14}}>
        {["general","detalle"].map(v=>(
          <button key={v} onClick={()=>setView(v)} style={{flex:1,border:`0.5px solid ${view===v?P.accent:s.border}`,background:view===v?(dark?"#3E2218":P.accentLight):"transparent",borderRadius:8,padding:"6px 0",cursor:"pointer",color:view===v?P.accent:s.muted,fontSize:12,fontWeight:view===v?500:400,textTransform:"capitalize"}}>{v==="general"?"Vista general":"Detalle por examen"}</button>
        ))}
      </div>

      {view==="general"&&(
        <div>
          {exams.map((phase,i)=>(
            <div key={phase.id} style={{display:"flex",gap:12}}>
              <div style={{display:"flex",flexDirection:"column",alignItems:"center",width:26,flexShrink:0}}>
                <div style={{width:26,height:26,borderRadius:"50%",background:phase.status==="aprobado"?P.success:phase.status==="proximo"?P.accent:(dark?"#3A2C1A":P.beigeDeep),display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,color:["aprobado","proximo"].includes(phase.status)?"#fff":s.muted,fontWeight:500,flexShrink:0}}>{phase.status==="aprobado"?"✓":i+1}</div>
                {i<exams.length-1&&<div style={{width:1.5,flex:1,minHeight:20,background:dark?"#3A2C1A":P.beigeDeep,margin:"3px 0"}}/>}
              </div>
              <div style={{background:phase.status==="proximo"?(dark?"#3E2218":"#FFF3EC"):s.card,border:`0.5px solid ${phase.status==="proximo"?P.accent:s.border}`,borderRadius:11,padding:"10px 13px",flex:1,marginBottom:8}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:3}}>
                  <p style={{fontWeight:500,color:s.text,margin:0,fontSize:13}}>{phase.name}</p>
                  <div style={{display:"flex",gap:5,alignItems:"center"}}>
                    {phase.score&&<span style={{fontSize:13,fontWeight:500,color:phase.score>=60?P.success:P.danger}}>{phase.score}%</span>}
                    <button onClick={()=>{setEditingExam(phase.id);setEditData({name:phase.name,date:phase.date,status:phase.status,score:phase.score,topics:phase.topics.join(", "),notes:phase.notes||""});}} style={{background:"transparent",border:"none",color:s.muted,cursor:"pointer",fontSize:12}}>✏️</button>
                    <button onClick={()=>removeExam(phase.id)} style={{background:"transparent",border:"none",color:P.danger,cursor:"pointer",fontSize:12}}>🗑</button>
                  </div>
                </div>
                {phase.date&&<p style={{fontSize:11,color:s.muted,margin:"0 0 3px"}}>{phase.date}</p>}
                {phase.topics.map(t=><p key={t} style={{fontSize:11,color:phase.status==="aprobado"?s.muted:s.text,margin:"2px 0",display:"flex",gap:4}}><span style={{color:phase.status==="aprobado"?P.success:phase.status==="proximo"?P.accent:s.muted}}>→</span>{t}</p>)}
              </div>
            </div>
          ))}
          {planItems.length>0&&(
            <div style={{background:s.card,border:`0.5px solid ${s.border}`,borderRadius:11,padding:"12px 14px",marginTop:4}}>
              <p style={{fontWeight:500,color:s.text,margin:"0 0 8px",fontSize:13}}>📅 Plan IA en agenda</p>
              {planItems.slice(0,5).map(it=>(
                <div key={it.id} style={{display:"flex",gap:7,marginBottom:5,padding:"5px 9px",background:dark?"#3A2C1A":P.beigeDeep,borderRadius:7}}>
                  <span style={{fontSize:11,color:s.muted,width:34,flexShrink:0}}>{it.day}</span>
                  <span style={{fontSize:11,color:s.muted,width:42,flexShrink:0}}>{it.hora}</span>
                  <span style={{fontSize:12,color:s.text}}>{it.text}</span>
                </div>
              ))}
              {planItems.length>5&&<p style={{fontSize:11,color:s.muted,marginTop:3}}>+{planItems.length-5} más en agenda</p>}
            </div>
          )}
        </div>
      )}

      {view==="detalle"&&(
        <div>
          <div style={{display:"flex",gap:5,marginBottom:12,flexWrap:"wrap"}}>
            {exams.map(e=>(
              <button key={e.id} onClick={()=>setSelExam(e.id)} style={{background:selExam===e.id?P.accent:"transparent",color:selExam===e.id?"#fff":s.muted,border:`0.5px solid ${selExam===e.id?P.accent:s.border}`,borderRadius:7,padding:"4px 11px",cursor:"pointer",fontSize:11,fontWeight:selExam===e.id?500:400}}>{e.name}</button>
            ))}
          </div>
          {exam&&(
            <div>
              <div style={{background:s.card,border:`0.5px solid ${s.border}`,borderRadius:12,padding:"14px 15px",marginBottom:10}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
                  <p style={{fontWeight:500,color:s.text,margin:0,fontSize:15}}>{exam.name}</p>
                  {exam.score&&<span style={{fontSize:18,fontWeight:500,color:exam.score>=60?P.success:P.danger}}>{exam.score}%</span>}
                </div>
                {exam.date&&<p style={{fontSize:12,color:s.muted,margin:"0 0 8px"}}>{exam.date}</p>}
                <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
                  {exam.topics.map(t=><span key={t} style={{fontSize:11,background:dark?"#3A2C1A":P.beigeDeep,borderRadius:5,padding:"2px 8px",color:s.text}}>{t}</span>)}
                </div>
                {exam.notes&&<p style={{fontSize:12,color:s.muted,margin:"8px 0 0",fontStyle:"italic"}}>{exam.notes}</p>}
              </div>
              <div style={{background:s.card,border:`0.5px solid ${s.border}`,borderRadius:12,padding:"13px 14px"}}>
                <p style={{fontWeight:500,color:s.text,margin:"0 0 8px",fontSize:13}}>Bloques de estudio asignados</p>
                {agendaItems.filter(it=>DAYS_SHORT.indexOf(it.day)>=0).slice(0,6).map(it=>(
                  <div key={it.id} style={{display:"flex",gap:7,marginBottom:5,padding:"5px 9px",background:dark?"#3A2C1A":P.beigeDeep,borderRadius:7}}>
                    <span style={{fontSize:11,color:s.muted,width:34}}>{it.day}</span>
                    <span style={{fontSize:11,color:s.muted,width:42}}>{it.hora}</span>
                    <span style={{fontSize:12,color:s.text}}>{it.text}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {editingExam&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.55)",display:"flex",alignItems:"center",justifyContent:"center",padding:16,zIndex:100}}>
          <div style={{background:s.card,borderRadius:14,padding:18,width:"100%",maxWidth:420}}>
            <p style={{fontWeight:500,color:s.text,margin:"0 0 12px",fontSize:15}}>Editar examen</p>
            <input value={editData.name||""} onChange={e=>setEditData(d=>({...d,name:e.target.value}))} placeholder="Nombre" style={{width:"100%",border:`0.5px solid ${s.border}`,borderRadius:7,padding:"8px 10px",fontSize:13,background:dark?"#241C14":P.cream,color:s.text,outline:"none",marginBottom:8,boxSizing:"border-box"}}/>
            <div style={{display:"flex",gap:7,marginBottom:8}}>
              <input value={editData.date||""} onChange={e=>setEditData(d=>({...d,date:e.target.value}))} placeholder="Fecha" style={{flex:1,border:`0.5px solid ${s.border}`,borderRadius:7,padding:"8px 10px",fontSize:13,background:dark?"#241C14":P.cream,color:s.text,outline:"none"}}/>
              <input type="number" value={editData.score||""} onChange={e=>setEditData(d=>({...d,score:e.target.value}))} placeholder="Nota %" style={{width:80,border:`0.5px solid ${s.border}`,borderRadius:7,padding:"8px 10px",fontSize:13,background:dark?"#241C14":P.cream,color:s.text,outline:"none"}}/>
            </div>
            <select value={editData.status||"futuro"} onChange={e=>setEditData(d=>({...d,status:e.target.value}))} style={{width:"100%",border:`0.5px solid ${s.border}`,borderRadius:7,padding:"8px 10px",fontSize:13,background:dark?"#241C14":P.cream,color:s.text,marginBottom:8,boxSizing:"border-box"}}>
              <option value="aprobado">Aprobado</option>
              <option value="proximo">Próximo</option>
              <option value="activo">Activo (estudiando)</option>
              <option value="futuro">Futuro</option>
            </select>
            <input value={editData.topics||""} onChange={e=>setEditData(d=>({...d,topics:e.target.value}))} placeholder="Temas (separados por coma)" style={{width:"100%",border:`0.5px solid ${s.border}`,borderRadius:7,padding:"8px 10px",fontSize:13,background:dark?"#241C14":P.cream,color:s.text,outline:"none",marginBottom:8,boxSizing:"border-box"}}/>
            <textarea value={editData.notes||""} onChange={e=>setEditData(d=>({...d,notes:e.target.value}))} placeholder="Notas..." rows={2} style={{width:"100%",border:`0.5px solid ${s.border}`,borderRadius:7,padding:"8px 10px",fontSize:13,background:dark?"#241C14":P.cream,color:s.text,outline:"none",resize:"vertical",boxSizing:"border-box",marginBottom:10}}/>
            <div style={{display:"flex",gap:7}}>
              <button onClick={()=>setEditingExam(null)} style={{flex:1,background:"transparent",border:`0.5px solid ${s.border}`,borderRadius:9,padding:10,cursor:"pointer",color:s.muted,fontSize:13}}>Cancelar</button>
              <button onClick={saveExam} style={{flex:2,background:P.accent,border:"none",borderRadius:9,padding:10,color:"#fff",cursor:"pointer",fontSize:13,fontWeight:500}}>Guardar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── FUENTES ───────────────────────────────────────────────
function Fuentes({dark,sources,setSources}){
  const s=useS(dark);
  const [ytLink,setYtLink]=useState("");
  const [extLink,setExtLink]=useState("");
  const [p1exp,setP1exp]=useState(false);
  const fileRef=useRef(null);
  const p1Src=[{id:"p1a",type:"file",name:"Apuntes Neuroanatomía.pdf",size:"2.4 MB"},{id:"p1b",type:"youtube",title:"Clase Locomotor"},{id:"p1c",type:"link",title:"Guía Bioética"}];
  function addYT(){if(!ytLink.trim())return;setSources(p=>[...p,{id:Date.now(),type:"youtube",url:ytLink,title:"Video YouTube"}]);setYtLink("");}
  function addLink(){if(!extLink.trim())return;setSources(p=>[...p,{id:Date.now(),type:"link",url:extLink,title:extLink}]);setExtLink("");}
  function handleFile(e){const f=e.target.files[0];if(!f)return;setSources(p=>[...p,{id:Date.now(),type:"file",name:f.name,size:(f.size/1024).toFixed(1)+" KB"}]);}
  function remove(id){setSources(p=>p.filter(s=>s.id!==id));}
  return(
    <div style={{padding:16,background:s.bg,minHeight:"100%"}}>
      <h2 style={{color:s.text,fontWeight:500,fontSize:17,margin:"0 0 4px"}}>📎 Mis fuentes</h2>
      <p style={{color:s.muted,fontSize:12,margin:"0 0 14px"}}>La IA usa este material para personalizar explicaciones y contenido</p>
      <div style={{background:dark?"#1A3A2A":P.successLight,border:`0.5px solid ${P.success}44`,borderRadius:11,padding:"11px 13px",marginBottom:12}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div style={{display:"flex",alignItems:"center",gap:7}}><span style={{fontSize:15}}>🏆</span><div><p style={{fontWeight:500,color:P.success,margin:0,fontSize:13}}>1er Parcial — Archivado</p><p style={{fontSize:11,color:dark?"#70A870":P.success,margin:0}}>Disponible para examen final</p></div></div>
          <button onClick={()=>setP1exp(e=>!e)} style={{background:"transparent",border:"none",color:P.success,cursor:"pointer",fontSize:12}}>{p1exp?"▲":"▼"}</button>
        </div>
        {p1exp&&<div style={{marginTop:8,borderTop:`0.5px solid ${P.success}33`,paddingTop:8}}>{p1Src.map(src=><div key={src.id} style={{display:"flex",alignItems:"center",gap:7,marginBottom:5,padding:"5px 9px",background:dark?"#1A4A2A":"#C8E8C8",borderRadius:7}}><span style={{fontSize:12}}>{src.type==="youtube"?"🎬":src.type==="file"?"📄":"🔗"}</span><span style={{fontSize:12,color:dark?"#90D890":"#2A5A2A",flex:1}}>{src.name||src.title}</span>{src.size&&<span style={{fontSize:10,color:P.success}}>{src.size}</span>}</div>)}</div>}
      </div>
      {[{label:"📄 Subir archivo",action:<><input ref={fileRef} type="file" accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.png,.jpg" onChange={handleFile} style={{display:"none"}}/><button onClick={()=>fileRef.current.click()} style={{background:dark?"#3E2C1A":P.beigeDeep,border:`0.5px solid ${s.border}`,borderRadius:7,padding:"7px 14px",cursor:"pointer",color:s.text,fontSize:12}}>Elegir archivo</button></>},
        {label:"🎬 YouTube",action:<div style={{display:"flex",gap:7}}><input value={ytLink} onChange={e=>setYtLink(e.target.value)} placeholder="https://youtube.com/watch?v=..." style={{flex:1,borderRadius:7,border:`0.5px solid ${s.border}`,padding:"7px 10px",fontSize:12,background:dark?"#241C14":P.cream,color:s.text,outline:"none"}}/><button onClick={addYT} style={{background:P.accent,color:"#fff",border:"none",borderRadius:7,padding:"7px 12px",cursor:"pointer",fontSize:12}}>+</button></div>},
        {label:"🔗 Link / Bibliografía",action:<div style={{display:"flex",gap:7}}><input value={extLink} onChange={e=>setExtLink(e.target.value)} placeholder="https://..." style={{flex:1,borderRadius:7,border:`0.5px solid ${s.border}`,padding:"7px 10px",fontSize:12,background:dark?"#241C14":P.cream,color:s.text,outline:"none"}}/><button onClick={addLink} style={{background:P.accent,color:"#fff",border:"none",borderRadius:7,padding:"7px 12px",cursor:"pointer",fontSize:12}}>+</button></div>},
      ].map(item=>(
        <div key={item.label} style={{background:s.card,border:`0.5px solid ${s.border}`,borderRadius:11,padding:"11px 13px",marginBottom:9}}>
          <p style={{fontSize:12,fontWeight:500,color:s.text,margin:"0 0 8px"}}>{item.label}</p>
          {item.action}
        </div>
      ))}
      {sources.length>0&&<>
        <p style={{fontSize:12,fontWeight:500,color:s.text,margin:"14px 0 8px"}}>Material activo ({sources.length})</p>
        {sources.map(src=>(
          <div key={src.id} style={{background:s.card,border:`0.5px solid ${s.border}`,borderRadius:9,padding:"9px 12px",marginBottom:6,display:"flex",alignItems:"center",gap:8}}>
            <span style={{fontSize:16}}>{src.type==="youtube"?"🎬":src.type==="file"?"📄":"🔗"}</span>
            <div style={{flex:1,overflow:"hidden"}}><p style={{fontSize:12,color:s.text,margin:0,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{src.name||src.title}</p>{src.size&&<p style={{fontSize:10,color:s.muted,margin:"1px 0 0"}}>{src.size}</p>}</div>
            <button onClick={()=>remove(src.id)} style={{background:"transparent",border:"none",color:s.muted,cursor:"pointer",fontSize:16,padding:2}}>×</button>
          </div>
        ))}
      </>}
    </div>
  );
}

// ── ANATOMÍA ──────────────────────────────────────────────
function Anatomia({dark}){
  const s=useS(dark);
  const [sel,setSel]=useState(null);
  const [asking,setAsking]=useState("");
  const [answer,setAnswer]=useState("");
  const [loading,setLoading]=useState(false);

  const SECTIONS=[
    {id:"oseo",name:"Sistema óseo",emoji:"🦴",info:"206 huesos en adultos. Huesos largos (fémur, húmero, tibia), cortos (carpo, tarso), planos (cráneo, esternón, escápula), irregulares (vértebras). Funciones: soporte estructural, protección de órganos, movimiento (palancas), hematopoyesis en médula roja, reserva de calcio y fósforo.",topics:["Huesos del cráneo","Columna vertebral: 7C+12T+5L+5S+4Co","Cintura escapular y pélvica","Miembro superior e inferior","Articulaciones: fibrosas, cartilaginosas, sinoviales"]},
    {id:"muscular",name:"Sistema muscular",emoji:"💪",info:"~640 músculos. Tipos: esquelético (voluntario, estriado), liso (involuntario, vísceras), cardíaco (involuntario, estriado). Propiedades: excitabilidad, contractilidad, extensibilidad, elasticidad. Unidad motora = neurona motora + fibras que inerva.",topics:["Músculos del tronco: pectorales, intercostales, abdominales","Músculos de la espalda: trapecio, dorsal ancho, erector","Músculos del miembro superior: deltoides, bíceps, tríceps","Músculos del miembro inferior: glúteos, cuádriceps, isquiotibiales","Tendones y fascias"]},
    {id:"nervioso",name:"Sistema nervioso",emoji:"🧠",info:"SNC: encéfalo (cerebro, cerebelo, tronco) + médula espinal. SNP: 12 pares craneales + 31 pares espinales. Neurona: soma, axón, dendritas, sinapsis. Neuroglia: astrocitos, oligodendrocitos, microglía, células de Schwann.",topics:["Lóbulos cerebrales: frontal, parietal, temporal, occipital","12 pares craneales (I olfatorio → XII hipogloso)","Médula espinal: sustancia gris en H, sustancia blanca","Sistema autónomo: simpático (T1-L2) y parasimpático","Sinapsis química: neurotransmisor, receptor, potencial de acción"]},
    {id:"cardiovascular",name:"Sistema cardiovascular",emoji:"❤️",info:"Corazón: 4 cámaras (2 aurículas + 2 ventrículos), pericardio, miocardio, endocardio. Circulación mayor: VI→aorta→cuerpo→VD. Circulación menor: VD→pulmones→VI. Válvulas: tricúspide (AD-VD), pulmonar (VD-AP), mitral (AI-VI), aórtica (VI-Ao).",topics:["Ciclo cardíaco: sístole y diástole","Arterias, venas y capilares","Sistema de conducción: nódulo SA, AV, haz de His","Grandes vasos: aorta, vena cava, arteria pulmonar","Presión arterial y gasto cardíaco"]},
    {id:"respiratorio",name:"Sistema respiratorio",emoji:"🫁",info:"Vías superiores: nariz, faringe, laringe. Vías inferiores: tráquea, bronquios, bronquiolos, alvéolos. Pulmón derecho: 3 lóbulos. Pulmón izquierdo: 2 lóbulos. Intercambio gaseoso por difusión en alvéolos. Surfactante pulmonar.",topics:["Mecánica respiratoria: inspiración y espiración","Volúmenes y capacidades pulmonares","Pleura: visceral y parietal, espacio pleural","Control nervioso: centro respiratorio bulbar","Transporte de O₂ (hemoglobina) y CO₂ (bicarbonato)"]},
    {id:"digestivo",name:"Sistema digestivo",emoji:"🫄",info:"Tubo digestivo: boca→faringe→esófago→estómago→intestino delgado (duodeno, yeyuno, íleon)→intestino grueso (ciego, colon ascendente/transverso/descendente/sigmoideo)→recto→ano. Glándulas anexas: hígado (bilis), páncreas (enzimas + insulina/glucagón), vesícula biliar.",topics:["Peristalsis y segmentación","Digestión de proteínas, lípidos e hidratos","Absorción en intestino delgado: microvellosidades","Hígado: funciones metabólicas, detoxificación","Intestino grueso: absorción de agua, microbiota"]},
  ];

  async function askAbout(section){
    if(!asking.trim()||loading) return;
    setLoading(true); setAnswer("");
    try{
      const res=await fetch("/api/claude",{
        method:"POST",headers:{"Content-Type": "application/json"},
        body:JSON.stringify({
          model:"claude-sonnet-4-5",max_tokens:700,
          system:`Sos tutora de anatomía. Contexto del tema: ${section.info}. Respondé en español, de forma clara y concisa para alguien con TDAH. Máximo 4 párrafos cortos o una lista bien organizada.`,
          messages:[{role:"user",content:asking}]
        })
      });
      const data=await res.json();
      setAnswer(data.content?.[0]?.text||"Sin respuesta.");
    }catch{setAnswer("Sin conexión.");}
    setLoading(false);
  }

  return(
    <div style={{padding:16,background:useS(dark).bg,minHeight:"100%"}}>
      <h2 style={{color:useS(dark).text,fontWeight:500,fontSize:17,margin:"0 0 4px"}}>🧬 Anatomía general</h2>
      <p style={{color:useS(dark).muted,fontSize:12,margin:"0 0 14px"}}>Base de conocimiento de la app. Tocá un sistema para explorar.</p>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
        {SECTIONS.map(sec=>(
          <button key={sec.id} onClick={()=>setSel(sel===sec.id?null:sec.id)} style={{background:sel===sec.id?(dark?"#3E2218":P.accentLight):useS(dark).card,border:`0.5px solid ${sel===sec.id?P.accent:useS(dark).border}`,borderRadius:11,padding:"12px 12px",cursor:"pointer",textAlign:"left"}}>
            <span style={{fontSize:20}}>{sec.emoji}</span>
            <p style={{fontWeight:500,color:useS(dark).text,margin:"7px 0 2px",fontSize:12}}>{sec.name}</p>
            <p style={{color:useS(dark).muted,fontSize:10,margin:0}}>{sec.topics.length} subtemas</p>
          </button>
        ))}
      </div>
      {sel&&(()=>{
        const sec=SECTIONS.find(s=>s.id===sel);
        return(
          <div style={{marginTop:12,background:useS(dark).card,border:`0.5px solid ${useS(dark).border}`,borderRadius:12,padding:"14px 15px"}}>
            <p style={{fontWeight:500,color:useS(dark).text,margin:"0 0 8px",fontSize:14}}>{sec.emoji} {sec.name}</p>
            <p style={{fontSize:12,color:useS(dark).text,lineHeight:1.7,margin:"0 0 10px"}}>{sec.info}</p>
            <p style={{fontSize:11,color:useS(dark).muted,fontWeight:500,margin:"0 0 5px"}}>Subtemas clave:</p>
            {sec.topics.map(t=><p key={t} style={{fontSize:11,color:useS(dark).text,margin:"3px 0",display:"flex",gap:5}}><span style={{color:P.accent}}>→</span>{t}</p>)}
            <div style={{marginTop:12,borderTop:`0.5px solid ${useS(dark).border}`,paddingTop:10}}>
              <p style={{fontSize:11,color:useS(dark).muted,margin:"0 0 7px"}}>Preguntarle a la IA sobre este tema:</p>
              <div style={{display:"flex",gap:7}}>
                <input value={asking} onChange={e=>setAsking(e.target.value)} onKeyDown={e=>{if(e.key==="Enter")askAbout(sec);}} placeholder="Ej: ¿Cuáles son los huesos del carpo?" style={{flex:1,borderRadius:8,border:`0.5px solid ${useS(dark).border}`,padding:"8px 10px",fontSize:12,background:dark?"#241C14":P.cream,color:useS(dark).text,outline:"none"}}/>
                <button onClick={()=>askAbout(sec)} disabled={loading||!asking.trim()} style={{background:P.accent,color:"#fff",border:"none",borderRadius:8,padding:"8px 12px",cursor:"pointer",fontSize:12,opacity:loading||!asking.trim()?0.5:1}}>{loading?"...":"→"}</button>
              </div>
              {answer&&<div style={{marginTop:10,padding:"10px 12px",background:dark?"#241C14":P.cream,borderRadius:9,fontSize:12,color:useS(dark).text,lineHeight:1.7,whiteSpace:"pre-wrap"}}>{answer}</div>}
            </div>
          </div>
        );
      })()}
    </div>
  );
}

// ── ROOT ──────────────────────────────────────────────────
export default function App(){
  const [tab,setTab]=useState("dashboard");
  const [dark,setDark]=useState(false);
  const [sources,setSources]=useState([]);
  const [exams,setExams]=useState(INIT_EXAMS);
  const [pts,setPts]=useState(47);
  const [agendaItems,setAgendaItems]=useState([
    {id:"a1",text:"Repasar cardiovascular",day:"Lun",dayIdx:1,hora:"09:00",color:P.accent},
    {id:"a2",text:"Flashcards respiratorio",day:"Mié",dayIdx:3,hora:"10:00",color:P.success},
    {id:"a3",text:"Simulacro parcial",day:"Vie",dayIdx:5,hora:"14:00",color:P.danger},
  ]);

  return(
    <div style={{background:dark?"#1A1510":P.cream,minHeight:"100vh",fontFamily:"system-ui,sans-serif"}}>
      <TopBar tab={tab} setTab={setTab} dark={dark} setDark={setDark}/>
      {tab==="dashboard"&&<Dashboard dark={dark} setTab={setTab} sources={sources} exams={exams} setExams={setExams} pts={pts} setPts={setPts} agendaItems={agendaItems} setAgendaItems={setAgendaItems}/>}
      {tab==="chat"&&<ChatIA dark={dark} sources={sources} exams={exams}/>}
      {tab==="estudio"&&<Estudio dark={dark} exams={exams} pts={pts} setPts={setPts}/>}
      {tab==="progreso"&&<Progreso dark={dark} exams={exams}/>}
      {tab==="historial"&&<Historial dark={dark} exams={exams} setExams={setExams}/>}
      {tab==="planificador"&&<Planificador dark={dark} agendaItems={agendaItems} setAgendaItems={setAgendaItems}/>}
      {tab==="roadmap"&&<Roadmap dark={dark} exams={exams} setExams={setExams} agendaItems={agendaItems}/>}
      {tab==="fuentes"&&<Fuentes dark={dark} sources={sources} setSources={setSources}/>}
      {tab==="anatomia"&&<Anatomia dark={dark}/>}
    </div>
  );
}