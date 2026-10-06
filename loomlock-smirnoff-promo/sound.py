import numpy as np, wave, sys
variant, path = sys.argv[1], sys.argv[2]
DUR={'invite':20,'noise':15,'spicy':10}[variant]
sr=44100; n=int(sr*DUR); L=np.zeros(n); R=np.zeros(n); np.random.seed(4)
T=lambda d: np.arange(int(sr*d))/sr
def add(sig,at,g=1.0,pan=0.0):
    i=int(at*sr); j=min(n,i+len(sig))
    if i<n: L[i:j]+=g*sig[:j-i]*(1-pan)*.5*2**.5; R[i:j]+=g*sig[:j-i]*(1+pan)*.5*2**.5
def ping(f): x=T(.2); return (np.sin(2*np.pi*f*x)+.35*np.sin(4*np.pi*f*x))*np.exp(-x*20)*np.minimum(1,x*500)
def kick(g=1): x=T(.45); f=45+120*np.exp(-x*30); return np.sin(2*np.pi*np.cumsum(f)/sr)*np.exp(-x*6.5)*g
def hat(d=.05): x=T(d); return np.random.randn(len(x))*np.exp(-x*90)*.22
def clap(): x=T(.2); e=np.exp(-x*22)*(1+.6*np.exp(-((x-.012)*300)**2)); return np.random.randn(len(x))*e*.32
def pad(freqs,d,g=.06):
    x=T(d); s=sum(np.sin(2*np.pi*f*x+np.sin(2*np.pi*.3*x))+.25*np.sin(2*np.pi*2.004*f*x) for f in freqs)
    return s*np.minimum(1,x/1.0)*np.minimum(1,np.maximum(0,(d-x))/.8)*g
def pluck(f,d=.6): x=T(d); return (np.sin(2*np.pi*f*x)+.5*np.sin(4*np.pi*f*x)*np.exp(-x*8))*np.exp(-x*6)*np.minimum(1,x*300)
def whoosh(d,up=True):
    x=T(d); e=(x/d)**2 if up else (1-x/d)**2; nz=np.random.randn(len(x)); nz=np.convolve(nz,np.ones(30)/30,'same'); return nz*e*.9
def tap(at): x=T(.3); add(np.random.randn(len(x))*np.exp(-x*450)*.9+np.sin(2*np.pi*85*x)*np.exp(-x*22),at,1.0)
def impact(at): add(kick(1.3),at); x=T(1.2); add(np.convolve(np.random.randn(len(x)),np.ones(60)/60,'same')*np.exp(-x*4)*1.2,at,.8)
def noise(a,b):
    t=a; k=0
    while t<b-.05:
        add(ping(np.random.choice([880,988,1175,1319,1568,1760,2093])),t,.3,np.random.uniform(-.8,.8))
        if k%2==0: add(hat(),t,.6,np.random.uniform(-.5,.5))
        t+=max(.04,.3*(0.92**k)); k+=1
    for x0 in np.arange(a,b,.25): add(kick(.7),x0)
    x=T(b-a); add(np.random.randn(len(x))*(x/(b-a))**3*.3,a)
CH=[[220,261.63,329.63],[174.61,220,261.63],[196,246.94,293.66],[164.81,207.65,246.94]]
BS=[55,43.65,49,41.2]
def groove(a,b,bpm=112,lite=False):
    spb=60/bpm; i=0
    while a+i*spb<b-.05:
        at=a+i*spb; bar=(i//4)%4
        add(kick(.85),at)
        add(hat(),at+spb/2,.8,.3)
        if not lite: add(hat(.03),at+spb/4,.35,-.3); add(hat(.03),at+3*spb/4,.35,-.3)
        if i%2==1: add(clap(),at,.9)
        if i%4==0: add(pad(CH[bar],spb*4,.045),at)
        x=T(spb*.9); add(np.sin(2*np.pi*BS[bar]*x)*np.exp(-x*2.5)*.5,at+(spb/2 if i%2 else 0))
        if i%2==0: add(pluck(CH[bar][(i//2)%3]*2,.4),at+spb*.75,.12,.4)
        i+=1
if variant=='noise':
    noise(0,4.4); tap(5.6); add(pad([220,277.18,329.63],4.2,.05),5.8)
    add(whoosh(.6),9.4,.3); impact(10.0); groove(10.0,14.6)
elif variant=='spicy':
    words_f=[523.25,587.33,659.25,783.99,880,987.77,1046.5]
    for k in range(7):
        at=k*.5; add(kick(1.0),at); add(clap(),at+.25,.6) if k%2 else add(hat(),at+.25,.8)
        add(pluck(words_f[k],.35),at,.25,(k%2-.5)); add(hat(.03),at+.125,.3); add(hat(.03),at+.375,.3)
        x=T(.45); add(np.sign(np.sin(2*np.pi*55*x))*np.exp(-x*6)*.18,at)
    tap(2.0)
    add(whoosh(.5),3.5,.5); impact(4.0); groove(4.0,9.6,bpm=120)
else:  # invite
    add(pad([110,164.81,220,277.18],3.0,.05),0.0)
    for i,f in enumerate([440,554.37,659.25,880]): add(pluck(f,.8),.25+i*.2,.12,(i%2-.5)*.6)
    add(whoosh(1.0),2.0,.35); add(kick(.7),3.0)
    arp=[440,554.37,659.25,830.61,659.25,554.37]
    for i in range(int(3.4/.25)): add(pluck(arp[i%6],.5),3.1+i*.25,.10,(i%2-.5)*.5)
    add(pad([220,277.18,329.63],3.6,.04),3.0)
    add(whoosh(.8),5.8,.4); add(np.sin(2*np.pi*660*T(1.0))*np.exp(-T(1.0)*3)*.2,6.6)
    for i in range(int(2.8/.25)): add(pluck(arp[(i+2)%6]*1.0,.5),6.8+i*.25,.10,(i%2-.5)*.5)
    add(whoosh(.7),9.0,.3); impact(9.7); groove(9.7,19.4,bpm=112,lite=True)
for A in (L,R):
    fade=np.ones(n); m=int(sr*1.0); fade[-m:]=np.linspace(1,0,m); A*=fade
pk=max(np.max(np.abs(L)),np.max(np.abs(R))); L=np.tanh(L/pk*1.4); R=np.tanh(R/pk*1.4)
pk=max(np.max(np.abs(L)),np.max(np.abs(R))); L*=.9/pk; R*=.9/pk
st=np.empty(2*n); st[0::2]=L; st[1::2]=R
w=wave.open(path,'wb'); w.setnchannels(2); w.setsampwidth(2); w.setframerate(sr)
w.writeframes((st*32767).astype(np.int16).tobytes()); w.close()
