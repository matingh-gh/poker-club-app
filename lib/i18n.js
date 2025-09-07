"use client";
import { create } from "zustand";

const en = {
  nav: { players: "Players", tournament: "Tournament", cashgame: "Cashgame", rankings: "Rankings" },
  common: { add: "Add", save: "Save", cancel: "Cancel", delete: "Delete", edit: "Edit", start:"Start", stop:"Stop", break:"Break", resume:"Resume" },
  players: { title: "Players", placeholder: "Player name", empty: "No players yet." },
  sessions: { create: "Create Session", type: "Type", tournament: "Tournament", cashgame: "Cashgame", date: "Date", blindup:"Blind-up every (min)", freeze:"Rebuy freeze (hh:mm)", hours:"Hours to play", selectPlayers:"Select players", createOk:"Session created", initialBuyin:"Initial buy-in", addBuyin:"Add buy-in" },
  tour: { markOut: "Mark Out", setPlaces: "Set 1st / 2nd / 3rd", place: "Place" },
  cash: { endStacks: "Enter Final Stacks", net: "Net", totalBuyins: "Total Buy-ins" },
  rank: { title: "Rankings", tournaments: "Tournaments", cashgames: "Cashgames", points:"Points" },
  lang: { title: "Language", en: "English", fa: "Persian" }
};
const fa = {
  nav: { players: "بازیکنان", tournament: "تورنامنت", cashgame: "کش‌گیم", rankings: "رنکینگ" },
  common: { add: "افزودن", save: "ذخیره", cancel: "لغو", delete: "حذف", edit: "ویرایش", start:"شروع", stop:"توقف", break:"استراحت", resume:"ادامه" },
  players: { title: "لیست بازیکنان", placeholder: "نام بازیکن", empty: "هنوز بازیکنی اضافه نشده." },
  sessions: { create: "ساخت جلسه", type: "نوع", tournament: "تورنامنت", cashgame: "کش‌گیم", date: "تاریخ", blindup:"افزایش بلایند هر (دقیقه)", freeze:"زمان فریز ری‌بای (ساعت:دقیقه)", hours:"مدت بازی (ساعت)", selectPlayers:"انتخاب بازیکنان", createOk:"جلسه ساخته شد", initialBuyin:"بای‌این اولیه", addBuyin:"افزودن بای‌این" },
  tour: { markOut: "حذف از بازی", setPlaces: "ثبت نفرات ۱/۲/۳", place: "رتبه" },
  cash: { endStacks: "ثبت چیپ نهایی", net: "خالص", totalBuyins: "مجموع بای‌این" },
  rank: { title: "رنکینگ", tournaments: "تورنامنت‌ها", cashgames: "کش‌گیم‌ها", points:"امتیاز" },
  lang: { title: "زبان", en: "انگلیسی", fa: "فارسی" }
};
export const useI18n = create((set,get)=>({
  locale: process.env.NEXT_PUBLIC_DEFAULT_LOCALE || "en",
  dict: en,
  t: (path)=> path.split(".").reduce((a,k)=>a?.[k], get().dict) || path,
  setLocale: (loc)=> set({ locale: loc, dict: loc==="fa" ? fa : en })
}));
