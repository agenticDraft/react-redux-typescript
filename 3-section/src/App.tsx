import Header from "./components/Header";
import CourseGoal from "./components/CourseGoal";
import goalsImg from "./assets/goals.jpg"

export default function App() {
  return (
    <main>
      <Header image={{ src: goalsImg, alt: 'A list of goals' }}>
        <h1>Your course goals</h1>
      </Header>
      <CourseGoal
        title="Lear React + TS"
        children="Learn it from the ground up"
      />
    </main>
  );
}
