import { FileSystemNode } from './filesystem';

export class CCompiler {
    static preprocess(code: string): string {
        // Mock preprocessor: remove comments, handle includes (mock)
        return code.replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '').trim();
    }

    static compile(code: string): string {
        // Mock compilation to assembly
        return `
    .file   "main.c"
    .text
    .globl  main
    .type   main, @function
main:
    pushq   %rbp
    movq    %rsp, %rbp
    # Mock assembly for:
${code.split('\n').map(l => '    # ' + l).join('\n')}
    popq    %rbp
    ret
`;
    }

    static assemble(asm: string): string {
        // Mock assembler to object code (hex representation)
        return Array.from(asm).map(c => c.charCodeAt(0).toString(16)).join(' ');
    }

    static link(source: string): FileSystemNode {
        // Create executable node
        return {
            name: 'a.out',
            type: 'file',
            content: 'ELF... (binary data)',
            metadata: {
                permissions: ['x'],
                isBinary: true,
                source: source // Store source for interpreter
            }
        };
    }
}

export const runExecutable = async (node: FileSystemNode, onOutput: (text: string) => void): Promise<void> => {
    if (!node.metadata?.isBinary || !node.metadata.source) {
        onOutput("Error: Not a valid executable format\n");
        return;
    }

    const code = node.metadata.source;

    // Very basic C interpreter
    // Supports: printf, int vars, basic arithmetic, while loops (simple), if (simple)

    const lines = code.split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('//') && !l.startsWith('#'));
    const variables: { [key: string]: number } = {};

    const evaluateExpression = (expr: string): number => {
        // Replace vars with values
        let evalStr = expr;
        for (const [key, val] of Object.entries(variables)) {
            // Simple word boundary replacement
            const regex = new RegExp(`\\b${key}\\b`, 'g');
            evalStr = evalStr.replace(regex, val.toString());
        }
        try {
            // eslint-disable-next-line no-eval
            return eval(evalStr);
        } catch (e) {
            return 0;
        }
    };

    const processBlock = async (startIndex: number, endIndex: number) => {
        for (let i = startIndex; i < endIndex; i++) {
            let line = lines[i];

            if (line.startsWith('printf')) {
                const match = line.match(/printf\s*\(\s*"(.*?)"\s*(?:,\s*(.*))?\s*\);/);
                if (match) {
                    let format = match[1];
                    const args = match[2] ? match[2].split(',').map(a => a.trim()) : [];

                    // Replace %d, %s, etc
                    let argIndex = 0;
                    let output = format.replace(/%[ds]/g, () => {
                        if (argIndex < args.length) {
                            const arg = args[argIndex++];
                            if (variables[arg] !== undefined) return variables[arg].toString();
                            return arg; // Literal or unknown
                        }
                        return '';
                    });

                    // Handle \n
                    output = output.replace(/\\n/g, '\n');
                    onOutput(output);
                }
            } else if (line.startsWith('int ')) {
                const match = line.match(/int\s+(\w+)\s*=\s*(.+);/);
                if (match) {
                    const name = match[1];
                    const value = evaluateExpression(match[2]);
                    variables[name] = value;
                }
            } else if (line.match(/^\w+\s*=/)) {
                // Assignment: x = 5;
                const match = line.match(/(\w+)\s*=\s*(.+);/);
                if (match) {
                    const name = match[1];
                    const value = evaluateExpression(match[2]);
                    if (variables[name] !== undefined) {
                        variables[name] = value;
                    }
                }
            } else if (line.startsWith('for')) {
                // Simple for loop: for(int i=0; i<5; i++) { ... }
                // We'll assume single line body or brace on same line for simplicity in this mock
                // Actually, let's just support: for(int i=0; i<N; i++)
                const match = line.match(/for\s*\(\s*int\s+(\w+)\s*=\s*(\d+);\s*\w+\s*<\s*(\d+);\s*\w+\+\+\s*\)\s*\{?/);
                if (match) {
                    const varName = match[1];
                    const start = parseInt(match[2]);
                    const end = parseInt(match[3]);

                    // Find end of block
                    let blockEnd = i + 1;
                    let balance = 1;
                    if (line.includes('{')) {
                        while (blockEnd < lines.length && balance > 0) {
                            if (lines[blockEnd].includes('{')) balance++;
                            if (lines[blockEnd].includes('}')) balance--;
                            blockEnd++;
                        }
                        blockEnd--; // Point to the closing brace line or just after
                    } else {
                        blockEnd = i + 1; // Single line
                    }

                    for (let val = start; val < end; val++) {
                        variables[varName] = val;
                        await processBlock(i + 1, blockEnd); // Recurse for body
                    }
                    i = blockEnd - 1; // Skip processed lines
                }
            }

            // Simulate some processing time
            await new Promise(r => setTimeout(r, 10));
        }
    };

    await processBlock(0, lines.length);
};
