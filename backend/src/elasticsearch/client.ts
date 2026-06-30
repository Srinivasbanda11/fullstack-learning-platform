import { Client } from '@elastic/elasticsearch';

export const JOBS_INDEX = 'jobs';

export const esClient = new Client({
  node: process.env.ELASTICSEARCH_URL || 'http://localhost:9200',
  auth: process.env.ELASTICSEARCH_USER
    ? { username: process.env.ELASTICSEARCH_USER, password: process.env.ELASTICSEARCH_PASSWORD || '' }
    : undefined,
  requestTimeout: 30000,
  maxRetries: 3,
});

export async function connectElasticSearch(): Promise<void> {
  const health = await esClient.cluster.health({});
  console.log('[ElasticSearch] Cluster health:', health.status);

  const indexExists = await esClient.indices.exists({ index: JOBS_INDEX });
  if (!indexExists) {
    await esClient.indices.create({
      index: JOBS_INDEX,
      body: {
        settings: {
          number_of_shards: 1,
          number_of_replicas: 1,
        },
        mappings: {
          properties: {
            title: { type: 'text', fields: { keyword: { type: 'keyword' } } },
            description: { type: 'text' },
            requirements: { type: 'text' },
            location: { type: 'text', fields: { keyword: { type: 'keyword' } } },
            jobType: { type: 'keyword' },
            experienceLevel: { type: 'keyword' },
            status: { type: 'keyword' },
            tags: { type: 'keyword' },
            salaryMin: { type: 'integer' },
            salaryMax: { type: 'integer' },
            remote: { type: 'boolean' },
            createdAt: { type: 'date' },
            companyId: { type: 'keyword' },
          },
        },
      },
    });
    console.log('[ElasticSearch] Created index:', JOBS_INDEX);
  }
}

export function buildJobSearchQuery(params: {
  query: string;
  location?: string;
  jobType?: string;
  experienceLevel?: string;
  salaryMin?: number;
  salaryMax?: number;
  remote?: boolean;
}) {
  const { query, location, jobType, experienceLevel, salaryMin, salaryMax, remote } = params;
  return {
    bool: {
      must: [
        { multi_match: { query, fields: ['title^3', 'description^2', 'requirements', 'tags^2', 'location'], fuzziness: 'AUTO' } },
        { term: { status: 'ACTIVE' } },
      ],
      filter: [
        ...(location ? [{ match: { location } }] : []),
        ...(jobType ? [{ term: { jobType } }] : []),
        ...(experienceLevel ? [{ term: { experienceLevel } }] : []),
        ...(remote !== undefined ? [{ term: { remote } }] : []),
        ...(salaryMin || salaryMax ? [{ range: { salaryMin: { ...(salaryMin && { gte: salaryMin }), ...(salaryMax && { lte: salaryMax }) } } }] : []),
      ],
    },
  };
}
