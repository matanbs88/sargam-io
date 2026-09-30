import { it, expect } from 'vitest';
import { decodeVentusNcw } from './decode-ventus-ncw.mjs';
function fixture(coding, base, values) {
  const width = Math.abs(coding), b = Buffer.alloc(128 + 16 + width * 64);
  Buffer.from('01a89ed631010000', 'hex').copy(b);
  b.writeUInt16LE(1,8); b.writeUInt16LE(24,10); b.writeUInt32LE(44100,12);
  b.writeUInt32LE(4,16); b.writeUInt32LE(120,20); b.writeUInt32LE(128,24); b.writeUInt32LE(b.length-128,28);
  b.writeUInt32LE(b.length-128,124); b.writeUInt32LE(0x3e9a0c16,128); b.writeInt32LE(base,132); b.writeInt16LE(coding,136);
  let cursor=0;
  for (const value of values) for(let bit=0;bit<width;bit++,cursor++) b[144+(cursor>>>3)] |= ((value >>> bit)&1) << (cursor&7);
  return b;
}
it('decodes signed deltas and absolute PCM including a partial final block',()=>{
  expect([...decodeVentusNcw(fixture(4,100,[2,-3,4])).mono].map(n=>n*8388608)).toEqual([100,102,99,103]);
  expect([...decodeVentusNcw(fixture(-4,0,[2,-3,4,-8])).mono].map(n=>n*8388608)).toEqual([2,-3,4,-8]);
});
it('rejects unknown signatures, truncation and unsupported flags',()=>{
  expect(()=>decodeVentusNcw(Buffer.alloc(120))).toThrow();
  expect(()=>decodeVentusNcw(fixture(4,100,[1,2,3]).subarray(0,150))).toThrow();
  const b=fixture(4,100,[1,2,3]); b.writeUInt16LE(2,138);
  expect(()=>decodeVentusNcw(b)).toThrow();
});
