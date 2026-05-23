<p align="left">
  <img width="64" height="64"
       src="https://github.com/user-attachments/assets/9720c52b-8f77-4ed6-a725-684b7e87d8b7"
       align="center" />

  
</p>


# Tab Collector

A minimal Chrome extension for copying and saving your open tab URLs.

## What it does

Click the extension icon and you'll see all your currently open tabs listed with their favicon and title. Check the ones you want, then either copy the URLs to your clipboard or download them as a `.txt` file.

That's pretty much it.

## Install

Since this isn't on the Chrome Web Store(yet), you'll need to load it manually:

1. Unzip the downloaded folder
2. Go to `chrome://extensions` in your browser
3. Turn on **Developer mode** (toggle in the top right)
4. Click **Load unpacked** and select the unzipped `tab-collector` folder

The icon will appear in your toolbar. Pin it if you want it always visible.

## Usage

- Click the icon to open the popup
- Check individual tabs or use **Select all** at the top
- **Copy Links** — copies all selected URLs to your clipboard, one per line
- **Save .txt** — downloads a text file with the URLs and a timestamp in the filename

## Built with

- Chrome Extensions Manifest V3
- Vanilla JS, no dependencies

## Notes

The extension only needs the `tabs` permission to read your open tab info. Nothing is sent anywhere - everything happens locally in your browser.
