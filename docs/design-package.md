# INPROTEC homepage, design package (v1, in attesa di approvazione)

Tier 2, catena di 3 segmenti. Generatore: Magnific (scelto dal cliente al posto di Higgsfield, non connesso).

## 0. Dati da confermare (non li invento)

- Il sito inprotec.it blocca la lettura automatica (pagina "Please wait while your request is being verified"). Le pagine About, Certifications, Projects, Contact Us non sono leggibili da qui.
- Trovati da fonti terze, NON verificati: tel. 02 6608111, fax 02 66041334, email info@inprotec.it (elenco Confcommercio Milano). Un'altra fonte indica "dal 1992", ma contrasta con "oltre 25 anni" del sito.
- Finché non li confermi: il footer e il form usano solo indirizzo e dati legali del brief. Niente anno di fondazione, niente ISO.

## 1. Premessa del brand

La parola è **catena**. Gli idrocarburi attraversano una filiera: pozzo, impianto, pompa. INPROTEC è l'unico interlocutore che mette controllo e sicurezza su ogni anello. Ogni sezione dimostra un anello; il form è la chiusura.

## 2. Palette (token Tailwind `inprotec.*`)

```
red     #C0183C  CTA piene, linee SVG, accenti
red2    #C6494F  hover, secondo stop dei gradienti
rose    #DB9C95  micro-label, glow tenui, bordi attivi
ink     #0A0B0D  canvas (derivato dal nero brand #000000, non ufficiale)
ink2    #121418  pannelli
text    #F2F3F5
muted   #9AA0A8
```

Contrasti calcolati su ink: testo `#F2F3F5` ~17:1, muted ~7:1, rose ~8:1, **rosso `#C0183C` solo ~3.2:1**. Regola: il rosso non si usa per testo piccolo. Solo linee, bordi, sfondo CTA (testo bianco su rosso ~6:1) e titoli grandi in gradiente (soglia 3:1 per testo grande).

## 3. Tipografia

Chivo 700 (titoli), 600 (sottotitoli, bottoni), 400 (corpo), 300 (didascalie grandi). Etichette tecniche: Chivo Mono 400/500, maiuscolo, `tracking-widest`. Nessun Inter o Roboto.

## 4. Storyboard e costi

Tutti i segmenti: 16:9, 1080p, 6 s, senza audio, un'unica ripresa. Il fotogramma finale di N diventa il primo di N+1 (estratto in PNG con ffmpeg e caricato come start frame). Le giunzioni cadono dentro il movimento (legge delle giunzioni), con un velo di foschia o luce al taglio.

**Frame iniziale (immagine):** alba nel deserto, dune ocra, pumpjack a sinistra-centro, orizzonte basso, spazio calmo a destra per le didascalie. Modello Nano Banana 2.1, 2k.

| # | Mondo e camera | Frame finale | Caption | Banda scroll (da validare col flick test) |
|---|---|---|---|---|
| 1 Upstream | Alba, dune, pumpjack che oscilla lento. Dolly in avanti con salita, foschia di calore, riflesso sulla lente quando la camera supera il pumpjack. | Orizzonte all'ora blu con le luci di una raffineria lontana. Il movimento non si ferma: continua verso l'orizzonte. | "Where the chain begins." / "Wellheads protected by HIPPS. Remote sites watched by SCADA and RTU." | 0.00 to 0.30 |
| 2 Processo | Dall'orizzonte blu si entra in una raffineria al crepuscolo: colonne, tubazioni, torcia accesa. Travelling laterale tra le strutture, vapore. | Uscita su una strada illuminata, stazione di servizio all'orizzonte. Ancora in movimento. | "Where every process stays under control." / "DCS, ESD, Fire & Gas and burner management, built to IEC 61508/61511 and NFPA." | 0.32 to 0.64 |
| 3 Distribuzione | Stazione di notte, pensilina pulita. Avvicinamento lento che si ferma. Mano in controluce o semi-silhouette sul bocchettone, volto mai in primo piano, movimento minimo. | Frame di riposo, composto con ampio margine sopra e sotto e spazio per H1 e CTA. | "Where energy reaches people." / "Loading and metering systems designed and built in-house." | 0.66 to 0.86, poi settle 0.88 a 1.00 |

**Piano B segmento 3** (se fallisce 3 volte): dettaglio su pistola e bocchettone, senza persona.

**Prompt, struttura comune** (ogni prompt chiude con la parte fissa):
- Fisso in coda: `Cinematic color grade with deep near-black shadows and controlled crimson accents (#C0183C, #C6494F), warm desaturated highlights. Photorealistic, anamorphic, soft volumetric light, consistent grade across all shots. No text, no logos, no brand marks, no signage lettering anywhere.`
- Negative (dove il modello lo accetta): `fake stock look, watermark, distorted hands, extra fingers, deformed car, readable brand names on fuel pumps`.
- I prompt completi dei 3 segmenti li scrivo dopo il tuo ok sul concept, sul frame approvato, così il movimento riprende esattamente da dove il frame riposa.

**Costi esatti (preflight Magnific, saldo 45.000 crediti):**

| Voce | Crediti |
|---|---|
| Immagine 2k (Nano Banana 2.1) | 65 cad. |
| Seedance 2.5, 6 s, 1080p | 4.740 per segmento (14.220 per i 3) |
| Seedance 2.0, 6 s, 1080p | 4.200 per segmento (12.600 per i 3) |
| Kling 2.5, 5 s, 1080p | 325 per segmento (975 per i 3), solo 5 o 10 s, qualità più bassa |
| Immagini di supporto, 6 stimate | ~390 |

Piano consigliato: Seedance 2.5 (classificato primo dal catalogo, supporta start frame). Budget con un re-roll per segmento: ~29.000 crediti su 45.000. Se vuoi risparmiare, i segmenti si possono provare in Kling 2.5 a 325 e rigenerare in Seedance solo quelli approvati come movimento.

## 5. Copy (EN, ship verbatim; IT e FR dopo l'approvazione)

**Hero di riposo**
- Sopratitolo: `INDUSTRIAL PROCESS TECHNOLOGIES · OVER 25 YEARS`
- H1: "From the wellhead to the pump. **One partner for the whole chain.**"
- Sub: "Control and safety systems for Oil & Gas, chemical and petrochemical plants. Engineered in Italy, commissioned on site worldwide."
- CTA 1: "Talk to an engineer" (ancora al form). CTA 2: "Explore our systems" (ancora ai sistemi).

**Hero statico (mobile, reduced motion, video assente):** stesso H1, sub e CTA sul frame di riposo come poster (elemento LCP, precaricato).

**Header:** Solutions · Industries · References · Company · Contact. CTA "Talk to an engineer". Toggle EN/IT/FR.

**Sezione Solutions** (sopratitolo `WHAT WE ENGINEER`, H2 "Five disciplines. One accountable team.")
- Automation & Process Control (card grande, ICSS): "Integrated control and safety, designed as one system." Tag: ICSS, DCS, PLC.
- Fire & Gas Solutions: "Detection and mitigation built to the standard, loop by loop." Tag: SIL, NFPA, EN, IEC 61508.
- I&E Engineering: "Instrumentation and electrical design that matches the process." Tag: I&E.
- Electrical & Instrumentation: "Supply and integration that reach site ready." Tag: E&I.
- Loading & Metering Solutions: "Designed, engineered, manufactured and integrated in-house." Tag: Loading, Metering.
- Commissioning & Start-up: "Pre-commissioning, commissioning, installation and supervision on site." 
- Consultancy: "Standards and safety questions answered before the design is frozen."
- Fascia sistemi: `ICSS · DCS · ESD · F&G · BMS · BCS · SCADA/RTU · HIPPS · PLC`. Righe di dettaglio: ESD "IEC 61508/61511, NFPA"; F&G "IEC 61508, NFPA, EN"; BMS "NFPA 85".

**Map the chain** (H2 "Follow the chain."; sub "Pick a stage to see which systems protect it.")
- Upstream: HIPPS, SCADA, RTU, ESD. "Pressure protection at the wellhead and monitoring across remote sites."
- Processing: ICSS, DCS, ESD, Fire & Gas, BMS. "One control and safety architecture across the plant."
- Distribution: Loading & Metering, I&E. "Accurate transfer, engineered and built in-house."

**Trust**
- Numeri veri: "25+" years of experience · "9" system families · "5" engineering disciplines · "3" languages: EN, IT, FR (modificabili se ne trovi di più su "Our History").
- Standard: IEC 61508 · IEC 61511 · NFPA · NFPA 85 · EN · SIL. Certificazioni aziendali: da recuperare, non scritte finché non le confermi.
- Clienti citati sul sito (wordmark testuali): Sonatrach, ADNOC, Saudi Aramco, Shell, BP, ExxonMobil, Chevron, Total, Petronas, Petrobras, Sinopec, BASF, INEOS, Saras/Sarlux, ISAB, Naftal. EPC: Saipem, Tecnimont, Technip, Petrofac, Samsung Engineering, JGC, Hyundai, Techint, Bonatti.
- "Built for operators like you": "You are accountable for uptime and for the safety case. So we answer to both. Every system follows IEC 61508/61511 and NFPA. Our engineers stay with you from the first drawing to start-up on site. One team, one contact, no gaps between design and commissioning." Nessun nome di Sonatrach-ENI, Sarpi, ENGTP, Nextchem come cliente.

**Form** (H2 "Tell us about your plant.")
- Dopo l'invio: "1. An engineer reads your message. 2. We reply with the right questions, not a brochure. 3. We plan a technical call."
- Campi: Name, Company, Role, Work email, Country, Area of interest (Control & Safety Systems · Fire & Gas · I&E Engineering · Loading & Metering · Commissioning · Consultancy), Message, "I agree to the privacy policy".
- Pulsante: "Send to an engineer". Successo: "Message received. An engineer will reply by email." Errore: "Something went wrong. Please try again or write to us directly."
- Destinazione: per ora solo stato di successo frontend (demo), con commento nel codice per Formspree o API. **I messaggi non arrivano a nessuno finché non scegli un endpoint.**

**Footer:** logo · "Your requirements, our commitment" · ancore · EN/IT/FR · INPROTEC Industrial Process Technologies S.r.l. · Via Bizet 44/B, 20092 Cinisello Balsamo (MI), Italia · Cap. soc. € 1.260.000 i.v. · REA 1836792 · P.IVA IT05647510964 · Privacy Policy · © 2026.

Nota di onestà sul segmento 3: la stazione è una metafora della fine della filiera. Il copy parla di Loading & Metering, non di stazioni retail.

## 6. Layer vettoriale e motion

Linea di processo SVG rossa (stile P&ID: tubo con nodi e valvole stilizzate) che si disegna con lo scroll e collega Solutions, Map the chain, Trust, Contact. Particelle di gas "a sussurro". Ogni sezione ha un'entrata propria, easing ovunque, `prefers-reduced-motion` rispettato.

## 7. Cosa ho deciso sui conflitti

React in un file unico, Tailwind, `lucide-react` con `strokeWidth={1.5}`; tecnica 10k (Blob, lerp in rAF, seek protetti, caption con scrim, fallback statico). Deploy su Vercel.

## 8. Gate copy

Il testo sopra va nel componente parola per parola. Prima dell'anteprima: grep di em dash e parole stock a zero (eccezione: nomi ufficiali dei servizi).
