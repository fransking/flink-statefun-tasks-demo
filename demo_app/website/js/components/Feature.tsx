import React, { useEffect, ReactNode } from 'react';
import { useSelector, useDispatch } from 'react-redux'
import { runWorkflow, resetWorkflow, onTaskEvent } from '../modules/system/workflowsSlice'
import type { RootState } from '../modules/reducers'
import subComponents from '../utils/subComponents';
import { wsSubscribe } from '../utils/webSockets'
import Workflow from './Workflow';

interface FeatureProps {
    children: ReactNode;
    title: string;
    video?: string;
}

interface ShowcaseProps {
    id: string;
    api: string;
    template: unknown[];
    hr?: boolean;
    showIndividualNestedTasks?: boolean;
    buffered?: boolean;
    hideNestedPipelines?: boolean;
}

const Feature = ({children, title, video}: FeatureProps) => {
    const [blurb, code, showcase] = subComponents(children, [Feature.Blurb, Feature.Code, Feature.Showcase])

    return (
        <div className="container col-xxl-10 px-4 py-3">
            <div className="row flex-lg-row align-items-top g-5 py-3">
                <div className="col-lg-6">
                <h1 className="display-5 fw-bold lh-1 mb-3"><section id={title}>{title}</section></h1>
                {blurb}
                </div>
                <div className="d-flex flex-column px-3 col-lg-6 px-4">{code}</div>
                {showcase}
            </div>

            {video && 
                <div className="ratio ratio-16x9">
                    <video controls crossOrigin="anonymous" preload="metadata">
                        <source src={video} type="video/mp4" />
                    </video>
                </div>
            }
        </div>
    );
};

Feature.Code = ({children}: {children: ReactNode}) => <code><pre>{children}</pre></code>
Feature.Blurb = ({children}: {children: ReactNode}) => <p className="lead">{children}</p>

Feature.Showcase = ({id, api, template, hr=true, showIndividualNestedTasks=true, buffered=false, hideNestedPipelines=false}: ShowcaseProps) => {
    const dispatch = useDispatch()
    const subscriptions = useSelector((state: RootState) => state.workflows.subscriptions)
    const pipelines = useSelector((state: RootState) => state.workflows.pipelines)
    const nestedPipelines = useSelector((state: RootState) => state.workflows.nestedPipelines)
    const isRunning = useSelector((state: RootState) => state.workflows.isRunning)
    const results = useSelector((state: RootState) => state.workflows.results)

    useEffect(() => {
        wsSubscribe(dispatch, 'task_events.' + id, onTaskEvent, buffered)
    }, []);

    const disabled = isRunning || ('task_events.' + id in subscriptions) == false

    return (
        <div>
            
            <div className="d-grid gap-2 py-2 d-md-flex justify-content-md-start">
                <button type="button" className="btn btn-primary btn px-4" disabled={disabled} onClick={() => dispatch(runWorkflow({api, id}))}>Try it</button>
                <button type="button" className="btn btn-outline-secondary btn px-4" disabled={isRunning} onClick={() => dispatch(resetWorkflow(id))}>Reset</button>
            </div>

            {hr && <hr></hr>}
            {!hr && <br></br>}

            <Workflow template={template} items={pipelines[id]} result={results[id]} />

            {
                !hideNestedPipelines && nestedPipelines[id] && nestedPipelines[id].map((pipeline, index) => (   
                    <Workflow key={index} items={pipeline} isNested={true} showIndividualTasks={showIndividualNestedTasks} />
                )
            )}
        </div>
    );
};

export default Feature
