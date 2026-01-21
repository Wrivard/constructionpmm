import { Resend } from 'resend';
import formidable from 'formidable';
import fs from 'fs';

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
      throw new Error('RESEND_API_KEY environment variable missing');
    }
    
    const resend = new Resend(process.env.RESEND_API_KEY);
    const fromEmail = process.env.FROM_EMAIL || 'onboarding@resend.dev';
    
    // ⚠️ HARDCODE recipient to prevent environment variable overrides
    const businessEmail = 'wrivard@kua.quebec'; // Testing email

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
        
        console.log('📎 CV attachment prepared:', cleanFilename);
      } catch (fileError) {
        console.error('Error reading CV file:', fileError);
      }
    }

    // Create business email with table-based layout
    const businessEmailContent = `
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8"></head>
      <body style="font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f4f0;">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto;">
          <tr>
            <td>
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                <!-- Header -->
                <tr>
                  <td style="background-color: #2c3e50; color: #ffffff; text-align: center; padding: 30px;">
                    <h1 style="margin: 0; font-size: 28px; font-weight: bold;">📋 Nouvelle Candidature</h1>
                    <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Une nouvelle candidature a été soumise</p>
                    ${jobTitle ? `<div style="margin-top: 15px; background-color: #d4a574; display: inline-block; padding: 8px 20px; border-radius: 20px; font-size: 14px; font-weight: 600;">Poste: ${jobTitle}</div>` : ''}
                  </td>
                </tr>
                
                <!-- Content -->
                <tr>
                  <td style="padding: 40px 30px; background-color: #ffffff;">
                    <h2 style="color: #2c3e50; margin: 0 0 20px 0; font-size: 20px; border-bottom: 2px solid #d4a574; padding-bottom: 10px;">👤 Informations du Candidat</h2>
                    <table width="100%" cellpadding="8" cellspacing="0" style="margin-bottom: 30px;">
                      ${jobTitle ? `
                      <tr>
                        <td style="font-weight: bold; color: #2c3e50; width: 120px; vertical-align: top;">Poste:</td>
                        <td style="color: #34495e;"><strong style="color: #d4a574;">${jobTitle}</strong></td>
                      </tr>
                      ` : ''}
                      <tr>
                        <td style="font-weight: bold; color: #2c3e50; width: 120px; vertical-align: top;">Nom:</td>
                        <td style="color: #34495e;">${name}</td>
                      </tr>
                      <tr>
                        <td style="font-weight: bold; color: #2c3e50; vertical-align: top;">Email:</td>
                        <td style="color: #34495e;"><a href="mailto:${email}" style="color: #d4a574; text-decoration: none;">${email}</a></td>
                      </tr>
                      <tr>
                        <td style="font-weight: bold; color: #2c3e50; vertical-align: top;">Téléphone:</td>
                        <td style="color: #34495e;"><a href="tel:${phone}" style="color: #d4a574; text-decoration: none;">${phone}</a></td>
                      </tr>
                      ${cvFile && cvFile.filepath ? `
                      <tr>
                        <td style="font-weight: bold; color: #2c3e50; vertical-align: top;">CV:</td>
                        <td style="color: #34495e;">📎 CV joint en pièce jointe</td>
                      </tr>
                      ` : ''}
                    </table>
                    
                    ${message ? `
                    <h2 style="color: #2c3e50; margin: 0 0 15px 0; font-size: 20px; border-bottom: 2px solid #d4a574; padding-bottom: 10px;">💬 Message</h2>
                    <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; border-left: 4px solid #d4a574; line-height: 1.6; color: #34495e;">
                      ${message.replace(/\n/g, '<br>')}
                    </div>
                    ` : ''}
                  </td>
                </tr>
                
                <!-- Action Button -->
                <tr>
                  <td style="padding: 0 30px 40px 30px; text-align: center;">
                    <a href="mailto:${email}?subject=Re: Votre candidature" style="display: inline-block; background-color: #d4a574; color: #ffffff; text-decoration: none; padding: 15px 30px; border-radius: 6px; font-weight: bold; font-size: 16px; transition: background-color 0.3s;">
                      📧 Répondre au Candidat
                    </a>
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

    // Clean up temporary file
    if (cvFile && cvFile.filepath) {
      try {
        fs.unlinkSync(cvFile.filepath);
      } catch (cleanupError) {
        console.error('Error cleaning up CV file:', cleanupError);
      }
    }

    if (error) {
      console.error('Business email error:', error);
      return res.status(500).json({
        success: false,
        message: 'Erreur lors de l\'envoi de l\'email. Veuillez réessayer plus tard.'
      });
    }

    // Send confirmation email to candidate
    const confirmationContent = `
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8"></head>
      <body style="font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f4f0;">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto;">
          <tr>
            <td>
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                <tr>
                  <td style="background-color: #d4a574; color: #ffffff; text-align: center; padding: 30px;">
                    <h1 style="margin: 0; font-size: 28px; font-weight: bold;">✅ Merci !</h1>
                    <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Votre candidature a été reçue</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 40px 30px; background-color: #ffffff; text-align: center;">
                    <p style="font-size: 18px; color: #2c3e50; margin: 0 0 20px 0;">Bonjour <strong>${name}</strong>,</p>
                    <p style="font-size: 16px; color: #34495e; line-height: 1.6; margin: 0 0 25px 0;">
                      Merci de votre intérêt pour Construction PMM ${jobTitle ? `pour le poste de <strong style="color: #d4a574;">${jobTitle}</strong>` : ''} ! Nous avons bien reçu votre candidature et nous vous contacterons dans les <strong>5-7 jours ouvrables</strong>.
                    </p>
                    <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #d4a574;">
                      <p style="margin: 0; color: #34495e; font-size: 14px;">
                        <strong>Votre candidature:</strong><br>
                        ${jobTitle ? `✅ Poste: ${jobTitle}<br>` : ''}
                        ${cvFile && cvFile.filepath ? '✅ CV joint' : 'ℹ️ Aucun CV joint'}<br>
                        ${message ? '✅ Message inclus' : ''}
                      </p>
                    </div>
                    <p style="font-size: 16px; color: #34495e; margin: 25px 0 0 0;">
                      Cordialement,<br>
                      <strong style="color: #2c3e50;">L'équipe Construction PMM</strong>
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
      await resend.emails.send({
        from: fromEmail,
        to: email,
        subject: 'Merci pour votre candidature - Construction PMM',
        html: confirmationContent,
        replyTo: businessEmail
      });
    } catch (confirmationError) {
      console.warn('Confirmation email failed:', confirmationError);
    }

    res.status(200).json({
      success: true,
      message: 'Candidature envoyée avec succès!',
      data: data
    });

  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur. Veuillez réessayer plus tard.'
    });
  }
}
