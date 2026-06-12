/* ============================================================
   Branching Scenario — ALL EDITABLE CONTENT
   File:  OMDE11044-content.js
   Module: OMDE11044 — Learning Theory, Instructional Design & Technology
   --------------------------------------------------------------
   A "hybrid" branching scenario engine: a FORKING decision graph
   PLUS four hidden meters that some branches require to unlock.

   This file is a content-only sibling of branching-content.js. It
   reuses the SAME engine (branching-app.jsx) and the SAME styles
   (branching-styles.css). To run it, load THIS file instead of
   branching-content.js — see "OMDE11044 Branching Scenario.html".

   This file defines everything the learner reads or chooses:
     SECTION 1 — Meta (module code + scenario title)
     SECTION 2 — Intro screen
     SECTION 3 — Scenario context
     SECTION 4 — Meters (the four hidden dials)
     SECTION 5 — Lesson link pools (reused across options)
     SECTION 6 — GRAPH A "Forking Path" (topology diverges)
     SECTION 7 — GRAPH B "Pressure System" (meter-gated doors)
     SECTION 8 — Endings (forking terminals + meter-profile endings)
     SECTION 9 — UI labels

   NODE shape (decision):
     {
       id, eyebrow, question, prompt,
       options: [
         {
           label,                 // short text shown ON the pill
           summary,               // revealed under the pill when picked
           reflection,            // shown in the end-of-scenario debrief
           lessons: [LESSON.x],   // readings shown in the debrief
           effects: { pedagogy, engagement, feasibility, buyin },  // meter deltas
           next: 'nodeId' | endingId | 'RESOLVE',                  // where it leads
           gate: (m) => boolean,  // OPTIONAL — option is LOCKED until true
           gateHint: 'Locked — requires …'                        // shown when locked
         }
       ]
     }
   ============================================================ */

(function () {


/* ──────────────────────────────────────────────────────────────
   SECTION 1 — META
   ────────────────────────────────────────────────────────────── */
const META = {
  code:    "OMDE11044",
  eyebrow: "Branching Scenario",
  title:   "The Redesign Brief: Designing Learning That Sticks",
};


/* ──────────────────────────────────────────────────────────────
   SECTION 2 — INTRO SCREEN
   ────────────────────────────────────────────────────────────── */
const INTRO = {
  left: {
    heading: "Branching Scenario",
    bodyParas: [
      "This is a branching simulation. Unlike a fixed quiz, the path you travel is built by your decisions — different choices open different scenes, and some routes only unlock if your earlier design work has earned them.",
      "Four dimensions of the project respond quietly to every choice you make: Pedagogical Integrity, Learner Engagement, Delivery Feasibility, and Stakeholder Buy-in. You won't see the dials while you play — only at the end, when the consequences are revealed.",
      "There is no single right answer. There are stronger and weaker ways to design under constraint, and a map at the end will show the road you took and the roads you didn't.",
    ],
    cta: "Choose a structure below, then click Continue to begin.",
  },
  right: {
    heading: "Learning Objectives",
    lead: "By the end of this activity, learners will be able to:",
    objectives: [
      "Apply Knowles' principles of andragogy to redesign a course for self-directed, experience-rich adult learners.",
      "Evaluate problem-based, experiential (Kolb), and gamified designs against authentic, real-world learning goals.",
      "Align an instructional-design model (ADDIE, Dick & Carey, ASSURE) and educational technology to learner needs, accessibility, and evaluation.",
    ],
  },
};


/* ──────────────────────────────────────────────────────────────
   SECTION 3 — SCENARIO CONTEXT
   ────────────────────────────────────────────────────────────── */
const CONTEXT = {
  eyebrow:  "Introduction",
  heading:  "Scenario (Problem / Context)",
  paragraphs: [
    "You are the newly appointed Lead Learning Designer at \"Beacon Professional Academy,\" which delivers a flagship online certificate to working adults. You have one term \u2014 twelve weeks \u2014 to redesign and pilot the failing course before the next cohort enrols.",
    "The diagnosis is grim. Completion sits at 38%, and learners call the course irrelevant \u2014 generic theory, content-dumped modules, and a final exam that tests things never taught. A long-serving subject-matter expert is sceptical of any change to \u201chis\u201d material. And the Programme Director has set a hard target: redesign, pilot, and launch within budget.",
  ],
  bold:
    "Balance adult-learning principles, sound instructional design, accessible technology, and evaluation — or watch the redesign unravel. Every choice moves the dials you cannot see.",
};


/* ──────────────────────────────────────────────────────────────
   SECTION 4 — METERS
   The four hidden dials. Each starts at `start` (0–100).
   ────────────────────────────────────────────────────────────── */
const METERS = [
  { key: "pedagogy",   label: "Pedagogical Integrity", short: "Pedagogy",    color: "#7a6cd6" },
  { key: "engagement", label: "Learner Engagement",    short: "Engagement",  color: "#59a85f" },
  { key: "feasibility",label: "Delivery Feasibility",  short: "Feasibility", color: "#ed8b2b" },
  { key: "buyin",      label: "Stakeholder Buy-in",    short: "Buy-in",      color: "#3b7fc7" },
];
const METER_START = { pedagogy: 50, engagement: 50, feasibility: 50, buyin: 50 };


/* ──────────────────────────────────────────────────────────────
   SECTION 5 — LESSON LINK POOLS
   Reused across options so you only edit a URL once.
   (URLs taken from the OMDE11044 lesson notes, Lessons 5–8.)
   ────────────────────────────────────────────────────────────── */
const BASE = "https://www.openlearning.com/rafflesuniversity/courses/omed12033-learning-theory-instructional-design-and-technology/";
const LESSON = {
  andragogy:   { title: "5.1 Introduction to Andragogy",                                  url: BASE + "51-introduction-to-andragogy/" },
  principles:  { title: "5.2 Knowles' Principles of Adult Learning",                      url: BASE + "52-knowles-principles-of-adult-learning/" },
  adImpl:      { title: "5.3 Implications of Andragogy for Instructional Design",         url: BASE + "53-implications-of-andragogy-for-instructional-design/" },
  adCritique:  { title: "5.4 Critiques and Limitations of Andragogy",                     url: BASE + "54-critiques-and-limitations-of-andragogy/" },
  pbl:         { title: "6.2 Designing for Problem-Based Learning (PBL)",                 url: BASE + "62-designing-for-problem-based-learning-pbl/" },
  experiential:{ title: "6.4 Designing for Experiential Learning Activities (Kolb)",      url: BASE + "64-designing-for-experiential--learning-activities/" },
  gamification:{ title: "6.6 Applying Gamification Principles",                           url: BASE + "66-applying-gamification-principles/" },
  idProcess:   { title: "7.2 The Instructional Design Process",                           url: BASE + "72-the-instructional-design-process-/" },
  addie:       { title: "7.4 The ADDIE Model",                                            url: BASE + "74-the-addie-model-/" },
  dickCarey:   { title: "7.5 The Dick and Carey Model",                                   url: BASE + "75-the-dick-and-carey-model/" },
  evaluation:  { title: "7.8 Evaluation within ID Models",                                url: BASE + "78-evaluation-within-id-models/" },
  edtech:      { title: "8.2 Types of Educational Technologies",                          url: BASE + "82-types-of-educational-technologies/" },
  accessibility:{title: "8.3 Technology for Diverse Learners — Accessibility & Differentiation", url: BASE + "83-technology-for-diverse-learners-accessibility-and-differentiation/" },
  selectTech:  { title: "8.5 Evaluating and Selecting Educational Technology",            url: BASE + "85-evaluating-and-selecting-educational-technology/" },
};


/* ──────────────────────────────────────────────────────────────
   SECTION 6 — GRAPH A: "FORKING PATH"
   The SHAPE of the journey changes. Your first move sends you down
   a genuinely different middle act before the paths reconverge.
   ────────────────────────────────────────────────────────────── */
const FORKING = {
  key:   "forking",
  start: "f1",
  nodes: {

    /* ---- ACT 1 — the fork ------------------------------------ */
    f1: {
      eyebrow:  "Week One",
      question: "It is your first week. The certificate sits at 38% completion and the next cohort enrols in twelve weeks. The whole team is watching how you will lead the redesign. Where do you put your first energy?",
      prompt:   "What is your first move?",
      options: [
        {
          label: "Start with the learners",
          summary: "Run a learner analysis — interview the working adults and find out what they actually need.",
          reflection: "An andragogy-led opening: you treat the adults as self-directed, experience-rich learners and gather ground truth before designing. It costs early momentum on the build, but it grounds every later decision in real learner needs and the 'WIIFM'.",
          lessons: [LESSON.andragogy, LESSON.principles],
          effects: { pedagogy: 2, engagement: 12, feasibility: -6, buyin: 6 },
          next: "f2_learners",
        },
        {
          label: "Lock the scope",
          summary: "Demand a fixed project plan, timeline and budget from the team in week one.",
          reflection: "A delivery-first opening. The Director will like the certainty, but committing scope before you understand learners or the content's flaws risks hard-wiring the very problems that sank the old course.",
          lessons: [LESSON.idProcess, LESSON.addie],
          effects: { pedagogy: 0, engagement: -8, feasibility: 12, buyin: -2 },
          next: "f2_scope",
        },
        {
          label: "Fix the blueprint",
          summary: "Commission a full instructional-design audit of objectives, activities and assessment.",
          reflection: "You treat the inherited design flaws as the first priority. An alignment audit is the right instinct for a course with a mismatched exam — though auditing before you have relationships or learner data can read as ivory-tower process.",
          lessons: [LESSON.idProcess, LESSON.dickCarey],
          effects: { pedagogy: 12, engagement: 0, feasibility: -6, buyin: 6 },
          next: "f2_design",
        },
      ],
    },

    /* ---- ACT 2A — the ANDRAGOGY branch ----------------------- */
    f2_learners: {
      eyebrow:  "The Learner Analysis",
      question: "Your interviews confirm the worst: the adults find the course irrelevant — generic theory disconnected from their jobs, and mandatory modules they resent. One learner says she 'already knows half of it and can't use the other half.'",
      prompt:   "How do you redesign around them?",
      options: [
        {
          label: "Anchor in relevance",
          summary: "Rebuild each module around learners' real workplace problems; lead with the 'WIIFM' and draw on their experience.",
          reflection: "Textbook Knowles: adults are relevance-driven, internally motivated, and bring a reservoir of experience. Organising the course around authentic tasks rather than subject matter is the evidence-based fix for disengagement.",
          lessons: [LESSON.principles, LESSON.adImpl],
          effects: { pedagogy: 8, engagement: 10, feasibility: -4, buyin: 6 },
          next: "f3",
        },
        {
          label: "Mandate completion",
          summary: "Keep the content; add stricter deadlines and a hard completion-gate to force learners through.",
          reflection: "Compelling completion by pressure treats the symptom, not the cause. Adults driven by external coercion rather than relevance disengage further — you would be deepening exactly the resentment the analysis uncovered.",
          lessons: [LESSON.andragogy, LESSON.adCritique],
          effects: { pedagogy: 4, engagement: -8, feasibility: 0, buyin: -4 },
          next: "f3",
        },
      ],
    },

    /* ---- ACT 2B — the FEASIBILITY branch --------------------- */
    f2_scope: {
      eyebrow:  "The Build Plan",
      question: "Your team hands you a plan that ships on time and on budget — but a third of it is generic off-the-shelf e-learning: slides, a narrator, and a quiz bolted on at the end.",
      prompt:   "How do you respond to the plan?",
      options: [
        {
          label: "Reject & rebuild",
          summary: "Refuse the shovelware; design authentic, problem-based modules even if it is slower.",
          reflection: "You protect the learning at the cost of speed. PBL uses ill-structured, real-world problems with no single right answer — the opposite of content-dump e-learning, and far more likely to retain working adults.",
          lessons: [LESSON.pbl, LESSON.experiential],
          effects: { pedagogy: 10, engagement: 6, feasibility: -6, buyin: 6 },
          next: "f3",
        },
        {
          label: "Phased compromise",
          summary: "Use off-the-shelf for foundational facts; build bespoke, applied modules for the core skills.",
          reflection: "A defensible middle path. The andragogy critique itself concedes that adults sometimes need structured, didactic delivery for genuinely new foundational material — provided the applied core stays authentic. The risk is the 'temporary' shovelware quietly becomes the whole course.",
          lessons: [LESSON.adCritique, LESSON.pbl],
          effects: { pedagogy: -2, engagement: -2, feasibility: 6, buyin: 0 },
          next: "f3",
        },
        {
          label: "Ship it",
          summary: "Accept the generic package as-is to show fast, on-budget delivery.",
          reflection: "Banking a quick, cheap launch by shipping content-dump e-learning trades durable learning for an on-time headline. You would relaunch the same irrelevant course in a new wrapper — and the completion rate will tell the same story.",
          lessons: [LESSON.addie, LESSON.evaluation],
          effects: { pedagogy: -12, engagement: -10, feasibility: 12, buyin: -6 },
          next: "f3",
        },
      ],
    },

    /* ---- ACT 2C — the ID-MODEL branch ------------------------ */
    f2_design: {
      eyebrow:  "The Alignment Audit",
      question: "The audit lands early and ugly: the stated objectives, the teaching activities, and the final exam don't line up. Learners are being assessed on skills the course never actually teaches.",
      prompt:   "What do you do with the finding?",
      options: [
        {
          label: "Realign systematically",
          summary: "Use a systems model (Dick & Carey) to map objectives → instruction → assessment end to end.",
          reflection: "A systems approach treats instruction as interconnected components and forces objective–activity–assessment alignment. It is disruptive mid-project, but it fixes the root defect rather than the surface of it.",
          lessons: [LESSON.dickCarey, LESSON.idProcess],
          effects: { pedagogy: 12, engagement: 0, feasibility: -6, buyin: 8 },
          next: "f3",
        },
        {
          label: "Patch the exam",
          summary: "Quietly rewrite the final assessment to match what is currently taught, and leave the rest.",
          reflection: "Re-aligning the exam to the content removes the most glaring unfairness, but it locks in whatever the objectives happen to be — including the weak ones. A cosmetic fix that leaves the underlying design unexamined.",
          lessons: [LESSON.evaluation],
          effects: { pedagogy: -2, engagement: 0, feasibility: 2, buyin: -2 },
          next: "f3",
        },
        {
          label: "Note it for launch",
          summary: "Log the misalignment as a known issue and press on to hit the launch date.",
          reflection: "Shipping a course you know assesses untaught material is the gravest option here. It converts a fixable design flaw into a fairness problem that lands on learners and, eventually, on your own credibility.",
          lessons: [LESSON.idProcess],
          effects: { pedagogy: -10, engagement: 0, feasibility: 4, buyin: -6 },
          next: "f3",
        },
      ],
    },

    /* ---- ACT 3 — convergence: the pilot & the accessibility flag */
    f3: {
      eyebrow:  "The Pilot",
      question: "Whatever path you took, you run a small pilot. A learning-support specialist comes to you privately: the new gamified, media-rich design excites most learners — but it locks out anyone using a screen reader or a low-bandwidth device. The launch team wants to ship regardless. She has raised it with no one else.",
      prompt:   "How do you handle the finding?",
      options: [
        {
          label: "Fix it properly",
          summary: "Treat the formative-evaluation finding as stop-ship: rebuild for accessibility and differentiation before launch.",
          reflection: "Correct. Formative evaluation exists precisely to catch this before launch, and accessible design (keyboard navigation, screen-reader support, adjustable display, low-bandwidth fallback) removes barriers for every learner. You treat inclusion as core, not optional.",
          lessons: [LESSON.accessibility, LESSON.evaluation],
          effects: { pedagogy: 12, engagement: 6, feasibility: 0, buyin: 10 },
          next: "f4_high",
        },
        {
          label: "Patch the worst bits",
          summary: "Add captions and a text fallback yourself, informally, without a real accessibility review.",
          reflection: "Acting on the flag beats ignoring it, but patching it personally with no proper review leaves real barriers in place and no record that they were checked. Good intentions, weak process.",
          lessons: [LESSON.accessibility],
          effects: { pedagogy: -2, engagement: -2, feasibility: 0, buyin: -2 },
          next: "f4_high",
        },
        {
          label: "Launch and iterate",
          summary: "Ship now; log accessibility as a post-launch fix and let the support team field complaints.",
          reflection: "Shipping a course you know excludes disabled and low-bandwidth learners, and pushing the problem onto support, is the classic evaluation failure: you ignore the formative signal and convert a design fix into a live exclusion.",
          lessons: [LESSON.accessibility, LESSON.evaluation],
          effects: { pedagogy: -10, engagement: -6, feasibility: 0, buyin: -8 },
          next: "f4_low",
        },
      ],
    },

    /* ---- ACT 4 — the budget squeeze, arriving from strength -- */
    f4_high: {
      eyebrow:  "Week Eighty",
      question: "The pilot is a hit and the Programme Director wants the final cost saving. She proposes scrapping the experiential simulation and the learning-analytics dashboard to get there.",
      prompt:   "What is your recommendation to the Director?",
      options: [
        {
          label: "Defend the core",
          summary: "Make the experiential-learning and evaluation case; find the saving elsewhere.",
          reflection: "Defending the simulation protects the Concrete-Experience and Active-Experimentation stages of Kolb's cycle, and keeping the analytics protects your ability to evaluate and improve. You can't sustain a course you can neither apply nor measure.",
          lessons: [LESSON.experiential, LESSON.evaluation],
          effects: { pedagogy: 8, engagement: 2, feasibility: -4, buyin: 8 },
          next: "end_steward",
        },
        {
          label: "Scale, don't scrap",
          summary: "Keep the core simulation but pause the analytics dashboard for a year.",
          reflection: "A defensible compromise that preserves the experiential heart of the course while deferring the measurement layer. It buys budget without gutting the learning — provided the 'pause' on evaluation does not become permanent blindness.",
          lessons: [LESSON.experiential],
          effects: { pedagogy: 2, engagement: 0, feasibility: 4, buyin: 0 },
          next: "end_balanced",
        },
        {
          label: "Cut it",
          summary: "Scrap both the simulation and the analytics to bank the saving and close on budget.",
          reflection: "Treating the experiential core and the evaluation loop as switch-off-able spend hollows the course back into the content-dump it started as. After everything you built, this quietly undoes it.",
          lessons: [LESSON.experiential, LESSON.evaluation],
          effects: { pedagogy: -12, engagement: -2, feasibility: 10, buyin: -6 },
          next: "end_traded",
        },
      ],
    },

    /* ---- ACT 4 — the budget squeeze, arriving from weakness -- */
    f4_low: {
      eyebrow:  "Week Eighty",
      question: "The accessibility complaints from the pilot are now circulating among faculty. The Director, uneasy, still wants her final saving — and is pushing to scrap the experiential simulation and the analytics to find it.",
      prompt:   "What is your recommendation to the Director?",
      options: [
        {
          label: "Defend the core",
          summary: "Try to hold the line on the simulation and evaluation despite the credibility you have lost.",
          reflection: "The right call on substance — but made from a weakened position. With buy-in already drained by the accessibility mishandling, principled stands read as defensiveness. Design capital has to be banked before you need to spend it.",
          lessons: [LESSON.experiential, LESSON.evaluation],
          effects: { pedagogy: 6, engagement: 2, feasibility: -4, buyin: 4 },
          next: "end_recovered",
        },
        {
          label: "Scale, don't scrap",
          summary: "Offer a partial cut to keep the Director onside while you steady the project.",
          reflection: "A survival compromise. It keeps you in the room, but trading the evaluation layer for political cover while accessibility complaints spread rarely buys lasting stability.",
          lessons: [LESSON.experiential, LESSON.idProcess],
          effects: { pedagogy: -2, engagement: -2, feasibility: 4, buyin: -2 },
          next: "end_fragile",
        },
        {
          label: "Cut it",
          summary: "Give the Director everything she wants to rebuild your own standing.",
          reflection: "Abandoning the experiential core and the evaluation loop on top of an accessibility failure stacks risk on risk. You hit the budget while quietly dismantling the things that made the redesign worth doing.",
          lessons: [LESSON.experiential, LESSON.evaluation],
          effects: { pedagogy: -12, engagement: -6, feasibility: 10, buyin: -8 },
          next: "end_scandal",
        },
      ],
    },
  },
};


/* ──────────────────────────────────────────────────────────────
   SECTION 7 — GRAPH B: "PRESSURE SYSTEM"
   Everyone walks the SAME five decision points — but several
   options are GATED behind meter thresholds. Earlier decisions
   open or close the doors you find later. Locked doors stay
   visible, so learners see the consequence of their record.
   ────────────────────────────────────────────────────────────── */
const PRESSURE = {
  key:   "pressure",
  start: "p1",
  resolveByMeters: true,   // endings chosen from the meter profile
  nodes: {

    p1: {
      eyebrow:  "Week One",
      question: "It is your first week. How you open will set the dials that decide which doors stay open later.",
      prompt:   "What is your first move?",
      options: [
        {
          label: "Start with the learners",
          summary: "An andragogy-led opening — learner interviews and needs analysis before any build.",
          reflection: "Builds Engagement and Buy-in early. Those reserves are exactly what later options will demand.",
          lessons: [LESSON.andragogy, LESSON.principles],
          effects: { pedagogy: 2, engagement: 12, feasibility: -6, buyin: 6 },
          next: "p2",
        },
        {
          label: "Lock the scope",
          summary: "A delivery-first opening — fixed plan, timeline and budget demanded in week one.",
          reflection: "Buys Feasibility at the cost of Engagement and Buy-in. It can unlock options that need money, but starves the ones that need goodwill.",
          lessons: [LESSON.idProcess, LESSON.addie],
          effects: { pedagogy: 0, engagement: -8, feasibility: 12, buyin: -2 },
          next: "p2",
        },
        {
          label: "Fix the blueprint",
          summary: "A design-first opening — a full alignment audit commissioned at once.",
          reflection: "Banks Pedagogy and Buy-in early — the currency the Director's later decisions will require.",
          lessons: [LESSON.idProcess, LESSON.dickCarey],
          effects: { pedagogy: 12, engagement: 0, feasibility: -6, buyin: 6 },
          next: "p2",
        },
      ],
    },

    p2: {
      eyebrow:  "Relevance",
      question: "Learners find the course irrelevant — generic theory with no link to their jobs. How you respond depends partly on what you can afford.",
      prompt:   "How do you rebuild for relevance?",
      options: [
        {
          label: "Anchor in relevance",
          summary: "Rebuild around real workplace problems; lead with the 'WIIFM' and learners' experience.",
          reflection: "The evidence-based fix: adults are relevance-driven and internally motivated — organise around authentic tasks, not subject matter.",
          lessons: [LESSON.principles, LESSON.adImpl],
          effects: { pedagogy: 8, engagement: 10, feasibility: -4, buyin: 6 },
          next: "p3",
        },
        {
          label: "Mandate completion",
          summary: "Keep the content; add stricter deadlines and a hard completion-gate.",
          reflection: "Coerced completion drives adults further from the material — it treats the symptom and worsens the cause.",
          lessons: [LESSON.andragogy, LESSON.adCritique],
          effects: { pedagogy: 4, engagement: -8, feasibility: 0, buyin: -4 },
          next: "p3",
        },
        {
          label: "Bring in an external learning studio",
          summary: "Engage a specialist studio to rebuild the modules as authentic, problem-based learning.",
          reflection: "The gold-standard rebuild — but you can only fund it if Delivery Feasibility is healthy. A door money opens.",
          lessons: [LESSON.pbl, LESSON.experiential],
          effects: { pedagogy: 10, engagement: 8, feasibility: -8, buyin: 6 },
          gate: (m) => m.feasibility >= 55,
          gateHint: "Locked — requires Delivery Feasibility \u2265 55",
          next: "p3",
        },
      ],
    },

    p3: {
      eyebrow:  "The Alignment Problem",
      question: "An audit shows the objectives, activities and final exam don't line up — learners are tested on untaught skills. Your options now depend on the credibility you've banked.",
      prompt:   "How do you fix the design?",
      options: [
        {
          label: "Full systems redesign",
          summary: "Run a Dick & Carey systems redesign, mapping objectives → instruction → assessment end to end.",
          reflection: "The most rigorous route — but the SME and Director only back a disruptive, ground-up redesign if they already trust you. A door buy-in opens.",
          lessons: [LESSON.dickCarey, LESSON.idProcess],
          effects: { pedagogy: 12, engagement: -2, feasibility: 0, buyin: 8 },
          gate: (m) => m.buyin >= 55,
          gateHint: "Locked — requires Stakeholder Buy-in \u2265 55",
          next: "p4",
        },
        {
          label: "Commission an external ID review",
          summary: "Hire an independent instructional designer to re-map the alignment at arm's length.",
          reflection: "Rigorous and independent, if costly. Always available — design integrity you can buy when you can't yet borrow trust.",
          lessons: [LESSON.idProcess, LESSON.evaluation],
          effects: { pedagogy: 10, engagement: 0, feasibility: -6, buyin: 4 },
          next: "p4",
        },
        {
          label: "Patch the exam",
          summary: "Quietly rewrite the assessment to match what is currently taught, and leave the rest.",
          reflection: "Removes the worst unfairness but locks in weak objectives and leaves the underlying design unexamined.",
          lessons: [LESSON.evaluation],
          effects: { pedagogy: -8, engagement: 0, feasibility: 2, buyin: -6 },
          next: "p4",
        },
      ],
    },

    p4: {
      eyebrow:  "The Accessibility Flag",
      question: "A learning-support specialist brings you a pilot finding: the gamified, media-rich design locks out screen-reader and low-bandwidth learners. The launch team wants to ship regardless.",
      prompt:   "How do you handle the finding?",
      options: [
        {
          label: "Fix it properly",
          summary: "Stop-ship: rebuild for accessibility and differentiation before launch.",
          reflection: "Upholds inclusive design and the purpose of formative evaluation — catch and fix barriers before launch, for every learner.",
          lessons: [LESSON.accessibility, LESSON.evaluation],
          effects: { pedagogy: 12, engagement: 6, feasibility: 0, buyin: 10 },
          next: "p5",
        },
        {
          label: "Launch and iterate",
          summary: "Ship now; log accessibility as a post-launch fix for the support team.",
          reflection: "Ignores the formative signal and converts a design fix into a live exclusion — the classic evaluation failure.",
          lessons: [LESSON.accessibility, LESSON.evaluation],
          effects: { pedagogy: -10, engagement: -6, feasibility: 0, buyin: -8 },
          next: "p5",
        },
      ],
    },

    p5: {
      eyebrow:  "The Budget Squeeze",
      question: "Week eighty. The Director wants her final saving and proposes scrapping the experiential simulation and the analytics to find it. Whether you can hold the line depends on the design record behind you.",
      prompt:   "What is your recommendation?",
      options: [
        {
          label: "Defend the core",
          summary: "Make the experiential-learning and evaluation case; find the saving elsewhere.",
          reflection: "You can only win this argument if your pedagogical record gives you the standing to make it. A door pedagogy opens.",
          lessons: [LESSON.experiential, LESSON.evaluation],
          effects: { pedagogy: 8, engagement: 2, feasibility: -4, buyin: 8 },
          gate: (m) => m.pedagogy >= 60,
          gateHint: "Locked — requires Pedagogical Integrity \u2265 60",
          next: "RESOLVE",
        },
        {
          label: "Scale, don't scrap",
          summary: "Keep the core simulation but pause the analytics dashboard for a year.",
          reflection: "Preserves the experiential heart while deferring the measurement layer — workable, if the pause doesn't become blindness.",
          lessons: [LESSON.experiential],
          effects: { pedagogy: 2, engagement: 0, feasibility: 4, buyin: 0 },
          next: "RESOLVE",
        },
        {
          label: "Cut it",
          summary: "Scrap both to bank the saving and close on budget.",
          reflection: "Treats the experiential core and evaluation as discretionary spend — a one-off saving against the course's durable value.",
          lessons: [LESSON.experiential, LESSON.evaluation],
          effects: { pedagogy: -12, engagement: -2, feasibility: 10, buyin: -6 },
          next: "RESOLVE",
        },
      ],
    },
  },
};


/* ──────────────────────────────────────────────────────────────
   SECTION 8 — ENDINGS
   ‣ FORKING terminals: fixed narrative per path. The TIER (color)
     is computed from your final meters by the engine.
   ‣ PRESSURE endings: chosen from the final meter profile.
   ────────────────────────────────────────────────────────────── */
const FORKING_ENDINGS = {
  end_steward: {
    tier: "good",
    title: "Trusted Designer",
    body: "The certificate turns the corner. A relevance-led, problem-based redesign re-engaged the adults, the accessibility rebuild held, and a defended experiential core with live analytics positions the course to keep improving. Beacon's Director sees a designer who can pair sound pedagogy with delivery — and the redesign becomes the template for the whole programme.",
  },
  end_balanced: {
    tier: "moderate",
    title: "Steady Build",
    body: "You delivered the redesign without breaking the things that matter. Pausing the analytics leaves a small blind spot in your evaluation story, but the learning design is intact and the Director trusts your judgement. A solid, defensible term's work.",
  },
  end_traded: {
    tier: "poor",
    title: "Shipped, Then Hollowed Out",
    body: "You ran a clean redesign and then traded its heart away at the finish, scrapping the simulation and the analytics for a one-off saving. The launch landed on budget; the slow slide back toward a content-dump course you created did not show up this term. It will show up in next year's completion rate.",
  },
  end_recovered: {
    tier: "moderate",
    title: "Partial Recovery",
    body: "Mishandling the accessibility flag cost you, and you spent the rest of the project paying it back. Defending the experiential core from a weakened position was the right instinct, but principled stands land softly when buy-in is already drained. You held the redesign together — just.",
  },
  end_fragile: {
    tier: "poor",
    title: "Fragile Launch",
    body: "A mishandled accessibility flag and a string of survival compromises leave the course outwardly launched and inwardly brittle. You are still in the room, still hitting most milestones — but the redesign runs on borrowed goodwill, and the first cohort's feedback will test how little is left.",
  },
  end_scandal: {
    tier: "catastrophic",
    title: "Failed Pilot, Recalled",
    body: "An ignored accessibility flag, a misaligned assessment, and a gutted experiential core combine into a perfect storm: exclusion complaints surface publicly, the pilot cohort's completion collapses, and faculty confidence evaporates. The launch is pulled and Beacon moves to replace its Lead Learning Designer.",
  },
};

/* Meter-profile endings for the PRESSURE graph (and as the engine's
   verdict source for tier color everywhere). Evaluated top to bottom;
   first match whose test passes is used. */
const METER_ENDINGS = [
  {
    tier: "good",
    test: (m, avg, min) => avg >= 66 && min >= 45,
    title: "Trusted Designer",
    body: "Every dial finished in healthy territory. You unlocked the hardest doors — the external studio rebuild, the full systems redesign, the defended experiential core — because your earlier work earned the standing to walk through them. The certificate relaunches as a relevant, rigorous, inclusive course.",
  },
  {
    tier: "moderate",
    test: (m, avg, min) => avg >= 54,
    title: "Mixed Signals",
    body: "A creditable term with one soft flank. You kept most of the design healthy, but the dimension you under-fed quietly closed a door or two you would have wanted open at the end. The course relaunches; the lesson is that design capital has to be banked before you need to spend it.",
  },
  {
    tier: "poor",
    test: (m, avg, min) => avg >= 40,
    title: "Running on Empty",
    body: "You hit some marks but drained the reserves that unlock the strong options. By the final act the doors that mattered — the systems redesign, the principled stand for the experiential core — were locked, and you were left choosing among the weaker routes. The course launches, diminished.",
  },
  {
    tier: "catastrophic",
    test: () => true,
    title: "Systemic Failure",
    body: "The dials collapsed together. Starved of engagement, pedagogy, and buy-in, every late door was locked and every remaining choice made things worse. The redesign ends facing the very problems the diagnosis warned about — irrelevance, misalignment, and exclusion — now relaunched and public.",
  },
];


/* ──────────────────────────────────────────────────────────────
   SECTION 9 — UI LABELS
   ────────────────────────────────────────────────────────────── */
const LABELS = {
  btnContinue: "CONTINUE",
  btnSubmit:   "SUBMIT",
  btnTryAgain: "START OVER",

  optionLabel: (n) => `OPTION ${n}`,

  /* structure switcher (intro) */
  structureHeading: "Choose a branching structure",
  structures: {
    forking:  { name: "Forking Path",     blurb: "Your first move sends you down a genuinely different middle act. The shape of the journey changes." },
    pressure: { name: "Pressure System",  blurb: "Everyone walks the same five decisions — but strong options stay LOCKED until your hidden meters earn them." },
  },

  /* debrief */
  debriefPrefix:    "Debrief:",
  debriefTitle:     "Outcome & Review",
  metersHeading:    "How the four dimensions finished",
  /* qualitative bands for each meter value (evaluated high → low) */
  meterBands: [
    { min: 78, label: "Strong",   color: "#2f7d36" },
    { min: 62, label: "Healthy",  color: "#59a85f" },
    { min: 45, label: "Strained", color: "#c98a2b" },
    { min: 30, label: "Fragile",  color: "#cf7032" },
    { min: 0,  label: "Critical", color: "#c44545" },
  ],
  /* debrief synthesis line — {strong}/{weak} are filled with meter names */
  meterSummaryHeading: "What the dials say",
  meterSummary: {
    good:        "A well-balanced run. {strong} is your standout, and even your weakest dimension, {weak}, held its ground — the mark of a designer who paid into every account before drawing on any.",
    moderate:    "A creditable result built on {strong}, but {weak} was left exposed. The redesign holds; the lesson is that the dimension you under-feed is the one that closes doors when you can least afford it.",
    poor:        "You leaned hard on {strong} while {weak} drained away. By the final act the reserves that unlock the strongest options were gone, leaving only the weaker routes.",
    catastrophic:"The dials collapsed together. {weak} gave way first and pulled the rest down with it — every late door locked, every remaining choice made things worse.",
  },
  mapHeading:       "The path you took",
  mapHint:          "Click any decision below to rewind to it and try a different branch.",
  mapOpenBtn:       "VIEW PATH MAP",
  hideMapBtn:       "HIDE",
  lockedLabel:      "LOCKED",
  reflectionHeading:"Why it played out this way",
  lessonsHeading:   "Readings that support this decision",
  rewindLabel:      "Rewind to here",
  notTakenLabel:    "Roads not taken",

  pageLabel: (n) => `DECISION ${n}`,
};


/* ──────────────────────────────────────────────────────────────
   EXPORT
   ────────────────────────────────────────────────────────────── */
window.BSCENARIO = {
  META, INTRO, CONTEXT,
  METERS, METER_START,
  GRAPHS: { forking: FORKING, pressure: PRESSURE },
  FORKING_ENDINGS, METER_ENDINGS,
  LABELS,
};
})();
