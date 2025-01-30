fetch('/api/most-commented-movies')
  .then(res => res.json())
  .then(data => {
    const table = document.getElementById('mostCommentedMoviesTable');
    data.forEach((movie, index) => {
      const row = document.createElement('tr');
      let positionClass = '';

      // Assegna la classe in base alla posizione
      if (index === 0) {
        positionClass = 'gold'; // Oro per il primo posto
      } else if (index === 1) {
        positionClass = 'silver'; // Argento per il secondo posto
      } else if (index === 2) {
        positionClass = 'bronze'; // Bronzo per il terzo posto
      }

      row.innerHTML = `
        <td>${index + 1}</td>
        <td><img src="${movie.locandina}" alt="${movie.titolo_f}" class="movie-image"></td>
        <td class="${positionClass}">${movie.titolo_f}</td>
        <td>${movie.numero_commenti}</td>
      `;
      table.appendChild(row);
    });
  })
  .catch(err => console.error('Errore nel caricamento:', err));


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
  