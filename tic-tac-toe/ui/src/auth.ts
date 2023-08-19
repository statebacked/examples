import { SignJWT } from "jose";

const signingKey =
  "cpVCb0F1I0buPI2ixqizGatMVfLkFNSBPuGopTuqWEHzrjhgs6jZf6pGJeLD";
const aud = "tic-tac-toe.examples.statebacked.dev";

export const getAuth = async () => {
  const sub = getUserId();
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(signingKey),
    {
      name: "HMAC",
      hash: { name: "SHA-256" },
    },
    true,
    ["sign"],
  );
  const jwt = await new SignJWT({})
    .setProtectedHeader({ alg: "HS256" })
    .setAudience(aud)
    .setExpirationTime("1d")
    .setSubject(sub)
    .sign(key);

  return jwt;
};

export const getUserId = (() => {
  let sub = sessionStorage.getItem("sb.sub");

  return () => {
    if (!sub) {
      sub = crypto.randomUUID();
      sessionStorage.setItem("sb.sub", sub);
    }

    return sub;
  };
})();
