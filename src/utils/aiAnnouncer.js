/**
 * src/utils/aiAnnouncer.js
 * AI DJ Speaker — calls Claude to generate hype announcements per song
 */

const ANTHROPIC_API = 'https://api.anthropic.com/v1/messages';

/**
 * Generate an energetic DJ-style announcement for the current song.
 * Returns null on any error so music playback is never affected.
 * @param {object} song - DisTube Song object
 * @returns {Promise<string|null>}
 */
async function generateAnnouncement(song) {
  if (!process.env.ANTHROPIC_API_KEY) return null;

  try {
    const res = await fetch(ANTHROPIC_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 120,
        system: `You are "BeatsBot", a legendary hype DJ for a Discord music bot called PremiumBeats.
When given a song and artist, write ONE short (1–2 sentence), energetic, fun DJ announcement.
Rules:
- Use relevant music emojis (🔥🎵🎶🎤🥁🎸etc.)
- Be enthusiastic but NOT cringe — imagine a cool radio DJ
- Vary your style: sometimes mention the genre/vibe, sometimes hype the crowd, sometimes a fun fact
- Max 150 characters
- Do NOT use quotation marks around the song title
- Speak in present tense as if on a live show`,
        messages: [{
          role: 'user',
          content: `Song: ${song.name}\nArtist: ${song.uploader?.name ?? 'Unknown'}`,
        }],
      }),
    });

    if (!res.ok) return null;
    const data = await res.json();
    return data.content?.[0]?.text?.trim() ?? null;
  } catch {
    return null; // Never crash music over an API error
  }
}

module.exports = { generateAnnouncement };
