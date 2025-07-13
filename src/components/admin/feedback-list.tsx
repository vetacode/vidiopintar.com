"use client"

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FeedbackCard } from "@/components/admin/feedback-card";
import { FeedbackFilters } from "@/components/admin/feedback-filters";

interface FeedbackItem {
  id: number;
  userId: string;
  type: string;
  rating: string;
  comment: string | null;
  metadata: any;
  createdAt: Date;
}

interface FeedbackListProps {
  feedback: FeedbackItem[];
}

export function FeedbackList({ feedback }: FeedbackListProps) {
  const [filters, setFilters] = useState({
    type: null as string | null,
    rating: null as string | null,
    search: "",
    sortBy: "newest"
  });

  const filteredAndSortedFeedback = useMemo(() => {
    let result = [...feedback];

    // Apply filters
    if (filters.type) {
      result = result.filter(item => item.type === filters.type);
    }

    if (filters.rating) {
      result = result.filter(item => item.rating === filters.rating);
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(item => {
        const commentMatch = item.comment?.toLowerCase().includes(searchLower);
        const metadataMatch = JSON.stringify(item.metadata || {}).toLowerCase().includes(searchLower);
        const userIdMatch = item.userId.toLowerCase().includes(searchLower);
        const typeMatch = item.type.toLowerCase().includes(searchLower);
        const ratingMatch = item.rating.toLowerCase().includes(searchLower);
        
        return commentMatch || metadataMatch || userIdMatch || typeMatch || ratingMatch;
      });
    }

    // Apply sorting
    switch (filters.sortBy) {
      case "oldest":
        result.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        break;
      case "rating_high":
        result.sort((a, b) => {
          const ratingOrder = { 'love_it': 3, 'decent': 2, 'bad': 1 };
          return (ratingOrder[b.rating as keyof typeof ratingOrder] || 0) - (ratingOrder[a.rating as keyof typeof ratingOrder] || 0);
        });
        break;
      case "rating_low":
        result.sort((a, b) => {
          const ratingOrder = { 'love_it': 3, 'decent': 2, 'bad': 1 };
          return (ratingOrder[a.rating as keyof typeof ratingOrder] || 0) - (ratingOrder[b.rating as keyof typeof ratingOrder] || 0);
        });
        break;
      case "type":
        result.sort((a, b) => a.type.localeCompare(b.type));
        break;
      case "newest":
      default:
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
    }

    return result;
  }, [feedback, filters]);

  return (
    <Card className="shadow-none">
      <CardHeader>
        <CardTitle className="text-lg">Recent Feedback</CardTitle>
        <FeedbackFilters
          onFilterChange={setFilters}
          totalCount={feedback.length}
          filteredCount={filteredAndSortedFeedback.length}
        />
      </CardHeader>
      <CardContent>
        {feedback.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No feedback received yet
          </div>
        ) : filteredAndSortedFeedback.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No feedback matches your current filters
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAndSortedFeedback.slice(0, 50).map((item) => (
              <FeedbackCard key={item.id} feedback={item} />
            ))}
            {filteredAndSortedFeedback.length > 50 && (
              <div className="text-center py-4 text-muted-foreground text-sm">
                Showing first 50 results. Use filters to narrow down results.
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}