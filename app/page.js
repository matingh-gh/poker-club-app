"use client";
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n";

export default function PlayersPage(){
  const { t } = useI18n();
  const [players,setPlayers]=useState([]);
  const [name,setName]=useState("");

  const load=async()=>{ const { data }=await supabase.from("players").select("*").order("created_at",{ascending:true}); setPlayers(data||[]); };
  useEffect(()=>{ load(); },[]);

  const add=async()=>{ if(!name.trim()) return; await supabase.from("players").insert({ name: name.trim() }); setName(""); load(); };
  const del=async(id)=>{ await supabase.from("players").delete().eq("id",id); load(); };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">{t("players.title")}</h1>
      <div className="card p-4 flex gap-2">
        <input className="input flex-1" placeholder={t("players.placeholder")} value={name} onChange={e=>setName(e.target.value)} />
        <button className="btn" onClick={add}>{t("common.add")}</button>
      </div>
      <div className="grid md:grid-cols-2 gap-3">
        {players?.length? players.map(p=>(
          <div key={p.id} className="card p-4 flex items-center justify-between">
            <div>{p.name}</div>
            <button className="btn" onClick={()=>del(p.id)}>{t("common.delete")}</button>
          </div>
        )):<div className="opacity-70">{t("players.empty")}</div>}
      </div>
    </div>
  );
}
