const express = require('express');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

// Middleware per il parsing del corpo della richiesta (JSON)
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Configura il trasportatore di Nodemailer con le credenziali del tuo server email
const transporter = nodemailer.createTransport({
    service: 'gmail',  // Puoi usare il servizio che preferisci (ad esempio Gmail)
    auth: {
        user: 'tuoindirizzoemail@gmail.com',  // Sostituisci con il tuo indirizzo email
        pass: 'tuapasswordemail'  // Sostituisci con la tua password dell'email (o usa una "password app" se usi Gmail con 2FA)
    }
});

// Endpoint per il recupero della password
app.post('/send-recovery-email', (req, res) => {
    const { email } = req.body; // L'email inviata dal frontend

    // Crea il contenuto dell'email
    const mailOptions = {
        from: 'tuoindirizzoemail@gmail.com',
        to: email,
        subject: 'Recupero Password',
        text: `Ciao! Per favore, segui il link per reimpostare la tua password: http://localhost:3000/reset-password/${email}`
    };

    // Invia l'email
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return res.status(500).send('Errore nell\'invio dell\'email');
        }
        res.status(200).send('Email inviata con successo');
    });
});

// Avvia il server
app.listen(port, () => {
    console.log(`Server in ascolto su http://localhost:${port}`);
});
