// Social Media Tab functionality
document.addEventListener("DOMContentLoaded", () => {
  const addSocialBtn = document.getElementById("addSocialBtn");
  const saveSocialBtn = document.getElementById("saveSocialBtn");
  const cancelSocialBtn = document.getElementById("cancelSocialBtn");
  const socialFormContainer = document.getElementById("socialFormContainer");
  const socialPlatformName = document.getElementById("socialPlatformName");
  const socialProfileUrl = document.getElementById("socialProfileUrl");
  const socialIconUrl = document.getElementById("socialIconUrl");
  const socialCssClass = document.getElementById("socialCssClass");
  const socialEditId = document.getElementById("socialEditId");
  const socialLinksContainer = document.getElementById("socialLinksContainer");

  let currentSocialLinks = {}; // To store links for quick access

  // Show the social media form
  function showSocialForm(linkData = null) {
    socialFormContainer.style.display = "block";
    if (linkData) {
      socialPlatformName.value = linkData.platformName || "";
      socialProfileUrl.value = linkData.profileUrl || "";
      socialIconUrl.value = linkData.iconUrl || "";
      socialCssClass.value = linkData.cssClass || "";
      socialEditId.value = linkData.id || "";
    } else {
      clearSocialForm();
    }
  }

  // Hide the social media form
  function hideSocialForm() {
    socialFormContainer.style.display = "none";
    clearSocialForm();
  }

  // Clear the social media form
  function clearSocialForm() {
    socialPlatformName.value = "";
    socialProfileUrl.value = "";
    socialIconUrl.value = "";
    socialCssClass.value = "";
    socialEditId.value = "";
  }

  // Load social media links from Firestore
  async function loadSocialMedia() {
    socialLinksContainer.innerHTML = ""; // Clear existing links
    currentSocialLinks = {}; // Reset cache
    try {
      const snapshot = await db.collection("social-links").get();
      if (snapshot.empty) {
        socialLinksContainer.innerHTML =
          '<p class="empty-state"><i class="fas fa-frown"></i><br>No social links added yet.</p>';
        return;
      }
      snapshot.docs.forEach((doc) => {
        const link = { id: doc.id, ...doc.data() };
        currentSocialLinks[link.id] = link; // Cache the link
        renderSocialLink(link);
      });
    } catch (error) {
      console.error("Error loading social links:", error);
      showNotification("Error loading social links", "error");
      socialLinksContainer.innerHTML =
        '<p class="error-state"><i class="fas fa-exclamation-triangle"></i><br>Error loading social links.</p>';
    }
  }

  // Render a single social link
  function renderSocialLink(link) {
    const linkElement = document.createElement("div");
    linkElement.classList.add("col-md-4", "col-sm-6", "mb-4"); // Bootstrap-like grid classes
    linkElement.innerHTML = `
            <div class="card social-link">
                <div class="card-body d-flex align-items-center">
                    ${
                      link.iconUrl
                        ? `<img src="${link.iconUrl}" alt="${link.platformName}" class="social-icon" width="24" height="24">`
                        : `<i class="fab fa-${link.platformName.toLowerCase()} fa-lg social-icon"></i>`
                    }
                    <h5 class="card-title mb-0 flex-grow-1">${
                      link.platformName
                    }</h5>
                    <div class="dropdown">
                        <button class="btn btn-sm btn-icon" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                            <i class="fas fa-ellipsis-v"></i>
                        </button>
                        <ul class="dropdown-menu">
                            <li><a class="dropdown-item edit-social" href="#" data-id="${
                              link.id
                            }">Edit</a></li>
                            <li><a class="dropdown-item delete-social" href="#" data-id="${
                              link.id
                            }">Delete</a></li>
                        </ul>
                    </div>
                </div>
                <div class="card-footer text-muted">
                    <a href="${
                      link.profileUrl
                    }" target="_blank" class="small text-truncate d-block">${
      link.profileUrl
    }</a>
                </div>
            </div>
        `;
    socialLinksContainer.appendChild(linkElement);
  }

  // Save or update social link
  async function saveSocialLink() {
    const linkData = {
      platformName: socialPlatformName.value,
      profileUrl: socialProfileUrl.value,
      iconUrl: socialIconUrl.value,
      cssClass: socialCssClass.value,
    };

    if (!linkData.platformName || !linkData.profileUrl) {
      showNotification(
        "Please fill in platform name and profile URL.",
        "warning"
      );
      return;
    }

    try {
      if (socialEditId.value) {
        // Update existing
        await db
          .collection("social-links")
          .doc(socialEditId.value)
          .update(linkData);
        showNotification("Social link updated successfully!", "success");
      } else {
        // Add new
        await db.collection("social-links").add(linkData);
        showNotification("Social link added successfully!", "success");
      }
      hideSocialForm();
      loadSocialMedia(); // Reload list
      loadAllCounts(); // Update dashboard counts
    } catch (error) {
      console.error("Error saving social link:", error);
      showNotification("Error saving social link", "error");
    }
  }

  // Delete social link
  async function deleteSocialLink(id) {
    if (!confirm("Are you sure you want to delete this social link?")) {
      return;
    }
    try {
      await db.collection("social-links").doc(id).delete();
      showNotification("Social link deleted successfully!", "success");
      loadSocialMedia(); // Reload list
      loadAllCounts(); // Update dashboard counts
    } catch (error) {
      console.error("Error deleting social link:", error);
      showNotification("Error deleting social link", "error");
    }
  }

  // Generate a simple ID for new links
  function generateId() {
    return "link-" + Math.random().toString(36).substr(2, 9);
  }

  // Event listeners
  addSocialBtn.addEventListener("click", () => showSocialForm());
  saveSocialBtn.addEventListener("click", saveSocialLink);
  cancelSocialBtn.addEventListener("click", hideSocialForm);

  // Delegated event listeners for edit/delete buttons
  socialLinksContainer.addEventListener("click", (e) => {
    if (e.target.closest(".edit-social")) {
      const id = e.target.closest(".edit-social").dataset.id;
      const linkData = { ...currentSocialLinks[id], id };
      showSocialForm(linkData);
    }

    if (e.target.closest(".delete-social")) {
      const id = e.target.closest(".delete-social").dataset.id;
      deleteSocialLink(id);
    }
  });

  // Initialize
  document.addEventListener("DOMContentLoaded", loadSocialMedia);
});
