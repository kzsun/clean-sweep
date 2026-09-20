import { getWorldPreset, validateWorld, type WorldPoint, type WorldProp } from '@rarefriends/friendsdk/world';

export type WasteCategory = 'recycle' | 'compost' | 'landfill';
export type WasteItem = Readonly<{ id: string; name: string; short: string; symbol: string; category: WasteCategory; position: WorldPoint }>;
export const ROUND_SIZE = 5;
export const ROUNDS_PER_STAGE = 2;
export const station: WorldPoint = [386, 250];
export const salvageSpot: WorldPoint = [205, 150];
export const spawn: WorldPoint = [288, 192];
const positions: readonly WorldPoint[] = [[240,220],[430,290],[292,112],[451,198],[169,235]];
const garden = getWorldPreset('01-garden-oval-complete');
const rows: readonly { name: string; subtitle: string; theme: string; waste: readonly [string,string,WasteCategory][]; props: readonly WorldProp[] }[] = [
  { name: '公園 / Park', subtitle: '小さな公園から、世界をきれいに。 / Start with a small park.', theme: 'park',
    waste: [['can','空き缶 / Can','recycle'],['peel','バナナの皮 / Banana peel','compost'],['cup','紙コップ / Paper cup','landfill'],['bottle','空き瓶 / Glass bottle','recycle'],['wrapper','お菓子の袋 / Snack wrapper','landfill']],
    props: garden.props },
  { name: '川辺 / Riverside', subtitle: '川に流れ出す前に、岸辺のゴミを回収。 / Clean the gravel banks. Use the bridge to cross.', theme: 'river',
    waste: [['fishing','絡まった釣り糸 / Tangled fishing line','landfill'],['can','空き缶 / Can','recycle'],['bag','ビニール袋 / Plastic bag','landfill'],['wrapper','お菓子の袋 / Snack wrapper','landfill'],['pet','ペットボトル / Plastic bottle','recycle']],
    props: [{type:'reeds',x:90,y:275},{type:'reeds',x:140,y:315},{type:'buoy',x:95,y:225},{type:'rock',x:475,y:100},{type:'tree',x:140,y:75},{type:'bench',x:400,y:55}] },
  { name: 'ラクーンシティ / Raccoon City', subtitle: '静まり返った街。危険な廃棄物は専用回収へ。 / Clean the abandoned city. Use special collection for hazardous waste.', theme: 'city',
    waste: [['casing','使用済みの薬莢 / Spent casing','recycle'],['medicine','空の傷薬の瓶 / Empty medicine bottle','recycle'],['pliers','曲がったペンチ / Bent pliers','recycle'],['fuse','壊れたヒューズ / Broken fuse','landfill'],['rotten','腐った肉 / Rotten meat','landfill']],
    props: [{type:'crate',x:110,y:295},{type:'rock',x:490,y:300}] },
  { name: 'グランドライン / Grand Line', subtitle: '漂着物を片づけて、冒険の海を取り戻せ。 / Clear the wreckage and reclaim the sea.', theme: 'ocean',
    waste: [['timber','船の木材 / Ship timber','recycle'],['sea-meat','海王類の肉 / Sea King meat','compost'],['sail','破れた船の帆 / Torn sail','recycle'],['rope','切れたロープ / Broken rope','landfill'],['barrel','壊れた樽 / Broken barrel','recycle']],
    props: [{type:'tree',x:140,y:65},{type:'buoy',x:95,y:230},{type:'buoy',x:490,y:90},{type:'crate',x:115,y:285},{type:'rock',x:470,y:100},{type:'antenna',x:335,y:55,scale:1.4}] },
];
export const STAGES = rows.map((row,index) => ({ ...row,
  waste: row.waste.map(([id,name,category],i): WasteItem => ({id,name,short:name,symbol:'',category,position:positions[i]})),
  world: validateWorld({ ...garden, id:`cleanup-stage-${index+1}`, name:row.name, actors:[], signals:[],
    collision: {blocked: index===1 ? [{x:312,y:0,w:44,h:178},{x:312,y:228,w:44,h:156}] : index===2 ? [{x:93,y:67,w:66,h:35},{x:229,y:42,w:62,h:30},{x:390,y:73,w:88,h:30}] : []},
    props:[...row.props,{type:'terminal',x:station[0],y:station[1],scale:1.45},{type:'crate',x:salvageSpot[0],y:salvageSpot[1],scale:1.35}],
    patches:index===0?garden.patches:index===2?[{x:70,y:260,w:110,h:65,pattern:'hatch'},{x:410,y:45,w:100,h:60,pattern:'grid'}]:[{x:55,y:260,w:135,h:65,pattern:'water'},{x:405,y:40,w:110,h:65,pattern:index===1?'dither':'water'}],
    paths:index===2?[{points:[[65,190],[490,190]],width:45},{points:[[285,55],[285,335]],width:38}]:index===3?[{points:[[90,190],[490,190]],width:50},{points:[[285,90],[285,320]],width:30}]:garden.paths,
  }),
}));
