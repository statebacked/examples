// if we don't want to wait around for days, we can use test time to speed things up.
// days become minutes, minutes become seconds.
const useTestTime = true;

const actualDays = (nDays: number) => nDays * 24 * 60 * 60 * 1000;

const actualMinutes = (nMinutes: number) => nMinutes * 60 * 1000;

const actualSeconds = (nSeconds: number) => nSeconds * 1000;

export const days = (nDays: number) => useTestTime ? actualMinutes(nDays) : actualDays(nDays);

export const minutes = (nMinutes: number) => useTestTime ? actualSeconds(nMinutes) : actualMinutes(nMinutes);

