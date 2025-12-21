import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";

import { createSupabaseAdmin } from "@/lib/supabase-admin";
import { supabase } from "@/lib/supabase";

export const authConfig = {
  providers: [
    /**
     * ============================
     * CREDENTIALS → USERS ONLY
     * ============================
     */
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing email or password");
        }

        // 1️⃣ Supabase auth
        const { data, error } = await supabase.auth.signInWithPassword({
          email: credentials.email,
          password: credentials.password,
        });

        if (error || !data?.user) {
          throw new Error("Invalid email or password");
        }

        // 2️⃣ Fetch user profile
        const supabaseAdmin = createSupabaseAdmin();
        const { data: profile } = await supabaseAdmin
          .from("users")
          .select("id, name, email, role")
          .eq("id", data.user.id)
          .single();

        if (!profile) {
          throw new Error("User profile missing");
        }

        // 🚫 Block admins from credentials login
        if (profile.role === "admin") {
          throw new Error("Admins must sign in with Google");
        }

        // ✅ Normal user login
        return {
          id: profile.id,
          name: profile.name,
          email: profile.email,
          role: profile.role,
          supabaseAccessToken: data.session.access_token,
        };
      },
    }),

    /**
     * ============================
     * GOOGLE → USERS + ADMINS
     * ============================
     */
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
  ],

  session: {
    strategy: "jwt",
  },

  callbacks: {
    /**
     * SIGN IN (Google)
     */
    async signIn({ user, account }) {
      if (account?.provider !== "google") return true;

      const supabaseAdmin = createSupabaseAdmin();

      const { data: existing } = await supabaseAdmin
        .from("users")
        .select("id")
        .eq("email", user.email)
        .maybeSingle();

      if (existing) return true;

      const { error } = await supabaseAdmin.from("users").insert({
        email: user.email,
        name: user.name,
        image: user.image,
        role: "user",
      });

      if (error) {
        console.error("Profile insert failed:", error);
        return false;
      }

      return true;
    },

    /**
     * JWT
     */
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        if (user.supabaseAccessToken) {
          token.supabaseAccessToken = user.supabaseAccessToken;
        }
      }

      if (account?.access_token) {
        token.supabaseAccessToken = account.access_token;
      }

      // Attach role from DB
      if (token?.email) {
        const supabaseAdmin = createSupabaseAdmin();
        const { data: profile } = await supabaseAdmin
          .from("users")
          .select("role")
          .eq("email", token.email)
          .single();

        if (profile?.role) {
          token.role = profile.role;
        }
      }

      return token;
    },

    /**
     * SESSION
     */
    async session({ session, token }) {
      session.supabaseAccessToken = token.supabaseAccessToken;

      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
      }

      return session;
    },
  },

  pages: {
    signIn: "/signin",
  },
};

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth(authConfig);
