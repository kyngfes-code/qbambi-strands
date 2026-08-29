// "use client";

// import { signIn } from "next-auth/react";
// import { useState } from "react";

// export default function SignInPage() {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");

//   const [error, setError] = useState("");
//   const [loading, setLoading] = useState(false);

//   async function handleSubmit(e) {
//     e.preventDefault();

//     setError("");

//     const normalizedEmail = email.trim().toLowerCase();

//     if (!normalizedEmail || !password) {
//       setError("Please enter your email and password.");
//       return;
//     }

//     setLoading(true);

//     try {
//       const result = await signIn("credentials", {
//         email: normalizedEmail,
//         password,
//         redirect: false,
//       });

//       //--------------------------------------------------
//       // Login failed
//       //--------------------------------------------------

//       if (!result || result.error) {
//         switch (result?.error) {
//           case "account_inactive":
//             setError("Your account is inactive. Please contact support.");
//             break;

//           case "account_not_activated":
//             setError(
//               "Your account has not been activated yet. Please check your email for your account setup link.",
//             );
//             break;

//           case "invalid_credentials":
//           case "CredentialsSignin":
//           default:
//             setError("Invalid email or password.");
//             break;
//         }

//         return;
//       }

//       //--------------------------------------------------
//       // Successful authentication
//       //
//       // Get the authenticated session so we can determine
//       // where the user should go.
//       //--------------------------------------------------

//       const response = await fetch("/api/auth/session");

//       if (!response.ok) {
//         throw new Error("Unable to load your account session.");
//       }

//       const session = await response.json();

//       //--------------------------------------------------
//       // Academy student
//       //--------------------------------------------------

//       if (session?.user?.role === "student") {
//         window.location.href = "/academy/dashboard";
//         return;
//       }

//       //--------------------------------------------------
//       // Normal customer
//       //--------------------------------------------------

//       window.location.href = "/account";
//     } catch (err) {
//       console.error("Sign in error:", err);

//       setError("Unable to sign in right now. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   }

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-neutral-50 px-4">
//       <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-sm border">
//         <div className="mb-6">
//           <h1 className="text-2xl font-semibold">Sign in</h1>

//           <p className="mt-1 text-sm text-neutral-500">
//             Sign in to access your account.
//           </p>
//         </div>

//         {error && (
//           <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
//             {error}
//           </div>
//         )}

//         <form onSubmit={handleSubmit} className="space-y-4">
//           <div>
//             <label htmlFor="email" className="mb-1 block text-sm font-medium">
//               Email
//             </label>

//             <input
//               id="email"
//               type="email"
//               autoComplete="email"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               placeholder="you@example.com"
//               disabled={loading}
//               className="w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-pink-500 disabled:bg-neutral-100"
//             />
//           </div>

//           <div>
//             <label
//               htmlFor="password"
//               className="mb-1 block text-sm font-medium"
//             >
//               Password
//             </label>

//             <input
//               id="password"
//               type="password"
//               autoComplete="current-password"
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               placeholder="Your password"
//               disabled={loading}
//               className="w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-pink-500 disabled:bg-neutral-100"
//             />
//           </div>

//           <button
//             type="submit"
//             disabled={loading}
//             className="w-full rounded-lg bg-pink-600 py-2.5 text-white font-medium disabled:cursor-not-allowed disabled:opacity-60"
//           >
//             {loading ? "Signing in..." : "Sign in"}
//           </button>
//         </form>

//         <div className="mt-6 text-center text-sm text-neutral-500">
//           Don't have an account?{" "}
//           <a
//             href="/signup"
//             className="font-medium text-pink-600 hover:underline"
//           >
//             Sign up
//           </a>
//         </div>
//       </div>
//     </div>
//   );
// }

"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();

    setError("");

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail || !password) {
      setError("Please enter your email and password.");
      return;
    }

    setLoading(true);

    try {
      //--------------------------------------------------
      // Authenticate
      //--------------------------------------------------

      const result = await signIn("credentials", {
        email: normalizedEmail,
        password,
        redirect: false,
      });

      //--------------------------------------------------
      // Login failed
      //--------------------------------------------------

      if (!result || result.error) {
        switch (result?.error) {
          case "account_inactive":
            setError("Your account is inactive. Please contact support.");
            break;

          case "account_not_activated":
            setError(
              "Your account has not been activated yet. Please check your email for your account setup link.",
            );
            break;

          case "invalid_credentials":
          case "CredentialsSignin":
          default:
            setError("Invalid email or password.");
            break;
        }

        return;
      }

      //--------------------------------------------------
      // Ask server where this authenticated user belongs
      //--------------------------------------------------

      const redirectResponse = await fetch("/api/auth/redirect", {
        method: "GET",
        cache: "no-store",
      });

      const redirectData = await redirectResponse.json();

      //--------------------------------------------------
      // Redirect lookup failed
      //--------------------------------------------------

      if (!redirectResponse.ok) {
        throw new Error(
          redirectData?.error ||
            "Unable to determine your account destination.",
        );
      }

      //--------------------------------------------------
      // Redirect
      //--------------------------------------------------

      window.location.href = redirectData.redirectTo || "/account";
    } catch (err) {
      console.error("Sign in error:", err);

      setError(err.message || "Unable to sign in right now. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold">Sign in</h1>

            <p className="mt-1 text-sm text-neutral-500">
              Sign in to access your account.
            </p>
          </div>

          {error && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="mb-1 block text-sm font-medium">
                Email
              </label>

              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                disabled={loading}
                className="w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-pink-500 disabled:bg-neutral-100"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-1 block text-sm font-medium"
              >
                Password
              </label>

              <input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Your password"
                disabled={loading}
                className="w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-pink-500 disabled:bg-neutral-100"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-pink-600 py-2.5 font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-neutral-500">
            Don't have an account?{" "}
            <a
              href="/signup"
              className="font-medium text-pink-600 hover:underline"
            >
              Sign up
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
