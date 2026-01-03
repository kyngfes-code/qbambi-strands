"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function InstalmentPaymentPage() {
  const { instalmentId } = useParams();
  const router = useRouter();

  const [instalment, setInstalment] = useState(null);
  const [receipt, setReceipt] = useState(null);
  const [loading, setLoading] = useState(true);

  /* 1️⃣ Load instalment */
  useEffect(() => {
    async function loadInstalment() {
      const res = await fetch(`/api/instalments/${instalmentId}`);
      const data = await res.json();
      setInstalment(data);
      setLoading(false);
    }

    if (instalmentId) loadInstalment();
  }, [instalmentId]);

  /* 2️⃣ Paystack */
  async function payWithPaystack() {
    if (!instalment?.amount || !instalment?.order_id) {
      return alert("Invalid instalment data");
    }

    const res = await fetch("/api/paystack", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        orderId: instalment.order_id,
        instalmentId: instalment.id,
        amount: instalment.amount,
        context: "instalment",
      }),
    });

    const data = await res.json();
    window.location.href = data.data.authorization_url;
  }

  /* 3️⃣ Upload receipt */
  async function uploadReceipt() {
    if (!receipt) return alert("Please upload receipt");

    setLoading(true);

    const formData = new FormData();
    formData.append("orderId", instalment.order_id);
    formData.append("instalmentId", instalment.id);
    formData.append("receipt", receipt);

    const res = await fetch("/api/orders/receipt", {
      method: "POST",
      body: formData,
    });

    if (res.ok) {
      router.push("/orders");
    } else {
      alert("Failed to upload receipt");
    }

    setLoading(false);
  }

  if (loading) {
    return <p>Loading ...</p>;
  }

  if (!instalment || !instalment.amount) {
    return <p className="text-red-500">Instalment not found</p>;
  }

  return (
    <div className="max-w-md mx-auto mt-10 space-y-6">
      <h1 className="text-xl font-bold">Pay Instalment</h1>

      <p className="text-sm text-neutral-600">
        Amount: ₦{instalment.amount.toLocaleString()}
      </p>

      {/* Paystack */}
      <button
        onClick={payWithPaystack}
        className="w-full py-2 bg-black text-white rounded-lg"
      >
        Pay with Paystack
      </button>

      {/* Bank transfer */}
      <div className="border rounded-xl p-4 space-y-3">
        <p className="font-semibold">Pay via Bank Transfer</p>

        <div className="text-sm bg-neutral-100 p-3 rounded-lg">
          <p>
            <b>Bank:</b> Access Bank
          </p>
          <p>
            <b>Account Name:</b> QBambi Strands
          </p>
          <p>
            <b>Account Number:</b> 1234567890
          </p>
        </div>

        <input
          type="file"
          accept="image/*"
          onChange={(e) => setReceipt(e.target.files[0])}
          className="text-white"
        />

        <button
          onClick={uploadReceipt}
          disabled={loading}
          className="w-full py-2 bg-black text-white rounded-lg disabled:opacity-50"
        >
          Upload Receipt
        </button>
      </div>
    </div>
  );
}
