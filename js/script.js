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




let debounceTimer;

function debounce(func, delay) {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(func, delay);
}

function loadFilms() {
  const searchParams = {
    genere: $("#genre").val(),
    country: $("#country").val(),
    anno: $("#years").val(),
    search: $("#search").val(),
    ordine: "+anno" // Puoi aggiornare con altri valori di ordinamento se necessario
  };

  $.ajax({
    url: "/api/film",
    method: "GET",
    data: searchParams,
    success: function (response) {
      const moviesGrid = $(".movies-grid");

      // Svuota il contenitore delle card
      moviesGrid.empty();

      if (response.length === 0) {
        moviesGrid.append("<p>Nessun film trovato.</p>");
        return;
      }

      response.forEach((film) => {
        let data = new Date(film.data_uscita).getFullYear();
        // const generi = film.generi ? film.generi.join(', ') : ''; // Gestione di più generi

        // Genera il codice HTML per ogni card
        const movieCard = `
          <div class="card" id="card-${film.idf}">
            <div class="card-img" style="background-image: url('${film.locandina}');"></div>
            <div class="card-info">
              <p class="text-title">${film.titolo_f}</p>
              <p class="text-body">${film.nome_genere} - ${data} - ${film.durata}min</p>
            </div>
          </div>
        `;

        // Aggiungi la card al grid
        moviesGrid.append(movieCard);
      });

      // Aggiungi l'evento di click alle card
      $(".card").on("click", function () {
        const filmId = $(this).attr("id").replace("card-", "");
        window.location.href = `movieDetails.html?ID=${filmId}`;
      });
    },
    error: function (error) {
      console.error("Errore durante il recupero dei film:", error);
      alert("Errore durante il caricamento dei film!");
    }
  });
}

// Attivazione del debounce
$("#search").on("keyup", function () {
  debounce(loadFilms, 300); // Ritardo di 300 ms
});




document.addEventListener("DOMContentLoaded", async () => {
    const moviesgrid = document.querySelector(".movies-grid");
  
    try {
      // Chiamata API per ottenere i film
      const responseF = await fetch("/film");
      const film = await responseF.json();
      console.log(film);

      // Aggiungi ogni film come card
      film.forEach((film) => {
          const card = document.createElement("div");
          card.className = "card";
          card.id = `card-${film.idf}`; // ID univoco per ogni card

          // Aggiungi evento onclick per ogni card
          card.onclick = function () {
              // Cambia l'URL con il percorso della pagina di dettaglio del film
              window.location.href = `movieDetails.html?ID=${film.idf}`;
          };

          let data = new Date(film.data_uscita).getFullYear();
          card.innerHTML = `
              <div class="card-img" style="background-image: url('${film.locandina}');"></div>
    <div class="card-info">
        <p class="text-title">${film.titolo_f}</p>
        <p class="text-body">${film.primo_genere} - ${data} - ${film.durata}min</p>
    </div>
    <div class="card-footer"></div>
          `;

          // Aggiungi la card al grid
          moviesgrid.appendChild(card);
      });
  } catch (error) {
      console.error("Errore nel caricamento dei film:", error);
  }  
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
      window.location.href = "home.html";
    }else{
      console.error("Credenziali non valide", error);
      alert("Credenziali non valide");
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

  //SELECT PAESI
  fetch('/api/paesi')
  .then(response => response.json())
  .then(paesi => {
      const select = document.getElementById('country');
      paesi.forEach(p => {
          const option = document.createElement('option');
          option.value = p.paese;
          option.textContent = p.paese;
          select.appendChild(option);
      });
  })
  .catch(error => console.error('Errore:', error));

  //SELECT GENERI
  // Recupera i generi dal server e popola il <select>
  document.addEventListener("DOMContentLoaded", function () {
    fetch('/api/generi')
        .then(response => response.json())
        .then(generi => {
            const select = document.getElementById('genre');
            generi.forEach(genere => {
                const option = document.createElement('option');
                option.value = genere.idg;
                option.textContent = genere.nome_g;
                select.appendChild(option);
            });
        })
        .catch(error => console.error('Errore:', error));
});

document.addEventListener("DOMContentLoaded", function () {
  const navbarButtons = document.querySelector(".navbar-buttons");
      
  // Recupera i dati utente dal localStorage
  const user = JSON.parse(localStorage.getItem("utente")); // Usare "utente" invece di "user"
      
  if (user) {
      // Se l'utente è loggato, mostra il nome utente e l'immagine profilo
      navbarButtons.innerHTML = `
        <div class="user-profile">
          <img src="${'../img/imgU/user-icon.jpg'}" alt="User Profile" class="profile-image">
          <span class="username">${user.username}</span>
          <div class="dropdown-menu hidden">
            <button class="logout-button">Logout</button>
          </div>
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
    
document.addEventListener("DOMContentLoaded", function () {
  const userProfile = document.querySelector(".user-profile");
  const dropdownMenu = document.querySelector(".dropdown-menu");
  const logoutButton = document.querySelector(".logout-button");
            
  userProfile.addEventListener("click", function () {
    dropdownMenu.classList.toggle("show");
  });
            
  // Chiudi il menu se si clicca fuori
  document.addEventListener("click", function (event) {
    if (!userProfile.contains(event.target)) {
      dropdownMenu.classList.remove("show");
    }
  });
            
  logoutButton.addEventListener("click", function () {
    localStorage.removeItem("loggedInUser");
    window.location.reload(); // Ricarica la pagina dopo il logout
  });
});