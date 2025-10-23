import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import path from "path";
import fs from "fs";
import { storage } from "./storage";
import { setupAuth, isAuthenticated, isAdmin } from "./firebaseAuth";
import { processGeneratedImage } from "./imageProcessor";
import { generateCelebrityPhoto, analyzeUploadedImage } from "./gemini";
import { 
  fetchCelebritiesFromGitHub,
  getCelebrityBySlug,
  searchCelebrities as searchCelebritiesGitHub,
  uploadCelebrityToGitHub,
  fetchTemplatesFromGitHub,
  getTemplateBySlug,
  uploadGenerationToGitHub,
  clearAllCaches,
  getCacheStats,
} from "./githubClient";
import { insertCelebritySchema, insertCelebrityRequestSchema, insertTemplateSchema, insertCampaignSchema } from "@shared/schema";

// Configure multer for file uploads
const upload = multer({
  dest: "uploads/",
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG and PNG are allowed.'));
    }
  },
});

// Ensure directories exist
const ensureDirectories = () => {
  const dirs = ['uploads', 'uploads/processed', 'uploads/generated'];
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
};

export async function registerRoutes(app: Express): Promise<Server> {
  ensureDirectories();

  // Auth middleware
  await setupAuth(app);

  // ===== Firebase Auth Routes =====
  // Firebase login - client sends Firebase UID token after authentication
  app.post('/api/auth/login', express.json(), async (req: any, res) => {
    try {
      const { uid, email, displayName } = req.body;
      
      if (!uid) {
        return res.status(400).json({ message: "Firebase UID required" });
      }

      // Upsert user in database
      await storage.upsertUser({
        id: uid,
        email: email || '',
        firstName: displayName?.split(' ')[0] || '',
        lastName: displayName?.split(' ').slice(1).join(' ') || '',
        profileImageUrl: null,
      });

      // Set session
      req.session.userId = uid;
      req.session.isAdmin = false;
      
      const user = await storage.getUser(uid);
      res.json(user);
    } catch (error) {
      console.error("Error during login:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  // Admin login - uses environment credentials
  app.post('/api/auth/admin/login', express.json(), async (req: any, res) => {
    try {
      const { userId, password } = req.body;
      
      const adminUserId = process.env.ADMIN_USER_ID;
      const adminPassword = process.env.ADMIN_PASSWORD;
      
      if (!adminUserId || !adminPassword) {
        return res.status(500).json({ message: "Admin credentials not configured" });
      }
      
      if (userId !== adminUserId || password !== adminPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Set admin session
      req.session.userId = 'admin';
      req.session.isAdmin = true;
      
      res.json({ 
        message: "Admin login successful",
        role: 'admin'
      });
    } catch (error) {
      console.error("Error during admin login:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  // Logout
  app.post('/api/auth/logout', (req: any, res) => {
    req.session.destroy((err: any) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  // Get current user
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.userId || req.session.userId;
      
      // Check if admin
      if (req.session.isAdmin) {
        return res.json({
          id: 'admin',
          role: 'admin',
          email: 'admin@fanai.com',
          firstName: 'Admin',
          lastName: '',
          credits: 999999,
        });
      }
      
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // GitHub proxy for celebrity images (supports private repos via Octokit)
  app.get('/api/github/celebrity-image/:slug', async (req, res) => {
    try {
      const { slug } = req.params;
      const { owner, repo, branch } = { 
        owner: process.env.GITHUB_OWNER || 'Sumanradhadas',
        repo: process.env.GITHUB_REPO || 'fan-ai-celebs',
        branch: process.env.GITHUB_BRANCH || 'main'
      };
      
      // Import Octokit here to avoid circular dependency
      const { Octokit } = await import("@octokit/rest");
      const githubToken = process.env.GITHUB_TOKEN;
      
      if (!githubToken) {
        return res.status(503).json({ message: "GitHub integration not configured" });
      }

      const octokit = new Octokit({ auth: githubToken });
      const imagePath = `celebs/${slug}.jpg`;
      
      // Use Octokit to fetch from private repos
      const { data } = await octokit.repos.getContent({
        owner,
        repo,
        path: imagePath,
        ref: branch,
      });

      if ('content' in data && data.encoding === 'base64') {
        const imageBuffer = Buffer.from(data.content, 'base64');
        res.set('Content-Type', 'image/jpeg');
        res.set('Cache-Control', 'public, max-age=86400'); // Cache for 24 hours
        res.send(imageBuffer);
      } else {
        return res.status(404).json({ message: "Celebrity image not found" });
      }
    } catch (error: any) {
      if (error.status === 404) {
        return res.status(404).json({ message: "Celebrity image not found" });
      }
      console.error("Error fetching celebrity image from GitHub:", error);
      res.status(500).json({ message: "Failed to fetch image" });
    }
  });

  // GitHub proxy for generation images (supports private repos via Octokit)
  app.get('/api/github/generation-image/:userId/:generationId', async (req, res) => {
    try {
      const { userId, generationId } = req.params;
      const { owner, repo, branch } = { 
        owner: process.env.GITHUB_OWNER || 'Sumanradhadas',
        repo: process.env.GITHUB_REPO || 'fan-ai-celebs',
        branch: process.env.GITHUB_BRANCH || 'main'
      };
      
      // Import Octokit and date-fns
      const { Octokit } = await import("@octokit/rest");
      const { format } = await import("date-fns");
      const githubToken = process.env.GITHUB_TOKEN;
      
      if (!githubToken) {
        return res.status(503).json({ message: "GitHub integration not configured" });
      }

      const octokit = new Octokit({ auth: githubToken });
      
      // Try to find the generation image by checking metadata first to get the correct date
      // This ensures historical generations remain accessible
      let imageBuffer: Buffer | null = null;
      let foundPath: string | null = null;
      
      // Search for metadata across recent dates (up to 7 days)
      const datesToTry = [];
      for (let i = 0; i < 7; i++) {
        datesToTry.push(format(new Date(Date.now() - (i * 86400000)), "yyyy-MM-dd"));
      }
      
      // Try to find metadata in any of the date folders
      for (const dateStr of datesToTry) {
        try {
          const metadataPath = `users/${userId}/${dateStr}/${generationId}.json`;
          const { data: metaData } = await octokit.repos.getContent({
            owner,
            repo,
            path: metadataPath,
            ref: branch,
          });
          
          if ('content' in metaData && metaData.encoding === 'base64') {
            const metaContent = Buffer.from(metaData.content, 'base64').toString('utf-8');
            const metadata = JSON.parse(metaContent);
            // Use the stored dateFolder if available, otherwise derive from timestamp
            const genDate = metadata.dateFolder || format(new Date(metadata.timestamp), "yyyy-MM-dd");
            foundPath = `users/${userId}/${genDate}/${generationId}.png`;
            break;
          }
        } catch (err) {
          continue; // Try next date
        }
      }
      
      // If metadata not found in recent dates, try brute-force image search
      if (!foundPath) {
        for (const dateStr of datesToTry) {
          try {
            const testPath = `users/${userId}/${dateStr}/${generationId}.png`;
            const { data } = await octokit.repos.getContent({
              owner,
              repo,
              path: testPath,
              ref: branch,
            });
            
            if ('content' in data && data.encoding === 'base64') {
              foundPath = testPath;
              imageBuffer = Buffer.from(data.content, 'base64');
              break;
            }
          } catch (err) {
            continue; // Try next date
          }
        }
      }
      
      // If we have a path but no buffer yet, fetch it
      if (foundPath && !imageBuffer) {
        try {
          const { data } = await octokit.repos.getContent({
            owner,
            repo,
            path: foundPath,
            ref: branch,
          });
          
          if ('content' in data && data.encoding === 'base64') {
            imageBuffer = Buffer.from(data.content, 'base64');
          }
        } catch (err) {
          // Fall through to 404
        }
      }
      
      if (imageBuffer) {
        res.set('Content-Type', 'image/png');
        res.set('Cache-Control', 'public, max-age=86400'); // Cache for 24 hours
        res.send(imageBuffer);
      } else {
        return res.status(404).json({ message: "Generation image not found" });
      }
    } catch (error: any) {
      console.error("Error fetching generation image from GitHub:", error);
      res.status(500).json({ message: "Failed to fetch generation image" });
    }
  });

  // ===== Public Celebrity Routes =====
  app.get('/api/celebrities', async (req, res) => {
    try {
      const celebrities = await fetchCelebritiesFromGitHub();
      res.json(celebrities);
    } catch (error) {
      console.error("Error fetching celebrities:", error);
      res.status(500).json({ message: "Failed to fetch celebrities" });
    }
  });

  app.get('/api/celebrities/search', async (req, res) => {
    try {
      const query = req.query.q as string;
      if (!query) {
        return res.status(400).json({ message: "Search query required" });
      }
      const results = await searchCelebritiesGitHub(query);
      res.json(results);
    } catch (error) {
      console.error("Error searching celebrities:", error);
      res.status(500).json({ message: "Failed to search celebrities" });
    }
  });

  app.get('/api/celebrities/:slug', async (req, res) => {
    try {
      const celebrity = await getCelebrityBySlug(req.params.slug);
      if (!celebrity) {
        return res.status(404).json({ message: "Celebrity not found" });
      }
      res.json(celebrity);
    } catch (error) {
      console.error("Error fetching celebrity:", error);
      res.status(500).json({ message: "Failed to fetch celebrity" });
    }
  });

  // ===== Celebrity Request Routes =====
  // User submit celebrity request (authenticated)
  app.post('/api/celebrity-requests', isAuthenticated, upload.single('image'), async (req: any, res) => {
    try {
      const userId = req.userId || req.session.userId;
      const { name, description, category } = req.body;
      const uploadedFile = req.file;

      if (!name) {
        return res.status(400).json({ message: "Celebrity name is required" });
      }

      if (!uploadedFile) {
        return res.status(400).json({ message: "Celebrity image is required" });
      }

      // Create celebrity request
      const request = await storage.createCelebrityRequest({
        userId,
        name,
        description: description || null,
        category: category || null,
        imageUrl: `/uploads/${uploadedFile.filename}`,
      });

      res.json({ 
        message: "Celebrity request submitted successfully. Admin will review it soon.",
        request 
      });
    } catch (error) {
      console.error("Error submitting celebrity request:", error);
      res.status(500).json({ message: "Failed to submit celebrity request" });
    }
  });

  // Admin: List all celebrity requests
  app.get('/api/admin/celebrity-requests', isAdmin, async (req, res) => {
    try {
      const status = req.query.status as string | undefined;
      const requests = await storage.listCelebrityRequests(status);
      res.json(requests);
    } catch (error) {
      console.error("Error fetching celebrity requests:", error);
      res.status(500).json({ message: "Failed to fetch celebrity requests" });
    }
  });

  // Admin: Approve celebrity request and upload to GitHub
  app.patch('/api/admin/celebrity-requests/:id/approve', isAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const { slug, adminNotes } = req.body;

      const request = await storage.getCelebrityRequest(id);
      if (!request) {
        return res.status(404).json({ message: "Celebrity request not found" });
      }

      if (request.status !== 'pending') {
        return res.status(400).json({ message: "Request has already been processed" });
      }

      if (!slug) {
        return res.status(400).json({ message: "Slug is required for approval" });
      }

      // Upload celebrity to GitHub
      // Note: celebrity request has 'category' field, GitHub needs 'profession'
      // We use category as profession since they represent the same concept
      if (!request.imageUrl) {
        return res.status(400).json({ message: "Celebrity request has no image" });
      }
      
      // Fix path: request.imageUrl starts with "/" so we need to strip it
      const imageRelativePath = request.imageUrl.startsWith('/') ? request.imageUrl.slice(1) : request.imageUrl;
      const imagePath = path.join(process.cwd(), imageRelativePath);
      const profession = request.category || 'Other'; // Use category as profession
      const githubImageUrl = await uploadCelebrityToGitHub(
        slug,
        request.name,
        profession,
        imagePath,
        request.description ?? undefined,
        request.category ?? undefined // Also pass as category
      );

      // Update request status
      await storage.updateCelebrityRequestStatus(id, 'approved', adminNotes);

      res.json({ 
        message: "Celebrity approved and added to GitHub repository",
        imageUrl: githubImageUrl
      });
    } catch (error) {
      console.error("Error approving celebrity request:", error);
      res.status(500).json({ message: "Failed to approve celebrity request" });
    }
  });

  // Admin: Reject celebrity request
  app.patch('/api/admin/celebrity-requests/:id/reject', isAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const { adminNotes } = req.body;

      const request = await storage.getCelebrityRequest(id);
      if (!request) {
        return res.status(404).json({ message: "Celebrity request not found" });
      }

      if (request.status !== 'pending') {
        return res.status(400).json({ message: "Request has already been processed" });
      }

      // Update request status
      await storage.updateCelebrityRequestStatus(id, 'rejected', adminNotes);

      res.json({ message: "Celebrity request rejected" });
    } catch (error) {
      console.error("Error rejecting celebrity request:", error);
      res.status(500).json({ message: "Failed to reject celebrity request" });
    }
  });

  // Admin: Delete celebrity request
  app.delete('/api/admin/celebrity-requests/:id', isAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteCelebrityRequest(id);
      res.json({ message: "Celebrity request deleted" });
    } catch (error) {
      console.error("Error deleting celebrity request:", error);
      res.status(500).json({ message: "Failed to delete celebrity request" });
    }
  });

  // ===== Public Template Routes =====
  app.get('/api/templates', async (req, res) => {
    try {
      const templates = await fetchTemplatesFromGitHub();
      res.json(templates);
    } catch (error) {
      console.error("Error fetching templates:", error);
      res.status(500).json({ message: "Failed to fetch templates" });
    }
  });

  app.get('/api/templates/:slug', async (req, res) => {
    try {
      const template = await getTemplateBySlug(req.params.slug);
      if (!template) {
        return res.status(404).json({ message: "Template not found" });
      }
      res.json(template);
    } catch (error) {
      console.error("Error fetching template:", error);
      res.status(500).json({ message: "Failed to fetch template" });
    }
  });

  // ===== Generation Routes (Protected) =====
  app.post('/api/generate', isAuthenticated, upload.single('photo'), async (req: any, res) => {
    try {
      const userId = req.userId || req.session.userId;
      const { celebritySlug, templateSlug, campaignId } = req.body;
      const uploadedFile = req.file;

      if (!uploadedFile) {
        return res.status(400).json({ message: "Photo upload required" });
      }

      if (!celebritySlug || !templateSlug) {
        return res.status(400).json({ message: "Celebrity and template required" });
      }

      // Check user credits
      const user = await storage.getUser(userId);
      if (!user || user.credits < 1) {
        return res.status(403).json({ message: "Insufficient credits" });
      }

      // Validate celebrity and template exist in GitHub
      const celebrity = await getCelebrityBySlug(celebritySlug);
      const template = await getTemplateBySlug(templateSlug);

      if (!celebrity || !template) {
        return res.status(404).json({ message: "Celebrity or template not found" });
      }

      // Analyze uploaded image
      const analysis = await analyzeUploadedImage(uploadedFile.path);
      if (!analysis.isValid) {
        fs.unlinkSync(uploadedFile.path); // Clean up
        return res.status(400).json({ message: analysis.reason || "Invalid image" });
      }

      // Create generation record with slugs
      const generation = await storage.createGeneration({
        userId,
        celebrityId: celebritySlug, // Store slug as ID for now
        templateId: templateSlug, // Store slug as ID for now
        campaignId: campaignId || undefined,
        userImageUrl: `/uploads/${uploadedFile.filename}`,
        status: 'pending',
      });

      // Deduct credit
      await storage.deductUserCredits(userId, 1);

      // Increment campaign if applicable
      if (campaignId) {
        await storage.incrementCampaignGenerations(campaignId);
      }

      // Start async generation (in background)
      setImmediate(async () => {
        try {
          await storage.updateGeneration(generation.id, { status: 'processing' });

          const outputPath = `uploads/generated/${generation.id}.png`;
          const processedPath = `uploads/processed/${generation.id}.png`;

          // Replace placeholders in prompt
          const prompt = template.prompt.replace(/\{\{celeb_name\}\}/g, celebrity.name);

          // Generate image (placeholder - needs actual implementation)
          await generateCelebrityPhoto(
            uploadedFile.path,
            celebrity.image || uploadedFile.path, // Use GitHub image URL
            prompt,
            outputPath
          );

          // Process image (crop margins, add watermark)
          await processGeneratedImage(outputPath, processedPath);

          // Upload result to GitHub
          try {
            const githubUrl = await uploadGenerationToGitHub(
              userId,
              generation.id,
              processedPath,
              {
                template: templateSlug,
                celebrity: celebritySlug,
                timestamp: new Date().toISOString(),
              }
            );

            // Update generation with GitHub URL
            await storage.updateGeneration(generation.id, {
              generatedImageUrl: githubUrl,
              status: 'completed',
            });
          } catch (githubError: any) {
            console.error("GitHub upload failed, using local URL:", githubError);
            // Fallback to local URL if GitHub upload fails
            await storage.updateGeneration(generation.id, {
              generatedImageUrl: `/uploads/processed/${generation.id}.png`,
              status: 'completed',
            });
          }
        } catch (error: any) {
          console.error("Generation error:", error);
          await storage.updateGeneration(generation.id, {
            status: 'failed',
            errorMessage: error.message || "Generation failed",
          });
        }
      });

      res.json({ generationId: generation.id });
    } catch (error: any) {
      console.error("Generate error:", error);
      res.status(500).json({ message: error.message || "Generation failed" });
    }
  });

  app.get('/api/generations', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.userId || req.session.userId;
      const generations = await storage.listGenerations(userId);
      res.json(generations);
    } catch (error) {
      console.error("Error fetching generations:", error);
      res.status(500).json({ message: "Failed to fetch generations" });
    }
  });

  app.get('/api/generations/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.userId || req.session.userId;
      const generation = await storage.getGeneration(req.params.id);

      if (!generation) {
        return res.status(404).json({ message: "Generation not found" });
      }

      if (generation.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }

      res.json(generation);
    } catch (error) {
      console.error("Error fetching generation:", error);
      res.status(500).json({ message: "Failed to fetch generation" });
    }
  });

  // ===== Admin Celebrity Routes =====
  app.get('/api/admin/celebrities', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const celebrities = await fetchCelebritiesFromGitHub();
      res.json(celebrities);
    } catch (error) {
      console.error("Error fetching celebrities:", error);
      res.status(500).json({ message: "Failed to fetch celebrities" });
    }
  });

  app.post('/api/admin/celebrities', isAuthenticated, isAdmin, upload.single('image'), async (req, res) => {
    try {
      const { name, slug, profession, description, category } = req.body;
      const uploadedFile = req.file;

      if (!name || !slug || !profession) {
        return res.status(400).json({ message: "Name, slug, and profession are required" });
      }

      if (!uploadedFile) {
        return res.status(400).json({ message: "Celebrity image is required" });
      }

      // Upload to GitHub
      const githubImageUrl = await uploadCelebrityToGitHub(
        slug,
        name,
        profession,
        uploadedFile.path,
        description,
        category
      );

      res.status(201).json({ 
        message: "Celebrity uploaded to GitHub successfully",
        imageUrl: githubImageUrl,
        slug,
        name
      });
    } catch (error: any) {
      console.error("Error creating celebrity:", error);
      res.status(400).json({ message: error.message || "Failed to create celebrity" });
    }
  });

  app.patch('/api/admin/celebrities/:id', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const celebrity = await storage.updateCelebrity(req.params.id, req.body);
      res.json(celebrity);
    } catch (error: any) {
      console.error("Error updating celebrity:", error);
      res.status(400).json({ message: error.message || "Failed to update celebrity" });
    }
  });

  app.delete('/api/admin/celebrities/:id', isAuthenticated, isAdmin, async (req, res) => {
    try {
      await storage.deleteCelebrity(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting celebrity:", error);
      res.status(500).json({ message: "Failed to delete celebrity" });
    }
  });

  // ===== Admin Template Routes =====
  app.get('/api/admin/templates', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const templates = await fetchTemplatesFromGitHub();
      res.json(templates);
    } catch (error) {
      console.error("Error fetching templates:", error);
      res.status(500).json({ message: "Failed to fetch templates" });
    }
  });

  app.post('/api/admin/templates', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const validated = insertTemplateSchema.parse(req.body);
      const template = await storage.createTemplate(validated);
      res.status(201).json(template);
    } catch (error: any) {
      console.error("Error creating template:", error);
      res.status(400).json({ message: error.message || "Failed to create template" });
    }
  });

  app.patch('/api/admin/templates/:id', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const template = await storage.updateTemplate(req.params.id, req.body);
      res.json(template);
    } catch (error: any) {
      console.error("Error updating template:", error);
      res.status(400).json({ message: error.message || "Failed to update template" });
    }
  });

  app.delete('/api/admin/templates/:id', isAuthenticated, isAdmin, async (req, res) => {
    try {
      await storage.deleteTemplate(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting template:", error);
      res.status(500).json({ message: "Failed to delete template" });
    }
  });

  // ===== Public Campaign Routes =====
  app.get('/api/campaigns/:slug', async (req, res) => {
    try {
      const campaign = await storage.getCampaign(req.params.slug);
      if (!campaign) {
        return res.status(404).json({ message: "Campaign not found" });
      }
      res.json(campaign);
    } catch (error) {
      console.error("Error fetching campaign:", error);
      res.status(500).json({ message: "Failed to fetch campaign" });
    }
  });

  // ===== Admin Campaign Routes =====
  app.get('/api/admin/campaigns', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const campaigns = await storage.listCampaigns();
      res.json(campaigns);
    } catch (error) {
      console.error("Error fetching campaigns:", error);
      res.status(500).json({ message: "Failed to fetch campaigns" });
    }
  });

  app.post('/api/admin/campaigns', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const userId = req.userId || req.session.userId;
      const validated = insertCampaignSchema.parse({ ...req.body, userId });
      const campaign = await storage.createCampaign(validated);
      res.status(201).json(campaign);
    } catch (error: any) {
      console.error("Error creating campaign:", error);
      res.status(400).json({ message: error.message || "Failed to create campaign" });
    }
  });

  app.delete('/api/admin/campaigns/:id', isAuthenticated, isAdmin, async (req, res) => {
    try {
      await storage.deleteCampaign(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting campaign:", error);
      res.status(500).json({ message: "Failed to delete campaign" });
    }
  });

  // ===== Admin Analytics =====
  app.get('/api/admin/analytics', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const analytics = await storage.getAnalytics();
      res.json(analytics);
    } catch (error) {
      console.error("Error fetching analytics:", error);
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });

  // ===== Admin GitHub Integration =====
  app.post('/api/admin/sync-github', isAuthenticated, isAdmin, async (req, res) => {
    try {
      // Clear all GitHub caches to force refresh
      clearAllCaches();
      
      // Fetch fresh data
      const celebrities = await fetchCelebritiesFromGitHub();
      const templates = await fetchTemplatesFromGitHub();
      
      res.json({
        message: "GitHub cache refreshed successfully",
        stats: {
          celebrities: celebrities.length,
          templates: templates.length,
        },
        cacheStats: getCacheStats(),
      });
    } catch (error: any) {
      console.error("Error syncing GitHub cache:", error);
      res.status(500).json({ 
        message: "Failed to sync GitHub cache",
        error: error.message 
      });
    }
  });

  // Serve uploaded files
  app.use('/uploads', express.static('uploads'));

  const httpServer = createServer(app);
  return httpServer;
}
