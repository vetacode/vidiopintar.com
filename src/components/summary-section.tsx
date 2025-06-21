'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import MarkdownRenderer from '@/components/ui/markdown-renderer';
import { toast } from 'sonner';
import { CopyButton } from "./ui/copy-button";

interface SummarySectionProps {
  videoId: string;
  initialSummary: string;
}

export default function SummarySection({ videoId, initialSummary }: SummarySectionProps) {
  const [summary, setSummary] = useState(initialSummary);
  const [isRegenerating, setIsRegenerating] = useState(false);

  const regenerateSummary = async () => {
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
  };

  const showRegenerateButton = !summary || summary.trim() === '' || summary.includes('Unable to generate summary');

  return (
    <div className="p-1 py-4">
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
            <RefreshCw className={`size-3 ${isRegenerating ? 'animate-spin' : ''}`} />
            {isRegenerating ? 'Generating...' : 'Generate'}
          </Button>
        </div>
      ) : (
        <div className='relative group'>
          <MarkdownRenderer>{summary}</MarkdownRenderer>
          <div className="absolute top-0 right-2 group-hover:visible invisible">
          <CopyButton content={summary} copyMessage="Summary copied to clipboard!" label="Copy" />
          </div>
        </div>
      )}
    </div>
  );
}