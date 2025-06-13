// Function to load counts for Dashboard
async function loadAllCounts() {
  try {
    const reviewCountRef = db.collection("reviews");
    const productCountRef = db.collection("products");
    const socialCountRef = db.collection("social-links");
    const imageCountRef = db.collection("images");

    const [reviewsSnapshot, productsSnapshot, socialSnapshot, imagesSnapshot] =
      await Promise.all([
        reviewCountRef.get(),
        productCountRef.get(),
        socialCountRef.get(),
        imageCountRef.get(),
      ]);

    document.getElementById("reviewCount").textContent = reviewsSnapshot.size;
    document.getElementById("productCount").textContent = productsSnapshot.size;
    document.getElementById("socialCount").textContent = socialSnapshot.size;
    document.getElementById("imageCount").textContent = imagesSnapshot.size;

    // Load recent reviews for dashboard
    loadRecentReviews(reviewsSnapshot.docs);
  } catch (error) {
    console.error("Error loading counts:", error);
    showNotification("Error loading dashboard data", "error");
  }
}

function loadRecentReviews(reviewDocs) {
  const recentReviewsContainer = document.getElementById("recentReviews");
  recentReviewsContainer.innerHTML = ""; // Clear previous reviews

  if (reviewDocs.length === 0) {
    recentReviewsContainer.innerHTML =
      '<p class="empty-state"><i class="fas fa-box-open"></i><br>No recent reviews.</p>';
    return;
  }

  // Sort reviews by date descending and take top 5
  const sortedReviews = reviewDocs
    .map((doc) => ({ id: doc.id, ...doc.data() }))
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  sortedReviews.forEach((review) => {
    const reviewElement = document.createElement("div");
    reviewElement.classList.add("review-card");
    reviewElement.innerHTML = `
            <div class="review-header">
                <div class="review-avatar">
                    ${
                      review.imageUrl
                        ? `<img src="${review.imageUrl}" alt="${review.name}" />`
                        : review.name.charAt(0).toUpperCase()
                    }
                </div>
                <div class="review-info">
                    <div class="review-name">${review.name}</div>
                    <div class="review-meta">
                        <span>${review.service}</span>
                        <div class="stars">${"★".repeat(
                          review.stars
                        )}${"☆".repeat(5 - review.stars)}</div>
                        <span>${review.date}</span>
                    </div>
                </div>
            </div>
            <p>${review.description}</p>
        `;
    recentReviewsContainer.appendChild(reviewElement);
  });
}
