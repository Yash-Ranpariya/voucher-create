import nodemailer from 'nodemailer';

let transporter: any = null;

// Initialize a testing account automatically
nodemailer.createTestAccount((err, account) => {
  if (err) {
    console.error('Failed to create a testing email account: ', err);
    return;
  }
  transporter = nodemailer.createTransport({
    host: account.smtp.host,
    port: account.smtp.port,
    secure: account.smtp.secure,
    auth: {
      user: account.user,
      pass: account.pass
    }
  });
  console.log('✅ Email Service Ready (Ethereal Testing Account)');
});

export const sendEmail = async (to: string, subject: string, html: string): Promise<string | null> => {
  if (!transporter) {
    console.log('Transporter not ready yet.');
    return null;
  }

  try {
    const info = await transporter.sendMail({
      from: '"ExpenseManager" <noreply@expensemanager.com>',
      to,
      subject,
      html
    });
    
    const previewUrl = nodemailer.getTestMessageUrl(info);
    console.log(`\n============================================`);
    console.log(`📧 EMAIL SENT TO: ${to}`);
    console.log(`SUBJECT: ${subject}`);
    console.log(`🔗 VIEW EMAIL HERE: ${previewUrl}`);
    console.log(`============================================\n`);
    
    return previewUrl as string;
  } catch (error) {
    console.error('Error sending email:', error);
    return null;
  }
};
