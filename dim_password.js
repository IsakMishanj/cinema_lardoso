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

        // Invia una richiesta al server per inviare l'email di recupero
        fetch('http://localhost:3000/send-recovery-email', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email: email })
        })
        .then(response => response.json())
        .then(data => {
            alert(data.message || 'Le istruzioni sono state inviate!');
            window.location.href = "login.html";  // Redirige alla pagina di login
        })
        .catch(error => {
            console.error('Errore:', error);
            alert('Si è verificato un errore. Riprova.');
        });
    });
});
