"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useI18n } from "@/lib/i18n";

export default function CashgamePage(){
  const { t } = useI18n();
  const [players,setPlayers]=useState([]);
  const [selected,setSelected]=useState([]);
  const [date,setDate]=useState(()=>new Date().toISOString().slice(0,10));
  const [hours,setHours]=useState(3);
  const [initialBuyin,setInitialBuyin]=useState(50);
  const [session,setSession]=useState(null);

  useEffect(()=>{ (async()=>{ const { data }=await supabase.from("players").select("*").order("created_at",{ascending:true}); setPlayers(data||[]); })(); },[]);
  const toggle=(id)=> setSelected(s=> s.includes(id) ? s.filter(x=>x!==id) : [...s,id]);

  const create=async()=>{
    const { data: sess, error } = await supabase.from("sessions").insert({
      type:"cashgame", date, hours_to_play: hours
    }).select().single();
    if(error){ alert(error.message); return; }
    setSession(sess);
    const rows = selected.map(pid => ({ session_id: sess.id, player_id: pid, initial_buyin: initialBuyin, total_buyin: initialBuyin }));
    await supabase.from("session_players").insert(rows);
    alert(t("sessions.createOk"));
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">{t("nav.cashgame")}</h1>
      {!session && (
        <div className="card p-4 space-y-3">
          <div className="grid sm:grid-cols-2 gap-3">
            <label className="flex items-center gap-2"><span>{t("sessions.date")}:</span><input type="date" className="input" value={date} onChange={e=>setDate(e.target.value)} /></label>
            <label className="flex items-center gap-2"><span>{t("sessions.hours")}:</span><input type="number" min="1" className="input w-24" value={hours} onChange={e=>setHours(+e.target.value)} /></label>
            <label className="flex items-center gap-2"><span>{t("sessions.initialBuyin")}:</span><input type="number" className="input w-28" value={initialBuyin} onChange={e=>setInitialBuyin(+e.target.value)} /></label>
          </div>
          <div>
            <div className="mb-2 font-medium">{t("sessions.selectPlayers")}</div>
            <div className="grid md:grid-cols-3 gap-2">
              {players.map(p=>{ const on = selected.includes(p.id); return (
                <button key={p.id} onClick={()=>toggle(p.id)} className={"btn " + (on ? "bg-gray-800" : "")}>{p.name}</button>
              );})}
            </div>
          </div>
          <button className="btn" onClick={create}>{t("sessions.create")}</button>
        </div>
      )}
      {session && <CashTable session={session} />}
    </div>
  );
}

function CashTable({ session }){
  const { t } = useI18n();
  const [rows,setRows]=useState([]);
  const [buyin,setBuyin]=useState(50);
  const [finals,setFinals]=useState({});

  const load=async()=>{ const { data }=await supabase.from("session_players_detail").select("*").eq("session_id",session.id).order("created_at",{ascending:true}); setRows(data||[]); };
  useEffect(()=>{ load(); },[]);

  const addBuyin=async(player_id)=>{ await supabase.from("buyins").insert({ session_id: session.id, player_id, amount: buyin }); await supabase.rpc("recompute_total_buyin",{p_session_id:session.id,p_player_id:player_id}); load(); };
  const saveFinals=async()=>{ for(const r of rows){ const v=Number(finals[r.player_id]||0); await supabase.from("session_players").update({ stack_end: v }).eq("session_id",session.id).eq("player_id",r.player_id); } await supabase.rpc("finalize_cashgame_results",{p_session_id:session.id}); alert("Saved"); load(); };
  const net=(r)=>((finals[r.player_id] ?? r.stack_end ?? 0) - (r.total_buyin||0));

  return (
    <div className="card p-4 space-y-3">
      <div className="flex gap-2 items-center">
        <input type="number" className="input w-28" value={buyin} onChange={e=>setBuyin(+e.target.value)} />
        <div className="ml-auto"><button className="btn" onClick={saveFinals}>{t("common.save")}</button></div>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
        {rows.map(r=>(
          <div key={r.player_id} className="card p-3 space-y-2">
            <div className="font-medium">{r.player_name}</div>
            <div className="text-sm opacity-80">{t("cash.totalBuyins")}: {r.total_buyin}</div>
            <div className="flex gap-2">
              <button className="btn" onClick={()=>addBuyin(r.player_id)}>{t("sessions.addBuyin")}</button>
              <input type="number" className="input w-28 ml-auto" placeholder={t("cash.endStacks")} value={finals[r.player_id]??""} onChange={e=>setFinals({...finals,[r.player_id]: e.target.value})} />
            </div>
            <div className={"text-sm " + (net(r)>=0?"text-emerald-400":"text-rose-400")}>{t("cash.net")}: {net(r)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
