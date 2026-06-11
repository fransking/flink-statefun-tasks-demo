import React, { useEffect, useRef, useState, ReactNode } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { runWorkflow, resetWorkflow, onTaskEvent } from '../modules/system/workflowsSlice';
import type { RootState } from '../modules/reducers';
import subComponents from '../utils/subComponents';
import { wsSubscribe } from '../utils/webSockets';
import Workflow from './Workflow';
import Prism from 'prismjs';
import 'prismjs/components/prism-python';

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

const VideoPlayer = ({ src }: { src: string }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const hideTimeout = useRef<ReturnType<typeof setTimeout>>(undefined);
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [showControls, setShowControls] = useState(true);

    const togglePlay = () => {
        const video = videoRef.current;
        if (!video) return;
        if (video.paused) {
            video.play();
        } else {
            video.pause();
        }
    };

    const handleTimeUpdate = () => {
        const video = videoRef.current;
        if (video && video.duration) {
            setProgress((video.currentTime / video.duration) * 100);
        }
    };

    const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
        const video = videoRef.current;
        if (!video || !video.duration) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const pct = Math.max(0, Math.min((e.clientX - rect.left) / rect.width, 1));
        video.currentTime = pct * video.duration;
    };

    const toggleFullscreen = () => {
        const container = containerRef.current;
        if (!container) return;
        if (document.fullscreenElement) {
            document.exitFullscreen();
        } else {
            container.requestFullscreen();
        }
    };

    const handleMouseMove = () => {
        setShowControls(true);
        clearTimeout(hideTimeout.current);
        if (isPlaying) {
            hideTimeout.current = setTimeout(() => setShowControls(false), 2500);
        }
    };

    return (
        <div className="video-player" ref={containerRef}
             onMouseMove={handleMouseMove}
             onMouseLeave={() => isPlaying && setShowControls(false)}>
            <video
                ref={videoRef}
                crossOrigin="anonymous"
                preload="metadata"
                onTimeUpdate={handleTimeUpdate}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onEnded={() => { setIsPlaying(false); setProgress(0); }}
                onClick={togglePlay}
            >
                <source src={src} type="video/mp4" />
            </video>

            {!isPlaying && (
                <div className="video-player__overlay" onClick={togglePlay}>
                    <i className="bi bi-play-circle-fill video-player__play-icon"></i>
                </div>
            )}

            <div className={`video-player__controls ${showControls ? 'video-player__controls--visible' : ''}`}>
                <button onClick={togglePlay} className="video-player__btn" aria-label={isPlaying ? 'Pause' : 'Play'}>
                    <i className={`bi ${isPlaying ? 'bi-pause-fill' : 'bi-play-fill'}`}></i>
                </button>
                <div className="video-player__progress" onClick={handleProgressClick}>
                    <div className="video-player__progress-bar" style={{ width: `${progress}%` }}></div>
                </div>
                <button onClick={toggleFullscreen} className="video-player__btn" aria-label="Fullscreen">
                    <i className="bi bi-fullscreen"></i>
                </button>
            </div>
        </div>
    );
};

const Feature = ({children, title, video}: FeatureProps) => {
    const [blurb, code, showcase] = subComponents(children, [Feature.Blurb, Feature.Code, Feature.Showcase])

    return (
        <div className="container col-xxl-10 px-3 px-md-4 py-3">
            <div className="row flex-lg-row align-items-top g-4 py-3">
                <div className="col-lg-6">
                    <h2 className="fw-bold lh-1 mb-3"><section id={title}>{title}</section></h2>
                    {blurb}
                </div>
                <div className="col-lg-6">{code}</div>
                {showcase}
            </div>

            {video && <VideoPlayer src={video} />}
        </div>
    );
};

const CodeBlock = ({children}: {children: ReactNode}) => {
    const code = String(children).trim();
    const highlighted = Prism.highlight(code, Prism.languages.python, 'python');

    return (
        <div className="code-block">
            <pre><code className="language-python" dangerouslySetInnerHTML={{ __html: highlighted }} /></pre>
        </div>
    );
};

Feature.Code = CodeBlock;
Feature.Blurb = ({children}: {children: ReactNode}) => <p className="lead">{children}</p>;

Feature.Showcase = ({id, api, template, hr=true, showIndividualNestedTasks=true, buffered=false, hideNestedPipelines=false}: ShowcaseProps) => {
    const dispatch = useDispatch();
    const subscriptions = useSelector((state: RootState) => state.workflows.subscriptions);
    const pipelines = useSelector((state: RootState) => state.workflows.pipelines);
    const nestedPipelines = useSelector((state: RootState) => state.workflows.nestedPipelines);
    const isRunning = useSelector((state: RootState) => state.workflows.isRunning);
    const results = useSelector((state: RootState) => state.workflows.results);

    useEffect(() => {
        wsSubscribe(dispatch, 'task_events.' + id, onTaskEvent, buffered);
    }, []);

    const disabled = isRunning || ('task_events.' + id in subscriptions) === false;

    return (
        <div className="col-12">
            <div className="d-grid gap-2 py-2 d-sm-flex">
                <button type="button" className="btn btn-primary px-4" disabled={disabled} onClick={() => dispatch(runWorkflow({api, id}))}>Try it</button>
                <button type="button" className="btn btn-outline-secondary px-4" disabled={isRunning} onClick={() => dispatch(resetWorkflow(id))}>Reset</button>
            </div>

            {hr && <hr />}
            {!hr && <br />}

            <Workflow template={template} items={pipelines[id]} result={results[id]} />

            {!hideNestedPipelines && nestedPipelines[id] && nestedPipelines[id].map((pipeline, index) => (
                <Workflow key={index} items={pipeline} isNested={true} showIndividualTasks={showIndividualNestedTasks} />
            ))}
        </div>
    );
};

export default Feature;
