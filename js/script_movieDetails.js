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
// Estrarre l'ID del film dalla query string
const params = new URLSearchParams(window.location.search);
const movieId = params.get("ID");

if (!movieId) {
    console.error("ID del film non trovato!");
    return;
}

try {
    // Effettua una chiamata API per ottenere i dettagli del film
    const response = await fetch(`/film/${movieId}`);
    if (!response.ok) throw new Error("Errore nella risposta del server");
    const film = await response.json();
    let data = new Date(film.data_uscita).getFullYear();

    // Popolare i dettagli nella pagina
    document.getElementById("movie-title").textContent = film.titolo_f || "Titolo non disponibile";
    document.getElementById("movie-year").textContent = data || "Anno non disponibile";
    document.getElementById("movie-genre").textContent = film.generi ? film.generi.join(", ") : "Genere non disponibile";
    document.getElementById("movie-direction").textContent = film.regista || "Regista non disponibile";
    document.getElementById("movie-cast").textContent = film.castf || "Cast non disponibile";
    document.getElementById("movie-description").textContent = film.trama || "Descrizione non disponibile";
    document.getElementById("movie-trailer").href = film.trailer || "Trailer non disponibile";
    document.getElementById("movie-poster").src = film.locandina || "../img/imgF/FilmNotFound.jpg";
    caricaRecensioni(film.idf);
} catch (error) {
    console.error("Errore durante il caricamento dei dettagli del film:", error);
}
});

function renderRating(rating) {
if (typeof rating === "number") {
  return rating.toFixed(1); // o il numero di decimali che desideri
} else {
  console.error(`Errore: rating non è un numero. Valore ricevuto:`, rating);
  return "N/A"; // Restituisci un valore di fallback
}
}

function setRating(value) {
const circle = document.querySelector('.circle');
const ratingText = document.getElementById('rating-text');

const maxOffset = 283; // Full circle length (2 * Math.PI * radius)
const offset = maxOffset - (value / 5) * maxOffset;

// Update circle offset for animation
circle.style.strokeDashoffset = offset;

// Change circle color based on value
if (value <= 2) {
  circle.style.stroke = '#f44336'; // Red for low ratings
} else if (value <= 4) {
  circle.style.stroke = '#ffeb3b'; // Yellow for medium ratings
} else {
  circle.style.stroke = '#4caf50'; // Green for high ratings
}

// Update text value with animation
let currentValue = 0;
const interval = setInterval(() => {
  if (currentValue >= value) {
    clearInterval(interval);
  } else {
    currentValue += 0.1;
    ratingText.textContent = currentValue.toFixed(1);
  }
}, 50);
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
      ratingColor = "#e74c3c"; // Rosso per valutazione bassa
    } else if (recensione.valutazione < 4) {
      ratingColor = "#f39c12"; // Arancione per valutazione media
    } else {
      ratingColor = "#2ecc71"; // Verde per valutazione alta
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
        <p class="review-text" id="text-${recensione.idR}">${recensione.testo}</p>
      </div>
  
      <div class="review-footer">
        <p class="review-rating" style="color: ${ratingColor}" id="rating-${recensione.idR}">Valutazione: ${recensione.valutazione}/5</p>
        <button class="report-button" id="report-${recensione.idR}" onclick="reportReview(${recensione.idR})">Segnala</button>
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



async function fetchRelatedMovies(movieId) {
  try {
    // Effettua una richiesta all'API per ottenere i film correlati
    const response = await fetch(`/api/related-movies?idF=${movieId}`);
    if (!response.ok) {
      throw new Error("Errore nel recupero dei film correlati");
    }

    // Parsing dei dati JSON restituiti dall'API
    const relatedMovies = await response.json();

    // Ottieni il container dei film correlati
    const relatedContainer = document.getElementById("related-movies");

    // Pulisci il contenitore
    relatedContainer.innerHTML = "";

    // Popola il contenitore con i film correlati
    relatedMovies.forEach(movie => {
      const movieCard = document.createElement("div");
      movieCard.classList.add("movies-carosello");
      movieCard.innerHTML = `
        <div class="movie-card">
          <div class="movie-thumbnail-container">
            <img src="${movie.locandina}" alt="${movie.titolo_f}" class="movie-thumbnail">
          </div>
          <div class="movie-info">
            <h3 class="movie-title">${movie.titolo_f}</h3>
            <p class="movie-duration">${movie.data_uscita} - 1 min</p>
          </div>
        </div>

      `;
      relatedContainer.appendChild(movieCard);
    });
  } catch (error) {
    console.error("Errore:", error);
  }
}



function closeModal() {
  document.getElementById('review-modal').style.display = 'none';
}

function openModal() {
  document.getElementById('review-modal').style.display = 'flex';
}

function submitReview() {
  const reviewText = document.getElementById('review-text').value;
  if (reviewText.trim() !== "") {
      alert("Recensione inviata: " + reviewText);
      closeModal();
  } else {
      alert("Per favore, scrivi una recensione prima di inviare.");
  }
}

document.addEventListener(load, () => {
  closeModal();
});