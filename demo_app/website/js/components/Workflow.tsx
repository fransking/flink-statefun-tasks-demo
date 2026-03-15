import React, { ReactElement } from 'react';

interface TaskItem {
    type: 'task' | 'group';
    id: string;
    status?: string;
    tasks?: TaskItem[][];
}

interface TaskChainProps {
    items: TaskItem[];
    isNested?: boolean;
}

const TaskChain = ({items, isNested = false}: TaskChainProps) => {

    const tableRows = items.map((item, index) => {
        const rows: ReactElement[] = []
        const icon = (isNested) ? "circle" : "square"

        if (item.type === 'task') {

            switch (item.status) {
                case "COMPLETED": {
                    rows.push((<td key={item.id}><i className={"demo-task demo-task--success bi bi-check-" + icon}></i></td>))
                    break;
                }

                case "FAILED": {
                    rows.push((<td key={item.id}><i className={"demo-task demo-task demo-task--failed bi bi-exclamation-" + icon}></i></td>))
                    break;
                }

                case "PAUSED": {
                    rows.push((<td key={item.id}><i className={"demo-task demo-task bi bi-dash-" + icon + "-dotted"}></i></td>))
                    break;
                }

                default: {
                    rows.push((<td key={item.id}><i className={"demo-task demo-task bi bi-dash-" + icon}></i></td>))
                    break;
                }
            }

            if (index !== items.length -1) {
                rows.push((<td key={item.id + "_arrow"}><i className="demo-arrow bi bi-chevron-right"></i></td>))
            }
        }
        else if (item.type === 'group') {
            const group_rows: ReactElement[] = []

            item.tasks!.forEach((chain, index) => {
                group_rows.push((<TaskChain key={item.id + '_' + index} items={chain} isNested={isNested} />))
            })

            rows.push((<td key={item.id}>{group_rows}</td>))

            if (index !== items.length -1) {
                rows.push((<td key={item.id + "_arrow"}><i className="demo-arrow bi bi-chevron-right"></i></td>))
            }
        }

        return rows;
    });

    return (
        <table>
            <tbody>
                <tr>{tableRows}</tr>
            </tbody>
        </table>
    )
}

const TaskChainProgress = ({items}: {items: TaskItem[]}) => {
    const allTasks: TaskItem[] = []
    items.forEach(item => getTasks(item, allTasks));

    const total = allTasks.length
    const completed = allTasks.filter(i => i.status === 'COMPLETED').length
    const pctComplete = Math.floor((completed / total) * 100)

    return (
        <div className="progress" role="progressbar" aria-valuenow={pctComplete} aria-valuemin={0} aria-valuemax={100}>
            <div className={"progress-bar"} style={{width: pctComplete + "%"}} >
                {completed}
            </div>
        </div>
    )
}

const getTasks = (taskOrGroup: TaskItem, allTasks: TaskItem[]) => {
    if (taskOrGroup.type === 'task') {
        allTasks.push(taskOrGroup)
    } else if (taskOrGroup.type === 'group') {
        taskOrGroup.tasks!.forEach(workflow => {
            workflow.forEach(item => getTasks(item, allTasks))
        })
    }
};

const makeItems = (template: unknown[], container?: TaskItem[]): TaskItem[] => {
    if (container === undefined) {
        container = []
    }

    template.forEach((item: unknown) => {
        if (typeof item !== 'object') {
            container!.push({'type': 'task', 'id': String(item)})
        } else {
            const record = item as Record<string, unknown[][]>
            const id = Object.keys(record)[0]
            const group: TaskItem = {'type': 'group', 'id': id, 'tasks': []}

            record[id].forEach(chain => {
                const groupContainer: TaskItem[] = []
                makeItems(chain, groupContainer)
                group.tasks!.push(groupContainer)
            })

            container!.push(group)
        }
    })

    return container
}


const formatResult = (result: { result: unknown } | null) => result ? JSON.stringify(result.result, null, 2).replaceAll("\"", "") : ""

interface WorkflowProps {
    items?: TaskItem[];
    template?: unknown[];
    result?: { result: unknown } | null;
    isNested?: boolean;
    showIndividualTasks?: boolean;
}

const Workflow = ({items: itemsProp = [], template = [], result = null, isNested = false, showIndividualTasks = true}: WorkflowProps) => {
    const items = itemsProp.length === 0 ? makeItems(template) : itemsProp

    return (
        <div className="container px-0 py-2 table-responsive">
            <table>
                <tbody>
                    {showIndividualTasks && (
                        <tr>
                            <td><i className="demo-arrow demo-arrow--lg bi bi-chevron-right"></i></td>
                            <td><TaskChain items={items} isNested={isNested} /></td>
                            <td><i className="demo-arrow demo-arrow--lg bi bi-chevron-right"></i></td>
                            <td><p className="demo-result">{formatResult(result)}</p></td>
                        </tr>
                    )}

                    {!showIndividualTasks && items.length === 1 && (
                        <tr>
                            <td className="w-100"><TaskChainProgress items={items} /></td>
                            <td><p className="demo-result">{formatResult(result)}</p></td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default Workflow
