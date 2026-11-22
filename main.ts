// tiny-stack-vm-01 entry: stack VM matching generator/subject/vm.mjs (check order, traps, wrapping i32).
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
const run = (p, q) => {
  const n = p.length, D = new Int32Array(256), C = new Int32Array(64), M = new Int32Array(256), O = new Uint8Array(65536);
  let s = 0, c = 0, pc = 0, t = 0, i = 0, o = 0;
  const F = (x) => ({ out: O.slice(0, o), code: x });
  for (;;) {
    if (t == 1e6) return F(10);
    if (pc < 0 || pc >= n) return F(9);
    const op = p[pc];
    if (!(op < 8 || (op > 15 && op < 35 && op != 31) || (op > 47 && op < 53) || op == 64 || op == 65 || (op > 79 && op < 84))) return F(5);
    const im = op == 1 ? 1 : op == 2 ? 4 : op > 47 && op < 52 ? 2 : 0;
    if (pc + im >= n) return F(9);
    const pp = op == 7 ? 3 : op == 3 || op == 4 || op == 23 || op == 27 || op == 49 || op == 50 || op == 64 || op == 80 || op == 81 || op == 83 ? 1 : op == 5 || op == 6 || op == 65 || (op > 15 && op < 35) ? 2 : 0;
    if (s < pp) return F(2);
    if (s == 256 && (op == 1 || op == 2 || op == 4 || op == 6 || op == 82)) return F(3);
    t++;
    pc += 1 + im;
    switch (op) {
      case 0: return F(0);
      case 1: D[s++] = (p[pc - 1] << 24) >> 24; break;
      case 2: D[s++] = p[pc - 4] | p[pc - 3] << 8 | p[pc - 2] << 16 | p[pc - 1] << 24; break;
      case 3: s--; break;
      case 4: D[s] = D[s - 1]; s++; break;
      case 5: { const a = D[s - 1]; D[s - 1] = D[s - 2]; D[s - 2] = a; break; }
      case 6: D[s] = D[s - 2]; s++; break;
      case 7: { const a = D[s - 3]; D[s - 3] = D[s - 2]; D[s - 2] = D[s - 1]; D[s - 1] = a; break; }
      case 23: D[s - 1] = -D[s - 1]; break;
      case 27: D[s - 1] = ~D[s - 1]; break;
      case 48: case 49: case 50: { const r = ((p[pc - 2] | p[pc - 1] << 8) << 16) >> 16; if (op == 48 || (op == 49) === (D[--s] == 0)) pc += r; break; }
      case 51: if (c == 64) return F(7); C[c++] = pc; pc = p[pc - 2] | p[pc - 1] << 8; break;
      case 52: if (!c) return F(8); pc = C[--c]; break;
      case 64: { const a = D[s - 1]; if (a < 0 || a > 255) return F(6); D[s - 1] = M[a]; break; }
      case 65: { const a = D[s - 1]; if (a < 0 || a > 255) return F(6); M[a] = D[s - 2]; s -= 2; break; }
      case 80: { const v = String(D[s - 1]); if (o + v.length > 65536) return F(11); s--; for (let j = 0; j < v.length;) O[o++] = v.charCodeAt(j++); break; }
      case 81: if (o == 65536) return F(11); O[o++] = D[--s] & 255; break;
      case 82: D[s++] = i < q.length ? q[i++] : -1; break;
      case 83: return F(D[--s] & 255);
      default: {
        const b = D[s - 1], a = D[s - 2];
        let r;
        if (op == 16) r = a + b;
        else if (op == 17) r = a - b;
        else if (op == 18) r = Math.imul(a, b);
        else if (op < 23) { if (!b) return F(4); r = op == 19 ? (a / b) | 0 : op == 20 ? (a % b) | 0 : op == 21 ? ((a >>> 0) / (b >>> 0)) | 0 : ((a >>> 0) % (b >>> 0)) | 0; }
        else if (op == 24) r = a & b;
        else if (op == 25) r = a | b;
        else if (op == 26) r = a ^ b;
        else if (op == 28) r = a << (b & 31);
        else if (op == 29) r = a >> (b & 31);
        else if (op == 30) r = a >>> (b & 31);
        else if (op == 32) r = a == b ? 1 : 0;
        else if (op == 33) r = a < b ? 1 : 0;
        else r = (a >>> 0) < (b >>> 0) ? 1 : 0;
        D[s - 2] = r;
        s--;
      }
    }
  }
};
const I = process.env.MAKEFUN_INPUT_DIR ?? '/input', W = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
for (const id of readdirSync(I).sort()) {
  const r = run(new Uint8Array(readFileSync(join(I, id, 'program.bin'))), new Uint8Array(readFileSync(join(I, id, 'input.bin'))));
  mkdirSync(join(W, id), { recursive: true });
  writeFileSync(join(W, id, 'stdout.bin'), r.out);
  writeFileSync(join(W, id, 'exit.txt'), r.code + '\n');
}
