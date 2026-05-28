import { clerkMiddleware } from "@clerk/nextjs/server";

import { updateSession } from "@/utils/supabase/middleware";

export default clerkMiddleware(async (_auth, request) => {
  return updateSession(request);
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/__clerk/(.*)",
    "/(api|trpc)(.*)",
  ],
};