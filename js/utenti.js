document.addEventListener("DOMContentLoaded", async () => {
    const leaderboardBody = document.getElementById("leaderboard-body");
  
    try {
      // Effettua una richiesta alla tua API per ottenere i dati
      const response = await fetch("/api/top-users");
  
      if (!response.ok) {
        console.error("Errore nella richiesta API:", response.status);
        throw new Error("Errore nel recupero della classifica.");
      }
  
      const users = await response.json();
  
      // Controlla che i dati siano validi
      if (!Array.isArray(users)) {
        console.error("La risposta dell'API non è un array:", users);
        throw new Error("Formato dati non valido.");
      }
  
      users.forEach((user, index) => {
        const row = document.createElement("tr");
  
        // Imposta la classe per i primi tre posti
        let positionClass = "";
        if (index === 0) positionClass = "gold";
        if (index === 1) positionClass = "silver";
        if (index === 2) positionClass = "bronze";
  
        // Aggiungi la classe alla riga
        if (positionClass) {
          row.classList.add(positionClass);
        }
  
        // Popola la riga con i dati utente
        row.innerHTML = `
          <td>${index + 1}</td>
          <td>${user.nome_utente}</td>
          <td>${user.numero_commenti}</td>
        `;
  
        leaderboardBody.appendChild(row);
      });
    } catch (error) {
      console.error("Errore nel caricamento della classifica:", error);
  
      // Mostra un messaggio di errore nella tabella
      leaderboardBody.innerHTML = `
        <tr>
          <td colspan="3" style="color: red; text-align: center;">Errore nel caricamento della classifica</td>
        </tr>
      `;
    }
  });
  

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
  