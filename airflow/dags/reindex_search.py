"""
Apache Airflow DAG: Reindex Jobs from PostgreSQL to ElasticSearch

Learning: Airflow DAGs (Directed Acyclic Graphs) orchestrate multi-step workflows.
Key concepts: Tasks, Dependencies (>>), Hooks, XCom, Variables, Schedule

This DAG runs every hour to sync jobs from PostgreSQL to ElasticSearch,
ensuring search results stay up-to-date even if the Kafka consumer is down.
"""
from datetime import datetime, timedelta
from airflow import DAG
from airflow.operators.python import PythonOperator
from airflow.operators.empty import EmptyOperator
from airflow.providers.postgres.hooks.postgres import PostgresHook
from airflow.models import Variable
import logging

logger = logging.getLogger(__name__)

default_args = {
    "owner": "data-engineering",
    "depends_on_past": False,
    "start_date": datetime(2024, 1, 1),
    "retries": 3,
    "retry_delay": timedelta(minutes=5),
}

dag = DAG(
    dag_id="reindex_jobs_to_elasticsearch",
    default_args=default_args,
    description="Sync active jobs from PostgreSQL to ElasticSearch hourly",
    schedule_interval="0 * * * *",  # Every hour
    catchup=False,
    max_active_runs=1,
    tags=["search", "elasticsearch", "postgresql"],
)


def fetch_unindexed_jobs(**context):
    """Fetch jobs updated since last sync from PostgreSQL."""
    last_sync = Variable.get("es_last_sync_timestamp", default_var="2024-01-01T00:00:00")
    pg_hook = PostgresHook(postgres_conn_id="postgres_jobboard")
    
    query = """
        SELECT j.id, j.title, j.description, j.location, j.remote,
               j.job_type as "jobType", j.experience_level as "experienceLevel",
               j.status, j.tags, j.salary_min as "salaryMin",
               j.salary_max as "salaryMax", j.created_at::text as "createdAt",
               c.id as "companyId", c.name as "companyName"
        FROM jobs j LEFT JOIN companies c ON j.company_id = c.id
        WHERE j.status = 'ACTIVE' AND j.updated_at > %s::timestamp
        ORDER BY j.updated_at DESC LIMIT 1000
    """
    records = pg_hook.get_records(query, parameters=[last_sync])
    columns = ["id","title","description","location","remote","jobType","experienceLevel",
               "status","tags","salaryMin","salaryMax","createdAt","companyId","companyName"]
    jobs = [dict(zip(columns, r)) for r in records]
    
    logger.info(f"Fetched {len(jobs)} jobs to reindex")
    context["ti"].xcom_push(key="jobs_to_index", value=jobs)
    return {"count": len(jobs)}


def index_jobs_to_elasticsearch(**context):
    """Bulk index jobs into ElasticSearch."""
    from elasticsearch import Elasticsearch
    jobs = context["ti"].xcom_pull(task_ids="fetch_unindexed_jobs", key="jobs_to_index")
    if not jobs:
        return {"indexed": 0}
    
    es = Elasticsearch([Variable.get("elasticsearch_url", default_var="http://localhost:9200")])
    bulk_actions = []
    for job in jobs:
        bulk_actions.append({"index": {"_index": "jobs", "_id": job["id"]}})
        bulk_actions.append(job)
    
    response = es.bulk(operations=bulk_actions, refresh=True)
    logger.info(f"Indexed {len(jobs)} jobs to ElasticSearch")
    return {"indexed": len(jobs)}


def update_sync_timestamp(**context):
    """Update last sync timestamp in Airflow Variables."""
    Variable.set("es_last_sync_timestamp", datetime.utcnow().isoformat())


# Task definitions
start = EmptyOperator(task_id="start", dag=dag)
fetch_task = PythonOperator(task_id="fetch_unindexed_jobs", python_callable=fetch_unindexed_jobs, dag=dag)
index_task = PythonOperator(task_id="index_jobs_to_elasticsearch", python_callable=index_jobs_to_elasticsearch, dag=dag)
update_task = PythonOperator(task_id="update_sync_timestamp", python_callable=update_sync_timestamp, dag=dag)
end = EmptyOperator(task_id="end", dag=dag)

# Task dependencies: start -> fetch -> index -> update -> end
start >> fetch_task >> index_task >> update_task >> end
