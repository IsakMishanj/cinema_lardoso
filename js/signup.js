document.addEventListener("DOMContentLoaded", function() {
    const signupForm = document.querySelector('form'); // Seleziona il form
    signupForm.addEventListener('submit', function(event) {
        event.preventDefault();  // Previene l'invio predefinito del form

        const username = document.getElementById('username').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirm-password').value;

        // Verifica che i campi non siano vuoti
        if (!username || !email || !password || !confirmPassword) {
            alert('Tutti i campi sono obbligatori.');
            return;
        }

        // Verifica che le password corrispondano
        if (password !== confirmPassword) {
            alert('Le password non corrispondono. Per favore, riprova.');
            return;
        }

        // Esempio di validazione dell'email (con una regex semplice)
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(email)) {
            alert('Per favore, inserisci una email valida.');
            return;
        }

        // Puoi aggiungere qui la logica per salvare i dati nel backend (API o database)
        alert('Registrazione completata con successo!');

        // Puoi redirigere a una pagina di conferma o login
        window.location.href = "login.html";  // Reindirizza alla pagina di login
    });
});
