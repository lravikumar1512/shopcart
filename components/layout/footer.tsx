import React from "react";
import Link from "next/link";
import { ShieldCheck, Truck, RotateCcw, CreditCard, Award } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#172337] text-white text-xs mt-12 border-t border-[#2e3a4d]">
      {/* Trust Badges Strip */}
      <div className="bg-[#21314d] py-6 border-b border-[#2e3a4d]">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="flex flex-col items-center gap-1.5">
            <Truck className="w-6 h-6 text-[#ff9f00]" />
            <span className="font-semibold text-sm">Free Delivery</span>
            <span className="text-gray-400 text-[11px]">On orders over ₹500</span>
          </div>
          <div className="flex flex-col items-center gap-1.5">
            <ShieldCheck className="w-6 h-6 text-[#ff9f00]" />
            <span className="font-semibold text-sm">100% Secure Payments</span>
            <span className="text-gray-400 text-[11px]">Powered by Razorpay</span>
          </div>
          <div className="flex flex-col items-center gap-1.5">
            <RotateCcw className="w-6 h-6 text-[#ff9f00]" />
            <span className="font-semibold text-sm">Easy Returns</span>
            <span className="text-gray-400 text-[11px]">7-Day Replacement Guarantee</span>
          </div>
          <div className="flex flex-col items-center gap-1.5">
            <Award className="w-6 h-6 text-[#ff9f00]" />
            <span className="font-semibold text-sm">Original Products</span>
            <span className="text-gray-400 text-[11px]">Directly from Verified Sellers</span>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-2 md:grid-cols-5 gap-8">
        <div>
          <h4 className="text-gray-400 font-semibold mb-3 tracking-wider text-[11px] uppercase">
            About
          </h4>
          <ul className="space-y-2 text-gray-300">
            <li><Link href="/" className="hover:underline">Contact Us</Link></li>
            <li><Link href="/" className="hover:underline">About ShopKart</Link></li>
            <li><Link href="/" className="hover:underline">Careers</Link></li>
            <li><Link href="/" className="hover:underline">ShopKart Stories</Link></li>
            <li><Link href="/" className="hover:underline">Press Releases</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-gray-400 font-semibold mb-3 tracking-wider text-[11px] uppercase">
            Help
          </h4>
          <ul className="space-y-2 text-gray-300">
            <li><Link href="/orders" className="hover:underline">Payments</Link></li>
            <li><Link href="/orders" className="hover:underline">Shipping</Link></li>
            <li><Link href="/orders" className="hover:underline">Cancellation & Returns</Link></li>
            <li><Link href="/orders" className="hover:underline">FAQ</Link></li>
            <li><Link href="/orders" className="hover:underline">Report Infringement</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-gray-400 font-semibold mb-3 tracking-wider text-[11px] uppercase">
            Consumer Policy
          </h4>
          <ul className="space-y-2 text-gray-300">
            <li><Link href="/" className="hover:underline">Cancellation & Returns</Link></li>
            <li><Link href="/" className="hover:underline">Terms Of Use</Link></li>
            <li><Link href="/" className="hover:underline">Security</Link></li>
            <li><Link href="/" className="hover:underline">Privacy</Link></li>
            <li><Link href="/" className="hover:underline">Sitemap</Link></li>
          </ul>
        </div>

        <div className="col-span-2 border-t md:border-t-0 md:border-l border-gray-700 pt-6 md:pt-0 md:pl-8">
          <h4 className="text-gray-400 font-semibold mb-3 tracking-wider text-[11px] uppercase">
            Registered Office Address:
          </h4>
          <p className="text-gray-300 leading-relaxed mb-4">
            ShopKart Internet Private Limited,<br />
            Buildings Alyssa, Begonia & Clove Embassy Tech Village,<br />
            Outer Ring Road, Devarabeesanahalli Village,<br />
            Bengaluru, 560103, Karnataka, India<br />
            CIN: U51109KA2012PTC066107
          </p>
          <div className="flex items-center gap-2 text-gray-400">
            <span>Telephone: </span>
            <span className="text-[#2874f0] font-medium">044-45614700 / 044-67415800</span>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-[#2e3a4d] py-6">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4 text-gray-400">
          <div className="flex flex-wrap items-center gap-6">
            <span className="flex items-center gap-1.5 text-gray-300">
              <CreditCard className="w-4 h-4 text-[#ff9f00]" />
              Accepted: Razorpay, UPI, NetBanking, Visa, Mastercard, COD
            </span>
          </div>
          <div>
            © {new Date().getFullYear()} ShopKart.com. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}
