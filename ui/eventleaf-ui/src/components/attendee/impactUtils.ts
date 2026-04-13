import { SHEETS_PER_TREE } from "../../mocks/attendeeImpactData";

export function treeMetaphorFromSheets(sheetsAvoided: number): {
  headline: string;
  subline: string;
  percentOfOneTree: number | null;
  wholeTrees: number;
} {
  if (sheetsAvoided <= 0) {
    return {
      headline: "Every digital ticket is a tiny forest win.",
      subline: "Attend your first event to start your tree story.",
      percentOfOneTree: null,
      wholeTrees: 0,
    };
  }
  const treesFloat = sheetsAvoided / SHEETS_PER_TREE;
  const wholeTrees = Math.floor(treesFloat);
  const fracOfOne = treesFloat - wholeTrees;
  const percentOfOneTree = fracOfOne * 100;

  if (wholeTrees === 0) {
    const pct = Math.max(0.1, Number(percentOfOneTree.toFixed(1)));
    return {
      headline: `You've saved about ${pct}% of a tree!`,
      subline: `That's ${sheetsAvoided.toLocaleString()} sheets of paper left on the branch — keep going.`,
      percentOfOneTree: pct,
      wholeTrees: 0,
    };
  }

  return {
    headline: `You've helped spare ${wholeTrees} full tree${wholeTrees === 1 ? "" : "s"} worth of paper.`,
    subline: `Plus ${sheetsAvoided.toLocaleString()} sheets of tickets, programs, and stubs that never hit the recycling bin.`,
    percentOfOneTree: null,
    wholeTrees,
  };
}
