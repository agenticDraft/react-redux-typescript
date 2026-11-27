import { type FormEvent, useRef } from "react";

type NewGoalProps = {
    onAddGoal: (goal: string, summary: string) => void;
}

export default function NewGoal({onAddGoal}: NewGoalProps) {
    // Kad koristimo typescript moramo staviti null za default vrednost useRef(null)
    const goal = useRef<HTMLInputElement>(null);
    const summary = useRef<HTMLInputElement>(null);

    function handleSubmit(event: FormEvent<HTMLFormElement>) { //types defined in:  "lib": ["ES2020", "DOM", "DOM.Iterable"], from tsconfig.json
        event.preventDefault();

        // new FormData(event.currentTarget); // will get all input values in the form, by name, for example name="goal"
        // Here instead, we will use REFS

        // goal.current! ovo znaci da vrendons koja dolazi iz refa nikad nece biti NULL, ako bude, app ce puci
        const enteredGoal = goal.current!.value;
        const enteredSummary = summary.current!.value;

        event.currentTarget.reset();// reset the input's
        onAddGoal(enteredGoal, enteredSummary);
    }



    return (
        <form onSubmit={handleSubmit}>
            <p>
                <label htmlFor="goal">Your goal</label>
                <input id="goal" type="text" ref={goal} />
            </p>
            <p>
                <label htmlFor="summary">Short summary</label>
                <input id="summary" type="text" ref={summary} />
            </p>
            <p>
                <button>Add goal</button>
            </p>
        </form>
    )
}