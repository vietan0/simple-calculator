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
		// make a local copy & change "×" to "*" and "÷" to "/"
		let str = state.slice().replace("×", "*").replace("÷", "/");
		// add "0" if state start with "+" or "-"
		if ((str[0] === "-" || str[0] === "+") && str.length > 1) str = "0" + str;

		// * 1. Split str into array of numbers & signs
		// split between <signs that don't follow another sign>.
		// when encounter consecutive signs "+-",
		// the minus "-" is sticked to next string: "+-3" => [+, -3]
		let signs = str.match(/(?<![+\-*/])[+\-*/]/g);
		// console.log(signs);

		let numbers = str
			.split(/(?<![+\-*/])[+\-*/]/)
			.filter(s => s !== "")
			.map(n => Number(n));
		// console.log(numbers);

		let mixed = [];
		for (let i = 0; i < numbers.length; i++) {
			mixed.push(numbers[i]);
			if (signs && i < signs.length) mixed.push(signs[i]);
		}
		// console.log(mixed);

		// convert every "-5" to "+ (-5)"
		for (let i = 0; i < mixed.length - 1; i++) {
			if (mixed[i] === "-") {
				mixed[i] = "+";
				mixed[i + 1] = mixed[i + 1] * -1;
			}
		}
		// console.log(mixed);

		// * 2. Multiply & divide first
		for (let i = 0; i < mixed.length; i++) {
			if (mixed[i] === "*") {
				let result = mixed[i - 1] * mixed[i + 1];
				mixed.splice(i - 1, 3, result);
			}
			if (mixed[i] === "/") {
				let result = mixed[i - 1] / mixed[i + 1];
				mixed.splice(i - 1, 3, result); // replace 5 / 7 with 0.714
			}
			// console.log(mixed);
		}

		// * 3. Add & subtract
		while (mixed.length > 1) {
			for (let i = 0; i < mixed.length; i++) {
				if (mixed[i] === "+") {
					let result;
					// e.g. [5, +, -3] => 5 - 3
					if (mixed[i + 1] < 0) {
						result = mixed[i - 1] - Math.abs(mixed[i + 1]);
					} else result = mixed[i - 1] + mixed[i + 1];
					mixed.splice(i - 1, 3, result);
				}
				if (mixed[i] === "-") {
					let result = mixed[i - 1] - mixed[i + 1];
					mixed.splice(i - 1, 3, result);
				}
				// console.log(mixed);
			}
		}
		setAns(`${state} =`);
		setState(isNaN(mixed[0]) ? "NaN" : `${mixed[0]}`);
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
				console.log(state);
				console.log(state.at(-2));
				console.log(state.at(-4));
				if (!/[+\-×÷]/.test(state.at(-1)) || !/[+\-×÷]/.test(state.at(-3))) {
					// if the last 2 keys are not both signs
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
			let key = e.key;
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
					else if (/[+\-*\/]/.test(state.at(-1))) add(` ${key}`);
					else add(key);
				}

				if (key === ".") {
					// console.log("key is decimal");
					if (state === "") add("0."); // empty string
					else if (/\d/.test(state.at(-1))) add(key); // last key is a number
					else if (/[+\-*\/]/.test(state.at(-1))) add(" 0."); // last key is a sign
				}

				if (key.match(/[+\-*\/]/)) {
					// console.log("key is sign");
					console.log(state);
					console.log(state.at(-2));
					console.log(state.at(-4));
					if (!/[+\-*\/]/.test(state.at(-1)) || !/[+\-*\/]/.test(state.at(-3))) {
						// if the last 2 keys are not both signs
						if (state === "") add(key); // empty string
						if (/\d/.test(state.at(-1))) add(` ${key}`); // last key is a number
						else if (/[+\-*\/]/.test(state.at(-1))) {
							// last key is a sign
							if (key === "-") add(` ${key}`); // special case for negative sign
							else replaceLastKey(key);
						}
					}
				}
			}

			if(key === "Backspace") clearEntry();
			if (key === "Enter" || key === "=") calculate();
		}
	}

	// console.log("state :>>", state);
	// console.log("lastKey :>>", lastKey);

	return (
		<div className="App">
			<header>
				<h1>The Calculator 🧮</h1>
				<p>
					by <a href="https://github.com/vietan0">Viet An</a>
				</p>
			</header>
			<div id="field">
				<small>{ans}</small>
				<input
					type="text"
					// onChange={handleChange}
					onKeyDown={handleKeyDown}
					value={state}
					placeholder="input"
					id="display"
					className="form-control"
				/>
				<small>lastKey: {lastKey}</small>
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
