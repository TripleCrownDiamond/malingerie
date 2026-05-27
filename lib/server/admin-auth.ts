import { auth } from "@clerk/nextjs/server";

import { readAdminConfig } from "@/lib/server/config-store";

export async function isAdminRequest() {
  const { userId } = await auth();
  if (!userId) {
    return false;
  }

  const config = await readAdminConfig();
  if (config.allowAnySignedInUser) {
    return true;
  }

  return config.adminUserIds.includes(userId);
}

export async function getRequiredAdminUserId() {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("UNAUTHORIZED");
  }

  const config = await readAdminConfig();
  if (!config.allowAnySignedInUser && !config.adminUserIds.includes(userId)) {
    throw new Error("FORBIDDEN");
  }

  return userId;
}