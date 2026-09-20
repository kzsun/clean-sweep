import { project, type WorldConfig } from '@rarefriends/friendsdk/world';

/** Original scenery, projected with the same camera as movement and litter. */
export function riverGround(c: CanvasRenderingContext2D, world: WorldConfig) {
  c.beginPath();
  for (const poly of world.geometry.polygons) {
    poly.forEach((p,i) => {const [x,y]=project(...p); i ? c.lineTo(x,y) : c.moveTo(x,y);}); c.closePath();
  }
  c.clip();
  const rect=(x:number,y:number,w:number,h:number,color:string)=>{
    c.fillStyle=color;c.beginPath();[[x,y],[x+w,y],[x+w,y+h],[x,y+h]].forEach(([a,b],i)=>{const p=project(a,b);i?c.lineTo(...p):c.moveTo(...p);});c.closePath();c.fill();
  };
  rect(289,0,91,384,'#b8b6a4');
  for(let i=0;i<420;i++){
    const x=289+(i*37%91),y=i*53%384;
    rect(x,y,2+i%3,2,['#777e79','#ded7c2','#989f98'][i%3]);
  }
  rect(312,0,44,384,'#267da5');rect(319,0,29,384,'#45b1ce');
  for(let y=5;y<384;y+=13){rect(325+(y%11),y,12,1.5,'#b1eaf1');}
  // A real crossing: the only passable gap in the river collision banks.
  rect(290,178,87,50,'#77563b');
  for(let x=292;x<377;x+=7)rect(x,180,5,46,'#c5a375');
  rect(290,178,87,3,'#382d24');rect(290,225,87,3,'#382d24');
}

function building(kind:'police'|'apartments'|'train',c:CanvasRenderingContext2D,x:number,y:number){
  c.translate(x,y);c.lineWidth=3;c.strokeStyle='#263335';
  const box=(x:number,y:number,w:number,h:number,color:string)=>{c.fillStyle=color;c.fillRect(x,y,w,h);c.strokeRect(x,y,w,h);};
  const label=(text:string,y:number)=>{c.font='bold 12px sans-serif';c.textAlign='center';c.fillStyle='#f1eee0';c.fillText(text,0,y);};
  if(kind==='train'){
    box(-90,-42,180,39,'#9bacb2');box(-90,-14,180,12,'#467a8c');
    for(let a=-77;a<80;a+=31)box(a,-38,22,17,'#253e49');
    for(const a of [-65,-35,35,65]){c.fillStyle='#182326';c.beginPath();c.arc(a,0,9,0,Math.PI*2);c.fill();}
    box(-67,-65,134,19,'#303e44');label('横転した電車 / DERAILED',-51);return;
  }
  const h=kind==='police'?95:145;
  box(-64,-h,128,h,'#717f80');box(64,-h+13,22,h-13,'#424f52');
  for(let row=0;row<(kind==='police'?2:4);row++)for(let col=0;col<4;col++)box(-53+col*29,-h+14+row*27,17,18,kind==='police'?'#91cbd4':'#302e32');
  box(-14,-30,28,30,'#293d45');box(-70,-h-23,140,25,kind==='police'?'#234d74':'#503e3c');
  label(kind==='police'?'警察署 / POLICE':'マンション / APARTMENTS',-h-7);
  if(kind==='apartments'){
    for(const [a,b] of [[-44,-36],[15,-66],[43,-111],[-25,-141]]){
      c.fillStyle='#e55426';c.beginPath();c.moveTo(a-17,b+8);c.lineTo(a-12,b-18);c.lineTo(a-3,b-9);c.lineTo(a+4,b-44);c.lineTo(a+18,b-9);c.lineTo(a+16,b+8);c.closePath();c.fill();
      c.fillStyle='#ffd868';c.beginPath();c.moveTo(a-7,b+8);c.lineTo(a+3,b-20);c.lineTo(a+10,b+8);c.fill();
    }
    for(let i=0;i<4;i++){c.fillStyle='#45434999';c.beginPath();c.ellipse(14+i*12,-180-i*18,18+i*4,14+i*3,0,0,Math.PI*2);c.fill();}
  }
}
export const cityObjects = [
  {id:'police',position:[126,95] as const,draw:(c:CanvasRenderingContext2D,x:number,y:number)=>building('police',c,x,y)},
  {id:'apartments',position:[260,65] as const,draw:(c:CanvasRenderingContext2D,x:number,y:number)=>building('apartments',c,x,y)},
  {id:'train',position:[434,95] as const,draw:(c:CanvasRenderingContext2D,x:number,y:number)=>building('train',c,x,y)},
];
