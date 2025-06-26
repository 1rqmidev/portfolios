// Products Tab functionality
document.addEventListener("DOMContentLoaded", () => {
  const addProductBtn = document.getElementById("addProductBtn");
  const productTitleInput = document.getElementById("productTitle");
  const productPriceInput = document.getElementById("productPrice");
  const productDescriptionTextarea =
    document.getElementById("productDescription");
  const productPreviewTypeSelect =
    document.getElementById("productPreviewType");
  const productGameTypeInput = document.getElementById("productGameType");
  const productViewsInput = document.getElementById("productViews");
  const productPurchasesInput = document.getElementById("productPurchases");
  const productLinkInput = document.getElementById("productLink");
  const productImagesTextarea = document.getElementById("productImages");
  const productStatusCheckbox = document.getElementById("productStatus");
  const saveProductBtn = document.querySelector("#products-tab .btn-primary"); // Specific save button for products
  const productsTableBody = document.getElementById("productsTableBody");

  let editingProductId = null;

  addProductBtn.addEventListener("click", () => {
    clearProductForm();
    editingProductId = null;
  });

  saveProductBtn.addEventListener("click", saveProduct);

  // Load products from Firestore
  async function loadProducts() {
    productsTableBody.innerHTML = ""; // Clear existing table rows
    try {
      const snapshot = await db.collection("products").get();
      if (snapshot.empty) {
        productsTableBody.innerHTML =
          '<tr><td colspan="8" class="empty-state">No products yet.</td></tr>';
        return;
      }
      snapshot.docs.forEach((doc) => {
        renderProductRow({ id: doc.id, ...doc.data() });
      });
    } catch (error) {
      console.error("Error loading products:", error);
      showNotification("Error loading products", "error");
      productsTableBody.innerHTML =
        '<tr><td colspan="8" class="error-state">Error loading products.</td></tr>';
    }
  }

  // Render a single product row
  function renderProductRow(product) {
    const row = productsTableBody.insertRow();
    row.dataset.id = product.id;
    const images = product.images
      ? product.images.split("\n").filter((url) => url.trim() !== "")
      : [];
    const firstImage =
      images.length > 0
        ? `<img src="${images[0]}" alt="${product.title}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px; margin-right: 10px;">`
        : "";

    row.innerHTML = `
            <td>
                <div style="display: flex; align-items: center;">
                    ${firstImage}
                    <span>${product.title}</span>
                </div>
            </td>
            <td>$${product.price.toFixed(2)}</td>
            <td>${product.previewType}</td>
            <td>${product.gameType}</td>
            <td>${product.views}</td>
            <td>${product.purchases}</td>
            <td><span class="badge ${
              product.status ? "badge-success" : "badge-danger"
            }">${product.status ? "Active" : "Inactive"}</span></td>
            <td>
                <button class="action-btn edit-product" data-id="${
                  product.id
                }"><i class="fas fa-edit"></i></button>
                <button class="action-btn delete-product" data-id="${
                  product.id
                }"><i class="fas fa-trash-alt"></i></button>
            </td>
        `;
  }

  // Save or update a product
  async function saveProduct() {
    const productData = {
      title: productTitleInput.value,
      price: parseFloat(productPriceInput.value) || 0,
      description: productDescriptionTextarea.value,
      previewType: productPreviewTypeSelect.value,
      gameType: productGameTypeInput.value,
      views: parseInt(productViewsInput.value) || 0,
      purchases: parseInt(productPurchasesInput.value) || 0,
      link: productLinkInput.value,
      images: productImagesTextarea.value,
      status: productStatusCheckbox.checked,
    };

    if (
      !productData.title ||
      !productData.price ||
      !productData.description ||
      !productData.link
    ) {
      showNotification(
        "Please fill in all required product fields.",
        "warning"
      );
      return;
    }

    try {
      if (editingProductId) {
        await db
          .collection("products")
          .doc(editingProductId)
          .update(productData);
        showNotification("Product updated successfully!", "success");
      } else {
        await db.collection("products").add(productData);
        showNotification("Product added successfully!", "success");
      }
      clearProductForm();
      loadProducts(); // Reload list
      loadAllCounts(); // Update dashboard counts
    } catch (error) {
      console.error("Error saving product:", error);
      showNotification("Error saving product", "error");
    }
  }

  // Edit product: Populate form with data
  productsTableBody.addEventListener("click", async (e) => {
    if (e.target.closest(".edit-product")) {
      const id = e.target.closest(".edit-product").dataset.id;
      try {
        const doc = await db.collection("products").doc(id).get();
        if (doc.exists) {
          const product = doc.data();
          productTitleInput.value = product.title;
          productPriceInput.value = product.price;
          productDescriptionTextarea.value = product.description;
          productPreviewTypeSelect.value = product.previewType;
          productGameTypeInput.value = product.gameType;
          productViewsInput.value = product.views;
          productPurchasesInput.value = product.purchases;
          productLinkInput.value = product.link;
          productImagesTextarea.value = product.images;
          productStatusCheckbox.checked = product.status;
          editingProductId = id;
          showNotification("Product data loaded for editing.", "info");
        }
      } catch (error) {
        console.error("Error loading product for edit:", error);
        showNotification("Error loading product for edit", "error");
      }
    } else if (e.target.closest(".delete-product")) {
      const id = e.target.closest(".delete-product").dataset.id;
      if (confirm("Are you sure you want to delete this product?")) {
        deleteProduct(id);
      }
    }
  });
  document
    .querySelector("#products-tab > div:nth-child(2) > button")
    .addEventListener("click", (e) => {
      saveProduct();
    });
  // Delete product
  async function deleteProduct(id) {
    try {
      await db.collection("products").doc(id).delete();
      showNotification("Product deleted successfully!", "success");
      loadProducts(); // Reload list
      loadAllCounts(); // Update dashboard counts
    } catch (error) {
      console.error("Error deleting product:", error);
      showNotification("Error deleting product", "error");
    }
  }

  // Clear product form
  function clearProductForm() {
    productTitleInput.value = "";
    productPriceInput.value = "";
    productDescriptionTextarea.value = "";
    productPreviewTypeSelect.value = "3D";
    productGameTypeInput.value = "";
    productViewsInput.value = "";
    productPurchasesInput.value = "";
    productLinkInput.value = "";
    productImagesTextarea.value = "";
    productStatusCheckbox.checked = true;
    editingProductId = null;
  }

  // Initial load
  loadProducts();
});
