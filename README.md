# Music Sight Reading Practice Tool

A web-based application designed to help musicians improve their sight-reading skills using VexFlow for music notation and the Web MIDI API for real-time input from MIDI devices.

## Features

- **Two Practice Modes**:
  - **Single Note Mode**: Practice reading and playing individual notes
  - **Sequence Mode**: Practice reading and playing sequences of notes in order
  
- **Customizable Settings**:
  - Choose between treble clef, bass clef, or both
  - Adjust sequence length (2-8 notes) in sequence mode
  
- **Real-time Feedback**:
  - Immediate visual feedback on correct/incorrect notes
  - Statistics tracking for accuracy and progress
  
- **MIDI Integration**:
  - Connects directly to your MIDI keyboard/device
  - Automatically detects MIDI device connections/disconnections

## Requirements

- A modern web browser with Web MIDI API support (Chrome recommended)
- A MIDI keyboard or device connected to your computer
- JavaScript enabled in your browser

## Installation

1. Clone or download this repository
2. Open the `index.html` file in a compatible web browser
3. Connect your MIDI device to your computer
4. Allow MIDI access when prompted by the browser

No server or additional dependencies are required as all libraries are loaded via CDN.

## Usage

### Getting Started

1. Connect your MIDI keyboard to your computer
2. Open the application in your browser
3. The app will automatically detect your MIDI device
4. Select your preferred mode (Single Note or Note Sequence)
5. Begin playing the notes displayed on the staff

### Single Note Mode

In this mode, the application displays one note at a time:

1. A random note appears on the staff
2. Play the corresponding note on your MIDI keyboard
3. Receive immediate feedback on your accuracy
4. A new random note appears after each correct response

### Sequence Mode

In this mode, the application displays a sequence of notes:

1. A series of notes appears on the staff (2-8 notes depending on your settings)
2. Play each note in order from left to right
3. The application tracks your progress through the sequence
4. If you play an incorrect note, you'll need to restart the sequence
5. After completing a sequence correctly, a new one is generated

### Controls

- **New Note/Sequence Button**: Generate a new challenge
- **Clef Selection**: Choose which clef(s) to practice with
- **Sequence Length**: In sequence mode, select how many notes to display at once

## How It Works

The application uses:

- **VexFlow**: A JavaScript library for rendering music notation
- **Web MIDI API**: For capturing input from MIDI devices
- **Vanilla JavaScript**: For application logic and user interface

When you play a note on your MIDI keyboard, the application:
1. Captures the MIDI note number
2. Compares it to the expected note
3. Provides visual feedback
4. Updates your statistics
5. Advances to the next note or generates a new challenge

## Customization

You can modify the following aspects of the application:

- **Note Ranges**: Edit the `ranges` object in the `generateRandomNoteForClef` function
- **Visual Styling**: Modify the CSS in `styles.css`
- **Sequence Lengths**: Add or remove options in the sequence length dropdown

## Troubleshooting

### MIDI Device Not Detected

- Ensure your MIDI device is properly connected to your computer
- Try refreshing the page
- Check if your browser supports the Web MIDI API (Chrome is recommended)
- Restart your browser and/or MIDI device

### Notes Not Registering Correctly

- Check that your MIDI device is sending the correct MIDI messages
- Verify that the note ranges in the application match your device's capabilities
- Ensure there are no other applications using your MIDI device

## Future Enhancements

Potential features for future versions:

- Support for accidentals (sharps and flats)
- Rhythm reading practice
- Chord recognition mode
- Sound playback of displayed notes
- Difficulty levels with varying note ranges
- Visual keyboard display
- Custom exercise creation

## Credits

- [VexFlow](https://github.com/0xfe/vexflow) - Music notation rendering
- Web MIDI API - MIDI device integration

## License

This project is open source and available for educational and personal use.

---

Created with ♪♫ for music education



