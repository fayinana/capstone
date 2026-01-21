import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star, User, Loader2 } from "lucide-react";
import useAuth from "@/features/auth/useAuth";

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  user_id: string;
  car_id: string;
  profiles?: {
    first_name: string | null;
    last_name: string | null;
  } | null;
}

interface ReviewSectionProps {
  carId: string;
  bookingId?: string; // Optional, if you want to link reviews to bookings
}

const ReviewSection = ({ carId, bookingId }: ReviewSectionProps) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [hoveredStar, setHoveredStar] = useState(0);
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: reviews, isLoading } = useQuery({
    queryKey: ["reviews", carId],
    queryFn: async () => {
      // First get reviews
      const { data: reviewsData, error: reviewsError } = await supabase
        .from("reviews")
        .select("*")
        .eq("car_id", carId)
        .order("created_at", { ascending: false });

      if (reviewsError) throw reviewsError;

      // Then get profiles for each review
      if (reviewsData && reviewsData.length > 0) {
        const userIds = reviewsData.map((review) => review.user_id);
        const { data: profilesData, error: profilesError } = await supabase
          .from("profiles")
          .select("id, first_name, last_name")
          .in("id", userIds);

        if (profilesError) {
          console.error("Error fetching profiles:", profilesError);
          // Return reviews without profiles if profiles fetch fails
          return reviewsData.map((review) => ({
            ...review,
            profiles: null,
          })) as Review[];
        }

        // Combine reviews with profiles
        return reviewsData.map((review) => ({
          ...review,
          profiles:
            profilesData?.find((profile) => profile.id === review.user_id) ||
            null,
        })) as Review[];
      }

      return reviewsData as Review[];
    },
  });

  const addReviewMutation = useMutation({
    mutationFn: async (reviewData: { rating: number; comment: string }) => {
      if (!user) throw new Error("User must be logged in");

      const { data, error } = await supabase
        .from("reviews")
        .insert([
          {
            car_id: carId,
            user_id: user.id,
            rating: reviewData.rating,
            comment: reviewData.comment || null,
            booking_id: bookingId || null, // Optional booking ID
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews", carId] });
      queryClient.invalidateQueries({ queryKey: ["cars"] });
      queryClient.invalidateQueries({ queryKey: ["car", carId] });
      setRating(0);
      setComment("");
      toast({
        title: "Success",
        description: "Review added successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add review. Please try again.",
        variant: "destructive",
      });
      console.error("Add review error:", error);
    },
  });

  const handleSubmitReview = () => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login to add a review",
        variant: "destructive",
      });
      return;
    }

    if (rating === 0) {
      toast({
        title: "Rating Required",
        description: "Please select a rating",
        variant: "destructive",
      });
      return;
    }

    addReviewMutation.mutate({ rating, comment });
  };

  const renderStars = (currentRating: number, interactive = false) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`h-5 w-5 cursor-pointer ${
          index < (interactive ? hoveredStar || rating : currentRating)
            ? "text-yellow-400 fill-yellow-400"
            : "text-gray-300"
        }`}
        onClick={interactive ? () => setRating(index + 1) : undefined}
        onMouseEnter={interactive ? () => setHoveredStar(index + 1) : undefined}
        onMouseLeave={interactive ? () => setHoveredStar(0) : undefined}
      />
    ));
  };

  const averageRating = reviews?.length
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-barlow font-bold text-white">
          Reviews & Ratings
        </h3>
        {reviews && reviews.length > 0 && (
          <div className="flex items-center space-x-2">
            <div className="flex">{renderStars(Math.round(averageRating))}</div>
            <span className="text-white">
              {averageRating.toFixed(1)} ({reviews.length} reviews)
            </span>
          </div>
        )}
      </div>

      {/* Add Review Form */}
      {user && (
        <Card className="bg-zinc-900 border-yellow-300/20">
          <CardHeader>
            <CardTitle className="text-white">Add Your Review</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-white mb-2">Rating</label>
              <div className="flex">{renderStars(rating, true)}</div>
            </div>
            <div>
              <label className="block text-white mb-2">
                Comment (Optional)
              </label>
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your experience with this car..."
                className="bg-zinc-800 border-yellow-300/20 text-white"
                rows={3}
              />
            </div>
            <Button
              onClick={handleSubmitReview}
              disabled={addReviewMutation.isPending || rating === 0}
              className="bg-yellow-300 text-black hover:bg-yellow-400"
            >
              {addReviewMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding Review...
                </>
              ) : (
                "Add Review"
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-yellow-300" />
          </div>
        ) : !reviews || reviews.length === 0 ? (
          <Card className="bg-zinc-900 border-yellow-300/20">
            <CardContent className="text-center py-8">
              <p className="text-white/70">
                No reviews yet. Be the first to review this car!
              </p>
            </CardContent>
          </Card>
        ) : (
          reviews.map((review) => (
            <Card key={review.id} className="bg-zinc-900 border-yellow-300/20">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <User className="h-5 w-5 text-yellow-300" />
                    <span className="text-white font-medium">
                      {review.profiles?.first_name && review.profiles?.last_name
                        ? `${review.profiles.first_name} ${review.profiles.last_name}`
                        : "Anonymous User"}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="flex">{renderStars(review.rating)}</div>
                    <span className="text-white/70 text-sm">
                      {new Date(review.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                {review.comment && (
                  <p className="text-white/80 mt-2">{review.comment}</p>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default ReviewSection;
