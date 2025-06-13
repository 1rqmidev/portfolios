document.addEventListener("DOMContentLoaded", () => {
  // Initialize elements
  const imagePortfolioSelect = document.getElementById("imagePortfolio");
  const newPortfolioGroup = document.getElementById("newPortfolioGroup");
  const newPortfolioNameInput = document.getElementById("newPortfolioName");
  const imageTitleInput = document.getElementById("imageTitle");
  const imageUrlInput = document.getElementById("imageUrl");
  const imageCategorySelect = document.getElementById("imageCategory");
  const imageDescriptionInput = document.getElementById("imageDescription");
  const saveImageBtn = document.getElementById("saveImageBtn");
  const editImageBtn = document.getElementById("editImageBtn");
  const cancelEditBtn = document.getElementById("cancelEditBtn");
  const loadImageDataBtn = document.getElementById("loadImageDataBtn");
  const imageGrid = document.getElementById("imageGrid");
  const totalPortfoliosSpan = document.getElementById("totalPortfolios");
  const totalImagesSpan = document.getElementById("totalImages");
  const portfolioFilterSelect = document.getElementById("portfolioFilter");
  const categoryFilterSelect = document.getElementById("categoryFilter");
  const createPortfolioBtn = document.getElementById("createPortfolioBtn");
  const deletePortfolioBtn = document.getElementById("deletePortfolioBtn");
  const deleteSelectedBtn = document.getElementById("deleteSelectedBtn");
  const addCategoryBtn = document.getElementById("addCategoryBtn");
  const editCategorySelect = document.getElementById("editCategorySelect");
  const deleteCategoryBtn = document.getElementById("deleteCategoryBtn");

  // Modal elements
  const createPortfolioModal = new bootstrap.Modal(
    document.getElementById("createPortfolioModal")
  );
  const confirmCreatePortfolioBtn = document.getElementById(
    "confirmCreatePortfolio"
  );
  const portfolioNameInput = document.getElementById("portfolioName");
  const portfolioDescriptionInput = document.getElementById(
    "portfolioDescription"
  );

  let editingImageId = null;
  let currentImages = [];
  let selectedImages = new Set();

  // Initialize the image library
  initImageLibrary();

  // Initialize function
  async function initImageLibrary() {
    await loadPortfolios();
    await loadImageCategories();
    await loadImages();
    setupEventListeners();
  }

  // Set up event listeners
  function setupEventListeners() {
    // Portfolio selection change
    imagePortfolioSelect.addEventListener(
      "change",
      handlePortfolioSelectChange
    );

    // Save/Update image
    saveImageBtn.addEventListener("click", saveImage);
    editImageBtn.addEventListener("click", saveImage);

    // Cancel edit
    cancelEditBtn.addEventListener("click", cancelEdit);

    // Filter changes
    portfolioFilterSelect.addEventListener("change", () =>
      loadImages(portfolioFilterSelect.value)
    );
    categoryFilterSelect.addEventListener("change", applyCategoryFilter);

    // Portfolio actions
    createPortfolioBtn.addEventListener("click", () =>
      createPortfolioModal.show()
    );
    confirmCreatePortfolioBtn.addEventListener("click", createPortfolio);
    deletePortfolioBtn.addEventListener("click", deleteCurrentPortfolio);

    // Category actions
    addCategoryBtn.addEventListener("click", addCategory);
    deleteCategoryBtn.addEventListener("click", deleteSelectedCategory);

    // Bulk actions
    deleteSelectedBtn.addEventListener("click", deleteSelectedImages);

    // Image grid interactions
    imageGrid.addEventListener("click", handleImageGridClick);

    // Load image data for reuse
    loadImageDataBtn.addEventListener("click", loadSelectedImageData);
  }

  // Handle portfolio select change
  function handlePortfolioSelectChange() {
    if (imagePortfolioSelect.value === "new") {
      newPortfolioGroup.style.display = "block";
    } else {
      newPortfolioGroup.style.display = "none";
    }
  }

  async function loadSelectedImageData() {
    if (selectedImages.size === 0) {
      showNotification("Please select an image first", "warning");
      return;
    }

    if (selectedImages.size > 1) {
      showNotification("Please select only one image to load", "warning");
      return;
    }

    const imageId = Array.from(selectedImages)[0];
    await loadImageDataForReuse(imageId);
  }

  // Load portfolios for select dropdowns
  async function loadPortfolios() {
    imagePortfolioSelect.innerHTML =
      '<option value="">Select portfolio...</option>';
    portfolioFilterSelect.innerHTML =
      '<option value="all">All Portfolios</option>';

    try {
      const snapshot = await db.collection("portfolios").get();
      totalPortfoliosSpan.textContent = snapshot.size;

      if (snapshot.empty) {
        imagePortfolioSelect.innerHTML +=
          '<option value="">No portfolios found</option>';
        return;
      }

      const portfolioNames = [];
      snapshot.docs.forEach((doc) => {
        portfolioNames.push(doc.id);
      });

      // Sort alphabetically
      portfolioNames.sort();

      portfolioNames.forEach((portfolioName) => {
        const option = document.createElement("option");
        option.value = portfolioName;
        option.textContent = portfolioName;
        imagePortfolioSelect.appendChild(option);

        const filterOption = document.createElement("option");
        filterOption.value = portfolioName;
        filterOption.textContent = portfolioName;
        portfolioFilterSelect.appendChild(filterOption);
      });

      imagePortfolioSelect.innerHTML +=
        '<option value="new">Create New Portfolio</option>';
    } catch (error) {
      console.error("Error loading portfolios:", error);
      showNotification("Error loading portfolios", "error");
    }
  }

  async function loadImageCategories() {
    try {
      // Clear existing options but keep the default
      imageCategorySelect.innerHTML =
        '<option value="">Select category...</option>';
      categoryFilterSelect.innerHTML =
        '<option value="all">All Categories</option><option value="uncategorized">Uncategorized</option>';
      editCategorySelect.innerHTML =
        '<option value="">Select category...</option>';

      // Get categories from dedicated collection
      const categoriesSnapshot = await db.collection("categories").get();

      if (!categoriesSnapshot.empty) {
        const categoryNames = [];
        categoriesSnapshot.forEach((doc) => {
          categoryNames.push(doc.id);
        });

        // Sort alphabetically
        categoryNames.sort();

        categoryNames.forEach((categoryName) => {
          // Add to main category select
          const option = document.createElement("option");
          option.value = categoryName;
          option.textContent = categoryName;
          imageCategorySelect.appendChild(option);

          // Add to filter select
          const filterOption = option.cloneNode(true);
          categoryFilterSelect.appendChild(filterOption);

          // Add to edit/delete select
          const editOption = option.cloneNode(true);
          editCategorySelect.appendChild(editOption);
        });
      }

      // Add "Add New..." option for UI
      const addNewOption = document.createElement("option");
      addNewOption.value = "add_new";
      addNewOption.textContent = "+ Add New Category";
      imageCategorySelect.appendChild(addNewOption);
    } catch (error) {
      console.error("Error loading categories:", error);
      showNotification("Error loading categories", "error");
    }
  }

  // Add a new category to the dedicated collection
  async function addCategory() {
    const newCategoryName = document
      .querySelector("#newCategoryName")
      .value.trim();

    if (!newCategoryName) {
      showNotification("Please enter a category name", "warning");
      return;
    }

    try {
      // Check if category already exists
      const docRef = db.collection("categories").doc(newCategoryName);
      const doc = await docRef.get();

      if (doc.exists) {
        showNotification("Category already exists", "warning");
        return;
      }

      // Add to Firestore with the category name as document ID
      await docRef.set({
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      });

      // Refresh category lists
      await loadImageCategories();

      // Clear the input field
      document.querySelector("#newCategoryName").value = "";

      showNotification("Category added successfully", "success");
    } catch (error) {
      console.error("Error adding category:", error);
      showNotification("Error adding category", "error");
    }
  }

  // Delete selected category from dedicated collection
  async function deleteSelectedCategory() {
    const categoryToDelete = editCategorySelect.value;

    if (!categoryToDelete) {
      showNotification("Please select a category to delete", "warning");
      return;
    }

    if (
      !confirm(
        `Are you sure you want to delete the category "${categoryToDelete}"?`
      )
    ) {
      return;
    }

    try {
      // First delete the category document
      await db.collection("categories").doc(categoryToDelete).delete();

      // Update all images that had this category to remove it
      const batch = db.batch();
      const portfoliosSnapshot = await db.collection("portfolios").get();

      let imagesUpdated = 0;

      for (const portfolioDoc of portfoliosSnapshot.docs) {
        const imagesSnapshot = await db
          .collection("portfolios")
          .doc(portfolioDoc.id)
          .collection("images")
          .where("category", "==", categoryToDelete)
          .get();

        imagesSnapshot.forEach((doc) => {
          batch.update(doc.ref, { category: "" });
          imagesUpdated++;
        });
      }

      if (imagesUpdated > 0) {
        await batch.commit();
      }

      // Refresh category lists
      await loadImageCategories();

      showNotification(
        `Deleted category "${categoryToDelete}" and updated ${imagesUpdated} image(s)`,
        "success"
      );

      // Reload images to update the grid
      loadImages(portfolioFilterSelect.value);
    } catch (error) {
      console.error("Error deleting category:", error);
      showNotification("Error deleting category", "error");
    }
  }

  async function loadImages(portfolioName = "all") {
    showLoadingState();

    try {
      currentImages = [];
      imageGrid.innerHTML = "";

      if (portfolioName === "all") {
        // Load images from all portfolios
        const portfoliosSnapshot = await db.collection("portfolios").get();

        for (const portfolioDoc of portfoliosSnapshot.docs) {
          const imagesSnapshot = await db
            .collection("portfolios")
            .doc(portfolioDoc.id)
            .collection("images")
            .orderBy("timestamp", "desc")
            .get();

          imagesSnapshot.forEach((doc) => {
            const image = {
              id: doc.id,
              ...doc.data(),
              portfolioName: portfolioDoc.id,
            };
            currentImages.push(image);
          });
        }
      } else {
        // Load images from specific portfolio
        const imagesSnapshot = await db
          .collection("portfolios")
          .doc(portfolioName)
          .collection("images")
          .orderBy("timestamp", "desc")
          .get();

        imagesSnapshot.forEach((doc) => {
          const image = {
            id: doc.id,
            ...doc.data(),
            portfolioName: portfolioName,
          };
          currentImages.push(image);
        });
      }

      hideLoadingState();

      if (currentImages.length === 0) {
        showEmptyState();
        totalImagesSpan.textContent = 0;
        return;
      }

      // Sort all images by timestamp (newest first)
      currentImages.sort((a, b) => b.timestamp?.seconds - a.timestamp?.seconds);

      // Render all images
      currentImages.forEach((image) => renderImageCard(image));
      totalImagesSpan.textContent = currentImages.length;
    } catch (error) {
      console.error("Error loading images:", error);
      showErrorState();
      showNotification("Error loading images", "error");
    }
  }

  // Apply category filter
  function applyCategoryFilter() {
    const category = categoryFilterSelect.value;
    const portfolioName = portfolioFilterSelect.value;

    if (category === "all" && (portfolioName === "all" || !portfolioName)) {
      loadImages();
      return;
    }

    let filteredImages = [...currentImages];

    if (portfolioName && portfolioName !== "all") {
      filteredImages = filteredImages.filter(
        (img) => img.portfolioName === portfolioName
      );
    }

    if (category && category !== "all") {
      if (category === "uncategorized") {
        filteredImages = filteredImages.filter(
          (img) => !img.category || img.category === ""
        );
      } else {
        filteredImages = filteredImages.filter(
          (img) => img.category === category
        );
      }
    }

    renderFilteredImages(filteredImages);
  }

  // Render filtered images
  function renderFilteredImages(images) {
    imageGrid.innerHTML = "";

    if (images.length === 0) {
      showEmptyState();
      return;
    }

    images.forEach((image) => renderImageCard(image));
    totalImagesSpan.textContent = images.length;
  }

  // Render a single image card
  function renderImageCard(image) {
    const imageItem = document.createElement("div");
    imageItem.classList.add("image-item");
    imageItem.dataset.id = image.id;

    if (selectedImages.has(image.id)) {
      imageItem.classList.add("selected");
    }

    imageItem.innerHTML = `
      <div class="image-container">
        <img src="${image.imageUrl}" alt="${
      image.title
    }" onerror="this.src='https://via.placeholder.com/300?text=Image+Not+Found'" />
        ${
          image.category
            ? `<span class="image-category">${image.category}</span>`
            : ""
        }
      </div>
      <div class="image-info">
        <h5 class="image-title">${image.title}</h5>
        ${
          image.description
            ? `<p class="image-description">${image.description}</p>`
            : ""
        }
        <div class="image-actions">
          <button class="btn-action edit-image" data-id="${image.id}">
            <i class="fas fa-edit"></i> Edit
          </button>
          <button class="btn-action delete-image" data-id="${image.id}">
            <i class="fas fa-trash-alt"></i> Delete
          </button>
        </div>
      </div>
    `;

    imageGrid.appendChild(imageItem);
  }

  // Save image (create or update)
  async function saveImage() {
    const portfolioSelection = imagePortfolioSelect.value;
    const newPortfolioName = newPortfolioNameInput.value.trim();
    const title = imageTitleInput.value.trim();
    const imageUrl = imageUrlInput.value.trim();
    const category = imageCategorySelect.value;
    const description = imageDescriptionInput.value.trim();

    // Validate inputs
    if (!title) {
      showNotification("Please enter an image title", "warning");
      return;
    }

    if (!imageUrl) {
      showNotification("Please provide an image URL", "warning");
      return;
    }

    let portfolioName = portfolioSelection;

    // Handle new portfolio creation
    if (portfolioSelection === "new") {
      if (!newPortfolioName) {
        showNotification("Please enter a new portfolio name", "warning");
        return;
      }

      // Check if portfolio already exists
      const docRef = db.collection("portfolios").doc(newPortfolioName);
      const doc = await docRef.get();

      if (doc.exists) {
        showNotification("Portfolio name already exists", "warning");
        return;
      }

      // Create new portfolio
      await docRef.set({
        description: "",
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      });

      portfolioName = newPortfolioName;
      showNotification("Portfolio created successfully", "success");
      await loadPortfolios(); // Refresh portfolio list
      imagePortfolioSelect.value = portfolioName;
      newPortfolioGroup.style.display = "none";
    } else if (!portfolioSelection) {
      showNotification("Please select a portfolio", "warning");
      return;
    }

    // Prepare image data
    const imageData = {
      title,
      imageUrl,
      category,
      description,
      timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
    };

    try {
      if (editingImageId) {
        // Update existing image
        // Find which portfolio the image belongs to
        let foundPortfolio = null;
        const portfoliosSnapshot = await db.collection("portfolios").get();

        for (const portfolioDoc of portfoliosSnapshot.docs) {
          const imageDoc = await db
            .collection("portfolios")
            .doc(portfolioDoc.id)
            .collection("images")
            .doc(editingImageId)
            .get();

          if (imageDoc.exists) {
            foundPortfolio = portfolioDoc.id;
            break;
          }
        }

        if (!foundPortfolio) {
          throw new Error("Image not found in any portfolio");
        }

        // If portfolio hasn't changed, update in place
        if (foundPortfolio === portfolioName) {
          await db
            .collection("portfolios")
            .doc(portfolioName)
            .collection("images")
            .doc(editingImageId)
            .update(imageData);
        } else {
          // If portfolio has changed, we need to move the image
          const imageDoc = await db
            .collection("portfolios")
            .doc(foundPortfolio)
            .collection("images")
            .doc(editingImageId)
            .get();

          // Add to new portfolio
          await db
            .collection("portfolios")
            .doc(portfolioName)
            .collection("images")
            .doc(editingImageId)
            .set(imageDoc.data());

          // Delete from old portfolio
          await db
            .collection("portfolios")
            .doc(foundPortfolio)
            .collection("images")
            .doc(editingImageId)
            .delete();
        }

        showNotification("Image updated successfully", "success");
      } else {
        // Create new image - generate a new ID
        const newImageRef = db
          .collection("portfolios")
          .doc(portfolioName)
          .collection("images")
          .doc();

        await newImageRef.set(imageData);
        editingImageId = newImageRef.id; // Set the new ID for potential further edits
        showNotification("Image saved successfully", "success");
      }

      clearImageForm();
      loadImages(portfolioFilterSelect.value);
      loadAllCounts();
    } catch (error) {
      console.error("Error saving image:", error);
      showNotification("Error saving image", "error");
    }
  }

  // Create new portfolio via modal
  async function createPortfolio() {
    const name = portfolioNameInput.value.trim();
    const description = portfolioDescriptionInput.value.trim();

    if (!name) {
      showNotification("Please enter a portfolio name", "warning");
      return;
    }

    try {
      // Check if portfolio already exists
      const docRef = db.collection("portfolios").doc(name);
      const doc = await docRef.get();

      if (doc.exists) {
        showNotification("Portfolio name already exists", "warning");
        return;
      }

      // Create portfolio with name as document ID
      await docRef.set({
        description,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      });

      showNotification("Portfolio created successfully", "success");
      createPortfolioModal.hide();
      clearPortfolioForm();
      await loadPortfolios();
      loadAllCounts();
    } catch (error) {
      console.error("Error creating portfolio:", error);
      showNotification("Error creating portfolio", "error");
    }
  }

  // Delete current portfolio
  async function deleteCurrentPortfolio() {
    const portfolioName = imagePortfolioSelect.value;

    if (!portfolioName || portfolioName === "new") {
      showNotification("Please select a portfolio to delete", "warning");
      return;
    }

    if (
      !confirm(
        `Are you sure you want to delete "${portfolioName}" and all its images?`
      )
    ) {
      return;
    }

    try {
      // First delete all images in this portfolio
      const imagesSnapshot = await db
        .collection("portfolios")
        .doc(portfolioName)
        .collection("images")
        .get();

      if (!imagesSnapshot.empty) {
        const batch = db.batch();
        imagesSnapshot.forEach((doc) => {
          batch.delete(doc.ref);
        });
        await batch.commit();
      }

      // Then delete the portfolio document
      await db.collection("portfolios").doc(portfolioName).delete();

      showNotification(
        `Deleted "${portfolioName}" and ${imagesSnapshot.size} image(s)`,
        "success"
      );

      clearImageForm();
      await loadPortfolios();
      loadImages();
      loadAllCounts();
    } catch (error) {
      console.error("Error deleting portfolio:", error);
      showNotification("Error deleting portfolio", "error");
    }
  }

  // Delete selected images
  async function deleteSelectedImages() {
    if (selectedImages.size === 0) {
      showNotification("Please select images to delete", "warning");
      return;
    }

    if (
      !confirm(
        `Are you sure you want to delete ${selectedImages.size} selected image(s)?`
      )
    ) {
      return;
    }

    try {
      const batch = db.batch();

      // We need to find which portfolio each image belongs to
      const portfoliosSnapshot = await db.collection("portfolios").get();

      for (const portfolioDoc of portfoliosSnapshot.docs) {
        for (const imageId of selectedImages) {
          const imageRef = db
            .collection("portfolios")
            .doc(portfolioDoc.id)
            .collection("images")
            .doc(imageId);

          batch.delete(imageRef);
        }
      }

      await batch.commit();

      showNotification(
        `${selectedImages.size} image(s) deleted successfully`,
        "success"
      );
      selectedImages.clear();
      loadImages(portfolioFilterSelect.value);
      loadAllCounts();
    } catch (error) {
      console.error("Error deleting images:", error);
      showNotification("Error deleting images", "error");
    }
  }

  // Handle image grid clicks
  function handleImageGridClick(e) {
    const editBtn = e.target.closest(".edit-image");
    const deleteBtn = e.target.closest(".delete-image");
    const imageItem = e.target.closest(".image-item");

    if (editBtn) {
      const id = editBtn.dataset.id;
      editImage(id);
    } else if (deleteBtn) {
      const id = deleteBtn.dataset.id;
      if (confirm("Are you sure you want to delete this image?")) {
        deleteImage(id);
      }
    } else if (imageItem) {
      // Toggle selection
      imageItem.classList.toggle("selected");
      const id = imageItem.dataset.id;

      if (imageItem.classList.contains("selected")) {
        selectedImages.add(id);
      } else {
        selectedImages.delete(id);
      }
    }
  }

  // Load image data for reuse
  async function loadImageDataForReuse(imageId) {
    try {
      // Find which portfolio contains this image
      let imageData = null;
      let foundPortfolio = null;

      const portfoliosSnapshot = await db.collection("portfolios").get();

      for (const portfolioDoc of portfoliosSnapshot.docs) {
        const doc = await db
          .collection("portfolios")
          .doc(portfolioDoc.id)
          .collection("images")
          .doc(imageId)
          .get();

        if (doc.exists) {
          imageData = doc.data();
          foundPortfolio = portfolioDoc.id;
          break;
        }
      }

      if (!imageData) {
        showNotification("Image not found", "error");
        return;
      }

      // Populate the form with the image data
      imagePortfolioSelect.value = foundPortfolio || "";
      newPortfolioGroup.style.display = "none";
      imageTitleInput.value = imageData.title;
      imageUrlInput.value = ""; // Clear URL so you can enter a new one
      imageCategorySelect.value = imageData.category || "";
      imageDescriptionInput.value = imageData.description || "";

      // Keep the form in "create new" mode
      editingImageId = null;
      saveImageBtn.style.display = "inline-block";
      editImageBtn.style.display = "none";
      cancelEditBtn.style.display = "none";

      showNotification(
        "Loaded image data for reuse - change what you need and save as new",
        "info"
      );
    } catch (error) {
      console.error("Error loading image data:", error);
      showNotification("Error loading image data", "error");
    }
  }

  // Edit an image
  async function editImage(id) {
    try {
      // Find which portfolio contains this image
      let imageData = null;
      let foundPortfolio = null;

      const portfoliosSnapshot = await db.collection("portfolios").get();

      for (const portfolioDoc of portfoliosSnapshot.docs) {
        const doc = await db
          .collection("portfolios")
          .doc(portfolioDoc.id)
          .collection("images")
          .doc(id)
          .get();

        if (doc.exists) {
          imageData = doc.data();
          foundPortfolio = portfolioDoc.id;
          break;
        }
      }

      if (!imageData) {
        showNotification("Image not found", "error");
        return;
      }

      editingImageId = id;

      imagePortfolioSelect.value = foundPortfolio || "";
      newPortfolioGroup.style.display = "none";
      imageTitleInput.value = imageData.title;
      imageUrlInput.value = imageData.imageUrl;
      imageCategorySelect.value = imageData.category || "";
      imageDescriptionInput.value = imageData.description || "";

      saveImageBtn.style.display = "none";
      editImageBtn.style.display = "inline-block";
      cancelEditBtn.style.display = "inline-block";

      showNotification("Editing image: " + imageData.title, "info");
    } catch (error) {
      console.error("Error fetching image for edit:", error);
      showNotification("Error loading image for edit", "error");
    }
  }

  // Cancel edit mode
  function cancelEdit() {
    clearImageForm();
    editingImageId = null;
    saveImageBtn.style.display = "inline-block";
    editImageBtn.style.display = "none";
    cancelEditBtn.style.display = "none";
    showNotification("Edit cancelled", "info");
  }

  // Delete a single image
  async function deleteImage(id) {
    try {
      // Find which portfolio contains this image
      let foundPortfolio = null;

      const portfoliosSnapshot = await db.collection("portfolios").get();

      for (const portfolioDoc of portfoliosSnapshot.docs) {
        const doc = await db
          .collection("portfolios")
          .doc(portfolioDoc.id)
          .collection("images")
          .doc(id)
          .get();

        if (doc.exists) {
          foundPortfolio = portfolioDoc.id;
          break;
        }
      }

      if (!foundPortfolio) {
        throw new Error("Image not found in any portfolio");
      }

      await db
        .collection("portfolios")
        .doc(foundPortfolio)
        .collection("images")
        .doc(id)
        .delete();

      showNotification("Image deleted successfully", "success");
      loadImages(portfolioFilterSelect.value);
      loadAllCounts();
      selectedImages.delete(id);
    } catch (error) {
      console.error("Error deleting image:", error);
      showNotification("Error deleting image", "error");
    }
  }

  // Clear image form fields
  function clearImageForm() {
    imagePortfolioSelect.value = "";
    newPortfolioGroup.style.display = "none";
    newPortfolioNameInput.value = "";
    imageTitleInput.value = "";
    imageUrlInput.value = "";
    imageCategorySelect.value = "";
    imageDescriptionInput.value = "";
    editingImageId = null;
    saveImageBtn.style.display = "inline-block";
    editImageBtn.style.display = "none";
    cancelEditBtn.style.display = "none";
  }

  // Clear portfolio modal form fields
  function clearPortfolioForm() {
    portfolioNameInput.value = "";
    portfolioDescriptionInput.value = "";
  }

  // Load all counts for portfolios and images
  async function loadAllCounts() {
    try {
      const portfolioSnapshot = await db.collection("portfolios").get();
      totalPortfoliosSpan.textContent = portfolioSnapshot.size;

      let totalImages = 0;
      const portfoliosSnapshot = await db.collection("portfolios").get();

      for (const portfolioDoc of portfoliosSnapshot.docs) {
        const imagesSnapshot = await db
          .collection("portfolios")
          .doc(portfolioDoc.id)
          .collection("images")
          .get();

        totalImages += imagesSnapshot.size;
      }

      totalImagesSpan.textContent = totalImages;
    } catch (error) {
      console.error("Error loading counts:", error);
    }
  }

  // Show loading state in image grid
  function showLoadingState() {
    imageGrid.innerHTML = `
      <div class="loading-placeholder">
        <i class="fas fa-spinner fa-spin"></i> Loading images...
      </div>
    `;
    totalImagesSpan.textContent = "...";
  }

  // Hide loading state
  function hideLoadingState() {
    const loadingPlaceholder = imageGrid.querySelector(".loading-placeholder");
    if (loadingPlaceholder) {
      loadingPlaceholder.remove();
    }
  }

  // Show empty state in image grid
  function showEmptyState() {
    imageGrid.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-image"></i> No images found. Upload some images to get started!
      </div>
    `;
  }

  // Show error state in image grid
  function showErrorState() {
    imageGrid.innerHTML = `
      <div class="error-state">
        <i class="fas fa-exclamation-circle"></i> Error loading images. Please try again.
      </div>
    `;
  }

  // Show notification (toast message)
  function showNotification(message, type = "info") {
    // Remove existing toast if any
    const oldToast = document.querySelector(".custom-toast");
    if (oldToast) oldToast.remove();

    const toast = document.createElement("div");
    toast.className = `custom-toast alert alert-${type}`;
    toast.style.position = "fixed";
    toast.style.top = "20px";
    toast.style.right = "20px";
    toast.style.zIndex = "1050";
    toast.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)";
    toast.style.borderRadius = "8px";
    toast.style.padding = "12px 16px";
    toast.style.fontSize = "0.95rem";
    toast.innerHTML = `
      <strong>${type.charAt(0).toUpperCase() + type.slice(1)}:</strong>
      ${message}
    `;

    document.body.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transition = "opacity 0.5s";
      setTimeout(() => toast.remove(), 500);
    }, 3000);
  }
});
