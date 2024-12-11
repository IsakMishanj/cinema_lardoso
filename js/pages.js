function openReviewPage(movieId) {
    // Redirige alla pagina del film
    window.location.href = `movie.html?id=${movieId}`;
}



document.getElementById("search-button").addEventListener("click", function() {
    const query = document.getElementById("search-input").value.toLowerCase();
    alert(`Searching for: ${query}`);
    // Implementa la logica di ricerca qui
});