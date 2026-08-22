(function(){
  /* =================================================================
     CONFIG
     ================================================================= */
  const CONFIG = {
    sheetId: '1KmJvICKMVe44DewudUdgdW9AhC_Rif83u6CwELpvZls',
    pollSeconds: 10,
    // Qualifying TV layout. true  → Overall Fastest + By Heats shown side by side.
    //                       false → cycle between the two full-screen (like Knockout TV).
    // Overridden by the "QFTVSidebySide" key in the Settings sheet, which is
    // re-read on every poll — flipping the cell retargets a running TV session.
    qfTvSideBySide: true,
    qfTvCycleMs: 12000,   // dwell per view when cycling (matches Knockout TV)
    // Which TV view is on screen: 'qualifying' | 'knockouts' | null (unset).
    // Driven by the "Display" key in the Settings sheet — the remote equivalent of
    // pressing Enter. Applied when the sheet VALUE CHANGES, not on every poll, so a
    // local Enter press isn't snapped back ten seconds later.
    display: null,
    // Ad playback. Overridden by the "Play Ads" key in the Settings sheet.
    playAds: false,
    ads: {
      folder: 'ads',
      imageMs: 15000,                                  // hold time per still image
      imageExts: ['jpg','jpeg','png','webp','gif'],
      videoExts: ['mp4','webm','m4v'],                 // played to their natural end
      maxProbe: 60,        // highest adN we ever look for
      probeGap: 2,         // stop after this many consecutive missing numbers
      retryMs: 30000,      // when the folder is empty, look again this often
    },
    // Events + Settings live in a SEPARATE spreadsheet, read via gviz JSONP
    // (replaces the old Apps Script web app).
    eventsSheetId: '1ghHvvVe4kNnkVUbYTsBHxrfB2MLH-erhOCvlOBbU3Uc',
    eventsGid:   '1914616841',   // drives the header "LIVE" badge (any row live === "Yes")
    settingsGid: '1288723697',   // key|value config: Title, Date, ShowWinner, Show <category>
    // Driver → class lookup (separate tab on the main sheet). Used to stamp each
    // Overall row with the driver's class, mirroring the public website.
    classFilter: { gid: '29911604', driverColumn: 'D', classColumn: 'A' },
    knockouts: {
      showWinner: false,   // set to false to hide the Winner column
      // Cell-reference config: set the car-number cell for each slot.
      // Driver = same row, +1 column.  Time = same row, +2 columns.
      // Adjust rows to match your actual sheet. W = winner car-number cell (optional).
      categories: [
        { name: 'BimmaCup', gid: '2038855303', fetchRange: 'H7:X37',
          rounds: {
            R16: [
              { match:8, slot1:'H7', slot2:'H9' },
              { match:1, slot1:'H11',  slot2:'H13'  },
              { match:4, slot1:'H15',  slot2:'H17'  },
              { match:5, slot1:'H19', slot2:'H21' },
              { match:6, slot1:'H23', slot2:'H25' },
              { match:3, slot1:'H27',  slot2:'H29'  },
              { match:2, slot1:'H31',  slot2:'H33'  },
              { match:7, slot1:'H35', slot2:'H37' },
            ],
            QF: [
              { match:4, slot1:'L8',  slot2:'L12'  },
              { match:1, slot1:'L16',  slot2:'L20'  },
              { match:2, slot1:'L24',  slot2:'L28'  },
              { match:3, slot1:'L32',  slot2:'L36'  },
              
            ],
            SF: [
              { match:2, slot1:'P10',  slot2:'P18'  },
              { match:1, slot1:'P26',  slot2:'P34'  },
            ],
            F:  [{ match:1, slot1:'T14', slot2:'T30' }],
            W:  'X22',
          }
        },
        { name: 'BimmaCup Jr.', gid: '1123204078', fetchRange: 'C7:S37',
          rounds: {
            R16: [
              { match:8, slot1:'C7',   slot2:'C9'   },
              { match:1, slot1:'C11',  slot2:'C13'  },
              { match:4, slot1:'C15',  slot2:'C17'  },
              { match:5, slot1:'C19',  slot2:'C21'  },
              { match:6, slot1:'C23',  slot2:'C25'  },
              { match:3, slot1:'C27',  slot2:'C29'  },
              { match:2, slot1:'C31',  slot2:'C33'  },
              { match:7, slot1:'C35',  slot2:'C37'  },
            ],
            QF: [
              { match:4, slot1:'G8',   slot2:'G12'  },
              { match:1, slot1:'G16',  slot2:'G20'  },
              { match:2, slot1:'G24',  slot2:'G28'  },
              { match:3, slot1:'G32',  slot2:'G36'  },
            ],
            SF: [
              { match:2, slot1:'K10',  slot2:'K18'  },
              { match:1, slot1:'K26',  slot2:'K34'  },
            ],
            F:  [{ match:1, slot1:'O14', slot2:'O30' }],
            W:  'S22',
          }
        },
        { name: 'Touring', gid: '1830775932', fetchRange: 'C7:S37',
          rounds: {
            R16: [
              { match:8, slot1:'C7',   slot2:'C9'   },
              { match:1, slot1:'C11',  slot2:'C13'  },
              { match:4, slot1:'C15',  slot2:'C17'  },
              { match:5, slot1:'C19',  slot2:'C21'  },
              { match:6, slot1:'C23',  slot2:'C25'  },
              { match:3, slot1:'C27',  slot2:'C29'  },
              { match:2, slot1:'C31',  slot2:'C33'  },
              { match:7, slot1:'C35',  slot2:'C37'  },
            ],
            QF: [
              { match:4, slot1:'G8',   slot2:'G12'  },
              { match:1, slot1:'G16',  slot2:'G20'  },
              { match:2, slot1:'G24',  slot2:'G28'  },
              { match:3, slot1:'G32',  slot2:'G36'  },
            ],
            SF: [
              { match:2, slot1:'K10',  slot2:'K18'  },
              { match:1, slot1:'K26',  slot2:'K34'  },
            ],
            F:  [{ match:1, slot1:'O14', slot2:'O30' }],
            W:  'S22',
          }
        },
        { name: 'AWD', gid: '2111958111', fetchRange: 'H7:X37',
          rounds: {
            R16: [
              { match:8, slot1:'H7',   slot2:'H9'   },
              { match:1, slot1:'H11',  slot2:'H13'  },
              { match:4, slot1:'H15',  slot2:'H17'  },
              { match:5, slot1:'H19',  slot2:'H21'  },
              { match:6, slot1:'H23',  slot2:'H25'  },
              { match:3, slot1:'H27',  slot2:'H29'  },
              { match:2, slot1:'H31',  slot2:'H33'  },
              { match:7, slot1:'H35',  slot2:'H37'  },
            ],
            QF: [
              { match:4, slot1:'L8',   slot2:'L12'  },
              { match:1, slot1:'L16',  slot2:'L20'  },
              { match:2, slot1:'L24',  slot2:'L28'  },
              { match:3, slot1:'L32',  slot2:'L36'  },
            ],
            SF: [
              { match:2, slot1:'P10',  slot2:'P18'  },
              { match:1, slot1:'P26',  slot2:'P34'  },
            ],
            F:  [{ match:1, slot1:'T14', slot2:'T30' }],
            W:  'X22',
          }
        },
      ],
    },

    // The HEATS grid is the single source of truth.
    // The "Overall Fastest" view is computed from it automatically.
    heats: {
      gid: '1005565792',
      range: 'B5:V66',
      runLabels: ['Qualifying 1','Qualifying 2','Qualifying 3','Qualifying 4'],
      // Column indexes WITHIN the range (0 = first col of the range):
      heatCol: 0,                      // the "Heat" number column
      blocks: [                        // one per qualifying run → [number, driver, time] columns
        { num: 2, driver: 3, time: 4 },
        { num: 7, driver: 8, time: 9 },
        { num: 12, driver: 13, time: 14 },
        { num: 17, driver: 18, time: 19 },
      ],
      entriesPerHeat: 2,               // drivers paired per heat
    },
  };
  const SENTINEL_MS = 30*60000;        // times >= 30:00 treated as "no time set"
  // Pristine category list. CONFIG.knockouts.categories is re-derived from this on
  // every settings poll, so a "Show <category>" toggle can be turned back ON live.
  const ALL_CATEGORIES = CONFIG.knockouts.categories.slice();

  /* ===== TIME HELPERS ===== */
  function parseTime(v){
    if(v==null||v==='') return null;
    if(typeof v==='number'&&!isNaN(v)) return Math.round(v*1000);
    const s=String(v).trim(); if(!s||/^(dnf|dns|dsq|—|-)$/i.test(s)) return null;
    const p=s.split(/[:.]/).map(x=>x.trim());
    if(p.some(x=>x===''||isNaN(x))){ const f=parseFloat(s); return isNaN(f)?null:Math.round(f*1000); }
    const padMs=x=>(String(x)+'000').slice(0,3); let min=0,sec=0,ms=0;
    if(p.length>=3){ min=+p[0]; sec=+p[1]; ms=+padMs(p[2]); }
    else if(p.length===2){ if(/\./.test(s)&&!/:/.test(s)){ sec=+p[0]; ms=+padMs(p[1]); } else { min=+p[0]; sec=+p[1]; } }
    else sec=+p[0];
    return ((min*60)+sec)*1000+ms;
  }
  function fmtTime(ms){ if(ms==null) return '—'; let t=Math.round(ms);
    const m=Math.floor(t/60000); t-=m*60000; const s=Math.floor(t/1000), mm=t-s*1000;
    return String(m).padStart(2,'0')+':'+String(s).padStart(2,'0')+':'+String(mm).padStart(3,'0'); }
  function fmtGap(ms){ const s=Math.floor(ms/1000), mm=ms%1000; return '+'+s+'.'+String(mm).padStart(3,'0'); }

  /* ===== STATE ===== */
  let _gvizSeq=0;  // unique counter for JSONP callback names
  let activeView=0, lastChange=Date.now(), lastDataStr='', tvOn=false;
  let prevPos={}, prevOverallMs={}, prevHeatMs={}, driverToClass={};
  const el=id=>document.getElementById(id), root=el('lb'), list=el('lbList'), grid=el('lbHeatGrid');

  [...el('lbTabs').children].forEach(b=>b.onclick=()=>setView(+b.dataset.view));
  function setView(i){ activeView=i; [...el('lbTabs').children].forEach(b=>b.classList.toggle('active',+b.dataset.view===i));
    el('lbQualifying').classList.toggle('hide',i!==0); el('lbKnockouts').classList.toggle('hide',i!==1);
    el('lbTitleSub').textContent = i===1 ? '· Knockouts' : '· Qualifying'; }

  function avatarColor(n){let h=0;for(let i=0;i<n.length;i++)h=n.charCodeAt(i)+((h<<5)-h);return`hsl(${Math.abs(h)%360} 70% 62%)`;}
  function initials(n){return n.split(/\s+/).map(w=>w[0]).slice(0,2).join('').toUpperCase();}
  function normName(s){return String(s==null?'':s).trim().replace(/\s+/g,' ').toLowerCase();}
  function classOf(driver){return driverToClass[normName(driver)]||'';}

  /* ===== DRIVER → CLASS MAP (separate tab on the main sheet) ===== */
  function loadClassMap(){
    const cf=CONFIG.classFilter; if(!cf||!cf.gid) return;
    const dIdx=cellToIndex(cf.driverColumn+'1').col, cIdx=cellToIndex(cf.classColumn+'1').col;
    loadOneRound(cf.gid, 'A1:Z200', rows=>{
      if(!rows) return; const map={};
      rows.forEach(r=>{ const cells=r.c||[];
        const drv=String(cellVal(cells[dIdx])).trim(), cls=String(cellVal(cells[cIdx])).trim();
        if(!drv||!cls) return;
        if(/^class(es)?$/i.test(cls)||/^(category|categories)$/i.test(cls)||/^driver(\s*name)?$/i.test(drv)||/^name$/i.test(drv)) return;
        map[normName(drv)]=cls; });
      driverToClass=map;
    });
  }

  /* ===== DERIVE OVERALL FROM HEATS ===== */
  function deriveOverall(runs){
    const best={};
    runs.forEach(run=> run.heats.forEach(h=> h.entries.forEach(e=>{
      if(e.ms==null||e.ms>=SENTINEL_MS) return; const k=String(e.num);
      if(!best[k]||e.ms<best[k].ms) best[k]={num:e.num,driver:e.driver,ms:e.ms,round:run.label,heat:h.heat};
    })));
    const rows=Object.values(best).map(d=>({id:String(d.num),num:d.num,driver:d.driver,ms:d.ms,round:d.round,heat:d.heat,
      _changed: prevOverallMs[String(d.num)]!=null && prevOverallMs[String(d.num)]!==d.ms}));
    rows.sort((a,b)=>a.ms-b.ms);
    rows.forEach(r=> prevOverallMs[String(r.num)]=r.ms);
    return rows;
  }

  /* ===== RENDER OVERALL (with FLIP) ===== */
  function renderOverall(rows){
    list.style.zoom=''; // reset zoom so FLIP measurements are at 1:1 scale
    const first={}; [...list.children].forEach(r=> first[r.dataset.id]=r.getBoundingClientRect().top);
    const leaderMs=rows[0]?.ms ?? null;
    list.innerHTML='';
    rows.forEach((d,idx)=>{
      const pos=idx+1, prev=prevPos[d.id];
      let trend='same', sym='–';
      if(prev!=null&&prev>pos){trend='up'; sym='▲'+(prev-pos);} else if(prev!=null&&prev<pos){trend='down'; sym='▼'+(pos-prev);}
      const row=document.createElement('div');
      row.className='lb__row'+(pos===1?' p1':pos===2?' p2':pos===3?' p3':''); row.dataset.id=d.id;
      const gap=d.ms===leaderMs?'FASTEST':fmtGap(d.ms-leaderMs);
      const roundShort=d.round?'QF'+((d.round.match(/\d+/)||[''])[0]):'';
      const roundLbl=roundShort?`<span class="lb__round">${roundShort}</span>`:'';
      const cls=classOf(d.driver);
      const clsLbl=cls?`<span class="lb__rowclass">${cls}</span>`:'';
      row.innerHTML=`<div class="lb__pos">${pos}</div><div class="lb__num">${d.num}</div>`+
        `<div class="lb__who"><div style="min-width:0"><div class="lb__name">${d.driver}</div></div></div>`+
        `<div class="lb__end">${clsLbl}<span class="lb__trend ${trend}">${sym}</span>`+
        `<div class="lb__time${d.ms===leaderMs?' best':''}">${fmtTime(d.ms)}<small>${gap}</small></div>${roundLbl}</div>`;
      list.appendChild(row);
      if(d._changed) row.classList.add('flash');
      prevPos[d.id]=pos;
    });
    [...list.children].forEach((r,i)=>{ const f=first[r.dataset.id];
      if(f!=null){ const dy=f-r.getBoundingClientRect().top; if(dy){ r.style.transform=`translateY(${dy}px)`; r.style.transition='none';
        requestAnimationFrame(()=>{ r.style.transition='transform .55s cubic-bezier(.2,.8,.2,1)'; r.style.transform=''; }); } }
      else { r.style.opacity='0'; r.style.transform='translateY(8px)';
        requestAnimationFrame(()=>{ r.style.transition='all .4s ease '+(i*0.03)+'s'; r.style.opacity=''; r.style.transform=''; }); }
    });
    if(tvOn) scaleTvList();
  }

  /* ===== RENDER HEATS GRID ===== */
  function renderHeats(runs){
    grid.innerHTML='';
    // Up to 3 runs sit in a single row; 4+ wrap into two rows (4 runs → 2×2) so the
    // columns stay wide enough to read rather than being sliced ever thinner.
    const cols = runs.length<=3 ? Math.max(1,runs.length) : Math.ceil(runs.length/2);
    grid.style.setProperty('--hcols', cols);
    grid.classList.toggle('tight', cols>=4);
    runs.forEach(run=>{
      let runBest=Infinity; run.heats.forEach(h=>h.entries.forEach(e=>{ if(e.ms!=null&&e.ms<SENTINEL_MS&&e.ms<runBest) runBest=e.ms; }));
      const col=document.createElement('div'); col.className='lb__hcol';
      let html=`<div class="lb__hcolhead"><span>${run.label}</span><span class="t">Time</span></div>`;
      run.heats.forEach(h=>{
        html+=`<div class="lb__heat"><div class="lb__heatno">${h.heat}</div><div class="lb__hpair">`;
        const heatBest=h.entries.reduce((b,e)=>(e.ms!=null&&e.ms<SENTINEL_MS&&(b===null||e.ms<b))?e.ms:b, null);
        h.entries.forEach(e=>{
          const key=run.label+'|'+e.num, changed=prevHeatMs[key]!=null&&prevHeatMs[key]!==e.ms; prevHeatMs[key]=e.ms;
          const dnf=e.ms==null||e.ms>=SENTINEL_MS;
          const isHeatFastest=!dnf&&heatBest!==null&&e.ms===heatBest;
          const cls=dnf?'dnf':(e.ms===runBest?'best':'');
          html+=`<div class="lb__hentry${changed?' flash':''}${isHeatFastest?' heat-best':''}"><span class="lb__hnum">${e.num}</span>`+
            `<span class="lb__hdrv">${e.driver}</span><span class="lb__htime ${cls}">${dnf?'—':fmtTime(e.ms)}</span></div>`;
        });
        html+=`</div></div>`;
      });
      col.innerHTML=html; grid.appendChild(col);
    });
    if(tvOn) scaleTvHeats();
  }

  function hideLoading(){
    const s=el('lbSpinner'); if(s) s.classList.add('done');
    const v=el('lbViews'); if(v) v.classList.remove('loading');
  }

  function markUpdated(ok,dataChanged){
    if(dataChanged){ lastChange=Date.now(); const u=el('lbUpdated'); u.classList.add('flash'); setTimeout(()=>u.classList.remove('flash'),350); }
    el('lbErr').style.display=ok?'none':'block'; }
  setInterval(()=>{ const s=Math.round((Date.now()-lastChange)/1000);
    let txt; if(s<2) txt='just now'; else if(s<60) txt='updated '+s+'s ago';
    else { const m=Math.floor(s/60), r=s%60; txt='updated '+m+'m'+(r?' '+r+'s':'')+' ago'; }
    el('lbUpdatedTxt').textContent=txt; },1000);

  /* ===== LIVE: read heats grid via JSONP (works from file:// and cross-origin) ===== */
  function loadLive(cb){
    const h=CONFIG.heats;
    const base=`https://docs.google.com/spreadsheets/d/${CONFIG.sheetId}/gviz/tq?gid=${h.gid}`+(h.range?`&range=${h.range}`:'');
    const cbName='__gvizCb'+Date.now();
    const script=document.createElement('script');
    window[cbName]=function(resp){
      delete window[cbName]; script.remove();
      if(resp.status!=='ok'){
        const msg=(resp.errors&&resp.errors[0]&&(resp.errors[0].detailed_message||resp.errors[0].message))||'unknown error';
        el('lbErr').textContent='Sheet error: '+msg+' — ensure sheet is shared ("Anyone with link") and published to the web (File > Share > Publish to web).'; hideLoading(); markUpdated(false,false); return;
      }
      const rows=resp.table.rows||[];
      const getVal=(r,c)=>{ if(c==null) return ''; const cell=rows[r]&&rows[r].c&&rows[r].c[c]; if(!cell) return ''; return cell.f!=null?cell.f:(cell.v!=null?String(cell.v):''); };
      const runs=h.runLabels.map(l=>({label:l, heats:[]}));
      let curHeat=''; const rowsByHeat={};
      for(let r=0;r<rows.length;r++){
        const hn=String(getVal(r,h.heatCol)||'').trim(); if(hn) curHeat=hn;
        if(!curHeat) continue;
        h.blocks.forEach((b,bi)=>{
          const num=String(getVal(r,b.num)||'').trim(), drv=String(getVal(r,b.driver)||'').trim();
          if(!drv&&!num) return;
          if(!rowsByHeat[bi]) rowsByHeat[bi]={};
          if(!rowsByHeat[bi][curHeat]) rowsByHeat[bi][curHeat]=[];
          rowsByHeat[bi][curHeat].push({num,driver:drv,ms:parseTime(getVal(r,b.time))});
        });
      }
      h.blocks.forEach((b,bi)=>{ const map=rowsByHeat[bi]||{};
        Object.keys(map).forEach(hn=>runs[bi].heats.push({heat:hn,entries:map[hn]})); });
      // A qualifying run with nothing in the sheet (e.g. no Qualifying 4 at this
      // event) is dropped entirely rather than rendered as an empty column.
      // The first run is always kept so the grid never collapses to nothing.
      const used=runs.filter((r,i)=> i===0 || r.heats.length>0);
      cb(used);
    };
    script.onerror=function(){ delete window[cbName]; script.remove();
      el('lbErr').textContent='Could not reach data'; hideLoading(); markUpdated(false,false); };
    script.src=base+'&tqx=out:json;responseHandler:'+cbName;
    document.head.appendChild(script);
  }

  /* ===== EVENTS / SETTINGS SHEET (separate spreadsheet, gviz JSONP) ===== */
  /* Generic row reader for the events+settings spreadsheet. headers=0 so row 0
     is returned as data; cb(rows) on success, cb(null) on any failure. */
  function gvizRows(gid, cb){
    const base=`https://docs.google.com/spreadsheets/d/${CONFIG.eventsSheetId}/gviz/tq?gid=${gid}&headers=0`;
    const cbName='__gvizCfg'+(++_gvizSeq);
    const script=document.createElement('script');
    window[cbName]=function(resp){ delete window[cbName]; script.remove();
      cb(resp&&resp.status==='ok'?((resp.table&&resp.table.rows)||[]):null); };
    script.onerror=function(){ delete window[cbName]; script.remove(); cb(null); };
    script.src=base+'&tqx=out:json;responseHandler:'+cbName;
    document.head.appendChild(script);
  }
  const cellVal=c=>c?(c.f!=null?c.f:(c.v!=null?String(c.v):'')):'';

  /* ===== LIVE BADGE: a RallySprint event row with live === "Yes" =====
     Only RallySprint events drive the badge — a live Social/Speed/etc. row
     (e.g. "RB26 Practice") must NOT light it up. */
  function loadLiveStatus(){
    gvizRows(CONFIG.eventsGid, rows=>{
      if(!rows){ el('lbLive').style.display='none'; el('lbUpdated').style.display='none'; return; }
      const headers=(rows[0]&&rows[0].c||[]).map(c=>String(cellVal(c)).trim().toLowerCase());
      const liveIdx=headers.indexOf('live'); const typeIdx=headers.indexOf('type'); let live=false;
      if(liveIdx>=0) for(let r=1;r<rows.length;r++){
        const cells=rows[r].c||[];
        const isLive=String(cellVal(cells[liveIdx])).trim().toLowerCase()==='yes';
        const isRallySprint=typeIdx>=0 && String(cellVal(cells[typeIdx])).trim().toLowerCase()==='rallysprint';
        if(isLive&&isRallySprint){ live=true; break; }
      }
      el('lbLive').style.display=live?'':'none';
      el('lbUpdated').style.display=live?'':'none';
    });
  }

  /* ===== SETTINGS: key|value rows → normalized map, then applied to CONFIG/DOM ===== */
  function loadSettings(cb){
    gvizRows(CONFIG.settingsGid, rows=>{
      const out={};
      if(rows) rows.forEach(r=>{
        const cells=r.c||[]; const k=String(cellVal(cells[0])).trim();
        if(k) out[k.toLowerCase().replace(/[^a-z0-9]/g,'')]=String(cellVal(cells[1])).trim();
      });
      cb(out);
    });
  }
  /* Returns true when the visible category set changed, so the caller can rebuild
     the buttons and refetch brackets. */
  function applySettings(s){
    const truthy=v=>/^(yes|true|1|on)$/i.test(String(v||'').trim());
    if(s.title){ const t=el('lbTitleName'); if(t) t.textContent=s.title; }
    if(s.date){ const d=el('lbDate'); if(d) d.textContent=s.date; }
    if('showwinner' in s) CONFIG.knockouts.showWinner=truthy(s.showwinner);
    if('qftvsidebyside' in s) CONFIG.qfTvSideBySide=truthy(s.qftvsidebyside);
    if('playads' in s) CONFIG.playAds=truthy(s.playads);
    if('display' in s){
      const d=String(s.display||'').toLowerCase().replace(/[^a-z]/g,'');
      if(d.charAt(0)==='q') CONFIG.display='qualifying';
      else if(d.charAt(0)==='k') CONFIG.display='knockouts';
    }
    // Category visibility: keep a category only if its "Show <name>" key is truthy
    // (or absent, defaulting to shown). Re-derived from ALL_CATEGORIES rather than
    // the current list so toggling a category back on brings it back.
    const next=ALL_CATEGORIES.filter(cat=>{
      const key='show'+cat.name.toLowerCase().replace(/[^a-z0-9]/g,'');
      return (key in s)?truthy(s[key]):true;
    });
    const prev=CONFIG.knockouts.categories;
    const changed=next.length!==prev.length||next.some((c,i)=>c!==prev[i]);
    CONFIG.knockouts.categories=next;
    return changed;
  }

  /* Re-read the Settings tab and push any change into the live UI. */
  function refreshSettings(){
    loadSettings(s=>{
      const catsChanged=applySettings(s);
      if(catsChanged){
        buildCatButtons();
        activeCat=0; ktvCat=0; lastKnockoutStr='';
        knockoutCycle();
      }
      applyDisplayMode();
      applyQfLayout();
      applyAdsMode();
    });
  }

  /* ===== ORCHESTRATION ===== */
  function cycle(isInit){
    const done=runs=>{
      const str=JSON.stringify(runs.map(r=>r.heats.map(h=>h.entries.map(e=>e.ms))));
      const changed=str!==lastDataStr; lastDataStr=str;
      renderHeats(runs); renderOverall(deriveOverall(runs));
      hideLoading();
      if(!isInit) markUpdated(true,changed);
    };
    loadLive(done);
  }
  function start(){ loadClassMap(); cycle(true); markUpdated(true,true); loadLiveStatus();
    setInterval(()=>{ cycle(false); loadLiveStatus(); refreshSettings(); }, CONFIG.pollSeconds*1000); }

  /* ===== TV "OVERALL FASTEST" AUTO-FIT =====
     Keeps the Overall list clear of the credit footer.
     - Side-by-side TV mode: the list lives in a narrow column, so shrink-to-fit (zoom).
     - Solo/cycling mode: when the single column would reach the footer, split it into
       enough side-by-side columns that everything fits above the footer (no zoom). */
  function scaleTvList(){
    list.style.zoom='';
    list.classList.remove('tvcols');
    list.style.removeProperty('height');
    list.style.removeProperty('--tvcols');
    if(!tvOn) return;
    requestAnimationFrame(()=>{
      const listRect=list.getBoundingClientRect();
      // Cap against the credit footer's actual top edge (the header height varies,
      // so a fixed estimate would let the list run under the footer).
      const credit=root.querySelector('.lb__credit');
      const limitBottom=credit?credit.getBoundingClientRect().top-8
                              :el('lbViews').getBoundingClientRect().bottom-4;
      const availH=limitBottom-listRect.top;
      const listH=list.scrollHeight;
      if(!(listH>availH&&availH>0)) return;   // fits above the footer — nothing to do
      if(root.classList.contains('tvsolo')){
        const cols=Math.max(2, Math.ceil(listH/availH));
        list.style.setProperty('--tvcols', cols);
        list.style.height=availH+'px';
        list.classList.add('tvcols');
      } else {
        list.style.zoom=String(Math.max(0.55,availH/listH).toFixed(3));
      }
    });
  }

  /* Same shrink-to-fit for the heats grid. Once it wraps to two rows (4+ qualifying
     runs) it can run past the credit footer, so zoom it down until it fits. */
  function scaleTvHeats(){
    grid.style.zoom='';
    if(!tvOn) return;
    requestAnimationFrame(()=>{
      const credit=root.querySelector('.lb__credit');
      const limitBottom=credit?credit.getBoundingClientRect().top-8
                              :el('lbViews').getBoundingClientRect().bottom-4;
      const availH=limitBottom-grid.getBoundingClientRect().top, gridH=grid.scrollHeight;
      if(gridH>availH&&availH>0) grid.style.zoom=String(Math.max(0.5,availH/gridH).toFixed(3));
    });
  }

  /* ===== TV MODE (both views) ===== */
  let tvHideTimer=null, tvQfCat=0, tvQfInterval=null;
  let appliedQfSideBySide=null;   // layout currently on screen; null = none applied yet
  const tvExit=el('lbTvExit');
  function showTvExit(){ tvExit.classList.add('show'); clearTimeout(tvHideTimer); tvHideTimer=setTimeout(()=>tvExit.classList.remove('show'),3000); }
  /* When QFTVSidebySide is off, show one qualifying view at a time (0=Overall, 1=Heats)
     and crossfade between them — mirrors the Knockout TV category cycling. */
  function setTvQf(i){ tvQfCat=i;
    el('lbOverall').classList.toggle('qf-hidden', i!==0);
    el('lbHeats').classList.toggle('qf-hidden', i!==1);
    if(tvOn) requestAnimationFrame(i===0?scaleTvList:scaleTvHeats); }
  function startQfCycle(){
    root.classList.add('tvsolo'); setTvQf(0);
    clearInterval(tvQfInterval);
    tvQfInterval=setInterval(()=>setTvQf((tvQfCat+1)%2), CONFIG.qfTvCycleMs);
  }
  function stopQfCycle(){
    clearInterval(tvQfInterval); tvQfInterval=null;
    root.classList.remove('tvsolo');
    el('lbOverall').classList.remove('qf-hidden'); el('lbHeats').classList.remove('qf-hidden');
  }
  /* Puts the qualifying TV layout in sync with CONFIG.qfTvSideBySide. Safe to call
     on every settings poll: it no-ops unless the setting actually changed, so a
     running crossfade is never restarted from the top. */
  function applyQfLayout(){
    if(!tvOn){ appliedQfSideBySide=null; return; }
    if(appliedQfSideBySide===CONFIG.qfTvSideBySide) return;
    appliedQfSideBySide=CONFIG.qfTvSideBySide;
    if(CONFIG.qfTvSideBySide) stopQfCycle(); else startQfCycle();
    requestAnimationFrame(()=>{ scaleTvList(); scaleTvHeats(); });
  }
  function enterTV(){ tvOn=true; root.classList.add('tv'); el('lbTitleSub').textContent='· Qualifying';
    appliedQfSideBySide=null; applyQfLayout(); applyAdsMode();
    showTvExit(); requestAnimationFrame(()=>{ scaleTvList(); scaleTvHeats(); }); if(root.requestFullscreen) root.requestFullscreen().catch(()=>{}); }
  // keepFs means we're switching Qualifying⟷Knockout TV, so ads carry on uninterrupted.
  function exitTV(keepFs){ tvOn=false; root.classList.remove('tv'); stopQfCycle(); appliedQfSideBySide=null; list.style.zoom=''; grid.style.zoom=''; clearTimeout(tvHideTimer); tvExit.classList.remove('show'); if(!keepFs){ applyAdsMode(); if(document.fullscreenElement) document.exitFullscreen().catch(()=>{}); } }
  document.addEventListener('mousemove',()=>{ if(tvOn||ktvOn) showTvExit(); });
  // TV build: a single "Start TV" launcher (a real user click → fullscreen is allowed).
  const startScreen=el('lbStart');
  { const sb=el('lbStartBtn'); if(sb) sb.onclick=()=>{ if(startScreen) startScreen.classList.add('hide');
      if(CONFIG.display==='knockouts') enterKnockoutTV(); else { setView(0); enterTV(); } }; }
  { const b=el('lbTvBtn'); if(b) b.onclick=enterTV; }   // legacy button, absent in this build
  tvExit.onclick=()=>{ exitTV(); exitKnockoutTV(); };
  // Re-show the launcher whenever we leave fullscreen (Esc / F11 / browser chrome).
  document.addEventListener('fullscreenchange',()=>{
    if(!document.fullscreenElement){ exitTV(); exitKnockoutTV(); if(startScreen) startScreen.classList.remove('hide'); }
  });
  /* Enter toggles between Qualifying TV and Knockout TV without leaving fullscreen */
  function toggleTvMode(){
    if(tvOn){ exitTV(true); enterKnockoutTV(); }
    else if(ktvOn){ exitKnockoutTV(true); setView(0); enterTV(); }
  }
  /* Remote equivalent of Enter, driven by the Settings sheet's "Display" key.
     Deliberately fires only when the sheet value CHANGES: the operator can still
     press Enter at the machine without the next poll yanking it back. Editing the
     cell always wins from that point on. */
  let appliedDisplay=null;
  function applyDisplayMode(){
    const want=CONFIG.display;
    if(!want||want===appliedDisplay) return;
    appliedDisplay=want;
    if(!(tvOn||ktvOn)){ setView(want==='knockouts'?1:0); return; }  // Start TV honours it later
    // keepFs so the switch happens without dropping out of fullscreen, exactly
    // as toggleTvMode does. requestFullscreen without a user gesture just no-ops
    // here because we're already fullscreen on the same element.
    if(want==='knockouts'&&!ktvOn){ exitTV(true); enterKnockoutTV(); }
    else if(want==='qualifying'&&!tvOn){ exitKnockoutTV(true); setView(0); enterTV(); }
  }
  document.addEventListener('keydown',e=>{
    if(e.key==='Escape'){ exitTV(); exitKnockoutTV(); }
    else if(e.key==='Enter' && (tvOn||ktvOn)){ e.preventDefault(); toggleTvMode(); }
  });

  /* ===== KNOCKOUTS ===== */
  let activeCat=0, knockoutData=null, lastKnockoutStr='';
  let ktvOn=false, ktvCat=0, ktvInterval=null;

  /* --- 'H5' → { col:7, row:4 } (both 0-based) --- */
  function cellToIndex(ref){
    const m=ref.match(/^([A-Za-z]+)(\d+)$/); if(!m) return null;
    let col=0; for(const ch of m[1].toUpperCase()) col=col*26+(ch.charCodeAt(0)-64);
    return {col:col-1, row:+m[2]-1};
  }
  /* --- 0-based col index → letter(s): 7 → 'H' --- */
  function colLetter(n){ let s='',k=n+1;
    while(k>0){s=String.fromCharCode(65+(k-1)%26)+s; k=Math.floor((k-1)/26);} return s; }

  /* --- JSONP fetch for a sheet range --- */
  function loadOneRound(gid, range, cb){
    const base=`https://docs.google.com/spreadsheets/d/${CONFIG.sheetId}/gviz/tq?gid=${gid}&range=${range}`;
    const cbName='__gvizKo'+(++_gvizSeq);
    const script=document.createElement('script');
    window[cbName]=function(resp){ delete window[cbName]; script.remove(); cb(resp.status==='ok'?(resp.table.rows||[]):null); };
    script.onerror=function(){ delete window[cbName]; script.remove(); cb(null); };
    script.src=base+'&headers=0&tqx=out:json;responseHandler:'+cbName;
    document.head.appendChild(script);
  }

  /* --- One fetch per category covering the entire bracket range --- */
  function loadOneKnockoutTab(catCfg, cb){
    const ROUND_KEYS=['R16','QF','SF','F'];
    if(!catCfg.fetchRange){ cb({name:catCfg.name, rounds:{}}); return; }

    const m=catCfg.fetchRange.match(/^([A-Za-z]+)(\d+)/);
    if(!m){ cb({name:catCfg.name, rounds:{}}); return; }
    const originCol=cellToIndex(m[1]+'1').col, originRow=parseInt(m[2])-1;

    let fetchedRows=[];
    function readCell(ref){
      if(!ref) return ''; const p=cellToIndex(ref); if(!p) return '';
      const r=p.row-originRow, c=p.col-originCol; if(r<0||c<0) return '';
      const row=fetchedRows[r]; if(!row||!row.c||row.c[c]==null) return '';
      const cell=row.c[c]; return String(cell.f!=null?cell.f:(cell.v!=null?cell.v:'')).trim();
    }
    function colShift(ref,n){ const p=cellToIndex(ref); if(!p) return ''; return colLetter(p.col+n)+(p.row+1); }

    loadOneRound(catCfg.gid, catCfg.fetchRange, rows=>{
      fetchedRows=rows||[];

      const roundResults={};
      ROUND_KEYS.forEach(rk=>{
        const defs=catCfg.rounds[rk]; if(!Array.isArray(defs)) return;
        roundResults[rk]=defs.map(d=>({match:d.match,
          slot1:{car:readCell(d.slot1), driver:readCell(colShift(d.slot1,1)), time:readCell(colShift(d.slot1,2))},
          slot2:{car:readCell(d.slot2), driver:readCell(colShift(d.slot2,1)), time:readCell(colShift(d.slot2,2))}}));
      });

      let winnerCar='';
      if(typeof catCfg.rounds.W==='string') winnerCar=readCell(catCfg.rounds.W);

      const rounds={};
      ROUND_KEYS.forEach(rk=>{
        const list=roundResults[rk]; if(!list) return;
        const filled=list.filter(m=>m.slot1.car||m.slot1.driver||m.slot2.car||m.slot2.driver);
        if(filled.length) rounds[rk]=filled;
      });

      const fm=rounds['F'];
      if(fm&&fm.length){
        const final=fm[0];
        if(winnerCar){ final.slot1.winner=final.slot1.car===winnerCar; final.slot2.winner=final.slot2.car===winnerCar; }
        else{ const t0=parseTime(final.slot1.time),t1=parseTime(final.slot2.time);
          if(t0!=null&&t1!=null){final.slot1.winner=t0<=t1; final.slot2.winner=!final.slot1.winner;}
          else if(t0!=null) final.slot1.winner=true; else if(t1!=null) final.slot2.winner=true; }
      }

      cb({name:catCfg.name, rounds});
    });
  }

  /* --- load all categories in parallel --- */
  function loadKnockouts(cb){
    const cats=CONFIG.knockouts.categories; const results=new Array(cats.length).fill(null); let remaining=cats.length;
    cats.forEach((catCfg,i)=>{ loadOneKnockoutTab(catCfg, data=>{ results[i]=data;
      if(--remaining===0) cb(results.every(r=>r===null)?null:results); }); });
  }

  /* --- build one slot element --- */
  function makeSlot(slot, adv){
    const isBye=slot.car==='Bye'||slot.driver==='Bye'||(!slot.driver&&(slot.car===''||slot.car==='?'));
    const isTbd=!slot.driver&&!isBye;
    let cls='lb__bslot'+(slot.winner?' winner':isBye?' bye':isTbd?' tbd':'');
    const carDisp=slot.car||'';
    const nameDisp=slot.driver||'TBD';
    const timeDisp=slot.time&&slot.time!==''?`<span class="lb__btime">${slot.time}</span>`:'';
    const advBadge=adv?`<span class="lb__badv">ADV</span>`:'';
    return `<div class="${cls}"><span class="lb__bnum">${carDisp}</span><span class="lb__bname">${nameDisp}</span>${advBadge}<span class="lb__bfill"></span>${timeDisp}</div>`;
  }

  /* --- render bracket for one category --- */
  function renderBracket(catData){
    const bracket=el('lbBracket');
    if(!catData){ bracket.innerHTML='<div style="padding:20px;color:var(--muted);font-family:var(--font-mono);font-size:12px;">No data yet — ensure the sheet is published and has rows in A:Round B:Match C:Car1 D:Driver1 E:Time1 F:Car2 G:Driver2 H:Time2 I:Winner format.</div>'; return; }
    const ROUND_LABELS={R16:'Round of 16', QF:'Quarter-Finals', SF:'Semi-Finals', F:'Finals'};
    const ROUNDS=['R16','QF','SF','F'];
    let html='';
    ROUNDS.forEach(rk=>{
      const matches=catData.rounds[rk]||[];
      if(!matches.length) return;
      html+=`<div class="lb__bround"><div class="lb__broundhead">${ROUND_LABELS[rk]||rk}</div><div class="lb__bmatches">`;
      function mkMatch(m){
        let h=`<div class="lb__bmatchlabel">${rk==='F'?'Final':`${rk}#${m.match}`}</div>`;
        let adv1=false, adv2=false;
        if(rk!=='F'){
          const s1Active=!!(m.slot1.car||m.slot1.driver);
          const s2Active=!!(m.slot2.car||m.slot2.driver);
          const s1Absent=!s1Active||m.slot1.car==='Bye'||m.slot1.driver==='Bye';
          const s2Absent=!s2Active||m.slot2.car==='Bye'||m.slot2.driver==='Bye';
          if(s1Active&&s2Absent){ adv1=true; }
          else if(s2Active&&s1Absent){ adv2=true; }
          else{ const t1=parseTime(m.slot1.time),t2=parseTime(m.slot2.time);
            if(t1!=null&&t2!=null){ adv1=t1<=t2; adv2=!adv1; } }
        }
        return h+makeSlot(m.slot1,adv1)+makeSlot(m.slot2,adv2);
      }
      for(let pi=0; pi<matches.length; pi+=2){
        const m1=matches[pi], m2=matches[pi+1];
        if(!m1) continue;
        const hasPair=!!m2;
        html+=`<div class="lb__bpair${hasPair?'':' single'}">`;
        html+=`<div class="lb__bmatch">${mkMatch(m1)}</div>`;
        if(hasPair) html+=`<div class="lb__bmatch">${mkMatch(m2)}</div>`;
        html+=`</div>`;
      }
      html+=`</div></div>`;
    });
    // Winner column
    const finalsMatches=catData.rounds['F'];
    if(CONFIG.knockouts.showWinner&&finalsMatches&&finalsMatches.length){
      const final=finalsMatches[0];
      const winnerSlot=final.slot1.winner?final.slot1:(final.slot2.winner?final.slot2:null);
      const displaySlot=winnerSlot||{car:'?',driver:'TBD',time:''};
      html+=`<div class="lb__bwinner"><div class="lb__bwinnerlabel">Winner</div>`;
      html+=`<div class="lb__bwinnerslot">${makeSlot({...displaySlot,winner:!!winnerSlot})}</div></div>`;
    }
    bracket.innerHTML=html;
  }

  /* --- category button wiring --- */
  function setCat(i){
    activeCat=i;
    [...el('lbKcatBtns').children].forEach(b=>b.classList.toggle('active',+b.dataset.cat===i));
    if(knockoutData) renderBracket(knockoutData[i]);
  }
  /* Build the category buttons from the (settings-filtered) CONFIG list. */
  function buildCatButtons(){
    const wrap=el('lbKcatBtns');
    wrap.innerHTML=CONFIG.knockouts.categories.map((cat,i)=>
      `<button class="lb__kcatbtn${i===0?' active':''}" data-cat="${i}">${cat.name}</button>`).join('');
    [...wrap.children].forEach(b=>b.onclick=()=>setCat(+b.dataset.cat));
  }

  /* --- knockout polling cycle --- */
  function knockoutCycle(){
    loadKnockouts(cats=>{
      if(!cats) return;
      const str=JSON.stringify(cats);
      const changed=str!==lastKnockoutStr; lastKnockoutStr=str;
      knockoutData=cats;
      if(changed){
        if(ktvOn) renderBracket(knockoutData[ktvCat]);
        else renderBracket(knockoutData[activeCat]);
      }
    });
  }
  function startKnockouts(){
    knockoutCycle();
    setInterval(knockoutCycle, CONFIG.pollSeconds*1000);
  }

  /* --- knockout TV mode --- */
  function setKtvCat(i){
    const label=el('lbKtvLabel');
    label.style.opacity='0';
    setTimeout(()=>{
      ktvCat=i;
      if(knockoutData&&knockoutData[i]) renderBracket(knockoutData[i]);
      label.textContent=(knockoutData&&knockoutData[i])?knockoutData[i].name:'';
      label.style.opacity='1';
    },300);
  }
  function enterKnockoutTV(){
    ktvOn=true;
    setView(1);
    root.classList.add('ktv');
    setKtvCat(0);
    applyAdsMode();
    showTvExit();
    ktvInterval=setInterval(()=>{
      const next=(ktvCat+1)%((knockoutData&&knockoutData.length)||1);
      setKtvCat(next);
    },12000);
    if(root.requestFullscreen) root.requestFullscreen().catch(()=>{});
  }
  function exitKnockoutTV(keepFs){
    if(!ktvOn) return;
    ktvOn=false;
    clearInterval(ktvInterval); ktvInterval=null;
    root.classList.remove('ktv');
    el('lbKtvLabel').style.opacity='0';
    clearTimeout(tvHideTimer); tvExit.classList.remove('show');
    if(!keepFs){ applyAdsMode(); if(document.fullscreenElement) document.exitFullscreen().catch(()=>{}); }
  }
  { const b=el('lbKtvBtn'); if(b) b.onclick=enterKnockoutTV; }   // legacy button, absent in this build

  /* ===== ADVERTISEMENTS =====
     A browser can't list a directory, so ad files are found by convention:
     ads/ad1.<ext>, ads/ad2.<ext>, … probed in order until CONFIG.ads.probeGap
     consecutive numbers come back empty. Images hold for imageMs, videos play to
     their natural end. The folder is re-probed every time the playlist wraps, so
     files dropped in mid-session appear without reloading the page. */
  let adsOn=false;                 // desired state, mirrored from the Settings sheet
  let adPlaylist=[], adIndex=0, adTimer=null, adRetry=null, adProbing=false;
  const adImg=el('lbAdImg'), adVid=el('lbAdVid');

  function clearAdTimer(){ clearTimeout(adTimer); adTimer=null; }

  /* Resolve one ad slot. Every extension is tried at once; if more than one
     exists the earliest in the configured order wins. Resolves null if none do. */
  function probeAdSlot(n){
    const a=CONFIG.ads, exts=a.imageExts.concat(a.videoExts);
    return new Promise(resolve=>{
      let pending=exts.length, found=null;
      exts.forEach((ext,rank)=>{
        const url=a.folder+'/ad'+n+'.'+ext;
        const isVid=a.videoExts.indexOf(ext)>=0;
        const done=ok=>{
          if(ok&&(!found||rank<found.rank)) found={url,isVid,rank};
          if(--pending===0) resolve(found);
        };
        if(isVid){
          const v=document.createElement('video');
          v.preload='metadata'; v.muted=true;
          v.onloadedmetadata=()=>{ v.onerror=null; done(true); };
          v.onerror=()=>{ v.onloadedmetadata=null; done(false); };
          v.src=url;
        } else {
          const i=new Image();
          i.onload=()=>done(true); i.onerror=()=>done(false);
          i.src=url;
        }
      });
    });
  }

  async function discoverAds(){
    if(adProbing) return adPlaylist;
    adProbing=true;
    const found=[]; let misses=0;
    for(let n=1; n<=CONFIG.ads.maxProbe && misses<CONFIG.ads.probeGap; n++){
      const hit=await probeAdSlot(n);
      if(hit){ found.push(hit); misses=0; } else misses++;
    }
    adProbing=false;
    return found;
  }

  function showAd(){
    if(!adsOn) return;
    if(!adPlaylist.length){ stopAds(); return; }
    const ad=adPlaylist[adIndex];
    clearAdTimer();
    if(ad.isVid){
      adImg.classList.remove('show');
      adVid.classList.add('show');
      adVid.src=ad.url; adVid.load();
      const p=adVid.play();
      if(p&&p.catch) p.catch(()=>nextAd());   // blocked/undecodable → don't stall
    } else {
      adVid.classList.remove('show'); adVid.pause();
      adImg.src=ad.url;
      adImg.classList.add('show');
      adTimer=setTimeout(nextAd, CONFIG.ads.imageMs);
    }
  }

  function nextAd(){
    if(!adsOn) return;
    clearAdTimer();
    adIndex++;
    if(adIndex<adPlaylist.length){ showAd(); return; }
    adIndex=0;
    discoverAds().then(list=>{
      if(!adsOn) return;
      if(list.length) adPlaylist=list;   // keep the old list if a probe comes back empty
      showAd();
    });
  }

  /* A video that stalls would freeze the screen forever, so back 'ended' up with a
     timer sized to the clip. Duration is only known once metadata has loaded. */
  adVid.addEventListener('loadedmetadata',()=>{
    if(!adsOn) return;
    const d=adVid.duration;
    clearAdTimer();
    adTimer=setTimeout(nextAd, (isFinite(d)&&d>0 ? d*1000 : 60000)+3000);
  });
  adVid.addEventListener('ended',()=>{ if(adsOn) nextAd(); });
  adVid.addEventListener('error',()=>{ if(adsOn&&adVid.getAttribute('src')) nextAd(); });

  function startAds(){
    clearTimeout(adRetry); adRetry=null;
    adIndex=0;
    discoverAds().then(list=>{
      if(!adsOn) return;
      adPlaylist=list;
      if(!list.length){
        // Nothing to play — leave the results up rather than blanking the screen.
        root.classList.remove('ads');
        adRetry=setTimeout(startAds, CONFIG.ads.retryMs);
        return;
      }
      root.classList.add('ads');
      showAd();
    });
  }
  function stopAds(){
    clearAdTimer(); clearTimeout(adRetry); adRetry=null;
    root.classList.remove('ads');
    adImg.classList.remove('show'); adVid.classList.remove('show');
    adVid.pause();
  }
  /* Mirrors applyQfLayout: safe to call on every settings poll, no-ops unless the
     effective state changed. Ads only take over an actual TV session. */
  function applyAdsMode(){
    const want=!!CONFIG.playAds && (tvOn||ktvOn);
    if(want===adsOn) return;
    adsOn=want;
    if(want) startAds(); else stopAds();
  }

  /* ===== BOOT: load settings first, apply, then start everything ===== */
  function boot(){
    buildCatButtons();   // built from the (possibly filtered) category list
    start();             // qualifying cycle + live badge + polling
    startKnockouts();    // knockout cycle + polling
  }
  // applyQfLayout covers the case where "Start TV" was clicked before this first
  // settings read landed — TV would otherwise be stuck on the hardcoded default.
  loadSettings(s=>{ applySettings(s); applyDisplayMode(); applyQfLayout(); applyAdsMode(); boot(); });
})();