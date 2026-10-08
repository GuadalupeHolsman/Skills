import json, os, sys, urllib.request
key=os.environ["ELEVENLABS_API_KEY"]  # never commit the key; V="UCR4UtHH5XiWvCN33ixc"
spoken={
"rv":["Red velvet protein ice cream. Let me show you how I make it.","I start with Fage zero percent Greek yogurt.","Then I add Fairlife fat-free milk.",
      "Sprinkles red velvet pudding mix.","One scoop of ISO one hundred protein.","Allulose sweetener,","a pinch of salt,","an eighth of a teaspoon of xanthan gum,",
      "and a splash of vanilla.","I mix everything and blend it until smooth.","Lid on, and into the freezer overnight.","The next day, into the Ninja Creami.",
      "For the mix-in, Voortman zero sugar cookies: I make a well and add them.","I use the mix-in function,","and that's it: creamy, high in protein, and guilt-free."],
"dk":["Dark chocolate Oreo protein ice cream.","For the mix-in, I'm using Oreo Thins.","I take my chocolate base out of the freezer.","Into the Ninja Creami.",
      "I make a well in the center and add the Oreos.","Mix-in function.","I finish with more Oreos on top.","Creamy, high in protein, and guilt-free."]}
captions={"rv":["Red velvet protein ice cream. Let me show you how I make it.","I start with Fage 0% Greek yogurt.","Then I add Fairlife fat-free milk.",
      "Sprinkles red velvet pudding mix.","One scoop of ISO100 protein.","Allulose sweetener,","a pinch of salt,","1/8 tsp of xanthan gum,",
      "and a splash of vanilla.","I mix everything and blend it until smooth.","Lid on, and into the freezer overnight.","The next day, into the Ninja Creami.",
      "For the mix-in, Voortman zero sugar cookies: I make a well and add them.","I use the mix-in function,","and that's it: creamy, high in protein, and guilt-free."],
 "dk":spoken["dk"]}
for r,lines in spoken.items():
    for i,t in enumerate(lines):
        body={"text":t,"model_id":"eleven_v4","voice_settings":{"stability":0.5,"similarity_boost":0.75,"speed":1.0}}
        if i: body["previous_text"]=" ".join(lines[:i])[-400:]
        if i<len(lines)-1: body["next_text"]=" ".join(lines[i+1:])[:400]
        req=urllib.request.Request(f"https://api.elevenlabs.io/v1/text-to-speech/{V}?output_format=mp3_44100_128",data=json.dumps(body).encode(),
            headers={"xi-api-key":key,"Content-Type":"application/json","Accept":"audio/mpeg"})
        try: open(f"vo5/{r}_{i:02d}.mp3","wb").write(urllib.request.urlopen(req,timeout=120).read())
        except urllib.error.HTTPError as e: print(r,i,"ERR",e.code,e.read()[:200]); sys.exit(1)
    json.dump(captions[r],open(f"vo5/{r}_lines.json","w")); print(r,"ok")
