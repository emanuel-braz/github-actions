const GenerateEnhancedNotes = require('./generate_enhanced_notes.js');

(async () => {
    await new GenerateEnhancedNotes().call();
})();
