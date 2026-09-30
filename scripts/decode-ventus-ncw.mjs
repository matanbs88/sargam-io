/** Restricted NCW PCM decoder. Format references:
 * https://github.com/monomadic/ncw and https://github.com/manzing/conNCW-NG
 * Only recognized, mono integer PCM files are accepted; never bypass signatures.
 * Source files are never modified. */
export function decodeVentusNcw(b) {
  if (b.length < 120 || !['01a89ed631010000', '01a89ed630010000'].includes(b.subarray(0, 8).toString('hex'))) throw new Error('Unsupported NCW signature');
  const channels = b.readUInt16LE(8), bits = b.readUInt16LE(10), rate = b.readUInt32LE(12);
  const count = b.readUInt32LE(16), table = b.readUInt32LE(20), data = b.readUInt32LE(24), size = b.readUInt32LE(28);
  const blocks = Math.ceil(count / 512);
  if (channels !== 1 || ![16, 24].includes(bits) || rate < 8000 || rate > 192000 || !count || count > rate * 120 || table < 120 || table + (blocks + 1) * 4 > data || data + size > b.length) throw new Error('Unsupported NCW layout');
  const mono = new Float32Array(count);
  for (let block = 0; block < blocks; block++) {
    const pos = data + b.readUInt32LE(table + block * 4), end = data + b.readUInt32LE(table + (block + 1) * 4);
    if (pos < data || end > data + size || end < pos + 16 || b.readUInt32LE(pos) !== 0x3e9a0c16) throw new Error('Invalid NCW block');
    const coding = b.readInt16LE(pos + 8), width = Math.abs(coding) || bits;
    if (width > 24 || b.readUInt16LE(pos + 10) !== 0 || pos + 16 + width * 64 > end) throw new Error('Unsupported NCW encoding');
    let cursor = 0, value = b.readInt32LE(pos + 4);
    const signed = () => {
      let raw = 0;
      for (let bit = 0; bit < width; bit++, cursor++) raw += ((b[pos + 16 + (cursor >>> 3)] >>> (cursor & 7)) & 1) * 2 ** bit;
      return raw >= 2 ** (width - 1) ? raw - 2 ** width : raw;
    };
    for (let i = 0; i < Math.min(512, count - block * 512); i++) {
      value = coding > 0 ? i === 0 ? value : value + signed() : signed();
      if (value < -(2 ** (bits - 1)) || value >= 2 ** (bits - 1)) throw new Error('NCW sample overflow');
      mono[block * 512 + i] = value / 2 ** (bits - 1);
    }
  }
  return { mono, rate, duration: count / rate };
}
