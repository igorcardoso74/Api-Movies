function populateFiltersOptions() {
    const typeSelect = document.getElementById("type");
    const brandSelect = document.getElementById("brand");
  ​
    fetch("http://localhost:5555/devices/types")
      .then((response) => response.json())
      .then((result) => {
        typeSelect.innerHTML = '<option value="all">All types</option>';
  ​
        result.forEach((type) => {
          typeSelect.insertAdjacentHTML(
            "beforeend",
            `<option value="${type._id}">${type.name}</option>`,
          );
        });
      })
      .catch((error) => console.log("Error types: ", error));
  ​
    fetch("http://localhost:5555/devices/brands")
      .then((response) => response.json())
      .then((result) => {
        brandSelect.innerHTML = '<option value="all">All brands</option>';
  ​
        result.forEach((brand) => {
          brandSelect.insertAdjacentHTML(
            "beforeend",
            `<option value="${brand}">${brand}</option>`,
          );
        });
      })
      .catch((error) => console.log("Error brands: ", error));
  }
  ​
  populateFiltersOptions();
  ​
  function createProductElement(product) {
    // <img
    //   src="https://dummyimage.com/300x100/75b3c9/fff"
    //   class="card-img-top"
    //   alt="Product image"
    // />
    return `<div class="col-md-4 mb-4">
      <div class="card">
        <div class="card-body">
          <h5 class="card-title">${product.name}</h5>
          <p class="card-text">${product.brand}, ${product.type}</p>
          <p class="card-text">$${product.price}</p>
          <p class="card-text"><small>${product.description}</small></p>
          <button class="btn btn-danger delete-btn" data-id="${product.id}">Delete</button>
        </div>
      </div>
    </div>`;
  }
  ​
  function handleFilterBtnClick() {
    const type = document.getElementById("type").value;
    const brand = document.getElementById("brand").value;
  ​
    const queryParams = new URLSearchParams({
      type,
      brand,
    }).toString();
  ​
    const url = `http://localhost:5555/devices/?${queryParams}`;
  ​
    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        const productContainer = document.querySelector(".product-list");
        productContainer.innerHTML = "";
  ​
        data.forEach((product) => {
          const productElement = createProductElement(product);
          productContainer.insertAdjacentHTML("beforeend", productElement);
        });
        const deletedBtns = document.querySelectorAll(".delete-btn");
  ​
        deletedBtns.forEach((deletedBtn) => {
          deletedBtn.addEventListener("click", handleDeleteProduct);
        });
      })
      .catch((error) => console.error("Error fetching products:", error));
  }
  function handleDeleteProduct(event) {
    const productId = event.target.dataset.id;
    fetch(`http://localhost:5555/devices/${productId}`, { method: "DELETE" })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Error deleting product");
        }
        return response.json();
      })
      .then(() => {
        event.target.parentElement.parentElement.parentElement.remove();
      })
      .catch((error) => console.error("Error delete product:", error));
  }
  ​
  handleFilterBtnClick();
  ​
  const filterBtn = document.getElementById("filterBtn");
  filterBtn.addEventListener("click", handleFilterBtnClick);