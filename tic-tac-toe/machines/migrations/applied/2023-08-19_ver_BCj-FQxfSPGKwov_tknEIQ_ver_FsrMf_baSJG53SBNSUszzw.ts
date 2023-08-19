import { UpgradeState, UpgradeContext } from "@statebacked/machine-def";

export const upgradeState: UpgradeState = (oldState, _context) => {
  // I made a silly mistake and originally named the "o" player
  // "y" in the states I defined.
  // Easy to fix with a migration!
  return oldState.map((state) =>
    state === "Awaiting y move"
      ? "Awaiting o move"
      : state === "Process y move"
      ? "Process o move"
      : state
  );
};

export const upgradeContext: UpgradeContext = (
  _oldStates,
  _newStates,
  context
) => {
  return context;
};
