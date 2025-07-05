import { ProfileSidebar } from "./profile-sidebar";

interface ProfileContentProps {
  user: {
    id: string;
    name: string;
    email: string;
    image?: string | null;
  };
  children?: React.ReactNode;
}

export function ProfileContent({ children }: ProfileContentProps) {
  return (
    <main className="relative min-h-screen overflow-hidden pt-24">
      <div className="relative z-10 max-w-4xl mx-auto">
        <div className="flex relative">
          <div className="sticky top-24">
            <ProfileSidebar />
          </div>
          <div className="flex-1">
            {children}
          </div>
        </div>
      </div>
    </main>
  );
}