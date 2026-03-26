import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** Logo PNG inlined en data URI pour les courriels HTML (affichage fiable sans dépendre d’une URL externe). */
export const EMAIL_LOGO_SRC =
  'data:image/png;base64,' +
  fs.readFileSync(path.join(__dirname, 'email-logo-base64.txt'), 'utf8').trim();
