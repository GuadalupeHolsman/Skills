// Recreations of the loomlock app screens (from the screen recordings), in EN / ES.
const STR = {
  en: {
    tag: '<b style="color:#F5E600;font-weight:600">Build</b> a better day',
    haveDevice: 'I have a loomlock device', explore: 'Explore loomlock experiences', emergency: 'Emergency exit',
    expTitle: 'loomlock Experiences', expLine: 'Create <b>real memories</b> at loomlock partnered events',
    expNo: 'No account or loomlock product required!', start: 'Get Started!',
    stTitle: 'Allow Screen Time access', stText: 'loomlock uses Apple Screen Time to control which apps are available during experiences.',
    canSee: 'What loomlock can see', canSeeT: 'Only the name you set for a group of apps to block.',
    cantSee: "What loomlock can't see", cantSeeT: 'Apple shows your apps to you on screen without ever telling loomlock what they are.',
    l1: 'Apps inside app groups', l2: 'Your screen time stats', l3: 'How much you use Instagram', l4: "How often you refresh someone's story",
    protected: 'Protected by Apple · iOS will ask you to confirm', allow: 'Allow access', distractions: '"Distractions"',
    ecTitle: 'Emergency Contacts and Apps', ecText: "In an emergency you'll still be able to make or receive calls, or use apps such as Messages and FaceTime. This requires adding exemptions to Screen Time.",
    ecHow: 'How to set up emergency contacts and apps', ecGo: 'On your iPhone, go to:', ecPath: 'Settings › Screen Time › Always Allowed',
    confirmSetup: 'Confirm Setup', confirmT: 'Please double check these settings so you can safely use your device in an emergency.', goBack: 'Go Back', confirm: 'Confirm',
    fin: 'All Finished!', finT: 'Follow the instructions sent by the organizers to set up your app group before you attend an event. Entry will be much faster!',
    important: 'Important', importantT: 'Always check your app group before an event, and make sure emergency contacts are set up.',
    exps: 'Experiences', active: 'Active experiences', meeting: 'loomlock Meeting', cinema: 'Cinema Mode', expTag: 'Experience',
    scan: 'Scan experience key', groups: 'Experience app groups', allowing: 'Allowing 4 apps', groupNote: 'App group changes take effect when a new session starts',
    ready: 'Ready to Scan', readyT: 'Hold the top of your iPhone near the key', cancel: 'Cancel',
    details: 'Session details', allowed: '4/50 apps allowed. All other apps blocked.', end: 'End experience', howEnd: 'How to end the experience',
  },
  es: {
    tag: '<b style="color:#F5E600;font-weight:600">Construye</b> un mejor día',
    haveDevice: 'Tengo un producto loomlock', explore: 'Explora experiencias loomlock', emergency: 'Salida de emergencia',
    expTitle: 'Experiencias loomlock', expLine: 'Crea <b>recuerdos reales</b> en eventos asociados a loomlock',
    expNo: '¡No necesitas cuenta ni producto loomlock!', start: '¡Empezar!',
    stTitle: 'Permite el acceso a Tiempo de uso', stText: 'loomlock usa Tiempo de uso de Apple para controlar qué apps están disponibles durante las experiencias.',
    canSee: 'Lo que loomlock puede ver', canSeeT: 'Solo el nombre que pones a un grupo de apps a bloquear.',
    cantSee: 'Lo que loomlock no puede ver', cantSeeT: 'Apple te muestra tus apps en pantalla sin decirle nunca a loomlock cuáles son.',
    l1: 'Las apps de tus grupos', l2: 'Tus estadísticas de uso', l3: 'Cuánto usas Instagram', l4: 'Cuántas veces miras una historia',
    protected: 'Protegido por Apple · iOS te pedirá confirmar', allow: 'Permitir acceso', distractions: '"Distracciones"',
    ecTitle: 'Contactos y apps de emergencia', ecText: 'En una emergencia podrás hacer o recibir llamadas, o usar apps como Mensajes y FaceTime. Para ello añade excepciones en Tiempo de uso.',
    ecHow: 'Cómo configurar contactos y apps de emergencia', ecGo: 'En tu iPhone, ve a:', ecPath: 'Ajustes › Tiempo de uso › Siempre permitido',
    confirmSetup: 'Confirmar configuración', confirmT: 'Revisa estos ajustes para poder usar tu dispositivo con seguridad en una emergencia.', goBack: 'Volver', confirm: 'Confirmar',
    fin: '¡Todo listo!', finT: 'Sigue las instrucciones de los organizadores para configurar tu app group antes del evento. ¡Entrarás mucho más rápido!',
    important: 'Importante', importantT: 'Revisa siempre tu app group antes de un evento y asegúrate de tener los contactos de emergencia configurados.',
    exps: 'Experiencias', active: 'Experiencias activas', meeting: 'loomlock Meeting', cinema: 'Cinema Mode', expTag: 'Experiencia',
    scan: 'Escanear key de experiencia', groups: 'App Groups de experiencia', allowing: 'Permitiendo 4 apps', groupNote: 'Los cambios al App Group entran en vigor cuando comienza una nueva sesión',
    ready: 'Listo para escanear', readyT: 'Acerca la parte superior de tu iPhone a la key', cancel: 'Cancelar',
    details: 'Detalles de la sesión', allowed: '4/50 apps permitidas. Todas las demás apps bloqueadas.', end: 'Finalizar experiencia', howEnd: 'Cómo finalizar la experiencia',
  }
};
const S = STR[LANG];
const APPS4 = `<span class="ai uber">Uber</span><span class="ai gm">M</span><span class="ai wa">✆</span><span class="ai sp">≋</span>`;
const MASCOT = (w) => `<img src="${A}mascot.png" style="width:${w}px;display:block;margin:0 auto">`;
const CROWD = `background:radial-gradient(60% 50% at 30% 40%,rgba(255,120,220,.55),transparent),radial-gradient(50% 60% at 75% 30%,rgba(120,160,255,.6),transparent),radial-gradient(80% 70% at 50% 100%,#1a1460,#0b0a30)`;

const SCREENS = {
  welcome: () => `<div class="scr appbg">${statusBar()}
    <div style="position:absolute;top:0;left:0;right:0;height:300px;overflow:hidden"><img src="${A}card_p_boat.jpg" style="width:100%;height:100%;object-fit:cover;transform:scale(1.25)"><div style="position:absolute;inset:0;background:linear-gradient(180deg,transparent 55%,#3f47cf)"></div></div>
    <div style="position:absolute;top:330px;left:0;right:0;text-align:center">
      <img src="${A}logo_icon.png" style="height:44px"><br><img src="${A}logo_word.png" style="height:24px;margin-top:12px"><div style="margin-top:12px;font-size:14px;font-weight:500">${S.tag}</div></div>
    <div class="pad" style="position:absolute;left:0;right:0;top:600px;display:grid;gap:18px">
      <div class="btn blue">${S.haveDevice}</div><div class="btn blue">${S.explore}</div></div>
    <div style="position:absolute;bottom:40px;left:0;right:0;text-align:center"><span class="emerg">${S.emergency}</span></div></div>`,
  expIntro: () => `<div class="scr appbg">${statusBar()}
    <div style="position:absolute;top:0;left:0;right:0;height:210px;${CROWD}"><div style="position:absolute;left:20px;bottom:22px"><div style="font-weight:600;font-size:18px">${S.expTitle}</div><div style="font-size:12px;opacity:.8">loomlock</div></div>
      <div style="position:absolute;right:20px;bottom:18px;width:46px;height:46px;border-radius:50%;background:#4b54e0;display:flex;align-items:center;justify-content:center"><img src="${A}logo_icon.png" style="height:24px"></div></div>
    <div class="pad" style="position:absolute;top:240px;left:0;right:0;text-align:center;font-size:17px;line-height:1.3">${S.expLine}<div style="font-size:12.5px;margin-top:26px;opacity:.9">${S.expNo}</div></div>
    <div class="pad" style="position:absolute;left:0;right:0;bottom:56px"><div class="btn white">${S.start}</div></div></div>`,
  screenTime: () => `<div class="scr" style="background:#16173a">${statusBar()}
    <div style="padding:62px 22px 0;text-align:center">${MASCOT(70)}<div style="font-weight:700;font-size:21px;margin-top:12px">${S.stTitle}</div><div style="font-size:12.5px;line-height:1.4;opacity:.82;margin-top:8px">${S.stText}</div></div>
    <div style="margin:16px 16px 0;padding:14px;border-radius:18px;background:#2a2b52"><div style="font-weight:700;font-size:13.5px">👁 ${S.canSee}</div><div style="font-size:12px;opacity:.8;margin:6px 0 10px">${S.canSeeT}</div>
      <div style="background:#1c1d40;border-radius:12px;padding:10px 12px;font-size:14px;display:flex;gap:10px;align-items:center"><span style="display:grid;grid-template-columns:repeat(3,7px);gap:2px">${'<i style="width:7px;height:7px;border-radius:2px;background:#8b8ff0"></i>'.repeat(9)}</span>${S.distractions}</div></div>
    <div style="margin:12px 16px 0;padding:14px;border-radius:18px;background:#2a2b52"><div style="font-weight:700;font-size:13.5px">🚫 ${S.cantSee}</div><div style="font-size:12px;opacity:.8;margin:6px 0 10px">${S.cantSeeT}</div>
      <div style="background:#1c1d40;border-radius:12px;padding:4px 12px;font-size:12.5px">${[S.l1, S.l2, S.l3, S.l4].map(x => `<div style="padding:9px 0;border-bottom:1px solid #ffffff14">${x}</div>`).join('')}</div></div>
    <div style="position:absolute;bottom:92px;left:0;right:0;text-align:center;font-size:10.5px;opacity:.6">${S.protected}</div>
    <div class="pad" style="position:absolute;left:0;right:0;bottom:30px"><div class="btn solid" style="height:52px;font-size:16px">${S.allow}</div></div></div>`,
  emergency: () => `<div class="scr" style="background:#f3f4fb;color:#111">${statusBar(1)}
    <div style="padding:70px 22px 0;text-align:center">${MASCOT(76)}<div style="font-weight:700;font-size:19px;margin-top:14px">${S.ecTitle}</div><div style="font-size:12.5px;line-height:1.45;color:#333;margin-top:8px;text-align:left">${S.ecText}</div></div>
    <div style="margin:16px 16px 0;padding:12px;border-radius:14px;background:#fff;box-shadow:0 2px 10px #0001"><div style="font-size:11.5px;font-weight:600">❗ ${S.ecHow}</div>
      <div style="margin-top:10px;background:#eef0fb;border-radius:10px;padding:12px;text-align:center;font-size:12px">${S.ecGo}<div class="ecpath" style="font-weight:700;margin-top:6px">${S.ecPath}</div></div></div>
    <div class="pad" style="position:absolute;left:0;right:0;bottom:40px"><div class="btn solid">${S.confirmSetup}</div></div>
    <div class="sheet" style="position:absolute;left:8px;right:8px;bottom:8px;height:330px;border-radius:38px;background:#fff;box-shadow:0 -10px 40px #0003;text-align:center;padding:30px 20px;transform:translateY(110%)">
      ${MASCOT(70)}<div style="color:#3a41c4;font-weight:700;font-size:17px;margin-top:12px">${S.confirmSetup}</div><div style="font-size:12px;color:#333;margin-top:8px;line-height:1.4">${S.confirmT}</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:22px"><div class="btn out">${S.goBack}</div><div class="btn solid cfm">${S.confirm}</div></div></div></div>`,
  finished: () => `<div class="scr" style="background:#bfc0cc;color:#111">
    <div style="position:absolute;left:8px;right:8px;bottom:8px;height:470px;border-radius:38px;background:#fff;text-align:center;padding:34px 22px">
      ${MASCOT(80)}<div style="font-weight:700;font-size:19px;margin-top:14px">${S.fin}</div><div style="font-size:12.5px;color:#333;margin-top:10px;line-height:1.45">${S.finT}</div>
      <div style="margin-top:18px;background:#f3f4fb;border-radius:14px;padding:12px;text-align:left;font-size:11.5px;line-height:1.4"><b>❗ ${S.important}</b><br>${S.importantT}</div></div></div>`,
  dash: () => `<div class="scr appbg" style="background:linear-gradient(180deg,#2c31a8,#3138b4 50%,#2a2f9e)">${statusBar()}
    <div style="padding:66px 18px 0;display:flex;align-items:center;gap:10px;font-weight:600;font-size:19px"><img src="${A}logo_icon.png" style="height:22px">${S.exps}<span style="margin-left:auto;opacity:.8">⚙</span></div>
    <div style="padding:22px 18px 8px;font-size:12px;font-weight:600;opacity:.85">${S.active}</div>
    <div style="margin:0 14px;border-radius:14px;background:#20248a;overflow:hidden">
      <div style="background:linear-gradient(90deg,#3d45d4,#4a52e6);padding:12px 14px;font-size:13px;display:flex;gap:8px;align-items:center"><img src="${A}logo_icon.png" style="height:16px">${S.meeting}</div>
      <div style="padding:10px 14px;display:flex;justify-content:space-between;font-size:11px"><span>▦ ${S.cinema}</span><span style="background:#8fb8ff;color:#1b2390;border-radius:6px;padding:2px 8px;font-weight:700">${S.expTag}</span></div>
      <div style="margin:0 10px 10px;border-radius:8px;background:#3a41cf;text-align:center;padding:6px;font-weight:600">⌛ 18:58</div></div>
    <div class="scanbtn" style="margin:22px auto 0;width:250px;height:50px;border-radius:25px;background:linear-gradient(180deg,#5961ec,#454dd9);display:flex;align-items:center;justify-content:center;gap:8px;font-size:12.5px;font-weight:600;box-shadow:0 8px 20px #0004">${KEY_GLYPH('#fff', 18)}${S.scan}</div>
    <div style="padding:26px 18px 8px;font-size:12px;font-weight:600;opacity:.85">${S.groups}</div>
    <div class="groupcard" style="margin:0 14px;border-radius:14px;background:#151a6a;padding:14px"><div style="font-size:14px">▦ ${S.cinema}<span style="float:right">›</span></div><div style="font-size:11px;opacity:.75;margin:4px 0 10px">${S.allowing}</div><div style="display:flex;gap:6px">${APPS4}</div></div>
    <div style="padding:10px 18px;font-size:9.5px;opacity:.75">❗ ${S.groupNote}</div>
    <div style="position:absolute;bottom:40px;left:0;right:0;text-align:center"><span class="emerg">${S.emergency}</span></div>
    <div class="dim" style="position:absolute;inset:0;background:#000;opacity:0"></div>
    <div class="nfcsheet" style="position:absolute;left:8px;right:8px;bottom:8px;height:400px;border-radius:40px;background:#fff;color:#111;text-align:center;padding:30px 20px;transform:translateY(110%)">
      <div style="font-size:24px;font-weight:600">${S.ready}</div><div style="font-size:12.5px;margin-top:6px;color:#333">${S.readyT}</div>
      <div style="position:relative;width:120px;height:120px;margin:34px auto 0">
        <svg class="nfcphone" width="120" height="120" viewBox="0 0 120 120"><circle cx="60" cy="60" r="55" fill="none" stroke="#1a7cf5" stroke-width="5"/><rect x="42" y="28" width="36" height="62" rx="7" fill="none" stroke="#1a7cf5" stroke-width="4"/></svg>
        <svg class="nfccheck" width="120" height="120" viewBox="0 0 120 120" style="position:absolute;left:0;top:0;opacity:0"><circle cx="60" cy="60" r="55" fill="none" stroke="#1a7cf5" stroke-width="5"/><path d="M36 62 L54 80 L86 42" fill="none" stroke="#1a7cf5" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/></svg></div>
      <div style="position:absolute;left:24px;right:24px;bottom:30px;height:48px;border-radius:24px;background:#1a7cf5;color:#fff;display:flex;align-items:center;justify-content:center;font-weight:600">${S.cancel}</div></div></div>`,
  session: () => `<div class="scr appbg" style="background:linear-gradient(180deg,#2e34ad,#3a42c8 60%,#3238b8)">${statusBar()}
    <div style="position:absolute;top:0;left:0;right:0;height:200px;${CROWD}"><div style="position:absolute;left:20px;bottom:22px"><div style="font-weight:600;font-size:18px">${S.meeting}</div><div style="font-size:12px;opacity:.8">loomlock</div></div>
      <div style="position:absolute;right:20px;bottom:18px;width:46px;height:46px;border-radius:50%;background:#4b54e0;display:flex;align-items:center;justify-content:center"><img src="${A}logo_icon.png" style="height:24px"></div></div>
    <div style="margin:216px 14px 0;border-radius:16px;background:#1a1f78;padding:12px;text-align:center"><div style="font-size:12px;opacity:.85">${S.details}</div>
      <div style="font-size:26px;font-weight:700;margin:8px 0">⌛ 18:58</div>
      <div style="background:#2a30a0;border-radius:8px;padding:8px;font-size:12px">▦ ${S.cinema}</div>
      <div style="background:#2a30a0;border-radius:8px;padding:8px;margin-top:6px;display:flex;gap:6px">${APPS4}</div>
      <div style="font-size:10.5px;opacity:.85;margin-top:10px">${S.allowed}</div></div>
    <div class="endbtn" style="margin:18px auto 0;width:200px;height:42px;border-radius:21px;background:#fff;color:#3a41c4;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:14px">${S.end}</div>
    <div style="position:absolute;bottom:90px;left:0;right:0;text-align:center"><span style="display:inline-block;background:#1a1f78;border-radius:10px;padding:10px 14px;font-size:12px;font-weight:600">▣ ${S.howEnd}</span></div>
    <div style="position:absolute;bottom:34px;left:50%;margin-left:-20px;width:40px;height:40px;border-radius:50%;background:#1a1f78;display:flex;align-items:center;justify-content:center">✕</div></div>`,
  home: () => {
    const cols = ['#ff5a7a', '#ffb02e', '#2ec4ff', '#7a5cff', '#ff7a2e', '#21c27a', '#e94bd8', '#ffd84d', '#4b7bff', '#ff4d4d', '#00c2a8', '#a66bff', '#ff8fb1', '#3dd6ff', '#ffa94d', '#5ad15a', '#c84bff', '#ff6a3d', '#2e9bff', '#ffd23d'];
    return `<div class="scr" style="background:linear-gradient(160deg,#5a3fd0,#2a2fa6 50%,#e05aa0)">${statusBar()}
    <div class="hgrid">${cols.map((c, i) => `<div><div class="ic" style="background:linear-gradient(145deg,${c},${c}bb)"><div class="lk">${LOCK('#fff', 26)}</div></div><div class="lab"></div></div>`).join('')}</div>
    <div class="focus" style="position:absolute;left:20px;right:20px;top:640px;height:64px;border-radius:20px;background:rgba(20,22,80,.85);display:flex;align-items:center;gap:12px;padding:0 16px;font-weight:700;font-size:14px;opacity:0"><img src="${A}logo_icon.png" style="height:28px"><div>loomlock<div style="font-weight:500;font-size:12px;opacity:.8">${LANG === 'es' ? 'Distracciones bloqueadas' : 'Distractions blocked'}</div></div></div>
    <div class="notifs"></div></div>`;
  },
};
const LOCK = (c = '#fff', s = 24) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24"><path d="M7 10V7a5 5 0 0 1 10 0v3" stroke="${c}" stroke-width="2.4" fill="none" stroke-linecap="round"/><rect x="4" y="10" width="16" height="12" rx="3" fill="${c}"/></svg>`;
