const ui = {
  routeLabel: "PETROV_1983",
  title: "Serpukhov-15 | Early warning",
  fallbackEnding: "petrov_near_miss",
};

const initialState = {
  chainEscalation: 0,
};

/** @type {import("../types.d.ts").Route} */
export const petrov1983 = {
  id: "petrov",
  ui,
  initialState,
  startNode: "p0_intro",
  nodes: {
    p0_intro: {
      type: "narration",
      meta: "SYSTEM> BOOT • classified terminal session",
      beats: [
        "1983. Soviet Union. Early-warning command post: Serpukhov-15.",
        "You are the duty officer. A chair that never gets comfortable. A phone that never stops being a threat.",
        "Fluorescent lights flicker. The hum never stops. Someone taped a paper calendar to a cabinet like it matters.",
        "The room smells like warm dust and recycled air.",
        "Outside: forest. Cold. Silence. A world that doesn't know it's on a timer.",
        "Your job is not to be brave.",
        "Your job is to be correct.",
        "Tonight the world is already tense: NATO exercises, rhetoric, mistakes that don't feel like mistakes anymore.",
        "Everyone in this room has memorized procedures meant to function when humans don't.",
        "A technician jokes quietly. Nobody laughs.",
        "On the wall: diagrams of systems that promise certainty.",
        "You watch a green map of the planet and the red arcs you pray never appear.",
        "You remind yourself: alerts are inputs. Not truth.",
      ],
      next: "p1_alarm",
    },

    p1_alarm: {
      type: "choice",
      meta: "ALERT> Satellite warning channel spikes.",
      preludeBeats: [
        "A siren cuts through the room like a blade.",
        "The big screen flashes: LAUNCH DETECTED.",
        "One missile. Then another indicator blinks.",
        "Your stomach drops. Your mouth goes dry.",
        "The computer has never been this confident.",
      ],
      timerSeconds: 12,
      defaultOptionId: "stall",
      options: [
        {
          id: "report_attack",
          label: "Report: confirmed US first strike",
          kind: "danger",
          effects: { chainEscalation: 3 },
          afterBeats: [
            "You pick up the phone and say the words that can't be unsaid.",
            "The line crackles. A superior voice turns ice-cold.",
            "You are told to keep feeding updates. You are not told to breathe.",
          ],
          next: "p2_more_signals",
        },
        {
          id: "report_uncertain",
          label: "Report: possible launch, awaiting corroboration",
          effects: { chainEscalation: 1 },
          afterBeats: [
            "You report, but you keep your voice measured.",
            "You emphasize: satellite data only. Ground radar not yet confirming.",
            "You can hear people on the other end moving faster.",
          ],
          next: "p2_more_signals",
        },
        {
          id: "stall",
          label: "Hold: treat as suspected false alarm (for now)",
          effects: { chainEscalation: 0 },
          afterBeats: [
            "You hesitate for half a breath, then you decide to buy time.",
            "You tell the team: verify. cross-check. do not panic.",
            "Your hand shakes. You keep it low so nobody sees.",
          ],
          next: "p2_more_signals",
        },
      ],
    },

    p2_more_signals: {
      type: "narration",
      meta: "FEED> Additional detections incoming.",
      beats: [
        "The screen flashes again.",
        "Not one missile. Five.",
        "If it's real, it's either the opening of the end—or a probe meant to decapitate leadership.",
        "The computer prints certainty like scripture.",
        "A technician says, barely audible: “It says it's real.”",
        "Somebody swears. Somebody crosses themselves.",
        "You taste copper. You realize you've been biting your cheek.",
        "You think: a real first strike would be massive. Why only five?",
        "You think: a machine doesn't know politics. It knows patterns.",
        "You think: patterns can lie.",
        "You think: if I am wrong, nobody will call it a mistake'. They'll call it a betrayal'.",
        "You stare at the data until it becomes meaningless. Then you force your eyes to re-focus.",
        //(s) => `State: chainEscalation=${s.chainEscalation} • doubt=${s.doubt}`,
      ],
      next: "p2b_verify",
    },

    p2b_verify: {
      type: "choice",
      meta: "VERIFY> You can spend seconds to create evidence—at the cost of time.",
      preludeBeats: [
        "A voice in your head says: decide now.",
        "Another voice says: verify now.",
        "You choose which voice becomes history.",
      ],
      timerSeconds: 9,
      defaultOptionId: "diagnostics",
      options: [
        {
          id: "diagnostics",
          label: "Run diagnostics + cross-check channels",
          effects: { chainEscalation: -1 },
          afterBeats: [
            "You order a quick diagnostic sweep.",
            "Secondary channels show noise—nothing consistent with a real salvo.",
            "It isn't proof. It's weight on the scale.",
          ],
          next: "p3_call_style",
        },
        {
          id: "push_radar",
          label: "Demand immediate ground radar confirmation",
          effects: { chainEscalation: 0 },
          afterBeats: [
            "You lean into the radar operator's station.",
            "You make it clear: you need a track, not a feeling.",
          ],
          next: "p3_call_style",
        },
        {
          id: "trust_machine",
          label: "Trust the computer and move fast",
          kind: "danger",
          effects: { chainEscalation: 2 },
          afterBeats: [
            "You decide speed is safety.",
            "The room shifts to action. The machine leads; humans follow.",
          ],
          next: "p3_call_style",
        },
      ],
    },

    p3_call_style: {
      type: "choice",
      meta: "COMMS> Leadership channel is waiting for your wording.",
      preludeBeats: [
        "Your superior asks a single question: “Your assessment?”",
        "The room listens to your answer like a jury listens to a verdict.",
        "In your mind you see two futures: one where you are praised for firmness, and one where you are cursed for it.",
      ],
      timerSeconds: 10,
      defaultOptionId: "procedural",
      options: [
        {
          id: "procedural",
          label: "Use strict procedure wording (high confidence tone)",
          effects: { chainEscalation: 2 },
          afterBeats: [
            "You speak in the language of checklists and certainty markers.",
            "The other end becomes clipped, fast, professional.",
            "Orders begin moving up the ladder like sparks on dry grass.",
          ],
          next: "p4_wait_radar",
        },
        {
          id: "measured",
          label: "Keep it measured: emphasize lack of radar corroboration",
          effects: { chainEscalation: 1 },
          afterBeats: [
            "You say: “We have satellite indications. No ground radar confirmation yet.”",
            "You can hear a pause—someone deciding whether to trust you or the machine.",
          ],
          next: "p4_wait_radar",
        },
        {
          id: "challenge",
          label: "Challenge the system: “Likely false positive.”",
          effects: { chainEscalation: -1 },
          afterBeats: [
            "You commit to a judgment that can ruin you—or save everyone.",
            "A sharp reply: “On what basis?”",
            "You answer: the pattern doesn't fit. the radar is silent. and you have a gut you can't prove.",
          ],
          next: "p4_wait_radar",
        },
      ],
    },

    p4_wait_radar: {
      type: "narration",
      meta: "SILENCE> The longest minutes are the ones you can't reclaim.",
      beats: [
        "Ground radar should see something soon if the missiles are real.",
        "You do math you don't want to do: time-to-target, command latency, how quickly fear turns into orders.",
        "You look at the clock. It looks back.",
        "Your team keeps scanning, re-checking, whispering calculations.",
        "Somewhere, far above, satellite sensors watch sunlight reflecting off clouds.",
        "You imagine a man in another bunker reading your words and tasting the same copper fear.",
        "If you're wrong, you are the man who hesitated while war arrived.",
        "If the machine is wrong, you are the man who kept the world from burning by refusing to believe a screen.",
        "A junior officer asks: “Should we escalate?”",
        "No one else wants to own the decision. They want it to be procedure. They want it to be you.",
      ],
      next: "p5_last_decision",
    },

    p5_last_decision: {
      type: "choice",
      meta: "DECISION> Your next action can lock in escalation—or slow it.",
      preludeBeats: [
        "You have one lever left: what you insist on before the system takes over.",
        "The pressure is physical, like hands on your throat.",
      ],
      timerSeconds: 11,
      defaultOptionId: "wait",
      options: [
        {
          id: "escalate_now",
          label: "Escalate: urge immediate retaliatory posture",
          kind: "danger",
          effects: { chainEscalation: 3 },
          afterBeats: [
            "You urge readiness. Not words—posture.",
            "Somewhere else, other people open sealed envelopes and start turning keys.",
            "You can't see them. You can only imagine them.",
          ],
          next: {
            branches: [
              {
                when: (s) => s.chainEscalation >= 6,
                to: "p_end_global",
              },
            ],
            fallback: "p6_radar_reveal",
          },
        },
        {
          id: "wait",
          label: "Insist on corroboration: wait for ground radar",
          effects: { chainEscalation: -1 },
          afterBeats: [
            "You say: “We wait for radar. We do not move based on satellites alone.”",
            "Your voice sounds calm. Your pulse is not.",
          ],
          next: "p6_radar_reveal",
        },
        {
          id: "quiet_down",
          label: "De-escalate wording: “Unconfirmed signal; possible error.”",
          effects: { chainEscalation: -2 },
          afterBeats: [
            "You soften the language like padding around a live wire.",
            "You know this can be read as weakness—or wisdom.",
          ],
          next: "p6_radar_reveal",
        },
      ],
    },

    p6_radar_reveal: {
      type: "narration",
      meta: "RADAR> Channel check returns.",
      beats: [
        "A radar operator calls out numbers.",
        "Then: nothing.",
        "No tracks. No inbound objects. No confirmations.",
        "The satellite feed still screams certainty.",
        "A thought forms slowly, like dawn: the system is wrong.",
        "Clouds. Sun angle. A pattern that fooled silicon into prophecy.",
        "Your hands finally stop shaking—because now you're angry at the machine.",
        "You log the event with words that sound too small for what almost happened.",
        "In the morning, the world will wake up and buy bread and argue and make plans.",
        "It will not know how close it came to being a story nobody could finish telling.",
      ],
      next: {
        branches: [
          {
            when: (s) => s.chainEscalation >= 5,
            to: "p_end_close_call",
          },
        ],
        fallback: "p_end_near_miss",
      },
    },

    p_end_near_miss: { type: "ending", endingId: "petrov_near_miss" },
    p_end_close_call: { type: "ending", endingId: "petrov_close_call" },
    p_end_global: { type: "ending", endingId: "petrov_global_exchange" },
  },

  endings: {
    petrov_near_miss: {
      title: "False Alarm | The screen blinks out",
      subtitle: "You delay escalation long enough for reality to reassert itself.",
      severity: "nearMiss",
      casualties: {
        value: "0 - 1k",
        note: "Indirect incidents only (accidents, stress events, isolated clashes).",
      },
      summary:
        "Ground radar never confirms the inbound tracks. The satellite alert is judged a false positive. Your reporting slows the chain reaction just enough that no irreversible orders are issued.",
      realLife:
        "In real life, Stanislav Petrov judged the 1983 warning as a false alarm and chose not to escalate. Later analysis suggested satellite sensors misread sunlight reflections off clouds as missile launches.",
      compared: "You handled it like Petrov if you resisted immediate escalation and waited for corroboration.",
      epilogue:
        "In the next 72 hours, leadership quietly reviews the incident while publicly saying nothing. Over the next decade, mistrust in automated warning grows, procedures tighten, and both sides invest in systems that can fail faster—raising the stakes for the next night when the screen lights up again.",
    },

    petrov_close_call: {
      title: "Close Call | Keys in motion",
      subtitle: "Escalation begins—but stops short of the point of no return.",
      severity: "regional",
      casualties: {
        value: "1M - 12M",
        note: "Conventional clashes + misfires + limited escalation; still extremely uncertain.",
      },
      summary:
        "Your early wording triggers heightened readiness. Units move. Communications spike. The world edges toward retaliation before ground radar absence forces a pause. The machine is blamed; humans keep their jobs by blaming each other.",
      realLife:
        "In real life, Petrov did not trigger a full readiness cascade based on the satellite alert alone; the incident remained contained inside the early-warning system.",
      compared:
        "This diverges from real history: you let escalation outrun verification, but the absence of radar tracks still gave people a last chance to stop.",
      epilogue:
        "In the next 72 hours, rumor leaks inside military circles and amplifies paranoia. Over the next decade, command-and-control becomes more hair-trigger, with added automation designed to ‘prevent hesitation'—a design goal that makes future mistakes harder to stop.",
    },

    petrov_global_exchange: {
      title: "World Ends | Retaliation spiral",
      subtitle: "You treat the signal as certain, and the system outruns doubt.",
      severity: "global",
      casualties: {
        value: "200M - 1.2B",
        note: "Full-scale nuclear exchange plus follow-on famine/collapse over time.",
      },
      summary:
        "Your report pushes the chain beyond the last human brakes. In the fog of incomplete data, retaliatory launches follow. The initial error becomes irrelevant the moment the first real warhead leaves its silo.",
      realLife:
        "In real life, this did not happen. The incident ended as a false alarm once corroboration failed.",
      compared:
        "This is the nightmare branch: you did the opposite of Petrov's restraint, treating an uncorroborated signal as certainty.",
      epilogue:
        "In the next 72 hours, global communications degrade and cities burn. Over the next decade, survivors live in fractured states under long winters of ash and hunger; history becomes a set of missing records and hard lessons taught too late.",
    },
  },
};

