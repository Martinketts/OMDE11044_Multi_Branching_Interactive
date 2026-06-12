/* ============================================================
   Branching Scenario — App (engine + components)
   --------------------------------------------------------------
   A hybrid engine: a FORKING decision graph PLUS four hidden
   meters that gate some branches. All readable content lives in
   branching-content.js; all styling in branching-styles.css.

   State model:
     variant  'forking' | 'pressure'   (chosen on the intro)
     screen   'intro' | 'context' | 'play' | 'debrief'
     node     current decision-node id
     meters   { governance, people, performance, trust }  (hidden)
     history  [{ nodeId, optIdx, metersBefore }]  (drives map + rewind)
     selected option index picked at the current node (pre-Submit)
     ending   resolved ending object once a terminal is reached
   ============================================================ */

/* global React, ReactDOM */
const { useState, useEffect, useRef } = React;

const {
  META, INTRO, CONTEXT,
  METERS, METER_START,
  GRAPHS, FORKING_ENDINGS, METER_ENDINGS,
  LABELS
} = window.BSCENARIO;


/* ---- Tweak defaults ---------------------------------------- */
const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "liveMeters": false,
  "revealLocks": true,
  "showNotTaken": true,
  "accent": "#ed8b2b"
} /*EDITMODE-END*/;


/* ---- meter helpers ----------------------------------------- */
const clamp = (v) => Math.max(0, Math.min(100, v));
function applyEffects(m, fx) {
  const out = { ...m };
  for (const k in fx || {}) out[k] = clamp(out[k] + fx[k]);
  return out;
}
function verdict(m) {
  const vals = METERS.map((x) => m[x.key]);
  const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
  const min = Math.min(...vals);
  const e = METER_ENDINGS.find((x) => x.test(m, avg, min)) || METER_ENDINGS[METER_ENDINGS.length - 1];
  return { ...e, avg, min };
}
function isEnding(graph, nextId) {
  return graph.key === "forking" ? nextId.indexOf("end_") === 0 : nextId === "RESOLVE";
}
function resolveEnding(graph, nextId, m) {
  const v = verdict(m);
  if (graph.key === "forking") {
    const e = FORKING_ENDINGS[nextId] || { title: "Outcome", body: "", tier: v.tier };
    return { tier: e.tier || v.tier, title: e.title, body: e.body, verdictTitle: v.title, meters: m };
  }
  return { tier: v.tier, title: v.title, body: v.body, verdictTitle: v.title, meters: m };
}
/* Colour for a meter's fill bar. Legacy keys map to the CSS tokens used
   by the original OMBA12033 scenario; any other module falls back to the
   `color` defined on its own METERS entry in the content file. */
const METER_COLOR_BY_KEY = Object.fromEntries((METERS || []).map((m) => [m.key, m.color]));
const meterColor = (key) =>
  ({ governance: "var(--m-gov)", people: "var(--m-people)",
    performance: "var(--m-perf)", trust: "var(--m-trust)" })[key]
  || METER_COLOR_BY_KEY[key]
  || "var(--orange)";


/* ============= Shared header ============= */
function ScreenHeader({ title, subPrefix, subText, extra }) {
  return (
    <>
      <div className="eyebrow">
        <span className="code">{META.code}</span>
        <span className="sep">|</span>
        <span>{META.eyebrow}</span>
      </div>
      {title && <h1 className="title">{title}</h1>}
      {subText &&
      <h2 className="sub-title">
          {subPrefix && <span className="label">{subPrefix}</span>}
          {subText}{extra}
        </h2>
      }
    </>);

}

const LockGlyph = ({ cls = "lock-icon" }) =>
<span className={cls} aria-hidden="true">
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <rect x="2.5" y="6" width="9" height="6.5" rx="1.4" stroke="currentColor" strokeWidth="1.5" />
      <path d="M4.4 6V4.4a2.6 2.6 0 0 1 5.2 0V6" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  </span>;



/* ============= Intro (with structure switcher) ============= */
function IntroScreen({ variant, setVariant }) {
  return (
    <div className="screen">
      <ScreenHeader title={META.title} />
      <div className="body" style={{ marginTop: 14, overflowY: "auto", paddingRight: 6 }}>
        <div className="two-col">
          <div>
            <h3>{INTRO.left.heading}</h3>
            {INTRO.left.bodyParas.map((p, i) => <p key={i}>{p}</p>)}
          </div>
          <div>
            <h3>{LABELS.structureHeading}</h3>
            <div className="switcher">
              <div className="switch-grid">
                {["forking", "pressure"].map((k) => {
                  const s = LABELS.structures[k];
                  return (
                    <button key={k}
                    className={`switch-card ${variant === k ? "active" : ""}`}
                    onClick={() => setVariant(k)}>
                      <div className="sc-top">
                        <span className="sc-name">{s.name}</span>
                        <span className="sc-radio" />
                      </div>
                      <p className="sc-blurb">{s.blurb}</p>
                    </button>);

                })}
              </div>
            </div>
          </div>
        </div>

        <div className="cta-text" style={{ marginTop: 18 }}>{INTRO.left.cta}</div>
      </div>
    </div>);

}


/* ============= Context ============= */
function ContextScreen() {
  return (
    <div className="screen">
      <ScreenHeader subPrefix={LABELS.scenarioPrefix || "Scenario:"} subText={CONTEXT.eyebrow} />
      <div className="body" style={{ marginTop: 16, maxWidth: 960 }}>
        <h3 style={{ margin: "0 0 12px", fontSize: 21, fontWeight: 700 }}>{CONTEXT.heading}</h3>
        {CONTEXT.paragraphs.map((p, i) =>
        <p key={i} style={{ margin: "0 0 14px", color: "var(--ink-soft)", fontSize: 18, lineHeight: 1.55 }}>{p}</p>
        )}
        <p style={{ margin: "16px 0 0", fontWeight: 700, color: "var(--ink)", fontSize: 18, lineHeight: 1.5, maxWidth: 820 }}>
          {CONTEXT.bold}
        </p>
      </div>
    </div>);

}


/* ============= Option pill ============= */
function OptionPill({ opt, idx, n, locked, selected, anySelected, onSelect, revealLocks }) {
  const dim = anySelected && !selected && !locked;
  const ref = useRef(null);
  const onMove = (e) => {
    const el = ref.current;if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${e.clientX - r.left}px`);
    el.style.setProperty("--my", `${e.clientY - r.top}px`);
  };
  return (
    <div className="gate-slot">
      <button ref={ref} onMouseMove={onMove}
      className={`opt orange ${selected ? "selected" : ""} ${dim ? "dim" : ""} ${locked ? "locked" : ""}`}
      onClick={() => !locked && onSelect(idx)}
      aria-pressed={selected} aria-disabled={locked}>
        <span>
          <span className="opt-tag">{LABELS.optionLabel(idx + 1)}</span>
          {opt.label}
        </span>
        {locked ?
        <LockGlyph /> :
        <span className="chev" aria-hidden="true">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M3.5 1.5L8 6L3.5 10.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>}
      </button>
      <div className="gate-hint">{locked && revealLocks ? opt.gateHint : locked ? "Locked" : ""}</div>
    </div>);

}


/* ============= Play (a decision node) ============= */
function PlayScreen({ graph, node, meters, selected, onSelect, decisionNo, revealLocks }) {
  const n = node.options.length;
  return (
    <div className="screen" key={`node-${node.id}`}>
      <ScreenHeader subPrefix={LABELS.stepPrefix ? LABELS.stepPrefix(decisionNo) : `Decision ${decisionNo}:`}
      subText={node.eyebrow} />
      <div className="body" style={{ justifyContent: "flex-start", alignItems: "center" }}>
        <p className="question"><span>{node.question}</span></p>
        <div className="prompt-label">{node.prompt}</div>

        <div className={`options n${n}`}>
          {node.options.map((opt, i) => {
            const locked = !!(opt.gate && !opt.gate(meters));
            return (
              <OptionPill key={i} opt={opt} idx={i} n={n}
              locked={locked} revealLocks={revealLocks}
              selected={selected === i} anySelected={selected !== null}
              onSelect={onSelect} />);

          })}
        </div>

        {selected !== null &&
        <div className="desc-card reveal" key={`d-${node.id}-${selected}`}>
            <h4>{node.options[selected].label}</h4>
            <p>{node.options[selected].summary}</p>
          </div>
        }
      </div>
    </div>);

}


/* ============= Debrief: meters ============= */
function meterBand(v) {
  return LABELS.meterBands.find((b) => v >= b.min) || LABELS.meterBands[LABELS.meterBands.length - 1];
}

function MeterBars({ meters }) {
  const [show, setShow] = useState(false);
  useEffect(() => {const t = setTimeout(() => setShow(true), 120);return () => clearTimeout(t);}, []);
  return (
    <div className="meters">
      {METERS.map((mt) => {
        const v = meters[mt.key];
        const band = meterBand(v);
        return (
          <div className="meter" key={mt.key}>
            <div className="m-row">
              <span className="m-label">{mt.label}</span>
              <span className="m-end">
                <span className="m-band" style={{ color: band.color }}>{band.label}</span>
                <span className="m-val">{v}</span>
              </span>
            </div>
            <span className="m-track">
              <span className="m-fill" style={{ width: show ? `${v}%` : 0, background: meterColor(mt.key) }} />
            </span>
          </div>);

      })}
    </div>);

}

/* one-line synthesis of the four final values (tone derived from the
   dials themselves, so it always matches the bars shown) */
function MeterSummary({ meters }) {
  const ranked = [...METERS].sort((a, b) => meters[b.key] - meters[a.key]);
  const strong = ranked[0],weak = ranked[ranked.length - 1];
  const tier = verdict(meters).tier;
  const tpl = LABELS.meterSummary[tier] || LABELS.meterSummary.moderate;
  const text = tpl.
  replace("{strong}", strong.label).
  replace("{weak}", weak.label);
  return (
    <div className="meter-summary">
      <span className="ms-head">{LABELS.meterSummaryHeading}</span>
      <p className="ms-body">{text}</p>
    </div>);

}


/* ============= Debrief: branch map ============= */
function MapRow({ graph, entry, idx, onRewind, showNotTaken }) {
  const node = graph.nodes[entry.nodeId];
  const chosen = node.options[entry.optIdx];
  const others = node.options.
  map((o, i) => ({ o, i })).
  filter((x) => x.i !== entry.optIdx);

  return (
    <div className="map-row">
      <span className="map-node" />
      <div className="map-card">
        <div className="mc-head">
          <span className="mc-title">{LABELS.pageLabel(idx + 1)} · {node.eyebrow}</span>
          <button className="rewind-btn" onClick={() => onRewind(idx)}>{LABELS.rewindLabel}</button>
        </div>

        <div className="mc-chosen">
          <span className="pick">Chose</span>
          <div className="pick-body">
            <div className="pb-label">{chosen.label}</div>
            <div className="pb-summary">{chosen.summary}</div>
          </div>
        </div>

        <p className="mc-reflection">{chosen.reflection}</p>

        {chosen.lessons && chosen.lessons.length > 0 &&
        <>
            <div className="mc-sub">{LABELS.lessonsHeading}</div>
            <div className="mc-lessons">
              {chosen.lessons.map((l, i) =>
            <a key={i} href={l.url} className="lesson-link" target="_blank" rel="noopener noreferrer">{l.title}</a>
            )}
            </div>
          </>
        }

        {showNotTaken && others.length > 0 &&
        <>
            <div className="mc-sub">{LABELS.notTakenLabel}</div>
            <div className="mc-nottaken">
              {others.map(({ o, i }) => {
              const wasLocked = !!(o.gate && !o.gate(entry.metersBefore));
              return (
                <span key={i} className={`nt-chip ${wasLocked ? "was-locked" : ""}`}>
                    {wasLocked && <span className="nt-lock"><LockGlyph cls="" /></span>}
                    {o.label}{wasLocked ? " · was locked" : ""}
                  </span>);

            })}
            </div>
          </>
        }
      </div>
    </div>);

}

function DebriefScreen({ ending }) {
  return (
    <div className="screen">
      <div className="debrief-header">
        <div className="dh-left">
          <ScreenHeader subPrefix={LABELS.debriefPrefix} subText={LABELS.debriefTitle} />
        </div>
        <div className="dh-right">
          <div className="db-section-label">{LABELS.metersHeading}</div>
        </div>
      </div>
      <div className="debrief">
        <div className="debrief-grid">

          <div className="debrief-main">
            <div className="outcome-card">
              <div className={`outcome-head ${ending.tier}`}>
                <span>
                  <span className="outcome-verdict">{ending.tier}</span>
                  {ending.title}
                </span>
              </div>
              <div className="outcome-body">
                <p className="outcome-summary">{ending.body}</p>
              </div>
            </div>
          </div>

          <aside className="debrief-side">
            <div className="db-section-label mobile-only">{LABELS.metersHeading}</div>
            <MeterBars meters={ending.meters} />
            <MeterSummary meters={ending.meters} />
          </aside>

        </div>
      </div>
    </div>);

}

/* ============= Branch-map overlay (rendered at .page level) ============= */
function MapOverlay({ graph, history, onRewind, onClose, showNotTaken }) {
  return (
    <div className="map-overlay" role="dialog" aria-modal="true" aria-label={LABELS.mapHeading}>
      <div className="map-overlay-head">
        <span className="moh-title">{LABELS.mapHeading}</span>
        <button className="overlay-close" onClick={onClose}>
          {LABELS.hideMapBtn} <span className="x">✕</span>
        </button>
      </div>
      <div className="map-overlay-body">
        <div className="moh-hint">{LABELS.mapHint}</div>
        <div className="map">
          {history.map((entry, i) =>
          <MapRow key={i} graph={graph} entry={entry} idx={i}
          onRewind={onRewind} showNotTaken={showNotTaken} />
          )}
        </div>
      </div>
    </div>);

}


/* ============= Live-meter HUD (tweak) ============= */
function HUD({ meters }) {
  return (
    <div className="hud" aria-hidden="true">
      {METERS.map((mt) =>
      <span className="hud-m" key={mt.key}>
          <span className="hud-dot" style={{ background: meterColor(mt.key) }} />
          <span className="hud-val">{meters[mt.key]}</span>
        </span>
      )}
    </div>);

}


/* ============= Bottom bars ============= */
function BottomBar({ label, disabled, onClick }) {
  return (
    <div className="tab-wrap">
      <div className="tab">
        <button className={`btn ${disabled ? "disabled" : ""}`} disabled={disabled} onClick={onClick}>{label}</button>
      </div>
    </div>);

}


/* ============= App ============= */
function App() {
  const [t, setT] = window.useTweaks ? window.useTweaks(TWEAK_DEFAULTS) : [TWEAK_DEFAULTS, () => {}];

  const [variant, setVariant] = useState("forking");
  const [screen, setScreen] = useState("intro");
  const [node, setNode] = useState(GRAPHS.forking.start);
  const [meters, setMeters] = useState({ ...METER_START });
  const [history, setHistory] = useState([]);
  const [selected, setSelected] = useState(null);
  const [ending, setEnding] = useState(null);
  const [mapOpen, setMapOpen] = useState(false);

  const graph = GRAPHS[variant];

  useEffect(() => {
    document.documentElement.style.setProperty("--orange", t.accent || "#ed8b2b");
  }, [t.accent]);

  /* switching structure on the intro resets the run */
  const chooseVariant = (k) => {
    setVariant(k);
    setNode(GRAPHS[k].start);
    setMeters({ ...METER_START });
    setHistory([]);
    setSelected(null);
    setEnding(null);
  };

  const startRun = () => {
    setNode(graph.start);
    setMeters({ ...METER_START });
    setHistory([]);
    setSelected(null);
    setEnding(null);
    setScreen("play");
  };

  const onSubmit = () => {
    const cur = graph.nodes[node];
    const opt = cur.options[selected];
    const before = meters;
    const after = applyEffects(meters, opt.effects);
    setHistory((h) => [...h, { nodeId: node, optIdx: selected, metersBefore: before }]);
    setMeters(after);
    if (isEnding(graph, opt.next)) {
      setEnding(resolveEnding(graph, opt.next, after));
      setScreen("debrief");
    } else {
      setNode(opt.next);
      setSelected(null);
    }
  };

  const onRewind = (k) => {
    const entry = history[k];
    setMapOpen(false);
    setMeters(entry.metersBefore);
    setHistory((h) => h.slice(0, k));
    setNode(entry.nodeId);
    setSelected(null);
    setEnding(null);
    setScreen("play");
  };

  const onStartOver = () => {
    setMapOpen(false);
    setMeters({ ...METER_START });
    setHistory([]);
    setSelected(null);
    setEnding(null);
    setNode(graph.start);
    setScreen("intro");
  };

  const decisionNo = history.length + 1;
  const pageText =
  screen === "intro" ? "INTRODUCTION" :
  screen === "context" ? "SCENARIO" :
  screen === "debrief" ? "DEBRIEF" :
  LABELS.pageLabel(decisionNo);

  return (
    <div className="desk">
      <div className="page">

        {t.liveMeters && screen === "play" && <HUD meters={meters} />}

        <div className="page-inner">
          <div className="screen-stage">
            {screen === "intro" && <IntroScreen variant={variant} setVariant={chooseVariant} />}
            {screen === "context" && <ContextScreen />}
            {screen === "play" && <PlayScreen graph={graph} node={graph.nodes[node]} meters={meters}
            selected={selected} onSelect={setSelected}
            decisionNo={decisionNo} revealLocks={t.revealLocks} />}
            {screen === "debrief" && <DebriefScreen ending={ending} />}
          </div>
        </div>

        {screen === "debrief" && mapOpen &&
        <MapOverlay graph={graph} history={history} onRewind={onRewind}
        onClose={() => setMapOpen(false)} showNotTaken={t.showNotTaken} />
        }

        {/* bottom controls */}
        {screen === "intro" && <BottomBar label={LABELS.btnContinue} onClick={() => setScreen("context")} />}
        {screen === "context" && <BottomBar label={LABELS.btnContinue} onClick={startRun} />}
        {screen === "play" && <BottomBar label={LABELS.btnSubmit} disabled={selected === null} onClick={onSubmit} />}
        {screen === "debrief" &&
        <div className="tab-wrap">
            <div className="tab">
              <button className="btn btn-ghost map-open-btn" onClick={() => setMapOpen(true)}>
                <span className="map-open-ico" aria-hidden="true">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <circle cx="4" cy="3" r="2" fill="currentColor" />
                    <circle cx="12" cy="8" r="2" fill="currentColor" />
                    <circle cx="4" cy="13" r="2" fill="currentColor" />
                    <path d="M4 5v8M4 9h4a2 2 0 0 0 2-2V8" stroke="currentColor" strokeWidth="1.4" fill="none" />
                  </svg>
                </span>
                {LABELS.mapOpenBtn}
              </button>
              <button className="btn" onClick={onStartOver}>{LABELS.btnTryAgain}</button>
            </div>
          </div>
        }

      </div>

      {window.TweaksPanel &&
      <window.TweaksPanel>
          <window.TweakSection label="Simulation" />
          <window.TweakToggle label="Live meters during play" value={t.liveMeters}
        onChange={(v) => setT("liveMeters", v)} />
          <window.TweakToggle label="Reveal lock requirements" value={t.revealLocks}
        onChange={(v) => setT("revealLocks", v)} />
          <window.TweakSection label="Debrief" />
          <window.TweakToggle label="Show roads not taken" value={t.showNotTaken}
        onChange={(v) => setT("showNotTaken", v)} />
          <window.TweakColor label="Accent" value={t.accent}
        options={["#ed8b2b", "#2A6FDB", "#1F8A5B", "#C44545"]}
        onChange={(v) => setT("accent", v)} />
        </window.TweaksPanel>
      }
    </div>);

}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);