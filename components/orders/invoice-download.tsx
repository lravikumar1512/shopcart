"use client";

import React, { useState } from "react";
import { Download, FileText, Loader2 } from "lucide-react";
import jsPDF from "jspdf";
import { formatCurrency, formatDate } from "@/lib/utils";

interface InvoiceDownloadProps {
  order: {
    orderNumber: string;
    createdAt: string | Date;
    totalAmount: number;
    subtotal: number;
    discount: number;
    deliveryCharge: number;
    paymentMethod: string;
    shippingAddress: string;
    items: {
      title: string;
      price: number;
      mrp: number;
      quantity: number;
      total: number;
    }[];
    user?: {
      name: string;
      email: string;
    };
  };
}

export default function InvoiceDownload({ order }: InvoiceDownloadProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const generatePDF = () => {
    setIsGenerating(true);
    try {
      const doc = new jsPDF();
      let addressData: any = {};
      try {
        addressData = JSON.parse(order.shippingAddress);
      } catch {
        addressData = { name: "Valued Customer" };
      }

      // 1. Header Banner
      doc.setFillColor(40, 116, 240); // Flipkart blue
      doc.rect(0, 0, 210, 26, "F");

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(22);
      doc.setFont("helvetica", "bold");
      doc.text("ShopKart", 14, 17);

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text("Tax Invoice / Bill of Supply", 145, 17);

      // 2. Seller & Order Info
      doc.setTextColor(50, 50, 50);
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.text("Sold By:", 14, 38);
      doc.setFont("helvetica", "normal");
      doc.text("ShopKart Internet Pvt Ltd", 14, 44);
      doc.text("Embassy Tech Village, Outer Ring Road", 14, 49);
      doc.text("Bengaluru, Karnataka - 560103", 14, 54);
      doc.text("GSTIN: 29AABCS1429B1Z2", 14, 59);

      doc.setFont("helvetica", "bold");
      doc.text("Invoice Details:", 130, 38);
      doc.setFont("helvetica", "normal");
      doc.text(`Invoice No: INV-${order.orderNumber}`, 130, 44);
      doc.text(`Order Date: ${formatDate(order.createdAt)}`, 130, 49);
      doc.text(`Payment: ${order.paymentMethod}`, 130, 54);
      doc.text(`Status: Confirmed`, 130, 59);

      // Divider line
      doc.setDrawColor(220, 220, 220);
      doc.line(14, 65, 196, 65);

      // 3. Shipping Address
      doc.setFont("helvetica", "bold");
      doc.text("Shipping Address:", 14, 73);
      doc.setFont("helvetica", "normal");
      doc.text(`${addressData.name || "Customer"}`, 14, 79);
      doc.text(`${addressData.street || ""}, ${addressData.locality || ""}`, 14, 84);
      doc.text(`${addressData.city || ""}, ${addressData.state || ""} - ${addressData.pincode || ""}`, 14, 89);
      doc.text(`Phone: ${addressData.phone || "N/A"}`, 14, 94);

      // 4. Items Table Header
      let y = 104;
      doc.setFillColor(241, 243, 246);
      doc.rect(14, y, 182, 8, "F");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.text("Item Description", 18, y + 5.5);
      doc.text("MRP", 115, y + 5.5);
      doc.text("Price", 140, y + 5.5);
      doc.text("Qty", 165, y + 5.5);
      doc.text("Total", 182, y + 5.5);

      y += 12;
      doc.setFont("helvetica", "normal");

      // 5. Items Rows
      order.items.forEach((item) => {
        const title = item.title.length > 45 ? item.title.substring(0, 42) + "..." : item.title;
        doc.text(title, 18, y);
        doc.text(formatCurrency(item.mrp), 115, y);
        doc.text(formatCurrency(item.price), 140, y);
        doc.text(String(item.quantity), 168, y);
        doc.text(formatCurrency(item.total), 182, y);
        y += 8;
      });

      // Divider
      doc.line(14, y + 2, 196, y + 2);
      y += 10;

      // 6. Summary Block
      const rightX = 140;
      doc.text("Subtotal (MRP):", rightX, y);
      doc.text(formatCurrency(order.subtotal), 182, y);
      y += 6;

      doc.setTextColor(56, 142, 60);
      doc.text("Discount:", rightX, y);
      doc.text(`- ${formatCurrency(order.discount)}`, 182, y);
      y += 6;

      doc.setTextColor(50, 50, 50);
      doc.text("Delivery Fee:", rightX, y);
      doc.text(order.deliveryCharge === 0 ? "FREE" : formatCurrency(order.deliveryCharge), 182, y);
      y += 8;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.text("Grand Total:", rightX, y);
      doc.text(formatCurrency(order.totalAmount), 182, y);

      // 7. Footer note
      doc.setFont("helvetica", "italic");
      doc.setFontSize(8);
      doc.setTextColor(120, 120, 120);
      doc.text("This is a computer-generated tax invoice. No signature is required.", 14, 275);
      doc.text("Thank you for shopping on ShopKart!", 14, 280);

      // Save PDF
      doc.save(`Invoice_${order.orderNumber}.pdf`);
    } catch (err) {
      console.error("PDF generation error:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <button
      onClick={generatePDF}
      disabled={isGenerating}
      className="inline-flex items-center gap-1.5 bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 text-xs font-semibold px-3 py-1.5 rounded shadow-sm transition"
    >
      {isGenerating ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      ) : (
        <Download className="w-3.5 h-3.5" />
      )}
      <span>{isGenerating ? "Preparing..." : "Download Invoice"}</span>
    </button>
  );
}
