import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux'
import { runWorkflow, resetWorkflow, onTaskEvent } from '../modules/system/workflowsSlice'
import subComponents from '../utils/subComponents';
import { wsSubscribe } from '../utils/webSockets'
import Workflow from './Workflow';

const Feature = ({children, title, video}) => {
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
                    <video controls crossrigin="anonymous" preload="metadata">
                        <source src={video} type="video/mp4" />
                    </video>
                </div>
            }
        </div>
    );
};

Feature.Code = ({children}) => <code><pre>{children}</pre></code>
Feature.Blurb = ({children}) => <p className="lead">{children}</p>

Feature.Showcase = ({id, api, template, hr=true}) => {
    const dispatch = useDispatch()
    const subscriptions = useSelector(state => state.workflows.subscriptions)
    const pipelines = useSelector(state => state.workflows.pipelines)
    const nestedPipelines = useSelector(state => state.workflows.nestedPipelines)
    const isRunning = useSelector(state => state.workflows.isRunning)
    const results = useSelector(state => state.workflows.results)

    useEffect(() => {
        wsSubscribe(dispatch, 'task_events.' + id, onTaskEvent)
    }, []);

    const disabled = isRunning || 'task_events.' + id in subscriptions == false

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
                nestedPipelines[id] && nestedPipelines[id].map((pipeline, index) => (   
                    <Workflow key={index} items={pipeline} isNested={true} />
                )
            )}
        </div>
    );
};

export default Feature
