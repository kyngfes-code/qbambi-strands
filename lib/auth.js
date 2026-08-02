// import NextAuth from "next-auth";
// import Google from "next-auth/providers/google";
// import Credentials from "next-auth/providers/credentials";
// import bcrypt from "bcryptjs";

// import { createSupabaseAdmin } from "@/lib/supabase-admin";
// import { supabase } from "@/lib/supabase";

// export const authConfig = {
//   providers: [
//     /**
//      * ============================
//      * CREDENTIALS → USERS ONLY
//      * ============================
//      */
//     Credentials({
//       name: "Credentials",
//       credentials: {
//         email: { label: "Email", type: "email" },
//         password: { label: "Password", type: "password" },
//       },
//       async authorize(credentials) {
//         if (!credentials?.email || !credentials?.password) {
//           throw new Error("Missing email or password");
//         }

//         // 1️⃣ Supabase auth
//         const { data, error } = await supabase.auth.signInWithPassword({
//           email: credentials.email,
//           password: credentials.password,
//         });

//         if (error || !data?.user || !data?.session) {
//           throw new Error("Invalid email or password");
//         }

//         // 2️⃣ Fetch user profile
//         const supabaseAdmin = createSupabaseAdmin();
//         const { data: profile } = await supabaseAdmin
//           .from("users")
//           .select("id, name, email, role")
//           .eq("id", data.user.id)
//           .single();

//         if (!profile) {
//           throw new Error("User profile missing");
//         }

//         // 🚫 Block admins from credentials login
//         if (profile.role === "admin") {
//           throw new Error("Admins must sign in with Google");
//         }

//         // ✅ Normal user login
//         return {
//           id: profile.id,
//           name: profile.name,
//           email: profile.email,
//           role: profile.role,

//           // Supabase session data
//           supabaseAccessToken: data.session.access_token,
//           supabaseRefreshToken: data.session.refresh_token,
//           supabaseExpiresAt: Date.now() + data.session.expires_in * 1000,
//         };
//       },
//     }),

//     /**
//      * ============================
//      * GOOGLE → USERS + ADMINS
//      * ============================
//      */
//     Google({
//       clientId: process.env.AUTH_GOOGLE_ID,
//       clientSecret: process.env.AUTH_GOOGLE_SECRET,
//     }),
//   ],

//   session: {
//     strategy: "jwt",
//     maxAge: 7 * 24 * 60 * 60, // ✅ 7 days
//     updateAge: 24 * 60 * 60, // 🔄 Rolling session (24h)
//   },

//   jwt: {
//     maxAge: 7 * 24 * 60 * 60, // ✅ JWT expiry
//   },

//   callbacks: {
//     /**
//      * SIGN IN (Google)
//      */
//     async signIn({ user, account }) {
//       if (account?.provider !== "google") return true;

//       const supabaseAdmin = createSupabaseAdmin();

//       const { data: existing } = await supabaseAdmin
//         .from("users")
//         .select("id")
//         .eq("email", user.email)
//         .maybeSingle();

//       if (existing) return true;

//       const { error } = await supabaseAdmin.from("users").insert({
//         email: user.email,
//         name: user.name,
//         image: user.image,
//         role: "user",
//       });

//       if (error) {
//         console.error("Profile insert failed:", error);
//         return false;
//       }

//       return true;
//     },

//     /**
//      * JWT
//      */
//     async jwt({ token, user }) {
//       if (user) {
//         token.id = user.id;
//         token.email = user.email;

//         token.supabaseAccessToken = user.supabaseAccessToken;
//         token.supabaseRefreshToken = user.supabaseRefreshToken;
//         token.supabaseExpiresAt = user.supabaseExpiresAt;
//       }

//       if (!token.role && token.email) {
//         const supabaseAdmin = createSupabaseAdmin();

//         const { data: profile } = await supabaseAdmin
//           .from("users")
//           .select("id, role")
//           .eq("email", token.email)
//           .single();

//         if (profile) {
//           token.id = profile.id;
//           token.role = profile.role;
//         }
//       }

//       // 🔄 Refresh Supabase access token if expired
//       if (token.supabaseExpiresAt && Date.now() > token.supabaseExpiresAt) {
//         const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

//         if (!anonKey || !token.supabaseRefreshToken) {
//           return token;
//         }

//         const res = await fetch(
//           `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`,
//           {
//             method: "POST",
//             headers: {
//               "Content-Type": "application/json",
//               apikey: anonKey,
//             },
//             body: JSON.stringify({
//               refresh_token: token.supabaseRefreshToken,
//             }),
//           }
//         );

//         const refreshed = await res.json();

//         token.supabaseAccessToken = refreshed.access_token;
//         token.supabaseRefreshToken = refreshed.refresh_token;
//         token.supabaseExpiresAt = Date.now() + refreshed.expires_in * 1000;
//       }

//       return token;
//     },

//     /**
//      * SESSION CALLBACK
//      */
//     async session({ session, token }) {
//       if (session.user) {
//         session.user.id = token.id;
//         session.user.role = token.role;
//       }

//       session.supabaseAccessToken = token.supabaseAccessToken;

//       return session;
//     },
//   },

//   pages: {
//     signIn: "/signin",
//   },
// };

// export const {
//   handlers: { GET, POST },
//   auth,
//   signIn,
//   signOut,
// } = NextAuth(authConfig);

import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

import { createSupabaseAdmin } from "@/lib/supabase-admin";

export const authConfig = {
  providers: [
    /**
     * ======================================
     * USER LOGIN
     * ======================================
     */

    Credentials({
      id: "credentials",
      name: "Login",

      credentials: {
        email: {
          label: "Email",
          type: "email",
        },

        password: {
          label: "Password",
          type: "password",
        },
      },

      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing email or password");
        }

        const supabaseAdmin = createSupabaseAdmin();

        //--------------------------------------------------
        // User
        //--------------------------------------------------

        const { data: user, error } = await supabaseAdmin
          .from("users")
          .select("*")
          .eq("email", credentials.email.toLowerCase())
          .single();

        if (error || !user) {
          throw new Error("Invalid email or password");
        }

        //--------------------------------------------------
        // Account Status
        //--------------------------------------------------

        if (user.account_status !== "active") {
          throw new Error("Your account is inactive.");
        }

        //--------------------------------------------------
        // Password exists?
        //--------------------------------------------------

        if (!user.password_hash) {
          throw new Error(
            "Your account has not been activated yet. Please check your email to set your password.",
          );
        }

        //--------------------------------------------------
        // Verify Password
        //--------------------------------------------------

        const matches = await bcrypt.compare(
          credentials.password,
          user.password_hash,
        );

        if (!matches) {
          throw new Error("Invalid email or password");
        }

        //--------------------------------------------------
        // Update Login Timestamp
        //--------------------------------------------------

        await supabaseAdmin
          .from("users")
          .update({
            last_login: new Date().toISOString(),
          })
          .eq("id", user.id);

        //--------------------------------------------------
        // Student Number (only students)
        //--------------------------------------------------

        let studentNumber = null;

        if (user.role === "student") {
          const { data: student } = await supabaseAdmin
            .from("academy_students")
            .select("student_number")
            .eq("user_id", user.id)
            .maybeSingle();

          studentNumber = student?.student_number ?? null;
        }

        //--------------------------------------------------
        // Success
        //--------------------------------------------------

        return {
          id: user.id,

          name: user.name,

          email: user.email,

          role: user.role,

          studentNumber,
        };
      },
    }),

    /**
     * ======================================
     * GOOGLE LOGIN
     * ======================================
     */

    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
  ],

  session: {
    strategy: "jwt",

    maxAge: 7 * 24 * 60 * 60,

    updateAge: 24 * 60 * 60,
  },

  jwt: {
    maxAge: 7 * 24 * 60 * 60,
  },

  callbacks: {
    /**
     * GOOGLE SIGN IN
     */

    async signIn({ user, account }) {
      if (account?.provider !== "google") {
        return true;
      }

      const supabaseAdmin = createSupabaseAdmin();

      const { data: existing } = await supabaseAdmin
        .from("users")
        .select("id")
        .eq("email", user.email)
        .maybeSingle();

      if (existing) {
        return true;
      }

      const { error } = await supabaseAdmin.from("users").insert({
        email: user.email,

        name: user.name,

        image: user.image,

        role: "user",
      });

      if (error) {
        console.error(error);

        return false;
      }

      return true;
    },

    /**
     * JWT
     */

    async jwt({ token, user }) {
      //--------------------------------------------------
      // Initial Login
      //--------------------------------------------------

      if (user) {
        token.id = user.id;

        token.email = user.email;

        token.role = user.role;

        token.studentNumber = user.studentNumber;
      }

      //--------------------------------------------------
      // Google users need role lookup
      //--------------------------------------------------

      if (token.email && !token.role) {
        const supabaseAdmin = createSupabaseAdmin();

        const { data: profile } = await supabaseAdmin
          .from("users")
          .select("id, role")
          .eq("email", token.email)
          .maybeSingle();

        if (profile) {
          token.id = profile.id;

          token.role = profile.role;
        }
      }

      return token;
    },

    /**
     * SESSION
     */

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;

        session.user.role = token.role;

        session.user.studentNumber = token.studentNumber;
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
