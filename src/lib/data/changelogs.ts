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
    date: "2025-07-01",
    version: "1.2.3",
    type: "patch",
    changes: [
      {
        category: "fixed",
        items: [
          "Prevent submit quick question when in shared mode"
        ]
      }
    ]
  },
  {
    date: "2025-07-01",
    version: "1.2.2",
    type: "minor",
    changes: [
      {
        category: "added",
        items: [
          "Manage profile page where users can view their latest messages",
          "View latest shared chats in profile page",
          "Delete profile permanently option",
          "Update username functionality"
        ]
      }
    ]
  },
  {
    date: "2025-07-01",
    version: "1.2.1",
    type: "patch",
    changes: [
      {
        category: "added",
        items: [
          "Tips alert showing how to convert YouTube URLs to VidioPintar chat links",
          "Replace 'youtube.com' with 'vidiopintar.com' in any YouTube URL to start chatting with that video"
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
          "CC BY-NC 4.0 license for open source release",
          "Automatic cleanup of previous containers after successful deployment"
        ]
      },
      {
        category: "fixed",
        items: [
          "Display of created_at timestamp for latest messages in admin page",
          "Submit button functionality issues"
        ]
      }
    ]
  },
  {
    date: "2025-07-01",
    version: "1.1.3",
    type: "patch",
    changes: [
      {
        category: "changed",
        items: [
          "Improved rollout deployment script for better reliability",
          "General code cleanup and organization"
        ]
      },
      {
        category: "fixed",
        items: [
          "Delete video button functionality"
        ]
      }
    ]
  },
  {
    date: "2025-06-30",
    version: "1.1.2",
    type: "patch",
    changes: [
      {
        category: "added",
        items: [
          "Search functionality triggered on button click"
        ]
      },
      {
        category: "fixed",
        items: [
          "Container name conflicts during deployment",
          "Styling issues in delete video dialog"
        ]
      }
    ]
  },
  {
    date: "2025-06-30",
    version: "1.1.1",
    type: "patch",
    changes: [
      {
        category: "fixed",
        items: [
          "Rollout deployment process stability"
        ]
      },
      {
        category: "changed",
        items: [
          "Multiple code cleanup and optimization passes"
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
          "Rollout deployment system setup"
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