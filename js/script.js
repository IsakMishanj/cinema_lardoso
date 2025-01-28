function openReviewPage(movieId) {
    // Redirige alla pagina del film
    window.location.href = `movie.html?id=${movieId}`;
}
///FILTRAGGIO
// Ascolta i cambiamenti dei filtri e avvia il caricamento dei film
$("#genre, #country, #years").on("change", function () {
  loadFilms();
});

$("#search").on("keyup", function () {
  loadFilms();
});



function loadFilms() { 
  const searchParams = {
      genere: $("#genre").val(),
      country: $("#country").val(),
      anno: $("#years").val(),
      search: $("#search").val(),
      // ordine: "+anno" // Puoi aggiornare con altri valori di ordinamento se necessario
  };
  let debounceTimer;
function debounce(func, delay) {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(func, delay);
}

$("#search").on("keyup", function () {
  debounce(loadFilms, 300); // Ritardo di 300 ms
});


$.ajax({
  url: "/api/film",
  method: "GET",
  data: searchParams,
  success: function (response) {
    const moviesGrid = $(".movies-grid");
    moviesGrid.empty();

    if (response.length === 0) {
      moviesGrid.append("<p>Nessun film trovato.</p>");
      return;
    }

    response.forEach((film) => {
      let data = new Date(film.data_uscita).getFullYear();
      const movieCard = `
      <div class="movie-card">
        <div class="card-img" style="background-image: url('${film.locandina}');"></div>
        <div class="card-info">
          <p class="text-title">${film.titolo_f}</p>
          <p class="text-body">${film.nome_g} - ${data} - ${film.durata}</p>
        </div>
      </div>`;
      moviesGrid.append(movieCard);
    });
  },
  error: function (error) {
    console.error("Errore durante il recupero dei film:", error);
    alert("Errore durante il caricamento dei film!");
  }
});
}





document.addEventListener("DOMContentLoaded", async () => {
    const moviesgrid = document.querySelector(".movies-grid");
  
    try {
      // Chiamata API per ottenere i servizi
      const responseF = await fetch("/film");
      const film = await responseF.json();
      console.log(film);
      // const responseG = await fetch("/genere");
      // const genere = await responseG.json();
      // Aggiungi ogni servizio come card
      film.forEach((film) => {
        const card = document.createElement("div");
        card.className = "card";
        card.onclick = function () {
          // Cambia l'URL con il percorso della pagina di dettaglio del film
          window.location.href = `movieDetails.html?ID=${film.idf}`;
      };
        let data = new Date(film.data_uscita).getFullYear();
        card.innerHTML = `
          <div class="card-img" style="background-image: url('${film.locandina}');"></div>
          <div class="card-info">
            <p class="text-title">${film.titolo_f}</p>
            <p class="text-body">${film.nome_g} - ${data} - ${film.durata}min</p>
            
          </div>
          <div class="card-footer">
            <!-- <span class="text-title">€${film.genere}</span> -->
            
              
                
          
            </div>
          </div>
        `;
        
        moviesgrid.appendChild(card);
      });
    } catch (error) {
      console.error("Errore nel caricamento dei servizi:", error);
    }
  });


  document.addEventListener("DOMContentLoaded", () => {
    const movieCards = document.querySelectorAll(".movie-card");
});



async function login() {
  
  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;

  try {
    const response = await fetch("/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),  
    });

    if (response.ok) {
      const user = await response.json();
      localStorage.setItem("utente", JSON.stringify(user));

      // Recupera l'ID del team
      const teamResponse = await fetch(`/getUserTeam/${user.idu}`);
      if (teamResponse.ok) {
        const { teamId } = await teamResponse.json();
        localStorage.setItem("teamId", JSON.stringify(teamId));
      } else {
        console.warn("Nessun team trovato per l'utente.");
        localStorage.removeItem("teamId");
      }

      alert("Login effettuato con successo!");
      // Redirigi al Team Management o Dashboard
      window.location.href = "home.html";
    }
  } catch (error) {
    console.error("Errore durante il login", error);
    alert("Errore durante il login");
  }
}

//funzione signup
async function signupfun(){

    const nome_utente = document.getElementById("signupNome_Utente").value;
    const email = document.getElementById("signupEmail").value;
    const password = document.getElementById("signupPassword").value;
    

    try {
      const response = await fetch("/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome_utente, email, password }),
      });

      if (response.ok) {
        alert("Registrazione effettuata con successo! Ora effettua il login.");
        window.location.href = "login.html";
      } else {
        const errorData = await response.json();
        alert(errorData.error || "Errore durante la registrazione");
      }
    } catch (error) {
      console.error("Errore durante la registrazione:", error.message);
      alert("Errore del server");
    }
  }


document.addEventListener("DOMContentLoaded", function () {
  const navbarButtons = document.querySelector(".navbar-buttons");

  // Recupera i dati utente dal localStorage
  const user = JSON.parse(localStorage.getItem("utente")); // Usare "utente" invece di "user"

  if (user) {
      // Se l'utente è loggato, mostra il nome utente e l'immagine profilo
      navbarButtons.innerHTML = `
          <div class="user-info">
              <img src="${'../img/imgU/user-icon.jpg'}" alt="Profile" class="profile-image">
              <span class="username">${user.username}</span>
              <button class="logout-button">Logout</button>
          </div>
      `;

      // Aggiungi il listener per il logout
      document.querySelector(".logout-button").addEventListener("click", function () {
          localStorage.removeItem("utente"); // Usare "utente" invece di "user"
          window.location.reload(); // Ricarica la pagina per aggiornare la navbar
      });

  } else {
      // Se non è loggato, mostra il pulsante di login
      navbarButtons.innerHTML = `<button class="login-button" onclick="window.location.href='login.html'">Login</button>`;
  }
});

