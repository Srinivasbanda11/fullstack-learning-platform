import { Kafka, Producer, CompressionTypes, logLevel } from 'kafkajs';

const kafka = new Kafka({
  clientId: 'jobboard-backend',
  brokers: (process.env.KAFKA_BROKERS || 'localhost:9092').split(','),
  logLevel: logLevel.WARN,
  retry: { initialRetryTime: 300, retries: 8 },
});

const producer: Producer = kafka.producer({ allowAutoTopicCreation: true, idempotent: true });
let isProducerConnected = false;

export async function connectProducer(): Promise<void> {
  if (!isProducerConnected) {
    await producer.connect();
    isProducerConnected = true;
    console.log('[Kafka Producer] Connected');
  }
}

export async function publishJobEvent(topic: string, event: Record<string, unknown>): Promise<void> {
  await connectProducer();
  await producer.send({
    topic,
    compression: CompressionTypes.GZIP,
    messages: [{ key: String(event.jobId || 'unknown'), value: JSON.stringify(event) }],
  });
}

export async function disconnectProducer(): Promise<void> {
  if (isProducerConnected) { await producer.disconnect(); isProducerConnected = false; }
}

export const KAFKA_TOPICS = {
  JOBS_CREATED: 'jobs-created',
  JOBS_UPDATED: 'jobs-updated',
  JOBS_DELETED: 'jobs-deleted',
  JOB_APPLICATIONS: 'job-applications',
  USER_EVENTS: 'user-events',
  ANALYTICS: 'analytics-events',
} as const;
