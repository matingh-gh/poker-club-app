"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useI18n } from "@/lib/i18n";

export default function RankingsPage(){
  const { t } = useI18n();
  const [tab,setTab]=useState("t");
  const [tour,setTour]=useState([]);
  const [cash,setCash]=useState([]);
  const [pts,setPts]=useState({ first:5, second:3, third:1 });

  useEffect(()=>{ (async()=>{
    const tRes = await supabase.from("ranking_tournaments").select("*").order("points",{ascending:false});
    setTour(tRes.data||[]);
    const cRes = await supabase.from("ranking_cashgames").select("*").order("net_winnings",{ascending:false});
    setCash(cRes.data||[]);
  })(); },[]);

  const savePoints=async()=>{
    await supabase.from("settings").upsert({ id: "points_first", value: String(pts.first) });
    await supabase.from("settings").upsert({ id: "points_second", value: String(pts.second) });
    await supabase.from("settings").upsert({ id: "points_third", value: String(pts.third) });
    alert("Points saved. New sessions will use them.");
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">{t("rank.title")}</h1>
      <div className="card p-3 flex gap-2">
        <button className={"btn " + (tab==="t"?"bg-gray-800":"")} onClick={()=>setTab("t")}>{t("rank.tournaments")}</button>
        <button className={"btn " + (tab==="c"?"bg-gray-800":"")} onClick={()=>setTab("c")}>{t("rank.cashgames")}</button>
        <div className="ml-auto flex items-center gap-2">
          <input type="number" className="input w-20" value={pts.first} onChange={e=>setPts({...pts,first:+e.target.value})} />
          <input type="number" className="input w-20" value={pts.second} onChange={e=>setPts({...pts,second:+e.target.value})} />
          <input type="number" className="input w-20" value={pts.third} onChange={e=>setPts({...pts,third:+e.target.value})} />
          <button className="btn" onClick={savePoints}>Save Points</button>
        </div>
      </div>
      {tab==="t" ? <Table rows={tour} cols={["player_name","points","played","firsts","seconds","thirds"]} /> :
                   <Table rows={cash} cols={["player_name","net_winnings","played"]} />}
    </div>
  );
}

function Table({ rows, cols }){
  return (
    <div className="card overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-900/70">
          <tr>{cols.map(c=><th key={c} className="text-left px-3 py-2 capitalize">{c.replace("_"," ")}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((r,i)=>(
            <tr key={i} className="border-t border-gray-800">
              {cols.map(c=><td key={c} className="px-3 py-2">{r[c]}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
