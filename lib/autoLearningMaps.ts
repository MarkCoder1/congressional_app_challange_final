export function getAutoLearningMaps(subject: string, type: string) {
  if (type === "assignment") {
    return [
      { presetId: "flow", data: {} },
      { presetId: "steps", data: {} }
    ];
  }

  // LESSON (concept)
  switch (subject) {
    case "Math":
      return [
        { presetId: "definitions", data: {} },
        { presetId: "formulas", data: {} },
        { presetId: "graph-behavior", data: {} },
        { presetId: "solving-methods", data: {} }
      ];

    case "History":
      return [
        { presetId: "timeline", data: {} },
        { presetId: "causes", data: {} },
        { presetId: "effects", data: {} },
        { presetId: "key-figures", data: {} }
      ];

    case "Biology":
      return [
        { presetId: "structure", data: {} },
        { presetId: "process", data: {} },
        { presetId: "life-cycle", data: {} }
      ];

    default:
      return [
        { presetId: "concept", data: {} }
      ];
  }
}