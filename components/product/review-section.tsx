"use client";

import React, { useState } from "react";
import { Star, CheckCircle, MessageSquarePlus } from "lucide-react";
import { useAuthStore } from "@/lib/store/use-auth-store";
import { useToast } from "@/components/ui/toast";
import { formatDate } from "@/lib/utils";

interface Review {
  id: string;
  rating: number;
  title?: string | null;
  comment: string;
  isVerifiedPurchase: boolean;
  createdAt: string | Date;
  user: {
    name: string;
    avatar?: string | null;
  };
}

interface ReviewSectionProps {
  productId: string;
  rating: number;
  reviewCount: number;
  reviews: Review[];
  onReviewAdded?: () => void;
}

export default function ReviewSection({
  productId,
  rating,
  reviewCount,
  reviews,
  onReviewAdded,
}: ReviewSectionProps) {
  const { user } = useAuthStore();
  const { success, error } = useToast();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [newTitle, setNewTitle] = useState("");
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      error("Please sign in to submit a review");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          rating: newRating,
          title: newTitle || undefined,
          comment: newComment,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        error(data.error || "Failed to submit review");
        return;
      }

      success("Thank you! Your verified review has been published.");
      setIsModalOpen(false);
      setNewComment("");
      setNewTitle("");
      if (onReviewAdded) onReviewAdded();
      else window.location.reload();
    } catch (err: any) {
      error(err.message || "Failed to submit review");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate rating breakdown distribution
  const ratingCounts = [5, 4, 3, 2, 1].map((star) => {
    const count = reviews.filter((r) => r.rating === star).length;
    const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
    return { star, count, percentage };
  });

  return (
    <div className="bg-white rounded-sm shadow-sm p-5 border border-gray-100">
      {/* Title & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Ratings & Reviews</h2>
          <p className="text-xs text-gray-500">Verified reviews from authentic buyers</p>
        </div>

        <button
          onClick={() => {
            if (!user) {
              window.location.href = `/login?callbackUrl=/products/${productId}`;
            } else {
              setIsModalOpen(true);
            }
          }}
          className="inline-flex items-center gap-2 bg-[#2874f0] hover:bg-[#1259c7] text-white text-xs font-semibold px-4 py-2 rounded-sm shadow-sm transition self-start sm:self-auto"
        >
          <MessageSquarePlus className="w-4 h-4" />
          <span>Rate Product</span>
        </button>
      </div>

      {/* Rating Overview & Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-5 border-b border-gray-100">
        {/* Big Score Box */}
        <div className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded border border-gray-100 text-center">
          <div className="text-4xl font-extrabold text-gray-900 flex items-center gap-1.5 mb-1">
            <span>{rating > 0 ? rating.toFixed(1) : "—"}</span>
            <Star className="w-7 h-7 fill-[#388e3c] text-[#388e3c]" />
          </div>
          <p className="text-xs text-gray-500 font-medium">
            {reviewCount.toLocaleString()} Ratings & {reviews.length} Reviews
          </p>
        </div>

        {/* Progress Bars */}
        <div className="md:col-span-2 flex flex-col justify-center space-y-1.5">
          {ratingCounts.map(({ star, count, percentage }) => (
            <div key={star} className="flex items-center gap-2 text-xs">
              <span className="w-8 font-medium text-gray-600 flex items-center gap-0.5">
                {star} <Star className="w-3 h-3 fill-gray-400 text-gray-400" />
              </span>
              <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    star >= 4
                      ? "bg-[#388e3c]"
                      : star === 3
                      ? "bg-[#ff9f00]"
                      : "bg-[#e53935]"
                  }`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span className="w-10 text-right text-gray-400 text-[11px]">
                {count}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Reviews List */}
      <div className="divide-y divide-gray-100 pt-2">
        {reviews.length === 0 ? (
          <div className="py-8 text-center text-gray-400 text-xs">
            No customer reviews yet. Be the first verified buyer to review this product!
          </div>
        ) : (
          reviews.map((rev) => (
            <div key={rev.id} className="py-4 space-y-1.5">
              <div className="flex items-center gap-2.5">
                <span className="fk-badge-rating">
                  {rev.rating} <Star className="w-2.5 h-2.5 fill-current" />
                </span>
                {rev.title && (
                  <h4 className="font-bold text-xs text-gray-800">{rev.title}</h4>
                )}
              </div>

              <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
                {rev.comment}
              </p>

              <div className="flex items-center gap-3 text-[11px] text-gray-400 pt-1">
                <span className="font-semibold text-gray-600">
                  {rev.user.name}
                </span>
                {rev.isVerifiedPurchase && (
                  <span className="flex items-center gap-1 text-[#388e3c] font-medium">
                    <CheckCircle className="w-3 h-3" /> Certified Buyer
                  </span>
                )}
                <span>•</span>
                <span>{formatDate(rev.createdAt)}</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Review Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-sm shadow-2xl max-w-lg w-full p-6 animate-in zoom-in-95">
            <h3 className="text-base font-bold text-gray-900 mb-1">
              Rate & Review Product
            </h3>
            <p className="text-xs text-gray-500 mb-4">
              Share your honest feedback. Note: Only customers with confirmed purchases can review.
            </p>

            <form onSubmit={handleSubmitReview} className="space-y-4">
              {/* Star selector */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Your Rating
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setNewRating(star)}
                      className="p-1 text-gray-300 hover:scale-110 transition"
                    >
                      <Star
                        className={`w-7 h-7 ${
                          star <= newRating
                            ? "fill-amber-400 text-amber-400"
                            : "text-gray-300"
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-bold text-gray-700 ml-2">
                    {newRating === 5
                      ? "Excellent"
                      : newRating === 4
                      ? "Good"
                      : newRating === 3
                      ? "Average"
                      : newRating === 2
                      ? "Below Average"
                      : "Poor"}
                  </span>
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Review Headline (optional)
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Best in class performance!"
                  className="w-full text-xs p-2 border border-gray-300 rounded focus:border-blue-500 focus:outline-none"
                />
              </div>

              {/* Comment */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Detailed Review *
                </label>
                <textarea
                  rows={4}
                  required
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="What did you like or dislike about this item? How is the quality, battery life or fitting?"
                  className="w-full text-xs p-2.5 border border-gray-300 rounded focus:border-blue-500 focus:outline-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 text-xs font-bold bg-[#fb641b] hover:bg-[#e6530b] text-white rounded transition disabled:opacity-50"
                >
                  {isSubmitting ? "Submitting..." : "Submit Review"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
