import numpy as np, wave, sys
sr=44100; dur=15.0; n=int(sr*dur); out=np.zeros(n); np.random.seed(3)
T=lambda d: np.arange(int(sr*d))/sr
def add(sig,at,g=1.0):
    i=int(at*sr); j=min(n,i+len(sig)); 
    if i<n: out[i:j]+=g*sig[:j-i]
def ping(f):
    x=T(.18); return (np.sin(2*np.pi*f*x)+.4*np.sin(2*np.pi*f*2*x))*np.exp(-x*22)*np.minimum(1,x*400)
def kick(g=1):
    x=T(.4); f=48+110*np.exp(-x*28); return np.sin(2*np.pi*np.cumsum(f)/sr)*np.exp(-x*7)*g
def hat():
    x=T(.05); return np.random.randn(len(x))*np.exp(-x*90)*.25
# ACTO 1 · RUIDO 0–4.6: pings que se apilan y aceleran + ruido creciente
t=0.05; k=0
while t<4.55:
    f=np.random.choice([880,988,1175,1319,1568,1760,2093]); add(ping(f),t,.35)
    if k%2==0: add(hat(),t,.7)
    t+=max(.045,.32*(0.93**k)); k+=1
for b in np.arange(0,4.6,.25): add(kick(.8),b)
x=T(4.55); add(np.random.randn(len(x))*(x/4.55)**3*.35,0)
# silencio 4.6–5.9 (nada)
# ACTO 2 · TAP seco único
x=T(.25); tap=np.random.randn(len(x))*np.exp(-x*400)*.9 + np.sin(2*np.pi*90*x)*np.exp(-x*25)*.9
add(tap,5.9)
# ambiente: pad suave 6.2–9.4
def pad(freqs,d,g=.08):
    x=T(d); s=sum(np.sin(2*np.pi*f*x)+.3*np.sin(2*np.pi*2.003*f*x) for f in freqs)
    env=np.minimum(1,x/1.2)*np.minimum(1,(d-x)/.8); return s*env*g
add(pad([220,277.18,329.63],3.4,.05),6.1)
# ACTO 3 · groove desde 9.4
bpm=110; spb=60/bpm; start=9.4
chords=[[220,261.63,329.63],[196,246.94,293.66],[174.61,220,261.63],[196,246.94,329.63]]
bass=[55,49,43.65,49]
b=0
while start+b*spb<14.6:
    at=start+b*spb; bar=(b//4)%4
    add(kick(.9),at); add(hat(),at+spb/2,.8)
    if b%2==1:
        x=T(.18); add(np.random.randn(len(x))*np.exp(-x*25)*.35,at)
    if b%4==0: add(pad(chords[bar],spb*4,.06),at)
    x=T(spb*.9); add(np.sin(2*np.pi*bass[bar]*x)*np.exp(-x*2.5)*.5,at+(spb/2 if b%2 else 0))
    b+=1
fade=np.ones(n); m=int(sr*.9); fade[-m:]=np.linspace(1,0,m); out*=fade
out=np.tanh(out*1.2); out=out/np.max(np.abs(out))*.9
w=wave.open(sys.argv[1],'wb'); w.setnchannels(1); w.setsampwidth(2); w.setframerate(sr)
w.writeframes((out*32767).astype(np.int16).tobytes()); w.close()
