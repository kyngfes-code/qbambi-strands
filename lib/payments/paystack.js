const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
const CALLBACK_URL = process.env.PAYSTACK_CALLBACK_URL;

if (!PAYSTACK_SECRET_KEY) {
  throw new Error("PAYSTACK_SECRET_KEY is missing.");
}

const PAYSTACK_BASE_URL = "https://api.paystack.co";

/*
|--------------------------------------------------------------------------
| Common Request Helper
|--------------------------------------------------------------------------
*/

async function paystackRequest(endpoint, options = {}) {
  let response;

  try {
    response = await fetch(`${PAYSTACK_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
    });
  } catch (err) {
    console.error("Paystack network error:", err);

    throw new Error("Unable to connect to Paystack.");
  }

  const data = await response.json();

  if (!response.ok || data.status === false) {
    throw new Error(data.message || "Paystack request failed.");
  }

  return data;
}

/*
|--------------------------------------------------------------------------
| Initialize Payment
|--------------------------------------------------------------------------
*/

export async function initializePaystackPayment({
  email,
  amount,
  reference,
  metadata,
}) {
  const payload = {
    email,

    // Paystack expects Kobo
    amount: Math.round(Number(amount) * 100),

    reference,

    callback_url: CALLBACK_URL,

    metadata,
  };

  const response = await paystackRequest("/transaction/initialize", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  return response.data;
}

/*
|--------------------------------------------------------------------------
| Verify Transaction
|--------------------------------------------------------------------------
*/

export async function verifyPaystackTransaction(reference) {
  const response = await paystackRequest(`/transaction/verify/${reference}`, {
    method: "GET",
  });

  return response.data;
}

/*
|--------------------------------------------------------------------------
| Refund Transaction
|--------------------------------------------------------------------------
*/

export async function refundPaystackTransaction({
  transactionReference,
  amount = null,
  customerNote = null,
  merchantNote = null,
}) {
  const payload = {
    transaction: transactionReference,
  };

  if (amount) {
    payload.amount = Math.round(Number(amount) * 100);
  }

  if (customerNote) {
    payload.customer_note = customerNote;
  }

  if (merchantNote) {
    payload.merchant_note = merchantNote;
  }

  const response = await paystackRequest("/refund", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  return response.data;
}
