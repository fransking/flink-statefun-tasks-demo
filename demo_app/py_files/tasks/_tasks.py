from statefun_tasks import FlinkTasks
from statefun_tasks import in_parallel
import asyncio
import logging


_log = logging.getLogger(__name__)


tasks = FlinkTasks(
  default_namespace="demo", 
  default_worker_name="worker", 
  egress_type_name="demo/kafka-generic-egress"
)


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
