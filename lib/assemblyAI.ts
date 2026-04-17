import { AssemblyAI } from "assemblyai";

const client = new AssemblyAI({
  apiKey: process.env.ASSEMBLYAI_API_KEY as string,
});

const run = async (audioFile: string = "./test-audio.mp3") => {
  const params = {
    audio: audioFile,
    language_detection: true,
    speech_models: ["universal-3-pro", "universal-2"],
  };

  try {
    const transcript = await client.transcripts.transcribe(params);
    return transcript.text;
  } catch (error) {
    console.error("Error transcribing file:", error);
  }
};

if (require.main === module || !process.env.NEXT_RUNTIME) {
  const targetFile = process.argv[2] || "./test-audio.mp3";
  run(targetFile).catch(console.error);
}

export { run };
