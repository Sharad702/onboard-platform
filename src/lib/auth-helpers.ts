import { connectDB } from "./db";
import OrganizationMember from "@/models/OrganizationMember";
import type { Types } from "mongoose";

/** Returns true if the user can access this client (owner, org admin, or assigned member). */
export async function canAccessClient(
  userId: string,
  client: { ownerId: Types.ObjectId; orgId?: Types.ObjectId | null; assignedTo?: Types.ObjectId | null }
): Promise<boolean> {
  const uid = typeof userId === "string" ? userId : (userId as unknown as string);
  if (client.ownerId?.toString() === uid && !client.orgId) return true;
  if (!client.orgId) return false;
  const mem = await OrganizationMember.findOne({ orgId: client.orgId, userId: uid });
  if (!mem) return false;
  if (["owner", "admin"].includes(mem.role)) return true;
  return client.assignedTo?.toString() === uid;
}

/** Org IDs where user is owner or admin (can see all clients in that org). */
export async function getOwnerAdminOrgIds(userId: string): Promise<Types.ObjectId[]> {
  await connectDB();
  const list = await OrganizationMember.find({ userId, role: { $in: ["owner", "admin"] } }).select("orgId").lean();
  return list.map((o) => o.orgId);
}
