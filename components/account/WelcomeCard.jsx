export default function WelcomeCard({ profile }) {
  return (
    <div className="rounded-2xl border bg-white p-8">
      <h1 className="text-3xl font-bold">Welcome back, {profile?.name}</h1>

      <p className="mt-2 text-neutral-500">{profile?.email}</p>

      <p className="mt-1 text-sm text-neutral-400">
        Member since {new Date(profile?.member_since).toLocaleDateString()}
      </p>
    </div>
  );
}
