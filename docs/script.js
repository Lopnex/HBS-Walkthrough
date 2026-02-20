document.addEventListener("DOMContentLoaded", () => {
  // ====== BASIC HOOKS ======
  const navList = document.getElementById("navList");
  const navItems = Array.from(navList.querySelectorAll(".nav-item"));
  const navLinks = Array.from(navList.querySelectorAll(".nav-link[data-section]"));
  const sections = Array.from(document.querySelectorAll(".content-section"));
  const manageHiddenLinks = Array.from(document.querySelectorAll(".manage-hidden-link"));
  const hiddenList = document.getElementById("hiddenList");

  // Manually-hidden sections (from "Hide"/"Unhide")
  const hiddenSections = new Set();

  // Tracks where user came from so Back returns there (not Info)
  let lastSectionId = "info";

  let lastNavClickedId = "info";

  // ====== FILTER CONFIG ======

  // Current storylines list
  const currentStorylineIds = new Set([
    "main-story",
    "side-quests",
    "adel-reynolds",
    "gemma-rey",
    "christine-samson",
    "marie-prescott",
    "marcy-trevean",
    "rosie-stevens",
    "regan-collins",
    "lana-goodman",
    "amber-johnson",
    "marley-dewitt",
    "bethany-benson",
    "frank",
    "ella-norton",
    "abigail-coney",
    "claire-bosworth",
    "lola-johnson",
    "amy-bronson",
    "stacey-price",
    "loretta-hobson",
    "julie-compton",
    "steve-randall",
    "molly-simmons",
    "margot-simmons",
    "marion-ravenwood",
    "leia-littleton",
    "tania-abrahms",
    "polly-mathers",
    "shelley-bruce",
    "connor-gilding",
    "greg-hutchins",
    "yua-mita",
    "tilly-reynolds",
    "jessica-martin",
    "frankie-durham",
    "louise-sampson",
    "jack-romer",
    "jill-romer",
    "nigel-cunningham",
    "dr-jones",
    "lucas-channing",
    "lucy-channing",
    "mika-colton",
    "bruce-kreiger"
  ]);

  // IDs that should always stay in nav even when Current Storylines filter is on
  const alwaysShowIds = new Set(["main-story", "side-quests"]);

  // Pregnancy highlight IDs (pink)
  const pregnancyIds = new Set([
    "adel-reynolds",
    "gemma-rey",
    "christine-samson",
    "marcy-trevean",
    "lillie-michaels",
    "tilly-reynolds",
    "claire-bosworth"
  ]);

  // NTR highlight IDs (red)
  const ntrRedIds = new Set([
    "adel-reynolds",
    "christine-samson",
    "gemma-rey",
    "lillie-michaels",
    "marcy-trevean",
    "rosie-stevens",
    "marie-prescott",
    "regan-collins",
    "tania-abrahms",
    "amber-johnson",
    "abigail-coney",
    "claire-bosworth",
    "leia-littleton",
    "polly-mathers",
    "shelley-bruce",
    "tilly-reynolds",
    "jessica-martin",
    "jill-romer",
    "nigel-cunningham",
    "lucas-channing",
    "steve-randall",
    "frank",
    "dr-jones",
    "jack-romer",
    "connor-gilding",
    "bruce-kreiger"
  ]);

  // NEW content IDs (green) per version (left nav name color)
  const newIds061 = new Set(["main-story", "ella-norton", "tilly-reynolds"]);
  const newIds062 = new Set(["main-story"]); // fill later
  const newIds063 = new Set(["main-story"]); // fill later

  // Paths — go into "Paths" header when NTR is active
  const pathIds = ["dr-jones", "frank", "lucas-channing", "nigel-cunningham"];

  // Save original positions for path items
  const originalPositions = new Map();
  pathIds.forEach((id) => {
    const item = document.querySelector('.nav-item[data-section="' + id + '"]');
    if (item) {
      originalPositions.set(id, {
        parent: item.parentNode,
        nextSibling: item.nextElementSibling
      });
    }
  });

  // When Current filter is on, manual "unhide" can override filter until filter clicked again
  const currentOverrides = new Set();
  let currentFilterOn = false;

  // ====== SECTION SWITCHING ======
  function showSection(id) {
    sections.forEach((sec) => {
      sec.classList.toggle("visible", sec.id === id);
    });
  }

  function getCurrentVisibleSectionId() {
    const currentVisible = sections.find((s) => s.classList.contains("visible"));
    return currentVisible?.id || "info";
  }

  function setActiveNav(id) {
    navLinks.forEach((link) => {
      const sec = link.getAttribute("data-section");
      link.classList.toggle("active", sec === id);
    });
  }

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function alignNavTo(sectionId, block = "center") {
    const navBtn = navList.querySelector('.nav-link[data-section="' + sectionId + '"]');
    if (navBtn) navBtn.scrollIntoView({ block, inline: "nearest", behavior: "smooth" });
  }


  // Clicking LEFT NAV names
  navLinks.forEach((link) => {
    // Prevent the browser from auto-scrolling the left sidebar to the focused link
    // (Chrome can scroll overflow containers on focus/click to keep the target visible)
    link.addEventListener("mousedown", (e) => e.preventDefault());

    link.addEventListener("click", (e) => {
      e.preventDefault();

      // Capture current sidebar scroll position so clicking a name NEVER repositions the left list.
      // (Some browsers will scroll overflow containers to keep a clicked/focused element visible.)
      const sidebarEl = document.getElementById("sidebar");
      const sidebarScrollTop = sidebarEl ? sidebarEl.scrollTop : 0;
      const navScrollTop = navList ? navList.scrollTop : 0;

      const sectionId = link.getAttribute("data-section");
      if (!sectionId) return;

      // Track the last nav title you clicked so Back can re-center on it
      lastNavClickedId = sectionId;

      // Ignore clicks on manually hidden sections
      if (hiddenSections.has(sectionId)) return;

      // Save where we came from for Back (used mainly for Manage Hidden)
      const currentId = getCurrentVisibleSectionId();
      if (currentId && currentId !== sectionId) lastSectionId = currentId;

      showSection(sectionId);
      setActiveNav(sectionId);

      // ✅ Clicking a name should ONLY take you to the top of the page
      scrollToTop();

      // Restore sidebar scroll immediately after the click so the left list doesn't "jump"
      // (double rAF is the most reliable way to win the race vs. native scroll-into-view behaviors)
      requestAnimationFrame(() => {
        if (sidebarEl) sidebarEl.scrollTop = sidebarScrollTop;
        if (navList) navList.scrollTop = navScrollTop;
        requestAnimationFrame(() => {
          if (sidebarEl) sidebarEl.scrollTop = sidebarScrollTop;
          if (navList) navList.scrollTop = navScrollTop;
        });
      });
    });
  });

  // Manage Hidden link (right sidebar) -> open Manage Hidden
  manageHiddenLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();

      const currentId = getCurrentVisibleSectionId();
      if (currentId && currentId !== "hiddenManager") lastSectionId = currentId;

      showSection("hiddenManager");
      setActiveNav(null);
      scrollToTop();
    });
  });

  // ====== MANAGE HIDDEN SECTIONS ======
  function getNavItem(sectionId) {
    return navList.querySelector('.nav-item[data-section="' + sectionId + '"]');
  }

  function getNavTitle(sectionId) {
    const item = getNavItem(sectionId);
    if (!item) return sectionId;
    const btn = item.querySelector(".nav-link");
    return btn ? btn.textContent.trim() : sectionId;
  }

  function removeHiddenRow(sectionId) {
    if (!hiddenList) return;
    const row = hiddenList.querySelector('li[data-section="' + sectionId + '"]');
    if (row) hiddenList.removeChild(row);
  }

  function addHiddenRow(sectionId) {
    if (!hiddenList) return;
    if (hiddenList.querySelector('li[data-section="' + sectionId + '"]')) return;

    const li = document.createElement("li");
    li.dataset.section = sectionId;

    const span = document.createElement("span");
    span.textContent = getNavTitle(sectionId);

    const btn = document.createElement("button");
    btn.textContent = "Unhide";
    btn.addEventListener("click", () => unhideSection(sectionId, true));

    li.appendChild(span);
    li.appendChild(btn);
    hiddenList.appendChild(li);
  }

  function applyCurrentFilter() {
    navItems.forEach((li) => {
      const id = li.dataset.section;

      // Headers have no data-section, always show
      if (!id) {
        li.style.display = "";
        return;
      }

      // Manual hide always wins
      if (hiddenSections.has(id)) {
        li.style.display = "none";
        return;
      }

      // FILTER OFF -> restore all (except manually hidden)
      if (!currentFilterOn) {
        li.style.display = "";
        removeHiddenRow(id);
        currentOverrides.delete(id);
        return;
      }

      // FILTER ON
      const shouldShow =
        alwaysShowIds.has(id) ||
        currentStorylineIds.has(id) ||
        currentOverrides.has(id);

      if (shouldShow) {
        li.style.display = "";
        removeHiddenRow(id);
      } else {
        li.style.display = "none";
        addHiddenRow(id);
      }
    });
  }

  function hideSection(sectionId) {
    const item = getNavItem(sectionId);
    if (item) item.style.display = "none";

    hiddenSections.add(sectionId);
    currentOverrides.delete(sectionId);
    addHiddenRow(sectionId);

    const btn = document.querySelector(
      '.hide-section-btn[data-section="' + sectionId + '"]'
    );
    if (btn) btn.textContent = "Unhide";
  }

  function unhideSection(sectionId, fromManager = false) {
    hiddenSections.delete(sectionId);

    const item = getNavItem(sectionId);
    if (item) item.style.display = "";

    removeHiddenRow(sectionId);

    const btn = document.querySelector(
      '.hide-section-btn[data-section="' + sectionId + '"]'
    );
    if (btn) btn.textContent = "Hide";

    // If Current filter is ON, unhide becomes an override for non-current items
    if (currentFilterOn && !currentStorylineIds.has(sectionId)) {
      currentOverrides.add(sectionId);
    }

    applyCurrentFilter();
  }

  // Hook up Hide/Unhide buttons in each section
  const hideButtons = Array.from(
    document.querySelectorAll(".hide-section-btn[data-section]")
  );

  hideButtons.forEach((btn) => {
    const sectionId = btn.getAttribute("data-section");
    btn.addEventListener("click", () => {
      if (hiddenSections.has(sectionId)) unhideSection(sectionId, false);
      else hideSection(sectionId);
    });
  });

  // ====== HIGHLIGHT / FILTER BUTTONS (RIGHT SIDEBAR) ======
  const new063Btn = document.querySelector('.highlight-option[data-highlight="new-063"]');
  const new062Btn = document.querySelector('.highlight-option[data-highlight="new-062"]');
  const new061Btn = document.querySelector('.highlight-option[data-highlight="new-061"]');

  const currentBtn = document.querySelector('.highlight-option[data-highlight="current"]');
  const pregBtn = document.querySelector('.highlight-option[data-highlight="pregnancy"]');
  const ntrBtn = document.querySelector('.highlight-option[data-highlight="ntr"]');

  function clearNewHighlights() {
    document.body.classList.remove("v0610-new-active", "v0620-new-active", "v0630-new-active");
    document.querySelectorAll(".highlight-option-new").forEach((b) => b.classList.remove("active"));
  }

  function getActiveNewBtn() {
    if (new063Btn?.classList.contains("active")) return new063Btn;
    if (new062Btn?.classList.contains("active")) return new062Btn;
    if (new061Btn?.classList.contains("active")) return new061Btn;
    return null;
  }

  function getActiveNewSet() {
    const btn = getActiveNewBtn();
    if (btn === new063Btn) return newIds063;
    if (btn === new062Btn) return newIds062;
    if (btn === new061Btn) return newIds061;
    return null;
  }

  // Cache colors from buttons
  let ntrTextColor = null;
  function getNtrTextColor() {
    if (!ntrTextColor && ntrBtn) {
      const styles = window.getComputedStyle(ntrBtn);
      ntrTextColor = styles.color || "#cc0000";
    }
    return ntrTextColor || "#cc0000";
  }

  let newTextColor = null;
  function getNewTextColor() {
    const btn = getActiveNewBtn() || new063Btn || new062Btn || new061Btn;
    if (!newTextColor && btn) {
      const styles = window.getComputedStyle(btn);
      newTextColor = styles.color || "#3bd97a";
    }
    return newTextColor || "#3bd97a";
  }

  // Apply Paths header when NTR is active
  function activatePaths() {
    const mainCharactersHeader = document.querySelector(".main-characters-header");
    if (!mainCharactersHeader) return;

    let pathsHeader = document.querySelector(".paths-header");
    if (!pathsHeader) {
      pathsHeader = document.createElement("div");
      pathsHeader.className = "nav-header paths-header";
      pathsHeader.textContent = "Paths";
      navList.insertBefore(pathsHeader, mainCharactersHeader);
    }

    const items = [];
    pathIds.forEach((id) => {
      const item = document.querySelector('.nav-item[data-section="' + id + '"]');
      if (item) items.push(item);
    });

    items.sort((a, b) => {
      const ta = a.querySelector(".nav-link")?.textContent.trim() || "";
      const tb = b.querySelector(".nav-link")?.textContent.trim() || "";
      return ta.localeCompare(tb);
    });

    items.forEach((item) => navList.insertBefore(item, mainCharactersHeader));
  }

  function deactivatePaths() {
    pathIds.forEach((id) => {
      const info = originalPositions.get(id);
      const item = document.querySelector('.nav-item[data-section="' + id + '"]');
      if (!info || !item) return;

      const { parent, nextSibling } = info;
      if (nextSibling && nextSibling.parentNode === parent) {
        parent.insertBefore(item, nextSibling);
      } else {
        parent.appendChild(item);
      }
    });

    const pathsHeader = document.querySelector(".paths-header");
    if (pathsHeader) pathsHeader.remove();
  }

  function activateNew(btn, bodyClass) {
    const isAlreadyActive = document.body.classList.contains(bodyClass);

    // Toggle off
    if (isAlreadyActive) {
      clearNewHighlights();
      updateNavColors();
      return;
    }

    // Toggle on this version
    clearNewHighlights();
    document.body.classList.add(bodyClass);
    btn.classList.add("active");

    // ✅ Old behavior: New forces Current Storylines ON + applies filter
    if (currentBtn && !currentBtn.classList.contains("active")) {
      currentBtn.classList.add("active");
    }
    currentFilterOn = true;
    currentOverrides.clear();
    applyCurrentFilter();

    // Highlight is exclusive with Pregnancy and NTR
    if (pregBtn?.classList.contains("active")) pregBtn.classList.remove("active");
    if (ntrBtn?.classList.contains("active")) {
      ntrBtn.classList.remove("active");
      deactivatePaths();
    }

    updateNavColors();
  }

  new063Btn?.addEventListener("click", () => activateNew(new063Btn, "v0630-new-active"));
  new062Btn?.addEventListener("click", () => activateNew(new062Btn, "v0620-new-active"));
  new061Btn?.addEventListener("click", () => activateNew(new061Btn, "v0610-new-active"));

  // Current Storylines toggle
  currentBtn?.addEventListener("click", () => {
    const isActive = currentBtn.classList.contains("active");
    if (isActive) {
      currentBtn.classList.remove("active");
      currentFilterOn = false;
    } else {
      currentBtn.classList.add("active");
      currentFilterOn = true;
    }

    // Clicking Current clears New highlights (New forces Current)
    clearNewHighlights();
    currentOverrides.clear();
    applyCurrentFilter();
    updateNavColors();
  });

  // Pregnancy toggle (can stack with Current + NTR, but clears New)
  pregBtn?.addEventListener("click", () => {
    const isActive = pregBtn.classList.contains("active");
    if (isActive) pregBtn.classList.remove("active");
    else pregBtn.classList.add("active");

    clearNewHighlights();
    updateNavColors();
  });

  // NTR toggle (can stack with Current + Pregnancy, but clears New)
  ntrBtn?.addEventListener("click", () => {
    const isActive = ntrBtn.classList.contains("active");

    if (isActive) {
      ntrBtn.classList.remove("active");
      clearNewHighlights();
      deactivatePaths();
    } else {
      ntrBtn.classList.add("active");
      clearNewHighlights();
      activatePaths();
    }

    // ✅ IMPORTANT: NTR NEVER touches Current Storylines
    updateNavColors();
  });

  // ====== NAV COLOR LOGIC ======
  function updateNavColors() {
    navItems.forEach((navItem) => {
      const secId = navItem.getAttribute("data-section");
      const link = navItem.querySelector(".nav-link");
      if (!link) return;

      if (!link.dataset.baseColorStored) {
        link.dataset.baseColor = link.style.color || "";
        link.dataset.baseColorStored = "1";
      }

      let color = link.dataset.baseColor || "";
      link.classList.remove("ntr-preg-glow");

      const currentOn = currentBtn?.classList.contains("active") && currentStorylineIds.has(secId);
      const pregOn = pregBtn?.classList.contains("active") && pregnancyIds.has(secId);
      const ntrOn = ntrBtn?.classList.contains("active") && ntrRedIds.has(secId);

      const newSet = getActiveNewSet();
      const newOn = !!newSet && newSet.has(secId);

      // Priority: New > Current > Pregnancy > NTR (with special NTR+Preg glow)
      if (newOn) {
        color = getNewTextColor();
      } else {
        if (currentOn) color = "#3bafd9";
        if (pregOn) color = "#ffa3e2";

        if (ntrOn) {
          if (pregOn) {
            link.classList.add("ntr-preg-glow");
          } else {
            color = getNtrTextColor();
          }
        }
      }

      link.style.color = color;
    });
  }

  // ====== BACK BUTTONS ======
  // Back behavior:
  // - If on "Manage Hidden", go back to the last section you came from.
  // - Otherwise, stay on the current section and re-center the left nav to that title (no page scroll).
  const backButtons = Array.from(document.querySelectorAll(".back-btn"));
  backButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const currentId = getCurrentVisibleSectionId();

      // If we're on Manage Hidden, Back should actually return to where we were.
      if (currentId === "hiddenManager") {
        const target = lastSectionId || "info";

        // Update lastSectionId so repeated Back toggles between two sections naturally
        if (currentId && currentId !== target) lastSectionId = currentId;

        showSection(target);
        setActiveNav(target);
        scrollToTop();
        alignNavTo(target);
        return;
      }

      // Normal pages: Back should NOT change pages.
      const target = currentId || lastNavClickedId || "info";
      setActiveNav(target);
      alignNavTo(target);
    });
  });

  // ====== INITIAL PAINT ======
  applyCurrentFilter();
  updateNavColors();
});
