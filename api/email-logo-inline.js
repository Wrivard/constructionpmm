import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** 1×1 transparent GIF — évite un crash si le fichier base64 n’est pas présent dans le bundle serverless */
const FALLBACK_DATA_URI =
  'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

function readLogoBase64() {
  const candidates = [
    path.join(__dirname, 'email-logo-base64.txt'),
    path.join(process.cwd(), 'api', 'email-logo-base64.txt'),
  ];
  for (const p of candidates) {
    try {
      if (fs.existsSync(p)) {
        const s = fs.readFileSync(p, 'utf8').trim();
        if (s) return s;
      }
    } catch (e) {
      console.error('[email-logo] read failed:', p, e && e.message);
    }
  }
  console.warn('[email-logo] email-logo-base64.txt introuvable — utilisation d’un logo minimal.');
  return '';
}

const raw = readLogoBase64();

/** Logo PNG inlined en data URI pour les courriels HTML (affichage fiable sans dépendre d’une URL externe). */
export const EMAIL_LOGO_SRC = raw ? 'data:image/png;base64,' + raw : FALLBACK_DATA_URI;
