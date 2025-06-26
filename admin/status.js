// Status Tab functionality
document.addEventListener("DOMContentLoaded", () => {
  const avatarInput = document.getElementById("avatarInput");
  const statusInput = document.getElementById("statusInput");
  const descriptionInput = document.getElementById("descriptionInput");
  const ageInput = document.getElementById("ageInput");
  const hobbiesInput = document.getElementById("hobbiesInput");
  const studyingInput = document.getElementById("studyingInput");
  const locatedInput = document.getElementById("locatedInput");

  // Function to save profile data
  async function saveProfile() {
    const profileData = {
      avatar: avatarInput.value,
      status: statusInput.value,
      description: descriptionInput.value,
      age: parseInt(ageInput.value) || null,
      hobbies: hobbiesInput.value,
      studying: studyingInput.value,
      located: locatedInput.value,
    };

    try {
      // Assuming a single document for user profile
      await db
        .collection("settings")
        .doc("profile")
        .set(profileData, { merge: true });
      showNotification("Profile updated successfully!", "success");
    } catch (error) {
      console.error("Error saving profile:", error);
      showNotification("Error saving profile", "error");
    }
  }

  // Function to load profile data
  async function loadProfile() {
    try {
      const doc = await db.collection("settings").doc("profile").get();
      if (doc.exists) {
        const profile = doc.data();
        avatarInput.value = profile.avatar || "";
        statusInput.value = profile.status || "";
        descriptionInput.value = profile.description || "";
        ageInput.value = profile.age || "";
        hobbiesInput.value = profile.hobbies || "";
        studyingInput.value = profile.studying || "";
        locatedInput.value = profile.located || "";
      } else {
        console.log("No profile data found.");
      }
    } catch (error) {
      console.error("Error loading profile:", error);
      showNotification("Error loading profile data", "error");
    }
  }

  // Attach saveProfile to button (already done in HTML with onclick)
  document
    .querySelector("#status-tab .btn-primary")
    .addEventListener("click", saveProfile);

  // Initial load of profile data when the tab is likely to be active or page loads
  loadProfile();
});
