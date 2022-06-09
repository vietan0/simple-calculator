import {useState} from "react";

export default function App() {
	const [state, setState] = useState("0");
	const [ans, setAns] = useState("");
	const [lastKey, setLastKey] = useState("");

	function add(key) {
		setState(prev => prev + key);
		setLastKey(key);
	}
	function replace(key) {
		setState(key);
		setLastKey(key);
	}
	function replaceLastKey(key) {
		setState(prev => prev.slice(0, -1) + key);
		setLastKey(key);
	}
	function calculate() {
		setLastKey("=");

		// * 1. Split str into array of numbers & signs
		// make a local copy, replace with traditional signs, trim whitespaces
		// consecutive minus "-" is sticked to next string: "+-3" => [+, -3]
		let str = state.slice().replaceAll("×", "*").replaceAll("÷", "/").replaceAll(" ", "");

		// split between <signs that don't follow another sign>.
		let numbers = str.split(/(?<![+\-*/])[+\-*/]/).map(n => Number(n));
		let signs = str.match(/(?<![+\-*/])[+\-*/]/g);
		let mixed = [];
		for (let i = 0; i < numbers.length; i++) {
			mixed.push(numbers[i]);
			if (signs && i < signs.length) mixed.push(signs[i]);
		}

		// convert every "-5" to "+ (-5)"
		for (let i = 0; i < mixed.length - 1; i++) {
			if (mixed[i] === "-") {
				mixed[i] = "+";
				mixed[i + 1] *= -1;
			}
		}

		// * 2. Multiply & divide first
		while (mixed.some(n => n === "*" || n === "/")) {
			// replace every 6 / 3 with 2
			for (let i = 0; i < mixed.length; i++) {
				if (mixed[i] === "*") {
					let result = mixed[i - 1] * mixed[i + 1];
					mixed.splice(i - 1, 3, result);
				}
				if (mixed[i] === "/") {
					let result = mixed[i - 1] / mixed[i + 1];
					mixed.splice(i - 1, 3, result);
				}
			}
		}

		// * 3. Add & subtract
		while (mixed.some(n => n === "+")) {
			// replace every 6 + 3 with 9
			for (let i = 0; i < mixed.length; i++) {
				if (mixed[i] === "+") {
					let result = mixed[i - 1] + mixed[i + 1];
					mixed.splice(i - 1, 3, result);
				}
			}
		}

		let answer = [...mixed][0];
		// * 4. Fix JS rounding issue
		if (answer.toString().includes(".") && answer.toString().length > 10) {
			let decimalDigits = answer.toString().split(".")[1].slice(0, -1).split("");
			if (decimalDigits.every(d => d === "9" || d === "0")) answer = answer.toFixed(0);
			else if (decimalDigits.slice(1).every(d => d === "9" || d === "0"))
				answer = answer.toFixed(1);
		}

		setAns(`${state} =`);
		setState(isNaN(answer) ? "NaN" : answer);
	}
	function clear() {
		setLastKey("AC");
		setState("0");
		console.clear();
	}
	function clearEntry() {
		setLastKey("CE");
		if (state.length > 1)
			setState(prev => {
				if (prev[prev.length - 2] === " ") return prev.slice(0, -2);
				else return prev.slice(0, -1);
			});
		else setState("0");
	}
	function handleClick(e) {
		let key = e.target.innerText;
		setLastKey(key);

		if (state === "NaN") clear(key);

		if (lastKey === "=") {
			// press something after pressing "equals"
			if (key.match(/\d/)) {
				// a number
				setAns(`Ans = ${state}`);
				replace(key);
			} else if (key === ".") {
				// a decimal
				setAns(`Ans = ${state}`);
				replace("0.");
			} else if (key.match(/[+\-×÷]/)) {
				// a sign
				setAns(`Ans = ${state}`);
				add(` ${key}`);
			}
		} else {
			if (key.match(/\d/)) {
				// console.log("key is number");
				if (state === "0") replace(key);
				else if (/[+\-×÷]/.test(state.at(-1))) add(` ${key}`);
				else add(key);
			}

			if (key === ".") {
				// console.log("key is decimal");
				if (state === "") add("0."); // empty string
				else if (/\d/.test(state.at(-1))) add(key); // last key is a number
				else if (/[+\-×÷]/.test(state.at(-1))) add(" 0."); // last key is a sign
			}

			if (key.match(/[+\-×÷]/)) {
				// console.log("key is sign");
				if (!/[+\-×÷]/.test(state.at(-1)) || !/[+\-×÷]/.test(state.at(-3))) {
					// only add if the last 2 keys are not both signs
					if (state === "") add(key); // empty string
					if (/\d/.test(state.at(-1))) add(` ${key}`); // last key is a number
					else if (/[+\-×÷]/.test(state.at(-1))) {
						// last key is a sign
						if (key === "-") add(` ${key}`); // special case for negative sign
						else replaceLastKey(key);
					}
				}
			}
		}
	}
	function handleKeyDown(e) {
		if (e.key.match(/\d|[+\-*/.]|Backspace|Enter|=/)) {
			e.preventDefault(); // override browser's
			let key = e.key === "*" ? "×" : e.key === "/" ? "÷" : e.key;
			setLastKey(key);

			if (state === "NaN") clear(key);

			if (lastKey === "=") {
				// press something after pressing "equals"
				if (key.match(/\d/)) {
					// a number
					setAns(`Ans = ${state}`);
					replace(key);
				} else if (key === ".") {
					// a decimal
					setAns(`Ans = ${state}`);
					replace("0.");
				} else if (key.match(/[+\-*\/]/)) {
					// a sign
					setAns(`Ans = ${state}`);
					add(` ${key}`);
				}
			} else {
				if (key.match(/\d/)) {
					// console.log("key is number");
					if (state === "0") replace(key);
					else if (/[+\-×÷]/.test(state.at(-1))) add(` ${key}`);
					else add(key);
				}

				if (key === ".") {
					// console.log("key is decimal");
					if (state === "") add("0."); // empty string
					else if (/\d/.test(state.at(-1))) add(key); // last key is a number
					else if (/[+\-×÷]/.test(state.at(-1))) add(" 0."); // last key is a sign
				}

				if (key.match(/[+\-×÷]/)) {
					// console.log("key is sign");
					if (!/[+\-×÷]/.test(state.at(-1)) || !/[+\-×÷]/.test(state.at(-3))) {
						// only add if the last 2 keys are not both signs
						if (state === "") add(key); // empty string
						if (/\d/.test(state.at(-1))) add(` ${key}`); // last key is a number
						else if (/[+\-×÷]/.test(state.at(-1))) {
							// last key is a sign
							if (key === "-") add(` ${key}`); // special case for negative sign
							else replaceLastKey(key);
						}
					}
				}
			}

			if (key === "Backspace") clearEntry();
			if (key === "Enter" || key === "=") calculate();
		}
	}

	return (
		<div className="App">
			<header>
				<h1>The Calculator 🧮</h1>
				<p>
					by <a href="https://github.com/vietan0">Viet An</a>
				</p>
			</header>
			<div onKeyDown={handleKeyDown} id="display" tabIndex="0">
				<small>
					<span id="ans">{ans}</span>
					<span id="lastKey">lastKey: {lastKey}</span>
				</small>
				<p id="state">{state}</p>
			</div>
			<div className="grid" id="calculator-grid">
				<button onClick={handleClick} id="seven">
					7
				</button>
				<button onClick={handleClick} id="eight">
					8
				</button>
				<button onClick={handleClick} id="nine">
					9
				</button>
				<button onClick={handleClick} id="four">
					4
				</button>
				<button onClick={handleClick} id="five">
					5
				</button>
				<button onClick={handleClick} id="six">
					6
				</button>
				<button onClick={handleClick} id="one">
					1
				</button>
				<button onClick={handleClick} id="two">
					2
				</button>
				<button onClick={handleClick} id="three">
					3
				</button>
				<button onClick={handleClick} id="zero">
					0
				</button>
				<button onClick={handleClick} id="decimal">
					.
				</button>
				<button onClick={calculate} id="equals">
					=
				</button>
				<button onClick={clear} id="clear">
					AC
				</button>
				<button onClick={clearEntry} id="ce">
					CE
				</button>
				<button onClick={handleClick} id="multiply">
					×
				</button>
				<button onClick={handleClick} id="divide">
					÷
				</button>
				<button onClick={handleClick} id="add">
					+
				</button>
				<button onClick={handleClick} id="subtract">
					-
				</button>
			</div>
		</div>
	);
}
