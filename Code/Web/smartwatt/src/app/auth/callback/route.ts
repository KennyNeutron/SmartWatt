// File: /src/app/auth/callback/route.ts
import { type EmailOtpType } from "@supabase/supabase-js";
import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/src/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = searchParams.get("next") ?? "/";

  console.log("Auth Callback Hit");
  console.log("Params:", { token_hash: !!token_hash, type, next });

  if (token_hash && type) {
    const supabase = await createClient();

    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    });

    if (error) {
      console.error("Auth Callback Error:", error.message);
    }

    if (!error) {
      // redirectTo specified in the signup/password reset function
      return NextResponse.redirect(`${request.nextUrl.origin}${next}`);
    }
  } else {
    console.warn("Auth Callback Missing Params");
  }

  // return the user to an error page with some instructions
  return NextResponse.redirect(`${request.nextUrl.origin}/error`);
}
