import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  UpdateDateColumn, ManyToOne, OneToMany, JoinColumn, Index,
} from 'typeorm';

export enum JobType { FULL_TIME = 'FULL_TIME', PART_TIME = 'PART_TIME', CONTRACT = 'CONTRACT', FREELANCE = 'FREELANCE', INTERNSHIP = 'INTERNSHIP', REMOTE = 'REMOTE' }
export enum ExperienceLevel { ENTRY = 'ENTRY', MID = 'MID', SENIOR = 'SENIOR', LEAD = 'LEAD', EXECUTIVE = 'EXECUTIVE' }
export enum JobStatus { DRAFT = 'DRAFT', ACTIVE = 'ACTIVE', CLOSED = 'CLOSED', EXPIRED = 'EXPIRED' }

@Entity('jobs')
@Index(['status', 'createdAt'])
@Index(['jobType', 'experienceLevel'])
export class Job {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ type: 'varchar', length: 255 }) title: string;
  @Column({ type: 'text' }) description: string;
  @Column({ type: 'text', array: true, default: '{}' }) requirements: string[];
  @Column({ type: 'varchar', length: 255 }) @Index() location: string;
  @Column({ type: 'boolean', default: false }) remote: boolean;
  @Column({ type: 'enum', enum: JobType, default: JobType.FULL_TIME }) jobType: JobType;
  @Column({ type: 'enum', enum: ExperienceLevel, default: ExperienceLevel.MID }) experienceLevel: ExperienceLevel;
  @Column({ type: 'enum', enum: JobStatus, default: JobStatus.DRAFT }) status: JobStatus;
  @Column({ type: 'text', array: true, default: '{}' }) tags: string[];
  @Column({ type: 'integer', nullable: true }) salaryMin: number | null;
  @Column({ type: 'integer', nullable: true }) salaryMax: number | null;
  @Column({ type: 'varchar', length: 3, default: 'USD' }) salaryCurrency: string;
  @Column({ type: 'timestamp', nullable: true }) expiresAt: Date | null;

  @ManyToOne('Company', 'jobs', { nullable: false })
  @JoinColumn({ name: 'company_id' })
  company: any;

  @ManyToOne('User', 'postedJobs', { nullable: false })
  @JoinColumn({ name: 'posted_by_id' })
  postedBy: any;

  @OneToMany('Application', 'job', { cascade: true })
  applications: any[];

  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at' }) updatedAt: Date;
}
