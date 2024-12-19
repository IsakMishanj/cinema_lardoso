

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
document.getElementById('movie-rating-value').addEventListener("load", renderRating);

function renderRating() {
    const starsFilled = document.getElementById("stars-filled");
    const ratingValue = document.getElementById("movie-rating-value");

    const percentage = (rating / 5) * 100;
    starsFilled.style.width = `${percentage}%`;
    ratingValue.textContent = `${rating.toFixed(1)}/5`;
}

document.querySelector('.back-button').addEventListener('click', () => {
    window.history.back();
  });