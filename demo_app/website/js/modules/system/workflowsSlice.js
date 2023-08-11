import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import { getBaseUrl } from "../../utils/urlUtils";
import axios from 'axios';
import { groupBy } from "../../utils/groupBy";


export const getWorkflowRunCount = createAsyncThunk('getWorkflowRunCount', async () => {
    return axios.get(getBaseUrl() + "/api/run_count").then(response => {
        return {
            data: response.data
        }
    })
})

export const runWorkflow = createAsyncThunk('runWorkflow', async (data, thunkAPI) => {
    const {api, id} = data
    return axios.post(getBaseUrl() + api + id).then(response => {
        thunkAPI.dispatch(getWorkflowRunCount());

        return {
            id: id,
            data: response.data
        }
    })
})

const markTaskStatus = (task_id, status, pipeline) => {
    if (!pipeline) {
        return
    }

    pipeline.forEach(taskOrGroup => {
        if (taskOrGroup.type === 'group') {
            
            taskOrGroup.tasks.forEach(chain => {
                markTaskStatus(task_id, status, chain)
            })

        } else if (taskOrGroup.type === 'task' && taskOrGroup.id === task_id) {
            taskOrGroup['status'] = status
        }
    })
} 

const markTaskStatuses = (statuses, pipeline) => {
    if (!pipeline) {
        return
    }

    pipeline.forEach(taskOrGroup => {
        if (taskOrGroup.type === 'group') {
            
            taskOrGroup.tasks.forEach(chain => {
                markTaskStatuses(statuses, chain)
            })

        } else if (taskOrGroup.type === 'task' && taskOrGroup.id in statuses) {
            taskOrGroup['status'] = statuses[taskOrGroup.id].status
        }
    })
} 

const markAllPendingTaskStatuses = (status, pipeline) => {
    if (!pipeline) {
        return
    }

    pipeline.forEach(taskOrGroup => {
        if (taskOrGroup.type === 'group') {
            
            taskOrGroup.tasks.forEach(chain => {
                markAllPendingTaskStatuses(status, chain)
            })

        } else if (taskOrGroup.type === 'task') {
            const currentStatus = taskOrGroup['status']

            if (!['COMPLETED', 'FAILED', 'SKIPPED'].includes(currentStatus)) {
                taskOrGroup['status'] = status
            } 
        }
    })
} 

const workflowsSlice = createSlice({
    name: 'workflows',
    initialState: {
        runCount: '',
        isRunning: false,
        subscriptions: {},
        pipelines: {},
        nestedPipelines: {},
        results: {},
        status: {}
    },
    reducers: {
        onTaskEvent(state, action) {
            switch (action.payload.type) {
                case 'WS_SUBSCRIBED': {
                    state.subscriptions[action.payload.topic] = true
                    break;
                }
                case 'WS_UNSUBSCRIBED': {
                    delete state.subscriptions[action.payload.topic]
                    break;
                }
                case 'PIPELINE_CREATED': {
                    if (action.payload.root_pipeline_id === action.payload.pipeline_id) {
                        // root pipeline
                        state.pipelines[action.payload.root_pipeline_id] = action.payload.data
                    }
                    else {
                        // nested pipeline
                        const nestedPipelines = state.nestedPipelines[action.payload.root_pipeline_id] || []
                        nestedPipelines.push(action.payload.data)                        
                        state.nestedPipelines[action.payload.root_pipeline_id] = nestedPipelines
                    }
                    break;
                }
                case 'TASK_FINISHED': {
                    const pipeline = state.pipelines[action.payload.root_pipeline_id]
                    const nestedPipelines = state.nestedPipelines[action.payload.root_pipeline_id] || []
                    const pipelines = [pipeline].concat(nestedPipelines)
                    
                    pipelines.forEach(p => markTaskStatus(action.payload.task_id, action.payload.status, p))
                    
                    break;
                }
                case 'TASK_FINISHED_BATCH': {
                    const grouped = groupBy('root_pipeline_id', action.payload.items)
                    
                    Object.keys(grouped).forEach(pipelineId => {
                        const pipeline = state.pipelines[pipelineId]
                        const nestedPipelines = state.nestedPipelines[pipelineId] || []
                        const pipelines = [pipeline].concat(nestedPipelines)
                        const statuses = grouped[pipelineId].reduce((acc, curr) =>(acc[curr['task_id']] = curr, acc), {});

                        pipelines.forEach(p => markTaskStatuses(statuses, p))
                    });

                    break;
                }
                case 'TASK_SKIPPED': {
                    const pipeline = state.pipelines[action.payload.root_pipeline_id]
                    const nestedPipelines = state.nestedPipelines[action.payload.root_pipeline_id] || []
                    const pipelines = [pipeline].concat(nestedPipelines)

                    pipelines.forEach(p => markTaskStatus(action.payload.task_id, 'SKIPPED', p))
                    break;
                }
                case 'PIPELINE_STATUS': {
                    if (action.payload.status === 'PAUSED' || action.payload.status === 'RUNNING') {
                        const pipeline = state.pipelines[action.payload.pipeline_id]
                        markAllPendingTaskStatuses(action.payload.status, pipeline)
                    }
                    break
                }
            }            
        },
        resetWorkflow(state, action) {
            state.pipelines[action.payload] = []
            state.nestedPipelines[action.payload] = []
            state.results[action.payload] = null
            state.status[action.payload] = null
        }
    },
    extraReducers: (builder) => {
        builder.addCase(runWorkflow.pending, (state, action) => {
        
            state.pipelines[action.meta.arg.id] = []
            state.nestedPipelines[action.meta.arg.id] = []
            state.results[action.meta.arg.id] = null
            state.status[action.payload] = null

            state.isRunning = true
        })

        builder.addCase(runWorkflow.fulfilled, (state, action) => {
            state.isRunning = false
            state.results[action.payload.id] = action.payload.data
        })

        builder.addCase(runWorkflow.rejected, (state, action) => {
            state.isRunning = false
        })

        builder.addCase(getWorkflowRunCount.fulfilled, (state, action) => {
            state.runCount = action.payload.data.result
        })
    },
})


export const { onTaskEvent, resetWorkflow } = workflowsSlice.actions
export default workflowsSlice.reducer
