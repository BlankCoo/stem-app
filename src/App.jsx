import { useState, useEffect, useRef } from "react";
import { supabase } from "./supabase";

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Outfit:wght@300;400;500;600;700;800;900&display=swap');`;

const STREAMS=[
  {id:1,title:"Ranked Grind to Diamond",streamer:"NightOwlX",game:"Valorant",viewers:12840,emoji:"🦉",color:"#7c3aed",bg:"135deg,#1a0a2e,#2d1b69"},
  {id:2,title:"Korean BBQ Night — Chill IRL",streamer:"SaraKitchen",game:"IRL",viewers:4230,emoji:"👩‍🍳",color:"#e94560",bg:"135deg,#2e0a1a,#69141b"},
  {id:3,title:"FIFA 26 Ultimate Team",streamer:"GoalKingFC",game:"FIFA 26",viewers:8910,emoji:"⚽",color:"#0ea5e9",bg:"135deg,#0a1a2e,#0e3a5a"},
  {id:4,title:"Minecraft Hardcore Day 847",streamer:"CraftedLore",game:"Minecraft",viewers:6120,emoji:"⛏️",color:"#22c55e",bg:"135deg,#0a1e10,#0d3a1a"},
  {id:5,title:"Lo-Fi Beats + Chill Gaming",streamer:"LoFiDrift",game:"Music",viewers:21400,emoji:"🎵",color:"#f0c040",bg:"135deg,#1e1a0a,#3a2e0d"},
  {id:6,title:"Just Chatting — Story Time",streamer:"TalkWithKai",game:"Just Chatting",viewers:3340,emoji:"💬",color:"#ec4899",bg:"135deg,#2e0a1e,#5a1442"},
];

const CATS=["All","Gaming","IRL","Music","Just Chatting","Sports","Food","Art"];

const CSS = `
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{--ink:#080816;--ink2:#0d0d20;--ink3:#12122a;--ink4:#1a1a35;--line:rgba(255,255,255,.07);--line2:rgba(255,255,255,.12);--purple:#7c3aed;--red:#ff2d55;--orange:#ff9500;--green:#00f5a0;--gold:#ffc800;--blue:#4d9fff;--txt:#ffffff;--muted:rgba(255,255,255,.45);--card:rgba(255,255,255,.03)}
html{scroll-behavior:smooth}
body{background:var(--ink);color:var(--txt);font-family:'Outfit',sans-serif;min-height:100vh;overflow-x:hidden}
::-webkit-scrollbar{width:3px}::-webkit-scrollbar-track{background:var(--ink2)}::-webkit-scrollbar-thumb{background:var(--ink4)}
button,input{font-family:'Outfit',sans-serif}
@keyframes blink{0%,100%{opacity:1}50%{opacity:.25}}
@keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
@keyframes toastIn{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
.nav{position:fixed;top:0;left:0;right:0;z-index:200;height:62px;display:flex;align-items:center;justify-content:space-between;padding:0 36px;background:rgba(8,8,22,.9);backdrop-filter:blur(24px);border-bottom:1px solid var(--line)}
.logo{font-family:'Bebas Neue',sans-serif;font-size:28px;letter-spacing:2px;cursor:pointer;background:linear-gradient(90deg,var(--purple),var(--red),var(--orange));-webkit-background-clip:text;-webkit-text-fill-color:transparent}
.nav-c{display:flex;gap:2px}
.nl{background:none;border:none;color:var(--muted);font-size:14px;font-weight:500;padding:8px 16px;border-radius:20px;cursor:pointer;transition:all .2s}
.nl:hover,.nl.on{color:var(--txt);background:rgba(255,255,255,.08)}
.nav-r{display:flex;align-items:center;gap:10px}
.coin-badge{display:flex;align-items:center;gap:6px;background:linear-gradient(135deg,rgba(255,200,0,.12),rgba(255,200,0,.04));border:1px solid rgba(255,200,0,.22);border-radius:20px;padding:7px 16px;font-size:13px;font-weight:700;color:var(--gold);cursor:pointer}
.mode-toggle{display:flex;background:var(--ink3);border:1px solid var(--line2);border-radius:20px;padding:3px}
.mode-btn{background:none;border:none;color:var(--muted);font-size:12px;font-weight:600;padding:5px 14px;border-radius:16px;cursor:pointer;transition:all .2s}
.mode-btn.on{background:linear-gradient(135deg,var(--purple),var(--red));color:#fff}
.av{width:34px;height:34px;border-radius:50%;background:linear-gradient(135deg,var(--purple),var(--red));display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:800;cursor:pointer}
.btn-g{background:linear-gradient(135deg,var(--purple),var(--red));color:#fff;border:none;border-radius:20px;padding:10px 22px;font-size:14px;font-weight:700;cursor:pointer;transition:all .25s;box-shadow:0 4px 15px rgba(124,58,237,.25)}
.btn-g:hover{transform:translateY(-1px);box-shadow:0 8px 25px rgba(124,58,237,.4)}
.btn-o{background:transparent;color:rgba(255,255,255,.7);border:1px solid var(--line2);border-radius:20px;padding:9px 22px;font-size:14px;cursor:pointer;transition:all .2s}
.btn-o:hover{border-color:rgba(255,255,255,.35);color:#fff}
.page{padding-top:62px;min-height:100vh;animation:fadeUp .28s ease}
.hero{position:relative;min-height:calc(100vh - 62px);display:flex;align-items:center;padding:0 60px;overflow:hidden}
.hero-mesh{position:absolute;inset:0;background:linear-gradient(135deg,rgba(124,58,237,.2),rgba(255,45,85,.12) 50%,rgba(255,149,0,.08))}
.hero-grid{position:absolute;inset:0;background-image:linear-gradient(rgba(255,255,255,.03) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.03) 1px,transparent 1px);background-size:80px 80px}
.hero-orb1{position:absolute;top:-100px;left:-100px;width:500px;height:500px;background:radial-gradient(circle,rgba(124,58,237,.35),transparent 70%);pointer-events:none}
.hero-orb2{position:absolute;bottom:-80px;right:20%;width:400px;height:400px;background:radial-gradient(circle,rgba(255,45,85,.25),transparent 70%);pointer-events:none}
.hero-content{position:relative;z-index:2;max-width:660px}
.hero-eyebrow{display:inline-flex;align-items:center;gap:8px;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.14);backdrop-filter:blur(12px);color:rgba(255,255,255,.8);font-size:12px;font-weight:600;letter-spacing:.6px;padding:7px 16px;border-radius:20px;margin-bottom:28px}
.eyebrow-dot{width:7px;height:7px;background:var(--red);border-radius:50%;animation:blink 1.6s infinite}
.hero-h{font-family:'Bebas Neue',sans-serif;font-size:clamp(72px,9vw,115px);letter-spacing:2px;line-height:.9;margin-bottom:22px}
.hero-h .l1{display:block;color:#fff}
.hero-h .l2{display:block;background:linear-gradient(90deg,var(--purple),var(--red),var(--orange));-webkit-background-clip:text;-webkit-text-fill-color:transparent}
.hero-p{font-size:17px;font-weight:300;color:rgba(255,255,255,.58);line-height:1.68;margin-bottom:36px;max-width:500px}
.hero-p strong{color:#fff;font-weight:600}
.hero-btns{display:flex;gap:12px;flex-wrap:wrap;margin-bottom:52px}
.hero-stats{display:flex}
.hstat{padding:0 30px;border-right:1px solid rgba(255,255,255,.1)}
.hstat:first-child{padding-left:0}.hstat:last-child{border-right:none}
.hstat-v{font-family:'Bebas Neue',sans-serif;font-size:32px;letter-spacing:.5px;background:linear-gradient(90deg,#fff,rgba(255,255,255,.65));-webkit-background-clip:text;-webkit-text-fill-color:transparent}
.hstat-l{font-size:12px;color:var(--muted);margin-top:2px}
.disc-page{padding:32px 40px}
.disc-hero{background:linear-gradient(135deg,rgba(124,58,237,.12),rgba(255,45,85,.08));border:1px solid var(--line);border-radius:22px;padding:44px;margin-bottom:30px;position:relative;overflow:hidden}
.disc-hero h1{font-family:'Bebas Neue',sans-serif;font-size:clamp(34px,5vw,56px);letter-spacing:1px;margin-bottom:8px;line-height:1}
.disc-hero h1 span{background:linear-gradient(90deg,var(--purple),var(--red));-webkit-background-clip:text;-webkit-text-fill-color:transparent}
.disc-hero p{font-size:15px;color:var(--muted);margin-bottom:24px;max-width:440px;line-height:1.6}
.cats{display:flex;gap:8px;margin-bottom:26px;overflow-x:auto;padding-bottom:4px}
.cat{background:rgba(255,255,255,.04);border:1px solid var(--line);color:var(--muted);font-size:13px;font-weight:500;padding:8px 18px;border-radius:20px;white-space:nowrap;cursor:pointer;transition:all .22s;flex-shrink:0}
.cat:hover{background:rgba(255,255,255,.07);color:#fff}
.cat.on{background:linear-gradient(135deg,rgba(124,58,237,.2),rgba(255,45,85,.15));border-color:rgba(124,58,237,.45);color:#fff}
.sg{display:grid;grid-template-columns:repeat(auto-fill,minmax(248px,1fr));gap:16px}
.sc{background:linear-gradient(135deg,rgba(255,255,255,.04),rgba(255,255,255,.02));border:1px solid var(--line);border-radius:16px;overflow:hidden;cursor:pointer;transition:all .25s}
.sc:hover{border-color:rgba(124,58,237,.35);transform:translateY(-4px);box-shadow:0 16px 40px rgba(0,0,0,.5)}
.sc-thumb{aspect-ratio:16/9;position:relative;overflow:hidden}
.sc-bg{position:absolute;inset:0}
.sc-ov{position:absolute;inset:0;background:linear-gradient(to top,rgba(0,0,0,.78),transparent 55%)}
.sc-emoji{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:56px;opacity:.16}
.sc-badges{position:absolute;top:10px;left:10px;display:flex;gap:6px}
.lpip{display:flex;align-items:center;gap:4px;background:linear-gradient(135deg,var(--red),#ff6b35);color:#fff;font-size:9px;font-weight:800;letter-spacing:.5px;padding:4px 9px;border-radius:5px}
.lpip-dot{width:5px;height:5px;background:#fff;border-radius:50%;animation:blink 1.6s infinite}
.epip{background:linear-gradient(135deg,rgba(0,245,160,.18),rgba(0,245,160,.08));border:1px solid rgba(0,245,160,.3);color:var(--green);font-size:9px;font-weight:700;padding:4px 9px;border-radius:5px}
.sc-viewers{position:absolute;bottom:10px;left:12px;font-size:12px;font-weight:600;color:rgba(255,255,255,.9)}
.sc-body{padding:14px}
.sc-row{display:flex;align-items:center;gap:9px;margin-bottom:8px}
.sc-av{width:32px;height:32px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:14px;flex-shrink:0}
.sc-title{font-size:13px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-bottom:2px}
.sc-name{font-size:11px;color:var(--muted)}
.stag{background:rgba(255,255,255,.06);border:1px solid var(--line);color:var(--muted);font-size:10px;padding:3px 8px;border-radius:5px;display:inline-block}
.slayout{display:grid;grid-template-columns:1fr 320px;height:calc(100vh - 62px)}
.sleft{display:flex;flex-direction:column;overflow:hidden}
.splayer{background:#000;aspect-ratio:16/9;position:relative;flex-shrink:0}
.splayer-inner{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px}
.splayer-emoji{font-size:100px;opacity:.15;position:absolute}
.sbelow{flex:1;overflow-y:auto;padding:20px 24px;border-right:1px solid var(--line)}
.stitle{font-family:'Bebas Neue',sans-serif;font-size:24px;letter-spacing:.5px;line-height:1.2;margin-bottom:14px}
.abtn{background:rgba(255,255,255,.06);border:1px solid var(--line);color:#fff;border-radius:10px;padding:8px 16px;font-size:13px;font-weight:500;cursor:pointer;display:flex;align-items:center;gap:5px;transition:all .2s}
.abtn.flw{background:linear-gradient(135deg,var(--purple),var(--red));border-color:transparent}
.abtn.flwing{background:rgba(0,245,160,.08);border-color:rgba(0,245,160,.25);color:var(--green)}
.earn-box{background:linear-gradient(135deg,rgba(0,245,160,.07),rgba(0,245,160,.02));border:1px solid rgba(0,245,160,.16);border-radius:16px;padding:18px;margin-bottom:16px}
.ebox-title{font-size:10px;font-weight:700;letter-spacing:1px;color:var(--green);text-transform:uppercase;margin-bottom:12px}
.ebig{font-family:'Bebas Neue',sans-serif;font-size:44px;color:var(--green);letter-spacing:1px}
.ecells{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:12px}
.ecell{background:rgba(0,0,0,.2);border-radius:10px;padding:10px 12px}
.ecell-v{font-size:14px;font-weight:700;margin-bottom:2px}
.ecell-l{font-size:10px;color:var(--muted)}
.gift{background:rgba(255,255,255,.05);border:1px solid var(--line);border-radius:12px;padding:10px 14px;text-align:center;cursor:pointer;transition:all .22s;min-width:68px}
.gift:hover{border-color:rgba(124,58,237,.4);background:rgba(124,58,237,.08);transform:translateY(-2px)}
.gift-e{font-size:22px;display:block;margin-bottom:4px}
.gift-c{font-size:11px;color:var(--gold);font-weight:600}
.gift-n{font-size:10px;color:var(--muted);margin-top:2px}
.chat-panel{display:flex;flex-direction:column;border-left:1px solid var(--line);background:var(--ink2)}
.chat-hd{padding:14px 16px;border-bottom:1px solid var(--line);display:flex;align-items:center;justify-content:space-between;flex-shrink:0}
.chat-hd-title{font-family:'Bebas Neue',sans-serif;font-size:18px;letter-spacing:.5px}
.chat-msgs{flex:1;overflow-y:auto;padding:12px;display:flex;flex-direction:column;gap:8px}
.cmsg-a{font-size:12px;font-weight:700;margin-bottom:2px}
.cmsg-t{font-size:13px;color:rgba(255,255,255,.72);line-height:1.4}
.cmsg.sc{background:rgba(255,200,0,.06);border:1px solid rgba(255,200,0,.15);border-radius:8px;padding:9px 11px}
.chat-foot{padding:12px;border-top:1px solid var(--line);flex-shrink:0}
.chat-tip{font-size:11px;color:var(--green);font-weight:600;margin-bottom:6px}
.chat-row{display:flex;gap:7px}
.chat-in{flex:1;background:var(--ink3);border:1px solid var(--line2);border-radius:10px;padding:10px 14px;color:#fff;font-size:13px;outline:none}
.chat-in:focus{border-color:rgba(124,58,237,.4)}
.chat-send{background:linear-gradient(135deg,var(--purple),var(--red));border:none;border-radius:10px;width:38px;height:38px;color:#fff;display:flex;align-items:center;justify-content:center;font-size:17px;cursor:pointer;flex-shrink:0}
.wallet-page{padding:32px 44px;max-width:980px}
.wcards{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-bottom:28px}
.wcard{background:var(--card);border:1px solid var(--line);border-radius:18px;padding:22px;position:relative;overflow:hidden}
.wcard::before{content:'';position:absolute;top:0;left:0;right:0;height:2px}
.wcard.g{background:linear-gradient(135deg,rgba(0,245,160,.07),rgba(0,245,160,.02));border-color:rgba(0,245,160,.18)}
.wcard.g::before{background:linear-gradient(90deg,var(--green),#00c8a0)}
.wcard.y{background:linear-gradient(135deg,rgba(255,200,0,.07),rgba(255,200,0,.02));border-color:rgba(255,200,0,.18)}
.wcard.y::before{background:linear-gradient(90deg,var(--gold),var(--orange))}
.wcard.p::before{background:linear-gradient(90deg,var(--purple),var(--red))}
.wcard-l{font-size:10px;font-weight:700;letter-spacing:.8px;text-transform:uppercase;margin-bottom:12px}
.wcard.g .wcard-l{color:var(--green)}.wcard.y .wcard-l{color:var(--gold)}.wcard.p .wcard-l{color:rgba(255,255,255,.5)}
.wcard-v{font-family:'Bebas Neue',sans-serif;font-size:38px;letter-spacing:.5px;margin-bottom:4px}
.wcard.g .wcard-v{color:var(--green)}.wcard.y .wcard-v{color:var(--gold)}.wcard.p .wcard-v{color:#fff}
.wcard-sub{font-size:12px;color:var(--muted);margin-bottom:16px}
.wbtn{width:100%;background:var(--green);color:#000;border:none;border-radius:10px;padding:11px;font-size:13px;font-weight:800;cursor:pointer}
.wbtn:disabled{opacity:.35;cursor:not-allowed}
.dash-page{padding:32px 44px}
.kpis{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:26px}
.kpi{background:var(--card);border:1px solid var(--line);border-radius:16px;padding:20px;position:relative;overflow:hidden}
.kpi::before{content:'';position:absolute;top:0;left:0;right:0;height:2px}
.kpi.r::before{background:linear-gradient(90deg,var(--red),#ff6b35)}
.kpi.g::before{background:linear-gradient(90deg,var(--green),#00c8a0)}
.kpi.y::before{background:linear-gradient(90deg,var(--gold),var(--orange))}
.kpi.b::before{background:linear-gradient(90deg,var(--blue),var(--purple))}
.kpi-l{font-size:10px;font-weight:700;letter-spacing:.7px;color:var(--muted);text-transform:uppercase;margin-bottom:10px}
.kpi-v{font-family:'Bebas Neue',sans-serif;font-size:34px;letter-spacing:.5px;margin-bottom:4px}
.kpi.r .kpi-v{color:var(--red)}.kpi.g .kpi-v{color:var(--green)}.kpi.y .kpi-v{color:var(--gold)}.kpi.b .kpi-v{color:var(--blue)}
.kpi-ch{font-size:12px;color:var(--green)}
.panel{background:var(--card);border:1px solid var(--line);border-radius:16px;overflow:hidden;margin-bottom:18px}
.panel-hd{padding:16px 20px;border-bottom:1px solid var(--line);display:flex;align-items:center;justify-content:space-between}
.panel-title{font-family:'Bebas Neue',sans-serif;font-size:17px;letter-spacing:.5px}
.toast{position:fixed;bottom:28px;right:28px;background:linear-gradient(135deg,rgba(0,245,160,.14),rgba(0,245,160,.06));border:1px solid rgba(0,245,160,.25);border-radius:12px;padding:13px 18px;font-size:14px;font-weight:600;color:var(--green);z-index:9999;display:flex;align-items:center;gap:8px;animation:toastIn .3s ease}
.spinner{width:20px;height:20px;border:2px solid rgba(255,255,255,.2);border-top-color:#fff;border-radius:50%;animation:spin 0.8s linear infinite;margin:0 auto}
.error-msg{background:rgba(255,45,85,.1);border:1px solid rgba(255,45,85,.3);color:var(--red);border-radius:10px;padding:12px 16px;font-size:13px;margin-bottom:14px}
.success-msg{background:rgba(0,245,160,.1);border:1px solid rgba(0,245,160,.3);color:var(--green);border-radius:10px;padding:12px 16px;font-size:13px;margin-bottom:14px}
`;

export default function App(){
  const [page,setPage]=useState("land");
  const [mode,setMode]=useState("viewer");
  const [role,setRole]=useState("viewer");
  const [cat,setCat]=useState("All");
  const [stream,setStream]=useState(STREAMS[0]);
  const [coins,setCoins]=useState(0);
  const [sess,setSess]=useState(0);
  const [chat,setChat]=useState([]);
  const [msg,setMsg]=useState("");
  const [following,setFollowing]=useState(false);
  const [toast,setToast]=useState(null);
  const [user,setUser]=useState(null);
  const [profile,setProfile]=useState(null);
  const [loading,setLoading]=useState(false);
  const [authError,setAuthError]=useState("");
  const [authMode,setAuthMode]=useState("signup");
  const [formData,setFormData]=useState({fullName:"",email:"",password:""});
  const chatRef=useRef(null);

  // Check if user is already logged in
  useEffect(()=>{
    supabase.auth.getSession().then(({data:{session}})=>{
      if(session){
        setUser(session.user);
        fetchProfile(session.user.id);
        setPage("disc");
      }
    });
    const {data:{subscription}}=supabase.auth.onAuthStateChange((_event,session)=>{
      if(session){
        setUser(session.user);
        fetchProfile(session.user.id);
      } else {
        setUser(null);
        setProfile(null);
        setCoins(0);
      }
    });
    return()=>subscription.unsubscribe();
  },[]);

  const fetchProfile=async(userId)=>{
    const {data}=await supabase.from("profiles").select("*").eq("id",userId).single();
    if(data){
      setProfile(data);
      setCoins(data.coins||0);
      setMode(data.role||"viewer");
    }
  };

  const updateCoins=async(newCoins)=>{
    setCoins(newCoins);
    if(user){
      await supabase.from("profiles").update({coins:newCoins}).eq("id",user.id);
    }
  };

  // Sign up
  const handleSignUp=async()=>{
    if(!formData.fullName||!formData.email||!formData.password){
      setAuthError("Please fill in all fields");return;
    }
    setLoading(true);setAuthError("");
    const {data,error}=await supabase.auth.signUp({
      email:formData.email,
      password:formData.password,
    });
    if(error){setAuthError(error.message);setLoading(false);return;}
    if(data.user){
      await supabase.from("profiles").insert({
        id:data.user.id,
        full_name:formData.fullName,
        username:formData.email.split("@")[0],
        role:role,
        coins:1000,
      });
      setCoins(1000);
      notify("Welcome to STEM! 🎉 You got 1,000 bonus coins!");
      setMode(role);
      go(role==="streamer"?"dash":"disc");
    }
    setLoading(false);
  };

  // Log in
  const handleLogin=async()=>{
    if(!formData.email||!formData.password){
      setAuthError("Please enter your email and password");return;
    }
    setLoading(true);setAuthError("");
    const {data,error}=await supabase.auth.signInWithPassword({
      email:formData.email,
      password:formData.password,
    });
    if(error){setAuthError(error.message);setLoading(false);return;}
    notify("Welcome back! 🎉");
    setLoading(false);
  };

  // Log out
  const handleLogout=async()=>{
    await supabase.auth.signOut();
    setPage("land");
    notify("Logged out successfully");
  };

  useEffect(()=>{
    if(page!=="stream")return;
    const t=setInterval(async()=>{
      setSess(s=>s+1);
      const newCoins=coins+1;
      await updateCoins(newCoins);
    },900);
    return()=>clearInterval(t);
  },[page,coins]);

  useEffect(()=>{
    if(chatRef.current)chatRef.current.scrollTop=chatRef.current.scrollHeight;
  },[chat]);

  const notify=m=>{setToast(m);setTimeout(()=>setToast(null),2600);};
  const go=(p,s=null)=>{if(s)setStream(s);if(p==="stream")setSess(0);setPage(p);window.scrollTo(0,0);};

  const sendChat=async()=>{
    if(!msg.trim())return;
    const newMsg={a:profile?.username||"You",t:msg.trim(),c:"#ff2d55"};
    setChat(l=>[...l,newMsg]);
    const newCoins=coins+10;
    await updateCoins(newCoins);
    setMsg("");
    notify("+10 coins!");
  };

  const sendGift=async(name,cost)=>{
    const c=parseInt(cost.replace(/,/g,""));
    if(coins<c){notify("Not enough coins!");return;}
    const newCoins=coins-c;
    await updateCoins(newCoins);
    setChat(l=>[...l,{a:profile?.username||"You",t:`Sent ${name}! 🎁`,c:"#ffc800",sc:true,amt:`${cost} coins`}]);
    notify(`${name} sent!`);
  };

  const isApp=["disc","stream","wallet","dash"].includes(page);
  const initials=profile?.full_name?.split(" ").map(n=>n[0]).join("").toUpperCase()||"?";

  return(<>
    <style>{FONTS}</style><style>{CSS}</style>

    {/* NAV */}
    <nav className="nav">
      <div className="logo" onClick={()=>go(user?"disc":"land")}>STEM</div>
      {isApp?(
        <div className="nav-c">
          {(mode==="viewer"?[["disc","Discover"],["stream","Live"],["wallet","Wallet"]]:[["disc","Discover"],["dash","Dashboard"]]).map(([p,l])=>(
            <button key={p} className={`nl ${page===p?"on":""}`} onClick={()=>go(p)}>{l}</button>
          ))}
        </div>
      ):(
        <div className="nav-c">
          <button className="nl">How it works</button>
          <button className="nl">Compare</button>
          <button className="nl">Community</button>
        </div>
      )}
      <div className="nav-r">
        {isApp&&<>
          <div className="mode-toggle">
            <button className={`mode-btn ${mode==="viewer"?"on":""}`} onClick={()=>setMode("viewer")}>👁 Viewer</button>
            <button className={`mode-btn ${mode==="streamer"?"on":""}`} onClick={()=>{setMode("streamer");if(page==="stream")go("dash");}}>🎙 Streamer</button>
          </div>
          <div className="coin-badge" onClick={()=>go("wallet")}>🪙 {coins.toLocaleString()}</div>
          <div className="av" title="Logout" onClick={handleLogout}>{initials}</div>
        </>}
        {!isApp&&<>
          <button className="btn-o" style={{padding:"8px 18px",fontSize:13}} onClick={()=>{setAuthMode("login");go("auth");}}>Log in</button>
          <button className="btn-g" style={{padding:"9px 20px",fontSize:13}} onClick={()=>{setAuthMode("signup");go("auth");}}>Sign up free</button>
        </>}
      </div>
    </nav>

    {/* LANDING */}
    {page==="land"&&<div style={{paddingTop:62}}>
      <div className="hero">
        <div className="hero-mesh"/><div className="hero-grid"/><div className="hero-orb1"/><div className="hero-orb2"/>
        <div className="hero-content">
          <div className="hero-eyebrow"><span className="eyebrow-dot"/>New Era of Streaming</div>
          <h1 className="hero-h"><span className="l1">WATCH LIVE.</span><span className="l2">GET PAID.</span></h1>
          <p className="hero-p">The first streaming platform to pay <strong>both streamers AND viewers</strong> in real money. Every ad. Every hour. Every clip.</p>
          <div className="hero-btns">
            <button className="btn-g" style={{padding:"13px 28px",fontSize:15}} onClick={()=>{setAuthMode("signup");go("auth");}}>Start Earning Free →</button>
            <button className="btn-o" style={{padding:"12px 28px",fontSize:15}} onClick={()=>{setRole("streamer");setAuthMode("signup");go("auth");}}>I am a Streamer</button>
          </div>
          <div className="hero-stats">
            {[["2,841","Streams live"],["$48,210","Paid today"],["127K","Earning now"]].map(([v,l])=>(
              <div key={l} className="hstat"><div className="hstat-v">{v}</div><div className="hstat-l">{l}</div></div>
            ))}
          </div>
        </div>
      </div>
    </div>}

    {/* AUTH */}
    {page==="auth"&&<div className="page" style={{display:"flex",alignItems:"center",justifyContent:"center",padding:40,background:"radial-gradient(ellipse 80% 60% at 50% 40%,rgba(124,58,237,.1),transparent 70%)"}}>
      <div style={{background:"rgba(13,13,32,.96)",border:"1px solid var(--line2)",borderRadius:22,width:"100%",maxWidth:440,overflow:"hidden",backdropFilter:"blur(20px)"}}>
        <div style={{padding:"30px 32px 0",borderBottom:"1px solid var(--line)"}}>
          <div style={{fontFamily:"Bebas Neue,sans-serif",fontSize:22,letterSpacing:2,background:"linear-gradient(90deg,var(--purple),var(--red))",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",marginBottom:8}}>STEM</div>
          <div style={{fontSize:22,fontWeight:800,marginBottom:4}}>{authMode==="signup"?"Create your account":"Welcome back"}</div>
          <div style={{fontSize:13,color:"var(--muted)",paddingBottom:22}}>{authMode==="signup"?"Start earning from day one — free forever.":"Continue your earning streak."}</div>
        </div>
        {/* Tabs */}
        <div style={{display:"flex",padding:"0 32px",borderBottom:"1px solid var(--line)"}}>
          {["signup","login"].map(m=>(
            <button key={m} onClick={()=>{setAuthMode(m);setAuthError("");}} style={{flex:1,background:"none",border:"none",borderBottom:authMode===m?"2px solid var(--red)":"2px solid transparent",color:authMode===m?"#fff":"var(--muted)",fontSize:14,fontWeight:600,padding:12,cursor:"pointer",transition:"all .2s"}}>
              {m==="signup"?"Sign Up":"Log In"}
            </button>
          ))}
        </div>
        <div style={{padding:"26px 32px 30px"}}>
          {authError&&<div className="error-msg">{authError}</div>}
          {authMode==="signup"&&(
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:20}}>
              {[["viewer","👁","Viewer","Watch and earn"],["streamer","🎙","Streamer","Stream and earn more"]].map(([r,ic,ti,su])=>(
                <div key={r} onClick={()=>setRole(r)} style={{background:role===r?"rgba(124,58,237,.1)":"var(--ink3)",border:role===r?"2px solid var(--purple)":"2px solid var(--line)",borderRadius:14,padding:18,textAlign:"center",cursor:"pointer",transition:"all .2s"}}>
                  <div style={{fontSize:30,marginBottom:10}}>{ic}</div>
                  <div style={{fontSize:14,fontWeight:700,marginBottom:3}}>{ti}</div>
                  <div style={{fontSize:11,color:"var(--muted)"}}>{su}</div>
                </div>
              ))}
            </div>
          )}
          {authMode==="signup"&&(
            <input style={{width:"100%",background:"var(--ink3)",border:"1px solid var(--line2)",borderRadius:12,padding:"13px 16px",color:"#fff",fontSize:14,outline:"none",marginBottom:14}} placeholder="Full Name" value={formData.fullName} onChange={e=>setFormData({...formData,fullName:e.target.value})}/>
          )}
          <input style={{width:"100%",background:"var(--ink3)",border:"1px solid var(--line2)",borderRadius:12,padding:"13px 16px",color:"#fff",fontSize:14,outline:"none",marginBottom:14}} type="email" placeholder="Email address" value={formData.email} onChange={e=>setFormData({...formData,email:e.target.value})}/>
          <input style={{width:"100%",background:"var(--ink3)",border:"1px solid var(--line2)",borderRadius:12,padding:"13px 16px",color:"#fff",fontSize:14,outline:"none",marginBottom:14}} type="password" placeholder="Password" value={formData.password} onChange={e=>setFormData({...formData,password:e.target.value})}/>
          <button onClick={authMode==="signup"?handleSignUp:handleLogin} disabled={loading} style={{width:"100%",background:"linear-gradient(135deg,var(--purple),var(--red))",color:"#fff",border:"none",borderRadius:12,padding:14,fontSize:15,fontWeight:700,cursor:loading?"not-allowed":"pointer",opacity:loading?.7:1}}>
            {loading?<div className="spinner"/>:authMode==="signup"?(role==="streamer"?"Start Streaming →":"Start Earning →"):"Log In →"}
          </button>
          <div style={{textAlign:"center",marginTop:16,fontSize:13,color:"var(--muted)"}}>
            {authMode==="signup"?"Already have an account? ":"New to STEM? "}
            <button onClick={()=>{setAuthMode(authMode==="signup"?"login":"signup");setAuthError("");}} style={{background:"none",border:"none",color:"var(--red)",fontSize:13,fontWeight:600,cursor:"pointer"}}>
              {authMode==="signup"?"Log in":"Sign up free"}
            </button>
          </div>
        </div>
      </div>
    </div>}

    {/* DISCOVER */}
    {page==="disc"&&<div className="disc-page page">
      <div className="disc-hero">
        <h1><span>Watch Live.</span> Earn Real Money.</h1>
        <p>Welcome back {profile?.full_name?.split(" ")[0]||""}! Every stream earns you coins. Every coin converts to real cash.</p>
        <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
          {[["🔴","2,841","live"],["🪙",coins.toLocaleString(),"your coins"],["💸","$48K","paid today"]].map(([icon,v,l])=>(
            <div key={l} style={{display:"flex",alignItems:"center",gap:8,background:"rgba(255,255,255,.06)",border:"1px solid var(--line2)",borderRadius:12,padding:"10px 18px"}}>
              <span style={{fontSize:18}}>{icon}</span>
              <div><div style={{fontFamily:"Bebas Neue,sans-serif",fontSize:20}}>{v}</div><div style={{fontSize:11,color:"var(--muted)"}}>{l}</div></div>
            </div>
          ))}
        </div>
      </div>
      <div className="cats">{CATS.map(c=><button key={c} className={`cat ${cat===c?"on":""}`} onClick={()=>setCat(c)}>{c}</button>)}</div>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:18}}>
        <span style={{fontFamily:"Bebas Neue,sans-serif",fontSize:20,letterSpacing:.5}}>🔴 Live Now</span>
        <button style={{background:"none",border:"none",color:"var(--red)",fontSize:13,fontWeight:700,cursor:"pointer"}}>See all →</button>
      </div>
      <div className="sg">{STREAMS.map(s=>(
        <div key={s.id} className="sc" onClick={()=>go("stream",s)}>
          <div className="sc-thumb">
            <div className="sc-bg" style={{background:`linear-gradient(${s.bg})`}}/>
            <div className="sc-ov"/><div className="sc-emoji">{s.emoji}</div>
            <div className="sc-badges"><span className="lpip"><span className="lpip-dot"/>LIVE</span><span className="epip">+4/hr</span></div>
            <div className="sc-viewers">👁 {s.viewers.toLocaleString()}</div>
          </div>
          <div className="sc-body">
            <div className="sc-row"><div className="sc-av" style={{background:s.color}}>{s.emoji}</div><div><div className="sc-title">{s.title}</div><div className="sc-name">{s.streamer}</div></div></div>
            <div style={{display:"flex",gap:5}}><span className="stag">{s.game}</span><span className="stag">English</span></div>
          </div>
        </div>
      ))}</div>
    </div>}

    {/* STREAM */}
    {page==="stream"&&<div className="slayout" style={{paddingTop:62}}>
      <div className="sleft">
        <div className="splayer">
          <div className="splayer-inner" style={{background:`linear-gradient(${stream.bg})`}}>
            <div className="splayer-emoji">{stream.emoji}</div>
            <div style={{position:"relative",zIndex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:8}}>
              <span className="lpip" style={{fontSize:13,padding:"6px 16px"}}><span className="lpip-dot"/>LIVE — {stream.viewers.toLocaleString()} watching</span>
              <span style={{fontSize:13,color:"rgba(255,255,255,.5)"}}>Earning coins while you watch</span>
            </div>
          </div>
        </div>
        <div className="sbelow">
          <div className="stitle">{stream.title}</div>
          <div style={{display:"flex",gap:8,marginBottom:14,flexWrap:"wrap"}}>
            <button className={`abtn ${following?"flwing":"flw"}`} onClick={()=>{setFollowing(f=>!f);if(!following){updateCoins(coins+50);notify("+50 coins!");}}}>
              {following?"✓ Following":"+ Follow"}
            </button>
            <button className="abtn" onClick={()=>notify("Link copied!")}>🔗 Share</button>
            <button className="abtn" onClick={()=>notify("Subscribe coming soon!")}>Subscribe $4.99/mo</button>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:12,padding:"14px 0",borderTop:"1px solid var(--line)",borderBottom:"1px solid var(--line)",marginBottom:16}}>
            <div style={{width:44,height:44,borderRadius:12,background:stream.color,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20}}>{stream.emoji}</div>
            <div><div style={{fontSize:15,fontWeight:700}}>{stream.streamer}</div><div style={{fontSize:12,color:"var(--muted)",marginTop:2}}>24,810 followers · {stream.game}</div></div>
          </div>
          <div className="earn-box">
            <div className="ebox-title">Your earnings this session</div>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
              <div><div className="ebig">+{sess}</div><div style={{fontSize:12,color:"var(--muted)",marginTop:2}}>coins this session</div></div>
              <div style={{textAlign:"right"}}><div style={{fontFamily:"Bebas Neue,sans-serif",fontSize:28,color:"var(--gold)"}}>🪙 {coins.toLocaleString()}</div><div style={{fontSize:11,color:"var(--muted)",marginTop:2}}>total balance</div></div>
            </div>
            <div className="ecells">
              <div className="ecell"><div className="ecell-v" style={{color:"var(--green)"}}>+4/hr</div><div className="ecell-l">Ad share</div></div>
              <div className="ecell"><div className="ecell-v" style={{color:"var(--gold)"}}>+10</div><div className="ecell-l">Per chat</div></div>
              <div className="ecell"><div className="ecell-v">20K</div><div className="ecell-l">To withdraw</div></div>
            </div>
          </div>
          <div style={{marginBottom:16}}>
            <div style={{fontSize:11,fontWeight:700,letterSpacing:.6,color:"var(--muted)",textTransform:"uppercase",marginBottom:10}}>Send a gift</div>
            <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
              {[["🌟","Star","1,000"],["🏆","Trophy","5,000"],["👑","Crown","10,000"],["🚀","Rocket","2,500"]].map(([e,n,c])=>(
                <div key={n} className="gift" onClick={()=>sendGift(n,c)}><span className="gift-e">{e}</span><div className="gift-c">🪙 {c}</div><div className="gift-n">{n}</div></div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="chat-panel">
        <div className="chat-hd"><span className="chat-hd-title">Live Chat</span><span style={{fontSize:11,color:"var(--muted)"}}>{stream.viewers.toLocaleString()}</span></div>
        <div className="chat-msgs" ref={chatRef}>
          {chat.length===0&&<div style={{fontSize:13,color:"var(--muted)",textAlign:"center",marginTop:20}}>Be the first to chat! Earn +10 coins per message 🪙</div>}
          {chat.map((m,i)=>(
            <div key={i} className={`cmsg ${m.sc?"sc":""}`}>
              {m.sc&&<div style={{fontSize:10,color:"var(--gold)",fontWeight:700,marginBottom:3}}>🪙 {m.amt}</div>}
              <div className="cmsg-a" style={{color:m.c}}>{m.s?"⭐ ":""}{m.a}</div>
              <div className="cmsg-t">{m.t}</div>
            </div>
          ))}
        </div>
        <div className="chat-foot">
          <div className="chat-tip">💚 +10 coins per message</div>
          <div className="chat-row">
            <input className="chat-in" placeholder="Say something..." value={msg} onChange={e=>setMsg(e.target.value)} onKeyDown={e=>e.key==="Enter"&&sendChat()}/>
            <button className="chat-send" onClick={sendChat}>↑</button>
          </div>
        </div>
      </div>
    </div>}

    {/* WALLET */}
    {page==="wallet"&&<div className="wallet-page page">
      <div style={{marginBottom:30}}><div style={{fontFamily:"Bebas Neue,sans-serif",fontSize:44,letterSpacing:1,marginBottom:4}}>My Wallet</div><div style={{fontSize:14,color:"var(--muted)"}}>Hey {profile?.full_name?.split(" ")[0]||""}! Here are your coins and earnings.</div></div>
      <div className="wcards">
        <div className="wcard g"><div className="wcard-l">Withdrawable Balance</div><div className="wcard-v">${(coins/1000).toFixed(2)}</div><div className="wcard-sub">{coins.toLocaleString()} coins · Need {Math.max(0,20000-coins).toLocaleString()} more</div><button className="wbtn" disabled={coins<20000}>{coins>=20000?"Withdraw Now":"Withdraw ($20 min)"}</button></div>
        <div className="wcard y"><div className="wcard-l">STEM Coins</div><div className="wcard-v">🪙 {coins.toLocaleString()}</div><div className="wcard-sub">1,000 coins = $1.00 · 2% fee on withdrawal</div><button className="wbtn" style={{background:"var(--gold)"}} onClick={()=>notify("Spend coins on gifts in a stream!")}>Spend Coins</button></div>
        <div className="wcard p"><div className="wcard-l">Total Earned All Time</div><div className="wcard-v">${(profile?.total_earned||0).toFixed(2)}</div><div className="wcard-sub">From watching, chatting, and referrals</div><button className="wbtn" style={{background:"linear-gradient(135deg,var(--purple),var(--red))"}} onClick={()=>notify("Premium = 2x earnings — coming soon!")}>Upgrade Premium</button></div>
      </div>
      <div style={{background:"linear-gradient(135deg,rgba(124,58,237,.08),rgba(255,45,85,.06))",border:"1px solid rgba(124,58,237,.2)",borderRadius:16,padding:"20px 24px",display:"flex",alignItems:"center",gap:16,flexWrap:"wrap"}}>
        <div style={{fontSize:28}}>💡</div>
        <div><div style={{fontWeight:700,marginBottom:4}}>Earn 2x faster with Premium</div><div style={{fontSize:13,color:"var(--muted)"}}>Upgrade for $9.99/month and double all your ad earnings.</div></div>
        <button className="btn-g" style={{marginLeft:"auto"}} onClick={()=>notify("Premium coming soon!")}>Upgrade $9.99/mo</button>
      </div>
    </div>}

    {/* DASHBOARD */}
    {page==="dash"&&<div className="dash-page page">
      <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:28,flexWrap:"wrap",gap:16}}>
        <div><div style={{fontFamily:"Bebas Neue,sans-serif",fontSize:44,letterSpacing:1,marginBottom:4}}>Streamer Dashboard</div><div style={{fontSize:14,color:"var(--muted)"}}>Welcome {profile?.full_name?.split(" ")[0]||""}! Your revenue and analytics.</div></div>
        <button style={{background:"linear-gradient(135deg,var(--red),#ff6b35)",color:"#fff",border:"none",borderRadius:12,padding:"13px 26px",fontSize:14,fontWeight:700,display:"flex",alignItems:"center",gap:8,cursor:"pointer"}} onClick={()=>notify("Go Live feature coming soon!")}>
          <span style={{width:8,height:8,background:"#fff",borderRadius:"50%",animation:"blink 1.6s infinite"}}/>Go Live
        </button>
      </div>
      <div className="kpis">
        {[["r","Revenue This Month","$842","↑ 24%"],["g","Avg Viewers","1,284","↑ 11%"],["y","Subscribers","312","28 new"],["b","Hours Streamed","84h","21 sessions"]].map(([col,l,v,ch])=>(
          <div key={l} className={`kpi ${col}`}><div className="kpi-l">{l}</div><div className="kpi-v">{v}</div><div className="kpi-ch">{ch}</div></div>
        ))}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 300px",gap:20}}>
        <div className="panel">
          <div className="panel-hd"><span className="panel-title">Revenue Breakdown</span><span style={{fontSize:12,color:"var(--muted)"}}>This month</span></div>
          <div style={{padding:20}}>
            {[["Ad Revenue (40% share)","$337",40,"linear-gradient(90deg,var(--red),#ff6b35)"],["Subscriptions (70% share)","$218",26,"linear-gradient(90deg,var(--green),#00c8a0)"],["Virtual Gifts (85% share)","$180",21,"linear-gradient(90deg,var(--gold),var(--orange))"],["Brand Sponsored","$107",13,"linear-gradient(90deg,var(--blue),var(--purple))"]].map(([l,v,p,c])=>(
              <div key={l} style={{marginBottom:16}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:7}}><span style={{fontSize:13,color:"var(--muted)"}}>{l}</span><span style={{fontSize:13,fontWeight:700}}>{v}</span></div>
                <div style={{background:"var(--ink4)",borderRadius:4,height:6,overflow:"hidden"}}><div style={{width:`${p}%`,height:"100%",borderRadius:4,background:c}}/></div>
              </div>
            ))}
          </div>
        </div>
        <div className="panel">
          <div className="panel-hd"><span className="panel-title">Ad Split</span></div>
          <div style={{padding:20}}>
            <div style={{display:"flex",height:12,borderRadius:6,overflow:"hidden",gap:2,marginBottom:16}}>
              <div style={{flex:40,background:"var(--green)",borderRadius:4}}/>
              <div style={{flex:40,background:"var(--red)",borderRadius:4}}/>
              <div style={{flex:20,background:"rgba(255,255,255,.2)",borderRadius:4}}/>
            </div>
            {[["var(--green)","You (streamer)","40%"],["var(--red)","STEM platform","40%"],["rgba(255,255,255,.4)","Your viewers","20%"]].map(([c,l,v])=>(
              <div key={l} style={{display:"flex",alignItems:"center",gap:9,marginBottom:8}}>
                <div style={{width:10,height:10,borderRadius:3,background:c,flexShrink:0}}/>
                <span style={{fontSize:13,color:"var(--muted)",flex:1}}>{l}</span>
                <span style={{fontSize:13,fontWeight:700,color:c}}>{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>}

    {toast&&<div className="toast">🪙 {toast}</div>}
  </>);
}