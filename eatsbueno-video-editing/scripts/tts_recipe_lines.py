import json, os, sys, urllib.request, subprocess
key=os.environ["ELEVENLABS_API_KEY"]  # never commit the key; V="UCR4UtHH5XiWvCN33ixc"
recipes={
"rv":["Helado proteico red velvet. Te enseño cómo lo hago.",
      "Empiezo con yogur griego Fage cero por ciento.",
      "Le agrego leche Fairlife sin grasa.",
      "La mezcla de pudín red velvet de Sprinkles.",
      "Un scoop de proteína ISO cien.",
      "Endulzante con alulosa,",
      "una pizca de sal,",
      "un octavo de cucharadita de goma xantana,",
      "y un toque de vainilla.",
      "Mezclo todo y lo licúo hasta que quede suave.",
      "Lo tapo y lo congelo toda la noche.",
      "Al día siguiente, a la Ninja Creami.",
      "Para el mix-in, galletas Voortman sin azúcar: hago un hueco y las agrego.",
      "Uso la función mix-in,",
      "y listo: cremoso, alto en proteína y sin culpa."],
"dk":["Helado proteico de chocolate oscuro con Oreo.",
      "Para el mix-in, uso Oreo Thins.",
      "Saco mi base de chocolate del congelador.",
      "A la Ninja Creami.",
      "Hago un hueco en el centro y agrego las Oreo.",
      "Función mix-in.",
      "Termino con más Oreo encima.",
      "Cremoso, alto en proteína y sin culpa."]}
for r,lines in recipes.items():
    for i,t in enumerate(lines):
        body={"text":t,"model_id":"eleven_v4","voice_settings":{"stability":0.5,"similarity_boost":0.75,"speed":1.0},
              "previous_text":" ".join(lines[:i])[-400:] or None,"next_text":" ".join(lines[i+1:])[:400] or None}
        body={k:v for k,v in body.items() if v is not None}
        req=urllib.request.Request(f"https://api.elevenlabs.io/v1/text-to-speech/{V}?output_format=mp3_44100_128",data=json.dumps(body).encode(),
            headers={"xi-api-key":key,"Content-Type":"application/json","Accept":"audio/mpeg"})
        try: open(f"vo4/{r}_{i:02d}.mp3","wb").write(urllib.request.urlopen(req,timeout=120).read())
        except urllib.error.HTTPError as e: print(r,i,"ERR",e.code,e.read()[:200]); sys.exit(1)
    json.dump(lines,open(f"vo4/{r}_lines.json","w"),ensure_ascii=False)
    print(r,"ok",len(lines))
