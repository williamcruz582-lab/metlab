import Link from "next/link";

export default function ChemistrySmokeTest() {
  return (
    <main style={{ minHeight: "100vh", padding: 24 }}>
      <h1 style={{ fontSize: 28, marginBottom: 12 }}>
        Chemistry — smoke test ✅
      </h1>
      <p>If you can see this, the /chemistry route is rendering.</p>
      <p>
        <Link href="/" className="text-blue-600 underline">
          Back home
        </Link>
      </p>
    </main>
  );
}
