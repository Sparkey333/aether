// Dependency-free GLADE app icon generator.
// Draws a sprout-in-a-glade (squircle) at high res, then emits the PNG sizes
// plus a real .icns (macOS) and .ico (Windows) — no native image libs needed.
import { mkdirSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import zlib from "node:zlib";

const OUT = join(dirname(fileURLToPath(import.meta.url)), "..", "src-tauri", "icons");
mkdirSync(OUT, { recursive: true });

/* ----------------------------- the artwork ------------------------------ */
const clamp = (v,a,b)=> v<a?a:(v>b?b:v);
function lerp(a,b,t){ return [a[0]+(b[0]-a[0])*t, a[1]+(b[1]-a[1])*t, a[2]+(b[2]-a[2])*t]; }
function over(dst, src){ // straight-alpha composite, src over dst; colors 0..255, a 0..1
  const a = src[3] + dst[3]*(1-src[3]); if(a<=0) return [0,0,0,0];
  const f=(i)=> (src[i]*src[3] + dst[i]*dst[3]*(1-src[3]))/a;
  return [f(0),f(1),f(2),a];
}
function inRoundBox(px,py,hw,hh,r){ // signed-distance rounded box, inside if <0
  const qx=Math.abs(px)-hw+r, qy=Math.abs(py)-hh+r;
  const ax=Math.max(qx,0), ay=Math.max(qy,0);
  return Math.hypot(ax,ay) + Math.min(Math.max(qx,qy),0) - r;
}
function inEll(u,v,cx,cy,rx,ry,ang){ const dx=u-cx,dy=v-cy,c=Math.cos(-ang),s=Math.sin(-ang);
  const x=dx*c-dy*s, y=dx*s+dy*c; return (x*x)/(rx*rx)+(y*y)/(ry*ry); }

// sample the scene at normalized (u,v) in [0,1]; returns [r,g,b,a]
function sample(u,v){
  let c=[0,0,0,0];
  // squircle background with a soft vertical garden gradient + center glow
  const d = inRoundBox(u-0.5, v-0.5, 0.5-0.045, 0.5-0.045, 0.20);
  if(d < 0){
    let bg = lerp([22,38,59],[31,61,52], clamp(v*1.05,0,1));     // night indigo -> teal-green
    const gl = clamp(1 - Math.hypot(u-0.5,v-0.42)/0.5, 0, 1);
    bg = lerp(bg, [60,96,104], gl*0.35);                          // gentle warm-cool glow
    c = [bg[0],bg[1],bg[2],1];
  } else return c; // outside the squircle stays transparent
  // mound
  if(inEll(u,v,0.5,0.74,0.17,0.05,0) <= 1) c = over(c,[18,42,28,1]);
  // stem
  if(Math.abs(u-0.5)<0.030 && v>0.50 && v<0.735) c = over(c,[95,161,104,1]);
  // leaves
  if(inEll(u,v,0.40,0.57,0.12,0.05,-0.6) <= 1) c = over(c,[134,217,142,1]);
  if(inEll(u,v,0.60,0.55,0.12,0.05, 0.6) <= 1) c = over(c,[155,227,162,1]);
  // the Mote: glow halo + warm core (homage to the emotion-orb)
  const md = Math.hypot(u-0.5, v-0.37);
  const halo = clamp(1 - md/0.17, 0, 1); if(halo>0) c = over(c,[255,231,168, halo*halo*0.55]);
  if(md < 0.050) c = over(c,[255,247,205,1]);
  if(md < 0.022) c = over(c,[255,255,255,1]);
  // two tiny sparkles
  if(Math.hypot(u-0.63,v-0.30)<0.013) c = over(c,[255,243,205,1]);
  if(Math.hypot(u-0.39,v-0.33)<0.011) c = over(c,[255,243,205,1]);
  return c;
}

/* --------------------- render master + downsample ----------------------- */
function renderMaster(M, SS){
  const buf = Buffer.alloc(M*M*4);
  for(let py=0; py<M; py++){
    for(let px=0; px<M; px++){
      let R=0,G=0,B=0,A=0;
      for(let sy=0; sy<SS; sy++) for(let sx=0; sx<SS; sx++){
        const u=(px+(sx+0.5)/SS)/M, v=(py+(sy+0.5)/SS)/M, c=sample(u,v);
        R+=c[0]*c[3]; G+=c[1]*c[3]; B+=c[2]*c[3]; A+=c[3];
      }
      const n=SS*SS, o=(py*M+px)*4;
      buf[o+3]=Math.round(clamp(A/n,0,1)*255);
      if(A>0){ buf[o]=Math.round(clamp(R/A,0,255)); buf[o+1]=Math.round(clamp(G/A,0,255)); buf[o+2]=Math.round(clamp(B/A,0,255)); }
    }
  }
  return buf;
}
function downsample(master, M, n){
  if(n===M) return master;
  const out=Buffer.alloc(n*n*4), ratio=M/n;
  for(let y=0;y<n;y++) for(let x=0;x<n;x++){
    let pr=0,pg=0,pb=0,A=0,cnt=0;
    const x0=Math.floor(x*ratio),x1=Math.max(x0+1,Math.floor((x+1)*ratio));
    const y0=Math.floor(y*ratio),y1=Math.max(y0+1,Math.floor((y+1)*ratio));
    for(let yy=y0;yy<y1;yy++) for(let xx=x0;xx<x1;xx++){ const i=(yy*M+xx)*4, a=master[i+3]/255;
      pr+=master[i]*a; pg+=master[i+1]*a; pb+=master[i+2]*a; A+=a; cnt++; }
    const o=(y*n+x)*4, aa=A/cnt;
    out[o+3]=Math.round(clamp(aa,0,1)*255);
    if(A>0){ out[o]=Math.round(clamp(pr/A,0,255)); out[o+1]=Math.round(clamp(pg/A,0,255)); out[o+2]=Math.round(clamp(pb/A,0,255)); }
  }
  return out;
}

/* ------------------------------ encoders -------------------------------- */
function crc32(buf){ let c=~0; for(let i=0;i<buf.length;i++){ c^=buf[i]; for(let k=0;k<8;k++) c=(c>>>1)^(0xEDB88320 & -(c&1)); } return (~c)>>>0; }
function chunk(type,data){ const len=Buffer.alloc(4); len.writeUInt32BE(data.length,0);
  const t=Buffer.from(type,"latin1"); const crc=Buffer.alloc(4); crc.writeUInt32BE(crc32(Buffer.concat([t,data])),0);
  return Buffer.concat([len,t,data,crc]); }
function encodePNG(rgba,w,h){
  const sig=Buffer.from([137,80,78,71,13,10,26,10]);
  const ihdr=Buffer.alloc(13); ihdr.writeUInt32BE(w,0); ihdr.writeUInt32BE(h,4); ihdr[8]=8; ihdr[9]=6;
  const stride=w*4+1, raw=Buffer.alloc(stride*h);
  for(let y=0;y<h;y++){ raw[y*stride]=0; rgba.copy(raw, y*stride+1, y*w*4, y*w*4+w*4); }
  const idat=zlib.deflateSync(raw,{level:9});
  return Buffer.concat([sig, chunk("IHDR",ihdr), chunk("IDAT",idat), chunk("IEND",Buffer.alloc(0))]);
}
function buildICNS(entries){ // [{type, png}]
  let body=Buffer.alloc(0);
  for(const e of entries){ const h=Buffer.alloc(8); h.write(e.type,0,"latin1"); h.writeUInt32BE(e.png.length+8,4); body=Buffer.concat([body,h,e.png]); }
  const head=Buffer.alloc(8); head.write("icns",0,"latin1"); head.writeUInt32BE(body.length+8,4);
  return Buffer.concat([head,body]);
}
function buildICO(images){ // [{size, png}]
  const count=images.length, header=Buffer.alloc(6); header.writeUInt16LE(1,2); header.writeUInt16LE(count,4);
  let offset=6+count*16; const dirs=[]; let data=Buffer.alloc(0);
  for(const im of images){ const d=Buffer.alloc(16); d[0]=im.size>=256?0:im.size; d[1]=im.size>=256?0:im.size;
    d.writeUInt16LE(1,4); d.writeUInt16LE(32,6); d.writeUInt32LE(im.png.length,8); d.writeUInt32LE(offset,12);
    dirs.push(d); data=Buffer.concat([data,im.png]); offset+=im.png.length; }
  return Buffer.concat([header,...dirs,data]);
}

/* -------------------------------- build --------------------------------- */
const M=1024, master=renderMaster(M, 4);
const png={}; for(const s of [16,32,48,64,128,256,512,1024]) png[s]=encodePNG(downsample(master,M,s),s,s);

writeFileSync(join(OUT,"32x32.png"),      png[32]);
writeFileSync(join(OUT,"128x128.png"),    png[128]);
writeFileSync(join(OUT,"128x128@2x.png"), png[256]);
writeFileSync(join(OUT,"icon.png"),       png[512]);

writeFileSync(join(OUT,"icon.icns"), buildICNS([
  { type:"ic11", png:png[32] },   // 16@2x
  { type:"ic12", png:png[64] },   // 32@2x
  { type:"ic07", png:png[128] },
  { type:"ic08", png:png[256] },
  { type:"ic09", png:png[512] },
  { type:"ic10", png:png[1024] }, // 512@2x
]));
writeFileSync(join(OUT,"icon.ico"), buildICO([16,32,48,64,128,256].map(s=>({size:s,png:png[s]}))));

console.log("wrote GLADE icons to", OUT);
