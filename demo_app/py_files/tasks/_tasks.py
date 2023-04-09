from statefun_tasks import FlinkTasks
from statefun_tasks import TaskException
from statefun_tasks import RetryPolicy
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
async def divide(a, b):
    await asyncio.sleep(1)  # to simulate the effect of doing real work
    return a / b


@tasks.bind()
async def sum_all(*items):
    await asyncio.sleep(1)
    return sum(*items)


@tasks.bind()
async def sum_numbers(items):
    await asyncio.sleep(1)
    return sum([item for item in items if not isinstance(item, TaskException)])


@tasks.bind()
async def fail(*args, error_message):
    await asyncio.sleep(1)
    raise ValueError(error_message)


@tasks.bind(with_context=True, retry_policy=RetryPolicy(retry_for=[ValueError], max_retries=2))
async def flakey_multiply(ctx, a, b):
    await asyncio.sleep(1)
    state = ctx.get_state() or False

    if state:
        return a * b
    else:
        ctx.set_state(True)
        raise ValueError()


@tasks.bind()
async def handle_error(task_exception, return_value=None):
    await asyncio.sleep(1)  # to simulate the effect of doing real work
    return return_value
