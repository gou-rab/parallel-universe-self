/* ============================================================
   Parallel Universe Self
   Form · API · Card Reveal · Stars · Animations
   ============================================================ */
(function () {
  "use strict";

  // ── DOM ──
  const btnGenerate    = document.getElementById("btnGenerate");
  const btnText        = document.getElementById("btnText");
  const lifeInput      = document.getElementById("lifeInput");
  const charCount      = document.getElementById("charCount");
  const qfName         = document.getElementById("qfName");
  const qfAge          = document.getElementById("qfAge");
  const qfJob          = document.getElementById("qfJob");
  const qfCity         = document.getElementById("qfCity");
  const qfDream        = document.getElementById("qfDream");
  const qfFear         = document.getElementById("qfFear");
  const inputSection   = document.getElementById("inputSection");
  const universesSection = document.getElementById("universesSection");
  const universeGrid   = document.getElementById("universeGrid");
  const statusBar      = document.getElementById("statusBar");
  const statusDot      = document.getElementById("statusDot");
  const statusText     = document.getElementById("statusText");
  const loadingOverlay = document.getElementById("loadingOverlay");
  const usSub          = document.getElementById("usSub");
  const shareNote      = document.getElementById("shareNote");

  // Loading steps
  const ls1 = document.getElementById("ls1");
  const ls2 = document.getElementById("ls2");
  const ls3 = document.getElementById("ls3");
  const ls4 = document.getElementById("ls4");

  // ── State ──
  let selectedLang  = "en";
  let lastResults   = null;
  let starsCreated  = false;

  // ── Stars ──
  function createStars() {
    if (starsCreated) return;
    const container = document.getElementById("stars");
    for (let i = 0; i < 180; i++) {
      const star = document.createElement("div");
      star.className = "star";
      const size = Math.random() * 2.5 + 0.5;
      star.style.cssText = `
        width: ${size}px;
        height: ${size}px;
        top: ${Math.random() * 100}%;
        left: ${Math.random() * 100}%;
        --dur: ${Math.random() * 4 + 2}s;
        --delay: ${Math.random() * 5}s;
        opacity: ${Math.random() * 0.7 + 0.1};
      `;
      container.appendChild(star);
    }
    starsCreated = true;
  }
  createStars();

  // ── Language ──
  window.setLang = function (lang) {
    selectedLang = lang;
    document.getElementById("btnEN").classList.toggle("active", lang === "en");
    document.getElementById("btnBN").classList.toggle("active", lang === "bn");
    if (lang === "bn") {
      lifeInput.placeholder = "আপনার জীবন বাংলায় বর্ণনা করুন... আপনার ব্যক্তিত্ব, স্বপ্ন, সংগ্রাম, সম্পর্ক...";
      btnText.textContent   = "পোর্টাল খুলুন";
      qfName.placeholder    = "আপনার নাম";
      qfAge.placeholder     = "বয়স";
      qfJob.placeholder     = "পেশা / পড়াশোনা";
      qfCity.placeholder    = "আপনার শহর";
      qfDream.placeholder   = "আপনার বড় স্বপ্ন";
      qfFear.placeholder    = "আপনার বড় ভয়";
    } else {
      lifeInput.placeholder = "Describe your life in your own words... your personality, struggles, dreams, relationships, what makes you unique...";
      btnText.textContent   = "Open the Portal";
      qfName.placeholder    = "Your name";
      qfAge.placeholder     = "Age";
      qfJob.placeholder     = "Your job / study";
      qfCity.placeholder    = "Your city";
      qfDream.placeholder   = "Your biggest dream";
      qfFear.placeholder    = "Your biggest fear";
    }
  };

  // ── Char Count ──
  lifeInput.addEventListener("input", () => {
    charCount.textContent = lifeInput.value.length;
  });

  // ── Build Description ──
  function buildDescription() {
    const parts = [];
    if (qfName.value.trim())  parts.push(`My name is ${qfName.value.trim()}.`);
    if (qfAge.value.trim())   parts.push(`I am ${qfAge.value.trim()} years old.`);
    if (qfJob.value.trim())   parts.push(`I work/study as ${qfJob.value.trim()}.`);
    if (qfCity.value.trim())  parts.push(`I live in ${qfCity.value.trim()}.`);
    if (qfDream.value.trim()) parts.push(`My biggest dream is ${qfDream.value.trim()}.`);
    if (qfFear.value.trim())  parts.push(`My biggest fear is ${qfFear.value.trim()}.`);
    if (lifeInput.value.trim()) parts.push(lifeInput.value.trim());
    return parts.join(" ");
  }

  // ── Generate ──
  btnGenerate.addEventListener("click", async () => {
    const description = buildDescription();
    if (description.trim().length < 20) {
      showStatus("Please fill in at least a few fields about yourself.", "error");
      shakeBtn();
      return;
    }
    await generate(description);
  });

  async function generate(description) {
    showLoading();
    animateLoadingSteps();

    try {
      const res = await fetch("/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description, lang: selectedLang }),
      });
      const data = await res.json();

      if (!res.ok || data.error) throw new Error(data.error || "Generation failed");

      lastResults = data;
      hideLoading();
      showUniverses(data);

    } catch (err) {
      hideLoading();
      showStatus("⚠ " + err.message, "error");
    }
  }

  // ── Show Universes ──
  function showUniverses(data) {
    inputSection.style.display    = "none";
    statusBar.style.display       = "none";
    universesSection.style.display = "block";

    const name = qfName.value.trim() || "You";
    usSub.textContent = selectedLang === "bn"
      ? `ওরাকল বলেছে। মহাবিশ্বজুড়ে ${name} এইভাবে বিদ্যমান...`
      : `The Oracle has spoken. Across the multiverse, ${name} exists as...`;

    universeGrid.innerHTML = "";

    data.universes.forEach((u, i) => {
      const card = buildCard(u);
      universeGrid.appendChild(card);
      setTimeout(() => card.classList.add("revealed"), 200 + i * 300);
    });

    universesSection.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  // ── Build Card ──
  function buildCard(u) {
    const color = u.color || "dark";
    const card  = document.createElement("div");
    card.className = `universe-card ${color}`;

    const happinessScore = u.happiness_score || 50;

    card.innerHTML = `
      <div class="uc-header">
        <div class="uc-emoji">${u.emoji || "🌌"}</div>
        <div class="uc-meta">
          <div class="uc-universe-name">${escHTML(u.universe_name)}</div>
          <div class="uc-dim-code">${escHTML(u.dimension_code || "DIMENSION-??")}</div>
        </div>
        <div class="uc-happiness">
          <div class="uh-label">HAPPINESS</div>
          <div class="uh-score">${happinessScore}%</div>
        </div>
      </div>

      <div class="uc-body">
        <div class="uc-profession">💼 ${escHTML(u.profession || "Unknown")}</div>

        <div class="uc-section">
          <div class="uc-section-title">WHO YOU ARE</div>
          <p class="uc-text">${escHTML(u.who_you_are || "")}</p>
        </div>

        <div class="uc-section">
          <div class="uc-section-title">YOUR LIFE</div>
          <p class="uc-text">${escHTML(u.life_situation || "")}</p>
        </div>

        <div class="uc-section">
          <div class="uc-section-title">⚡ PLOT TWIST</div>
          <div class="uc-twist">${escHTML(u.plot_twist || "")}</div>
        </div>

        <div class="uc-quote">
          <span class="uq-mark">"</span>
          <p class="uq-text">${escHTML(u.famous_quote || "")}</p>
        </div>
      </div>
    `;

    return card;
  }

  // ── Share ──
  window.shareResults = function () {
    if (!lastResults) return;
    const name = qfName.value.trim() || "Me";
    let text = `🌌 My Parallel Universe Selves — by ${name}\n\n`;
    lastResults.universes.forEach(u => {
      text += `${u.emoji} ${u.universe_name} (${u.dimension_code})\n`;
      text += `Role: ${u.profession}\n`;
      text += `Twist: ${u.plot_twist}\n\n`;
    });
    text += `Discover yours → Parallel Universe Self App`;

    navigator.clipboard.writeText(text).then(() => {
      shareNote.textContent = "✅ Copied to clipboard! Share with your friends.";
      setTimeout(() => { shareNote.textContent = ""; }, 3000);
    }).catch(() => {
      shareNote.textContent = "⚠ Could not copy. Try selecting the text manually.";
    });
  };

  // ── Reset ──
  window.resetApp = function () {
    inputSection.style.display     = "block";
    universesSection.style.display = "none";
    statusBar.style.display        = "none";
    universeGrid.innerHTML         = "";
    lastResults = null;
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ── Loading Steps Animation ──
  function animateLoadingSteps() {
    const steps = [ls1, ls2, ls3, ls4];
    steps.forEach(s => { s.classList.remove("active", "done"); });
    ls1.classList.add("active");

    let i = 0;
    const iv = setInterval(() => {
      if (i < steps.length - 1) {
        steps[i].classList.remove("active");
        steps[i].classList.add("done");
        i++;
        steps[i].classList.add("active");
      } else {
        clearInterval(iv);
      }
    }, 1800);
  }

  // ── Loading ──
  function showLoading() {
    loadingOverlay.classList.add("active");
    loadingOverlay.setAttribute("aria-hidden", "false");
  }
  function hideLoading() {
    loadingOverlay.classList.remove("active");
    loadingOverlay.setAttribute("aria-hidden", "true");
  }

  // ── Status ──
  function showStatus(text, type = "idle") {
    statusBar.style.display = "flex";
    statusText.textContent  = text;
    statusDot.className     = "status-dot" + (type === "error" ? " error" : "");
  }

  // ── Shake Btn ──
  function shakeBtn() {
    btnGenerate.style.animation = "none";
    btnGenerate.style.transform = "translateX(-8px)";
    setTimeout(() => {
      btnGenerate.style.transform = "translateX(8px)";
      setTimeout(() => {
        btnGenerate.style.transform = "";
      }, 100);
    }, 100);
  }

  // ── Utility ──
  function escHTML(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  // ── Enter key on quick fields ──
  [qfName, qfAge, qfJob, qfCity, qfDream, qfFear].forEach(el => {
    el.addEventListener("keydown", (e) => {
      if (e.key === "Enter") btnGenerate.click();
    });
  });

})();
