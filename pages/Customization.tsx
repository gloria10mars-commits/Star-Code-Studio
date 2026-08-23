
import React, { useState, useEffect } from 'react';
import { SiteConfig, UserData } from '../types';
import { 
  Trash2, ExternalLink, Download, Sparkles, 
  Palette, Settings, Loader2, Zap
} from 'lucide-react';
import JSZip from 'jszip';
import { APPS_SCRIPT_URL } from '../App';

interface Props {
  siteConfig: SiteConfig;
  setSiteConfig: React.Dispatch<React.SetStateAction<SiteConfig>>;
  user: UserData | null;
}

export const Customization: React.FC<Props> = ({ siteConfig, setSiteConfig, user }) => {
  const [items, setItems] = useState<any[]>([]);
  const [newItem, setNewItem] = useState({ title: '', link: '', meta: 'PDF' });
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    if (user) fetchItems();
  }, [user]);

  const fetchItems = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const res = await fetch(`${APPS_SCRIPT_URL}?action=fetch&email=${user.email}&project=${siteConfig.projectName}`);
      const data = await res.json();
      setItems(data.items || []);
    } catch (e) {
      console.error("Lien Cloud corrompu.");
    } finally {
      setIsLoading(false);
    }
  };

  const addItem = async () => {
    if (!newItem.title || !newItem.link || !user) return;
    setIsLoading(true);
    try {
      await fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        body: JSON.stringify({
          action: 'update',
          email: user.email,
          project: siteConfig.projectName,
          item: newItem
        })
      });
      setNewItem({ title: '', link: '', meta: 'PDF' });
      setTimeout(fetchItems, 1500);
    } catch (e) {
      setIsLoading(false);
    }
  };

  const removeItem = async (index: number) => {
    if (!user) return;
    setIsLoading(true);
    try {
      await fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        body: JSON.stringify({
          action: 'delete',
          email: user.email,
          project: siteConfig.projectName,
          index: index
        })
      });
      setTimeout(fetchItems, 1000);
    } catch (e) {
      setIsLoading(false);
    }
  };

  const themes: {id: any, color: string, label: string}[] = [
    { id: 'neon', color: '#06b6d4', label: 'Néon' },
    { id: 'white', color: '#ffffff', label: 'Blanche' },
    { id: 'cendre', color: '#b2beb5', label: 'Cendre' },
    { id: 'grey', color: '#6b7280', label: 'Gris' },
    { id: 'indigo', color: '#6366f1', label: 'Indigo' },
    { id: 'menthe', color: '#10b981', label: 'Menthe' },
    { id: 'golden', color: '#fbbf24', label: 'Or' },
    { id: 'cosmic', color: '#a855f7', label: 'Cosmos' },
    { id: 'red', color: '#ef4444', label: 'Rouge' },
  ];

  const handleDownload = async () => {
    setIsExporting(true);
    const zip = new JSZip();
    const isLocked = siteConfig.template === 'locked';

    const indexHTML = `<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${siteConfig.title} | Star Code Studio</title>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;900&display=swap" rel="stylesheet">
    <style>
        :root { --accent: ${themes.find(t => t.id === siteConfig.theme)?.color || '#06b6d4'}; --bg: #020617; --text: #ffffff; }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: var(--bg); color: var(--text); font-family: 'Outfit', sans-serif; overflow-x: hidden; }
        .galaxy { position: fixed; inset: 0; background: radial-gradient(circle at center, #0f172a 0%, #000 100%); z-index: -1; }
        .stars { position: absolute; inset: -100%; background-image: radial-gradient(2px 2px at 20px 30px, #eee, rgba(0,0,0,0)), radial-gradient(2px 2px at 40px 70px, #fff, rgba(0,0,0,0)); background-size: 250px 250px; animation: rotate 300s linear infinite; opacity: 0.35; }
        @keyframes rotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .container { max-width: 1000px; margin: 0 auto; padding: 6rem 2rem; position: relative; z-index: 10; }
        header { text-align: center; margin-bottom: 6rem; }
        h1 { font-size: 5.5rem; font-weight: 900; color: var(--accent); text-transform: uppercase; margin-bottom: 0.5rem; letter-spacing: -0.07em; text-shadow: 0 0 40px rgba(6,182,212,0.4); italic: true; }
        .credit { text-transform: uppercase; font-size: 0.8rem; letter-spacing: 0.5em; opacity: 0.5; margin-bottom: 3rem; font-weight: 900; color: var(--accent); }
        .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1.5rem; }
        .card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05); padding: 3.5rem; border-radius: 3.5rem; transition: 0.6s cubic-bezier(0.16, 1, 0.3, 1); text-decoration: none; color: inherit; display: block; backdrop-filter: blur(20px); }
        .card:hover { border-color: var(--accent); transform: translateY(-12px) scale(1.03); background: rgba(255,255,255,0.08); box-shadow: 0 40px 80px rgba(0,0,0,0.5); }
        .tag { color: var(--accent); font-size: 0.7rem; font-weight: 900; text-transform: uppercase; margin-bottom: 1.2rem; display: block; opacity: 0.6; letter-spacing: 0.3em; }
        .card h3 { font-size: 1.7rem; font-weight: 900; text-transform: uppercase; line-height: 1.1; letter-spacing: -0.02em; }
        footer { margin-top: 12rem; text-align: center; opacity: 0.3; font-size: 0.7rem; text-transform: uppercase; font-weight: 900; letter-spacing: 0.7em; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 4rem; }
        #gateway { position: fixed; inset: 0; background: #020617; z-index: 1000; display: flex; align-items: center; justify-content: center; text-align: center; backdrop-filter: blur(50px); }
        .hidden { display: none !important; }
        .gate-box { background: rgba(255,255,255,0.02); padding: 5rem; border-radius: 5rem; border: 1px solid rgba(255,255,255,0.1); width: 90%; max-width: 550px; box-shadow: 0 50px 120px rgba(0,0,0,0.6); }
        input { background: rgba(0,0,0,0.6); border: 1px solid rgba(255,255,255,0.1); padding: 1.8rem 2rem; border-radius: 2rem; color: #fff; width: 100%; outline: none; margin-bottom: 2rem; font-family: inherit; font-weight: 900; text-align: center; font-size: 1.3rem; }
        .btn { background: var(--accent); color: #000; padding: 2rem 3rem; border-radius: 2rem; font-weight: 900; border: none; cursor: pointer; text-transform: uppercase; width: 100%; transition: 0.4s; font-size: 1.1rem; letter-spacing: 0.1em; }
        .btn:hover { transform: scale(1.05); filter: brightness(1.2); box-shadow: 0 15px 40px rgba(6,182,212,0.4); }
    </style>
</head>
<body>
    <div class="galaxy"><div class="stars"></div></div>
    <div id="gateway" class="${isLocked ? '' : 'hidden'}">
        <div class="gate-box">
            <h2 style="margin-bottom:3rem; font-weight:900; font-size:3.5rem; text-transform:uppercase; letter-spacing:-0.05em; italic:true;">Accès Studio</h2>
            <input type="text" id="pass" placeholder="Clé d'activation...">
            <button class="btn" onclick="unlock()">Vérifier Session</button>
        </div>
    </div>
    <div class="container" id="main">
        <header>
            <h1>${siteConfig.title}</h1>
            <div class="credit">lion d'astarte</div>
            <p style="opacity:0.6; font-weight:600; font-style:italic; font-size: 1.2rem; letter-spacing: 0.05em;">${siteConfig.description}</p>
        </header>
        <div id="content" class="grid"></div>
        <footer>STAR CODE STUDIO • lion d'astarte</footer>
    </div>
    <script>
        const storageKey = 'starcode_auth_${siteConfig.projectName}';
        function unlock() {
            const val = document.getElementById('pass').value;
            if(val.length >= 2) {
                document.getElementById('gateway').classList.add('hidden');
                localStorage.setItem(storageKey, val);
            }
        }
        if(!${isLocked} || localStorage.getItem(storageKey)) document.getElementById('gateway').classList.add('hidden');

        async function fetchDocs() {
            try {
                const res = await fetch("${APPS_SCRIPT_URL}?action=fetchByIP&ip=AUTO&project=${siteConfig.projectName}");
                const data = await res.json();
                const grid = document.getElementById('content');
                if(data.items && data.items.length > 0) {
                    grid.innerHTML = data.items.map(i => \`
                        <a href="\${i.link}" target="_blank" class="card">
                            <span class="tag">\${i.meta}</span>
                            <h3>\${i.title}</h3>
                        </a>
                    \`).join('');
                } else {
                    grid.innerHTML = '<div style="grid-column: 1/-1; text-align:center; opacity:0.1; font-weight:900; text-transform:uppercase; padding: 12rem; font-size: 0.9rem; letter-spacing: 1.2em;">Studio en attente</div>';
                }
            } catch(e) { console.error("Star Code Studio Sync Error :", e); }
        }
        fetchDocs();
    </script>
</body>
</html>`;

    zip.file("index.html", indexHTML);
    const blob = await zip.generateAsync({ type: "blob" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `STARCODE_STUDIO_${siteConfig.projectName}.zip`;
    a.click();
    setIsExporting(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 pb-32">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* DASHBOARD EDITION */}
        <div className="lg:col-span-8 space-y-10">
          <div className="bg-slate-900/40 border border-white/10 rounded-[4.5rem] p-12 backdrop-blur-3xl shadow-[0_40px_100px_rgba(0,0,0,0.5)] relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-40"></div>
            
            <header className="flex items-center justify-between mb-20">
              <div className="flex items-center gap-8">
                <div className="p-6 bg-cyan-500/10 rounded-3xl border border-cyan-500/20 shadow-[0_0_30px_rgba(6,182,212,0.2)]">
                  <Zap className="text-cyan-400 w-8 h-8 fill-cyan-400" />
                </div>
                <div>
                  <h2 className="text-5xl font-black uppercase italic tracking-tighter text-white">{siteConfig.projectName || "STAR_CORE"}</h2>
                  <p className="text-cyan-500/60 text-[10px] font-black uppercase tracking-[0.6em] mt-1 italic">Star Code Engine v4.0</p>
                </div>
              </div>
              <div className="hidden md:flex flex-col items-end">
                <div className="px-4 py-2 bg-white/5 rounded-2xl border border-white/10 text-[9px] font-black text-slate-500 uppercase tracking-widest">
                   IP: {user?.ip || "Liaison..."}
                </div>
                <div className="text-[8px] font-black uppercase text-cyan-500/30 tracking-[0.4em] mt-2">lion d'astarte</div>
              </div>
            </header>

            <div className="space-y-12">
              <div className="flex flex-col md:flex-row gap-5 p-5 bg-black/60 rounded-[3rem] border border-white/10 shadow-inner group">
                <input 
                  value={newItem.title} 
                  onChange={e => setNewItem({...newItem, title: e.target.value})} 
                  placeholder="NOM DU DOCUMENT..." 
                  className="flex-1 bg-transparent border-none px-8 py-5 outline-none font-black uppercase placeholder:text-slate-800 text-xl italic" 
                />
                <input 
                  value={newItem.link} 
                  onChange={e => setNewItem({...newItem, link: e.target.value})} 
                  placeholder="LIEN CLOUD..." 
                  className="flex-1 bg-transparent border-none px-8 py-5 outline-none placeholder:text-slate-800 font-bold" 
                />
                <button onClick={addItem} className="bg-cyan-500 text-black px-12 py-6 rounded-[2rem] font-black uppercase hover:scale-110 active:scale-95 transition-all flex items-center gap-3 shadow-2xl">
                   Ajouter
                </button>
              </div>

              <div className="space-y-6 max-h-[600px] overflow-y-auto pr-4 custom-scrollbar">
                {isLoading ? (
                  <div className="flex flex-col items-center justify-center py-24 gap-6">
                    <Loader2 className="w-14 h-14 animate-spin text-cyan-500/40" />
                    <span className="text-[11px] font-black uppercase text-cyan-500/30 tracking-[1em] animate-pulse">Synchronisation Studio</span>
                  </div>
                ) : items.length === 0 ? (
                  <div className="text-center py-32 opacity-10 uppercase font-black tracking-[1.5em] text-[10px] border-2 border-dashed border-white/5 rounded-[4rem] group hover:border-cyan-500/20 transition-all">
                    <Sparkles className="w-14 h-14 mx-auto mb-8 animate-pulse" />
                    Archive Star Code Vide
                  </div>
                ) : (
                  items.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-white/5 border border-white/5 p-8 rounded-[3rem] hover:border-cyan-500/40 transition-all group backdrop-blur-md hover:bg-white/10 relative overflow-hidden">
                      <div className="absolute left-0 top-0 w-1 h-full bg-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[10px] font-black text-cyan-500 uppercase tracking-widest mb-2 opacity-70 italic">{item.meta}</div>
                        <div className="font-black text-2xl uppercase truncate pr-10 tracking-tighter italic">{item.title}</div>
                      </div>
                      <div className="flex gap-4">
                        <a href={item.link} target="_blank" className="p-5 bg-white/5 rounded-2xl text-slate-500 hover:text-cyan-400 transition-all border border-transparent hover:border-cyan-500/30"><ExternalLink className="w-6 h-6" /></a>
                        <button onClick={() => removeItem(idx)} className="p-5 bg-red-500/5 text-red-500/20 hover:text-red-500 rounded-2xl transition-all border border-transparent hover:border-red-500/30"><Trash2 className="w-6 h-6" /></button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* SIDEBAR EXPORT */}
        <div className="lg:col-span-4 space-y-10">
          <section className="bg-slate-900/40 border border-white/10 rounded-[4.5rem] p-12 shadow-2xl backdrop-blur-3xl relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-8 opacity-5 text-cyan-500 group-hover:scale-110 transition-transform"><Palette className="w-32 h-32" /></div>
            <h3 className="text-[12px] font-black uppercase tracking-[0.6em] mb-12 flex items-center gap-4 text-slate-400 italic">
              <Palette className="w-5 h-5 text-cyan-500" /> Profil Visuel
            </h3>
            <div className="grid grid-cols-3 gap-5 mb-10">
              {themes.map(t => (
                <button 
                  key={t.id}
                  onClick={() => setSiteConfig({...siteConfig, theme: t.id})}
                  className={`flex flex-col items-center gap-4 p-5 rounded-[2rem] border-2 transition-all ${siteConfig.theme === t.id ? 'border-cyan-500 bg-cyan-500/10 scale-110 shadow-[0_0_30px_rgba(6,182,212,0.2)]' : 'border-transparent opacity-40 hover:opacity-100 hover:bg-white/5'}`}
                >
                  <div className="w-12 h-12 rounded-full shadow-2xl border border-white/10" style={{ backgroundColor: t.color }} />
                  <span className="text-[9px] font-black uppercase tracking-widest">{t.label}</span>
                </button>
              ))}
            </div>
          </section>

          <section className="bg-slate-900/40 border border-white/10 rounded-[4.5rem] p-12 shadow-2xl backdrop-blur-3xl relative overflow-hidden group">
            <h3 className="text-[12px] font-black uppercase tracking-[0.6em] mb-14 flex items-center gap-4 text-slate-400 italic">
              <Settings className="w-5 h-5 text-cyan-500" /> Exportation Studio
            </h3>
            <button 
              onClick={handleDownload} 
              disabled={isExporting} 
              className="w-full bg-cyan-500 text-black font-black py-12 rounded-[3.5rem] flex items-center justify-center gap-6 hover:scale-105 active:scale-95 transition-all shadow-[0_40px_80px_rgba(6,182,212,0.4)] group relative overflow-hidden"
            >
              {isExporting ? <Loader2 className="animate-spin w-10 h-10" /> : <Download className="w-10 h-10 group-hover:bounce" />}
              <span className="uppercase tracking-tighter text-3xl italic">DÉPLOYER</span>
            </button>
            <div className="mt-12 text-center">
              <div className="text-[8px] font-black uppercase text-cyan-500/40 tracking-[0.6em] mb-2 animate-pulse">Star Code Studio</div>
              <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">lion d'astarte</div>
            </div>
          </section>
          
          <div className="text-center opacity-10 text-[11px] font-black uppercase tracking-[1em] italic pt-10">
             STAR CODE STUDIO
          </div>
        </div>

      </div>
    </div>
  );
};
