"use client";

import { Card } from "@/components/ui/card";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/ui/copy-button";
import { ExternalLink } from "lucide-react";
import { useTranslations } from 'next-intl';

interface SharedChatsListProps {
  items: Array<{
    slug: string;
    youtubeId: string;
    title: string;
    thumbnailUrl: string | null;
    createdAt: Date;
  }>;
}

export function SharedChatsList({ items }: SharedChatsListProps) {
  const t = useTranslations('profile');
  
  return (
    <div className="grid">
      {items.map((item) => (
        <Card key={item.slug} className="py-4 shadow-none border-none">
          <div className="flex gap-4">
            <img 
              src={item.thumbnailUrl || ""} 
              alt={item.title}
              className="w-32 h-20 object-cover rounded"
            />
            <div className="flex-1">
              <h3 className="font-semibold line-clamp-2 mb-1">{item.title}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t('sharedChats.shared')} {formatDistanceToNow(new Date(item.createdAt))} {t('sharedChats.ago')}
              </p>
              <div className="mt-2 flex gap-2">
                <Link href={`/shared/${item.slug}`}>
                  <Button size="sm" variant="ghost" className="text-xs p-1 h-fit">
                    <ExternalLink className="size-3 mr-1" />
                    {t('sharedChats.view')}
                  </Button>
                </Link>
                <CopyButton
                  content={`${window.location.origin}/share/${item.slug}`}
                  copyMessage={t('sharedChats.linkCopied')}
                  label={t('sharedChats.copyLink')}
                />
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}