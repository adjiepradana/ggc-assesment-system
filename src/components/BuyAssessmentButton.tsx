"use client";

import React, { useState } from "react";
import { CreditCard, ArrowRight } from "lucide-react";
import MidtransCheckoutModal from "@/components/MidtransCheckoutModal";

interface BuyAssessmentButtonProps {
  price?: number;
  userName?: string;
  userEmail?: string;
  className?: string;
  buttonText?: string;
}

export default function BuyAssessmentButton({
  price = 49000,
  userName,
  userEmail,
  className = "",
  buttonText = "Beli Akses Sekarang (Rp 49.000)",
}: BuyAssessmentButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={
          className ||
          "inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl font-bold text-ggc-dark bg-gradient-to-r from-[#E6D5A8] via-ggc-gold to-ggc-gold-dark hover:shadow-lg transition-all text-sm group shadow-md cursor-pointer"
        }
      >
        <CreditCard className="w-4 h-4 text-ggc-dark" />
        <span>{buttonText}</span>
        <ArrowRight className="w-4 h-4 text-ggc-dark transition-transform duration-200 group-hover:translate-x-1" />
      </button>

      <MidtransCheckoutModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        price={price}
        initialName={userName}
        initialEmail={userEmail}
      />
    </>
  );
}
