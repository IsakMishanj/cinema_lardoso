document.addEventListener("DOMContentLoaded", function() {
    const forgotPasswordForm = document.getElementById('forgot-password-form');
    forgotPasswordForm.addEventListener('submit', function(event) {
        event.preventDefault();  // Previene l'invio del form per fare la validazione

        const email = document.getElementById('email').value;

        // Verifica che l'email non sia vuota
        if (!email) {
            alert('Per favore, inserisci un indirizzo email.');
            return;
        }

        // Verifica che l'email sia valida con una regex
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(email)) {
            alert('Per favore, inserisci un\'email valida.');
            return;
        }

        // Simula l'invio dell'email per il recupero password
        alert(`Istruzioni per il recupero della password sono state inviate a ${email}.`);

        // Puoi redirigere l'utente a una pagina di conferma o login
        window.location.href = "login.html";  // Redirige l'utente alla pagina di login
    });
});
