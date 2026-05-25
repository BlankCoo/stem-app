import { useState, useEffect, useRef } from "react";
import MuxPlayer from "@mux/mux-player-react";
import twemoji from "twemoji";
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
img.emoji{height:1.1em;width:1.1em;vertical-align:-0.15em;display:inline-block}
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
@keyframes giftFloat{0%{opacity:1;transform:translateY(0) scale(1)}60%{opacity:1;transform:translateY(-180px) scale(1.3)}100%{opacity:0;transform:translateY(-340px) scale(0.9)}}
.gift-anim-wrap{position:fixed;inset:0;pointer-events:none;z-index:8000;overflow:hidden}
.gift-anim-item{position:absolute;bottom:90px;display:flex;flex-direction:column;align-items:center;gap:4px;animation:giftFloat 2.5s ease-out forwards}
.gift-anim-emoji{font-size:52px;filter:drop-shadow(0 4px 20px rgba(255,200,0,.6))}
.gift-anim-label{font-size:12px;font-weight:800;color:#fff;background:rgba(0,0,0,.7);border-radius:8px;padding:3px 10px;white-space:nowrap}
.vprofile-page{padding:20px 16px;padding-bottom:80px;max-width:600px;margin:0 auto}
.badge-chip{display:inline-flex;align-items:center;gap:5px;border-radius:20px;padding:5px 12px;font-size:12px;font-weight:700;margin:3px}
.trending-strip{display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:10px;margin-bottom:22px}
.trending-card{background:linear-gradient(135deg,rgba(255,45,85,.1),rgba(124,58,237,.08));border:1px solid rgba(255,45,85,.25);border-radius:14px;overflow:hidden;cursor:pointer;transition:all .22s;position:relative;padding:14px}
.trending-card:hover{transform:translateY(-2px);box-shadow:0 8px 24px rgba(0,0,0,.45)}
.trend-num{position:absolute;top:8px;right:10px;font-family:'Bebas Neue',sans-serif;font-size:34px;color:rgba(255,255,255,.08);line-height:1}
.mod-msg-wrap{position:relative;display:flex;align-items:flex-start;gap:6px}
.mod-menu{position:absolute;right:0;top:100%;background:var(--ink2);border:1px solid var(--line2);border-radius:10px;z-index:60;width:150px;overflow:hidden;box-shadow:0 8px 24px rgba(0,0,0,.6)}
.mod-menu-btn{width:100%;background:none;border:none;padding:10px 14px;cursor:pointer;text-align:left;font-size:13px;font-family:'Outfit',sans-serif;transition:background .12s;display:block}
.mod-menu-btn:hover{background:rgba(255,255,255,.05)}
@keyframes alertSlide{0%{transform:translateY(-110%);opacity:0}8%{transform:translateY(0);opacity:1}80%{transform:translateY(0);opacity:1}100%{transform:translateY(-110%);opacity:0}}
@keyframes hypePulse{0%,100%{opacity:1}50%{opacity:.55}}
@keyframes trainScroll{0%{transform:translateX(100%)}100%{transform:translateX(-100%)}}
.stream-alert{position:absolute;top:0;left:0;right:0;z-index:25;background:linear-gradient(90deg,rgba(124,58,237,.94),rgba(255,45,85,.88));backdrop-filter:blur(10px);padding:11px 16px;display:flex;align-items:center;gap:10px;animation:alertSlide 4.2s ease forwards;pointer-events:none}
.hype-wrap{margin-bottom:10px}
.hype-bar{height:7px;background:var(--ink4);border-radius:4px;overflow:hidden;margin-bottom:5px}
.hype-bar-fill{height:100%;border-radius:4px;background:linear-gradient(90deg,var(--gold),var(--orange),var(--red));transition:width .5s ease}
.hype-celebrate{background:linear-gradient(90deg,rgba(255,200,0,.18),rgba(255,149,0,.14));border:1px solid rgba(255,200,0,.4);border-radius:12px;padding:9px 14px;text-align:center;font-weight:800;font-size:15px;letter-spacing:.3px;animation:hypePulse .7s infinite;overflow:hidden;position:relative}
.react-bar{display:flex;gap:5px;padding:8px 0 4px;border-top:1px solid var(--line);margin-top:4px}
.react-btn{background:var(--ink3);border:1px solid var(--line);color:#fff;border-radius:20px;padding:4px 0;font-size:18px;cursor:pointer;transition:all .15s;flex:1;text-align:center}
.react-btn:hover,.react-btn:active{background:var(--ink4);transform:scale(1.18)}
.admin-page{padding:20px 16px;padding-bottom:80px;max-width:720px;margin:0 auto}
.raid-overlay{position:fixed;inset:0;z-index:9500;background:rgba(0,0,0,.88);display:flex;align-items:center;justify-content:center;padding:20px;backdrop-filter:blur(6px)}
.poll-card{background:linear-gradient(135deg,rgba(124,58,237,.1),rgba(255,45,85,.07));border:1px solid rgba(124,58,237,.25);border-radius:14px;padding:14px 16px;margin-bottom:12px}
.poll-opt{width:100%;background:var(--ink3);border:1px solid var(--line);color:#fff;border-radius:10px;padding:9px 14px;font-family:'Outfit',sans-serif;font-size:13px;cursor:pointer;text-align:left;margin-bottom:6px;transition:all .15s;position:relative;overflow:hidden;display:block}
.poll-opt:hover{background:var(--ink4)}.poll-opt.voted{border-color:rgba(124,58,237,.6);background:rgba(124,58,237,.12)}
.poll-bar{position:absolute;inset:0;background:rgba(124,58,237,.2);transition:width .5s ease;pointer-events:none;border-radius:10px}
.gifters-strip{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:10px}
.gifter-chip{display:inline-flex;align-items:center;gap:4px;background:rgba(255,200,0,.1);border:1px solid rgba(255,200,0,.22);border-radius:20px;padding:3px 10px;font-size:11px;font-weight:700;color:var(--gold)}
.clips-page{padding:20px 16px;padding-bottom:80px;max-width:900px;margin:0 auto}
.clips-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:12px;margin-top:16px}
.clip-card{background:var(--card);border:1px solid var(--line);border-radius:14px;overflow:hidden;cursor:pointer;transition:all .2s}
.clip-card:hover{transform:translateY(-2px);box-shadow:0 8px 24px rgba(0,0,0,.4)}
.shop-item{display:flex;align-items:center;gap:14px;background:var(--card);border:1px solid var(--line);border-radius:14px;padding:14px 16px;margin-bottom:10px}
.slow-badge{display:inline-flex;align-items:center;gap:5px;background:rgba(255,149,0,.1);border:1px solid rgba(255,149,0,.2);border-radius:8px;padding:4px 10px;font-size:11px;font-weight:700;color:var(--orange);margin-bottom:6px}
.fs-btn{position:absolute;bottom:10px;right:10px;z-index:20;background:rgba(0,0,0,.65);border:none;color:#fff;border-radius:8px;width:34px;height:34px;display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:16px;backdrop-filter:blur(6px);transition:background .15s}
.fs-btn:hover{background:rgba(0,0,0,.85)}
.viewer-count-pill{position:absolute;top:10px;right:10px;z-index:20;background:rgba(0,0,0,.72);border:1px solid rgba(255,255,255,.12);border-radius:20px;padding:5px 12px;font-size:12px;font-weight:700;color:#fff;display:flex;align-items:center;gap:5px;backdrop-filter:blur(6px)}
@media(min-width:768px){.vprofile-page{padding:32px 44px}}
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
  const [goLiveStep, setGoLiveStep] = useState(1); // 1=form, 2=OBS setup
  const [goLiveForm, setGoLiveForm] = useState({ title: "", category: "Gaming" });
  const [isStreaming, setIsStreaming] = useState(false);
  const [savingGoLive, setSavingGoLive] = useState(false);
  const [loadingFollow, setLoadingFollow] = useState(false);
  const [showSignupPrompt, setShowSignupPrompt] = useState(false);

  // Mux state
  const [muxStreamId, setMuxStreamId] = useState("");
  const [muxStreamKey, setMuxStreamKey] = useState("");
  const [muxPlaybackId, setMuxPlaybackId] = useState("");

  // Real streams from Supabase
  const [liveStreams, setLiveStreams] = useState([]);

  // Streak
  const [streakDays, setStreakDays] = useState(0);

  // Notifications
  const [myFollows, setMyFollows] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [showNotifs, setShowNotifs] = useState(false);
  const [unreadNotifs, setUnreadNotifs] = useState(0);

  // Transactions
  const [transactions, setTransactions] = useState([]);
  const [loadingTxns, setLoadingTxns] = useState(false);

  // Referral
  const [referralCode, setReferralCode] = useState("");

  // Channel page
  const [channelUser, setChannelUser] = useState(null);
  const [channelStreams, setChannelStreams] = useState([]);
  const [channelClips, setChannelClips] = useState([]);
  const [channelFollowers, setChannelFollowers] = useState(0);
  const [channelIsLive, setChannelIsLive] = useState(false);
  const [channelSchedule, setChannelSchedule] = useState([]);
  const [channelTab, setChannelTab] = useState("overview");

  // Stream schedule
  const [upcomingSchedule, setUpcomingSchedule] = useState([]);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleForm, setScheduleForm] = useState({ title: "", category: "Gaming", date: "", time: "" });
  const [savingSchedule, setSavingSchedule] = useState(false);

  // Clips
  const [streamClips, setStreamClips] = useState([]);
  const [showClipModal, setShowClipModal] = useState(false);
  const [clipTitle, setClipTitle] = useState("");
  const [savingClip, setSavingClip] = useState(false);

  // Withdrawals
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawPaypal, setWithdrawPaypal] = useState("");
  const [withdrawCoins, setWithdrawCoins] = useState(20000);
  const [processingWithdraw, setProcessingWithdraw] = useState(false);
  const [withdrawHistory, setWithdrawHistory] = useState([]);

  // Emotes
  const [streamEmotes, setStreamEmotes] = useState([]);
  const [myEmotes, setMyEmotes] = useState([]);
  const [showEmotePicker, setShowEmotePicker] = useState(false);
  const [uploadingEmote, setUploadingEmote] = useState(false);
  const [emoteName, setEmoteName] = useState("");

  // Gift animations
  const [giftAnims, setGiftAnims] = useState([]);

  // Real-time viewer count via presence
  const [viewerCount, setViewerCount] = useState(0);

  // Chat moderation
  const [chatBans, setChatBans] = useState(new Set());
  const [msgMenuId, setMsgMenuId] = useState(null);
  const [slowModeSecs, setSlowModeSecs] = useState(0); // 0 = off
  const [slowCooldown, setSlowCooldown] = useState(0); // seconds remaining
  const [subOnly, setSubOnly] = useState(false);

  // Viewer profile page
  const [vProfile, setVProfile] = useState(null);
  const [vProfileTxns, setVProfileTxns] = useState([]);
  const [loadingVProfile, setLoadingVProfile] = useState(false);

  // On-stream alerts overlay
  const [streamAlert, setStreamAlert] = useState(null);
  const streamAlertRef = useRef(null);

  // Hype Train
  const [hypeProgress, setHypeProgress] = useState(0);
  const [hypeCelebrating, setHypeCelebrating] = useState(false);
  const hypeGiftsRef = useRef([]);

  // Raid system
  const [showRaidModal, setShowRaidModal] = useState(false);
  const [raidTargets, setRaidTargets] = useState([]);

  // Admin panel
  const [adminWithdrawals, setAdminWithdrawals] = useState([]);
  const [loadingAdmin, setLoadingAdmin] = useState(false);

  // Streamer analytics
  const [streamerAnalytics, setStreamerAnalytics] = useState({
    streamCount: 0, peakViewers: 0, avgPeakViewers: 0,
    newFollowers30d: 0, activeSubs: 0, totalClips: 0,
    giftRevenue: 0, recentStreams: [],
  });
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);

  // Subscription system
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscribing, setSubscribing] = useState(false);

  // Stream polls
  const [activePoll, setActivePoll] = useState(null);
  const [pollVoted, setPollVoted] = useState(null);
  const [showPollCreator, setShowPollCreator] = useState(false);
  const [pollForm, setPollForm] = useState({ question: "", options: ["", ""] });
  const pollChRef = useRef(null);

  // Top gifters this session
  const [topGifters, setTopGifters] = useState({});

  // Clips gallery
  const [allClips, setAllClips] = useState([]);
  const [loadingClips, setLoadingClips] = useState(false);

  // Past streams
  const [pastStreams, setPastStreams] = useState([]);
  const [selectedVod, setSelectedVod] = useState(null);

  const chatRef = useRef(null);
  const chatRef2 = useRef(null);
  const coinsRef = useRef(0);
  const sessRef = useRef(0);
  const prevLiveIdsRef = useRef(new Set());
  const emoteFileRef = useRef(null);
  const slowTimerRef = useRef(null);

  // Keep refs in sync
  useEffect(() => { coinsRef.current = coins; }, [coins]);
  useEffect(() => { sessRef.current = sess; }, [sess]);

  // Parse all emoji in the DOM to Twemoji SVGs after every render
  useEffect(() => {
    twemoji.parse(document.body, { folder: "svg", ext: ".svg", base: "https://cdn.jsdelivr.net/gh/twitter/twemoji@latest/assets/" });
  });

  // Auth init + streams subscription
  useEffect(() => {
    // Store referral code from URL on first load
    const refParam = new URLSearchParams(window.location.search).get("ref");
    if (refParam) sessionStorage.setItem("stem_ref", refParam);

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) { setUser(session.user); fetchProfile(session.user.id); fetchMyFollows(session.user.id); setPage("disc"); }
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) { setUser(session.user); fetchProfile(session.user.id); fetchMyFollows(session.user.id); }
      else {
        setUser(null); setProfile(null); setCoins(0); coinsRef.current = 0;
        setStreakDays(0); setMyFollows([]); setNotifications([]); setUnreadNotifs(0); setReferralCode("");
        setShowNotifs(false); setShowSignupPrompt(false); setShowClipModal(false);
        setShowScheduleModal(false); setShowGoLive(false); setShowEmotePicker(false);
        setShowWithdrawModal(false); setWithdrawHistory([]);
        setChatBans(new Set()); setSlowModeSecs(0); setSlowCooldown(0); setSubOnly(false);
        setVProfile(null); setGiftAnims([]); setPage("land");
      }
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
      setStreakDays(data.streak_days || 0);
      setReferralCode(data.referral_code || "");
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
      setMuxStreamId(data.mux_stream_id || "");
      setMuxPlaybackId(data.mux_playback_id || "");
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

  // Returns bonus % for a given streak length
  const getStreakBonus = (days) => days >= 14 ? 100 : days >= 7 ? 50 : days >= 3 ? 25 : 0;

  // Check and update daily watch streak
  const updateStreak = async () => {
    if (!user) return;
    const today = new Date().toISOString().split("T")[0];
    const { data } = await supabase.from("profiles").select("streak_days,last_streak_date").eq("id", user.id).single();
    if (!data) return;
    if (data.last_streak_date === today) { setStreakDays(data.streak_days || 0); return; }

    const yest = new Date(); yest.setDate(yest.getDate() - 1);
    const yestStr = yest.toISOString().split("T")[0];
    const wasConsecutive = data.last_streak_date === yestStr;
    const newStreak = wasConsecutive ? (data.streak_days || 0) + 1 : 1;

    await supabase.from("profiles").update({ streak_days: newStreak, last_streak_date: today }).eq("id", user.id);
    setStreakDays(newStreak);

    if (!wasConsecutive && data.last_streak_date) notify("Streak reset — watch daily for bonus coins!");
    else if (newStreak === 3)  notify("🔥 3-day streak! Earning 1.25x coins!");
    else if (newStreak === 7)  notify("🔥 7-day streak! Earning 1.5x coins!");
    else if (newStreak === 14) notify("🔥 14-day streak! Earning 2x coins — max bonus!");
    else if (newStreak > 1)    notify(`🔥 ${newStreak}-day streak! Keep it up!`);
  };

  // Fetch the IDs of streamers this user follows (for notifications)
  const fetchMyFollows = async (userId) => {
    const { data } = await supabase.from("follows").select("following_id").eq("follower_id", userId);
    if (data) setMyFollows(data.map(f => f.following_id));
  };

  // --- TRANSACTION HISTORY ---
  const logTransaction = async (type, amount, description) => {
    if (!user) return;
    await supabase.from("transactions").insert({ user_id: user.id, type, amount, description });
    if (amount > 0) {
      const newEarned = (profile?.total_earned || 0) + amount / 1000;
      supabase.from("profiles").update({ total_earned: newEarned }).eq("id", user.id);
      setProfile(p => p ? { ...p, total_earned: newEarned } : p);
    }
  };

  const fetchTransactions = async () => {
    if (!user) return;
    setLoadingTxns(true);
    const { data } = await supabase.from("transactions").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(50);
    if (data) setTransactions(data);
    setLoadingTxns(false);
  };

  // --- REFERRAL ---
  const applyReferral = async (newUserId, newUserName, startCoins) => {
    const ref = sessionStorage.getItem("stem_ref");
    if (!ref) return startCoins;
    const { data: referrer } = await supabase.from("profiles").select("id,coins,referral_count").eq("referral_code", ref).maybeSingle();
    if (!referrer || referrer.id === newUserId) return startCoins;
    // Reward referrer
    const rc = (referrer.coins || 0) + 500;
    await supabase.from("profiles").update({ coins: rc, referral_count: (referrer.referral_count || 0) + 1 }).eq("id", referrer.id);
    await supabase.from("transactions").insert({ user_id: referrer.id, type: "referral_reward", amount: 500, description: `${newUserName} signed up with your referral link` });
    // Reward new user (on top of signup bonus)
    await supabase.from("profiles").update({ referred_by: ref, coins: startCoins + 500 }).eq("id", newUserId);
    await supabase.from("transactions").insert({ user_id: newUserId, type: "referral_bonus", amount: 500, description: "Joined via referral link" });
    sessionStorage.removeItem("stem_ref");
    notify("🎉 Referral bonus! You and your friend both earned 500 coins!");
    return startCoins + 500;
  };

  // --- CHANNEL PAGE ---
  const viewChannel = async (userId) => {
    if (!userId) return;
    const [profRes, streamsRes, followersRes, liveRes, schedRes, clipsRes, emotesRes] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", userId).single(),
      supabase.from("past_streams").select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(12),
      supabase.from("follows").select("id", { count: "exact" }).eq("following_id", userId),
      supabase.from("streams").select("id,title").eq("user_id", userId).eq("status", "live").maybeSingle(),
      supabase.from("stream_schedule").select("*").eq("user_id", userId).gte("scheduled_at", new Date().toISOString()).order("scheduled_at").limit(5),
      supabase.from("clips").select("*, profiles(full_name,username)").eq("streamer_id", userId).order("created_at", { ascending: false }).limit(12),
      supabase.from("emotes").select("*").eq("user_id", userId).order("name"),
    ]);
    if (profRes.data) {
      setChannelUser(profRes.data);
      setChannelStreams(streamsRes.data || []);
      setChannelFollowers(followersRes.count || 0);
      setChannelIsLive(!!liveRes.data);
      setChannelSchedule(schedRes.data || []);
      setChannelClips(clipsRes.data || []);
      setStreamEmotes(profRes.data.emotes_enabled !== false ? (emotesRes.data || []) : []);
      setChannelTab("overview");
      setPage("channel");
      window.scrollTo(0, 0);
    }
  };

  // --- STREAM SCHEDULE ---
  const fetchUpcomingSchedule = async () => {
    const { data } = await supabase.from("stream_schedule").select("*, profiles(full_name,username)").gte("scheduled_at", new Date().toISOString()).order("scheduled_at").limit(6);
    if (data) setUpcomingSchedule(data);
  };

  const handleAddSchedule = async () => {
    if (!scheduleForm.title.trim() || !scheduleForm.date || !scheduleForm.time) { notify("Fill in all schedule fields"); return; }
    setSavingSchedule(true);
    const scheduledAt = new Date(`${scheduleForm.date}T${scheduleForm.time}`).toISOString();
    const { error } = await supabase.from("stream_schedule").insert({ user_id: user.id, title: scheduleForm.title.trim(), category: scheduleForm.category, scheduled_at: scheduledAt });
    if (!error) { notify("Stream scheduled!"); setShowScheduleModal(false); setScheduleForm({ title: "", category: "Gaming", date: "", time: "" }); fetchUpcomingSchedule(); }
    else notify("Error saving schedule");
    setSavingSchedule(false);
  };

  // --- CLIPS ---
  const fetchStreamClips = async (streamId) => {
    const { data } = await supabase.from("clips").select("*, profiles(full_name,username)").eq("stream_id", streamId).order("created_at", { ascending: false }).limit(10);
    if (data) setStreamClips(data);
  };

  const createClip = async () => {
    if (!user || !stream?.id) return;
    if (!requireAuth()) return;
    if (clipTitle.trim().length > 100) { notify("Clip title too long (max 100 chars)"); return; }
    setSavingClip(true);
    const title = clipTitle.trim() || `Clip by ${profile?.full_name?.split(" ")[0] || "viewer"}`;
    const { error } = await supabase.from("clips").insert({ stream_id: stream.id, user_id: user.id, streamer_id: stream.user_id || null, title });
    if (!error) {
      const earned = Math.round(25 * (1 + getStreakBonus(streakDays) / 100));
      setShowClipModal(false);
      setClipTitle("");
      fetchStreamClips(stream.id);
      const nc = coinsRef.current + earned;
      setCoins(nc); coinsRef.current = nc;
      supabase.from("profiles").update({ coins: nc }).eq("id", user.id);
      logTransaction("clip", earned, `Clipped "${stream.title}"`);
      notify(`Clip saved! +${earned} coins`);
    }
    setSavingClip(false);
  };

  // ── Withdrawals ─────────────────────────────────────────
  const fetchWithdrawHistory = async () => {
    if (!user) return;
    const { data } = await supabase.from("withdrawal_requests").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(10);
    if (data) setWithdrawHistory(data);
  };

  const handleWithdraw = async () => {
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(withdrawPaypal.trim());
    if (!emailOk) { notify("Enter a valid PayPal email address"); return; }
    if (withdrawCoins < 20000) { notify("Minimum withdrawal is 20,000 coins ($20)"); return; }
    if (withdrawCoins % 1000 !== 0) { notify("Amount must be a whole number of thousands (e.g. 20,000)"); return; }
    if (withdrawCoins > coins) { notify("Insufficient coins"); return; }
    setProcessingWithdraw(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch("/api/withdraw", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session?.access_token}` },
        body: JSON.stringify({ amountCoins: withdrawCoins, paypalEmail: withdrawPaypal }),
      });
      const result = await res.json();
      if (!res.ok) { notify(result.error || "Withdrawal failed"); return; }
      const newCoins = coins - withdrawCoins;
      setCoins(newCoins); coinsRef.current = newCoins;
      setShowWithdrawModal(false);
      setWithdrawPaypal("");
      setWithdrawCoins(20000);
      notify(result.message || `Withdrawal submitted!`);
      fetchWithdrawHistory();
      fetchTransactions();
    } catch (err) {
      notify("Network error — please try again");
    }
    setProcessingWithdraw(false);
  };
  // ────────────────────────────────────────────────────────

  // ── Emotes ──────────────────────────────────────────────
  const fetchStreamEmotes = async (userId) => {
    const { data: prof } = await supabase.from("profiles").select("emotes_enabled").eq("id", userId).maybeSingle();
    if (prof?.emotes_enabled === false) { setStreamEmotes([]); return; }
    const { data } = await supabase.from("emotes").select("*").eq("user_id", userId).order("name");
    if (data) setStreamEmotes(data);
  };

  const fetchMyEmotes = async () => {
    if (!user) return;
    const { data } = await supabase.from("emotes").select("*").eq("user_id", user.id).order("name");
    if (data) setMyEmotes(data);
  };

  const uploadEmote = async () => {
    const file = emoteFileRef.current?.files?.[0];
    const clean = emoteName.trim().replace(/[^a-zA-Z0-9_]/g, "");
    if (!file || !clean) { notify("Choose an image and enter an emote name"); return; }
    if (file.size > 512 * 1024) { notify("Image must be under 512 KB"); return; }
    setUploadingEmote(true);
    const ext = file.name.split(".").pop().toLowerCase();
    const path = `${user.id}/${clean}.${ext}`;
    const { error: upErr } = await supabase.storage.from("emotes").upload(path, file, { upsert: true, contentType: file.type });
    if (upErr) { notify("Upload failed: " + upErr.message); setUploadingEmote(false); return; }
    const { data: { publicUrl } } = supabase.storage.from("emotes").getPublicUrl(path);
    const { error } = await supabase.from("emotes").upsert({ user_id: user.id, name: clean, image_url: publicUrl }, { onConflict: "user_id,name" });
    if (!error) { notify(`:${clean}: uploaded!`); setEmoteName(""); if (emoteFileRef.current) emoteFileRef.current.value = ""; fetchMyEmotes(); }
    else notify("Error saving emote: " + error.message);
    setUploadingEmote(false);
  };

  const deleteEmote = async (emote) => {
    const parts = emote.image_url.split("/object/public/emotes/");
    if (parts[1]) await supabase.storage.from("emotes").remove([parts[1]]);
    await supabase.from("emotes").delete().eq("id", emote.id);
    setMyEmotes(m => m.filter(e => e.id !== emote.id));
    notify("Emote removed");
  };

  // ── Gift animations ─────────────────────────────────────
  const triggerGiftAnim = (emoji, name) => {
    const id = Date.now() + Math.random();
    const x = 15 + Math.random() * 70;
    setGiftAnims(a => [...a, { id, emoji, name, x }]);
    setTimeout(() => setGiftAnims(a => a.filter(g => g.id !== id)), 2600);
  };

  // ── On-stream alert overlay ──────────────────────────────
  const showStreamAlert = (msg, emoji, sub = "") => {
    setStreamAlert({ msg, emoji, sub });
    if (streamAlertRef.current) clearTimeout(streamAlertRef.current);
    streamAlertRef.current = setTimeout(() => setStreamAlert(null), 4200);
  };

  // ── Hype Train ───────────────────────────────────────────
  const addHype = (coins) => {
    const now = Date.now();
    hypeGiftsRef.current = [...hypeGiftsRef.current.filter(g => now - g.time < 60000), { amount: coins, time: now }];
    const total = hypeGiftsRef.current.reduce((s, g) => s + g.amount, 0);
    const progress = Math.min(100, Math.round(total / 50)); // 5000 coins = 100%
    setHypeProgress(progress);
    if (progress >= 100) {
      setHypeCelebrating(true);
      setTimeout(() => { setHypeCelebrating(false); setHypeProgress(0); hypeGiftsRef.current = []; }, 5000);
    }
  };

  // ── Streamer analytics ───────────────────────────────────
  const fetchStreamerAnalytics = async () => {
    if (!user) return;
    setLoadingAnalytics(true);
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

    const [pastStreamsRes, newFollowersRes, activeSubsRes, clipCountRes, streamIdsRes] = await Promise.all([
      supabase.from("past_streams").select("id,title,category,peak_viewers,created_at,mux_playback_id").eq("user_id", user.id).order("created_at", { ascending: false }).limit(6),
      supabase.from("follows").select("id", { count: "exact", head: true }).eq("following_id", user.id).gte("created_at", thirtyDaysAgo),
      supabase.from("subscriptions").select("id", { count: "exact", head: true }).eq("streamer_id", user.id).gte("expires_at", new Date().toISOString()),
      supabase.from("clips").select("id", { count: "exact", head: true }).eq("streamer_id", user.id),
      supabase.from("streams").select("id").eq("user_id", user.id),
    ]);

    // Sum gift coins from messages in their streams
    let giftRevenue = 0;
    const streamIds = (streamIdsRes.data || []).map(s => s.id);
    if (streamIds.length > 0) {
      const { data: gifts } = await supabase
        .from("messages")
        .select("coins_spent")
        .in("stream_id", streamIds)
        .eq("is_superchat", true)
        .gt("coins_spent", 0);
      giftRevenue = (gifts || []).reduce((sum, m) => sum + (m.coins_spent || 0), 0);
    }

    const recentStreams = pastStreamsRes.data || [];
    const peaks = recentStreams.map(s => s.peak_viewers || 0);
    const peakViewers = peaks.length > 0 ? Math.max(...peaks) : 0;
    const avgPeakViewers = peaks.length > 0 ? Math.round(peaks.reduce((a, b) => a + b, 0) / peaks.length) : 0;

    setStreamerAnalytics({
      streamCount: recentStreams.length,
      peakViewers,
      avgPeakViewers,
      newFollowers30d: newFollowersRes.count || 0,
      activeSubs: activeSubsRes.count || 0,
      totalClips: clipCountRes.count || 0,
      giftRevenue,
      recentStreams,
    });
    setLoadingAnalytics(false);
  };

  // ── Admin withdrawal management ──────────────────────────
  const fetchAdminWithdrawals = async () => {
    setLoadingAdmin(true);
    const { data } = await supabase
      .from("withdrawal_requests")
      .select("*, profiles(username, full_name, coins)")
      .order("created_at", { ascending: false });
    setAdminWithdrawals(data || []);
    setLoadingAdmin(false);
  };

  const approveWithdrawal = async (w) => {
    await supabase.from("withdrawal_requests").update({ status: "paid" }).eq("id", w.id);
    setAdminWithdrawals(prev => prev.map(x => x.id === w.id ? { ...x, status: "paid" } : x));
    notify("Withdrawal approved ✓");
  };

  const rejectWithdrawal = async (w) => {
    await supabase.from("profiles").update({ coins: (w.profiles?.coins || 0) + w.amount_coins }).eq("id", w.user_id);
    await supabase.from("withdrawal_requests").update({ status: "rejected" }).eq("id", w.id);
    setAdminWithdrawals(prev => prev.map(x => x.id === w.id ? { ...x, status: "rejected" } : x));
    notify("Rejected — coins refunded");
  };

  // ── Raid system ──────────────────────────────────────────
  const startRaid = async () => {
    const { data } = await supabase.from("streams").select("id,title,streamer_name,viewer_count,mux_playback_id,category,user_id").eq("status", "live").neq("user_id", user?.id);
    if (data && data.length > 0) { setRaidTargets(data); setShowRaidModal(true); }
  };

  // ── Subscription ────────────────────────────────────────
  const checkSubscription = async (streamerId) => {
    if (!user || !streamerId) { setIsSubscribed(false); return; }
    const { data } = await supabase.from("subscriptions").select("expires_at").eq("subscriber_id", user.id).eq("streamer_id", streamerId).maybeSingle();
    setIsSubscribed(!!data && new Date(data.expires_at) > new Date());
  };

  const handleSubscribe = async () => {
    if (!requireAuth()) return;
    if (!stream?.user_id || stream.user_id === user?.id) return;
    const COST = 1000;
    if (coinsRef.current < COST) { notify("Need 1,000 coins to subscribe!"); return; }
    setSubscribing(true);
    const nc = coinsRef.current - COST;
    setCoins(nc); coinsRef.current = nc;
    supabase.from("profiles").update({ coins: nc }).eq("id", user.id);
    await supabase.from("subscriptions").upsert({
      subscriber_id: user.id, streamer_id: stream.user_id,
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    }, { onConflict: "subscriber_id,streamer_id" });
    logTransaction("subscription", -COST, `Subscribed to ${stream.streamer}`);
    setIsSubscribed(true);
    notify(`Subscribed to ${stream.streamer}! ⭐`);
    setSubscribing(false);
  };

  // ── Top gifters ──────────────────────────────────────────
  const addGifter = (amount) => {
    if (!user) return;
    const name = profile?.full_name?.split(" ")[0] || profile?.username || "Anon";
    setTopGifters(prev => ({ ...prev, [user.id]: { name, total: (prev[user.id]?.total || 0) + amount } }));
  };

  // ── Stream polls ─────────────────────────────────────────
  const createPoll = () => {
    if (!pollForm.question.trim()) { notify("Enter a poll question"); return; }
    const opts = pollForm.options.filter(o => o.trim());
    if (opts.length < 2) { notify("Add at least 2 options"); return; }
    const poll = { question: pollForm.question.trim(), options: opts, votes: Object.fromEntries(opts.map(o => [o, 0])) };
    setActivePoll(poll); setPollVoted(null);
    setShowPollCreator(false); setPollForm({ question: "", options: ["", ""] });
    pollChRef.current?.send({ type: "broadcast", event: "poll_start", payload: poll });
  };

  const votePoll = (opt) => {
    if (pollVoted || !activePoll) return;
    setPollVoted(opt);
    setActivePoll(p => ({ ...p, votes: { ...p.votes, [opt]: (p.votes[opt] || 0) + 1 } }));
    pollChRef.current?.send({ type: "broadcast", event: "poll_vote", payload: { opt } });
  };

  const endPoll = () => {
    setActivePoll(null); setPollVoted(null);
    pollChRef.current?.send({ type: "broadcast", event: "poll_end", payload: {} });
  };

  // ── Clips gallery ─────────────────────────────────────────
  const fetchAllClips = async () => {
    setLoadingClips(true);
    const { data } = await supabase.from("clips").select("*, profiles(username, full_name)").order("created_at", { ascending: false }).limit(50);
    setAllClips(data || []); setLoadingClips(false);
  };

  // ── Past streams ──────────────────────────────────────────
  const savePastStream = async () => {
    if (!user) return;
    const { data: sd } = await supabase.from("streams").select("title,category,mux_playback_id,viewer_count").eq("user_id", user.id).single();
    if (sd) {
      await supabase.from("past_streams").insert({
        user_id: user.id, streamer_name: profile?.full_name || profile?.username || "Streamer",
        title: sd.title, category: sd.category, mux_playback_id: sd.mux_playback_id, peak_viewers: sd.viewer_count || 0,
      });
    }
  };

  const fetchPastStreams = async (userId) => {
    const { data } = await supabase.from("past_streams").select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(12);
    setPastStreams(data || []);
  };

  // ── Coin shop ──────────────────────────────────────────
  const buyShopItem = async (name, cost, profileUpdate) => {
    if (!requireAuth()) return;
    if (coinsRef.current < cost) { notify(`Need ${cost.toLocaleString()} coins!`); return; }
    const nc = coinsRef.current - cost;
    setCoins(nc); coinsRef.current = nc;
    await supabase.from("profiles").update({ coins: nc, ...profileUpdate }).eq("id", user.id);
    setProfile(p => p ? { ...p, ...profileUpdate } : p);
    logTransaction("shop_purchase", -cost, `Bought ${name}`);
    notify(`${name} unlocked! ✨`);
  };

  const executeRaid = (target) => {
    setShowRaidModal(false);
    notify(`Raiding ${target.streamer_name}!`);
    go("stream", {
      id: target.id, title: target.title, streamer: target.streamer_name,
      isRealStream: true, mux_playback_id: target.mux_playback_id,
      user_id: target.user_id, viewers: target.viewer_count || 0,
      game: target.category || "Live", bg: "135deg,#1a1a2e,#16213e", emoji: "🎙", color: "#7c3aed",
    });
  };

  // ── Viewer profiles ──────────────────────────────────────
  const viewVProfile = async (userId) => {
    if (!userId) return;
    setLoadingVProfile(true);
    const [profRes, txnRes] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", userId).single(),
      supabase.from("transactions").select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(20),
    ]);
    if (profRes.data) {
      setVProfile(profRes.data);
      setVProfileTxns(txnRes.data || []);
      setPage("vprofile");
      window.scrollTo(0, 0);
    }
    setLoadingVProfile(false);
  };

  // ── Chat moderation ──────────────────────────────────────
  const banUser = async (bannedId, bannedName) => {
    if (!user || !stream?.user_id || user.id !== stream.user_id) return;
    setChatBans(b => new Set([...b, bannedId]));
    await supabase.from("chat_bans").upsert({ streamer_id: user.id, banned_user_id: bannedId });
    notify(`${bannedName} banned from chat`);
    setMsgMenuId(null);
  };

  const unbanUser = async (bannedId) => {
    if (!user) return;
    setChatBans(b => { const n = new Set(b); n.delete(bannedId); return n; });
    await supabase.from("chat_bans").delete().eq("streamer_id", user.id).eq("banned_user_id", bannedId);
    notify("User unbanned");
  };

  const timeoutUser = (bannedId, bannedName, minutes) => {
    setChatBans(b => new Set([...b, bannedId]));
    setTimeout(() => setChatBans(b => { const n = new Set(b); n.delete(bannedId); return n; }), minutes * 60 * 1000);
    notify(`${bannedName} timed out for ${minutes} min`);
    setMsgMenuId(null);
  };

  const startSlowCooldown = () => {
    if (!slowModeSecs) return;
    setSlowCooldown(slowModeSecs);
    if (slowTimerRef.current) clearInterval(slowTimerRef.current);
    slowTimerRef.current = setInterval(() => {
      setSlowCooldown(c => {
        if (c <= 1) { clearInterval(slowTimerRef.current); return 0; }
        return c - 1;
      });
    }, 1000);
  };

  // Parses :emotename: tokens in a message string into text + <img> elements
  const parseMessage = (text) => {
    if (!streamEmotes.length || !text) return text;
    const parts = text.split(/(:[a-zA-Z0-9_]+:)/g);
    return parts.map((part, i) => {
      const m = part.match(/^:([a-zA-Z0-9_]+):$/);
      if (m) {
        const emote = streamEmotes.find(e => e.name === m[1]);
        if (emote) return <img key={i} src={emote.image_url} alt={part} title={part} style={{ height: 24, width: 24, verticalAlign: "middle", display: "inline-block", objectFit: "contain", borderRadius: 3, marginInline: 2 }} />;
      }
      return part;
    });
  };
  // ────────────────────────────────────────────────────────

  // Coin earning — tick speed scales with streak (faster ticks = more coins/sec)
  const tickMs = streakDays >= 14 ? 450 : streakDays >= 7 ? 600 : streakDays >= 3 ? 720 : 900;
  useEffect(() => {
    if (page !== "stream") return;
    const t = setInterval(() => {
      setSess(s => s + 1);
      setCoins(c => c + 1);
    }, tickMs);
    return () => clearInterval(t);
  }, [page, tickMs]);

  // Sync earned coins to Supabase every 15s while watching
  useEffect(() => {
    if (page !== "stream" || !user) return;
    const uid = user.id;
    const syncT = setInterval(() => {
      supabase.from("profiles").update({ coins: coinsRef.current }).eq("id", uid);
    }, 15000);
    return () => {
      clearInterval(syncT);
      const earned = sessRef.current;
      supabase.from("profiles").update({ coins: coinsRef.current }).eq("id", uid);
      if (earned > 0) supabase.from("transactions").insert({ user_id: uid, type: "watch", amount: earned, description: `Watched "${stream?.title || "a stream"}"` });
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

  // Presence-based live viewer count
  useEffect(() => {
    if (page !== "stream" || !stream?.isRealStream) { setViewerCount(0); return; }
    const key = user?.id || `guest-${Math.random().toString(36).slice(2)}`;
    const presenceCh = supabase.channel(`pres-${stream.id}`, { config: { presence: { key } } })
      .on("presence", { event: "sync" }, () => {
        setViewerCount(Object.keys(presenceCh.presenceState()).length);
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") await presenceCh.track({ joined: Date.now() });
      });
    return () => supabase.removeChannel(presenceCh);
  }, [page, stream?.id, stream?.isRealStream]);

  // Poll broadcast channel
  useEffect(() => {
    if (page !== "stream" || !stream?.id) { pollChRef.current = null; return; }
    const ch = supabase.channel(`polls-${stream.id}`)
      .on("broadcast", { event: "poll_start" }, ({ payload }) => { setActivePoll(payload); setPollVoted(null); })
      .on("broadcast", { event: "poll_vote" }, ({ payload }) => {
        setActivePoll(p => p ? { ...p, votes: { ...p.votes, [payload.opt]: (p.votes[payload.opt] || 0) + 1 } } : p);
      })
      .on("broadcast", { event: "poll_end" }, () => { setActivePoll(null); setPollVoted(null); })
      .subscribe();
    pollChRef.current = ch;
    return () => { supabase.removeChannel(ch); pollChRef.current = null; };
  }, [page, stream?.id]);

  // Load moderation state when entering a stream as the streamer
  useEffect(() => {
    if (page === "stream" && stream?.isRealStream && user?.id === stream?.user_id) {
      supabase.from("chat_bans").select("banned_user_id").eq("streamer_id", user.id).then(({ data }) => {
        setChatBans(new Set((data || []).map(b => b.banned_user_id)));
      });
      setSlowModeSecs(stream.slow_mode || 0);
      setSubOnly(stream.sub_only_chat || false);
    }
  }, [page, stream?.id]);

  // Check follow status whenever we enter a stream (reset first, then query DB)
  useEffect(() => {
    setFollowing(false);
    if (page === "stream") checkFollowing(stream);
  }, [page, stream?.id, user?.id]);

  // Update streak when entering a stream
  useEffect(() => {
    if (page === "stream" && user) updateStreak();
  }, [page]);

  // Notification detection: fire when a followed streamer goes live
  useEffect(() => {
    const currentIds = new Set(liveStreams.map(s => s.id));
    if (user && myFollows.length > 0) {
      const newlyLive = liveStreams.filter(s => !prevLiveIdsRef.current.has(s.id) && myFollows.includes(s.user_id));
      if (newlyLive.length > 0) {
        const newNotifs = newlyLive.map(s => ({
          id: s.id,
          title: `${s.profiles?.full_name || s.streamer_name || "Someone"} is live!`,
          body: s.title,
          stream: formatDbStream(s),
          time: new Date(),
        }));
        setNotifications(n => [...newNotifs, ...n].slice(0, 20));
        setUnreadNotifs(c => c + newlyLive.length);
        if (newlyLive.length === 1) notify(`🔴 ${newlyLive[0].profiles?.full_name || "A streamer"} just went live!`);
        else notify(`🔴 ${newlyLive.length} streamers you follow just went live!`);
      }
    }
    prevLiveIdsRef.current = currentIds;
  }, [liveStreams]);

  // Refresh follows list when follow/unfollow happens (so notifications stay accurate)
  useEffect(() => {
    if (user) fetchMyFollows(user.id);
  }, [following]);

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
        a: m.username, t: m.content, c: m.color || "#ff2d55",
        sc: m.is_superchat, amt: m.coins_spent ? `${m.coins_spent.toLocaleString()} coins` : null,
        uid: m.user_id, badge: m.badge || null,
      })));
    };
    loadMessages();
    const channel = supabase.channel(`stream-${stream.id}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages", filter: `stream_id=eq.${stream.id}` }, (payload) => {
        const m = payload.new;
        setChat(l => [...l, {
          a: m.username, t: m.content, c: m.color || "#ff2d55",
          sc: m.is_superchat, amt: m.coins_spent ? `${m.coins_spent.toLocaleString()} coins` : null,
          uid: m.user_id, badge: m.badge || null,
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

  // Page-load data fetching
  useEffect(() => {
    if (page === "leaderboard") fetchLeaderboard();
    if (page === "dash" && user) { checkIsStreaming(user.id); fetchUpcomingSchedule(); fetchMyEmotes(); fetchTransactions(); fetchWithdrawHistory(); fetchStreamerAnalytics(); }
    if (page === "admin" && user?.email === "blankcoojnr@gmail.com") fetchAdminWithdrawals();
    if (page === "disc") fetchUpcomingSchedule();
    if (page === "wallet" && user) { fetchTransactions(); fetchWithdrawHistory(); }
    if (page === "stream" && stream?.id) {
      fetchStreamClips(stream.id);
      if (stream.user_id) { fetchStreamEmotes(stream.user_id); checkSubscription(stream.user_id); }
      setTopGifters({}); setActivePoll(null); setPollVoted(null);
    }
    if (page === "clips") fetchAllClips();
    if (page === "channel" && channelUser?.id) fetchPastStreams(channelUser.id);
  }, [page, user]);

  const handleSignUp = async () => {
    if (!formData.fullName || !formData.email || !formData.password) { setAuthError("Please fill in all fields"); return; }
    setLoading(true); setAuthError("");
    const { data, error } = await supabase.auth.signUp({ email: formData.email, password: formData.password });
    if (error) { setAuthError(error.message); setLoading(false); return; }
    if (data.user) {
      const username = await generateUniqueUsername(formData.fullName);
      const refCode = `${username.toUpperCase().slice(0, 8)}${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
      const { error: pe } = await supabase.from("profiles").insert({
        id: data.user.id, full_name: formData.fullName, username, role, coins: 1000, total_earned: 0, bio: "", follower_count: 0, referral_code: refCode,
      });
      if (pe) {
        await supabase.auth.signOut();
        setAuthError("Account setup failed — please try again.");
        setLoading(false);
        return;
      }
      // Log signup bonus
      await supabase.from("transactions").insert({ user_id: data.user.id, type: "signup_bonus", amount: 1000, description: "Welcome bonus" });
      // Apply referral if present
      const finalCoins = await applyReferral(data.user.id, formData.fullName, 1000);
      setProfile({ id: data.user.id, full_name: formData.fullName, username, role, coins: finalCoins, referral_code: refCode });
      setCoins(finalCoins);
      coinsRef.current = finalCoins;
      setReferralCode(refCode);
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
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email: formData.email, password: formData.password });
      if (error) { setAuthError(error.message); return; }
      if (data.user) {
        const profileData = await fetchProfile(data.user.id);
        notify("Welcome back!");
        go(profileData?.role === "streamer" ? "dash" : "disc");
      }
    } catch (err) {
      setAuthError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!formData.email) { setAuthError("Enter your email address first"); return; }
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(formData.email, { redirectTo: "https://www.stemapp.online/reset-password" });
    if (error) { setAuthError(error.message); } else { notify("Password reset email sent!"); }
    setLoading(false);
  };

  const handleLogout = async () => {
    setIsStreaming(false);
    await supabase.auth.signOut();
    notify("Logged out successfully");
  };

  const handleSaveProfile = async () => {
    if (!editProfile.fullName.trim() || !editProfile.username.trim()) { setProfileMsg("Please fill in all fields"); return; }
    if (editProfile.fullName.trim().length < 2) { setProfileMsg("Name must be at least 2 characters"); return; }
    if (editProfile.username.trim().length < 3 || editProfile.username.trim().length > 30) { setProfileMsg("Username must be 3–30 characters"); return; }
    if (!/^[a-zA-Z0-9_]+$/.test(editProfile.username.trim())) { setProfileMsg("Username can only contain letters, numbers and underscores"); return; }
    if (editProfile.bio && editProfile.bio.length > 300) { setProfileMsg("Bio must be under 300 characters"); return; }
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
            const earned = Math.round(50 * (1 + getStreakBonus(streakDays) / 100));
            const nc = coinsRef.current + earned;
            setCoins(nc); coinsRef.current = nc;
            supabase.from("profiles").update({ coins: nc }).eq("id", user.id);
            logTransaction("follow", earned, `Followed ${stream.streamer}`);
            notify(`+${earned} coins for following!`);
            showStreamAlert(`${profile?.full_name?.split(" ")[0] || "Someone"} just followed!`, "❤️", stream.streamer);
            supabase.rpc("increment_follower_count", { profile_id: stream.user_id });
          }
        }
      } else {
        // Demo stream — local state only
        if (following) {
          setFollowing(false); notify("Unfollowed");
        } else {
          setFollowing(true);
          const earned = Math.round(50 * (1 + getStreakBonus(streakDays) / 100));
          const nc = coinsRef.current + earned;
          setCoins(nc); coinsRef.current = nc;
          supabase.from("profiles").update({ coins: nc }).eq("id", user.id);
          notify(`+${earned} coins for following!`);
        }
      }
    } finally {
      setLoadingFollow(false);
    }
  };

  const sendChat = async () => {
    if (!requireAuth()) return;
    if (!msg.trim()) return;
    if (msg.trim().length > 500) { notify("Message too long (max 500 chars)"); return; }
    if (slowCooldown > 0) { notify(`Slow mode — wait ${slowCooldown}s`); return; }
    if (subOnly) { notify("Subscriber-only chat — subscribe to chat"); return; }
    const earned = Math.round(10 * (1 + getStreakBonus(streakDays) / 100));
    const nc = coinsRef.current + earned;
    await supabase.from("messages").insert({
      stream_id: stream.id, user_id: user.id,
      username: profile.full_name?.split(" ")[0] || profile.username || "User",
      content: msg.trim(), color: profile?.chat_color || "#ff2d55", is_superchat: false, coins_spent: 0, badge: profile?.badge || null,
    });
    setCoins(nc); coinsRef.current = nc;
    supabase.from("profiles").update({ coins: nc }).eq("id", user.id);
    logTransaction("chat", earned, `Chatted in "${stream.title}"`);
    setMsg(""); notify(`+${earned} coins!`);
    startSlowCooldown();
  };

  const sendGift = async (name, cost, emoji = "🎁") => {
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
    logTransaction("gift_sent", -c, `Sent ${name} to ${stream.streamer}`);
    notify(`${name} sent!`);
    triggerGiftAnim(emoji, name);
    showStreamAlert(`${profile?.full_name?.split(" ")[0] || "Someone"} sent a ${name}!`, emoji, `${c.toLocaleString()} coins`);
    addHype(c);
    addGifter(c);
  };

  const handleGoLive = async () => {
    if (!goLiveForm.title.trim()) { notify("Enter a stream title first!"); return; }
    setSavingGoLive(true);
    try {
      // Create Mux live stream
      const res = await fetch("/api/mux-create", { method: "POST" });
      const muxData = await res.json();
      if (!res.ok || muxData.error) throw new Error(muxData.error || "Failed to create Mux stream");

      const { streamId, streamKey, playbackId, rtmpUrl } = muxData;

      // Save stream to Supabase with Mux IDs
      const { error } = await supabase.from("streams").upsert({
        user_id: user.id,
        title: goLiveForm.title.trim(),
        category: goLiveForm.category,
        status: "live",
        streamer_name: profile?.full_name || profile?.username || "Streamer",
        viewer_count: 0,
        mux_stream_id: streamId,
        mux_playback_id: playbackId,
        updated_at: new Date().toISOString(),
      }, { onConflict: "user_id" });

      if (error) throw new Error(error.message);

      setMuxStreamId(streamId);
      setMuxStreamKey(streamKey);
      setMuxPlaybackId(playbackId);
      setIsStreaming(true);
      setGoLiveStep(2);
    } catch (err) {
      notify(`Error: ${err.message}`);
      console.error(err);
    }
    setSavingGoLive(false);
  };

  const handleEndStream = async () => {
    await savePastStream();
    if (muxStreamId) {
      await fetch("/api/mux-end", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ muxStreamId }),
      });
    }
    await supabase.from("streams").update({
      status: "offline",
      mux_stream_id: null,
      mux_playback_id: null,
      updated_at: new Date().toISOString(),
    }).eq("user_id", user.id);
    setIsStreaming(false);
    setMuxStreamId(""); setMuxStreamKey(""); setMuxPlaybackId("");
    notify("Stream ended.");
    startRaid();
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
      mux_playback_id: s.mux_playback_id || null,
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

  const isApp = ["disc", "stream", "wallet", "dash", "profile", "leaderboard", "channel", "vprofile", "clips", "admin"].includes(page);
  const firstName = profile?.full_name?.split(" ")[0] || "";
  const initials = profile?.full_name?.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) || "?";
  const rankColor = (i) => i === 0 ? "var(--gold)" : i === 1 ? "rgba(255,255,255,.6)" : i === 2 ? "#cd7f32" : "var(--muted)";
  const rankEmoji = (i) => i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}`;

  const isStreamOwner = user?.id === stream?.user_id;

  const ChatMessages = () => (
    <>
      {chat.length === 0 && (
        <div style={{ fontSize: 12, color: "var(--muted)", textAlign: "center", padding: "12px 0" }}>
          {user ? "Be first to chat! +10 coins per message" : "Sign in to chat and earn coins"}
        </div>
      )}
      {chat.filter(m => !chatBans.has(m.uid)).map((m, i) => (
        <div key={i} className={`cmsg ${m.sc ? "sc" : ""} mod-msg-wrap`} style={{ display: "block" }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 4 }}>
            <div style={{ flex: 1 }}>
              {m.sc && <div style={{ fontSize: 10, color: "var(--gold)", fontWeight: 700, marginBottom: 3 }}>🪙 {m.amt}</div>}
              {m.badge && <span style={{ fontSize: 12, marginRight: 3 }}>{m.badge}</span>}
              <span className="cmsg-a" style={{ color: m.c, cursor: m.uid ? "pointer" : "default" }}
                onClick={() => m.uid && viewVProfile(m.uid)}>{m.a}</span>
              <span className="cmsg-t" style={{ marginLeft: 6 }}>{parseMessage(m.t)}</span>
            </div>
            {isStreamOwner && m.uid && m.uid !== user.id && (
              <div style={{ position: "relative", flexShrink: 0 }}>
                <button onClick={() => setMsgMenuId(msgMenuId === i ? null : i)} style={{ background: "none", border: "none", color: "var(--muted)", cursor: "pointer", fontSize: 13, lineHeight: 1, padding: "2px 4px" }}>⋮</button>
                {msgMenuId === i && (
                  <>
                    <div style={{ position: "fixed", inset: 0, zIndex: 55 }} onClick={() => setMsgMenuId(null)} />
                    <div className="mod-menu">
                      <button className="mod-menu-btn" style={{ color: "var(--orange)" }} onClick={() => timeoutUser(m.uid, m.a, 5)}>Timeout 5 min</button>
                      <button className="mod-menu-btn" style={{ color: "var(--orange)", borderTop: "1px solid var(--line)" }} onClick={() => timeoutUser(m.uid, m.a, 60)}>Timeout 1 hr</button>
                      <button className="mod-menu-btn" style={{ color: "var(--red)", borderTop: "1px solid var(--line)" }} onClick={() => banUser(m.uid, m.a)}>Ban User</button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      ))}
    </>
  );

  return (<>
    <style>{FONTS}</style><style>{CSS}</style>

    {/* NAV */}
    <nav className="nav">
      <div className="logo" onClick={() => go("disc")} title="Home">STEM</div>
      <div className="nav-c">
        {user ? (
          (mode === "viewer"
            ? [["disc", "Home"], ["leaderboard", "Top Earners"], ["clips", "Clips"], ["wallet", "Wallet"], ["profile", "Profile"]]
            : [["disc", "Home"], ["dash", "Dashboard"], ["wallet", "Wallet"], ["profile", "Profile"]]
          ).map(([p, l]) => (
            <button key={p} className={`nl ${page === p || (page === "stream" && p === "disc") ? "on" : ""}`} onClick={() => go(p)}>{l}</button>
          )).concat(user?.email === "blankcoojnr@gmail.com" ? [<button key="admin" className={`nl ${page === "admin" ? "on" : ""}`} style={{ color: "var(--red)" }} onClick={() => setPage("admin")}>⚙ Admin</button>] : [])
        ) : (
          <>
            <button className={`nl ${page === "disc" || page === "stream" ? "on" : ""}`} onClick={() => go("disc")}>Home</button>
            {page === "stream" && (
              <button className="nl" onClick={() => go("disc")} style={{ color: "var(--muted)", display: "flex", alignItems: "center", gap: 4 }}>← Back</button>
            )}
          </>
        )}
      </div>
      <div className="nav-r">
        {user && isApp && <>
          <div className="mode-toggle">
            <button className={`mode-btn ${mode === "viewer" ? "on" : ""}`} onClick={() => switchMode("viewer")}>👁</button>
            <button className={`mode-btn ${mode === "streamer" ? "on" : ""}`} onClick={() => switchMode("streamer")}>🎙</button>
          </div>
          {/* Notification bell */}
          <div style={{ position: "relative", cursor: "pointer", lineHeight: 1 }} onClick={() => { setShowNotifs(v => !v); setUnreadNotifs(0); }}>
            <span style={{ fontSize: 19 }}>🔔</span>
            {unreadNotifs > 0 && (
              <span style={{ position: "absolute", top: -4, right: -5, background: "var(--red)", color: "#fff", fontSize: 9, fontWeight: 800, borderRadius: "50%", minWidth: 16, height: 16, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 3px" }}>
                {unreadNotifs > 9 ? "9+" : unreadNotifs}
              </span>
            )}
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

    {/* NOTIFICATION PANEL */}
    {showNotifs && user && (
      <>
        <div style={{ position: "fixed", inset: 0, zIndex: 299 }} onClick={() => setShowNotifs(false)} />
        <div style={{ position: "fixed", top: 66, right: 12, width: 310, background: "var(--ink2)", border: "1px solid var(--line2)", borderRadius: 16, zIndex: 300, boxShadow: "0 8px 40px rgba(0,0,0,.6)", overflow: "hidden" }}>
          <div style={{ padding: "14px 16px", borderBottom: "1px solid var(--line)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontFamily: "Bebas Neue,sans-serif", fontSize: 18, letterSpacing: .5 }}>Notifications</span>
            <button onClick={() => setShowNotifs(false)} style={{ background: "none", border: "none", color: "var(--muted)", cursor: "pointer", fontSize: 16 }}>✕</button>
          </div>
          {notifications.length === 0 ? (
            <div style={{ padding: "32px 20px", textAlign: "center", color: "var(--muted)" }}>
              <div style={{ fontSize: 32, marginBottom: 10 }}>🔔</div>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>No notifications yet</div>
              <div style={{ fontSize: 12 }}>Follow streamers to get notified when they go live</div>
            </div>
          ) : (
            <div style={{ maxHeight: 360, overflowY: "auto" }}>
              {notifications.map((n, i) => (
                <div key={i} onClick={() => { go("stream", n.stream); setShowNotifs(false); }} style={{ padding: "12px 16px", borderBottom: "1px solid var(--line)", cursor: "pointer", display: "flex", gap: 12, alignItems: "flex-start", transition: "background .15s" }}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,.03)"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                  <span style={{ fontSize: 20, flexShrink: 0, marginTop: 1 }}>🔴</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 2 }}>{n.title}</div>
                    <div style={{ fontSize: 12, color: "var(--muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{n.body}</div>
                    <div style={{ fontSize: 10, color: "var(--muted)", marginTop: 4 }}>{n.time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</div>
                  </div>
                  <span style={{ fontSize: 11, color: "var(--purple)", fontWeight: 700, flexShrink: 0, marginTop: 3 }}>Watch →</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </>
    )}

    {/* MOBILE BOTTOM NAV */}
    {isApp && (
      <div className="bottom-nav">
        <div className="bottom-nav-items">
          {user ? (
            (mode === "viewer"
              ? [["disc", "🏠", "Home"], ["leaderboard", "🏆", "Top"], ["clips", "✂️", "Clips"], ["wallet", "🪙", "Wallet"], ["profile", "👤", "Me"]]
              : [["disc", "🏠", "Home"], ["dash", "📊", "Dash"], ["clips", "✂️", "Clips"], ["wallet", "🪙", "Wallet"], ["profile", "👤", "Me"]]
            ).map(([p, icon, l]) => {
              const isOn = page === p || (page === "stream" && p === "disc") || (page === "vprofile" && p === "leaderboard");
              return (
                <button key={p} className={`bn-item ${isOn ? "on" : ""}`} onClick={() => go(p)}>
                  <div style={{ position: "relative", lineHeight: 1 }}>
                    <span className="bn-icon">{icon}</span>
                    {/* Unread notification dot on Home */}
                    {p === "disc" && unreadNotifs > 0 && (
                      <span style={{ position: "absolute", top: -3, right: -5, background: "var(--red)", borderRadius: "50%", width: 8, height: 8, display: "block" }} />
                    )}
                    {/* Coin value badge on Wallet */}
                    {p === "wallet" && coins >= 1000 && (
                      <span style={{ position: "absolute", top: -6, right: -14, background: "var(--gold)", color: "#000", fontSize: 8, fontWeight: 800, borderRadius: 10, padding: "1px 5px", whiteSpace: "nowrap" }}>
                        ${(coins / 1000).toFixed(0)}
                      </span>
                    )}
                  </div>
                  <span className="bn-label">{l}</span>
                </button>
              );
            }).concat(user?.email === "blankcoojnr@gmail.com" ? [
              <button key="admin" className={`bn-item ${page === "admin" ? "on" : ""}`} onClick={() => setPage("admin")} style={{ color: page === "admin" ? "var(--red)" : "var(--muted)" }}>
                <span className="bn-icon">⚙️</span><span className="bn-label">Admin</span>
              </button>
            ] : [])
          ) : (
            <>
              <button className={`bn-item ${page === "disc" || page === "stream" ? "on" : ""}`} onClick={() => go("disc")}>
                <span className="bn-icon">🏠</span>
                <span className="bn-label">Home</span>
              </button>
              <button className="bn-item" onClick={() => { setAuthMode("login"); go("auth"); }}>
                <span className="bn-icon">👤</span>
                <span className="bn-label">Log In</span>
              </button>
              <button className="bn-item" onClick={() => { setAuthMode("signup"); go("auth"); }}>
                <span className="bn-icon">✨</span>
                <span className="bn-label">Sign Up</span>
              </button>
            </>
          )}
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
      <div style={{ position: "absolute", top: 70, left: 0, right: 0, textAlign: "center" }}>
        <button onClick={() => go("disc")} style={{ background: "none", border: "none", color: "var(--muted)", fontSize: 13, cursor: "pointer" }}>← Browse without account</button>
      </div>
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
      <div className="cats">{CATS.map(c => {
        const count = c === "All" ? allStreams.length : allStreams.filter(s => s.game === c || s.game.includes(c)).length;
        return (
          <button key={c} className={`cat ${cat === c ? "on" : ""}`} onClick={() => setCat(c)}>
            {CAT_META[c] ? `${CAT_META[c].emoji} ` : ""}{c}{count > 0 && c !== "All" ? <span style={{ fontSize: 9, opacity: .7, marginLeft: 4 }}>{count}</span> : ""}
          </button>
        );
      })}</div>
      {liveStreams.length > 0 && !search && cat === "All" && (
        <div className="live-banner">
          <div className="live-dot" />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 700 }}>{liveStreams.length} streamer{liveStreams.length !== 1 ? "s" : ""} live right now</div>
            <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>Real streams from STEM creators — appearing at the top</div>
          </div>
        </div>
      )}
      {upcomingSchedule.length > 0 && !search && cat === "All" && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontFamily: "Bebas Neue,sans-serif", fontSize: 18, letterSpacing: .5, marginBottom: 10 }}>📅 Upcoming Streams</div>
          <div style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 6 }}>
            {upcomingSchedule.map(s => {
              const d = new Date(s.scheduled_at);
              return (
                <div key={s.id} style={{ background: "var(--card)", border: "1px solid var(--line)", borderRadius: 12, padding: "12px 14px", minWidth: 180, flexShrink: 0 }}>
                  <div style={{ fontSize: 11, color: "var(--purple)", fontWeight: 700, marginBottom: 4 }}>{d.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" })}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.title}</div>
                  <div style={{ fontSize: 11, color: "var(--muted)", marginBottom: 4 }}>{s.profiles?.full_name || "Streamer"}</div>
                  <div style={{ fontSize: 11, color: "var(--muted)" }}>{d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      {/* Trending section — top 3 by viewers when no filter active */}
      {!search && cat === "All" && allStreams.length >= 3 && (
        <div style={{ marginBottom: 22 }}>
          <div style={{ fontFamily: "Bebas Neue,sans-serif", fontSize: 18, letterSpacing: .5, marginBottom: 10 }}>🔥 Trending Now</div>
          <div className="trending-strip">
            {[...allStreams].sort((a, b) => b.viewers - a.viewers).slice(0, 3).map((s, idx) => (
              <div key={s.id} className="trending-card" onClick={() => go("stream", s)}>
                <div className="trend-num">#{idx + 1}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: s.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>{s.emoji}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.title}</div>
                    <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 1 }}>{s.streamer}</div>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span className="stag">{s.game}</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "var(--red)" }}>👁 {s.viewers.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <span style={{ fontFamily: "Bebas Neue,sans-serif", fontSize: 18, letterSpacing: .5 }}>
          {search ? `Results for "${search}"` : cat !== "All" ? `${cat} Streams` : "🔴 All Live"}
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
                <div className="sc-av" style={{ background: s.color, cursor: s.isRealStream && s.user_id ? "pointer" : "default" }}
                  onClick={s.isRealStream && s.user_id ? (e) => { e.stopPropagation(); viewChannel(s.user_id); } : undefined}
                >{s.emoji}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="sc-title">{s.title}</div>
                  <div className="sc-name" style={{ cursor: s.isRealStream && s.user_id ? "pointer" : "default", textDecoration: s.isRealStream && s.user_id ? "underline" : "none", textDecorationColor: "rgba(255,255,255,.2)" }}
                    onClick={s.isRealStream && s.user_id ? (e) => { e.stopPropagation(); viewChannel(s.user_id); } : undefined}
                  >{s.streamer}</div>
                </div>
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
          {/* Stream alert overlay */}
          {streamAlert && (
            <div className="stream-alert">
              <span style={{ fontSize: 28, flexShrink: 0 }}>{streamAlert.emoji}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: "#fff" }}>{streamAlert.msg}</div>
                {streamAlert.sub && <div style={{ fontSize: 11, color: "rgba(255,255,255,.7)", marginTop: 2 }}>{streamAlert.sub}</div>}
              </div>
            </div>
          )}
          {/* Back button — always visible over the player */}
          <button onClick={() => go("disc")} style={{ position: "absolute", top: 10, left: 10, zIndex: 20, background: "rgba(0,0,0,.65)", border: "none", color: "#fff", borderRadius: 8, padding: "6px 12px", fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 5, backdropFilter: "blur(6px)" }}>
            ← Home
          </button>
          {/* Viewer count pill */}
          <div className="viewer-count-pill">
            <span style={{ width: 7, height: 7, background: "var(--red)", borderRadius: "50%", animation: "blink 1.6s infinite", flexShrink: 0 }} />
            {(viewerCount || stream.viewers || 0).toLocaleString()} watching
          </div>
          {/* Fullscreen button */}
          <button className="fs-btn" title="Fullscreen" onClick={() => {
            const el = document.querySelector(".splayer");
            if (!document.fullscreenElement) { (el.requestFullscreen || el.webkitRequestFullscreen || (() => {})).call(el); }
            else { (document.exitFullscreen || document.webkitExitFullscreen || (() => {})).call(document); }
          }}>⛶</button>
          {stream.mux_playback_id ? (
            <MuxPlayer
              playbackId={stream.mux_playback_id}
              streamType="live"
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
              autoPlay
              muted
            />
          ) : (
            <div className="splayer-inner" style={{ background: `linear-gradient(${stream.bg})` }}>
              <div className="splayer-emoji">{stream.emoji}</div>
              <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                <span className="lpip" style={{ fontSize: 12, padding: "5px 14px" }}><span className="lpip-dot" />LIVE — {stream.viewers.toLocaleString()}</span>
                <span style={{ fontSize: 12, color: "rgba(255,255,255,.5)" }}>Earning coins while you watch</span>
              </div>
            </div>
          )}
        </div>
        <div className="sbelow">
          <div className="stitle">{stream.title}</div>
          <div className="sactions">
            <button className={`abtn ${following ? "flwing" : "flw"}`} onClick={handleFollow} disabled={loadingFollow}>
              {loadingFollow ? "..." : following ? "✓ Following" : "+ Follow"}
            </button>
            <button className="abtn" onClick={() => { navigator.clipboard?.writeText(window.location.href); notify("Link copied!"); }}>Share</button>
            <button className="abtn" onClick={() => { if (!requireAuth()) return; setShowClipModal(true); }}>✂ Clip</button>
            {stream.user_id && stream.user_id !== user?.id && (
              <button className="abtn" style={{ background: isSubscribed ? "rgba(0,245,160,.12)" : "", border: isSubscribed ? "1px solid rgba(0,245,160,.3)" : "", color: isSubscribed ? "var(--green)" : "" }} onClick={handleSubscribe} disabled={subscribing || isSubscribed}>
                {isSubscribed ? "⭐ Subscribed" : subscribing ? "…" : "⭐ Sub (1K coins)"}
              </button>
            )}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 0", borderTop: "1px solid var(--line)", borderBottom: "1px solid var(--line)", marginBottom: 14, cursor: stream.user_id ? "pointer" : "default" }} onClick={() => stream.user_id && viewChannel(stream.user_id)}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: stream.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>{stream.emoji}</div>
            <div style={{ flex: 1 }}><div style={{ fontSize: 14, fontWeight: 700 }}>{stream.streamer}</div><div style={{ fontSize: 11, color: "var(--muted)", marginTop: 1 }}>{stream.game} · 24,810 followers</div></div>
            {stream.user_id && <span style={{ fontSize: 11, color: "var(--purple)", flexShrink: 0 }}>View →</span>}
          </div>
          {user ? (
            <div className="earn-box">
              <div className="ebox-title">Session Earnings</div>
              {/* Streak badge */}
              {streakDays >= 2 && (
                <div style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(255,149,0,.1)", border: "1px solid rgba(255,149,0,.2)", borderRadius: 8, padding: "7px 10px", marginBottom: 10 }}>
                  <span style={{ fontSize: 18 }}>🔥</span>
                  <div style={{ flex: 1 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: "var(--orange)" }}>{streakDays}-day streak</span>
                    {streakDays >= 3 && <span style={{ fontSize: 11, color: "var(--muted)", marginLeft: 8 }}>+{getStreakBonus(streakDays)}% speed boost</span>}
                  </div>
                  {streakDays < 3 && <span style={{ fontSize: 11, color: "var(--muted)" }}>{3 - streakDays} day{3 - streakDays > 1 ? "s" : ""} to bonus</span>}
                </div>
              )}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                <div><div className="ebig">+{sess}</div><div style={{ fontSize: 11, color: "var(--muted)", marginTop: 1 }}>coins this session</div></div>
                <div style={{ textAlign: "right" }}><div style={{ fontFamily: "Bebas Neue,sans-serif", fontSize: 24, color: "var(--gold)" }}>🪙 {coins.toLocaleString()}</div><div style={{ fontSize: 10, color: "var(--muted)", marginTop: 1 }}>total balance</div></div>
              </div>
              <div className="ecells">
                <div className="ecell"><div className="ecell-v" style={{ color: "var(--green)" }}>+4/hr</div><div className="ecell-l">Ad share</div></div>
                <div className="ecell">
                  <div className="ecell-v" style={{ color: "var(--gold)" }}>+{Math.round(10 * (1 + getStreakBonus(streakDays) / 100))}</div>
                  <div className="ecell-l">Per chat</div>
                </div>
                <div className="ecell">
                  <div className="ecell-v" style={{ color: streakDays >= 3 ? "var(--orange)" : "var(--muted)" }}>
                    {streakDays >= 3 ? `+${getStreakBonus(streakDays)}%` : "1x"}
                  </div>
                  <div className="ecell-l">{streakDays >= 3 ? "Bonus" : "Streak"}</div>
                </div>
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
          {/* Top gifters this session */}
          {Object.keys(topGifters).length > 0 && (
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: .6, color: "var(--muted)", textTransform: "uppercase", marginBottom: 6 }}>Top Gifters</div>
              <div className="gifters-strip">
                {Object.entries(topGifters).sort((a,b) => b[1].total - a[1].total).slice(0,5).map(([uid, g], i) => (
                  <span key={uid} className="gifter-chip">{["🥇","🥈","🥉","4️⃣","5️⃣"][i]} {g.name} · {g.total.toLocaleString()}</span>
                ))}
              </div>
            </div>
          )}

          {/* Active poll */}
          {activePoll && (() => {
            const totalVotes = Object.values(activePoll.votes).reduce((s,v) => s+v, 0);
            return (
              <div className="poll-card">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>📊 {activePoll.question}</div>
                  {user?.id === stream?.user_id && <button onClick={endPoll} style={{ background: "none", border: "none", color: "var(--muted)", fontSize: 12, cursor: "pointer" }}>End</button>}
                </div>
                {activePoll.options.map(opt => {
                  const pct = totalVotes ? Math.round((activePoll.votes[opt] || 0) / totalVotes * 100) : 0;
                  return (
                    <button key={opt} className={`poll-opt ${pollVoted === opt ? "voted" : ""}`} onClick={() => votePoll(opt)} disabled={!!pollVoted}>
                      <div className="poll-bar" style={{ width: pollVoted ? `${pct}%` : "0%" }} />
                      <span style={{ position: "relative" }}>{opt}{pollVoted && <span style={{ float: "right", fontWeight: 700, color: "var(--purple)" }}>{pct}%</span>}</span>
                    </button>
                  );
                })}
                <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 6 }}>{totalVotes} vote{totalVotes !== 1 ? "s" : ""}</div>
              </div>
            );
          })()}

          {/* Poll creator (streamer only) */}
          {user?.id === stream?.user_id && !activePoll && showPollCreator && (
            <div style={{ background: "var(--ink3)", border: "1px solid var(--line)", borderRadius: 14, padding: 14, marginBottom: 12 }}>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10 }}>Create Poll</div>
              <input className="fi" style={{ margin: "0 0 8px", fontSize: 13 }} placeholder="Poll question…" value={pollForm.question} onChange={e => setPollForm(f => ({ ...f, question: e.target.value }))} />
              {pollForm.options.map((o, i) => (
                <input key={i} className="fi" style={{ margin: "0 0 6px", fontSize: 13 }} placeholder={`Option ${i+1}`} value={o} onChange={e => { const ops = [...pollForm.options]; ops[i] = e.target.value; setPollForm(f => ({ ...f, options: ops })); }} />
              ))}
              {pollForm.options.length < 4 && <button onClick={() => setPollForm(f => ({ ...f, options: [...f.options, ""] }))} style={{ background: "none", border: "none", color: "var(--purple)", fontSize: 12, cursor: "pointer", marginBottom: 8 }}>+ Add option</button>}
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={createPoll} className="btn-g" style={{ flex: 1, padding: "8px 0", fontSize: 13 }}>Launch Poll</button>
                <button onClick={() => setShowPollCreator(false)} style={{ background: "none", border: "1px solid var(--line)", color: "var(--muted)", borderRadius: 10, padding: "8px 14px", cursor: "pointer", fontSize: 13 }}>Cancel</button>
              </div>
            </div>
          )}

          {/* Hype Train */}
          {hypeProgress > 0 && (
            <div className="hype-wrap">
              {hypeCelebrating ? (
                <div className="hype-celebrate">🚂 HYPE TRAIN! Keep it going! 🔥</div>
              ) : (
                <>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: "var(--gold)" }}>🚂 Hype Train</span>
                    <span style={{ fontSize: 11, color: "var(--muted)" }}>{hypeProgress}%</span>
                  </div>
                  <div className="hype-bar"><div className="hype-bar-fill" style={{ width: `${hypeProgress}%` }} /></div>
                </>
              )}
            </div>
          )}
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: .6, color: "var(--muted)", textTransform: "uppercase", marginBottom: 8 }}>Send a gift</div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {[["🌟", "Star", "1,000"], ["🏆", "Trophy", "5,000"], ["👑", "Crown", "10,000"], ["🚀", "Rocket", "2,500"]].map(([e, n, c]) => (
                <div key={n} className="gift" onClick={() => sendGift(n, c, e)}><span className="gift-e">{e}</span><div className="gift-c">🪙 {c}</div><div className="gift-n">{n}</div></div>
              ))}
            </div>
            {/* Quick reactions — free, just for fun */}
            <div className="react-bar">
              {["👍","❤️","😂","😮","🔥"].map(e => (
                <button key={e} className="react-btn" onClick={() => triggerGiftAnim(e, "")}>{e}</button>
              ))}
            </div>
          </div>
          {/* Clips */}
          {streamClips.length > 0 && (
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: .6, color: "var(--muted)", textTransform: "uppercase", marginBottom: 8 }}>Recent Clips</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {streamClips.map(clip => (
                  <div key={clip.id} style={{ background: "var(--ink3)", border: "1px solid var(--line)", borderRadius: 10, padding: "10px 12px", display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 16 }}>✂</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{clip.title}</div>
                      <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>by {clip.profiles?.full_name || "viewer"}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {/* Mobile chat */}
          <div className="chat-section">
            <div className="chat-hd">
              <span className="chat-hd-title">Live Chat</span>
              <div style={{ display: "flex", align: "center", gap: 8 }}>
                {isStreamOwner && !activePoll && (
                  <button onClick={() => setShowPollCreator(p => !p)} style={{ background: showPollCreator ? "rgba(124,58,237,.2)" : "var(--ink3)", border: "1px solid var(--line2)", color: showPollCreator ? "var(--purple)" : "var(--muted)", borderRadius: 6, fontSize: 10, padding: "3px 8px", cursor: "pointer", fontWeight: 700 }}>📊 Poll</button>
                )}
                {isStreamOwner && (
                  <div style={{ display: "flex", gap: 6 }}>
                    <select value={slowModeSecs} onChange={e => setSlowModeSecs(Number(e.target.value))} style={{ background: "var(--ink3)", border: "1px solid var(--line2)", color: "#fff", borderRadius: 6, fontSize: 10, padding: "2px 6px", cursor: "pointer" }}>
                      <option value={0}>No slow</option>
                      <option value={10}>10s</option>
                      <option value={30}>30s</option>
                      <option value={60}>1 min</option>
                    </select>
                    <button onClick={() => setSubOnly(v => !v)} style={{ background: subOnly ? "rgba(124,58,237,.2)" : "var(--ink3)", border: subOnly ? "1px solid var(--purple)" : "1px solid var(--line2)", color: subOnly ? "var(--purple)" : "var(--muted)", borderRadius: 6, fontSize: 10, padding: "2px 8px", cursor: "pointer", fontWeight: 700 }}>Sub</button>
                  </div>
                )}
                <span style={{ fontSize: 11, color: "var(--muted)" }}>{(viewerCount || stream.viewers || 0).toLocaleString()} 👁</span>
              </div>
            </div>
            <div className="chat-msgs" ref={chatRef}><ChatMessages /></div>
            <div className="chat-foot">
              {user ? (
                <>
                  {slowCooldown > 0 && <div className="slow-badge">⏱ Slow mode — {slowCooldown}s</div>}
                  {slowModeSecs > 0 && slowCooldown === 0 && <div style={{ fontSize: 10, color: "var(--muted)", marginBottom: 4 }}>Slow mode: {slowModeSecs}s</div>}
                  <div className="chat-tip">+10 coins per message</div>
                  {showEmotePicker && streamEmotes.length > 0 && (
                    <div style={{ background: "var(--ink3)", border: "1px solid var(--line2)", borderRadius: 10, padding: 8, marginBottom: 6, display: "flex", flexWrap: "wrap", gap: 4, maxHeight: 120, overflowY: "auto" }}>
                      {streamEmotes.map(e => (
                        <img key={e.id} src={e.image_url} alt={`:${e.name}:`} title={`:${e.name}:`} onClick={() => setMsg(m => m + `:${e.name}: `)} style={{ width: 32, height: 32, objectFit: "contain", cursor: "pointer", borderRadius: 4, padding: 2 }} onMouseEnter={ev => ev.currentTarget.style.background = "rgba(255,255,255,.1)"} onMouseLeave={ev => ev.currentTarget.style.background = "transparent"} />
                      ))}
                    </div>
                  )}
                  <div className="chat-row">
                    {streamEmotes.length > 0 && (
                      <button onClick={() => setShowEmotePicker(v => !v)} style={{ background: showEmotePicker ? "rgba(124,58,237,.2)" : "var(--ink4)", border: "1px solid var(--line2)", color: "#fff", borderRadius: 8, padding: "0 10px", fontSize: 16, cursor: "pointer", flexShrink: 0, height: 38 }} title="Emotes">😄</button>
                    )}
                    <input className="chat-in" placeholder={slowCooldown > 0 ? `Wait ${slowCooldown}s...` : streamEmotes.length ? "Chat or pick an emote..." : "Say something..."} value={msg} onChange={e => setMsg(e.target.value)} onKeyDown={e => e.key === "Enter" && sendChat()} disabled={slowCooldown > 0} />
                    <button className="chat-send" onClick={sendChat} disabled={slowCooldown > 0}>↑</button>
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
        <div style={{ padding: "14px 16px", borderBottom: "1px solid var(--line)", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: isStreamOwner ? 8 : 0 }}>
            <span style={{ fontFamily: "Bebas Neue,sans-serif", fontSize: 18, letterSpacing: .5 }}>Live Chat</span>
            <span style={{ fontSize: 11, color: "var(--muted)" }}>{(viewerCount || stream.viewers || 0).toLocaleString()} 👁</span>
          </div>
          {isStreamOwner && (
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <select value={slowModeSecs} onChange={e => setSlowModeSecs(Number(e.target.value))} style={{ background: "var(--ink3)", border: "1px solid var(--line2)", color: "#fff", borderRadius: 6, fontSize: 11, padding: "3px 8px", cursor: "pointer", flex: 1 }}>
                <option value={0}>No slow mode</option>
                <option value={10}>Slow: 10s</option>
                <option value={30}>Slow: 30s</option>
                <option value={60}>Slow: 1 min</option>
              </select>
              <button onClick={() => setSubOnly(v => !v)} style={{ background: subOnly ? "rgba(124,58,237,.2)" : "var(--ink3)", border: subOnly ? "1px solid var(--purple)" : "1px solid var(--line2)", color: subOnly ? "var(--purple)" : "var(--muted)", borderRadius: 6, fontSize: 11, padding: "3px 12px", cursor: "pointer", fontWeight: 700, flexShrink: 0 }}>
                {subOnly ? "Sub Only ON" : "Sub Only"}
              </button>
            </div>
          )}
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: 12, display: "flex", flexDirection: "column", gap: 8 }} ref={chatRef2}><ChatMessages /></div>
        <div style={{ padding: 12, borderTop: "1px solid var(--line)", flexShrink: 0 }}>
          {user ? (
            <>
              {slowCooldown > 0 && <div className="slow-badge" style={{ marginBottom: 6 }}>⏱ Slow mode — wait {slowCooldown}s</div>}
              <div style={{ fontSize: 11, color: "var(--green)", fontWeight: 600, marginBottom: 6 }}>+10 coins per message</div>
              {showEmotePicker && streamEmotes.length > 0 && (
                <div style={{ background: "var(--ink3)", border: "1px solid var(--line2)", borderRadius: 10, padding: 8, marginBottom: 6, display: "flex", flexWrap: "wrap", gap: 4, maxHeight: 120, overflowY: "auto" }}>
                  {streamEmotes.map(e => (
                    <img key={e.id} src={e.image_url} alt={`:${e.name}:`} title={`:${e.name}:`} onClick={() => setMsg(m => m + `:${e.name}: `)} style={{ width: 32, height: 32, objectFit: "contain", cursor: "pointer", borderRadius: 4, padding: 2 }} onMouseEnter={ev => ev.currentTarget.style.background = "rgba(255,255,255,.1)"} onMouseLeave={ev => ev.currentTarget.style.background = "transparent"} />
                  ))}
                </div>
              )}
              <div className="chat-row">
                {streamEmotes.length > 0 && (
                  <button onClick={() => setShowEmotePicker(v => !v)} style={{ background: showEmotePicker ? "rgba(124,58,237,.2)" : "var(--ink4)", border: "1px solid var(--line2)", color: "#fff", borderRadius: 8, padding: "0 10px", fontSize: 16, cursor: "pointer", flexShrink: 0, height: 38 }} title="Emotes">😄</button>
                )}
                <input className="chat-in" placeholder={slowCooldown > 0 ? `Wait ${slowCooldown}s...` : streamEmotes.length ? "Chat or pick an emote..." : "Say something..."} value={msg} onChange={e => setMsg(e.target.value)} onKeyDown={e => e.key === "Enter" && sendChat()} disabled={slowCooldown > 0} />
                <button className="chat-send" onClick={sendChat} disabled={slowCooldown > 0}>↑</button>
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
              <div key={u.id} className="lb-row" style={{ cursor: "pointer" }} onClick={() => viewVProfile(u.id)}>
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
      {/* Streak card */}
      <div style={{ background: streakDays >= 3 ? "linear-gradient(135deg,rgba(255,149,0,.12),rgba(255,149,0,.04))" : "var(--card)", border: streakDays >= 3 ? "1px solid rgba(255,149,0,.25)" : "1px solid var(--line)", borderRadius: 16, padding: "16px 20px", marginBottom: 16, display: "flex", alignItems: "center", gap: 16 }}>
        <div style={{ fontSize: 36 }}>{streakDays >= 14 ? "🔥" : streakDays >= 7 ? "🔥" : streakDays >= 3 ? "🔥" : streakDays >= 1 ? "🌱" : "💤"}</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 3, color: streakDays >= 3 ? "var(--orange)" : "#fff" }}>
            {streakDays === 0 ? "No active streak" : `${streakDays}-day ${mode === "streamer" ? "stream" : "watch"} streak`}
          </div>
          <div style={{ fontSize: 12, color: "var(--muted)" }}>
            {streakDays === 0 && (mode === "streamer" ? "Go live today to start your streak and earn bonus coins." : "Watch a stream today to start your streak and earn bonus coins.")}
            {streakDays === 1 && (mode === "streamer" ? "Stream tomorrow to keep your streak going!" : "Watch tomorrow to keep your streak going!")}
            {streakDays === 2 && "One more day for a 1.25x coin bonus!"}
            {streakDays >= 3 && streakDays < 7 && `+${getStreakBonus(streakDays)}% coin speed active · ${7 - streakDays} days to 1.5x`}
            {streakDays >= 7 && streakDays < 14 && `+${getStreakBonus(streakDays)}% coin speed active · ${14 - streakDays} days to 2x`}
            {streakDays >= 14 && "2x coins — maximum streak bonus active!"}
          </div>
        </div>
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <div style={{ fontFamily: "Bebas Neue,sans-serif", fontSize: 28, color: streakDays >= 3 ? "var(--orange)" : "var(--muted)" }}>{streakDays}d</div>
          <div style={{ fontSize: 10, color: "var(--muted)" }}>streak</div>
        </div>
      </div>
      <div className="wcards">
        <div className="wcard g">
          <div className="wcard-l">Withdrawable Balance</div>
          <div className="wcard-v">${(coins / 1000).toFixed(2)}</div>
          <div className="wcard-sub">{coins.toLocaleString()} coins · {Math.max(0, 20000 - coins).toLocaleString()} more needed</div>
          <button className="wbtn" disabled={coins < 20000} onClick={() => coins >= 20000 && setShowWithdrawModal(true)}>
            {coins >= 20000 ? "Withdraw Now" : "Withdraw ($20 min)"}
          </button>
        </div>
        <div className="wcard y">
          <div className="wcard-l">STEM Coins</div>
          <div className="wcard-v">🪙 {coins.toLocaleString()}</div>
          <div className="wcard-sub">1,000 coins = $1.00 · 2% fee</div>
          <button className="wbtn" style={{ background: "var(--gold)" }} onClick={() => mode === "streamer" ? go("dash") : go("stream", DEMO_STREAMS[0])}>{mode === "streamer" ? "Go Live" : "Earn Coins"}</button>
        </div>
        <div className="wcard p">
          <div className="wcard-l">Total Earned</div>
          <div className="wcard-v">${(profile?.total_earned || 0).toFixed(2)}</div>
          <div className="wcard-sub">{mode === "streamer" ? "Streaming, gifts, referrals" : "Watching, chatting, referrals"}</div>
          <button className="wbtn" style={{ background: "linear-gradient(135deg,var(--purple),var(--red))" }} onClick={() => notify("Premium 2x earnings coming soon!")}>Get Premium</button>
        </div>
      </div>
      <div style={{ background: "linear-gradient(135deg,rgba(124,58,237,.08),rgba(255,45,85,.06))", border: "1px solid rgba(124,58,237,.2)", borderRadius: 14, padding: "18px 20px", display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap", marginBottom: 20 }}>
        <div style={{ fontSize: 26 }}>💡</div>
        <div style={{ flex: 1 }}><div style={{ fontWeight: 700, marginBottom: 3, fontSize: 15 }}>Earn 2x faster with Premium</div><div style={{ fontSize: 13, color: "var(--muted)" }}>$9.99/month — double all your ad earnings.</div></div>
        <button className="btn-g" onClick={() => notify("Premium coming soon!")}>Upgrade</button>
      </div>

      {/* Coin Shop */}
      <div className="panel" style={{ marginBottom: 16 }}>
        <div className="panel-hd"><span className="panel-title">🛍 Coin Shop</span></div>
        <div style={{ padding: 16 }}>
          <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 14 }}>Spend your coins on profile upgrades and chat perks.</div>
          {[
            { icon: "🎨", name: "Neon Chat Color", desc: "Your chat messages glow in neon green", cost: 500, profileUpdate: { chat_color: "#00f5a0" }, owned: profile?.chat_color === "#00f5a0" },
            { icon: "🔥", name: "Red Hot Color", desc: "Fiery red chat color", cost: 500, profileUpdate: { chat_color: "#ff6b35" }, owned: profile?.chat_color === "#ff6b35" },
            { icon: "💜", name: "Purple Royale", desc: "Rich purple chat color", cost: 500, profileUpdate: { chat_color: "#a78bfa" }, owned: profile?.chat_color === "#a78bfa" },
            { icon: "👑", name: "VIP Badge", desc: "Crown badge shown in chat next to your name", cost: 1000, profileUpdate: { badge: "👑" }, owned: profile?.badge === "👑" },
            { icon: "🐋", name: "Whale Badge", desc: "Whale badge for big spenders", cost: 2000, profileUpdate: { badge: "🐋" }, owned: profile?.badge === "🐋" },
            { icon: "⭐", name: "Star Badge", desc: "Gold star badge for loyal viewers", cost: 750, profileUpdate: { badge: "⭐" }, owned: profile?.badge === "⭐" },
          ].map(item => (
            <div key={item.name} className="shop-item">
              <span style={{ fontSize: 28, flexShrink: 0 }}>{item.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 2 }}>{item.name}</div>
                <div style={{ fontSize: 12, color: "var(--muted)" }}>{item.desc}</div>
              </div>
              <button onClick={() => !item.owned && buyShopItem(item.name, item.cost, item.profileUpdate)} style={{ background: item.owned ? "rgba(0,245,160,.1)" : "linear-gradient(135deg,var(--purple),var(--red))", border: item.owned ? "1px solid rgba(0,245,160,.3)" : "none", color: item.owned ? "var(--green)" : "#fff", borderRadius: 10, padding: "7px 14px", fontSize: 12, fontWeight: 700, cursor: item.owned ? "default" : "pointer", flexShrink: 0, whiteSpace: "nowrap" }}>
                {item.owned ? "Owned ✓" : `🪙 ${item.cost.toLocaleString()}`}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Referral */}
      <div className="panel" style={{ marginBottom: 16 }}>
        <div className="panel-hd"><span className="panel-title">🔗 Referral Program</span></div>
        <div style={{ padding: 16 }}>
          <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 12 }}>Invite friends to STEM and you both earn <strong style={{ color: "var(--gold)" }}>500 coins</strong> when they sign up.</div>
          {profile?.referral_code ? (
            <>
              <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                <input readOnly value={`${window.location.origin}/?ref=${profile.referral_code}`} className="fi" style={{ margin: 0, flex: 1, fontSize: 12, fontFamily: "monospace" }} />
                <button onClick={() => { navigator.clipboard?.writeText(`${window.location.origin}/?ref=${profile.referral_code}`); notify("Referral link copied!"); }} style={{ background: "var(--ink4)", border: "1px solid var(--line2)", color: "#fff", borderRadius: 10, padding: "0 14px", fontSize: 12, cursor: "pointer", flexShrink: 0 }}>Copy</button>
                {typeof navigator.share === "function" && (
                  <button onClick={() => navigator.share({ title: "Join STEM — Earn Money Watching Streams", text: `Sign up with my link and we both get 500 free coins!`, url: `${window.location.origin}/?ref=${profile.referral_code}` }).catch(() => {})} style={{ background: "linear-gradient(135deg,var(--purple),var(--red))", border: "none", color: "#fff", borderRadius: 10, padding: "0 14px", fontSize: 12, fontWeight: 700, cursor: "pointer", flexShrink: 0 }}>Share</button>
                )}
              </div>
              <div style={{ display: "flex", gap: 12 }}>
                <div style={{ flex: 1, background: "var(--ink3)", border: "1px solid var(--line)", borderRadius: 10, padding: "10px 14px", textAlign: "center" }}>
                  <div style={{ fontFamily: "Bebas Neue,sans-serif", fontSize: 24, color: "var(--green)" }}>{profile?.referral_count || 0}</div>
                  <div style={{ fontSize: 11, color: "var(--muted)" }}>Friends referred</div>
                </div>
                <div style={{ flex: 1, background: "var(--ink3)", border: "1px solid var(--line)", borderRadius: 10, padding: "10px 14px", textAlign: "center" }}>
                  <div style={{ fontFamily: "Bebas Neue,sans-serif", fontSize: 24, color: "var(--gold)" }}>{((profile?.referral_count || 0) * 500).toLocaleString()}</div>
                  <div style={{ fontSize: 11, color: "var(--muted)" }}>Coins earned</div>
                </div>
              </div>
            </>
          ) : (
            <div style={{ fontSize: 13, color: "var(--muted)" }}>Referral code not set — log out and back in to generate one.</div>
          )}
        </div>
      </div>

      {/* Transaction History */}
      <div className="panel">
        <div className="panel-hd">
          <span className="panel-title">📋 Transaction History</span>
          <button onClick={fetchTransactions} style={{ background: "none", border: "none", color: "var(--muted)", fontSize: 12, cursor: "pointer" }}>Refresh</button>
        </div>
        {loadingTxns ? (
          <div style={{ padding: 40, textAlign: "center" }}><div className="spinner" style={{ margin: "0 auto" }} /></div>
        ) : transactions.length === 0 ? (
          <div style={{ padding: "32px 20px", textAlign: "center", color: "var(--muted)" }}>
            <div style={{ fontSize: 32, marginBottom: 10 }}>📋</div>
            <div style={{ fontSize: 13 }}>No transactions yet. Start watching to earn!</div>
          </div>
        ) : (
          <div style={{ maxHeight: 400, overflowY: "auto" }}>
            {transactions.map(t => {
              const icons = { watch: "📺", chat: "💬", gift_sent: "🎁", follow: "➕", clip: "✂", signup_bonus: "🎉", referral_bonus: "🎁", referral_reward: "🔗", withdrawal: "💸" };
              const colors = { watch: "var(--green)", chat: "var(--blue)", gift_sent: "var(--red)", follow: "var(--green)", clip: "var(--purple)", signup_bonus: "var(--gold)", referral_bonus: "var(--gold)", referral_reward: "var(--gold)", withdrawal: "var(--red)" };
              const isOut = t.type === "withdrawal";
              return (
                <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", borderBottom: "1px solid var(--line)" }}>
                  <span style={{ fontSize: 18, flexShrink: 0 }}>{icons[t.type] || "🪙"}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.description || t.type}</div>
                    <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>{new Date(t.created_at).toLocaleDateString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</div>
                  </div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: colors[t.type] || "var(--green)", flexShrink: 0 }}>{isOut ? "-" : "+"}{t.amount.toLocaleString()} 🪙</div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Withdrawal History */}
      <div className="panel" style={{ marginTop: 16 }}>
        <div className="panel-hd">
          <span className="panel-title">💸 Withdrawal History</span>
          <button onClick={fetchWithdrawHistory} style={{ background: "none", border: "none", color: "var(--muted)", fontSize: 12, cursor: "pointer" }}>Refresh</button>
        </div>
        {withdrawHistory.length === 0 ? (
          <div style={{ padding: "28px 20px", textAlign: "center", color: "var(--muted)", fontSize: 13 }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>💸</div>
            No withdrawals yet — reach 20,000 coins ($20) to cash out.
          </div>
        ) : (
          <div>
            {withdrawHistory.map(w => {
              const sc = { pending: "var(--orange)", processing: "var(--blue)", paid: "var(--green)", rejected: "var(--red)" };
              const sl = { pending: "Pending", processing: "Processing", paid: "Paid ✓", rejected: "Rejected" };
              return (
                <div key={w.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "13px 16px", borderBottom: "1px solid var(--line)" }}>
                  <span style={{ fontSize: 20 }}>💸</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 700 }}>${Number(w.net_usd).toFixed(2)} <span style={{ fontSize: 11, fontWeight: 400, color: "var(--muted)" }}>({w.amount_coins.toLocaleString()} coins)</span></div>
                    <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>{w.paypal_email} · {new Date(w.created_at).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })}</div>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: sc[w.status] || "var(--muted)", background: `${sc[w.status] || "rgba(255,255,255,.1)"}18`, border: `1px solid ${sc[w.status] || "var(--line)"}44`, borderRadius: 20, padding: "3px 10px", flexShrink: 0 }}>
                    {sl[w.status] || w.status}
                  </span>
                </div>
              );
            })}
          </div>
        )}
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
      <div style={{ marginBottom: 22 }}>
        <div style={{ fontFamily: "Bebas Neue,sans-serif", fontSize: 36, letterSpacing: 1, marginBottom: 3 }}>Creator Dashboard</div>
        <div style={{ fontSize: 14, color: "var(--muted)" }}>Hey {firstName || "Streamer"}! Ready to go live and get paid?</div>
      </div>

      {/* GO LIVE HERO — dominant element */}
      {isStreaming ? (
        <div style={{ background: "linear-gradient(135deg,rgba(255,45,85,.15),rgba(255,107,53,.1))", border: "1px solid rgba(255,45,85,.4)", borderRadius: 20, padding: "22px 24px", marginBottom: 20, position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: "linear-gradient(90deg,var(--red),#ff6b35)" }} />
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ width: 12, height: 12, background: "var(--red)", borderRadius: "50%", animation: "pulse 2s infinite", flexShrink: 0 }} />
              <span style={{ fontFamily: "Bebas Neue,sans-serif", fontSize: 22, letterSpacing: .5, color: "var(--red)" }}>LIVE NOW</span>
            </div>
            <span style={{ fontSize: 14, fontWeight: 700 }}>"{goLiveForm.title}"</span>
            <span style={{ fontSize: 12, color: "var(--muted)", background: "rgba(255,255,255,.06)", borderRadius: 6, padding: "3px 8px" }}>{goLiveForm.category}</span>
          </div>
          <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 18 }}>Your stream is live — viewers can find you on the Discover page. Open OBS and start streaming if you haven't already.</div>
          {muxStreamKey && (
            <div style={{ background: "rgba(0,0,0,.3)", borderRadius: 10, padding: "10px 14px", marginBottom: 16, display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <span style={{ fontSize: 11, color: "var(--muted)", fontWeight: 700, letterSpacing: .5, textTransform: "uppercase" }}>Stream Key</span>
              <span style={{ fontFamily: "monospace", fontSize: 12, color: "rgba(255,255,255,.6)", flex: 1, wordBreak: "break-all" }}>{muxStreamKey.slice(0, 24)}•••</span>
              <button onClick={() => { navigator.clipboard?.writeText(muxStreamKey); notify("Stream key copied!"); }} style={{ background: "var(--ink4)", border: "1px solid var(--line2)", color: "#fff", borderRadius: 7, padding: "5px 12px", fontSize: 12, cursor: "pointer", flexShrink: 0 }}>Copy</button>
            </div>
          )}
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button onClick={() => go("disc")} className="btn-g" style={{ flex: 1, minWidth: 120 }}>View on Discover</button>
            <button onClick={handleEndStream} className="btn-red" style={{ flex: 1, minWidth: 120, display: "flex", alignItems: "center", justifyContent: "center", gap: 7 }}>
              <span style={{ width: 7, height: 7, background: "#fff", borderRadius: "50%", animation: "blink 1.6s infinite" }} />End Stream
            </button>
          </div>
        </div>
      ) : (
        <div style={{ background: "linear-gradient(135deg,rgba(124,58,237,.12),rgba(255,45,85,.10))", border: "2px dashed rgba(255,45,85,.35)", borderRadius: 20, padding: "32px 28px", marginBottom: 20, textAlign: "center", position: "relative", overflow: "hidden" }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🎙</div>
          <div style={{ fontFamily: "Bebas Neue,sans-serif", fontSize: 32, letterSpacing: 1, marginBottom: 8 }}>Ready to Stream?</div>
          <div style={{ fontSize: 14, color: "var(--muted)", marginBottom: 24, maxWidth: 380, margin: "0 auto 24px" }}>
            Go live in seconds. Your viewers earn coins while they watch — the more engaged your audience, the more everyone earns.
          </div>
          <button
            onClick={() => { setGoLiveStep(1); setShowGoLive(true); }}
            style={{ background: "linear-gradient(135deg,var(--red),#ff6b35)", color: "#fff", border: "none", borderRadius: 14, padding: "16px 40px", fontSize: 17, fontWeight: 800, cursor: "pointer", boxShadow: "0 8px 30px rgba(255,45,85,.4)", display: "inline-flex", alignItems: "center", gap: 10, letterSpacing: .3 }}
          >
            <span style={{ width: 10, height: 10, background: "#fff", borderRadius: "50%", animation: "blink 1.6s infinite" }} />
            Go Live Now
          </button>
          <div style={{ display: "flex", justifyContent: "center", gap: 24, marginTop: 20, flexWrap: "wrap" }}>
            {[["⚡", "Instant setup"], ["🪙", "Earn from stream 1"], ["📡", "Real RTMP via OBS"]].map(([icon, label]) => (
              <div key={label} style={{ fontSize: 12, color: "var(--muted)", display: "flex", alignItems: "center", gap: 5 }}>
                <span>{icon}</span>{label}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* KPIs — real data */}
      <div className="kpis" style={{ marginBottom: 16 }}>
        {[
          ["r", "Balance", `$${(coins / 1000).toFixed(2)}`, `${coins.toLocaleString()} coins`],
          ["g", "Followers", (profile?.follower_count || 0).toLocaleString(), "total followers"],
          ["y", "Total Earned", `$${(profile?.total_earned || 0).toFixed(2)}`, "lifetime"],
          ["b", "Streams", streamerAnalytics.streamCount.toLocaleString(), "total broadcasts"],
        ].map(([col, l, v, ch]) => (
          <div key={l} className={`kpi ${col}`}><div className="kpi-l">{l}</div><div className="kpi-v">{v}</div><div className="kpi-ch">{ch}</div></div>
        ))}
      </div>

      {/* Revenue Breakdown — real data */}
      {(() => {
        const giftUsd = streamerAnalytics.giftRevenue / 1000;
        const subUsd = streamerAnalytics.activeSubs;
        const balUsd = coins / 1000;
        const total = giftUsd + subUsd + balUsd || 1;
        const rows = [
          ["Gifts received", giftUsd, "linear-gradient(90deg,var(--gold),var(--orange))"],
          ["Subscriptions", subUsd, "linear-gradient(90deg,var(--green),#00c8a0)"],
          ["Coin balance", balUsd, "linear-gradient(90deg,var(--red),#ff6b35)"],
        ];
        return (
          <div className="panel" style={{ marginBottom: 16 }}>
            <div className="panel-hd">
              <span className="panel-title">Revenue Breakdown</span>
              <button onClick={fetchStreamerAnalytics} style={{ background: "none", border: "none", color: "var(--muted)", fontSize: 12, cursor: "pointer" }}>Refresh</button>
            </div>
            {loadingAnalytics ? (
              <div style={{ padding: 32, textAlign: "center" }}><div className="spinner" style={{ margin: "0 auto" }} /></div>
            ) : (
              <div style={{ padding: 16 }}>
                {rows.map(([l, usd, grad]) => (
                  <div key={l} style={{ marginBottom: 14 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                      <span style={{ fontSize: 13, color: "var(--muted)" }}>{l}</span>
                      <span style={{ fontSize: 13, fontWeight: 700 }}>${usd.toFixed(2)}</span>
                    </div>
                    <div style={{ background: "var(--ink4)", borderRadius: 4, height: 6, overflow: "hidden" }}>
                      <div style={{ width: `${Math.round(usd / total * 100)}%`, height: "100%", borderRadius: 4, background: grad, transition: "width .6s ease" }} />
                    </div>
                  </div>
                ))}
                <div style={{ borderTop: "1px solid var(--line)", paddingTop: 12, display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                  <span style={{ color: "var(--muted)" }}>Total value</span>
                  <span style={{ fontWeight: 800, color: "var(--green)" }}>${total.toFixed(2)}</span>
                </div>
              </div>
            )}
          </div>
        );
      })()}

      {/* Ad Revenue Split */}
      <div className="panel" style={{ marginBottom: 16 }}>
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
              <span style={{ fontSize: 13, fontWeight: 700 }}>{v}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Audience Overview — real data */}
      <div className="panel" style={{ marginBottom: 16 }}>
        <div className="panel-hd"><span className="panel-title">Audience Overview</span><span style={{ fontSize: 12, color: "var(--muted)" }}>All time</span></div>
        {loadingAnalytics ? (
          <div style={{ padding: 32, textAlign: "center" }}><div className="spinner" style={{ margin: "0 auto" }} /></div>
        ) : (
          <div style={{ padding: 16 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {[
                ["Peak Viewers", streamerAnalytics.peakViewers.toLocaleString(), "var(--gold)"],
                ["Avg. Viewers", streamerAnalytics.avgPeakViewers.toLocaleString(), "var(--blue)"],
                ["New Followers (30d)", streamerAnalytics.newFollowers30d.toLocaleString(), "var(--purple)"],
                ["Active Subs", streamerAnalytics.activeSubs.toLocaleString(), "var(--green)"],
                ["Total Clips", streamerAnalytics.totalClips.toLocaleString(), "var(--red)"],
                ["Total Streams", streamerAnalytics.streamCount.toLocaleString(), "var(--muted)"],
              ].map(([l, v, c]) => (
                <div key={l} style={{ background: "var(--ink3)", border: "1px solid var(--line)", borderRadius: 10, padding: "14px 16px" }}>
                  <div style={{ fontSize: 10, color: "var(--muted)", marginBottom: 6, fontWeight: 600, letterSpacing: .4, textTransform: "uppercase" }}>{l}</div>
                  <div style={{ fontFamily: "Bebas Neue,sans-serif", fontSize: 26, color: c }}>{v || "0"}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Recent Streams — real data */}
      {streamerAnalytics.recentStreams.length > 0 && (
        <div className="panel" style={{ marginBottom: 16 }}>
          <div className="panel-hd"><span className="panel-title">📺 Recent Streams</span></div>
          <div>
            {streamerAnalytics.recentStreams.map((s, i) => {
              const meta = CAT_META[s.category] || CAT_META["Just Chatting"];
              return (
                <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", borderBottom: i < streamerAnalytics.recentStreams.length - 1 ? "1px solid var(--line)" : "none" }}>
                  <div style={{ width: 36, height: 36, borderRadius: 8, background: `linear-gradient(${meta.bg})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>{meta.emoji}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.title}</div>
                    <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>{s.category} · {new Date(s.created_at).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })}</div>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div style={{ fontFamily: "Bebas Neue,sans-serif", fontSize: 18, color: "var(--gold)" }}>{(s.peak_viewers || 0).toLocaleString()}</div>
                    <div style={{ fontSize: 10, color: "var(--muted)" }}>peak</div>
                  </div>
                  {s.mux_playback_id && <span style={{ fontSize: 10, color: "var(--purple)", fontWeight: 700, flexShrink: 0 }}>VOD</span>}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Stream Schedule */}
      <div className="panel">
        <div className="panel-hd">
          <span className="panel-title">📅 Stream Schedule</span>
          <button onClick={() => setShowScheduleModal(true)} style={{ background: "linear-gradient(135deg,var(--purple),var(--red))", border: "none", color: "#fff", borderRadius: 8, padding: "5px 14px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>+ Add</button>
        </div>
        {channelSchedule.length === 0 && upcomingSchedule.filter(s => s.user_id === user?.id).length === 0 ? (
          <div style={{ padding: "24px 20px", textAlign: "center", color: "var(--muted)" }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>📅</div>
            <div style={{ fontSize: 13, marginBottom: 4, fontWeight: 600 }}>No scheduled streams</div>
            <div style={{ fontSize: 12 }}>Let your audience know when you're going live next.</div>
          </div>
        ) : (
          <div>
            {upcomingSchedule.filter(s => s.user_id === user?.id).map(s => {
              const d = new Date(s.scheduled_at);
              return (
                <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", borderBottom: "1px solid var(--line)" }}>
                  <div style={{ textAlign: "center", minWidth: 42, background: "rgba(124,58,237,.1)", border: "1px solid rgba(124,58,237,.2)", borderRadius: 8, padding: "6px 4px" }}>
                    <div style={{ fontSize: 10, color: "var(--purple)", fontWeight: 700 }}>{d.toLocaleDateString([], { month: "short" }).toUpperCase()}</div>
                    <div style={{ fontFamily: "Bebas Neue,sans-serif", fontSize: 20, lineHeight: 1 }}>{d.getDate()}</div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 700 }}>{s.title}</div>
                    <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>{s.category} · {d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Channel Emotes */}
      <div className="panel" style={{ marginTop: 16 }}>
        <div className="panel-hd">
          <span className="panel-title">😄 Channel Emotes</span>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 12, color: "var(--muted)" }}>{myEmotes.length}/50</span>
            <button
              onClick={async () => {
                const next = !(profile?.emotes_enabled ?? true);
                await supabase.from("profiles").update({ emotes_enabled: next }).eq("id", user.id);
                setProfile(p => ({ ...p, emotes_enabled: next }));
                notify(next ? "Emotes enabled for your channel" : "Emotes disabled for your channel");
              }}
              style={{ background: (profile?.emotes_enabled ?? true) ? "rgba(0,245,160,.12)" : "var(--ink4)", border: (profile?.emotes_enabled ?? true) ? "1px solid rgba(0,245,160,.3)" : "1px solid var(--line2)", color: (profile?.emotes_enabled ?? true) ? "var(--green)" : "var(--muted)", borderRadius: 20, padding: "4px 14px", fontSize: 12, fontWeight: 700, cursor: "pointer", transition: "all .2s" }}
            >
              {(profile?.emotes_enabled ?? true) ? "ON" : "OFF"}
            </button>
          </div>
        </div>
        <div style={{ padding: 16 }}>
          {!(profile?.emotes_enabled ?? true) && (
            <div style={{ background: "rgba(255,149,0,.08)", border: "1px solid rgba(255,149,0,.2)", borderRadius: 10, padding: "10px 14px", marginBottom: 14, fontSize: 13, color: "var(--orange)" }}>
              Emotes are currently disabled — viewers cannot use your emotes in chat. Toggle ON to enable them.
            </div>
          )}
          <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 14 }}>
            Upload emotes your viewers can use in your chat. Type <code style={{ background: "var(--ink4)", padding: "1px 5px", borderRadius: 4 }}>:emotename:</code> to use them.
          </div>
          {/* Upload form */}
          <div style={{ background: "var(--ink3)", border: "1px solid var(--line)", borderRadius: 12, padding: 14, marginBottom: 14 }}>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "flex-end" }}>
              <div style={{ flex: 1, minWidth: 160 }}>
                <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: .6, color: "var(--muted)", textTransform: "uppercase", marginBottom: 6, display: "block" }}>Emote Name</label>
                <input className="fi" style={{ margin: 0 }} placeholder="e.g. stemFire" value={emoteName} onChange={e => setEmoteName(e.target.value.replace(/[^a-zA-Z0-9_]/g, ""))} />
                <div style={{ fontSize: 10, color: "var(--muted)", marginTop: 4 }}>Letters, numbers, underscore only</div>
              </div>
              <div style={{ flex: 1, minWidth: 160 }}>
                <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: .6, color: "var(--muted)", textTransform: "uppercase", marginBottom: 6, display: "block" }}>Image (PNG/GIF, max 512KB)</label>
                <input ref={emoteFileRef} type="file" accept="image/png,image/gif,image/webp" style={{ fontSize: 12, color: "var(--muted)", width: "100%" }} />
              </div>
              <button onClick={uploadEmote} disabled={uploadingEmote} style={{ background: "linear-gradient(135deg,var(--purple),var(--red))", border: "none", color: "#fff", borderRadius: 10, padding: "10px 20px", fontSize: 13, fontWeight: 700, cursor: uploadingEmote ? "not-allowed" : "pointer", opacity: uploadingEmote ? 0.7 : 1, flexShrink: 0, display: "flex", alignItems: "center", gap: 6 }}>
                {uploadingEmote ? <div className="spinner" /> : "Upload"}
              </button>
            </div>
          </div>
          {/* Existing emotes grid */}
          {myEmotes.length === 0 ? (
            <div style={{ textAlign: "center", padding: "24px 0", color: "var(--muted)" }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>😄</div>
              <div style={{ fontSize: 13 }}>No emotes yet — upload your first one above.</div>
            </div>
          ) : (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              {myEmotes.map(e => (
                <div key={e.id} style={{ background: "var(--ink3)", border: "1px solid var(--line)", borderRadius: 10, padding: "10px 12px", display: "flex", flexDirection: "column", alignItems: "center", gap: 6, minWidth: 80, position: "relative" }}>
                  <img src={e.image_url} alt={e.name} style={{ width: 48, height: 48, objectFit: "contain", borderRadius: 4 }} />
                  <div style={{ fontSize: 11, color: "var(--muted)", fontFamily: "monospace" }}>:{e.name}:</div>
                  <button onClick={() => deleteEmote(e)} style={{ position: "absolute", top: 4, right: 4, background: "rgba(255,45,85,.15)", border: "none", color: "var(--red)", borderRadius: 4, width: 18, height: 18, fontSize: 9, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Chat Bans */}
      {chatBans.size > 0 && (
        <div className="panel" style={{ marginTop: 16 }}>
          <div className="panel-hd">
            <span className="panel-title">🚫 Banned Users</span>
            <span style={{ fontSize: 12, color: "var(--muted)" }}>{chatBans.size} banned</span>
          </div>
          <div style={{ padding: 16 }}>
            {[...chatBans].map(uid => (
              <div key={uid} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 0", borderBottom: "1px solid var(--line)" }}>
                <div style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(255,45,85,.15)", border: "1px solid rgba(255,45,85,.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0 }}>🚫</div>
                <div style={{ flex: 1, fontSize: 12, color: "var(--muted)", fontFamily: "monospace" }}>{uid.slice(0, 16)}…</div>
                <button onClick={() => unbanUser(uid)} style={{ background: "rgba(0,245,160,.1)", border: "1px solid rgba(0,245,160,.25)", color: "var(--green)", borderRadius: 8, padding: "5px 12px", fontSize: 12, cursor: "pointer", fontWeight: 700 }}>Unban</button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>}

    {/* ADMIN PANEL */}
    {page === "admin" && user?.email === "blankcoojnr@gmail.com" && (
      <div className="admin-page page">
        <div style={{ fontFamily: "Bebas Neue,sans-serif", fontSize: 36, letterSpacing: 1, marginBottom: 4 }}>Admin Panel</div>
        <div style={{ fontSize: 14, color: "var(--muted)", marginBottom: 24 }}>Manage withdrawal requests</div>
        <div className="panel">
          <div className="panel-hd">
            <span className="panel-title">💸 Withdrawal Requests</span>
            <button onClick={fetchAdminWithdrawals} style={{ background: "none", border: "none", color: "var(--muted)", fontSize: 12, cursor: "pointer" }}>Refresh</button>
          </div>
          {loadingAdmin ? (
            <div style={{ padding: 40, textAlign: "center" }}><div className="spinner" style={{ margin: "0 auto" }} /></div>
          ) : adminWithdrawals.length === 0 ? (
            <div style={{ padding: "32px 20px", textAlign: "center", color: "var(--muted)" }}>
              <div style={{ fontSize: 32, marginBottom: 10 }}>✅</div>
              <div style={{ fontSize: 13 }}>No withdrawal requests yet.</div>
            </div>
          ) : (
            <div>
              {adminWithdrawals.map(w => {
                const sc = { pending: "var(--orange)", processing: "var(--blue)", paid: "var(--green)", rejected: "var(--red)" };
                const sl = { pending: "Pending", processing: "Processing", paid: "Paid ✓", rejected: "Rejected" };
                return (
                  <div key={w.id} style={{ padding: "14px 16px", borderBottom: "1px solid var(--line)" }}>
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 12, flexWrap: "wrap" }}>
                      <div style={{ flex: 1, minWidth: 200 }}>
                        <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 3 }}>
                          {w.profiles?.full_name || w.profiles?.username || "Unknown"}
                          <span style={{ fontSize: 11, fontWeight: 400, color: "var(--muted)", marginLeft: 6 }}>@{w.profiles?.username}</span>
                        </div>
                        <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 2 }}>{w.paypal_email}</div>
                        <div style={{ fontSize: 12, color: "var(--muted)" }}>
                          {w.amount_coins?.toLocaleString()} coins → <strong style={{ color: "#fff" }}>${Number(w.net_usd).toFixed(2)}</strong>
                          <span style={{ marginLeft: 6, opacity: .6 }}>(fee ${Number(w.fee_usd).toFixed(2)})</span>
                        </div>
                        <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 3 }}>{new Date(w.created_at).toLocaleString()}</div>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "flex-end" }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: sc[w.status], background: `${sc[w.status]}18`, border: `1px solid ${sc[w.status]}44`, borderRadius: 20, padding: "3px 12px" }}>
                          {sl[w.status] || w.status}
                        </span>
                        {w.status === "pending" && (
                          <div style={{ display: "flex", gap: 6 }}>
                            <button onClick={() => approveWithdrawal(w)} style={{ background: "rgba(0,245,160,.12)", border: "1px solid rgba(0,245,160,.3)", color: "var(--green)", borderRadius: 8, padding: "6px 14px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>Approve</button>
                            <button onClick={() => rejectWithdrawal(w)} style={{ background: "rgba(255,45,85,.1)", border: "1px solid rgba(255,45,85,.3)", color: "var(--red)", borderRadius: 8, padding: "6px 14px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>Reject</button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    )}

    {/* CLIPS GALLERY */}
    {page === "clips" && (
      <div className="clips-page page">
        <div style={{ fontFamily: "Bebas Neue,sans-serif", fontSize: 36, letterSpacing: 1, marginBottom: 4 }}>Clips</div>
        <div style={{ fontSize: 14, color: "var(--muted)", marginBottom: 20 }}>Best moments from STEM streams</div>
        {loadingClips ? (
          <div style={{ padding: 60, textAlign: "center" }}><div className="spinner" style={{ margin: "0 auto" }} /></div>
        ) : allClips.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px", color: "var(--muted)" }}>
            <div style={{ fontSize: 48, marginBottom: 14 }}>✂</div>
            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>No clips yet</div>
            <div style={{ fontSize: 13 }}>Watch streams and click ✂ Clip to save moments.</div>
          </div>
        ) : (
          <div className="clips-grid">
            {allClips.map(clip => {
              const meta = CAT_META[clip.category] || { emoji: "🎮", color: "#7c3aed" };
              return (
                <div key={clip.id} className="clip-card" onClick={() => { navigator.clipboard?.writeText(`${window.location.origin}/?clip=${clip.id}`); notify("Clip link copied!"); }}>
                  <div style={{ background: `linear-gradient(135deg,${meta.color}33,${meta.color}11)`, height: 100, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, borderBottom: "1px solid var(--line)" }}>
                    {meta.emoji}
                  </div>
                  <div style={{ padding: "10px 12px" }}>
                    <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{clip.title}</div>
                    <div style={{ fontSize: 11, color: "var(--muted)" }}>by {clip.profiles?.full_name || clip.profiles?.username || "viewer"}</div>
                    <div style={{ fontSize: 10, color: "var(--muted)", marginTop: 3 }}>{new Date(clip.created_at).toLocaleDateString([], { month: "short", day: "numeric" })}</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    )}

    {/* VIEWER PROFILE PAGE */}
    {page === "vprofile" && (
      <div className="vprofile-page page">
        {loadingVProfile ? (
          <div style={{ padding: 60, textAlign: "center" }}><div className="spinner" style={{ margin: "0 auto" }} /></div>
        ) : vProfile ? (() => {
          const vInitials = vProfile.full_name?.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) || "?";
          const vCoins = vProfile.coins || 0;
          const vStreak = vProfile.streak_days || 0;
          const badges = [];
          if (vCoins >= 100000) badges.push(["🏆", "Whale", "#ffc800", "rgba(255,200,0,.12)"]);
          if (vCoins >= 10000)  badges.push(["💰", "High Roller", "#00f5a0", "rgba(0,245,160,.1)"]);
          if (vStreak >= 14)    badges.push(["🔥", "Streak Legend", "#ff9500", "rgba(255,149,0,.12)"]);
          if (vStreak >= 7)     badges.push(["🔥", "On Fire", "#ff9500", "rgba(255,149,0,.1)"]);
          if (vStreak >= 3)     badges.push(["✨", "Consistent", "#7c3aed", "rgba(124,58,237,.12)"]);
          if (vCoins >= 1500 && vCoins < 5000) badges.push(["🌱", "Growing", "#00f5a0", "rgba(0,245,160,.1)"]);
          return (<>
            <button onClick={() => setPage("disc")} style={{ background: "none", border: "none", color: "var(--muted)", fontSize: 13, cursor: "pointer", marginBottom: 20, display: "flex", alignItems: "center", gap: 5 }}>← Back</button>
            <div style={{ textAlign: "center", marginBottom: 24 }}>
              <div style={{ width: 80, height: 80, borderRadius: "50%", background: "linear-gradient(135deg,var(--purple),var(--red))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, fontWeight: 800, margin: "0 auto 14px" }}>{vInitials}</div>
              <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>{vProfile.full_name || "Viewer"}</div>
              <div style={{ fontSize: 14, color: "var(--muted)", marginBottom: 10 }}>@{vProfile.username || "unknown"}</div>
              {vProfile.bio && <div style={{ fontSize: 13, color: "rgba(255,255,255,.65)", maxWidth: 360, margin: "0 auto 10px" }}>{vProfile.bio}</div>}
              <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(0,245,160,.1)", border: "1px solid rgba(0,245,160,.3)", borderRadius: 20, padding: "4px 14px", fontSize: 12, fontWeight: 700, color: "var(--green)" }}>👁 Viewer</div>
            </div>
            {/* Stat grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 22 }}>
              {[["🪙", vCoins.toLocaleString(), "Coins"], ["🔥", `${vStreak}d`, "Streak"], ["💸", `$${(vCoins/1000).toFixed(2)}`, "Value"]].map(([icon, v, l]) => (
                <div key={l} style={{ background: "var(--card)", border: "1px solid var(--line)", borderRadius: 12, padding: "14px 10px", textAlign: "center" }}>
                  <div style={{ fontSize: 20, marginBottom: 4 }}>{icon}</div>
                  <div style={{ fontFamily: "Bebas Neue,sans-serif", fontSize: 22 }}>{v}</div>
                  <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>{l}</div>
                </div>
              ))}
            </div>
            {/* Badges */}
            {badges.length > 0 && (
              <div className="panel" style={{ marginBottom: 16 }}>
                <div className="panel-hd"><span className="panel-title">🏅 Badges</span></div>
                <div style={{ padding: "12px 16px", display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {badges.map(([icon, label, color, bg]) => (
                    <span key={label} className="badge-chip" style={{ background: bg, border: `1px solid ${color}44`, color }}>
                      {icon} {label}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {/* Recent activity */}
            {vProfileTxns.length > 0 && (
              <div className="panel">
                <div className="panel-hd"><span className="panel-title">📋 Recent Activity</span></div>
                <div style={{ maxHeight: 320, overflowY: "auto" }}>
                  {vProfileTxns.slice(0, 15).map(t => {
                    const icons = { watch: "📺", chat: "💬", gift_sent: "🎁", follow: "➕", clip: "✂", signup_bonus: "🎉", referral_bonus: "🎁" };
                    const isOut = t.amount < 0 || t.type === "gift_sent";
                    return (
                      <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 16px", borderBottom: "1px solid var(--line)" }}>
                        <span style={{ fontSize: 16, flexShrink: 0 }}>{icons[t.type] || "🪙"}</span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 13, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.description || t.type}</div>
                          <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 1 }}>{new Date(t.created_at).toLocaleDateString([], { month: "short", day: "numeric" })}</div>
                        </div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: isOut ? "var(--red)" : "var(--green)", flexShrink: 0 }}>{isOut ? "-" : "+"}{Math.abs(t.amount).toLocaleString()} 🪙</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>);
        })() : (
          <div style={{ textAlign: "center", padding: 60, color: "var(--muted)" }}>Profile not found</div>
        )}
      </div>
    )}

    {/* CHANNEL PAGE */}
    {page === "channel" && channelUser && <div className="page" style={{ maxWidth: 760, margin: "0 auto", paddingTop: 16 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 20, marginBottom: 24, flexWrap: "wrap" }}>
        <div style={{ width: 72, height: 72, borderRadius: 18, background: "linear-gradient(135deg,var(--purple),var(--red))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, fontWeight: 800, flexShrink: 0 }}>
          {channelUser.full_name?.charAt(0) || "?"}
        </div>
        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 4 }}>
            <div style={{ fontFamily: "Bebas Neue,sans-serif", fontSize: 28, letterSpacing: .5 }}>{channelUser.full_name}</div>
            {channelIsLive && <span style={{ background: "var(--red)", color: "#fff", fontSize: 10, fontWeight: 800, padding: "3px 8px", borderRadius: 5, letterSpacing: .5 }}>🔴 LIVE</span>}
          </div>
          <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 6 }}>@{channelUser.username} · {channelFollowers.toLocaleString()} followers</div>
          {channelUser.bio && <div style={{ fontSize: 13, color: "rgba(255,255,255,.7)", maxWidth: 420 }}>{channelUser.bio}</div>}
        </div>
        <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
          {channelIsLive && (
            <button className="btn-red" onClick={() => { const ls = liveStreams.find(s => s.user_id === channelUser.id); if (ls) go("stream", formatDbStream(ls)); }} style={{ padding: "9px 18px", fontSize: 13 }}>
              Watch Live
            </button>
          )}
          {user && user.id !== channelUser.id && (
            <button
              className={myFollows.includes(channelUser.id) ? "btn-o" : "btn-g"}
              onClick={async () => {
                if (!user) { setShowSignupPrompt(true); return; }
                if (myFollows.includes(channelUser.id)) {
                  await supabase.from("follows").delete().eq("follower_id", user.id).eq("following_id", channelUser.id);
                  setMyFollows(f => f.filter(id => id !== channelUser.id));
                  setChannelFollowers(n => Math.max(0, n - 1));
                } else {
                  await supabase.from("follows").insert({ follower_id: user.id, following_id: channelUser.id });
                  setMyFollows(f => [...f, channelUser.id]);
                  setChannelFollowers(n => n + 1);
                  notify("+50 coins for following!");
                  const nc = coinsRef.current + 50;
                  setCoins(nc); coinsRef.current = nc;
                  supabase.from("profiles").update({ coins: nc }).eq("id", user.id);
                  logTransaction("follow", 50, `Followed ${channelUser.full_name}`);
                }
              }}
              style={{ padding: "9px 18px", fontSize: 13 }}
            >
              {myFollows.includes(channelUser.id) ? "✓ Following" : "+ Follow"}
            </button>
          )}
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 20 }}>
        {[["Followers", channelFollowers.toLocaleString()], ["Streams", channelStreams.length], ["Clips", channelClips.length]].map(([l, v]) => (
          <div key={l} style={{ background: "var(--card)", border: "1px solid var(--line)", borderRadius: 12, padding: "14px 10px", textAlign: "center" }}>
            <div style={{ fontFamily: "Bebas Neue,sans-serif", fontSize: 24 }}>{v}</div>
            <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>{l}</div>
          </div>
        ))}
      </div>

      {/* Tab bar */}
      <div style={{ display: "flex", borderBottom: "1px solid var(--line)", marginBottom: 20, overflowX: "auto" }}>
        {[["overview", "Overview"], ["streams", `Streams${channelStreams.length ? ` (${channelStreams.length})` : ""}`], ["clips", `Clips${channelClips.length ? ` (${channelClips.length})` : ""}`], ["schedule", `Schedule${channelSchedule.length ? ` (${channelSchedule.length})` : ""}`], ...(streamEmotes.length ? [["emotes", `Emotes (${streamEmotes.length})`]] : [])].map(([tab, label]) => (
          <button key={tab} onClick={() => { setChannelTab(tab); setSelectedVod(null); }} style={{ background: "none", border: "none", borderBottom: channelTab === tab ? "2px solid var(--red)" : "2px solid transparent", color: channelTab === tab ? "#fff" : "var(--muted)", fontSize: 13, fontWeight: 600, padding: "10px 16px", cursor: "pointer", whiteSpace: "nowrap", transition: "color .15s" }}>{label}</button>
        ))}
      </div>

      {/* Overview tab */}
      {channelTab === "overview" && (
        <div>
          {channelIsLive && (
            <div style={{ background: "linear-gradient(135deg,rgba(255,45,85,.12),rgba(255,45,85,.05))", border: "1px solid rgba(255,45,85,.3)", borderRadius: 14, padding: "16px 18px", marginBottom: 20, display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ width: 10, height: 10, background: "var(--red)", borderRadius: "50%", animation: "pulse 2s infinite", flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 3 }}>Live right now</div>
                <div style={{ fontSize: 12, color: "var(--muted)" }}>{channelUser.full_name} is streaming</div>
              </div>
              <button className="btn-red" onClick={() => { const ls = liveStreams.find(s => s.user_id === channelUser.id); if (ls) go("stream", formatDbStream(ls)); }} style={{ padding: "8px 16px", fontSize: 13 }}>Watch</button>
            </div>
          )}
          {channelSchedule.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: .6, color: "var(--muted)", textTransform: "uppercase", marginBottom: 10 }}>Up next</div>
              <div style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 4 }}>
                {channelSchedule.slice(0, 3).map(s => {
                  const d = new Date(s.scheduled_at);
                  return (
                    <div key={s.id} style={{ background: "var(--card)", border: "1px solid var(--line)", borderRadius: 12, padding: "12px 14px", minWidth: 160, flexShrink: 0 }}>
                      <div style={{ fontSize: 11, color: "var(--purple)", fontWeight: 700, marginBottom: 3 }}>{d.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" })}</div>
                      <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.title}</div>
                      <div style={{ fontSize: 11, color: "var(--muted)" }}>{d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          {channelStreams.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: .6, color: "var(--muted)", textTransform: "uppercase", marginBottom: 10 }}>Recent streams</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(160px,1fr))", gap: 10 }}>
                {channelStreams.slice(0, 4).map(s => {
                  const meta = CAT_META[s.category] || CAT_META["Just Chatting"];
                  return (
                    <div key={s.id} style={{ background: "var(--card)", border: "1px solid var(--line)", borderRadius: 12, overflow: "hidden", cursor: s.status === "live" ? "pointer" : "default" }} onClick={() => s.status === "live" && go("stream", formatDbStream(s))}>
                      <div style={{ height: 70, background: `linear-gradient(${meta.bg})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>{meta.emoji}</div>
                      <div style={{ padding: "8px 10px" }}>
                        <div style={{ fontSize: 11, fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.title}</div>
                        <div style={{ fontSize: 10, color: "var(--muted)", marginTop: 2 }}>{s.status === "live" ? <span style={{ color: "var(--red)" }}>🔴 LIVE</span> : "Ended"}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          {channelStreams.length === 0 && !channelIsLive && (
            <div style={{ textAlign: "center", padding: "40px 20px", color: "var(--muted)" }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🎙</div>
              <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>No streams yet</div>
              <div style={{ fontSize: 13 }}>Check back when this creator goes live.</div>
            </div>
          )}
        </div>
      )}

      {/* Streams tab */}
      {channelTab === "streams" && (
        channelStreams.length === 0
          ? <div style={{ textAlign: "center", padding: "40px 20px", color: "var(--muted)" }}><div style={{ fontSize: 32, marginBottom: 10 }}>📺</div>No past streams yet</div>
          : <div>
              {selectedVod && (
                <div style={{ marginBottom: 20 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                    <div style={{ fontWeight: 700, fontSize: 14, flex: 1 }}>{selectedVod.title}</div>
                    <button onClick={() => setSelectedVod(null)} style={{ background: "none", border: "1px solid var(--line2)", color: "var(--muted)", borderRadius: 8, padding: "4px 12px", fontSize: 12, cursor: "pointer" }}>✕ Close</button>
                  </div>
                  <div style={{ borderRadius: 12, overflow: "hidden", background: "#000" }}>
                    <MuxPlayer playbackId={selectedVod.mux_playback_id} streamType="on-demand" style={{ width: "100%", aspectRatio: "16/9" }} />
                  </div>
                  <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 6 }}>
                    {selectedVod.category}{selectedVod.peak_viewers > 0 ? ` · ${selectedVod.peak_viewers.toLocaleString()} peak viewers` : ""} · {new Date(selectedVod.created_at).toLocaleDateString()}
                  </div>
                </div>
              )}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))", gap: 10 }}>
                {channelStreams.map(s => {
                  const meta = CAT_META[s.category] || CAT_META["Just Chatting"];
                  const playable = !!s.mux_playback_id;
                  const isSelected = selectedVod?.id === s.id;
                  return (
                    <div key={s.id} style={{ background: "var(--card)", border: `1px solid ${isSelected ? "rgba(124,58,237,.5)" : "var(--line)"}`, borderRadius: 12, overflow: "hidden", cursor: playable ? "pointer" : "default", transition: "border-color .2s" }}
                      onClick={() => playable && setSelectedVod(isSelected ? null : s)}>
                      <div style={{ height: 80, background: `linear-gradient(${meta.bg})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, position: "relative" }}>
                        {meta.emoji}
                        {playable && <div style={{ position: "absolute", top: 6, right: 6, background: "rgba(0,0,0,.65)", borderRadius: "50%", width: 26, height: 26, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11 }}>▶</div>}
                      </div>
                      <div style={{ padding: "10px 12px" }}>
                        <div style={{ fontSize: 12, fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.title}</div>
                        <div style={{ fontSize: 10, color: "var(--muted)", marginTop: 3 }}>
                          {s.category}{s.peak_viewers > 0 ? ` · ${s.peak_viewers.toLocaleString()} peak` : ""} · {new Date(s.created_at).toLocaleDateString()}
                        </div>
                        {playable && <div style={{ fontSize: 10, color: "var(--purple)", fontWeight: 700, marginTop: 4 }}>▶ Watch VOD</div>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
      )}

      {/* Clips tab */}
      {channelTab === "clips" && (
        channelClips.length === 0
          ? <div style={{ textAlign: "center", padding: "40px 20px", color: "var(--muted)" }}><div style={{ fontSize: 32, marginBottom: 10 }}>✂</div>No clips yet</div>
          : <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {channelClips.map(clip => (
                <div key={clip.id} style={{ background: "var(--card)", border: "1px solid var(--line)", borderRadius: 12, padding: "12px 16px", display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ fontSize: 20 }}>✂</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{clip.title}</div>
                    <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>by {clip.profiles?.full_name || "viewer"} · {new Date(clip.created_at).toLocaleDateString()}</div>
                  </div>
                </div>
              ))}
            </div>
      )}

      {/* Schedule tab */}
      {channelTab === "schedule" && (
        channelSchedule.length === 0
          ? <div style={{ textAlign: "center", padding: "40px 20px", color: "var(--muted)" }}><div style={{ fontSize: 32, marginBottom: 10 }}>📅</div>No upcoming streams scheduled</div>
          : <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {channelSchedule.map(s => {
                const d = new Date(s.scheduled_at);
                return (
                  <div key={s.id} style={{ background: "var(--card)", border: "1px solid var(--line)", borderRadius: 12, padding: "14px 16px", display: "flex", alignItems: "center", gap: 14 }}>
                    <div style={{ textAlign: "center", minWidth: 44, background: "rgba(124,58,237,.1)", border: "1px solid rgba(124,58,237,.2)", borderRadius: 8, padding: "6px 4px", flexShrink: 0 }}>
                      <div style={{ fontSize: 10, color: "var(--purple)", fontWeight: 700 }}>{d.toLocaleDateString([], { month: "short" }).toUpperCase()}</div>
                      <div style={{ fontFamily: "Bebas Neue,sans-serif", fontSize: 22, lineHeight: 1 }}>{d.getDate()}</div>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 700 }}>{s.title}</div>
                      <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 3 }}>{s.category} · {d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</div>
                    </div>
                  </div>
                );
              })}
            </div>
      )}

      {/* Emotes tab */}
      {channelTab === "emotes" && streamEmotes.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
          {streamEmotes.map(e => (
            <div key={e.id} style={{ background: "var(--card)", border: "1px solid var(--line)", borderRadius: 10, padding: "12px 14px", display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }} title={`:${e.name}:`}>
              <img src={e.image_url} alt={e.name} style={{ width: 48, height: 48, objectFit: "contain" }} />
              <div style={{ fontSize: 10, color: "var(--muted)", fontFamily: "monospace" }}>:{e.name}:</div>
            </div>
          ))}
        </div>
      )}
    </div>}

    {/* CLIP MODAL */}
    {showClipModal && (
      <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowClipModal(false)}>
        <div className="modal-box" style={{ maxWidth: 380 }}>
          <div className="modal-title">✂ Create Clip</div>
          <div className="modal-sub">Save this moment — earn +{Math.round(25 * (1 + getStreakBonus(streakDays) / 100))} coins{getStreakBonus(streakDays) > 0 ? ` (${getStreakBonus(streakDays)}% streak bonus!)` : ""}!</div>
          <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: .6, color: "var(--muted)", textTransform: "uppercase", marginBottom: 6, display: "block" }}>Clip Title (optional)</label>
          <input
            className="fi"
            placeholder={`Clip by ${profile?.full_name?.split(" ")[0] || "viewer"}`}
            value={clipTitle}
            onChange={e => setClipTitle(e.target.value)}
            onKeyDown={e => e.key === "Enter" && createClip()}
            autoFocus
          />
          <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
            <button onClick={() => { setShowClipModal(false); setClipTitle(""); }} style={{ flex: 1, background: "var(--ink3)", border: "1px solid var(--line2)", color: "var(--muted)", borderRadius: 12, padding: 13, fontSize: 14, cursor: "pointer" }}>Cancel</button>
            <button onClick={createClip} disabled={savingClip} style={{ flex: 2, background: "linear-gradient(135deg,var(--purple),var(--red))", color: "#fff", border: "none", borderRadius: 12, padding: 13, fontSize: 15, fontWeight: 700, cursor: savingClip ? "not-allowed" : "pointer", opacity: savingClip ? 0.7 : 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              {savingClip ? <div className="spinner" /> : <>✂ Save Clip — +{Math.round(25 * (1 + getStreakBonus(streakDays) / 100))} coins</>}
            </button>
          </div>
        </div>
      </div>
    )}

    {/* SCHEDULE MODAL */}
    {showScheduleModal && (
      <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowScheduleModal(false)}>
        <div className="modal-box">
          <div className="modal-title">📅 Schedule a Stream</div>
          <div className="modal-sub">Let your audience know when you're going live next.</div>
          <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: .6, color: "var(--muted)", textTransform: "uppercase", marginBottom: 6, display: "block" }}>Stream Title</label>
          <input
            className="fi"
            placeholder="e.g. Sunday Ranked Games, Chill Music Stream..."
            value={scheduleForm.title}
            onChange={e => setScheduleForm({ ...scheduleForm, title: e.target.value })}
            autoFocus
          />
          <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: .6, color: "var(--muted)", textTransform: "uppercase", marginBottom: 6, display: "block" }}>Category</label>
          <select className="select-fi" value={scheduleForm.category} onChange={e => setScheduleForm({ ...scheduleForm, category: e.target.value })}>
            {STREAM_CATS.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: .6, color: "var(--muted)", textTransform: "uppercase", marginBottom: 6, display: "block" }}>Date</label>
              <input type="date" className="fi" style={{ margin: 0 }} value={scheduleForm.date} onChange={e => setScheduleForm({ ...scheduleForm, date: e.target.value })} min={new Date().toISOString().split("T")[0]} />
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: .6, color: "var(--muted)", textTransform: "uppercase", marginBottom: 6, display: "block" }}>Time</label>
              <input type="time" className="fi" style={{ margin: 0 }} value={scheduleForm.time} onChange={e => setScheduleForm({ ...scheduleForm, time: e.target.value })} />
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
            <button onClick={() => setShowScheduleModal(false)} style={{ flex: 1, background: "var(--ink3)", border: "1px solid var(--line2)", color: "var(--muted)", borderRadius: 12, padding: 13, fontSize: 14, cursor: "pointer" }}>Cancel</button>
            <button onClick={handleAddSchedule} disabled={savingSchedule} style={{ flex: 2, background: "linear-gradient(135deg,var(--purple),var(--red))", color: "#fff", border: "none", borderRadius: 12, padding: 13, fontSize: 15, fontWeight: 700, cursor: savingSchedule ? "not-allowed" : "pointer", opacity: savingSchedule ? 0.7 : 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              {savingSchedule ? <div className="spinner" /> : "Schedule Stream"}
            </button>
          </div>
        </div>
      </div>
    )}

    {/* WITHDRAW MODAL */}
    {showWithdrawModal && (
      <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowWithdrawModal(false)}>
        <div className="modal-box">
          <div className="modal-title">💸 Withdraw Earnings</div>
          <div className="modal-sub">Request is reviewed manually — paid within 24 hours via PayPal or bank transfer.</div>

          {/* Quick amounts */}
          <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: .6, color: "var(--muted)", textTransform: "uppercase", marginBottom: 8, display: "block" }}>Amount</label>
          <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
            {[20000, 50000, 100000].filter(a => a <= coins).map(a => (
              <button key={a} onClick={() => setWithdrawCoins(a)} style={{ flex: 1, background: withdrawCoins === a ? "rgba(0,245,160,.1)" : "var(--ink3)", border: withdrawCoins === a ? "1px solid var(--green)" : "1px solid var(--line)", borderRadius: 10, padding: "10px 4px", fontSize: 13, fontWeight: 700, cursor: "pointer", color: withdrawCoins === a ? "var(--green)" : "#fff", transition: "all .15s" }}>
                ${a / 1000}
              </button>
            ))}
            <button onClick={() => setWithdrawCoins(Math.floor(coins / 1000) * 1000)} style={{ flex: 1, background: withdrawCoins === Math.floor(coins / 1000) * 1000 ? "rgba(0,245,160,.1)" : "var(--ink3)", border: withdrawCoins === Math.floor(coins / 1000) * 1000 ? "1px solid var(--green)" : "1px solid var(--line)", borderRadius: 10, padding: "10px 4px", fontSize: 13, fontWeight: 700, cursor: "pointer", color: withdrawCoins === Math.floor(coins / 1000) * 1000 ? "var(--green)" : "#fff", transition: "all .15s" }}>
              All
            </button>
          </div>
          <input type="number" className="fi" placeholder="Custom coins (min 20,000)" value={withdrawCoins} min={20000} max={coins} onChange={e => setWithdrawCoins(Math.max(0, parseInt(e.target.value) || 0))} />

          {/* Fee breakdown */}
          <div style={{ background: "var(--ink3)", border: "1px solid var(--line)", borderRadius: 12, padding: "12px 16px", marginBottom: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ fontSize: 13, color: "var(--muted)" }}>Gross ({withdrawCoins.toLocaleString()} coins)</span>
              <span style={{ fontSize: 13, fontWeight: 600 }}>${(withdrawCoins / 1000).toFixed(2)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ fontSize: 13, color: "var(--muted)" }}>Platform fee (2%)</span>
              <span style={{ fontSize: 13, color: "var(--red)" }}>-${((withdrawCoins / 1000) * 0.02).toFixed(2)}</span>
            </div>
            <div style={{ height: 1, background: "var(--line2)", marginBottom: 8 }} />
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontSize: 14, fontWeight: 700 }}>You receive</span>
              <span style={{ fontSize: 16, fontWeight: 800, color: "var(--green)" }}>${((withdrawCoins / 1000) * 0.98).toFixed(2)}</span>
            </div>
          </div>

          {/* Payout email */}
          <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: .6, color: "var(--muted)", textTransform: "uppercase", marginBottom: 6, display: "block" }}>Payout Email (PayPal)</label>
          <input className="fi" type="email" placeholder="your@paypal.com" value={withdrawPaypal} onChange={e => setWithdrawPaypal(e.target.value)} onKeyDown={e => e.key === "Enter" && handleWithdraw()} />
          <div style={{ fontSize: 11, color: "var(--muted)", marginBottom: 10, marginTop: -4 }}>Your request is saved and manually reviewed — you'll receive payment within 24 hours.</div>

          {withdrawCoins < 20000 && withdrawCoins > 0 && (
            <div style={{ fontSize: 12, color: "var(--orange)", marginBottom: 10 }}>Minimum withdrawal is 20,000 coins ($20)</div>
          )}

          <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
            <button onClick={() => setShowWithdrawModal(false)} style={{ flex: 1, background: "var(--ink3)", border: "1px solid var(--line2)", color: "var(--muted)", borderRadius: 12, padding: 13, fontSize: 14, cursor: "pointer" }}>Cancel</button>
            <button
              onClick={handleWithdraw}
              disabled={processingWithdraw || withdrawCoins < 20000 || withdrawCoins > coins}
              style={{ flex: 2, background: "linear-gradient(135deg,#00f5a0,#00c8a0)", color: "#000", border: "none", borderRadius: 12, padding: 13, fontSize: 15, fontWeight: 800, cursor: processingWithdraw || withdrawCoins < 20000 || withdrawCoins > coins ? "not-allowed" : "pointer", opacity: processingWithdraw || withdrawCoins < 20000 || withdrawCoins > coins ? 0.6 : 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
            >
              {processingWithdraw ? <div className="spinner" /> : `Withdraw $${((withdrawCoins / 1000) * 0.98).toFixed(2)}`}
            </button>
          </div>
        </div>
      </div>
    )}

    {/* GO LIVE MODAL */}
    {showGoLive && (
      <div className="modal-overlay" onClick={e => e.target === e.currentTarget && goLiveStep === 1 && setShowGoLive(false)}>
        <div className="modal-box">
          {goLiveStep === 1 ? (<>
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
          </>) : (<>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
              <span style={{ width: 10, height: 10, background: "var(--red)", borderRadius: "50%", animation: "pulse 2s infinite", flexShrink: 0 }} />
              <div className="modal-title" style={{ fontSize: 22, margin: 0 }}>You're Live!</div>
            </div>
            <div className="modal-sub" style={{ marginBottom: 18 }}>Configure OBS (or any encoder) with the details below, then start streaming.</div>

            {/* RTMP URL */}
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: .7, color: "var(--muted)", textTransform: "uppercase", marginBottom: 6 }}>RTMP URL</div>
              <div style={{ display: "flex", gap: 8 }}>
                <input readOnly value="rtmps://global-live.mux.com:443/app" className="fi" style={{ margin: 0, flex: 1, fontSize: 12, fontFamily: "monospace" }} />
                <button onClick={() => { navigator.clipboard?.writeText("rtmps://global-live.mux.com:443/app"); notify("RTMP URL copied!"); }} style={{ background: "var(--ink4)", border: "1px solid var(--line2)", color: "#fff", borderRadius: 10, padding: "0 14px", fontSize: 12, cursor: "pointer", flexShrink: 0 }}>Copy</button>
              </div>
            </div>

            {/* Stream Key */}
            <div style={{ marginBottom: 18 }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: .7, color: "var(--muted)", textTransform: "uppercase", marginBottom: 6 }}>Stream Key</div>
              <div style={{ display: "flex", gap: 8 }}>
                <input readOnly value={muxStreamKey} className="fi" style={{ margin: 0, flex: 1, fontSize: 12, fontFamily: "monospace" }} />
                <button onClick={() => { navigator.clipboard?.writeText(muxStreamKey); notify("Stream key copied!"); }} style={{ background: "var(--ink4)", border: "1px solid var(--line2)", color: "#fff", borderRadius: 10, padding: "0 14px", fontSize: 12, cursor: "pointer", flexShrink: 0 }}>Copy</button>
              </div>
            </div>

            {/* OBS steps */}
            <div style={{ background: "rgba(255,255,255,.04)", border: "1px solid var(--line)", borderRadius: 10, padding: "12px 14px", marginBottom: 18, fontSize: 12, color: "var(--muted)", lineHeight: 1.7 }}>
              <div style={{ fontWeight: 700, color: "#fff", marginBottom: 6 }}>OBS Setup</div>
              1. Open OBS → Settings → Stream<br />
              2. Service: <strong style={{ color: "#fff" }}>Custom</strong><br />
              3. Paste the RTMP URL and Stream Key above<br />
              4. Click OK, then <strong style={{ color: "#fff" }}>Start Streaming</strong>
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => { setShowGoLive(false); setGoLiveStep(1); }} style={{ flex: 1, background: "linear-gradient(135deg,var(--purple),var(--red))", color: "#fff", border: "none", borderRadius: 12, padding: 13, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
                Close — I'm Streaming
              </button>
              <button onClick={async () => { await handleEndStream(); setShowGoLive(false); setGoLiveStep(1); }} style={{ flex: 1, background: "var(--ink3)", border: "1px solid rgba(255,45,85,.3)", color: "var(--red)", borderRadius: 12, padding: 13, fontSize: 14, cursor: "pointer" }}>
                End Stream
              </button>
            </div>
          </>)}
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

    {/* RAID MODAL */}
    {showRaidModal && (
      <div className="raid-overlay" onClick={() => setShowRaidModal(false)}>
        <div onClick={e => e.stopPropagation()} style={{ background: "var(--ink2)", border: "1px solid var(--line2)", borderRadius: 20, padding: 24, width: "100%", maxWidth: 460 }}>
          <div style={{ fontFamily: "Bebas Neue,sans-serif", fontSize: 28, letterSpacing: 1, marginBottom: 6 }}>🚂 Raid a Channel</div>
          <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 20 }}>Send your viewers to another live stream.</div>
          {raidTargets.length === 0 ? (
            <div style={{ textAlign: "center", padding: "24px 0", color: "var(--muted)" }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>😴</div>
              <div style={{ fontSize: 13 }}>No other live streams right now.</div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
              {raidTargets.map(t => (
                <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 12, background: "var(--ink3)", border: "1px solid var(--line)", borderRadius: 12, padding: "12px 14px" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 2 }}>{t.streamer_name}</div>
                    <div style={{ fontSize: 12, color: "var(--muted)" }}>{t.title} · {(t.viewer_count || 0).toLocaleString()} viewers</div>
                  </div>
                  <button onClick={() => executeRaid(t)} style={{ background: "linear-gradient(135deg,var(--purple),var(--red))", border: "none", color: "#fff", borderRadius: 10, padding: "8px 16px", fontSize: 13, fontWeight: 700, cursor: "pointer", flexShrink: 0 }}>Raid →</button>
                </div>
              ))}
            </div>
          )}
          <button onClick={() => setShowRaidModal(false)} style={{ width: "100%", background: "var(--ink3)", border: "1px solid var(--line2)", color: "var(--muted)", borderRadius: 12, padding: 12, fontSize: 14, cursor: "pointer" }}>Skip Raid</button>
        </div>
      </div>
    )}

    {/* GIFT ANIMATIONS */}
    {giftAnims.length > 0 && (
      <div className="gift-anim-wrap">
        {giftAnims.map(g => (
          <div key={g.id} className="gift-anim-item" style={{ left: `${g.x}%` }}>
            <span className="gift-anim-emoji">{g.emoji}</span>
            <span className="gift-anim-label">{g.name}</span>
          </div>
        ))}
      </div>
    )}

    {toast && <div className="toast">🪙 {toast}</div>}
  </>);
}
