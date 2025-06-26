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

  let currentSocialLinks = {};

  function showSocialForm(linkData = null) {
    socialFormContainer.style.display = "block";
    if (linkData) {
      socialPlatformName.value = linkData.platform || "";
      socialProfileUrl.value = linkData.url || "";
      socialIconUrl.value = linkData.iconUrl || "";
      socialCssClass.value = linkData.cssClass || "";
      socialEditId.value = linkData.id || "";
    } else {
      clearSocialForm();
    }
  }

  function hideSocialForm() {
    socialFormContainer.style.display = "none";
    clearSocialForm();
  }

  function clearSocialForm() {
    socialPlatformName.value = "";
    socialProfileUrl.value = "";
    socialIconUrl.value = "";
    socialCssClass.value = "";
    socialEditId.value = "";
  }

  async function loadSocialMedia() {
    socialLinksContainer.innerHTML = "";
    currentSocialLinks = {};
    try {
      const socialDocRef = db.collection("settings").doc("social");
      const doc = await socialDocRef.get();
      if (!doc.exists || !doc.data() || Object.keys(doc.data()).length === 0) {
        socialLinksContainer.innerHTML = `
          <p class="empty-state"><i class="fas fa-frown"></i><br>No social links added yet.</p>`;
        return;
      }

      const links = doc.data();
      Object.entries(links).forEach(([id, linkData]) => {
        const link = { id, ...linkData };
        currentSocialLinks[id] = link;
        renderSocialLink(link);
      });
    } catch (error) {
      console.error("Error loading social links:", error);
      showNotification("Error loading social links", "error");
      socialLinksContainer.innerHTML = `
        <p class="error-state"><i class="fas fa-exclamation-triangle"></i><br>Error loading social links.</p>`;
    }
  }

  function renderSocialLink(link) {
    const linkElement = document.createElement("div");
    linkElement.classList.add("col-md-4", "col-sm-6", "mb-4");
    linkElement.innerHTML = `
      <div class="card social-link">
        <div class="card-body d-flex align-items-center">
          ${
            link.iconUrl
              ? `<img src="${link.iconUrl}" alt="${link.platform}" class="social-icon" width="24" height="24">`
              : `<i class="fab fa-${link.platform.toLowerCase()} fa-lg social-icon"></i>`
          }
          <h5 class="card-title mb-0 flex-grow-1">${link.platform}</h5>
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
            link.url
          }" target="_blank" class="small text-truncate d-block">${link.url}</a>
        </div>
      </div>
    `;
    socialLinksContainer.appendChild(linkElement);
  }

  async function saveSocialLink() {
    const platform = socialPlatformName.value.trim();
    const url = socialProfileUrl.value.trim();
    const iconUrl = socialIconUrl.value.trim();
    const cssClass = socialCssClass.value.trim();
    const id = socialEditId.value || generateId();

    if (!platform || !url) {
      showNotification(
        "Please fill in platform name and profile URL.",
        "warning"
      );
      return;
    }

    const linkData = {
      platform,
      url,
      iconUrl,
      cssClass,
    };

    try {
      const socialDocRef = db.collection("settings").doc("social");
      await socialDocRef.set({ [id]: linkData }, { merge: true });
      showNotification(
        socialEditId.value
          ? "Social link updated successfully!"
          : "Social link added successfully!",
        "success"
      );
      hideSocialForm();
      loadSocialMedia();
      loadAllCounts?.();
    } catch (error) {
      console.error("Error saving social link:", error);
      showNotification("Error saving social link", "error");
    }
  }

  async function deleteSocialLink(id) {
    if (!confirm("Are you sure you want to delete this social link?")) return;
    try {
      await db
        .collection("settings")
        .doc("social")
        .update({
          [id]: firebase.firestore.FieldValue.delete(),
        });
      showNotification("Social link deleted successfully!", "success");
      loadSocialMedia();
      loadAllCounts?.();
    } catch (error) {
      console.error("Error deleting social link:", error);
      showNotification("Error deleting social link", "error");
    }
  }

  function generateId() {
    return "link-" + Math.random().toString(36).substr(2, 9);
  }

  addSocialBtn.addEventListener("click", () => showSocialForm());
  saveSocialBtn.addEventListener("click", saveSocialLink);
  cancelSocialBtn.addEventListener("click", hideSocialForm);

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

  loadSocialMedia();
});
