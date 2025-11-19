import { FileSystemNode } from './filesystem';

export class CCompiler {
    static preprocess(code: string): string {
        // Remove comments
        return code.replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '').trim();
    }

    static compile(code: string): string {
        // Mock compilation to assembly
        return `
    .file   "main.c"
    .text
    .globl  main
    .type   main, @function
    # Compiled with AminOS GCC
    # Support for functions, recursion, and stack frames enabled
${code.split('\n').map(l => '    # ' + l).join('\n')}
`;
    }

    static assemble(asm: string): string {
        return Array.from(asm).map(c => c.charCodeAt(0).toString(16)).join(' ');
    }

    static link(source: string): FileSystemNode {
        return {
            name: 'a.out',
            type: 'file',
            content: 'ELF... (binary data)',
            metadata: {
                permissions: ['x'],
                isBinary: true,
                source: source
            }
        };
    }
}

interface FunctionDef {
    name: string;
    returnType: string;
    params: string[]; // ["int n", "char* s"]
    body: string[];
}

interface Scope {
    [key: string]: any;
}

export const runExecutable = async (node: FileSystemNode, onOutput: (text: string) => void): Promise<void> => {
    if (!node.metadata?.isBinary || !node.metadata.source) {
        onOutput("Error: Not a valid executable format\n");
        return;
    }

    const rawCode = CCompiler.preprocess(node.metadata.source);
    const lines = rawCode.split('\n').map(l => l.trim()).filter(l => l);

    // 1. Parse Functions
    const functions: { [name: string]: FunctionDef } = {};
    let currentFunc: FunctionDef | null = null;
    let braceCount = 0;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        // Detect function start: "int main() {" or "void foo(int a) {"
        // Regex: type name(args) {
        const funcMatch = line.match(/^(\w+)\s+(\w+)\s*\((.*)\)\s*\{?$/);

        if (funcMatch && braceCount === 0) {
            const [_, returnType, name, argsStr] = funcMatch;
            currentFunc = {
                name,
                returnType,
                params: argsStr.trim() ? argsStr.split(',').map(s => s.trim()) : [],
                body: []
            };
            if (line.includes('{')) braceCount++;
            continue;
        }

        if (currentFunc) {
            if (line.includes('{')) braceCount++;
            if (line.includes('}')) braceCount--;

            if (braceCount === 0) {
                // End of function
                functions[currentFunc.name] = currentFunc;
                currentFunc = null;
            } else {
                // Add line to body, removing the closing brace if it's the last line
                if (braceCount === 1 && line === '}') {
                    // End of function handled above usually, but if } is on own line
                } else {
                    currentFunc.body.push(line);
                }
            }
        }
    }

    // 2. Execution Engine
    const globalScope: Scope = {};

    const evaluateExpression = async (expr: string, scope: Scope): Promise<any> => {
        let evalStr = expr;

        // Handle function calls in expression: fib(n-1)
        // We need to find patterns like name(...) and execute them
        // This is a simple recursive parser for calls
        const callRegex = /(\w+)\s*\(([^()]*)\)/g;

        // We loop until no more function calls are found to handle nested/multiple calls
        // Note: This simple regex fails on nested calls like fib(fib(2)). 
        // For a robust solution we'd need a real parser. 
        // For this mock, we'll assume simple expressions or handle one level of nesting via recursion in the evaluator if needed.
        // Actually, let's use a replacer that supports async execution? No, replace doesn't support async.
        // We must find matches, execute, and replace.

        let match;
        while ((match = callRegex.exec(evalStr)) !== null) {
            const [fullMatch, funcName, argsStr] = match;

            // Check if it's a known function
            if (functions[funcName]) {
                // Evaluate arguments
                const argValues = [];
                const rawArgs = argsStr.split(',').map(s => s.trim()).filter(s => s);
                for (const rawArg of rawArgs) {
                    argValues.push(await evaluateExpression(rawArg, scope));
                }

                // Execute function
                const result = await executeFunction(funcName, argValues);

                // Replace in string
                evalStr = evalStr.replace(fullMatch, String(result));
                // Reset regex to start from beginning as string changed
                callRegex.lastIndex = 0;
            } else if (funcName === 'pow') {
                // Math functions support
                const args = argsStr.split(',').map(s => Number(s));
                evalStr = evalStr.replace(fullMatch, String(Math.pow(args[0], args[1])));
            }
        }

        // Replace variables
        for (const [key, val] of Object.entries({ ...globalScope, ...scope })) {
            const regex = new RegExp(`\\b${key}\\b`, 'g');
            evalStr = evalStr.replace(regex, String(val));
        }

        // Handle modulo % (JS supports it, so eval works)

        try {
            // eslint-disable-next-line no-eval
            return eval(evalStr);
        } catch (e) {
            return 0;
        }
    };

    const executeFunction = async (name: string, args: any[]): Promise<any> => {
        const func = functions[name];
        if (!func) {
            onOutput(`Error: Undefined function ${name}\n`);
            return 0;
        }

        // Create Scope
        const scope: Scope = {};

        // Map params
        func.params.forEach((paramStr, idx) => {
            const paramName = paramStr.split(' ').pop()!; // "int n" -> "n"
            scope[paramName] = args[idx];
        });

        // Execute Body
        return await executeBlock(func.body, scope);
    };

    const executeBlock = async (lines: string[], scope: Scope): Promise<any> => {
        for (let i = 0; i < lines.length; i++) {
            let line = lines[i].trim();
            if (!line) continue;

            // Return
            if (line.startsWith('return ')) {
                const expr = line.substring(7).replace(';', '');
                return await evaluateExpression(expr, scope);
            }

            // Printf
            if (line.startsWith('printf')) {
                // Regex to capture format string and args
                // Supports: printf("format", arg1, arg2);
                const match = line.match(/printf\s*\(\s*"(.*?)"\s*(?:,\s*([^;)]*))?\s*\);?/);
                if (match) {
                    let format = match[1];
                    const argsRaw = match[2] ? match[2].split(',') : [];

                    let output = format;
                    let argIdx = 0;

                    // Replace %d, %s
                    // We need to evaluate args first
                    const evaluatedArgs = [];
                    for (const raw of argsRaw) {
                        evaluatedArgs.push(await evaluateExpression(raw, scope));
                    }

                    output = output.replace(/%[dsf]/g, () => {
                        const val = evaluatedArgs[argIdx++];
                        return val !== undefined ? String(val) : '';
                    });

                    output = output.replace(/\\n/g, '\n');
                    onOutput(output);
                }
                continue;
            }

            // Variable Declaration: int x = 5;
            const declMatch = line.match(/^(int|float|char|double)\s+(\w+)\s*=\s*(.+);/);
            if (declMatch) {
                const [_, type, name, expr] = declMatch;
                scope[name] = await evaluateExpression(expr, scope);
                continue;
            }

            // Assignment: x = 5;
            const assignMatch = line.match(/^(\w+)\s*=\s*(.+);/);
            if (assignMatch) {
                const [_, name, expr] = assignMatch;
                if (scope[name] !== undefined) {
                    scope[name] = await evaluateExpression(expr, scope);
                } else if (globalScope[name] !== undefined) {
                    globalScope[name] = await evaluateExpression(expr, scope);
                }
                continue;
            }

            // If Statement
            if (line.startsWith('if')) {
                const match = line.match(/if\s*\((.+)\)\s*\{?/);
                if (match) {
                    const condition = await evaluateExpression(match[1], scope);

                    // Find block
                    let blockLines: string[] = [];
                    let balance = 1;
                    let j = i + 1;

                    if (line.includes('{')) {
                        // Multi-line block
                        while (j < lines.length && balance > 0) {
                            if (lines[j].includes('{')) balance++;
                            if (lines[j].includes('}')) balance--;
                            if (balance > 0) blockLines.push(lines[j]);
                            j++;
                        }
                        i = j - 1;
                    } else {
                        // Single line
                        blockLines.push(lines[++i]);
                    }

                    if (condition) {
                        const res = await executeBlock(blockLines, { ...scope }); // New scope for block? C doesn't strictly require new scope for if, but good practice
                        if (res !== undefined) return res; // Propagate return
                    }
                }
                continue;
            }

            // While Loop
            if (line.startsWith('while')) {
                const match = line.match(/while\s*\((.+)\)\s*\{?/);
                if (match) {
                    const conditionExpr = match[1];

                    // Find block
                    let blockLines: string[] = [];
                    let balance = 1;
                    let j = i + 1;

                    if (line.includes('{')) {
                        while (j < lines.length && balance > 0) {
                            if (lines[j].includes('{')) balance++;
                            if (lines[j].includes('}')) balance--;
                            if (balance > 0) blockLines.push(lines[j]);
                            j++;
                        }
                        i = j - 1;
                    } else {
                        blockLines.push(lines[++i]);
                    }

                    // Loop
                    let limit = 1000; // Safety break
                    while (await evaluateExpression(conditionExpr, scope) && limit-- > 0) {
                        const res = await executeBlock(blockLines, { ...scope });
                        if (res !== undefined) return res;
                    }
                    if (limit <= 0) onOutput("Error: Infinite loop detected\n");
                }
                continue;
            }

            // For Loop (Simplified: for(int i=0; i<10; i++))
            if (line.startsWith('for')) {
                // Parse: for(init; cond; step)
                const match = line.match(/for\s*\((.+?);(.+?);(.+?)\)\s*\{?/);
                if (match) {
                    const [_, init, cond, step] = match;

                    // Find block
                    let blockLines: string[] = [];
                    let balance = 1;
                    let j = i + 1;

                    if (line.includes('{')) {
                        while (j < lines.length && balance > 0) {
                            if (lines[j].includes('{')) balance++;
                            if (lines[j].includes('}')) balance--;
                            if (balance > 0) blockLines.push(lines[j]);
                            j++;
                        }
                        i = j - 1;
                    } else {
                        blockLines.push(lines[++i]);
                    }

                    // Execute Init (in new scope)
                    const loopScope = { ...scope };
                    // Init usually "int i = 0"
                    if (init.includes('int ')) {
                        const [__, name, val] = init.match(/int\s+(\w+)\s*=\s*(.+)/) || [];
                        if (name) loopScope[name] = await evaluateExpression(val, loopScope);
                    }

                    let limit = 1000;
                    while (await evaluateExpression(cond, loopScope) && limit-- > 0) {
                        const res = await executeBlock(blockLines, loopScope);
                        if (res !== undefined) return res;

                        // Execute step: i++ or i = i + 1
                        if (step.includes('++')) {
                            const varName = step.replace('++', '').trim();
                            loopScope[varName]++;
                        } else if (step.includes('--')) {
                            const varName = step.replace('--', '').trim();
                            loopScope[varName]--;
                        } else {
                            // i = i + 1
                            const [target, val] = step.split('=');
                            if (target && val) {
                                loopScope[target.trim()] = await evaluateExpression(val, loopScope);
                            }
                        }
                    }
                }
                continue;
            }

            await new Promise(r => setTimeout(r, 1)); // Yield to UI
        }
        return undefined; // No return statement hit
    };

    // Start Main
    if (functions['main']) {
        await executeFunction('main', []);
    } else {
        onOutput("Error: No main function found.\n");
    }
};
