"use client";

import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Trophy, Users, Calendar, Code, Sparkles, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

export default function DashboardScreen() {
  const router = useRouter();

  const handleSignOut = () => {
    // TODO: Implement sign out server action
    console.log("Signing out...");
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
      {/* Header */}
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">Balboa Hackathon</h1>
          </div>
          
          <Button 
            variant="ghost" 
            onClick={handleSignOut}
            className="text-white/80 hover:text-white hover:bg-white/10"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>

        {/* Welcome Section */}
        <Card className="mb-8 backdrop-blur-sm bg-white/10 border-white/20 shadow-2xl">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-white">
              Welcome to the Hackathon! 🎉
            </CardTitle>
            <CardDescription className="text-white/80 text-lg">
              You're all set to start building amazing projects
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 flex-wrap">
              <Badge variant="secondary" className="bg-green-500/20 text-green-200 border-green-400/30">
                <Trophy className="w-3 h-3 mr-1" />
                Verified Participant
              </Badge>
              <Badge variant="secondary" className="bg-blue-500/20 text-blue-200 border-blue-400/30">
                <Users className="w-3 h-3 mr-1" />
                Team Ready
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Main Content Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Hackathon Info */}
          <Card className="backdrop-blur-sm bg-white/10 border-white/20 shadow-2xl">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Event Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-white/80">
                <p className="font-semibold">Duration:</p>
                <p className="text-sm">48 hours</p>
              </div>
              <div className="text-white/80">
                <p className="font-semibold">Start:</p>
                <p className="text-sm">Friday 6:00 PM</p>
              </div>
              <div className="text-white/80">
                <p className="font-semibold">End:</p>
                <p className="text-sm">Sunday 6:00 PM</p>
              </div>
              <div className="text-white/80">
                <p className="font-semibold">Location:</p>
                <p className="text-sm">Virtual + In-Person</p>
              </div>
            </CardContent>
          </Card>

          {/* Prizes */}
          <Card className="backdrop-blur-sm bg-white/10 border-white/20 shadow-2xl">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Trophy className="w-5 h-5" />
                Prizes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-white/80">
                <p className="font-semibold">1st Place:</p>
                <p className="text-sm text-yellow-300">$25,000</p>
              </div>
              <div className="text-white/80">
                <p className="font-semibold">2nd Place:</p>
                <p className="text-sm text-gray-300">$15,000</p>
              </div>
              <div className="text-white/80">
                <p className="font-semibold">3rd Place:</p>
                <p className="text-sm text-orange-300">$10,000</p>
              </div>
              <div className="text-white/80">
                <p className="font-semibold">Special Tracks:</p>
                <p className="text-sm">$5,000 each</p>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="backdrop-blur-sm bg-white/10 border-white/20 shadow-2xl">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Code className="w-5 h-5" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white">
                Join Team
              </Button>
              <Button variant="outline" className="w-full border-white/30 text-white hover:bg-white/10">
                View Challenges
              </Button>
              <Button variant="outline" className="w-full border-white/30 text-white hover:bg-white/10">
                Submit Project
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Bottom Section */}
        <Card className="mt-8 backdrop-blur-sm bg-white/10 border-white/20 shadow-2xl">
          <CardHeader>
            <CardTitle className="text-white">Ready to Build?</CardTitle>
            <CardDescription className="text-white/80">
              The hackathon starts soon! Make sure you're prepared.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 flex-wrap">
              <Button className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white">
                Start Building
              </Button>
              <Button variant="outline" className="border-white/30 text-white hover:bg-white/10">
                View Schedule
              </Button>
              <Button variant="outline" className="border-white/30 text-white hover:bg-white/10">
                Join Discord
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
