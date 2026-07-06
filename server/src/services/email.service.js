const transporter = require('../config/mailer');
const env = require('../config/env');
const User = require('../models/user.model');

async function sendEmail({ userId, subject, text, html }) {
  const user = await User.findById(userId);
  if (!user) throw new Error(`Cannot email unknown user ${userId}`);
  if (user.email_opt_out) {
    return { skipped: true, reason: 'user opted out of email' };
  }

  await transporter.sendMail({
    from: env.smtp.from,
    to: user.email,
    subject,
    text,
    html: html || `<p>${text}</p>`,
  });
  return { skipped: false };
}

module.exports = { sendEmail };
