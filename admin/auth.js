// Firebase configuration (replace with your actual config)
const firebaseConfig = {
  apiKey: "AIzaSyBaWzgDT01temNKWI4L8yGIVZxQ4jDHYrc",
  authDomain: "my-project-datas-ef021.firebaseapp.com",
  projectId: "my-project-datas-ef021",
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage(); // Initialize Firebase Storage

// Google Login
function loginWithGoogle() {
  const provider = new firebase.auth.GoogleAuthProvider();
  auth
    .signInWithPopup(provider)
    .then((result) => {
      // User signed in
      const user = result.user;
      console.log("Logged in user:", user.displayName);
      showNotification(`Welcome, ${user.displayName}!`, "success");
      updateUIForLoggedInUser(user);
    })
    .catch((error) => {
      console.error("Google login error:", error);
      showNotification(`Login failed: ${error.message}`, "error");
    });
}

// Logout
function logout() {
  auth
    .signOut()
    .then(() => {
      console.log("User signed out.");
      showNotification("Logged out successfully.", "info");
      updateUIForLoggedOutUser();
    })
    .catch((error) => {
      console.error("Logout error:", error);
      showNotification(`Logout failed: ${error.message}`, "error");
    });
}

// Update UI based on auth state
function updateUIForLoggedInUser(user) {
  toggleWebpageVisibility(true);
  document.getElementById("userName").textContent =
    user.displayName || "Admin User";
  document.getElementById("userAvatar").textContent = user.displayName
    ? user.displayName.charAt(0).toUpperCase()
    : "AU";
  document.getElementById("logoutBtn").style.display = "block"; // Show logout on login page
  document.getElementById("sidebarLogoutBtn").style.display = "flex"; // Show logout in sidebar
}

function updateUIForLoggedOutUser() {
  toggleWebpageVisibility(false);
  document.getElementById("userName").textContent = "Guest";
  document.getElementById("userAvatar").textContent = "G";
  document.getElementById("logoutBtn").style.display = "none";
  document.getElementById("sidebarLogoutBtn").style.display = "none";
}

// Check auth state on load
auth.onAuthStateChanged((user) => {
  if (user) {
    updateUIForLoggedInUser(user);
    loadAllCounts(); // Load dashboard counts on login
  } else {
    updateUIForLoggedOutUser();
  }
});
