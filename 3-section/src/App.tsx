import { useState } from "react";
import Header from "./components/Header";
import CourseGoalList from "./components/CourseGoalList";
import goalsImg from "./assets/goals.jpg"
import NewGoal from "./components/NewGoal";

export interface CourseGoalType {
    title: string;
    description: string;
    id: number;
}
  
export default function App() {
  const [goals, setGoals] = useState<CourseGoalType[]>([]);

  function handleAddGoal(goal:string, summary:string) {
    setGoals((prevGoals) => {
      const newGoal: CourseGoalType = {
        id: Math.random(),
        title: goal,
        description: summary
      }
      return [...prevGoals, newGoal];
    });
  }

  function handleDeleteGoal(id:number) {
    setGoals(prevGoals => prevGoals.filter((goal) => goal.id !== id));
  }

  return (
    <main>
      <Header image={{ src: goalsImg, alt: 'A list of goals' }}>
        <h1>Your course goals</h1>
      </Header>
      <NewGoal onAddGoal={handleAddGoal}/>
      <CourseGoalList goals={goals} onDeleteGoal={handleDeleteGoal}/>
    </main>
  );
}
