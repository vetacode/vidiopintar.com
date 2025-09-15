
const topics = [
    {
      id: 1,
      title: "Productivity",
      thumbnail:
        "https://images.unsplash.com/photo-1531489956451-20957fab52f2?q=80&w=480",
      url: "https://vidiopintar.com/category/productivity",
    },
    {
      id: 2,
      title: "Economics",
      thumbnail:
        "https://images.unsplash.com/photo-1605721911519-3dfeb3be25e7?q=80&w=480",
      url: "https://vidiopintar.com/category/economics",
    },
    {
      id: 3,
      title: "Marketing",
      thumbnail:
        "https://images.unsplash.com/photo-1543840302-34f367d7024f?q=80&w=480",
      url: "https://vidiopintar.com/category/marketing",
    },
    {
      id: 4,
      title: "Mental Health",
      thumbnail:
        "https://images.unsplash.com/photo-1550843739-2e9e3eddeccb?q=80&w=480",
      url: "https://vidiopintar.com/category/mental-health",
    },
    {
      id: 5,
      title: "History",
      thumbnail:
        "https://images.unsplash.com/photo-1543248423-4e1238f06650?q=80&w=480",
      url: "https://vidiopintar.com/category/history",
    },
    {
      id: 6,
      title: "Copywriting",
      thumbnail:
        "https://images.unsplash.com/photo-1618331833071-ce81bd50d300?q=80&w=480",
      url: "https://vidiopintar.com/category/copywriting",
    },
  ];
  
  export function Topics() {
    return (
      <div className="flex flex-col gap-7 pt-28">
        <div className="flex group justify-start items-center gap-2 w-fit">
          <div className="w-4 h-1 bg-accent rounded-full group-hover:animate-[bounce_200ms_linear_infinite]"></div>
          <div className="uppercase text-[0.8125rem] text-secondary-foreground font-medium">
            Topics
          </div>
        </div>
        <div className="text-4xl text-primary font-semibold tracking-tight">
          Need a kickstart? Browse topics
        </div>
        <div className="grid lg:grid-rows-1 md:grid-rows-2 lg:grid-cols-6 md:grid-cols-3 gap-2.5">
          {topics.map((topic) => (
            <a
              key={topic.id}
              href={topic.url}
              target="blank"
              className="bg-card w-full rounded-xs overflow-hidden max-h-72 transition hover:scale-102 active:scale-[0.975]"
            >
              <img src={topic.thumbnail} className="w-full h-56 object-cover" />
              <div className="py-4 pl-3 font-semibold">{topic.title}</div>
            </a>
          ))}
        </div>
      </div>
    );
  }
  