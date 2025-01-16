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

    // Popolare i dettagli nella pagina
    document.getElementById("movie-title").textContent = film.titolo_f || "Titolo non disponibile";
    document.getElementById("movie-year").textContent = new Date(film.dataUscita).toLocaleDateString() || "Anno non disponibile";
    document.getElementById("movie-genre").textContent = film.generi ? film.generi.join(", ") : "Genere non disponibile";
    document.getElementById("movie-direction").textContent = film.regista || "Regista non disponibile";
    document.getElementById("movie-cast").textContent = film.castf || "Cast non disponibile";
    document.getElementById("movie-description").textContent = film.trama || "Descrizione non disponibile";
    document.getElementById("movie-trailer").textContent = film.trailer || "Trailer non disponibile";
    document.getElementById("movie-poster").src = film.locandina || "../img/default-poster.jpg";
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
recensioniContainer.innerHTML = `<h2>Recensioni:</h2>`;

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

  recensioniContainer.innerHTML += `
    <button class="all-reviews" onclick="mostraTutteRecensioni('${movieId}')">TUTTE LE RECENSIONI</button>
  `;

} catch (error) {
  console.error("Errore:", error);
  recensioniContainer.innerHTML += `<p>Errore nel caricamento delle recensioni. Riprovare più tardi.</p>`;
}
}