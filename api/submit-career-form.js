// Dynamic imports for Vercel serverless functions
import fs from 'fs';
import { EMAIL_LOGO_SRC } from './email-logo-inline.js';

export const config = {
  api: {
    bodyParser: false, // Important for file uploads
  },
};

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      message: 'Method not allowed' 
    });
  }

  try {
    // Dynamic import for formidable (required for Vercel)
    const { default: formidable } = await import('formidable');
    
    // Parse form data with formidable
    const form = formidable({
      maxFileSize: 5 * 1024 * 1024, // 5MB per file
      maxFiles: 1, // Only one CV file
      keepExtensions: true,
      uploadDir: '/tmp' // Temporary directory
    });

    let fields, files;
    try {
      [fields, files] = await form.parse(req);
    } catch (parseError) {
      console.error('❌ Parse error:', parseError);
      // Handle file size errors from formidable
      if (parseError.message && (parseError.message.includes('maxFileSize') || parseError.code === 'LIMIT_FILE_SIZE')) {
        return res.status(413).json({
          success: false,
          message: 'Le fichier CV est trop volumineux. Veuillez réduire la taille du fichier (maximum 5MB).'
        });
      }
      // Re-throw other errors
      throw parseError;
    }
    
    // Extract form fields - handle both single values and arrays
    const name = Array.isArray(fields['Contact-1-Name']) ? fields['Contact-1-Name'][0] : fields['Contact-1-Name'];
    const phone = Array.isArray(fields['Contact-1-Phone']) ? fields['Contact-1-Phone'][0] : fields['Contact-1-Phone'];
    const email = Array.isArray(fields['Contact-1-Email']) ? fields['Contact-1-Email'][0] : fields['Contact-1-Email'];
    const message = Array.isArray(fields['Contact-1-Message']) ? fields['Contact-1-Message'][0] : fields['Contact-1-Message'];
    const jobTitle = Array.isArray(fields['Job-Title']) ? fields['Job-Title'][0] : fields['Job-Title'];
    const honeypot = Array.isArray(fields['website_url']) ? fields['website_url'][0] : fields['website_url'];
    const formLoadedAt = Array.isArray(fields['_form_loaded_at']) ? fields['_form_loaded_at'][0] : fields['_form_loaded_at'];

    // Anti-spam: honeypot check (bots fill hidden fields, humans don't)
    if (honeypot) {
      console.warn('🤖 Bot detected via honeypot');
      return res.status(200).json({ success: true, message: 'Candidature envoyée avec succès!' });
    }

    // Anti-spam: time-based check (bots submit in < 3 seconds)
    if (formLoadedAt) {
      const elapsed = Date.now() - parseInt(formLoadedAt, 10);
      if (elapsed < 3000) {
        console.warn('🤖 Bot detected via timing (' + elapsed + 'ms)');
        return res.status(200).json({ success: true, message: 'Candidature envoyée avec succès!' });
      }
    }
    
    // Extract CV file
    let cvFile = files['Contact-1-CV'] || null;
    
    // Ensure cvFile is a single file (not array)
    if (Array.isArray(cvFile)) {
      cvFile = cvFile[0];
    }
    
    // Validate required fields
    if (!name || !phone || !email) {
      return res.status(400).json({
        success: false,
        message: 'Tous les champs obligatoires doivent être remplis.'
      });
    }

    // Initialize Resend
    if (!process.env.RESEND_API_KEY) {
      console.error('❌ RESEND_API_KEY is missing!');
      throw new Error('RESEND_API_KEY environment variable missing');
    }
    
    // Dynamic import for Resend (required for Vercel)
    const { Resend } = await import('resend');
    const resend = new Resend(process.env.RESEND_API_KEY);
    const fromEmail = process.env.FROM_EMAIL || 'onboarding@resend.dev';
    
    // Production business email
    const businessEmail = process.env.RECIPIENT_EMAIL || 'info@constpmm.com';

    // Prepare attachments
    const attachments = [];
    if (cvFile && cvFile.filepath) {
      try {
        const fileBuffer = fs.readFileSync(cvFile.filepath);
        const timestamp = Date.now();
        const fileExtension = cvFile.originalFilename ? 
          cvFile.originalFilename.split('.').pop() : 
          'pdf';
        
        // Generate clean filename for email attachment
        const cleanFilename = cvFile.originalFilename ? 
          cvFile.originalFilename.replace(/[^a-zA-Z0-9.-]/g, '_') : 
          `CV_${timestamp}.${fileExtension}`;
        
        attachments.push({
          filename: cleanFilename,
          content: fileBuffer,
          contentType: cvFile.mimetype || 'application/pdf'
        });
      } catch (fileError) {
        console.error('Error reading CV file:', fileError);
      }
    }

    // Create business email with modern PMM branding
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
                
                <!-- Header avec logo -->
                <tr>
                  <td style="background: linear-gradient(135deg, #1b1b1b 0%, #2a2a2a 100%); padding: 40px 30px; text-align: center; border-bottom: 3px solid #dc3545;">
                    <img src="${EMAIL_LOGO_SRC}" alt="Construction PMM Logo" width="180" height="auto" style="max-width: 180px; height: auto; margin: 0 auto 20px; display: block;" />
                    <h1 style="margin: 0; font-size: 32px; font-weight: 700; color: #ffffff; letter-spacing: -0.5px;">
                      📋 Nouvelle Candidature
                    </h1>
                    <p style="margin: 12px 0 0 0; font-size: 16px; color: #cccccc; font-weight: 400;">
                      Construction PMM
                    </p>
                    ${jobTitle ? `
                    <div style="margin-top: 20px; display: inline-block; background-color: #dc3545; padding: 10px 24px; border-radius: 24px; box-shadow: 0 4px 12px rgba(220, 53, 69, 0.3);">
                      <span style="color: #ffffff; font-size: 15px; font-weight: 600; letter-spacing: 0.3px;">
                        ${jobTitle}
                      </span>
                    </div>
                    ` : ''}
                  </td>
                </tr>
                
                <!-- Content -->
                <tr>
                  <td style="padding: 40px 30px; background-color: #2a2a2a;">
                    
                    <!-- Candidat Info -->
                    <div style="background-color: #1b1b1b; padding: 24px; border-radius: 8px; border-left: 4px solid #dc3545; margin-bottom: 30px;">
                      <h2 style="color: #ffffff; margin: 0 0 20px 0; font-size: 20px; font-weight: 600;">
                        👤 Informations du Candidat
                      </h2>
                      <table width="100%" cellpadding="8" cellspacing="0">
                        <tr>
                          <td style="font-weight: 600; color: #999999; width: 120px; vertical-align: top; font-size: 14px;">Nom :</td>
                          <td style="color: #ffffff; font-size: 15px; font-weight: 500;">${name}</td>
                        </tr>
                        <tr>
                          <td style="font-weight: 600; color: #999999; vertical-align: top; font-size: 14px; padding-top: 12px;">Email :</td>
                          <td style="color: #dc3545; font-size: 15px; padding-top: 12px;">
                            <a href="mailto:${email}" style="color: #dc3545; text-decoration: none; font-weight: 500;">${email}</a>
                          </td>
                        </tr>
                        <tr>
                          <td style="font-weight: 600; color: #999999; vertical-align: top; font-size: 14px; padding-top: 12px;">Téléphone :</td>
                          <td style="color: #ffffff; font-size: 15px; padding-top: 12px;">
                            <a href="tel:${phone}" style="color: #ffffff; text-decoration: none; font-weight: 500;">${phone}</a>
                          </td>
                        </tr>
                        ${cvFile && cvFile.filepath ? `
                        <tr>
                          <td style="font-weight: 600; color: #999999; vertical-align: top; font-size: 14px; padding-top: 12px;">CV :</td>
                          <td style="color: #28a745; font-size: 15px; padding-top: 12px; font-weight: 500;">
                            ✓ Fichier joint
                          </td>
                        </tr>
                        ` : ''}
                      </table>
                    </div>
                    
                    ${message ? `
                    <!-- Message -->
                    <div style="background-color: #1b1b1b; padding: 24px; border-radius: 8px; border-left: 4px solid #dc3545;">
                      <h2 style="color: #ffffff; margin: 0 0 16px 0; font-size: 20px; font-weight: 600;">
                        💬 Message
                      </h2>
                      <p style="color: #cccccc; line-height: 1.7; margin: 0; font-size: 15px; white-space: pre-line;">
                        ${message}
                      </p>
                    </div>
                    ` : ''}
                  </td>
                </tr>
                
                <!-- Action Button -->
                <tr>
                  <td style="padding: 0 30px 40px 30px; text-align: center; background-color: #2a2a2a;">
                    <a href="mailto:${email}?subject=Re:%20Votre%20candidature%20-%20Construction%20PMM" 
                       style="display: inline-block; 
                              background-color: #dc3545; 
                              color: #ffffff; 
                              text-decoration: none; 
                              padding: 16px 40px; 
                              border-radius: 8px; 
                              font-weight: 600; 
                              font-size: 16px;
                              box-shadow: 0 4px 12px rgba(220, 53, 69, 0.3);
                              letter-spacing: 0.3px;">
                      📧 Répondre au candidat
                    </a>
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="padding: 24px 30px; background-color: #1b1b1b; text-align: center; border-top: 1px solid #333333;">
                    <p style="margin: 0; color: #999999; font-size: 13px;">
                      © 2026 Construction PMM - Tous droits réservés
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

    // Send business email
    const emailSubject = jobTitle 
      ? `📋 Nouvelle Candidature - ${jobTitle} - ${name}`
      : `📋 Nouvelle Candidature - ${name}`;
    
    const emailData = {
      from: fromEmail,
      to: businessEmail,
      subject: emailSubject,
      html: businessEmailContent,
      replyTo: email
    };

    // Add CV attachment if available
    if (attachments.length > 0) {
      emailData.attachments = attachments;
    }

    const { data, error } = await resend.emails.send(emailData);

    if (error) {
      console.error('❌ Business email error:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      return res.status(500).json({
        success: false,
        message: 'Erreur lors de l\'envoi de l\'email. Veuillez réessayer plus tard.'
      });
    }

    // Clean up temporary file
    if (cvFile && cvFile.filepath) {
      try {
        fs.unlinkSync(cvFile.filepath);
      } catch (cleanupError) {
        console.error('Error cleaning up CV file:', cleanupError);
      }
    }

    // Send confirmation email to candidate with PMM branding
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
                
                <!-- Header Success -->
                <tr>
                  <td style="background: linear-gradient(135deg, #dc3545 0%, #c82333 100%); padding: 50px 30px; text-align: center;">
                    <img src="${EMAIL_LOGO_SRC}" alt="Construction PMM Logo" width="180" height="auto" style="max-width: 180px; height: auto; margin: 0 auto 24px; display: block;" />
                    <div style="font-size: 64px; margin-bottom: 16px;">✓</div>
                    <h1 style="margin: 0; font-size: 32px; font-weight: 700; color: #ffffff; letter-spacing: -0.5px;">
                      Candidature envoyée !
                    </h1>
                    <p style="margin: 12px 0 0 0; font-size: 16px; color: #ffffff; opacity: 0.95; font-weight: 400;">
                      Nous avons bien reçu votre candidature
                    </p>
                  </td>
                </tr>
                
                <!-- Content -->
                <tr>
                  <td style="padding: 40px 30px; background-color: #2a2a2a;">
                    
                    <!-- Greeting -->
                    <h2 style="color: #ffffff; margin: 0 0 20px 0; font-size: 24px; font-weight: 600; text-align: center;">
                      Bonjour ${name} 👋
                    </h2>
                    
                    <p style="color: #cccccc; line-height: 1.7; margin: 0 0 30px 0; font-size: 16px; text-align: center;">
                      Merci de votre intérêt pour <strong style="color: #ffffff;">Construction PMM</strong>${jobTitle ? ` et pour le poste de <strong style="color: #dc3545;">${jobTitle}</strong>` : ''} !
                    </p>
                    
                    <!-- Info Box -->
                    <div style="background-color: #1b1b1b; padding: 28px; border-radius: 8px; border-left: 4px solid #dc3545; margin-bottom: 30px;">
                      <h3 style="color: #ffffff; margin: 0 0 16px 0; font-size: 18px; font-weight: 600;">
                        📋 Récapitulatif de votre candidature
                      </h3>
                      <table width="100%" cellpadding="6" cellspacing="0">
                        ${jobTitle ? `
                        <tr>
                          <td style="color: #999999; font-size: 14px; padding: 8px 0;">Poste :</td>
                          <td style="color: #ffffff; font-size: 15px; font-weight: 500; text-align: right;">${jobTitle}</td>
                        </tr>
                        ` : ''}
                        <tr>
                          <td style="color: #999999; font-size: 14px; padding: 8px 0;">CV :</td>
                          <td style="color: ${cvFile && cvFile.filepath ? '#dc3545' : '#ffc107'}; font-size: 15px; font-weight: 500; text-align: right;">
                            ${cvFile && cvFile.filepath ? '✓ Joint' : 'Non fourni'}
                          </td>
                        </tr>
                        <tr>
                          <td style="color: #999999; font-size: 14px; padding: 8px 0;">Message :</td>
                          <td style="color: ${message ? '#dc3545' : '#999999'}; font-size: 15px; font-weight: 500; text-align: right;">
                            ${message ? '✓ Inclus' : 'Non inclus'}
                          </td>
                        </tr>
                        <tr>
                          <td style="color: #999999; font-size: 14px; padding: 8px 0;">Email :</td>
                          <td style="color: #ffffff; font-size: 15px; font-weight: 500; text-align: right;">${email}</td>
                        </tr>
                      </table>
                    </div>
                    
                    <!-- Next Steps -->
                    <div style="background-color: #1b1b1b; padding: 24px; border-radius: 8px; border-left: 4px solid #dc3545; text-align: center;">
                      <h3 style="color: #ffffff; margin: 0 0 12px 0; font-size: 18px; font-weight: 600;">
                        ⏱️ Prochaines étapes
                      </h3>
                      <p style="color: #cccccc; line-height: 1.6; margin: 0; font-size: 15px;">
                        Notre équipe examine actuellement votre candidature.<br>
                        Nous vous contacterons dans les <strong style="color: #ffffff;">5 à 7 jours ouvrables</strong>.
                      </p>
                    </div>
                    
                    <!-- Signature -->
                    <div style="margin-top: 40px; text-align: center; padding-top: 30px; border-top: 1px solid #333333;">
                      <p style="color: #cccccc; margin: 0 0 8px 0; font-size: 15px;">
                        Cordialement,
                      </p>
                      <p style="color: #ffffff; margin: 0; font-size: 18px; font-weight: 600;">
                        L'équipe Construction PMM
                      </p>
                      <p style="color: #999999; margin: 12px 0 0 0; font-size: 14px;">
                        📧 info@constpmm.com
                      </p>
                    </div>
                    
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="padding: 24px 30px; background-color: #1b1b1b; text-align: center; border-top: 1px solid #333333;">
                    <p style="margin: 0 0 8px 0; color: #999999; font-size: 13px;">
                      © 2026 Construction PMM - Tous droits réservés
                    </p>
                    <p style="margin: 0; color: #666666; font-size: 12px;">
                      Vous recevez cet email car vous avez soumis une candidature sur constructionpmm.com
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

    // Send confirmation email (don't fail if this fails)
    try {
      const confirmationSubject = jobTitle 
        ? `✓ Candidature reçue - ${jobTitle} | Construction PMM`
        : `✓ Candidature reçue | Construction PMM`;
      
      const confirmResult = await resend.emails.send({
        from: fromEmail,
        to: email,
        subject: confirmationSubject,
        html: confirmationContent,
        replyTo: businessEmail
      });
      
      if (confirmResult.error) {
        console.warn('⚠️ Confirmation email error:', confirmResult.error);
      }
    } catch (confirmationError) {
      console.warn('⚠️ Confirmation email failed:', confirmationError);
    }
    
    res.status(200).json({
      success: true,
      message: 'Candidature envoyée avec succès!',
      data: data
    });

  } catch (error) {
    console.error('❌ Server error:', error);
    console.error('Error stack:', error.stack);
    console.error('Error message:', error.message);
    
    // Return detailed error in development
    const isDev = process.env.NODE_ENV !== 'production';
    
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'envoi de la candidature. Veuillez réessayer.',
      ...(isDev && { 
        error: error.message,
        stack: error.stack 
      })
    });
  }
}
