"use client";

import { useState } from "react";
import { ShieldCheck, CreditCard, Loader2 } from "lucide-react";

interface RazorpayCheckoutButtonProps {
  amountPaise: number; // in paise, e.g. 50000 = ₹500
  currency?: string;
  name?: string;
  description?: string;
  receipt?: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  buttonText?: string;
  className?: string;
  onSuccess?: (data: {
    orderId: string;
    paymentId: string;
    signature: string;
  }) => void;
  onFailure?: (error: string) => void;
}

interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

export default function RazorpayCheckoutButton({
  amountPaise,
  currency = "INR",
  name = "Petal & Pearl",
  description = "Boutique Adornments Checkout",
  receipt,
  prefill,
  buttonText,
  className,
  onSuccess,
  onFailure,
}: RazorpayCheckoutButtonProps) {
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);

  const loadScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (typeof window === "undefined") return resolve(false);
      // Check if already loaded
      if ((window as unknown as { Razorpay?: unknown }).Razorpay) {
        return resolve(true);
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    setLoading(true);
    setStatusMessage(null);
    setIsError(false);

    try {
      // 1. Ensure Razorpay SDK script is loaded
      const scriptLoaded = await loadScript();
      if (!scriptLoaded) {
        throw new Error("Unable to load Razorpay SDK. Please check your internet connection.");
      }

      // 2. Call backend order creation endpoint
      const createRes = await fetch("/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: amountPaise,
          currency,
          receipt,
        }),
      });

      const orderData = await createRes.json();
      if (!createRes.ok || !orderData.order_id) {
        throw new Error(orderData.error || "Failed to initiate payment order.");
      }

      // 3. Open Razorpay Standard Checkout Modal
      const options = {
        key: orderData.key_id || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name,
        description,
        order_id: orderData.order_id,
        prefill: {
          name: prefill?.name || "",
          email: prefill?.email || "",
          contact: prefill?.contact || "",
        },
        theme: {
          color: "#39342F",
        },
        handler: async function (response: RazorpayResponse) {
          try {
            // 4. Send payment signatures to backend verification endpoint
            const verifyRes = await fetch("/api/verify-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            const verifyData = await verifyRes.json();
            if (verifyRes.ok && verifyData.success) {
              setStatusMessage("Payment verified successfully!");
              setIsError(false);
              if (onSuccess) {
                onSuccess({
                  orderId: response.razorpay_order_id,
                  paymentId: response.razorpay_payment_id,
                  signature: response.razorpay_signature,
                });
              }
            } else {
              const err = verifyData.error || "Payment signature verification failed.";
              setStatusMessage(err);
              setIsError(true);
              if (onFailure) onFailure(err);
            }
          } catch {
            const err = "Failed to communicate with payment verification server.";
            setStatusMessage(err);
            setIsError(true);
            if (onFailure) onFailure(err);
          } finally {
            setLoading(false);
          }
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
            setStatusMessage("Payment cancelled by user.");
            setIsError(false);
          },
        },
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const rzpInstance = new (window as any).Razorpay(options);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      rzpInstance.on("payment.failed", function (response: any) {
        const failureDesc = response.error?.description || "Payment transaction failed.";
        setStatusMessage(`Payment failed: ${failureDesc}`);
        setIsError(true);
        setLoading(false);
        if (onFailure) onFailure(failureDesc);
      });

      rzpInstance.open();
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Payment initialization error.";
      setStatusMessage(errorMsg);
      setIsError(true);
      setLoading(false);
      if (onFailure) onFailure(errorMsg);
    }
  };

  const formattedAmount = (amountPaise / 100).toLocaleString("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  });

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={handlePayment}
        disabled={loading}
        className={
          className ||
          "w-full bg-[#39342F] hover:bg-[#2A2622] text-[#F1EAE0] py-3.5 px-6 font-sans text-xs uppercase tracking-widest font-medium transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
        }
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin text-[#D8C5AB]" />
            <span>Opening Secure Gateway...</span>
          </>
        ) : (
          <>
            <CreditCard className="w-4 h-4 text-[#D8C5AB]" />
            <span>{buttonText || `Pay ${formattedAmount} via Razorpay`}</span>
          </>
        )}
      </button>

      {statusMessage && (
        <div
          className={`p-2.5 text-xs font-sans flex items-center gap-2 border ${
            isError
              ? "bg-rose-50 border-rose-200 text-rose-800"
              : "bg-emerald-50 border-emerald-200 text-emerald-800"
          }`}
        >
          <ShieldCheck className="w-4 h-4 shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}
    </div>
  );
}
