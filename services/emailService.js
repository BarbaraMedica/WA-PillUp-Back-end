import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

// Transporter za SendGrid
const transporter = nodemailer.createTransport({
  host: "smtp.sendgrid.net",
  port: 587,
  auth: {
    user: "apikey",               // doslovno 'apikey'
    pass: process.env.SENDGRID_API_KEY
  }
});

// Funkcija za slanje maila
export const sendEmail = async (to, subject, text, isHtml = false) => {
  try {
    const mailOptions = {
      from: `PillUp <${process.env.EMAIL_USER}>`,
      to,
      subject,
      replyTo: to,
      headers: {
        'X-Priority': '3',
        'X-MSMail-Priority': 'Normal'
      }
    };

    // Ako je HTML, koristi html polje, inače text
    if (isHtml) {
      mailOptions.html = text;
    } else {
      mailOptions.text = text;
    }

    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Email poslan:", info.messageId, "->", to);
    return info;
  } catch (error) {
    console.error("❌ Greška pri slanju na", to, ":", error.message);
    throw error;
  }
};