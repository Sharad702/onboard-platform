import NextAuth, { type NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { getServerSession } from "next-auth";
import { connectDB } from "./db";
import User from "@/models/User";
import MagicLinkToken from "@/models/MagicLinkToken";
import OrganizationInvite from "@/models/OrganizationInvite";
import OrganizationMember from "@/models/OrganizationMember";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
    Credentials({
      id: "magic-link",
      name: "Magic Link",
      credentials: { token: { label: "Token", type: "text" } },
      async authorize(credentials) {
        const token = credentials?.token as string | undefined;
        if (!token) return null;
        await connectDB();
        const row = await MagicLinkToken.findOne({ token, expiresAt: { $gt: new Date() } });
        if (!row) return null;
        let user = await User.findOne({ email: row.email.toLowerCase() });
        if (!user) {
          user = await User.create({ email: row.email.toLowerCase() });
        }
        await MagicLinkToken.deleteOne({ _id: row._id });
        return { id: user._id.toString(), email: user.email };
      },
    }),
    Credentials({
      id: "invite",
      name: "Invite",
      credentials: { inviteToken: { label: "Invite token", type: "text" } },
      async authorize(credentials) {
        const inviteToken = credentials?.inviteToken as string | undefined;
        if (!inviteToken) return null;
        await connectDB();
        const invite = await OrganizationInvite.findOne({
          token: inviteToken,
          expiresAt: { $gt: new Date() },
        }).select("orgId email");
        if (!invite) return null;
        const email = (invite.email as string).toLowerCase().trim();
        let user = await User.findOne({ email });
        if (!user) user = await User.create({ email });
        try {
          await OrganizationMember.create({
            orgId: invite.orgId,
            userId: user._id,
            role: "member",
          });
        } catch (e: unknown) {
          if (e && typeof e === "object" && "code" in e && (e as { code: number }).code === 11000) {
            // already a member
          } else throw e;
        }
        await OrganizationInvite.deleteOne({ _id: invite._id });
        return { id: user._id.toString(), email: user.email };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        const email = (user.email ?? (user as { email?: string }).email)?.toLowerCase();
        const name = (user as { name?: string }).name;
        if (account?.provider === "google" && email) {
          await connectDB();
          let dbUser = await User.findOne({ email });
          if (!dbUser) {
            dbUser = await User.create({ email, fullName: name ?? "" });
          } else if (name && !dbUser.fullName) {
            dbUser.fullName = name;
            await dbUser.save();
          }
          token.sub = dbUser._id.toString();
          token.email = dbUser.email;
        } else {
          token.sub = user.id;
          token.email = email ?? (user as { email?: string }).email;
        }
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub!;
        session.user.email = (token.email as string) ?? "";
      }
      return session;
    },
  },
  pages: { signIn: "/login" },
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
};

const handler = NextAuth(authOptions);

export async function getSession() {
  return await getServerSession(authOptions);
}

export { handler as GET, handler as POST };
