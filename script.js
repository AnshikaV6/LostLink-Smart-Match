// ============================================
// LostLink Smart Match - Complete JavaScript
// Browser-based Lost & Found Matching System
// ============================================

// Storage key for localStorage
const STORAGE_KEY = "lostlink_smart_match_data";

// Application state
const appState = {
  lostItems: [],
  foundItems: [],
  currentFilterTab: "all"
};

// ============================================
// Initialization
// ============================================

document.addEventListener("DOMContentLoaded", () => {
  loadDataFromStorage();
  bindAllEvents();
  renderDashboard();
  showSection("dashboard");
});

// ============================================
// Event Binding
// ============================================

function bindAllEvents() {
  // Navigation links
  document.querySelectorAll(".nav-link").forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const sectionId = link.dataset.section;
      showSection(sectionId);
      updateNavActive(link);
    });
  });

  // CTA Navigation buttons
  document.querySelectorAll("[data-navigate]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const sectionId = btn.dataset.navigate;
      showSection(sectionId);
      const navLink = document.querySelector(`[data-section="${sectionId}"]`);
      if (navLink) updateNavActive(navLink);
    });
  });

  // Form submissions
  document.getElementById("lost-form").addEventListener("submit", (e) => {
    e.preventDefault();
    handleLostFormSubmit();
  });

  document.getElementById("found-form").addEventListener("submit", (e) => {
    e.preventDefault();
    handleFoundFormSubmit();
  });

  // Image previews
  document.getElementById("lost-image").addEventListener("change", (e) => {
    previewImage(e, "lost-image-preview");
  });

  document.getElementById("found-image").addEventListener("change", (e) => {
    previewImage(e, "found-image-preview");
  });

  // Sample data and reset buttons
  document.getElementById("load-sample-btn").addEventListener("click", loadSampleData);
  document.getElementById("reset-data-btn").addEventListener("click", resetAllData);

  // Match filters
  document.getElementById("match-search").addEventListener("input", renderMatches);
  document.getElementById("match-category-filter").addEventListener("change", renderMatches);
  document.getElementById("match-quality-filter").addEventListener("change", renderMatches);
  document.getElementById("clear-filters-btn").addEventListener("click", clearAllFilters);

  // Report filter tabs
  document.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".tab-btn").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      appState.currentFilterTab = btn.dataset.filter;
      renderMyReports();
    });
  });

  // Modal close buttons
  document.getElementById("close-match-modal").addEventListener("click", () => {
    closeModal("match-modal");
  });

  document.getElementById("close-report-modal").addEventListener("click", () => {
    closeModal("report-modal");
  });

  // Modal overlay click to close
  document.getElementById("match-modal").addEventListener("click", (e) => {
    if (e.target.id === "match-modal") closeModal("match-modal");
  });

  document.getElementById("report-modal").addEventListener("click", (e) => {
    if (e.target.id === "report-modal") closeModal("report-modal");
  });

  // Delegate clicks for card actions
  document.addEventListener("click", handleCardActions);
}

// ============================================
// Section Navigation
// ============================================

function showSection(sectionId) {
  // Hide all sections
  document.querySelectorAll(".section").forEach((section) => {
    section.classList.remove("active");
  });

  // Show the requested section
  const section = document.getElementById(sectionId);
  if (section) {
    section.classList.add("active");

    // Render content based on section
    if (sectionId === "dashboard") {
      renderDashboard();
    } else if (sectionId === "matches") {
      renderMatches();
    } else if (sectionId === "my-reports") {
      renderMyReports();
    }
  }
}

function updateNavActive(link) {
  document.querySelectorAll(".nav-link").forEach((l) => l.classList.remove("active"));
  link.classList.add("active");
}

// ============================================
// Form Handling
// ============================================

function handleLostFormSubmit() {
  const form = document.getElementById("lost-form");
  const formData = new FormData(form);

  // Clear previous errors
  clearFormErrors("lost");

  // Validate form
  const errors = validateForm(formData, "lost");
  if (Object.keys(errors).length > 0) {
    displayFormErrors(errors, "lost");
    return;
  }

  // Create item object
  const item = createItemObject("lost", formData);

  // Handle image
  const imageFile = formData.get("image");
  if (imageFile && imageFile.size > 0) {
    convertFileToBase64(imageFile, (base64) => {
      item.image = base64;
      appState.lostItems.push(item);
      saveDataToStorage();
      renderDashboard();
      renderMatches();
      form.reset();
      clearImagePreview("lost-image-preview");
      showToast("✅ Lost item reported successfully!");
      showSection("dashboard");
    });
  } else {
    appState.lostItems.push(item);
    saveDataToStorage();
    renderDashboard();
    renderMatches();
    form.reset();
    clearImagePreview("lost-image-preview");
    showToast("✅ Lost item reported successfully!");
    showSection("dashboard");
  }
}

function handleFoundFormSubmit() {
  const form = document.getElementById("found-form");
  const formData = new FormData(form);

  // Clear previous errors
  clearFormErrors("found");

  // Validate form
  const errors = validateForm(formData, "found");
  if (Object.keys(errors).length > 0) {
    displayFormErrors(errors, "found");
    return;
  }

  // Create item object
  const item = createItemObject("found", formData);

  // Handle image
  const imageFile = formData.get("image");
  if (imageFile && imageFile.size > 0) {
    convertFileToBase64(imageFile, (base64) => {
      item.image = base64;
      appState.foundItems.push(item);
      saveDataToStorage();
      renderDashboard();
      renderMatches();
      form.reset();
      clearImagePreview("found-image-preview");
      showToast("✅ Found item reported successfully!");
      showSection("dashboard");
    });
  } else {
    appState.foundItems.push(item);
    saveDataToStorage();
    renderDashboard();
    renderMatches();
    form.reset();
    clearImagePreview("found-image-preview");
    showToast("✅ Found item reported successfully!");
    showSection("dashboard");
  }
}

function createItemObject(type, formData) {
  const showContact = formData.get("showContact") === "on" ? true : false;

  return {
    id: generateUniqueId(),
    type: type, // "lost" or "found"
    itemName: formData.get("itemName").trim(),
    category: formData.get("category").trim(),
    colour: formData.get("colour").trim(),
    description: formData.get("description").trim(),
    location: formData.get("location").trim(),
    date: formData.get("date"),
    contact: formData.get("contact").trim() || "",
    showContact: showContact,
    status: "active", // "active" or "recovered"
    image: "",
    createdAt: new Date().toISOString()
  };
}

function validateForm(formData, type) {
  const errors = {};
  const requiredFields = ["itemName", "category", "colour", "description", "location", "date"];

  requiredFields.forEach((field) => {
    const value = formData.get(field);
    if (!value || value.trim() === "") {
      errors[field] = `${field.charAt(0).toUpperCase() + field.slice(1)} is required.`;
    }
  });

  return errors;
}

function displayFormErrors(errors, prefix) {
  Object.keys(errors).forEach((field) => {
    const errorElement = document.getElementById(`error-${prefix}-${field}`);
    if (errorElement) {
      errorElement.textContent = errors[field];
    }
  });
}

function clearFormErrors(prefix) {
  document.querySelectorAll(`#error-${prefix}-itemName, #error-${prefix}-category, #error-${prefix}-colour, #error-${prefix}-description, #error-${prefix}-location, #error-${prefix}-date`).forEach((el) => {
    el.textContent = "";
  });
}

function previewImage(event, previewId) {
  const file = event.target.files[0];
  const preview = document.getElementById(previewId);

  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      preview.classList.remove("empty-preview");
      preview.innerHTML = `<img src="${e.target.result}" alt="Preview" />`;
    };
    reader.readAsDataURL(file);
  }
}

function clearImagePreview(previewId) {
  const preview = document.getElementById(previewId);
  preview.classList.add("empty-preview");
  preview.textContent = "No image selected";
}

function convertFileToBase64(file, callback) {
  const reader = new FileReader();
  reader.onload = () => {
    callback(reader.result);
  };
  reader.readAsDataURL(file);
}

// ============================================
// Dashboard Rendering
// ============================================

function renderDashboard() {
  // Update statistics
  document.getElementById("stat-lost-count").textContent = appState.lostItems.length;
  document.getElementById("stat-found-count").textContent = appState.foundItems.length;

  const matches = calculateAllMatches();
  document.getElementById("stat-match-count").textContent = matches.length;

  // Render recent items
  const allItems = [...appState.lostItems, ...appState.foundItems]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 6);

  const recentContainer = document.getElementById("recent-items-grid");

  if (allItems.length === 0) {
    recentContainer.innerHTML = '<div class="empty-state">No items reported yet. Start by reporting a lost or found item!</div>';
    return;
  }

  recentContainer.innerHTML = allItems
    .map((item) => createItemCardHTML(item))
    .join("");

  // Add event listeners to action buttons
  addCardActionListeners();
}

function createItemCardHTML(item) {
  const typeClass = item.type === "lost" ? "badge-lost" : "badge-found";
  const typeText = item.type === "lost" ? "Lost" : "Found";
  const statusClass = item.status === "recovered" ? "badge-recovered" : "badge-active";
  const statusText = item.status === "recovered" ? "Recovered" : "Active";

  return `
    <div class="item-card">
      <div class="item-card-header">
        <span class="badge ${typeClass}">${typeText}</span>
        <span class="badge ${statusClass}">${statusText}</span>
      </div>
      <div class="item-card-body">
        <h3>${escapeHTML(item.itemName)}</h3>
        <div class="item-meta">
          <span>📁 ${escapeHTML(item.category)}</span>
          <span>🎨 ${escapeHTML(item.colour)}</span>
          <span>📍 ${escapeHTML(item.location)}</span>
        </div>
        <p>${escapeHTML(truncateText(item.description, 120))}</p>
      </div>
      <div class="item-card-footer">
        <span>${formatDate(item.date)}</span>
        <div class="card-actions">
          <button class="action-btn action-view" data-action="view" data-item-id="${item.id}">View</button>
        </div>
      </div>
    </div>
  `;
}

// ============================================
// Match Calculation Algorithm
// ============================================

function calculateAllMatches() {
  const matches = [];

  // Only compare lost items with found items
  appState.lostItems.forEach((lostItem) => {
    // Skip recovered items
    if (lostItem.status === "recovered") return;

    appState.foundItems.forEach((foundItem) => {
      // Skip recovered items
      if (foundItem.status === "recovered") return;

      // Don't match item with itself
      if (lostItem.id === foundItem.id) return;

      // Calculate match score
      const matchResult = calculateMatchScore(lostItem, foundItem);

      matches.push({
        id: `${lostItem.id}|${foundItem.id}`,
        lost: lostItem,
        found: foundItem,
        score: matchResult.score,
        reasons: matchResult.reasons
      });
    });
  });

  // Sort by score (highest first)
  return matches.sort((a, b) => b.score - a.score);
}

/**
 * Smart Matching Algorithm
 * Calculates similarity between lost and found items
 *
 * Weighted criteria:
 * - Category match: 25% (exact match)
 * - Item name similarity: 20% (keyword overlap)
 * - Colour match: 15% (text similarity)
 * - Description keywords: 20% (keyword overlap)
 * - Location similarity: 10% (keyword overlap)
 * - Date proximity: 10% (days difference)
 *
 * Returns a score from 0 to 100
 */
function calculateMatchScore(lostItem, foundItem) {
  // 1. Category matching (25% weight)
  const categoryScore = lostItem.category.toLowerCase() === foundItem.category.toLowerCase() ? 1 : 0;

  // 2. Item name similarity (20% weight)
  const nameScore = calculateTextSimilarity(lostItem.itemName, foundItem.itemName);

  // 3. Colour similarity (15% weight)
  const colourScore = calculateTextSimilarity(lostItem.colour, foundItem.colour);

  // 4. Description keyword overlap (20% weight)
  const descriptionScore = calculateKeywordOverlap(lostItem.description, foundItem.description);

  // 5. Location similarity (10% weight)
  const locationScore = calculateKeywordOverlap(lostItem.location, foundItem.location);

  // 6. Date proximity (10% weight)
  const dateScore = calculateDateProximity(lostItem.date, foundItem.date);

  // Calculate weighted score
  const totalScore =
    categoryScore * 25 +
    nameScore * 20 +
    colourScore * 15 +
    descriptionScore * 20 +
    locationScore * 10 +
    dateScore * 10;

  // Round and cap at 100
  const score = Math.min(100, Math.max(0, Math.round(totalScore)));

  // Generate match reasons
  const reasons = [];

  if (categoryScore > 0.8) {
    reasons.push(`✓ Category matches: both items are listed as "${lostItem.category}".`);
  } else {
    reasons.push(`✗ Category differs: lost item is "${lostItem.category}", found item is "${foundItem.category}".`);
  }

  if (nameScore >= 0.5) {
    reasons.push(`✓ Item names are similar: "${lostItem.itemName}" and "${foundItem.itemName}" share keywords.`);
  } else {
    reasons.push(`✗ Item names are not very similar.`);
  }

  if (colourScore >= 0.4) {
    reasons.push(`✓ Colour matches: both mention similar colors.`);
  } else {
    reasons.push(`✗ Colours don't match well: "${lostItem.colour}" vs "${foundItem.colour}".`);
  }

  if (descriptionScore >= 0.25) {
    reasons.push(`✓ Descriptions share meaningful keywords and details.`);
  } else {
    reasons.push(`✗ Descriptions don't overlap much.`);
  }

  if (locationScore >= 0.2) {
    reasons.push(`✓ Locations are somewhat related: "${lostItem.location}" and "${foundItem.location}".`);
  } else {
    reasons.push(`✗ Locations are very different.`);
  }

  if (dateScore >= 0.5) {
    reasons.push(`✓ Dates are close together, supporting the match.`);
  } else {
    reasons.push(`✗ Dates are far apart (${calculateDaysDifference(lostItem.date, foundItem.date)} days), reducing confidence.`);
  }

  return { score, reasons };
}

/**
 * Calculate text similarity (0-1)
 * Uses word-by-word comparison and substring matching
 */
function calculateTextSimilarity(text1, text2) {
  if (!text1 || !text2) return 0;

  const str1 = normalizeText(text1);
  const str2 = normalizeText(text2);

  if (!str1 || !str2) return 0;

  // Exact match
  if (str1 === str2) return 1;

  // One contains the other
  if (str1.includes(str2) || str2.includes(str1)) return 0.8;

  // Word overlap
  const words1 = new Set(str1.split(/\s+/));
  const words2 = new Set(str2.split(/\s+/));

  const commonWords = [...words1].filter((word) => words2.has(word)).length;
  const allWords = new Set([...words1, ...words2]).size;

  const overlapRatio = allWords === 0 ? 0 : commonWords / allWords;

  return overlapRatio;
}

/**
 * Calculate keyword overlap (0-1)
 * Ignores small words, focuses on meaningful terms
 */
function calculateKeywordOverlap(text1, text2) {
  if (!text1 || !text2) return 0;

  const keywords1 = extractKeywords(text1);
  const keywords2 = extractKeywords(text2);

  if (keywords1.length === 0 || keywords2.length === 0) return 0;

  const set1 = new Set(keywords1);
  const set2 = new Set(keywords2);

  const commonKeywords = [...set1].filter((k) => set2.has(k)).length;
  const allKeywords = new Set([...keywords1, ...keywords2]).size;

  const overlapRatio = allKeywords === 0 ? 0 : commonKeywords / allKeywords;

  return overlapRatio;
}

/**
 * Calculate date proximity (0-1)
 * Returns 1 for same day, decreases as days apart increase
 */
function calculateDateProximity(date1, date2) {
  if (!date1 || !date2) return 0.1;

  const d1 = new Date(date1);
  const d2 = new Date(date2);

  if (isNaN(d1.getTime()) || isNaN(d2.getTime())) return 0.1;

  const daysDifference = Math.abs((d2 - d1) / (1000 * 60 * 60 * 24));

  // Maximum gap considered: 90 days
  const maxGap = 90;

  const proximity = Math.max(0, 1 - daysDifference / maxGap);

  return proximity;
}

/**
 * Helper functions for matching algorithm
 */

function normalizeText(text) {
  return String(text || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function extractKeywords(text) {
  return normalizeText(text)
    .split(/\s+/)
    .filter((word) => word.length > 2); // Only words longer than 2 chars
}

function calculateDaysDifference(date1, date2) {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const daysDiff = Math.abs((d2 - d1) / (1000 * 60 * 60 * 24));
  return Math.round(daysDiff);
}

// ============================================
// Matches Rendering
// ============================================

function renderMatches() {
  const matches = calculateAllMatches();

  // Apply filters
  const filteredMatches = applyMatchFilters(matches);

  const container = document.getElementById("matches-container");

  if (filteredMatches.length === 0) {
    container.innerHTML = '<div class="empty-state">No matches found. Report more items to see potential matches!</div>';
    return;
  }

  container.innerHTML = filteredMatches
    .map((match) => createMatchCardHTML(match))
    .join("");

  // Add event listeners
  addCardActionListeners();
}

function applyMatchFilters(matches) {
  const searchTerm = document.getElementById("match-search").value.toLowerCase().trim();
  const categoryFilter = document.getElementById("match-category-filter").value;
  const qualityFilter = document.getElementById("match-quality-filter").value;

  return matches.filter((match) => {
    // Search filter
    if (searchTerm) {
      const searchableText = `${match.lost.itemName} ${match.found.itemName} ${match.lost.category} ${match.found.category}`.toLowerCase();
      if (!searchableText.includes(searchTerm)) return false;
    }

    // Category filter
    if (categoryFilter) {
      if (match.lost.category !== categoryFilter && match.found.category !== categoryFilter) {
        return false;
      }
    }

    // Quality filter
    if (qualityFilter) {
      const quality = getMatchQuality(match.score);
      if (qualityFilter === "high" && quality !== "high") return false;
      if (qualityFilter === "medium" && quality !== "medium") return false;
      if (qualityFilter === "low" && quality !== "low") return false;
    }

    return true;
  });
}

function getMatchQuality(score) {
  if (score >= 70) return "high";
  if (score >= 40) return "medium";
  return "low";
}

function getMatchQualityLabel(score) {
  if (score >= 70) return "High potential match";
  if (score >= 40) return "Possible match";
  return "Low similarity";
}

function clearAllFilters() {
  document.getElementById("match-search").value = "";
  document.getElementById("match-category-filter").value = "";
  document.getElementById("match-quality-filter").value = "";
  renderMatches();
}

function createMatchCardHTML(match) {
  const quality = getMatchQuality(match.score);
  const qualityLabel = getMatchQualityLabel(match.score);
  const qualityBadgeClass = `badge-${quality}`;

  return `
    <div class="match-card">
      <div class="match-header">
        <div class="match-title">${qualityLabel}</div>
        <span class="match-badge ${qualityBadgeClass}">${qualityLabel}</span>
      </div>

      <div class="match-score">
        🎯 Match Score: <strong>${match.score}%</strong>
      </div>

      <div class="match-grid">
        <div class="match-panel">
          <h4>Lost Item</h4>
          <p><strong>Name:</strong> ${escapeHTML(match.lost.itemName)}</p>
          <p><strong>Category:</strong> ${escapeHTML(match.lost.category)}</p>
          <p><strong>Colour:</strong> ${escapeHTML(match.lost.colour)}</p>
          <p><strong>Location:</strong> ${escapeHTML(match.lost.location)}</p>
          <p><strong>Date:</strong> ${formatDate(match.lost.date)}</p>
        </div>

        <div class="match-panel">
          <h4>Found Item</h4>
          <p><strong>Name:</strong> ${escapeHTML(match.found.itemName)}</p>
          <p><strong>Category:</strong> ${escapeHTML(match.found.category)}</p>
          <p><strong>Colour:</strong> ${escapeHTML(match.found.colour)}</p>
          <p><strong>Location:</strong> ${escapeHTML(match.found.location)}</p>
          <p><strong>Date:</strong> ${formatDate(match.found.date)}</p>
        </div>
      </div>

      <div class="reasons-box">
        <h5>Why this match was suggested:</h5>
        <ul>
          ${match.reasons.map((reason) => `<li>${escapeHTML(reason)}</li>`).join("")}
        </ul>
      </div>

      <div class="match-actions">
        <button class="btn btn-primary" data-action="view-match" data-item-id="${match.id}">View Full Details</button>
      </div>
    </div>
  `;
}

// ============================================
// My Reports Rendering
// ============================================

function renderMyReports() {
  const allItems = [...appState.lostItems, ...appState.foundItems]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  // Filter by tab
  let filteredItems = allItems;
  if (appState.currentFilterTab === "lost") {
    filteredItems = allItems.filter((item) => item.type === "lost");
  } else if (appState.currentFilterTab === "found") {
    filteredItems = allItems.filter((item) => item.type === "found");
  } else if (appState.currentFilterTab === "recovered") {
    filteredItems = allItems.filter((item) => item.status === "recovered");
  }

  const container = document.getElementById("reports-container");

  if (filteredItems.length === 0) {
    container.innerHTML = '<div class="empty-state">No reports match your current filter.</div>';
    return;
  }

  container.innerHTML = filteredItems
    .map((item) => createMyReportCardHTML(item))
    .join("");

  // Add event listeners
  addCardActionListeners();
}

function createMyReportCardHTML(item) {
  const typeClass = item.type === "lost" ? "badge-lost" : "badge-found";
  const typeText = item.type === "lost" ? "Lost" : "Found";
  const statusClass = item.status === "recovered" ? "badge-recovered" : "badge-active";
  const statusText = item.status === "recovered" ? "Recovered" : "Active";

  return `
    <div class="item-card">
      <div class="item-card-header">
        <span class="badge ${typeClass}">${typeText}</span>
        <span class="badge ${statusClass}">${statusText}</span>
      </div>
      <div class="item-card-body">
        <h3>${escapeHTML(item.itemName)}</h3>
        <div class="item-meta">
          <span>📁 ${escapeHTML(item.category)}</span>
          <span>🎨 ${escapeHTML(item.colour)}</span>
          <span>📍 ${escapeHTML(item.location)}</span>
        </div>
        <p>${escapeHTML(truncateText(item.description, 120))}</p>
      </div>
      <div class="item-card-footer">
        <span>${formatDate(item.date)}</span>
        <div class="card-actions">
          <button class="action-btn action-view" data-action="view" data-item-id="${item.id}">View</button>
          <button class="action-btn action-edit" data-action="edit" data-item-id="${item.id}">Edit</button>
          <button class="action-btn action-delete" data-action="delete" data-item-id="${item.id}">Delete</button>
          <button class="action-btn action-recover" data-action="toggle-status" data-item-id="${item.id}">
            ${item.status === "recovered" ? "Mark Active" : "Mark Recovered"}
          </button>
        </div>
      </div>
    </div>
  `;
}

// ============================================
// Card Action Handling
// ============================================

function addCardActionListeners() {
  document.querySelectorAll("[data-action]").forEach((btn) => {
    btn.removeEventListener("click", handleCardActionClick);
    btn.addEventListener("click", handleCardActionClick);
  });
}

function handleCardActionClick(e) {
  e.preventDefault();
  const action = this.dataset.action;
  const itemId = this.dataset.itemId;

  if (action === "view") {
    viewItemDetails(itemId);
  } else if (action === "edit") {
    editItem(itemId);
  } else if (action === "delete") {
    deleteItem(itemId);
  } else if (action === "toggle-status") {
    toggleItemStatus(itemId);
  } else if (action === "view-match") {
    viewMatchDetails(itemId);
  }
}

function handleCardActions(e) {
  const btn = e.target.closest("[data-action]");
  if (btn) {
    const action = btn.dataset.action;
    const itemId = btn.dataset.itemId;

    if (action === "view") {
      viewItemDetails(itemId);
    } else if (action === "edit") {
      editItem(itemId);
    } else if (action === "delete") {
      deleteItem(itemId);
    } else if (action === "toggle-status") {
      toggleItemStatus(itemId);
    } else if (action === "view-match") {
      viewMatchDetails(itemId);
    }
  }
}

// ============================================
// Modal Actions
// ============================================

function viewItemDetails(itemId) {
  const item = findItemById(itemId);
  if (!item) return;

  const modal = document.getElementById("report-modal");
  const body = document.getElementById("report-modal-body");

  const typeText = item.type === "lost" ? "Lost Item" : "Found Item";
  const statusText = item.status === "recovered" ? "Recovered / Returned" : "Active";
  const contactInfo = item.showContact && item.contact ? escapeHTML(item.contact) : "Contact information is private";

  let imageHTML = "";
  if (item.image) {
    imageHTML = `<div class="modal-section"><img src="${item.image}" alt="Item image" style="width: 100%; max-height: 300px; border-radius: 12px;"></div>`;
  }

  body.innerHTML = `
    <div class="modal-section">
      <h2>${escapeHTML(item.itemName)}</h2>
      <p style="margin: 10px 0 0;">
        <span class="badge badge-${item.type}">${typeText}</span>
        <span class="badge badge-${item.status === "recovered" ? "recovered" : "active"}" style="margin-left: 8px;">${statusText}</span>
      </p>
    </div>

    ${imageHTML}

    <div class="detail-grid modal-section">
      <div class="detail-item">
        <strong>Category</strong>
        <span>${escapeHTML(item.category)}</span>
      </div>
      <div class="detail-item">
        <strong>Colour</strong>
        <span>${escapeHTML(item.colour)}</span>
      </div>
      <div class="detail-item">
        <strong>Location</strong>
        <span>${escapeHTML(item.location)}</span>
      </div>
      <div class="detail-item">
        <strong>Date</strong>
        <span>${formatDate(item.date)}</span>
      </div>
      <div class="detail-item">
        <strong>Contact</strong>
        <span>${contactInfo}</span>
      </div>
      <div class="detail-item">
        <strong>Status</strong>
        <span>${statusText}</span>
      </div>
    </div>

    <div class="modal-section">
      <div class="detail-item">
        <strong>Description</strong>
        <span>${escapeHTML(item.description)}</span>
      </div>
    </div>
  `;

  openModal("report-modal");
}

function editItem(itemId) {
  const item = findItemById(itemId);
  if (!item) return;

  const modal = document.getElementById("report-modal");
  const body = document.getElementById("report-modal-body");

  body.innerHTML = `
    <form id="edit-form" class="item-form">
      <div class="form-row">
        <div class="form-group">
          <label for="edit-itemName">Item Name</label>
          <input id="edit-itemName" name="itemName" value="${escapeAttribute(item.itemName)}" />
        </div>
        <div class="form-group">
          <label for="edit-category">Category</label>
          <select id="edit-category" name="category">
            ${createCategoryOptions(item.category)}
          </select>
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label for="edit-colour">Colour</label>
          <input id="edit-colour" name="colour" value="${escapeAttribute(item.colour)}" />
        </div>
        <div class="form-group">
          <label for="edit-location">Location</label>
          <input id="edit-location" name="location" value="${escapeAttribute(item.location)}" />
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label for="edit-date">Date</label>
          <input id="edit-date" name="date" type="date" value="${item.date}" />
        </div>
        <div class="form-group"></div>
      </div>

      <div class="form-group full-width">
        <label for="edit-description">Description</label>
        <textarea id="edit-description" name="description" rows="4">${escapeHTML(item.description)}</textarea>
      </div>

      <div class="form-group full-width">
        <label for="edit-contact">Contact</label>
        <input id="edit-contact" name="contact" value="${escapeAttribute(item.contact)}" />
      </div>

      <div class="form-row" style="gap: 12px; margin-top: 18px;">
        <button type="button" class="btn btn-secondary" onclick="closeModal('report-modal')">Cancel</button>
        <button type="submit" class="btn btn-primary">Save Changes</button>
      </div>
    </form>
  `;

  document.getElementById("edit-form").addEventListener("submit", (e) => {
    e.preventDefault();
    saveEditedItem(itemId);
  });

  openModal("report-modal");
}

function saveEditedItem(itemId) {
  const item = findItemById(itemId);
  if (!item) return;

  const form = document.getElementById("edit-form");
  const formData = new FormData(form);

  item.itemName = formData.get("itemName").trim();
  item.category = formData.get("category").trim();
  item.colour = formData.get("colour").trim();
  item.description = formData.get("description").trim();
  item.location = formData.get("location").trim();
  item.date = formData.get("date");
  item.contact = formData.get("contact").trim();

  saveDataToStorage();
  renderMyReports();
  renderDashboard();
  renderMatches();
  closeModal("report-modal");
  showToast("✅ Report updated successfully!");
}

function deleteItem(itemId) {
  if (!confirm("Are you sure you want to delete this report? This action cannot be undone.")) {
    return;
  }

  const index = appState.lostItems.findIndex((item) => item.id === itemId);
  if (index !== -1) {
    appState.lostItems.splice(index, 1);
  }

  const foundIndex = appState.foundItems.findIndex((item) => item.id === itemId);
  if (foundIndex !== -1) {
    appState.foundItems.splice(foundIndex, 1);
  }

  saveDataToStorage();
  renderMyReports();
  renderDashboard();
  renderMatches();
  showToast("✅ Report deleted successfully!");
}

function toggleItemStatus(itemId) {
  const item = findItemById(itemId);
  if (!item) return;

  item.status = item.status === "recovered" ? "active" : "recovered";

  saveDataToStorage();
  renderMyReports();
  renderDashboard();
  renderMatches();
  showToast(`✅ Report marked as ${item.status === "recovered" ? "recovered" : "active"}.`);
}

function viewMatchDetails(matchId) {
  const matches = calculateAllMatches();
  const match = matches.find((m) => m.id === matchId);

  if (!match) return;

  const modal = document.getElementById("match-modal");
  const body = document.getElementById("match-modal-body");

  const quality = getMatchQuality(match.score);
  const qualityLabel = getMatchQualityLabel(match.score);

  body.innerHTML = `
    <div class="modal-section">
      <h2>${qualityLabel}</h2>
      <div class="match-score">🎯 Match Score: <strong>${match.score}%</strong></div>
    </div>

    <div class="match-grid modal-section">
      <div class="match-panel">
        <h4>Lost Item</h4>
        <p><strong>Name:</strong> ${escapeHTML(match.lost.itemName)}</p>
        <p><strong>Category:</strong> ${escapeHTML(match.lost.category)}</p>
        <p><strong>Colour:</strong> ${escapeHTML(match.lost.colour)}</p>
        <p><strong>Location:</strong> ${escapeHTML(match.lost.location)}</p>
        <p><strong>Date:</strong> ${formatDate(match.lost.date)}</p>
        <p><strong>Description:</strong> ${escapeHTML(match.lost.description)}</p>
        ${match.lost.image ? `<img src="${match.lost.image}" alt="Lost item" style="width: 100%; max-height: 200px; border-radius: 8px; margin-top: 10px;">` : ""}
      </div>

      <div class="match-panel">
        <h4>Found Item</h4>
        <p><strong>Name:</strong> ${escapeHTML(match.found.itemName)}</p>
        <p><strong>Category:</strong> ${escapeHTML(match.found.category)}</p>
        <p><strong>Colour:</strong> ${escapeHTML(match.found.colour)}</p>
        <p><strong>Location:</strong> ${escapeHTML(match.found.location)}</p>
        <p><strong>Date:</strong> ${formatDate(match.found.date)}</p>
        <p><strong>Description:</strong> ${escapeHTML(match.found.description)}</p>
        ${match.found.image ? `<img src="${match.found.image}" alt="Found item" style="width: 100%; max-height: 200px; border-radius: 8px; margin-top: 10px;">` : ""}
      </div>
    </div>

    <div class="reasons-box modal-section">
      <h5>Match Details and Reasoning:</h5>
      <ul>
        ${match.reasons.map((reason) => `<li>${escapeHTML(reason)}</li>`).join("")}
      </ul>
    </div>
  `;

  openModal("match-modal");
}

function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove("hidden");
  }
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add("hidden");
  }
}

// ============================================
// Sample Data
// ============================================

function loadSampleData() {
  const sampleLost = [
    {
      id: "lost-sample-1",
      type: "lost",
      itemName: "Blue Backpack",
      category: "Bag",
      colour: "Blue with black straps",
      description: "Blue backpack with a small yellow sticker on the front pocket and a broken zipper.",
      location: "Main Library, Reading Room",
      date: "2024-10-05",
      contact: "student1@example.com",
      showContact: true,
      status: "active",
      image: "",
      createdAt: "2024-10-05T10:00:00Z"
    },
    {
      id: "lost-sample-2",
      type: "lost",
      itemName: "Black Leather Wallet",
      category: "Wallet",
      colour: "Black leather with red stitching",
      description: "Black leather wallet containing ID card, credit cards. Has initials 'AB' on the inside.",
      location: "Student Center Cafeteria",
      date: "2024-10-06",
      contact: "student2@example.com",
      showContact: true,
      status: "active",
      image: "",
      createdAt: "2024-10-06T12:30:00Z"
    },
    {
      id: "lost-sample-3",
      type: "lost",
      itemName: "Silver Water Bottle",
      category: "Accessories",
      colour: "Silver with blue lid",
      description: "Stainless steel water bottle with a blue cap. Has a small dent on the bottom.",
      location: "Sports Hall, Gym Area",
      date: "2024-10-07",
      contact: "athlete@example.com",
      showContact: true,
      status: "active",
      image: "",
      createdAt: "2024-10-07T15:45:00Z"
    },
    {
      id: "lost-sample-4",
      type: "lost",
      itemName: "Red Keychain",
      category: "Keys",
      colour: "Red plastic with compass",
      description: "Small red keychain with a tiny compass charm and a blue string loop attached.",
      location: "Campus Bus Stop",
      date: "2024-10-04",
      contact: "student3@example.com",
      showContact: true,
      status: "active",
      image: "",
      createdAt: "2024-10-04T08:20:00Z"
    },
    {
      id: "lost-sample-5",
      type: "lost",
      itemName: "White Earbuds Case",
      category: "Electronics",
      colour: "White with black interior",
      description: "White charging case for true wireless earbuds with black soft lining and small scratches.",
      location: "Computer Lab, Desk 4",
      date: "2024-10-08",
      contact: "gamer@example.com",
      showContact: false,
      status: "active",
      image: "",
      createdAt: "2024-10-08T14:10:00Z"
    }
  ];

  const sampleFound = [
    {
      id: "found-sample-1",
      type: "found",
      itemName: "Blue Backpack",
      category: "Bag",
      colour: "Blue with black straps",
      description: "Blue backpack found on a chair in the library reading room with a yellow sticker on front pocket.",
      location: "Main Library, Reading Room",
      date: "2024-10-05",
      contact: "librarian@example.com",
      showContact: false,
      status: "active",
      image: "",
      createdAt: "2024-10-05T17:00:00Z"
    },
    {
      id: "found-sample-2",
      type: "found",
      itemName: "Black Wallet",
      category: "Wallet",
      colour: "Black leather with red stitching",
      description: "Black leather wallet found near the cafeteria counter with several cards inside.",
      location: "Student Center Cafeteria",
      date: "2024-10-06",
      contact: "cafeworker@example.com",
      showContact: false,
      status: "active",
      image: "",
      createdAt: "2024-10-06T13:15:00Z"
    },
    {
      id: "found-sample-3",
      type: "found",
      itemName: "Silver Water Bottle",
      category: "Accessories",
      colour: "Silver with blue lid",
      description: "Silver water bottle with blue cap found on the gym floor near the lockers.",
      location: "Sports Hall, Gym Area",
      date: "2024-10-07",
      contact: "gymstaff@example.com",
      showContact: false,
      status: "active",
      image: "",
      createdAt: "2024-10-07T16:30:00Z"
    },
    {
      id: "found-sample-4",
      type: "found",
      itemName: "Red Keychain with Compass",
      category: "Keys",
      colour: "Red with blue string",
      description: "Red keychain found in the bus shelter with a compass charm attached.",
      location: "Campus Bus Stop",
      date: "2024-10-04",
      contact: "bussecurity@example.com",
      showContact: false,
      status: "active",
      image: "",
      createdAt: "2024-10-04T09:45:00Z"
    },
    {
      id: "found-sample-5",
      type: "found",
      itemName: "White Earbuds Charging Case",
      category: "Electronics",
      colour: "White case with black interior",
      description: "White wireless earbuds charging case found on a desk in the computer lab.",
      location: "Computer Lab, Desk 4",
      date: "2024-10-08",
      contact: "itdesk@example.com",
      showContact: false,
      status: "active",
      image: "",
      createdAt: "2024-10-08T15:20:00Z"
    }
  ];

  appState.lostItems = sampleLost;
  appState.foundItems = sampleFound;

  saveDataToStorage();
  renderDashboard();
  renderMatches();
  renderMyReports();
  showToast("✅ Sample data loaded successfully!");
  showSection("dashboard");
}

// ============================================
// Data Management
// ============================================

function saveDataToStorage() {
  const data = {
    lostItems: appState.lostItems,
    foundItems: appState.foundItems
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function loadDataFromStorage() {
  const data = localStorage.getItem(STORAGE_KEY);
  if (data) {
    try {
      const parsed = JSON.parse(data);
      appState.lostItems = parsed.lostItems || [];
      appState.foundItems = parsed.foundItems || [];
    } catch (error) {
      console.error("Error loading data from storage:", error);
    }
  }
}

function resetAllData() {
  if (!confirm("Are you sure you want to reset all data? This cannot be undone.")) {
    return;
  }

  localStorage.removeItem(STORAGE_KEY);
  appState.lostItems = [];
  appState.foundItems = [];

  renderDashboard();
  renderMatches();
  renderMyReports();

  showToast("✅ All data has been reset.");
  showSection("dashboard");
}

function findItemById(itemId) {
  const found = appState.lostItems.find((item) => item.id === itemId);
  if (found) return found;

  return appState.foundItems.find((item) => item.id === itemId);
}

// ============================================
// Utility Functions
// ============================================

function escapeHTML(text) {
  if (!text) return "";
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function escapeAttribute(text) {
  if (!text) return "";
  return text.replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

function truncateText(text, maxLength) {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
}

function formatDate(dateString) {
  if (!dateString) return "Unknown";

  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;

  const options = { year: "numeric", month: "short", day: "numeric" };
  return date.toLocaleDateString(undefined, options);
}

function generateUniqueId() {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

function createCategoryOptions(selected) {
  const categories = [
    "Bag",
    "Wallet",
    "Keys",
    "Electronics",
    "Accessories",
    "Clothing",
    "Jewelry",
    "Shoes",
    "Sports Equipment",
    "Other"
  ];

  return categories
    .map((cat) => `<option value="${cat}" ${cat === selected ? "selected" : ""}>${cat}</option>`)
    .join("");
}

function showToast(message) {
  const toast = document.getElementById("toast-notification");
  toast.textContent = message;
  toast.classList.remove("hidden");

  setTimeout(() => {
    toast.classList.add("hidden");
  }, 3500);
}
