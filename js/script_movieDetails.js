document.querySelector('.back-button').addEventListener('click', () => {
  window.history.back();
});

function scrollCarousel(direction) {
  const carousel = document.querySelector(".movies-carosello");
  const scrollAmount = 300; // Quantità di scorrimento (in pixel)
  carousel.scrollBy({
    left: direction * scrollAmount,
    behavior: "smooth"
  }); 
}
document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const movieId = params.get("id");
  caricaRecensioni(movieId);
});

document.addEventListener("DOMContentLoaded", async () => {
const params = new URLSearchParams(window.location.search);
const movieId = params.get("ID");

if (!movieId) {
    console.error("ID del film non trovato!");
    return;
}

try {
    const response = await fetch(`/film/${movieId}`);
    if (!response.ok) throw new Error("Errore nella risposta del server");
    const film = await response.json();
    let data = new Date(film.data_uscita).getFullYear();

    document.getElementById("movie-title").textContent = film.titolo_f || "Titolo non disponibile";
    document.getElementById("movie-year").textContent = data || "Anno non disponibile";
    document.getElementById("movie-genre").textContent = film.generi ? film.generi.join(", ") : "Genere non disponibile";
    document.getElementById("movie-direction").textContent = film.regista || "Regista non disponibile";
    document.getElementById("movie-cast").textContent = film.castf || "Cast non disponibile";

    const descriptionElement = document.getElementById("movie-description");
    const fullText = film.trama || "Descrizione non disponibile";
      const wordLimit = 250;
      const words = fullText.split(" ");
        
      if (words.length > wordLimit) {
        const shortText = words.slice(0, wordLimit).join(" ") + "... ";
        descriptionElement.innerHTML = shortText;
            
        const readMore = document.createElement("span");
        readMore.textContent = "Leggi tutto";
        readMore.style.color = "#bb3a58";
        readMore.style.cursor = "pointer";
        readMore.addEventListener("click", () => {
          descriptionElement.textContent = fullText;
        });
          descriptionElement.appendChild(readMore);
      } else {
        descriptionElement.textContent = fullText;
      }
    document.getElementById("movie-trailer").href = film.trailer || "Trailer non disponibile";
    document.getElementById("movie-poster").src = film.locandina || "../img/imgF/FilmNotFound.jpg";


    caricaRecensioni(film.idf);
} catch (error) {
    console.error("Errore durante il caricamento dei dettagli del film:", error);
}
});

function setRating(value) {
const circle = document.querySelector('.circle');
const ratingText = document.getElementById('rating-text');

const maxOffset = 283; // Full circle length (2 * Math.PI * radius)
const offset = maxOffset - (value / 5) * maxOffset;

// Update circle offset for animation
circle.style.strokeDashoffset = offset;

// Cambio colore circonferenza per voto
if (value < 3) {
  circle.style.stroke = '#f44336'; // Rosso per valutazione bassa
} else if (value < 4) {
  circle.style.stroke = '#ffeb3b'; // Giallo per valutazione media
} else {
  circle.style.stroke = '#4caf50'; // Verde per valutazione alta
}

// Media voto film
let currentValue = 0;
const interval = setInterval(() => {
  if (currentValue >= value) {
    clearInterval(interval);
  }
  else {
    currentValue = Math.min(currentValue + 0.1, 5.0);
    ratingText.textContent = currentValue.toFixed(1);
  }
}, 20);
}

// Funzione per tornare indietro
function goBack() {
window.history.back();
}

async function caricaRecensioni(movieId) {
const recensioniContainer = document.querySelector(".reviews");
recensioniContainer.innerHTML = `<h2>Recensioni:</h2>
<input type="button" class="newreviews-button" onclick="openModal()" value="Scrivi una recensione">`;

try {
  console.log(`Inizio caricamento recensioni per movieId: ${movieId}`);
  const response = await fetch(`/recensioni/${movieId}`); // riga in cui c'è l'errore

  if (!response.ok) {
    throw new Error(`Errore nel caricamento delle recensioni: ${response.status}`);
  }

  const recensioniFilm = await response.json();
  console.log(`Recensioni caricate: `, recensioniFilm);

  if (recensioniFilm.length === 0) {
    recensioniContainer.innerHTML += `<p>Nessuna recensione disponibile per questo film.</p>`;
    return;
  }

  let sommaValutazioni = 0;

  recensioniFilm.forEach(recensione => {
    sommaValutazioni += recensione.valutazione;

    const reviewElement = document.createElement("div");
    reviewElement.classList.add("review");

    let ratingColor;
    if (recensione.valutazione < 3) {
      ratingColor = "#f44336"; // Rosso per valutazione bassa
    } else if (recensione.valutazione < 4) {
      ratingColor = "#ffeb3b"; // Giallo per valutazione media
    } else {
      ratingColor = "#4caf50"; // Verde per valutazione alta
    }

    reviewElement.innerHTML = `
      <div class="review-header">
        <div class="user-img">
          <img src="../img/imgU/user-icon.jpg" alt="img-user" id="user-icon-${recensione.idR}">
        </div>
        <div class="review-info">
          <p class="review-author" id="author-${recensione.idR}"><strong>${recensione.nome_utente}</strong></p>
          <p class="review-date" id="date-${recensione.idR}">${new Date(recensione.data_r).toLocaleDateString()}</p>
        </div>
      </div>
  
      <div class="review-content">
        <strong>${recensione.titolo_r}</strong>
        <p class="review-text" id="text-${recensione.idR}">${recensione.testo}</p>
      </div>
  
      <div class="review-footer">
        <p class="review-rating" style="color: ${ratingColor}" id="rating-${recensione.idR}">Valutazione: ${recensione.valutazione}/5</p>
      </div>
    `;
  
    recensioniContainer.appendChild(reviewElement);
  });

  const mediaValutazioni = sommaValutazioni / recensioniFilm.length;
  setRating(mediaValutazioni);


} catch (error) {
  console.error("Errore:", error);
  recensioniContainer.innerHTML += `<p>Errore nel caricamento delle recensioni. Riprovare più tardi.</p>`;
}
}

function closeModal() {
  document.getElementById('review-modal').style.display = 'none';
}

function openModal() {
  document.getElementById('review-modal').style.display = 'flex';
}

document.addEventListener("DOMContentLoaded", closeModal); 

async function submitReview() { 
  const urlParams = new URLSearchParams(window.location.search);
  const movieId = urlParams.get("ID"); 
  const user = JSON.parse(localStorage.getItem("utente"));

  const titolo_r = document.getElementById("newreview-title").value;
  const testo = document.getElementById("review-text").value;
  const valutazione = document.getElementById("newreview-rating").value;
  
  if (!movieId) {
      console.error("Errore: ID del film non trovato.");
      return;
  }
  const userId = user.userId;
  const reviewData = {
      userId,
      movieId,
      titolo_r,
      testo,
      valutazione: parseInt(valutazione) // Assicura che sia un numero intero
  };

  try {
      const response = await fetch("/recensione", {
          method: "POST",
          headers: {
              "Content-Type": "application/json"
          },
          body: JSON.stringify(reviewData)
      });

      if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Errore ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log("Recensione inviata con successo:", data);
      window.location.reload();
      closeModal();
      return data;
  } catch (error) {
      console.error("Errore durante l'invio della recensione:", error.message);
  }
}

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