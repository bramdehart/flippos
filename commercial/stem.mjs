// Maakt de voice-over van de reclame met een spraakmodel op OpenRouter.
//   node stem.mjs            alle zinnen opnieuw
//   node stem.mjs 03 goud    alleen deze zinnen
//   STEM=coral node stem.mjs andere stem (standaard: ash)
// De sleutel staat in ../.env (OPENROUTER_API_KEY). Per zin wordt gecontroleerd of hij in zijn scène past.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const key = (readFileSync(join(here, '..', '.env'), 'utf8').match(/^OPENROUTER_API_KEY=(.+)$/m) || [])[1]?.trim();
if (!key) throw new Error('OPENROUTER_API_KEY ontbreekt in ../.env');
const MODEL = process.env.MODEL || 'openai/gpt-audio', VOICE = process.env.STEM || 'ash';

// [bestand, tekst, hoe lang de zin hooguit mag duren (seconden), regieaanwijzing (optioneel, wordt niet uitgesproken)]
export const ZINNEN = [
  ['01', "Hé! Ken je ze nog? Flippo's!", 4.2],
  ['02', 'Vier mappen op tafel! Welke pak jij?', 5.4],
  ['03', 'Pak een zak chips. Knijp… en pop!', 5.4],
  ['04', "Vijf flippo's! Welke heb jij al?", 3.0],
  ['05', 'Schuif ze in je map. Zoef!', 4.0],
  ['06', "Sla zelf de bladzijde om. Meer dan vijfhonderd flippo's!", 5.0],
  ['07', 'En deze, met inkepingen? Klik ze in elkaar! Klik! Klik! Klik!', 6.0],
  ['08', 'Wauw! Je bouwwerk in drie dee!', 4.0],
  ['09', 'Houd er één vast, en bekijk hem van dichtbij. Voorkant… en achterkant!', 6.0],
  ['10', 'En ook de Diskeyz en de Pokémon-munten doen mee!', 3.5],
  ['10b', 'Scheur het zakje open… en kijk wat erin zit!', 4.4],
  ['11', 'Klaar? Klap de map dicht, en draai hem om!', 5.0],
  ['goud', 'Is je map helemaal vol? Dan win jij de gouden flippo!', 5.5],
  ['12', "Flippo's! Net als in negentienvijfennegentig. Maar nu in je browser!", 6.1,
    'Bouw op naar het einde. "Maar nu in je browser!" is het hoogtepunt van de hele reclame: roep het juichend uit, met heel veel enthousiasme, de stem omhoog en vol energie.'],
  ['13', 'Spaar ze allemaal!', 2.3],
];

const SYSTEEM = `Je bent de stem van een Nederlandse tv-reclame voor kinderspeelgoed uit de jaren negentig, op zaterdagochtend.
Spreek accentloos Nederlands uit Nederland. Klink warm, levendig en heel enthousiast, als een opgewonden omroeper die rechtstreeks tegen kinderen praat.
Hoog tempo, veel energie, duidelijke klemtonen, een glimlach in je stem. Geen Engels accent.
Spreek ALLEEN de tekst tussen de aanhalingstekens uit, precies zoals hij er staat: niets ervoor, niets erna, geen uitleg.
Uitspraak: "Flippo's" = flip-poos. "Diskeyz" = dis-kies. "Pokémon" = pookee-mon. "drie dee" = 3D.`;

async function spreek(tekst, regie) {
  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: MODEL, stream: true, modalities: ['text', 'audio'], audio: { voice: VOICE, format: 'pcm16' },
      messages: [{ role: 'system', content: SYSTEEM }, { role: 'user', content: `${regie ? `Regie: ${regie}\n` : ''}Spreek dit uit: "${tekst}"` }],
    }),
  });
  if (!res.ok) throw new Error(`OpenRouter ${res.status}: ${(await res.text()).slice(0, 300)}`);
  const parts = []; let transcript = '', buf = '';
  const dec = new TextDecoder();
  for await (const chunk of res.body) {
    buf += dec.decode(chunk, { stream: true });
    let i;
    while ((i = buf.indexOf('\n')) >= 0) {
      const line = buf.slice(0, i).trim(); buf = buf.slice(i + 1);
      if (!line.startsWith('data:') || line.includes('[DONE]')) continue;
      let j; try { j = JSON.parse(line.slice(5)); } catch { continue; }
      if (j.error) throw new Error(JSON.stringify(j.error).slice(0, 300));
      const a = j.choices?.[0]?.delta?.audio;
      if (a?.data) parts.push(Buffer.from(a.data, 'base64'));
      if (a?.transcript) transcript += a.transcript;
    }
  }
  if (!parts.length) throw new Error('geen geluid ontvangen');
  return { pcm: Buffer.concat(parts), transcript };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const only = process.argv.slice(2);
  mkdirSync(join(here, 'vo'), { recursive: true });
  for (const [naam, tekst, max, regie] of ZINNEN) {
    if (only.length && !only.includes(naam)) continue;
    const { pcm, transcript } = await spreek(tekst, regie);
    const raw = join(here, 'vo', `${naam}.pcm`), out = join(here, 'vo', `${naam}.mp3`);
    writeFileSync(raw, pcm);
    // stilte aan begin en eind eraf, overal even hard, mp3 van 44,1 kHz
    execFileSync('ffmpeg', ['-v', 'error', '-y', '-f', 's16le', '-ar', '24000', '-ac', '1', '-i', raw,
      '-af', 'silenceremove=start_periods=1:start_threshold=-45dB,areverse,silenceremove=start_periods=1:start_threshold=-45dB,areverse,loudnorm=I=-16:TP=-1.5',
      '-ar', '44100', '-ac', '1', '-b:a', '128k', out]);
    execFileSync('rm', [raw]);
    const dur = +execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', out]).toString();
    console.log(`${naam}  ${dur.toFixed(2)}s (max ${max})${dur > max ? '  TE LANG' : ''}  "${transcript.trim()}"`);
  }
}
