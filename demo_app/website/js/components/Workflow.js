import { all } from 'axios';
import React from 'react';

const TaskChain = ({items, isNested = false}) => {

    const tableRows = items.map((item, index) => {
        const rows = []
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
            const group_rows = []

            item.tasks.forEach((chain, index) => {
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

const TaskChainProgress = ({items}) => {
    var allTasks = []
    items.forEach(item => getTasks(item, allTasks));

    var total = allTasks.length
    var completed = allTasks.filter(i => i.status === 'COMPLETED').length
    var pctComplete = Math.floor((completed / total) * 100)

    return (
        <div className="progress" role="progressbar" aria-valuenow={pctComplete} aria-valuemin="0" aria-valuemax="100">
            <div className={"progress-bar"} style={{width: pctComplete + "%"}} >
                {completed}
            </div>
        </div>
    )
}

const getTasks = (taskOrGroup, allTasks) => {
    if (taskOrGroup.type === 'task') {
        allTasks.push(taskOrGroup)
    } else if (taskOrGroup.type === 'group') {
        taskOrGroup.tasks.forEach(workflow => {
            workflow.forEach(item => getTasks(item, allTasks))
        })
    }
};

const makeItems = (template, container) => {
    if (container === undefined) {
        container = []
    }

    template.forEach(item => {
        if (typeof item !== 'object') {
            container.push({'type': 'task', 'id': item})
        } else {
            const id = Object.keys(item)[0]
            const group = {'type': 'group', 'id': id, 'tasks': []}

            item[id].forEach(chain => {
                const groupContainer = []
                makeItems(chain, groupContainer)
                group.tasks.push(groupContainer)
            })

            container.push(group)
        }
    })

    return container
}


const formatResult = (result) => result ? JSON.stringify(result.result, null, 2).replaceAll("\"", "") : ""


const Workflow = ({items = [], template = [], result = null, isNested = false, showIndividualTasks = true}) => {
    if (items.length === 0) {
        items = makeItems(template)
    }

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

                    {!showIndividualTasks && (
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
