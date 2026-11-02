import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Menu, X, ArrowUpRight, Flame, ShieldCheck, Gauge, Cpu, Radio, Factory, Fuel,
  Wrench, Globe, Check, Phone, Mail, MapPin, ChevronDown, LoaderCircle,
} from 'lucide-react';

/* ==========================================================================
   INPROTEC homepage. One component file: data, hooks, sections and logic.
   Stack: React + Tailwind (tokens in tailwind.config.js) + lucide-react.
   ========================================================================== */

/* ---------- constants ---------- */
const VIDEO_URL = '/assets/hero-scrub.mp4';
const VIDEO_BYTES = 8819489; // fallback when Content-Length is missing
const POSTER_URL = '/assets/hero-poster.webp';
const REST_URL = '/assets/hero-rest.webp';
const LOGO_URL = '/assets/logo-inprotec-dark.png';

/* The five static-hero gates. Must stay identical to what the CSS would use. */
const GATES = [
  '(max-width: 720px)',
  '(orientation: portrait) and (max-width: 1024px)',
  '(orientation: portrait) and (pointer: coarse)',
  '(orientation: landscape) and (pointer: coarse) and (max-height: 560px)',
  '(prefers-reduced-motion: reduce)',
];

/* Hero bands in scroll progress (0..1 over the pinned hero). The video reaches
   its resting frame at REST_AT, the settle band holds the rest frame after it. */
const REST_AT = 0.86;
const BANDS = [
  { a: 0.0, b: 0.27, ramp: 0.03, ent: 'drift' },
  { a: 0.31, b: 0.55, ramp: 0.03, ent: 'depth' },
  { a: 0.59, b: 0.77, ramp: 0.03, ent: 'rise' },
  { a: 0.8, b: 1.0, ramp: 0.08, ent: 'settle' },
];

/* Form endpoint. Empty = demo mode (frontend-only success state).
   TODO(form-endpoint): set to a Formspree URL, e.g. 'https://formspree.io/f/xxxxxxx',
   or to your own API route. Until then NO message is delivered to anyone. */
const FORM_ENDPOINT = '';

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
const smoothstep = (p, e0, e1) => {
  const t = clamp((p - e0) / (e1 - e0), 0, 1);
  return t * t * (3 - 2 * t);
};
const prefersReduced = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ==========================================================================
   COPY (EN is the source of truth; IT and FR mirror it)
   ========================================================================== */
const COPY = {
  en: {
    skip: 'Skip to content',
    nav: [['solutions', 'Solutions'], ['industries', 'Industries'], ['references', 'References'], ['company', 'Company'], ['contact', 'Contact']],
    cta: 'Talk to an engineer',
    menu: 'Open menu',
    closeMenu: 'Close menu',
    lang: 'Language',
    hero: {
      eyebrow: 'INDUSTRIAL PROCESS TECHNOLOGIES · OVER 25 YEARS',
      h1a: 'From the wellhead to the pump.',
      h1b: 'One partner for the whole chain.',
      sub: 'Control and safety systems for Oil & Gas, chemical and petrochemical plants. Engineered in Italy, commissioned on site worldwide.',
      cta1: 'Talk to an engineer',
      cta2: 'Explore our systems',
      scroll: 'Scroll',
      alt: 'A fuel station canopy lit at night under a deep blue sky',
      loading: 'Loading the journey',
    },
    bands: [
      { tag: '01 · UPSTREAM', title: 'Where the chain begins.', body: 'Wellheads protected by HIPPS. Remote sites watched by SCADA and RTU.' },
      { tag: '02 · PROCESS', title: 'Where every process stays under control.', body: 'DCS, ESD, Fire & Gas and burner management, built to IEC 61508/61511 and NFPA.' },
      { tag: '03 · DISTRIBUTION', title: 'Where energy reaches people.', body: 'Loading and metering systems designed and built in-house.' },
    ],
    sol: {
      eyebrow: 'WHAT WE ENGINEER',
      title: 'Five disciplines. One accountable team.',
      service: 'Service',
      hint: 'Select a card to see what it covers.',
      cards: [
        { id: 'icss', name: 'Automation & Process Control', line: 'Integrated control and safety, designed as one system.', tags: ['ICSS', 'DCS', 'PLC'], items: ['ICSS, Integrated Control & Safety Systems', 'DCS', 'ESD, to IEC 61508/61511 and NFPA', 'Fire & Gas, to IEC 61508, NFPA and EN', 'BMS, to NFPA 85', 'BCS', 'SCADA and RTU', 'HIPPS', 'Conventional PLC'] },
        { id: 'fg', name: 'Fire & Gas Solutions', line: 'Detection and mitigation built to the standard, loop by loop.', tags: ['SIL', 'NFPA', 'EN'], items: ['Fire and gas detection systems', 'Designed to IEC 61508, NFPA and EN', 'SIL-based safety design'] },
        { id: 'ie', name: 'I&E Engineering', line: 'Instrumentation and electrical design that matches the process.', tags: ['I&E'], items: ['Instrumentation engineering', 'Electrical engineering'] },
        { id: 'ei', name: 'Electrical & Instrumentation', line: 'Supply and integration that reach site ready.', tags: ['E&I'], items: ['Electrical and instrumentation supply', 'Integration with the control system'] },
        { id: 'lm', name: 'Loading & Metering Solutions', line: 'Designed, engineered, manufactured and integrated in-house.', tags: ['In-house'], items: ['Design', 'Engineering', 'Manufacturing', 'Integration'] },
        { id: 'cs', name: 'Commissioning & Start-up', line: 'Pre-commissioning, commissioning, installation and supervision on site.', tags: ['On site'], service: true, items: ['Pre-commissioning', 'Commissioning', 'Installation', 'Supervision on site', 'Start-up'] },
        { id: 'co', name: 'Consultancy', line: 'Standards and safety questions answered before the design is frozen.', tags: ['Advisory'], service: true, items: ['Technical consultancy for Oil & Gas, chemical and petrochemical plants'] },
      ],
    },
    strip: {
      label: 'The systems we engineer',
      items: [['ICSS', 'Integrated Control & Safety'], ['DCS', ''], ['ESD', 'IEC 61508/61511 · NFPA'], ['F&G', 'IEC 61508 · NFPA · EN'], ['BMS', 'NFPA 85'], ['BCS', ''], ['SCADA / RTU', ''], ['HIPPS', ''], ['PLC', 'Conventional']],
    },
    chain: {
      eyebrow: 'INDUSTRIES',
      title: 'Follow the chain.',
      sub: 'Pick a stage to see which systems protect it.',
      markets: 'Oil & Gas · Chemical · Petrochemical · Power plants',
      sysLabel: 'Systems on this stage',
      stages: [
        { id: 'up', name: 'Upstream', line: 'Pressure protection at the wellhead and monitoring across remote sites.', systems: ['HIPPS', 'SCADA', 'RTU', 'ESD'], alt: 'Desert horizon at blue hour with the lights of a refinery in the distance' },
        { id: 'pr', name: 'Processing', line: 'One control and safety architecture across the whole plant.', systems: ['ICSS', 'DCS', 'ESD', 'Fire & Gas', 'BMS'], alt: 'A refinery at dusk with distillation columns and pipe racks' },
        { id: 'di', name: 'Distribution', line: 'Accurate transfer, engineered and built in-house.', systems: ['Loading & Metering', 'I&E'], alt: 'A fuel station at night with a car under the canopy' },
      ],
    },
    trust: {
      numbersEyebrow: 'IN NUMBERS',
      stats: [
        { n: 25, plus: true, label: 'years of experience' },
        { n: 9, label: 'system families engineered' },
        { n: 5, label: 'engineering disciplines' },
        { n: 2, label: 'site services: commissioning and consultancy' },
      ],
      stdEyebrow: 'STANDARDS',
      stdTitle: 'Engineered to the standards your safety case relies on.',
      std: ['IEC 61508', 'IEC 61511', 'NFPA', 'NFPA 85', 'EN', 'SIL'],
      refEyebrow: 'REFERENCES',
      refTitle: 'Clients and EPC partners.',
      refSub: 'Operators and contractors named in our reference list.',
      clientsLabel: 'Operators and industry',
      epcLabel: 'EPC partners',
      clients: ['Sonatrach', 'ADNOC', 'Saudi Aramco', 'Shell', 'BP', 'ExxonMobil', 'Chevron', 'Total', 'Petronas', 'Petrobras', 'Sinopec', 'BASF', 'INEOS', 'Saras/Sarlux', 'ISAB', 'Naftal'],
      epc: ['Saipem', 'Tecnimont', 'Technip', 'Petrofac', 'Samsung Engineering', 'JGC', 'Hyundai', 'Techint', 'Bonatti'],
      opEyebrow: 'BUILT FOR OPERATORS LIKE YOU',
      opTitle: 'You answer for uptime and for the safety case. So do we.',
      opBody: 'Joint ventures, operators and EPC contractors across North Africa and the Mediterranean choose a partner on three things. We built our offer around them.',
      benefits: [
        ['Normative compliance', 'Every system follows IEC 61508/61511 and NFPA, from the first drawing.'],
        ['Support on site', 'Commissioning, installation and supervision on site, worldwide.'],
        ['One point of contact', 'One team from engineering to start-up, so nothing gets lost between design and site.'],
      ],
    },
    form: {
      eyebrow: 'CONTACT',
      title: 'Tell us about your plant.',
      stepsTitle: 'What happens next',
      steps: ['An engineer reads your message.', 'We reply with the right questions, not a brochure.', 'We plan a technical call.'],
      office: 'Head office',
      address: 'Via Bizet 44/B, 20092 Cinisello Balsamo (MI), Italy',
      labels: { name: 'Name', company: 'Company', role: 'Role', email: 'Work email', country: 'Country', area: 'Area of interest', message: 'Message' },
      areaPlaceholder: 'Choose an area',
      areas: ['Control & Safety Systems', 'Fire & Gas', 'I&E Engineering', 'Loading & Metering', 'Commissioning', 'Consultancy'],
      consent: 'I agree to the privacy policy',
      send: 'Send to an engineer',
      sending: 'Sending',
      success: 'Message received. An engineer will reply by email.',
      successTitle: 'Thank you.',
      error: 'Something went wrong. Please try again or write to us directly.',
      again: 'Send another message',
      errors: { required: 'This field is required.', email: 'Enter a valid work email.', message: 'Write at least 10 characters.', consent: 'Please accept to continue.' },
    },
    footer: {
      payoff: 'Your requirements, our commitment',
      links: 'Explore',
      legal: ['INPROTEC Industrial Process Technologies S.r.l.', 'Via Bizet 44/B, 20092 Cinisello Balsamo (MI), Italia', 'Cap. soc. € 1.260.000 i.v. · REA 1836792 · P.IVA IT05647510964'],
      privacy: 'Privacy Policy',
      rights: '© 2026 INPROTEC. All rights reserved.',
    },
  },

  it: {
    skip: 'Vai al contenuto',
    nav: [['solutions', 'Soluzioni'], ['industries', 'Settori'], ['references', 'Referenze'], ['company', 'Azienda'], ['contact', 'Contatti']],
    cta: 'Parla con un ingegnere',
    menu: 'Apri il menu',
    closeMenu: 'Chiudi il menu',
    lang: 'Lingua',
    hero: {
      eyebrow: 'INDUSTRIAL PROCESS TECHNOLOGIES · OLTRE 25 ANNI',
      h1a: 'Dal pozzo alla pompa.',
      h1b: 'Un unico partner per tutta la filiera.',
      sub: 'Sistemi di controllo e sicurezza per impianti Oil & Gas, chimici e petrolchimici. Progettati in Italia, avviati in sito in tutto il mondo.',
      cta1: 'Parla con un ingegnere',
      cta2: 'Scopri i nostri sistemi',
      scroll: 'Scorri',
      alt: 'La pensilina di una stazione di servizio illuminata di notte sotto un cielo blu profondo',
      loading: 'Caricamento del percorso',
    },
    bands: [
      { tag: '01 · UPSTREAM', title: 'Dove inizia la filiera.', body: 'Pozzi protetti da HIPPS. Siti remoti sorvegliati da SCADA e RTU.' },
      { tag: '02 · PROCESSO', title: 'Dove ogni processo resta sotto controllo.', body: 'DCS, ESD, Fire & Gas e gestione dei bruciatori, progettati secondo IEC 61508/61511 e NFPA.' },
      { tag: '03 · DISTRIBUZIONE', title: "Dove l'energia raggiunge le persone.", body: 'Sistemi di carico e misura progettati e costruiti internamente.' },
    ],
    sol: {
      eyebrow: 'COSA PROGETTIAMO',
      title: 'Cinque discipline. Un solo team responsabile.',
      service: 'Servizio',
      hint: 'Seleziona una scheda per vedere cosa comprende.',
      cards: [
        { id: 'icss', name: 'Automation & Process Control', line: 'Controllo e sicurezza integrati, progettati come un unico sistema.', tags: ['ICSS', 'DCS', 'PLC'], items: ['ICSS, Integrated Control & Safety Systems', 'DCS', 'ESD, secondo IEC 61508/61511 e NFPA', 'Fire & Gas, secondo IEC 61508, NFPA ed EN', 'BMS, secondo NFPA 85', 'BCS', 'SCADA e RTU', 'HIPPS', 'PLC convenzionali'] },
        { id: 'fg', name: 'Fire & Gas Solutions', line: 'Rilevazione e mitigazione conformi alla norma, loop per loop.', tags: ['SIL', 'NFPA', 'EN'], items: ['Sistemi di rilevazione fuoco e gas', 'Progettati secondo IEC 61508, NFPA ed EN', 'Progettazione di sicurezza basata su SIL'] },
        { id: 'ie', name: 'I&E Engineering', line: 'Progettazione di strumentazione ed elettrica in linea con il processo.', tags: ['I&E'], items: ['Ingegneria della strumentazione', 'Ingegneria elettrica'] },
        { id: 'ei', name: 'Electrical & Instrumentation', line: 'Fornitura e integrazione che arrivano in sito pronte.', tags: ['E&I'], items: ['Fornitura elettrica e di strumentazione', 'Integrazione con il sistema di controllo'] },
        { id: 'lm', name: 'Loading & Metering Solutions', line: 'Progettati, ingegnerizzati, prodotti e integrati internamente.', tags: ['Interno'], items: ['Progettazione', 'Ingegneria', 'Produzione', 'Integrazione'] },
        { id: 'cs', name: 'Commissioning & Start-up', line: 'Pre-commissioning, commissioning, installazione e supervisione in sito.', tags: ['In sito'], service: true, items: ['Pre-commissioning', 'Commissioning', 'Installazione', 'Supervisione in sito', 'Start-up'] },
        { id: 'co', name: 'Consultancy', line: 'Norme e sicurezza chiarite prima che il progetto sia congelato.', tags: ['Consulenza'], service: true, items: ['Consulenza tecnica per impianti Oil & Gas, chimici e petrolchimici'] },
      ],
    },
    strip: {
      label: 'I sistemi che progettiamo',
      items: [['ICSS', 'Integrated Control & Safety'], ['DCS', ''], ['ESD', 'IEC 61508/61511 · NFPA'], ['F&G', 'IEC 61508 · NFPA · EN'], ['BMS', 'NFPA 85'], ['BCS', ''], ['SCADA / RTU', ''], ['HIPPS', ''], ['PLC', 'Convenzionale']],
    },
    chain: {
      eyebrow: 'SETTORI',
      title: 'Segui la filiera.',
      sub: 'Scegli una tappa per vedere quali sistemi la proteggono.',
      markets: 'Oil & Gas · Chimico · Petrolchimico · Centrali elettriche',
      sysLabel: 'Sistemi su questa tappa',
      stages: [
        { id: 'up', name: 'Upstream', line: 'Protezione dalla pressione in testa pozzo e monitoraggio dei siti remoti.', systems: ['HIPPS', 'SCADA', 'RTU', 'ESD'], alt: "Orizzonte del deserto all'ora blu con le luci di una raffineria in lontananza" },
        { id: 'pr', name: 'Processo', line: "Un'unica architettura di controllo e sicurezza su tutto l'impianto.", systems: ['ICSS', 'DCS', 'ESD', 'Fire & Gas', 'BMS'], alt: 'Una raffineria al crepuscolo con colonne di distillazione e rack di tubazioni' },
        { id: 'di', name: 'Distribuzione', line: 'Trasferimento accurato, progettato e costruito internamente.', systems: ['Loading & Metering', 'I&E'], alt: 'Una stazione di servizio di notte con un\'auto sotto la pensilina' },
      ],
    },
    trust: {
      numbersEyebrow: 'IN NUMERI',
      stats: [
        { n: 25, plus: true, label: 'anni di esperienza' },
        { n: 9, label: 'famiglie di sistemi progettate' },
        { n: 5, label: 'discipline di ingegneria' },
        { n: 2, label: 'servizi in sito: commissioning e consulenza' },
      ],
      stdEyebrow: 'NORME',
      stdTitle: 'Progettati secondo le norme su cui poggia il vostro safety case.',
      std: ['IEC 61508', 'IEC 61511', 'NFPA', 'NFPA 85', 'EN', 'SIL'],
      refEyebrow: 'REFERENZE',
      refTitle: 'Clienti e partner EPC.',
      refSub: 'Operatori e contractor citati nella nostra lista referenze.',
      clientsLabel: 'Operatori e industria',
      epcLabel: 'Partner EPC',
      clients: ['Sonatrach', 'ADNOC', 'Saudi Aramco', 'Shell', 'BP', 'ExxonMobil', 'Chevron', 'Total', 'Petronas', 'Petrobras', 'Sinopec', 'BASF', 'INEOS', 'Saras/Sarlux', 'ISAB', 'Naftal'],
      epc: ['Saipem', 'Tecnimont', 'Technip', 'Petrofac', 'Samsung Engineering', 'JGC', 'Hyundai', 'Techint', 'Bonatti'],
      opEyebrow: 'PENSATO PER GLI OPERATORI COME VOI',
      opTitle: 'Rispondete di disponibilità e di safety case. Anche noi.',
      opBody: 'Joint venture, operatori e contractor EPC del Nord Africa e del Mediterraneo scelgono un partner su tre criteri. Abbiamo costruito la nostra offerta intorno a questi.',
      benefits: [
        ['Conformità normativa', 'Ogni sistema segue IEC 61508/61511 e NFPA, dal primo disegno.'],
        ['Supporto in sito', 'Commissioning, installazione e supervisione in sito, in tutto il mondo.'],
        ['Un solo interlocutore', "Un unico team dall'ingegneria allo start-up, perché nulla si perda tra progetto e cantiere."],
      ],
    },
    form: {
      eyebrow: 'CONTATTI',
      title: 'Raccontateci il vostro impianto.',
      stepsTitle: 'Cosa succede dopo',
      steps: ['Un ingegnere legge il vostro messaggio.', 'Rispondiamo con le domande giuste, non con una brochure.', 'Fissiamo una call tecnica.'],
      office: 'Sede',
      address: 'Via Bizet 44/B, 20092 Cinisello Balsamo (MI), Italia',
      labels: { name: 'Nome', company: 'Azienda', role: 'Ruolo', email: 'Email aziendale', country: 'Paese', area: 'Area di interesse', message: 'Messaggio' },
      areaPlaceholder: "Scegli un'area",
      areas: ['Control & Safety Systems', 'Fire & Gas', 'I&E Engineering', 'Loading & Metering', 'Commissioning', 'Consultancy'],
      consent: "Accetto l'informativa sulla privacy",
      send: 'Invia a un ingegnere',
      sending: 'Invio in corso',
      success: 'Messaggio ricevuto. Un ingegnere risponderà via email.',
      successTitle: 'Grazie.',
      error: 'Qualcosa è andato storto. Riprova o scrivici direttamente.',
      again: 'Invia un altro messaggio',
      errors: { required: 'Campo obbligatorio.', email: "Inserisci un'email aziendale valida.", message: 'Scrivi almeno 10 caratteri.', consent: 'Accetta per continuare.' },
    },
    footer: {
      payoff: 'Your requirements, our commitment',
      links: 'Esplora',
      legal: ['INPROTEC Industrial Process Technologies S.r.l.', 'Via Bizet 44/B, 20092 Cinisello Balsamo (MI), Italia', 'Cap. soc. € 1.260.000 i.v. · REA 1836792 · P.IVA IT05647510964'],
      privacy: 'Privacy Policy',
      rights: '© 2026 INPROTEC. Tutti i diritti riservati.',
    },
  },

  fr: {
    skip: 'Aller au contenu',
    nav: [['solutions', 'Solutions'], ['industries', 'Industries'], ['references', 'Références'], ['company', 'Entreprise'], ['contact', 'Contact']],
    cta: 'Parler à un ingénieur',
    menu: 'Ouvrir le menu',
    closeMenu: 'Fermer le menu',
    lang: 'Langue',
    hero: {
      eyebrow: 'INDUSTRIAL PROCESS TECHNOLOGIES · PLUS DE 25 ANS',
      h1a: 'Du puits à la pompe.',
      h1b: 'Un seul partenaire pour toute la chaîne.',
      sub: 'Systèmes de contrôle et de sécurité pour les installations pétrolières et gazières, chimiques et pétrochimiques. Conçus en Italie, mis en service sur site dans le monde entier.',
      cta1: 'Parler à un ingénieur',
      cta2: 'Découvrir nos systèmes',
      scroll: 'Défiler',
      alt: "L'auvent d'une station-service éclairé de nuit sous un ciel bleu profond",
      loading: 'Chargement du parcours',
    },
    bands: [
      { tag: '01 · AMONT', title: 'Là où la chaîne commence.', body: 'Têtes de puits protégées par HIPPS. Sites isolés surveillés par SCADA et RTU.' },
      { tag: '02 · PROCÉDÉ', title: 'Là où chaque procédé reste sous contrôle.', body: 'DCS, ESD, Fire & Gas et gestion des brûleurs, conçus selon IEC 61508/61511 et NFPA.' },
      { tag: '03 · DISTRIBUTION', title: "Là où l'énergie atteint les gens.", body: 'Systèmes de chargement et de comptage conçus et fabriqués en interne.' },
    ],
    sol: {
      eyebrow: 'CE QUE NOUS CONCEVONS',
      title: 'Cinq disciplines. Une seule équipe responsable.',
      service: 'Service',
      hint: 'Sélectionnez une carte pour voir ce qu’elle couvre.',
      cards: [
        { id: 'icss', name: 'Automation & Process Control', line: 'Contrôle et sécurité intégrés, conçus comme un seul système.', tags: ['ICSS', 'DCS', 'PLC'], items: ['ICSS, Integrated Control & Safety Systems', 'DCS', 'ESD, selon IEC 61508/61511 et NFPA', 'Fire & Gas, selon IEC 61508, NFPA et EN', 'BMS, selon NFPA 85', 'BCS', 'SCADA et RTU', 'HIPPS', 'API conventionnels'] },
        { id: 'fg', name: 'Fire & Gas Solutions', line: 'Détection et atténuation conformes à la norme, boucle par boucle.', tags: ['SIL', 'NFPA', 'EN'], items: ['Systèmes de détection feu et gaz', 'Conçus selon IEC 61508, NFPA et EN', 'Conception de sécurité basée sur le SIL'] },
        { id: 'ie', name: 'I&E Engineering', line: "Conception d'instrumentation et d'électricité alignée sur le procédé.", tags: ['I&E'], items: ["Ingénierie d'instrumentation", 'Ingénierie électrique'] },
        { id: 'ei', name: 'Electrical & Instrumentation', line: 'Fourniture et intégration livrées prêtes pour le site.', tags: ['E&I'], items: ["Fourniture électrique et d'instrumentation", 'Intégration avec le système de contrôle'] },
        { id: 'lm', name: 'Loading & Metering Solutions', line: 'Conçus, étudiés, fabriqués et intégrés en interne.', tags: ['En interne'], items: ['Conception', 'Ingénierie', 'Fabrication', 'Intégration'] },
        { id: 'cs', name: 'Commissioning & Start-up', line: 'Pré-commissioning, commissioning, installation et supervision sur site.', tags: ['Sur site'], service: true, items: ['Pré-commissioning', 'Commissioning', 'Installation', 'Supervision sur site', 'Démarrage'] },
        { id: 'co', name: 'Consultancy', line: 'Normes et sécurité clarifiées avant que la conception ne soit figée.', tags: ['Conseil'], service: true, items: ['Conseil technique pour installations pétrolières et gazières, chimiques et pétrochimiques'] },
      ],
    },
    strip: {
      label: 'Les systèmes que nous concevons',
      items: [['ICSS', 'Integrated Control & Safety'], ['DCS', ''], ['ESD', 'IEC 61508/61511 · NFPA'], ['F&G', 'IEC 61508 · NFPA · EN'], ['BMS', 'NFPA 85'], ['BCS', ''], ['SCADA / RTU', ''], ['HIPPS', ''], ['PLC', 'Conventionnel']],
    },
    chain: {
      eyebrow: 'INDUSTRIES',
      title: 'Suivez la chaîne.',
      sub: 'Choisissez une étape pour voir quels systèmes la protègent.',
      markets: 'Pétrole & Gaz · Chimie · Pétrochimie · Centrales électriques',
      sysLabel: 'Systèmes sur cette étape',
      stages: [
        { id: 'up', name: 'Amont', line: 'Protection contre la pression en tête de puits et surveillance des sites isolés.', systems: ['HIPPS', 'SCADA', 'RTU', 'ESD'], alt: "Horizon du désert à l'heure bleue avec les lumières d'une raffinerie au loin" },
        { id: 'pr', name: 'Procédé', line: "Une seule architecture de contrôle et de sécurité sur toute l'installation.", systems: ['ICSS', 'DCS', 'ESD', 'Fire & Gas', 'BMS'], alt: 'Une raffinerie au crépuscule avec colonnes de distillation et racks de tuyauterie' },
        { id: 'di', name: 'Distribution', line: 'Transfert précis, conçu et fabriqué en interne.', systems: ['Loading & Metering', 'I&E'], alt: "Une station-service de nuit avec une voiture sous l'auvent" },
      ],
    },
    trust: {
      numbersEyebrow: 'EN CHIFFRES',
      stats: [
        { n: 25, plus: true, label: "ans d'expérience" },
        { n: 9, label: 'familles de systèmes conçues' },
        { n: 5, label: "disciplines d'ingénierie" },
        { n: 2, label: 'services sur site : commissioning et conseil' },
      ],
      stdEyebrow: 'NORMES',
      stdTitle: 'Conçus selon les normes sur lesquelles repose votre dossier de sécurité.',
      std: ['IEC 61508', 'IEC 61511', 'NFPA', 'NFPA 85', 'EN', 'SIL'],
      refEyebrow: 'RÉFÉRENCES',
      refTitle: 'Clients et partenaires EPC.',
      refSub: 'Opérateurs et contractants cités dans notre liste de références.',
      clientsLabel: 'Opérateurs et industrie',
      epcLabel: 'Partenaires EPC',
      clients: ['Sonatrach', 'ADNOC', 'Saudi Aramco', 'Shell', 'BP', 'ExxonMobil', 'Chevron', 'Total', 'Petronas', 'Petrobras', 'Sinopec', 'BASF', 'INEOS', 'Saras/Sarlux', 'ISAB', 'Naftal'],
      epc: ['Saipem', 'Tecnimont', 'Technip', 'Petrofac', 'Samsung Engineering', 'JGC', 'Hyundai', 'Techint', 'Bonatti'],
      opEyebrow: 'CONÇU POUR LES OPÉRATEURS COMME VOUS',
      opTitle: 'Vous répondez de la disponibilité et du dossier de sécurité. Nous aussi.',
      opBody: "Les joint-ventures, opérateurs et contractants EPC d'Afrique du Nord et de Méditerranée choisissent un partenaire sur trois critères. Nous avons construit notre offre autour d'eux.",
      benefits: [
        ['Conformité normative', 'Chaque système suit IEC 61508/61511 et NFPA, dès le premier plan.'],
        ['Support sur site', 'Commissioning, installation et supervision sur site, dans le monde entier.'],
        ['Un seul interlocuteur', "Une seule équipe de l'ingénierie au démarrage, pour que rien ne se perde entre étude et chantier."],
      ],
    },
    form: {
      eyebrow: 'CONTACT',
      title: 'Parlez-nous de votre installation.',
      stepsTitle: 'La suite',
      steps: ['Un ingénieur lit votre message.', 'Nous répondons avec les bonnes questions, pas avec une brochure.', 'Nous planifions un appel technique.'],
      office: 'Siège',
      address: 'Via Bizet 44/B, 20092 Cinisello Balsamo (MI), Italie',
      labels: { name: 'Nom', company: 'Entreprise', role: 'Fonction', email: 'Email professionnel', country: 'Pays', area: "Domaine d'intérêt", message: 'Message' },
      areaPlaceholder: 'Choisissez un domaine',
      areas: ['Control & Safety Systems', 'Fire & Gas', 'I&E Engineering', 'Loading & Metering', 'Commissioning', 'Consultancy'],
      consent: "J'accepte la politique de confidentialité",
      send: 'Envoyer à un ingénieur',
      sending: 'Envoi en cours',
      success: 'Message reçu. Un ingénieur répondra par email.',
      successTitle: 'Merci.',
      error: 'Une erreur est survenue. Réessayez ou écrivez-nous directement.',
      again: 'Envoyer un autre message',
      errors: { required: 'Ce champ est obligatoire.', email: 'Saisissez un email professionnel valide.', message: 'Écrivez au moins 10 caractères.', consent: 'Veuillez accepter pour continuer.' },
    },
    footer: {
      payoff: 'Your requirements, our commitment',
      links: 'Explorer',
      legal: ['INPROTEC Industrial Process Technologies S.r.l.', 'Via Bizet 44/B, 20092 Cinisello Balsamo (MI), Italia', 'Cap. soc. € 1.260.000 i.v. · REA 1836792 · P.IVA IT05647510964'],
      privacy: 'Privacy Policy',
      rights: '© 2026 INPROTEC. Tous droits réservés.',
    },
  },
};

const CARD_ICONS = { icss: Cpu, fg: Flame, ie: Gauge, ei: Factory, lm: Fuel, cs: Wrench, co: ShieldCheck };
const STAGE_IMG = { up: '/assets/chain-upstream.webp', pr: '/assets/chain-processing.webp', di: '/assets/chain-distribution.webp' };
const LANGS = ['en', 'it', 'fr'];

/* ==========================================================================
   Small shared pieces
   ========================================================================== */

/* Entrance on scroll-into-view with staggered delay that is retired afterwards. */
function useInView(threshold = 0.18) {
  const ref = useRef(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    if (prefersReduced() || typeof IntersectionObserver === 'undefined') {
      setSeen(true);
      return undefined;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setSeen(true);
          io.disconnect();
        }
      },
      { threshold },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);
  return [ref, seen];
}

function Reveal({ children, className = '', delay = 0, as: Tag = 'div' }) {
  const [ref, seen] = useInView(0.12);
  const [settled, setSettled] = useState(false);
  useEffect(() => {
    if (!seen) return undefined;
    const id = setTimeout(() => setSettled(true), 1400 + delay);
    return () => clearTimeout(id);
  }, [seen, delay]);
  return (
    <Tag
      ref={ref}
      style={{ transitionDelay: seen && !settled ? `${delay}ms` : '0ms' }}
      className={`transition-[opacity,transform] duration-700 ease-brand motion-reduce:transition-none ${
        seen ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0 motion-reduce:translate-y-0 motion-reduce:opacity-100'
      } ${className}`}
    >
      {children}
    </Tag>
  );
}

function Eyebrow({ children }) {
  return (
    <p className="font-mono text-xs font-medium uppercase tracking-[0.25em] text-inprotec-rose">{children}</p>
  );
}

/* Stylised P&ID valve node: the signature of the brand. Lit = the line reached it. */
function Valve({ lit, className = '' }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={`h-6 w-6 transition-colors duration-700 ease-brand ${lit ? 'text-inprotec-red' : 'text-white/30'} ${className}`}
    >
      <circle cx="12" cy="12" r="10.5" className="fill-inprotec-ink" stroke="currentColor" strokeWidth="1.5" />
      <path d="M6.5 8.5l11 7v-7l-11 7z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

/* A section shell with the process-line valve node attached on large screens. */
function Section({ id, children, className = '' }) {
  const [ref, seen] = useInView(0.05);
  return (
    <section id={id} ref={ref} className={`relative scroll-mt-20 py-24 sm:py-32 ${className}`}>
      <div className="pointer-events-none absolute left-3 top-24 hidden lg:block sm:top-32 xl:left-7">
        <Valve lit={seen} />
      </div>
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:pl-24 lg:pr-10 xl:pl-28">{children}</div>
    </section>
  );
}

function CountUp({ to, plus, label }) {
  const [ref, seen] = useInView(0.4);
  const [val, setVal] = useState(prefersReduced() ? to : 0);
  useEffect(() => {
    if (!seen) return undefined;
    if (prefersReduced()) {
      setVal(to);
      return undefined;
    }
    let raf;
    const t0 = performance.now();
    const dur = 1400;
    const step = (now) => {
      const p = clamp((now - t0) / dur, 0, 1);
      setVal(Math.round(to * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [seen, to]);
  return (
    <div ref={ref} className="border-t border-white/15 pt-6">
      <p className="font-chivo text-6xl font-bold leading-none tracking-tight text-inprotec-text sm:text-7xl">
        {val}
        {plus ? <span className="bg-gradient-to-r from-inprotec-red to-inprotec-rose bg-clip-text text-transparent">+</span> : null}
      </p>
      <p className="mt-3 max-w-[22ch] text-sm leading-snug text-inprotec-muted">{label}</p>
    </div>
  );
}

/* Word-split headline. Each word carries --th; the band's --k drives assembly. */
const ENT_CLASS = {
  drift:
    '[--kc:clamp(0,calc((var(--k,0)_-_var(--th,0))*2.8),1)] opacity-[var(--kc)] [transform:translateY(calc((1_-_var(--kc))*-26px))]',
  depth:
    '[--kc:clamp(0,calc((var(--k,0)_-_var(--th,0))*2.8),1)] opacity-[var(--kc)] [transform:scale(calc(0.8_+_0.2*var(--kc)))]',
  rise:
    '[--kc:clamp(0,calc((var(--k,0)_-_var(--th,0))*2.8),1)] opacity-[var(--kc)] [transform:translateY(calc((1_-_var(--kc))*30px))]',
  settle:
    '[--kc:clamp(0,calc((var(--k,0)_-_var(--th,0))*3),1)] opacity-[var(--kc)] [transform:translateY(calc((1_-_var(--kc))*32px))]',
};

function Words({ text, ent, grad = false, offset = 0, step = 0.07 }) {
  const words = text.split(' ');
  return (
    <>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {words.map((w, i) => (
          <span
            key={`${w}-${i}`}
            style={{ '--th': (offset + i * step).toFixed(3) }}
            className={`mr-[0.22em] inline-block will-change-transform ${ENT_CLASS[ent]} ${
              grad ? 'bg-gradient-to-r from-inprotec-red2 via-inprotec-rose to-inprotec-rose bg-clip-text text-transparent [text-shadow:none] [filter:drop-shadow(0_2px_10px_rgba(10,11,13,0.85))]' : ''
            }`}
          >
            {w}
          </span>
        ))}
      </span>
    </>
  );
}

/* ==========================================================================
   Hero. Two modes decided live by the five gates.
   ========================================================================== */

const h1Cls =
  'mt-4 font-chivo text-5xl font-bold leading-[0.95] tracking-tight text-inprotec-text sm:text-6xl lg:text-[clamp(2.75rem,min(4.4vw,8.2vh),6.5rem)]';

function SettleHead({ t, staged }) {
  /* staged = true inside the scrub hero (driven by --k), false in the static hero. */
  return (
    <div className="max-w-[min(68rem,92vw)]">
      <p className="font-mono text-[0.7rem] font-medium uppercase tracking-[0.25em] text-inprotec-rose sm:text-xs">
        {t.hero.eyebrow}
      </p>
      <h1 className={h1Cls}>
        {staged ? (
          <>
            <Words text={t.hero.h1a} ent="settle" step={0.05} />
            <br />
            <Words text={t.hero.h1b} ent="settle" grad offset={0.2} step={0.05} />
          </>
        ) : (
          <>
            {t.hero.h1a} <br />
            <span className="bg-gradient-to-r from-inprotec-red2 via-inprotec-rose to-inprotec-rose bg-clip-text text-transparent [text-shadow:none]">{t.hero.h1b}</span>
          </>
        )}
      </h1>
    </div>
  );
}

function SettleFoot({ t, staged }) {
  const subCls = staged
    ? '[--ks:clamp(0,calc((var(--k,0)_-_0.66)*4),1)] opacity-[var(--ks)] [transform:translateY(calc((1_-_var(--ks))*16px))]'
    : '';
  const ctaCls = staged
    ? '[--kb:clamp(0,calc((var(--k,0)_-_0.78)*5),1)] opacity-[var(--kb)] [transform:translateY(calc((1_-_var(--kb))*16px))]'
    : '';
  return (
    <div className="max-w-[min(40rem,92vw)]">
      <p className={`max-w-[52ch] text-base leading-relaxed text-inprotec-text sm:text-lg ${subCls}`}>{t.hero.sub}</p>
      <div className={`pointer-events-auto mt-7 flex flex-col gap-3 sm:flex-row ${ctaCls}`}>
        <a
          href="#contact"
          className="group relative inline-flex items-center justify-center gap-2 rounded-sm bg-inprotec-red px-6 py-3.5 text-sm font-semibold uppercase tracking-wider text-white shadow-2xl shadow-inprotec-red/30 transition-colors duration-300 ease-brand hover:bg-inprotec-red2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-inprotec-rose"
        >
          {t.hero.cta1}
          <ArrowUpRight size={20} strokeWidth={1.5} className="transition-transform duration-300 ease-brand group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </a>
        <a
          href="#solutions"
          className="inline-flex items-center justify-center rounded-sm border border-white/60 bg-inprotec-ink/40 px-6 py-3.5 text-sm font-semibold uppercase tracking-wider text-inprotec-text backdrop-blur-sm transition-colors duration-300 ease-brand hover:border-inprotec-rose hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-inprotec-rose"
        >
          {t.hero.cta2}
        </a>
      </div>
    </div>
  );
}

function StaticHero({ t }) {
  return (
    <section id="hero" className="relative isolate flex min-h-[100svh] items-end overflow-hidden">
      <img
        src={REST_URL}
        alt={t.hero.alt}
        width="1280"
        height="720"
        fetchPriority="high"
        className="absolute inset-0 -z-20 h-full w-full object-cover object-[60%_center]"
      />
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-t from-inprotec-ink via-inprotec-ink/70 to-transparent" />
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-r from-inprotec-ink/70 to-transparent" />
      <div className="relative w-full px-5 pb-10 pt-28 sm:px-8 lg:px-[8vw]">
        <SettleHead t={t} staged={false} />
        <div className="mt-6">
          <SettleFoot t={t} staged={false} />
        </div>
      </div>
    </section>
  );
}

function ScrubHero({ t }) {
  const wrapRef = useRef(null);
  const videoRef = useRef(null);
  const ringRef = useRef(null);
  const cueRef = useRef(null);
  const bandRefs = useRef([]);
  const [videoState, setVideoState] = useState('loading'); // loading | ready | failed

  useEffect(() => {
    const wrap = wrapRef.current;
    const video = videoRef.current;
    const ring = ringRef.current;
    if (!wrap || !video) return undefined;

    let target = 0;
    let shown = 0;
    let raf = null;
    let last = 0;
    let seekBusy = false;
    let pending = null;
    let onScreen = true;
    let loadK = 0;
    let loadRaf = null;
    let cueOp = -1;
    let destroyed = false;
    const cache = BANDS.map(() => ({ op: -1, k: -1, pe: '' }));

    const heroProgress = () => {
      const range = wrap.offsetHeight - window.innerHeight;
      if (range <= 0) return 0;
      return clamp(-wrap.getBoundingClientRect().top / range, 0, 1);
    };

    /* seeks are gated: never write currentTime while one is in flight */
    const requestSeek = (tm) => {
      if (!video.duration) return;
      const tt = clamp(tm, 0, video.duration - 0.04);
      if (seekBusy) {
        pending = tt;
        return;
      }
      if (Math.abs(video.currentTime - tt) < 0.001) return;
      seekBusy = true;
      video.currentTime = tt;
    };
    const onSeeked = () => {
      seekBusy = false;
      if (pending !== null) {
        const tt = pending;
        pending = null;
        requestSeek(tt);
      }
    };
    const onVideoError = () => {
      seekBusy = false;
      pending = null;
    };
    video.addEventListener('seeked', onSeeked);
    video.addEventListener('error', onVideoError);

    /* captions: delta-gated writes only */
    const updateCaptions = (p) => {
      BANDS.forEach((b, i) => {
        const el = bandRefs.current[i];
        if (!el) return;
        const f = Math.min(0.02, (b.b - b.a) / 3);
        const easeIn = i === 0 ? 1 : smoothstep(p, b.a, b.a + f);
        const easeOut = i === BANDS.length - 1 ? 1 : 1 - smoothstep(p, b.b - f, b.b);
        const op = easeIn * easeOut;
        let k = clamp((p - b.a) / b.ramp, 0, 1);
        if (i === 0) k = Math.max(k, loadK);
        const c = cache[i];
        if (Math.abs(op - c.op) > 0.004 || (op === 0) !== (c.op === 0)) {
          c.op = op;
          el.style.opacity = op.toFixed(3);
          el.style.visibility = op < 0.01 ? 'hidden' : 'visible';
        }
        if (Math.abs(k - c.k) > 0.008 || (k === 1) !== (c.k === 1) || (k === 0) !== (c.k === 0)) {
          c.k = k;
          el.style.setProperty('--k', k.toFixed(3));
        }
      });
      const cue = cueRef.current;
      if (cue) {
        const o = clamp(1 - p / 0.04, 0, 1);
        if (Math.abs(o - cueOp) > 0.01) {
          cueOp = o;
          cue.style.opacity = o.toFixed(2);
        }
      }
    };

    /* lerp loop that rests when converged or off-screen */
    const tick = (now) => {
      const dt = Math.min(100, now - (last || now));
      last = now;
      const k = 0.16;
      shown += (target - shown) * (1 - Math.pow(1 - k, dt / 16.667));
      if (Math.abs(target - shown) < 0.0005) {
        shown = target;
        raf = null;
        last = 0;
      } else {
        raf = requestAnimationFrame(tick);
      }
      requestSeek(clamp(shown / REST_AT, 0, 1) * (video.duration || 0));
      updateCaptions(shown);
    };
    const kick = () => {
      if (raf === null && onScreen && !destroyed) raf = requestAnimationFrame(tick);
    };
    const onScroll = () => {
      target = heroProgress();
      kick();
    };

    const io = new IntersectionObserver((es) => {
      onScreen = es.some((e) => e.isIntersecting);
      if (onScreen) onScroll();
    });
    io.observe(wrap);

    /* band one opens settled: time-based load ramp that hands over to scroll */
    const t0 = performance.now();
    const loadStep = (now) => {
      loadK = smoothstep(clamp((now - t0 - 250) / 1100, 0, 1), 0, 1);
      updateCaptions(shown);
      if (loadK < 1 && !destroyed) loadRaf = requestAnimationFrame(loadStep);
    };
    loadRaf = requestAnimationFrame(loadStep);

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    target = heroProgress();
    shown = target;
    updateCaptions(shown);

    /* the poster is in the DOM already; fetch the video only once it painted */
    let fetchStarted = false;
    const failVideo = () => {
      if (destroyed) return;
      video.style.display = 'none';
      setVideoState('failed');
    };
    async function loadBlob() {
      const ctrl = new AbortController();
      let watchdog = setTimeout(() => ctrl.abort(), 20000);
      const res = await fetch(VIDEO_URL, { priority: 'low', signal: ctrl.signal });
      if (!res.ok || !res.body) throw new Error('video fetch failed');
      const total = Number(res.headers.get('Content-Length')) || VIDEO_BYTES;
      const reader = res.body.getReader();
      const chunks = [];
      let got = 0;
      let lastRing = 0;
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        clearTimeout(watchdog);
        watchdog = setTimeout(() => ctrl.abort(), 20000);
        chunks.push(value);
        got += value.length;
        const frac = Math.min(1, got / total);
        const now = performance.now();
        if (ring && (now - lastRing > 100 || frac === 1)) {
          lastRing = now;
          ring.style.setProperty('--ld', String(Math.round(126 * (1 - frac))));
        }
      }
      clearTimeout(watchdog);
      if (destroyed) return;
      video.src = URL.createObjectURL(new Blob(chunks, { type: 'video/mp4' }));
      video.load();
      video.addEventListener(
        'canplay',
        () => {
          if (destroyed) return;
          target = heroProgress();
          shown = target;
          requestSeek(clamp(shown / REST_AT, 0, 1) * video.duration);
          setVideoState('ready');
        },
        { once: true },
      );
    }
    const startFetch = () => {
      if (fetchStarted) return;
      fetchStarted = true;
      loadBlob().catch(failVideo);
    };
    const img = new Image();
    img.onload = startFetch;
    img.onerror = startFetch;
    img.src = POSTER_URL;
    const safety = setTimeout(startFetch, 4000);

    return () => {
      destroyed = true;
      clearTimeout(safety);
      if (raf !== null) cancelAnimationFrame(raf);
      if (loadRaf !== null) cancelAnimationFrame(loadRaf);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      video.removeEventListener('seeked', onSeeked);
      video.removeEventListener('error', onVideoError);
      io.disconnect();
      if (video.src.startsWith('blob:')) URL.revokeObjectURL(video.src);
    };
  }, []);

  const bandBox = 'absolute inset-0 flex items-end opacity-0 invisible [--k:0] pointer-events-none';
  const block = 'relative mb-[8vh] ml-5 max-w-[min(34rem,88vw)] sm:ml-10 lg:ml-[8vw]';
  const scrim =
    'pointer-events-none absolute -inset-x-[14%] -inset-y-[22%] z-0 [opacity:calc(0.25_+_0.75*var(--k,1))] bg-[radial-gradient(ellipse_82%_74%_at_36%_60%,rgba(10,11,13,0.92)_0%,rgba(10,11,13,0.74)_52%,rgba(10,11,13,0)_82%)]';
  const textShadow = '[text-shadow:0_1px_2px_rgba(10,11,13,0.95),0_3px_14px_rgba(10,11,13,0.8)]';

  return (
    <section id="hero" ref={wrapRef} className="relative h-[1000vh]">
      <div className="sticky top-0 h-screen w-full overflow-hidden bg-inprotec-ink">
        <img
          src={POSTER_URL}
          alt=""
          aria-hidden="true"
          width="1280"
          height="720"
          fetchPriority="high"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <video
          ref={videoRef}
          muted
          playsInline
          preload="none"
          aria-hidden="true"
          tabIndex={-1}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 will-change-transform [transform:translateZ(0)] ${
            videoState === 'ready' ? 'opacity-100' : 'opacity-0'
          }`}
        />
        {/* global base scrim: no frame is ever raw behind the page */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_120%_90%_at_50%_45%,rgba(10,11,13,0)_35%,rgba(10,11,13,0.62)_100%)]" />
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-inprotec-ink/80 to-transparent" />

        {/* three chapter captions */}
        {t.bands.map((b, i) => (
          <div key={b.tag} data-band={i} ref={(el) => { bandRefs.current[i] = el; }} className={bandBox}>
            <div className={block}>
              <div aria-hidden="true" className={scrim} />
              <div className={`relative z-10 ${textShadow}`}>
                <p className="inline-block bg-inprotec-ink/80 px-2.5 py-1 font-mono text-xs font-medium uppercase tracking-[0.25em] text-inprotec-rose backdrop-blur-sm">{b.tag}</p>
                <h2 className="mt-4 font-chivo text-4xl font-bold leading-[0.98] tracking-tight text-inprotec-text sm:text-5xl lg:text-6xl">
                  <Words text={b.title} ent={BANDS[i].ent} step={0.06} />
                </h2>
                <p className="mt-5 max-w-[44ch] text-base leading-relaxed text-inprotec-text sm:text-lg">{b.body}</p>
              </div>
            </div>
          </div>
        ))}

        {/* settle band: headline in the sky above the canopy, sub and CTAs over the asphalt */}
        <div data-band="3" ref={(el) => { bandRefs.current[3] = el; }} className={`${bandBox} !block`}>
          <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-[48%] bg-gradient-to-b from-inprotec-ink/90 via-inprotec-ink/60 to-transparent" />
          <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-[44%] bg-[linear-gradient(0deg,rgba(10,11,13,0.9)_0%,rgba(10,11,13,0.62)_55%,rgba(10,11,13,0)_100%)]" />
          <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-0 w-[62%] bg-[linear-gradient(90deg,rgba(10,11,13,0.55)_0%,rgba(10,11,13,0.25)_60%,rgba(10,11,13,0)_100%)]" />
          <div className={`absolute left-5 top-[11vh] z-10 sm:left-10 lg:left-[8vw] ${textShadow}`}>
            <SettleHead t={t} staged />
          </div>
          <div className={`absolute bottom-[8vh] left-5 z-10 sm:left-10 lg:left-[8vw] ${textShadow}`}>
            <SettleFoot t={t} staged />
          </div>
        </div>

        {/* loading ring and scroll cue */}
        {videoState === 'loading' && (
          <div role="status" aria-label={t.hero.loading} className="pointer-events-none absolute bottom-8 right-6 text-inprotec-rose sm:right-10">
            <svg ref={ringRef} className="h-10 w-10 -rotate-90 [--ld:126]" viewBox="0 0 48 48" aria-hidden="true">
              <circle cx="24" cy="24" r="20" fill="none" stroke="currentColor" strokeOpacity="0.2" strokeWidth="3" />
              <circle
                cx="24" cy="24" r="20" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"
                strokeDasharray="126" className="transition-[stroke-dashoffset] duration-200 [stroke-dashoffset:var(--ld)]"
              />
            </svg>
          </div>
        )}
        <div ref={cueRef} className="pointer-events-none absolute bottom-7 left-1/2 flex -translate-x-1/2 flex-col items-center gap-1 text-inprotec-text/80">
          <span className="font-mono text-[0.65rem] uppercase tracking-[0.3em]">{t.hero.scroll}</span>
          <ChevronDown size={20} strokeWidth={1.5} className="animate-[cue_2.4s_ease-in-out_infinite]" />
        </div>
      </div>
    </section>
  );
}

function Hero({ t }) {
  const [scrub, setScrub] = useState(() => (typeof window === 'undefined' ? false : !GATES.some((q) => window.matchMedia(q).matches)));
  useEffect(() => {
    const mqls = GATES.map((q) => window.matchMedia(q));
    const apply = () => setScrub(!mqls.some((m) => m.matches));
    mqls.forEach((m) => m.addEventListener('change', apply));
    apply();
    return () => mqls.forEach((m) => m.removeEventListener('change', apply));
  }, []);
  return scrub ? <ScrubHero t={t} /> : <StaticHero t={t} />;
}

/* ==========================================================================
   Header
   ========================================================================== */
function LangSwitch({ lang, setLang, label, className = '' }) {
  return (
    <div role="group" aria-label={label} className={`flex items-center gap-1 font-mono text-xs uppercase tracking-widest ${className}`}>
      <Globe size={16} strokeWidth={1.5} className="mr-1 text-inprotec-muted" aria-hidden="true" />
      {LANGS.map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => setLang(l)}
          aria-pressed={lang === l}
          className={`rounded-sm px-2 py-1.5 transition-colors duration-300 ease-brand focus-visible:outline focus-visible:outline-2 focus-visible:outline-inprotec-rose ${
            lang === l ? 'bg-white/10 text-inprotec-text' : 'text-inprotec-muted hover:text-inprotec-text'
          }`}
        >
          {l}
        </button>
      ))}
    </div>
  );
}

function Header({ t, lang, setLang }) {
  const [compact, setCompact] = useState(false);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    let was = false;
    const onScroll = () => {
      const now = window.scrollY > 40;
      if (now !== was) {
        was = now;
        setCompact(now);
      }
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
  const link =
    'rounded-sm px-1 py-2 text-sm font-semibold uppercase tracking-wider text-inprotec-text/85 transition-colors duration-300 ease-brand hover:text-inprotec-text focus-visible:outline focus-visible:outline-2 focus-visible:outline-inprotec-rose';
  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 border-b transition-[background-color,border-color,backdrop-filter] duration-500 ease-brand ${
        compact || open ? 'border-white/10 bg-inprotec-ink/85 backdrop-blur-md' : 'border-transparent bg-transparent'
      }`}
    >
      <div className={`mx-auto flex max-w-[90rem] items-center justify-between gap-6 px-5 transition-[height] duration-500 ease-brand sm:px-8 ${compact ? 'h-14' : 'h-[4.5rem]'}`}>
        <a href="#hero" aria-label="INPROTEC Industrial Process Technologies" className="shrink-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-inprotec-rose">
          <img src={LOGO_URL} alt="INPROTEC Industrial Process Technologies" width="213" height="64" className={`w-auto transition-[height] duration-500 ease-brand ${compact ? 'h-8' : 'h-10'}`} />
        </a>
        <nav aria-label="Primary" className="hidden items-center gap-7 lg:flex">
          {t.nav.map(([id, label]) => (
            <a key={id} href={`#${id}`} className={link}>{label}</a>
          ))}
        </nav>
        <div className="hidden items-center gap-5 lg:flex">
          <LangSwitch lang={lang} setLang={setLang} label={t.lang} />
          <a
            href="#contact"
            className="rounded-sm bg-inprotec-red px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-white shadow-2xl shadow-inprotec-red/25 transition-colors duration-300 ease-brand hover:bg-inprotec-red2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-inprotec-rose"
          >
            {t.cta}
          </a>
        </div>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? t.closeMenu : t.menu}
          className="rounded-sm p-2 text-inprotec-text focus-visible:outline focus-visible:outline-2 focus-visible:outline-inprotec-rose lg:hidden"
        >
          {open ? <X size={28} strokeWidth={1.5} /> : <Menu size={28} strokeWidth={1.5} />}
        </button>
      </div>
      <div
        id="mobile-menu"
        className={`grid transition-[grid-template-rows] duration-500 ease-brand lg:hidden ${open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
      >
        <div className="overflow-hidden">
          <nav aria-label="Mobile" className="flex flex-col gap-1 px-5 pb-6 pt-2 sm:px-8">
            {t.nav.map(([id, label]) => (
              <a key={id} href={`#${id}`} tabIndex={open ? 0 : -1} onClick={() => setOpen(false)} className="border-b border-white/10 py-3.5 text-lg font-semibold text-inprotec-text">
                {label}
              </a>
            ))}
            <div className="mt-5 flex items-center justify-between gap-4">
              <LangSwitch lang={lang} setLang={setLang} label={t.lang} />
              <a href="#contact" tabIndex={open ? 0 : -1} onClick={() => setOpen(false)} className="rounded-sm bg-inprotec-red px-4 py-3 text-xs font-semibold uppercase tracking-wider text-white">
                {t.cta}
              </a>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}

/* ==========================================================================
   Solutions: bento of cards that expand, plus the systems strip
   ========================================================================== */
const CARD_SPAN = {
  icss: 'lg:col-span-7 lg:row-span-2',
  fg: 'lg:col-span-5',
  ie: 'lg:col-span-5',
  ei: 'lg:col-span-4',
  lm: 'lg:col-span-4',
  cs: 'lg:col-span-4',
  co: 'lg:col-span-12',
};

function SolutionCard({ card, open, onToggle, serviceLabel }) {
  const Icon = CARD_ICONS[card.id];
  const big = card.id === 'icss';
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={open}
      aria-controls={`panel-${card.id}`}
      className={`group relative flex h-full flex-col overflow-hidden rounded-none border bg-white/[0.03] p-6 text-left shadow-2xl shadow-black/40 backdrop-blur-md transition-[border-color,background-color] duration-500 ease-brand hover:border-inprotec-red focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-inprotec-rose sm:p-8 ${
        open ? 'border-inprotec-red/70 bg-white/[0.05]' : 'border-white/15'
      } w-full`}
    >
      <span className="flex items-start justify-between">
        <span className="flex h-14 w-14 items-center justify-center border border-white/15 text-inprotec-rose transition-colors duration-500 ease-brand group-hover:border-inprotec-red">
          <Icon size={28} strokeWidth={1.5} aria-hidden="true" />
        </span>
        <ArrowUpRight size={24} strokeWidth={1.5} aria-hidden="true" className="text-inprotec-muted transition-[transform,color] duration-500 ease-brand group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-inprotec-red2" />
      </span>
      {card.service ? (
        <span className="mt-6 font-mono text-[0.7rem] uppercase tracking-[0.25em] text-inprotec-rose">{serviceLabel}</span>
      ) : null}
      <span className={`block font-chivo font-bold tracking-tight text-inprotec-text ${card.service ? 'mt-2' : 'mt-6'} ${big ? 'text-3xl sm:text-4xl' : 'text-2xl'}`}>
        {card.name}
      </span>
      <span className={`mt-3 block leading-relaxed text-inprotec-muted ${big ? 'max-w-[40ch] text-lg' : 'max-w-[42ch] text-base'}`}>{card.line}</span>
      <span className="mt-5 flex flex-wrap gap-2">
        {card.tags.map((tag) => (
          <span key={tag} className="border border-white/25 px-2.5 py-1 font-mono text-[0.7rem] uppercase tracking-widest text-inprotec-text/90">
            {tag}
          </span>
        ))}
      </span>
      <span
        id={`panel-${card.id}`}
        className={`grid transition-[grid-template-rows,opacity] duration-500 ease-brand motion-reduce:transition-none ${open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
      >
        <span className="block overflow-hidden">
          <span className={`mt-6 block border-t border-white/15 pt-5 ${big ? 'sm:columns-2 sm:gap-8' : ''}`}>
            {card.items.map((it) => (
              <span key={it} className="mb-2 flex break-inside-avoid items-start gap-2.5 text-sm leading-snug text-inprotec-text/90">
                <Check size={20} strokeWidth={1.5} aria-hidden="true" className="mt-px shrink-0 text-inprotec-rose" />
                {it}
              </span>
            ))}
          </span>
        </span>
      </span>
    </button>
  );
}

function Solutions({ t }) {
  const [open, setOpen] = useState('icss');
  return (
    <Section id="solutions">
      <Reveal>
        <Eyebrow>{t.sol.eyebrow}</Eyebrow>
        <h2 className="mt-5 max-w-[20ch] font-chivo text-4xl font-bold leading-[0.98] tracking-tight text-inprotec-text sm:text-6xl lg:text-7xl">
          {t.sol.title}
        </h2>
        <p className="mt-5 text-sm text-inprotec-muted">{t.sol.hint}</p>
      </Reveal>
      <div className="mt-14 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-12">
        {t.sol.cards.map((c, i) => (
          <Reveal key={c.id} delay={i * 80} className={`flex ${CARD_SPAN[c.id]} ${c.id === 'co' ? 'md:col-span-2' : ''}`}>
            <SolutionCard card={c} open={open === c.id} onToggle={() => setOpen(open === c.id ? '' : c.id)} serviceLabel={t.sol.service} />
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

function SystemsStrip({ t }) {
  const items = [...t.strip.items, ...t.strip.items];
  return (
    <section aria-label={t.strip.label} className="relative border-y border-white/10 bg-inprotec-ink2/70 py-10">
      <p className="px-5 font-mono text-xs uppercase tracking-[0.25em] text-inprotec-rose sm:px-8 lg:pl-24 xl:pl-28">{t.strip.label}</p>
      <div className="relative mt-6 overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_8%,#000_92%,transparent)]">
        <ul className="flex w-max animate-[marquee_70s_linear_infinite] gap-14 pr-14 hover:[animation-play-state:paused] motion-reduce:animate-none motion-reduce:flex-wrap motion-reduce:gap-x-12 motion-reduce:gap-y-6 motion-reduce:px-5">
          {items.map(([acr, note], i) => (
            <li key={`${acr}-${i}`} aria-hidden={i >= t.strip.items.length ? 'true' : undefined} className="shrink-0">
              <span className="block font-chivo text-4xl font-bold tracking-tight text-inprotec-text sm:text-5xl">{acr}</span>
              <span className="mt-1 block min-h-[1.25rem] font-mono text-[0.7rem] uppercase tracking-widest text-inprotec-muted">{note}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ==========================================================================
   Map the chain: the one interactive moment
   ========================================================================== */
function MapChain({ t }) {
  const [active, setActive] = useState(0);
  const [ref, seen] = useInView(0.25);
  const stage = t.chain.stages[active];
  const xs = ['16.66%', '50%', '83.33%'];
  return (
    <Section id="industries" className="bg-inprotec-ink2/50">
      <Reveal>
        <Eyebrow>{t.chain.eyebrow}</Eyebrow>
        <h2 className="mt-5 font-chivo text-4xl font-bold leading-[0.98] tracking-tight text-inprotec-text sm:text-6xl lg:text-7xl">{t.chain.title}</h2>
        <p className="mt-5 max-w-[52ch] text-lg text-inprotec-muted">{t.chain.sub}</p>
        <p className="mt-3 font-mono text-xs uppercase tracking-widest text-inprotec-rose">{t.chain.markets}</p>
      </Reveal>

      <div ref={ref} className="mt-14">
        {/* the signature pipe, drawn on view, three valve nodes */}
        <div className="relative">
          <svg viewBox="0 0 600 24" preserveAspectRatio="none" aria-hidden="true" className="h-6 w-full">
            <path d="M0 12H600" fill="none" stroke="currentColor" strokeOpacity="0.18" strokeWidth="2" vectorEffect="non-scaling-stroke" className="text-inprotec-text" />
            <path
              d="M0 12H600" fill="none" strokeWidth="2" vectorEffect="non-scaling-stroke" pathLength="1" strokeDasharray="1"
              className={`stroke-inprotec-red transition-[stroke-dashoffset] duration-[1800ms] ease-brand motion-reduce:transition-none ${seen ? '[stroke-dashoffset:0]' : '[stroke-dashoffset:1]'}`}
            />
          </svg>
          {xs.map((x, i) => (
            <span key={x} style={{ left: x }} className="pointer-events-none absolute top-0 -translate-x-1/2">
              <Valve lit={seen && active >= i} />
            </span>
          ))}
        </div>

        <div role="tablist" aria-label={t.chain.title} className="mt-2 grid grid-cols-3">
          {t.chain.stages.map((s, i) => (
            <button
              key={s.id}
              role="tab"
              id={`tab-${s.id}`}
              type="button"
              aria-selected={active === i}
              aria-controls={`stage-${s.id}`}
              onClick={() => setActive(i)}
              className={`group border-t-2 px-2 pb-4 pt-5 text-center transition-colors duration-500 ease-brand focus-visible:outline focus-visible:outline-2 focus-visible:outline-inprotec-rose ${
                active === i ? 'border-inprotec-red' : 'border-transparent hover:border-white/30'
              }`}
            >
              <span className="block font-mono text-[0.7rem] uppercase tracking-[0.25em] text-inprotec-rose">0{i + 1}</span>
              <span className={`mt-1 block font-chivo text-base font-bold tracking-tight sm:text-3xl ${active === i ? 'text-inprotec-text' : 'text-inprotec-muted group-hover:text-inprotec-text'}`}>{s.name}</span>
            </button>
          ))}
        </div>

        <div
          role="tabpanel"
          id={`stage-${stage.id}`}
          aria-labelledby={`tab-${stage.id}`}
          className="mt-8 grid items-stretch gap-6 lg:grid-cols-5"
        >
          <div className="relative overflow-hidden lg:col-span-3">
            {t.chain.stages.map((s, i) => (
              <img
                key={s.id}
                src={STAGE_IMG[s.id]}
                alt={s.alt}
                width="1280"
                height="720"
                loading="lazy"
                className={`aspect-video w-full rounded-none object-cover transition-opacity duration-700 ease-brand ${i === active ? 'relative opacity-100' : 'absolute inset-0 opacity-0'}`}
              />
            ))}
          </div>
          <div className="flex flex-col justify-between border border-white/15 bg-white/[0.03] p-6 shadow-2xl shadow-black/40 backdrop-blur-md sm:p-8 lg:col-span-2">
            <div>
              <h3 className="font-chivo text-2xl font-bold tracking-tight text-inprotec-text">{stage.name}</h3>
              <p className="mt-3 text-base leading-relaxed text-inprotec-muted">{stage.line}</p>
            </div>
            <div className="mt-8">
              <p className="font-mono text-[0.7rem] uppercase tracking-[0.25em] text-inprotec-rose">{t.chain.sysLabel}</p>
              <ul className="mt-3 flex flex-wrap gap-2">
                {stage.systems.map((s) => (
                  <li key={s} className="border border-inprotec-red/70 bg-inprotec-red/10 px-3 py-1.5 font-mono text-xs uppercase tracking-widest text-inprotec-text">
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}

/* ==========================================================================
   Trust: numbers, standards, references, operators
   ========================================================================== */
function Trust({ t }) {
  const tr = t.trust;
  return (
    <>
      <Section id="references">
        <Reveal>
          <Eyebrow>{tr.numbersEyebrow}</Eyebrow>
        </Reveal>
        <div className="mt-8 grid grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-4">
          {tr.stats.map((s) => (
            <CountUp key={s.label} to={s.n} plus={s.plus} label={s.label} />
          ))}
        </div>

        <div className="mt-24 grid gap-10 lg:grid-cols-5">
          <Reveal className="lg:col-span-2">
            <Eyebrow>{tr.stdEyebrow}</Eyebrow>
            <h2 className="mt-5 font-chivo text-3xl font-bold leading-tight tracking-tight text-inprotec-text sm:text-4xl">{tr.stdTitle}</h2>
          </Reveal>
          <Reveal className="lg:col-span-3" delay={100}>
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {tr.std.map((s) => (
                <li key={s} className="flex items-center gap-3 border border-white/15 bg-white/[0.03] px-4 py-5">
                  <ShieldCheck size={20} strokeWidth={1.5} aria-hidden="true" className="shrink-0 text-inprotec-rose" />
                  <span className="font-mono text-sm uppercase tracking-widest text-inprotec-text">{s}</span>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>

        <div className="mt-24">
          <Reveal>
            <Eyebrow>{tr.refEyebrow}</Eyebrow>
            <h2 className="mt-5 font-chivo text-3xl font-bold leading-tight tracking-tight text-inprotec-text sm:text-5xl">{tr.refTitle}</h2>
            <p className="mt-3 text-inprotec-muted">{tr.refSub}</p>
          </Reveal>
          {[[tr.clientsLabel, tr.clients], [tr.epcLabel, tr.epc]].map(([label, names]) => (
            <Reveal key={label} className="mt-10">
              <p className="font-mono text-[0.7rem] uppercase tracking-[0.25em] text-inprotec-rose">{label}</p>
              <ul className="mt-4 grid grid-cols-2 gap-x-6 gap-y-5 border-t border-white/15 pt-6 sm:grid-cols-3 lg:grid-cols-4">
                {names.map((n) => (
                  <li key={n} className="font-chivo text-xl font-semibold tracking-tight text-inprotec-muted transition-colors duration-500 ease-brand hover:text-inprotec-text sm:text-2xl">
                    {n}
                  </li>
                ))}
              </ul>
            </Reveal>
          ))}
        </div>
      </Section>

      <Section id="company" className="bg-inprotec-ink2/50">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-20">
          <Reveal>
            <Eyebrow>{tr.opEyebrow}</Eyebrow>
            <h2 className="mt-5 font-chivo text-4xl font-bold leading-[0.98] tracking-tight text-inprotec-text sm:text-5xl lg:text-6xl">
              {tr.opTitle}
            </h2>
            <p className="mt-6 max-w-[48ch] text-lg leading-relaxed text-inprotec-muted">{tr.opBody}</p>
          </Reveal>
          <ol className="space-y-4">
            {tr.benefits.map(([h, p], i) => (
              <Reveal as="li" key={h} delay={i * 110} className="flex gap-5 border border-white/15 bg-white/[0.03] p-6 shadow-2xl shadow-black/40 backdrop-blur-md">
                <span className="font-mono text-sm text-inprotec-rose">0{i + 1}</span>
                <div>
                  <h3 className="font-chivo text-xl font-bold tracking-tight text-inprotec-text">{h}</h3>
                  <p className="mt-2 leading-relaxed text-inprotec-muted">{p}</p>
                </div>
              </Reveal>
            ))}
          </ol>
        </div>
      </Section>
    </>
  );
}

/* ==========================================================================
   Contact form
   ========================================================================== */
const EMPTY = { name: '', company: '', role: '', email: '', country: '', area: '', message: '', consent: false };

function Field({ id, label, error, children }) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block font-mono text-[0.7rem] uppercase tracking-[0.2em] text-inprotec-text/90">
        {label}
      </label>
      {children}
      {error ? (
        <p id={`${id}-err`} role="alert" className="mt-1.5 text-sm text-inprotec-rose">
          {error}
        </p>
      ) : null}
    </div>
  );
}

const inputCls =
  'w-full rounded-sm border border-white/40 bg-inprotec-ink/60 px-3.5 py-3 text-base text-inprotec-text transition-colors duration-300 ease-brand placeholder:text-inprotec-muted focus-visible:border-inprotec-rose focus-visible:outline focus-visible:outline-2 focus-visible:outline-inprotec-rose aria-[invalid=true]:border-inprotec-red2';

function ContactForm({ t }) {
  const f = t.form;
  const [v, setV] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle'); // idle | submitting | success | error

  const set = (k) => (e) => setV((p) => ({ ...p, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  const validate = useCallback(() => {
    const er = {};
    ['name', 'company', 'role', 'country', 'area'].forEach((k) => {
      if (!v[k].trim()) er[k] = f.errors.required;
    });
    if (!v.email.trim()) er.email = f.errors.required;
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.email.trim())) er.email = f.errors.email;
    if (v.message.trim().length < 10) er.message = f.errors.message;
    if (!v.consent) er.consent = f.errors.consent;
    return er;
  }, [v, f]);

  const onSubmit = async (e) => {
    e.preventDefault();
    const er = validate();
    setErrors(er);
    if (Object.keys(er).length) {
      const first = Object.keys(er)[0];
      document.getElementById(`f-${first}`)?.focus();
      return;
    }
    setStatus('submitting');
    try {
      if (FORM_ENDPOINT) {
        const res = await fetch(FORM_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify(v),
        });
        if (!res.ok) throw new Error('form endpoint error');
      } else {
        /* Demo mode: no endpoint configured, nothing is sent anywhere. */
        await new Promise((r) => setTimeout(r, 900));
      }
      setStatus('success');
      setV(EMPTY);
    } catch (err) {
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <div role="status" className="flex h-full min-h-[24rem] flex-col items-start justify-center border border-white/15 bg-white/[0.03] p-8 shadow-2xl shadow-black/40 backdrop-blur-md">
        <span className="flex h-14 w-14 items-center justify-center border border-inprotec-red text-inprotec-red2">
          <Check size={28} strokeWidth={1.5} aria-hidden="true" />
        </span>
        <h3 className="mt-6 font-chivo text-3xl font-bold tracking-tight text-inprotec-text">{f.successTitle}</h3>
        <p className="mt-3 max-w-[40ch] text-lg text-inprotec-muted">{f.success}</p>
        <button type="button" onClick={() => setStatus('idle')} className="mt-8 rounded-sm border border-white/50 px-5 py-3 text-sm font-semibold uppercase tracking-wider text-inprotec-text transition-colors duration-300 ease-brand hover:border-inprotec-rose focus-visible:outline focus-visible:outline-2 focus-visible:outline-inprotec-rose">
          {f.again}
        </button>
      </div>
    );
  }

  const d = (k) => ({ id: `f-${k}`, 'aria-invalid': errors[k] ? 'true' : 'false', 'aria-describedby': errors[k] ? `f-${k}-err` : undefined });

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-5 border border-white/15 bg-white/[0.03] p-6 shadow-2xl shadow-black/40 backdrop-blur-md sm:grid-cols-2 sm:p-8">
      <Field id="f-name" label={f.labels.name} error={errors.name}>
        <input {...d('name')} type="text" autoComplete="name" value={v.name} onChange={set('name')} className={inputCls} />
      </Field>
      <Field id="f-company" label={f.labels.company} error={errors.company}>
        <input {...d('company')} type="text" autoComplete="organization" value={v.company} onChange={set('company')} className={inputCls} />
      </Field>
      <Field id="f-role" label={f.labels.role} error={errors.role}>
        <input {...d('role')} type="text" autoComplete="organization-title" value={v.role} onChange={set('role')} className={inputCls} />
      </Field>
      <Field id="f-email" label={f.labels.email} error={errors.email}>
        <input {...d('email')} type="email" autoComplete="email" value={v.email} onChange={set('email')} className={inputCls} />
      </Field>
      <Field id="f-country" label={f.labels.country} error={errors.country}>
        <input {...d('country')} type="text" autoComplete="country-name" value={v.country} onChange={set('country')} className={inputCls} />
      </Field>
      <Field id="f-area" label={f.labels.area} error={errors.area}>
        <select {...d('area')} value={v.area} onChange={set('area')} className={inputCls}>
          <option value="">{f.areaPlaceholder}</option>
          {f.areas.map((a) => (
            <option key={a} value={a}>{a}</option>
          ))}
        </select>
      </Field>
      <div className="sm:col-span-2">
        <Field id="f-message" label={f.labels.message} error={errors.message}>
          <textarea {...d('message')} rows={5} value={v.message} onChange={set('message')} className={inputCls} />
        </Field>
      </div>
      <div className="sm:col-span-2">
        <label htmlFor="f-consent" className="flex cursor-pointer items-start gap-3 text-sm text-inprotec-text/90">
          <input {...d('consent')} type="checkbox" checked={v.consent} onChange={set('consent')} className="mt-0.5 h-5 w-5 shrink-0 cursor-pointer rounded-sm border border-white/40 accent-inprotec-red focus-visible:outline focus-visible:outline-2 focus-visible:outline-inprotec-rose" />
          {f.consent}
        </label>
        {errors.consent ? (
          <p id="f-consent-err" role="alert" className="mt-1.5 text-sm text-inprotec-rose">{errors.consent}</p>
        ) : null}
      </div>
      <div className="flex flex-col gap-4 sm:col-span-2">
        <button
          type="submit"
          disabled={status === 'submitting'}
          className="group relative inline-flex items-center justify-center gap-2 rounded-sm bg-inprotec-red px-6 py-4 text-sm font-semibold uppercase tracking-wider text-white shadow-2xl shadow-inprotec-red/30 transition-colors duration-300 ease-brand hover:bg-inprotec-red2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-inprotec-rose disabled:cursor-wait disabled:opacity-80"
        >
          {status === 'submitting' ? (
            <>
              <LoaderCircle size={20} strokeWidth={1.5} className="animate-spin motion-reduce:animate-none" aria-hidden="true" />
              {f.sending}
            </>
          ) : (
            <>
              {f.send}
              <ArrowUpRight size={20} strokeWidth={1.5} aria-hidden="true" className="transition-transform duration-300 ease-brand group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </>
          )}
        </button>
        {status === 'error' ? (
          <p role="alert" className="text-sm text-inprotec-rose">{f.error}</p>
        ) : null}
      </div>
    </form>
  );
}

function Contact({ t }) {
  const f = t.form;
  return (
    <Section id="contact">
      <div className="grid gap-12 lg:grid-cols-5 lg:gap-16">
        <Reveal className="lg:col-span-2">
          <Eyebrow>{f.eyebrow}</Eyebrow>
          <h2 className="mt-5 font-chivo text-4xl font-bold leading-[0.98] tracking-tight text-inprotec-text sm:text-6xl">{f.title}</h2>
          <p className="mt-10 font-mono text-[0.7rem] uppercase tracking-[0.25em] text-inprotec-rose">{f.stepsTitle}</p>
          <ol className="mt-4 space-y-4">
            {f.steps.map((s, i) => (
              <li key={s} className="flex gap-4 text-lg leading-snug text-inprotec-text/90">
                <span className="font-mono text-sm text-inprotec-rose">0{i + 1}</span>
                {s}
              </li>
            ))}
          </ol>
          <address className="mt-12 space-y-3 border-t border-white/15 pt-8 text-base not-italic text-inprotec-muted">
            <p className="font-mono text-[0.7rem] uppercase tracking-[0.25em] text-inprotec-rose">{f.office}</p>
            <p className="flex items-start gap-3"><MapPin size={20} strokeWidth={1.5} aria-hidden="true" className="mt-0.5 shrink-0 text-inprotec-rose" />{f.address}</p>
            {/* CONFIRM WITH CLIENT: phone and email come from a third-party directory, not from inprotec.it. */}
            <p className="flex items-center gap-3"><Phone size={20} strokeWidth={1.5} aria-hidden="true" className="shrink-0 text-inprotec-rose" /><a href="tel:+39026608111" className="hover:text-inprotec-text">+39 02 6608111</a></p>
            <p className="flex items-center gap-3"><Mail size={20} strokeWidth={1.5} aria-hidden="true" className="shrink-0 text-inprotec-rose" /><a href="mailto:info@inprotec.it" className="hover:text-inprotec-text">info@inprotec.it</a></p>
          </address>
        </Reveal>
        <Reveal className="lg:col-span-3" delay={120}>
          <ContactForm t={t} />
        </Reveal>
      </div>
    </Section>
  );
}

/* ==========================================================================
   Footer
   ========================================================================== */
function Footer({ t, lang, setLang }) {
  const ft = t.footer;
  return (
    <footer className="border-t border-white/10 bg-inprotec-ink2/70">
      <div className="mx-auto grid max-w-7xl gap-12 px-5 py-16 sm:px-8 lg:grid-cols-3 lg:pl-24 lg:pr-10 xl:pl-28">
        <div>
          <img src={LOGO_URL} alt="INPROTEC Industrial Process Technologies" width="213" height="64" loading="lazy" className="h-10 w-auto" />
          <p className="mt-6 max-w-[28ch] font-chivo text-2xl font-light leading-tight tracking-tight text-inprotec-text">{ft.payoff}</p>
        </div>
        <nav aria-label="Footer">
          <p className="font-mono text-[0.7rem] uppercase tracking-[0.25em] text-inprotec-rose">{ft.links}</p>
          <ul className="mt-4 space-y-2.5">
            {t.nav.map(([id, label]) => (
              <li key={id}><a href={`#${id}`} className="text-inprotec-muted transition-colors duration-300 ease-brand hover:text-inprotec-text">{label}</a></li>
            ))}
          </ul>
          <LangSwitch lang={lang} setLang={setLang} label={t.lang} className="mt-6 -ml-2" />
        </nav>
        <div className="space-y-1.5 text-sm leading-relaxed text-inprotec-muted">
          {ft.legal.map((l) => (
            <p key={l} className={l.startsWith('INPROTEC') ? 'font-semibold text-inprotec-text' : ''}>{l}</p>
          ))}
          {/* CONFIRM WITH CLIENT: replace with the real Privacy Policy URL. */}
          <p className="pt-3"><a href="https://inprotec.it/" className="underline underline-offset-4 transition-colors duration-300 hover:text-inprotec-text">{ft.privacy}</a></p>
        </div>
      </div>
      <div className="border-t border-white/10 px-5 py-6 text-center text-xs text-inprotec-muted sm:px-8">{ft.rights}</div>
    </footer>
  );
}

/* ==========================================================================
   Page shell: fixed environment layer, process line, sections
   ========================================================================== */
function Environment() {
  /* One fixed background world: a slow glow drift plus a few whisper-level gas particles. */
  const dots = [
    ['8%', '0s', '38s'], ['22%', '-9s', '46s'], ['37%', '-17s', '41s'], ['54%', '-4s', '52s'],
    ['68%', '-26s', '44s'], ['81%', '-13s', '49s'], ['93%', '-31s', '40s'],
  ];
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-inprotec-ink">
      <div className="absolute -left-1/4 top-1/4 h-[60vh] w-[70vw] animate-[drift_70s_ease-in-out_infinite] rounded-full bg-inprotec-red/[0.07] blur-[120px] motion-reduce:animate-none" />
      <div className="absolute -right-1/4 bottom-0 h-[50vh] w-[60vw] animate-[drift_90s_ease-in-out_infinite_reverse] rounded-full bg-inprotec-rose/[0.05] blur-[140px] motion-reduce:animate-none" />
      {dots.map(([left, delay, dur]) => (
        <span
          key={left}
          style={{ left, animationDelay: delay, animationDuration: dur }}
          className="absolute bottom-0 h-1 w-1 animate-[rise_linear_infinite] rounded-full bg-inprotec-rose/30 motion-reduce:hidden"
        />
      ))}
    </div>
  );
}

function Flow({ children }) {
  /* The process line: a pipe that fills with red as the visitor travels down the page. */
  const ref = useRef(null);
  const fillRef = useRef(null);
  useEffect(() => {
    const el = ref.current;
    const fill = fillRef.current;
    if (!el || !fill) return undefined;
    let raf = null;
    let lastP = -1;
    const update = () => {
      raf = null;
      const r = el.getBoundingClientRect();
      const p = prefersReduced() ? 1 : clamp((window.innerHeight * 0.6 - r.top) / r.height, 0, 1);
      if (Math.abs(p - lastP) > 0.003) {
        lastP = p;
        fill.style.transform = `scaleY(${p.toFixed(4)})`;
      }
    };
    const onScroll = () => {
      if (raf === null) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (raf !== null) cancelAnimationFrame(raf);
    };
  }, []);
  return (
    <div ref={ref} className="relative">
      <div aria-hidden="true" className="pointer-events-none absolute bottom-0 left-6 top-0 hidden w-px bg-white/10 lg:block xl:left-10">
        <div ref={fillRef} className="h-full w-px origin-top bg-inprotec-red shadow-[0_0_14px_rgba(192,24,60,0.7)] [transform:scaleY(0)]" />
      </div>
      {children}
    </div>
  );
}

export default function InprotecHomepage() {
  const [lang, setLang] = useState('en');
  const t = COPY[lang];

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  useEffect(() => {
    /* smooth anchors only when motion is welcome; overflow clipped on both roots */
    const html = document.documentElement;
    html.style.overflowX = 'hidden';
    html.style.overflowX = 'clip';
    document.body.style.overflowX = 'hidden';
    document.body.style.overflowX = 'clip';
    const apply = () => {
      html.style.scrollBehavior = prefersReduced() ? 'auto' : 'smooth';
    };
    apply();
    const m = window.matchMedia('(prefers-reduced-motion: reduce)');
    m.addEventListener('change', apply);
    /* pause every looping animation on hidden tabs */
    const vis = () => document.body.classList.toggle('paused', document.hidden);
    document.addEventListener('visibilitychange', vis);
    return () => {
      m.removeEventListener('change', apply);
      document.removeEventListener('visibilitychange', vis);
    };
  }, []);

  return (
    <div className="font-chivo font-normal text-inprotec-text antialiased [&_*]:[font-synthesis:none]">
      <style>{`
        @keyframes marquee { from { transform: translateX(0) } to { transform: translateX(-50%) } }
        @keyframes drift { 0%,100% { transform: translate3d(0,0,0) } 50% { transform: translate3d(8vw,-4vh,0) } }
        @keyframes rise { 0% { transform: translate3d(0,0,0); opacity: 0 } 10% { opacity: 1 } 90% { opacity: 1 } 100% { transform: translate3d(3vw,-105vh,0); opacity: 0 } }
        @keyframes cue { 0%,100% { transform: translateY(0); opacity: .5 } 50% { transform: translateY(6px); opacity: 1 } }
        body.paused *, body.paused *::before, body.paused *::after { animation-play-state: paused !important }
        @media (prefers-reduced-motion: reduce) { *, *::before, *::after { animation-duration: .001ms !important; animation-iteration-count: 1 !important; transition-duration: .001ms !important; transition-delay: 0ms !important } }
      `}</style>
      <Environment />
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-sm focus:bg-inprotec-red focus:px-4 focus:py-3 focus:text-white">
        {t.skip}
      </a>
      <Header t={t} lang={lang} setLang={setLang} />
      <main id="main" tabIndex={-1} className="outline-none">
        <Hero t={t} />
        <Flow>
          <Solutions t={t} />
          <SystemsStrip t={t} />
          <MapChain t={t} />
          <Trust t={t} />
          <Contact t={t} />
        </Flow>
      </main>
      <Footer t={t} lang={lang} setLang={setLang} />
    </div>
  );
}
