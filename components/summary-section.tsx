'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import MarkdownRenderer from '@/components/ui/markdown-renderer';
import { toast } from 'sonner';

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
        <div className="text-left py-8">
          <p className="text-muted-foreground mb-4">
            {!summary ? 'Summary not available' : 'Summary generation failed'}
          </p>
          <Button
            onClick={regenerateSummary}
            disabled={isRegenerating}
            variant="outline"
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isRegenerating ? 'animate-spin' : ''}`} />
            {isRegenerating ? 'Generating Summary...' : 'Generate Summary'}
          </Button>
        </div>
      ) : (
        <div>
          <div className="flex justify-between items-center mb-4">
            <MarkdownRenderer>{summary}</MarkdownRenderer>
            <Button
              onClick={regenerateSummary}
              disabled={isRegenerating}
              variant="ghost"
              size="sm"
              className="gap-2"
            >
              <RefreshCw className={`h-3 w-3 ${isRegenerating ? 'animate-spin' : ''}`} />
              Regenerate
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}