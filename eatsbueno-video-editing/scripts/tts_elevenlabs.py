import json, os, sys, urllib.request
key=os.environ["ELEVENLABS_API_KEY"]  # set in the environment settings, never commit it
V="UCR4UtHH5XiWvCN33ixc"
scripts={
"area51":"Road trip to Area 51, here's what I actually ate. Extraterrestrial Highway... check. Road snack: a café latte protein shake, plus electrolytes, because it's the desert. Lunch at the Little A'Le'Inn: club sandwich with coleslaw... and alien hot sauce, obviously. In the car, a protein bar to hold me over. Dinner: a chicken pita and hot tea. Next morning: eggs, sausage and coffee... and Panda Express for the road. Road trips can still be bueno.",
"miscomidas":"Mis comidas cuando ando en la calle. Desayuno: huevos pochados, salchichas y café... o un revuelto de vegetales con muffin inglés. Almuerzo: sashimi con ensalada de algas. Proteína y vegetales, sin complicarme. ¿Comida rápida? También se puede: pollo a la parrilla con vegetales. Comer fuera también puede ser bueno. Sin culpa.",
"app":"Log any meal. Anywhere. Snap your meal, and EatsBueno breaks it down: the why, not just the what. At home... homemade waffles, home cooking. Or out with family: Mexican, Colombian, Thai, Japanese, comfort food, pizza night. Real life. Real food. No guilt. EatsBueno adapts to your world... not you to ours.",
}
for name,text in scripts.items():
    body=json.dumps({"text":text,"model_id":"eleven_v4","voice_settings":{"stability":0.5,"similarity_boost":0.75,"speed":1.0}}).encode()
    req=urllib.request.Request(f"https://api.elevenlabs.io/v1/text-to-speech/{V}?output_format=mp3_44100_128",data=body,
        headers={"xi-api-key":key,"Content-Type":"application/json","Accept":"audio/mpeg"})
    try:
        data=urllib.request.urlopen(req,timeout=120).read()
        open(f"vo3/{name}.mp3","wb").write(data); print(name,len(data))
    except urllib.error.HTTPError as e:
        print(name,"ERR",e.code,e.read()[:300])
