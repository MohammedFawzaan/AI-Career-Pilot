"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Star, Loader2, MessageSquare, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { submitAssessmentFeedback } from "@/actions/feedback";

export default function FeedbackForm({ assessmentId, existingFeedback }) {
    const [rating, setRating] = useState(existingFeedback?.rating || 0);
    const [hoveredRating, setHoveredRating] = useState(0);
    const [comment, setComment] = useState(existingFeedback?.comment || "");
    const [isAccurate, setIsAccurate] = useState(existingFeedback?.isAccurate?.toString() || "");
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(!!existingFeedback);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (rating === 0) {
            toast.error("Please select a rating");
            return;
        }

        if (!isAccurate) {
            toast.error("Please indicate if the assessment was accurate");
            return;
        }

        setLoading(true);
        try {
            await submitAssessmentFeedback(
                assessmentId,
                rating,
                comment,
                isAccurate === "true"
            );
            toast.success("Thank you for your feedback!");
            setSubmitted(true);
        } catch (error) {
            toast.error(error.message || "Failed to submit feedback. Please try again.");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    // Show read-only view if feedback already exists
    if (existingFeedback) {
        return (
            <Card className="col-span-full border-green-200 bg-green-50">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-green-900">
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                        Feedback Submitted
                    </CardTitle>
                    <CardDescription className="text-green-700">
                        Thank you for your feedback! Your response has been recorded.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Display Rating */}
                    <div>
                        <Label className="text-green-900">Your Rating</Label>
                        <div className="flex gap-1 mt-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                    key={star}
                                    className={`h-6 w-6 ${star <= existingFeedback.rating
                                        ? "fill-yellow-400 text-yellow-400"
                                        : "text-gray-300"
                                        }`}
                                />
                            ))}
                            <span className="ml-2 text-sm text-green-700">
                                ({existingFeedback.rating === 1 && "Poor"}
                                {existingFeedback.rating === 2 && "Fair"}
                                {existingFeedback.rating === 3 && "Good"}
                                {existingFeedback.rating === 4 && "Very Good"}
                                {existingFeedback.rating === 5 && "Excellent"})
                            </span>
                        </div>
                    </div>

                    {/* Display Accuracy */}
                    <div>
                        <Label className="text-green-900">Assessment Accuracy</Label>
                        <p className="text-sm text-green-700 mt-1">
                            {existingFeedback.isAccurate
                                ? "✓ Yes, it was accurate"
                                : "✗ No, it needs improvement"}
                        </p>
                    </div>

                    {/* Display Comment */}
                    {existingFeedback.comment && (
                        <div>
                            <Label className="text-green-900">Your Comments</Label>
                            <p className="text-sm text-green-700 mt-1 p-3 bg-white rounded-md border border-green-200">
                                {existingFeedback.comment}
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>
        );
    }

    // Show success message after submission
    if (submitted) {
        return (
            <Card className="col-span-full border-green-200 bg-green-50">
                <CardContent className="pt-6">
                    <div className="text-center">
                        <MessageSquare className="h-12 w-12 text-green-500 mx-auto mb-2" />
                        <h3 className="text-lg font-semibold text-green-900">Thank you for your feedback!</h3>
                        <p className="text-sm text-green-700">Your input helps us improve our career assessments.</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    // Show feedback form for new submissions
    return (
        <Card className="col-span-full">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-purple-500" />
                    Share Your Feedback
                </CardTitle>
                <CardDescription>
                    Help us improve by sharing your thoughts on this career assessment
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Star Rating */}
                    <div className="space-y-2">
                        <Label>How would you rate this assessment?</Label>
                        <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setRating(star)}
                                    onMouseEnter={() => setHoveredRating(star)}
                                    onMouseLeave={() => setHoveredRating(0)}
                                    className="transition-transform hover:scale-110"
                                >
                                    <Star
                                        className={`h-8 w-8 ${star <= (hoveredRating || rating)
                                            ? "fill-yellow-400 text-yellow-400"
                                            : "text-gray-300"
                                            }`}
                                    />
                                </button>
                            ))}
                        </div>
                        {rating > 0 && (
                            <p className="text-sm text-muted-foreground">
                                {rating === 1 && "Poor"}
                                {rating === 2 && "Fair"}
                                {rating === 3 && "Good"}
                                {rating === 4 && "Very Good"}
                                {rating === 5 && "Excellent"}
                            </p>
                        )}
                    </div>

                    {/* Accuracy Question */}
                    <div className="space-y-2">
                        <Label>Did the assessment accurately match your profile and expectations?</Label>
                        <RadioGroup value={isAccurate} onValueChange={setIsAccurate}>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="true" id="accurate-yes" />
                                <Label htmlFor="accurate-yes" className="font-normal cursor-pointer">
                                    Yes, it was accurate
                                </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="false" id="accurate-no" />
                                <Label htmlFor="accurate-no" className="font-normal cursor-pointer">
                                    No, it needs improvement
                                </Label>
                            </div>
                        </RadioGroup>
                    </div>

                    {/* Comment */}
                    <div className="space-y-2">
                        <Label htmlFor="comment">Additional Comments (Optional)</Label>
                        <Textarea
                            id="comment"
                            placeholder="Share your thoughts, suggestions, or concerns..."
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            className="h-24"
                        />
                    </div>

                    <Button type="submit" disabled={loading} className="w-full">
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Submitting...
                            </>
                        ) : (
                            "Submit Feedback"
                        )}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
