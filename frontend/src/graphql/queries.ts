import { gql } from '@apollo/client';

// Reusable fragment for Job fields
export const JOB_FIELDS = gql`
  fragment JobFields on Job {
    id title description location remote
    jobType experienceLevel status tags applicationCount createdAt
    salary { min max currency }
    company { id name logoUrl location }
    postedBy { id name }
  }
`;

// Fetch a single job by ID
export const GET_JOB = gql`
  query GetJob($id: ID!) {
    job(id: $id) {
      ...JobFields
      requirements expiresAt
      applications { id status appliedAt }
    }
  }
  ${JOB_FIELDS}
`;

// Paginated list of jobs from PostgreSQL
export const GET_JOBS = gql`
  query GetJobs($page: Int, $pageSize: Int, $status: JobStatus, $jobType: JobType, $experienceLevel: ExperienceLevel) {
    jobs(page: $page, pageSize: $pageSize, status: $status, jobType: $jobType, experienceLevel: $experienceLevel) {
      jobs { ...JobFields }
      total page pageSize
    }
  }
  ${JOB_FIELDS}
`;

// Full-text search via ElasticSearch
export const SEARCH_JOBS = gql`
  query SearchJobs(
    $query: String! $location: String $jobType: JobType
    $experienceLevel: ExperienceLevel $salaryMin: Int $salaryMax: Int
    $remote: Boolean $page: Int $pageSize: Int
  ) {
    searchJobs(
      query: $query location: $location jobType: $jobType
      experienceLevel: $experienceLevel salaryMin: $salaryMin salaryMax: $salaryMax
      remote: $remote page: $page pageSize: $pageSize
    ) {
      jobs { ...JobFields }
      total page pageSize took
    }
  }
  ${JOB_FIELDS}
`;

// Get current authenticated user
export const GET_ME = gql`
  query GetMe {
    me {
      id email name role
      company { id name logoUrl }
      createdAt
    }
  }
`;

// Get user's job applications
export const GET_MY_APPLICATIONS = gql`
  query GetMyApplications {
    myApplications {
      id status appliedAt
      job {
        id title status
        company { id name logoUrl }
      }
    }
  }
`;
