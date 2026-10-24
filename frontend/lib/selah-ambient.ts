"use client";

// ============================================================
// LILOBA — SELAH · Ambiance sonore vivante (Web Audio)
// ============================================================
// Un paysage sonore GÉNÉRÉ en direct, différent pour chaque état
// du cœur : nappe d'harmoniques lente + petites notes cristallines
// aléatoires + réverbération. Aucun fichier audio : tout est synthétisé
// sur l'appareil, donc 100 % hors ligne et 0 octet à télécharger.
//
// Le son « respire » avec le guide de souffle (swellAmbient) et
// s'éteint en douceur quand la prière se termine.
// ============================================================

import type { SoulState } from "@/lib/selah-content";

interface Profile {
  /** Fréquence fondamentale (Hz) */
  root: number;
  /** Rapports harmoniques de la nappe */
  pad: number[];
  /** Rapports (octave supérieure) des notes cristallines */
  bells: number[];
  /** Brillance de la nappe (Hz) */
  cutoff: number;
  /** Délai min/max entre deux notes (s) */
  bellGap: [number, number];
  /** Niveau global (0..1) */
  level: number;
  wave: OscillatorType;
}

// Rapports en intonation juste (sonorité plus « pure » que le tempérament égal)
const PROFILES: Record<SoulState, Profile> = {
  // Paix : quinte ouverte + neuvième, pentatonique majeure
  paix: { root: 146.83, pad: [1, 3 / 2, 2, 9 / 4], bells: [2, 9 / 4, 5 / 2, 3, 10 / 3, 4], cutoff: 1100, bellGap: [7, 13], level: 0.5, wave: "triangle" },
  // Joie : accord majeur lumineux, notes plus fréquentes
  joie: { root: 220, pad: [1, 5 / 4, 3 / 2, 2], bells: [2, 9 / 4, 5 / 2, 3, 10 / 3, 4], cutoff: 1800, bellGap: [4, 8], level: 0.5, wave: "triangle" },
  // Fatigue : nappe douce et basse, peu de notes
  fatigue: { root: 174.61, pad: [1, 3 / 2, 2], bells: [2, 3], cutoff: 700, bellGap: [10, 18], level: 0.45, wave: "sine" },
  // Inquiétude : bourdon grave et stable qui « ancre »
  angoisse: { root: 130.81, pad: [1, 3 / 2, 2, 3], bells: [3, 4], cutoff: 600, bellGap: [12, 20], level: 0.42, wave: "sine" },
  // Colère : fondation très grave, lente, contenante
  colere: { root: 98, pad: [1, 3 / 2, 2], bells: [4, 6], cutoff: 500, bellGap: [14, 22], level: 0.42, wave: "sine" },
  // Besoin de pardon : tierce mineure qui s'ouvre sur la quinte
  culpabilite: { root: 164.81, pad: [1, 6 / 5, 3 / 2, 2], bells: [2, 12 / 5, 3, 4], cutoff: 800, bellGap: [9, 16], level: 0.45, wave: "sine" },
  // Désert : espace, vide, notes rares et longues
  secheresse: { root: 123.47, pad: [1, 3 / 2, 2], bells: [3, 4, 5], cutoff: 650, bellGap: [12, 20], level: 0.4, wave: "sine" },
};

interface Graph {
  state: SoulState;
  master: GainNode;
  breath: GainNode;
  nodes: AudioNode[];
  oscs: OscillatorNode[];
  timer: number | null;
  level: number;
  /** Jeton d'arrêt : un redémarrage annule l'arrêt programmé. */
  stopId: number;
  dead: boolean;
}

type AudioCtor = typeof AudioContext;

let ctx: AudioContext | null = null;
let graph: Graph | null = null;

function getCtor(): AudioCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as { AudioContext?: AudioCtor; webkitAudioContext?: AudioCtor };
  return w.AudioContext ?? w.webkitAudioContext ?? null;
}

export function isAmbientSupported(): boolean {
  return getCtor() !== null;
}

/**
 * À appeler dans un geste de l'utilisateur (clic) : crée / réveille le moteur.
 * Indispensable sur iOS Safari, qui refuse de démarrer un son sans geste.
 */
export function primeAmbient(): void {
  const Ctor = getCtor();
  if (!Ctor) return;
  try {
    if (!ctx) ctx = new Ctor();
    if (ctx.state === "suspended") void ctx.resume();
  } catch {
    // ignore : pas de son, l'app continue normalement
  }
}

/** Réponse impulsionnelle synthétique : une petite « chapelle » de 3 s. */
function makeImpulse(c: AudioContext, seconds: number, decay: number): AudioBuffer {
  const len = Math.floor(c.sampleRate * seconds);
  const buf = c.createBuffer(2, len, c.sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const data = buf.getChannelData(ch);
    for (let i = 0; i < len; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay);
    }
  }
  return buf;
}

function teardown(g: Graph): void {
  if (g.dead) return;
  g.dead = true;
  if (g.timer !== null) window.clearTimeout(g.timer);
  for (const o of g.oscs) {
    try {
      o.stop();
    } catch {
      // déjà arrêté
    }
  }
  for (const n of g.nodes) {
    try {
      n.disconnect();
    } catch {
      // ignore
    }
  }
  if (graph === g) graph = null;
}

function playBell(c: AudioContext, g: Graph, p: Profile): void {
  const ratio = p.bells[Math.floor(Math.random() * p.bells.length)];
  const t = c.currentTime;
  const o = c.createOscillator();
  const env = c.createGain();
  o.type = "sine";
  o.frequency.value = p.root * ratio;
  env.gain.setValueAtTime(0.0001, t);
  env.gain.exponentialRampToValueAtTime(0.09, t + 0.04);
  env.gain.exponentialRampToValueAtTime(0.0001, t + 5.5);
  o.connect(env);
  env.connect(g.breath);
  o.start(t);
  o.stop(t + 6);
  o.onended = () => {
    try {
      env.disconnect();
      o.disconnect();
    } catch {
      // ignore
    }
  };
}

function scheduleBells(c: AudioContext, g: Graph, p: Profile): void {
  const [min, max] = p.bellGap;
  const wait = (min + Math.random() * (max - min)) * 1000;
  g.timer = window.setTimeout(() => {
    if (g.dead) return;
    playBell(c, g, p);
    scheduleBells(c, g, p);
  }, wait);
}

function build(c: AudioContext, state: SoulState): Graph {
  const p = PROFILES[state];
  const nodes: AudioNode[] = [];
  const oscs: OscillatorNode[] = [];

  const master = c.createGain();
  master.gain.value = 0;
  const breath = c.createGain();
  breath.gain.value = 1;
  const comp = c.createDynamicsCompressor();
  const dry = c.createGain();
  dry.gain.value = 0.7;
  const wet = c.createGain();
  wet.gain.value = 0.5;
  const conv = c.createConvolver();
  conv.buffer = makeImpulse(c, 3.2, 2.4);
  const filter = c.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = p.cutoff;
  filter.Q.value = 0.4;
  const pad = c.createGain();
  pad.gain.value = 0.3;

  // chaîne : nappe → filtre → pad → souffle → (sec + réverb) → master → compresseur → sortie
  filter.connect(pad);
  pad.connect(breath);
  breath.connect(dry);
  breath.connect(conv);
  conv.connect(wet);
  dry.connect(master);
  wet.connect(master);
  master.connect(comp);
  comp.connect(c.destination);
  nodes.push(master, breath, comp, dry, wet, conv, filter, pad);

  // nappe : 2 oscillateurs légèrement désaccordés par harmonique (effet « chœur »)
  const per = 1 / (p.pad.length * 2);
  for (const ratio of p.pad) {
    for (const detune of [-5, 5]) {
      const o = c.createOscillator();
      const og = c.createGain();
      o.type = detune < 0 ? p.wave : "sine";
      o.frequency.value = p.root * ratio;
      o.detune.value = detune;
      og.gain.value = per;
      o.connect(og);
      og.connect(filter);
      o.start();
      oscs.push(o);
      nodes.push(og);
    }
  }

  // respiration lente de la brillance
  const lfo = c.createOscillator();
  const lfoGain = c.createGain();
  lfo.frequency.value = 0.07;
  lfoGain.gain.value = p.cutoff * 0.3;
  lfo.connect(lfoGain);
  lfoGain.connect(filter.frequency);
  lfo.start();
  oscs.push(lfo);
  nodes.push(lfoGain);

  const g: Graph = { state, master, breath, nodes, oscs, timer: null, level: p.level, stopId: 0, dead: false };
  scheduleBells(c, g, p);
  return g;
}

/** Démarre (ou reprend) l'ambiance de l'état donné, avec fondu d'entrée. */
export function startAmbient(state: SoulState): void {
  const Ctor = getCtor();
  if (!Ctor) return;
  try {
    primeAmbient();
    if (!ctx) return;
    // Même ambiance déjà en cours : on la rend simplement audible
    if (graph && !graph.dead && graph.state === state) {
      graph.stopId++; // annule un arrêt en cours
      graph.master.gain.cancelScheduledValues(ctx.currentTime);
      graph.master.gain.setTargetAtTime(graph.level, ctx.currentTime, 1.2);
      return;
    }
    if (graph) teardown(graph);
    const g = build(ctx, state);
    graph = g;
    g.master.gain.setTargetAtTime(g.level, ctx.currentTime, 1.5);
  } catch {
    // ignore
  }
}

/** Pause : le son se retire au fond (sans s'arrêter). */
export function duckAmbient(): void {
  if (!ctx || !graph || graph.dead) return;
  try {
    graph.master.gain.setTargetAtTime(graph.level * 0.18, ctx.currentTime, 0.6);
  } catch {
    // ignore
  }
}

/** Fondu de sortie puis arrêt complet (libère le processeur audio). */
export function stopAmbient(fadeSeconds = 2): void {
  const c = ctx;
  const g = graph;
  if (!c || !g || g.dead) return;
  try {
    g.master.gain.cancelScheduledValues(c.currentTime);
    g.master.gain.setTargetAtTime(0, c.currentTime, Math.max(0.1, fadeSeconds / 3));
  } catch {
    // ignore
  }
  const id = ++g.stopId;
  window.setTimeout(() => {
    if (g.stopId !== id) return; // redémarré entre-temps
    teardown(g);
    if (!graph && ctx && ctx.state === "running") void ctx.suspend().catch(() => {});
  }, fadeSeconds * 1000 + 300);
}

/** Fait « respirer » le son avec le guide de souffle. */
export function swellAmbient(phase: "in" | "hold" | "out", seconds: number): void {
  if (!ctx || !graph || graph.dead) return;
  const target = phase === "out" ? 0.5 : 1;
  try {
    graph.breath.gain.cancelScheduledValues(ctx.currentTime);
    graph.breath.gain.setTargetAtTime(target, ctx.currentTime, Math.max(0.3, seconds / 3));
  } catch {
    // ignore
  }
}
