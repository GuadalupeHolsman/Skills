"""Builds the neutral-Spanish versions of both films from the English sources.

Usage: python3 tools/make_es.py   ->  dashboard_launch_es.html, launch_people_es.html

Every on-screen line is replaced by an exact source string, so the Spanish files always follow the latest English
timing and motion. Both languages show the same v1.2.0 product screens (tools/make_dash_assets.py and
tools/make_app_assets.py); here only the asset folder, number format and copy change. Brand names
(EatsBueno, EatsBueno Institutional, the JUST EATS BUENO wordplay) are not translated. Tuteo, no voseo.
"""
import os
import sys

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

DASH = [
    ('<html lang="en">', '<html lang="es">'),
    ('So how is your team<br><i>really doing?</i>', '¿Cómo está tu equipo<br><i>de verdad?</i>'),
    ("WORDS = [['Feel', 'good.'], ['Work', 'well.'], ['Perform.', '']]", "WORDS = [['Sentirse', 'bien.'], ['Trabajar', 'mejor.'], ['Rendir.', '']]"),
    ('letter-spacing:.6em">Institutional</div>', 'letter-spacing:.6em">Institucional</div>'),
    ('>INSTITUTIONAL</div>', '>INSTITUCIONAL</div>'),
    ('Wellbeing your organization can see.', 'Bienestar que tu organización puede ver.'),
    ('Your people<br>get <i style="color:#F0A26A">the app.</i>', 'Tu gente<br>tiene <i style="color:#F0A26A">la app.</i>'),
    ('You get<br><i style="color:#F0A26A">the big picture.</i>', 'Tú ves<br><i style="color:#F0A26A">el panorama.</i>'),
    ('A personal nutrition coach for every employee.', 'Un coach de nutrición personal para cada colaborador.'),
    ("'AI nutrition coach'", "'Coach de nutrición con IA'"),
    ("'Meal scanner'", "'Escáner de comidas'"),
    ("'Water & sleep'", "'Agua y sueño'"),
    ("'Small wins'", "'Pequeños logros'"),
    ("'One <i>transparent</i> score.'", "'Un puntaje <i>transparente.</i>'"),
    ("'Real participation, <i>every month.</i>'", "'Participación real, <i>cada mes.</i>'"),
    ("'How your people <i>feel.</i>'", "'Cómo se siente <i>tu gente.</i>'"),
    ("'Absence vs. <i>your own baseline.</i>'", "'Ausentismo vs. <i>tu propia línea base.</i>'"),
    ("'Small groups are <i>never shown.</i>'", "'Los grupos pequeños <i>nunca se muestran.</i>'"),
    ("'One workbook a month. <i>Checked for you.</i>'", "'Un archivo al mes. <i>Validado al instante.</i>'"),
    ('\'A team that feels good<br><i style="color:#FF8A4C">is a team that performs.</i>\'', '\'Un equipo que se siente bien<br><i style="color:#FF8A4C">es un equipo que rinde.</i>\''),
    ("'What your organization<br><i>gets.</i>'", "'Lo que obtiene<br><i>tu organización.</i>'"),
    ("'Engagement', 'Engaged.', 'Real participation, every closed month.'", "'Participación', 'Activos.', 'Participación real, cada mes cerrado.'"),
    ("'Privacy', 'Protected.', 'Group results only. Never individuals.'", "'Privacidad', 'Protegidos.', 'Solo resultados grupales. Nunca individuales.'"),
    ("'For HR', 'Simple.', 'One monthly workbook, checked for you.'", "'Para RR. HH.', 'Simple.', 'Un archivo al mes, validado al instante.'"),
    ("'The app', 'Coached.', 'A personal coach in every pocket.'", "'La app', 'Guiados.', 'Un coach personal en cada bolsillo.'"),
    ('<div class="h1 wd" style="font-size:82px;line-height:1.02">', '<div class="h1 wd" style="font-size:74px;line-height:1.02">'),
    ('Healthy people. <span style="font-weight:700;font-style:normal">Stronger teams.</span>', 'Gente sana. <span style="font-weight:700;font-style:normal">Equipos más fuertes.</span>'),
    ('Aggregate wellbeing evidence for your organization. Group results only, never individuals.', 'Evidencia agregada de bienestar para tu organización. Solo resultados grupales, nunca individuales.'),
    ('EatsBueno Institutional · For teams that perform', 'EatsBueno Institutional · Para equipos que rinden'),
    ("(v) => v.toFixed(1) + '%'", "(v) => v.toFixed(1).replace('.', ',') + ' %'"),
    ('(v) => v.toFixed(1),', "(v) => v.toFixed(1).replace('.', ','),"),
    ("cover('absent', 150, 142, 222, 14, 15.7, 0.7); cover('absent', 150, 186, 222, 14, 15.85, 0.7);", "cover('absent', 150, 148, 222, 14, 15.7, 0.7); cover('absent', 150, 199, 222, 14, 15.85, 0.7);"),
    ('regrow(pgOv, r[0] + 150, r[1] + 142, 222, 14, t + 2.4, 1.0); regrow(pgOv, r[0] + 150, r[1] + 186, 222, 14, t + 2.6, 1.0);', 'regrow(pgOv, r[0] + 150, r[1] + 148, 222, 14, t + 2.4, 1.0); regrow(pgOv, r[0] + 150, r[1] + 199, 222, 14, t + 2.6, 1.0);'),
    ('y: -(1343 - 640)', 'y: -(1358 - 640)'),
    ('assets/dash_en/', 'assets/dash_es/'),
    ('Math.min(1873 - 900,', 'Math.min(1951 - 900,'),
    ("const EMAIL = 'hr@horizonte.example';", "const EMAIL = 'rrhh@horizonte.example';"),
    ('julio-2026.xlsx<small>HR aggregate workbook</small>', 'julio-2026.xlsx<small>Libro agregado de RR. HH.</small>'),
    ("tl.to(upFile, { opacity: 1, duration: 0.25, ease: 'ui' }, 29.72);", "tl.to(upFile, { opacity: 1, duration: 0.25, ease: 'ui' }, 29.72); tl.to(upEmpty, { opacity: 0, duration: 0.25, ease: 'ui' }, 29.72);"),
]

PEOPLE = [
    ('<html lang="en">', '<html lang="es">'),
    ("'COUNT.'", "'CONTAR.'"),
    ("'CUT.'", "'RECORTAR.'"),
    ("'SKIP.'", "'SALTEAR.'"),
    ("'BURN.'", "'QUEMAR.'"),
    ("'WEIGH.'", "'PESAR.'"),
    ("'RESTRICT.'", "'RESTRINGIR.'"),
    ("'REPEAT.'", "'REPETIR.'"),
    ("'1,200 kcal max'", "'1200 kcal máx.'"),
    ("'0 g carbs'", "'0 g de carbos'"),
    ("'14 h fasting'", "'14 h de ayuno'"),
    ("'cheat day ✖'", "'día libre ✖'"),
    ("'2,000 steps left'", "'faltan 2000 pasos'"),
    ("[['Exhausting,', 'italic', 300], [' ', 'normal', 300], ['right?', 'normal', 700]]", "[['Agotador,', 'italic', 300], [' ', 'normal', 300], ['¿no?', 'normal', 700]]"),
    ('>Forget strict diets.</div>', '>Olvida las dietas estrictas.</div>'),
    ('<span style="font-weight:700">Just</span> <i style="font-weight:300">eat good.</i>', '<span style="font-weight:700">Solo</span> <i style="font-weight:300">come bien.</i>'),
    ('Meet <i style="font-weight:300">EatsBueno.</i>', 'Conoce <i style="font-weight:300">EatsBueno.</i>'),
    ('Your AI nutrition coach · No diets · No guilt', 'Tu coach de nutrición con IA · Sin dietas · Sin culpa'),
    ('Built <i style="font-weight:300">around you.</i>', 'Hecho <i style="font-weight:300">a tu medida.</i>'),
    ('Your food. <i style="font-weight:300;color:#F0A26A">Your culture.</i>', 'Tu comida. <i style="font-weight:300;color:#F0A26A">Tu cultura.</i>'),
    ("'Fish tacos, charred corn'", "'Tacos de pescado con elote'"),
    ("'Mexican'", "'Mexicana'"),
    ("'Mexico'", "'México'"),
    ("'Dal + brown rice + raita'", "'Dal + arroz integral + raita'"),
    ("'Indian'", "'India'"),
    ("'Salmon teishoku + miso'", "'Teishoku de salmón + miso'"),
    ("'Japanese'", "'Japonesa'"),
    ("'Japan'", "'Japón'"),
    ("'Pasta e fagioli + greens'", "'Pasta e fagioli + verduras'"),
    ("'Italian'", "'Italiana'"),
    ("'Italy'", "'Italia'"),
    ("'Baked milanesa + salad'", "'Milanesa al horno + ensalada'"),
    ("'Argentine'", "'Argentina'"),
    ('<span>Protein ${mac[0]}%</span><span>Carbs ${mac[1]}%</span><span>Fat ${mac[2]}%</span>', '<span>Proteína ${mac[0]}%</span><span>Carbos ${mac[1]}%</span><span>Grasas ${mac[2]}%</span>'),
    ('✓ Fits your goals', '✓ Encaja con tus metas'),
    ("'Every kitchen fits your goals.'", "'Toda cocina encaja con tus metas.'"),
    ('>Ask your coach anything</div>', '>Pregúntale lo que quieras a tu coach</div>'),
    ("[['Scan it.', 34.0], ['Log it.', 36.55], ['Done.' + CHK, 38.25]]", "[['Escanéalo.', 34.0], ['Regístralo.', 36.55], ['Listo.' + CHK, 38.25]]"),
    ('Celebrate <i style="font-weight:300">small victories.</i>', 'Celebra los <i style="font-weight:300">pequeños logros.</i>'),
    ("u: ' / 8', k: 'glasses of water', s: 'Great pace.'", "u: ' / 8', k: 'vasos de agua', s: 'Buen ritmo.'"),
    ("k: 'of restful sleep', s: 'Sleep logged.'", "k: 'de sueño reparador', s: 'Sueño registrado.'"),
    ("u: ' days', k: 'tracked this month', s: 'Keep it going.'", "u: ' días', k: 'registrados este mes', s: 'Sigue así.'"),
    ('<i style="font-weight:300">A healthier life, your way.</i>', '<i style="font-weight:300">Una vida más sana, a tu manera.</i>'),
    ('>No diets · No guilt · Just good</span>', '>Sin dietas · Sin culpa · Solo comer bien</span>'),
    ("Camila's lunch · ", 'Almuerzo de Camila · '),
    ("const PROMPT = 'Can you suggest a light dinner under 500 calories?'", "const PROMPT = '¿Me sugieres una cena ligera de menos de 500 calorías?'"),
    ("['🐟', 'Grilled salmon fillet', 'Protein and omega-3']", "['🐟', 'Filete de salmón a la plancha', 'Proteína y omega-3']"),
    ("['🥦', 'Roasted vegetables', 'Color, fiber and flavor']", "['🥦', 'Verduras asadas', 'Color, fibra y sabor']"),
    ("['🥣', 'A small portion of quinoa', 'About 450 kcal in total']", "['🥣', 'Una porción de quinoa', 'Unas 450 kcal en total']"),
    ("'Baby carrots · Campo Claro'", "'Zanahorias baby · Campo Claro'"),
    ("['0.5', 'g', 'protein', 0.4, 'L', 470],\n                   ['7.0', 'g', 'carbs', 0.6, 'R', 470], ['0.1', 'g', 'fat', 0.8, 'R', 730]]", "['0.5', 'g', 'proteína', 0.4, 'L', 470],\n                   ['7.0', 'g', 'carbohidratos', 0.6, 'R', 470], ['0.1', 'g', 'grasa', 0.8, 'R', 730]]"),
    ("'✓&nbsp; Logged'", "'✓&nbsp; Registrado'"),
    ('"Nice to meet you, Camila", from the screen itself', '"Mucho gusto, Camila", from the screen itself'),
    ('assets/screens/v12_en/', 'assets/screens/v12_es/'),
]


def build(src, dst, pairs):
    s = open(os.path.join(HERE, src), encoding='utf-8').read()
    missing = [a for a, _ in pairs if a not in s]
    if missing:
        sys.exit(f'{src}: source strings not found (the English file changed?):\n  ' + '\n  '.join(missing))
    for a, b in pairs:
        s = s.replace(a, b)
    open(os.path.join(HERE, dst), 'w', encoding='utf-8').write(s)
    print('wrote', dst)


build('dashboard_launch.html', 'dashboard_launch_es.html', DASH)
build('launch_people.html', 'launch_people_es.html', PEOPLE)
