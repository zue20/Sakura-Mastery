import kuromoji from 'kuromoji';

// Must match wherever you copied node_modules/kuromoji/dict/* to serve
// as static files (see project setup notes) — path is relative to your
// web app's public root.
const DIC_PATH = '/kuromoji-dict/';

let tokenizerPromise = null;

function buildTokenizer() {
  return new Promise((resolve, reject) => {
    kuromoji.builder({ dicPath: DIC_PATH }).build((err, tokenizer) => {
      if (err) reject(err);
      else resolve(tokenizer);
    });
  });
}

function getTokenizer() {
  if (!tokenizerPromise) {
    tokenizerPromise = buildTokenizer().catch((err) => {
      tokenizerPromise = null; // allow retry on the next call instead of staying broken forever
      throw err;
    });
  }
  return tokenizerPromise;
}

// Katakana and Hiragana sit at a fixed offset apart in Unicode, so
// converting one to the other is just a character-code shift.
function katakanaToHiragana(str) {
  return str.replace(/[\u30A1-\u30F6]/g, (ch) => String.fromCharCode(ch.charCodeAt(0) - 0x60));
}

// Converts any Japanese text (kanji, kana, or mixed) to its hiragana
// reading using kuromoji's dictionary-based analysis — no manual word
// list to maintain, unlike the old kanaDictionary.js. Falls back to the
// token's own surface form if kuromoji has no reading for it (rare —
// e.g. some symbols), and falls back to the raw input text entirely if
// the dictionary itself fails to load, so a setup problem degrades
// scoring instead of crashing the quiz.
export async function toHiraganaReading(text) {
  if (!text) return '';
  try {
    const tokenizer = await getTokenizer();
    const tokens = tokenizer.tokenize(text);
    return tokens.map((t) => (t.reading ? katakanaToHiragana(t.reading) : t.surface_form)).join('');
  } catch (err) {
    console.warn('kuromoji reading conversion failed, scoring raw text instead:', err.message);
    return text;
  }
}

// Fire-and-forget: kicks off the dictionary download early (call this
// when a speaking question mounts) so it's likely already loaded by the
// time the user finishes their attempt, instead of adding a visible
// delay to the very first scoring pass of the session.
export function warmupReadingEngine() {
  getTokenizer().catch(() => {}); // any real failure surfaces via toHiraganaReading instead
}