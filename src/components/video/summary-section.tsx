"use client";

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Markdown} from '@/components/ui/markdown';
import { toast } from 'sonner';
import { CopyButton } from "@/components/ui/copy-button";
import { Ellipsis } from '@/components/ui/loader';

interface SummarySectionProps {
  videoId: string;
  initialSummary: string;
}

export function SummarySection({ videoId, initialSummary }: SummarySectionProps) {
  const [summary, setSummary] = useState(initialSummary);
  const [isRegenerating, setIsRegenerating] = useState(false);

  const regenerateSummary = useCallback(async () => {
    setIsRegenerating(true);
    try {
      const response = await fetch(`/api/videos/${videoId}/regenerate-summary`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to regenerate summary');
      }

      const data = await response.json();
      setSummary(data.summary);
      toast.success('Summary regenerated successfully!');
    } catch (error) {
      console.error('Error regenerating summary:', error);
      toast.error('Failed to regenerate summary. Please try again.');
    } finally {
      setIsRegenerating(false);
    }
  }, [videoId]);

  useEffect(() => {
    if (!initialSummary) {
      regenerateSummary();
    }
  }, [initialSummary, regenerateSummary]);

  const showRegenerateButton = !summary || summary.trim() === '' || summary.includes('Unable to generate summary');

  return (
    <div>
      {showRegenerateButton ? (
        <div className="text-left py-2">
          <p className="text-muted-foreground mb-4">
            {!summary ? 'Summary not available' : 'Summary generation failed'}
          </p>
          <Button
            onClick={regenerateSummary}
            disabled={isRegenerating}
            variant="outline"
            className="gap-2 cursor-pointer"
          >
            {isRegenerating && <Ellipsis className="text-secondary-foreground/25" />}
            {isRegenerating ? 'Generating...' : 'Generate'}
          </Button>
        </div>
      ) : (
        <div className="relative group prose prose-sm px-2 max-w-none">
          <Markdown>{summary}</Markdown>
          <div className="absolute top-0 right-2 group-hover:visible invisible">
            <CopyButton content={summary} copyMessage="Summary copied to clipboard!" label="Copy" />
          </div>
        </div>
      )}
    </div>
  );
}
