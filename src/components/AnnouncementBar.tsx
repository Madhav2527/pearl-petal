"use client";

import Link from "next/link";
import { Sparkles } from "lucide-react";

export default function AnnouncementBar() {
  return (
    <div className="bg-charcoal text-ivory py-2 px-4 text-center text-xs tracking-widest uppercase font-sans border-b border-charcoal-light flex items-center justify-center gap-2">
      <Sparkles className="w-3.5 h-3.5 text-champagne shrink-0" />
      <span>
        Complimentary boutique packaging on all prepaid orders &bull; Free express delivery over ₹999
      </span>
      <Link
        href="/shop"
        className="underline underline-offset-4 hover:text-champagne transition-colors ml-1 hidden sm:inline"
      >
        Shop Now
      </Link>
    </div>
  );
}
