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
    // When a heat's time lands, that heat is held full-size on its own for this
    // long before the grid fades back. TV mode only.
    heatSpotMs: 15000,
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
        { name: 'BimmaCup', gid: '2038855303',
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
        { name: 'BimmaCup Jr.', gid: '1123204078',
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
        { name: 'Touring', gid: '1830775932',
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
        { name: 'AWD', gid: '2111958111',
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
      heatCol: 1,                      // the "Heat" number column (C, i.e. range B..V index 1)
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
  function parseTimeRaw(v){
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
  /* Single choke point for every time read off the sheet. A faulted timer writes
     0:00:000 into cells; left alone those sort straight to the top of the
     leaderboard and win their bracket match. Every caller already handles null,
     so rejecting non-positive times here covers leaderboard sorting, fastest-lap
     markers, heat-best highlighting and the bracket ADV/winner comparisons. */
  function parseTime(v){
    var n=parseTimeRaw(v);
    return (typeof n==='number'&&isFinite(n)&&n>0)?n:null;
  }
  /* Bracket slots print the RAW cell text, so they need their own check. Kept
     deliberately separate from parseTime so genuine DNF/DNS text still shows. */
  function isZeroTime(v){
    var s=String(v==null?'':v).trim();
    return /^[0:.]+$/.test(s)&&s.indexOf('0')>=0;
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
    loadOneRound(cf.gid, table=>{
      if(!table) return; const map={};
      // Columns by the ids gviz reports, so a blank leading column cannot shift them.
      const colIdx={}; (table.cols||[]).forEach((col,i)=>{ if(col&&col.id) colIdx[col.id]=i; });
      const dIdx=colIdx[cf.driverColumn], cIdx=colIdx[cf.classColumn];
      if(dIdx==null||cIdx==null) return;
      (table.rows||[]).forEach(r=>{ const cells=r.c||[];
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

  /* The board shows ONE qualifying run at a time: whichever is currently being
     timed, i.e. the LAST run carrying any time. The moment the first Qualifying 2
     time lands the board moves off Qualifying 1. Before any time exists at all the
     first run with rows is shown, so the grid is never blank while a field stages.
     Only the on-screen grid is narrowed — Overall Fastest still derives from every
     run, so earlier rounds keep counting towards a driver's best. */
  function currentRun(runs){
    const hasTime=r=>r.heats.some(h=>h.entries.some(e=>e.ms!=null));
    for(let i=runs.length-1;i>=0;i--) if(hasTime(runs[i])) return runs[i];
    return runs.find(r=>r.heats.length)||null;
  }

  /* ===== RENDER HEATS GRID ===== */
  function renderHeats(allRuns){
    grid.innerHTML='';
    const live=currentRun(allRuns);
    const runs=live?[live]:[];
    // Up to 3 runs sit in a single row; 4+ wrap into two rows (4 runs → 2×2) so the
    // columns stay wide enough to read rather than being sliced ever thinner.
    const cols = runs.length<=3 ? Math.max(1,runs.length) : Math.ceil(runs.length/2);
    grid.style.setProperty('--hcols', cols);
    grid.classList.toggle('tight', cols>=4);
    runs.forEach(run=>{
      let runBest=Infinity; run.heats.forEach(h=>h.entries.forEach(e=>{ if(e.ms!=null&&e.ms<SENTINEL_MS&&e.ms<runBest) runBest=e.ms; }));
      const col=document.createElement('div'); col.className='lb__hcol';
      let html=`<div class="lb__hcolhead"><span>${run.label}</span></div>`;
      // The heats sit in two columns under the one full-width header. Build each
      // heat's markup on its own so the list can be split down the middle below.
      const heatHtml=run.heats.map(h=>{
        let html=`<div class="lb__heat"><div class="lb__heatno">${h.heat}</div><div class="lb__hpair">`;
        const heatBest=h.entries.reduce((b,e)=>(e.ms!=null&&e.ms<SENTINEL_MS&&(b===null||e.ms<b))?e.ms:b, null);
        h.entries.forEach(e=>{
          const key=run.label+'|'+e.num, changed=prevHeatMs[key]!=null&&prevHeatMs[key]!==e.ms; prevHeatMs[key]=e.ms;
          const dnf=e.ms==null||e.ms>=SENTINEL_MS;
          const isHeatFastest=!dnf&&heatBest!==null&&e.ms===heatBest;
          const cls=dnf?'dnf':(e.ms===runBest?'best':'');
          html+=`<div class="lb__hentry${changed?' flash':''}${isHeatFastest?' heat-best':''}"><span class="lb__hnum">${e.num}</span>`+
            `<span class="lb__hdrv">${e.driver}</span><span class="lb__htime ${cls}">${dnf?'—':fmtTime(e.ms)}</span></div>`;
        });
        return html+`</div></div>`;
      });
      // Split down the middle so heats read top-to-bottom in the left column, then
      // continue down the right — the odd heat out goes to the left column.
      const half=Math.ceil(heatHtml.length/2);
      const group=h=>`<div class="lb__hgroup">${h.join('')}</div>`;
      html+=`<div class="lb__hbody">`+(heatHtml.length>1
        ? group(heatHtml.slice(0,half))+group(heatHtml.slice(half))
        : group(heatHtml))+`</div>`;
      col.innerHTML=html; grid.appendChild(col);
    });
    // Every run is checked, not just the live one, so a run's heats are already on
    // record by the time it goes live — otherwise its opening heat would be seeded
    // silently and never spotlighted. Only the live run can actually raise one.
    // This also runs off TV, keeping signatures current so entering TV mid-session
    // doesn't replay heats that landed while it was off.
    let fresh=null;
    allRuns.forEach(r=>{ const f=checkNewHeat(r); if(f&&live&&r.label===live.label) fresh=f; });
    heatSigSeeded=true;
    if(tvOn&&fresh) showHeatSpot(fresh.run,fresh.heat);
    if(tvOn) scaleTvHeats();
  }

  /* ===== NEW-HEAT SPOTLIGHT =====
     When a heat posts a time, the grid fades out and that heat is held on its own
     for CONFIG.heatSpotMs, then fades back. TV only: off TV the overlay has no
     fixed height to fill, and the browser view is the operator's console anyway. */
  const spot=el('lbHeatSpot'), heats=el('lbHeats');
  let prevHeatSig={};      // run|heat → {sig, n} as last seen
  let heatSigSeeded=false; // first pass only records; nothing is "new" on load
  let spotTimer=null, spotKey=null;

  const realTimes=h=>h.entries.filter(e=>e.ms!=null&&e.ms<SENTINEL_MS).length;

  /* Returns the heat that most recently gained a time, or null. A heat counts as
     new only when it holds MORE real times than last poll — an edited time, or a
     driver scratched to DNF, must not re-trigger a heat already shown. A heat never
     seen before starts from zero, so a heat that appears already timed does count;
     the heatSigSeeded gate is what stops the first load replaying the whole sheet.
     Heats are walked in ascending order, so when two land in one poll the later
     one wins. */
  function checkNewHeat(run){
    let fresh=null;
    run.heats.forEach(h=>{
      const key=run.label+'|'+h.heat;
      const sig=h.entries.map(e=>e.ms==null?'':e.ms).join(','), n=realTimes(h);
      const prev=prevHeatSig[key]||{sig:'',n:0};
      prevHeatSig[key]={sig:sig,n:n};
      if(!heatSigSeeded) return;
      if(sig!==prev.sig&&n>prev.n) fresh={run:run,heat:h};
    });
    return fresh;
  }

  /* A second time landing in the same heat refreshes the card in place and extends
     the hold rather than re-opening it; a different heat takes it over outright. */
  function showHeatSpot(run,h){
    const key=run.label+'|'+h.heat, reopen=spotKey!==key||!spotTimer;
    spotKey=key;
    const best=h.entries.reduce((b,e)=>(e.ms!=null&&e.ms<SENTINEL_MS&&(b===null||e.ms<b))?e.ms:b,null);
    spot.innerHTML=`<div class="lb__spotcard"><div class="lb__spothead">${run.label} &middot; Heat ${h.heat}</div>`+
      h.entries.map(e=>{
        const dnf=e.ms==null||e.ms>=SENTINEL_MS, win=!dnf&&best!==null&&e.ms===best;
        return `<div class="lb__spotrow${win?' win':''}"><span class="lb__spotnum">${e.num}</span>`+
          `<span class="lb__spotdrv">${e.driver}</span>`+
          `<span class="lb__spottime">${dnf?'—':fmtTime(e.ms)}</span></div>`;
      }).join('')+`</div>`;
    if(reopen){
      heats.classList.add('spotting');
      // The Overall/Heats crossfade would swap views mid-hold, so it is paused for
      // the duration and picked up again in hideHeatSpot().
      if(tvQfInterval){ clearInterval(tvQfInterval); tvQfInterval=null; setTvQf(1); }
      requestAnimationFrame(()=>spot.classList.add('show'));
    }
    clearTimeout(spotTimer);
    spotTimer=setTimeout(hideHeatSpot, CONFIG.heatSpotMs);
  }

  function hideHeatSpot(){
    clearTimeout(spotTimer); spotTimer=null; spotKey=null;
    spot.classList.remove('show'); heats.classList.remove('spotting');
    setTimeout(()=>{ if(!spotTimer) spot.innerHTML=''; }, 600);
    // Resume the cycle ON the heats grid. Restarting it from the top would flip to
    // Overall Fastest the instant the spotlight faded, which reads as a glitch.
    if(tvOn&&!CONFIG.qfTvSideBySide&&!tvQfInterval){
      tvQfInterval=setInterval(()=>setTvQf((tvQfCat+1)%2), CONFIG.qfTvCycleMs);
    }
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
      const rowsByHeat={};
      // Heat numbers are counted per run, NOT read off the shared heat column. That
      // one column is aligned to Qualifying 1's rows, so a later run whose drivers
      // sit on different rows inherited the wrong labels from it — Q3's Kurt and
      // Jason share heat 1 in the sheet but came out as heats 1 and 2. Every
      // entriesPerHeat drivers found down a run's own columns make one heat,
      // numbered 1, 2, 3… The column is still read, but only to mark where the
      // grid starts so heading rows above it are skipped.
      const per=h.entriesPerHeat||2, seen=[];
      let started=false;
      for(let r=0;r<rows.length;r++){
        if(String(getVal(r,h.heatCol)||'').trim()) started=true;
        if(!started) continue;
        h.blocks.forEach((b,bi)=>{
          const num=String(getVal(r,b.num)||'').trim(), drv=String(getVal(r,b.driver)||'').trim();
          if(!drv&&!num) return;
          const n=seen[bi]||0; seen[bi]=n+1;
          const heat=String(Math.floor(n/per)+1);
          if(!rowsByHeat[bi]) rowsByHeat[bi]={};
          if(!rowsByHeat[bi][heat]) rowsByHeat[bi][heat]=[];
          rowsByHeat[bi][heat].push({num,driver:drv,ms:parseTime(getVal(r,b.time))});
        });
      }
      h.blocks.forEach((b,bi)=>{ const map=rowsByHeat[bi]||{};
        Object.keys(map).forEach(hn=>runs[bi].heats.push({heat:hn,entries:map[hn]})); });
      // A qualifying run with nothing in the sheet is dropped rather than
      // rendered as an empty column. The LAST run additionally needs at least one
      // real time: a pre-loaded Qualifying 4 entry list would otherwise earn a
      // permanently blank column at an event that only runs three rounds.
      // Keyed off the last entry in runLabels, so a future Qualifying 5 inherits
      // the rule. Q1-Q3 are never time-gated — that would hide a round while it
      // is staging or part-way through its first heat.
      const lastRun=h.runLabels.length-1;
      cb(runs.filter((run,i)=> run.heats.length &&
        (i!==lastRun || run.heats.some(ht=>ht.entries.some(e=>e.ms!=null)))));
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
  function exitTV(keepFs){ tvOn=false; hideHeatSpot(); root.classList.remove('tv'); stopQfCycle(); appliedQfSideBySide=null; list.style.zoom=''; grid.style.zoom=''; clearTimeout(tvHideTimer); tvExit.classList.remove('show'); if(!keepFs){ applyAdsMode(); if(document.fullscreenElement) document.exitFullscreen().catch(()=>{}); } }
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

  /* --- JSONP fetch for a whole class tab ---
     Deliberately sent with NO `range` parameter. The gviz tq endpoint omits every
     row that is blank across the REQUESTED range — not just leading or trailing
     rows, ones in the middle too — and hands back no row numbers, so any code
     that indexes by (sheetRow - rangeStart) shifts by a cumulative amount below
     each dropped row. Asking for the whole tab means a row only disappears if it
     is blank across all ~63 columns, and the helper columns either side of the
     bracket keep every bracket row alive.
     cb(table) rather than cb(rows) so the caller can map columns by the ids gviz
     reports instead of by offset from a range origin. */
  function loadOneRound(gid, cb){
    const base=`https://docs.google.com/spreadsheets/d/${CONFIG.sheetId}/gviz/tq?gid=${gid}&headers=0&tq=select%20*`;
    const cbName='__gvizKo'+(++_gvizSeq);
    const script=document.createElement('script');
    window[cbName]=function(resp){ delete window[cbName]; script.remove(); cb(resp&&resp.status==='ok'?resp.table:null); };
    script.onerror=function(){ delete window[cbName]; script.remove(); cb(null); };
    script.src=base+'&tqx=out:json;responseHandler:'+cbName;
    document.head.appendChild(script);
  }

  const KO_HEADER_RE  = /round\s*of\s*16/i;
  const KO_HEADER_ROW = 5;            // every class tab carries the round header on row 5
  const KO_FINAL_RE   = /^final$/i;   // the sheet's own label above the first finalist

  /* --- One fetch per category covering the whole tab --- */
  function loadOneKnockoutTab(catCfg, cb){
    const ROUND_KEYS=['R16','QF','SF','F'];

    let fetchedRows=[], colIdx={}, rowShift=0;

    const cellText=(row,c)=>{ const cell=row&&row.c&&row.c[c]; if(cell==null) return '';
      return String(cell.f!=null?cell.f:(cell.v!=null?cell.v:'')).trim(); };
    const rowHas=(row,re)=>((row&&row.c)||[]).some((c,i)=>c&&re.test(cellText(row,i)));

    /* 'T14' → the cell's text, corrected for any rows gviz dropped above it. */
    function readCell(ref){
      if(!ref) return ''; const p=cellToIndex(ref); if(!p) return '';
      const c=colIdx[colLetter(p.col)]; if(c==null) return '';
      return cellText(fetchedRows[p.row+rowShift], c);
    }
    /* 'T14' +1 col → 'U14';  'T14' -2 rows → 'T12' */
    function shiftRef(ref,dc,dr){ const p=cellToIndex(ref); if(!p) return '';
      return colLetter(p.col+dc)+(p.row+1+dr); }
    /* Car number, driver (+1 col), time (+2 cols). Slots print the raw cell text,
       so a faulted 0:00:000 is blanked here rather than shown as a real time. */
    function slotAt(ref){ const tm=readCell(shiftRef(ref,2,0));
      return {car:readCell(ref), driver:readCell(shiftRef(ref,1,0)), time:isZeroTime(tm)?'':tm}; }

    loadOneRound(catCfg.gid, table=>{
      fetchedRows=(table&&table.rows)||[];

      // Map column letters from the ids gviz reports (cols[i].id is a real letter
      // A, B, … BK), never from an offset into a requested range.
      colIdx={}; ((table&&table.cols)||[]).forEach((col,i)=>{ if(col&&col.id) colIdx[col.id]=i; });

      // A row blank across the ENTIRE tab is still dropped, so re-find the round
      // header and correct every read by the residual shift.
      const hIdx=fetchedRows.findIndex(row=>rowHas(row,KO_HEADER_RE));
      rowShift = hIdx>=0 ? hIdx-(KO_HEADER_ROW-1) : 0;

      // Misalignment guard. The sheet labels its own Final two rows above the
      // first finalist, one column right of the car number. If that label is in
      // the response but NOT where the config expects it, rows have gone missing
      // and nothing below lines up — better to say so than to render names
      // against the wrong matches. Tabs carrying no labels at all skip the check.
      const finalDef=(catCfg.rounds.F||[])[0];
      if(finalDef && fetchedRows.some(row=>rowHas(row,KO_FINAL_RE))
         && !KO_FINAL_RE.test(readCell(shiftRef(finalDef.slot1,1,-2)))){
        cb({name:catCfg.name, rounds:{}, error:'Bracket rows do not line up with the sheet.'}); return;
      }

      const roundResults={};
      ROUND_KEYS.forEach(rk=>{
        const defs=catCfg.rounds[rk]; if(!Array.isArray(defs)) return;
        roundResults[rk]=defs.map(d=>({match:d.match, slot1:slotAt(d.slot1), slot2:slotAt(d.slot2)}));
      });

      let winnerCar='';
      if(typeof catCfg.rounds.W==='string') winnerCar=readCell(catCfg.rounds.W);

      // Which rounds to show is decided by where the bracket STARTED, not by which
      // cells happen to be filled. Skip rounds before the first one carrying data
      // (an 8-car field genuinely has no Round of 16), then render every round from
      // there on IN FULL, empty slots included — each round column divides its
      // height evenly among its matches, so dropping the ones the sheet has not
      // filled in yet makes the survivors close ranks and stop lining up with the
      // round they feed. Empty slots already render as "TBD".
      const hasData=rk=>(roundResults[rk]||[]).some(m=>m.slot1.car||m.slot1.driver||m.slot2.car||m.slot2.driver);
      const firstLive=ROUND_KEYS.findIndex(hasData);
      const rounds={};
      if(firstLive>=0) ROUND_KEYS.slice(firstLive).forEach(rk=>{ if(roundResults[rk]) rounds[rk]=roundResults[rk]; });

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
    const bempty=msg=>{ bracket.innerHTML='<div class="lb__bempty">'+msg+'</div>'; };
    if(!catData){ bempty('No data yet — check the sheet is shared ("Anyone with link") and published to the web, and that the CONFIG cell references still match the tab layout.'); return; }
    if(catData.error){ bempty(catData.error); return; }
    if(!Object.keys(catData.rounds||{}).length){ bempty('Bracket not started yet.'); return; }
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