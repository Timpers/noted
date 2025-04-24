document.addEventListener("DOMContentLoaded", () => {
  // VexFlow setup
  const VF = Vex.Flow

  // DOM elements
  const scoreDiv = document.getElementById("score")
  const feedbackDiv = document.getElementById("feedback")
  const midiStatusMessage = document.getElementById("midi-status-message")
  const newNoteBtn = document.getElementById("new-note-btn")
  const trebleClefCheckbox = document.getElementById("treble-clef")
  const bassClefCheckbox = document.getElementById("bass-clef")
  const correctCountElement = document.getElementById("correct-count")
  const attemptCountElement = document.getElementById("attempt-count")
  const accuracyElement = document.getElementById("accuracy")
  const singleNoteModeBtn = document.getElementById("single-note-mode")
  const sequenceModeBtn = document.getElementById("sequence-mode")
  const sequenceSettings = document.getElementById("sequence-settings")
  const sequenceLengthSelect = document.getElementById("sequence-length")

  // App state
  let currentNote = null
  let midiAccess = null
  let currentMode = "single" // "single" or "sequence"
  let noteSequence = []
  let currentNoteIndex = 0
  const stats = {
    correct: 0,
    attempts: 0,
  }

  // Note mapping (MIDI note number to note name)
  const noteNames = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]

  // Initialize the app
  init()

  async function init() {
    try {
      // Request MIDI access
      midiAccess = await navigator.requestMIDIAccess()
      setupMIDIListeners()
      midiStatusMessage.textContent = "MIDI device connected! Play the displayed note."
      midiStatusMessage.style.color = "#155724"
    } catch (error) {
      midiStatusMessage.textContent =
        "Failed to access MIDI devices. Please ensure your MIDI device is connected and try again."
      midiStatusMessage.style.color = "#721c24"
      console.error("MIDI Access Error:", error)
    }

    // Set up event listeners
    newNoteBtn.addEventListener("click", generateNewChallenge)
    trebleClefCheckbox.addEventListener("change", generateNewChallenge)
    bassClefCheckbox.addEventListener("change", () => {
      if (!trebleClefCheckbox.checked && !bassClefCheckbox.checked) {
        trebleClefCheckbox.checked = true
      }
      generateNewChallenge()
    })

    // Mode toggle event listeners
    singleNoteModeBtn.addEventListener("click", () => {
      if (currentMode !== "single") {
        currentMode = "single"
        updateModeUI()
        generateNewChallenge()
      }
    })

    sequenceModeBtn.addEventListener("click", () => {
      if (currentMode !== "sequence") {
        currentMode = "sequence"
        updateModeUI()
        generateNewChallenge()
      }
    })

    sequenceLengthSelect.addEventListener("change", () => {
      if (currentMode === "sequence") {
        generateNewChallenge()
      }
    })

    // Generate the first challenge
    generateNewChallenge()
  }

  function setupMIDIListeners() {
    // Listen for MIDI input
    for (const input of midiAccess.inputs.values()) {
      input.onmidimessage = handleMIDIMessage
    }

    // Listen for MIDI device connections/disconnections
    midiAccess.onstatechange = (event) => {
      if (event.port.type === "input") {
        if (event.port.state === "connected") {
          event.port.onmidimessage = handleMIDIMessage
          midiStatusMessage.textContent = "MIDI device connected! Play the displayed note."
          midiStatusMessage.style.color = "#155724"
        } else if (event.port.state === "disconnected") {
          midiStatusMessage.textContent = "MIDI device disconnected. Please reconnect your device."
          midiStatusMessage.style.color = "#721c24"
        }
      }
    }
  }

  function handleMIDIMessage(message) {
    // MIDI message data: [status, note, velocity]
    const [status, note, velocity] = message.data

    // Note on event (status byte starts with 9)
    if ((status & 0xf0) === 0x90 && velocity > 0) {
      checkNote(note)
    }
  }

  function checkNote(midiNote) {
    if (!currentNote) return

    stats.attempts++

    // Get the MIDI note number of the current displayed note
    const currentMidiNote = getMIDINoteFromVexflowNote(currentNote)

    // Check if the played note matches the displayed note
    if (midiNote === currentMidiNote) {
      if (currentMode === "single") {
        // Single note mode
        feedbackDiv.textContent = "Correct! 🎉"
        feedbackDiv.className = "feedback correct"
        stats.correct++

        // Generate a new note after a short delay
        setTimeout(generateNewChallenge, 1000)
      } else {
        // Sequence mode
        stats.correct++

        // Move to the next note in the sequence
        currentNoteIndex++

        if (currentNoteIndex < noteSequence.length) {
          // More notes to play
          currentNote = noteSequence[currentNoteIndex]

          // Update the indicator
          const indicator = document.getElementById("current-note-indicator")
          indicator.textContent = `Play note ${currentNoteIndex + 1} of ${noteSequence.length}`

          feedbackDiv.textContent = "Correct! Now play the next note."
          feedbackDiv.className = "feedback correct"
        } else {
          // Sequence completed
          feedbackDiv.textContent = "Sequence completed correctly! 🎉"
          feedbackDiv.className = "feedback correct"

          // Generate a new sequence after a delay
          setTimeout(generateNewChallenge, 1500)
        }
      }
    } else {
      // Incorrect note
      const playedNoteName = getNoteNameFromMIDI(midiNote)
      feedbackDiv.textContent = `Incorrect. You played ${playedNoteName}, but the note was ${getNoteNameFromMIDI(currentMidiNote)}.`
      feedbackDiv.className = "feedback incorrect"

      if (currentMode === "sequence") {
        // For sequence mode, restart the sequence on error
        setTimeout(() => {
          currentNoteIndex = 0
          currentNote = noteSequence[currentNoteIndex]

          // Update the indicator
          const indicator = document.getElementById("current-note-indicator")
          indicator.textContent = `Play note 1 of ${noteSequence.length}`

          feedbackDiv.textContent = "Let's try the sequence again from the beginning."
          feedbackDiv.className = "feedback"
        }, 1500)
      }
    }

    updateStats()
  }

  function updateStats() {
    correctCountElement.textContent = stats.correct
    attemptCountElement.textContent = stats.attempts
    const accuracy = stats.attempts > 0 ? Math.round((stats.correct / stats.attempts) * 100) : 0
    accuracyElement.textContent = `${accuracy}%`
  }

  function updateModeUI() {
    // Update button styles
    singleNoteModeBtn.classList.toggle("active", currentMode === "single")
    sequenceModeBtn.classList.toggle("active", currentMode === "sequence")

    // Show/hide sequence settings
    sequenceSettings.style.display = currentMode === "sequence" ? "block" : "none"

    // Update button text
    newNoteBtn.textContent = currentMode === "single" ? "New Note" : "New Sequence"
  }

  function generateNewChallenge() {
    if (currentMode === "single") {
      generateSingleNote()
    } else {
      generateNoteSequence()
    }
  }

  function generateSingleNote() {
    // Clear the score div
    scoreDiv.innerHTML = ""

    // Create a new renderer and context
    const renderer = new VF.Renderer(scoreDiv, VF.Renderer.Backends.SVG)
    renderer.resize(700, 150)
    const context = renderer.getContext()
    context.setFont("Arial", 10)

    // Create a stave
    const stave = new VF.Stave(10, 40, 680)

    // Determine which clef to use
    let clef = "treble"
    if (trebleClefCheckbox.checked && bassClefCheckbox.checked) {
      // Randomly choose between treble and bass clef
      clef = Math.random() < 0.5 ? "treble" : "bass"
    } else if (bassClefCheckbox.checked) {
      clef = "bass"
    }

    stave.addClef(clef)
    stave.setContext(context).draw()

    // Generate a random note
    const note = generateRandomNoteForClef(clef)
    currentNote = note
    noteSequence = [note]
    currentNoteIndex = 0

    // Create a voice and add the note
    const voice = new VF.Voice({ num_beats: 4, beat_value: 4 })
    voice.addTickables([note])

    // Format and draw the voice
    new VF.Formatter().joinVoices([voice]).format([voice], 500)
    voice.draw(context, stave)

    // Reset feedback
    feedbackDiv.textContent = "Play the note shown above"
    feedbackDiv.className = "feedback"
  }

  function generateNoteSequence() {
    // Clear the score div
    scoreDiv.innerHTML = ""

    // Create a new renderer and context
    const renderer = new VF.Renderer(scoreDiv, VF.Renderer.Backends.SVG)
    renderer.resize(700, 150)
    const context = renderer.getContext()
    context.setFont("Arial", 10)

    // Create a stave
    const stave = new VF.Stave(10, 40, 680)

    // Determine which clef to use
    let clef = "treble"
    if (trebleClefCheckbox.checked && bassClefCheckbox.checked) {
      // Randomly choose between treble and bass clef
      clef = Math.random() < 0.5 ? "treble" : "bass"
    } else if (bassClefCheckbox.checked) {
      clef = "bass"
    }

    stave.addClef(clef)
    stave.setContext(context).draw()

    // Get sequence length
    const sequenceLength = Number.parseInt(sequenceLengthSelect.value, 10)

    // Generate random notes
    noteSequence = []
    for (let i = 0; i < sequenceLength; i++) {
      noteSequence.push(generateRandomNoteForClef(clef))
    }

    currentNoteIndex = 0
    currentNote = noteSequence[currentNoteIndex]

    // Create a voice and add the notes
    const voice = new VF.Voice({ num_beats: sequenceLength, beat_value: 1 })
    voice.addTickables(noteSequence)

    // Format and draw the voice
    new VF.Formatter().joinVoices([voice]).format([voice], 600)
    voice.draw(context, stave)

    // Add a current note indicator
    const indicatorDiv = document.createElement("div")
    indicatorDiv.className = "current-note-indicator"
    indicatorDiv.id = "current-note-indicator"
    indicatorDiv.textContent = `Play note 1 of ${sequenceLength}`
    scoreDiv.appendChild(indicatorDiv)

    // Reset feedback
    feedbackDiv.textContent = "Play the sequence of notes shown above"
    feedbackDiv.className = "feedback"
  }

  function generateRandomNoteForClef(clef) {
    // Define note ranges for each clef
    const ranges = {
      treble: { min: "c/4", max: "a/5" }, // Middle C to A5
      bass: { min: "e/2", max: "c/4" }, // E2 to Middle C
    }

    // Get random note keys based on the clef
    const keys = getRandomNoteKeys(ranges[clef].min, ranges[clef].max)

    // Create a StaveNote with the random key
    return new VF.StaveNote({ clef, keys: [keys], duration: "w" })
  }

  function getRandomNoteKeys(minNote, maxNote) {
    // Convert note strings to MIDI note numbers
    const minMidi = getVexflowNoteToMIDI(minNote)
    const maxMidi = getVexflowNoteToMIDI(maxNote)

    // Generate a random MIDI note number within the range
    const randomMidi = Math.floor(Math.random() * (maxMidi - minMidi + 1)) + minMidi

    // Convert back to Vexflow note format
    return getMIDIToVexflowNote(randomMidi)
  }

  function getVexflowNoteToMIDI(vfNote) {
    // Parse the Vexflow note format (e.g., "c/4")
    const [noteName, octave] = vfNote.split("/")

    // Get the base note value (C = 0, D = 2, etc.)
    const noteValue = "c d e f g a b".split(" ").indexOf(noteName.toLowerCase())

    // Calculate the MIDI note number
    return 12 * (Number.parseInt(octave) + 1) + noteValue
  }

  function getMIDIToVexflowNote(midiNote) {
    // Calculate the octave
    const octave = Math.floor(midiNote / 12) - 1

    // Calculate the note name index (0 = C, 2 = D, etc.)
    const noteIndex = midiNote % 12

    // Map to note names (ignoring sharps/flats for simplicity)
    const noteNames = ["c", "c", "d", "d", "e", "f", "f", "g", "g", "a", "a", "b"]
    const noteName = noteNames[noteIndex]

    // Return in Vexflow format
    return `${noteName}/${octave}`
  }

  function getMIDINoteFromVexflowNote(vfNote) {
    // Get the key from the StaveNote
    const key = vfNote.getKeys()[0]

    // Convert to MIDI note number
    return getVexflowNoteToMIDI(key)
  }

  function getNoteNameFromMIDI(midiNote) {
    const octave = Math.floor(midiNote / 12) - 1
    const noteIndex = midiNote % 12
    return noteNames[noteIndex] + octave
  }
})
