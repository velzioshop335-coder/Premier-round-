"use strict";

/* =====================  LOGIQUE DU PROGRAMME  ===================== */
const wk = w => Math.min(w, 8); /* la progression plafonne à la semaine 8, la variété continue sans fin */
const hash = s => { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };
const rng = seed => { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; };
const shuffle = (a, r) => { const b = a.slice(); for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };
const cyc = (a, n) => { const o = []; for (let i = 0; i < n; i++) o.push(a[i % a.length]); return o; };
const fmtS = s => s >= 60 ? Math.floor(s / 60) + " min" + (s % 60 ? " " + (s % 60) + " s" : "") : s + " s";
const bmi = P => P.weight / Math.pow(P.height / 100, 2);
const lvl = w => w <= 2 ? 1 : w <= 4 ? 2 : w <= 6 ? 3 : 4;

const CATS = {
  tech:   { name: "Technique", color: "var(--c-tech)" },
  cardio: { name: "Cardio",    color: "var(--c-cardio)" },
  force:  { name: "Force",     color: "var(--c-force)" },
  mix:    { name: "Circuit",   color: "var(--c-mix)" },
  rec:    { name: "Récup",     color: "var(--c-rec)" }
};

const GOALS = {
  lean:     { name: "Sec et affûté",        desc: "Brûler du gras et dessiner la silhouette", seq: ["K","T","C","P","A","R"], note: "Beaucoup de circuits et de cardio fractionné." },
  athletic: { name: "Athlétique de boxeur", desc: "Épaules, dos, jambes et souffle équilibrés", seq: ["T","P","C","K","A","R"], note: "Un mélange équilibré de technique, force et cardio." },
  muscle:   { name: "Plus massif",          desc: "Prendre du muscle, surtout le haut du corps", seq: ["P","T","P","C","K","R"], note: "Plus de prépa physique, avec un jour haut du corps et un jour bas du corps." },
  cardio:   { name: "Souffle d'acier",      desc: "Endurance pour enchaîner les rounds",       seq: ["C","T","K","C","A","R"], note: "Le cardio passe en premier, la technique reste présente." },
  tone:     { name: "Tonique et dessiné",   desc: "Corps ferme, gainé et tonique",             seq: ["K","P","T","C","A","R"], note: "Circuits, gainage et mouvements complets." }
};

const THEMES = {
  T: { name: "Technique & shadow", blurb: "Apprendre la garde, les déplacements et les coups de base. La qualité compte plus que la vitesse.", plan: [["drill", .25], ["shadow", .45], ["bagorshadow", .30]] },
  C: { name: "Cardio & souffle",   blurb: "Monter ton endurance comme les boxeurs : des efforts suivis de récupérations courtes.", plan: [["cardio", .6], ["shadow", .25], ["core", .15]] },
  P: { name: "Prépa physique",     blurb: "Renforcer tout le corps avec des mouvements simples, pour frapper plus fort et mieux encaisser.", plan: [["strength", .65], ["core", .2], ["shadowlight", .15]] },
  K: { name: "Circuit boxe",       blurb: "Boxe et exercices enchaînés : coups, force et cardio dans la même séance.", plan: [["circuit", .8], ["core", .2]] },
  A: { name: "Agilité & jeu de jambes", blurb: "Des appuis vifs et légers, la base pour esquiver et se placer.", plan: [["agility", .4], ["shadow", .35], ["hiit", .25]] },
  R: { name: "Récup active",       blurb: "Séance douce pour récupérer : shadow léger et mobilité. Garde 50 % d'effort.", plan: [["shadowlight", .4], ["mobility", .6]] }
};

const DAYN = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"], DAYF = ["lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi", "dimanche"];
const DAYS = { 2: ["Lun","Jeu"], 3: ["Lun","Mer","Ven"], 4: ["Lun","Mar","Jeu","Sam"], 5: ["Lun","Mar","Mer","Ven","Sam"], 6: ["Lun","Mar","Mer","Jeu","Ven","Sam"] };
const WEEKNOTE = [
  "", "Découverte : apprends les bases à 5/10 d'effort.", "Même contenu, plus fluide. Garde une technique propre.",
  "Les rounds s'allongent, de nouveaux coups arrivent.", "Semaine charnière : les récupérations raccourcissent.",
  "Les combinaisons à 3-4 coups arrivent, effort 6-7/10.", "Tu tiens maintenant des rounds de 2 minutes.",
  "Intensité haute sur les derniers rounds.", "Niveau plein atteint. Le programme continue ensuite avec de nouveaux exercices, sans date de fin."
];

const COMBOS = {
  1: ["1", "1-1", "1-2", "1-1-2"],
  2: ["1-2-3", "1-2-3-2", "1-2-esquive-2", "2-3-2"],
  3: ["1-2-3-6", "1-2-5-2", "1-1-2-3", "1-6-3-2"],
  4: ["1-2-3-6-3-2", "1-2-roulade-3-2", "1-2-5-6-3", "1-6-3-2-esquive-2"]
};
const TIPS = ["Garde haute, menton rentré", "Expire à chaque coup", "Reviens toujours en garde", "Pivote sur le pied arrière à chaque direct", "Bouge entre deux séries", "Relâche les épaules, serre le poing à l'impact", "Regarde devant toi, pas tes mains", "Reste léger sur les appuis, genoux souples"];

const WARM = [
  { n: "Cercles de bras", cue: "Grands cercles, avant puis arrière" },
  { n: "Rotations du buste", cue: "Pieds ancrés, bras relâchés" },
  { n: "Rotations des hanches", cue: "Grands cercles lents" },
  { n: "Cercles de chevilles", cue: "Une cheville, puis l'autre" },
  { n: "Squats au poids du corps", cue: "Talons au sol, dos droit" },
  { n: "Jumping jacks", cue: "Reste léger sur les appuis", hi: 1, alt: { n: "Jacks sans saut", cue: "Un pied après l'autre, bras en grand" } },
  { n: "Montées de genoux légères", cue: "Rythme tranquille", hi: 1, alt: { n: "Marche genoux hauts", cue: "Sur place, bras actifs" } },
  { n: "Moulinets d'épaules", cue: "Grande amplitude, sans forcer" },
  { n: "Fentes marchées", cue: "Genou avant au-dessus du pied" },
  { n: "Petit trot sur place", cue: "Épaules relâchées", hi: 1, alt: { n: "Marche dynamique sur place", cue: "Balance les bras" } }
];
const COOL = [
  { n: "Pectoraux", cue: "Bras contre un mur, tourne le buste" },
  { n: "Épaules croisées", cue: "Bras tendu devant la poitrine, un côté puis l'autre" },
  { n: "Triceps", cue: "Coude vers le plafond, main dans le dos" },
  { n: "Ischio-jambiers", cue: "Jambe tendue, penche-toi le dos plat" },
  { n: "Quadriceps", cue: "Talon vers la fesse, genoux joints" },
  { n: "Fessiers", cue: "Cheville sur le genou opposé, assis" },
  { n: "Mollets", cue: "Talon arrière au sol, appui au mur" },
  { n: "Posture de l'enfant", cue: "Fesses sur les talons, bras loin devant" },
  { n: "Cou", cue: "Incline doucement l'oreille vers l'épaule" }
];
const DRILLS = [
  { n: "Garde et déplacements", cue: "Avance, recule, glisse sur les côtés sans croiser les pieds", l: 1 },
  { n: "Jab dans le vide", cue: "Détends le bras, reviens vite en garde", l: 1, combo: "1" },
  { n: "Jab + pas en avant", cue: "Le pied avant part en premier, le pied arrière suit", l: 1, combo: "1" },
  { n: "Direct arrière avec rotation", cue: "Pivote le pied arrière, hanche et épaule suivent", l: 1, combo: "2" },
  { n: "Jab-direct lent devant un miroir", cue: "Vérifie la garde : poing près du menton", l: 1, combo: "1-2" },
  { n: "Crochet avant avec pivot", cue: "Coude à hauteur du poing, pivote sur le pied avant", l: 2, combo: "3" },
  { n: "Esquive gauche / droite", cue: "Plie les genoux, pas la taille", l: 2 },
  { n: "Blocage puis riposte", cue: "Garde haute, puis 1-2", l: 2, combo: "1-2" },
  { n: "Retrait du buste", cue: "Recule la tête sans baisser la garde", l: 2 },
  { n: "Roulade sous un crochet imaginaire", cue: "Descends en U sous le coup", l: 3 },
  { n: "Uppercut arrière", cue: "Genoux fléchis, pousse avec la jambe", l: 3, combo: "6" },
  { n: "Crochet arrière", cue: "Rotation du bassin, bras plié à 90°", l: 3, combo: "4" }
];
const AGIL = [
  { n: "Pas chassés latéraux", cue: "Reste bas, pieds jamais croisés" },
  { n: "Pas en carré", cue: "Dessine un carré au sol, garde levée" },
  { n: "Entrer / sortir du jab", cue: "Entre avec le jab, sors tout de suite" },
  { n: "Pivots à 90°", cue: "Pivote sur le pied avant, change d'angle" },
  { n: "Échelle imaginaire", cue: "Pieds dedans, dehors, rapides et légers" },
  { n: "Pas croisés (grapevine)", cue: "Latéral, un pied devant puis derrière" },
  { n: "Avant / arrière rapide", cue: "Petits pas, buste stable" },
  { n: "Rebonds de boxeur", cue: "Petits appuis sur l'avant du pied", hi: 1, alt: { n: "Appuis alternés sur la pointe", cue: "Reste léger, genoux souples" } },
  { n: "Changement de garde", cue: "Alterne gauche / droite avec un petit saut", hi: 1, alt: { n: "Changement de garde sans saut", cue: "Glisse un pied devant l'autre" } }
];
const HIIT = [
  { n: "Jumping jacks", cue: "Rapide mais contrôlé", hi: 1, alt: { n: "Jacks sans saut", cue: "Un pied après l'autre, bras en grand" } },
  { n: "Montées de genoux", cue: "Genoux à hauteur de hanche", hi: 1, alt: { n: "Marche genoux hauts", cue: "Sur place, bras actifs" } },
  { n: "Mountain climbers", cue: "Dos plat, épaules au-dessus des mains", hi: 1, alt: { n: "Mountain climbers lents", cue: "Un genou après l'autre, sans saut" } },
  { n: "Burpees", cue: "Poitrine au sol, saute si tu peux", hi: 1, min: 3, alt: { n: "Burpees sans saut", cue: "Descends, remonte, sans pompe" } },
  { n: "Shadow sprint", cue: "Coups rapides, jab-direct en rafale", combo: "1-2" },
  { n: "Squats rapides", cue: "Cuisses parallèles au sol" },
  { n: "Fentes alternées", cue: "Genou arrière près du sol" },
  { n: "Talons-fesses", cue: "Talons vers les fessiers", hi: 1, alt: { n: "Talons-fesses en marche", cue: "Rythme soutenu" } },
  { n: "Pompes sur les genoux", cue: "Poitrine proche du sol" }
];
const POOL = {
  push: [
    { n: "Pompes sur les genoux", max: 3, cue: "Corps aligné, poitrine vers le sol" },
    { n: "Pompes inclinées (mains sur une chaise)", cue: "Corps droit, coudes à 45°" },
    { n: "Pompes classiques", min: 4, cue: "Ventre serré, coudes à 45°" },
    { n: "Pompes diamant", min: 6, cue: "Mains rapprochées, sollicite les triceps" },
    { n: "Dips sur chaise", min: 2, cue: "Coudes vers l'arrière, descends doucement" },
    { n: "Développé épaules aux haltères", eq: "db", cue: "Pousse au-dessus de la tête, sans cambrer" }
  ],
  pull: [
    { n: "Superman", cue: "Lève bras et jambes, serre le dos" },
    { n: "Rowing inversé sous une table", min: 2, cue: "Corps droit, tire la poitrine vers la table" },
    { n: "Rowing un bras aux haltères", eq: "db", cue: "Dos plat, coude vers la hanche" },
    { n: "Oiseau aux haltères", eq: "db", cue: "Ouvre les bras, serre les omoplates" }
  ],
  legs: [
    { n: "Squats", cue: "Genoux dans l'axe des pieds" },
    { n: "Fentes arrière", cue: "Buste droit, genou près du sol" },
    { n: "Chaise murale", cue: "Dos au mur, cuisses parallèles" },
    { n: "Montées sur chaise", cue: "Pousse avec le talon" },
    { n: "Squat bulgare", min: 5, cue: "Pied arrière posé sur une chaise" },
    { n: "Squats goblet", eq: "db", cue: "Haltère contre la poitrine" },
    { n: "Squats sautés", min: 3, hi: 1, cue: "Réception souple, genoux fléchis" }
  ],
  hinge: [
    { n: "Pont fessier", cue: "Pousse les talons, serre les fessiers" },
    { n: "Pont fessier une jambe", min: 4, cue: "Bassin stable, jambe tendue" },
    { n: "Good morning", cue: "Hanches en arrière, dos plat" },
    { n: "Soulevé de terre roumain aux haltères", eq: "db", cue: "Haltères près des jambes, dos plat" }
  ],
  core: [
    { n: "Planche", cue: "Corps aligné, ventre serré" },
    { n: "Gainage latéral", cue: "Hanches hautes, change de côté à mi-temps" },
    { n: "Dead bug", cue: "Bas du dos collé au sol" },
    { n: "Crunch bicyclette", cue: "Coude vers le genou opposé, lentement" },
    { n: "Relevés de jambes", cue: "Dos plaqué au sol, jambes tendues" },
    { n: "Rotation russe", cue: "Tourne les épaules, pieds au sol si besoin" },
    { n: "Planche avec toucher d'épaule", min: 3, cue: "Bassin immobile" },
    { n: "Hollow hold", min: 4, cue: "Dos plaqué, bras et jambes tendus" }
  ],
  power: [
    { n: "Squat + direct", cue: "Descends, puis explose en frappant le 2" },
    { n: "Coups explosifs en rafale", cue: "Séries de 1-2 à pleine vitesse" },
    { n: "Rotation avec haltère", eq: "db", cue: "Tourne comme pour un crochet" }
  ]
};

const shadowParams = w => ({ work: [60, 75, 90, 90, 105, 120, 120, 120][wk(w) - 1], rest: [45, 45, 45, 40, 40, 40, 35, 30][wk(w) - 1] });
const hiitParams = w => ({ work: [20, 25, 30, 30, 35, 40, 40, 40][wk(w) - 1], rest: [40, 35, 30, 30, 25, 20, 20, 20][wk(w) - 1] });
const runParams = w => ({ run: [60, 75, 90, 120, 150, 180, 210, 240][wk(w) - 1], walk: [90, 75, 60, 60, 45, 45, 45, 30][wk(w) - 1] });

function avail(list, ctx) {
  return list
    .filter(e => (!e.min || ctx.w >= e.min) && (!e.max || ctx.w <= e.max) && (!e.eq || ctx.eq[e.eq]) && (!(e.hi && ctx.low) || e.alt))
    .map(e => (e.hi && ctx.low) ? Object.assign({}, e, { n: e.alt.n, cue: e.alt.cue, hi: 0 }) : e);
}
const trim = items => { if (items.length) items[items.length - 1].rest = 0; return items; };
const uniqLines = arr => { const seen = new Set(); return arr.filter(x => !seen.has(x.t) && seen.add(x.t)); };

/* ---- blocs ---- */
function bWarm(min, ctx) {
  const count = Math.max(4, Math.round(min * 60 / 40));
  const dur = Math.round(min * 60 / count);
  const pool = shuffle(avail(WARM, ctx), ctx.r);
  const items = cyc(pool, count - 1).map(e => ({ label: e.n, cue: e.cue, work: dur, rest: 0 }));
  items.push({ label: "Shadow léger", combo: "1-2", cue: "Jab et direct à 40 %, bouge doucement", work: dur, rest: 0 });
  return { phase: "warm", title: "Échauffement", cat: "rec", items, lines: items.map(i => ({ t: i.label, s: i.cue })), summary: count + " mouvements de " + dur + " s" };
}
function bCool(min, ctx) {
  const count = Math.max(4, Math.round(min * 60 / 40));
  const dur = Math.round(min * 60 / count);
  const pool = shuffle(COOL, ctx.r);
  const items = cyc(pool, count - 1).map(e => ({ label: "Étirement : " + e.n, cue: e.cue, work: dur, rest: 0 }));
  items.push({ label: "Respiration lente", cue: "Inspire 4 s, expire 6 s", work: dur, rest: 0 });
  return { phase: "cool", title: "Retour au calme", cat: "rec", items, lines: items.map(i => ({ t: i.label, s: i.cue })), summary: count + " étirements de " + dur + " s" };
}
function bShadow(m, ctx, o) {
  const sp = shadowParams(ctx.w);
  let work = sp.work, rest = sp.rest;
  if (o.light) { work = Math.min(work, 75); rest = Math.max(rest, 40); }
  const n = Math.max(1, Math.round(m * 60 / (work + rest)));
  const pool = [];
  for (let l = 1; l <= ctx.lvl; l++) if (l >= ctx.lvl - 1) pool.push.apply(pool, COMBOS[l]);
  const combos = cyc(shuffle(pool, ctx.r), n);
  const tips = shuffle(TIPS, ctx.r);
  const items = [];
  for (let i = 0; i < n; i++) {
    const eff = o.light ? "Reste à 50 %, c'est de la récupération active" : i === 0 ? "Premier round à 50 % pour te mettre en route" : (i === n - 1 && n > 2) ? "Dernier round : accélère à 80 %" : "Allure régulière à 65 %";
    const pre = o.bag ? "Garde la distance du sac. " : o.def ? "Après chaque série, esquive ou bloque. " : "";
    items.push({
      label: (o.bag ? "Sac" : o.def ? "Shadow + défense" : "Shadow") + " · round " + (i + 1) + "/" + n,
      combo: combos[i], cue: pre + tips[i % tips.length] + ". " + eff + ".", work, rest
    });
  }
  trim(items);
  return {
    title: o.bag ? "Rounds au sac" : o.def ? "Shadow + défense" : o.light ? "Shadow léger" : "Rounds de shadow",
    cat: o.light ? "rec" : "tech", items,
    lines: items.map((it, i) => ({ t: "Round " + (i + 1), c: it.combo, s: it.cue })),
    summary: n + " round" + (n > 1 ? "s" : "") + " de " + fmtS(work) + ", repos " + fmtS(rest)
  };
}
function bDrill(m, ctx) {
  const pool = DRILLS.filter(d => d.l <= ctx.lvl);
  const n = Math.max(2, Math.round(m));
  const work = ctx.w <= 2 ? 45 : 50, rest = 60 - work;
  const sel = cyc(shuffle(pool, ctx.r), n);
  const items = trim(sel.map(d => ({ label: d.n, combo: d.combo, cue: d.cue, work, rest })));
  return { title: "Technique de base", cat: "tech", items, lines: uniqLines(sel.map(d => ({ t: d.n, c: d.combo, s: d.cue }))), summary: n + " exercices, " + work + " s d'effort" };
}
function bRoad(m, ctx) {
  const i = wk(ctx.w) - 1; let work, rest, wl, rl, cue;
  if (ctx.low) {
    work = [90, 105, 120, 120, 150, 150, 180, 180][i]; rest = [60, 60, 60, 50, 50, 45, 45, 40][i];
    wl = "Marche rapide"; rl = "Marche tranquille"; cue = "Pas longs, bras actifs. Tu dois pouvoir parler par phrases";
  } else {
    const p = runParams(ctx.w); work = p.run; rest = p.walk;
    wl = "Course lente"; rl = "Marche"; cue = "Allure où tu peux encore parler. Dehors ou sur tapis";
  }
  const n = Math.max(2, Math.round(m * 60 / (work + rest)));
  const items = [];
  for (let k = 0; k < n; k++) items.push({ label: wl + " · " + (k + 1) + "/" + n, cue, work, rest, restLabel: rl });
  trim(items);
  return { title: "Roadwork", cat: "cardio", items, lines: [{ t: wl + " " + fmtS(work), s: "puis " + rl.toLowerCase() + " " + fmtS(rest) + ", " + n + " fois. " + cue + "." }], summary: n + " × (" + fmtS(work) + " + " + fmtS(rest) + ")" };
}
function bHiit(m, ctx) {
  const hp = hiitParams(ctx.w);
  const pool = shuffle(avail(HIIT, ctx), ctx.r);
  const n = Math.max(3, Math.round(m * 60 / (hp.work + hp.rest)));
  const sel = cyc(pool, n);
  const items = trim(sel.map(e => ({ label: e.n, combo: e.combo, cue: e.cue, work: hp.work, rest: hp.rest })));
  return { title: "Intervalles HIIT", cat: "cardio", items, lines: uniqLines(sel.map(e => ({ t: e.n, s: e.cue }))), summary: n + " efforts de " + hp.work + " s, repos " + hp.rest + " s" };
}
function bRope(m, ctx) {
  const i = wk(ctx.w) - 1;
  const work = [30, 30, 40, 45, 45, 60, 60, 60][i], rest = [30, 30, 30, 30, 25, 25, 20, 20][i];
  const n = Math.max(3, Math.round(m * 60 / (work + rest)));
  const label = ctx.low ? "Shadow cardio" : "Corde à sauter";
  const cue = ctx.low ? "Frappe en continu, appuis légers, sans saut" : "Petits sauts, poignets seuls. Sans corde, saute dans le vide";
  const items = [];
  for (let k = 0; k < n; k++) items.push({ label: label + " · " + (k + 1) + "/" + n, cue, work, rest });
  trim(items);
  return { title: ctx.low ? "Shadow cardio" : "Corde à sauter", cat: "cardio", items, lines: [{ t: label, s: n + " fois " + work + " s, repos " + rest + " s. " + cue + "." }], summary: n + " × " + work + " s, repos " + rest + " s" };
}
function pickByCats(cats, ctx) {
  const used = new Set(), out = [];
  cats.forEach(c => {
    const cand = shuffle(avail(POOL[c], ctx).filter(e => !used.has(e.n)), ctx.r);
    const fresh = cand.filter(e => !(ctx.usedEx && ctx.usedEx.has(e.n)));
    const pick = (fresh.length ? fresh : cand)[0];
    if (pick) { out.push(pick); used.add(pick.n); if (ctx.usedEx) ctx.usedEx.add(pick.n); }
  });
  return out;
}
function bStrength(m, ctx) {
  const base = { muscle: [45, 30], lean: [40, 20], tone: [40, 20], cardio: [30, 20], athletic: [40, 25] }[ctx.goal];
  const work = base[0] - (ctx.w <= 2 ? 5 : 0), rest = base[1], between = 45;
  let k = m >= 14 ? 6 : 5; if (m < 7) k = 4;
  k = Math.max(3, Math.min(k, Math.floor(m * 60 / (work + rest))));
  const cats = ({
    upper: ["push", "pull", "push", "pull", "core", "power"],
    lower: ["legs", "hinge", "legs", "hinge", "core", "power"],
    full:  ["push", "legs", "pull", "hinge", "power", "core"]
  })[ctx.focus || "full"].slice(0, k);
  const exs = pickByCats(cats, ctx);
  const tourT = exs.length * (work + rest) + between;
  const tours = Math.max(1, Math.min(4, Math.round(m * 60 / tourT)));
  const items = [];
  for (let t = 0; t < tours; t++) {
    exs.forEach((e, j) => {
      const last = j === exs.length - 1;
      items.push({
        label: e.n,
        cue: e.cue + (ctx.goal === "muscle" ? ". Descente lente (3 s)" : "") + (tours > 1 ? " · tour " + (t + 1) + "/" + tours : ""),
        work, rest: last ? rest + between : rest, restLabel: last ? "Repos entre les tours" : undefined
      });
    });
  }
  trim(items);
  const fname = ({ upper: "Force haut du corps", lower: "Force bas du corps", full: "Circuit de force" })[ctx.focus || "full"];
  return { title: fname, cat: "force", items, lines: exs.map(e => ({ t: e.n, s: e.cue })), summary: tours + " tour" + (tours > 1 ? "s" : "") + " de " + exs.length + " exercices, " + work + " s / " + rest + " s" };
}
function bCore(m, ctx) {
  const work = ctx.w >= 4 ? 40 : 30, rest = 15;
  const k = Math.max(2, Math.min(4, Math.floor(m * 60 / (work + rest))));
  const exs = shuffle(avail(POOL.core, ctx), ctx.r).slice(0, k);
  const tours = Math.max(1, Math.min(3, Math.round(m * 60 / (exs.length * (work + rest) + 30))));
  const items = [];
  for (let t = 0; t < tours; t++) exs.forEach((e, j) => {
    const last = j === exs.length - 1;
    items.push({ label: e.n, cue: e.cue + (tours > 1 ? " · tour " + (t + 1) + "/" + tours : ""), work, rest: last ? rest + 30 : rest, restLabel: last ? "Repos entre les tours" : undefined });
  });
  trim(items);
  return { title: "Gainage", cat: "force", items, lines: exs.map(e => ({ t: e.n, s: e.cue })), summary: tours + " tour" + (tours > 1 ? "s" : "") + " de " + exs.length + " exercices, " + work + " s" };
}
function bCircuit(m, ctx) {
  const tourT = 60 + 20 + 3 * 60 + 30;
  const tours = Math.max(1, Math.round(m * 60 / tourT));
  const legs = shuffle(avail(POOL.legs, ctx), ctx.r), push = shuffle(avail(POOL.push, ctx), ctx.r), card = shuffle(avail(HIIT, ctx), ctx.r);
  const pool = []; for (let l = 1; l <= ctx.lvl; l++) if (l >= ctx.lvl - 1) pool.push.apply(pool, COMBOS[l]);
  const combos = cyc(shuffle(pool, ctx.r), tours), tips = shuffle(TIPS, ctx.r);
  const items = [], lines = [];
  for (let t = 0; t < tours; t++) {
    const tg = " · tour " + (t + 1) + "/" + tours;
    const a = legs[t % legs.length], b = push[t % push.length], c = card[t % card.length];
    items.push({ label: "Shadow" + tg, combo: combos[t], cue: tips[t % tips.length] + ". Allure vive, 70 %", work: 60, rest: 20 });
    items.push({ label: a.n, cue: a.cue + tg, work: 40, rest: 20 });
    items.push({ label: b.n, cue: b.cue + tg, work: 40, rest: 20 });
    items.push({ label: c.n, combo: c.combo, cue: c.cue + tg, work: 40, rest: 50, restLabel: "Repos entre les tours" });
    lines.push({ t: "Tour " + (t + 1), s: "Shadow " + combos[t] + " · " + a.n + " · " + b.n + " · " + c.n });
  }
  trim(items);
  return { title: "Circuit boxe", cat: "mix", items, lines, summary: tours + " tour" + (tours > 1 ? "s" : "") + " : shadow + 3 exercices" };
}
function bAgility(m, ctx) {
  const work = ctx.w >= 4 ? 45 : 40, rest = 60 - work;
  const n = Math.max(3, Math.round(m));
  const sel = cyc(shuffle(avail(AGIL, ctx), ctx.r), n);
  const items = trim(sel.map(e => ({ label: e.n, cue: e.cue, work, rest })));
  return { title: "Jeu de jambes", cat: "tech", items, lines: uniqLines(sel.map(e => ({ t: e.n, s: e.cue }))), summary: n + " exercices de " + work + " s" };
}
function bMobility(m, ctx) {
  const n = Math.max(4, Math.round(m * 60 / 45));
  const sel = cyc(shuffle(COOL, ctx.r), n);
  const items = trim(sel.map(e => ({ label: "Mobilité : " + e.n, cue: e.cue + ". Respire lentement", work: 40, rest: 5 })));
  return { title: "Mobilité", cat: "rec", items, lines: uniqLines(sel.map(e => ({ t: e.n, s: e.cue }))), summary: n + " positions de 40 s" };
}
function makeBlock(kind, m, ctx) {
  switch (kind) {
    case "drill": return bDrill(m, ctx);
    case "shadow": return bShadow(m, ctx, {});
    case "shadowlight": return bShadow(m, ctx, { light: 1 });
    case "bagorshadow": return ctx.eq.bag ? bShadow(m, ctx, { bag: 1 }) : bShadow(m, ctx, { def: 1 });
    case "cardio": {
      const modes = ["road", "hiit"].concat(ctx.eq.rope ? ["rope"] : []);
      const k = modes[Math.floor(ctx.r() * modes.length)];
      return k === "road" ? bRoad(m, ctx) : k === "hiit" ? bHiit(m, ctx) : bRope(m, ctx);
    }
    case "hiit": return bHiit(m, ctx);
    case "strength": return bStrength(m, ctx);
    case "strengthA": return bStrength(m, Object.assign({}, ctx, { focus: ctx.focus === "full" ? "upper" : ctx.focus }));
    case "strengthB": return bStrength(m, Object.assign({}, ctx, { focus: ctx.focus === "full" ? "lower" : ctx.focus }));
    case "core": return bCore(m, ctx);
    case "circuit": return bCircuit(m, ctx);
    case "agility": return bAgility(m, ctx);
    case "mobility": return bMobility(m, ctx);
  }
}

function assemble(P, w, idx, scale) {
  const code = GOALS[P.goal].seq[idx];
  const T = THEMES[code];
  const r = rng(hash([P.sex, P.weight, P.height, P.dur, P.freq, P.goal, P.rope, P.bag, P.db, P.nojump, w, idx].join("|")));
  const low = bmi(P) >= 30 || !!P.nojump;
  const occ = GOALS[P.goal].seq.slice(0, idx).filter(c => c === "P").length;
  const focus = code === "P" ? (P.goal === "muscle" ? (occ === 0 ? "upper" : "lower") : (occ === 0 ? "full" : "lower")) : null;
  const ctx = { w, lvl: lvl(w), r, P, low, goal: P.goal, focus, usedEx: new Set(), eq: { rope: !!P.rope, bag: !!P.bag, db: !!P.db } };
  const warmMin = P.dur >= 60 ? 8 : P.dur >= 40 ? 6 : 4;
  const coolMin = P.dur >= 60 ? 5 : P.dur >= 40 ? 4 : 3;
  let plan = T.plan;
  if (code === "P" && P.dur >= 60) plan = [["strengthA", .35], ["strengthB", .3], ["core", .15], ["shadowlight", .2]];
  const mainSec = P.dur * 60 - warmMin * 60 - coolMin * 60 - (plan.length + 1) * 30 - 5;
  const blocks = [bWarm(warmMin, ctx)];
  plan.forEach(p => blocks.push(makeBlock(p[0], mainSec * scale * p[1] / 60, ctx)));
  blocks.push(bCool(coolMin, ctx));
  let total = 5 + (blocks.length - 1) * 30;
  const cats = { tech: 0, cardio: 0, force: 0, mix: 0, rec: 0 };
  blocks.forEach(b => {
    b.sec = b.items.reduce((s, i) => s + i.work + (i.rest || 0), 0);
    total += b.sec;
    if (!b.phase) cats[b.cat] += b.sec / 60;
  });
  const focusName = focus === "upper" ? " · haut du corps" : focus === "lower" ? " · bas du corps" : "";
  return { idx, code, title: T.name + focusName, blurb: T.blurb, blocks, totalSec: total, day: DAYN[P.days[idx]], cats, mainSec };
}
function buildSession(P, w, idx) {
  /* recale la durée réelle sur la durée demandée (2 passes maximum) */
  let scale = 1, best = null;
  for (let k = 0; k < 3; k++) {
    const s = assemble(P, w, idx, scale);
    const diff = P.dur * 60 - s.totalSec;
    if (!best || Math.abs(diff) < Math.abs(best.diff)) best = { s, diff };
    if (diff <= 90 && diff >= -150) break;
    scale = Math.min(2.5, Math.max(0.6, scale * (s.mainSec * scale + diff) / (s.mainSec * scale)));
  }
  return best.s;
}
const weekCache = {};
function weekSessions(P, w) {
  const key = JSON.stringify(P) + "|" + w;
  if (!weekCache[key]) weekCache[key] = Array.from({ length: P.freq }, (_, i) => buildSession(P, w, i));
  return weekCache[key];
}
function flatten(sess) {
  const steps = [{ k: "rest", label: "Prêt ?", cue: "La séance démarre", dur: 5, b: -1, bt: "" }];
  sess.blocks.forEach((b, bi) => {
    const kind = b.phase === "warm" ? "warm" : b.phase === "cool" ? "cool" : "work";
    b.items.forEach(it => {
      steps.push({ k: kind, label: it.label, combo: it.combo, cue: it.cue, dur: it.work, b: bi, bt: b.title });
      if (it.rest > 0) steps.push({ k: "rest", label: it.restLabel || "Récupère", cue: "", dur: it.rest, b: bi, bt: b.title });
    });
    if (bi < sess.blocks.length - 1) steps.push({ k: "rest", label: "Transition", cue: "Bois une gorgée. Ensuite : " + sess.blocks[bi + 1].title, dur: 30, b: bi, bt: b.title });
  });
  return steps;
}
function olympic(P) {
  if (P.sex === "x") return null;
  const cl = P.sex === "f" ? [50, 54, 57, 60, 66, 75] : [51, 57, 63.5, 71, 80, 92];
  const c = cl.find(x => P.weight <= x);
  return c ? "−" + String(c).replace(".", ",") + " kg" : "+" + String(cl[cl.length - 1]) + " kg";
}
function protein(P) {
  const [a, b] = P.goal === "muscle" ? [1.6, 2.0] : P.goal === "lean" ? [1.4, 1.8] : [1.2, 1.6];
  const r5 = x => Math.round(x / 5) * 5;
  return r5(P.weight * a) + "–" + r5(P.weight * b) + " g";
}
const validP = P => P && typeof P.weight === "number" && P.weight >= 30 && P.weight <= 250 && typeof P.height === "number" && P.height >= 120 && P.height <= 230 &&
  [20, 30, 45, 60, 75, 90].indexOf(P.dur) >= 0 && P.freq >= 2 && P.freq <= 6 && Array.isArray(P.days) && P.days.length === P.freq && P.days.every((x, i) => Number.isInteger(x) && x >= 0 && x <= 6 && P.days.indexOf(x) === i) && !!GOALS[P.goal] && ["m", "f", "x"].indexOf(P.sex) >= 0;

/*__UI__*/
/* =====================  INTERFACE  ===================== */
const KEY = "premier-round-v1";
const emptyS = () => ({ profile: null, done: {}, hist: [], weights: [], ts: 0 });
function fixProfile(p) {
  if (p && !p.days && DAYS[p.freq]) p = Object.assign({}, p, { days: DAYS[p.freq].map(n => DAYN.indexOf(n)) });
  return p;
}
function parseState(raw) {
  try {
    const o = typeof raw === "string" ? JSON.parse(raw) : raw;
    if (!o || typeof o !== "object") return null;
    const p = o.profile ? fixProfile(o.profile) : null;
    if (p && !validP(p)) return null;
    const okD = d => typeof d === "string" && /^\d{4}-\d{2}-\d{2}$/.test(d);
    return {
      profile: p, done: o.done || {},
      hist: Array.isArray(o.hist) ? o.hist.filter(h => h && okD(h.d) && h.min > 0 && typeof h.title === "string") : [],
      weights: Array.isArray(o.weights) ? o.weights.filter(x => x && okD(x.d) && x.kg >= 30 && x.kg <= 250) : [],
      ts: +o.ts || 0
    };
  } catch (e) { return null; }
}
let S = emptyS();
try { S = parseState(localStorage.getItem(KEY)) || emptyS(); } catch (e) {}
const save = () => { S.ts = Date.now(); try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} };
const app = document.getElementById("app");
const ui = { view: S.profile ? "home" : "intro", step: 1, draft: null, week: 1, idx: 0, confirm: false, quitAsk: false };
const newDraft = () => ({ sex: null, weight: 75, height: 175, dur: 45, freq: 3, days: [0, 2, 4], goal: null, rope: false, bag: false, db: false, nojump: false });
const doneKey = (w, i) => w + "-" + i;
function currentWeek() {
  if (!S.profile) return 1;
  for (let w = 1; ; w++) { for (let i = 0; i < S.profile.freq; i++) if (!S.done[doneKey(w, i)]) return w; }
}
const weekDone = w => S.profile ? Array.from({ length: S.profile.freq }, (_, i) => !!S.done[doneKey(w, i)]) : [];
const mmss = ms => { const t = Math.ceil(ms / 1000); return Math.floor(t / 60) + ":" + String(t % 60).padStart(2, "0"); };
const fr = n => String(Math.round(n * 10) / 10).replace(".", ",");
const weekNote = w => w <= 8 ? WEEKNOTE[w] :
  (w - 1) % 4 === 3 ? "Semaine plus tranquille : garde la technique propre et baisse l'effort d'un cran si tu es fatigué." :
  ["Tu es au niveau plein. Les exercices changent, l'intensité reste haute.", "Nouvelle semaine, nouveaux enchaînements. Pousse sur les derniers rounds.", "Cherche la précision et le relâchement sur chaque coup."][(w - 9) % 3];
const p2 = n => String(n).padStart(2, "0");
const fmtDate = d => d.getFullYear() + "-" + p2(d.getMonth() + 1) + "-" + p2(d.getDate());
const todayStr = () => fmtDate(new Date());
const dayStr = back => { const d = new Date(); d.setDate(d.getDate() - back); return fmtDate(d); };
const fmtD = s => s.slice(8, 10) + "/" + s.slice(5, 7);
const dayNum = s => Date.UTC(+s.slice(0, 4), +s.slice(5, 7) - 1, +s.slice(8, 10)) / 864e5;
const weekKey = s => { const dow = (new Date(+s.slice(0, 4), +s.slice(5, 7) - 1, +s.slice(8, 10)).getDay() + 6) % 7; return Math.floor((dayNum(s) - dow + 3) / 7); };
const hm = m => m >= 60 ? Math.floor(m / 60) + " h " + p2(m % 60) : m + " min";
function stats() {
  const h = S.hist, mins = h.reduce((a, x) => a + x.min, 0);
  const weeks = new Set(h.map(x => weekKey(x.d)));
  const tk = weekKey(todayStr()); let cur = weeks.has(tk) ? tk : tk - 1, streak = 0;
  while (weeks.has(cur)) { streak++; cur--; }
  const last7 = new Set(Array.from({ length: 7 }, (_, i) => dayStr(i)));
  return { n: h.length, mins, streak, last7: h.filter(x => last7.has(x.d)).length };
}
function logDone(min, title, w, i) { S.hist.push({ k: doneKey(w, i), d: todayStr(), min, title, w, i }); }

const IC = {
  check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
  back: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg>',
  gear: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="3.5"/><path d="M5 20c.8-3.6 3.6-5.5 7-5.5s6.2 1.9 7 5.5"/></svg>',
  close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>',
  fwd: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5l7 7-7 7"/></svg>',
  chart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20V4M4 20h16"/><path d="M8 15l4-5 3 3 5-7"/></svg>',
  play: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>',
  pause: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 5h4v14H7zM13 5h4v14h-4z"/></svg>',
  next: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 5v14l9-7zM17 5h2v14h-2z"/></svg>',
  prev: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M18 5v14l-9-7zM5 5h2v14H5z"/></svg>',
  sound: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9.5v5h4l5 4v-13l-5 4z"/><path d="M16.5 9a4 4 0 010 6"/></svg>',
  mute: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9.5v5h4l5 4v-13l-5 4z"/><path d="M16 9.5l5 5M21 9.5l-5 5"/></svg>'
};

/* ---- accueil / questionnaire ---- */
function viewIntro() {
  const ex = [["Échauffement", 6, "rec"], ["Technique de base", 10, "tech"], ["Rounds de shadow", 12, "tech"], ["Circuit cardio", 8, "cardio"], ["Gainage", 5, "force"], ["Retour au calme", 4, "rec"]];
  return '<main class="wrap intro">' +
    '<div class="eyebrow">Boxe · débutants</div>' +
    '<h1 class="disp xl">Premier<br>Round</h1>' +
    '<p class="lead">Réponds à six questions. L\'appli compose ton programme : technique, cardio et prépa physique. Les séances changent chaque semaine et il n\'y a pas de fin, tu continues tant que tu en as envie.</p>' +
    '<section class="card"><div class="eyebrow">Exemple de séance de 45 min</div>' +
    '<div class="tl" role="img" aria-label="Répartition d\'une séance type">' + ex.map(e => '<i style="flex:' + e[1] + ';background:' + CATS[e[2]].color + '"></i>').join("") + '</div>' +
    '<ul class="tlist">' + ex.map(e => '<li><span class="dot" style="background:' + CATS[e[2]].color + '"></span><span>' + e[0] + '</span><span class="muted">' + e[1] + ' min</span></li>').join("") + '</ul></section>' +
    '<button class="btn" data-act="start">Créer mon programme</button>' +
    '<p class="fine">Tes réponses et ta progression sont enregistrées automatiquement : tu ne les ressaisis pas.</p></main>';
}
function dots() { return '<div class="dots" aria-hidden="true">' + [1, 2, 3, 4, 5, 6].map(i => '<i class="' + (i <= ui.step ? "on" : "") + '"></i>').join("") + '</div>'; }
function navBtns(next, label) {
  return '<div class="nav"><button class="btn ghost" data-act="prev">Retour</button><button class="btn" data-act="' + next + '">' + label + '</button></div>';
}
function viewStep() {
  const d = ui.draft, s = ui.step;
  let body = "";
  if (s === 1) {
    const o = [["m", "Homme", ""], ["f", "Femme", ""], ["x", "Je préfère ne pas préciser", ""]];
    body = '<div class="q"><h1 class="disp h1">Tu es…</h1><p class="muted">Ça sert à affiner tes repères de poids. Le programme reste le même pour tous.</p></div>' +
      '<div class="opts">' + o.map(x => '<button class="opt" data-act="sex" data-v="' + x[0] + '" aria-pressed="' + (d.sex === x[0]) + '"><b>' + x[1] + '</b></button>').join("") + '</div>' +
      '<div class="nav"><button class="btn ghost" data-act="prev">Retour</button><button class="btn" data-act="next"' + (d.sex ? "" : " disabled") + '>Continuer</button></div>';
  } else if (s === 2) {
    const stp = (f, label, unit, v) => '<div class="stepper"><label for="' + f + '">' + label + '</label><div class="srow"><button data-act="dec" data-f="' + f + '" aria-label="Moins">−</button><div class="val"><input id="' + f + '" type="number" inputmode="decimal" min="1" step="1" value="' + v + '"><span class="u">' + unit + '</span></div><button data-act="inc" data-f="' + f + '" aria-label="Plus">+</button></div></div>';
    body = '<div class="q"><h1 class="disp h1">Ton gabarit</h1><p class="muted">Poids et taille servent à adapter l\'impact des exercices et tes repères.</p></div>' +
      stp("weight", "Poids", "kg", d.weight) + stp("height", "Taille", "cm", d.height) +
      '<p class="muted" id="bmiline"></p><p class="err" id="err" role="alert"></p>' + navBtns("next", "Continuer");
  } else if (s === 3) {
    body = '<div class="q"><h1 class="disp h1">Durée d\'une séance</h1><p class="muted">Pour débuter, 30 à 45 minutes suffisent. Échauffement et retour au calme sont compris.</p></div>' +
      '<div class="opts cols3">' + [20, 30, 45, 60, 75, 90].map(x => '<button class="opt ctr" data-act="dur" data-v="' + x + '" aria-pressed="' + (d.dur === x) + '"><b>' + x + '</b><small>minutes</small></button>').join("") + '</div>' + navBtns("next", "Continuer");
  } else if (s === 4) {
    const n = d.days.length;
    const msg = n < 2 ? "Choisis au moins 2 jours." : n === 2 ? "Parfait pour reprendre doucement." : n <= 4 ? "Le bon rythme pour progresser sans te blesser." : "Beaucoup de volume : la dernière séance de la semaine est une récupération active. Écoute ta fatigue.";
    body = '<div class="q"><h1 class="disp h1">Tes jours d\'entraînement</h1><p class="muted">Touche les jours où tu veux t\'entraîner, de 2 à 6 par semaine. Garde si possible un jour de repos entre deux séances.</p></div>' +
      '<div class="opts days">' + DAYN.map((nm, i) => '<button class="opt ctr" data-act="day" data-v="' + i + '" aria-pressed="' + (d.days.indexOf(i) >= 0) + '" aria-label="' + DAYF[i] + '"><b>' + nm + '</b></button>').join("") + '</div>' +
      '<p class="muted">' + n + ' séance' + (n > 1 ? "s" : "") + ' par semaine. ' + msg + '</p>' +
      '<div class="nav"><button class="btn ghost" data-act="prev">Retour</button><button class="btn" data-act="next"' + (n >= 2 ? "" : " disabled") + '>Continuer</button></div>';
  } else if (s === 5) {
    body = '<div class="q"><h1 class="disp h1">Quel corps tu veux ?</h1><p class="muted">Ça règle la part de cardio, de circuits et de force dans tes séances.</p></div>' +
      '<div class="opts">' + Object.keys(GOALS).map(k => '<button class="opt" data-act="goal" data-v="' + k + '" aria-pressed="' + (d.goal === k) + '"><b>' + GOALS[k].name + '</b><small>' + GOALS[k].desc + '</small></button>').join("") + '</div>' +
      '<div class="nav"><button class="btn ghost" data-act="prev">Retour</button><button class="btn" data-act="next"' + (d.goal ? "" : " disabled") + '>Continuer</button></div>';
  } else {
    const tg = [["rope", "Corde à sauter", "Ajoute des séries de corde"], ["bag", "Sac de frappe", "Des rounds au sac à la place de certains shadow"], ["db", "Haltères ou kettlebell", "Des variantes plus chargées en prépa physique"], ["nojump", "Éviter les sauts", "Genoux, dos ou articulations sensibles"]];
    body = '<div class="q"><h1 class="disp h1">Ton matériel</h1><p class="muted">Facultatif. Sans rien, le programme fonctionne très bien.</p></div>' +
      '<div class="opts cols2">' + tg.map(t => '<button class="opt" data-act="tog" data-v="' + t[0] + '" aria-pressed="' + !!d[t[0]] + '"><b>' + t[1] + '</b><small>' + t[2] + '</small></button>').join("") + '</div>' +
      '<div class="nav"><button class="btn ghost" data-act="prev">Retour</button><button class="btn" data-act="finish">Créer mon programme</button></div>';
  }
  return '<main class="wrap">' + dots() + body + '</main>';
}
function updBmi() {
  const d = ui.draft, el = document.getElementById("bmiline");
  if (el) el.textContent = (d.weight >= 30 && d.weight <= 250 && d.height >= 120 && d.height <= 230) ? "IMC indicatif : " + fr(bmi(d)) + (bmi(d) >= 30 ? ". Les sauts seront remplacés par des variantes douces." : "") : "";
}

/* ---- programme ---- */
function viewHome() {
  const P = S.profile, w = ui.week, sess = weekSessions(P, w), dn = weekDone(w), cw = currentWeek();
  const nextI = dn.indexOf(false);
  const G = GOALS[P.goal];
  const mix = { tech: 0, cardio: 0, force: 0, mix: 0, rec: 0 };
  sess.forEach(s => Object.keys(mix).forEach(k => mix[k] += s.cats[k]));
  const tot = Object.keys(mix).reduce((a, k) => a + mix[k], 0) || 1;
  const hasMix = Object.keys(mix).filter(k => mix[k] > 0.4);
  const oly = olympic(P);
  return '<main class="wrap">' +
    '<div class="top"><div class="brand">Premier Round</div><div class="grp"><button class="iconbtn" data-act="track" aria-label="Mon suivi">' + IC.chart + '</button><button class="iconbtn" data-act="profile" aria-label="Mon profil">' + IC.gear + '</button></div></div>' +
    '<section class="hero"><div class="eyebrow">' + G.name + ' · sans date de fin</div>' +
    '<div class="big"><span class="disp h2" style="font-size:1.6rem">Semaine</span><span class="n">' + w + '</span></div>' +
    '<p class="lead">' + weekNote(w) + '</p>' +
    '<div class="segs" aria-label="' + dn.filter(Boolean).length + ' séances faites sur ' + P.freq + '">' + dn.map(x => '<i class="' + (x ? "on" : "") + '"></i>').join("") + '</div>' +
    (nextI >= 0 ? '<button class="btn" data-act="open" data-i="' + nextI + '">Séance ' + (nextI + 1) + ' · ' + sess[nextI].title.split(" · ")[0] + '</button>' :
      '<p class="lead"><b>Semaine terminée.</b> ' + 'Passe à la semaine ' + (w + 1) + ' quand tu veux.' + '</p>') +
    '</section>' +
    '<div class="wk"><button class="iconbtn" data-act="week" data-v="' + (w - 1) + '" aria-label="Semaine précédente"' + (w <= 1 ? " disabled" : "") + '>' + IC.back + '</button><div class="wkl"><b>Semaine ' + w + '</b><span>' + (weekDone(w).every(Boolean) ? "terminée" : w === cw ? "en cours" : w > cw ? "à venir" : "incomplète") + '</span></div><button class="iconbtn" data-act="week" data-v="' + (w + 1) + '" aria-label="Semaine suivante"' + (w >= cw + 1 ? " disabled" : "") + '>' + IC.fwd + '</button></div>' +
    '<div class="rows">' + sess.map((s, i) => {
      const names = []; s.blocks.forEach(b => { if (!b.phase && names.indexOf(b.title) < 0) names.push(b.title); });
      return '<button class="row' + (i === nextI ? " next" : "") + '" data-act="open" data-i="' + i + '"><span class="no">' + (i + 1) + '</span><span><b>' + s.title + '</b><small>' + (w === cw && S.profile.days[i] === ((new Date().getDay() + 6) % 7) ? "Aujourd'hui" : s.day) + ' · ' + Math.round(s.totalSec / 60) + ' min · ' + names.join(" · ") + '</small></span><span class="chk' + (dn[i] ? " on" : "") + '">' + (dn[i] ? IC.check : "") + '</span></button>';
    }).join("") + '</div>' +
    '<section class="card"><div class="eyebrow">Répartition de la semaine</div>' +
    '<div class="mix" role="img" aria-label="Répartition du temps par type d\'effort">' + hasMix.map(k => '<i style="flex:' + mix[k] + ';background:' + CATS[k].color + '"></i>').join("") + '</div>' +
    '<div class="legend">' + hasMix.map(k => '<span><i class="dot" style="background:' + CATS[k].color + '"></i>' + CATS[k].name + ' ' + Math.round(mix[k]) + ' min (' + Math.round(mix[k] / tot * 100) + ' %)</span>').join("") + '</div>' +
    '<p class="muted" style="font-size:.9rem">' + G.note + '</p></section>' +
    '<section class="card"><div class="eyebrow">Tes repères</div><div class="kv">' +
    '<div><b>' + fr(bmi(P)) + '</b><span>IMC, à titre indicatif</span></div>' +
    (oly ? '<div><b>' + oly + '</b><span>Catégorie olympique pour ton poids</span></div>' : '<div><b>' + P.weight + ' kg</b><span>' + P.height + ' cm</span></div>') +
    '<div><b>' + protein(P) + '</b><span>Protéines par jour, repère général</span></div>' +
    '<div><b>' + fr(P.weight * 0.035) + ' L</b><span>Eau par jour, plus s\'il fait chaud</span></div></div>' +
    (bmi(P) >= 30 || P.nojump ? '<p class="muted" style="font-size:.9rem">Ton programme évite les sauts pour ménager les articulations.</p>' : "") +
    '<details><summary>Code des coups</summary><ul class="coups">' +
    [["1", "Jab, direct du bras avant"], ["2", "Direct du bras arrière"], ["3", "Crochet du bras avant"], ["4", "Crochet du bras arrière"], ["5", "Uppercut du bras avant"], ["6", "Uppercut du bras arrière"]].map(c => '<li><span class="mono">' + c[0] + '</span><span>' + c[1] + '</span></li>').join("") +
    '<li><span class="mono">·</span><span>Droitier : pied gauche devant. Gaucher : inverse les côtés.</span></li>' +
    '<li><span class="mono">·</span><span>Pour frapper un sac, prévois des bandes de mains et des gants.</span></li></ul></details>' +
    '</section>' +
    '<p class="fine">Repères généraux, pas un avis médical. Si tu as un doute sur ta santé, demande l\'avis d\'un médecin avant de commencer. Arrête-toi en cas de douleur, de vertige ou de gêne à la poitrine.</p></main>';
}
function viewProfile() {
  const P = S.profile;
  const eq = [P.rope && "corde", P.bag && "sac", P.db && "haltères", P.nojump && "sans sauts"].filter(Boolean).join(", ") || "aucun matériel";
  return '<main class="wrap"><div class="sbar"><button class="iconbtn" data-act="back" aria-label="Retour">' + IC.back + '</button><div class="eyebrow">Mon profil</div></div>' +
    '<h1 class="disp h1">' + GOALS[P.goal].name + '</h1>' +
    '<section class="card"><div class="kv">' +
    '<div><b>' + P.weight + ' kg</b><span>Poids</span></div><div><b>' + P.height + ' cm</b><span>Taille</span></div>' +
    '<div><b>' + P.dur + ' min</b><span>Par séance</span></div><div><b>' + P.freq + ' / sem.</b><span>Fréquence</span></div></div>' +
    '<p class="muted">Jours : ' + P.days.map(i => DAYN[i]).join(", ") + '</p><p class="muted">Matériel : ' + eq + '</p></section>' +
    '<p class="muted">Changer seulement tes jours garde ta progression. Toute autre modification recrée le programme et remet ta progression à zéro.</p>' +
    '<button class="btn" data-act="edit">Modifier mes réponses</button>' +
    '<button class="btn ghost" data-act="reset">' + (ui.confirm ? "Confirmer : tout effacer" : "Effacer mes données") + '</button></main>';
}
function viewSession() {
  const P = S.profile, s = weekSessions(P, ui.week)[ui.idx], isDone = !!S.done[doneKey(ui.week, ui.idx)];
  return '<main class="wrap"><div class="sbar"><button class="iconbtn" data-act="back" aria-label="Retour">' + IC.back + '</button><div class="eyebrow">Semaine ' + ui.week + ' · Séance ' + (ui.idx + 1) + '</div></div>' +
    '<h1 class="disp h1">' + s.title + '</h1><p class="lead">' + s.blurb + '</p>' +
    '<div class="meta"><span class="pill">' + Math.round(s.totalSec / 60) + ' min</span><span class="pill">Prévue ' + DAYF[P.days[ui.idx]] + '</span><span class="pill">Effort 5 à 7 sur 10</span></div>' +
    '<div class="rows">' + s.blocks.map(b =>
      '<section class="blk card" style="border:0;border-radius:0;border-bottom:1px solid var(--line)"><header><h3><i class="dot" style="background:' + CATS[b.cat].color + '"></i>' + b.title + '</h3><span class="min">' + Math.max(1, Math.round(b.sec / 60)) + ' min</span></header>' +
      '<p class="muted" style="font-size:.9rem">' + b.summary + '</p>' +
      '<details><summary>Voir le détail</summary><ul class="lines">' + b.lines.map(l => '<li><b>' + (l.c ? '<span class="mono">' + l.c + '</span>' : "") + l.t + '</b><span>' + l.s + '</span></li>').join("") + '</ul></details></section>').join("") + '</div>' +
    '<div class="cta"><button class="btn tape" data-act="run">' + IC.play + (isDone ? "Refaire la séance" : "Démarrer la séance") + '</button>' +
    '<button class="btn ghost sm" style="width:100%" data-act="toggledone">' + (isDone ? "Marquer comme non faite" : "Marquer comme faite") + '</button></div></main>';
}

/* ---- suivi ---- */
function weightChart(ws) {
  const W = 320, H = 150, pl = 46, pr = 12, pt = 14, pb = 26, iw = W - pl - pr, ih = H - pt - pb;
  const kg = ws.map(x => x.kg), t = ws.map(x => dayNum(x.d));
  const mn = Math.min.apply(null, kg), mx = Math.max.apply(null, kg);
  let lo = mn, hi = mx; if (hi - lo < 1) { lo -= .5; hi += .5; }
  const pad = (hi - lo) * .15; lo -= pad; hi += pad;
  const t0 = t[0], t1 = t[t.length - 1], last = ws.length - 1;
  const X = i => t1 === t0 ? pl + iw / 2 : pl + (t[i] - t0) / (t1 - t0) * iw;
  const Y = v => pt + (hi - v) / (hi - lo) * ih;
  const pts = ws.map((x, i) => X(i).toFixed(1) + "," + Y(x.kg).toFixed(1));
  const txt = 'style="fill:var(--muted);font:700 11px var(--f-mono)"';
  const grid = v => '<line x1="' + pl + '" x2="' + (W - pr) + '" y1="' + Y(v).toFixed(1) + '" y2="' + Y(v).toFixed(1) + '" style="stroke:var(--line);stroke-width:1"/><text x="' + (pl - 6) + '" y="' + (Y(v) + 4).toFixed(1) + '" text-anchor="end" ' + txt + '>' + fr(v) + '</text>';
  const area = last > 0 ? '<path d="M' + pts.join("L") + 'L' + X(last).toFixed(1) + ',' + (pt + ih) + 'L' + X(0).toFixed(1) + ',' + (pt + ih) + 'Z" style="fill:var(--accent);opacity:.12"/>' : "";
  const line = last > 0 ? '<polyline points="' + pts.join(" ") + '" style="fill:none;stroke:var(--accent);stroke-width:2.5;stroke-linejoin:round;stroke-linecap:round"/>' : "";
  const dots = ws.map((x, i) => '<circle cx="' + X(i).toFixed(1) + '" cy="' + Y(x.kg).toFixed(1) + '" r="' + (i === last ? 5 : 3) + '" style="fill:' + (i === last ? "var(--accent)" : "var(--surface)") + ';stroke:var(--accent);stroke-width:2"/>').join("");
  const xl = '<text x="' + pl + '" y="' + (H - 6) + '" text-anchor="start" ' + txt + '>' + fmtD(ws[0].d) + '</text>' + (last > 0 ? '<text x="' + (W - pr) + '" y="' + (H - 6) + '" text-anchor="end" ' + txt + '>' + fmtD(ws[last].d) + '</text>' : "");
  return '<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Courbe de poids en kilogrammes" style="width:100%;height:auto;display:block">' +
    grid(mx) + (mx !== mn ? grid(mn) : "") + area + line + dots + xl + '</svg>';
}
function viewTrack() {
  const st = stats(), ws = S.weights, set = new Set(S.hist.map(h => h.d));
  const letters = ["D", "L", "M", "M", "J", "V", "S"];
  const strip = Array.from({ length: 7 }, (_, i) => dayStr(6 - i)).map(d => '<span class="' + (set.has(d) ? "on" : "") + '" title="' + fmtD(d) + '">' + letters[new Date(+d.slice(0, 4), +d.slice(5, 7) - 1, +d.slice(8, 10)).getDay()] + '</span>').join("");
  const delta = ws.length > 1 ? ws[ws.length - 1].kg - ws[0].kg : 0;
  const dtxt = ws.length > 1 ? (Math.abs(delta) < .05 ? "Poids stable depuis ta première mesure." : (delta > 0 ? "+" : "−") + fr(Math.abs(delta)) + " kg depuis ta première mesure (" + fr(ws[0].kg) + " kg).") : ws.length ? "Ajoute une deuxième mesure pour voir la courbe." : "Pèse-toi une fois par semaine, le matin, pour suivre ta courbe.";
  const feel = ["", "Facile", "Bien", "Dur"];
  const recent = ws.map((x, i) => ({ x, i })).slice(-5).reverse();
  const defW = ws.length ? ws[ws.length - 1].kg : S.profile.weight;
  return '<main class="wrap"><div class="sbar"><button class="iconbtn" data-act="back" aria-label="Retour">' + IC.back + '</button><div class="eyebrow">Mon suivi</div></div>' +
    '<h1 class="disp h1">Ta progression</h1>' +
    '<section class="card"><div class="kv"><div><b>' + st.n + '</b><span>séances terminées</span></div><div><b>' + hm(st.mins) + '</b><span>d\'entraînement</span></div>' +
    '<div><b>' + st.last7 + '</b><span>séances ces 7 derniers jours</span></div><div><b>' + st.streak + ' sem.</b><span>d\'affilée avec au moins une séance</span></div></div>' +
    '<div class="week" aria-label="Séances des 7 derniers jours">' + strip + '</div></section>' +
    '<section class="card"><div class="eyebrow">Poids</div>' + (ws.length ? weightChart(ws) : "") + '<p class="muted" style="font-size:.9rem">' + dtxt + '</p>' +
    '<div class="addw"><div class="val"><input id="wlog" type="number" inputmode="decimal" step="0.1" min="30" max="250" value="' + defW + '" aria-label="Poids du jour en kilogrammes"><span class="u">kg</span></div><button class="btn sm" data-act="addw">Ajouter</button></div>' +
    '<p class="err" role="alert">' + (ui.terr || "") + '</p>' +
    (recent.length ? '<ul class="wl">' + recent.map(r => '<li><span class="mono">' + fmtD(r.x.d) + '</span><b>' + fr(r.x.kg) + ' kg</b><button class="iconbtn" data-act="delw" data-i="' + r.i + '" aria-label="Supprimer la mesure du ' + fmtD(r.x.d) + '">' + IC.close + '</button></li>').join("") + '</ul>' : "") + '</section>' +
    '<section class="card" style="padding-inline:0;padding-bottom:0"><div class="eyebrow" style="padding-inline:16px">Historique</div>' +
    (S.hist.length ? '<ul class="hist">' + S.hist.slice(-20).reverse().map(h => '<li><span class="d">' + fmtD(h.d) + '</span><span><b>' + h.title + '</b><small>Semaine ' + h.w + ' · séance ' + (h.i + 1) + ' · ' + h.min + ' min</small></span>' + (h.feel ? '<span class="pill">' + feel[h.feel] + '</span>' : "") + '</li>').join("") + '</ul>' :
      '<p class="muted" style="padding:0 16px 16px">Aucune séance enregistrée pour le moment. Termine ta première séance et elle apparaîtra ici.</p>') + '</section></main>';
}

/* ---- chrono guidé ---- */
const R = { steps: [], pre: [], tot: 0, i: 0, left: 0, endAt: 0, paused: false, iv: null, lastSec: -1, muted: false, wl: null, sess: null };
let actx = null;
/* Les bips sont de vrais petits fichiers audio (plus fiables sur téléphone que l'oscillateur seul) */
function makeWav(f, d) {
  const sr = 22050, n = Math.floor(sr * d), dv = new DataView(new ArrayBuffer(44 + n * 2));
  const w = (o, s) => { for (let i = 0; i < s.length; i++) dv.setUint8(o + i, s.charCodeAt(i)); };
  w(0, "RIFF"); dv.setUint32(4, 36 + n * 2, true); w(8, "WAVE"); w(12, "fmt "); dv.setUint32(16, 16, true); dv.setUint16(20, 1, true); dv.setUint16(22, 1, true);
  dv.setUint32(24, sr, true); dv.setUint32(28, sr * 2, true); dv.setUint16(32, 2, true); dv.setUint16(34, 16, true); w(36, "data"); dv.setUint32(40, n * 2, true);
  for (let i = 0; i < n; i++) { const env = Math.min(1, i / 200) * Math.pow(1 - i / n, 1.5); dv.setInt16(44 + i * 2, Math.sin(2 * Math.PI * f * i / sr) * env * 26000, true); }
  let bin = ""; const u = new Uint8Array(dv.buffer); for (let i = 0; i < u.length; i++) bin += String.fromCharCode(u[i]);
  return "data:audio/wav;base64," + btoa(bin);
}
const TONES = {};
function initTones() {
  if (TONES.ready) return; TONES.ready = true;
  [[660, .18], [880, .12], [520, .25], [1320, .5]].forEach(t => { try { const a = new Audio(makeWav(t[0], t[1])); a.preload = "auto"; TONES[t[0]] = a; } catch (e) {} });
}
function unlockTones() {
  initTones();
  Object.keys(TONES).forEach(k => { const a = TONES[k]; if (!a || !a.play) return; try { a.muted = true; const p = a.play(); if (p && p.then) p.then(() => { a.pause(); a.currentTime = 0; a.muted = false; }).catch(() => { a.muted = false; }); } catch (e) {} });
}
function beep(f, d, v) {
  if (R.muted) return;
  const a = TONES[f];
  if (a && a.play) {
    try { a.muted = false; a.volume = 1; a.currentTime = 0; const p = a.play(); if (p && p.catch) p.catch(() => beepWA(f, d, v)); return; } catch (e) {}
  }
  beepWA(f, d, v);
}
function beepWA(f, d, v) {
  if (R.muted) return;
  try {
    actx = actx || new (window.AudioContext || window.webkitAudioContext)();
    const o = actx.createOscillator(), g = actx.createGain();
    o.type = "sine"; o.frequency.value = f; g.gain.value = v || .15; o.connect(g); g.connect(actx.destination);
    o.start(); g.gain.exponentialRampToValueAtTime(.0001, actx.currentTime + d); o.stop(actx.currentTime + d + .03);
  } catch (e) {}
}
const bell = () => { beep(1320, .5, .2); setTimeout(() => beep(1320, .5, .2), 200); };
const buzz = p => { try { if (!R.muted && navigator.vibrate) navigator.vibrate(p); } catch (e) {} };
function runStart() {
  const s = weekSessions(S.profile, ui.week)[ui.idx];
  R.sess = s; R.steps = flatten(s); R.pre = []; let c = 0;
  R.steps.forEach(st => { R.pre.push(c); c += st.dur; }); R.tot = c; R.paused = false; ui.quitAsk = false; ui.view = "run";
  unlockTones();
  try { actx = actx || new (window.AudioContext || window.webkitAudioContext)(); actx.resume(); } catch (e) {}
  try { if (navigator.wakeLock) navigator.wakeLock.request("screen").then(l => { R.wl = l; }).catch(() => {}); } catch (e) {}
  go(0);
  clearInterval(R.iv); R.iv = setInterval(tick, 200);
}
function go(i) {
  R.i = i; const st = R.steps[i];
  R.left = st.dur * 1000; R.endAt = Date.now() + R.left; R.lastSec = -1;
  render();
  if (i > 0) { if (st.k === "rest") { beep(520, .25, .15); } else bell(); buzz(st.k === "rest" ? 120 : [120, 60, 120]); }
}
function tick() {
  if (R.paused || ui.view !== "run" || ui.quitAsk) return;
  R.left = Math.max(0, R.endAt - Date.now());
  const sec = Math.ceil(R.left / 1000);
  if (sec !== R.lastSec) {
    R.lastSec = sec;
    if (sec === 5 && R.steps[R.i].dur >= 8) { beep(660, .18, .22); setTimeout(() => beep(660, .18, .22), 240); buzz([80, 60, 80]); }
    else if (sec > 0 && sec <= 3) beep(880, .1, .15);
    updClock();
  }
  if (R.left <= 0) { if (R.i + 1 >= R.steps.length) runFinish(); else go(R.i + 1); }
}
function updClock() {
  const c = document.getElementById("clock"), p = document.getElementById("prog"), nx = document.getElementById("nx");
  if (c) c.textContent = mmss(R.left);
  if (nx) { const s = Math.ceil(R.left / 1000); nx.textContent = (s > 0 && s <= 5 && R.steps[R.i].dur >= 8 ? "Change dans " + s + " s · " : "") + (R.hint || ""); }
  if (p) p.style.width = Math.min(100, (R.pre[R.i] + R.steps[R.i].dur - R.left / 1000) / R.tot * 100) + "%";
}
function runStop() { clearInterval(R.iv); R.iv = null; try { if (R.wl) { R.wl.release(); R.wl = null; } } catch (e) {} }
function runFinish() {
  runStop(); bell(); buzz([200, 100, 200]);
  S.done[doneKey(ui.week, ui.idx)] = true; logDone(Math.max(1, Math.round(R.tot / 60)), R.sess.title, ui.week, ui.idx); save(); ui.view = "done"; render();
}
function viewRun() {
  const st = R.steps[R.i];
  let nx = null; for (let j = R.i + 1; j < R.steps.length; j++) if (R.steps[j].k !== "rest") { nx = R.steps[j]; break; }
  const ph = st.k === "rest" ? "Repos" : st.k === "warm" ? "Échauffement" : st.k === "cool" ? "Retour au calme" : "Effort";
  const hint = nx ? "Ensuite : " + nx.label : "Dernier mouvement";
  R.hint = hint;
  return '<section class="run" data-k="' + st.k + '">' +
    '<div class="rtop"><button class="rbtn" data-act="quitask" aria-label="Quitter">' + IC.close + '</button><div class="t">' + (st.bt || "Prépare-toi") + '<br>' + (R.i + 1) + ' / ' + R.steps.length + '</div><button class="rbtn" data-act="mute" aria-label="' + (R.muted ? "Activer le son" : "Couper le son") + '">' + (R.muted ? IC.mute : IC.sound) + '</button></div>' +
    '<div class="mid"><div class="ph">' + ph + '</div><div class="clock" id="clock">' + mmss(R.left) + '</div>' +
    '<h2>' + st.label + '</h2>' + (st.combo ? '<div class="combo">' + st.combo + '</div>' : "") + (st.cue ? '<p class="cue">' + st.cue + '</p>' : "") + '</div>' +
    '<div class="nx" id="nx">' + hint + '</div>' +
    '<div class="track"><i id="prog" style="width:0"></i></div>' +
    '<div class="ctl"><button data-act="rprev" aria-label="Précédent">' + IC.prev + '</button><button class="main" data-act="pause" aria-label="' + (R.paused ? "Reprendre" : "Pause") + '">' + (R.paused ? IC.play : IC.pause) + '</button><button data-act="rnext" aria-label="Suivant">' + IC.next + '</button></div>' +
    (ui.quitAsk ? '<div class="quit"><div class="box"><h2 class="disp h2">Quitter la séance ?</h2><p class="muted">Elle ne sera pas marquée comme faite.</p><button class="btn" data-act="quitno">Continuer</button><button class="btn ghost" data-act="quityes">Quitter</button></div></div>' : "") +
    '</section>';
}
function viewDone() {
  const s = R.sess, n = weekDone(ui.week).filter(Boolean).length;
  return '<main class="wrap done"><div class="eyebrow">Semaine ' + ui.week + ' · Séance ' + (ui.idx + 1) + '</div><h1 class="disp xl">Bien joué</h1>' +
    '<p class="lead">' + s.title + ' terminée. ' + (n >= S.profile.freq ? "Toute la semaine est faite." : "Encore " + (S.profile.freq - n) + " séance" + (S.profile.freq - n > 1 ? "s" : "") + " cette semaine.") + '</p>' +
    '<div class="stat"><div><b>' + Math.round(R.tot / 60) + '</b><span>minutes</span></div><div><b>' + n + '/' + S.profile.freq + '</b><span>séances cette semaine</span></div></div>' +
    '<p class="muted">Bois de l\'eau, mange un repas avec des protéines, et dors bien : c\'est là que tu progresses.</p>' +
    '<div class="q"><div class="eyebrow">Comment c\'était ?</div><div class="opts cols3">' + [[1, "Facile"], [2, "Bien"], [3, "Dur"]].map(f => '<button class="opt ctr" data-act="feel" data-v="' + f[0] + '" aria-pressed="' + ((S.hist[S.hist.length - 1] || {}).feel === f[0]) + '"><b>' + f[1] + '</b></button>').join("") + '</div></div>' +
    '<button class="btn" data-act="home">Retour au programme</button><button class="btn ghost" data-act="track">Voir mon suivi</button></main>';
}

/* ---- rendu et événements ---- */
function render() {
  const v = ui.view;
  app.innerHTML = v === "intro" ? viewIntro() : v === "step" ? viewStep() : v === "home" ? viewHome() : v === "session" ? viewSession() : v === "profile" ? viewProfile() : v === "track" ? viewTrack() : v === "run" ? viewRun() : viewDone();
  if (v === "step" && ui.step === 2) updBmi();
  if (v === "run") updClock();
}
function setView(v) { ui.view = v; ui.confirm = false; render(); window.scrollTo(0, 0); }
function clampField(f, dir) {
  const lim = f === "weight" ? [30, 250] : [120, 230];
  const d = ui.draft; d[f] = Math.min(lim[1], Math.max(lim[0], Math.round((Number(d[f]) || (f === "weight" ? 75 : 175)) + dir)));
  const el = document.getElementById(f); if (el) el.value = d[f]; updBmi();
}
document.addEventListener("input", e => {
  const t = e.target;
  if (t && (t.id === "weight" || t.id === "height")) { ui.draft[t.id] = parseFloat(String(t.value).replace(",", ".")); updBmi(); const er = document.getElementById("err"); if (er) er.textContent = ""; }
});
document.addEventListener("click", e => {
  const b = e.target.closest("[data-act]"); if (!b) return;
  const a = b.dataset.act, v = b.dataset.v, d = ui.draft;
  switch (a) {
    case "start": ui.draft = newDraft(); ui.step = 1; setView("step"); break;
    case "sex": d.sex = v; render(); break;
    case "dur": d.dur = +v; render(); break;
    case "freq": d.freq = +v; render(); break;
    case "goal": d.goal = v; render(); break;
    case "tog": d[v] = !d[v]; render(); break;
    case "inc": clampField(b.dataset.f, 1); break;
    case "dec": clampField(b.dataset.f, -1); break;
    case "next": {
      if (ui.step === 2) {
        const w = d.weight, h = d.height, er = document.getElementById("err");
        if (!(w >= 30 && w <= 250)) { er.textContent = "Entre un poids entre 30 et 250 kg."; break; }
        if (!(h >= 120 && h <= 230)) { er.textContent = "Entre une taille entre 120 et 230 cm."; break; }
        d.weight = Math.round(w * 10) / 10; d.height = Math.round(h);
      }
      ui.step++; render(); window.scrollTo(0, 0); break;
    }
    case "prev":
      if (ui.step === 1) setView(S.profile ? "profile" : "intro"); else { ui.step--; render(); window.scrollTo(0, 0); }
      break;
    case "finish": {
      const P = Object.assign({}, d);
      P.days = d.days.slice().sort((x, y) => x - y); P.freq = P.days.length;
      if (!validP(P)) break;
      const core = q => JSON.stringify(Object.assign({}, q, { days: null }));
      if (!S.profile || core(P) !== core(S.profile)) S.done = {};
      S.profile = P; save(); ui.week = currentWeek(); setView("home"); break;
    }
    case "day": { const i = +v, k = d.days.indexOf(i); if (k >= 0) d.days.splice(k, 1); else if (d.days.length < 6) d.days.push(i); d.days.sort((x, y) => x - y); d.freq = d.days.length; render(); break; }
    case "profile": setView("profile"); break;
    case "track": ui.terr = ""; setView("track"); break;
    case "addw": {
      const el = document.getElementById("wlog"), kg = parseFloat(String(el ? el.value : "").replace(",", "."));
      if (!(kg >= 30 && kg <= 250)) { ui.terr = "Entre un poids entre 30 et 250 kg."; render(); break; }
      const d = todayStr(), r = Math.round(kg * 10) / 10, ex = S.weights.find(x => x.d === d);
      if (ex) ex.kg = r; else S.weights.push({ d, kg: r });
      S.weights.sort((a, b) => a.d < b.d ? -1 : a.d > b.d ? 1 : 0); ui.terr = ""; save(); render(); break;
    }
    case "delw": S.weights.splice(+b.dataset.i, 1); save(); render(); break;
    case "feel": { const h = S.hist[S.hist.length - 1]; if (h) { h.feel = +v; save(); render(); } break; }
    case "edit": ui.draft = Object.assign(newDraft(), S.profile); ui.draft.days = S.profile.days.slice(); ui.step = 1; setView("step"); break;
    case "reset":
      if (!ui.confirm) { ui.confirm = true; render(); break; }
      S = { profile: null, done: {}, hist: [], weights: [] }; save(); setView("intro"); break;
    case "week": ui.week = +v; render(); break;
    case "open": ui.idx = +b.dataset.i; setView("session"); break;
    case "back": setView("home"); break;
    case "home": ui.week = currentWeek(); setView("home"); break;
    case "toggledone": {
      const k = doneKey(ui.week, ui.idx);
      if (S.done[k]) {
        delete S.done[k];
        for (let j = S.hist.length - 1; j >= 0; j--) if (S.hist[j].k === k) { S.hist.splice(j, 1); break; }
      } else {
        const s = weekSessions(S.profile, ui.week)[ui.idx];
        S.done[k] = true; logDone(Math.max(1, Math.round(s.totalSec / 60)), s.title, ui.week, ui.idx);
      }
      save(); render(); break;
    }
    case "run": runStart(); window.scrollTo(0, 0); break;
    case "pause":
      R.paused = !R.paused; if (!R.paused) R.endAt = Date.now() + R.left; render(); break;
    case "rnext": if (R.i + 1 >= R.steps.length) runFinish(); else go(R.i + 1); break;
    case "rprev": go(Math.max(0, R.i - 1)); break;
    case "mute": R.muted = !R.muted; if (!R.muted) { beep(880, .12); } render(); break;
    case "quitask": ui.quitAsk = true; R.paused = true; render(); break;
    case "quitno": ui.quitAsk = false; R.paused = false; R.endAt = Date.now() + R.left; render(); break;
    case "quityes": runStop(); ui.quitAsk = false; setView("session"); break;
  }
});
ui.week = currentWeek();
render();

/* ---- appli installable : stockage durable + hors ligne ---- */
try { if (navigator.storage && navigator.storage.persist) navigator.storage.persist(); } catch (e) {}
if ("serviceWorker" in navigator && location.protocol !== "file:") {
  window.addEventListener("load", () => { navigator.serviceWorker.register("sw.js").catch(() => {}); });
}
