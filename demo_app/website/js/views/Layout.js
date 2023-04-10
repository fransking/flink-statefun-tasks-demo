import React, { useEffect } from 'react';

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


export default function Layout() {

  useEffect(() => {
    document.getElementById(decodeURI(window.location.hash?.slice(1)))?.scrollIntoView()
  }, []);

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
            
        </main>
        <footer className="footer mt-auto py-3 bg-light">
              <div className="container">
              </div>
        </footer>
      </div>
  );
};