import json, subprocess, sys, os, numpy as np, cv2
D="/tmp/claude-0/-home-user-Skills/ac0352e1-c6c2-5084-a80c-5658b4be7250/scratchpad/stabtest"
def frames(p, w=540, h=960):
    raw = subprocess.run(["ffmpeg","-v","error","-i",p,"-vf",f"scale={w}:{h},format=gray","-f","rawvideo","-"],capture_output=True).stdout
    return np.frombuffer(raw,np.uint8).reshape(-1,h,w).astype(np.float32)
win=cv2.createHanningWindow((540,960), cv2.CV_32F)
def jit(p):
    f=frames(p); d=np.array([cv2.phaseCorrelate(f[i],f[i+1],win)[0] for i in range(len(f)-1)])
    return np.hypot(*np.diff(d,axis=0).T).mean(), np.hypot(*d.T).mean()
s=json.load(open(sys.argv[1])); res={}
for i,c in enumerate(s["clips"]):
    if not c.get("src"): continue
    spd=c.get("speed",1.0); need=c["dur"]*spd; o=f"{D}/c{i}_o.mp4"
    subprocess.run(["ffmpeg","-v","error","-y","-ss",f"{c['in']}","-t",f"{need:.3f}","-i",c["src"],"-an","-vf",f"setpts=PTS/{spd},fps=30,scale=1080:1920","-c:v","libx264","-crf","16",o])
    t=f"{D}/c{i}.trf"; sm=f"{D}/c{i}_s.mp4"
    subprocess.run(["ffmpeg","-v","error","-y","-i",o,"-vf",f"vidstabdetect=shakiness=5:accuracy=15:stepsize=6:mincontrast=0.3:result={t}","-f","null","-"])
    subprocess.run(["ffmpeg","-v","error","-y","-i",o,"-vf",f"vidstabtransform=input={t}:smoothing=45:optzoom=1:interpol=bicubic","-c:v","libx264","-crf","16",sm])
    jo,mo=jit(o); js,ms=jit(sm); res[i]=dict(orig=jo,smooth=js)
    print(f"#{i:2d} {os.path.basename(c['src'])} x{spd}  orig jit {jo:.2f} mot {mo:.2f} | smooth jit {js:.2f} mot {ms:.2f}", flush=True)
json.dump(res,open(f"{D}/res.json","w"))
