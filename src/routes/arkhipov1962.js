const ui = {
  routeLabel: "ARKHIPOV_1962",
  title: "B-59 | Near Cuba",
  fallbackEnding: "arkhipov_near_miss",
};

const initialState = {
  worldTension: 3,
  crewTension: 2,
  misread: 0,
};

export const arkhipov1962 = {
  id: "arkhipov",
  ui,
  initialState,
  startNode: "a0_intro",
  nodes: {
    a0_intro: {
      type: "narration",
      meta: "SYSTEM> BOOT • compartment log",
      beats: [
        "1962. Caribbean Sea. The world holds its breath over Cuba.",
        "You are on the Soviet submarine B-59.",
        "Heat presses down like a physical weight. Air is stale. Sweat tastes metallic.",
        "Fans struggle. Condensation drips. Every surface is a reminder: you are not built to live here.",
        "You haven't had reliable radio contact in days.",
        "The battery is low. The air is worse. Each hour underwater makes every decision heavier.",
        "Above you: American ships. Sonar pings like a heartbeat you don't control.",
        "Ping. Pause. Ping. Like someone knocking on a coffin.",
        "You are the one who can say no when everyone else wants to say yes.",
        "You try to remember the last time you saw the sky.",
      ],
      next: "a1_depth_charges",
    },

    a1_depth_charges: {
      type: "choice",
      meta: "CONTACT> Explosions in the water. Not close enough to crack hull—close enough to be a message.",
      preludeBeats: [
        "A dull thump rolls through the metal, then another.",
        "Men look at each other in the half-light. Someone mutters: “They're attacking.”",
        "Someone else: “They're signaling. Forcing us up.”",
        "Your captain's face is tight with anger and exhaustion.",
      ],
      timerSeconds: 13,
      defaultOptionId: "assume_signal",
      options: [
        {
          id: "assume_attack",
          label: "Assume attack: prepare for combat response",
          kind: "danger",
          effects: { crewTension: 2, misread: 2, worldTension: 2 },
          afterBeats: [
            "You feel the room tilt toward violence.",
            "Orders become shorter. Hands move faster.",
            "The submarine feels smaller as fear fills the empty volume.",
          ],
          next: "a2_torpedo_vote",
        },
        {
          id: "assume_signal",
          label: "Assume signal: interpret charges as a warning to surface",
          effects: { crewTension: -1, misread: -1, worldTension: 0 },
          afterBeats: [
            "You argue: if they wanted you dead, the pattern would be different.",
            "You call it a warning—an attempt to force communication.",
          ],
          next: "a2_torpedo_vote",
        },
        {
          id: "uncertain",
          label: "Admit uncertainty: buy time and request internal verification",
          effects: { crewTension: 0, misread: 1, worldTension: 1 },
          afterBeats: [
            "You refuse to let the moment define itself.",
            "You ask for checks: sonar, damage, battery, oxygen. Anything real.",
          ],
          next: "a2_torpedo_vote",
        },
      ],
    },

    a2_torpedo_vote: {
      type: "narration",
      meta: "ARMAMENT> Special weapon protocol is discussed in voices that pretend to be calm.",
      beats: [
        "The captain brings up the special torpedo.",
        "A nuclear weapon in a tube, held by rules written far away from this heat.",
        "It is a weapon designed for a war nobody expects to survive, only to win.",
        "The submarine's political officer argues the Americans are starting war.",
        "Without radio contact, you can't know if Moscow is already burning.",
        "You can't know if a single torpedo would be retaliation—or ignition.",
        "The room turns to you.",
        "Your mind tries to build a map from fragments: sonar pings, explosions, silence from home.",
      ],
      next: "a2b_crew",
    },

    a2b_crew: {
      type: "choice",
      meta: "CREW> Fear has a momentum. You can redirect it—or ride it.",
      preludeBeats: [
        "The captain is furious. The political officer is certain. The sailors are exhausted.",
        "If you lose the room, you lose the decision.",
      ],
      timerSeconds: 10,
      defaultOptionId: "invoke_protocol",
      options: [
        {
          id: "calm",
          label: "Calm the room: frame charges as controlled signaling",
          effects: { crewTension: -1, misread: -1 },
          afterBeats: [
            "You speak softly, forcing everyone to lean in rather than shout.",
            "You describe the pattern: harassment, not destruction. Control, not chaos.",
          ],
          next: "a3_decide_launch",
        },
        {
          id: "back_captain",
          label: "Back the captain's anger (accept escalation as likely)",
          kind: "danger",
          effects: { crewTension: 1, misread: 1, worldTension: 1 },
          afterBeats: [
            "You give the captain social permission to be furious.",
            "The room's temperature rises. So does the probability of a mistake.",
          ],
          next: "a3_decide_launch",
        },
        {
          id: "invoke_protocol",
          label: "Invoke protocol: list conditions required before nuclear use",
          effects: { crewTension: 0, misread: 0 },
          afterBeats: [
            "You recite the rules like a spell against panic.",
            "It buys a thin layer of discipline—enough to keep hands steady.",
          ],
          next: "a3_decide_launch",
        },
      ],
    },

    a3_decide_launch: {
      type: "choice",
      meta: "VOTE> Consent is required. Your stance can block or unlock catastrophe.",
      preludeBeats: [
        "They want certainty from you. You only have responsibility.",
        "Your mouth is dry. The air tastes like battery acid.",
        "Somewhere above, sailors you cannot see are interpreting your silence as meaning.",
      ],
      timerSeconds: 12,
      defaultOptionId: "block",
      options: [
        {
          id: "approve",
          label: "Approve launch authorization",
          kind: "danger",
          effects: { worldTension: 3, crewTension: 1, misread: 2 },
          afterBeats: [
            "You say yes.",
            "It is a small word that changes everything.",
            "Men begin moving like a ritual they rehearsed for a day they hoped would never come.",
          ],
          next: {
            branches: [
              { when: (s) => s.misread >= 3 || s.worldTension >= 7, to: "a_end_global" },
            ],
            fallback: "a4_surface_or_hide",
          },
        },
        {
          id: "block",
          label: "Block launch: insist charges are a signal, not an attack",
          effects: { worldTension: -1, crewTension: -1, misread: -1 },
          afterBeats: [
            "You refuse.",
            "You say: we surface. we communicate. we do not light the fuse in the dark.",
            "The captain's jaw tightens. The political officer glares.",
          ],
          next: "a4_surface_or_hide",
        },
        {
          id: "delay",
          label: "Delay decision: demand surfacing attempt before any launch talk",
          effects: { worldTension: -1, crewTension: 0, misread: 0 },
          afterBeats: [
            "You push for a step that creates information: surfacing, signals, any contact.",
            "It's not safe. But neither is guessing.",
          ],
          next: "a4_surface_or_hide",
        },
      ],
    },

    a4_surface_or_hide: {
      type: "choice",
      meta: "MANEUVER> Battery is low. Air is worse. Above you: ships you cannot read.",
      preludeBeats: [
        "The captain weighs options: stay deep and silent, or surface and risk humiliation—or worse.",
        "Crew tempers fray. Someone coughs too long.",
        "Your head aches. It's hard to tell if it's anger, exhaustion, or CO₂.",
        "Another explosion rolls through the hull. A warning, or the opening of war.",
      ],
      timerSeconds: 14,
      defaultOptionId: "surface",
      options: [
        {
          id: "surface",
          label: "Surface and signal (accept exposure to avoid misunderstanding)",
          effects: { worldTension: -1, crewTension: -1, misread: -1 },
          afterBeats: [
            "You surface.",
            "Light stings. The ocean feels too open after days inside metal.",
            "American ships are there. Loud. Close. But not firing.",
            "Signal flags. Radio attempts. The world is still intact.",
          ],
          next: {
            branches: [{ when: (s) => s.worldTension <= 2, to: "a_end_near_miss" }],
            fallback: "a_end_close_call",
          },
        },
        {
          id: "stay_hidden",
          label: "Stay submerged and silent (risk misinterpretation)",
          kind: "danger",
          effects: { worldTension: 2, crewTension: 2, misread: 1 },
          afterBeats: [
            "You stay deep.",
            "The Americans keep pinging. The charges keep falling. The hull keeps trembling.",
            "Each minute without contact makes every theory more believable.",
          ],
          next: {
            branches: [{ when: (s) => s.crewTension >= 5 || s.worldTension >= 8, to: "a_end_global" }],
            fallback: "a_end_close_call",
          },
        },
        {
          id: "signal_underwater",
          label: "Attempt underwater communication procedures",
          effects: { worldTension: 0, crewTension: 0, misread: 0 },
          afterBeats: [
            "You try to follow protocol designed for calmer seas.",
            "It's slow. It's imperfect. But it's a thread back to reality.",
          ],
          next: "a_end_close_call",
        },
      ],
    },

    a_end_near_miss: { type: "ending", endingId: "arkhipov_near_miss" },
    a_end_close_call: { type: "ending", endingId: "arkhipov_close_call" },
    a_end_global: { type: "ending", endingId: "arkhipov_global_exchange" },
  },

  endings: {
    arkhipov_near_miss: {
      title: "Restraint |  You surface into reality",
      subtitle: "You choose communication over certainty-in-the-dark.",
      severity: "nearMiss",
      casualties: {
        value: "0 - 1k",
        note: "Indirect incidents only (accidents, stress events, isolated clashes).",
      },
      summary:
        "By blocking launch and forcing a surfacing attempt, you create the missing data: the Americans are signaling, not initiating war. The crisis remains a crisis—not an apocalypse.",
      realLife:
        "In real life, Vasili Arkhipov opposed launching a nuclear torpedo from B-59 during the Cuban Missile Crisis. The submarine eventually surfaced, and nuclear use was avoided.",
      compared: "You handled it like Arkhipov if you blocked launch and pushed for surfacing/communication.",
      epilogue:
        "In the next 72 hours, both sides step back from the edge while publicly posturing. Over the next decade, the world builds more direct communication channels, but also more weapons—trying to remove the need for judgment, while quietly depending on it anyway.",
    },

    arkhipov_close_call: {
      title: "Close Call | Misreadings multiply",
      subtitle: "You avoid immediate catastrophe, but escalation scars the system.",
      severity: "regional",
      casualties: {
        value: "1M - 12M",
        note: "Conventional escalation and cascading incidents; high uncertainty.",
      },
      summary:
        "Your decisions keep the torpedo in its tube, but the submarine's behavior and the surface fleet's responses intensify mutual fear. Several incidents elsewhere ignite conventional clashes before diplomats slam on the brakes.",
      realLife:
        "In real life, the torpedo was not used, and the immediate incident did not expand into regional war.",
      compared:
        "This diverges from real history: you avoided the torpedo, but your path still created enough fear and friction to spark broader conflict.",
      epilogue:
        "In the next 72 hours, emergency negotiations and backchannels race to contain a widening crisis. Over the next decade, doctrine shifts toward faster responses under uncertainty—making future restraint rarer, and therefore more valuable when it appears.",
    },

    arkhipov_global_exchange: {
      title: "World Ends | A single torpedo changes the century",
      subtitle: "You authorize (or fail to prevent) nuclear use under uncertainty.",
      severity: "global",
      casualties: {
        value: "200M - 1.2B",
        note: "Full-scale nuclear exchange plus follow-on famine/collapse over time.",
      },
      summary:
        "A nuclear detonation at sea convinces leaders on both sides that the war has begun. Retaliation follows, then counter-retaliation. The rest is arithmetic and smoke.",
      realLife:
        "In real life, Arkhipov's restraint helped prevent exactly this chain reaction during the crisis.",
      compared:
        "This is the catastrophic branch: you authorized or failed to block nuclear use where Arkhipov refused.",
      epilogue:
        "In the next 72 hours, panic, launches, and miscommunications cascade across continents. Over the next decade, the map of nations becomes a map of fragments; the future becomes survival, not progress, written in shortages and silence.",
    },
  },
};

