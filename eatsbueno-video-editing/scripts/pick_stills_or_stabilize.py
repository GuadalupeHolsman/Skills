import json, subprocess, numpy as np, cv2, importlib.util
sp=importlib.util.spec_from_file_location('v','vedit.py'); v=importlib.util.module_from_spec(sp); sp.loader.exec_module(v)
res=json.load(open('stabtest/res.json')); s=json.load(open('rv_v9.json'))
FREEZE={1,5,7,9,11,15,19,20,21,23,26}
def sharpest(src, a, length):
    pre=v.hdr_prefix(src)
    raw=subprocess.run(["ffmpeg","-v","error","-ss",f"{a}","-t",f"{length:.3f}","-i",src,"-vf",pre+"fps=10,scale=540:960,format=gray","-f","rawvideo","-"],capture_output=True).stdout
    f=np.frombuffer(raw,np.uint8).reshape(-1,960,540)
    k=int(np.argmax([cv2.Laplacian(x,cv2.CV_64F).var() for x in f])); return a+k/10
for i,c in enumerate(s['clips']):
    c.pop('stabilize',None)
    if not c.get('src'): continue
    r=res[str(i)]
    if i in FREEZE:
        t=sharpest(c['src'],c['in'],c['dur']*c.get('speed',1.0))
        out=f"redvelvet/freeze/f{i:02d}.png"
        subprocess.run(["ffmpeg","-v","error","-y","-ss",f"{t:.2f}","-i",c['src'],"-frames:v","1","-vf",v.hdr_prefix(c['src'])+"format=rgb24",out])
        s['clips'][i]={"image":out,"dur":c['dur'],"zoom":[1.0,1.0]}
        print(i,"freeze",round(t,2))
    elif r['smooth']<r['orig']:
        c['stabilize']="smooth"; print(i,"smooth",r)
    else: print(i,"orig",r)
json.dump(s,open('rv_v9.json','w'),indent=1,ensure_ascii=False)
