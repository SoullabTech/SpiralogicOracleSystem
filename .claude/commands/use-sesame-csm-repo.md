# Title
Use Official SesameAILabs CSM Repo for AIN Voice Output

# Summary
Replace the current inline Python Sesame script in `voiceRouter.js` with a standardized call to the official SesameAILabs CSM generator using the Hugging Face Transformers interface and context-aware setup.

# Instructions
1. Clone the official repo from https://github.com/SesameAILabs/csm into the `external/` folder of the AIN project.
2. Ensure dependencies are met:
   - Python 3.10+
   - CUDA 12.4 (or MPS for Mac)
   - `ffmpeg` for audio saving
3. Replace the Python voice generation script with a wrapper that imports and uses `generator.py` from the cloned repo.
4. Modify `voiceRouter.js` to:
   - Import this wrapper script
   - Use it when `USE_SESAME === true`
   - Send structured prompts, including `promptMarkers`, speaker ID, and full context array
5. Add an example prompt test using:
   ```js
   const conversation = [
     { role: "0", content: [{ type: "text", text: "Oracle, what am I learning right now?" }] }
   ];
   ```
6. Ensure audio output is saved and returned to the main app flow.
7. Add a test using the matrix-oracle profile to confirm style output consistency.