// lib/mockTasks.ts

import { Assignment, Subject, Task } from "./types";

const mathQuadraticLearningMap = {
  subject: "Math" as const,
  description: "Quadratic functions, factoring, and graph interpretation.",
  difficulty: "Beginner" as const,
  nodes: [
    {
      id: "def",
      title: "Definition",
      label: "Definition",
      icon: "📝",
      description: "What makes a function quadratic.",
      content: "A quadratic function has the form ax² + bx + c, where a ≠ 0.",
      color: "blue",
      example: "f(x) = x² - 4x + 3",
    },
    {
      id: "formula",
      title: "Formula",
      label: "Formula",
      icon: "📐",
      description: "Standard form and key equation.",
      content: "Use ax² + bx + c = 0 to solve, factor, or analyze roots.",
      color: "purple",
      example: "2x² - 7x + 3 = 0",
    },
    {
      id: "graph",
      title: "Graph Behavior",
      label: "Graph Behavior",
      icon: "📈",
      description: "How parabolas open and shift.",
      content: "Positive a opens upward; negative a opens downward.",
      color: "green",
      example: "y = -x² + 6x - 5 opens downward",
    },
    {
      id: "solve",
      title: "Solving Methods",
      label: "Solving Methods",
      icon: "🔧",
      description: "Ways to find roots.",
      content: "Factor, complete the square, or use the quadratic formula.",
      color: "yellow",
      example: "x = (-b ± √(b² - 4ac)) / 2a",
    },
    {
      id: "applications",
      title: "Applications",
      label: "Applications",
      icon: "🌍",
      description: "Where quadratics appear in real life.",
      content: "Quadratics model motion, area, and projectile paths.",
      color: "red",
      example: "A ball thrown into the air follows a parabola",
    },
    {
      id: "mistakes",
      title: "Common Mistakes",
      label: "Common Mistakes",
      icon: "⚠️",
      description: "Errors to avoid.",
      content: "Watch for sign errors, missing ±, and arithmetic slips.",
      color: "indigo",
      example: "Forgetting that b is negative in 2x² - 7x + 3",
    },
  ],
};

const historyWwiLearningMap = {
  subject: "History" as const,
  description: "Origins, timeline, and effects of World War I.",
  difficulty: "Intermediate" as const,
  nodes: [
    {
      id: "causes",
      title: "Causes",
      label: "Causes",
      icon: "⚔️",
      description: "The MAIN causes and tension across Europe.",
      content:
        "Militarism, alliances, imperialism, and nationalism pushed Europe toward war.",
      color: "red",
      example:
        "The alliance system turned a local crisis into a continental war.",
    },
    {
      id: "events",
      title: "Major Events",
      label: "Major Events",
      icon: "🕰️",
      description: "The assassination and first months of war.",
      content:
        "The assassination of Archduke Franz Ferdinand triggered the July Crisis.",
      color: "blue",
      example: "Austria-Hungary declared war on Serbia in 1914.",
    },
    {
      id: "timeline",
      title: "Timeline",
      label: "Timeline",
      icon: "📅",
      description: "Key years and turning points.",
      content:
        "WWI lasted from 1914 to 1918 and shifted through trench warfare and attrition.",
      color: "purple",
      example: "1916 saw the Battle of the Somme and Verdun.",
    },
    {
      id: "effects",
      title: "Effects",
      label: "Effects",
      icon: "📜",
      description: "What changed after the war.",
      content:
        "The Treaty of Versailles redrew borders and created resentment in Germany.",
      color: "yellow",
      example: "Harsh reparations became a major source of instability.",
    },
    {
      id: "figures",
      title: "Key Figures",
      label: "Key Figures",
      icon: "👤",
      description: "Leaders and important personalities.",
      content:
        "Franz Ferdinand, Kaiser Wilhelm II, and Woodrow Wilson shaped the war era.",
      color: "green",
      example: "Wilson pushed for the League of Nations.",
    },
  ],
};

const biologyPhotosynthesisLearningMap = {
  subject: "Biology" as const,
  description: "How plants capture energy and how cells release it.",
  difficulty: "Beginner" as const,
  nodes: [
    {
      id: "overview",
      title: "Overview",
      label: "Overview",
      icon: "🌿",
      description: "The big idea of photosynthesis.",
      content:
        "Plants convert light energy into chemical energy stored in glucose.",
      color: "green",
      example: "Light + CO₂ + water → glucose + oxygen",
    },
    {
      id: "inputs",
      title: "Inputs",
      label: "Inputs",
      icon: "💧",
      description: "What the plant needs.",
      content:
        "Sunlight, carbon dioxide, and water are the reactants for photosynthesis.",
      color: "blue",
      example: "CO₂ enters through stomata.",
    },
    {
      id: "location",
      title: "Location",
      label: "Location",
      icon: "🧪",
      description: "Where the process happens.",
      content:
        "Photosynthesis takes place in chloroplasts, especially the thylakoids.",
      color: "purple",
      example: "Light reactions happen in the thylakoid membranes.",
    },
    {
      id: "products",
      title: "Products",
      label: "Products",
      icon: "🍬",
      description: "What the plant makes.",
      content: "Glucose stores energy; oxygen is released as a byproduct.",
      color: "yellow",
      example: "C₆H₁₂O₆ and O₂ are the outputs.",
    },
    {
      id: "comparison",
      title: "Comparison",
      label: "Comparison",
      icon: "🔄",
      description: "How respiration relates.",
      content: "Cellular respiration uses glucose and oxygen to release ATP.",
      color: "red",
      example: "Photosynthesis and respiration are complementary processes.",
    },
  ],
};

const trigonometryLearningMap = {
  subject: "Math" as const,
  description: "Trig ratios, special angles, and the unit circle.",
  difficulty: "Intermediate" as const,
  nodes: [
    {
      id: "ratios",
      title: "Trig Ratios",
      label: "Trig Ratios",
      icon: "△",
      description: "Sine, cosine, and tangent.",
      content: "Trig ratios compare sides in a right triangle.",
      color: "blue",
      example: "sin(θ) = opposite / hypotenuse",
    },
    {
      id: "angles",
      title: "Special Angles",
      label: "Special Angles",
      icon: "⟲",
      description: "Angles to memorize.",
      content: "30°, 45°, and 60° have exact trig values worth memorizing.",
      color: "purple",
      example: "sin(30°) = 1/2",
    },
    {
      id: "unit-circle",
      title: "Unit Circle",
      label: "Unit Circle",
      icon: "◯",
      description: "Coordinate view of trig.",
      content:
        "The x- and y-coordinates of a point on the unit circle give cosine and sine.",
      color: "green",
      example: "At 60°, the point is (1/2, √3/2)",
    },
    {
      id: "identities",
      title: "Identities",
      label: "Identities",
      icon: "🧠",
      description: "Relationships between ratios.",
      content:
        "Use Pythagorean identities to connect sine, cosine, and tangent.",
      color: "yellow",
      example: "sin²θ + cos²θ = 1",
    },
    {
      id: "applications",
      title: "Applications",
      label: "Applications",
      icon: "📡",
      description: "Real-world use.",
      content: "Trigonometry appears in navigation, construction, and physics.",
      color: "red",
      example: "Measuring the height of a building from ground level",
    },
  ],
};

const civilRightsLearningMap = {
  subject: "History" as const,
  description: "Segregation, protest, and legal change in the United States.",
  difficulty: "Intermediate" as const,
  nodes: [
    {
      id: "segregation",
      title: "Segregation",
      label: "Segregation",
      icon: "🚏",
      description: "The system the movement opposed.",
      content:
        "Jim Crow laws enforced racial separation and unequal treatment.",
      color: "red",
      example: "Separate schools and buses were part of daily life.",
    },
    {
      id: "leaders",
      title: "Leaders",
      label: "Leaders",
      icon: "✊",
      description: "Key voices in the movement.",
      content:
        "Martin Luther King Jr., Rosa Parks, and many others helped lead change.",
      color: "blue",
      example: "King advocated nonviolent protest.",
    },
    {
      id: "events",
      title: "Events",
      label: "Events",
      icon: "🪧",
      description: "Major protests and marches.",
      content: "Boycotts, sit-ins, and marches built pressure for reform.",
      color: "purple",
      example: "The Montgomery Bus Boycott lasted more than a year.",
    },
    {
      id: "laws",
      title: "Landmark Laws",
      label: "Landmark Laws",
      icon: "⚖️",
      description: "Legal changes that followed activism.",
      content:
        "The Civil Rights Act and Voting Rights Act transformed U.S. law.",
      color: "green",
      example: "These laws outlawed major forms of discrimination.",
    },
    {
      id: "legacy",
      title: "Legacy",
      label: "Legacy",
      icon: "🌎",
      description: "Why the movement still matters.",
      content:
        "The movement changed law, politics, and public expectations of equality.",
      color: "yellow",
      example: "Its impact continues in modern civil rights debates.",
    },
  ],
};

const cellularRespirationLearningMap = {
  subject: "Biology" as const,
  description: "How cells break down glucose to make ATP.",
  difficulty: "Intermediate" as const,
  nodes: [
    {
      id: "overview",
      title: "Overview",
      label: "Overview",
      icon: "⚡",
      description: "The goal of cellular respiration.",
      content: "Cells convert glucose into ATP, the energy currency of life.",
      color: "blue",
      example: "One glucose molecule can generate many ATP molecules.",
    },
    {
      id: "glycolysis",
      title: "Glycolysis",
      label: "Glycolysis",
      icon: "1️⃣",
      description: "The first stage.",
      content: "Glycolysis breaks glucose into pyruvate in the cytoplasm.",
      color: "purple",
      example: "This stage makes a small amount of ATP.",
    },
    {
      id: "krebs",
      title: "Krebs Cycle",
      label: "Krebs Cycle",
      icon: "2️⃣",
      description: "Energy extraction in the mitochondria.",
      content:
        "The Krebs cycle processes pyruvate and releases carbon dioxide.",
      color: "green",
      example: "It generates electron carriers like NADH.",
    },
    {
      id: "etc",
      title: "Electron Transport",
      label: "Electron Transport",
      icon: "3️⃣",
      description: "Where most ATP is made.",
      content:
        "The electron transport chain uses oxygen to produce large amounts of ATP.",
      color: "yellow",
      example: "Oxygen is the final electron acceptor.",
    },
    {
      id: "comparison",
      title: "Comparison",
      label: "Comparison",
      icon: "🔄",
      description: "How it relates to photosynthesis.",
      content: "Cellular respiration releases energy stored by photosynthesis.",
      color: "red",
      example: "Photosynthesis stores energy; respiration releases it.",
    },
  ],
};

const quadraticWorksheetLearningMap = {
  subject: "Math" as const,
  description: "Practice solving quadratic equations step by step.",
  difficulty: "Beginner" as const,
  nodes: [
    {
      id: "setup",
      title: "Set Up",
      label: "Set Up",
      icon: "1",
      description: "Write the equation in standard form.",
      content: "Make sure the equation is arranged as ax² + bx + c = 0.",
      color: "blue",
      example: "x² + 3x + 2 = 0",
    },
    {
      id: "factor",
      title: "Factor",
      label: "Factor",
      icon: "2",
      description: "Break the trinomial into binomials.",
      content: "Find two numbers that multiply to c and add to b.",
      color: "purple",
      example: "(x + 1)(x + 2) = 0",
    },
    {
      id: "roots",
      title: "Roots",
      label: "Roots",
      icon: "3",
      description: "Solve each factor.",
      content: "Set each binomial equal to zero and solve for x.",
      color: "green",
      example: "x = -1 and x = -2",
    },
    {
      id: "check",
      title: "Check",
      label: "Check",
      icon: "4",
      description: "Verify the answers.",
      content: "Substitute roots back into the original equation to confirm.",
      color: "yellow",
      example: "Both roots should make the equation equal zero.",
    },
  ],
};

export const mockTasks: Task[] = [
  {
    id: "1",
    type: "mixed",
    title: "Quadratic Functions & Equations",
    subject: "Math",
    taskType: "mixed",
    deadline: "2024-05-10",
    priority: "high",
    progress: 45,
    description:
      "Master the fundamentals of quadratic functions, solving equations, and graphing parabolas.",
    createdAt: "2024-04-28",
    learningMapPreset: "Math",
    learningMap: mathQuadraticLearningMap,
    learningMaps: [
      {
        presetId: "definitions",
        subject: "Math",
        type: "cards",
        data: {
          cards: [
            { title: "Quadratic", content: "A degree-2 polynomial function." },
            { title: "Vertex", content: "Turning point of a parabola." },
            { title: "Axis of Symmetry", content: "Vertical line through vertex." },
          ],
        },
      },
      {
        presetId: "formulas",
        subject: "Math",
        type: "table",
        data: {
          columns: ["Formula", "Use"],
          rows: [
            ["x = (-b +/- sqrt(b^2 - 4ac)) / 2a", "Solve any quadratic"],
            ["x = -b / 2a", "Find axis of symmetry"],
            ["Delta = b^2 - 4ac", "Classify roots"],
          ],
        },
      },
      {
        presetId: "graph-behavior",
        subject: "Math",
        type: "graph",
        data: {
          points: [
            { x: -2, y: 15 },
            { x: -1, y: 8 },
            { x: 0, y: 3 },
            { x: 1, y: 0 },
            { x: 2, y: -1 },
            { x: 3, y: 0 },
            { x: 4, y: 3 },
          ],
          equation: "y = x^2 - 4x + 3",
          xLabel: "x",
          yLabel: "y",
        },
      },
      {
        presetId: "solving-methods",
        subject: "Math",
        type: "flow",
        data: {
          steps: [
            { title: "Standard Form", description: "Write as ax^2 + bx + c = 0." },
            { title: "Choose Method", description: "Factoring or formula." },
            { title: "Solve Roots", description: "Compute all valid roots." },
            { title: "Check", description: "Substitute roots into original equation." },
          ],
        },
      },
      {
        presetId: "applications",
        subject: "Math",
        type: "cards",
        data: {
          cards: [
            { title: "Projectile Motion", content: "Parabolas model ball flight." },
            { title: "Business Optimization", content: "Profit curves are often quadratic." },
          ],
        },
      },
      {
        presetId: "common-mistakes",
        subject: "Math",
        type: "list",
        data: {
          items: [
            "Forgetting +/- in quadratic formula",
            "Sign errors when substituting b",
            "Not checking roots in original equation",
          ],
        },
      },
    ],
    learningContent: {
      overview:
        "Quadratic functions model curved relationships and help you solve optimization and root problems.",
      keyPoints: [
        "Standard form is ax^2 + bx + c.",
        "Graph is a parabola with a vertex and axis of symmetry.",
        "You can solve using factoring, completing the square, or quadratic formula.",
      ],
      example:
        "For x^2 - 5x + 6 = 0, factor to (x - 2)(x - 3) = 0, so x = 2 and x = 3.",
      steps: [
        "Write equation in standard form.",
        "Pick a solving method based on structure.",
        "Compute roots and verify by substitution.",
      ],
    },
    practice: [
      {
        id: "math-p1",
        text: "Solve x² + 5x + 6 = 0",
        hint: "Try factoring the trinomial.",
        expectedAnswer: "-2, -3",
        explanation:
          "Factor into (x + 2)(x + 3) = 0, so the roots are x = -2 and x = -3.",
        category: "Factoring",
        breakdownSteps: [
          {
            number: 1,
            title: "Find the factor pair",
            explanation:
              "Look for two numbers that multiply to 6 and add to 5.",
            example: "2 and 3",
            keyPoint:
              "The signs are positive because both numbers are positive.",
            commonMistake:
              "Using numbers that multiply to 6 but do not add to 5.",
          },
          {
            number: 2,
            title: "Write the factors",
            explanation: "Split the trinomial into two binomials.",
            example: "(x + 2)(x + 3) = 0",
            keyPoint: "Each binomial becomes a root when set to zero.",
          },
          {
            number: 3,
            title: "Solve each factor",
            explanation: "Set each binomial equal to zero and solve for x.",
            example: "x = -2 and x = -3",
            keyPoint: "Always check both roots.",
          },
        ],
      },
      {
        id: "math-p2",
        text: "Convert y = x² - 4x + 1 to vertex form",
        hint: "Complete the square.",
        expectedAnswer: "y = (x - 2)² - 3",
        explanation:
          "Completing the square gives y = (x - 2)² - 3, so the vertex is (2, -3).",
        category: "Vertex Form",
        breakdownSteps: [
          {
            number: 1,
            title: "Group x terms",
            explanation:
              "Keep the constant separate before completing the square.",
            example: "y = (x² - 4x) + 1",
          },
          {
            number: 2,
            title: "Complete the square",
            explanation: "Add and subtract 4 inside the parentheses.",
            example: "y = (x² - 4x + 4 - 4) + 1",
          },
          {
            number: 3,
            title: "Rewrite and simplify",
            explanation: "Factor the trinomial and combine constants.",
            example: "y = (x - 2)² - 3",
          },
        ],
      },
    ],
    master: [
      {
        id: "math-m1",
        text: "Find the roots of x² - 4x + 4 = 0",
        expectedAnswer: "2",
        explanation:
          "This is a perfect square: (x - 2)² = 0, so the double root is x = 2.",
        category: "Perfect Squares",
      },
      {
        id: "math-m2",
        text: "Describe the vertex and opening of y = -x² + 6x - 5",
        expectedAnswer: "Vertex (3, 4), opens downward",
        explanation:
          "The negative leading coefficient means the parabola opens downward, and the vertex is at (3, 4).",
        category: "Graph Analysis",
      },
    ],
    sources: [
      {
        type: "link",
        content: "https://example.com/quadratic-video",
        label: "Quadratic Functions Reference",
      },
    ],
  },
  {
    id: "2",
    type: "lesson",
    title: "World War I Overview",
    subject: "History",
    taskType: "lesson",
    deadline: "2024-05-15",
    priority: "medium",
    progress: 30,
    description:
      "Understand the causes, key events, and consequences of World War I.",
    createdAt: "2024-04-27",
    learningMapPreset: "History",
    learningMap: historyWwiLearningMap,
    learningMaps: [
      {
        presetId: "timeline",
        subject: "History",
        type: "timeline",
        data: {
          events: [
            {
              date: "1914",
              title: "Assassination in Sarajevo",
              description: "Archduke Franz Ferdinand is assassinated.",
            },
            {
              date: "1915",
              title: "War Expands",
              description: "Trench warfare intensifies across Europe.",
            },
            {
              date: "1917",
              title: "US Enters War",
              description: "United States joins the Allied powers.",
            },
            {
              date: "1918",
              title: "Armistice Signed",
              description: "Fighting stops on November 11.",
            },
          ],
        },
      },
      {
        presetId: "causes",
        subject: "History",
        type: "node-map",
        data: {
          nodes: [
            { id: "main", label: "WWI", connections: ["mil", "all", "imp", "nat"] },
            { id: "mil", label: "Militarism", connections: ["main"] },
            { id: "all", label: "Alliances", connections: ["main"] },
            { id: "imp", label: "Imperialism", connections: ["main"] },
            { id: "nat", label: "Nationalism", connections: ["main"] },
          ],
        },
      },
      {
        presetId: "key-figures",
        subject: "History",
        type: "cards",
        data: {
          cards: [
            { title: "Franz Ferdinand", content: "Assassination triggered July Crisis." },
            { title: "Woodrow Wilson", content: "Promoted League of Nations framework." },
          ],
        },
      },
      {
        presetId: "events-breakdown",
        subject: "History",
        type: "flow",
        data: {
          steps: [
            { title: "Assassination", description: "Initial trigger in 1914." },
            { title: "Alliance Activation", description: "Mutual defense pacts escalate war." },
            { title: "Trench Stalemate", description: "Long attritional conflict." },
            { title: "Armistice", description: "War ends in 1918." },
          ],
        },
      },
      {
        presetId: "effects",
        subject: "History",
        type: "node-map",
        data: {
          nodes: [
            { id: "effects", label: "WWI Effects", connections: ["pol", "eco", "soc"] },
            { id: "pol", label: "Political Changes", connections: ["effects"] },
            { id: "eco", label: "Economic Strain", connections: ["effects"] },
            { id: "soc", label: "Social Losses", connections: ["effects"] },
          ],
        },
      },
      {
        presetId: "comparison",
        subject: "History",
        type: "comparison",
        data: {
          items: [
            {
              title: "Before 1914",
              points: ["Imperial powers dominate", "Rigid alliance blocs", "Escalating militarism"],
            },
            {
              title: "After 1918",
              points: ["Empires collapse", "Borders redrawn", "Reparations and instability"],
            },
          ],
        },
      },
    ],
    learningContent: {
      overview:
        "World War I began from interconnected political tensions and transformed global power structures.",
      keyPoints: [
        "MAIN explains the long-term causes.",
        "Alliance obligations expanded a regional conflict.",
        "Treaty of Versailles shaped post-war instability.",
      ],
      example:
        "Austria-Hungary's response to Sarajevo escalated because allied powers mobilized in sequence.",
      steps: [
        "Identify long-term causes (MAIN).",
        "Trace the 1914 trigger and alliance chain reaction.",
        "Connect battlefield outcomes to post-war treaties.",
      ],
    },
    practice: [
      {
        id: "hist-p1",
        text: "What triggered WWI?",
        hint: "Think June 1914.",
        expectedAnswer: "Assassination of Archduke Franz Ferdinand",
        explanation:
          "The assassination in Sarajevo set off the July Crisis and the chain of alliances.",
        category: "Cause",
        breakdownSteps: [
          {
            number: 1,
            title: "Identify the event",
            explanation:
              "The spark was the assassination of Archduke Franz Ferdinand.",
            example: "Sarajevo, 1914",
          },
          {
            number: 2,
            title: "Connect the crisis",
            explanation:
              "Alliance commitments escalated the conflict into a world war.",
            example: "Austria-Hungary, Germany, Russia, and France mobilized.",
          },
        ],
      },
      {
        id: "hist-p2",
        text: "Name one long-term cause of WWI",
        hint: "Use one of the MAIN factors.",
        expectedAnswer: "Militarism",
        explanation:
          "Militarism was one of the major long-term causes because European states built huge armies and navies.",
        category: "Causes",
        breakdownSteps: [
          {
            number: 1,
            title: "Recall MAIN",
            explanation:
              "Militarism, alliances, imperialism, and nationalism all contributed.",
          },
          {
            number: 2,
            title: "Choose one cause",
            explanation: "Any one of the MAIN causes is acceptable.",
            example: "Militarism",
          },
        ],
      },
    ],
    master: [
      {
        id: "hist-m1",
        text: "Explain how the Treaty of Versailles affected Germany.",
        expectedAnswer:
          "It created resentment through harsh reparations and punishment.",
        explanation:
          "The treaty imposed heavy reparations and territorial losses, fueling resentment and instability.",
        category: "Aftermath",
      },
      {
        id: "hist-m2",
        text: "Describe one way alliances increased the scale of WWI.",
        expectedAnswer:
          "A local conflict became a wider war because countries were obligated to defend allies.",
        explanation:
          "Alliances tied nations together, so one declaration of war pulled multiple countries into the conflict.",
        category: "Systems",
      },
    ],
  },
  {
    id: "3",
    type: "concept",
    title: "Photosynthesis Process",
    subject: "Biology",
    taskType: "concept",
    deadline: "2024-05-08",
    priority: "high",
    progress: 60,
    description:
      "Explore the light-dependent and light-independent reactions of photosynthesis.",
    createdAt: "2024-04-26",
    learningMapPreset: "Biology",
    learningMap: biologyPhotosynthesisLearningMap,
    learningMaps: [
      {
        presetId: "definitions",
        subject: "Biology",
        type: "cards",
        data: {
          cards: [
            { title: "Chlorophyll", content: "Pigment that absorbs light energy." },
            { title: "Stomata", content: "Leaf pores for gas exchange." },
          ],
        },
      },
      {
        presetId: "process",
        subject: "Biology",
        type: "flow",
        data: {
          steps: [
            { title: "Light Capture", description: "Chlorophyll absorbs photons." },
            { title: "Water Split", description: "Photolysis releases electrons and oxygen." },
            { title: "Calvin Cycle", description: "Carbon fixed into sugars." },
          ],
        },
      },
      {
        presetId: "structure",
        subject: "Biology",
        type: "diagram",
        data: {
          parts: [
            {
              label: "Chloroplast",
              description: "Main photosynthesis organelle",
              position: { x: 40, y: 40 },
            },
            {
              label: "Thylakoid",
              description: "Site of light reactions",
              position: { x: 230, y: 70 },
            },
          ],
        },
      },
      {
        presetId: "comparison",
        subject: "Biology",
        type: "comparison",
        data: {
          items: [
            {
              title: "Photosynthesis",
              points: ["Stores light energy", "Occurs in chloroplast", "Produces glucose and oxygen"],
            },
            {
              title: "Respiration",
              points: ["Releases energy", "Occurs in mitochondria", "Produces ATP"],
            },
          ],
        },
      },
      {
        presetId: "life-cycle",
        subject: "Biology",
        type: "timeline",
        data: {
          events: [
            { date: "Stage 1", title: "Seedling", description: "Initial growth begins." },
            { date: "Stage 2", title: "Leaf Expansion", description: "Photosynthesis rises." },
            { date: "Stage 3", title: "Mature Plant", description: "Sustained energy production." },
          ],
        },
      },
    ],
    learningContent: {
      overview:
        "Photosynthesis captures light energy and stores it in glucose, enabling energy flow through living systems.",
      keyPoints: [
        "Inputs are light, water, and carbon dioxide.",
        "Light reactions generate ATP and NADPH.",
        "Calvin cycle uses those molecules to build glucose.",
      ],
      example:
        "6CO2 + 6H2O + light -> C6H12O6 + 6O2 summarizes energy storage in plants.",
      steps: [
        "Capture photons in chlorophyll.",
        "Split water and generate ATP/NADPH.",
        "Fix carbon in the Calvin cycle to produce sugars.",
      ],
    },
    practice: [
      {
        id: "bio-p1",
        text: "What is the main purpose of photosynthesis?",
        hint: "Think energy storage.",
        expectedAnswer:
          "To produce glucose and oxygen from carbon dioxide and water",
        explanation:
          "Photosynthesis stores light energy as chemical energy in glucose.",
        category: "Process",
        breakdownSteps: [
          {
            number: 1,
            title: "Identify inputs",
            explanation: "Plants use light, carbon dioxide, and water.",
            example: "Sunlight + H₂O + CO₂",
          },
          {
            number: 2,
            title: "Identify outputs",
            explanation: "Photosynthesis produces glucose and oxygen.",
            example: "C₆H₁₂O₆ + O₂",
          },
        ],
      },
      {
        id: "bio-p2",
        text: "Where does cellular respiration occur in the cell?",
        hint: "The energy organelle.",
        expectedAnswer: "Mitochondria",
        explanation:
          "Mitochondria are the organelles where cellular respiration produces ATP.",
        category: "Location",
        breakdownSteps: [
          {
            number: 1,
            title: "Recall the organelle",
            explanation: "The mitochondrion is the cell's powerhouse.",
            example: "Mitochondria",
          },
          {
            number: 2,
            title: "Connect the function",
            explanation: "It breaks down glucose to make ATP.",
          },
        ],
      },
    ],
    master: [
      {
        id: "bio-m1",
        text: "Write the balanced equation for aerobic respiration.",
        expectedAnswer: "C₆H₁₂O₆ + 6O₂ → 6CO₂ + 6H₂O + ATP",
        explanation:
          "Aerobic respiration releases energy from glucose and uses oxygen as the final electron acceptor.",
        category: "Equation",
      },
      {
        id: "bio-m2",
        text: "Explain how photosynthesis and respiration are connected.",
        expectedAnswer:
          "The products of one process are the reactants of the other.",
        explanation:
          "Photosynthesis stores energy in glucose; respiration releases that energy as ATP.",
        category: "Comparison",
      },
    ],
  },
  {
    id: "4",
    type: "assignment",
    title: "Quadratic Equations Worksheet",
    subject: "Math",
    taskType: "assignment",
    deadline: "2024-05-05",
    priority: "high",
    progress: 0,
    description:
      "Solve various quadratic equations using factoring, perfect squares, and extraction of the GCF.",
    createdAt: "2024-04-29",
    learningMap: quadraticWorksheetLearningMap,
  },
  {
    id: "5",
    type: "lesson",
    title: "Trigonometry Fundamentals",
    subject: "Math",
    taskType: "lesson",
    deadline: "2024-05-20",
    priority: "medium",
    progress: 10,
    description:
      "Learn sine, cosine, tangent, unit circle, and basic trigonometric identities.",
    createdAt: "2024-05-01",
    learningMapPreset: "Math",
    learningMap: trigonometryLearningMap,
    learningMaps: [
      {
        presetId: "definitions",
        subject: "Math",
        type: "cards",
        data: {
          cards: [
            { title: "Sine", content: "Opposite over hypotenuse in right triangle." },
            { title: "Cosine", content: "Adjacent over hypotenuse in right triangle." },
          ],
        },
      },
      {
        presetId: "formulas",
        subject: "Math",
        type: "table",
        data: {
          columns: ["Identity", "Expression"],
          rows: [
            ["Pythagorean", "sin^2(theta) + cos^2(theta) = 1"],
            ["Tangent", "tan(theta) = sin(theta) / cos(theta)"],
          ],
        },
      },
      {
        presetId: "graph-behavior",
        subject: "Math",
        type: "graph",
        data: {
          points: [
            { x: 0, y: 0 },
            { x: 30, y: 0.5 },
            { x: 45, y: 0.71 },
            { x: 60, y: 0.87 },
            { x: 90, y: 1 },
          ],
          equation: "y = sin(x)",
          xLabel: "Angle (deg)",
          yLabel: "sin(x)",
        },
      },
      {
        presetId: "solving-methods",
        subject: "Math",
        type: "flow",
        data: {
          steps: [
            { title: "Identify Triangle Info", description: "Known sides or angles." },
            { title: "Choose Ratio", description: "Pick sin, cos, or tan." },
            { title: "Solve", description: "Compute unknown value." },
          ],
        },
      },
    ],
    learningContent: {
      overview: "Trigonometry connects triangles, circles, and periodic relationships.",
      keyPoints: [
        "sin, cos, tan are side ratios and unit-circle coordinates.",
        "Special angles provide exact benchmark values.",
        "Identities simplify equations and proofs.",
      ],
      example: "At 60 degrees, cos = 1/2 and sin = sqrt(3)/2 on the unit circle.",
      steps: [
        "Identify angle and representation (triangle or unit circle).",
        "Choose the correct ratio or identity.",
        "Evaluate and verify sign by quadrant.",
      ],
    },
    practice: [
      {
        id: "trig-p1",
        text: "Calculate sin(30°)",
        hint: "Use a special angle.",
        expectedAnswer: "0.5 or 1/2",
        explanation: "sin(30°) = 1/2 = 0.5.",
        category: "Special Angles",
        breakdownSteps: [
          {
            number: 1,
            title: "Recall the value",
            explanation: "sin(30°) is one of the values to memorize.",
            example: "sin(30°) = 1/2",
          },
          {
            number: 2,
            title: "Write the decimal",
            explanation: "Convert the fraction to a decimal if needed.",
            example: "0.5",
          },
        ],
      },
      {
        id: "trig-p2",
        text: "What does cosine represent on the unit circle?",
        hint: "Think x-coordinate.",
        expectedAnswer: "The x-coordinate",
        explanation:
          "Cosine corresponds to the x-coordinate of a point on the unit circle.",
        category: "Unit Circle",
        breakdownSteps: [
          {
            number: 1,
            title: "Remember the coordinate mapping",
            explanation: "Cosine gives the horizontal position.",
            example: "(cos θ, sin θ)",
          },
        ],
      },
    ],
    master: [
      {
        id: "trig-m1",
        text: "State the Pythagorean identity connecting sine and cosine.",
        expectedAnswer: "sin²θ + cos²θ = 1",
        explanation:
          "This identity is true for every angle θ on the unit circle.",
        category: "Identities",
      },
      {
        id: "trig-m2",
        text: "Explain one real-world use of trigonometry.",
        expectedAnswer:
          "Measuring distances or angles in navigation or construction.",
        explanation:
          "Trigonometry helps solve triangles in practical settings such as surveying and architecture.",
        category: "Applications",
      },
    ],
  },
  {
    id: "6",
    type: "mixed",
    title: "Civil Rights Movement",
    subject: "History",
    taskType: "mixed",
    deadline: "2024-05-18",
    priority: "high",
    progress: 20,
    description:
      "Key figures, events, and legislation of the American Civil Rights Movement.",
    createdAt: "2024-05-02",
    learningMapPreset: "History",
    learningMap: civilRightsLearningMap,
    learningMaps: [
      {
        presetId: "timeline",
        subject: "History",
        type: "timeline",
        data: {
          events: [
            { date: "1954", title: "Brown v. Board", description: "School segregation ruled unconstitutional." },
            { date: "1955", title: "Montgomery Boycott", description: "Mass protest against bus segregation." },
            { date: "1964", title: "Civil Rights Act", description: "Major anti-discrimination law passed." },
          ],
        },
      },
      {
        presetId: "causes",
        subject: "History",
        type: "node-map",
        data: {
          nodes: [
            { id: "root", label: "Civil Rights Movement", connections: ["seg", "vote", "econ"] },
            { id: "seg", label: "Segregation", connections: ["root"] },
            { id: "vote", label: "Voting Suppression", connections: ["root"] },
            { id: "econ", label: "Economic Inequality", connections: ["root"] },
          ],
        },
      },
      {
        presetId: "key-figures",
        subject: "History",
        type: "cards",
        data: {
          cards: [
            { title: "Martin Luther King Jr.", content: "Led nonviolent mass protest." },
            { title: "Rosa Parks", content: "Catalyzed Montgomery boycott." },
          ],
        },
      },
      {
        presetId: "effects",
        subject: "History",
        type: "node-map",
        data: {
          nodes: [
            { id: "effects", label: "Movement Outcomes", connections: ["law", "vote", "culture"] },
            { id: "law", label: "Legal Reform", connections: ["effects"] },
            { id: "vote", label: "Voting Rights", connections: ["effects"] },
            { id: "culture", label: "Cultural Change", connections: ["effects"] },
          ],
        },
      },
    ],
    learningContent: {
      overview:
        "The Civil Rights Movement challenged legal segregation and expanded constitutional protections.",
      keyPoints: [
        "Grassroots activism and legal strategy worked together.",
        "Public protest influenced federal legislation.",
        "Movement outcomes still shape civic debates.",
      ],
      example:
        "The Montgomery Bus Boycott used sustained economic pressure to challenge segregation policy.",
      steps: [
        "Analyze segregation policies and daily impact.",
        "Trace key protests and court decisions.",
        "Link actions to legal and social changes.",
      ],
    },
    practice: [
      {
        id: "cr-p1",
        text: "Name one major leader of the Civil Rights Movement",
        hint: "Think of nonviolent protest.",
        expectedAnswer: "Martin Luther King Jr.",
        explanation:
          "King became the best-known leader for nonviolent resistance and equal rights.",
        category: "Leaders",
        breakdownSteps: [
          {
            number: 1,
            title: "Recall a leader",
            explanation: "Several leaders shaped the movement.",
            example: "Martin Luther King Jr.",
          },
          {
            number: 2,
            title: "Connect the strategy",
            explanation: "Nonviolent protest was a central tactic.",
          },
        ],
      },
      {
        id: "cr-p2",
        text: "What laws helped end legal segregation?",
        hint: "Think 1960s landmark acts.",
        expectedAnswer: "The Civil Rights Act and the Voting Rights Act",
        explanation:
          "These laws outlawed major forms of discrimination and protected voting rights.",
        category: "Legislation",
        breakdownSteps: [
          {
            number: 1,
            title: "Name the acts",
            explanation:
              "The Civil Rights Act and Voting Rights Act are the key laws.",
            example: "1964 and 1965",
          },
        ],
      },
    ],
    master: [
      {
        id: "cr-m1",
        text: "Explain the purpose of the Montgomery Bus Boycott.",
        expectedAnswer:
          "To protest bus segregation and challenge unfair treatment.",
        explanation:
          "The boycott showed how collective action could challenge discriminatory laws.",
        category: "Protest",
      },
      {
        id: "cr-m2",
        text: "Describe how the Civil Rights Movement changed U.S. society.",
        expectedAnswer:
          "It expanded legal rights and increased public pressure for equality.",
        explanation:
          "The movement transformed law, politics, and expectations around civil equality.",
        category: "Impact",
      },
    ],
  },
  {
    id: "7",
    type: "concept",
    title: "Cellular Respiration",
    subject: "Biology",
    taskType: "concept",
    deadline: "2024-05-12",
    priority: "medium",
    progress: 35,
    description:
      "Glycolysis, Krebs cycle, and electron transport chain - how cells produce energy.",
    createdAt: "2024-05-03",
    learningMapPreset: "Biology",
    learningMap: cellularRespirationLearningMap,
    learningMaps: [
      {
        presetId: "definitions",
        subject: "Biology",
        type: "cards",
        data: {
          cards: [
            { title: "ATP", content: "Primary cellular energy currency." },
            { title: "Glycolysis", content: "First stage of respiration in cytoplasm." },
          ],
        },
      },
      {
        presetId: "process",
        subject: "Biology",
        type: "flow",
        data: {
          steps: [
            { title: "Glycolysis", description: "Glucose to pyruvate." },
            { title: "Krebs Cycle", description: "Electron carriers generated." },
            { title: "ETC", description: "Most ATP produced." },
          ],
        },
      },
      {
        presetId: "comparison",
        subject: "Biology",
        type: "comparison",
        data: {
          items: [
            {
              title: "Cellular Respiration",
              points: ["Uses glucose and oxygen", "Releases ATP", "Produces CO2 and water"],
            },
            {
              title: "Photosynthesis",
              points: ["Uses light, CO2, and water", "Stores energy in glucose", "Produces oxygen"],
            },
          ],
        },
      },
      {
        presetId: "structure",
        subject: "Biology",
        type: "diagram",
        data: {
          parts: [
            { label: "Outer Membrane", description: "Boundary of mitochondrion", position: { x: 20, y: 25 } },
            { label: "Inner Membrane", description: "Folded cristae for ETC", position: { x: 70, y: 45 } },
            { label: "Matrix", description: "Krebs cycle region", position: { x: 45, y: 75 } },
          ],
        },
      },
    ],
    learningContent: {
      overview:
        "Cellular respiration releases energy from glucose to produce ATP for cellular work.",
      keyPoints: [
        "Glycolysis starts in cytoplasm.",
        "Krebs cycle and ETC occur in mitochondria.",
        "Oxygen is the final electron acceptor in aerobic respiration.",
      ],
      example:
        "C6H12O6 + 6O2 -> 6CO2 + 6H2O + ATP represents controlled cellular energy release.",
      steps: [
        "Break glucose into pyruvate via glycolysis.",
        "Process intermediates in Krebs cycle.",
        "Use electron transport chain to generate most ATP.",
      ],
    },
    practice: [
      {
        id: "resp-p1",
        text: "Where does glycolysis happen?",
        hint: "It happens before the mitochondria steps.",
        expectedAnswer: "Cytoplasm",
        explanation:
          "Glycolysis occurs in the cytoplasm before pyruvate enters the mitochondria.",
        category: "Location",
        breakdownSteps: [
          {
            number: 1,
            title: "Recall the stage",
            explanation: "Glycolysis is the first stage of respiration.",
          },
          {
            number: 2,
            title: "Identify the location",
            explanation:
              "It happens outside the mitochondria, in the cytoplasm.",
            example: "Cytoplasm",
          },
        ],
      },
      {
        id: "resp-p2",
        text: "What molecule is the final electron acceptor in aerobic respiration?",
        hint: "Think of the gas we breathe.",
        expectedAnswer: "Oxygen",
        explanation:
          "Oxygen accepts electrons at the end of the electron transport chain.",
        category: "Electron Transport",
        breakdownSteps: [
          {
            number: 1,
            title: "Remember the chain",
            explanation:
              "Electrons pass along proteins in the inner mitochondrial membrane.",
          },
          {
            number: 2,
            title: "Identify the acceptor",
            explanation: "Oxygen accepts the electrons and helps form water.",
            example: "O₂",
          },
        ],
      },
    ],
    master: [
      {
        id: "resp-m1",
        text: "Which stage makes the most ATP?",
        expectedAnswer: "The electron transport chain",
        explanation:
          "Most ATP is generated during oxidative phosphorylation in the electron transport chain.",
        category: "ATP Production",
      },
      {
        id: "resp-m2",
        text: "How are respiration and photosynthesis connected?",
        expectedAnswer: "The products of one are the reactants of the other.",
        explanation:
          "Respiration uses glucose and oxygen, while photosynthesis produces them.",
        category: "Comparison",
      },
    ],
  },
];

export const mockAssignments: Assignment[] = [
  {
    id: "a1",
    title: "Quadratic Formula Problems",
    subject: "Math",
    deadline: "2024-05-06",
    enableBreakdown: true,
    questions: [
      {
        id: "q1",
        text: "Solve using the quadratic formula: 2x² - 7x + 3 = 0",
        hint: "Identify a, b, c and apply the quadratic formula.",
        expectedAnswer: "x = 3 and x = 0.5",
        category: "Solving",
        breakdownSteps: [
          {
            number: 1,
            title: "Identify coefficients",
            explanation:
              "Write the equation in standard form and note a, b, and c.",
            example: "a = 2, b = -7, c = 3",
          },
          {
            number: 2,
            title: "Calculate the discriminant",
            explanation: "Use b² - 4ac to find the square root term.",
            example: "25",
          },
          {
            number: 3,
            title: "Solve the roots",
            explanation:
              "Substitute values into the formula and simplify both answers.",
            example: "x = 3 and x = 0.5",
          },
        ],
      },
      {
        id: "q2",
        text: "Convert to vertex form: f(x) = x² - 6x + 5",
        hint: "Complete the square by grouping x terms.",
        expectedAnswer: "f(x) = (x - 3)² - 4",
        category: "Forms",
        breakdownSteps: [
          {
            number: 1,
            title: "Group the x terms",
            explanation:
              "Separate the quadratic and linear terms from the constant.",
            example: "(x² - 6x) + 5",
          },
          {
            number: 2,
            title: "Complete the square",
            explanation:
              "Add and subtract the same value to make a perfect square trinomial.",
            example: "(x² - 6x + 9 - 9) + 5",
          },
          {
            number: 3,
            title: "Simplify",
            explanation: "Rewrite the trinomial and combine constants.",
            example: "(x - 3)² - 4",
          },
        ],
      },
      {
        id: "q3",
        text: "Find the discriminant of: 3x² + 2x + 5 = 0",
        hint: "Use Δ = b² - 4ac.",
        expectedAnswer: "-56 (negative, no real solutions)",
        category: "Discriminant",
        breakdownSteps: [
          {
            number: 1,
            title: "Identify coefficients",
            explanation: "Extract a, b, and c from standard form.",
            example: "a = 3, b = 2, c = 5",
          },
          {
            number: 2,
            title: "Compute Δ",
            explanation: "Substitute into the discriminant formula.",
            example: "2² - 4(3)(5) = 4 - 60 = -56",
          },
          {
            number: 3,
            title: "Interpret the result",
            explanation: "A negative discriminant means no real roots.",
            example: "0 real solutions",
          },
        ],
      },
    ],
    resources: [
      "Review quadratic formula in textbook chapter 5",
      "Watch solving quadratic equations video",
    ],
    notes: "Focus on careful algebraic manipulation.",
  },
  {
    id: "a2",
    title: "WWI Causes Essay Outline",
    subject: "History",
    deadline: "2024-05-16",
    enableBreakdown: true,
    questions: [
      {
        id: "h1",
        text: "List the main causes of WWI (acronym used by historians).",
        hint: "Think militarism, alliances, imperialism, nationalism.",
        expectedAnswer: "Militarism, Alliances, Imperialism, Nationalism",
        category: "Causes",
        breakdownSteps: [
          {
            number: 1,
            title: "Recall the acronym",
            explanation: "The four long-term causes are remembered as MAIN.",
            example: "Militarism, Alliances, Imperialism, Nationalism",
          },
          {
            number: 2,
            title: "Name the factors",
            explanation: "List the four forces that built tension before 1914.",
          },
        ],
      },
      {
        id: "h2",
        text: "What event triggered the start of WWI?",
        hint: "Assassination of an archduke.",
        expectedAnswer: "Assassination of Archduke Franz Ferdinand",
        category: "Events",
        breakdownSteps: [
          {
            number: 1,
            title: "Identify the spark",
            explanation:
              "The assassination in Sarajevo sparked the July Crisis.",
            example: "June 1914",
          },
        ],
      },
      {
        id: "h3",
        text: "Describe the significance of the Battle of the Somme.",
        hint: "Bloodiest battle with massive casualties and tanks.",
        expectedAnswer:
          "Over 1 million casualties; first use of tanks; symbol of trench warfare futility.",
        category: "Battles",
        breakdownSteps: [
          {
            number: 1,
            title: "Recall the scale",
            explanation: "The battle caused enormous losses on both sides.",
          },
          {
            number: 2,
            title: "Identify the milestone",
            explanation: "It marked the first use of tanks in battle.",
          },
        ],
      },
    ],
    resources: ["Textbook Chapter 12", "WWI documentary (PBS)"],
    notes: "Focus on cause-effect relationships.",
  },
  {
    id: "a3",
    title: "Comparing Photosynthesis & Cellular Respiration",
    subject: "Biology",
    deadline: "2024-05-13",
    enableBreakdown: true,
    questions: [
      {
        id: "b1",
        text: "What is the main purpose of photosynthesis?",
        hint: "Converts light energy into chemical energy.",
        expectedAnswer:
          "To produce glucose and oxygen from carbon dioxide and water.",
        category: "Process",
        breakdownSteps: [
          {
            number: 1,
            title: "Identify the inputs",
            explanation: "Plants use light, carbon dioxide, and water.",
          },
          {
            number: 2,
            title: "Identify the outputs",
            explanation: "Glucose and oxygen are produced.",
            example: "C₆H₁₂O₆ + O₂",
          },
        ],
      },
      {
        id: "b2",
        text: "Where does cellular respiration occur in the cell?",
        hint: "Organelle associated with energy production.",
        expectedAnswer: "Mitochondria",
        category: "Location",
        breakdownSteps: [
          {
            number: 1,
            title: "Recall the organelle",
            explanation: "The mitochondria make most of the cell's ATP.",
            example: "Mitochondria",
          },
        ],
      },
      {
        id: "b3",
        text: "Write the balanced equation for aerobic respiration.",
        hint: "Opposite of photosynthesis.",
        expectedAnswer: "C₆H₁₂O₆ + 6O₂ → 6CO₂ + 6H₂O + ATP",
        category: "Equation",
        breakdownSteps: [
          {
            number: 1,
            title: "Recall the reactants",
            explanation: "Glucose and oxygen go in.",
          },
          {
            number: 2,
            title: "Recall the products",
            explanation: "Carbon dioxide, water, and ATP come out.",
          },
        ],
      },
    ],
    resources: ["Khan Academy videos on respiration", "Textbook chapter 9"],
    notes: "Memorize both equations and their organelles.",
  },
];

export function getTaskById(id: string): Task | undefined {
  return mockTasks.find((task) => task.id === id);
}

export function getTasksBySubject(subject: Subject): Task[] {
  return mockTasks.filter((task) => task.subject === subject);
}

export function getAssignmentById(id: string): Assignment | undefined {
  return mockAssignments.find((assignment) => assignment.id === id);
}

export function getLearningMaps(task: Task) {
  return task.learningMaps ?? [];
}

export function getPracticeQuestions(task: Task) {
  return task.practice ?? [];
}

export function getMasterQuestions(task: Task) {
  return task.master ?? [];
}

export function getTaskLearningMap(id: string) {
  const task = getTaskById(id);
  return task ? getLearningMaps(task) : [];
}

export function getTaskPracticeQuestions(id: string) {
  const task = getTaskById(id);
  return task ? getPracticeQuestions(task) : [];
}

export function getTaskMasterQuestions(id: string) {
  const task = getTaskById(id);
  return task ? getMasterQuestions(task) : [];
}

export function createMockTask(
  title: string,
  subject: Subject,
  taskType: Task["taskType"],
): Task {
  return {
    id: Math.random().toString(36).substr(2, 9),
    type: taskType,
    title,
    subject,
    taskType,
    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    priority: "medium",
    progress: 0,
    createdAt: new Date().toISOString().split("T")[0],
    learningMapPreset: subject,
  };
}
