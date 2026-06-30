import { Kafka, Consumer, EachMessagePayload, logLevel } from 'kafkajs';
import { KAFKA_TOPICS } from './producer';

const kafka = new Kafka({
  clientId: 'jobboard-search-indexer',
  brokers: (process.env.KAFKA_BROKERS || 'localhost:9092').split(','),
  logLevel: logLevel.WARN,
});

const consumer: Consumer = kafka.consumer({
  groupId: 'search-indexer-group',
  sessionTimeout: 30000,
});

export async function startKafkaConsumer(): Promise<void> {
  await consumer.connect();
  await consumer.subscribe({
    topics: [KAFKA_TOPICS.JOBS_CREATED, KAFKA_TOPICS.JOBS_UPDATED, KAFKA_TOPICS.JOBS_DELETED],
    fromBeginning: false,
  });

  await consumer.run({
    eachMessage: async ({ topic, message }: EachMessagePayload) => {
      const event = JSON.parse(message.value?.toString() || '{}');
      console.log('[Kafka Consumer] Processing:', topic, event.eventType);
      switch (topic) {
        case KAFKA_TOPICS.JOBS_CREATED:
          await indexJobToElasticSearch(event.payload);
          break;
        case KAFKA_TOPICS.JOBS_UPDATED:
          await updateJobInElasticSearch(event.payload);
          break;
        case KAFKA_TOPICS.JOBS_DELETED:
          await removeJobFromElasticSearch(event.jobId);
          break;
      }
    },
  });
}

async function indexJobToElasticSearch(job: Record<string, unknown>): Promise<void> {
  const { esClient, JOBS_INDEX } = await import('../elasticsearch/client');
  await esClient.index({ index: JOBS_INDEX, id: String(job.id), document: job });
  console.log('[Consumer] Indexed job:', job.id);
}

async function updateJobInElasticSearch(job: Record<string, unknown>): Promise<void> {
  const { esClient, JOBS_INDEX } = await import('../elasticsearch/client');
  await esClient.update({ index: JOBS_INDEX, id: String(job.id), doc: job });
  console.log('[Consumer] Updated job index:', job.id);
}

async function removeJobFromElasticSearch(jobId: string): Promise<void> {
  const { esClient, JOBS_INDEX } = await import('../elasticsearch/client');
  await esClient.delete({ index: JOBS_INDEX, id: jobId });
  console.log('[Consumer] Removed job from index:', jobId);
}

export async function stopKafkaConsumer(): Promise<void> {
  await consumer.disconnect();
}
