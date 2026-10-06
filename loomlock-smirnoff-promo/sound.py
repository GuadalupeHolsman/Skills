import numpy as np, wave, sys
variant, path = sys.argv[1], sys.argv[2]
DUR={'invite':20,'noise':15,'spicy':10}[variant]
sr=44100; n=int(sr*DUR); out=np.zeros(n); np.random.seed(3)
T=lambda d: np.arange(int(sr*d))/sr
def add(sig,at,g=1.0):
    i=int(at*sr); j=min(n,i+len(sig))
    if i<n: out[i:j]+=g*sig[:j-i]
def ping(f): x=T(.18); return (np.sin(2*np.pi*f*x)+.4*np.sin(4*np.pi*f*x))*np.exp(-x*22)*np.minimum(1,x*400)
def kick(g=1): x=T(.4); f=48+110*np.exp(-x*28); return np.sin(2*np.pi*np.cumsum(f)/sr)*np.exp(-x*7)*g
def hat(): x=T(.05); return np.random.randn(len(x))*np.exp(-x*90)*.25
def snare(): x=T(.18); return np.random.randn(len(x))*np.exp(-x*25)*.35
def pad(freqs,d,g=.08):
    x=T(d); s=sum(np.sin(2*np.pi*f*x)+.3*np.sin(2*np.pi*2.003*f*x) for f in freqs)
    return s*np.minimum(1,x/1.2)*np.minimum(1,(d-x)/.8)*g
def tap(at):
    x=T(.25); add(np.random.randn(len(x))*np.exp(-x*400)*.9+np.sin(2*np.pi*90*x)*np.exp(-x*25)*.9,at)
def noise(a,b):
    t=a; k=0
    while t<b-.05:
        add(ping(np.random.choice([880,988,1175,1319,1568,1760,2093])),t,.35)
        if k%2==0: add(hat(),t,.7)
        t+=max(.045,.32*(0.93**k)*((b-a)/4.6)); k+=1
    for x0 in np.arange(a,b,.25): add(kick(.8),x0)
    x=T(b-a); add(np.random.randn(len(x))*(x/(b-a))**3*.35,a)
def groove(a,b,bpm=110,full=True):
    spb=60/bpm; chords=[[220,261.63,329.63],[196,246.94,293.66],[174.61,220,261.63],[196,246.94,329.63]]; bass=[55,49,43.65,49]
    i=0
    while a+i*spb<b:
        at=a+i*spb; bar=(i//4)%4
        add(kick(.9),at); add(hat(),at+spb/2,.8)
        if full: add(hat(),at+spb/4,.4); add(hat(),at+3*spb/4,.4)
        if i%2==1: add(snare(),at)
        if i%4==0: add(pad(chords[bar],spb*4,.06),at)
        x=T(spb*.9); add(np.sin(2*np.pi*bass[bar]*x)*np.exp(-x*2.5)*.5,at+(spb/2 if i%2 else 0))
        i+=1
if variant=='noise':
    noise(0,4.6); tap(5.9); add(pad([220,277.18,329.63],3.4,.05),6.1); groove(9.4,14.6)
elif variant=='invite':
    add(pad([110,164.81,220],2.4,.05),0.1); noise(2.5,5.1); tap(6.3)
    add(pad([220,277.18,329.63],3.8,.05),6.6)
    for b,at in enumerate([7.7,8.2]): add(kick(1.1),at)
    groove(10.6,19.4)
else:  # spicy: 120 bpm, a hit on every word
    spb=.5
    for i in range(8):
        at=i*spb; add(kick(1.0),at); add(hat(),at+.25,.9); add(hat(),at+.125,.4); add(hat(),at+.375,.4)
        if i%2: add(snare(),at,1.2)
        f=[55,55,65.41,49][(i//2)%4]; x=T(.45); add(np.sign(np.sin(2*np.pi*f*x))*np.exp(-x*5)*.25,at)
    x=T(.9); add(np.random.randn(len(x))*(x/.9)**2*.3,3.1)
    tap(4.0); groove(4.6,9.6,bpm=120)
fade=np.ones(n); m=int(sr*.9); fade[-m:]=np.linspace(1,0,m); out*=fade
out=np.tanh(out*1.2); out=out/np.max(np.abs(out))*.9
w=wave.open(path,'wb'); w.setnchannels(1); w.setsampwidth(2); w.setframerate(sr)
w.writeframes((out*32767).astype(np.int16).tobytes()); w.close()
