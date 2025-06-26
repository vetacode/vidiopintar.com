import { requireAdmin } from "@/lib/auth-admin";
import { getAdminMetrics, getUserGrowthData, getVideoAdditionsData } from "@/lib/admin-queries";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserGrowthChart } from "@/components/admin/user-growth-chart";
import { VideoAdditionsChart } from "@/components/admin/video-additions-chart";
import { Users, Video, FileText } from "lucide-react";

export default async function AdminPage() {
  await requireAdmin();
  
  const metrics = await getAdminMetrics();
  const userGrowth7d = await getUserGrowthData("7d");
  const userGrowth1m = await getUserGrowthData("1m");
  const userGrowth3m = await getUserGrowthData("3m");
  
  const videoAdditions7d = await getVideoAdditionsData("7d");
  const videoAdditions1m = await getVideoAdditionsData("1m");
  const videoAdditions3m = await getVideoAdditionsData("3m");

  return (
    <main className="bg-accent">
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">Overview of your application metrics</p>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="shadow-none">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Registered users
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-none">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Videos</CardTitle>
            <Video className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalVideos.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Videos in database
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-none">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">User Videos</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalUserVideos.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Processed by users
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* User Growth Chart */}
        <Card className="shadow-none">
          <CardHeader>
            <CardTitle>User Growth</CardTitle>
            <CardDescription>
              New user registrations over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="7d" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="7d">7 Days</TabsTrigger>
                <TabsTrigger value="1m">1 Month</TabsTrigger>
                <TabsTrigger value="3m">3 Months</TabsTrigger>
              </TabsList>
              <TabsContent value="7d" className="mt-4">
                <UserGrowthChart data={userGrowth7d} />
              </TabsContent>
              <TabsContent value="1m" className="mt-4">
                <UserGrowthChart data={userGrowth1m} />
              </TabsContent>
              <TabsContent value="3m" className="mt-4">
                <UserGrowthChart data={userGrowth3m} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Video Additions Chart */}
        <Card className="shadow-none">
          <CardHeader>
            <CardTitle>Video Additions</CardTitle>
            <CardDescription>
              Daily video additions to the platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="7d" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="7d">7 Days</TabsTrigger>
                <TabsTrigger value="1m">1 Month</TabsTrigger>
                <TabsTrigger value="3m">3 Months</TabsTrigger>
              </TabsList>
              <TabsContent value="7d" className="mt-4">
                <VideoAdditionsChart data={videoAdditions7d} />
              </TabsContent>
              <TabsContent value="1m" className="mt-4">
                <VideoAdditionsChart data={videoAdditions1m} />
              </TabsContent>
              <TabsContent value="3m" className="mt-4">
                <VideoAdditionsChart data={videoAdditions3m} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
    </main>
  );
}
