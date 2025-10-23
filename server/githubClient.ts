/**
 * GitHub API client for managing all permanent data (celebrities, templates, user generations)
 * Uses Octokit for GitHub API operations and node-cache for performance
 */

import { Octokit } from "@octokit/rest";
import NodeCache from "node-cache";
import { format } from "date-fns";

const cache = new NodeCache({ 
  stdTTL: 86400, // 24 hours default
  checkperiod: 3600 // Check for expired keys every hour
});

let octokit: Octokit | null = null;
let currentRepo: string = process.env.GITHUB_REPO || "fan-ai-celebs";

function getOctokit(): Octokit {
  if (!octokit) {
    const token = process.env.GITHUB_TOKEN;
    if (!token) {
      throw new Error("GITHUB_TOKEN not configured");
    }
    octokit = new Octokit({ auth: token });
  }
  return octokit;
}

function getRepoConfig() {
  const owner = process.env.GITHUB_OWNER || "Sumanradhadas";
  const repo = currentRepo;
  const branch = process.env.GITHUB_BRANCH || "main";
  return { owner, repo, branch };
}

// ===== CELEBRITY MANAGEMENT =====

interface Celebrity {
  name: string;
  slug: string;
  profession: string;
  image: string;
  description?: string;
  category?: string;
}

/**
 * Fetch celebrities from GitHub JSON with caching
 */
export async function fetchCelebritiesFromGitHub(): Promise<Celebrity[]> {
  const cacheKey = "celebrities_json";
  const cached = cache.get<Celebrity[]>(cacheKey);
  
  if (cached) {
    return cached;
  }

  const { owner, repo, branch } = getRepoConfig();
  const client = getOctokit();

  try {
    const { data } = await client.repos.getContent({
      owner,
      repo,
      path: "celebrities/celebrities.json",
      ref: branch,
    });

    if ('content' in data && data.encoding === 'base64') {
      const content = Buffer.from(data.content, 'base64').toString('utf-8');
      const celebrities: Celebrity[] = JSON.parse(content);
      // Only cache on success
      cache.set(cacheKey, celebrities);
      return celebrities;
    }

    console.warn("celebrities.json has unexpected format");
    return [];
  } catch (error: any) {
    if (error.status === 404) {
      console.warn("celebrities.json not found in GitHub repository - please create it");
    } else {
      console.error("Error fetching celebrities from GitHub:", error);
    }
    return [];
  }
}

/**
 * Get single celebrity by slug
 */
export async function getCelebrityBySlug(slug: string): Promise<Celebrity | null> {
  const celebrities = await fetchCelebritiesFromGitHub();
  return celebrities.find(c => c.slug === slug) || null;
}

/**
 * Search celebrities by query
 */
export async function searchCelebrities(query: string): Promise<Celebrity[]> {
  const celebrities = await fetchCelebritiesFromGitHub();
  const lowerQuery = query.toLowerCase();
  return celebrities.filter(c => 
    c.name.toLowerCase().includes(lowerQuery) ||
    c.profession.toLowerCase().includes(lowerQuery)
  );
}

/**
 * Upload new celebrity to GitHub (image + update JSON)
 */
export async function uploadCelebrityToGitHub(
  slug: string,
  name: string,
  profession: string,
  imagePath: string,
  description?: string,
  category?: string
): Promise<string> {
  const { owner, repo, branch } = getRepoConfig();
  const client = getOctokit();

  try {
    // Read image file
    const fs = await import("fs");
    const imageBuffer = fs.readFileSync(imagePath);
    const imageBase64 = imageBuffer.toString("base64");

    // Upload image to GitHub
    const imageCelebrityPath = `celebs/${slug}.jpg`;
    
    try {
      await client.repos.createOrUpdateFileContents({
        owner,
        repo,
        path: imageCelebrityPath,
        message: `Add celebrity image: ${name}`,
        content: imageBase64,
        branch,
      });
    } catch (error: any) {
      if (error.status === 403 || error.status === 422) {
        // Repository size limit or validation error - create new repo
        const newRepo = await createNewRepository();
        currentRepo = newRepo;
        return uploadCelebrityToGitHub(slug, name, profession, imagePath, description, category);
      }
      throw error;
    }

    // Fetch current celebrities.json
    const celebrities = await fetchCelebritiesFromGitHub();
    
    // Add or update celebrity entry
    // Use local API proxy for images instead of raw.githubusercontent.com for private repo support
    const existingIndex = celebrities.findIndex(c => c.slug === slug);
    const newCelebrity: Celebrity = {
      name,
      slug,
      profession,
      image: `/api/github/celebrity-image/${slug}`, // Use local proxy for private repo support
      description,
      category,
    };

    if (existingIndex >= 0) {
      celebrities[existingIndex] = newCelebrity;
    } else {
      celebrities.push(newCelebrity);
    }

    // Get current file SHA
    let sha: string | undefined;
    try {
      const { data } = await client.repos.getContent({
        owner,
        repo,
        path: "celebrities/celebrities.json",
        ref: branch,
      });
      if ('sha' in data) {
        sha = data.sha;
      }
    } catch (error) {
      // File doesn't exist yet
    }

    // Update celebrities.json
    await client.repos.createOrUpdateFileContents({
      owner,
      repo,
      path: "celebrities/celebrities.json",
      message: `Update celebrities.json: Add ${name}`,
      content: Buffer.from(JSON.stringify(celebrities, null, 2)).toString("base64"),
      branch,
      sha,
    });

    // Clear cache
    cache.del("celebrities_json");

    // Return local proxy URL for private repo support
    return `/api/github/celebrity-image/${slug}`;
  } catch (error) {
    console.error("Error uploading celebrity to GitHub:", error);
    throw new Error("Failed to upload celebrity to GitHub");
  }
}

// ===== TEMPLATE MANAGEMENT =====

interface Template {
  name: string;
  slug: string;
  prompt: string;
  description: string;
  category: string;
  tags: string[];
  sample?: string;
}

/**
 * Fetch templates from GitHub JSON with caching (12-hour cache)
 */
export async function fetchTemplatesFromGitHub(): Promise<Template[]> {
  const cacheKey = "templates_json";
  const cached = cache.get<Template[]>(cacheKey);
  
  if (cached) {
    return cached;
  }

  const { owner, repo, branch } = getRepoConfig();
  const client = getOctokit();

  try {
    const { data } = await client.repos.getContent({
      owner,
      repo,
      path: "templates/templates.json",
      ref: branch,
    });

    if ('content' in data && data.encoding === 'base64') {
      const content = Buffer.from(data.content, 'base64').toString('utf-8');
      const templates: Template[] = JSON.parse(content);
      // Only cache on success
      cache.set(cacheKey, templates, 43200); // 12 hours
      return templates;
    }

    console.warn("templates.json has unexpected format");
    return [];
  } catch (error: any) {
    if (error.status === 404) {
      console.warn("templates.json not found in GitHub repository - please create it");
    } else {
      console.error("Error fetching templates from GitHub:", error);
    }
    return [];
  }
}

/**
 * Get single template by slug
 */
export async function getTemplateBySlug(slug: string): Promise<Template | null> {
  const templates = await fetchTemplatesFromGitHub();
  return templates.find(t => t.slug === slug) || null;
}

// ===== USER GENERATION STORAGE =====

/**
 * Upload user-generated image to GitHub with metadata
 */
export async function uploadGenerationToGitHub(
  userId: string,
  generationId: string,
  imagePath: string,
  metadata: {
    template: string;
    celebrity: string;
    timestamp: string;
  }
): Promise<string> {
  const { owner, repo, branch } = getRepoConfig();
  const client = getOctokit();

  try {
    const fs = await import("fs");
    
    // Create date-based folder structure using the generation timestamp
    // This ensures metadata and image are always in the same folder
    const generationDate = new Date(metadata.timestamp);
    const dateFolder = format(generationDate, "yyyy-MM-dd");
    const imageGithubPath = `users/${userId}/${dateFolder}/${generationId}.png`;
    const metadataGithubPath = `users/${userId}/${dateFolder}/${generationId}.json`;

    // Read and upload image
    const imageBuffer = fs.readFileSync(imagePath);
    const imageBase64 = imageBuffer.toString("base64");

    try {
      await client.repos.createOrUpdateFileContents({
        owner,
        repo,
        path: imageGithubPath,
        message: `Add generation: ${generationId}`,
        content: imageBase64,
        branch,
      });

      // Upload metadata JSON with exact same timestamp
      const metadataContent = JSON.stringify({
        userId,
        generationId,
        dateFolder, // Store the folder for debugging
        ...metadata,
      }, null, 2);

      await client.repos.createOrUpdateFileContents({
        owner,
        repo,
        path: metadataGithubPath,
        message: `Add generation metadata: ${generationId}`,
        content: Buffer.from(metadataContent).toString("base64"),
        branch,
      });

      // Return local proxy URL for private repo support
      return `/api/github/generation-image/${userId}/${generationId}`;
    } catch (error: any) {
      if (error.status === 403 || error.status === 422) {
        // Repository size limit - create new repo
        const newRepo = await createNewRepository();
        currentRepo = newRepo;
        return uploadGenerationToGitHub(userId, generationId, imagePath, metadata);
      }
      throw error;
    }
  } catch (error) {
    console.error("Error uploading generation to GitHub:", error);
    throw new Error("Failed to upload generation to GitHub");
  }
}

// ===== REPOSITORY MANAGEMENT =====

/**
 * Create new repository when current one reaches size limit
 */
async function createNewRepository(): Promise<string> {
  const client = getOctokit();
  const timestamp = Date.now();
  const newRepoName = `fan-ai-celebs-${timestamp}`;

  try {
    await client.repos.createForAuthenticatedUser({
      name: newRepoName,
      private: true,
      description: "FanAI celebrity and generation storage",
      auto_init: true,
    });

    console.log(`Created new repository: ${newRepoName}`);
    
    // Update environment variable (runtime only - user needs to update .env)
    process.env.GITHUB_REPO = newRepoName;
    
    return newRepoName;
  } catch (error) {
    console.error("Error creating new repository:", error);
    throw new Error("Failed to create new repository");
  }
}

/**
 * Force refresh all caches
 */
export function clearAllCaches(): void {
  cache.flushAll();
  console.log("All GitHub caches cleared");
}

/**
 * Get cache statistics
 */
export function getCacheStats() {
  return {
    keys: cache.keys(),
    stats: cache.getStats(),
  };
}
