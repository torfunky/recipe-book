let recipes = [];
let currentView = "home";

const recipesContainer = document.getElementById("recipes-container");
const searchInput = document.getElementById("search-input");
// const tagFilters = document.querySelector(".tag-filters");
const recipeDetail = document.getElementById("recipe-detail");
const homeNav = document.getElementById("home-nav");

document.addEventListener("DOMContentLoaded", async function () {
  await loadRecipes();
  displayRecipes();
  setupEventListeners();
});

function setupEventListeners() {
  searchInput.addEventListener("input", filterRecipes);

  homeNav.addEventListener("click", function (e) {
    e.preventDefault();
    showHomePage();
  });
}

async function loadRecipes() {
  try {
    const response = await fetch("./recipes.json");
    recipes = await response.json();
  } catch (error) {
    console.error("Error loading recipes:", error);
    recipes = [];
  }
}

function displayRecipes(recipesToShow = recipes) {
  if (recipesToShow.length === 0) {
    recipesContainer.innerHTML = `
            <div class="empty-state">
                <p>No recipes match</p>
            </div>
        `;
    return;
  }

  recipesContainer.innerHTML = recipesToShow
    .map(
      (recipe) => `
        <div class="recipe-card" data-recipe-id="${recipe.id}">
            <div class="recipe-image">
                ${
                  recipe.image
                    ? `<img src="./assets/images/${recipe.image}" alt="${recipe.name}" />`
                    : `<div class="recipe-placeholder"></div>`
                }
            </div>
            <div class="recipe-content">
                <h3 class="recipe-title">${recipe.name}</h3>
                <div class="recipe-tags">
                    ${recipe.tags
                      .map((tag) => `<span class="recipe-tag">${tag}</span>`)
                      .join("")}
                </div>
            </div>
        </div>
    `
    )
    .join("");

  document.querySelectorAll(".recipe-card").forEach((card) => {
    card.addEventListener("click", function (e) {
      const recipeId = parseInt(this.dataset.recipeId);
      showRecipeDetail(recipeId);
    });
  });

  // updateTagFilters();
}

function showRecipeDetail(recipeId) {
  const recipe = recipes.find((r) => r.id === recipeId);
  if (!recipe) return;

  currentView = "recipe-detail";
  updateNavigation();

  // Hide home sections
  const heroSection = document.querySelector(".hero");
  const filtersSection = document.querySelector(".filters");

  if (heroSection) heroSection.style.display = "none";
  if (filtersSection) filtersSection.style.display = "none";
  if (recipesContainer) recipesContainer.style.display = "none";

  // Show recipe detail
  if (recipeDetail) recipeDetail.style.display = "block";

  // Populate recipe detail content
  const detailContent = document.querySelector(".recipe-detail-content");
  detailContent.innerHTML = `
        <section class="recipe-hero">
            <div class="recipe-hero-content">
                <div class="recipe-info">
                    <h1 class="recipe-title">${recipe.name}</h1>
                    <p class="recipe-description">${recipe.description}</p>
                    
                    <div class="recipe-meta-grid">
                        ${
                          recipe.prepTime
                            ? `
                            <div class="meta-item">
                                <span class="meta-value">${recipe.prepTime} min</span>
                                <span class="meta-label">Prep Time</span>
                            </div>
                        `
                            : ""
                        }
                        ${
                          recipe.cookTime
                            ? `
                            <div class="meta-item">
                                <span class="meta-value">${recipe.cookTime} min</span>
                                <span class="meta-label">Cook Time</span>
                            </div>
                        `
                            : ""
                        }
                        ${
                          recipe.prepTime && recipe.cookTime
                            ? `
                            <div class="meta-item">
                                <span class="meta-value">${
                                  recipe.prepTime + recipe.cookTime
                                } min</span>
                                <span class="meta-label">Total Time</span>
                            </div>
                        `
                            : ""
                        }
                    </div>

                    <!-- Recipe Tags -->
                    ${
                      recipe.tags && recipe.tags.length > 0
                        ? `
                        <div class="recipe-tags-section">
                            ${recipe.tags
                              .map(
                                (tag) =>
                                  `<span class="recipe-tag">${tag}</span>`
                              )
                              .join("")}
                        </div>
                    `
                        : ""
                    }
                </div>

                ${
                  recipe.image
                    ? `<div class="recipe-hero-image">
                        <img src="./assets/images/${recipe.image}" alt="${recipe.name}" class="main-recipe-image">
                       </div>`
                    : ""
                }
            </div>
        </section>

        <!-- Image Carousel Section -->
        ${
          (recipe.images && recipe.images.length > 0) || recipe.image
            ? `<section class="recipe-carousel">
                <div class="carousel-container">
                    ${
                      recipe.images && recipe.images.length > 0
                        ? recipe.images
                            .map(
                              (img, index) =>
                                `<div class="carousel-item ${
                                  index === 0 ? "active" : ""
                                }">
                                    <img src="./assets/images/${img}" alt="${
                                  recipe.name
                                } - Image ${index + 1}">
                                 </div>`
                            )
                            .join("")
                        : recipe.image
                        ? `<div class="carousel-item active">
                            <img src="./assets/images/${recipe.image}" alt="${recipe.name}">
                           </div>`
                        : ""
                    }
                </div>
               </section>`
            : ""
        }

        <!-- Ingredients and Instructions Section -->
        <section class="recipe-content">
            <div class="content-columns">
                <!-- Ingredients Column -->
                <div class="ingredients-column">
                    <div class="recipe-section">
                        <h3>Ingredients</h3>
                        <ul class="ingredients-list">
                            ${recipe.ingredients
                              .map((ingredient) => {
                                if (
                                  typeof ingredient === "object" &&
                                  ingredient.quantity &&
                                  ingredient.item
                                ) {
                                  return `<li>
                                    <span class="ingredient-quantity">${ingredient.quantity}</span>
                                    <span class="ingredient-item">${ingredient.item}</span>
                                  </li>`;
                                } else {
                                  return `<li>${ingredient}</li>`;
                                }
                              })
                              .join("")}
                        </ul>
                    </div>
                </div>

                <!-- Instructions Column -->
                <div class="instructions-column">
                    <div class="recipe-section">
                        <h3>Instructions</h3>
                        <div class="instructions-list">
                            ${
                              Array.isArray(recipe.instructions)
                                ? recipe.instructions
                                    .map(
                                      (step, index) =>
                                        `<div class="instruction-step">
                                        <span class="step-number">${
                                          index + 1
                                        }</span>
                                        <span class="step-text">${step}</span>
                                      </div>`
                                    )
                                    .join("")
                                : `<div class="instruction-step">
                                  <span class="step-text">${recipe.instructions}</span>
                                </div>`
                            }
                        </div>
                    </div>
                </div>
            </div>
        </section>
    `;

  // Scroll to top
  window.scrollTo(0, 0);
}

// Show home page
function showHomePage() {
  currentView = "home";
  updateNavigation();

  // Show home sections
  const heroSection = document.querySelector(".hero");
  const filtersSection = document.querySelector(".filters");

  if (heroSection) heroSection.style.display = "block";
  if (filtersSection) filtersSection.style.display = "flex";
  if (recipesContainer) recipesContainer.style.display = "grid";

  // Hide recipe detail
  if (recipeDetail) recipeDetail.style.display = "none";
}

// Update navigation active state
function updateNavigation() {
  const homeNavLink = document.getElementById("home-nav");
  if (currentView === "home") {
    homeNavLink.classList.add("active");
  } else {
    homeNavLink.classList.remove("active");
  }
}

// Filter recipes based on search and tags
function filterRecipes() {
  const searchTerm = searchInput.value.toLowerCase();
  const activeTag = document.querySelector(".tag-filter.active").dataset.tag;

  let filteredRecipes = recipes;

  // Filter by search term
  if (searchTerm) {
    filteredRecipes = filteredRecipes.filter(
      (recipe) =>
        recipe.name.toLowerCase().includes(searchTerm) ||
        recipe.description.toLowerCase().includes(searchTerm) ||
        recipe.ingredients.some((ingredient) => {
          if (
            typeof ingredient === "object" &&
            ingredient.quantity &&
            ingredient.item
          ) {
            return (
              ingredient.item.toLowerCase().includes(searchTerm) ||
              ingredient.quantity.toLowerCase().includes(searchTerm)
            );
          } else {
            return ingredient.toLowerCase().includes(searchTerm);
          }
        }) ||
        recipe.tags.some((tag) => tag.toLowerCase().includes(searchTerm))
    );
  }

  // Filter by tag
  if (activeTag !== "all") {
    filteredRecipes = filteredRecipes.filter((recipe) =>
      recipe.tags.some((tag) => tag.toLowerCase() === activeTag.toLowerCase())
    );
  }

  displayRecipes(filteredRecipes);
}

// Update tag filters based on available tags
function updateTagFilters() {
  // Get all unique tags
  const allTags = [...new Set(recipes.flatMap((recipe) => recipe.tags))];

  // Clear existing buttons and create "All" button
  tagFilters.innerHTML = "";

  // Create "All" button
  const allButton = document.createElement("button");
  allButton.className = "tag-filter active";
  allButton.dataset.tag = "all";
  allButton.textContent = "All";
  tagFilters.appendChild(allButton);

  allTags.forEach((tag) => {
    const button = document.createElement("button");
    button.className = "tag-filter";
    button.dataset.tag = tag;
    button.textContent = tag;
    button.addEventListener("click", function () {
      // Remove active class from all buttons
      document
        .querySelectorAll(".tag-filter")
        .forEach((btn) => btn.classList.remove("active"));
      // Add active class to clicked button
      this.classList.add("active");
      // Filter recipes
      filterRecipes();
    });
    tagFilters.appendChild(button);
  });

  // Add click event to "All" button
  allButton.addEventListener("click", function () {
    document
      .querySelectorAll(".tag-filter")
      .forEach((btn) => btn.classList.remove("active"));
    this.classList.add("active");
    filterRecipes();
  });
}
