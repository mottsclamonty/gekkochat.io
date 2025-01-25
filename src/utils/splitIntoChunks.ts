export function splitIntoChunks(text: string, maxChunkSize: number): string[] {
  const chunks: string[] = [];
  let currentChunk = "";

  // Split text into sentences using period and newline as delimiters
  const sentences = text.split(/(?<=\.)|\n/);

  for (const sentence of sentences) {
    // If adding the current sentence exceeds the max chunk size
    if (currentChunk.length + sentence.length > maxChunkSize) {
      chunks.push(currentChunk.trim()); // Push the current chunk
      currentChunk = ""; // Start a new chunk
    }
    currentChunk += sentence; // Add sentence to the current chunk
  }

  // Push the last chunk if any content remains
  if (currentChunk.trim().length > 0) {
    chunks.push(currentChunk.trim());
  }

  return chunks;
}
