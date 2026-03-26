// Vercel Serverless — formulaire contact / soumission (multipart, images)
import fs from 'fs';
import { EMAIL_LOGO_SRC } from './email-logo-inline.js';

export const config = {
  api: {
    bodyParser: false,
  },
};

function fieldVal(fields, key) {
  const v = fields[key];
  if (v === undefined || v === null) return '';
  return Array.isArray(v) ? v[0] : v;
}

function escapeHtml(s) {
  if (s === undefined || s === null) return '';
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function plansLabel(status) {
  const t = String(status || '').toLowerCase();
  if (t === 'yes') return 'Oui';
  if (t === 'no') return 'Non';
  return escapeHtml(status);
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Méthode non autorisée. Utilisez POST.',
    });
  }

  try {
    const { default: formidable } = await import('formidable');

    const form = formidable({
      maxFileSize: 4 * 1024 * 1024,
      maxFiles: 5,
      keepExtensions: true,
      uploadDir: '/tmp',
    });

    let fields;
    let files;
    try {
      [fields, files] = await form.parse(req);
    } catch (parseError) {
      console.error('❌ Parse error:', parseError);
      if (
        parseError.message &&
        (parseError.message.includes('maxFileSize') || parseError.code === 'LIMIT_FILE_SIZE')
      ) {
        return res.status(413).json({
          success: false,
          message:
            'Les images sont trop volumineuses. Veuillez réduire la taille des images ou en sélectionner moins. Maximum ~4,5 Mo au total.',
        });
      }
      throw parseError;
    }

    const name = fieldVal(fields, 'Contact-11-Name');
    const email = fieldVal(fields, 'Contact-11-Email');
    const phone = fieldVal(fields, 'Contact-11-Phone');
    const address = fieldVal(fields, 'Contact-11-Address');
    const message = fieldVal(fields, 'Contact-11-Message');
    const plansStatus = fieldVal(fields, 'Contact-11-Plans-Status');
    const acceptTerms = fieldVal(fields, 'acceptTerms');
    const honeypot = fieldVal(fields, 'website_url');
    const formLoadedAt = fieldVal(fields, '_form_loaded_at');

    if (honeypot) {
      console.warn('🤖 Bot detected via honeypot');
      return res.status(200).json({ success: true, message: 'Message envoyé avec succès!' });
    }

    if (formLoadedAt) {
      const elapsed = Date.now() - parseInt(formLoadedAt, 10);
      if (elapsed < 3000) {
        console.warn('🤖 Bot detected via timing (' + elapsed + 'ms)');
        return res.status(200).json({ success: true, message: 'Message envoyé avec succès!' });
      }
    }

    if (!name || !email || !message || !phone || !address) {
      return res.status(400).json({
        success: false,
        message: 'Tous les champs obligatoires doivent être remplis.',
      });
    }

    if (!plansStatus) {
      return res.status(400).json({
        success: false,
        message: 'Veuillez indiquer si vous disposez déjà de plans.',
      });
    }

    if (!acceptTerms || acceptTerms !== 'true') {
      return res.status(400).json({
        success: false,
        message: 'Vous devez accepter les conditions générales.',
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Format d\'email invalide.',
      });
    }

    let uploadedFiles =
      files['Contact-11-Image[]'] || files['Contact-11-Image'] || [];
    if (!Array.isArray(uploadedFiles)) {
      uploadedFiles = [uploadedFiles];
    }
    uploadedFiles = uploadedFiles.filter(function (f) {
      return f && f.filepath;
    });

    const { Resend } = await import('resend');
    const resendApiKey = process.env.RESEND_API_KEY;
    const fromEmail = process.env.FROM_EMAIL || 'onboarding@resend.dev';
    const businessEmail = process.env.RECIPIENT_EMAIL || 'info@constpmm.com';

    if (!resendApiKey) {
      console.error('❌ RESEND_API_KEY not found');
      return res.status(500).json({
        success: false,
        message: 'Configuration du serveur manquante.',
      });
    }

    const resend = new Resend(resendApiKey);

    const nameH = escapeHtml(name);
    const emailH = escapeHtml(email);
    const phoneH = escapeHtml(phone);
    const addressH = escapeHtml(address);
    const messageH = escapeHtml(message);
    const plansH = plansLabel(plansStatus);

    const imageNamesEscaped = uploadedFiles.map(function (f) {
      return escapeHtml(f.originalFilename || 'image');
    });

    const imagesSummaryHtml =
      uploadedFiles.length > 0
        ? `<p style="margin:12px 0 0 0;font-size:15px;color:#cccccc;line-height:1.6;"><strong style="color:#fff;">Fichiers joints :</strong> ${uploadedFiles.length} image(s) — ${imageNamesEscaped.join(', ')} (voir pièces jointes de cet email)</p>`
        : `<p style="margin:12px 0 0 0;font-size:15px;color:#999999;">Aucune image jointe.</p>`;

    const imagesSummaryUser =
      uploadedFiles.length > 0
        ? `Vous avez joint ${uploadedFiles.length} image(s) : ${imageNamesEscaped.join(', ')}. Notre équipe les recevra en pièces jointes sur notre boîte courriel.`
        : 'Vous n’avez joint aucune image.';

    const attachments = [];
    for (const file of uploadedFiles) {
      if (!file.filepath) continue;
      try {
        const fileBuffer = fs.readFileSync(file.filepath);
        const rawName = file.originalFilename || `image_${Date.now()}.jpg`;
        const cleanFilename = rawName.replace(/[^a-zA-Z0-9.\-_]/g, '_');
        attachments.push({
          filename: cleanFilename || `image_${Date.now()}.jpg`,
          content: fileBuffer,
          contentType: file.mimetype || 'image/jpeg',
        });
      } catch (fileErr) {
        console.error('Attachment read error:', fileErr);
      }
    }

    const businessEmailContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: 'PP Neue Montreal', -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; margin: 0; padding: 0; background-color: #1b1b1b;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #1b1b1b; padding: 40px 20px;">
          <tr>
            <td align="center">
              <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #2a2a2a; border-radius: 12px; overflow: hidden; box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);">
                <tr>
                  <td style="background: linear-gradient(135deg, #1b1b1b 0%, #2a2a2a 100%); padding: 40px 30px; text-align: center; border-bottom: 3px solid #dc3545;">
                    <img src="${EMAIL_LOGO_SRC}" alt="Construction PMM Logo" width="180" height="auto" style="max-width: 180px; height: auto; margin: 0 auto 20px; display: block;" />
                    <h1 style="margin: 0; font-size: 32px; font-weight: 700; color: #ffffff; letter-spacing: -0.5px;">
                      📧 Nouvelle demande
                    </h1>
                    <p style="margin: 12px 0 0 0; font-size: 16px; color: #cccccc; font-weight: 400;">
                      Construction PMM — contact / soumission
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 40px 30px; background-color: #2a2a2a;">
                    <div style="background-color: #1b1b1b; border-left: 4px solid #dc3545; padding: 24px; margin-bottom: 24px; border-radius: 8px;">
                      <h2 style="margin: 0 0 20px 0; font-size: 20px; font-weight: 600; color: #ffffff;">
                        Coordonnées
                      </h2>
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr><td style="padding: 10px 0; border-bottom: 1px solid #3a3a3a; color: #999999; font-size: 14px;">Nom</td></tr>
                        <tr><td style="padding: 4px 0 12px 0; color: #ffffff; font-size: 16px; font-weight: 500;">${nameH}</td></tr>
                        <tr><td style="padding: 10px 0; border-bottom: 1px solid #3a3a3a; color: #999999; font-size: 14px;">Courriel</td></tr>
                        <tr><td style="padding: 4px 0 12px 0; color: #ffffff; font-size: 16px; font-weight: 500;"><a href="mailto:${encodeURIComponent(email)}" style="color: #dc3545; text-decoration: none;">${emailH}</a></td></tr>
                        <tr><td style="padding: 10px 0; border-bottom: 1px solid #3a3a3a; color: #999999; font-size: 14px;">Téléphone</td></tr>
                        <tr><td style="padding: 4px 0 12px 0; color: #ffffff; font-size: 16px; font-weight: 500;"><a href="tel:${String(phone).replace(/[^\d+]/g, '')}" style="color: #dc3545; text-decoration: none;">${phoneH}</a></td></tr>
                        <tr><td style="padding: 10px 0; border-bottom: 1px solid #3a3a3a; color: #999999; font-size: 14px;">Adresse du chantier</td></tr>
                        <tr><td style="padding: 4px 0 12px 0; color: #ffffff; font-size: 16px; font-weight: 500; white-space: pre-wrap;">${addressH}</td></tr>
                        <tr><td style="padding: 10px 0; color: #999999; font-size: 14px;">Plans déjà disponibles ?</td></tr>
                        <tr><td style="padding: 4px 0 0 0; color: #ffffff; font-size: 16px; font-weight: 500;">${plansH}</td></tr>
                      </table>
                    </div>
                    <div style="background-color: #1b1b1b; padding: 24px; border-radius: 8px; margin-bottom: 24px;">
                      <h3 style="margin: 0 0 16px 0; font-size: 18px; font-weight: 600; color: #ffffff;">Message</h3>
                      <div style="color: #cccccc; font-size: 15px; line-height: 1.6; white-space: pre-wrap; word-wrap: break-word;">${messageH}</div>
                    </div>
                    <div style="background-color: #1b1b1b; padding: 20px; border-radius: 8px; margin-bottom: 24px;">
                      <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600; color: #ffffff;">📎 Plans / photos</h3>
                      ${imagesSummaryHtml}
                    </div>
                    <div style="text-align: center; padding: 12px 0 0 0;">
                      <a href="mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent('Re: Votre demande Construction PMM')}" style="display: inline-block; background: linear-gradient(135deg, #dc3545 0%, #c82333 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                        Répondre au client
                      </a>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td style="background-color: #1b1b1b; padding: 24px 30px; text-align: center; border-top: 1px solid #3a3a3a;">
                    <p style="margin: 0; font-size: 13px; color: #999999; line-height: 1.5;">
                      Cet email a été envoyé via le formulaire de contact de<br>
                      <strong style="color: #dc3545;">Construction PMM</strong>
                    </p>
                    <p style="margin: 12px 0 0 0; font-size: 12px; color: #666666;">
                      © ${new Date().getFullYear()} Construction PMM. Tous droits réservés.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    const confirmationContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: 'PP Neue Montreal', -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; margin: 0; padding: 0; background-color: #1b1b1b;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #1b1b1b; padding: 40px 20px;">
          <tr>
            <td align="center">
              <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #2a2a2a; border-radius: 12px; overflow: hidden; box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);">
                <tr>
                  <td style="background: linear-gradient(135deg, #dc3545 0%, #c82333 100%); padding: 50px 30px; text-align: center;">
                    <img src="${EMAIL_LOGO_SRC}" alt="Construction PMM Logo" width="180" height="auto" style="max-width: 180px; height: auto; margin: 0 auto 24px; display: block;" />
                    <div style="font-size: 64px; margin-bottom: 16px;">✓</div>
                    <h1 style="margin: 0; font-size: 32px; font-weight: 700; color: #ffffff; letter-spacing: -0.5px;">
                      Demande reçue !
                    </h1>
                    <p style="margin: 12px 0 0 0; font-size: 16px; color: #ffffff; opacity: 0.95; font-weight: 400;">
                      Nous avons bien reçu votre message
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 40px 30px; background-color: #2a2a2a;">
                    <h2 style="color: #ffffff; margin: 0 0 20px 0; font-size: 24px; font-weight: 600; text-align: center;">
                      Bonjour ${nameH} 👋
                    </h2>
                    <div style="background-color: #1b1b1b; padding: 24px; border-radius: 8px; margin-bottom: 24px; border-left: 4px solid #dc3545;">
                      <p style="margin: 0 0 16px 0; font-size: 16px; color: #cccccc; line-height: 1.6;">
                        Merci de nous avoir contactés ! Votre demande a été transmise à notre équipe.
                      </p>
                      <p style="margin: 0; font-size: 16px; color: #cccccc; line-height: 1.6;">
                        Nous vous répondrons dans les plus brefs délais, généralement sous 24 à 48 heures ouvrables.
                      </p>
                    </div>
                    <div style="background-color: #1b1b1b; padding: 20px; border-radius: 8px; margin-bottom: 24px;">
                      <h3 style="margin: 0 0 16px 0; font-size: 16px; font-weight: 600; color: #dc3545; text-align: center;">
                        📋 Récapitulatif de votre demande
                      </h3>
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td style="padding: 8px 0; color: #999999; font-size: 14px;">Nom</td>
                          <td style="padding: 8px 0; color: #ffffff; font-size: 14px; font-weight: 500; text-align: right;">${nameH}</td>
                        </tr>
                        <tr>
                          <td style="padding: 8px 0; color: #999999; font-size: 14px;">Courriel</td>
                          <td style="padding: 8px 0; color: #ffffff; font-size: 14px; font-weight: 500; text-align: right;">${emailH}</td>
                        </tr>
                        <tr>
                          <td style="padding: 8px 0; color: #999999; font-size: 14px;">Téléphone</td>
                          <td style="padding: 8px 0; color: #ffffff; font-size: 14px; font-weight: 500; text-align: right;">${phoneH}</td>
                        </tr>
                        <tr>
                          <td colspan="2" style="padding: 12px 0 4px 0; color: #999999; font-size: 14px; border-top: 1px solid #3a3a3a;">Adresse du chantier</td>
                        </tr>
                        <tr>
                          <td colspan="2" style="padding: 4px 0 8px 0; color: #cccccc; font-size: 14px; line-height: 1.5; white-space: pre-wrap;">${addressH}</td>
                        </tr>
                        <tr>
                          <td style="padding: 8px 0; color: #999999; font-size: 14px;">Plans déjà disponibles ?</td>
                          <td style="padding: 8px 0; color: #ffffff; font-size: 14px; font-weight: 500; text-align: right;">${plansH}</td>
                        </tr>
                        <tr>
                          <td colspan="2" style="padding: 12px 0 4px 0; color: #999999; font-size: 14px; border-top: 1px solid #3a3a3a;">Message</td>
                        </tr>
                        <tr>
                          <td colspan="2" style="padding: 8px 0; color: #cccccc; font-size: 14px; line-height: 1.5; white-space: pre-wrap;">${messageH.length > 400 ? messageH.substring(0, 400) + '…' : messageH}</td>
                        </tr>
                        <tr>
                          <td colspan="2" style="padding: 12px 0 4px 0; color: #999999; font-size: 14px; border-top: 1px solid #3a3a3a;">Plans / photos</td>
                        </tr>
                        <tr>
                          <td colspan="2" style="padding: 8px 0; color: #cccccc; font-size: 14px; line-height: 1.5;">${imagesSummaryUser}</td>
                        </tr>
                      </table>
                    </div>
                    <div style="background: linear-gradient(135deg, rgba(220, 53, 69, 0.1) 0%, rgba(200, 35, 51, 0.1) 100%); border: 1px solid rgba(220, 53, 69, 0.3); padding: 20px; border-radius: 8px; margin-bottom: 24px;">
                      <h3 style="margin: 0 0 12px 0; font-size: 16px; font-weight: 600; color: #dc3545;">
                        Prochaines étapes
                      </h3>
                      <ul style="margin: 0; padding-left: 20px; color: #cccccc; font-size: 14px; line-height: 1.8;">
                        <li>Notre équipe examine votre demande</li>
                        <li>Nous vous contacterons par courriel sous 24 à 48 h</li>
                        <li>En cas d'urgence, appelez-nous au <strong style="color:#fff;">450-272-8140</strong></li>
                      </ul>
                    </div>
                    <div style="text-align: center; padding: 16px 0; border-top: 1px solid #3a3a3a;">
                      <p style="margin: 0; font-size: 14px; color: #999999;">
                        Merci d'avoir choisi <strong style="color: #dc3545;">Construction PMM</strong>
                      </p>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td style="background-color: #1b1b1b; padding: 24px 30px; text-align: center; border-top: 1px solid #3a3a3a;">
                    <p style="margin: 0; font-size: 12px; color: #666666;">
                      © ${new Date().getFullYear()} Construction PMM. Tous droits réservés.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    const emailSubject = `📧 Nouvelle demande de ${name}`;

    const emailData = {
      from: fromEmail,
      to: businessEmail,
      subject: emailSubject,
      html: businessEmailContent,
      replyTo: email,
    };
    if (attachments.length > 0) {
      emailData.attachments = attachments;
    }

    let sendResult;
    try {
      sendResult = await resend.emails.send(emailData);
    } catch (sendErr) {
      console.error('❌ Resend send error:', sendErr);
      return res.status(500).json({
        success: false,
        message: 'Erreur lors de l\'envoi de l\'email.',
      });
    } finally {
      for (const f of uploadedFiles) {
        if (f && f.filepath) {
          try {
            fs.unlinkSync(f.filepath);
          } catch (e) {
            console.error('Cleanup:', e);
          }
        }
      }
    }

    const { data, error } = sendResult || {};

    if (error) {
      console.error('❌ Business email error:', error);
      return res.status(500).json({
        success: false,
        message: 'Erreur lors de l\'envoi de l\'email.',
      });
    }

    try {
      await resend.emails.send({
        from: fromEmail,
        to: email,
        subject: '✓ Demande reçue | Construction PMM',
        html: confirmationContent,
        replyTo: businessEmail,
      });
    } catch (confirmationError) {
      console.warn('⚠️ Confirmation email failed:', confirmationError);
    }

    res.status(200).json({
      success: true,
      message: 'Message envoyé avec succès!',
      data: data,
    });
  } catch (error) {
    console.error('❌ Server error:', error);
    res.status(500).json({
      success: false,
      message: 'Une erreur est survenue lors de l\'envoi du message.',
    });
  }
}
