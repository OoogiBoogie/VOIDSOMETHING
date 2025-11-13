/**
 * Jobs Service
 * Handles job listings, applications, project spaces, and collaboration
 */

export interface Job {
  id: string;
  creatorId?: string;
  projectId?: string;
  title: string;
  description: string;
  role: JobRole;
  type: JobType;
  skills: string[];
  reward: JobReward;
  status: JobStatus;
  postedAt: Date;
  closesAt?: Date;
  applicants: number;
}

export type JobRole = 'dev' | 'art' | 'writing' | 'marketing' | 'business' | 'mod' | 'other';
export type JobType = 'paid' | 'equity' | 'bounty' | 'volunteer';
export type JobStatus = 'open' | 'in-progress' | 'filled' | 'closed';

export interface JobReward {
  type: 'token' | 'equity' | 'revenue-share';
  token?: string; // Token address or symbol
  amount?: number;
  percentage?: number; // For equity/revenue share
  timing: 'immediate' | 'milestone' | 'completion';
  escrowAddress?: string;
}

export interface JobApplication {
  id: string;
  jobId: string;
  userId: string;
  status: ApplicationStatus;
  proposal: string;
  portfolio?: string;
  agreedTerms: boolean;
  appliedAt: Date;
  reviewedAt?: Date;
}

export type ApplicationStatus = 'pending' | 'reviewing' | 'accepted' | 'rejected' | 'withdrawn';

export interface ProjectSpace {
  id: string;
  ownerId: string;
  name: string;
  description: string;
  linkedAsset?: {
    type: 'token' | 'land' | 'sku';
    id: string;
  };
  summary: string;
  roadmap: string;
  visibility: 'public' | 'private' | 'dao-only';
  members: ProjectMember[];
  tasks?: Task[];
  createdAt: Date;
}

export interface ProjectMember {
  userId: string;
  username: string;
  role: string;
  joinedAt: Date;
  contribution?: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  assignedTo?: string;
  status: 'todo' | 'in-progress' | 'review' | 'done';
  createdAt: Date;
  completedAt?: Date;
}

class JobsService {
  private jobs: Map<string, Job> = new Map();
  private applications: Map<string, JobApplication> = new Map();
  private projectSpaces: Map<string, ProjectSpace> = new Map();

  /**
   * Get all jobs with filters
   */
  async getJobs(filters?: {
    role?: JobRole;
    type?: JobType;
    status?: JobStatus;
    creatorId?: string;
    projectId?: string;
    search?: string;
  }): Promise<Job[]> {
    // TODO: Replace with actual API call to jobs_projects_db
    let jobs = Array.from(this.jobs.values());

    if (filters) {
      if (filters.role) {
        jobs = jobs.filter(j => j.role === filters.role);
      }
      if (filters.type) {
        jobs = jobs.filter(j => j.type === filters.type);
      }
      if (filters.status) {
        jobs = jobs.filter(j => j.status === filters.status);
      }
      if (filters.creatorId) {
        jobs = jobs.filter(j => j.creatorId === filters.creatorId);
      }
      if (filters.projectId) {
        jobs = jobs.filter(j => j.projectId === filters.projectId);
      }
      if (filters.search) {
        const query = filters.search.toLowerCase();
        jobs = jobs.filter(
          j =>
            j.title.toLowerCase().includes(query) ||
            j.description.toLowerCase().includes(query)
        );
      }
    }

    return jobs;
  }

  /**
   * Get job by ID
   */
  async getJob(jobId: string): Promise<Job | null> {
    // TODO: Replace with actual API call
    return this.jobs.get(jobId) || null;
  }

  /**
   * Get jobs for a creator
   */
  async getJobsForCreator(creatorId: string): Promise<Job[]> {
    return this.getJobs({ creatorId });
  }

  /**
   * Create job listing
   */
  async createJob(
    job: Omit<Job, 'id' | 'postedAt' | 'applicants' | 'status'>
  ): Promise<Job> {
    // TODO: Replace with actual API call
    // TODO: Add moderation/validation
    const newJob: Job = {
      ...job,
      id: `job-${Date.now()}`,
      postedAt: new Date(),
      applicants: 0,
      status: 'open',
    };

    this.jobs.set(newJob.id, newJob);
    return newJob;
  }

  /**
   * Apply to job
   */
  async applyToJob(
    jobId: string,
    application: Omit<JobApplication, 'id' | 'jobId' | 'status' | 'appliedAt'>
  ): Promise<JobApplication> {
    // TODO: Replace with actual API call
    const newApplication: JobApplication = {
      ...application,
      id: `app-${Date.now()}`,
      jobId,
      status: 'pending',
      appliedAt: new Date(),
    };

    this.applications.set(newApplication.id, newApplication);

    // Update job applicants count
    const job = this.jobs.get(jobId);
    if (job) {
      job.applicants++;
    }

    return newApplication;
  }

  /**
   * Get user's applications
   */
  async getUserApplications(userId: string): Promise<JobApplication[]> {
    // TODO: Replace with actual API call
    return Array.from(this.applications.values()).filter(
      app => app.userId === userId
    );
  }

  /**
   * Get applications for a job (for job poster)
   */
  async getJobApplications(jobId: string): Promise<JobApplication[]> {
    // TODO: Replace with actual API call
    return Array.from(this.applications.values()).filter(
      app => app.jobId === jobId
    );
  }

  /**
   * Update application status
   */
  async updateApplicationStatus(
    applicationId: string,
    status: ApplicationStatus
  ): Promise<JobApplication> {
    // TODO: Replace with actual API call
    const application = this.applications.get(applicationId);
    if (!application) {
      throw new Error('Application not found');
    }

    application.status = status;
    application.reviewedAt = new Date();

    return application;
  }

  /**
   * Get project spaces
   */
  async getProjectSpaces(filters?: {
    ownerId?: string;
    visibility?: ProjectSpace['visibility'];
    search?: string;
  }): Promise<ProjectSpace[]> {
    // TODO: Replace with actual API call
    let spaces = Array.from(this.projectSpaces.values());

    if (filters) {
      if (filters.ownerId) {
        spaces = spaces.filter(s => s.ownerId === filters.ownerId);
      }
      if (filters.visibility) {
        spaces = spaces.filter(s => s.visibility === filters.visibility);
      }
      if (filters.search) {
        const query = filters.search.toLowerCase();
        spaces = spaces.filter(
          s =>
            s.name.toLowerCase().includes(query) ||
            s.description.toLowerCase().includes(query)
        );
      }
    }

    return spaces;
  }

  /**
   * Get project space by ID
   */
  async getProjectSpace(spaceId: string): Promise<ProjectSpace | null> {
    // TODO: Replace with actual API call
    return this.projectSpaces.get(spaceId) || null;
  }

  /**
   * Get project space summary (for contextual HUD)
   */
  async getProjectSpaceSummary(spaceId: string): Promise<{
    name: string;
    memberCount: number;
    activeTasks: number;
  } | null> {
    const space = await this.getProjectSpace(spaceId);
    if (!space) return null;

    return {
      name: space.name,
      memberCount: space.members.length,
      activeTasks: space.tasks?.filter(t => t.status !== 'done').length || 0,
    };
  }

  /**
   * Create project space
   */
  async createProjectSpace(
    space: Omit<ProjectSpace, 'id' | 'createdAt' | 'members'>
  ): Promise<ProjectSpace> {
    // TODO: Replace with actual API call
    const newSpace: ProjectSpace = {
      ...space,
      id: `space-${Date.now()}`,
      members: [
        {
          userId: space.ownerId,
          username: 'Owner', // Get from authService
          role: 'Owner',
          joinedAt: new Date(),
        },
      ],
      createdAt: new Date(),
    };

    this.projectSpaces.set(newSpace.id, newSpace);
    return newSpace;
  }

  /**
   * Join project space
   */
  async joinProjectSpace(
    spaceId: string,
    userId: string,
    role: string = 'Contributor'
  ): Promise<ProjectSpace> {
    // TODO: Replace with actual API call
    const space = this.projectSpaces.get(spaceId);
    if (!space) {
      throw new Error('Project space not found');
    }

    const member: ProjectMember = {
      userId,
      username: `User ${userId}`, // Get from authService
      role,
      joinedAt: new Date(),
    };

    space.members.push(member);
    return space;
  }

  /**
   * Get user's projects
   */
  async getUserProjects(userId: string): Promise<ProjectSpace[]> {
    // TODO: Replace with actual API call
    return Array.from(this.projectSpaces.values()).filter(
      space => space.members.some(m => m.userId === userId)
    );
  }

  /**
   * Report job (for moderation)
   */
  async reportJob(jobId: string, reason: string): Promise<void> {
    // TODO: Replace with actual API call to moderation system
    console.log(`Job ${jobId} reported: ${reason}`);
  }
}

// Export singleton instance
export const jobsService = new JobsService();
