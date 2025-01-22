const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
const path = require("path");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000;

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "html", "home.html"));
});

// Configura CORS
app.use(cors());

pool.connect()
  .then(client => {
    console.log('Connessione al database riuscita');
    client.release(); // Rilascia il client quando la connessione è riuscita
  })
  .catch(err => {
    console.error('Errore di connessione al database:', err);
  });

pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Errore nella connessione al database', err);
  } else {
    console.log('Connessione al database riuscita', res.rows);
  }
});

app.get("/movieDetails.html", (req, res) => {
  res.sendFile(path.join(__dirname, "html", "movieDetails.html"));
});

app.use(express.static(path.join(__dirname, "html")));
app.use("/css", express.static(path.join(__dirname, "css")));
app.use("/js", express.static(path.join(__dirname, "js")));
app.use("/img", express.static(path.join(__dirname, "img")));
app.use(express.json());

app.get("/film", async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT * 
      FROM film 
      JOIN film_genere ON film.idf = film_genere.idf 
      JOIN genere ON film_genere.idg = genere.idg; 
    `);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).send("Errore del server");
  }
});
  


  app.get("/film/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const { rows } = await pool.query(`
            SELECT 
                film.*, 
                ARRAY_AGG(DISTINCT genere.nome_g) AS generi,
                (SELECT AVG(valutazione) 
                 FROM recensione 
                 WHERE recensione.idf = film.idf) AS media_valutazioni
            FROM film
            JOIN film_genere ON film.idf = film_genere.idf
            JOIN genere ON film_genere.idg = genere.idg
            WHERE film.idf = $1
            GROUP BY film.idf;
        `, [id]);

        if (rows.length === 0) {
            return res.status(404).json({ error: "Film non trovato" });
        }

        res.json(rows[0]);
    } catch (error) {
        console.error("Errore durante il recupero dei dettagli del film:", error);
        res.status(500).send("Errore del server");
    }
});

app.get("/recensioni/:movieId", async (req, res) => {
  const { movieId } = req.params;
  console.log(`Richiesta ricevuta per recensioni del film con ID: ${movieId}`);

  try {
    // Esegui la query per ottenere le recensioni dal database
    const result = await pool.query(
      `SELECT 
          r.idR, 
          r.titolo_r,
          r.testo,
          r.valutazione,
          r.data_r,
          u.nome_utente,
          f.titolo_f AS titolo_film,
          f.regista,
          f.data_uscita,
          f.paese,
          f.durata
       FROM 
          Recensione r
       JOIN 
          Utente u ON r.idu = u.idu
       JOIN 
          Film f ON r.idf = f.idf
       WHERE 
          r.idF = $1
       ORDER BY 
          r.data_r DESC`,
      [movieId] // Passiamo movieId come parametro alla query
    );

    // Se non ci sono recensioni per il film
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Nessuna recensione disponibile per questo film." });
    }

    // Restituisci le recensioni in formato JSON
    res.json(result.rows);
  } catch (error) {
    console.error("Errore nella query:", error);
    // Gestione degli errori
    res.status(500).json({ message: "Errore interno del server. Riprovare più tardi." });
  }
});


  // SELECT * FROM film JOIN film_genere ON film.idf = film_genere.idf JOIN genere ON film_genere.idg = genere.idg; 
  // SELECT film.idf, film.titolo, film.durata, ARRAY_AGG(DISTINCT genere.nome) AS generiFROM filmJOIN film_genere ON film.idf = film_genere.idfJOIN genere ON film_genere.idg = genere.idgGROUP BY film.idf, film.titolo, film.durata;






  app.get("/api/related-movies", async (req, res) => {
    const movieId = parseInt(req.query.idF, 10);
    if (!movieId) {
      return res.status(400).json({ error: "ID film non fornito" });
    }
  
    try {
      const query = `
        SELECT DISTINCT f.idF, f.titolo_f, f.regista, 
               ARRAY_AGG(g.nome_g) AS generi
        FROM Film f
        JOIN Film_Genere fg ON f.idF = fg.idF
        JOIN Genere g ON fg.idG = g.idG
        WHERE f.idF != $1
          AND (f.regista = (SELECT regista FROM Film WHERE idF = $1)
               OR fg.idG IN (
                   SELECT idG FROM Film_Genere WHERE idF = $1
               ))
        GROUP BY f.idF, f.titolo_f, f.regista;
      `;
      const result = await pool.query(query, [movieId]);
      res.json(result.rows);
    } catch (error) {
      console.error("Errore nel recupero dei film correlati:", error);
      res.status(500).json({ error: "Errore interno del server" });
    }
  }); 






















  //sempre in fondo
app.listen(port, () => {
  console.log(`Server avviato su http://localhost:${port}`);
});
