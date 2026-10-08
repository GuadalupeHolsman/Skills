import urllib.request, uuid, json, sys
import os; key=os.environ["ELEVENLABS_API_KEY"]; V="UCR4UtHH5XiWvCN33ixc"
src,dst=sys.argv[1],sys.argv[2]
b=uuid.uuid4().hex; data=open(src,"rb").read()
def part(n,v): return f'--{b}\r\nContent-Disposition: form-data; name="{n}"\r\n\r\n{v}\r\n'.encode()
body=part("model_id","eleven_multilingual_sts_v2")+part("voice_settings",json.dumps({"stability":0.6,"similarity_boost":0.8}))+part("remove_background_noise","true")
body+=f'--{b}\r\nContent-Disposition: form-data; name="audio"; filename="a.wav"\r\nContent-Type: audio/wav\r\n\r\n'.encode()+data+f'\r\n--{b}--\r\n'.encode()
req=urllib.request.Request(f"https://api.elevenlabs.io/v1/speech-to-speech/{V}?output_format=mp3_44100_128",data=body,headers={"xi-api-key":key,"Content-Type":f"multipart/form-data; boundary={b}"})
open(dst,"wb").write(urllib.request.urlopen(req,timeout=300).read()); print(dst)
