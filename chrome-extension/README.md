# YouTube to VidioPintar Chrome Extension

A Chrome extension that redirects YouTube watch URLs to vidiopintar.com for a better viewing experience.

## Features

- 🎯 One-click redirect from YouTube to VidioPintar
- 📱 Popup interface with current video status
- 🔄 Automatic video ID extraction and URL conversion
- ✨ Visual indicator when on YouTube video pages

## Installation

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" (toggle in the top right)
3. Click "Load unpacked" 
4. Select the `chrome-extension` folder
5. The extension should now appear in your extensions toolbar

## Usage

### Method 1: Extension Popup
1. Navigate to any YouTube video (e.g., `youtube.com/watch?v=VIDEO_ID`)
2. Click the VidioPintar extension icon in your toolbar
3. Click "Watch on VidioPintar" button

### Method 2: Content Script Button
1. Navigate to any YouTube video page
2. Look for the "🎯 Watch on VidioPintar" button on the page
3. Click the button to redirect

## Files Structure

- `manifest.json` - Extension configuration
- `background.js` - Service worker for tab management
- `content.js` - Script injected into YouTube pages
- `popup.html` - Extension popup interface
- `popup.js` - Popup functionality
- `icon16.png`, `icon48.png`, `icon128.png` - Extension icons (placeholders)

## Development

To modify the extension:
1. Make your changes to the relevant files
2. Go to `chrome://extensions/`
3. Click the refresh icon on the extension card
4. Test your changes

## URL Conversion

The extension converts YouTube URLs like:
```
https://www.youtube.com/watch?v=VIDEO_ID
```

To VidioPintar URLs like:
```
https://vidiopintar.com/watch?v=VIDEO_ID
```