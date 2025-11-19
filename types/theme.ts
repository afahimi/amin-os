import React from 'react';

export type ThemeId = 'neon-mindspace' | 'pixel-night-sky' | 'vaporwave' | 'zen-mono';

export interface ThemeColors {
    background: string;
    accentPrimary: string;
    accentSecondary: string;
    windowBg: string;
    windowBorder: string;
    text: string;
    textSecondary: string;
    selection: string;
}

export interface ThemeCursor {
    type: 'default' | 'pixel' | 'droplet' | 'minimal';
    color: string;
    trail: boolean;
}

export interface ThemeWindowStyle {
    borderRadius: string;
    borderColor: string;
    titleFont: string;
    shadow: string;
}

export interface Theme {
    id: ThemeId;
    name: string;
    colors: ThemeColors;
    cursor: ThemeCursor;
    windowStyle: ThemeWindowStyle;
    backgroundComponent: React.ComponentType;
}
