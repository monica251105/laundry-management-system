import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendOrderFinishedEmail = async (
  email: string,
  name: string,
  invoiceCode: string,
  totalPrice: number
) => {
  try {
    const mailOptions = {
      from: process.env.FROM_EMAIL,
      to: email,
      subject: `Laundry Selesai - ${invoiceCode}`,
      text: `Halo ${name}, laundry dengan invoice ${invoiceCode} sudah selesai. Total: Rp ${totalPrice.toLocaleString()}. Silakan ambil di outlet.`,
      html: `<p>Halo <b>${name}</b>,</p>
             <p>Laundry dengan invoice <b>${invoiceCode}</b> sudah selesai.</p>
             <p>Total: <b>Rp ${totalPrice.toLocaleString()}</b></p>
             <p>Silakan ambil di outlet.</p>`,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${email}`);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
};
