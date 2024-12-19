document.addEventListener("DOMContentLoaded", function() {
    const loginForm = document.querySelector('form'); // Seleziona il form
    loginForm.addEventListener('submit', function(event) {
        event.preventDefault();  // Previene il comportamento predefinito del form (invio)

        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        // Verifica che i campi non siano vuoti
        if (!username || !password) {
            alert('Per favore, inserisci username e password.');
            return;
        }

        // Puoi aggiungere qui la logica di autenticazione (es. verifica tramite API o database)

        // Esempio di autenticazione semplice (dati hardcoded per esempio)
        const validUser = {
            username: 'user1',
            password: 'password123'
        };

        if (username === validUser.username && password === validUser.password) {
            window.location.href = "dashboard.html";  // Reindirizza all'area protetta
        } else {
            alert('Username o password non corretti');
        }
    });
});

document.querySelector('.back-button').addEventListener('click', () => {
    window.history.back();
  });
