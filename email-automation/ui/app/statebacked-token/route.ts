import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { signToken } from "@statebacked/token";

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

  const token = await signToken(
    {
      stateBackedKeyId,
      stateBackedSecretKey,
    },
    {
      sub: user.id,
      email: user.email,
    },
    {
      expires: {
        in: "7 days",
      },
      issuer: "email-automation.examples.statebacked.dev",
    },
  );

  return NextResponse.json({ token });
}
