/** Original canvas artwork. Ground anchor matches the interaction position. */
export function drawLitter(id: string, c: CanvasRenderingContext2D, x: number, y: number) {
  c.translate(Math.round(x), Math.round(y));
  c.fillStyle = '#173b1233'; c.beginPath(); c.ellipse(0, 3, 24, 8, 0, 0, Math.PI * 2); c.fill();
  c.strokeStyle = '#203b26'; c.lineWidth = 3; c.lineJoin = 'round';
  const shape = (fill: string, points: number[][]) => {
    c.fillStyle = fill; c.beginPath(); points.forEach(([px, py], i) => i ? c.lineTo(px, py) : c.moveTo(px, py)); c.closePath(); c.fill(); c.stroke();
  };
  const line = (points: number[][]) => { c.beginPath(); points.forEach(([px, py], i) => i ? c.lineTo(px, py) : c.moveTo(px, py)); c.stroke(); };
  switch (id) {
    case 'fishing':
    case 'rope':
      c.strokeStyle=id==='rope'?'#a57844':'#627e97';c.lineWidth=id==='rope'?5:3;
      c.beginPath();c.ellipse(0,-14,20,12,.3,0,Math.PI*2);c.stroke();
      c.beginPath();c.ellipse(-3,-17,14,9,-.5,0,Math.PI*2);c.stroke();line([[15,-18],[26,-27],[28,-14]]);break;
    case 'bag':
      shape('#cbdde2',[[-21,-32],[-8,-34],[-7,-22],[7,-22],[8,-34],[21,-32],[23,-4],[-23,-4]]);
      c.strokeStyle='#7e9cab';line([[-13,-16],[0,-10],[13,-17]]);break;
    case 'pet':
      shape('#a6dcee',[[-6,-44],[6,-44],[6,-34],[14,-27],[14,-3],[-14,-3],[-14,-27],[-6,-34]]);
      c.fillStyle='#4d8de2';c.fillRect(-7,-49,14,7);c.fillStyle='#f2fcf1';c.fillRect(-13,-24,26,13);break;
    case 'casing':
      shape('#d3b15f',[[-23,-15],[15,-26],[22,-13],[-16,-1]]);line([[-17,-17],[-10,-3]]);break;
    case 'medicine':
      shape('#a3c6a9',[[-8,-39],[8,-39],[8,-29],[17,-25],[17,-2],[-17,-2],[-17,-25],[-8,-29]]);
      c.fillStyle='#e4e5d3';c.fillRect(-13,-24,26,16);c.fillStyle='#609269';c.fillRect(-3,-22,6,12);c.fillRect(-7,-18,14,4);break;
    case 'pliers':
      c.strokeStyle='#87959b';c.lineWidth=7;line([[-20,-35],[-8,-20],[15,-2]]);line([[17,-36],[-8,-20],[-19,-6]]);
      c.strokeStyle='#c56353';line([[-4,-16],[15,-2]]);line([[-12,-16],[-19,-6]]);break;
    case 'fuse':
      shape('#d4e4e4',[[-22,-25],[18,-25],[18,-8],[-22,-8]]);
      c.fillStyle='#83969c';c.fillRect(-24,-28,8,23);c.fillRect(15,-28,8,23);line([[-13,-17],[-5,-12],[2,-20],[12,-15]]);break;
    case 'rotten':
    case 'sea-meat':
      shape(id==='rotten'?'#84946a':'#d99085',[[-25,-19],[-16,-32],[10,-32],[26,-20],[18,-3],[-12,0]]);
      c.strokeStyle=id==='rotten'?'#43564c':'#f5dbb1';c.lineWidth=5;line([[-10,-22],[0,-13],[13,-20]]);break;
    case 'timber':
      shape('#be8c58',[[-29,-15],[17,-32],[29,-19],[-17,0]]);line([[-18,-12],[16,-24]]);break;
    case 'sail':
      shape('#f3e6c0',[[-25,-33],[22,-30],[18,-3],[8,-10],[0,-2],[-8,-9],[-26,-3]]);line([[-10,-29],[-7,-13]]);break;
    case 'barrel':
      shape('#b58b59',[[-17,-32],[14,-32],[23,-23],[17,-3],[-14,0],[-23,-13]]);
      c.strokeStyle='#48585d';c.lineWidth=5;line([[-20,-23],[18,-25]]);line([[-18,-8],[18,-12]]);c.lineWidth=2;line([[0,-31],[-4,-17],[5,-4]]);break;
    case 'can':
      shape('#91c9d7', [[-16,-34],[14,-34],[19,-24],[13,-15],[17,-2],[-15,-2],[-19,-13],[-12,-23]]);
      c.fillStyle='#e9f6f8';c.fillRect(-11,-32,21,5);line([[-12,-19],[8,-16],[-5,-11]]);break;
    case 'bottle':
      shape('#62bd80', [[-7,-48],[7,-48],[7,-33],[15,-25],[15,-2],[-15,-2],[-15,-25],[-7,-33]]);
      c.fillStyle='#e7f4d6';c.fillRect(-12,-22,24,13);c.fillStyle='#f2e3a0';c.fillRect(-8,-50,16,6);break;
    case 'peel':
      shape('#efd265', [[-4,-32],[4,-32],[8,-18],[23,-8],[14,-2],[2,-14],[-6,-3],[-23,-7],[-12,-15]]);break;
    case 'cup':
      shape('#f6f0d9', [[-19,-34],[19,-34],[12,-2],[-12,-2]]);
      c.fillStyle='#d87d65';c.fillRect(-12,-23,24,10);line([[-20,-35],[20,-35]]);break;
    case 'wrapper':
      shape('#d697c5', [[-27,-26],[-18,-22],[-10,-27],[17,-24],[25,-28],[24,-4],[16,-8],[-10,-4],[-18,-8],[-26,-3]]);
      c.fillStyle='#f8e7ac';c.fillRect(-10,-21,22,11);break;
    case 'leaves':
      shape('#c59b53', [[-25,-6],[-20,-24],[-4,-20],[1,-4],[-12,1]]);
      shape('#809b50', [[0,-5],[3,-30],[23,-23],[20,-6],[9,2]]);line([[-18,-18],[-7,-5]]);line([[16,-22],[7,-4]]);break;
    case 'paper':
      shape('#f8f4dd', [[-26,-27],[18,-32],[25,-5],[-20,1]]);
      line([[-17,-21],[12,-25]]);line([[-15,-14],[14,-18]]);line([[-13,-7],[5,-9]]);break;
    case 'core':
      shape('#e6816c', [[-16,-31],[0,-27],[16,-31],[10,-21],[8,-12],[17,-3],[0,1],[-17,-3],[-8,-12],[-10,-21]]);
      shape('#f4ebcf', [[-8,-25],[8,-25],[5,-13],[9,-6],[-9,-6],[-5,-13]]);line([[0,-28],[3,-38]]);break;
  }
}
