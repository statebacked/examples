// this is our authorization context.
// our backend creates a JWT with this context in ui/app/statebacked-token/route.ts
// and signs it with our State Backed key.
// then, our authorizers in src/index.ts use this context to make authorization decisions.
export type AuthContext = { sub: string; email: string };
