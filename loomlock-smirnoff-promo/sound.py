import numpy as np, wave, sys, json
variant, path, shots = sys.argv[1], sys.argv[2], json.loads(sys.argv[3])
DUR={'invite':20,'noise':15,'spicy':10}[variant]
sr=44100; n=int(sr*DUR); rs=np.random.RandomState(11)
BPM=120; BT=60/BPM; ST=BT/4
dry=np.zeros((2,n)); send=np.zeros((2,n)); duck=np.zeros((2,n))
T=lambda d: np.arange(int(sr*d))/sr
def put(bus,sig,at,g=1.,pan=0.):
    i=int(round(at*sr)); 
    if i>=n or i<0: return
    j=min(n,i+len(sig)); bus[0,i:j]+=g*sig[:j-i]*np.sqrt((1-pan)/2)*1.414; bus[1,i:j]+=g*sig[:j-i]*np.sqrt((1+pan)/2)*1.414
def fftfilt(x,lo=None,hi=None):
    X=np.fft.rfft(x); f=np.fft.rfftfreq(len(x),1/sr); m=np.ones_like(f)
    if hi: m*=1/np.sqrt(1+(f/hi)**4)
    if lo: m*=1/np.sqrt(1+(lo/np.maximum(f,1))**4)
    return np.fft.irfft(X*m,len(x))
# ---- instruments
def kick():
    x=T(.5); f=48+110*np.exp(-x*35); s=np.sin(2*np.pi*np.cumsum(f)/sr)*np.exp(-x*5.5)
    s[:300]+=fftfilt(rs.randn(300),lo=2000)*np.exp(-np.arange(300)/40)*.5; return np.tanh(s*1.6)
def clap():
    x=T(.35); e=np.zeros_like(x)
    for d in (0,.009,.018): e+=np.exp(-np.maximum(x-d,0)*180)*(x>=d)
    e+=np.exp(-x*14)*.35; return fftfilt(rs.randn(len(x)),lo=900,hi=6000)*e*.8
def shaker(): x=T(.06); return fftfilt(rs.randn(len(x)),lo=6000)*np.exp(-x*70)*np.minimum(1,x*900)
def ohat(): x=T(.22); return fftfilt(rs.randn(len(x)),lo=7000)*np.exp(-x*16)
def conga(f0):
    x=T(.25); f=f0*(1+.45*np.exp(-x*45)); return np.sin(2*np.pi*np.cumsum(f)/sr)*np.exp(-x*16)+fftfilt(rs.randn(len(x)),lo=1500,hi=5000)*np.exp(-x*120)*.15
def clave(): x=T(.08); return (np.sin(2*np.pi*2400*x)+.4*np.sin(2*np.pi*3600*x))*np.exp(-x*60)
def bass(f,d):
    x=T(d); s=np.sin(2*np.pi*f*x)+.25*np.sin(2*np.pi*2*f*x); env=np.minimum(1,x*200)*np.minimum(1,np.maximum(0,d-x)*60)
    return np.tanh(1.8*s*env)*.8
def stab(fs,d=.22):
    x=T(d); s=np.zeros_like(x)
    for f in fs:
        for h in range(1,9): s+=np.sin(2*np.pi*f*h*x*(1+.002*h))/h
    return s*np.exp(-x*12)*np.minimum(1,x*400)*.18
def pad(fs,d):
    x=T(d); s=sum(np.sin(2*np.pi*f*x+.3*np.sin(2*np.pi*5*x))+.3*np.sin(2*np.pi*f*2.003*x) for f in fs)
    return s*np.minimum(1,x/.4)*np.minimum(1,np.maximum(0,d-x)/.4)*.05
def click(): x=T(.012); return fftfilt(rs.randn(len(x)),lo=2500)*np.exp(-x*500)
def riser(d): x=T(d); return fftfilt(rs.randn(len(x)),lo=1500)*(x/d)**2.5
# A minor: Am F C G
CH=[[220,261.63,329.63],[174.61,220,261.63],[196,261.63,329.63],[196,246.94,293.66]]
RT=[55,43.65,65.41,49]
BASSPAT=[(0,3,1),(3,2,1),(6,2,1.5),(10,1,1),(11,2,1),(14,2,1.5)]   # (step,len,ratio)
CONGA=[(2,330),(3,220),(6,330),(7,330),(10,220),(11,330),(14,330),(15,220)]
CLAVE=[[0,6,12],[4,8]]
END=shots[-1]
nb=int((DUR-.5)/BT)
for b in range(nb):
    at=b*BT; bar=b//4; st=b%4; chord=bar%4
    intro = at<1.0
    put(dry,kick(),at,1.0); duck_at=at
    if st in (1,3) and not intro: put(dry,clap(),at,.55,.05); put(send,clap(),at,.25)
    put(dry,ohat(),at+BT/2,.18 if not intro else .08,.25)
    for k in range(4):
        sw=.012 if k%2 else 0
        put(dry,shaker(),at+k*ST+sw,(.16 if k%2 else .10),-.3)
for bar in range(int(DUR/(4*BT))+1):
    b0=bar*4*BT; chord=bar%4
    if b0>DUR: break
    for s,l,r in BASSPAT: put(dry,bass(RT[chord]*r,l*ST*.95),b0+s*ST,.55 if b0>=1 else .25)
    for s,f in CONGA: put(dry,conga(f),b0+s*ST,.32,(.4 if f>300 else -.4)); put(send,conga(f),b0+s*ST,.08)
    for s in CLAVE[bar%2]: put(dry,clave(),b0+s*ST,.12,.5); put(send,clave(),b0+s*ST,.1)
    for s in (2,6,10,13):
        put(dry,stab(CH[chord]),b0+s*ST,.5,-.15); put(send,stab(CH[chord]),b0+s*ST,.45)
    put(dry,pad(CH[chord],4*BT),b0,.8); put(send,pad(CH[chord],4*BT),b0,.5)
# accents on cuts
for i,s in enumerate(shots[:-1]):
    if s>0.01: put(dry,conga(440 if i%2 else 520),s,.18,(-.6 if i%2 else .6))
if variant=='noise':
    for kb in (2,6,10,14,18,21,24):
        for j in range(14): put(dry,click(),kb*BT+j*.018+rs.rand()*.01,.25,rs.uniform(-.8,.8))
put(dry,riser(1.0),END-1.0,.18); put(send,riser(1.0),END-1.0,.15)
x=T(2.0); put(dry,fftfilt(rs.randn(len(x)),hi=3000)*np.exp(-x*3),END,.3); put(send,fftfilt(rs.randn(len(x)),hi=3000)*np.exp(-x*3),END,.3)
# reverb on send
ir=np.exp(-T(1.6)/.38); irL=rs.randn(len(ir))*ir; irR=rs.randn(len(ir))*ir
def conv(a,b): N=1<<int(np.ceil(np.log2(len(a)+len(b)))); return np.fft.irfft(np.fft.rfft(a,N)*np.fft.rfft(b,N),N)[:len(a)]
wet=np.stack([conv(fftfilt(send[0],lo=200,hi=7000),irL),conv(fftfilt(send[1],lo=200,hi=7000),irR)])
wet*=.25/ (np.abs(wet).max()+1e-9) * np.abs(dry).max()
# sidechain pump on wet+pads (approx: on wet bus)
g=np.ones(n)
for b in range(nb):
    i=int(b*BT*sr); L=int(.25*sr); e=1-.55*np.exp(-np.arange(L)/(.06*sr)); g[i:i+L]=np.minimum(g[i:i+L],e[:max(0,min(L,n-i))])
mix=dry+wet*g
# intro filter sweep (first second lowpassed)
k=int(1.0*sr); lp=np.stack([fftfilt(mix[0,:k+4410],hi=900),fftfilt(mix[1,:k+4410],hi=900)])
xf=np.linspace(0,1,4410); mix[:,:k]=lp[:,:k]; mix[:,k:k+4410]=lp[:,k:k+4410]*(1-xf)+mix[:,k:k+4410]*xf
fade=np.ones(n); m=int(sr*1.2); fade[-m:]=np.linspace(1,0,m)**1.5; mix*=fade
mix=fftfilt(mix[0],lo=28), fftfilt(mix[1],lo=28); mix=np.stack(mix)
mix=np.tanh(mix/np.abs(mix).max()*1.6); mix*=.92/np.abs(mix).max()
st=np.empty(2*n); st[0::2]=mix[0]; st[1::2]=mix[1]
w=wave.open(path,'wb'); w.setnchannels(2); w.setsampwidth(2); w.setframerate(sr); w.writeframes((st*32767).astype(np.int16).tobytes()); w.close()
