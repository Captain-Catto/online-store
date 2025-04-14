import nodemailer from "nodemailer";

interface EmailOptions {
  to: string;
  subject: string;
  text: string;
  html: string;
}

export const sendEmail = async (options: EmailOptions): Promise<void> => {
  // Cấu hình transporter sử dụng Mailtrap
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT || "2525"),
    secure: process.env.EMAIL_SECURE === "true",
    auth: {
      user: process.env.MAILTRAP_USER,
      pass: process.env.MAILTRAP_PASS,
    },
  });

  // Cấu hình email
  const mailOptions = {
    from: `${process.env.EMAIL_FROM_NAME} <${process.env.EMAIL_FROM}>`,
    to: options.to,
    subject: options.subject,
    text: options.text,
    html: options.html,
  };

  // Gửi email
  await transporter.sendMail(mailOptions);
  console.log(`Email đã được gửi đến: ${options.to}`);
};
