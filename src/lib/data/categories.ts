export const categories = [
  {
    slug: "productivity",
    label: "Productivity",
    image: "https://images.unsplash.com/photo-1533225307893-db39ecce099a?q=80&w=1280&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    searchQuery: "productivity tips"
  },
  {
    slug: "anthropology",
    label: "Anthropology",
    image: "https://images.unsplash.com/photo-1734638053787-4f849ed09615?q=80&w=1280&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    searchQuery: "anthropology documentary"
  },
  {
    slug: "mental-health",
    label: "Mental Health",
    image: "https://images.unsplash.com/photo-1511297968426-a869b61af3da?q=80&w=1280&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    searchQuery: "mental health wellness"
  },
  {
    slug: "marketing",
    label: "Marketing",
    image: "https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?q=80&w=1280&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    searchQuery: "digital marketing tips"
  },
  {
    slug: "copywriting",
    label: "Copywriting",
    image: "https://images.unsplash.com/photo-1586943759341-be5595944989?q=80&w=1280&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    searchQuery: "copywriting techniques"
  },
  {
    slug: "economics",
    label: "Economics",
    image: "https://images.unsplash.com/photo-1650821414390-276561abd95a?q=80&w=1280&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    searchQuery: "economics explained"
  },
  {
    slug: "geography",
    label: "Geography",
    image: "https://images.unsplash.com/photo-1645207563387-240c50a0d5d3?q=80&w=1280&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    searchQuery: "geography documentary"
  },
  {
    slug: "history",
    label: "History",
    image: "https://images.unsplash.com/photo-1583502023538-55ce7997721a?q=80&w=1280&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    searchQuery: "history documentary"
  },
];

export function getCategoryBySlug(slug: string) {
  return categories.find(category => category.slug === slug);
}