import { UpgradeState, UpgradeContext } from "@statebacked/machine-def";

export const upgradeState: UpgradeState = (oldState, _context) => {
  return oldState;
};

export const upgradeContext: UpgradeContext = (
  _oldStates,
  _newStates,
  context
) => {
  return context;
};
