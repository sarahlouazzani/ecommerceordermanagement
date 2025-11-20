const nodemailer = require('nodemailer');
const logger = require('../config/logger');

// Configuration du transporteur email
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

/**
 * Envoyer un email
 */
async function sendEmail(to, subject, text, html = null) {
  try {
    // En développement, ne pas vraiment envoyer
    if (process.env.NODE_ENV === 'development') {
      logger.info(`[DEV] Email simulé vers ${to}: ${subject}`);
      return { success: true, messageId: 'dev-' + Date.now() };
    }

    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || '"E-Commerce Platform" <noreply@ecommerce.com>',
      to,
      subject,
      text,
      html: html || text
    });

    logger.info(`Email envoyé: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    logger.error('Erreur envoi email:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Envoyer un SMS (simulation)
 */
async function sendSMS(phone, message) {
  try {
    logger.info(`[SMS] Envoi vers ${phone}: ${message}`);
    // Intégration Twilio ou autre service SMS
    return { success: true };
  } catch (error) {
    logger.error('Erreur envoi SMS:', error);
    return { success: false, error: error.message };
  }
}

module.exports = {
  sendEmail,
  sendSMS
};
