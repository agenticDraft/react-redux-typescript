import { type FC, type ReactNode } from "react";

interface CourseGoalProps {
    title: string;
    children:ReactNode
}

// alternative to function in CourseGoal.tsx
const CourseGoal1: FC<CourseGoalProps> = ({title, children }) => {
    return (
        <article>
            <div>
                <h2>{title}</h2>
                {children}
            </div>
            <button>Delete</button>
        </article>
    );
}

export default CourseGoal1;