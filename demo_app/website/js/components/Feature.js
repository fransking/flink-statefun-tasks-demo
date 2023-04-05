import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux'
import { runWorkflow, resetWorkflow, onTaskEvent } from '../modules/system/workflowsSlice'
import subComponents from '../utils/subComponents';
import { wsSubscribe } from '../utils/webSockets'
import Workflow from './Workflow';

const Feature = ({children, title}) => {
    const [blurb, code, showcase] = subComponents(children, [Feature.Blurb, Feature.Code, Feature.Showcase])

    return (
        <div className="container col-xxl-8 px-4 py-5">
            <div className="row flex-lg-row align-items-center g-5 py-5">
                <div className="col-lg-6">
                <h1 className="display-5 fw-bold lh-1 mb-3">{title}</h1>
                {blurb}
                </div>
                <div className="col-10 col-sm-8 col-lg-6">{code}</div>
                {showcase}
            </div>
        </div>
    );
};

Feature.Code = ({children}) => <code><pre>{children}</pre></code>
Feature.Blurb = ({children}) => <p className="lead">{children}</p>

Feature.Showcase = ({id, api, template}) => {
    const dispatch = useDispatch()
    const pipelines = useSelector(state => state.workflows.pipelines)
    const isRunning = useSelector(state => state.workflows.isRunning)
    const results = useSelector(state => state.workflows.results)

    useEffect(() => {
        wsSubscribe(dispatch, 'task_events.' + id, onTaskEvent)
    }, []);

    return (
        <div>
            <hr></hr>
            <div className="d-grid gap-2 d-md-flex justify-content-md-start">
                <button type="button" className="btn btn-primary btn px-4" disabled={isRunning} onClick={() => dispatch(runWorkflow({api, id}))}>Try it</button>
                <button type="button" className="btn btn-outline-secondary btn px-4" disabled={isRunning} onClick={() => dispatch(resetWorkflow(id))}>Reset</button>
            </div>

            <Workflow template={template} items={pipelines[id]} result={results[id]} />
        </div>
    );
};

export default Feature
