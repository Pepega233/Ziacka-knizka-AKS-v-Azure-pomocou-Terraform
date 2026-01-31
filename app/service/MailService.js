// Nodemailer – knižnica na odosielanie emailov
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "fake-smtp", // adresa SMTP servera
    port: process.env.SMTP_PORT || 25, // port SMTP servera
    secure: false // nepoužíva TLS (lokálne prostredie)
});

export async function sendMail({ to, subject, text }) {

    // Ochrana – email príjemcu musí existovať
    if (!to) {
        throw new Error("sendMail: TO je prázdne");
    }

    // Odoslanie emailu pomocou nodemailer
    await transporter.sendMail({
        from: "cms@school.local", // odosielateľ
        to,          // príjemca (string)
        subject,     // predmet správy
        text         // telo správy
    });
    // Log do konzoly (debug / vývoj)
    console.log("MAIL ODOSLANÝ NA:", to);
}
