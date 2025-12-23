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

        if (error || !data?.user || !data?.session) {
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

          // Supabase session data
          supabaseAccessToken: data.session.access_token,
          supabaseRefreshToken: data.session.refresh_token,
          supabaseExpiresAt: Date.now() + data.session.expires_in * 1000,
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
    maxAge: 7 * 24 * 60 * 60, // ✅ 7 days
    updateAge: 24 * 60 * 60, // 🔄 Rolling session (24h)
  },

  jwt: {
    maxAge: 7 * 24 * 60 * 60, // ✅ JWT expiry
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
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;

        token.supabaseAccessToken = user.supabaseAccessToken;
        token.supabaseRefreshToken = user.supabaseRefreshToken;
        token.supabaseExpiresAt = user.supabaseExpiresAt;
      }

      if (!token.role && token.email) {
        const supabaseAdmin = createSupabaseAdmin();

        const { data: profile } = await supabaseAdmin
          .from("users")
          .select("id, role")
          .eq("email", token.email)
          .single();

        if (profile) {
          token.id = profile.id;
          token.role = profile.role;
        }
      }

      // 🔄 Refresh Supabase access token if expired
      if (token.supabaseExpiresAt && Date.now() > token.supabaseExpiresAt) {
        const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

        if (!anonKey || !token.supabaseRefreshToken) {
          return token;
        }

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              apikey: anonKey,
            },
            body: JSON.stringify({
              refresh_token: token.supabaseRefreshToken,
            }),
          }
        );

        const refreshed = await res.json();

        token.supabaseAccessToken = refreshed.access_token;
        token.supabaseRefreshToken = refreshed.refresh_token;
        token.supabaseExpiresAt = Date.now() + refreshed.expires_in * 1000;
      }

      return token;
    },

    /**
     * SESSION CALLBACK
     */
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
      }

      session.supabaseAccessToken = token.supabaseAccessToken;

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
