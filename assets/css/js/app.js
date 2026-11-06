
const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];

/* =========================================
   LOCAL STORAGE
   ========================================= */

const store = {
  get(k) {
    try {
      return JSON.parse(localStorage.getItem(k));
    } catch (e) {
      return null;
    }
  },

  set(k, v) {
    try {
      localStorage.setItem(k, JSON.stringify(v));
    } catch (e) {
      console.warn("Unable to save local data:", e);
    }
  },

  del(k) {
    try {
      localStorage.removeItem(k);
    } catch (e) {
      console.warn("Unable to remove local data:", e);
    }
  }
};

/* =========================================
   PAGE NAVIGATION
   ========================================= */

const views = [
  "home",
  "services",
  "jobs",
  "process",
  "faq",
  "register",
  "dashboard",
  "contact"
];

function route() {
  let h = (location.hash || "#home").slice(1);

  if (!views.includes(h)) {
    h = "home";
  }

  $$(".view").forEach((v) => {
    v.classList.toggle("on", v.id === "v-" + h);
  });

  $$("#nav a").forEach((a) => {
    a.classList.toggle("on", a.getAttribute("href") === "#" + h);
  });

  window.scrollTo(0, 0);

  if (h === "dashboard") {
    dash();
  }
}

window.addEventListener("hashchange", route);

/* =========================================
   JOB LISTINGS
   ========================================= */

const JOBS = [
  {
    id: "RU-0001",
    t: "Construction Site Technician",
    c: "Construction",
    loc: "Moscow",
    sal: 90000,
    dur: "12 months",
    edu: "Technical diploma"
  },
  {
    id: "RU-0002",
    t: "CNC Machine Operator",
    c: "Manufacturing",
    loc: "Kazan",
    sal: 80000,
    dur: "24 months",
    edu: "ITI / Diploma"
  },
  {
    id: "RU-0003",
    t: "Hotel Front Desk Associate",
    c: "Hospitality",
    loc: "Saint Petersburg",
    sal: 65000,
    dur: "12 months",
    edu: "12th pass"
  },
  {
    id: "RU-0004",
    t: "Mechanical Engineer",
    c: "Engineering",
    loc: "Yekaterinburg",
    sal: 140000,
    dur: "24 months",
    edu: "B.E. / B.Tech"
  },
  {
    id: "RU-0005",
    t: "Warehouse Supervisor",
    c: "Logistics",
    loc: "Novosibirsk",
    sal: 75000,
    dur: "12 months",
    edu: "Graduate"
  },
  {
    id: "RU-0006",
    t: "IT Support Technician",
    c: "Technical Support",
    loc: "Moscow",
    sal: 85000,
    dur: "12 months",
    edu: "Diploma / Degree"
  }
];

const saved = new Set(store.get("saved") || []);

const categorySelect = $("#cat");

if (categorySelect) {
  categorySelect.innerHTML += [
    ...new Set(JOBS.map((j) => j.c))
  ]
    .map((c) => `<option value="${c}">${c}</option>`)
    .join("");
}

/* =========================================
   RENDER JOBS
   ========================================= */

function renderJobs() {
  const jobsContainer = $("#jobs");

  if (!jobsContainer) return;

  const q = ($("#q")?.value || "").toLowerCase();
  const c = $("#cat")?.value || "";
  const sort = $("#sort")?.value || "";

  let list = JOBS.filter((j) => {
    const matchesCategory = !c || j.c === c;
    const matchesSearch = (j.t + " " + j.loc)
      .toLowerCase()
      .includes(q);

    return matchesCategory && matchesSearch;
  });

  if (sort === "sal") {
    list.sort((a, b) => b.sal - a.sal);
  }

  jobsContainer.innerHTML = list.map((j) => `
    <div class="card job">

      <div class="top">
        <h3>${j.t}</h3>
        <span class="tag">${j.id}</span>
      </div>

      <div>
        <span class="tag">${j.c}</span>
        <span class="tag">${j.loc}</span>
        <span class="tag">${j.dur}</span>
        <span class="tag ok">Sample – unverified</span>
      </div>

      <p>
        Employer:
        <span class="ph">[Verified Employer Name]</span>
        <br>

        Salary:
        ₽${j.sal.toLocaleString("en-IN")}/month (sample)
        <br>

        Education: ${j.edu}
        <br>

        Recruitment fee:
        <span class="ph">[If applicable]</span>
      </p>

      <div class="tools" style="margin:0">

        <a class="btn sm" href="#register">
          Apply
        </a>

        <button
          class="btn alt sm"
          data-s="${j.id}"
          type="button"
        >
          ${saved.has(j.id) ? "Saved ✓" : "Save job"}
        </button>

      </div>

    </div>
  `).join("") || "<p>No jobs match your search.</p>";
}

/* =========================================
   SAVE JOBS
   ========================================= */

const jobsContainer = $("#jobs");

if (jobsContainer) {
  jobsContainer.addEventListener("click", (e) => {
    const button = e.target.closest("[data-s]");

    if (!button) return;

    const id = button.dataset.s;

    if (saved.has(id)) {
      saved.delete(id);
    } else {
      saved.add(id);
    }

    store.set("saved", [...saved]);

    renderJobs();
  });
}

["q", "cat", "sort"].forEach((id) => {
  const element = $("#" + id);

  if (element) {
    element.addEventListener("input", renderJobs);
    element.addEventListener("change", renderJobs);
  }
});

renderJobs();

/* =========================================
   REGISTRATION FORM DRAFT
   ========================================= */

const fields = $$("[data-d]");

function saveDraft() {
  const data = {};

  fields.forEach((f) => {
    data[f.id] =
      f.type === "checkbox"
        ? f.checked
        : f.value;
  });

  store.set("draft", data);

  const saveMessage = $("#save");

  if (saveMessage) {
    saveMessage.textContent =
      "Draft saved on this device at " +
      new Date().toLocaleTimeString() +
      ".";
  }
}

function loadDraft() {
  const data = store.get("draft");

  if (!data) return;

  fields.forEach((f) => {
    if (f.type === "checkbox") {
      f.checked = !!data[f.id];
    } else {
      f.value = data[f.id] || "";
    }
  });

  const saveMessage = $("#save");

  if (saveMessage) {
    saveMessage.textContent =
      "Your saved draft has been restored.";
  }
}

fields.forEach((f) => {
  f.addEventListener("input", saveDraft);
  f.addEventListener("change", saveDraft);
});

loadDraft();

/* =========================================
   CLEAR REGISTRATION DRAFT
   ========================================= */

const clearButton = $("#clr");

if (clearButton) {
  clearButton.addEventListener("click", () => {
    store.del("draft");

    fields.forEach((f) => {
      if (f.type === "checkbox") {
        f.checked = false;
      } else {
        f.value = "";
      }
    });

    const saveMessage = $("#save");

    if (saveMessage) {
      saveMessage.textContent = "Draft cleared.";
    }
  });
}

/* =========================================
   REGISTRATION SUBMISSION
   ========================================= */

const submitButton = $("#sub");

if (submitButton) {
  submitButton.addEventListener("click", () => {
    const name = $("#fn");
    const email = $("#em");
    const mobile = $("#mb");
    const password = $("#pw");
    const consent = $("#cn");
    const saveMessage = $("#save");

    if (
      !name?.value ||
      !email?.value ||
      !email.validity.valid ||
      !mobile?.value ||
      (password?.value.length || 0) < 10
    ) {
      if (saveMessage) {
        saveMessage.textContent =
          "Please fill all required fields. Password needs 10+ characters.";
      }

      return;
    }

    if (!consent?.checked) {
      if (saveMessage) {
        saveMessage.textContent =
          "Consent is required to continue.";
      }

      return;
    }

    if (saveMessage) {
      saveMessage.textContent =
        "Demo only: no backend is connected yet, so no account was created.";
    }
  });
}

/* =========================================
   CONTACT FORM
   ========================================= */

const contactSubmit = $("#csub");

if (contactSubmit) {
  contactSubmit.addEventListener("click", () => {
    const contactMessage = $("#cs");

    if (contactMessage) {
      contactMessage.textContent =
        "Demo only: requests are not sent until the backend is connected.";
    }
  });
}

/* =========================================
   CANDIDATE DASHBOARD
   ========================================= */

function dash() {
  const data = store.get("draft");

  const status = $("#dst");
  const savedJobs = $("#saved");

  if (status) {
    status.textContent =
      data && (data.fn || data.em)
        ? "Draft in progress for " +
          (data.fn || "your application") +
          ". Resume from the registration page."
        : "No application started.";
  }

  if (savedJobs) {
    savedJobs.textContent = saved.size
      ? JOBS
          .filter((j) => saved.has(j.id))
          .map((j) => j.t)
          .join(", ")
      : "None yet.";
  }
}

route();
