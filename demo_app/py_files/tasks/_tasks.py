from statefun_tasks import FlinkTasks
import asyncio
import os
import logging


_log = logging.getLogger(__name__)


default_namespace = os.environ.get('FLINK_WORKER_NAMESPACE', 'external')
default_worker_name = os.environ.get('FLINK_WORKER_NAME', 'worker')
egress_type_name = os.environ.get('FLINK_EGRESS_TYPE_NAME', 'demo/kafka-generic-egress')


tasks = FlinkTasks(default_namespace, default_worker_name, egress_type_name)


@tasks.bind()
async def multiply(a, b):
    await asyncio.sleep(1)  # to simulate the effect of doing real work
    return a * b


@tasks.bind()
async def sum_all(*items):
    await asyncio.sleep(1)
    return sum(*items)


@tasks.bind()
async def fail(*args, error_message):
    await asyncio.sleep(1)
    raise ValueError(error_message)
