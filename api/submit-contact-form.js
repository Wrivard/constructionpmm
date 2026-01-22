// Vercel Serverless Function for Contact Form Submission
// Sends emails via Resend API
// Test email: wrivard@kua.quebec

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      message: 'Méthode non autorisée. Utilisez POST.' 
    });
  }

  try {
    // Parse form data
    const { name, email, message, acceptTerms } = req.body;

    // Validation
    if (!name || !email || !message) {
      console.error('❌ Missing required fields');
      return res.status(400).json({
        success: false,
        message: 'Tous les champs sont requis.'
      });
    }

    if (!acceptTerms || acceptTerms !== 'true') {
      console.error('❌ Terms not accepted');
      return res.status(400).json({
        success: false,
        message: 'Vous devez accepter les conditions générales.'
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.error('❌ Invalid email format');
      return res.status(400).json({
        success: false,
        message: 'Format d\'email invalide.'
      });
    }

    // Initialize Resend
    const { Resend } = await import('resend');
    const resendApiKey = process.env.RESEND_API_KEY;
    const fromEmail = process.env.FROM_EMAIL || 'onboarding@resend.dev';
    
    // Production business email
    const businessEmail = 'info@constpmm.com';

    if (!resendApiKey) {
      console.error('❌ RESEND_API_KEY not found in environment variables');
      return res.status(500).json({
        success: false,
        message: 'Configuration du serveur manquante.'
      });
    }

    const resend = new Resend(resendApiKey);

    // =====================================================
    // EMAIL 1: Business Notification (to owner)
    // =====================================================
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
                
                <!-- Header -->
                <tr>
                  <td style="background: linear-gradient(135deg, #1b1b1b 0%, #2a2a2a 100%); padding: 40px 30px; text-align: center; border-bottom: 3px solid #dc3545;">
                    <img src="https://constructionpmm.com/images/webclip.png" alt="Construction PMM Logo" width="180" height="auto" style="max-width: 180px; height: auto; margin: 0 auto 20px; display: block;" />
                    <h1 style="margin: 0; font-size: 32px; font-weight: 700; color: #ffffff; letter-spacing: -0.5px;">
                      📧 Nouveau Message de Contact
                    </h1>
                    <p style="margin: 12px 0 0 0; font-size: 16px; color: #cccccc; font-weight: 400;">
                      Construction PMM
                    </p>
                  </td>
                </tr>
                
                <!-- Content -->
                <tr>
                  <td style="padding: 40px 30px; background-color: #2a2a2a;">
                    
                    <!-- Contact Info -->
                    <div style="background-color: #1b1b1b; border-left: 4px solid #dc3545; padding: 24px; margin-bottom: 30px; border-radius: 8px;">
                      <h2 style="margin: 0 0 20px 0; font-size: 20px; font-weight: 600; color: #ffffff;">
                        Informations du Contact
                      </h2>
                      
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td style="padding: 12px 0; border-bottom: 1px solid #3a3a3a;">
                            <table width="100%" cellpadding="0" cellspacing="0">
                              <tr>
                                <td style="color: #999999; font-size: 14px; padding-bottom: 4px;">Nom</td>
                              </tr>
                              <tr>
                                <td style="color: #ffffff; font-size: 16px; font-weight: 500;">${name}</td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                        
                        <tr>
                          <td style="padding: 12px 0; border-bottom: 1px solid #3a3a3a;">
                            <table width="100%" cellpadding="0" cellspacing="0">
                              <tr>
                                <td style="color: #999999; font-size: 14px; padding-bottom: 4px;">Email</td>
                              </tr>
                              <tr>
                                <td style="color: #ffffff; font-size: 16px; font-weight: 500;">
                                  <a href="mailto:${email}" style="color: #dc3545; text-decoration: none;">${email}</a>
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </table>
                    </div>
                    
                    <!-- Message Content -->
                    <div style="background-color: #1b1b1b; padding: 24px; border-radius: 8px; margin-bottom: 30px;">
                      <h3 style="margin: 0 0 16px 0; font-size: 18px; font-weight: 600; color: #ffffff;">
                        Message
                      </h3>
                      <div style="color: #cccccc; font-size: 15px; line-height: 1.6; white-space: pre-wrap; word-wrap: break-word;">
${message}
                      </div>
                    </div>
                    
                    <!-- Quick Action -->
                    <div style="text-align: center; padding: 20px 0;">
                      <a href="mailto:${email}?subject=Re: Votre message à Construction PMM" style="display: inline-block; background: linear-gradient(135deg, #dc3545 0%, #c82333 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(220, 53, 69, 0.3);">
                        Répondre au client
                      </a>
                    </div>
                    
                  </td>
                </tr>
                
                <!-- Footer -->
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

    // =====================================================
    // EMAIL 2: Confirmation to User
    // =====================================================
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
                    <img src="https://constructionpmm.com/images/webclip.png" alt="Construction PMM Logo" width="180" height="auto" style="max-width: 180px; height: auto; margin: 0 auto 24px; display: block;" />
                    <div style="font-size: 64px; margin-bottom: 16px;">✓</div>
                    <h1 style="margin: 0; font-size: 32px; font-weight: 700; color: #ffffff; letter-spacing: -0.5px;">
                      Message envoyé !
                    </h1>
                    <p style="margin: 12px 0 0 0; font-size: 16px; color: #ffffff; opacity: 0.95; font-weight: 400;">
                      Nous avons bien reçu votre message
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
                    
                    <!-- Main Message -->
                    <div style="background-color: #1b1b1b; padding: 24px; border-radius: 8px; margin-bottom: 30px; border-left: 4px solid #dc3545;">
                      <p style="margin: 0 0 16px 0; font-size: 16px; color: #cccccc; line-height: 1.6;">
                        Merci de nous avoir contactés ! Votre message a été transmis à notre équipe.
                      </p>
                      <p style="margin: 0; font-size: 16px; color: #cccccc; line-height: 1.6;">
                        Nous vous répondrons dans les plus brefs délais, généralement sous 24-48 heures ouvrables.
                      </p>
                    </div>
                    
                    <!-- Message Recap -->
                    <div style="background-color: #1b1b1b; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
                      <h3 style="margin: 0 0 16px 0; font-size: 16px; font-weight: 600; color: #dc3545; text-align: center;">
                        📋 Récapitulatif de votre message
                      </h3>
                      
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td style="padding: 8px 0; color: #999999; font-size: 14px;">Nom:</td>
                          <td style="padding: 8px 0; color: #ffffff; font-size: 14px; font-weight: 500; text-align: right;">${name}</td>
                        </tr>
                        <tr>
                          <td style="padding: 8px 0; color: #999999; font-size: 14px;">Email:</td>
                          <td style="padding: 8px 0; color: #ffffff; font-size: 14px; font-weight: 500; text-align: right;">${email}</td>
                        </tr>
                        <tr>
                          <td colspan="2" style="padding: 12px 0 4px 0; color: #999999; font-size: 14px; border-top: 1px solid #3a3a3a;">Message:</td>
                        </tr>
                        <tr>
                          <td colspan="2" style="padding: 8px 0; color: #cccccc; font-size: 14px; line-height: 1.5; white-space: pre-wrap; word-wrap: break-word;">
${message.length > 150 ? message.substring(0, 150) + '...' : message}
                          </td>
                        </tr>
                      </table>
                    </div>
                    
                    <!-- What's Next -->
                    <div style="background: linear-gradient(135deg, rgba(220, 53, 69, 0.1) 0%, rgba(200, 35, 51, 0.1) 100%); border: 1px solid rgba(220, 53, 69, 0.3); padding: 20px; border-radius: 8px; margin-bottom: 30px;">
                      <h3 style="margin: 0 0 12px 0; font-size: 16px; font-weight: 600; color: #dc3545;">
                        Prochaines étapes
                      </h3>
                      <ul style="margin: 0; padding-left: 20px; color: #cccccc; font-size: 14px; line-height: 1.8;">
                        <li>Notre équipe examine votre message</li>
                        <li>Nous vous contacterons par email sous 24-48h</li>
                        <li>En cas d'urgence, appelez-nous directement</li>
                      </ul>
                    </div>
                    
                    <!-- Contact Info -->
                    <div style="text-align: center; padding: 20px 0; border-top: 1px solid #3a3a3a;">
                      <p style="margin: 0 0 12px 0; font-size: 14px; color: #999999;">
                        Besoin d'aide immédiate ?
                      </p>
                      <p style="margin: 0; font-size: 16px; color: #ffffff; font-weight: 600;">
                        📞 Appelez-nous ou visitez notre site
                      </p>
                    </div>
                    
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="background-color: #1b1b1b; padding: 24px 30px; text-align: center; border-top: 1px solid #3a3a3a;">
                    <p style="margin: 0 0 12px 0; font-size: 14px; color: #cccccc;">
                      Merci d'avoir choisi <strong style="color: #dc3545;">Construction PMM</strong>
                    </p>
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

    // =====================================================
    // Send Business Email
    // =====================================================
    const emailSubject = `📧 Nouveau message de ${name}`;
    
    const emailData = {
      from: fromEmail,
      to: businessEmail,
      subject: emailSubject,
      html: businessEmailContent,
      replyTo: email
    };

    const { data, error } = await resend.emails.send(emailData);

    if (error) {
      console.error('❌ Business email error:', error);
      return res.status(500).json({
        success: false,
        message: 'Erreur lors de l\'envoi de l\'email.'
      });
    }

    // =====================================================
    // Send Confirmation Email (don't fail if this fails)
    // =====================================================
    try {
      const confirmationSubject = '✓ Message reçu | Construction PMM';
      
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
      message: 'Message envoyé avec succès!',
      data: data
    });

  } catch (error) {
    console.error('❌ Server error:', error);
    console.error('Error stack:', error.stack);
    console.error('Error message:', error.message);
    
    res.status(500).json({
      success: false,
      message: 'Une erreur est survenue lors de l\'envoi du message.'
    });
  }
}
