fetch('/api/most-commented-movies')
  .then(res => res.json())
  .then(data => {
    const table = document.getElementById('mostCommentedMoviesTable');
    table.innerHTML = ''; // Svuota la tabella prima di aggiungere nuovi dati

    data.forEach((movie, index) => {
      const row = document.createElement('tr');
      let positionClass = '';

      if (index === 0) positionClass = 'gold'; // Oro per il primo posto
      else if (index === 1) positionClass = 'silver'; // Argento per il secondo posto
      else if (index === 2) positionClass = 'bronze'; // Bronzo per il terzo posto

      row.innerHTML = `
        <td>${index + 1}</td>
        <td><img src="${movie.locandina}" alt="${movie.titolo_f}" class="movie-image"></td>
        <td class="${positionClass}">${movie.titolo_f}</td>
        <td>${movie.numero_commenti}</td>
        <td>${parseFloat(movie.media_valutazione).toFixed(1)}/5</td>
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