const express = require("express");
const cors = require("cors");
const bcrypt = require('bcrypt');
const { Pool } = require("pg");
const path = require("path");
require("dotenv").config();

const app = express();
const port = 3001;

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
      SELECT 
        film.idf,
        film.titolo_f,
        film.regista,
        film.trama,
        film.data_uscita,
        film.paese,
        film.durata,
        film.castf,
        film.locandina,
        film.background_img,
        film.trailer,
        (SELECT genere.nome_g 
         FROM film_genere 
         JOIN genere ON film_genere.idg = genere.idg 
         WHERE film_genere.idf = film.idf 
         LIMIT 1) AS primo_genere
      FROM film
      ORDER BY film.titolo_f;
    `);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).send("Errore del server");
  }
});






//FILTRAGGIO
app.get('/api/film', async (req, res) => {
  try {
    console.log('Parametri ricevuti:', req.query);
    const { genere, country, anno, search } = req.query;
    const validCountry = country && country !== 'country' ? country : null;

    let queryText = `
      SELECT DISTINCT ON (f.idf) 
    f.idf,
    f.titolo_f,
    f.regista,
    f.trama,
    f.data_uscita,
    f.paese,
    f.durata,
    f.castf,
    f.locandina,
    f.background_img,
    f.trailer,
    g.nome_g AS nome_genere
  FROM film AS f
  INNER JOIN film_genere AS fg ON f.idf = fg.idf
  INNER JOIN genere AS g ON fg.idg = g.idg
  WHERE 1 = 1
    `;

    const queryParams = [];
    let paramIndex = 1;

    // Filtro per genere
    if (genere) {
      queryText += ` AND g.idg = $${paramIndex}`;
      queryParams.push(genere);
      paramIndex++;
    }

    // Filtro per paese
    if (country) {
      queryText += ` AND f.paese ILIKE $${paramIndex}`;
      queryParams.push(`%${country}%`);
      paramIndex++;
    }

    // Filtro per anno
    if (anno) {
      queryText += ` AND EXTRACT(YEAR FROM f.data_uscita) = $${paramIndex}`;
      queryParams.push(anno);
      paramIndex++;
    }

    // Filtro per ricerca
    if (search) {
      queryText += ` AND (f.titolo_f ILIKE $${paramIndex} OR f.trama ILIKE $${paramIndex})`;
      queryParams.push(`%${search}%`);
      paramIndex++;
    }

    queryText += ` ORDER BY f.idf, g.nome_g`;

    const result = await pool.query(queryText, queryParams);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Nessun film trovato" });
    }

    res.json(result.rows);
    console.log("Query SQL:", queryText);
    console.log("Parametri:", queryParams);

  } catch (err) {
    console.error('Errore nel recupero dei film:', err);
    res.status(500).send('Errore nel recupero dei film dal database');
  }
});



//SIGNUP
app.post("/signup", async (req, res) => {
  const { nome_utente, email, password } = req.body;
  console.log("Dati Ricevuti");
  console.log(nome_utente,email,password);
  if (!nome_utente || !email || !password) {
    return res.status(400).json({ error: "Tutti i campi sono obbligatori" });
  }

  try {
    
    // Controlla se l'utente esiste già
    const userCheck = await pool.query("SELECT * FROM utente WHERE email = $1", [email]);
    if (userCheck.rows.length > 0) {
      return res.status(409).json({ error: "Email già registrata" });
    }

    // const idCliente = generateRandomId(8); // Lunghezza 8 caratteri
    // const idVenditore = generateRandomId(10);
    // Hash della password
    const PasswordH = await bcrypt.hash(password, 10);

    // Inserisci il nuovo utente nel database
    
    await pool.query(
      "INSERT INTO utente (nome_utente, email, password) VALUES ($1, $2, $3)",
      [nome_utente, email, PasswordH]
    );

    res.status(201).json({ message: "Registrazione effettuata con successo" });
  } catch (error) {
    console.error("Errore durante la registrazione:", error);
    res.status(500).json({ error: error.message });
  }
});

//LOGIN
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  console.log(req.body);
  
  if (!email || !password) {
    return res.status(400).json({ error: "Tutti i campi sono obbligatori" });
  }

  try {
    console.log(email);
    // Cerca l'utente nel database
    const userQuery = await pool.query("SELECT * FROM utente WHERE email = $1", [email]);
    const user = userQuery.rows[0];

    console.log(user);


    if (!user) {
      return res.status(401).json({ error: "Credenziali non valide"+ error.message });
    }

    console.log(user.password);
    // Verifica la password
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ error: "Credenziali non valide"});
    }

    res.status(200).json({
    
      username: user.nome_utente,
      email: user.email,
      password: user.password
    });
  } catch (error) {
    console.error("Errore durante il login:", error);
    res.status(500).json({ error: error.message });
  }
});

app.get("/getUserTeam/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const query = `
      SELECT u.teamId
      FROM utente u
      WHERE u.teamId = $1
    `;
    const result = await pool.query(query, [userId]);

    if (result.rows.length > 0) {
      res.status(200).json({ teamId: result.rows[0].idteam });
    } else {
      res.status(404).json({ message: "Nessun team trovato per questo utente." });
    }
  } catch (error) {
    console.error("Errore durante il recupero del team:", error);
    res.status(500).send("Errore del server.");
  }
});






//parte visualizzazione

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




// app.get("/topCommenters.html", (req, res) => {
//   res.sendFile(path.join(__dirname, "html", "topCommenters.html"));
// });




// app.get("/api/top-commenters", async (req, res) => {
//   try {
//     const query = `
//       SELECT 
//         u.idu, 
//         u.nome_utente, 
//         COUNT(r.idr) AS numero_commenti
//       FROM utente u
//       LEFT JOIN recensione r ON u.idu = r.idu
//       GROUP BY u.idu, u.nome_utente
//       ORDER BY numero_commenti DESC
//       LIMIT 10;
//     `;
//     const { rows } = await pool.query(query);
//     res.json(rows);
//   } catch (error) {
//     console.error("Errore nel recupero degli utenti più attivi:", error);
//     res.status(500).json({ error: "Errore interno del server" });
//   }
// });
///COMMENTATORE INCREDIBILE
app.get("/top-users", (req, res) => {
  res.sendFile(path.join(__dirname, "html", "top-users.html"));
});


app.get("/api/top-users", async (req, res) => {
  try {
    const query = `
      SELECT 
        u.nome_utente,
        COUNT(r.idr) AS numero_commenti
      FROM utente u
      LEFT JOIN recensione r ON u.idu = r.idu
      GROUP BY u.idu, u.nome_utente
      ORDER BY numero_commenti DESC
      LIMIT 10;
    `;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error("Errore nel recupero degli utenti:", error);
    res.status(500).json({ error: "Errore interno del server" });
  }
});


//FILM PIù COMMENTATI

app.get("/mostCommentedMovies.html", (req, res) => {
  res.sendFile(path.join(__dirname, "html", "mostCommentedMovies.html"));
});


app.get("/api/most-commented-movies", async (req, res) => {
  try {
    const query = `
      SELECT 
    f.idf, 
    f.titolo_f, 
    COUNT(r.idr) AS numero_commenti, 
    f.locandina
  FROM film f
  LEFT JOIN recensione r ON f.idf = r.idf
  GROUP BY f.idf, f.titolo_f, f.locandina
  ORDER BY numero_commenti DESC
  LIMIT 10;

    `;
    const { rows } = await pool.query(query);
    res.json(rows);
  } catch (error) {
    console.error("Errore nel recupero dei film più commentati:", error);
    res.status(500).json({ error: "Errore interno del server" });
  }
});




//TOKEN
const jwt = require("jsonwebtoken");

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Tutti i campi sono obbligatori" });
  }

  try {
    const userQuery = await pool.query("SELECT * FROM utente WHERE email = $1", [email]);
    const user = userQuery.rows[0];

    if (!user) {
      return res.status(401).json({ error: "Credenziali non valide" });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: "Credenziali non valide" });
    }

    const token = jwt.sign({ id: user.idu }, process.env.JWT_SECRET, { expiresIn: "1h" });

    res.status(200).json({
      username: user.nome_utente,
      email: user.email,
      token,
    });
  } catch (error) {
    console.error("Errore durante il login:", error);
    res.status(500).json({ error: error.message });
  }
});

const authenticateToken = (req, res, next) => {
  const token = req.headers["authorization"];
  if (!token) return res.sendStatus(403);

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

app.get("/api/protected", authenticateToken, (req, res) => {
  res.json({ message: "Accesso autorizzato", user: req.user });
});


//sempre in fondo
app.listen(port, () => {
    console.log(`Server avviato su http://localhost:${port}`);
  });
  

  // SELECT * FROM film JOIN film_genere ON film.idf = film_genere.idf JOIN genere ON film_genere.idg = genere.idg; 
  // SELECT film.idf, film.titolo, film.durata, ARRAY_AGG(DISTINCT genere.nome) AS generiFROM filmJOIN film_genere ON film.idf = film_genere.idfJOIN genere ON film_genere.idg = genere.idgGROUP BY film.idf, film.titolo, film.durata;


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




