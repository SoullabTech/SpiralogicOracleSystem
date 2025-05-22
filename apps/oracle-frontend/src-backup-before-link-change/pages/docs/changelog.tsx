import fs from "fs";
import path from "path";

export async function getStaticProps() {
  const changelogPath = path.join(process.cwd(), "changelog.md");
  const changelog = fs.readFileSync(changelogPath, "utf-8");
  return { props: { changelog } };
}

export default function ChangelogPage({ changelog }: { changelog: string }) {
  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold mb-6">📄 Changelog</h1>
      <pre className="whitespace-pre-wrap text-gray-800 bg-gray-50 p-4 rounded">
        {changelog}
      </pre>
    </div>
  );
}
