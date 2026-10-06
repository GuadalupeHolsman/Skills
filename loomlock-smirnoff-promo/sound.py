import numpy as np, wave, sys, json
variant, path = sys.argv[1], sys.argv[2]
DUR={'invite':20,'noise':15,'spicy':10}[variant]
SH={'spicy':[0,0.5,1,1.5,2,2.5,3,3.5,4,4.5,5,5.5],'noise':[0,0.5,1,1.5,2,3,3.5,4,5.5,6,7,8,9,10],
    'invite':[0,0.5,1,2.5,3,3.5,4,4.5,5.5,6.5,8.5,10.5,12.5,14]}[variant]
TAPS={'spicy':[2.0],'noise':[2.0],'invite':[3.0]}[variant]
TRI={'spicy':[],'noise':[4.0,4.5,5.0],'invite':[1.0,1.5,2.0]}[variant]
END=SH[-1]
sr=44100; n=int(sr*DUR); L=np.zeros(n); R=np.zeros(n); np.random.seed(5)
T=lambda d: np.arange(int(sr*d))/sr
def add(sig,at,g=1.0,pan=0.0):
    i=int(at*sr); j=min(n,i+len(sig))
    if 0<=i<n: L[i:j]+=g*sig[:j-i]*(1-pan); R[i:j]+=g*sig[:j-i]*(1+pan)
def kick(g=1): x=T(.45); f=45+130*np.exp(-x*32); return np.sin(2*np.pi*np.cumsum(f)/sr)*np.exp(-x*6)*g
def hat(d=.05): x=T(d); return np.random.randn(len(x))*np.exp(-x*90)*.22
def clap(): x=T(.2); return np.random.randn(len(x))*np.exp(-x*22)*.35
def pluck(f,d=.4): x=T(d); return (np.sin(2*np.pi*f*x)+.5*np.sin(4*np.pi*f*x)*np.exp(-x*8))*np.exp(-x*7)*np.minimum(1,x*300)
def pad(fs,d,g=.04): x=T(d); s=sum(np.sin(2*np.pi*f*x)+.25*np.sin(2*np.pi*2.004*f*x) for f in fs); return s*np.minimum(1,x/.5)*np.minimum(1,np.maximum(0,d-x)/.6)*g
def whoosh(d): x=T(d); nz=np.convolve(np.random.randn(len(x)),np.ones(30)/30,'same'); return nz*(x/d)**2*.9
def tap(at): x=T(.3); add(np.random.randn(len(x))*np.exp(-x*450)*.8+np.sin(2*np.pi*85*x)*np.exp(-x*22),at,1.0)
def impact(at): add(kick(1.4),at); x=T(1.4); add(np.convolve(np.random.randn(len(x)),np.ones(50)/50,'same')*np.exp(-x*3.5),at,.7)
spb=.5; CH=[[220,261.63,329.63],[174.61,220,261.63],[196,246.94,293.66],[164.81,207.65,246.94]]; BS=[55,43.65,49,41.2]
MEL=[523.25,587.33,659.25,783.99,880,987.77,1046.5,1174.66]
i=0
while i*spb<DUR-.6:
    at=i*spb; bar=(i//4)%4
    add(kick(.95),at); add(hat(),at+.25,.8,.3); add(hat(.03),at+.125,.3,-.3); add(hat(.03),at+.375,.3,-.3)
    if i%2: add(clap(),at,.9)
    x=T(.45); add(np.sin(2*np.pi*BS[bar]*x)*np.exp(-x*3)*.55+np.sign(np.sin(2*np.pi*BS[bar]*x))*np.exp(-x*6)*.12,at)
    if i%4==0: add(pad(CH[bar],2.0),at)
    i+=1
for k,s in enumerate(SH[:-1]): add(pluck(MEL[k%len(MEL)]),s,.22,(k%2-.5)*.6)
for s in TRI: add(pluck(MEL[(int(s*2))%8]*1.5,.3),s,.15)
for s in TAPS: tap(s)
add(whoosh(.5),END-.5,.45); impact(END)
for k in range(8): add(pluck(MEL[(k*3)%8],.5),END+.25+k*.25,.1,(k%2-.5)*.6)
x=T(2.5); add(sum(np.sin(2*np.pi*f*x) for f in [440,554.37,659.25])*np.exp(-x*1.6)*.12,DUR-2.6)
fade=np.ones(n); m=int(sr*.8); fade[-m:]=np.linspace(1,0,m); L*=fade; R*=fade
pk=max(abs(L).max(),abs(R).max()); L=np.tanh(L/pk*1.5); R=np.tanh(R/pk*1.5); pk=max(abs(L).max(),abs(R).max()); L*=.9/pk; R*=.9/pk
st=np.empty(2*n); st[0::2]=L; st[1::2]=R
w=wave.open(path,'wb'); w.setnchannels(2); w.setsampwidth(2); w.setframerate(sr); w.writeframes((st*32767).astype(np.int16).tobytes()); w.close()
