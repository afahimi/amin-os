
export interface Song {
    id: string;
    title: string;
    artist: string;
    album: string;
    coverUrl: string;
    audioUrl: string;
    duration: number; // in seconds
}

export interface Playlist {
    id: string;
    name: string;
    coverUrl: string;
    description: string;
    songs: string[]; // Song IDs
}

export const SONGS: Song[] = [
    {
        id: '1',
        title: 'Midnight City',
        artist: 'M83',
        album: 'Hurry Up, We\'re Dreaming',
        coverUrl: 'https://picsum.photos/seed/m83/300/300',
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', // Placeholder
        duration: 210
    },
    {
        id: '2',
        title: 'Instant Crush',
        artist: 'Daft Punk ft. Julian Casablancas',
        album: 'Random Access Memories',
        coverUrl: 'https://picsum.photos/seed/daft/300/300',
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
        duration: 337
    },
    {
        id: '3',
        title: 'The Less I Know The Better',
        artist: 'Tame Impala',
        album: 'Currents',
        coverUrl: 'https://picsum.photos/seed/tame/300/300',
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
        duration: 216
    },
    {
        id: '4',
        title: 'Blinding Lights',
        artist: 'The Weeknd',
        album: 'After Hours',
        coverUrl: 'https://picsum.photos/seed/weeknd/300/300',
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
        duration: 200
    },
    {
        id: '5',
        title: 'Levitating',
        artist: 'Dua Lipa',
        album: 'Future Nostalgia',
        coverUrl: 'https://picsum.photos/seed/dua/300/300',
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3',
        duration: 203
    }
];

export const PLAYLISTS: Playlist[] = [
    {
        id: 'liked',
        name: 'Liked Songs',
        coverUrl: 'https://picsum.photos/seed/liked/300/300',
        description: 'Your favorite tracks',
        songs: ['1', '2', '3', '4', '5']
    },
    {
        id: 'chill',
        name: 'Chill Vibes',
        coverUrl: 'https://picsum.photos/seed/chill/300/300',
        description: 'Relax and unwind',
        songs: ['1', '3']
    },
    {
        id: 'synth',
        name: 'Synthwave Essentials',
        coverUrl: 'https://picsum.photos/seed/synth/300/300',
        description: 'Neon lights and retro beats',
        songs: ['2', '4']
    }
];
