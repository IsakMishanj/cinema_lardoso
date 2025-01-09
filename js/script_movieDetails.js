

// function renderRating(rating) {
//     const ratingStars = document.getElementById("movie-rating-stars");
//     const ratingValue = document.getElementById("movie-rating-value");

//     const filledStars = Math.floor(rating);
//     const halfStar = rating % 1 !== 0;
//     const emptyStars = 5 - filledStars - (halfStar ? 1 : 0);

//     let stars = "★".repeat(filledStars);
//     if (halfStar) stars += "☆";
//     stars += "☆".repeat(emptyStars);

//     ratingStars.textContent = stars;
//     ratingValue.textContent = `${rating.toFixed(1)}/5`;
// }

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

  document.addEventListener("DOMContentLoaded", () => {
    const params = new URLSearchParams(window.location.search);
    const movieId = params.get("id");

    if (movieId) {
        // Effettua una richiesta per ottenere i dettagli del film
        fetch(`http://localhost:3000/film?id=${movieId}`)
            .then(response => response.json())
            .then(data => {
                console.log(data); // Mostra i dettagli del film
                // Popola la pagina con i dati
            })
            .catch(error => console.error("Errore nel caricamento del film:", error));
    }
});






document.addEventListener("DOMContentLoaded", async () => {
  // Estrarre l'ID del film dalla query string
  const params = new URLSearchParams(window.location.search);
  const movieId = params.get("ID");
  // const dataUscita = film.dataUscita;
  // const anno = dataUscita ? new Date(dataUscita).getUTCFullYear() : "Anno non disponibile";


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
      document.getElementById("movie-year").textContent = film.dataUscita || "Anno non disponibile";
      document.getElementById("movie-genre").textContent = film.generi ? film.generi.join(", ") : "Genere non disponibile";
      document.getElementById("movie-direction").textContent = film.regista || "Regista non disponibile";
      document.getElementById("movie-cast").textContent = film.castf || "Cast non disponibile";
      document.getElementById("movie-description").textContent = film.trama || "Descrizione non disponibile";
      document.getElementById("movie-poster").src = film.locandina || "../img/default-poster.jpg";

      const rating = film.media_valutazioni;
      if (rating) {
          renderRating(rating); // Passare la media alla funzione renderRating
      } else {
          document.getElementById("movie-rating-value").textContent = "N/D";
      }
  } catch (error) {
      console.error("Errore durante il caricamento dei dettagli del film:", error);
  }
});

function renderRating(rating) {
  const ratingStars = document.getElementById("movie-rating-stars");
  const ratingValue = document.getElementById("movie-rating-value");

  const filledStars = Math.floor(rating);
  const halfStar = rating % 1 !== 0;
  const emptyStars = 5 - filledStars - (halfStar ? 1 : 0);

  let stars = "★".repeat(filledStars);
  if (halfStar) stars += "☆";
  stars += "☆".repeat(emptyStars);

  ratingStars.textContent = stars;
  ratingValue.textContent = `${rating.toFixed(1)}/5`;
}

// Funzione per tornare indietro
function goBack() {
  window.history.back();
}


// async function caricaRecensioni(movieId) {
//   const recensioniContainer = document.querySelector(".reviews");
//   recensioniContainer.innerHTML = `<h2>Recensioni:</h2>`;
  
//   try {
//     const response = await fetch(`/recensioni/${movieId}`); 
//     if (!response.ok) throw new Error("Errore nel caricamento delle recensioni");
    
//     const recensioniFilm = await response.json();
    
//     if (recensioniFilm.length === 0) {
//       recensioniContainer.innerHTML += `<p>Nessuna recensione disponibile per questo film.</p>`;
//       return;
//     }

//     recensioniFilm.forEach(recensione => {
//       const reviewElement = document.createElement("div");
//       reviewElement.classList.add("review");

//       reviewElement.innerHTML = `
//         <div class="user-img">
//           <img src="../img/imgU/user-icon.jpg" alt="img-user">
//         </div>
//         <div class="user-review">
//           <p><strong>${recensione.utente}</strong></p>
//           <p>${recensione.testo}</p>
//           <p>Valutazione: ${recensione.valutazione}/5</p>
//           <p>Data: ${new Date(recensione.data_r).toLocaleDateString()}</p>
//         </div>
//       `;

//       recensioniContainer.appendChild(reviewElement);
//     });

//     recensioniContainer.innerHTML += `
//       <button class="all-reviews" onclick="mostraTutteRecensioni('${movieId}')">TUTTE LE RECENSIONI</button>
//     `;

//   } catch (error) {
//     console.error("Errore:", error);
//     recensioniContainer.innerHTML += `<p>Errore nel caricamento delle recensioni.</p>`;
//   }
// }

async function caricaRecensioni(movieId) {
  const recensioniContainer = document.querySelector(".reviews");
  recensioniContainer.innerHTML = `<h2>Recensioni:</h2>`;
  
  try {
    console.log(`Inizio caricamento recensioni per movieId: ${movieId}`);
    const response = await fetch(`/recensioni/${movieId}`); // Modifica l'endpoint in base alla tua API
    console.log(`Risposta ricevuta: `, response);

    if (!response.ok) {
      throw new Error(`Errore nel caricamento delle recensioni: ${response.status}`);
    }
    
    const recensioniFilm = await response.json();
    console.log(`Recensioni caricate: `, recensioniFilm);

    if (recensioniFilm.length === 0) {
      recensioniContainer.innerHTML += `<p>Nessuna recensione disponibile per questo film.</p>`;
      return;
    }

    recensioniFilm.forEach(recensione => {
      const reviewElement = document.createElement("div");
      reviewElement.classList.add("review");

      reviewElement.innerHTML = `
        <div class="user-img">
          <img src="../img/imgU/user-icon.jpg" alt="img-user">
        </div>
        <div class="user-review">
          <p><strong>${recensione.utente}</strong></p>
          <p>${recensione.testo}</p>
          <p>Valutazione: ${recensione.valutazione}/5</p>
          <p>Data: ${new Date(recensione.data_r).toLocaleDateString()}</p>
        </div>
      `;

      recensioniContainer.appendChild(reviewElement);
    });

    recensioniContainer.innerHTML += `
      <button class="all-reviews" onclick="mostraTutteRecensioni('${movieId}')">TUTTE LE RECENSIONI</button>
    `;

  } catch (error) {
    console.error("Errore:", error);
    recensioniContainer.innerHTML += `<p>Errore nel caricamento delle recensioni.</p>`;
  }
}

