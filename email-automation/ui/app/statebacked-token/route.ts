import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { signToken } from "@statebacked/token";
import type { AuthContext } from "../../../statebacked/src/auth-context";

const stateBackedKeyId = process.env.STATEBACKED_KEY_ID!;
const stateBackedSecretKey = process.env.STATEBACKED_SECRET_KEY!;

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = createRouteHandlerClient({ cookies });
  const userData = await supabase.auth.getUser();

  if (userData.error) {
    return NextResponse.json(null, { status: 403 });
  }

  const user = userData.data.user;

  if (!user.email) {
    return NextResponse.json(null, { status: 403 });
  }

  // This is the authorization context that our State Backed authorizers can use
  // to allow requests to read and write to our machine instances.
  // See statebacked/src/index.ts for the authorizers.
  const authContext: AuthContext = {
    sub: user.id,
    email: user.email,
  };

  const token = await signToken(
    {
      stateBackedKeyId,
      stateBackedSecretKey,
    },
    authContext,
    {
      expires: {
        in: "7 days",
      },
      issuer: "email-automation.examples.statebacked.dev",
    },
  );

  return NextResponse.json({ token });
}
