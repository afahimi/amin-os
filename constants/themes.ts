import { Theme } from '../types/theme';
import ThinkingNebula from '../components/ThinkingNebula';
import PixelNightSky from '../components/backgrounds/PixelNightSky';
import Vaporwave from '../components/backgrounds/Vaporwave';
import ZenMono from '../components/backgrounds/ZenMono';

export const THEMES: Theme[] = [
    {
        id: 'neon-mindspace',
        name: 'Neon Mindspace',
        colors: {
            background: '#050608',
            accentPrimary: '#22d3ee', // Cyan
            accentSecondary: '#a855f7', // Purple
            windowBg: 'rgba(5, 6, 8, 0.8)',
            windowBorder: 'rgba(34, 211, 238, 0.3)',
            text: '#ffffff',
            textSecondary: '#9ca3af',
            selection: 'rgba(34, 211, 238, 0.2)'
        },
        cursor: {
            type: 'default',
            color: '#22d3ee',
            trail: true
        },
        windowStyle: {
            borderRadius: '0.5rem',
            borderColor: 'rgba(34, 211, 238, 0.3)',
            titleFont: 'font-display',
            shadow: '0 10px 30px -10px rgba(34, 211, 238, 0.2)'
        },
        backgroundComponent: ThinkingNebula
    },
    {
        id: 'pixel-night-sky',
        name: 'Pixel Night Sky',
        colors: {
            background: '#0f172a',
            accentPrimary: '#60a5fa', // Blue
            accentSecondary: '#f472b6', // Pink
            windowBg: 'rgba(15, 23, 42, 0.9)',
            windowBorder: 'rgba(96, 165, 250, 0.4)',
            text: '#e2e8f0',
            textSecondary: '#94a3b8',
            selection: 'rgba(244, 114, 182, 0.3)'
        },
        cursor: {
            type: 'pixel',
            color: '#60a5fa',
            trail: false
        },
        windowStyle: {
            borderRadius: '0px', // Pixelated
            borderColor: 'rgba(96, 165, 250, 0.4)',
            titleFont: 'font-pixel', // Need to ensure this exists or fallback
            shadow: '4px 4px 0px 0px rgba(0,0,0,0.5)'
        },
        backgroundComponent: PixelNightSky
    },
    {
        id: 'vaporwave',
        name: 'Vaporwave',
        colors: {
            background: '#2e003e',
            accentPrimary: '#d946ef', // Magenta
            accentSecondary: '#06b6d4', // Cyan
            windowBg: 'rgba(46, 0, 62, 0.85)',
            windowBorder: 'rgba(217, 70, 239, 0.4)',
            text: '#fdf4ff',
            textSecondary: '#e879f9',
            selection: 'rgba(217, 70, 239, 0.3)'
        },
        cursor: {
            type: 'vaporwave',
            color: '#d946ef',
            trail: true
        },
        windowStyle: {
            borderRadius: '0px',
            borderColor: 'rgba(217, 70, 239, 0.4)',
            titleFont: 'font-display',
            shadow: '4px 4px 0px 0px rgba(217, 70, 239, 0.2)'
        },
        backgroundComponent: Vaporwave
    },
    {
        id: 'zen-mono',
        name: 'Zen Mono',
        colors: {
            background: '#171717',
            accentPrimary: '#d4d4d4', // Light Gray
            accentSecondary: '#525252', // Dark Gray
            windowBg: 'rgba(23, 23, 23, 0.95)',
            windowBorder: 'rgba(82, 82, 82, 0.5)',
            text: '#e5e5e5',
            textSecondary: '#a3a3a3',
            selection: 'rgba(255, 255, 255, 0.1)'
        },
        cursor: {
            type: 'minimal',
            color: '#d4d4d4',
            trail: false
        },
        windowStyle: {
            borderRadius: '2px',
            borderColor: 'rgba(82, 82, 82, 0.5)',
            titleFont: 'font-mono',
            shadow: '0 4px 6px -1px rgba(0, 0, 0, 0.5)'
        },
        backgroundComponent: ZenMono
    }
];
