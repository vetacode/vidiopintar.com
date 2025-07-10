"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { Activity, Video, Clock } from "lucide-react";

interface RecentActiveUser {
  id: string;
  name: string;
  email: string;
  image: string | null;
  lastActivity: Date;
  videoCount: number;
  recentVideoCount: number; // videos in last 7 days
}

interface RecentActiveUsersProps {
  users: RecentActiveUser[];
}

export function RecentActiveUsers({ users }: RecentActiveUsersProps) {
  return (
    <Card className="shadow-none">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 mb-2">
        <CardTitle className="text-base font-semibold">Recent Active Users</CardTitle>
        <Activity className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {users.length === 0 ? (
            <p className="text-sm text-muted-foreground">No recent activity</p>
          ) : (
            users.map((user, index) => (
              <div key={user.id} className="flex items-center space-x-3 p-3 rounded-lg bg-accent/50 hover:bg-accent/75 transition-colors">
                <div className="flex items-center space-x-3 flex-1">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.image || undefined} alt={user.name} />
                    <AvatarFallback className="text-xs">
                      {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{user.name}</p>
                    <div className="flex items-center space-x-3 text-xs text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <Video className="h-3 w-3" />
                        <span>{user.recentVideoCount} recent</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-3 w-3" />
                        <span>{formatDistanceToNow(user.lastActivity)} ago</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}