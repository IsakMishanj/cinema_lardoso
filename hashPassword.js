const bcrypt = require("bcrypt");
const pool = require("./db"); // Assicurati che il percorso a "db.js" sia corretto

async function hashPasswords() {
  try {
    // Leggi tutti gli utenti con password in chiaro
    const utenti = await pool.query("SELECT idu, password FROM utente");

    for (const utente of utenti.rows) {
      // Genera l'hash della password
      const hashedPassword = await bcrypt.hash(utente.password, 10);

      // Aggiorna la password nel database
      await pool.query("UPDATE utente SET password = $1 WHERE idu = $2", [hashedPassword, utente.idu]);

      console.log(`Password aggiornata per utente con idu: ${utente.idu}`);
    }

    console.log("Tutte le password sono state hashate correttamente!");
  } catch (error) {
    console.error("Errore durante l'aggiornamento delle password:", error);
  } finally {
    pool.end(); // Chiudi la connessione al database
  }
}

hashPasswords();
