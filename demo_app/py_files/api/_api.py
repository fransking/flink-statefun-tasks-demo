from py_files import create_flink_client
from py_files.tasks import inline_task
from py_files.tasks import multiply
from py_files.tasks import divide
from py_files.tasks import sum_all
from py_files.tasks import fail
from py_files.tasks import sum_numbers
from py_files.tasks import flakey_multiply
from py_files.tasks import handle_error
from py_files.tasks import cleanup
from py_files.tasks import generate_series
from py_files.tasks import sum_all
from py_files.tasks import generate_random_numbers
from py_files.tasks import average
from py_files.tasks import increment_counter
from py_files.tasks import get_counter

from statefun_tasks import in_parallel
from statefun_tasks.client import TaskError
from aiohttp import web
import asyncio
import os
import json


api_routes = web.RouteTableDef()

flink = create_flink_client(
    kafka_broker_url=os.environ.get('KAFKA_URL', 'kafka:30092'),
    request_topic=os.environ.get('KAFKA_REQUEST_INGRESS_TOPIC', 'statefun.tasks.demo.requests'),
    action_topic=os.environ.get('KAFKA_ACTION_INGRESS_TOPIC', 'statefun.tasks.demo.actions'),
    reply_topic=os.environ.get('KAFKA_REPLY_TOPIC', 'statefun.tasks.demo.reply'),
)


async def _submit_and_return(pipeline, request, count=True):
    try:
        if 'id' in request.match_info:
            pipeline.id = request.match_info['id']

        result = await flink.submit_async(pipeline)
        return web.Response(text=json.dumps({'result': result}), content_type='application/json')
    
    except TaskError as e:
        errors = [error.split(',')[-1] for error in e.message.split('|')]
        return web.Response(text=json.dumps({'result': errors[0] if len(errors) == 1 else errors}), content_type='application/json')
    
    finally:
        if count:
            flink.submit(increment_counter.send().set(task_id='run_counter'))  # fire and forget future


@api_routes.post('/api/calling_a_task/{id}')
async def calling_a_task(request):
    pipeline = multiply.send(3, 2)
    return await _submit_and_return(pipeline, request)


@api_routes.post('/api/task_chaining/{id}')
async def task_chaining(request):
    pipeline = multiply.send(3, 2).continue_with(multiply, 10).continue_with(multiply, 2)
    return await _submit_and_return(pipeline, request)


@api_routes.post('/api/task_groups/{id}')
async def task_groups(request):
    pipeline = in_parallel([
        multiply.send(3, 2), 
        multiply.send(4, 2),
        multiply.send(5, 2)
    ])

    return await _submit_and_return(pipeline, request)


@api_routes.post('/api/task_groups_limited_concurrency/{id}')
async def task_groups_limited_concurrency(request):
    pipeline = in_parallel([
        multiply.send(3, 2), 
        multiply.send(4, 2),
        multiply.send(5, 2)
    ], max_parallelism=2)

    return await _submit_and_return(pipeline, request)


@api_routes.post('/api/task_chains_and_groups/{id}')
async def task_chains_and_groups(request):
    pipeline = in_parallel([
        multiply.send(3, 2), 
        multiply.send(3, 2).continue_with(multiply, 10).continue_with(multiply, 2),
        multiply.send(4, 2).continue_with(multiply, 10),
        multiply.send(5, 2)
    ]).continue_with(sum_all)

    return await _submit_and_return(pipeline, request)


@api_routes.post('/api/calling_a_task/{id}')
async def calling_a_task(request):
    pipeline = multiply.send(3, 2)
    return await _submit_and_return(pipeline, request)


@api_routes.post('/api/task_failure/{id}')
async def task_failure(request):
    pipeline = multiply.send(3, 2).continue_with(fail, error_message="An error occurred") \
        .continue_with(multiply, 10)
    
    return await _submit_and_return(pipeline, request)


@api_routes.post('/api/task_failure_within_group/{id}')
async def task_failure_within_group(request):
    pipeline = in_parallel([
        multiply.send(3, 2), 
        fail.send(error_message="An error occurred"),
        fail.send(error_message="Another error occurred"),
        multiply.send(5, 2)
    ], max_parallelism=2).continue_with(sum_all)
    
    return await _submit_and_return(pipeline, request)


@api_routes.post('/api/task_failure_within_group_return_exceptions/{id}')
async def task_failure_within_group_return_exceptions(request):
    pipeline = in_parallel([
        multiply.send(3, 2), 
        fail.send(error_message="An error occurred"),
        fail.send(error_message="Another error occurred"),
        multiply.send(5, 2)
    ], max_parallelism=2, return_exceptions=True).continue_with(sum_numbers)
    
    return await _submit_and_return(pipeline, request)


@api_routes.post('/api/task_failure_with_retry/{id}')
async def task_failure_with_retry(request):
    pipeline = multiply.send(3, 2) \
        .continue_with(flakey_multiply, 5) \
        .continue_with(multiply, 10)
    
    return await _submit_and_return(pipeline, request)


@api_routes.post('/api/task_failure_with_exceptionally/{id}')
async def task_failure_with_retry(request):
    pipeline = multiply.send(3, 2) \
        .continue_with(divide, 0) \
        .continue_with(multiply, 2) \
        .exceptionally(handle_error, return_value=6) \
        .continue_with(multiply, 2)
    
    return await _submit_and_return(pipeline, request)


@api_routes.post('/api/task_failure_with_finally/{id}')
async def task_failure_with_finally(request):
    pipeline = multiply.send(3, 2) \
    .continue_with(fail, error_message="An error occurred") \
    .continue_with(multiply, 10) \
    .finally_do(cleanup)

    return await _submit_and_return(pipeline, request)


@api_routes.post('/api/task_pause_and_resume/{id}')
async def task_failure_with_finally(request):
    pipeline = multiply.send(3, 2).wait().continue_with(multiply, 5).continue_with(multiply, 10)

    future = asyncio.ensure_future(_submit_and_return(pipeline, request))
    await asyncio.sleep(3)
    await flink.unpause_pipeline_async(pipeline)

    return await future


@api_routes.post('/api/nested_workflows/{id}')
async def nested_workflows(request):
    pipeline = multiply.send(1, 2).continue_with(generate_series, 2, 4).continue_with(sum_all)
    return await _submit_and_return(pipeline, request)


@api_routes.post('/api/inline_tasks/{id}')
async def inline_tasks(request):

    @inline_task(worker_name='restricted_worker')
    def add(a, b):
        return a + b
    
    pipeline = add.send(1, 2)
    return await _submit_and_return(pipeline, request)


@api_routes.post('/api/large_workflows/{id}')
async def large_workflows(request):
    pipeline = generate_random_numbers.send(10000).continue_with(average)
    return await _submit_and_return(pipeline, request)


@api_routes.post('/api/large_workflows_num_stage/{id}')
async def large_workflows(request):
    pipeline = generate_random_numbers.send(20000, num_stages=2).continue_with(average)
    return await _submit_and_return(pipeline, request)


@api_routes.get('/api/run_count')
async def run_count(request):
    pipeline = get_counter.send().set(task_id='run_counter')
    return await _submit_and_return(pipeline, request, count=False)
