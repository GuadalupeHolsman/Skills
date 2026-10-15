# assemble film.js from film.tpl.js + the shared cube code of ../loomlock-reel-3d/film.js
src = open('../loomlock-reel-3d/film.js').read()
def between(a, b):
    i = src.index(a); return src[i:src.index(b)]
parts = {
  '/*HELPERS*/': between("  // ---------- small helpers ----------", "  // ---------- the phone screen (a 2D canvas → texture) ----------"),
  '/*SHAPES*/': between("  // ---------- shapes the cubes can become ----------", "  // ---------- cube state at t ----------"),
  '/*MORPH*/': between("  function morph(A, B, t, t0, dur, burst, theta, i, out) {", "  function cubeJob(t) {"),
}
tpl = open('film.tpl.js').read()
for k, v in parts.items(): tpl = tpl.replace(k, v)
open('film.js', 'w').write(tpl)
print('film.js built')
