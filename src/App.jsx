import { useState, useEffect, useRef } from "react";
import { supabase } from "./supabase";

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Outfit:wght@300;400;500;600;700;800;900&display=swap');`;

const DEMO_STREAMS = [
  { id: "stream-1", title: "Ranked Grind to Diamond", streamer: "NightOwlX", game: "Gaming", viewers: 12840, emoji: "🦉", color: "#7c3aed", bg: "135deg,#1a0a2e,#2d1b69" },
  { id: "stream-2", title: "Korean BBQ Night — Chill IRL", streamer: "SaraKitchen", game: "IRL", viewers: 4230, emoji: "👩‍🍳", color: "#e94560", bg: "135deg,#2e0a1a,#69141b" },
  { id: "stream-3", title: "FIFA 26 Ultimate Team", streamer: "GoalKingFC", game: "Sports", viewers: 8910, emoji: "⚽", color: "#0ea5e9", bg: "135deg,#0a1a2e,#0e3a5a" },
  { id: "stream-4", title: "Minecraft Hardcore Day 847", streamer: "CraftedLore", game: "Gaming", viewers: 6120, emoji: "⛏️", color: "#22c55e", bg: "135deg,#0a1e10,#0d3a1a" },
  { id: "stream-5", title: "Lo-Fi Beats + Chill Gaming", streamer: "LoFiDrift", game: "Music", viewers: 21400, emoji: "🎵", color: "#f0c040", bg: "135deg,#1e1a0a,#3a2e0d" },
  { id: "stream-6", title: "Just Chatting — Story Time", streamer: "TalkWithKai", game: "Just Chatting", viewers: 3340, emoji: "💬", color: "#ec4899", bg: "135deg,#2e0a1e,#5a1442" },
];

const CATS = ["All", "Gaming", "IRL", "Music", "Just Chatting", "Sports", "Food"];
const STREAM_CATS = ["Gaming", "IRL", "Music", "Just Chatting", "Sports", "Food"];

const CAT_META = {
  Gaming:       { emoji: "🎮", color: "#7c3aed", bg: "135deg,#1a0a2e,#2d1b69" },
  IRL:          { emoji: "📸", color: "#e94560", bg: "135deg,#2e0a1a,#69141b" },
  Music:        { emoji: "🎵", color: "#f0c040", bg: "135deg,#1e1a0a,#3a2e0d" },
  "Just Chatting": { emoji: "💬", color: "#ec4899", bg: "135deg,#2e0a1e,#5a1442" },
  Sports:       { emoji: "⚽", color: "#0ea5e9", bg: "135deg,#0a1a2e,#0e3a5a" },
  Food:         { emoji: "🍳", color: "#22c55e", bg: "135deg,#0a1e10,#0d3a1a" },
};

const CSS = `
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{--ink:#080816;--ink2:#0d0d20;--ink3:#12122a;--ink4:#1a1a35;--line:rgba(255,255,255,.07);--line2:rgba(255,255,255,.12);--purple:#7c3aed;--red:#ff2d55;--orange:#ff9500;--green:#00f5a0;--gold:#ffc800;--blue:#4d9fff;--txt:#ffffff;--muted:rgba(255,255,255,.45);--card:rgba(255,255,255,.03)}
html{scroll-behavior:smooth}
body{background:var(--ink);color:var(--txt);font-family:'Outfit',sans-serif;min-height:100vh;overflow-x:hidden}
::-webkit-scrollbar{width:3px}::-webkit-scrollbar-track{background:var(--ink2)}::-webkit-scrollbar-thumb{background:var(--ink4)}
button,input,textarea,select{font-family:'Outfit',sans-serif}
@keyframes blink{0%,100%{opacity:1}50%{opacity:.25}}
@keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
@keyframes toastIn{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
@keyframes pulse{0%,100%{box-shadow:0 0 0 0 rgba(255,45,85,.4)}70%{box-shadow:0 0 0 8px rgba(255,45,85,0)}}
.nav{position:fixed;top:0;left:0;right:0;z-index:200;height:56px;display:flex;align-items:center;justify-content:space-between;padding:0 10px;background:rgba(8,8,22,.95);backdrop-filter:blur(24px);border-bottom:1px solid var(--line)}
.logo{font-family:'Bebas Neue',sans-serif;font-size:24px;letter-spacing:2px;cursor:pointer;background:linear-gradient(90deg,var(--purple),var(--red),var(--orange));-webkit-background-clip:text;-webkit-text-fill-color:transparent;flex-shrink:0}
.nav-c{display:flex;gap:2px;overflow-x:auto}
.nl{background:none;border:none;color:var(--muted);font-size:13px;font-weight:500;padding:6px 12px;border-radius:20px;cursor:pointer;transition:all .2s;white-space:nowrap;flex-shrink:0}
.nl:hover,.nl.on{color:var(--txt);background:rgba(255,255,255,.08)}
.nav-r{display:flex;align-items:center;gap:8px;flex-shrink:0}
.coin-badge{display:flex;align-items:center;gap:4px;background:linear-gradient(135deg,rgba(255,200,0,.12),rgba(255,200,0,.04));border:1px solid rgba(255,200,0,.22);border-radius:20px;padding:5px 10px;font-size:11px;font-weight:700;color:var(--gold);cursor:pointer;white-space:nowrap}
.mode-toggle{display:flex;background:var(--ink3);border:1px solid var(--line2);border-radius:20px;padding:2px}
.mode-btn{background:none;border:none;color:var(--muted);font-size:13px;font-weight:600;padding:4px 8px;border-radius:16px;cursor:pointer;transition:all .2s;white-space:nowrap}
.mode-btn.on{background:linear-gradient(135deg,var(--purple),var(--red));color:#fff}
.av{width:32px;height:32px;border-radius:50%;background:linear-gradient(135deg,var(--purple),var(--red));display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:800;cursor:pointer;flex-shrink:0}
.btn-g{background:linear-gradient(135deg,var(--purple),var(--red));color:#fff;border:none;border-radius:20px;padding:8px 18px;font-size:13px;font-weight:700;cursor:pointer;transition:all .25s;box-shadow:0 4px 15px rgba(124,58,237,.25);white-space:nowrap}
.btn-g:hover{transform:translateY(-1px)}
.btn-o{background:transparent;color:rgba(255,255,255,.7);border:1px solid var(--line2);border-radius:20px;padding:7px 18px;font-size:13px;cursor:pointer;transition:all .2s;white-space:nowrap}
.btn-o:hover{border-color:rgba(255,255,255,.35);color:#fff}
.btn-red{background:linear-gradient(135deg,var(--red),#ff6b35);color:#fff;border:none;border-radius:20px;padding:8px 18px;font-size:13px;font-weight:700;cursor:pointer;transition:all .25s;white-space:nowrap}
.btn-red:hover{transform:translateY(-1px)}
.page{padding-top:56px;min-height:100vh;animation:fadeUp .28s ease}
.bottom-nav{display:none;position:fixed;bottom:0;left:0;right:0;z-index:200;background:rgba(8,8,22,.97);backdrop-filter:blur(20px);border-top:1px solid var(--line);padding:8px 0 12px}
.bottom-nav-items{display:flex;justify-content:space-around;align-items:center}
.bn-item{display:flex;flex-direction:column;align-items:center;gap:3px;background:none;border:none;color:var(--muted);cursor:pointer;padding:4px 12px;border-radius:10px;transition:all .2s;font-family:'Outfit',sans-serif}
.bn-item.on{color:var(--red)}
.bn-icon{font-size:20px}
.bn-label{font-size:10px;font-weight:600}
.hero{position:relative;min-height:calc(100vh - 56px);display:flex;align-items:center;padding:40px 20px;overflow:hidden}
.hero-mesh{position:absolute;inset:0;background:linear-gradient(135deg,rgba(124,58,237,.2),rgba(255,45,85,.12) 50%,rgba(255,149,0,.08))}
.hero-grid{position:absolute;inset:0;background-image:linear-gradient(rgba(255,255,255,.03) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.03) 1px,transparent 1px);background-size:60px 60px}
.hero-orb1{position:absolute;top:-80px;left:-80px;width:350px;height:350px;background:radial-gradient(circle,rgba(124,58,237,.35),transparent 70%);pointer-events:none}
.hero-orb2{position:absolute;bottom:-60px;right:5%;width:280px;height:280px;background:radial-gradient(circle,rgba(255,45,85,.25),transparent 70%);pointer-events:none}
.hero-content{position:relative;z-index:2;max-width:660px;width:100%}
.hero-eyebrow{display:inline-flex;align-items:center;gap:8px;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.14);backdrop-filter:blur(12px);color:rgba(255,255,255,.8);font-size:11px;font-weight:600;letter-spacing:.6px;padding:6px 14px;border-radius:20px;margin-bottom:20px}
.eyebrow-dot{width:6px;height:6px;background:var(--red);border-radius:50%;animation:blink 1.6s infinite}
.hero-h{font-family:'Bebas Neue',sans-serif;font-size:clamp(56px,12vw,115px);letter-spacing:2px;line-height:.9;margin-bottom:18px}
.hero-h .l1{display:block;color:#fff}
.hero-h .l2{display:block;background:linear-gradient(90deg,var(--purple),var(--red),var(--orange));-webkit-background-clip:text;-webkit-text-fill-color:transparent}
.hero-p{font-size:15px;font-weight:300;color:rgba(255,255,255,.58);line-height:1.68;margin-bottom:28px;max-width:500px}
.hero-p strong{color:#fff;font-weight:600}
.hero-btns{display:flex;gap:10px;flex-wrap:wrap;margin-bottom:36px}
.hero-stats{display:flex;flex-wrap:wrap;gap:16px}
.hstat{padding-right:20px;border-right:1px solid rgba(255,255,255,.1)}
.hstat:last-child{border-right:none;padding-right:0}
.hstat-v{font-family:'Bebas Neue',sans-serif;font-size:28px;letter-spacing:.5px;background:linear-gradient(90deg,#fff,rgba(255,255,255,.65));-webkit-background-clip:text;-webkit-text-fill-color:transparent}
.hstat-l{font-size:11px;color:var(--muted);margin-top:2px}
.disc-page{padding:20px 16px;padding-bottom:80px;max-width:1400px;margin:0 auto}
.disc-hero{background:linear-gradient(135deg,rgba(124,58,237,.12),rgba(255,45,85,.08));border:1px solid var(--line);border-radius:18px;padding:24px;margin-bottom:20px;position:relative;overflow:hidden}
.disc-hero h1{font-family:'Bebas Neue',sans-serif;font-size:clamp(28px,6vw,48px);letter-spacing:1px;margin-bottom:6px;line-height:1}
.disc-hero h1 span{background:linear-gradient(90deg,var(--purple),var(--red));-webkit-background-clip:text;-webkit-text-fill-color:transparent}
.disc-hero p{font-size:14px;color:var(--muted);margin-bottom:16px;line-height:1.5}
.search-bar{display:flex;gap:8px;margin-bottom:16px}
.search-input{flex:1;background:var(--ink3);border:1px solid var(--line2);border-radius:12px;padding:10px 14px;color:#fff;font-size:14px;outline:none;transition:border-color .2s}
.search-input:focus{border-color:rgba(124,58,237,.5)}
.search-input::placeholder{color:var(--muted)}
.dpills{display:flex;gap:8px;flex-wrap:wrap}
.dpill{display:flex;align-items:center;gap:6px;background:rgba(255,255,255,.06);border:1px solid var(--line2);border-radius:10px;padding:8px 12px}
.dpill-icon{font-size:16px}
.dpill-v{font-family:'Bebas Neue',sans-serif;font-size:17px}
.dpill-l{font-size:10px;color:var(--muted)}
.cats{display:flex;gap:6px;margin-bottom:20px;overflow-x:auto;padding-bottom:4px;-webkit-overflow-scrolling:touch}
.cat{background:rgba(255,255,255,.04);border:1px solid var(--line);color:var(--muted);font-size:12px;font-weight:500;padding:7px 14px;border-radius:20px;white-space:nowrap;cursor:pointer;transition:all .22s;flex-shrink:0}
.cat.on{background:linear-gradient(135deg,rgba(124,58,237,.2),rgba(255,45,85,.15));border-color:rgba(124,58,237,.45);color:#fff}
.sg{display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:12px}
.sc{background:linear-gradient(135deg,rgba(255,255,255,.04),rgba(255,255,255,.02));border:1px solid var(--line);border-radius:14px;overflow:hidden;cursor:pointer;transition:all .25s}
.sc:hover{border-color:rgba(124,58,237,.35);transform:translateY(-3px);box-shadow:0 12px 30px rgba(0,0,0,.5)}
.sc.real{border-color:rgba(255,45,85,.25)}
.sc-thumb{aspect-ratio:16/9;position:relative;overflow:hidden}
.sc-bg{position:absolute;inset:0}
.sc-ov{position:absolute;inset:0;background:linear-gradient(to top,rgba(0,0,0,.78),transparent 55%)}
.sc-emoji{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:40px;opacity:.16}
.sc-badges{position:absolute;top:7px;left:7px;display:flex;gap:5px}
.lpip{display:flex;align-items:center;gap:3px;background:linear-gradient(135deg,var(--red),#ff6b35);color:#fff;font-size:8px;font-weight:800;letter-spacing:.5px;padding:3px 7px;border-radius:4px}
.lpip-dot{width:4px;height:4px;background:#fff;border-radius:50%;animation:blink 1.6s infinite}
.epip{background:linear-gradient(135deg,rgba(0,245,160,.18),rgba(0,245,160,.08));border:1px solid rgba(0,245,160,.3);color:var(--green);font-size:8px;font-weight:700;padding:3px 7px;border-radius:4px}
.sc-viewers{position:absolute;bottom:7px;left:9px;font-size:10px;font-weight:600;color:rgba(255,255,255,.9)}
.sc-body{padding:10px}
.sc-row{display:flex;align-items:center;gap:7px;margin-bottom:6px}
.sc-av{width:26px;height:26px;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:12px;flex-shrink:0}
.sc-title{font-size:11px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-bottom:1px}
.sc-name{font-size:10px;color:var(--muted)}
.stag{background:rgba(255,255,255,.06);border:1px solid var(--line);color:var(--muted);font-size:9px;padding:2px 6px;border-radius:4px;display:inline-block}
.slayout{display:flex;flex-direction:column;min-height:calc(100vh - 56px);padding-bottom:60px}
.splayer{background:#000;width:100%;aspect-ratio:16/9;position:relative;flex-shrink:0}
.splayer-inner{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px}
.splayer-emoji{font-size:80px;opacity:.15;position:absolute}
.sbelow{flex:1;padding:16px;overflow-y:auto}
.stitle{font-family:'Bebas Neue',sans-serif;font-size:20px;letter-spacing:.5px;line-height:1.2;margin-bottom:12px}
.sactions{display:flex;gap:6px;margin-bottom:12px;flex-wrap:wrap}
.abtn{background:rgba(255,255,255,.06);border:1px solid var(--line);color:#fff;border-radius:10px;padding:7px 12px;font-size:12px;font-weight:500;cursor:pointer;display:flex;align-items:center;gap:4px;transition:all .2s}
.abtn.flw{background:linear-gradient(135deg,var(--purple),var(--red));border-color:transparent}
.abtn.flwing{background:rgba(0,245,160,.08);border-color:rgba(0,245,160,.25);color:var(--green)}
.earn-box{background:linear-gradient(135deg,rgba(0,245,160,.07),rgba(0,245,160,.02));border:1px solid rgba(0,245,160,.16);border-radius:14px;padding:14px;margin-bottom:14px}
.ebox-title{font-size:9px;font-weight:700;letter-spacing:1px;color:var(--green);text-transform:uppercase;margin-bottom:10px}
.ebig{font-family:'Bebas Neue',sans-serif;font-size:36px;color:var(--green);letter-spacing:1px}
.ecells{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-top:10px}
.ecell{background:rgba(0,0,0,.2);border-radius:8px;padding:8px 10px}
.ecell-v{font-size:13px;font-weight:700;margin-bottom:2px}
.ecell-l{font-size:9px;color:var(--muted)}
.gift{background:rgba(255,255,255,.05);border:1px solid var(--line);border-radius:10px;padding:8px 10px;text-align:center;cursor:pointer;transition:all .22s;min-width:58px}
.gift:hover,.gift:active{border-color:rgba(124,58,237,.4);background:rgba(124,58,237,.08)}
.gift-e{font-size:18px;display:block;margin-bottom:3px}
.gift-c{font-size:10px;color:var(--gold);font-weight:600}
.gift-n{font-size:9px;color:var(--muted);margin-top:1px}
.chat-section{background:var(--ink2);border-top:1px solid var(--line);margin:0 -16px;padding:0 16px}
.chat-hd{padding:12px 0;border-bottom:1px solid var(--line);display:flex;align-items:center;justify-content:space-between}
.chat-hd-title{font-family:'Bebas Neue',sans-serif;font-size:16px;letter-spacing:.5px}
.chat-msgs{max-height:250px;overflow-y:auto;padding:10px 0;display:flex;flex-direction:column;gap:6px}
.cmsg-a{font-size:11px;font-weight:700;margin-bottom:1px}
.cmsg-t{font-size:12px;color:rgba(255,255,255,.72);line-height:1.4}
.cmsg.sc{background:rgba(255,200,0,.06);border:1px solid rgba(255,200,0,.15);border-radius:7px;padding:7px 9px}
.chat-foot{padding:10px 0;border-top:1px solid var(--line)}
.chat-tip{font-size:10px;color:var(--green);font-weight:600;margin-bottom:5px}
.chat-row{display:flex;gap:6px}
.chat-in{flex:1;background:var(--ink3);border:1px solid var(--line2);border-radius:10px;padding:9px 12px;color:#fff;font-size:13px;outline:none}
.chat-in:focus{border-color:rgba(124,58,237,.4)}
.chat-in:disabled{opacity:.4;cursor:not-allowed}
.chat-send{background:linear-gradient(135deg,var(--purple),var(--red));border:none;border-radius:10px;width:36px;height:36px;color:#fff;display:flex;align-items:center;justify-content:center;font-size:16px;cursor:pointer;flex-shrink:0}
.chat-send:disabled{opacity:.4;cursor:not-allowed}
.wallet-page{padding:20px 16px;padding-bottom:80px}
.wcards{display:grid;grid-template-columns:1fr;gap:14px;margin-bottom:20px}
.wcard{background:var(--card);border:1px solid var(--line);border-radius:16px;padding:18px;position:relative;overflow:hidden}
.wcard::before{content:'';position:absolute;top:0;left:0;right:0;height:2px}
.wcard.g{background:linear-gradient(135deg,rgba(0,245,160,.07),rgba(0,245,160,.02));border-color:rgba(0,245,160,.18)}
.wcard.g::before{background:linear-gradient(90deg,var(--green),#00c8a0)}
.wcard.y{background:linear-gradient(135deg,rgba(255,200,0,.07),rgba(255,200,0,.02));border-color:rgba(255,200,0,.18)}
.wcard.y::before{background:linear-gradient(90deg,var(--gold),var(--orange))}
.wcard.p::before{background:linear-gradient(90deg,var(--purple),var(--red))}
.wcard-l{font-size:10px;font-weight:700;letter-spacing:.8px;text-transform:uppercase;margin-bottom:10px}
.wcard.g .wcard-l{color:var(--green)}.wcard.y .wcard-l{color:var(--gold)}.wcard.p .wcard-l{color:rgba(255,255,255,.5)}
.wcard-v{font-family:'Bebas Neue',sans-serif;font-size:34px;letter-spacing:.5px;margin-bottom:4px}
.wcard.g .wcard-v{color:var(--green)}.wcard.y .wcard-v{color:var(--gold)}.wcard.p .wcard-v{color:#fff}
.wcard-sub{font-size:11px;color:var(--muted);margin-bottom:14px}
.wbtn{width:100%;background:var(--green);color:#000;border:none;border-radius:10px;padding:10px;font-size:13px;font-weight:800;cursor:pointer}
.wbtn:disabled{opacity:.35;cursor:not-allowed}
.dash-page{padding:20px 16px;padding-bottom:80px}
.kpis{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:20px}
.kpi{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:16px;position:relative;overflow:hidden}
.kpi::before{content:'';position:absolute;top:0;left:0;right:0;height:2px}
.kpi.r::before{background:linear-gradient(90deg,var(--red),#ff6b35)}
.kpi.g::before{background:linear-gradient(90deg,var(--green),#00c8a0)}
.kpi.y::before{background:linear-gradient(90deg,var(--gold),var(--orange))}
.kpi.b::before{background:linear-gradient(90deg,var(--blue),var(--purple))}
.kpi-l{font-size:9px;font-weight:700;letter-spacing:.7px;color:var(--muted);text-transform:uppercase;margin-bottom:8px}
.kpi-v{font-family:'Bebas Neue',sans-serif;font-size:28px;letter-spacing:.5px;margin-bottom:3px}
.kpi.r .kpi-v{color:var(--red)}.kpi.g .kpi-v{color:var(--green)}.kpi.y .kpi-v{color:var(--gold)}.kpi.b .kpi-v{color:var(--blue)}
.kpi-ch{font-size:11px;color:var(--green)}
.panel{background:var(--card);border:1px solid var(--line);border-radius:14px;overflow:hidden;margin-bottom:16px}
.panel-hd{padding:14px 16px;border-bottom:1px solid var(--line);display:flex;align-items:center;justify-content:space-between}
.panel-title{font-family:'Bebas Neue',sans-serif;font-size:16px;letter-spacing:.5px}
.auth-wrap{min-height:calc(100vh - 56px);display:flex;align-items:center;justify-content:center;padding:20px 16px;background:radial-gradient(ellipse 80% 60% at 50% 40%,rgba(124,58,237,.1),transparent 70%)}
.auth-box{background:rgba(13,13,32,.96);border:1px solid var(--line2);border-radius:20px;width:100%;max-width:440px;overflow:hidden;backdrop-filter:blur(20px)}
.profile-page{padding:20px 16px;padding-bottom:80px;max-width:600px}
.profile-avatar{width:80px;height:80px;border-radius:50%;background:linear-gradient(135deg,var(--purple),var(--red));display:flex;align-items:center;justify-content:center;font-size:32px;font-weight:800;margin:0 auto 16px}
.profile-stat{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:14px;text-align:center}
.profile-stat-v{font-family:'Bebas Neue',sans-serif;font-size:24px;color:var(--green)}
.profile-stat-l{font-size:11px;color:var(--muted);margin-top:2px}
.leaderboard-page{padding:20px 16px;padding-bottom:80px}
.lb-row{display:flex;align-items:center;gap:12px;padding:12px 16px;border-bottom:1px solid var(--line);transition:background .15s}
.lb-row:hover{background:rgba(255,255,255,.02)}
.lb-row:last-child{border-bottom:none}
.lb-rank{font-family:'Bebas Neue',sans-serif;font-size:22px;width:32px;text-align:center;flex-shrink:0}
.lb-av{width:38px;height:38px;border-radius:50%;background:linear-gradient(135deg,var(--purple),var(--red));display:flex;align-items:center;justify-content:center;font-size:15px;font-weight:800;flex-shrink:0}
.lb-name{font-size:14px;font-weight:600;margin-bottom:2px}
.lb-role{font-size:11px;color:var(--muted)}
.lb-coins{font-family:'Bebas Neue',sans-serif;font-size:20px;color:var(--gold);margin-left:auto;flex-shrink:0}
.fi{width:100%;background:var(--ink3);border:1px solid var(--line2);border-radius:12px;padding:12px 14px;color:#fff;font-size:14px;outline:none;margin-bottom:12px;transition:border-color .2s}
.fi:focus{border-color:rgba(124,58,237,.5)}
.fi::placeholder{color:var(--muted)}
.toast{position:fixed;bottom:72px;right:16px;left:16px;background:linear-gradient(135deg,rgba(0,245,160,.14),rgba(0,245,160,.06));border:1px solid rgba(0,245,160,.25);border-radius:12px;padding:12px 16px;font-size:14px;font-weight:600;color:var(--green);z-index:9999;display:flex;align-items:center;gap:8px;animation:toastIn .3s ease;text-align:center;justify-content:center}
.spinner{width:20px;height:20px;border:2px solid rgba(255,255,255,.2);border-top-color:#fff;border-radius:50%;animation:spin 0.8s linear infinite;margin:0 auto}
.error-msg{background:rgba(255,45,85,.1);border:1px solid rgba(255,45,85,.3);color:var(--red);border-radius:10px;padding:12px 16px;font-size:13px;margin-bottom:14px}
.success-msg{background:rgba(0,245,160,.1);border:1px solid rgba(0,245,160,.3);color:var(--green);border-radius:10px;padding:12px 16px;font-size:13px;margin-bottom:14px}
.modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,.82);z-index:400;display:flex;align-items:center;justify-content:center;padding:20px;backdrop-filter:blur(6px)}
.modal-box{background:var(--ink2);border:1px solid var(--line2);border-radius:20px;width:100%;max-width:440px;padding:28px;animation:fadeUp .22s ease}
.modal-title{font-family:'Bebas Neue',sans-serif;font-size:30px;letter-spacing:1px;margin-bottom:4px}
.modal-sub{font-size:13px;color:var(--muted);margin-bottom:22px}
.select-fi{width:100%;background:var(--ink3);border:1px solid var(--line2);border-radius:12px;padding:12px 14px;color:#fff;font-size:14px;outline:none;margin-bottom:12px;cursor:pointer;-webkit-appearance:none;appearance:none}
.select-fi:focus{border-color:rgba(124,58,237,.5)}
.live-banner{display:flex;align-items:center;gap:10px;background:linear-gradient(135deg,rgba(255,45,85,.1),rgba(255,45,85,.04));border:1px solid rgba(255,45,85,.25);border-radius:14px;padding:14px 18px;margin-bottom:18px}
.live-dot{width:10px;height:10px;background:var(--red);border-radius:50%;animation:pulse 2s infinite;flex-shrink:0}
.section-sep{display:flex;align-items:center;gap:10px;margin:18px 0 14px}
.section-sep-line{flex:1;height:1px;background:var(--line)}
.section-sep-label{font-size:10px;font-weight:700;letter-spacing:.8px;color:var(--muted);text-transform:uppercase;white-space:nowrap}
@media(min-width:768px){
  .nav{padding:0 36px;height:62px}
  .logo{font-size:28px}
  .nl{font-size:14px;padding:8px 16px}
  .coin-badge{font-size:13px;padding:7px 16px}
  .mode-btn{font-size:12px;padding:5px 14px}
  .page{padding-top:62px}
  .bottom-nav{display:none !important}
  .disc-page{padding:32px 40px}
  .disc-hero{padding:44px}
  .sg{grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:16px}
  .slayout{display:grid;grid-template-columns:1fr 320px;height:calc(100vh - 62px);flex-direction:unset;padding-bottom:0}
  .sleft{display:flex;flex-direction:column;overflow:hidden}
  .splayer{aspect-ratio:16/9}
  .sbelow{flex:1;overflow-y:auto;padding:20px 24px;border-right:1px solid var(--line)}
  .chat-section{display:none}
  .chat-panel-desktop{display:flex !important;flex-direction:column;border-left:1px solid var(--line);background:var(--ink2)}
  .wallet-page{padding:32px 44px;max-width:980px}
  .wcards{grid-template-columns:repeat(3,1fr)}
  .dash-page{padding:32px 44px}
  .kpis{grid-template-columns:repeat(4,1fr)}
  .toast{left:auto;right:28px;bottom:28px;text-align:left;justify-content:flex-start}
  .auth-wrap{padding:40px}
  .profile-page{padding:32px 44px;margin:0 auto}
  .leaderboard-page{padding:32px 44px;max-width:700px}
}
@media(max-width:767px){
  .bottom-nav{display:block}
  .nav-c{display:none}
  .chat-panel-desktop{display:none}
  .hero{padding:30px 16px;min-height:calc(100vh - 56px)}
}
`;

export default function App() {
  const [page, setPage] = useState("land");
  const [mode, setMode] = useState("viewer");
  const [role, setRole] = useState("viewer");
  const [cat, setCat] = useState("All");
  const [search, setSearch] = useState("");
  const [stream, setStream] = useState(DEMO_STREAMS[0]);
  const [coins, setCoins] = useState(0);
  const [sess, setSess] = useState(0);
  const [chat, setChat] = useState([]);
  const [msg, setMsg] = useState("");
  const [following, setFollowing] = useState(false);
  const [toast, setToast] = useState(null);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState("");
  const [authMode, setAuthMode] = useState("signup");
  const [formData, setFormData] = useState({ fullName: "", email: "", password: "" });
  const [editProfile, setEditProfile] = useState({ fullName: "", username: "", bio: "" });
  const [profileMsg, setProfileMsg] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loadingLb, setLoadingLb] = useState(false);

  // Go Live state
  const [showGoLive, setShowGoLive] = useState(false);
  const [goLiveForm, setGoLiveForm] = useState({ title: "", category: "Gaming" });
  const [isStreaming, setIsStreaming] = useState(false);
  const [savingGoLive, setSavingGoLive] = useState(false);
  const [loadingFollow, setLoadingFollow] = useState(false);
  const [showSignupPrompt, setShowSignupPrompt] = useState(false);

  // Real streams from Supabase
  const [liveStreams, setLiveStreams] = useState([]);

  const chatRef = useRef(null);   // mobile chat
  const chatRef2 = useRef(null);  // desktop panel
  const coinsRef = useRef(0);     // always-current coin value for intervals

  // Keep coinsRef in sync with state
  useEffect(() => { coinsRef.current = coins; }, [coins]);

  // Auth init + streams subscription
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) { setUser(session.user); fetchProfile(session.user.id); setPage("disc"); }
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) { setUser(session.user); fetchProfile(session.user.id); }
      else { setUser(null); setProfile(null); setCoins(0); coinsRef.current = 0; }
    });

    // Fetch and subscribe to live streams
    fetchLiveStreams();
    const streamCh = supabase.channel("live-streams")
      .on("postgres_changes", { event: "*", schema: "public", table: "streams" }, () => {
        fetchLiveStreams();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
      supabase.removeChannel(streamCh);
    };
  }, []);

  const fetchProfile = async (userId) => {
    const { data } = await supabase.from("profiles").select("*").eq("id", userId).single();
    if (data) {
      setProfile(data);
      const c = data.coins || 0;
      setCoins(c);
      coinsRef.current = c;
      setMode(data.role || "viewer");
      setEditProfile({ fullName: data.full_name || "", username: data.username || "", bio: data.bio || "" });
    }
    return data;
  };

  const fetchLeaderboard = async () => {
    setLoadingLb(true);
    // Only show viewers — streamers are never on the leaderboard
    const { data } = await supabase
      .from("profiles")
      .select("id,full_name,username,role,coins")
      .eq("role", "viewer")
      .order("coins", { ascending: false })
      .limit(20);
    if (data) setLeaderboard(data);
    setLoadingLb(false);
  };

  const fetchLiveStreams = async () => {
    const { data } = await supabase
      .from("streams")
      .select("*, profiles(full_name, username)")
      .eq("status", "live")
      .order("viewer_count", { ascending: false });
    if (data) setLiveStreams(data);
  };

  // Retry username generation until unique
  const generateUniqueUsername = async (baseName) => {
    const base = baseName.toLowerCase().replace(/\s+/g, "").replace(/[^a-z0-9]/g, "") || "user";
    for (let i = 0; i < 5; i++) {
      const username = `${base}${Math.floor(Math.random() * 9999)}`;
      const { data } = await supabase.from("profiles").select("id").eq("username", username).maybeSingle();
      if (!data) return username;
    }
    return `${base}${Date.now()}`; // fallback: guaranteed unique
  };

  const checkIsStreaming = async (userId) => {
    const { data } = await supabase
      .from("streams")
      .select("*")
      .eq("user_id", userId)
      .eq("status", "live")
      .maybeSingle();
    if (data) {
      setIsStreaming(true);
      setGoLiveForm({ title: data.title, category: data.category });
    } else {
      setIsStreaming(false);
    }
  };

  const checkFollowing = async (streamObj) => {
    if (!user || !streamObj?.isRealStream || !streamObj?.user_id) { setFollowing(false); return; }
    const { data } = await supabase
      .from("follows")
      .select("id")
      .eq("follower_id", user.id)
      .eq("following_id", streamObj.user_id)
      .maybeSingle();
    setFollowing(!!data);
  };

  // Coin earning — no DB writes here (debounced separately below)
  useEffect(() => {
    if (page !== "stream") return;
    const t = setInterval(() => {
      setSess(s => s + 1);
      setCoins(c => c + 1);
    }, 900);
    return () => clearInterval(t);
  }, [page]);

  // Sync earned coins to Supabase every 15s while watching
  useEffect(() => {
    if (page !== "stream" || !user) return;
    const syncT = setInterval(() => {
      supabase.from("profiles").update({ coins: coinsRef.current }).eq("id", user.id);
    }, 15000);
    return () => {
      clearInterval(syncT);
      // Save final balance when leaving stream
      supabase.from("profiles").update({ coins: coinsRef.current }).eq("id", user.id);
    };
  }, [page, user]);

  // Viewer count: increment on enter, decrement on leave (real streams only)
  useEffect(() => {
    if (page !== "stream" || !stream?.isRealStream) return;
    supabase.rpc("increment_viewer_count", { stream_id: stream.id });
    return () => { supabase.rpc("decrement_viewer_count", { stream_id: stream.id }); };
  }, [page, stream?.id, stream?.isRealStream]);

  // Real-time viewer count update on the stream page itself
  useEffect(() => {
    if (page !== "stream" || !stream?.isRealStream) return;
    const ch = supabase.channel(`stream-view-${stream.id}`)
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "streams", filter: `id=eq.${stream.id}` }, (payload) => {
        setStream(s => ({ ...s, viewers: payload.new.viewer_count }));
      })
      .subscribe();
    return () => supabase.removeChannel(ch);
  }, [page, stream?.id, stream?.isRealStream]);

  // Check follow status whenever we enter a stream (reset first, then query DB)
  useEffect(() => {
    setFollowing(false);
    if (page === "stream") checkFollowing(stream);
  }, [page, stream?.id, user?.id]);

  // Real-time chat subscription
  useEffect(() => {
    if (page !== "stream" || !stream?.id) return;
    const loadMessages = async () => {
      const { data } = await supabase
        .from("messages")
        .select("*")
        .eq("stream_id", stream.id)
        .order("created_at", { ascending: true })
        .limit(50);
      if (data) setChat(data.map(m => ({
        a: m.username,
        t: m.content,
        c: m.color || "#ff2d55",
        sc: m.is_superchat,
        amt: m.coins_spent ? `${m.coins_spent.toLocaleString()} coins` : null,
      })));
    };
    loadMessages();
    const channel = supabase.channel(`stream-${stream.id}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages", filter: `stream_id=eq.${stream.id}` }, (payload) => {
        const m = payload.new;
        setChat(l => [...l, {
          a: m.username, t: m.content, c: m.color || "#ff2d55",
          sc: m.is_superchat, amt: m.coins_spent ? `${m.coins_spent.toLocaleString()} coins` : null,
        }]);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [page, stream?.id]);

  // Auto-scroll both chat panels
  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
    if (chatRef2.current) chatRef2.current.scrollTop = chatRef2.current.scrollHeight;
  }, [chat]);

  // Load leaderboard when navigating there
  useEffect(() => {
    if (page === "leaderboard") fetchLeaderboard();
    if (page === "dash" && user) checkIsStreaming(user.id);
  }, [page, user]);

  const handleSignUp = async () => {
    if (!formData.fullName || !formData.email || !formData.password) { setAuthError("Please fill in all fields"); return; }
    setLoading(true); setAuthError("");
    const { data, error } = await supabase.auth.signUp({ email: formData.email, password: formData.password });
    if (error) { setAuthError(error.message); setLoading(false); return; }
    if (data.user) {
      const username = await generateUniqueUsername(formData.fullName);
      const { error: pe } = await supabase.from("profiles").insert({
        id: data.user.id, full_name: formData.fullName, username, role, coins: 1000, total_earned: 0, bio: "", follower_count: 0,
      });
      if (pe) {
        // Profile creation failed — roll back auth
        await supabase.auth.signOut();
        setAuthError("Account setup failed — username conflict. Please try again.");
        setLoading(false);
        return;
      }
      setProfile({ id: data.user.id, full_name: formData.fullName, username, role, coins: 1000 });
      setCoins(1000);
      coinsRef.current = 1000;
      setMode(role);
      setEditProfile({ fullName: formData.fullName, username, bio: "" });
      notify("Welcome to STEM! You got 1,000 bonus coins!");
      go(role === "streamer" ? "dash" : "disc");
    }
    setLoading(false);
  };

  const handleLogin = async () => {
    if (!formData.email || !formData.password) { setAuthError("Please enter your email and password"); return; }
    setLoading(true); setAuthError("");
    const { data, error } = await supabase.auth.signInWithPassword({ email: formData.email, password: formData.password });
    if (error) { setAuthError(error.message); setLoading(false); return; }
    if (data.user) {
      // Use the returned profile data directly — don't rely on stale mode state
      const profileData = await fetchProfile(data.user.id);
      notify("Welcome back!");
      go(profileData?.role === "streamer" ? "dash" : "disc");
    }
    setLoading(false);
  };

  const handleForgotPassword = async () => {
    if (!formData.email) { setAuthError("Enter your email address first"); return; }
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(formData.email, { redirectTo: "https://www.stemapp.online/reset-password" });
    if (error) { setAuthError(error.message); } else { notify("Password reset email sent!"); }
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setPage("land"); setUser(null); setProfile(null); setCoins(0); coinsRef.current = 0; setIsStreaming(false);
    notify("Logged out successfully");
  };

  const handleSaveProfile = async () => {
    if (!editProfile.fullName || !editProfile.username) { setProfileMsg("Please fill in all fields"); return; }
    setSavingProfile(true); setProfileMsg("");
    const { error } = await supabase.from("profiles").update({
      full_name: editProfile.fullName, username: editProfile.username, bio: editProfile.bio,
    }).eq("id", user.id);
    if (error) { setProfileMsg(error.message); }
    else {
      setProfile(p => ({ ...p, full_name: editProfile.fullName, username: editProfile.username, bio: editProfile.bio }));
      setProfileMsg("success");
      notify("Profile updated!");
    }
    setSavingProfile(false);
  };

  const handleFollow = async () => {
    if (!requireAuth()) return;
    setLoadingFollow(true);
    try {
      if (stream?.isRealStream && stream?.user_id) {
        // Persist to DB for real streams
        if (following) {
          await supabase.from("follows").delete()
            .eq("follower_id", user.id)
            .eq("following_id", stream.user_id);
          setFollowing(false);
          notify("Unfollowed");
        } else {
          const { error } = await supabase.from("follows").insert({
            follower_id: user.id, following_id: stream.user_id,
          });
          if (!error) {
            setFollowing(true);
            const nc = coinsRef.current + 50;
            setCoins(nc); coinsRef.current = nc;
            supabase.from("profiles").update({ coins: nc }).eq("id", user.id);
            notify("+50 coins for following!");
          }
        }
      } else {
        // Demo stream — local state only
        if (following) {
          setFollowing(false); notify("Unfollowed");
        } else {
          setFollowing(true);
          const nc = coinsRef.current + 50;
          setCoins(nc); coinsRef.current = nc;
          supabase.from("profiles").update({ coins: nc }).eq("id", user.id);
          notify("+50 coins for following!");
        }
      }
    } finally {
      setLoadingFollow(false);
    }
  };

  const sendChat = async () => {
    if (!requireAuth()) return;
    if (!msg.trim()) return;
    const nc = coinsRef.current + 10;
    await supabase.from("messages").insert({
      stream_id: stream.id, user_id: user.id,
      username: profile.full_name?.split(" ")[0] || profile.username || "User",
      content: msg.trim(), color: "#ff2d55", is_superchat: false, coins_spent: 0,
    });
    setCoins(nc); coinsRef.current = nc;
    supabase.from("profiles").update({ coins: nc }).eq("id", user.id);
    setMsg(""); notify("+10 coins!");
  };

  const sendGift = async (name, cost) => {
    if (!requireAuth()) return;
    const c = parseInt(cost.replace(/,/g, ""));
    if (coinsRef.current < c) { notify("Not enough coins!"); return; }
    const nc = coinsRef.current - c;
    setCoins(nc); coinsRef.current = nc;
    supabase.from("profiles").update({ coins: nc }).eq("id", user.id);
    await supabase.from("messages").insert({
      stream_id: stream.id, user_id: user.id,
      username: profile.full_name?.split(" ")[0] || profile.username || "User",
      content: `Sent a ${name}!`, color: "#ffc800", is_superchat: true, coins_spent: c,
    });
    notify(`${name} sent! 🎁`);
  };

  const handleGoLive = async () => {
    if (!goLiveForm.title.trim()) { notify("Enter a stream title first!"); return; }
    setSavingGoLive(true);
    const { error } = await supabase.from("streams").upsert({
      user_id: user.id,
      title: goLiveForm.title.trim(),
      category: goLiveForm.category,
      status: "live",
      streamer_name: profile?.full_name || profile?.username || "Streamer",
      viewer_count: 0,
      updated_at: new Date().toISOString(),
    }, { onConflict: "user_id" });
    if (error) { notify("Error going live — check Supabase tables"); console.error(error); }
    else { setIsStreaming(true); setShowGoLive(false); notify("You are LIVE! Viewers can see you now."); }
    setSavingGoLive(false);
  };

  const handleEndStream = async () => {
    const { error } = await supabase.from("streams").update({ status: "offline", updated_at: new Date().toISOString() }).eq("user_id", user.id);
    if (!error) { setIsStreaming(false); notify("Stream ended."); }
  };

  const switchMode = async (newMode) => {
    setMode(newMode);
    if (profile && user) {
      await supabase.from("profiles").update({ role: newMode }).eq("id", user.id);
      setProfile(p => ({ ...p, role: newMode }));
      notify(`Switched to ${newMode === "viewer" ? "Viewer" : "Streamer"} mode!`);
    }
    // Redirect off pages that don't belong to the new mode
    if (newMode === "streamer" && (page === "leaderboard" || page === "stream")) go("dash");
    if (newMode === "viewer" && page === "dash") go("disc");
  };

  const notify = (m) => { setToast(m); setTimeout(() => setToast(null), 2600); };

  // Pages that require an account
  const PROTECTED = ["wallet", "dash", "profile", "leaderboard"];

  const go = (p, s = null) => {
    if (!user && PROTECTED.includes(p)) { setAuthMode("signup"); setPage("auth"); return; }
    if (s) setStream(s);
    if (p === "stream") setSess(0);
    setPage(p);
    window.scrollTo(0, 0);
  };

  // Shows the signup popup for in-stream gated actions (chat, gifts, follow)
  const requireAuth = () => {
    if (!user) { setShowSignupPrompt(true); return false; }
    return true;
  };

  const formatDbStream = (s) => {
    const meta = CAT_META[s.category] || CAT_META["Just Chatting"];
    return {
      id: s.id,
      user_id: s.user_id,
      title: s.title,
      streamer: s.profiles?.full_name || s.streamer_name || "Streamer",
      game: s.category || "Just Chatting",
      viewers: s.viewer_count || 0,
      emoji: meta.emoji,
      color: meta.color,
      bg: meta.bg,
      isRealStream: true,
    };
  };

  const allStreams = [...liveStreams.map(formatDbStream), ...DEMO_STREAMS];

  const filteredStreams = allStreams.filter(s => {
    const matchCat = cat === "All" || s.game === cat || s.game.includes(cat);
    const matchSearch = search === "" ||
      s.title.toLowerCase().includes(search.toLowerCase()) ||
      s.streamer.toLowerCase().includes(search.toLowerCase()) ||
      s.game.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const isApp = ["disc", "stream", "wallet", "dash", "profile", "leaderboard"].includes(page);
  const firstName = profile?.full_name?.split(" ")[0] || "";
  const initials = profile?.full_name?.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) || "?";
  const rankColor = (i) => i === 0 ? "var(--gold)" : i === 1 ? "rgba(255,255,255,.6)" : i === 2 ? "#cd7f32" : "var(--muted)";
  const rankEmoji = (i) => i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}`;

  const ChatMessages = () => (
    <>
      {chat.length === 0 && (
        <div style={{ fontSize: 12, color: "var(--muted)", textAlign: "center", padding: "12px 0" }}>
          {user ? "Be first to chat! +10 coins per message" : "Sign in to chat and earn coins"}
        </div>
      )}
      {chat.map((m, i) => (
        <div key={i} className={`cmsg ${m.sc ? "sc" : ""}`}>
          {m.sc && <div style={{ fontSize: 10, color: "var(--gold)", fontWeight: 700, marginBottom: 3 }}>🪙 {m.amt}</div>}
          <div className="cmsg-a" style={{ color: m.c }}>{m.a}</div>
          <div className="cmsg-t">{m.t}</div>
        </div>
      ))}
    </>
  );

  return (<>
    <style>{FONTS}</style><style>{CSS}</style>

    {/* NAV */}
    <nav className="nav">
      <div className="logo" onClick={() => go("disc")}>STEM</div>
      <div className="nav-c">
        {user ? (
          // Logged-in nav links
          (mode === "viewer"
            ? [["disc", "Discover"], ["leaderboard", "Top Earners"], ["wallet", "Wallet"], ["profile", "Profile"]]
            : [["disc", "Discover"], ["dash", "Dashboard"], ["profile", "Profile"]]
          ).map(([p, l]) => (
            <button key={p} className={`nl ${page === p ? "on" : ""}`} onClick={() => go(p)}>{l}</button>
          ))
        ) : (
          // Guest nav — just Discover
          <button className={`nl ${page === "disc" || page === "stream" ? "on" : ""}`} onClick={() => go("disc")}>Discover</button>
        )}
      </div>
      <div className="nav-r">
        {user && isApp && <>
          <div className="mode-toggle">
            <button className={`mode-btn ${mode === "viewer" ? "on" : ""}`} onClick={() => switchMode("viewer")}>👁</button>
            <button className={`mode-btn ${mode === "streamer" ? "on" : ""}`} onClick={() => switchMode("streamer")}>🎙</button>
          </div>
          <div className="coin-badge" onClick={() => go("wallet")}>🪙 {coins.toLocaleString()}</div>
          <div className="av" onClick={() => go("profile")}>{initials}</div>
        </>}
        {!user && <>
          <button className="btn-o" onClick={() => { setAuthMode("login"); go("auth"); }}>Log in</button>
          <button className="btn-g" onClick={() => { setAuthMode("signup"); go("auth"); }}>Sign up</button>
        </>}
      </div>
    </nav>

    {/* MOBILE BOTTOM NAV — logged-in only */}
    {isApp && user && (
      <div className="bottom-nav">
        <div className="bottom-nav-items">
          {(mode === "viewer"
            ? [["disc", "🔍", "Discover"], ["leaderboard", "🏆", "Top"], ["wallet", "🪙", "Wallet"], ["profile", "👤", "Profile"]]
            : [["disc", "🔍", "Discover"], ["dash", "📊", "Dashboard"], ["profile", "👤", "Profile"]]
          ).map(([p, icon, l]) => (
            <button key={p} className={`bn-item ${page === p ? "on" : ""}`} onClick={() => go(p)}>
              <span className="bn-icon">{icon}</span>
              <span className="bn-label">{l}</span>
            </button>
          ))}
        </div>
      </div>
    )}

    {/* LANDING */}
    {page === "land" && <div style={{ paddingTop: 56 }}>
      <div className="hero">
        <div className="hero-mesh" /><div className="hero-grid" /><div className="hero-orb1" /><div className="hero-orb2" />
        <div className="hero-content">
          <div className="hero-eyebrow"><span className="eyebrow-dot" />World's First Viewer-Paid Platform</div>
          <h1 className="hero-h"><span className="l1">WATCH LIVE.</span><span className="l2">GET PAID.</span></h1>
          <p className="hero-p">The first streaming platform to pay <strong>both streamers AND viewers</strong> in real money. Every ad. Every hour. Every clip.</p>
          <div className="hero-btns">
            <button className="btn-g" style={{ padding: "12px 24px", fontSize: 15 }} onClick={() => { setAuthMode("signup"); go("auth"); }}>Start Earning Free</button>
            <button className="btn-o" style={{ padding: "11px 24px", fontSize: 15 }} onClick={() => go("disc")}>Browse Streams →</button>
          </div>
          <div style={{ marginBottom: 12 }}>
            <button className="btn-o" style={{ padding: "9px 20px", fontSize: 13, opacity: .7 }} onClick={() => { setRole("streamer"); setAuthMode("signup"); go("auth"); }}>I am a Streamer</button>
          </div>
          <div className="hero-stats">
            {[["2,841", "Streams live"], ["$48K", "Paid today"], ["127K", "Earning"]].map(([v, l]) => (
              <div key={l} className="hstat"><div className="hstat-v">{v}</div><div className="hstat-l">{l}</div></div>
            ))}
          </div>
        </div>
      </div>
    </div>}

    {/* AUTH */}
    {page === "auth" && <div className="auth-wrap page">
      <div className="auth-box">
        <div style={{ padding: "24px 24px 0", borderBottom: "1px solid var(--line)" }}>
          <div style={{ fontFamily: "Bebas Neue,sans-serif", fontSize: 20, letterSpacing: 2, background: "linear-gradient(90deg,var(--purple),var(--red))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", marginBottom: 6 }}>STEM</div>
          <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 4 }}>{authMode === "signup" ? "Create account" : "Welcome back"}</div>
          <div style={{ fontSize: 13, color: "var(--muted)", paddingBottom: 20 }}>{authMode === "signup" ? "Start earning free — no card needed." : "Continue your earning streak."}</div>
        </div>
        <div style={{ display: "flex", padding: "0 24px", borderBottom: "1px solid var(--line)" }}>
          {["signup", "login"].map(m => (
            <button key={m} onClick={() => { setAuthMode(m); setAuthError(""); }} style={{ flex: 1, background: "none", border: "none", borderBottom: authMode === m ? "2px solid var(--red)" : "2px solid transparent", color: authMode === m ? "#fff" : "var(--muted)", fontSize: 14, fontWeight: 600, padding: "11px 0", cursor: "pointer" }}>
              {m === "signup" ? "Sign Up" : "Log In"}
            </button>
          ))}
        </div>
        <div style={{ padding: "22px 24px 26px" }}>
          {authError && <div className="error-msg">{authError}</div>}
          {authMode === "signup" && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 18 }}>
              {[["viewer", "👁", "Viewer", "Watch and earn"], ["streamer", "🎙", "Streamer", "Stream and earn"]].map(([r, ic, ti, su]) => (
                <div key={r} onClick={() => setRole(r)} style={{ background: role === r ? "rgba(124,58,237,.1)" : "var(--ink3)", border: role === r ? "2px solid var(--purple)" : "2px solid var(--line)", borderRadius: 12, padding: 14, textAlign: "center", cursor: "pointer", transition: "all .2s" }}>
                  <div style={{ fontSize: 26, marginBottom: 8 }}>{ic}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 2 }}>{ti}</div>
                  <div style={{ fontSize: 11, color: "var(--muted)" }}>{su}</div>
                </div>
              ))}
            </div>
          )}
          {authMode === "signup" && <input className="fi" placeholder="Full Name" value={formData.fullName} onChange={e => setFormData({ ...formData, fullName: e.target.value })} />}
          <input className="fi" type="email" placeholder="Email address" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
          <input className="fi" type="password" placeholder="Password (min 6 chars)" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} />
          {authMode === "login" && (
            <div style={{ textAlign: "right", marginBottom: 12, marginTop: -6 }}>
              <button onClick={handleForgotPassword} style={{ background: "none", border: "none", color: "var(--muted)", fontSize: 12, cursor: "pointer", textDecoration: "underline" }}>Forgot password?</button>
            </div>
          )}
          <button onClick={authMode === "signup" ? handleSignUp : handleLogin} disabled={loading} style={{ width: "100%", background: "linear-gradient(135deg,var(--purple),var(--red))", color: "#fff", border: "none", borderRadius: 12, padding: 13, fontSize: 15, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1 }}>
            {loading ? <div className="spinner" /> : authMode === "signup" ? (role === "streamer" ? "Start Streaming" : "Start Earning") : "Log In"}
          </button>
          <div style={{ textAlign: "center", marginTop: 14, fontSize: 13, color: "var(--muted)" }}>
            {authMode === "signup" ? "Already have an account? " : "New to STEM? "}
            <button onClick={() => { setAuthMode(authMode === "signup" ? "login" : "signup"); setAuthError(""); }} style={{ background: "none", border: "none", color: "var(--red)", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
              {authMode === "signup" ? "Log in" : "Sign up free"}
            </button>
          </div>
        </div>
      </div>
    </div>}

    {/* DISCOVER */}
    {page === "disc" && <div className="disc-page page">
      {/* Guest banner — Twitch/Kick style: watch free, sign up to earn */}
      {!user && (
        <div style={{ display: "flex", alignItems: "center", gap: 14, background: "linear-gradient(135deg,rgba(124,58,237,.14),rgba(255,45,85,.10))", border: "1px solid rgba(124,58,237,.25)", borderRadius: 14, padding: "14px 18px", marginBottom: 18, flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 3 }}>🪙 Watch streams and earn real money</div>
            <div style={{ fontSize: 12, color: "var(--muted)" }}>Create a free account to earn coins while watching, chat, and withdraw cash.</div>
          </div>
          <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
            <button className="btn-o" style={{ padding: "8px 16px", fontSize: 13 }} onClick={() => { setAuthMode("login"); go("auth"); }}>Log in</button>
            <button className="btn-g" style={{ padding: "8px 16px", fontSize: 13 }} onClick={() => { setAuthMode("signup"); go("auth"); }}>Sign Up Free</button>
          </div>
        </div>
      )}
      <div className="disc-hero">
        <h1><span>Watch Live.</span> {user ? "Earn Real Money." : "Stream for Free."}</h1>
        <p>{firstName ? `Welcome back ${firstName}! ` : ""}Every stream earns you coins. Every coin converts to real cash.</p>
        <div className="dpills">
          {[["🔴", String(liveStreams.length + DEMO_STREAMS.length), "live now"], user ? ["🪙", coins.toLocaleString(), "your coins"] : ["🪙", "FREE", "to join"], ["💸", "$48K", "paid today"]].map(([icon, v, l]) => (
            <div key={l} className="dpill"><span className="dpill-icon">{icon}</span><div><div className="dpill-v">{v}</div><div className="dpill-l">{l}</div></div></div>
          ))}
        </div>
      </div>
      <div className="search-bar">
        <input className="search-input" placeholder="🔍 Search streams, games, streamers..." value={search} onChange={e => setSearch(e.target.value)} />
        {search && <button onClick={() => setSearch("")} style={{ background: "var(--ink3)", border: "1px solid var(--line2)", color: "var(--muted)", borderRadius: 10, padding: "0 14px", cursor: "pointer", fontSize: 13 }}>Clear</button>}
      </div>
      <div className="cats">{CATS.map(c => <button key={c} className={`cat ${cat === c ? "on" : ""}`} onClick={() => setCat(c)}>{c}</button>)}</div>
      {liveStreams.length > 0 && !search && cat === "All" && (
        <div className="live-banner">
          <div className="live-dot" />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 700 }}>{liveStreams.length} streamer{liveStreams.length !== 1 ? "s" : ""} live right now</div>
            <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>Real streams from STEM creators — appearing at the top</div>
          </div>
        </div>
      )}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <span style={{ fontFamily: "Bebas Neue,sans-serif", fontSize: 18, letterSpacing: .5 }}>
          {search ? `Results for "${search}"` : "🔴 Live Now"}
        </span>
        <span style={{ fontSize: 12, color: "var(--muted)" }}>{filteredStreams.length} streams</span>
      </div>
      {filteredStreams.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 20px", color: "var(--muted)" }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
          <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 6 }}>No streams found</div>
          <div style={{ fontSize: 13 }}>Try a different search or category</div>
        </div>
      ) : (
        <div className="sg">{filteredStreams.map(s => (
          <div key={s.id} className={`sc ${s.isRealStream ? "real" : ""}`} onClick={() => go("stream", s)}>
            <div className="sc-thumb">
              <div className="sc-bg" style={{ background: `linear-gradient(${s.bg})` }} />
              <div className="sc-ov" /><div className="sc-emoji">{s.emoji}</div>
              <div className="sc-badges">
                <span className="lpip"><span className="lpip-dot" />LIVE</span>
                {s.isRealStream && <span style={{ background: "rgba(255,45,85,.8)", color: "#fff", fontSize: 8, fontWeight: 800, padding: "3px 7px", borderRadius: 4 }}>REAL</span>}
                <span className="epip">+4/hr</span>
              </div>
              <div className="sc-viewers">👁 {s.viewers.toLocaleString()}</div>
            </div>
            <div className="sc-body">
              <div className="sc-row">
                <div className="sc-av" style={{ background: s.color }}>{s.emoji}</div>
                <div><div className="sc-title">{s.title}</div><div className="sc-name">{s.streamer}</div></div>
              </div>
              <div style={{ display: "flex", gap: 4 }}><span className="stag">{s.game}</span></div>
            </div>
          </div>
        ))}</div>
      )}
    </div>}

    {/* STREAM */}
    {page === "stream" && stream && <div className="slayout" style={{ paddingTop: 56 }}>
      <div className="sleft">
        <div className="splayer">
          <div className="splayer-inner" style={{ background: `linear-gradient(${stream.bg})` }}>
            <div className="splayer-emoji">{stream.emoji}</div>
            <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
              <span className="lpip" style={{ fontSize: 12, padding: "5px 14px" }}><span className="lpip-dot" />LIVE — {stream.viewers.toLocaleString()}</span>
              <span style={{ fontSize: 12, color: "rgba(255,255,255,.5)" }}>Earning coins while you watch</span>
            </div>
          </div>
        </div>
        <div className="sbelow">
          <div className="stitle">{stream.title}</div>
          <div className="sactions">
            <button className={`abtn ${following ? "flwing" : "flw"}`} onClick={handleFollow} disabled={loadingFollow}>
              {loadingFollow ? "..." : following ? "✓ Following" : "+ Follow"}
            </button>
            <button className="abtn" onClick={() => { navigator.clipboard?.writeText(window.location.href); notify("Link copied!"); }}>Share</button>
            <button className="abtn" onClick={() => notify("Subscribe coming soon!")}>Sub $4.99</button>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 0", borderTop: "1px solid var(--line)", borderBottom: "1px solid var(--line)", marginBottom: 14 }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: stream.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>{stream.emoji}</div>
            <div style={{ flex: 1 }}><div style={{ fontSize: 14, fontWeight: 700 }}>{stream.streamer}</div><div style={{ fontSize: 11, color: "var(--muted)", marginTop: 1 }}>{stream.game} · 24,810 followers</div></div>
          </div>
          {user ? (
            <div className="earn-box">
              <div className="ebox-title">Session Earnings</div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                <div><div className="ebig">+{sess}</div><div style={{ fontSize: 11, color: "var(--muted)", marginTop: 1 }}>coins this session</div></div>
                <div style={{ textAlign: "right" }}><div style={{ fontFamily: "Bebas Neue,sans-serif", fontSize: 24, color: "var(--gold)" }}>🪙 {coins.toLocaleString()}</div><div style={{ fontSize: 10, color: "var(--muted)", marginTop: 1 }}>total balance</div></div>
              </div>
              <div className="ecells">
                <div className="ecell"><div className="ecell-v" style={{ color: "var(--green)" }}>+4/hr</div><div className="ecell-l">Ad share</div></div>
                <div className="ecell"><div className="ecell-v" style={{ color: "var(--gold)" }}>+10</div><div className="ecell-l">Per chat</div></div>
                <div className="ecell"><div className="ecell-v">20K</div><div className="ecell-l">To withdraw</div></div>
              </div>
            </div>
          ) : (
            <div style={{ background: "linear-gradient(135deg,rgba(124,58,237,.10),rgba(255,45,85,.07))", border: "1px solid rgba(124,58,237,.22)", borderRadius: 14, padding: 16, marginBottom: 14, display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ fontSize: 32 }}>🪙</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>Earn coins while you watch</div>
                <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 10 }}>Free account gets you +4 coins/hr, +10 per chat, real cash withdrawals.</div>
                <button className="btn-g" style={{ padding: "8px 18px", fontSize: 13 }} onClick={() => { setAuthMode("signup"); go("auth"); }}>Sign Up Free — Start Earning</button>
              </div>
            </div>
          )}
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: .6, color: "var(--muted)", textTransform: "uppercase", marginBottom: 8 }}>Send a gift</div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {[["🌟", "Star", "1,000"], ["🏆", "Trophy", "5,000"], ["👑", "Crown", "10,000"], ["🚀", "Rocket", "2,500"]].map(([e, n, c]) => (
                <div key={n} className="gift" onClick={() => sendGift(n, c)}><span className="gift-e">{e}</span><div className="gift-c">🪙 {c}</div><div className="gift-n">{n}</div></div>
              ))}
            </div>
          </div>
          {/* Mobile chat */}
          <div className="chat-section">
            <div className="chat-hd"><span className="chat-hd-title">Live Chat</span><span style={{ fontSize: 11, color: "var(--muted)" }}>{stream.viewers.toLocaleString()}</span></div>
            <div className="chat-msgs" ref={chatRef}><ChatMessages /></div>
            <div className="chat-foot">
              {user ? (
                <>
                  <div className="chat-tip">+10 coins per message</div>
                  <div className="chat-row">
                    <input className="chat-in" placeholder="Say something..." value={msg} onChange={e => setMsg(e.target.value)} onKeyDown={e => e.key === "Enter" && sendChat()} />
                    <button className="chat-send" onClick={sendChat}>↑</button>
                  </div>
                </>
              ) : (
                <button onClick={() => setShowSignupPrompt(true)} style={{ width: "100%", background: "linear-gradient(135deg,rgba(124,58,237,.12),rgba(255,45,85,.08))", border: "1px solid rgba(124,58,237,.25)", borderRadius: 10, padding: "11px 14px", color: "rgba(255,255,255,.7)", fontSize: 13, cursor: "pointer", textAlign: "left", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span>Join to chat and earn coins</span>
                  <span style={{ color: "var(--purple)", fontWeight: 700 }}>Sign up →</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      {/* Desktop chat panel — separate ref to fix auto-scroll */}
      <div className="chat-panel-desktop" style={{ display: "none" }}>
        <div style={{ padding: "14px 16px", borderBottom: "1px solid var(--line)", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
          <span style={{ fontFamily: "Bebas Neue,sans-serif", fontSize: 18, letterSpacing: .5 }}>Live Chat</span>
          <span style={{ fontSize: 11, color: "var(--muted)" }}>{stream.viewers.toLocaleString()}</span>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: 12, display: "flex", flexDirection: "column", gap: 8 }} ref={chatRef2}><ChatMessages /></div>
        <div style={{ padding: 12, borderTop: "1px solid var(--line)", flexShrink: 0 }}>
          {user ? (
            <>
              <div style={{ fontSize: 11, color: "var(--green)", fontWeight: 600, marginBottom: 6 }}>+10 coins per message</div>
              <div className="chat-row">
                <input className="chat-in" placeholder="Say something..." value={msg} onChange={e => setMsg(e.target.value)} onKeyDown={e => e.key === "Enter" && sendChat()} />
                <button className="chat-send" onClick={sendChat}>↑</button>
              </div>
            </>
          ) : (
            <button onClick={() => setShowSignupPrompt(true)} style={{ width: "100%", background: "linear-gradient(135deg,rgba(124,58,237,.12),rgba(255,45,85,.08))", border: "1px solid rgba(124,58,237,.25)", borderRadius: 10, padding: "11px 14px", color: "rgba(255,255,255,.7)", fontSize: 13, cursor: "pointer", textAlign: "left", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span>Join to chat and earn coins</span>
              <span style={{ color: "var(--purple)", fontWeight: 700 }}>Sign up →</span>
            </button>
          )}
        </div>
      </div>
    </div>}

    {/* LEADERBOARD — viewers only, no streamers */}
    {page === "leaderboard" && <div className="leaderboard-page page">
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontFamily: "Bebas Neue,sans-serif", fontSize: 36, letterSpacing: 1, marginBottom: 4 }}>Top Earners</div>
        <div style={{ fontSize: 14, color: "var(--muted)" }}>The highest coin earners on STEM — viewers only</div>
      </div>
      {profile && (
        <div style={{ background: "linear-gradient(135deg,rgba(124,58,237,.08),rgba(255,45,85,.06))", border: "1px solid rgba(124,58,237,.2)", borderRadius: 14, padding: "16px 20px", display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
          <div style={{ fontSize: 24 }}>📊</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 2 }}>Your coins</div>
            <div style={{ fontSize: 15, fontWeight: 700 }}>{firstName} — 🪙 {coins.toLocaleString()} coins</div>
            {profile.role === "streamer" && <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>Streamers don't appear on the viewer leaderboard</div>}
          </div>
          <button className="btn-g" onClick={() => go("stream", DEMO_STREAMS[0])}>Earn More</button>
        </div>
      )}
      <div className="panel">
        <div className="panel-hd">
          <span className="panel-title">🏆 Top Viewers</span>
          <button onClick={fetchLeaderboard} style={{ background: "none", border: "none", color: "var(--muted)", fontSize: 12, cursor: "pointer" }}>Refresh</button>
        </div>
        {loadingLb ? (
          <div style={{ padding: 40, textAlign: "center" }}><div className="spinner" style={{ margin: "0 auto" }} /></div>
        ) : (
          leaderboard.length === 0 ? (
            <div style={{ padding: 40, textAlign: "center", color: "var(--muted)", fontSize: 14 }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>🏆</div>
              No data yet — start watching to earn coins!
            </div>
          ) : (
            leaderboard.map((u, i) => (
              <div key={u.id} className="lb-row">
                <div className="lb-rank" style={{ color: rankColor(i) }}>{rankEmoji(i)}</div>
                <div className="lb-av">{u.full_name?.charAt(0) || "?"}</div>
                <div style={{ flex: 1 }}>
                  <div className="lb-name">{u.full_name || "Anonymous"}</div>
                  <div className="lb-role">👁 Viewer · @{u.username}</div>
                </div>
                <div className="lb-coins">🪙 {(u.coins || 0).toLocaleString()}</div>
              </div>
            ))
          )
        )}
      </div>
    </div>}

    {/* WALLET */}
    {page === "wallet" && <div className="wallet-page page">
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontFamily: "Bebas Neue,sans-serif", fontSize: 36, letterSpacing: 1, marginBottom: 4 }}>My Wallet</div>
        <div style={{ fontSize: 14, color: "var(--muted)" }}>Hey {firstName || "there"}! Your coins and earnings.</div>
      </div>
      <div className="wcards">
        <div className="wcard g">
          <div className="wcard-l">Withdrawable Balance</div>
          <div className="wcard-v">${(coins / 1000).toFixed(2)}</div>
          <div className="wcard-sub">{coins.toLocaleString()} coins · {Math.max(0, 20000 - coins).toLocaleString()} more needed</div>
          <button className="wbtn" disabled={coins < 20000} onClick={() => coins >= 20000 && notify("Withdrawal coming soon!")}>
            {coins >= 20000 ? "Withdraw Now" : "Withdraw ($20 min)"}
          </button>
        </div>
        <div className="wcard y">
          <div className="wcard-l">STEM Coins</div>
          <div className="wcard-v">🪙 {coins.toLocaleString()}</div>
          <div className="wcard-sub">1,000 coins = $1.00 · 2% fee</div>
          <button className="wbtn" style={{ background: "var(--gold)" }} onClick={() => go("stream", DEMO_STREAMS[0])}>Earn Coins</button>
        </div>
        <div className="wcard p">
          <div className="wcard-l">Total Earned</div>
          <div className="wcard-v">${(profile?.total_earned || 0).toFixed(2)}</div>
          <div className="wcard-sub">Watching, chatting, referrals</div>
          <button className="wbtn" style={{ background: "linear-gradient(135deg,var(--purple),var(--red))" }} onClick={() => notify("Premium 2x earnings coming soon!")}>Get Premium</button>
        </div>
      </div>
      <div style={{ background: "linear-gradient(135deg,rgba(124,58,237,.08),rgba(255,45,85,.06))", border: "1px solid rgba(124,58,237,.2)", borderRadius: 14, padding: "18px 20px", display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
        <div style={{ fontSize: 26 }}>💡</div>
        <div style={{ flex: 1 }}><div style={{ fontWeight: 700, marginBottom: 3, fontSize: 15 }}>Earn 2x faster with Premium</div><div style={{ fontSize: 13, color: "var(--muted)" }}>$9.99/month — double all your ad earnings.</div></div>
        <button className="btn-g" onClick={() => notify("Premium coming soon!")}>Upgrade</button>
      </div>
    </div>}

    {/* PROFILE */}
    {page === "profile" && <div className="profile-page page">
      <div style={{ fontFamily: "Bebas Neue,sans-serif", fontSize: 36, letterSpacing: 1, marginBottom: 4 }}>My Profile</div>
      <div style={{ fontSize: 14, color: "var(--muted)", marginBottom: 28 }}>Manage your account and view your stats</div>
      <div style={{ textAlign: "center", marginBottom: 28 }}>
        <div className="profile-avatar">{initials}</div>
        <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>{profile?.full_name || "Your Name"}</div>
        <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 8 }}>@{profile?.username || "username"}</div>
        {profile?.bio && <div style={{ fontSize: 13, color: "rgba(255,255,255,.6)", marginBottom: 8, maxWidth: 300, margin: "0 auto 10px" }}>{profile.bio}</div>}
        <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: profile?.role === "streamer" ? "rgba(124,58,237,.1)" : "rgba(0,245,160,.1)", border: profile?.role === "streamer" ? "1px solid rgba(124,58,237,.3)" : "1px solid rgba(0,245,160,.3)", borderRadius: 20, padding: "4px 12px", fontSize: 12, fontWeight: 600, color: profile?.role === "streamer" ? "var(--purple)" : "var(--green)" }}>
          {profile?.role === "streamer" ? "🎙 Streamer" : "👁 Viewer"}
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 28 }}>
        <div className="profile-stat"><div className="profile-stat-v">{coins.toLocaleString()}</div><div className="profile-stat-l">Coins</div></div>
        <div className="profile-stat"><div className="profile-stat-v">${(coins / 1000).toFixed(2)}</div><div className="profile-stat-l">Value</div></div>
        <div className="profile-stat"><div className="profile-stat-v">${(profile?.total_earned || 0).toFixed(2)}</div><div className="profile-stat-l">Earned</div></div>
      </div>
      <div className="panel">
        <div className="panel-hd"><span className="panel-title">Edit Profile</span></div>
        <div style={{ padding: 16 }}>
          {profileMsg === "success" && <div className="success-msg">Profile updated!</div>}
          {profileMsg && profileMsg !== "success" && <div className="error-msg">{profileMsg}</div>}
          <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: .6, color: "var(--muted)", textTransform: "uppercase", marginBottom: 6, display: "block" }}>Full Name</label>
          <input className="fi" placeholder="Your full name" value={editProfile.fullName} onChange={e => setEditProfile({ ...editProfile, fullName: e.target.value })} />
          <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: .6, color: "var(--muted)", textTransform: "uppercase", marginBottom: 6, display: "block" }}>Username</label>
          <input className="fi" placeholder="Your username" value={editProfile.username} onChange={e => setEditProfile({ ...editProfile, username: e.target.value })} />
          <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: .6, color: "var(--muted)", textTransform: "uppercase", marginBottom: 6, display: "block" }}>Bio</label>
          <input className="fi" placeholder="Tell people about yourself..." value={editProfile.bio} onChange={e => setEditProfile({ ...editProfile, bio: e.target.value })} />
          <button onClick={handleSaveProfile} disabled={savingProfile} style={{ width: "100%", background: "linear-gradient(135deg,var(--purple),var(--red))", color: "#fff", border: "none", borderRadius: 12, padding: 13, fontSize: 15, fontWeight: 700, cursor: savingProfile ? "not-allowed" : "pointer", opacity: savingProfile ? 0.7 : 1 }}>
            {savingProfile ? <div className="spinner" /> : "Save Changes"}
          </button>
        </div>
      </div>
      <div className="panel">
        <div className="panel-hd"><span className="panel-title">Account</span></div>
        <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid var(--line)" }}>
            <div><div style={{ fontSize: 14, fontWeight: 600 }}>Email</div><div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>{user?.email}</div></div>
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid var(--line)" }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>Account Type</div>
              <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>{profile?.role === "streamer" ? "Streamer" : "Viewer"} account</div>
            </div>
            <button onClick={() => switchMode(profile?.role === "streamer" ? "viewer" : "streamer")} style={{ background: "var(--ink3)", border: "1px solid var(--line2)", color: "var(--txt)", borderRadius: 8, padding: "6px 14px", fontSize: 12, cursor: "pointer" }}>Switch</button>
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0" }}>
            <div><div style={{ fontSize: 14, fontWeight: 600, color: "var(--red)" }}>Log Out</div><div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>Sign out of your account</div></div>
            <button onClick={handleLogout} style={{ background: "rgba(255,45,85,.1)", border: "1px solid rgba(255,45,85,.3)", color: "var(--red)", borderRadius: 8, padding: "6px 14px", fontSize: 12, cursor: "pointer" }}>Log Out</button>
          </div>
        </div>
      </div>
    </div>}

    {/* DASHBOARD */}
    {page === "dash" && <div className="dash-page page">
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 22, flexWrap: "wrap", gap: 12 }}>
        <div>
          <div style={{ fontFamily: "Bebas Neue,sans-serif", fontSize: 36, letterSpacing: 1, marginBottom: 3 }}>Dashboard</div>
          <div style={{ fontSize: 14, color: "var(--muted)" }}>Hey {firstName || "Streamer"}! Your stats this month.</div>
        </div>
        {isStreaming ? (
          <button className="btn-red" onClick={handleEndStream} style={{ display: "flex", alignItems: "center", gap: 7, padding: "11px 22px" }}>
            <span style={{ width: 7, height: 7, background: "#fff", borderRadius: "50%", animation: "blink 1.6s infinite" }} />End Stream
          </button>
        ) : (
          <button className="btn-g" style={{ background: "linear-gradient(135deg,var(--red),#ff6b35)", boxShadow: "0 4px 15px rgba(255,45,85,.3)", display: "flex", alignItems: "center", gap: 7, padding: "11px 22px" }} onClick={() => setShowGoLive(true)}>
            <span style={{ width: 7, height: 7, background: "#fff", borderRadius: "50%", animation: "blink 1.6s infinite" }} />Go Live
          </button>
        )}
      </div>

      {/* Live now banner */}
      {isStreaming && (
        <div className="live-banner" style={{ marginBottom: 20 }}>
          <div className="live-dot" />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 2 }}>You are LIVE — "{goLiveForm.title}"</div>
            <div style={{ fontSize: 12, color: "var(--muted)" }}>{goLiveForm.category} · Viewers can find you on the Discover page</div>
          </div>
          <button onClick={() => go("disc")} style={{ background: "none", border: "1px solid rgba(255,45,85,.3)", color: "var(--red)", borderRadius: 8, padding: "5px 12px", fontSize: 12, cursor: "pointer" }}>View Stream</button>
        </div>
      )}

      <div className="kpis">
        {[["r", "Revenue", "$842", "up 24%"], ["g", "Avg Viewers", "1,284", "up 11%"], ["y", "Subscribers", "312", "28 new"], ["b", "Hours Live", "84h", "21 sessions"]].map(([col, l, v, ch]) => (
          <div key={l} className={`kpi ${col}`}><div className="kpi-l">{l}</div><div className="kpi-v">{v}</div><div className="kpi-ch">{ch}</div></div>
        ))}
      </div>
      <div className="panel">
        <div className="panel-hd"><span className="panel-title">Revenue Breakdown</span><span style={{ fontSize: 12, color: "var(--muted)" }}>This month</span></div>
        <div style={{ padding: 16 }}>
          {[["Ad Revenue", "$337", 40, "linear-gradient(90deg,var(--red),#ff6b35)"], ["Subscriptions", "$218", 26, "linear-gradient(90deg,var(--green),#00c8a0)"], ["Gifts", "$180", 21, "linear-gradient(90deg,var(--gold),var(--orange))"], ["Brand Deals", "$107", 13, "linear-gradient(90deg,var(--blue),var(--purple))"]].map(([l, v, p, c]) => (
            <div key={l} style={{ marginBottom: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}><span style={{ fontSize: 13, color: "var(--muted)" }}>{l}</span><span style={{ fontSize: 13, fontWeight: 700 }}>{v}</span></div>
              <div style={{ background: "var(--ink4)", borderRadius: 4, height: 6, overflow: "hidden" }}><div style={{ width: `${p}%`, height: "100%", borderRadius: 4, background: c }} /></div>
            </div>
          ))}
        </div>
      </div>
      <div className="panel">
        <div className="panel-hd"><span className="panel-title">Ad Revenue Split</span></div>
        <div style={{ padding: 16 }}>
          <div style={{ display: "flex", height: 10, borderRadius: 6, overflow: "hidden", gap: 2, marginBottom: 14 }}>
            <div style={{ flex: 40, background: "var(--green)", borderRadius: 4 }} />
            <div style={{ flex: 40, background: "var(--red)", borderRadius: 4 }} />
            <div style={{ flex: 20, background: "rgba(255,255,255,.2)", borderRadius: 4 }} />
          </div>
          {[["var(--green)", "You (streamer)", "40%"], ["var(--red)", "STEM platform", "40%"], ["rgba(255,255,255,.4)", "Your viewers", "20%"]].map(([c, l, v]) => (
            <div key={l} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <div style={{ width: 9, height: 9, borderRadius: 3, background: c, flexShrink: 0 }} />
              <span style={{ fontSize: 13, color: "var(--muted)", flex: 1 }}>{l}</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: c }}>{v}</span>
            </div>
          ))}
        </div>
      </div>
    </div>}

    {/* GO LIVE MODAL */}
    {showGoLive && (
      <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowGoLive(false)}>
        <div className="modal-box">
          <div className="modal-title">Go Live</div>
          <div className="modal-sub">Share your stream with the world — viewers will see you on Discover in real time.</div>
          <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: .6, color: "var(--muted)", textTransform: "uppercase", marginBottom: 6, display: "block" }}>Stream Title</label>
          <input
            className="fi"
            placeholder="e.g. Ranked Grind to Diamond, Cooking Pasta Live..."
            value={goLiveForm.title}
            onChange={e => setGoLiveForm({ ...goLiveForm, title: e.target.value })}
            onKeyDown={e => e.key === "Enter" && handleGoLive()}
            autoFocus
          />
          <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: .6, color: "var(--muted)", textTransform: "uppercase", marginBottom: 6, display: "block" }}>Category</label>
          <select
            className="select-fi"
            value={goLiveForm.category}
            onChange={e => setGoLiveForm({ ...goLiveForm, category: e.target.value })}
          >
            {STREAM_CATS.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
            <button onClick={() => setShowGoLive(false)} style={{ flex: 1, background: "var(--ink3)", border: "1px solid var(--line2)", color: "var(--muted)", borderRadius: 12, padding: 13, fontSize: 14, cursor: "pointer" }}>Cancel</button>
            <button onClick={handleGoLive} disabled={savingGoLive} style={{ flex: 2, background: "linear-gradient(135deg,var(--red),#ff6b35)", color: "#fff", border: "none", borderRadius: 12, padding: 13, fontSize: 15, fontWeight: 700, cursor: savingGoLive ? "not-allowed" : "pointer", opacity: savingGoLive ? 0.7 : 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              {savingGoLive ? <div className="spinner" /> : <><span style={{ width: 7, height: 7, background: "#fff", borderRadius: "50%", animation: "blink 1.6s infinite" }} />Go Live Now</>}
            </button>
          </div>
        </div>
      </div>
    )}

    {/* SIGNUP PROMPT — shown when guest tries to chat, gift, or follow */}
    {showSignupPrompt && (
      <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowSignupPrompt(false)}>
        <div className="modal-box" style={{ maxWidth: 360, textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🪙</div>
          <div className="modal-title" style={{ fontSize: 26 }}>Join STEM Free</div>
          <div className="modal-sub" style={{ marginBottom: 22 }}>Sign up to join the chat, earn coins while watching, send gifts, and withdraw real cash.</div>
          <button className="btn-g" style={{ width: "100%", padding: "13px 0", fontSize: 15, marginBottom: 10, borderRadius: 12, border: "none" }} onClick={() => { setShowSignupPrompt(false); setAuthMode("signup"); go("auth"); }}>
            Sign Up Free — Start Earning
          </button>
          <button className="btn-o" style={{ width: "100%", padding: "11px 0", fontSize: 14, borderRadius: 12 }} onClick={() => { setShowSignupPrompt(false); setAuthMode("login"); go("auth"); }}>
            Already have an account? Log in
          </button>
          <button onClick={() => setShowSignupPrompt(false)} style={{ background: "none", border: "none", color: "var(--muted)", fontSize: 12, cursor: "pointer", marginTop: 14 }}>
            Continue watching without account
          </button>
        </div>
      </div>
    )}

    {toast && <div className="toast">🪙 {toast}</div>}
  </>);
}
