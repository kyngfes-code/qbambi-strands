// import NextAuth from "next-auth";
// import Google from "next-auth/providers/google";
// import Credentials from "next-auth/providers/credentials";
// import bcrypt from "bcryptjs";

// import { createSupabaseAdmin } from "@/lib/supabase-admin";

// export const authConfig = {
//   providers: [
//     /**
//      * ======================================
//      * USER LOGIN
//      * ======================================
//      */

//     Credentials({
//       id: "credentials",
//       name: "Login",

//       credentials: {
//         email: {
//           label: "Email",
//           type: "email",
//         },

//         password: {
//           label: "Password",
//           type: "password",
//         },
//       },

//       async authorize(credentials) {
//         if (!credentials?.email || !credentials?.password) {
//           throw new Error("Missing email or password");
//         }

//         const supabaseAdmin = createSupabaseAdmin();

//         //--------------------------------------------------
//         // User
//         //--------------------------------------------------

//         const { data: user, error } = await supabaseAdmin
//           .from("users")
//           .select("*")
//           .eq("email", credentials.email.toLowerCase())
//           .single();

//         if (error || !user) {
//           throw new Error("Invalid email or password");
//         }

//         //--------------------------------------------------
//         // Account Status
//         //--------------------------------------------------

//         if (user.account_status !== "active") {
//           throw new Error("Your account is inactive.");
//         }

//         //--------------------------------------------------
//         // Password exists?
//         //--------------------------------------------------

//         if (!user.password_hash) {
//           throw new Error(
//             "Your account has not been activated yet. Please check your email to set your password.",
//           );
//         }

//         //--------------------------------------------------
//         // Verify Password
//         //--------------------------------------------------

//         const matches = await bcrypt.compare(
//           credentials.password,
//           user.password_hash,
//         );

//         if (!matches) {
//           throw new Error("Invalid email or password");
//         }

//         //--------------------------------------------------
//         // Update Login Timestamp
//         //--------------------------------------------------

//         await supabaseAdmin
//           .from("users")
//           .update({
//             last_login: new Date().toISOString(),
//           })
//           .eq("id", user.id);

//         //--------------------------------------------------
//         // Student Number (only students)
//         //--------------------------------------------------

//         let studentNumber = null;

//         if (user.role === "student") {
//           const { data: student } = await supabaseAdmin
//             .from("academy_students")
//             .select("student_number")
//             .eq("user_id", user.id)
//             .maybeSingle();

//           studentNumber = student?.student_number ?? null;
//         }

//         //--------------------------------------------------
//         // Success
//         //--------------------------------------------------

//         return {
//           id: user.id,

//           name: user.name,

//           email: user.email,

//           role: user.role,

//           studentNumber,
//         };
//       },
//     }),

//     /**
//      * ======================================
//      * GOOGLE LOGIN
//      * ======================================
//      */

//     Google({
//       clientId: process.env.AUTH_GOOGLE_ID,
//       clientSecret: process.env.AUTH_GOOGLE_SECRET,
//     }),
//   ],

//   session: {
//     strategy: "jwt",

//     maxAge: 7 * 24 * 60 * 60,

//     updateAge: 24 * 60 * 60,
//   },

//   jwt: {
//     maxAge: 7 * 24 * 60 * 60,
//   },

//   callbacks: {
//     /**
//      * GOOGLE SIGN IN
//      */

//     async signIn({ user, account }) {
//       if (account?.provider !== "google") {
//         return true;
//       }

//       const supabaseAdmin = createSupabaseAdmin();

//       const { data: existing } = await supabaseAdmin
//         .from("users")
//         .select("id")
//         .eq("email", user.email)
//         .maybeSingle();

//       if (existing) {
//         return true;
//       }

//       const { error } = await supabaseAdmin.from("users").insert({
//         email: user.email,

//         name: user.name,

//         image: user.image,

//         role: "user",
//       });

//       if (error) {
//         console.error(error);

//         return false;
//       }

//       return true;
//     },

//     /**
//      * JWT
//      */

//     async jwt({ token, user }) {
//       //--------------------------------------------------
//       // Initial Login
//       //--------------------------------------------------

//       if (user) {
//         token.id = user.id;

//         token.email = user.email;

//         token.role = user.role;

//         token.studentNumber = user.studentNumber;
//       }

//       //--------------------------------------------------
//       // Google users need role lookup
//       //--------------------------------------------------

//       if (token.email && !token.role) {
//         const supabaseAdmin = createSupabaseAdmin();

//         const { data: profile } = await supabaseAdmin
//           .from("users")
//           .select("id, role")
//           .eq("email", token.email)
//           .maybeSingle();

//         if (profile) {
//           token.id = profile.id;

//           token.role = profile.role;
//         }
//       }

//       return token;
//     },

//     /**
//      * SESSION
//      */

//     async session({ session, token }) {
//       if (session.user) {
//         session.user.id = token.id;

//         session.user.role = token.role;

//         session.user.studentNumber = token.studentNumber;
//       }

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
import { CredentialsSignin } from "next-auth";
import bcrypt from "bcryptjs";

import { createSupabaseAdmin } from "@/lib/supabase-admin";

/**
 * Custom credentials error.
 *
 * NextAuth will return this as a normal CredentialsSignin error
 * instead of sending the user to the server configuration error page.
 */
class LoginError extends CredentialsSignin {
  constructor(code = "invalid_credentials") {
    super();
    this.code = code;
  }
}

export const authConfig = {
  providers: [
    /**
     * ======================================
     * USER / STUDENT LOGIN
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
          throw new LoginError("invalid_credentials");
        }

        const email = String(credentials.email).trim().toLowerCase();
        const password = String(credentials.password);

        const supabaseAdmin = createSupabaseAdmin();

        //--------------------------------------------------
        // Find user
        //--------------------------------------------------

        const { data: user, error } = await supabaseAdmin
          .from("users")
          .select(
            `
            id,
            name,
            email,
            role,
            account_status,
            password_hash
          `,
          )
          .eq("email", email)
          .maybeSingle();

        //--------------------------------------------------
        // IMPORTANT:
        // Do not reveal whether the email exists.
        //--------------------------------------------------

        if (error) {
          console.error("Login user lookup error:", error);
          throw new LoginError("invalid_credentials");
        }

        if (!user) {
          throw new LoginError("invalid_credentials");
        }

        //--------------------------------------------------
        // Account status
        //--------------------------------------------------

        if (user.account_status !== "active") {
          throw new LoginError("account_inactive");
        }

        //--------------------------------------------------
        // Password setup
        //--------------------------------------------------

        if (!user.password_hash) {
          throw new LoginError("account_not_activated");
        }

        //--------------------------------------------------
        // Verify password
        //--------------------------------------------------

        const matches = await bcrypt.compare(password, user.password_hash);

        if (!matches) {
          throw new LoginError("invalid_credentials");
        }

        //--------------------------------------------------
        // Academy enrollment information
        //
        // academy_enrollments.status controls the student's
        // enrollment/payment stage.
        //
        // academy_students is intentionally NOT used here
        // for enrollment status.
        //--------------------------------------------------

        let academyEnrollmentStatus = null;
        let studentNumber = null;

        if (user.role === "student") {
          const { data: enrollment, error: enrollmentError } =
            await supabaseAdmin
              .from("academy_enrollments")
              .select(
                `
        id,
        status,
        enrollment_number
      `,
              )
              .eq("user_id", user.id)
              .order("created_at", { ascending: false })
              .maybeSingle();

          if (enrollmentError) {
            console.error("Academy enrollment lookup error:", enrollmentError);

            throw new LoginError("invalid_credentials");
          }

          academyEnrollmentStatus = enrollment?.status ?? null;

          studentNumber = enrollment?.enrollment_number ?? null;
        }

        //--------------------------------------------------
        // Update last login
        //--------------------------------------------------

        const { error: loginUpdateError } = await supabaseAdmin
          .from("users")
          .update({
            last_login: new Date().toISOString(),
          })
          .eq("id", user.id);

        if (loginUpdateError) {
          console.error("Unable to update last login:", loginUpdateError);
        }

        //--------------------------------------------------
        // Successful login
        //--------------------------------------------------

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,

          studentNumber,
          academyEnrollmentStatus,
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

  /**
   * ======================================
   * SESSION
   * ======================================
   */

  session: {
    strategy: "jwt",

    maxAge: 7 * 24 * 60 * 60,

    updateAge: 24 * 60 * 60,
  },

  jwt: {
    maxAge: 7 * 24 * 60 * 60,
  },

  /**
   * ======================================
   * CALLBACKS
   * ======================================
   */

  callbacks: {
    /**
     * GOOGLE SIGN IN
     */

    async signIn({ user, account }) {
      if (account?.provider !== "google") {
        return true;
      }

      const supabaseAdmin = createSupabaseAdmin();

      const email = user.email?.trim().toLowerCase();

      if (!email) {
        return false;
      }

      const { data: existing, error: lookupError } = await supabaseAdmin
        .from("users")
        .select("id")
        .eq("email", email)
        .maybeSingle();

      if (lookupError) {
        console.error("Google user lookup error:", lookupError);
        return false;
      }

      if (existing) {
        return true;
      }

      const { error } = await supabaseAdmin.from("users").insert({
        email,
        name: user.name,
        image: user.image,
        role: "user",
        account_status: "active",
      });

      if (error) {
        console.error("Google user creation error:", error);
        return false;
      }

      return true;
    },

    /**
     * JWT
     */

    async jwt({ token, user }) {
      //--------------------------------------------------
      // Initial login
      //--------------------------------------------------

      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.role = user.role;
        token.studentNumber = user.studentNumber ?? null;
        token.academyEnrollmentStatus = user.academyEnrollmentStatus ?? null;
      }

      //--------------------------------------------------
      // Google users
      //--------------------------------------------------

      if (token.email && !token.role) {
        const supabaseAdmin = createSupabaseAdmin();

        const { data: profile } = await supabaseAdmin
          .from("users")
          .select(
            `
            id,
            role,
            account_status
          `,
          )
          .eq("email", token.email)
          .maybeSingle();

        if (profile) {
          token.id = profile.id;
          token.role = profile.role;
          token.accountStatus = profile.account_status;
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
        session.user.studentNumber = token.studentNumber ?? null;

        session.user.academyEnrollmentStatus =
          token.academyEnrollmentStatus ?? null;
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
