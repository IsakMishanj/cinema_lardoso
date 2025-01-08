const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
const path = require("path");
require("dotenv").config();

const app = express();
const port = 3000;

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "html", "home.html"));
});
// Configura CORS
app.use(cors());

app.get("/movieDetails.html", (req, res) => {
  res.sendFile(path.join(__dirname, "html", "movieDetails.html"));
});

app.use(express.static(path.join(__dirname, "html")));
app.use("/css", express.static(path.join(__dirname, "css")));
app.use("/js", express.static(path.join(__dirname, "js")));
app.use("/img", express.static(path.join(__dirname, "img")));
app.use(express.json());

// app.get("/genere", async (req, res) => {
//   try {
//     const { rows } = await pool.query("SELECT * FROM genere");
//     res.json(rows);
//   } catch (error) {
//     console.error(error);
//     res.status(500).send("Errore del server");
//   }
// });


//per carcare dal db
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





//sempre in fondo
app.listen(port, () => {
    console.log(`Server avviato su http://localhost:${port}`);
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

  // SELECT * FROM film JOIN film_genere ON film.idf = film_genere.idf JOIN genere ON film_genere.idg = genere.idg; 
  // SELECT film.idf, film.titolo, film.durata, ARRAY_AGG(DISTINCT genere.nome) AS generiFROM filmJOIN film_genere ON film.idf = film_genere.idfJOIN genere ON film_genere.idg = genere.idgGROUP BY film.idf, film.titolo, film.durata;