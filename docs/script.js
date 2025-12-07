document.addEventListener("DOMContentLoaded", () => {
  const sections = Array.from(
    document.querySelectorAll(".walkthrough-section")
  );
  const sectionList = document.getElementById("sectionList");
  const hiddenList = document.getElementById("hiddenList");

  // Load hidden sections from localStorage
  const hiddenFromStorage = JSON.parse(
    localStorage.getItem("hiddenSections") || "[]"
  );
  const hiddenSet = new Set(hiddenFromStorage);

  // Build sidebar menu based on sections in the HTML
  sections.forEach((section) => {
    const id = section.id;
    const title =
      section.dataset.title || section.querySelector("h2").textContent;

    // Sidebar link
    const li = document.createElement("li");
    const link = document.createElement("a");
    link.href = "#" + id;
    link.textContent = title;
    link.dataset.sectionId = id;
    li.appendChild(link);
    sectionList.appendChild(li);

    // Hide link if section is hidden
    if (hiddenSet.has(id)) {
      li.style.display = "none";
      addHiddenRow(id, title, hiddenSet);
    }

    // Attach hide button
    const hideBtn = section.querySelector(".hide-section");
    if (hideBtn) {
      hideBtn.addEventListener("click", () => {
        hideSection(id, title, hiddenSet);
      });
    }
  });

  // Smooth scroll & active link highlight
  sectionList.addEventListener("click", (evt) => {
    const link = evt.target.closest("a");
    if (!link) return;

    evt.preventDefault();

    const id = link.dataset.sectionId;
    const target = document.getElementById(id);
    if (!target) return;

    window.scrollTo({
      top: target.offsetTop - 10,
      behavior: "smooth",
    });

    // highlight active link
    sectionList.querySelectorAll("a").forEach((a) => {
      a.classList.toggle("active", a === link);
    });
  });

  function hideSection(id, title, hiddenSet) {
    // Hide from menu
    const link = sectionList.querySelector(`a[data-section-id="${id}"]`);
    if (link && link.parentElement) {
      link.parentElement.style.display = "none";
    }

    hiddenSet.add(id);
    saveHidden(hiddenSet);
    addHiddenRow(id, title, hiddenSet);
  }

  function addHiddenRow(id, title, hiddenSet) {
    // Don't duplicate rows
    if (hiddenList.querySelector(`li[data-section-id="${id}"]`)) return;

    const li = document.createElement("li");
    li.dataset.sectionId = id;
    li.textContent = title;

    const btn = document.createElement("button");
    btn.textContent = "unhide";
    btn.addEventListener("click", () => {
      // show in menu again
      const link = sectionList.querySelector(`a[data-section-id="${id}"]`);
      if (link && link.parentElement) {
        link.parentElement.style.display = "";
      }

      hiddenSet.delete(id);
      saveHidden(hiddenSet);

      // remove row from hidden list
      hiddenList.removeChild(li);
    });

    li.appendChild(btn);
    hiddenList.appendChild(li);
  }

  function saveHidden(hiddenSet) {
    localStorage.setItem("hiddenSections", JSON.stringify([...hiddenSet]));
  }
});
