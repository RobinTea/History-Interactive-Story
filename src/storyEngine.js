function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function now() {
  return performance.now();
}

function createEl(tag, className, text) {
  const el = document.createElement(tag);
  if (className) el.className = className;
  if (typeof text === "string") el.textContent = text;
  return el;
}

export class StoryEngine {
  constructor({
    terminalEl,
    choicesEl,
    hintEl,
    timerLineEl,
    timerValueEl,
    countdownBarEl,
    countdownFillEl,
    route,
    onEnding,
  }) {
    this.terminalEl = terminalEl;
    this.choicesEl = choicesEl;
    this.hintEl = hintEl;
    this.timerLineEl = timerLineEl;
    this.timerValueEl = timerValueEl;
    this.countdownBarEl = countdownBarEl;
    this.countdownFillEl = countdownFillEl;
    this.route = route;
    this.onEnding = onEnding;

    this._keyHandler = (e) => this.onKeyDown(e);
    this._raf = null;

    this.reset();
  }

  reset() {
    const clone =
      typeof globalThis.structuredClone === "function"
        ? globalThis.structuredClone
        : (v) => JSON.parse(JSON.stringify(v));
    this.state = { ...clone(this.route.initialState) };
    this.transcript = [];
    this.currentNodeId = this.route.startNode;
    this.beatQueue = [];
    this._onBeatQueueEmpty = null;

    this.choiceActive = false;
    this.activeChoice = null;

    this._timer = null;
    this._timerStart = 0;
    this._timerEnd = 0;

    this.clearUI();
  }

  start() {
    window.removeEventListener("keydown", this._keyHandler, true);
    window.addEventListener("keydown", this._keyHandler, true);
    this.renderNode(this.currentNodeId);
  }

  stop() {
    window.removeEventListener("keydown", this._keyHandler, true);
    this.stopTimer();
  }

  clearUI() {
    this.terminalEl.innerHTML = "";
    this.choicesEl.innerHTML = "";
    this.setHint("Press Space to continue");
    this.setTimerVisible(false);
    this.setCountdownVisible(false);
  }

  setHint(text) {
    if (this.hintEl) this.hintEl.textContent = text;
  }

  setTimerVisible(visible) {
    if (this.timerLineEl) this.timerLineEl.classList.toggle("hidden", !visible);
  }

  setCountdownVisible(visible) {
    if (this.countdownBarEl) this.countdownBarEl.classList.toggle("hidden", !visible);
  }

  appendLine({ text, kind = "line" }) {
    const p = createEl("p", `line ${kind}`, text);
    this.terminalEl.appendChild(p);
    this.transcript.push(text);

    // keep near-bottom scrolling smooth for terminal feel
    const shouldStickToBottom =
      this.terminalEl.scrollHeight - (this.terminalEl.scrollTop + this.terminalEl.clientHeight) < 120;
    if (shouldStickToBottom) {
      this.terminalEl.scrollTop = this.terminalEl.scrollHeight;
    }
  }

  onKeyDown(e) {
    if (e.code !== "Space") return;
    if (e.repeat) return;
    // Prevent Space from scrolling and from "clicking" focused buttons/links (e.g. Restart),
    // while still allowing Space-to-advance the story.
    e.preventDefault();

    if (this.choiceActive) return;

    this.advanceBeat();
  }

  resolveNext(next) {
    if (typeof next === "string") return next;
    if (!next) return null;
    if (typeof next === "function") return next(this.state);
    if (typeof next === "object") {
      for (const branch of next.branches ?? []) {
        if (branch.when(this.state)) return branch.to;
      }
      return next.fallback ?? null;
    }
    return null;
  }

  applyEffects(effects) {
    if (!effects) return;
    if (typeof effects === "function") {
      effects(this.state);
      return;
    }
    for (const [k, v] of Object.entries(effects)) {
      if (typeof v === "number") {
        const cur = Number(this.state[k] ?? 0);
        this.state[k] = cur + v;
      } else {
        this.state[k] = v;
      }
    }
  }

  renderNode(nodeId) {
    const node = this.route.nodes[nodeId];
    if (!node) {
      this.appendLine({ text: `[ENGINE] Missing node: ${nodeId}`, kind: "danger" });
      return;
    }

    this.currentNodeId = nodeId;
    this.choiceActive = false;
    this.activeChoice = null;
    this.choicesEl.innerHTML = "";
    this.stopTimer();
    this.setTimerVisible(false);
    this.setCountdownVisible(false);
    this._onBeatQueueEmpty = null;

    if (node.type === "narration") {
      if (node.meta) this.appendLine({ text: node.meta, kind: "meta" });
      this.beatQueue = [...(node.beats ?? [])];
      this.advanceBeat();
      return;
    }

    if (node.type === "choice") {
      if (node.meta) this.appendLine({ text: node.meta, kind: "meta" });
      if (node.preludeBeats && node.preludeBeats.length) {
        this.beatQueue = [...node.preludeBeats];
        this._onBeatQueueEmpty = () => this.showChoice(node);
        this.advanceBeat();
      } else {
        this.showChoice(node);
      }
      return;
    }

    if (node.type === "ending") {
      const endingId = node.endingId;
      const routeId = this.route.id;
      this.onEnding({ routeId, endingId, state: this.state, transcript: this.transcript });
      return;
    }

    this.appendLine({ text: `[ENGINE] Unknown node type: ${node.type}`, kind: "danger" });
  }

  advanceBeat(onEmpty) {
    if (!this.beatQueue.length) {
      const cb = typeof onEmpty === "function" ? onEmpty : this._onBeatQueueEmpty;
      this._onBeatQueueEmpty = null;

      if (typeof cb === "function") cb();
      else {
        const node = this.route.nodes[this.currentNodeId];
        const nextId = this.resolveNext(node?.next);
        if (nextId) this.renderNode(nextId);
      }
      return;
    }

    const beat = this.beatQueue.shift();
    const line = typeof beat === "function" ? beat(this.state) : beat;
    if (line) this.appendLine({ text: line, kind: "line" });
    this.setHint("Press Space to continue");
  }

  showChoice(node) {
    this.choiceActive = true;
    this.activeChoice = node;
    this.choicesEl.innerHTML = "";

    this.setHint("Choose an action");

    const timedSeconds = node.timerSeconds ?? null;
    if (timedSeconds) {
      this.setTimerVisible(true);
      this.setCountdownVisible(true);
      this.startTimer(timedSeconds, () => {
        const defaultOptionId = node.defaultOptionId;
        const fallback =
          node.options.find((o) => o.id === defaultOptionId) ?? node.options[node.options.length - 1];
        this.chooseOption(fallback, { timedOut: true });
      });
    } else {
      this.setTimerVisible(false);
      this.setCountdownVisible(false);
    }

    for (const opt of node.options ?? []) {
      const btn = createEl("button", "choiceBtn", opt.label);
      btn.type = "button";
      if (opt.kind === "danger") btn.classList.add("danger");
      btn.addEventListener("click", () => this.chooseOption(opt, { timedOut: false }));
      this.choicesEl.appendChild(btn);
    }

    const first = this.choicesEl.querySelector("button");
    if (first) first.focus();
  }

  chooseOption(option, { timedOut }) {
    if (!this.choiceActive) return;
    this.choiceActive = false;
    this.stopTimer();
    this.choicesEl.innerHTML = "";
    this.setTimerVisible(false);
    this.setCountdownVisible(false);

    if (timedOut) {
      this.appendLine({ text: "[…] Time runs out.", kind: "meta" });
    }

    this.appendLine({ text: `> ${option.label}`, kind: "prompt" });
    this.applyEffects(option.effects);

    const node = this.activeChoice;
    const nextId = this.resolveNext(option.next ?? node.next);
    this.activeChoice = null;

    if (option.afterBeats && option.afterBeats.length) {
      this.beatQueue = [...option.afterBeats];
      this._onBeatQueueEmpty = () => {
        if (nextId) this.renderNode(nextId);
      };
      this.advanceBeat();
      return;
    }

    if (nextId) this.renderNode(nextId);
  }

  startTimer(seconds, onExpire) {
    this.stopTimer();
    this._timerStart = now();
    this._timerEnd = this._timerStart + seconds * 1000;

    const tick = () => {
      const t = now();
      const remainingMs = this._timerEnd - t;
      const remainingSec = clamp(Math.ceil(remainingMs / 1000), 0, 999);
      if (this.timerValueEl) this.timerValueEl.textContent = `${remainingSec}s`;

      const pct = clamp(remainingMs / (seconds * 1000), 0, 1);
      if (this.countdownFillEl) this.countdownFillEl.style.transform = `scaleX(${pct})`;

      if (remainingMs <= 0) {
        this._raf = null;
        onExpire();
        return;
      }

      this._raf = requestAnimationFrame(tick);
    };

    this._raf = requestAnimationFrame(tick);
  }

  stopTimer() {
    if (this._raf) cancelAnimationFrame(this._raf);
    this._raf = null;
    if (this.timerValueEl) this.timerValueEl.textContent = "--";
    if (this.countdownFillEl) this.countdownFillEl.style.transform = "scaleX(1)";
  }
}

