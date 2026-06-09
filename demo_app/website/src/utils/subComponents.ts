import { Children, ReactNode, ComponentType } from 'react';

export default function subComponents (children: ReactNode, items: ComponentType[]) {
    return items.map((type) => {
        return Children.map(children, (child) => {
            return (child as React.ReactElement)?.type === type ? child : null
        })
    });
}