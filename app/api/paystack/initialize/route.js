// import { NextResponse } from "next/server";
// import { auth } from "@/lib/auth";
// import { createSupabaseAdmin } from "@/lib/supabase-admin";

// import { initializeAcademyEnrollmentPayment } from "@/lib/payments/academy";
// import { initializeAppointmentDeposit } from "@/lib/payments/appointments";
// import { initializeOutstandingPayment } from "@/lib/payments/appointments";
// import { initializeOrderPayment } from "@/lib/payments/orders";

// export async function POST(req) {
//   try {
//     /*
//     ==========================================================
//     Authenticate User
//     ==========================================================
//     */

//     const session = await auth();

//     if (!session?.user?.id) {
//       return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
//     }

//     /*
//     ==========================================================
//     Parse Request
//     ==========================================================
//     */

//     const body = await req.json();

//     const { entityType, entityId, paymentType, amount } = body;

//     if (!entityType || !entityId || !paymentType) {
//       return NextResponse.json(
//         {
//           error: "entityType, entityId and paymentType are required.",
//         },
//         { status: 400 },
//       );
//     }

//     const supabase = createSupabaseAdmin();

//     let result;

//     /*
//     ==========================================================
//     Appointment Payments
//     ==========================================================
//     */

//     if (entityType === "appointment") {
//       switch (paymentType) {
//         case "deposit":
//           result = await initializeAppointmentDeposit({
//             supabase,
//             session,
//             entityId,
//           });
//           break;

//         case "outstanding_payment":
//           result = await initializeOutstandingPayment({
//             supabase,
//             session,
//             entityId,
//             requestedAmount: amount,
//           });
//           break;

//         default:
//           return NextResponse.json(
//             {
//               error: "Invalid appointment payment type.",
//             },
//             {
//               status: 400,
//             },
//           );
//       }
//     }
//     else if (entityType === "order") {
//       /*
//     ==========================================================
//     Orders
//     ==========================================================
//     */
//       result = await initializeOrderPayment({
//         supabase,
//         session,
//         entityId,
//       });
//     } else {
//       /*
//     ==========================================================
//     Unsupported Entity
//     ==========================================================
//     */
//       return NextResponse.json(
//         {
//           error: "Unsupported entity type.",
//         },
//         {
//           status: 400,
//         },
//       );
//     }

//     /*
//     ==========================================================
//     Success
//     ==========================================================
//     */

//     return NextResponse.json(result);
//   } catch (error) {
//     console.error("Initialize payment:", error);

//     return NextResponse.json(
//       {
//         error: error.message || "Failed to initialize payment.",
//       },
//       {
//         status: 500,
//       },
//     );
//   }
// }

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createSupabaseAdmin } from "@/lib/supabase-admin";

import {
  initializeAppointmentDeposit,
  initializeOutstandingPayment,
} from "@/lib/payments/appointments";

import { initializeOrderPayment } from "@/lib/payments/orders";
import { initializeAcademyEnrollmentPayment } from "@/lib/payments/academy";

export async function POST(req) {
  try {
    /*
    ==========================================================
    Authenticate User
    ==========================================================
    */

    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          error: "Unauthorized.",
        },
        {
          status: 401,
        },
      );
    }

    /*
    ==========================================================
    Parse Request
    ==========================================================
    */

    const body = await req.json();

    const { entityType, entityId, paymentType, amount } = body;

    if (!entityType || !entityId || !paymentType) {
      return NextResponse.json(
        {
          error: "entityType, entityId and paymentType are required.",
        },
        {
          status: 400,
        },
      );
    }

    const supabase = createSupabaseAdmin();

    let result;

    /*
    ==========================================================
    Appointment Payments
    ==========================================================
    */

    if (entityType === "appointment") {
      switch (paymentType) {
        case "deposit":
          result = await initializeAppointmentDeposit({
            supabase,
            session,
            entityId,
          });
          break;

        case "outstanding_payment":
          result = await initializeOutstandingPayment({
            supabase,
            session,
            entityId,
            requestedAmount: amount,
          });
          break;

        default:
          return NextResponse.json(
            {
              error: "Invalid appointment payment type.",
            },
            {
              status: 400,
            },
          );
      }
    } else if (entityType === "order") {
      /*
    ==========================================================
    Order Payments
    ==========================================================
    */
      result = await initializeOrderPayment({
        supabase,
        session,
        entityId,
      });
    } else if (entityType === "academy_enrollment") {
      /*
    ==========================================================
    Academy Enrollment Payments
    ==========================================================
    */
      if (paymentType !== "initial_payment" && paymentType !== "full_payment") {
        return NextResponse.json(
          {
            error: "Invalid academy payment type.",
          },
          {
            status: 400,
          },
        );
      }

      result = await initializeAcademyEnrollmentPayment({
        supabase,
        session,
        entityId,
        paymentType,
      });
    } else {
      /*
    ==========================================================
    Unsupported Entity
    ==========================================================
    */
      return NextResponse.json(
        {
          error: "Unsupported entity type.",
        },
        {
          status: 400,
        },
      );
    }

    /*
    ==========================================================
    Success
    ==========================================================
    */

    return NextResponse.json(result);
  } catch (error) {
    console.error("Initialize payment:", error);

    return NextResponse.json(
      {
        error: error.message || "Failed to initialize payment.",
      },
      {
        status: 500,
      },
    );
  }
}
