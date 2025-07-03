export interface ChangelogEntry {
  date: string;
  version: string;
  type: 'major' | 'minor' | 'patch';
  changes: {
    category: 'added' | 'changed' | 'fixed' | 'removed';
    items: string[];
  }[];
}

export const changelogs: ChangelogEntry[] = [
  {
    date: "2025-07-03",
    version: "1.2.2",
    type: "patch",
    changes: [
      {
        category: "added",
        items: [
          "Top users in dashboard admin page"
        ]
      }
    ]
  },
  {
    date: "2025-07-02",
    version: "1.2.1",
    type: "patch",
    changes: [
      {
        category: "added",
        items: [
          "Terms of Service and Privacy Policy pages"
        ]
      },
      {
        category: "changed",
        items: [
          "Refactor call to action component to use FormStartLearning"
        ]
      }
    ]
  },
  {
    date: "2025-07-01",
    version: "1.2.0",
    type: "minor",
    changes: [
      {
        category: "added",
        items: [
          "Manage profile page where users can view their latest messages",
          "View latest shared chats in profile page",
          "Delete profile permanently option",
          "Tips alert showing how to convert YouTube URLs to VidioPintar chat links",
          "CC BY-NC 4.0 license for open source release",
          "Automatic cleanup of previous containers after successful deployment"
        ]
      },
      {
        category: "changed",
        items: [
          "Remove theme-toggle change to theme-switcher",
          "Improved rollout deployment script for better reliability",
        ]
      },
      {
        category: "fixed",
        items: [
          "Prevent submit quick question when in shared mode",
          "Display of created_at timestamp for latest messages in admin page",
        ]
      }
    ]
  },
  {
    date: "2025-06-30",
    version: "1.1.0",
    type: "minor",
    changes: [
      {
        category: "added",
        items: [
          "Search functionality triggered on button click",
          "Rollout deployment system setup"
        ]
      },
      {
        category: "changed",
        items: [
          "Multiple code cleanup and optimization passes"
        ]
      },
      {
        category: "fixed",
        items: [
          "Container name conflicts during deployment",
          "Styling issues in delete video dialog",
          "Rollout deployment process stability"
        ]
      },
      {
        category: "removed",
        items: [
          "Deprecated submit-button component"
        ]
      }
    ]
  }
];
