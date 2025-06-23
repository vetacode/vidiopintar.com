'use client';

import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useState } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [isLoading, setIsLoading] = useState(false);

  const handleReset = () => {
    setIsLoading(true);
    reset();
  };

  return (
    <div className="container mx-auto py-12 text-center">
      <h2 className="text-xl font-semibold mb-4">Something went wrong!</h2>
      <p className="text-gray-600 mb-4">{error.message}</p>
      <Button
        onClick={handleReset}
        disabled={isLoading}
      >
        {isLoading ? <LoadingSpinner text="Trying again..." /> : "Try again"}
      </Button>
    </div>
  );
}
