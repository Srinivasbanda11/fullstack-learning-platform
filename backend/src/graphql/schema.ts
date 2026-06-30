import { gql } from 'graphql-tag';

/**
 * GraphQL Schema Definition
 *
 * This file defines all the types, queries, mutations, and subscriptions
 * for the Job Board platform API.
 *
 * Learning: GraphQL schema-first development with TypeScript type safety
 */
export const typeDefs = gql`
  # ==========================================
  # SCALAR TYPES
  # ==========================================
  scalar DateTime
  scalar JSON

  # ==========================================
  # ENUMS
  # ==========================================
  enum JobType {
    FULL_TIME
    PART_TIME
    CONTRACT
    FREELANCE
    INTERNSHIP
    REMOTE
  }

  enum ExperienceLevel {
    ENTRY
    MID
    SENIOR
    LEAD
    EXECUTIVE
  }

  enum JobStatus {
    DRAFT
    ACTIVE
    CLOSED
    EXPIRED
  }

  # ==========================================
  # OBJECT TYPES
  # ==========================================
  type User {
    id: ID!
    email: String!
    name: String!
    role: String!
    company: Company
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type Company {
    id: ID!
    name: String!
    description: String
    website: String
    logoUrl: String
    location: String
    jobs: [Job!]!
    createdAt: DateTime!
  }

  type Job {
    id: ID!
    title: String!
    description: String!
    requirements: [String!]!
    salary: SalaryRange
    location: String!
    remote: Boolean!
    jobType: JobType!
    experienceLevel: ExperienceLevel!
    status: JobStatus!
    tags: [String!]!
    company: Company!
    postedBy: User!
    applications: [Application!]!
    applicationCount: Int!
    createdAt: DateTime!
    updatedAt: DateTime!
    expiresAt: DateTime
  }

  type SalaryRange {
    min: Int
    max: Int
    currency: String!
  }

  type Application {
    id: ID!
    job: Job!
    applicant: User!
    coverLetter: String
    resumeUrl: String
    status: String!
    appliedAt: DateTime!
  }

  type SearchResult {
    jobs: [Job!]!
    total: Int!
    page: Int!
    pageSize: Int!
    took: Int!
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  # ==========================================
  # QUERY TYPE
  # ==========================================
  type Query {
    # User queries
    me: User
    user(id: ID!): User

    # Job queries
    job(id: ID!): Job
    jobs(
      page: Int = 1
      pageSize: Int = 10
      status: JobStatus
      jobType: JobType
      experienceLevel: ExperienceLevel
    ): SearchResult!

    # Full-text search via ElasticSearch
    searchJobs(
      query: String!
      location: String
      jobType: JobType
      experienceLevel: ExperienceLevel
      salaryMin: Int
      salaryMax: Int
      remote: Boolean
      page: Int = 1
      pageSize: Int = 10
    ): SearchResult!

    # Company queries
    company(id: ID!): Company
    companies: [Company!]!

    # Application queries
    myApplications: [Application!]!
    jobApplications(jobId: ID!): [Application!]!
  }

  # ==========================================
  # MUTATION TYPE
  # ==========================================
  type Mutation {
    # Auth mutations
    register(input: RegisterInput!): AuthPayload!
    login(email: String!, password: String!): AuthPayload!

    # Job mutations
    createJob(input: CreateJobInput!): Job!
    updateJob(id: ID!, input: UpdateJobInput!): Job!
    deleteJob(id: ID!): Boolean!
    publishJob(id: ID!): Job!
    closeJob(id: ID!): Job!

    # Application mutations
    applyToJob(input: ApplyToJobInput!): Application!
    updateApplicationStatus(id: ID!, status: String!): Application!

    # Company mutations
    createCompany(input: CreateCompanyInput!): Company!
    updateCompany(id: ID!, input: UpdateCompanyInput!): Company!
  }

  # ==========================================
  # INPUT TYPES
  # ==========================================
  input RegisterInput {
    email: String!
    password: String!
    name: String!
    role: String!
  }

  input CreateJobInput {
    title: String!
    description: String!
    requirements: [String!]!
    location: String!
    remote: Boolean!
    jobType: JobType!
    experienceLevel: ExperienceLevel!
    tags: [String!]
    salaryMin: Int
    salaryMax: Int
    salaryCurrency: String
    expiresAt: DateTime
  }

  input UpdateJobInput {
    title: String
    description: String
    requirements: [String!]
    location: String
    remote: Boolean
    jobType: JobType
    experienceLevel: ExperienceLevel
    tags: [String!]
    salaryMin: Int
    salaryMax: Int
    status: JobStatus
  }

  input ApplyToJobInput {
    jobId: ID!
    coverLetter: String
    resumeUrl: String
  }

  input CreateCompanyInput {
    name: String!
    description: String
    website: String
    location: String
  }

  input UpdateCompanyInput {
    name: String
    description: String
    website: String
    logoUrl: String
    location: String
  }
`;
