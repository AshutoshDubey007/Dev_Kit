import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const repoUrl = body.repoUrl?.trim();

    if (!repoUrl) {
      return NextResponse.json(
        { error: 'Repository URL is required' },
        { status: 400 }
      );
    }

    // Match github.com/owner/repo
    const regex = /github\.com\/([^/]+)\/([^/]+)/;
    const match = repoUrl.match(regex);

    if (!match) {
      return NextResponse.json(
        { error: 'Please enter a valid GitHub URL (e.g. https://github.com/username/repo)' },
        { status: 400 }
      );
    }

    const owner = match[1];
    const repo = match[2].replace(/\.git$/, '');

    // Fetch repository data from GitHub API
    try {
      const repoRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
        headers: {
          'User-Agent': 'DevKit-Marketplace-Bot',
          Accept: 'application/vnd.github.v3+json',
        },
      });

      if (repoRes.ok) {
        const repoData = await repoRes.json();
        const branch = repoData.default_branch || 'main';

        let readme = '';
        try {
          const readmeRes = await fetch(
            `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/README.md`
          );
          if (readmeRes.ok) {
            readme = await readmeRes.text();
          }
        } catch {}

        return NextResponse.json({
          success: true,
          repoName: repoData.name,
          title: repoData.name.replace(/[-_]/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()),
          tagline: repoData.description || `Verified ${repoData.name} integration module for Next.js 15`,
          branch,
          stars: repoData.stargazers_count,
          language: repoData.language || 'TypeScript',
          readme:
            readme ||
            `### ${repoData.name} Setup Instructions\n\n1. Clone or download package.\n2. Run \`npm install\`\n3. Configure your environment variables in \`.env.local\`\n4. Start development: \`npm run dev\``,
        });
      }
    } catch {}

    // Fallback if rate-limited or private
    const formattedName = repo.replace(/[-_]/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase());
    return NextResponse.json({
      success: true,
      repoName: repo,
      title: formattedName,
      tagline: `Verified ${formattedName} integration kit for Next.js 15`,
      branch: 'main',
      stars: 1,
      language: 'TypeScript',
      readme: `### ${formattedName} Setup Instructions\n\n1. Download package and unzip.\n2. Run \`npm install\`\n3. Configure credentials in \`.env.local\`\n4. Run \`npm run dev\``,
    });
  } catch (error: any) {
    console.error('Error inspecting repo:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to inspect GitHub repository' },
      { status: 500 }
    );
  }
}
