"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useI18n } from "@/lib/i18n";

export default function TournamentPage(){
  const { t } = useI18n();
  const [players,setPlayers]=useState([]);
  const [selected,setSelected]=useState([]);
  const [blindup,setBlindup]=useState(15);
  const [freeze,setFreeze]=useState("02:00");
  const [date,setDate]=useState(()=>new Date().toISOString().slice(0,10));
  const [initialBuyin,setInitialBuyin]=useState(50);
  const [session,setSession]=useState(null);

  useEffect(()=>{ (async()=>{ const { data }=await supabase.from("players").select("*").order("created_at",{ascending:true}); setPlayers(data||[]); })(); },[]);
  const toggle=(id)=> setSelected(s=> s.includes(id) ? s.filter(x=>x!==id) : [...s,id]);

  const create=async()=>{
    const { data: sess, error } = await supabase.from("sessions").insert({
      type: "tournament", date, blindup_interval_minutes: blindup, rebuy_freeze_hhmm: freeze
    }).select().single();
    if(error){ alert(error.message); return; }
    setSession(sess);
    const rows = selected.map(pid => ({ session_id: sess.id, player_id: pid, initial_buyin: initialBuyin, total_buyin: initialBuyin }));
    await supabase.from("session_players").insert(rows);
    alert(t("sessions.createOk"));
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">{t("nav.tournament")}</h1>
      {!session && (
        <div className="card p-4 space-y-3">
          <div className="grid sm:grid-cols-2 gap-3">
            <label className="flex items-center gap-2"><span>{t("sessions.date")}:</span><input type="date" className="input" value={date} onChange={e=>setDate(e.target.value)} /></label>
            <label className="flex items-center gap-2"><span>{t("sessions.blindup")}:</span><input type="number" min="5" className="input w-24" value={blindup} onChange={e=>setBlindup(+e.target.value)} /></label>
            <label className="flex items-center gap-2"><span>{t("sessions.freeze")}:</span><input className="input w-24" value={freeze} onChange={e=>setFreeze(e.target.value)} /></label>
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
      {session && <TournamentTable session={session} />}
    </div>
  );
}

function TournamentTable({ session }){
  const { t } = useI18n();
  const [rows,setRows]=useState([]);
  const [buyin,setBuyin]=useState(50);
  const [places,setPlaces]=useState({first:null,second:null,third:null});

  const load=async()=>{ const { data }=await supabase.from("session_players_detail").select("*").eq("session_id",session.id).order("created_at",{ascending:true}); setRows(data||[]); };
  useEffect(()=>{ load(); },[]);

  const addBuyin=async(player_id)=>{ await supabase.from("buyins").insert({ session_id: session.id, player_id, amount: buyin }); await supabase.rpc("recompute_total_buyin",{p_session_id:session.id,p_player_id:player_id}); load(); };
  const markOut=async(player_id)=>{ await supabase.from("session_players").update({ out_at: new Date().toISOString() }).eq("session_id",session.id).eq("player_id",player_id); load(); };
  const savePlaces=async()=>{ 
    await supabase.from("session_players").update({ finish_position: 1 }).eq("session_id",session.id).eq("player_id",places.first);
    await supabase.from("session_players").update({ finish_position: 2 }).eq("session_id",session.id).eq("player_id",places.second);
    await supabase.from("session_players").update({ finish_position: 3 }).eq("session_id",session.id).eq("player_id",places.third);
    await supabase.rpc("update_tournament_points",{p_session_id:session.id}); alert("Places saved"); load();
  };

  return (
    <div className="card p-4 space-y-3">
      <div className="flex flex-wrap gap-2">
        <input type="number" className="input w-28" value={buyin} onChange={e=>setBuyin(+e.target.value)} />
        <div className="ml-auto flex gap-2">
          <PlacePicker rows={rows} value={places} onChange={setPlaces} />
          <button className="btn" onClick={savePlaces}>{t("tour.setPlaces")}</button>
        </div>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
        {rows.map(r=>(
          <div key={r.player_id} className="card p-3 space-y-2">
            <div className="font-medium flex items-center justify-between">
              <span>{r.player_name}</span>
              {r.finish_position && <span className="text-brand">#{r.finish_position}</span>}
            </div>
            <div className="text-sm opacity-80">{t("sessions.initialBuyin")}: {r.initial_buyin} — {t("cash.totalBuyins")}: {r.total_buyin}</div>
            <div className="flex gap-2">
              <button className="btn" onClick={()=>addBuyin(r.player_id)}>{t("sessions.addBuyin")}</button>
              <button className="btn" onClick={()=>markOut(r.player_id)}>{t("tour.markOut")}</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PlacePicker({ rows, value, onChange }){
  const opts = rows.map(r=>({ id:r.player_id, name:r.player_name }));
  const sel=(k,v)=>onChange({...value,[k]:v});
  return (
    <div className="flex gap-2">
      <select className="input" value={value.first||""} onChange={e=>sel("first",e.target.value)}>
        <option value="">1st</option>{opts.map(o=><option key={o.id} value={o.id}>{o.name}</option>)}
      </select>
      <select className="input" value={value.second||""} onChange={e=>sel("second",e.target.value)}>
        <option value="">2nd</option>{opts.map(o=><option key={o.id} value={o.id}>{o.name}</option>)}
      </select>
      <select className="input" value={value.third||""} onChange={e=>sel("third",e.target.value)}>
        <option value="">3rd</option>{opts.map(o=><option key={o.id} value={o.id}>{o.name}</option>)}
      </select>
    </div>
  );
}
