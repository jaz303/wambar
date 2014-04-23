# wambar

Express Web Audio graphs with a DSL. This example creates an oscillator, sends it in parallel to 3 EQs, then adds their respective outputs together for the final mix:

	osc(type=sine,frequency=440) -> [ eq#hi, eq#mid, eq#low ] -> output

This is a work in progress and not particularly useful yet.