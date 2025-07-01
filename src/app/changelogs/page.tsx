import { HeroHeader } from "@/components/hero-header";
import { FooterSection } from "@/components/footer";
import { ChangelogList } from "@/components/changelog/changelog-list";
import { changelogs } from "@/lib/data/changelogs";

export default function ChangelogsPage() {
  return (
    <>
      <HeroHeader />
      <main className="relative min-h-screen p-6 overflow-hidden">
        <div className="relative z-10 max-w-4xl flex justify-center mx-auto pt-20">
          <div className="mb-12">
            <h1 className="text-4xl font-bold tracking-tighter mb-4">Changelogs</h1>
            <p className="text-muted-foreground mb-8">
              Stay up to date with the latest features and improvements in Vidiopintar.
            </p>
            <ChangelogList changelogs={changelogs} />
          </div>
        </div>
      </main>
      <FooterSection />
    </>
  );
}