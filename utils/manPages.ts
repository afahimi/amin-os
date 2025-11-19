export interface ManPage {
    name: string;
    synopsis: string;
    description: string;
    options: { flag: string; desc: string }[];
}

export const MAN_PAGES: { [key: string]: ManPage } = {
    ls: {
        name: "ls - list directory contents",
        synopsis: "ls [OPTION]... [FILE]...",
        description: "List information about the FILEs (the current directory by default). Sort entries alphabetically if none of -cftuvSUX nor --sort is specified.",
        options: [
            { flag: "-a, --all", desc: "do not ignore entries starting with ." },
            { flag: "-l", desc: "use a long listing format" },
            { flag: "-r, --reverse", desc: "reverse order while sorting" },
            { flag: "-R, --recursive", desc: "list subdirectories recursively" },
        ]
    },
    cd: {
        name: "cd - change the shell working directory",
        synopsis: "cd [dir]",
        description: "Change the current directory to DIR. The default DIR is the value of the HOME shell variable.",
        options: []
    },
    pwd: {
        name: "pwd - print name of current/working directory",
        synopsis: "pwd [OPTION]...",
        description: "Print the full filename of the current working directory.",
        options: []
    },
    mkdir: {
        name: "mkdir - make directories",
        synopsis: "mkdir [OPTION]... DIRECTORY...",
        description: "Create the DIRECTORY(ies), if they do not already exist.",
        options: [
            { flag: "-p, --parents", desc: "no error if existing, make parent directories as needed" }
        ]
    },
    touch: {
        name: "touch - change file timestamps",
        synopsis: "touch [OPTION]... FILE...",
        description: "Update the access and modification times of each FILE to the current time. A FILE argument that does not exist is created empty.",
        options: []
    },
    cp: {
        name: "cp - copy files and directories",
        synopsis: "cp [OPTION]... SOURCE DEST",
        description: "Copy SOURCE to DEST, or multiple SOURCE(s) to DIRECTORY.",
        options: [
            { flag: "-r, -R, --recursive", desc: "copy directories recursively" }
        ]
    },
    mv: {
        name: "mv - move (rename) files",
        synopsis: "mv [OPTION]... SOURCE DEST",
        description: "Rename SOURCE to DEST, or move SOURCE(s) to DIRECTORY.",
        options: []
    },
    rm: {
        name: "rm - remove files or directories",
        synopsis: "rm [OPTION]... [FILE]...",
        description: "This manual page documents the GNU version of rm. rm removes each specified file. By default, it does not remove directories.",
        options: [
            { flag: "-r, -R, --recursive", desc: "remove directories and their contents recursively" },
            { flag: "-f, --force", desc: "ignore nonexistent files and arguments, never prompt" }
        ]
    },
    cat: {
        name: "cat - concatenate files and print on the standard output",
        synopsis: "cat [OPTION]... [FILE]...",
        description: "Concatenate FILE(s) to standard output.",
        options: [
            { flag: "-n, --number", desc: "number all output lines" }
        ]
    },
    nano: {
        name: "nano - Nano's ANOther editor, inspired by Pico",
        synopsis: "nano [options] [[+line[,column]] file]...",
        description: "nano is a small and friendly editor. It copies the look and feel of Pico, but is free software, and implements several features that Pico lacks.",
        options: []
    },
    vim: {
        name: "vim - Vi IMproved, a programmer's text editor",
        synopsis: "vim [options] [file]...",
        description: "Vim is a text editor that is upwards compatible to Vi. It can be used to edit all kinds of plain text. It is especially useful for editing programs.",
        options: []
    },
    gcc: {
        name: "gcc - GNU project C and C++ compiler",
        synopsis: "gcc [options] file...",
        description: "When you invoke GCC, it normally does preprocessing, compilation, assembly, and linking.",
        options: [
            { flag: "-o <file>", desc: "Place the output into <file>." },
            { flag: "-S", desc: "Compile only; do not assemble or link." }
        ]
    },
    clear: {
        name: "clear - clear the terminal screen",
        synopsis: "clear",
        description: "clear clears your screen if this is possible, including its scrollback buffer.",
        options: []
    },
    echo: {
        name: "echo - display a line of text",
        synopsis: "echo [SHORT-OPTION]... [STRING]...",
        description: "Echo the STRING(s) to standard output.",
        options: []
    },
    whoami: {
        name: "whoami - print effective userid",
        synopsis: "whoami [OPTION]...",
        description: "Print the user name associated with the current effective user ID.",
        options: []
    },
    hostname: {
        name: "hostname - show or set the system's host name",
        synopsis: "hostname [OPTION]...",
        description: "Show or set the system's host name.",
        options: []
    },
    uptime: {
        name: "uptime - Tell how long the system has been running",
        synopsis: "uptime [options]",
        description: "uptime gives a one line display of the following information: the current time, how long the system has been running, how many users are currently logged on, and the system load averages for the past 1, 5, and 15 minutes.",
        options: []
    },
    top: {
        name: "top - display Linux processes",
        synopsis: "top -hv | -bcHiOSs -d secs -n max -u|U user -p pid -o fld -w [cols]",
        description: "The top program provides a dynamic real-time view of a running system.",
        options: []
    },
    date: {
        name: "date - print or set the system date and time",
        synopsis: "date [OPTION]... [+FORMAT]",
        description: "Display the current time in the given FORMAT, or set the system date.",
        options: []
    },
    neofetch: {
        name: "neofetch - A command-line system information tool",
        synopsis: "neofetch [func_name] [options]",
        description: "Neofetch is a CLI system information tool written in BASH. Neofetch displays information about your operating system, software and hardware in an aesthetic and visually pleasing way.",
        options: []
    },
    matrix: {
        name: "matrix - simulate the matrix",
        synopsis: "matrix",
        description: "Follow the white rabbit.",
        options: []
    }
};
