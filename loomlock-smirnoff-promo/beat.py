import numpy as np, wave, sys
sr=44100; dur=15.0; bpm=120; spb=60/bpm
n=int(sr*dur); out=np.zeros(n)
t=lambda d: np.arange(int(sr*d))/sr
def add(sig,at,g=1.0):
    i=int(at*sr); j=min(n,i+len(sig)); out[i:j]+=g*sig[:j-i]
def kick():
    x=t(.35); f=50+120*np.exp(-x*30); return np.sin(2*np.pi*np.cumsum(f)/sr)*np.exp(-x*9)
def hat():
    x=t(.06); return np.random.randn(len(x))*np.exp(-x*70)*.3
def snare():
    x=t(.2); return (np.random.randn(len(x))*.6+np.sin(2*np.pi*190*x)*.5)*np.exp(-x*18)
def bass(freq,d):
    x=t(d); s=np.sign(np.sin(2*np.pi*freq*x))*.5+np.sin(2*np.pi*freq*x)*.5
    return s*np.minimum(1,x*80)*np.exp(-x*3)*.35
def riser(d):
    x=t(d); return np.random.randn(len(x))*(x/d)**2*.35
np.random.seed(7)
notes=[55,55,65.41,49]  # A, A, C, G (frigio-ish, suena latino/oscuro)
beats=int(dur/spb)
for b in range(beats):
    at=b*spb
    if at<0.5 or (at>=14.5): continue
    add(kick(),at)
    if b%2==1: add(snare(),at,.5)
    add(hat(),at+spb/2); 
    if at>3: add(hat(),at+spb/4,.5); add(hat(),at+3*spb/4,.5)
    bar=int(at//2)%4
    add(bass(notes[bar],spb*.9),at+ (spb/2 if b%2 else 0))
# risers antes de cortes, impactos en cortes
for c in [3.5,7.2,10.6]: add(riser(1.0),c-1.0)
for c in [0.5,3.5,7.2,10.6]: add(kick(),c,1.3)
# cola final
x=t(1.5); add(np.sin(2*np.pi*55*x)*np.exp(-x*2)*.6,13.5)
fade=np.ones(n); k=int(sr*.8); fade[-k:]=np.linspace(1,0,k); out*=fade
out=out/np.max(np.abs(out))*.85
w=wave.open(sys.argv[1],'wb'); w.setnchannels(1); w.setsampwidth(2); w.setframerate(sr)
w.writeframes((out*32767).astype(np.int16).tobytes()); w.close()
