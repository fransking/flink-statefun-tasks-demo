import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux'
import { getWorkflowRunCount } from '../modules/system/workflowsSlice'

import Headline from './features/00_headline'
import Worker from './features/01_worker'
import Client from './features/02_client'
import CreatingTasks from './features/03_creating_tasks'
import CallingTasks from './features/04_calling_tasks'
import TaskChaining from './features/05_task_chaining'
import TaskGroups from './features/06_task_groups'
import LimitingConcurrency from './features/07_limiting_concurrency'
import TaskChainsAndGroups from './features/08_task_chains_and_groups'
import TaskFailures from './features/09_task_failures'
import TaskRetry from './features/10_task_retry'
import Exceptionally from './features/11_exceptionally'
import CleanupWithFinally from './features/12_cleanup_with_finally'
import FlowControl from './features/13_flow_control'
import NestedWorkflows from './features/14_nested_workflows'
import InlineTasks from './features/15_inline_tasks'
import LargeWorkflows from './features/16_large_workflows'
import LargeWorkflowsNumStages from './features/17_large_workflows_num_stages'
import LargerWorkflows from './features/18_larger_workflows'

export default function Layout() {

  const dispatch = useDispatch()
  const runCount = useSelector(state => state.workflows.runCount)

  useEffect(() => {
    dispatch(getWorkflowRunCount())
    document.getElementById(decodeURI(window.location.hash?.slice(1)))?.scrollIntoView()
  }, []);


  const runCountVisibility = runCount === '' ? "invisible" : "visible"

  return (
      <div className="d-flex flex-column min-vh-100">
        <main className="flex-shrink-0">
            <div className="px-4 py-2 my-5 text-center">
              <h1 className="display-5 fw-bold">Stateful Tasks and Workflows on Apache Flink</h1>
              <div className="col-lg-6 mx-auto">
                <p className="lead mb-4">Write simple Python functions and deploy them as stateful tasks that can be chained together into workflows, making full use of Flink's state management, orchestration and fault tolerance.</p>
                <div className="d-grid gap-2 d-sm-flex justify-content-sm-center">
                  <a href="https://github.com/fransking/flink-statefun-tasks" target="_blank" className="btn btn-primary btn-lg px-4">View on Github</a>
                  <a href="https://fransking.github.io/flink-statefun-tasks/" target="_blank" className="btn btn-outline-secondary btn-lg px-4">Read the docs</a>
                  <a href="https://github.com/fransking/flink-statefun-tasks-demo" target="_blank" className="btn btn-outline-secondary btn-lg px-4">Get the demo</a>
                </div>
              </div>
            </div>

            <div className="text-center">
              <small className={runCountVisibility + " d-inline-flex mb-3 px-2 py-1 fw-semibold text-secondary bg-secondary bg-opacity-10 border border-secondary border-opacity-10 rounded-2"}>{runCount} workflows run so far</small>
            </div>

            <Headline />
            <Worker />
            <Client />
            <CreatingTasks />
            <CallingTasks />
            <TaskChaining />
            <TaskGroups />
            <LimitingConcurrency />
            <TaskChainsAndGroups />
            <TaskFailures />
            <TaskRetry />
            <Exceptionally />
            <CleanupWithFinally />
            <FlowControl />
            <NestedWorkflows />
            <InlineTasks />
            <LargeWorkflows />
            <LargeWorkflowsNumStages />
            <LargerWorkflows />
            
        </main>
        <footer className="footer mt-auto py-3 bg-light">
              <div className="container">
              </div>
        </footer>
      </div>
  );
};