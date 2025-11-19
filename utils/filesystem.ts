export type FileType = 'file' | 'directory';

export interface FileSystemNode {
    name: string;
    type: FileType;
    content?: string;
    children?: { [name: string]: FileSystemNode };
}

export const INITIAL_FS: FileSystemNode = {
    name: 'root',
    type: 'directory',
    children: {
        'home': {
            name: 'home',
            type: 'directory',
            children: {
                'guest': {
                    name: 'guest',
                    type: 'directory',
                    children: {
                        'readme.txt': { name: 'readme.txt', type: 'file', content: 'Welcome to AminOS Terminal.\nThis is a mock terminal environment.\n\nTry commands like:\n- ls\n- cd\n- mkdir\n- touch\n- nano' },
                        'secrets.txt': { name: 'secrets.txt', type: 'file', content: 'TOP SECRET\n----------------\nThe password is: password123' },
                        'todo.list': { name: 'todo.list', type: 'file', content: '- Buy milk\n- Hack the mainframe\n- Sleep' },
                        'projects': {
                            name: 'projects',
                            type: 'directory',
                            children: {}
                        }
                    }
                }
            }
        },
        'bin': {
            name: 'bin',
            type: 'directory',
            children: {
                'echo': { name: 'echo', type: 'file', content: 'Binary file' },
                'ls': { name: 'ls', type: 'file', content: 'Binary file' },
                'cat': { name: 'cat', type: 'file', content: 'Binary file' }
            }
        },
        'etc': {
            name: 'etc',
            type: 'directory',
            children: {
                'hosts': { name: 'hosts', type: 'file', content: '127.0.0.1 localhost' },
                'passwd': { name: 'passwd', type: 'file', content: 'root:x:0:0:root:/root:/bin/bash\nguest:x:1000:1000:guest:/home/guest:/bin/bash' }
            }
        },
        'var': {
            name: 'var',
            type: 'directory',
            children: {
                'log': {
                    name: 'log',
                    type: 'directory',
                    children: {
                        'syslog': { name: 'syslog', type: 'file', content: 'System booted successfully.' }
                    }
                }
            }
        }
    }
};
