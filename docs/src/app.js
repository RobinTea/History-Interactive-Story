import { StoryEngine } from "./storyEngine.js";
import { petrov1983 } from "./routes/petrov1983.js";
import { arkhipov1962 } from "./routes/arkhipov1962.js";

function qs(name) {
  return new URLSearchParams(window.location.search).get(name);
}

function setHidden(el, hidden) {
  el.classList.toggle("hidden", hidden);
}

function initLanding() {
  const startBtn = document.getElementById("startBtn");
  const aboutBtn = document.getElementById("aboutBtn");
  const routeSelect = document.getElementById("routeSelect");
  const about = document.getElementById("about");

  if (!startBtn || !routeSelect) return;

  const revealRoutes = () => {
    setHidden(routeSelect, false);
    routeSelect.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  startBtn.addEventListener("click", revealRoutes);

  if (aboutBtn && about) {
    aboutBtn.addEventListener("click", () => {
      setHidden(about, false);
      about.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  // Hash shortcut: /index.html#routeSelect
  if (window.location.hash === "#routeSelect") {
    setHidden(routeSelect, false);
  }
}

function initStory() {
  const terminal = document.getElementById("terminal");
  if (!terminal) return;

  const route = qs("route");
  const routes = {
    petrov: petrov1983,
    arkhipov: arkhipov1962,
  };

  const routeData = routes[route] ?? petrov1983;

  const routeLabel = document.getElementById("routeLabel");
  const sceneTitle = document.getElementById("sceneTitle");
  const choices = document.getElementById("choices");
  const hintLine = document.getElementById("hintLine");
  const timerLine = document.getElementById("timerLine");
  const timerValue = document.getElementById("timerValue");
  const countdownBar = document.getElementById("countdownBar");
  const countdownFill = document.getElementById("countdownFill");
  const restartBtn = document.getElementById("restartBtn");

  if (!choices || !hintLine || !timerLine || !timerValue || !countdownBar || !countdownFill) return;

  if (routeLabel) routeLabel.textContent = routeData.ui.routeLabel;
  if (sceneTitle) sceneTitle.textContent = routeData.ui.title;

  const engine = new StoryEngine({
    terminalEl: terminal,
    choicesEl: choices,
    hintEl: hintLine,
    timerLineEl: timerLine,
    timerValueEl: timerValue,
    countdownBarEl: countdownBar,
    countdownFillEl: countdownFill,
    route: routeData,
    onEnding: ({ routeId, endingId, state, transcript }) => {
      const payload = {
        routeId,
        endingId,
        state,
        transcript,
        at: Date.now(),
      };
      window.localStorage.setItem("lastEnding", JSON.stringify(payload));
      window.location.href = `./ending.html?route=${encodeURIComponent(routeId)}&ending=${encodeURIComponent(
        endingId
      )}`;
    },
  });

  engine.start();

  if (restartBtn) {
    restartBtn.addEventListener("click", () => {
      engine.reset();
      engine.start();
    });
  }
}

function initEnding() {
  const titleEl = document.getElementById("endingTitle");
  if (!titleEl) return;

  const routes = {
    petrov: petrov1983,
    arkhipov: arkhipov1962,
  };

  const stored = window.localStorage.getItem("lastEnding");
  let state = {};
  let routeId = qs("route");
  let endingId = qs("ending");
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (parsed && parsed.state) {
        if (!routeId) routeId = parsed.routeId;
        if (!endingId) endingId = parsed.endingId;
        state = parsed.state;
      }
    } catch {
      // ignore
    }
  }

  const routeData = routes[routeId] ?? petrov1983;
  const ending = routeData.endings[endingId] ?? routeData.endings[routeData.ui.fallbackEnding];

  const endingRoute = document.getElementById("endingRoute");
  const subtitleEl = document.getElementById("endingSubtitle");
  const summaryEl = document.getElementById("endingSummary");
  const casualtiesValueEl = document.getElementById("endingCasualtiesValue");
  const casualtiesNoteEl = document.getElementById("endingCasualtiesNote");
  const epilogueEl = document.getElementById("endingEpilogue");
  const realLifeEl = document.getElementById("endingRealLife");
  const comparedEl = document.getElementById("endingCompared");
  const replayBtn = document.getElementById("replayBtn");

  if (endingRoute) endingRoute.textContent = routeData.ui.routeLabel;
  titleEl.textContent = ending.title;
  if (subtitleEl) subtitleEl.textContent = ending.subtitle;
  if (summaryEl) summaryEl.textContent = ending.summary;
  if (epilogueEl) epilogueEl.textContent = ending.epilogue;
  if (realLifeEl) realLifeEl.textContent = ending.realLife ?? "—";
  if (comparedEl) comparedEl.textContent = ending.compared ?? "";

  const casualties = ending?.casualties ?? { value: "—", note: "No casualty estimate available." };
  if (casualtiesValueEl) casualtiesValueEl.textContent = casualties.value ?? "—";
  if (casualtiesNoteEl) casualtiesNoteEl.textContent = casualties.note ?? "";

  if (replayBtn) {
    replayBtn.setAttribute("href", `./story.html?route=${encodeURIComponent(routeData.id)}`);
  }
}

initLanding();
initStory();
initEnding();

