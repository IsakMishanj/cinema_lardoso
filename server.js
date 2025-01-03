const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
const path = require("path");
require("dotenv").config();

const app = express();
const port = 3000;

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Configura CORS
app.use(cors());

app.use(express.static(path.join(__dirname, "html")));
app.use("/css", express.static(path.join(__dirname, "css")));
app.use("/js", express.static(path.join(__dirname, "js")));
app.use("/img", express.static(path.join(__dirname, "img")));
app.use(express.json());
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "html", "home.html"));
});
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
      const { rows } = await pool.query("SELECT * FROM film JOIN film_genere ON film.idf = film_genere.idf JOIN genere ON film_genere.idg = genere.idg;"); 
      res.json(rows);
      console.log( res.json(rows));
    } catch (error) {
      console.error(error);
      res.status(500).send("Errore del server");
    }
  });
  


//sempre in fondo
app.listen(port, () => {
    console.log(`Server avviato su http://localhost:${port}`);
  });
  
  // SELECT * FROM film JOIN film_genere ON film.idf = film_genere.idf JOIN genere ON film_genere.idg = genere.idg; 
  // SELECT film.idf, film.titolo, film.durata, ARRAY_AGG(DISTINCT genere.nome) AS generiFROM filmJOIN film_genere ON film.idf = film_genere.idfJOIN genere ON film_genere.idg = genere.idgGROUP BY film.idf, film.titolo, film.durata;