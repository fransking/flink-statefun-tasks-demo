import React from 'react';
// import { useSelector, useDispatch } from 'react-redux'
// import { getConfiguration } from '../modules/system/systemSlice'
import subComponents from '../utils/subComponents';

const Feature = ({children, title, actions}) => {
    // const config = useSelector(state => state.system.config)
    // const value = useSelector(state => state.system.value)
    // const dispatch = useDispatch()

    const [blurb, code] = subComponents(children, [Feature.Blurb, Feature.Code])

    return (
        <div className="container col-xxl-8 px-4 py-5">
            <div className="row flex-lg-row-reverse align-items-center g-5 py-5">
                <div className="col-10 col-sm-8 col-lg-6">{code}</div>
                <div className="col-lg-6">
                <h1 className="display-5 fw-bold lh-1 mb-3">{title}</h1>
                {blurb}
                </div>
                {actions && 
                    <div className="d-grid gap-2 d-md-flex justify-content-md-start">
                        <button type="button" class="btn btn-outline-primary btn-lg px-4">Try it</button>
                    </div>
                    }
            </div>
        </div>
    );
};

Feature.Code = ({children}) => <code><pre>{children}</pre></code>
Feature.Blurb = ({children}) => <p className="lead">{children}</p>

export default Feature
