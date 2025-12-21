"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function UserProfile({ user }) {
  return (
    <section className="w-full max-w-5xl mt-24 px-4">
      <h1 className="text-3xl font-bold text-center mb-8 text-pink-700">
        Welcome back, {user?.name}
      </h1>

      <Card className="rounded-2xl shadow-md p-4 bg-white">
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4">
          {/* Avatar */}
          <div className="flex flex-col items-center gap-3">
            <div className="w-32 h-32 rounded-full overflow-hidden shadow">
              <Image
                src={user?.image || "/default-avatar.png"}
                alt={user?.name}
                width={200}
                height={200}
                className="object-cover"
              />
            </div>
            <Button className="rounded-xl">Edit Profile</Button>
          </div>

          {/* Info */}
          <div className="col-span-2 space-y-4">
            <div>
              <p className="text-sm text-gray-500">Name</p>
              <p className="font-semibold text-lg">{user?.name}</p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="font-semibold text-lg">{user?.email}</p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Phone</p>
              <p className="font-semibold text-lg">
                {user?.phone || "Not added"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
