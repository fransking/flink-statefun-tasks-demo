from statefun_tasks import FlinkTasks
from statefun_tasks import TaskException
from statefun_tasks import RetryPolicy
from statefun_tasks import in_parallel
from datetime import timedelta
import numpy as np
import asyncio
import os
import random
import logging


_log = logging.getLogger(__name__)


default_namespace = os.environ.get('FLINK_WORKER_NAMESPACE', 'external')
default_worker_name = os.environ.get('FLINK_WORKER_NAME', 'worker')
embedded_pipeline_namespace = os.environ.get('FLINK_EMBEDDED_PIPELINE_NAMESPACE', 'demo')
embedded_pipeline_type = os.environ.get('FLINK_EMBEDDED_PIPELINE_TYPE', 'embedded_pipeline')
egress_type_name = os.environ.get('FLINK_EGRESS_TYPE_NAME', 'demo/kafka-generic-egress')
state_expiration_minutes = os.environ.get('FLINK_STATE_EXPIRATION_TIME_MINUTES', '1440') # 24 hours

tasks = FlinkTasks(
    default_namespace, 
    default_worker_name, 
    egress_type_name, 
    embedded_pipeline_namespace=embedded_pipeline_namespace,
    embedded_pipeline_type=embedded_pipeline_type,
    state_expiration=timedelta(minutes=float(state_expiration_minutes)))


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
    await asyncio.sleep(1)  
    return return_value


@tasks.bind()
async def cleanup(*args):
    await asyncio.sleep(1)  


@tasks.bind()
async def multiply_and_append(a, b):
    await asyncio.sleep(0.5)
    return a + [a[-1] * b]


@tasks.bind()
async def generate_series(start, scale, length):
    await asyncio.sleep(1) 
    pipeline = multiply_and_append.send([start], scale)

    for _ in range(length - 1):
        pipeline.continue_with(multiply_and_append, scale)

    return pipeline


@tasks.bind(module_name="__builtins")
async def echo():
    pass


@tasks.bind()
async def generate_random_numbers(size, num_stages=1):
    pipeline = in_parallel([generate_random_number.send() for _ in range(size)], num_stages=num_stages, ordered=False)
    return pipeline


@tasks.bind()
async def generate_random_number():
    return random.randint(0, 10)


@tasks.bind()
async def average(numbers):
    return np.mean(numbers).item()


@tasks.bind()
async def generate_noops(size, num_stages=1):
    pipeline = in_parallel([noop.send() for _ in range(size)], num_stages=num_stages, ordered=False)
    return pipeline


@tasks.bind(namespace='demo', worker_name='noop_worker')
async def noop():
    pass


@tasks.bind()
async def count(results):
    return len(results)


@tasks.bind(with_context=True)
async def increment_counter(ctx):   
    try:
        ctx.set_state(int(ctx.get_state()) + 1)
    except (ValueError, TypeError):
        ctx.set_state(1)


@tasks.bind(with_context=True)
async def get_counter(ctx):   
    try:
        return int(ctx.get_state())
    except (ValueError, TypeError):
        return 0
