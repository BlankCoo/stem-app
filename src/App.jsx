import { useState, useEffect, useRef, lazy, Suspense } from "react";
import MuxPlayer from "@mux/mux-player-react";
import { supabase } from "./supabase";
import { AppContext } from "./AppContext";
import NavBar from "./components/NavBar";
import Modals from "./components/Modals";

const LandingPage    = lazy(() => import("./pages/LandingPage"));
const AuthPage       = lazy(() => import("./pages/AuthPage"));
const DiscoverPage   = lazy(() => import("./pages/DiscoverPage"));
const StreamPage     = lazy(() => import("./pages/StreamPage"));
const LeaderboardPage = lazy(() => import("./pages/LeaderboardPage"));
const WalletPage     = lazy(() => import("./pages/WalletPage"));
const ProfilePage    = lazy(() => import("./pages/ProfilePage"));
const DashboardPage  = lazy(() => import("./pages/DashboardPage"));
const AdminPage      = lazy(() => import("./pages/AdminPage"));
const ClipsPage      = lazy(() => import("./pages/ClipsPage"));
const ViewerProfilePage = lazy(() => import("./pages/ViewerProfilePage"));
const ChannelPage    = lazy(() => import("./pages/ChannelPage"));
const TermsPage      = lazy(() => import("./pages/TermsPage"));
const PrivacyPage    = lazy(() => import("./pages/PrivacyPage"));
const StreamerPage   = lazy(() => import("./pages/StreamerPage"));
const VodPage        = lazy(() => import("./pages/VodPage"));

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Outfit:wght@300;400;500;600;700;800;900&display=swap');`;

const DEMO_STREAMS = [
  { id: "stream-1", title: "Ranked Grind to Diamond", streamer: "NightOwlX", game: "Gaming", viewers: 12840, emoji: "ðŸ¦‰", color: "#7c3aed", bg: "135deg,#1a0a2e,#2d1b69" },
  { id: "stream-2", title: "Korean BBQ Night â€” Chill IRL", streamer: "SaraKitchen", game: "IRL", viewers: 4230, emoji: "ðŸ‘©â€ðŸ³", color: "#e94560", bg: "135deg,#2e0a1a,#69141b" },
  { id: "stream-3", title: "FIFA 26 Ultimate Team", streamer: "GoalKingFC", game: "Sports", viewers: 8910, emoji: "âš½", color: "#0ea5e9", bg: "135deg,#0a1a2e,#0e3a5a" },
  { id: "stream-4", title: "Minecraft Hardcore Day 847", streamer: "CraftedLore", game: "Gaming", viewers: 6120, emoji: "â›ï¸", color: "#22c55e", bg: "135deg,#0a1e10,#0d3a1a" },
  { id: "stream-5", title: "Lo-Fi Beats + Chill Gaming", streamer: "LoFiDrift", game: "Music", viewers: 21400, emoji: "ðŸŽµ", color: "#f0c040", bg: "135deg,#1e1a0a,#3a2e0d" },
  { id: "stream-6", title: "Just Chatting â€” Story Time", streamer: "TalkWithKai", game: "Just Chatting", viewers: 3340, emoji: "ðŸ’¬", color: "#ec4899", bg: "135deg,#2e0a1e,#5a1442" },
];

const ACHIEVEMENTS = {
  first_stream:      { label: "First Stream",      emoji: "ðŸ“º", desc: "Watched your first live stream" },
  first_withdrawal:  { label: "First Withdrawal",  emoji: "ðŸ’¸", desc: "Made your first withdrawal" },
  predictor:         { label: "Predictor",          emoji: "ðŸ”®", desc: "Won your first prediction" },
};

const SUB_TIERS = [
  { tier: 1, cost: 1000, label: "Tier 1", color: "#7c3aed", badge: "â­" },
];

const CATS = ["All", "Gaming", "IRL", "Music", "Just Chatting", "Sports", "Food"];
const STREAM_CATS = ["Gaming", "IRL", "Music", "Just Chatting", "Sports", "Food"];

const CAT_META = {
  Gaming:       { emoji: "ðŸŽ®", color: "#7c3aed", bg: "135deg,#1a0a2e,#2d1b69" },
  IRL:          { emoji: "ðŸ“¸", color: "#e94560", bg: "135deg,#2e0a1a,#69141b" },
  Music:        { emoji: "ðŸŽµ", color: "#f0c040", bg: "135deg,#1e1a0a,#3a2e0d" },
  "Just Chatting": { emoji: "ðŸ’¬", color: "#ec4899", bg: "135deg,#2e0a1e,#5a1442" },
  Sports:       { emoji: "âš½", color: "#0ea5e9", bg: "135deg,#0a1a2e,#0e3a5a" },
  Food:         { emoji: "ðŸ³", color: "#22c55e", bg: "135deg,#0a1e10,#0d3a1a" },
};

const CSS = `
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{--ink:#080816;--ink2:#0d0d20;--ink3:#12122a;--ink4:#1a1a35;--line:rgba(255,255,255,.07);--line2:rgba(255,255,255,.12);--purple:#7c3aed;--red:#ff2d55;--orange:#ff9500;--green:#00f5a0;--gold:#ffc800;--blue:#4d9fff;--txt:#ffffff;--muted:rgba(255,255,255,.45);--card:rgba(255,255,255,.03)}
html{scroll-behavior:smooth}
body{background:var(--ink);color:var(--txt);font-family:'Outfit',sans-serif;min-height:100vh;overflow-x:hidden}
::-webkit-scrollbar{width:3px}::-webkit-scrollbar-track{background:var(--ink2)}::-webkit-scrollbar-thumb{background:var(--ink4)}
button,input,textarea,select{font-family:'Outfit',sans-serif}
@keyframes blink{0%,100%{opacity:1}50%{opacity:.25}}
@keyframes popIn{from{opacity:0;transform:scale(.85)}to{opacity:1;transform:scale(1)}}
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
.verify-bar{position:fixed;top:56px;left:0;right:0;z-index:150;background:linear-gradient(135deg,rgba(255,149,0,.16),rgba(255,200,0,.1));border-bottom:1px solid rgba(255,149,0,.32);padding:9px 16px;display:flex;align-items:center;gap:10px;font-size:12px;backdrop-filter:blur(10px)}
.bottom-nav{display:none;position:fixed;bottom:0;left:0;right:0;z-index:200;background:rgba(8,8,22,.97);backdrop-filter:blur(20px);border-top:1px solid var(--line);padding:8px 0 12px}
.bottom-nav-items{display:flex;justify-content:space-around;align-items:center}
.bn-item{display:flex;flex-direction:column;align-items:center;gap:3px;background:none;border:none;color:var(--muted);cursor:pointer;padding:4px 12px;border-radius:10px;transition:all .2s;font-family:'Outfit',sans-serif}
.bn-item.on{color:var(--red)}
.bn-icon{font-size:20px}
.bn-label{font-size:10px;font-weight:600}
.hero{position:relative;min-height:calc(100vh - 56px);display:flex;align-items:center;padding:40px 20px;overflow:hidden}
.hero-mesh{position:absolute;inset:0;background:linear-gradient(135deg,rgba(124,58,237,.2),rgba(255,45,85,.12) 50%,rgba(255,149,0,.08));pointer-events:none}
.hero-grid{position:absolute;inset:0;background-image:linear-gradient(rgba(255,255,255,.03) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.03) 1px,transparent 1px);background-size:60px 60px;pointer-events:none}
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
  .verify-bar{top:62px}
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
  .bottom-nav{display:block;padding-bottom:max(12px,env(safe-area-inset-bottom))}
  .nav-c{display:none}
  .chat-panel-desktop{display:none}
  .hero{padding:30px 16px;min-height:calc(100vh - 56px)}
  .modal-box{padding:20px 16px}
  .ecells{grid-template-columns:1fr 1fr}
  .abtn{padding:9px 12px}
  .chat-send{width:44px;height:44px;font-size:18px}
  .fs-btn{width:44px;height:44px}
  .recap-box,.tier-picker-box{padding:20px 16px}
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
.pred-card{background:linear-gradient(135deg,rgba(77,159,255,.08),rgba(124,58,237,.06));border:1px solid rgba(77,159,255,.22);border-radius:14px;padding:14px 16px;margin-bottom:12px}
.pred-opt{flex:1;background:var(--ink3);border:1px solid var(--line);color:#fff;border-radius:10px;padding:10px 10px 8px;font-family:'Outfit',sans-serif;font-size:12px;text-align:center;position:relative;overflow:hidden;min-width:0}
.pred-opt.a-side{border-color:rgba(0,245,160,.25)}.pred-opt.b-side{border-color:rgba(255,45,85,.25)}
.pred-opt.sel-a{background:rgba(0,245,160,.1);border-color:rgba(0,245,160,.55)}
.pred-opt.sel-b{background:rgba(255,45,85,.1);border-color:rgba(255,45,85,.55)}
.pred-fill{position:absolute;top:0;left:0;bottom:0;pointer-events:none;border-radius:10px;transition:width .6s ease}
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

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• DISCOVER REDESIGN â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
/* Nav restructure */
.nav-l{display:flex;align-items:center;flex-shrink:0}
.nav-center{flex:1;display:flex;justify-content:center;padding:0 12px;max-width:none}
.nav-search-wrap{position:relative;width:100%;max-width:440px}
.nav-search-wrap input{width:100%;background:rgba(255,255,255,.06);border:1px solid var(--line2);border-radius:10px;padding:8px 14px 8px 38px;color:#fff;font-size:13px;outline:none;transition:all .2s;font-family:'Outfit',sans-serif}
.nav-search-wrap input:focus{border-color:rgba(124,58,237,.55);background:rgba(255,255,255,.09)}
.nav-search-wrap input::placeholder{color:var(--muted)}
.nav-search-icon{position:absolute;left:11px;top:50%;transform:translateY(-50%);font-size:14px;pointer-events:none;opacity:.5}
/* Full-page discover layout */
.disc-root{display:flex;min-height:calc(100vh - 56px);background:var(--ink)}
/* Sidebar */
.disc-sb{width:240px;flex-shrink:0;background:var(--ink2);border-right:1px solid var(--line);position:fixed;top:56px;left:0;bottom:0;overflow-y:auto;z-index:100;padding-bottom:24px;display:none}
.disc-sb::-webkit-scrollbar{width:2px}
.sb-hd{padding:18px 16px 8px;font-size:10px;font-weight:700;letter-spacing:.9px;color:var(--muted);text-transform:uppercase}
.sb-divider{height:1px;background:var(--line);margin:10px 0}
.sb-ch{display:flex;align-items:center;gap:10px;padding:8px 16px;cursor:pointer;transition:background .12s}
.sb-ch:hover{background:rgba(255,255,255,.055)}
.sb-ch-av{width:34px;height:34px;border-radius:50%;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:800;position:relative}
.sb-live-dot{position:absolute;bottom:-1px;right:-1px;width:10px;height:10px;background:var(--red);border-radius:50%;border:2px solid var(--ink2);animation:blink 1.6s infinite}
.sb-ch-info{flex:1;min-width:0}
.sb-ch-name{font-size:13px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;line-height:1.3}
.sb-ch-sub{font-size:11px;color:var(--muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.sb-ch-vc{font-size:11px;color:var(--red);font-weight:700;flex-shrink:0;white-space:nowrap}
.sb-nav-item{display:flex;align-items:center;gap:10px;padding:9px 16px;cursor:pointer;font-size:13px;font-weight:500;color:var(--muted);transition:all .15s;border-radius:0}
.sb-nav-item:hover,.sb-nav-item.on{color:#fff;background:rgba(255,255,255,.05)}
.sb-nav-item.on{color:#fff;font-weight:700}
/* Main area */
.disc-main{flex:1;min-width:0;padding-bottom:80px}
/* Hero banner */
.d-hero{position:relative;width:100%;overflow:hidden;cursor:pointer;display:block;aspect-ratio:16/7}
.d-hero-bg{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;overflow:hidden}
.d-hero-grad{position:absolute;inset:0;background:linear-gradient(to top,rgba(8,8,22,1) 0%,rgba(8,8,22,.65) 35%,rgba(8,8,22,.15) 70%,transparent 100%),linear-gradient(to right,rgba(8,8,22,.85) 0%,rgba(8,8,22,.3) 50%,transparent 100%)}
.d-hero-content{position:absolute;bottom:0;left:0;padding:28px 32px;max-width:580px;width:100%}
.d-hero-badge{display:inline-flex;align-items:center;gap:5px;background:var(--red);color:#fff;font-size:10px;font-weight:800;letter-spacing:.5px;padding:3px 10px;border-radius:5px;margin-bottom:10px}
.d-hero-dot{width:6px;height:6px;background:#fff;border-radius:50%;animation:blink 1.6s infinite;display:inline-block}
.d-hero-title{font-family:'Bebas Neue',sans-serif;font-size:clamp(26px,4vw,52px);letter-spacing:.5px;line-height:1.05;margin-bottom:8px;text-shadow:0 2px 20px rgba(0,0,0,.5)}
.d-hero-meta{display:flex;align-items:center;gap:10px;font-size:13px;color:rgba(255,255,255,.75);flex-wrap:wrap;margin-bottom:14px}
.d-hero-streamer{font-weight:700;color:#fff}
.d-hero-sep{opacity:.4}
.d-hero-actions{display:flex;gap:8px;flex-wrap:wrap}
.d-hero-btn{display:inline-flex;align-items:center;gap:6px;background:rgba(255,255,255,.14);backdrop-filter:blur(12px);border:1px solid rgba(255,255,255,.22);color:#fff;border-radius:8px;padding:9px 20px;font-size:13px;font-weight:700;cursor:pointer;transition:all .2s;font-family:'Outfit',sans-serif}
.d-hero-btn:hover{background:rgba(255,255,255,.25)}
.d-hero-btn.primary{background:linear-gradient(135deg,var(--purple),var(--red));border-color:transparent}
.d-hero-btn.primary:hover{opacity:.9}
/* Section layout */
.d-section{padding:28px 24px 0}
.d-section-hd{display:flex;align-items:center;justify-content:space-between;margin-bottom:16px}
.d-section-title{font-family:'Bebas Neue',sans-serif;font-size:20px;letter-spacing:.5px}
.d-see-all{font-size:12px;font-weight:600;color:var(--muted);cursor:pointer;transition:color .15s;background:none;border:none;font-family:'Outfit',sans-serif}
.d-see-all:hover{color:#fff}
/* New stream card */
.lgc{border-radius:8px;overflow:hidden;cursor:pointer;transition:transform .2s,box-shadow .2s;background:var(--ink3)}
.lgc:hover{transform:translateY(-4px);box-shadow:0 12px 32px rgba(0,0,0,.6)}
.lgc-thumb{aspect-ratio:16/9;position:relative;overflow:hidden}
.lgc-bg{position:absolute;inset:0}
.lgc-ov{position:absolute;inset:0;background:linear-gradient(to top,rgba(0,0,0,.55) 0%,transparent 55%)}
.lgc-emoji{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:52px;opacity:.1}
.lgc-live-badge{position:absolute;top:8px;left:8px;display:inline-flex;align-items:center;gap:3px;background:var(--red);color:#fff;font-size:9px;font-weight:800;letter-spacing:.4px;padding:3px 7px;border-radius:4px}
.lgc-live-dot{width:5px;height:5px;background:#fff;border-radius:50%;animation:blink 1.6s infinite}
.lgc-real-badge{position:absolute;top:8px;right:8px;background:rgba(255,45,85,.85);color:#fff;font-size:8px;font-weight:800;padding:2px 6px;border-radius:3px}
.lgc-viewers-badge{position:absolute;bottom:8px;left:8px;background:rgba(0,0,0,.72);backdrop-filter:blur(4px);border-radius:4px;padding:2px 7px;font-size:10px;font-weight:700;color:#fff}
.lgc-body{padding:10px 8px 12px}
.lgc-row{display:flex;gap:8px;align-items:flex-start}
.lgc-av{width:30px;height:30px;border-radius:50%;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:800}
.lgc-info{flex:1;min-width:0}
.lgc-title{font-size:13px;font-weight:600;line-height:1.3;margin-bottom:3px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.lgc-name{font-size:12px;color:var(--muted);margin-bottom:3px}
.lgc-cat{display:inline-block;font-size:11px;color:var(--muted);cursor:pointer}
.lgc-cat:hover{color:#fff;text-decoration:underline}
/* Live grid */
.d-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:12px}
/* Clips strip â€” vertical 9:16 cards */
.clips-strip{display:flex;gap:10px;overflow-x:auto;padding-bottom:6px;-webkit-overflow-scrolling:touch;scrollbar-width:none}
.clips-strip::-webkit-scrollbar{display:none}
.csc{flex-shrink:0;width:155px;cursor:pointer;border-radius:10px;overflow:hidden;background:var(--ink3);transition:transform .2s}
.csc:hover{transform:scale(1.04);box-shadow:0 8px 24px rgba(0,0,0,.5)}
.csc-thumb{position:relative;aspect-ratio:9/16;overflow:hidden}
.csc-tbg{position:absolute;inset:0}
.csc-tov{position:absolute;inset:0;background:linear-gradient(to top,rgba(0,0,0,.75) 0%,transparent 50%)}
.csc-emoji{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:54px;opacity:.12}
.csc-views{position:absolute;bottom:7px;left:8px;font-size:10px;font-weight:700;color:rgba(255,255,255,.95)}
.csc-dur{position:absolute;bottom:7px;right:7px;background:rgba(0,0,0,.75);border-radius:3px;padding:1px 5px;font-size:9px;font-weight:700;color:#fff}
.csc-play{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;opacity:0;transition:opacity .2s;background:rgba(0,0,0,.3)}
.csc:hover .csc-play{opacity:1}
.csc-body{padding:8px 10px 10px}
.csc-title{font-size:12px;font-weight:600;line-height:1.35;margin-bottom:2px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.csc-creator{font-size:11px;color:var(--muted)}
/* Category art grid */
.cat-art-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(115px,1fr));gap:10px}
.cat-art{border-radius:10px;overflow:hidden;cursor:pointer;position:relative;aspect-ratio:3/4;transition:transform .2s,box-shadow .2s}
.cat-art:hover{transform:scale(1.04);box-shadow:0 8px 24px rgba(0,0,0,.5)}
.cat-art-bg{position:absolute;inset:0;display:flex;align-items:center;justify-content:center}
.cat-art-grad{position:absolute;inset:0;background:linear-gradient(to top,rgba(0,0,0,.9) 0%,rgba(0,0,0,.3) 50%,transparent 100%)}
.cat-art-label{position:absolute;bottom:0;left:0;right:0;padding:10px 12px}
.cat-art-name{font-size:13px;font-weight:700;line-height:1.2}
.cat-art-count{font-size:10px;color:rgba(255,255,255,.55);margin-top:2px}
/* Featured pred cards row */
.fpred-strip{display:flex;gap:12px;overflow-x:auto;padding-bottom:6px;-webkit-overflow-scrolling:touch;scrollbar-width:none}
.fpred-strip::-webkit-scrollbar{display:none}
.fpred-card{flex-shrink:0;width:270px;background:var(--ink3);border:1px solid rgba(77,159,255,.18);border-radius:12px;padding:14px;cursor:pointer;transition:all .2s}
.fpred-card:hover{border-color:rgba(77,159,255,.45);transform:translateY(-2px)}
/* Sign-up CTA bar */
.d-cta-bar{display:flex;align-items:center;gap:14px;background:linear-gradient(135deg,rgba(124,58,237,.14),rgba(255,45,85,.10));border:1px solid rgba(124,58,237,.25);border-radius:14px;padding:16px 20px;flex-wrap:wrap}
/* Responsive */
@media(min-width:900px){
  .disc-sb{display:flex;flex-direction:column}
  .disc-main{margin-left:240px}
  .nav-center{display:flex !important}
  .nav-search-wrap{display:block !important}
  .d-hero{aspect-ratio:21/9;max-height:440px}
  .d-grid{grid-template-columns:repeat(auto-fill,minmax(210px,1fr))}
  .cat-art-grid{grid-template-columns:repeat(auto-fill,minmax(120px,1fr))}
}
@media(max-width:899px){
  .disc-sb{display:none !important}
  .disc-main{margin-left:0}
  .nav-center{display:none}
  .d-section{padding:20px 16px 0}
  .d-hero-content{padding:20px 18px}
  .cat-art-grid{grid-template-columns:repeat(3,1fr)}
  .d-grid{grid-template-columns:repeat(auto-fill,minmax(160px,1fr))}
}
/* Daily missions */
.mission-row{display:flex;align-items:center;gap:12px;padding:12px 16px;border-bottom:1px solid var(--line)}
.mission-icon{font-size:20px;width:32px;text-align:center;flex-shrink:0}
.mission-bar-wrap{flex:1;min-width:0}
.mission-label{font-size:12px;font-weight:600;margin-bottom:4px}
.mission-bar{height:5px;background:rgba(255,255,255,.08);border-radius:3px;overflow:hidden}
.mission-bar-fill{height:100%;border-radius:3px;transition:width .5s ease}
.mission-prog{font-size:11px;color:var(--muted);margin-top:3px}
/* Achievement badges */
.ach-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(100px,1fr));gap:10px;padding:14px}
.ach-card{background:var(--ink3);border:1px solid var(--line2);border-radius:12px;padding:12px 8px;text-align:center;transition:transform .15s}
.ach-card.earned{border-color:rgba(255,200,0,.35);background:rgba(255,200,0,.06)}
.ach-card:hover{transform:translateY(-2px)}
.ach-emoji{font-size:28px;margin-bottom:6px}
.ach-label{font-size:11px;font-weight:700;margin-bottom:2px}
.ach-desc{font-size:10px;color:var(--muted);line-height:1.3}
/* Sub tier picker */
.tier-picker-overlay{position:fixed;inset:0;background:rgba(0,0,0,.75);z-index:600;display:flex;align-items:center;justify-content:center;padding:20px}
.tier-picker-box{background:var(--ink2);border:1px solid var(--line2);border-radius:20px;width:100%;max-width:340px;padding:24px}
.tier-card{border-radius:12px;padding:14px;cursor:pointer;transition:all .15s;border:2px solid transparent;margin-bottom:8px}
.tier-card:hover{transform:translateX(3px)}
/* Clip vote buttons */
.clip-votes{display:flex;align-items:center;gap:4px;margin-top:4px}
.vote-btn{background:none;border:1px solid var(--line2);border-radius:6px;color:var(--muted);font-size:12px;padding:2px 8px;cursor:pointer;transition:all .15s;display:flex;align-items:center;gap:3px}
.vote-btn:hover,.vote-btn.on{background:rgba(255,255,255,.06);color:#fff}
.vote-btn.up.on{color:var(--green);border-color:rgba(0,245,160,.35)}
.vote-btn.dn.on{color:var(--red);border-color:rgba(255,45,85,.35)}
.clip-card:hover .clip-play-ov{opacity:1}
/* Channel rewards */
.reward-card{background:var(--ink3);border:1px solid var(--line2);border-radius:12px;padding:12px 14px;display:flex;align-items:center;gap:12px;margin-bottom:8px;cursor:pointer;transition:all .15s}
.reward-card:hover{border-color:rgba(124,58,237,.4);background:rgba(124,58,237,.06)}
/* Raid suggestions */
.raid-suggest-overlay{position:fixed;inset:0;background:rgba(0,0,0,.85);z-index:700;display:flex;align-items:flex-end;justify-content:center;padding:20px}
.raid-suggest-box{background:var(--ink2);border:1px solid var(--line2);border-radius:20px 20px 0 0;width:100%;max-width:560px;padding:24px}
/* Automod */
.word-chip{display:inline-flex;align-items:center;gap:6px;background:rgba(255,45,85,.1);border:1px solid rgba(255,45,85,.25);border-radius:20px;padding:3px 10px;font-size:12px;margin:3px}
/* Stream recap */
.recap-overlay{position:fixed;inset:0;background:rgba(0,0,0,.88);z-index:700;display:flex;align-items:center;justify-content:center;padding:20px;animation:fadeUp .2s ease}
.recap-box{background:var(--ink2);border:1px solid var(--line2);border-radius:20px;width:100%;max-width:480px;padding:26px;animation:popIn .2s ease}
`;




export default function App() {
  const [page, setPage] = useState("land");
  const [authReady, setAuthReady] = useState(false);
  const [mode, setMode] = useState(() => localStorage.getItem("stem_mode") || "viewer");
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
  const [editProfile, setEditProfile] = useState({ fullName: "", username: "", bio: "", twitter: "", instagram: "", youtube: "", tiktok: "" });
  const [editingLiveInfo, setEditingLiveInfo] = useState(false);
  const [liveInfoForm, setLiveInfoForm] = useState({ title: "", category: "Gaming" });
  const [savingLiveInfo, setSavingLiveInfo] = useState(false);
  const [profileMsg, setProfileMsg] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loadingLb, setLoadingLb] = useState(false);
  const [lbTab, setLbTab] = useState("earners");
  const [topSupporters, setTopSupporters] = useState([]);
  const [isBannedFromChannel, setIsBannedFromChannel] = useState(false);
  const [viewerTier, setViewerTier] = useState("guest");
  const [streamerTier, setStreamerTier] = useState("none");
  const streamEntryTimeRef = useRef(null);
  const watchedStreamsRef = useRef(new Set());
  const eliteAccumRef = useRef(0);

  // Go Live state
  const [showGoLive, setShowGoLive] = useState(false);
  const [goLiveStep, setGoLiveStep] = useState(1); // 1=form, 2=OBS setup
  const [goLiveForm, setGoLiveForm] = useState({ title: "", category: "Gaming" });
  const [isStreaming, setIsStreaming] = useState(false);
  const [savingGoLive, setSavingGoLive] = useState(false);
  const [loadingFollow, setLoadingFollow] = useState(false);
  const [showSignupPrompt, setShowSignupPrompt] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [verifyBannerDismissed, setVerifyBannerDismissed] = useState(!!sessionStorage.getItem("stem_verify_dismissed"));

  // Mux state
  const [muxStreamId, setMuxStreamId] = useState("");
  const [muxStreamKey, setMuxStreamKey] = useState("");
  const [muxPlaybackId, setMuxPlaybackId] = useState("");

  // Real streams from Supabase
  const [liveStreams, setLiveStreams] = useState([]);
  const [landingStats, setLandingStats] = useState({ members: 0, totalEarned: 0 });
  const [discTab, setDiscTab] = useState("all");
  const [featuredPreds, setFeaturedPreds] = useState([]);
  const [searchProfiles, setSearchProfiles] = useState([]);
  const [searchClips, setSearchClips] = useState([]);
  const [followedStreamers, setFollowedStreamers] = useState([]);

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


  // Buy Coins
  const [buyingCoins, setBuyingCoins] = useState(false);

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

  const [viewerCount, setViewerCount] = useState(0);

  // Chat moderation
  const [chatBans, setChatBans] = useState(new Set());
  const [msgMenuId, setMsgMenuId] = useState(null);
  const [slowModeSecs, setSlowModeSecs] = useState(0); // 0 = off
  const [slowCooldown, setSlowCooldown] = useState(0); // seconds remaining
  const [subOnly, setSubOnly] = useState(false);
  const [followerOnly, setFollowerOnly] = useState(false);
  const [editingStreamInfo, setEditingStreamInfo] = useState(false);
  const [streamInfoDraft, setStreamInfoDraft] = useState({ title: "", game: "" });
  const coinMilestoneRef = useRef(0);

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

  // Stream goal
  const [streamGoal, setStreamGoal] = useState(null);
  const [showGoalEditor, setShowGoalEditor] = useState(false);
  const [goalForm, setGoalForm] = useState({ type: "followers", target: 500, label: "" });
  const [savingGoal, setSavingGoal] = useState(false);

  // Stream polls
  const [activePoll, setActivePoll] = useState(null);
  const [pollVoted, setPollVoted] = useState(null);
  const [showPollCreator, setShowPollCreator] = useState(false);
  const [pollForm, setPollForm] = useState({ question: "", options: ["", ""] });
  const pollChRef = useRef(null);

  // Predictions
  const [activePrediction, setActivePrediction] = useState(null);
  const [predEntries, setPredEntries] = useState([]);
  const [myPredBet, setMyPredBet] = useState(null);
  const [predBetAmount, setPredBetAmount] = useState(100);
  const [predCountdown, setPredCountdown] = useState(0);
  const [showCreatePred, setShowCreatePred] = useState(false);
  const [predForm, setPredForm] = useState({ title: "", options: ["Yes", "No"], duration: 120 });
  const [placingBet, setPlacingBet] = useState(false);
  const predChRef = useRef(null);

  // Prediction Phase 2
  const [predRecap, setPredRecap] = useState(null);
  const [predHistory, setPredHistory] = useState([]);
  const [loadingPredHistory, setLoadingPredHistory] = useState(false);

  // Daily missions
  const [dailyMissions, setDailyMissions] = useState(null);
  // Achievements
  const [achievements, setAchievements] = useState(new Set());
  // Clip votes
  const [myClipVotes, setMyClipVotes] = useState({});
  // Push notifications
  const [pushEnabled, setPushEnabled] = useState(false);
  const [pushLoading, setPushLoading] = useState(false);
  // Auto-mod
  const [bannedWords, setBannedWords] = useState([]);
  const [newBannedWord, setNewBannedWord] = useState("");
  // Sub tier
  const [subTier, setSubTier] = useState(0);
  const [showSubTierPicker, setShowSubTierPicker] = useState(false);
  // Custom coin tip
  const [customTipAmt, setCustomTipAmt] = useState("");
  const [showTipInput, setShowTipInput] = useState(false);

  // Top gifters this session
  const [topGifters, setTopGifters] = useState({});

  // Clips gallery
  const [allClips, setAllClips] = useState([]);
  const [loadingClips, setLoadingClips] = useState(false);
  const [allVods, setAllVods] = useState([]);
  const [loadingVods, setLoadingVods] = useState(false);
  const [allStreamers, setAllStreamers] = useState([]);
  const [loadingStreamers, setLoadingStreamers] = useState(false);

  // Past streams
  const [pastStreams, setPastStreams] = useState([]);
  const [selectedVod, setSelectedVod] = useState(null);
  const [waitlistEmail, setWaitlistEmail] = useState("");
  const [waitlistDone, setWaitlistDone] = useState(false);
  // Stream recap (shown after ending stream)
  const [streamRecap, setStreamRecap] = useState(null);
  // Ad revenue earned this stream (streamer side)
  const [adRevenue, setAdRevenue] = useState(0);
  // Discover sort mode
  const [discoverSort, setDiscoverSort] = useState("top");

  // Reports
  const [reports, setReports] = useState([]);
  const [loadingReports, setLoadingReports] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportType, setReportType] = useState("stream");
  const [reportTargetId, setReportTargetId] = useState("");
  const [reportTargetMeta, setReportTargetMeta] = useState({});
  const [reportReason, setReportReason] = useState("");
  const [submittingReport, setSubmittingReport] = useState(false);

  const chatRef = useRef(null);
  const chatRef2 = useRef(null);
  const coinsRef = useRef(0);
  const sessRef = useRef(0);
  const prevLiveIdsRef = useRef(new Set());
  const emoteFileRef = useRef(null);
  const slowTimerRef = useRef(null);
  const peakViewersRef = useRef(0);

  // Keep refs in sync
  useEffect(() => { coinsRef.current = coins; }, [coins]);
  useEffect(() => { sessRef.current = sess; }, [sess]);

  // Coin milestone celebrations + whale achievement
  useEffect(() => {
    const milestones = [1000, 5000, 10000, 25000, 50000, 100000];
    const prev = coinMilestoneRef.current;
    for (const m of milestones) {
      if (prev < m && coins >= m) {
        setTimeout(() => notify(`ðŸŽ‰ Milestone! You hit ${m.toLocaleString()} coins ($${(m / 1000).toFixed(0)})!`), 300);
        coinMilestoneRef.current = coins;
        break;
      }
    }
    if (coins > coinMilestoneRef.current) coinMilestoneRef.current = coins;
  }, [coins]);


  // Auth init + streams subscription
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const refParam = params.get("ref");
    if (refParam) sessionStorage.setItem("stem_ref", refParam);
    const streamParam = params.get("s");
    if (streamParam) {
      sessionStorage.setItem("stem_deep_stream", streamParam);
      window.history.replaceState({}, "", window.location.pathname);
    }
    const coinsPurchased = parseInt(params.get("coins_purchased") || "0", 10);
    if (coinsPurchased > 0) {
      window.history.replaceState({}, "", window.location.pathname);
      sessionStorage.setItem("stem_coins_purchased", String(coinsPurchased));
    }

    // getSession is the authoritative initial check â€” sets authReady when done
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setUser(session.user);
        fetchProfile(session.user.id);
        fetchMyFollows(session.user.id);
        setPage("disc");
      }
      setAuthReady(true);
    });

    // onAuthStateChange handles events AFTER initial load (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "INITIAL_SESSION") return; // already handled by getSession above
      if (session) {
        setUser(session.user);
        fetchProfile(session.user.id);
        fetchMyFollows(session.user.id);
        setPage("disc");
        if (event === "SIGNED_IN" && !localStorage.getItem("stem_onboarded")) {
          setShowWelcome(true);
        }
      } else {
        setUser(null); setProfile(null); setCoins(0); coinsRef.current = 0;
        setStreakDays(0); setMyFollows([]); setNotifications([]); setUnreadNotifs(0); setReferralCode("");
        setShowNotifs(false); setShowSignupPrompt(false); setShowClipModal(false);
        setShowScheduleModal(false); setShowGoLive(false); setShowEmotePicker(false);
        setShowWithdrawModal(false); setWithdrawHistory([]);
        setChatBans(new Set()); setSlowModeSecs(0); setSlowCooldown(0); setSubOnly(false);
        setVProfile(null); setGiftAnims([]); setPage("land"); setAuthMode("login");
      }
    });

    // Fetch streams + debounce channel updates so frequent viewer-count UPDATEs
    // don't trigger a full refetch on every tick
    fetchLiveStreams();
    fetchFeaturedPredictions();
    fetchLandingStats();
    // UPDATE = viewer count tick — patch in place, no refetch needed
    // INSERT/DELETE = stream came live or ended — full refetch
    const streamCh = supabase.channel('live-streams')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'streams' }, (payload) => {
        const u = payload.new;
        if (u?.id) {
          setLiveStreams(prev => prev.map(s =>
            s.id === u.id ? { ...s, viewer_count: u.viewer_count ?? s.viewer_count } : s
          ));
        }
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'streams' }, () => {
        fetchLiveStreams();
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'streams' }, () => {
        fetchLiveStreams();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
      supabase.removeChannel(streamCh);
    };
  }, []);

  // Check push subscription state when user logs in
  useEffect(() => {
    if (!user || !("serviceWorker" in navigator) || !("PushManager" in window)) return;
    navigator.serviceWorker.ready.then(async reg => {
      const sub = await reg.pushManager.getSubscription();
      setPushEnabled(!!sub);
    }).catch(() => {});
  }, [user]);

  // Handle ?s=STREAM_ID deep links — navigate to stream once liveStreams loads
  useEffect(() => {
    if (!authReady || !liveStreams.length) return;
    const deepId = sessionStorage.getItem("stem_deep_stream");
    if (!deepId) return;
    sessionStorage.removeItem("stem_deep_stream");
    const raw = liveStreams.find(s => s.id === deepId);
    if (!raw) return;
    const meta = CAT_META[raw.category] || CAT_META["Just Chatting"];
    setStream({
      id: raw.id,
      user_id: raw.user_id,
      title: raw.title,
      streamer: raw.profiles?.full_name || raw.streamer_name || "Streamer",
      game: raw.category || "Just Chatting",
      viewers: raw.viewer_count || 0,
      follower_count: raw.profiles?.follower_count || 0,
      emoji: meta.emoji,
      color: meta.color,
      bg: meta.bg,
      isRealStream: true,
      mux_playback_id: raw.mux_playback_id || null,
      thumbnail_url: raw.thumbnail_url || null,
      started_at: raw.started_at || null,
    });
    setSess(0);
    setPage("stream");
    window.scrollTo(0, 0);
  }, [liveStreams, authReady]);

  const fetchProfile = async (userId) => {
    const { data } = await supabase.from("profiles").select("*").eq("id", userId).single();
    if (data) {
      if (!data.referral_code) {
        const base = (data.username || userId.slice(0, 8)).toUpperCase().slice(0, 8);
        const refCode = `${base}${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
        await supabase.from("profiles").update({ referral_code: refCode }).eq("id", userId);
        data.referral_code = refCode;
      }
      setProfile(data);
      const c = data.coins || 0;
      setCoins(c);
      coinsRef.current = c;
      const resolvedMode = data.role || "viewer";
      setMode(resolvedMode);
      localStorage.setItem("stem_mode", resolvedMode);
      setStreakDays(data.streak_days || 0);
      setReferralCode(data.referral_code || "");
      setEditProfile({ fullName: data.full_name || "", username: data.username || "", bio: data.bio || "", twitter: data.social_twitter || "", instagram: data.social_instagram || "", youtube: data.social_youtube || "", tiktok: data.social_tiktok || "" });
      // Compute tiers (need auth session for email_confirmed_at)
      const { data: { session } } = await supabase.auth.getSession();
      const emailVerified = !!session?.user?.email_confirmed_at;
      const newViewerTier = computeViewerTier(data, emailVerified);
      const tierOrder = { guest: 0, active: 1, verified_earner: 2, elite: 3 };
      const storedTier = localStorage.getItem("stem_viewer_tier") || "guest";
      if (tierOrder[newViewerTier] > tierOrder[storedTier]) {
        setTimeout(() => notify(`ðŸŽ‰ You unlocked ${VIEWER_TIER_INFO[newViewerTier]?.label} status! ${VIEWER_TIER_INFO[newViewerTier]?.emoji}`), 1500);
      }
      localStorage.setItem("stem_viewer_tier", newViewerTier);
      setViewerTier(newViewerTier);
      setStreamerTier(computeStreamerTier(data));
      // Handle Stripe success redirect
      const pending = sessionStorage.getItem("stem_coins_purchased");
      if (pending) {
        sessionStorage.removeItem("stem_coins_purchased");
        const n = parseInt(pending, 10);
        if (n > 0) setTimeout(() => notify(`🪙 ${n.toLocaleString()} coins added to your wallet!`), 800);
      }
    }
    return data;
  };

  const fetchLeaderboard = async () => {
    setLoadingLb(true);
    const [earnerRes, supporterRes] = await Promise.all([
      supabase.from("profiles").select("id,full_name,username,coins,avatar_url").eq("role", "viewer").order("coins", { ascending: false }).limit(20),
      supabase.rpc("get_top_supporters", { limit_n: 20 }),
    ]);
    if (earnerRes.data) setLeaderboard(earnerRes.data);
    if (supporterRes.data) setTopSupporters(supporterRes.data);
    setLoadingLb(false);
  };

  const checkMyBanStatus = async (channelId) => {
    if (!user || !channelId) { setIsBannedFromChannel(false); return; }
    const { data } = await supabase.from("chat_bans").select("id").eq("streamer_id", channelId).eq("banned_user_id", user.id).maybeSingle();
    setIsBannedFromChannel(!!data);
  };

  const fetchStreamGoal = async (streamId, streamUserId) => {
    const { data } = await supabase.from("streams").select("goal_type,goal_target,goal_label,started_at").eq("id", streamId).maybeSingle();
    if (!data?.goal_type) { setStreamGoal(null); return; }
    let current = 0;
    if (data.goal_type === "followers") {
      const { count } = await supabase.from("follows").select("id", { count: "exact", head: true }).eq("following_id", streamUserId);
      current = count || 0;
    } else if (data.goal_type === "viewers") {
      const { data: sd } = await supabase.from("streams").select("viewer_count").eq("id", streamId).single();
      current = sd?.viewer_count || 0;
    }
    setStreamGoal({ ...data, current });
  };

  const saveGoal = async () => {
    const target = parseInt(goalForm.target);
    if (!target || target < 1) { notify("Enter a valid target number"); return; }
    setSavingGoal(true);
    await supabase.from("streams").update({ goal_type: goalForm.type, goal_target: target, goal_label: goalForm.label.trim() || null }).eq("user_id", user.id);
    const { count } = goalForm.type === "followers"
      ? await supabase.from("follows").select("id", { count: "exact", head: true }).eq("following_id", user.id)
      : { count: stream?.viewers || 0 };
    setStreamGoal({ goal_type: goalForm.type, goal_target: target, goal_label: goalForm.label.trim() || null, current: count || 0 });
    setShowGoalEditor(false); notify("Goal set!");
    setSavingGoal(false);
  };

  const clearGoal = async () => {
    await supabase.from("streams").update({ goal_type: null, goal_target: null, goal_label: null }).eq("user_id", user.id);
    setStreamGoal(null); setShowGoalEditor(false);
  };

  const fetchLiveStreams = async () => {
    const { data } = await supabase
      .from("streams")
      .select("*, profiles(full_name, username, follower_count, avatar_url)")
      .eq("status", "live")
      .order("viewer_count", { ascending: false });
    if (data) setLiveStreams(data);
  };

  const fetchLandingStats = async () => {
    const [countRes, earnedRes] = await Promise.all([
      supabase.from("profiles").select("id", { count: "exact", head: true }),
      supabase.from("profiles").select("total_earned"),
    ]);
    const members = countRes.count || 0;
    const totalEarned = earnedRes.data
      ? earnedRes.data.reduce((sum, r) => sum + (r.total_earned || 0), 0)
      : 0;
    setLandingStats({ members, totalEarned });
  };

  const fetchFeaturedPredictions = async () => {
    const { data } = await supabase
      .from("predictions")
      .select("*, streams(title, user_id, profiles(full_name, username))")
      .eq("is_featured", true)
      .in("status", ["open", "locked"])
      .order("created_at", { ascending: false })
      .limit(5);
    if (data) setFeaturedPreds(data);
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

    if (!wasConsecutive && data.last_streak_date) notify("Streak reset â€” watch daily for bonus coins!");
    else if (newStreak === 3)  notify("ðŸ”¥ 3-day streak! Earning 1.25x coins!");
    else if (newStreak === 7)  notify("ðŸ”¥ 7-day streak! Earning 1.5x coins!");
    else if (newStreak === 14) { notify("ðŸ”¥ 14-day streak! Earning 2x coins â€” max bonus!"); }
    else if (newStreak > 1)    notify(`ðŸ”¥ ${newStreak}-day streak! Keep it up!`);
  };

  // Fetch the IDs of streamers this user follows (for notifications)
  const fetchMyFollows = async (userId) => {
    const { data } = await supabase.from("follows").select("following_id").eq("follower_id", userId);
    if (data) setMyFollows(data.map(f => f.following_id));
  };

  const searchStreamers = async (query) => {
    if (!query.trim()) { setSearchProfiles([]); return; }
    const q = query.trim();
    const { data } = await supabase.from("profiles")
      .select("id,full_name,username,avatar_url")
      .eq("role", "streamer")
      .or(`full_name.ilike.%${q}%,username.ilike.%${q}%`)
      .limit(5);
    setSearchProfiles(data || []);
  };

  const searchClipsQuery = async (query) => {
    if (!query.trim()) { setSearchClips([]); return; }
    const { data } = await supabase
      .from('clips')
      .select('id,title,score,vod_playback_id,mux_stream_id,profiles(full_name,username)')
      .ilike('title', `%${query.trim()}%`)
      .order('score', { ascending: false })
      .limit(5);
    setSearchClips(data || []);
  };

  const fetchFollowedStreamers = async () => {
    if (!user || myFollows.length === 0) { setFollowedStreamers([]); return; }
    const { data } = await supabase.from("profiles")
      .select("id,full_name,username,avatar_url")
      .in("id", myFollows);
    setFollowedStreamers(data || []);
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
    await supabase.from("notifications").insert({ user_id: referrer.id, title: `${newUserName} joined STEM!`, body: "They used your referral link — you earned 500 coins! 🎉", data: { type: "referral" }, read: false });
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
      supabase.from("clips").select("*, profiles(full_name,username,avatar_url)").eq("streamer_id", userId).order("created_at", { ascending: false }).limit(12),
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
    const { error } = await supabase.from("clips").insert({ stream_id: stream.id, user_id: user.id, streamer_id: stream.user_id || null, title, mux_stream_id: stream.mux_stream_id || null, vod_playback_id: stream.mux_playback_id || null });
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


  // â”€â”€ Withdrawals â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const COIN_PACKAGES = [
    { id: "starter", coins: 1000,  ngn: 1500,  price: "₦1,500",  label: "Starter",  bonus: 0 },
    { id: "popular", coins: 5500,  ngn: 7000,  price: "₦7,000",  label: "Popular",  bonus: 500,  tag: "Best Value" },
    { id: "value",   coins: 12000, ngn: 13000, price: "₦13,000", label: "Value",    bonus: 2000, tag: "20% Bonus" },
    { id: "mega",    coins: 55000, ngn: 50000, price: "₦50,000", label: "Mega",     bonus: 5000, tag: "Top Pick" },
  ];

  const handleBuyCoins = async (packageId) => {
    if (!user) { go("auth"); return; }
    const pkg = COIN_PACKAGES.find(p => p.id === packageId);
    if (!pkg) return;
    setBuyingCoins(packageId);

    // Load Flutterwave inline script on demand
    await new Promise((resolve) => {
      if (window.FlutterwaveCheckout) { resolve(); return; }
      const script = document.createElement("script");
      script.src = "https://checkout.flutterwave.com/v3.js";
      script.onload = resolve;
      document.head.appendChild(script);
    });

    const txRef = `STEM-${user.id.slice(0,8)}-${Date.now()}`;

    window.FlutterwaveCheckout({
      public_key: import.meta.env.VITE_FLW_PUBLIC_KEY,
      tx_ref: txRef,
      amount: pkg.ngn,
      currency: "NGN",
      payment_options: "card,banktransfer,ussd",
      customer: { email: user.email, name: profile?.full_name || user.email },
      meta: { user_id: user.id, package_id: packageId },
      customizations: {
        title: "STEM Coins",
        description: `Buy ${pkg.coins.toLocaleString()} coins for STEM`,
        logo: `${window.location.origin}/favicon.svg`,
      },
      callback: async (data) => {
        if (data.status === "successful") {
          try {
            const { data: { session } } = await supabase.auth.getSession();
            const res = await fetch("/api/flw-verify", {
              method: "POST",
              headers: { "Content-Type": "application/json", Authorization: `Bearer ${session?.access_token}` },
              body: JSON.stringify({ transactionId: data.transaction_id, packageId }),
            });
            const result = await res.json();
            if (res.ok) {
              const nc = coinsRef.current + pkg.coins;
              setCoins(nc); coinsRef.current = nc;
              notify(result.message || `${pkg.coins.toLocaleString()} coins added!`);
            } else {
              notify(result.error || "Payment verified but coins could not be added — contact support");
            }
          } catch {
            notify("Payment received — coins will be added shortly");
          }
        }
        setBuyingCoins(false);
      },
      onclose: () => setBuyingCoins(false),
    });
  };

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
      unlockAchievement("first_withdrawal");
      fetchWithdrawHistory();
      fetchTransactions();
    } catch (err) {
      notify("Network error â€” please try again");
    }
    setProcessingWithdraw(false);
  };
  // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  const joinWaitlist = async () => {
    const email = waitlistEmail.trim() || user?.email || "";
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      notify("Enter a valid email address"); return;
    }
    await supabase.from("premium_waitlist").upsert({ email, user_id: user?.id || null }, { onConflict: "email" });
    setWaitlistDone(true);
    notify("You're on the waitlist! We'll let you know when Premium launches.");
  };
  // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  // â”€â”€ Emotes â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

  // â”€â”€ Gift animations â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const triggerGiftAnim = (emoji, name) => {
    const id = Date.now() + Math.random();
    const x = 15 + Math.random() * 70;
    setGiftAnims(a => [...a, { id, emoji, name, x }]);
    setTimeout(() => setGiftAnims(a => a.filter(g => g.id !== id)), 2600);
  };

  // â”€â”€ On-stream alert overlay â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const showStreamAlert = (msg, emoji, sub = "") => {
    setStreamAlert({ msg, emoji, sub });
    if (streamAlertRef.current) clearTimeout(streamAlertRef.current);
    streamAlertRef.current = setTimeout(() => setStreamAlert(null), 4200);
  };

  // â”€â”€ Hype Train â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

  // â”€â”€ Streamer analytics â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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
      streamCount: streamIdsRes.data?.length || 0,
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

  // â”€â”€ Admin withdrawal management â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const fetchAdminWithdrawals = async () => {
    setLoadingAdmin(true);
    const { data } = await supabase
      .from("withdrawal_requests")
      .select("*, profiles(username, full_name, coins)")
      .order("created_at", { ascending: false });
    setAdminWithdrawals(data || []);
    setLoadingAdmin(false);
  };


  const sendWithdrawalNotification = async (withdrawalId, status) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      fetch('/api/withdrawal-notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session?.access_token}` },
        body: JSON.stringify({ withdrawalId, status }),
      });
    } catch {}
  };
  const approveWithdrawal = async (w) => {
    await supabase.from("withdrawal_requests").update({ status: "paid" }).eq("id", w.id);
    setAdminWithdrawals(prev => prev.map(x => x.id === w.id ? { ...x, status: "paid" } : x));
    sendWithdrawalNotification(w.id, 'paid');
    notify("Withdrawal approved âœ“");
  };

  const rejectWithdrawal = async (w) => {
    await supabase.from("profiles").update({ coins: (w.profiles?.coins || 0) + w.amount_coins }).eq("id", w.user_id);
    await supabase.from("withdrawal_requests").update({ status: "rejected" }).eq("id", w.id);
    setAdminWithdrawals(prev => prev.map(x => x.id === w.id ? { ...x, status: "rejected" } : x));
    sendWithdrawalNotification(w.id, 'rejected');
    notify("Rejected â€” coins refunded");
  };


  // â”€â”€ Subscription â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const checkSubscription = async (streamerId) => {
    if (!user || !streamerId) { setIsSubscribed(false); setSubTier(0); return; }
    const { data } = await supabase.from("subscriptions").select("expires_at,tier").eq("subscriber_id", user.id).eq("streamer_id", streamerId).maybeSingle();
    const active = !!data && new Date(data.expires_at) > new Date();
    setIsSubscribed(active);
    setSubTier(active ? (data.tier || 1) : 0);
  };

  const handleSubscribe = async (tier = 1) => {
    if (!requireAuth()) return;
    if (!stream?.user_id || stream.user_id === user?.id) return;
    const t = SUB_TIERS.find(x => x.tier === tier) || SUB_TIERS[0];
    if (coinsRef.current < t.cost) { notify(`Need ${t.cost.toLocaleString()} coins for ${t.label}!`); return; }
    setSubscribing(true);
    const nc = coinsRef.current - t.cost;
    setCoins(nc); coinsRef.current = nc;
    // 70% goes to streamer, 30% platform cut
    const streamerCut = Math.floor(t.cost * 0.7);
    supabase.from("profiles").update({ coins: nc }).eq("id", user.id);
    const { data: sp } = await supabase.from("profiles").select("coins").eq("id", stream.user_id).single();
    if (sp) {
      await supabase.from("profiles").update({ coins: (sp.coins || 0) + streamerCut }).eq("id", stream.user_id);
      await supabase.from("transactions").insert({ user_id: stream.user_id, type: "sub_income", amount: streamerCut, description: `${t.label} sub from ${profile?.username || "viewer"}` });
    }
    await supabase.from("subscriptions").upsert({
      subscriber_id: user.id, streamer_id: stream.user_id, tier,
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    }, { onConflict: "subscriber_id,streamer_id" });
    logTransaction("subscription", -t.cost, `${t.label} sub to ${stream.streamer}`);
    setIsSubscribed(true); setSubTier(tier); setShowSubTierPicker(false);
    notify(`${t.badge} Subscribed ${t.label} to ${stream.streamer}!`);
    if (stream?.id) {
      const viewerName = profile?.full_name || profile?.username || "Someone";
      await supabase.from("messages").insert({ stream_id: stream.id, user_id: null, username: "StreamBot", content: `${t.badge} ${viewerName} just subscribed ${t.label}! Welcome!`, color: t.color, is_superchat: false, coins_spent: 0 });
    }
    setSubscribing(false);
  };


  // â”€â”€ Top gifters â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const addGifter = (amount) => {
    if (!user) return;
    const name = profile?.full_name?.split(" ")[0] || profile?.username || "Anon";
    setTopGifters(prev => ({ ...prev, [user.id]: { name, total: (prev[user.id]?.total || 0) + amount } }));
  };

  // â”€â”€ Stream polls â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

  // â”€â”€ Predictions â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const fetchActivePrediction = async (streamId) => {
    const { data } = await supabase.from("predictions").select("*")
      .eq("stream_id", streamId).in("status", ["open", "locked"]).order("created_at", { ascending: false }).limit(1).maybeSingle();
    setActivePrediction(data || null);
    if (data) {
      const { data: entries } = await supabase.from("prediction_entries").select("*").eq("prediction_id", data.id);
      const e = entries || [];
      setPredEntries(e);
      if (user) setMyPredBet(e.find(x => x.user_id === user.id) || null);
    } else {
      setPredEntries([]); setMyPredBet(null);
    }
  };

  const createPrediction = async () => {
    if (!predForm.title.trim()) { notify("Enter a prediction question"); return; }
    const validOpts = predForm.options.map(o => o.trim()).filter(Boolean).slice(0, 5);
    if (validOpts.length < 2) { notify("Add at least 2 options"); return; }
    const endsAt = new Date(Date.now() + predForm.duration * 1000).toISOString();
    const { data, error } = await supabase.from("predictions").insert({
      stream_id: stream.id, streamer_id: user.id,
      title: predForm.title.trim(),
      option_a: validOpts[0], option_b: validOpts[1],
      option_c: validOpts[2] || null, option_d: validOpts[3] || null, option_e: validOpts[4] || null,
      duration_secs: predForm.duration, ends_at: endsAt, status: "open",
    }).select().single();
    if (error) { notify("Failed to create prediction"); return; }
    setActivePrediction(data); setPredEntries([]); setMyPredBet(null);
    setShowCreatePred(false); setPredForm({ title: "", options: ["Yes", "No"], duration: 120 });
    predChRef.current?.send({ type: "broadcast", event: "pred_new", payload: { prediction: data } });
    notify("Prediction started!");
  };

  const placeBet = async (option) => {
    if (!requireAuth()) return;
    if (myPredBet) { notify("You already placed a bet"); return; }
    if (!activePrediction || activePrediction.status !== "open") { notify("Betting is closed"); return; }
    if (activePrediction.ends_at && new Date(activePrediction.ends_at) < new Date()) { notify("Betting time has ended"); return; }
    const amount = Math.floor(Number(predBetAmount)) || 0;
    if (amount < 10) { notify("Minimum bet is 10 coins"); return; }
    if (amount > coinsRef.current) { notify("Not enough coins"); return; }
    setPlacingBet(true);
    const nc = coinsRef.current - amount;
    setCoins(nc); coinsRef.current = nc;
    await supabase.from("profiles").update({ coins: nc }).eq("id", user.id);
    const { data: entry, error } = await supabase.from("prediction_entries").insert({
      prediction_id: activePrediction.id, user_id: user.id, option, coins: amount,
    }).select().single();
    if (error) {
      const rc = coinsRef.current + amount;
      setCoins(rc); coinsRef.current = rc;
      await supabase.from("profiles").update({ coins: rc }).eq("id", user.id);
      notify("Failed to place bet â€” coins refunded"); setPlacingBet(false); return;
    }
    const newEntries = [...predEntries, entry];
    setPredEntries(newEntries); setMyPredBet(entry);
    predChRef.current?.send({ type: "broadcast", event: "pred_entry", payload: { entry } });
    const optLabelMap = { a: activePrediction.option_a, b: activePrediction.option_b, c: activePrediction.option_c, d: activePrediction.option_d, e: activePrediction.option_e };
    notify(`Bet placed! ${amount.toLocaleString()} coins on ${optLabelMap[option] || option}`);
    setPlacingBet(false);
  };

  const lockPrediction = async () => {
    const { data } = await supabase.from("predictions").update({ status: "locked" }).eq("id", activePrediction.id).select().single();
    if (data) {
      setActivePrediction(data);
      predChRef.current?.send({ type: "broadcast", event: "pred_lock", payload: {} });
      notify("Bets locked â€” pick a winner");
    }
  };

  const resolvePrediction = async (winOption) => {
    const { error } = await supabase.rpc("resolve_prediction", { p_prediction_id: activePrediction.id, p_winning_option: winOption });
    if (error) { notify("Failed to resolve: " + error.message); return; }
    const optLabelMap = { a: activePrediction.option_a, b: activePrediction.option_b, c: activePrediction.option_c, d: activePrediction.option_d, e: activePrediction.option_e };
    const winLabel = optLabelMap[winOption] || winOption;
    const winners = predEntries.filter(e => e.option === winOption);
    const totalPot = predEntries.reduce((s, e) => s + e.coins, 0);
    // Show recap card
    setPredRecap({
      title: activePrediction.title,
      winLabel,
      potCoins: totalPot,
      winnerCount: winners.length,
      myResult: myPredBet ? (myPredBet.option === winOption ? "won" : "lost") : null,
      myBet: myPredBet?.coins || 0,
    });
    setTimeout(() => setPredRecap(null), 12000);
    predChRef.current?.send({ type: "broadcast", event: "pred_resolved", payload: { winning_option: winOption, win_label: winLabel } });
    const { data: prof } = await supabase.from("profiles").select("coins").eq("id", user.id).single();
    if (prof) { setCoins(prof.coins); coinsRef.current = prof.coins; }
    setActivePrediction(p => ({ ...p, status: "resolved", winning_option: winOption }));
    notify(`${winLabel} wins! Coins paid to ${winners.length} winner${winners.length !== 1 ? "s" : ""}`);
    if (myPredBet?.option === winOption) unlockAchievement("predictor");
    setTimeout(() => { setActivePrediction(null); setPredEntries([]); setMyPredBet(null); }, 7000);
  };

  const cancelPrediction = async () => {
    const { error } = await supabase.rpc("cancel_prediction", { p_prediction_id: activePrediction.id });
    if (error) { notify("Failed to cancel"); return; }
    predChRef.current?.send({ type: "broadcast", event: "pred_cancelled", payload: {} });
    if (user) {
      const { data: prof } = await supabase.from("profiles").select("coins").eq("id", user.id).single();
      if (prof) { setCoins(prof.coins); coinsRef.current = prof.coins; }
    }
    notify("Prediction cancelled â€” all bets refunded");
    setActivePrediction(null); setPredEntries([]); setMyPredBet(null);
  };

  const toggleFeaturedPrediction = async () => {
    const newFeatured = !activePrediction.is_featured;
    await supabase.from("predictions").update({ is_featured: newFeatured }).eq("id", activePrediction.id);
    setActivePrediction(p => ({ ...p, is_featured: newFeatured }));
    predChRef.current?.send({ type: "broadcast", event: "pred_featured", payload: { is_featured: newFeatured } });
    fetchFeaturedPredictions();
    notify(newFeatured ? "Prediction featured on Discover!" : "Removed from Discover");
  };

  // â”€â”€ Daily Missions â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const fetchDailyMissions = async () => {
    if (!user) return;
    const today = new Date().toISOString().slice(0, 10);
    const { data } = await supabase.from("daily_missions").select("*").eq("user_id", user.id).eq("date", today).maybeSingle();
    if (data) setDailyMissions(data);
    else {
      const { data: created } = await supabase.from("daily_missions").insert({ user_id: user.id, date: today }).select().single();
      setDailyMissions(created || { watch_mins: 0, chat_count: 0, followed_today: false, bonus_claimed: false });
    }
  };

  const claimMissionBonus = async () => {
    if (!dailyMissions || dailyMissions.bonus_claimed) return;
    if (dailyMissions.watch_mins < 10 || dailyMissions.chat_count < 5 || !dailyMissions.followed_today) return;
    const today = new Date().toISOString().slice(0, 10);
    await supabase.from("daily_missions").update({ bonus_claimed: true }).eq("user_id", user.id).eq("date", today);
    const bonus = 500;
    const nc = coinsRef.current + bonus;
    setCoins(nc); coinsRef.current = nc;
    await supabase.from("profiles").update({ coins: nc }).eq("id", user.id);
    await supabase.from("transactions").insert({ user_id: user.id, type: "daily_bonus", amount: bonus, description: "Daily missions complete!" });
    setDailyMissions(m => ({ ...m, bonus_claimed: true }));
    notify("ðŸŽ‰ Daily missions complete! +500 coins");
  };

  const incMissionChat = async () => {
    if (!user || !dailyMissions || dailyMissions.chat_count >= 5) return;
    const today = new Date().toISOString().slice(0, 10);
    const newCount = (dailyMissions.chat_count || 0) + 1;
    await supabase.from("daily_missions").update({ chat_count: newCount }).eq("user_id", user.id).eq("date", today);
    setDailyMissions(m => m ? { ...m, chat_count: newCount } : m);
  };

  const setMissionFollowed = async () => {
    if (!user || !dailyMissions || dailyMissions.followed_today) return;
    const today = new Date().toISOString().slice(0, 10);
    await supabase.from("daily_missions").update({ followed_today: true }).eq("user_id", user.id).eq("date", today);
    setDailyMissions(m => m ? { ...m, followed_today: true } : m);
  };

  // â”€â”€ Achievements â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const fetchAchievements = async () => {
    if (!user) return;
    const { data } = await supabase.from("user_achievements").select("achievement_key").eq("user_id", user.id);
    if (data) setAchievements(new Set(data.map(a => a.achievement_key)));
  };

  const enablePushNotifications = async () => {
    if (!user || !("serviceWorker" in navigator) || !("PushManager" in window)) {
      notify("Push notifications are not supported in this browser.");
      return;
    }
    const vapidKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
    if (!vapidKey) {
      notify("Push notifications not configured yet — check back soon.");
      return;
    }
    setPushLoading(true);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") { notify("Notification permission denied."); setPushLoading(false); return; }
      const reg = await navigator.serviceWorker.ready;
      let sub = await reg.pushManager.getSubscription();
      if (!sub) {
        sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: vapidKey,
        });
      }
      const { data: { session } } = await supabase.auth.getSession();
      await fetch("/api/push-subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": "Bearer " + session?.access_token },
        body: JSON.stringify({ subscription: sub.toJSON() }),
      });
      setPushEnabled(true);
      notify("Notifications enabled! You'll get notified when followed streamers go live.");
    } catch (err) {
      notify("Could not enable notifications — try again.");
    }
    setPushLoading(false);
  };

  const disablePushNotifications = async () => {
    if (!("serviceWorker" in navigator)) return;
    setPushLoading(true);
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await sub.unsubscribe();
        const { data: { session } } = await supabase.auth.getSession();
        await fetch("/api/push-subscribe", {
          method: "DELETE",
          headers: { "Authorization": "Bearer " + session?.access_token },
        });
      }
      setPushEnabled(false);
    } catch (err) { console.error(err); }
    setPushLoading(false);
  };

  const unlockAchievement = async (key) => {
    if (achievements.has(key) || !user) return;
    const { error } = await supabase.from("user_achievements").insert({ user_id: user.id, achievement_key: key });
    if (!error) {
      setAchievements(prev => new Set([...prev, key]));
      const ach = ACHIEVEMENTS[key];
      if (ach) setTimeout(() => notify(`ðŸ† Achievement: ${ach.emoji} ${ach.label}!`), 400);
    }
  };

  // â”€â”€ Clip Voting â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  // Reports
  const openReport = (type, targetId, targetMeta = {}) => {
    if (!user) { setShowSignupPrompt(true); return; }
    setReportType(type); setReportTargetId(targetId); setReportTargetMeta(targetMeta); setReportReason(""); setShowReportModal(true);
  };
  const submitReport = async () => {
    if (!reportReason.trim()) { notify("Please describe the issue"); return; }
    setSubmittingReport(true);
    const { error } = await supabase.from("reports").insert({ reporter_id: user.id, type: reportType, target_id: reportTargetId, target_meta: reportTargetMeta, reason: reportReason.trim() });
    setSubmittingReport(false);
    if (error) { notify("Failed to submit report"); return; }
    setShowReportModal(false); notify("Report submitted — we'll review it shortly");
  };
  const fetchReports = async () => {
    setLoadingReports(true);
    const { data } = await supabase.from("reports").select("*").order("created_at", { ascending: false });
    if (data) setReports(data);
    setLoadingReports(false);
  };
  const resolveReport = async (id, status) => {
    await supabase.from("reports").update({ status }).eq("id", id);
    setReports(prev => prev.map(r => r.id === id ? { ...r, status } : r));
  };

  const fetchMyClipVotes = async () => {
    if (!user) return;
    const { data } = await supabase.from("clip_votes").select("clip_id,vote").eq("user_id", user.id);
    if (data) setMyClipVotes(Object.fromEntries(data.map(v => [v.clip_id, v.vote])));
  };

  const voteClip = async (e, clipId, vote) => {
    e.stopPropagation();
    if (!requireAuth()) return;
    await supabase.rpc("vote_clip", { p_clip_id: clipId, p_user_id: user.id, p_vote: vote });
    const existing = myClipVotes[clipId];
    if (existing === vote) {
      setMyClipVotes(v => { const n = { ...v }; delete n[clipId]; return n; });
      setAllClips(clips => clips.map(c => c.id === clipId ? { ...c, score: (c.score || 0) - vote } : c));
    } else {
      const delta = existing ? (vote - existing) : vote;
      setMyClipVotes(v => ({ ...v, [clipId]: vote }));
      setAllClips(clips => clips.map(c => c.id === clipId ? { ...c, score: (c.score || 0) + delta } : c));
    }
  };


  // â”€â”€ Auto-mod Word Filter â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const fetchBannedWords = async (streamerId) => {
    if (!streamerId) return;
    const { data } = await supabase.from("automod_words").select("word").eq("streamer_id", streamerId);
    setBannedWords((data || []).map(w => w.word));
  };

  const addBannedWord = async () => {
    const word = newBannedWord.trim().toLowerCase();
    if (!word || !user) return;
    if (bannedWords.includes(word)) { setNewBannedWord(""); return; }
    await supabase.from("automod_words").insert({ streamer_id: user.id, word });
    setBannedWords(w => [...w, word]);
    setNewBannedWord("");
  };

  const removeBannedWord = async (word) => {
    await supabase.from("automod_words").delete().eq("streamer_id", user.id).eq("word", word);
    setBannedWords(w => w.filter(x => x !== word));
  };


  const clearChat = async () => {
    if (!stream?.id) return;
    await supabase.from("messages").delete().eq("stream_id", stream.id);
    setChat([]);
    notify("Chat cleared");
  };

  const updateStreamInfo = async () => {
    if (!stream?.id || !streamInfoDraft.title.trim()) return;
    await supabase.from("streams").update({ title: streamInfoDraft.title.trim(), game: streamInfoDraft.game.trim() || stream.game }).eq("id", stream.id);
    setStream(s => ({ ...s, title: streamInfoDraft.title.trim(), game: streamInfoDraft.game.trim() || s.game }));
    setEditingStreamInfo(false);
    notify("Stream info updated");
  };

  const fetchPredHistory = async () => {
    if (!user) return;
    setLoadingPredHistory(true);
    const { data } = await supabase.from("prediction_history")
      .select("*").eq("user_id", user.id)
      .order("created_at", { ascending: false }).limit(30);
    setPredHistory(data || []);
    setLoadingPredHistory(false);
  };
  // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  // â”€â”€ Streamers directory â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const fetchAllStreamers = async () => {
    setLoadingStreamers(true);
    const { data } = await supabase
      .from(`profiles`)
      .select(`id,full_name,username,avatar_url,follower_count,bio`)
      .eq(`role`, `streamer`)
      .order(`follower_count`, { ascending: false })
      .limit(100);
    setAllStreamers(data || []);
    setLoadingStreamers(false);
  };

  // â”€â”€ VODs gallery â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const fetchAllVods = async () => {
    setLoadingVods(true);
    const { data } = await supabase
      .from(`past_streams`)
      .select(`id,title,category,mux_playback_id,peak_viewers,created_at,streamer_name,user_id,profiles(full_name,username,avatar_url)`)
      .not(`mux_playback_id`, `is`, null)
      .order(`created_at`, { ascending: false })
      .limit(60);
    setAllVods(data || []);
    setLoadingVods(false);
  };

  // â”€â”€ Clips gallery â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const fetchAllClips = async () => {
    setLoadingClips(true);
    const { data: clips } = await supabase
      .from("clips")
      .select("*, profiles(username, full_name), streams(mux_stream_id, title, category)")
      .order("created_at", { ascending: false })
      .limit(50);
    if (clips) {
      const muxIds = [...new Set(clips.filter(c => c.streams && c.streams.mux_stream_id).map(c => c.streams.mux_stream_id))];
      let vodMap = {};
      if (muxIds.length) {
        const { data: pasts } = await supabase
          .from("past_streams")
          .select("mux_stream_id, mux_playback_id")
          .in("mux_stream_id", muxIds);
        if (pasts) pasts.forEach(ps => { if (ps.mux_playback_id) vodMap[ps.mux_stream_id] = ps.mux_playback_id; });
      }
      setAllClips(clips.map(c => ({
        ...c,
        vod_playback_id: c.vod_playback_id || ((c.streams && c.streams.mux_stream_id) ? (vodMap[c.streams.mux_stream_id] || null) : null),
        stream_category: (c.streams && c.streams.category) ? c.streams.category : (c.category || null),
      })));
    } else {
      setAllClips([]);
    }
    setLoadingClips(false);
  };

  // â”€â”€ Past streams â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const savePastStream = async () => {
    if (!user) return;
    const { data: sd } = await supabase.from("streams").select("title,category,mux_stream_id,mux_playback_id,viewer_count").eq("user_id", user.id).single();
    if (sd) {
      // mux_playback_id starts null â€” the Mux webhook fills it in once the VOD is processed
      await supabase.from("past_streams").insert({
        user_id: user.id, streamer_name: profile?.full_name || profile?.username || "Streamer",
        title: sd.title, category: sd.category, mux_stream_id: sd.mux_stream_id,
        mux_playback_id: sd.mux_playback_id || muxPlaybackId || null, peak_viewers: sd.viewer_count || 0,
      });
    }
  };

  const updateLiveInfo = async () => {
    if (!liveInfoForm.title.trim()) { notify("Title cannot be empty"); return; }
    setSavingLiveInfo(true);
    await supabase.from("streams").update({ title: liveInfoForm.title.trim(), category: liveInfoForm.category }).eq("user_id", user.id);
    setGoLiveForm(f => ({ ...f, title: liveInfoForm.title.trim(), category: liveInfoForm.category }));
    setEditingLiveInfo(false);
    notify("Stream info updated!");
    setSavingLiveInfo(false);
  };

  const fetchPastStreams = async (userId) => {
    const { data } = await supabase.from("past_streams").select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(12);
    setPastStreams(data || []);
  };

  const fetchNotifications = async () => {
    if (!user) return;
    const { data } = await supabase.from("notifications").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(20);
    if (!data) return;
    const dbNotifs = data.map(n => ({
      id: n.id, dbId: n.id, title: n.title, body: n.body,
      data: n.data, read: n.read, time: new Date(n.created_at),
    }));
    setNotifications(prev => {
      const dbIds = new Set(dbNotifs.map(n => n.dbId));
      const memOnly = prev.filter(n => !n.dbId && !dbIds.has(n.id));
      return [...dbNotifs, ...memOnly].slice(0, 20);
    });
    const unread = data.filter(n => !n.read).length;
    if (unread > 0) setUnreadNotifs(c => Math.max(c, unread));
  };

  // â”€â”€ Coin shop â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const buyShopItem = async (name, cost, profileUpdate) => {
    if (!requireAuth()) return;
    if (coinsRef.current < cost) { notify(`Need ${cost.toLocaleString()} coins!`); return; }
    const nc = coinsRef.current - cost;
    setCoins(nc); coinsRef.current = nc;
    await supabase.from("profiles").update({ coins: nc, ...profileUpdate }).eq("id", user.id);
    setProfile(p => p ? { ...p, ...profileUpdate } : p);
    logTransaction("shop_purchase", -cost, `Bought ${name}`);
    notify(`${name} unlocked! âœ¨`);
  };


  // â”€â”€ Viewer profiles â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const viewVProfile = async (userId) => {
    if (!userId) return;
    setLoadingVProfile(true);
    const [profRes, txnRes, achRes] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", userId).single(),
      supabase.from("transactions").select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(20),
      supabase.from("user_achievements").select("achievement_key").eq("user_id", userId),
    ]);
    if (profRes.data) {
      setVProfile({ ...profRes.data, _achievements: new Set((achRes.data || []).map(a => a.achievement_key)) });
      setVProfileTxns(txnRes.data || []);
      setPage("vprofile");
      window.scrollTo(0, 0);
    }
    setLoadingVProfile(false);
  };

  // â”€â”€ Chat moderation â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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
  // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  // Coin earning â€” tick speed scales with streak; guests earn nothing; elite earns 1.5x via fractional accumulator
  const tickMs = streakDays >= 14 ? 450 : streakDays >= 7 ? 600 : streakDays >= 3 ? 720 : 900;
  useEffect(() => {
    if (page !== "stream" || viewerTier === "guest") return;
    eliteAccumRef.current = 0;
    const t = setInterval(() => {
      let earn = 1;
      if (viewerTier === "elite") {
        eliteAccumRef.current += 0.5;
        if (eliteAccumRef.current >= 1) { earn = 2; eliteAccumRef.current -= 1; }
      }
      setSess(s => s + earn);
      setCoins(c => c + earn);
    }, tickMs);
    return () => clearInterval(t);
  }, [page, tickMs, viewerTier]);

  // Daily mission: increment watch_mins every 60s while watching
  useEffect(() => {
    if (page !== "stream" || !user || !stream?.isRealStream) return;
    const missionT = setInterval(() => {
      const today = new Date().toISOString().slice(0, 10);
      setDailyMissions(m => {
        if (!m || m.watch_mins >= 10) return m;
        const newMins = (m.watch_mins || 0) + 1;
        supabase.from("daily_missions").update({ watch_mins: newMins }).eq("user_id", user.id).eq("date", today);
        return { ...m, watch_mins: newMins };
      });
    }, 60000);
    return () => clearInterval(missionT);
  }, [page, user, stream?.isRealStream]);

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

  // Track streams_watched + hours_watched for viewer tier progression
  useEffect(() => {
    if (page !== "stream" || !user || !stream?.isRealStream) return;
    streamEntryTimeRef.current = Date.now();
    // Count each unique stream once per session
    if (!watchedStreamsRef.current.has(stream.id)) {
      watchedStreamsRef.current.add(stream.id);
      const newSw = (profile?.streams_watched || 0) + 1;
      supabase.from("profiles").update({ streams_watched: newSw }).eq("id", user.id).then(() => {
        setProfile(p => p ? { ...p, streams_watched: newSw } : p);
      });
    }
    return () => {
      if (!streamEntryTimeRef.current) return;
      const hoursSpent = (Date.now() - streamEntryTimeRef.current) / 3600000;
      if (hoursSpent < 0.01) return; // skip very short visits
      const newHw = parseFloat(((profile?.hours_watched || 0) + hoursSpent).toFixed(4));
      supabase.from("profiles").update({ hours_watched: newHw }).eq("id", user.id);
      streamEntryTimeRef.current = null;
    };
  }, [page, stream?.id, user?.id]);



  // Prediction countdown
  useEffect(() => {
    if (!activePrediction || activePrediction.status !== "open" || !activePrediction.ends_at) {
      setPredCountdown(0); return;
    }
    const tick = () => {
      const rem = Math.max(0, Math.round((new Date(activePrediction.ends_at) - Date.now()) / 1000));
      setPredCountdown(rem);
      if (rem === 0) setActivePrediction(p => p && p.status === "open" ? { ...p, status: "locked" } : p);
    };
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, [activePrediction?.id, activePrediction?.status, activePrediction?.ends_at]);

  // Unified stream broadcast channel (polls + predictions + viewer count)
  useEffect(() => {
    if (page !== "stream" || !stream?.id) { pollChRef.current = null; predChRef.current = null; return; }
    const streamId = stream.id;
    const ch = supabase.channel(`stream-bc-${streamId}`)
      // Viewer count updates
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "streams", filter: `id=eq.${streamId}` }, (payload) => {
        setStream(s => ({ ...s, viewers: payload.new.viewer_count }));
        setViewerCount(payload.new.viewer_count || 0);
      })
      // Poll events
      .on("broadcast", { event: "poll_start" }, ({ payload }) => { setActivePoll(payload); setPollVoted(null); })
      .on("broadcast", { event: "poll_vote" }, ({ payload }) => {
        setActivePoll(p => p ? { ...p, votes: { ...p.votes, [payload.opt]: (p.votes[payload.opt] || 0) + 1 } } : p);
      })
      .on("broadcast", { event: "poll_end" }, () => { setActivePoll(null); setPollVoted(null); })
      // Prediction events
      .on("broadcast", { event: "pred_new" }, ({ payload }) => {
        setActivePrediction(payload.prediction); setPredEntries([]); setMyPredBet(null);
      })
      .on("broadcast", { event: "pred_entry" }, ({ payload }) => {
        setPredEntries(cur => cur.find(e => e.id === payload.entry.id) ? cur : [...cur, payload.entry]);
      })
      .on("broadcast", { event: "pred_lock" }, () => {
        setActivePrediction(p => p ? { ...p, status: "locked" } : p);
      })
      .on("broadcast", { event: "pred_resolved" }, ({ payload }) => {
        setActivePrediction(p => p ? { ...p, status: "resolved", winning_option: payload.winning_option } : p);
        notify(`Prediction: ${payload.win_label} wins!`);
        if (user) supabase.from("profiles").select("coins").eq("id", user.id).single().then(({ data }) => {
          if (data) { setCoins(data.coins); coinsRef.current = data.coins; }
        });
        setTimeout(() => { setActivePrediction(null); setPredEntries([]); setMyPredBet(null); }, 7000);
      })
      .on("broadcast", { event: "pred_cancelled" }, () => {
        notify("Prediction cancelled â€” coins refunded");
        if (user) supabase.from("profiles").select("coins").eq("id", user.id).single().then(({ data }) => {
          if (data) { setCoins(data.coins); coinsRef.current = data.coins; }
        });
        setActivePrediction(null); setPredEntries([]); setMyPredBet(null);
      })
      .on("broadcast", { event: "pred_featured" }, ({ payload }) => {
        setActivePrediction(p => p ? { ...p, is_featured: payload.is_featured } : p);
      })
      .subscribe();
    pollChRef.current = ch;
    predChRef.current = ch;
    fetchActivePrediction(streamId);
    return () => { supabase.removeChannel(ch); pollChRef.current = null; predChRef.current = null; };
  }, [page, stream?.id]);

  // Load moderation state when entering a stream as the streamer
  useEffect(() => {
    if (page === "stream" && stream?.isRealStream && user?.id === stream?.user_id) {
      supabase.from("chat_bans").select("banned_user_id").eq("streamer_id", user.id).then(({ data }) => {
        setChatBans(new Set((data || []).map(b => b.banned_user_id)));
      });
      setSlowModeSecs(stream.slow_mode || 0);
      setSubOnly(stream.sub_only_chat || false);
      setFollowerOnly(stream.follower_only_chat || false);
      setStreamInfoDraft({ title: stream.title || "", game: stream.game || "" });
      coinMilestoneRef.current = coins;
    }
  }, [page, stream?.id]);

  // Persist chat moderation settings to DB when stream owner changes them
  useEffect(() => {
    if (!stream?.id || !stream?.isRealStream || user?.id !== stream?.user_id) return;
    supabase.from("streams").update({ slow_mode: slowModeSecs, sub_only_chat: subOnly, follower_only_chat: followerOnly }).eq("id", stream.id);
  }, [slowModeSecs, subOnly, followerOnly]);

  // Track peak viewers during active stream
  useEffect(() => {
    if (viewerCount > peakViewersRef.current) peakViewersRef.current = viewerCount;
  }, [viewerCount]);

  // Ad revenue: streamer earns coins per viewer while live (~4 coins/hr per viewer)
  useEffect(() => {
    if (!isStreaming || mode !== "streamer") return;
    const t = setInterval(() => {
      const vc = viewerCount || 0;
      if (vc < 1) return;
      const earned = Math.max(1, Math.round(vc * 0.067));
      setAdRevenue(r => r + earned);
      setCoins(c => c + earned);
      coinsRef.current += earned;
    }, 60000);
    return () => clearInterval(t);
  }, [isStreaming, mode, viewerCount]);


  // Check follow status + ban status whenever we enter a stream
  useEffect(() => {
    setFollowing(false);
    setIsBannedFromChannel(false);
    if (page === "stream") {
      checkFollowing(stream);
      if (stream?.user_id && user?.id !== stream?.user_id) checkMyBanStatus(stream.user_id);
      if (stream?.isRealStream && stream?.id) fetchStreamGoal(stream.id, stream.user_id);
    } else {
      setStreamGoal(null);
    }
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
        if (newlyLive.length === 1) notify(`ðŸ”´ ${newlyLive[0].profiles?.full_name || "A streamer"} just went live!`);
        else notify(`ðŸ”´ ${newlyLive.length} streamers you follow just went live!`);
      }
    }
    prevLiveIdsRef.current = currentIds;
  }, [liveStreams]);

  // Dynamic page title
  useEffect(() => {
    const titles = {
      land: "STEM — Stream and Earn Money",
      auth: "Sign Up or Log In — STEM",
      disc: "Discover Streams — STEM",
      stream: stream?.title ? `${stream.title} · ${stream.streamer || "STEM"}` : "Watch Live — STEM",
      wallet: "My Wallet — STEM",
      profile: "My Profile — STEM",
      dash: "Creator Dashboard — STEM",
      leaderboard: "Top Earners — STEM",
      clips: "Clips — STEM",
      vod: "Replays — STEM",
      channel: channelUser?.full_name ? `${channelUser.full_name} — STEM` : "Channel — STEM",
      vprofile: "Viewer Profile — STEM",
      streamer: "Stream on STEM — Get Paid",
      tos: "Terms of Service — STEM",
      privacy: "Privacy Policy — STEM",
      admin: "Admin — STEM",
    };
    document.title = titles[page] || "STEM — Stream and Earn Money";
  }, [page, stream?.title, channelUser?.full_name]);

  // Search debounce
  useEffect(() => {
    const t = setTimeout(() => {
      searchStreamers(search);
      searchClipsQuery(search);
    }, 280);
    return () => clearTimeout(t);
  }, [search]);

  // Load followed streamers when switching to Following tab
  useEffect(() => {
    if (page === "disc" && user) fetchFollowedStreamers();
  }, [page, myFollows.length]);

  // Refresh follows list after follow/unfollow (keyed on user, not the boolean)
  useEffect(() => {
    if (user) fetchMyFollows(user.id);
  }, [user?.id]);

  // Load DB notifications + subscribe to realtime new ones
  useEffect(() => {
    if (!user) return;
    fetchNotifications();
    const ch = supabase.channel(`notifs-${user.id}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${user.id}` }, ({ new: n }) => {
        const newNotif = { id: n.id, dbId: n.id, title: n.title, body: n.body, data: n.data, read: false, time: new Date(n.created_at) };
        setNotifications(prev => [newNotif, ...prev].slice(0, 20));
        setUnreadNotifs(c => c + 1);
        notify(`ðŸ”´ ${n.title}`);
      })
      .subscribe();
    return () => supabase.removeChannel(ch);
  }, [user?.id]);


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
    if (page === "admin" && user?.email === "blankcoojnr@gmail.com") { fetchAdminWithdrawals(); fetchReports(); }
    if (page === "disc") { fetchUpcomingSchedule(); fetchAllClips(); fetchFeaturedPredictions(); fetchAllStreamers(); }
    if (page === "wallet" && user) { fetchTransactions(); fetchWithdrawHistory(); fetchPredHistory(); fetchDailyMissions(); fetchAchievements(); }
    if (page === "stream" && stream?.id) {
      fetchStreamClips(stream.id);
      if (stream.user_id) {
        fetchStreamEmotes(stream.user_id); checkSubscription(stream.user_id);
        fetchBannedWords(stream.user_id);
      }
      setTopGifters({}); setActivePoll(null); setPollVoted(null); setActivePrediction(null); setPredEntries([]); setMyPredBet(null);
      if (stream.isRealStream) unlockAchievement("first_stream");
    }
    if (page === "clips") { fetchAllClips(); fetchMyClipVotes(); }
    if (page === "vod") fetchAllVods();
    if (page === "channel" && channelUser?.id) fetchPastStreams(channelUser.id);
  }, [page, user]);


  const handleSignUp = async () => {
    if (!formData.fullName || !formData.email || !formData.password) { setAuthError("Please fill in all fields"); return; }
    setLoading(true); setAuthError("");
    try {
      const { data, error } = await supabase.auth.signUp({ email: formData.email, password: formData.password });
      if (error) { setAuthError(error.message); return; }
      if (data.user) {
        const username = await generateUniqueUsername(formData.fullName);
        const refCode = `${username.toUpperCase().slice(0, 8)}${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
        const { error: pe } = await supabase.from("profiles").insert({
          id: data.user.id, full_name: formData.fullName, username, role, coins: 1000, total_earned: 0, bio: "", follower_count: 0, referral_code: refCode,
        });
        if (pe) {
          await supabase.auth.signOut();
          setAuthError("Account setup failed â€” please try again.");
          return;
        }
        await supabase.from("transactions").insert({ user_id: data.user.id, type: "signup_bonus", amount: 1000, description: "Welcome bonus" });
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
    } catch (err) {
      setAuthError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
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
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(formData.email, { redirectTo: `${window.location.origin}/reset-password` });
      if (error) { setAuthError(error.message); } else { notify("Password reset email sent!"); }
    } catch {
      setAuthError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setIsStreaming(false);
    await supabase.auth.signOut();
    notify("Logged out successfully");
  };

  const handleSaveProfile = async () => {
    if (!editProfile.fullName.trim() || !editProfile.username.trim()) { setProfileMsg("Please fill in all fields"); return; }
    if (editProfile.fullName.trim().length < 2) { setProfileMsg("Name must be at least 2 characters"); return; }
    if (editProfile.username.trim().length < 3 || editProfile.username.trim().length > 30) { setProfileMsg("Username must be 3â€“30 characters"); return; }
    if (!/^[a-zA-Z0-9_]+$/.test(editProfile.username.trim())) { setProfileMsg("Username can only contain letters, numbers and underscores"); return; }
    if (editProfile.bio && editProfile.bio.length > 300) { setProfileMsg("Bio must be under 300 characters"); return; }
    setSavingProfile(true); setProfileMsg("");
    const { error } = await supabase.from("profiles").update({
      full_name: editProfile.fullName, username: editProfile.username, bio: editProfile.bio,
      social_twitter: editProfile.twitter || null, social_instagram: editProfile.instagram || null,
      social_youtube: editProfile.youtube || null, social_tiktok: editProfile.tiktok || null,
    }).eq("id", user.id);
    if (error) { setProfileMsg(error.message); }
    else {
      setProfile(p => ({ ...p, full_name: editProfile.fullName, username: editProfile.username, bio: editProfile.bio, social_twitter: editProfile.twitter || null, social_instagram: editProfile.instagram || null, social_youtube: editProfile.youtube || null, social_tiktok: editProfile.tiktok || null }));
      setProfileMsg("success");
      notify("Profile updated!");
    }
    setSavingProfile(false);
  };

  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const uploadAvatar = async (file) => {
    if (!file || !user) return;
    if (file.size > 5 * 1024 * 1024) { notify("Image must be under 5 MB"); return; }
    if (!file.type.startsWith("image/")) { notify("Please select an image file"); return; }
    setUploadingAvatar(true);
    try {
      const ext = file.name.split(".").pop().toLowerCase() || "jpg";
      const path = `${user.id}/avatar.${ext}`;
      const { error: upErr } = await supabase.storage.from("avatars").upload(path, file, { upsert: true, contentType: file.type });
      if (upErr) { notify("Upload failed — make sure the avatars bucket exists in Supabase Storage"); return; }
      const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(path);
      const url = `${publicUrl}?t=${Date.now()}`;
      await supabase.from("profiles").update({ avatar_url: url }).eq("id", user.id);
      setProfile(p => p ? { ...p, avatar_url: url } : p);
      notify("Profile photo updated!");
    } catch {
      notify("Upload failed — please try again");
    } finally {
      setUploadingAvatar(false);
    }
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
            showStreamAlert(`${profile?.full_name?.split(" ")[0] || "Someone"} just followed!`, "â¤ï¸", stream.streamer);
            supabase.rpc("increment_follower_count", { profile_id: stream.user_id });
            setMissionFollowed();
          }
        }
      } else {
        // Demo stream â€” local state only
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
    if (isBannedFromChannel) { notify("You are banned from this channel's chat"); return; }
    if (viewerTier === "guest") { notify("Chat unlocks at Active Viewer â€” watch 5 streams over 5 hours in 7 days"); return; }
    // Chat commands
    if (msg.trim().startsWith("!")) {
      const cmd = msg.trim().toLowerCase().split(" ")[0];
      const uname = profile.full_name?.split(" ")[0] || profile.username || "Viewer";
      let botMsg = null;
      if (cmd === "!coins") botMsg = `ðŸª™ @${uname} has ${coins.toLocaleString()} coins`;
      else if (cmd === "!viewers") botMsg = `ðŸ‘ ${(stream.viewers || 0).toLocaleString()} viewers watching`;
      else if (cmd === "!top") {
        const entries = Object.entries(topGifters || {}).sort((a, b) => b[1].total - a[1].total);
        botMsg = entries.length ? `ðŸ† Top supporter: ${entries[0][1].username} Â· ðŸª™ ${entries[0][1].total.toLocaleString()}` : "ðŸ† No top supporter yet â€” send a gift!";
      } else if (cmd === "!uptime" && stream.started_at) {
        const mins = Math.floor((Date.now() - new Date(stream.started_at).getTime()) / 60000);
        botMsg = `â± Live for ${mins >= 60 ? `${Math.floor(mins / 60)}h ${mins % 60}m` : `${mins}m`}`;
      } else if (cmd === "!tier") {
        const ti = VIEWER_TIER_INFO[viewerTier] || VIEWER_TIER_INFO.guest;
        botMsg = `${ti.emoji} @${uname} is ${ti.label} tier`;
      } else if (cmd === "!rank") {
        const { data: rankRows } = await supabase.from("profiles").select("id").eq("role", "viewer").order("coins", { ascending: false }).limit(500);
        const rankPos = rankRows ? rankRows.findIndex(r => r.id === user.id) + 1 : 0;
        botMsg = rankPos > 0 ? `ðŸ† @${uname} is ranked #${rankPos} on the leaderboard` : `ðŸ† @${uname} â€” keep earning to climb the board!`;
      } else if (cmd === "!commands") {
        botMsg = `ðŸ“‹ !coins Â· !viewers Â· !top Â· !uptime Â· !tier Â· !rank`;
      }
      if (botMsg) {
        await supabase.from("messages").insert({ stream_id: stream.id, user_id: null, username: "StreamBot", content: botMsg, color: "#7c3aed", is_superchat: false, coins_spent: 0 });
        setMsg(""); return;
      }
    }
    if (slowCooldown > 0) { notify(`Slow mode â€” wait ${slowCooldown}s`); return; }
    if (subOnly && !isStreamOwner) { notify("Subscriber-only chat â€” subscribe to chat"); return; }
    if (followerOnly && !isStreamOwner && !myFollows.includes(stream?.user_id)) { notify("Follower-only chat â€” follow this channel to chat"); return; }
    if (bannedWords.length > 0 && bannedWords.some(w => msg.toLowerCase().includes(w))) { notify("Your message was blocked by auto-mod"); return; }
    const earned = Math.round(10 * (1 + getStreakBonus(streakDays) / 100));
    const nc = coinsRef.current + earned;
    const tierEmoji = viewerTier !== "guest" ? (VIEWER_TIER_INFO[viewerTier]?.emoji || null) : null;
    const subBadge = isSubscribed ? (SUB_TIERS.find(t => t.tier === subTier)?.badge || null) : null;
    const chatBadge = [subBadge, tierEmoji, profile?.badge].filter(Boolean).join(" ") || null;
    await supabase.from("messages").insert({
      stream_id: stream.id, user_id: user.id,
      username: profile.full_name?.split(" ")[0] || profile.username || "User",
      content: msg.trim(), color: profile?.chat_color || "#ff2d55", is_superchat: false, coins_spent: 0, badge: chatBadge,
    });
    setCoins(nc); coinsRef.current = nc;
    supabase.from("profiles").update({ coins: nc }).eq("id", user.id);
    logTransaction("chat", earned, `Chatted in "${stream.title}"`);
    incMissionChat();
    setMsg(""); notify(`+${earned} coins!`);
    startSlowCooldown();
  };

  const sendGift = async (name, cost, emoji = "ðŸŽ") => {
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
    // Credit streamer
    if (stream?.user_id) {
      const { data: sp } = await supabase.from("profiles").select("coins").eq("id", stream.user_id).single();
      if (sp) {
        await supabase.from("profiles").update({ coins: (sp.coins || 0) + c }).eq("id", stream.user_id);
        await supabase.from("transactions").insert({ user_id: stream.user_id, type: "gift_received", amount: c, description: `${name} from ${profile?.username || "viewer"}` });
      }
    }
    notify(`${name} sent!`);
    triggerGiftAnim(emoji, name);
    showStreamAlert(`${profile?.full_name?.split(" ")[0] || "Someone"} sent a ${name}!`, emoji, `${c.toLocaleString()} coins`);
    addHype(c);
    addGifter(c);
  };

  const sendCustomTip = async () => {
    const amt = parseInt(customTipAmt, 10);
    if (!amt || amt < 100) { notify("Minimum tip is 100 coins"); return; }
    await sendGift(`${amt.toLocaleString()} coin tip`, amt.toLocaleString(), "ðŸ’¸");
    setCustomTipAmt(""); setShowTipInput(false);
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
        thumbnail_url: `https://image.mux.com/${playbackId}/thumbnail.png`,
        started_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }, { onConflict: "user_id" });

      if (error) throw new Error(error.message);

      // Fan out live notifications to all followers (fire-and-forget)
      const streamerName = profile?.full_name || profile?.username || "Streamer";
      const streamTitle = goLiveForm.title.trim();
      supabase.from("streams").select("id").eq("user_id", user.id).single().then(({ data: sr }) => {
        if (sr?.id) {
          supabase.rpc("notify_followers_stream_live", {
            p_streamer_id: user.id,
            p_stream_title: streamTitle,
            p_streamer_name: streamerName,
            p_stream_id: sr.id,
          });
        }
      });
      // Email followers
      fetch("/api/notify-live", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ streamer_id: user.id, stream_title: streamTitle, streamer_name: streamerName }),
      }).catch(() => {});

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
    const startedAt = stream?.started_at ? new Date(stream.started_at) : null;
    const durationMs = startedAt ? Date.now() - startedAt.getTime() : 0;
    const durationMins = Math.round(durationMs / 60000);
    const peak = peakViewersRef.current || viewerCount || 0;
    const topGiftersList = Object.entries(topGifters)
      .sort(([, a], [, b]) => b - a).slice(0, 3)
      .map(([name, coins]) => ({ name, coins }));
    const recapAdRevenue = adRevenue;
    const recapSess = sessRef.current;

    // Track streamer hours + unique streaming days
    if (user && startedAt) {
      const hoursLive = durationMs / 3600000;
      const today = new Date().toISOString().slice(0, 10);
      const isNewDay = (profile?.last_stream_date || "") !== today;
      const newHs = parseFloat(((profile?.hours_streamed || 0) + hoursLive).toFixed(4));
      const newSd = (profile?.streaming_days || 0) + (isNewDay ? 1 : 0);
      await supabase.from("profiles").update({ hours_streamed: newHs, streaming_days: newSd, last_stream_date: today }).eq("id", user.id);
      setProfile(p => p ? { ...p, hours_streamed: newHs, streaming_days: newSd, last_stream_date: today } : p);
      const prevTier = streamerTier;
      const newTier = computeStreamerTier({ ...profile, hours_streamed: newHs, streaming_days: newSd });
      if (newTier !== prevTier && newTier !== "none") {
        setStreamerTier(newTier);
        notify(`ðŸŽ‰ You unlocked ${STREAMER_TIER_INFO[newTier]?.label} status!`);
      }
    }
    // Persist ad revenue coins that accumulated in local state during the stream
    if (recapAdRevenue > 0 && user) {
      const finalCoins = coinsRef.current;
      await supabase.from("profiles").update({ coins: finalCoins }).eq("id", user.id);
      await supabase.from("transactions").insert({ user_id: user.id, type: "ad_revenue", amount: recapAdRevenue, description: `Ad revenue from "${stream?.title || "stream"}"` });
    }
    await savePastStream();
    if (muxStreamId) {
      await fetch("/api/mux-end", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ muxStreamId }),
      });
    }
    await supabase.from("streams").update({
      status: "offline", mux_stream_id: null, mux_playback_id: null,
      updated_at: new Date().toISOString(),
    }).eq("user_id", user.id);
    setIsStreaming(false);
    setMuxStreamId(""); setMuxStreamKey(""); setMuxPlaybackId("");
    setAdRevenue(0); peakViewersRef.current = 0;
    // Show stream recap
    setStreamRecap({ durationMins, peak, adRevenue: recapAdRevenue, viewerEarnings: recapSess, topGifters: topGiftersList, title: stream?.title || "Stream" });
  };

  const switchMode = async (newMode) => {
    setMode(newMode);
    localStorage.setItem("stem_mode", newMode);
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
  const PROTECTED = ["wallet", "dash", "profile"];

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
      follower_count: s.profiles?.follower_count || 0,
      emoji: meta.emoji,
      color: meta.color,
      bg: meta.bg,
      isRealStream: true,
      mux_stream_id: s.mux_stream_id || null,
      mux_playback_id: s.mux_playback_id || null,
      thumbnail_url: s.thumbnail_url || null,
      started_at: s.started_at || null,
    };
  };

  const allStreams = liveStreams.map(formatDbStream);

  const filteredStreams = allStreams.filter(s => {
    const matchCat = cat === "All" || s.game === cat || s.game.includes(cat);
    const matchSearch = search === "" ||
      s.title.toLowerCase().includes(search.toLowerCase()) ||
      s.streamer.toLowerCase().includes(search.toLowerCase()) ||
      s.game.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const isApp = ["disc", "stream", "wallet", "dash", "profile", "leaderboard", "channel", "vprofile", "clips", "admin", "streamer", "vod"].includes(page);
  const emailVerified = !!user?.email_confirmed_at;

  const resendVerificationEmail = async () => {
    if (!user?.email) return;
    const { error } = await supabase.auth.resend({ type: "signup", email: user.email });
    if (error) notify("Couldn't send — try again in a moment.");
    else notify("Verification email sent! Check your inbox.");
  };
  const firstName = profile?.full_name?.split(" ")[0] || "";
  const initials = profile?.full_name?.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) || "?";
  const rankColor = (i) => i === 0 ? "var(--gold)" : i === 1 ? "rgba(255,255,255,.6)" : i === 2 ? "#cd7f32" : "var(--muted)";
  const rankEmoji = (i) => i === 0 ? "ðŸ¥‡" : i === 1 ? "ðŸ¥ˆ" : i === 2 ? "ðŸ¥‰" : `${i + 1}`;

  // â”€â”€ Tier system â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const VIEWER_TIER_INFO = {
    guest:           { label: "Guest",           emoji: "ðŸ‘¤", color: "var(--muted)",   next: "active" },
    active:          { label: "Active Viewer",   emoji: "ðŸŒ±", color: "var(--green)",   next: "verified_earner" },
    verified_earner: { label: "Verified Earner", emoji: "ðŸ’Ž", color: "#0ea5e9",        next: "elite" },
    elite:           { label: "Elite Viewer",    emoji: "ðŸ‘‘", color: "var(--gold)",    next: null },
  };
  const STREAMER_TIER_INFO = {
    none:      { label: "Aspiring",  emoji: "ðŸŽ™", color: "var(--muted)",   next: "affiliate" },
    affiliate: { label: "Affiliate", emoji: "â­", color: "var(--orange)",  next: "partner" },
    partner:   { label: "Partner",   emoji: "âœ…", color: "var(--purple)",  next: null },
  };

  const computeViewerTier = (p, emailVerified) => {
    if (!p) return "guest";
    const days = Math.floor((Date.now() - new Date(p.created_at)) / 86400000);
    const hw = p.hours_watched || 0;
    const sw = p.streams_watched || 0;
    const ref = p.referral_count || 0;
    // Grandfathering: users with coin history pre-dating the tier system get active status
    const seasoned = days >= 7 && (p.coins || 0) > 500;
    if (days >= 90 && hw >= 100 && ref >= 1) return "elite";
    if (days >= 30 && (hw >= 20 || seasoned) && emailVerified && (sw >= 10 || seasoned)) return "verified_earner";
    if (days >= 7 && (sw >= 5 || seasoned) && (hw >= 5 || seasoned)) return "active";
    return "guest";
  };

  const computeStreamerTier = (p) => {
    if (!p) return "none";
    const days = Math.floor((Date.now() - new Date(p.created_at)) / 86400000);
    const fl = p.follower_count || 0;
    const hs = p.hours_streamed || 0;
    const sd = p.streaming_days || 0;
    if (fl >= 500 && hs >= 100 && sd >= 30) return "partner";
    if (fl >= 100 && hs >= 20 && sd >= 14 && days >= 30) return "affiliate";
    return "none";
  };

  const TierBar = ({ label, current, target, color = "var(--purple)" }) => (
    <div style={{ marginBottom: 8 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
        <span style={{ fontSize: 11, color: "var(--muted)" }}>{label}</span>
        <span style={{ fontSize: 11, color: current >= target ? "var(--green)" : "rgba(255,255,255,.5)" }}>{typeof current === "number" ? current.toLocaleString() : current} / {typeof target === "number" ? target.toLocaleString() : target} {current >= target ? "âœ“" : ""}</span>
      </div>
      <div style={{ height: 4, background: "rgba(255,255,255,.07)", borderRadius: 2 }}>
        <div style={{ height: "100%", background: current >= target ? "var(--green)" : color, borderRadius: 2, width: `${Math.min(100, (current / target) * 100).toFixed(0)}%`, transition: "width .5s ease" }} />
      </div>
    </div>
  );

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
              {m.sc && (m.t?.startsWith("gifted") && m.t?.includes("sub")
                ? <div style={{ fontSize: 10, color: "#a855f7", fontWeight: 700, marginBottom: 3 }}>ðŸŽ GIFT SUBS Â· {m.amt}</div>
                : <div style={{ fontSize: 10, color: "var(--gold)", fontWeight: 700, marginBottom: 3 }}>ðŸª™ {m.amt}</div>
              )}
              {m.badge && <span style={{ fontSize: 12, marginRight: 3 }}>{m.badge}</span>}
              <span className="cmsg-a" style={{ color: m.c, cursor: m.uid ? "pointer" : "default" }}
                onClick={() => m.uid && viewVProfile(m.uid)}>{m.a}</span>
              <span className="cmsg-t" style={{ marginLeft: 6 }}>{parseMessage(m.t)}</span>
            </div>
            {isStreamOwner && m.uid && m.uid !== user.id && (
              <div style={{ position: "relative", flexShrink: 0 }}>
                <button onClick={() => setMsgMenuId(msgMenuId === i ? null : i)} style={{ background: "none", border: "none", color: "var(--muted)", cursor: "pointer", fontSize: 13, lineHeight: 1, padding: "2px 4px" }}>â‹®</button>
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

  if (!authReady) return (
    <>
      <style>{FONTS}</style><style>{CSS}</style>
      <div style={{ minHeight: "100vh", background: "var(--ink)", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16 }}>
        <div style={{ fontFamily: "Bebas Neue,sans-serif", fontSize: 32, letterSpacing: 3, background: "linear-gradient(90deg,var(--purple),var(--red),var(--orange))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>STEM</div>
        <div className="spinner" style={{ borderColor: "rgba(255,255,255,.15)", borderTopColor: "var(--purple)" }} />
      </div>
    </>
  );

  const ctx = {
    // routing
    page, setPage, go, isApp,
    // auth
    user, setUser, authReady, mode, setMode, role, setRole,
    authMode, setAuthMode, authError, setAuthError, loading,
    formData, setFormData, handleSignUp, handleLogin, handleForgotPassword,
    handleLogout, switchMode,
    // profile
    profile, setProfile, coins, setCoins, coinsRef,
    firstName, initials, editProfile, setEditProfile,
    profileMsg, savingProfile, handleSaveProfile, uploadAvatar, uploadingAvatar,
    referralCode,
    // stream
    stream, setStream, sess, setSess, viewerCount,
    streamAlert, isStreamOwner, isStreaming,
    editingStreamInfo, setEditingStreamInfo, streamInfoDraft, setStreamInfoDraft, updateStreamInfo,
    // discover / search
    liveStreams, landingStats, myFollows, setMyFollows, followedStreamers,
    cat, setCat, search, setSearch,
    allStreams, filteredStreams, formatDbStream,
    discoverSort, setDiscoverSort, discTab, setDiscTab,
    upcomingSchedule, featuredPreds, searchProfiles, searchClips,
    // leaderboard
    leaderboard, topSupporters, loadingLb, lbTab, setLbTab, fetchLeaderboard,
    rankColor, rankEmoji,
    // chat
    chat, msg, setMsg, sendChat, chatRef, chatRef2,
    chatBans, slowCooldown, slowModeSecs, setSlowModeSecs,
    subOnly, setSubOnly, followerOnly, setFollowerOnly, clearChat,
    streamEmotes, showEmotePicker, setShowEmotePicker,
    isBannedFromChannel, viewerTier, msgMenuId, setMsgMenuId,
    timeoutUser, banUser, unbanUser, viewVProfile, parseMessage,
    // gifts / tips
    topGifters, sendGift, showTipInput, setShowTipInput,
    customTipAmt, setCustomTipAmt, sendCustomTip, triggerGiftAnim, giftAnims,
    // predictions
    activePrediction, predEntries, predCountdown, myPredBet,
    predBetAmount, setPredBetAmount, predForm, setPredForm,
    placeBet, placingBet, createPrediction, setShowCreatePred, showCreatePred,
    lockPrediction, resolvePrediction, cancelPrediction, toggleFeaturedPrediction,
    predRecap, setPredRecap,
    // polls
    activePoll, pollVoted, votePoll, endPoll,
    pollForm, setPollForm, createPoll, showPollCreator, setShowPollCreator,
    // hype train
    hypeProgress, hypeCelebrating,
    // clips
    allClips, loadingClips, myClipVotes, voteClip, streamClips,
    allVods, loadingVods, fetchAllVods,
    allStreamers, loadingStreamers, fetchAllStreamers,
    showClipModal, setShowClipModal, clipTitle, setClipTitle, createClip, savingClip,
    // push notifications
    pushEnabled, pushLoading, enablePushNotifications, disablePushNotifications,
    // follow
    following, loadingFollow, handleFollow,
    // subscribe
    isSubscribed, subscribing, setShowSubTierPicker, showSubTierPicker,
    handleSubscribe, SUB_TIERS,
    // goal
    streamGoal, showGoalEditor, setShowGoalEditor,
    goalForm, setGoalForm, saveGoal, savingGoal, clearGoal,
    // schedule
    showScheduleModal, setShowScheduleModal, scheduleForm, setScheduleForm,
    handleAddSchedule, savingSchedule,
    // go live
    showGoLive, setShowGoLive, goLiveStep, setGoLiveStep,
    goLiveForm, setGoLiveForm, handleGoLive, savingGoLive,
    muxStreamKey, handleEndStream, adRevenue,
    editingLiveInfo, setEditingLiveInfo, liveInfoForm, setLiveInfoForm,
    updateLiveInfo, savingLiveInfo,
    // dashboard
    streamerAnalytics, loadingAnalytics, fetchStreamerAnalytics,
    myEmotes, emoteName, setEmoteName, emoteFileRef,
    uploadEmote, uploadingEmote, deleteEmote,
    bannedWords, newBannedWord, setNewBannedWord, addBannedWord, removeBannedWord,
    // wallet
    streakDays, getStreakBonus,
    transactions, loadingTxns, fetchTransactions,
    withdrawHistory, fetchWithdrawHistory,
    predHistory, loadingPredHistory, fetchPredHistory,
    dailyMissions, fetchDailyMissions, claimMissionBonus,
    achievements, fetchAchievements,
    waitlistEmail, setWaitlistEmail, waitlistDone, joinWaitlist,
    buyShopItem, notify, logTransaction,
    showWithdrawModal, setShowWithdrawModal,
    withdrawCoins, setWithdrawCoins, withdrawPaypal, setWithdrawPaypal,
    handleWithdraw, processingWithdraw,
    COIN_PACKAGES, handleBuyCoins, buyingCoins,
    // tier system
    viewerTier, streamerTier,
    VIEWER_TIER_INFO, STREAMER_TIER_INFO,
    computeViewerTier, computeStreamerTier,
    // notifications
    showNotifs, setShowNotifs, unreadNotifs, setUnreadNotifs,
    notifications,
    // signup prompt
    showSignupPrompt, setShowSignupPrompt,
    // welcome onboarding
    showWelcome, setShowWelcome,
    // stream recap
    streamRecap, setStreamRecap,
    // toast
    toast,
    // viewer profile
    vProfile, vProfileTxns, loadingVProfile,
    // channel page
    channelUser, channelIsLive, channelFollowers, setChannelFollowers,
    channelStreams, channelClips, channelSchedule, channelTab, setChannelTab,
    selectedVod, setSelectedVod, viewChannel,
    // admin
    adminWithdrawals, loadingAdmin, fetchAdminWithdrawals,
    approveWithdrawal, rejectWithdrawal,
    // reports
    reports, loadingReports, fetchReports, resolveReport,
    showReportModal, setShowReportModal,
    reportReason, setReportReason, reportType, reportTargetMeta,
    openReport, submitReport, submittingReport,
    // constants
    DEMO_STREAMS, ACHIEVEMENTS, CAT_META, STREAM_CATS,
  };

  return (<AppContext.Provider value={ctx}><>
    <style>{FONTS}</style><style>{CSS}</style>

    <NavBar />

    {user && !emailVerified && isApp && !verifyBannerDismissed && (
      <div className="verify-bar">
        <span style={{ fontSize: 16, flexShrink: 0 }}>📧</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <span style={{ fontWeight: 700, color: "var(--orange)" }}>Verify your email</span>
          <span style={{ color: "rgba(255,255,255,.7)", marginLeft: 6 }}>to unlock withdrawals — check your inbox.</span>
        </div>
        <button onClick={resendVerificationEmail} style={{ background: "rgba(255,149,0,.18)", border: "1px solid rgba(255,149,0,.4)", color: "var(--orange)", borderRadius: 8, padding: "5px 12px", fontSize: 11, fontWeight: 700, cursor: "pointer", flexShrink: 0, whiteSpace: "nowrap" }}>Resend</button>
        <button onClick={() => { sessionStorage.setItem("stem_verify_dismissed", "1"); setVerifyBannerDismissed(true); }} style={{ background: "none", border: "none", color: "rgba(255,255,255,.4)", cursor: "pointer", fontSize: 18, lineHeight: 1, flexShrink: 0, padding: "0 2px" }}>✕</button>
      </div>
    )}

    <Suspense fallback={null}>
      {page === "land"     && <LandingPage />}
      {page === "auth"     && <AuthPage />}
      {page === "disc"     && <DiscoverPage />}
      {page === "stream"   && stream && <StreamPage />}
      {page === "leaderboard" && <LeaderboardPage />}
      {page === "wallet"   && <WalletPage />}
      {page === "profile"  && <ProfilePage />}
      {page === "dash"     && <DashboardPage />}
      {page === "admin"    && <AdminPage />}
      {page === "clips"    && <ClipsPage />}
      {page === "vprofile" && <ViewerProfilePage />}
      {page === "channel"  && channelUser && <ChannelPage />}
      {page === "tos"      && <TermsPage />}
      {page === "privacy"  && <PrivacyPage />}
      {page === "streamer" && <StreamerPage />}
      {page === "vod"      && <VodPage />}
    </Suspense>

    <Modals />

  </></AppContext.Provider>);
}
