// Reviews Tab functionality
document.addEventListener("DOMContentLoaded", () => {
  const addReviewBtn = document.getElementById("addReviewBtn");
  const reviewNameInput = document.getElementById("reviewName");
  const reviewServiceInput = document.getElementById("reviewService");
  const reviewDateInput = document.getElementById("reviewDate");
  const reviewStarsSelect = document.getElementById("reviewStars");
  const reviewDescriptionTextarea =
    document.getElementById("reviewDescription");
  const reviewImageInput = document.getElementById("reviewImage");
  const saveReviewBtn = document.querySelector("#reviews-tab .btn-primary"); // Specific save button for reviews
  const reviewsTableBody = document.getElementById("reviewsTableBody");

  let editingReviewId = null;

  // Show/hide add review form (if applicable, though form is always visible in HTML)
  addReviewBtn.addEventListener("click", () => {
    // Logic to clear form and set for new review
    clearReviewForm();
    editingReviewId = null;
  });

  saveReviewBtn.addEventListener("click", saveReview);

  // Load reviews from Firestore
  async function loadReviews() {
    reviewsTableBody.innerHTML = ""; // Clear existing table rows
    try {
      const snapshot = await db
        .collection("reviews")
        .orderBy("date", "desc")
        .get();
      if (snapshot.empty) {
        reviewsTableBody.innerHTML =
          '<tr><td colspan="5" class="empty-state">No reviews yet.</td></tr>';
        return;
      }
      snapshot.docs.forEach((doc) => {
        renderReviewRow({ id: doc.id, ...doc.data() });
      });
    } catch (error) {
      console.error("Error loading reviews:", error);
      showNotification("Error loading reviews", "error");
      reviewsTableBody.innerHTML =
        '<tr><td colspan="5" class="error-state">Error loading reviews.</td></tr>';
    }
  }

  // Render a single review row
  function renderReviewRow(review) {
    const row = reviewsTableBody.insertRow();
    row.dataset.id = review.id;
    row.innerHTML = `
            <td>${review.name}</td>
            <td>${review.service}</td>
            <td>${"★".repeat(review.stars)}${"☆".repeat(5 - review.stars)}</td>
            <td>${review.date}</td>
            <td>
                <button class="action-btn edit-review" data-id="${
                  review.id
                }"><i class="fas fa-edit"></i></button>
                <button class="action-btn delete-review" data-id="${
                  review.id
                }"><i class="fas fa-trash-alt"></i></button>
            </td>
        `;
  }

  // Save or update a review
  async function saveReview() {
    const reviewData = {
      name: reviewNameInput.value,
      service: reviewServiceInput.value,
      date: reviewDateInput.value,
      stars: parseInt(reviewStarsSelect.value),
      description: reviewDescriptionTextarea.value,
      imageUrl: reviewImageInput.value,
    };

    if (
      !reviewData.name ||
      !reviewData.service ||
      !reviewData.date ||
      !reviewData.description
    ) {
      showNotification("Please fill in all required review fields.", "warning");
      return;
    }

    try {
      if (editingReviewId) {
        await db.collection("reviews").doc(editingReviewId).update(reviewData);
        showNotification("Review updated successfully!", "success");
      } else {
        await db.collection("reviews").add(reviewData);
        showNotification("Review added successfully!", "success");
      }
      clearReviewForm();
      loadReviews(); // Reload list
      loadAllCounts(); // Update dashboard counts
    } catch (error) {
      console.error("Error saving review:", error);
      showNotification("Error saving review", "error");
    }
  }

  // Edit review: Populate form with data
  reviewsTableBody.addEventListener("click", async (e) => {
    if (e.target.closest(".edit-review")) {
      const id = e.target.closest(".edit-review").dataset.id;
      try {
        const doc = await db.collection("reviews").doc(id).get();
        if (doc.exists) {
          const review = doc.data();
          reviewNameInput.value = review.name;
          reviewServiceInput.value = review.service;
          reviewDateInput.value = review.date;
          reviewStarsSelect.value = review.stars;
          reviewDescriptionTextarea.value = review.description;
          reviewImageInput.value = review.imageUrl;
          editingReviewId = id;
          showNotification("Review data loaded for editing.", "info");
        }
      } catch (error) {
        console.error("Error loading review for edit:", error);
        showNotification("Error loading review for edit", "error");
      }
    } else if (e.target.closest(".delete-review")) {
      const id = e.target.closest(".delete-review").dataset.id;
      if (confirm("Are you sure you want to delete this review?")) {
        deleteReview(id);
      }
    }
  });

  // Delete review
  async function deleteReview(id) {
    try {
      await db.collection("reviews").doc(id).delete();
      showNotification("Review deleted successfully!", "success");
      loadReviews(); // Reload list
      loadAllCounts(); // Update dashboard counts
    } catch (error) {
      console.error("Error deleting review:", error);
      showNotification("Error deleting review", "error");
    }
  }

  // Clear review form
  function clearReviewForm() {
    reviewNameInput.value = "";
    reviewServiceInput.value = "";
    reviewDateInput.value = "";
    reviewStarsSelect.value = "5";
    reviewDescriptionTextarea.value = "";
    reviewImageInput.value = "";
    editingReviewId = null;
  }

  // Initial load
  loadReviews();
});
