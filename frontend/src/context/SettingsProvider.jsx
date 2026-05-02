import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';

/**
 * SettingsProvider - Applies global UI settings to the document
 * Handles:
 * - Theme (light/dark/auto)
 * - ColorScheme (accent colors)
 * - Font size scaling
 * - Compact mode
 * - Animation toggling
 */
function SettingsProvider({ children }) {
  const settingsState = useSelector((state) => state.settings);
  const { flatSettings = {}, initialized = false } = settingsState || {};
  
  const {
    theme = 'auto',
    colorScheme = 'blue',
    fontSize = 'medium',
    compactMode = false,
    animationsEnabled = true,
  } = flatSettings;

  // Apply theme to document body
  useEffect(() => {
    try {
      if (!document || !document.body) return;
      if (!initialized) return;

      const body = document.body;
      
      // Remove all theme classes
      body.classList.remove('light-theme', 'dark-theme', 'auto-theme');
      body.classList.remove('font-small', 'font-medium', 'font-large');
      body.classList.remove('compact-mode', 'no-animations');
      
      // Add current theme class
      body.classList.add(`${theme}-theme`);
      
      // Add font size class
      if (fontSize !== 'medium') {
        body.classList.add(`font-${fontSize}`);
      }
      
      // Add compact mode class if enabled
      if (compactMode) {
        body.classList.add('compact-mode');
      }
      
      // Set color scheme accent color
      const root = document.documentElement;
      const colorMap = {
        blue: { primary: '#3b82f6', ring: '#2563eb', light: '#dbeafe' },
        green: { primary: '#10b981', ring: '#059669', light: '#d1fae5' },
        purple: { primary: '#8b5cf6', ring: '#7c3aed', light: '#ede9fe' },
        rose: { primary: '#f43f5e', ring: '#e11d48', light: '#ffe4e6' },
      };
      
      if (colorMap[colorScheme]) {
        root.style.setProperty('--color-primary', colorMap[colorScheme].primary);
        root.style.setProperty('--color-primary-ring', colorMap[colorScheme].ring);
        root.style.setProperty('--color-primary-light', colorMap[colorScheme].light);
      }
      
      // Handle animations
      if (animationsEnabled) {
        body.classList.remove('no-animations');
        // Re-enable CSS animations
        const style = document.createElement('style');
        style.id = 'kilo-animations-enable';
        style.innerHTML = `
          *, *::before, *::after {
            animation-duration: inherit !important;
            animation-timing-function: inherit !important;
          }
        `;
        document.head.appendChild(style);
      } else {
        body.classList.add('no-animations');
        // Disable CSS animations globally
        const style = document.createElement('style');
        style.id = 'kilo-animations-disable';
        style.innerHTML = `
          *, *::before, *::after {
            animation-duration: 0s !important;
            animation-timing-function: steps(1) !important;
            transition-duration: 0s !important;
          }
        `;
        document.head.appendChild(style);
      }
    } catch (err) {
      console.error('SettingsProvider error:', err);
    }
  }, [theme, colorScheme, fontSize, compactMode, animationsEnabled, initialized]);

  // Apply to root container
  useEffect(() => {
    try {
      if (!document || !initialized) return;
      
      const root = document.getElementById('root');
      if (root) {
        root.className = root.className.replace(/theme-\w+/g, '').trim();
        if (colorScheme) {
          root.classList.add(`theme-${colorScheme}`);
        }
      }
    } catch (err) {
      console.error('SettingsProvider root error:', err);
    }
  }, [colorScheme, initialized]);

  // Cleanup animation styles on unmount
  useEffect(() => {
    return () => {
      try {
        const enableStyle = document.getElementById('kilo-animations-enable');
        const disableStyle = document.getElementById('kilo-animations-disable');
        if (enableStyle) document.head.removeChild(enableStyle);
        if (disableStyle) document.head.removeChild(disableStyle);
      } catch (err) {
        // Ignore cleanup errors
      }
    };
  }, []);

  return children;
};

export default SettingsProvider;
