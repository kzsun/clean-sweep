import { useEffect, useRef, useState } from 'react';
import { createFriendReader, spriteFrame, type GenerationSprites } from '@rarefriends/friendsdk/sprites';

export const ENDING_DURATION = 11000;
export function endingPhase(elapsed: number) {
  return elapsed < 5000 ? 'home' : elapsed < ENDING_DURATION ? 'bedroom' : 'sleep';
}

/** A monochrome homecoming. The selected Friend uses its original, unmodified pixels. */
export function HomeEnding({ friendId, paused, reducedMotion, score, onReplay }: {
  friendId: bigint; paused: boolean; reducedMotion: boolean; score: number; onReplay: () => void;
}) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const live = useRef({ paused, reducedMotion }); live.current = { paused, reducedMotion };
  const elapsed = useRef(0);
  const [phase, setPhase] = useState('home');
  const [error, setError] = useState('');
  const [ready, setReady] = useState(false);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let cancelled = false, frame = 0, previous = 0;
    elapsed.current = 0; setReady(false); setError(''); setPhase('home');
    createFriendReader().read(friendId).then(sprites => {
      if (cancelled) return;
      setReady(true);
      const render = (now: number) => {
        if (cancelled) return;
        if (!live.current.paused && !document.hidden) {
          elapsed.current = live.current.reducedMotion ? ENDING_DURATION : Math.min(ENDING_DURATION, elapsed.current + (previous ? Math.min(now - previous, 100) : 0));
        }
        previous = now;
        const state = endingPhase(elapsed.current); setPhase(old => old === state ? old : state);
        const c = canvas.current?.getContext('2d');
        if (c) drawEnding(c, sprites, elapsed.current);
        frame = requestAnimationFrame(render);
      };
      frame = requestAnimationFrame(render);
    }).catch(() => { if (!cancelled) setError('絵を読み込めませんでした / Artwork could not load.'); });
    return () => { cancelled = true; cancelAnimationFrame(frame); };
  }, [friendId, attempt]);
  return <section className="clean-ending" aria-label="帰宅 / Homecoming">
    <canvas ref={canvas} width={960} height={640} aria-label={phase === 'home' ? 'Your Rare Friend walks home to a black-and-white house.' : 'Your Rare Friend rests in bed in a black-and-white room.'} />
    <div className="clean-ending-caption" aria-live="polite">
      <small>CLEAN SWEEP · {phase === 'sleep' ? 'THE END' : 'HOMECOMING'}</small>
      <h2>{phase === 'home' ? 'ただいま。 / Home, sweet home.' : phase === 'bedroom' ? '今日はよく働いた。 / A good day’s work.' : 'おやすみ、Rare Friend。 / Good night, Rare Friend.'}</h2>
      <p>{phase === 'sleep' ? `世界は少しきれいになった。 / You left the world a little cleaner. · Score ${score.toLocaleString()}` : '4つの世界をきれいにして、いつもの白黒の家へ。 / Four worlds cleaned. Back to a quiet black-and-white home.'}</p>
      {error ? <><p role="alert">{error}</p><button disabled={paused} onClick={() => setAttempt(n => n + 1)}>再読み込み / Retry</button></> : !ready ? <p role="status">読み込み中 / Loading…</p> : phase === 'sleep' ? <button disabled={paused} onClick={onReplay}>もう一度遊ぶ / Play again</button> : <button disabled={paused} onClick={() => { elapsed.current = ENDING_DURATION; }}>おやすみへ / Skip to good night</button>}
    </div>
  </section>;
}

export function drawEnding(c: CanvasRenderingContext2D, sprites: GenerationSprites, elapsed: number) {
  const phase = endingPhase(elapsed);
  c.clearRect(0,0,960,640); c.fillStyle='#fff'; c.fillRect(0,0,960,640);
  c.strokeStyle='#171717'; c.lineWidth=3; c.imageSmoothingEnabled=false;
  const box=(x:number,y:number,w:number,h:number,fill='#fff')=>{c.fillStyle=fill;c.fillRect(x,y,w,h);c.strokeRect(x,y,w,h);};
  const line=(points:number[][])=>{c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.stroke();};
  const friend=(x:number,y:number,walking:boolean)=>{
    const rows=spriteFrame(sprites,walking?'right':'down',walking,walking?Math.floor(elapsed/110)%8:0,'right').frame.rows;
    const left=Math.round(x)-40,top=Math.round(y)-75;
    c.save();c.beginPath();c.rect(left,top,80,80);c.clip();
    c.fillStyle='#fff';rows.forEach((row,py)=>[...row].forEach((p,px)=>{if(p==='#')c.fillRect(left+px*5-5,top+py*5-5,15,15);}));
    c.fillStyle='#000';rows.forEach((row,py)=>[...row].forEach((p,px)=>{if(p==='#')c.fillRect(left+px*5,top+py*5,5,5);}));c.restore();
  };
  if(phase==='home'){
    line([[50,417],[910,417]]);box(462,229,284,186);box(746,229,70,186,'#ddd');
    c.fillStyle='#fff';c.beginPath();c.moveTo(425,235);c.lineTo(604,119);c.lineTo(785,235);c.closePath();c.fill();c.stroke();
    line([[604,119],[675,119],[818,229],[785,235]]);box(659,130,29,48);
    box(565,317,65,98,'#222');box(481,272,59,49);box(665,272,59,49);line([[510,272],[510,321]]);line([[694,272],[694,321]]);
    c.fillStyle='#fff';c.fillRect(615,365,5,5);
    c.fillStyle='#111';c.font='bold 16px monospace';c.textAlign='center';c.fillText('RARE FRIENDS',605,259);
    for(let x=66;x<375;x+=37){line([[x,401],[x+6,390],[x+10,402]]);}
    friend(105+Math.min(elapsed/5000,1)*491,416,true);
  }else{
    line([[92,400],[865,400],[921,449]]);line([[92,153],[92,400],[40,449]]);
    box(147,154,151,139);line([[222,154],[222,293]]);line([[147,224],[298,224]]);
    c.fillStyle='#222';c.beginPath();c.arc(259,187,20,0,Math.PI*2);c.fill();c.fillStyle='#fff';c.beginPath();c.arc(250,180,19,0,Math.PI*2);c.fill();
    box(680,324,85,91);box(700,276,44,48);line([[721,276],[721,262]]);
    box(466,296,166,138,'#ddd');box(455,414,16,33,'#222');box(626,414,16,33,'#222');box(478,302,143,114);box(495,306,108,31);
    if(phase==='bedroom' && elapsed<8500){friend(220+(elapsed-5000)/3500*330,418,true);}else{
      friend(548,379,false);
    }
    // The quilt is scenery in front of the unaltered sprite, never a new character frame.
    box(478,361,143,58,'#e6e6e6');line([[478,372],[621,372]]);
    if(phase==='sleep'){c.fillStyle='#111';c.font='bold 23px monospace';c.textAlign='left';c.fillText('z',611,306);c.fillText('Z',638,279);c.fillText('Z',668,248);}
  }
}
