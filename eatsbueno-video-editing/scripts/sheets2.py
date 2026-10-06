import sys, os, subprocess, glob
from PIL import Image, ImageDraw, ImageFont
from concurrent.futures import ThreadPoolExecutor
d = sys.argv[1]; N=4; cols=2; rows=6; tw,th=120,213
files = sorted(glob.glob(d+"/*.mov")+glob.glob(d+"/*.MOV")+glob.glob(d+"/*.mp4"))
f = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 15)
def thumbs(fn):
    dur = float(subprocess.run(["ffprobe","-v","error","-show_entries","format=duration","-of","csv=p=0",fn],capture_output=True,text=True).stdout or 0)
    ims=[]
    for k in range(N):
        p=f"/tmp/_t_{os.getpid()}_{os.path.basename(fn)}_{k}.jpg"
        subprocess.run(["ffmpeg","-v","error","-y","-ss",f"{dur*(k+0.5)/N:.2f}","-i",fn,"-frames:v","1","-vf",f"scale={tw}:{th}:force_original_aspect_ratio=increase,crop={tw}:{th}",p])
        try: ims.append(Image.open(p).copy())
        except Exception: ims.append(Image.new("RGB",(tw,th)))
    return fn,dur,ims
with ThreadPoolExecutor(8) as ex: res=list(ex.map(thumbs,files))
per=cols*rows
for pi in range(0,len(res),per):
    sheet=Image.new("RGB",(cols*(N*tw+10),rows*(th+18)),"black"); dr=ImageDraw.Draw(sheet)
    for j,(fn,dur,ims) in enumerate(res[pi:pi+per]):
        cx=(j%cols)*(N*tw+10); cy=(j//cols)*(th+18)
        for k,im in enumerate(ims): sheet.paste(im,(cx+k*tw,cy+18))
        dr.text((cx+2,cy+1),f"{os.path.basename(fn).split('.')[0]} {dur:.1f}s",font=f,fill="yellow")
    sheet.save(f"{d}/ov_{pi//per:02d}.jpg",quality=78)
print(len(res))
