import crypto from "crypto";

const BUNNY_PLAYER_BASE = "https://player.mediadelivery.net";

function getBunnyStreamConfig() {
  const libraryId = process.env.BUNNY_STREAM_LIBRARY_ID;
  const tokenKey = process.env.BUNNY_STREAM_TOKEN_KEY;

  if (!libraryId) {
    throw new Error("BUNNY_STREAM_LIBRARY_ID is not configured.");
  }

  if (!tokenKey) {
    throw new Error("BUNNY_STREAM_TOKEN_KEY is not configured.");
  }

  return {
    libraryId,
    tokenKey,
  };
}

/**
 * Creates a secure Bunny Stream embed URL.
 *
 * Bunny token:
 * SHA256_HEX(tokenKey + videoId + expiration)
 */
export function createBunnyEmbedUrl(videoId, expiresInSeconds = 3600) {
  if (!videoId) {
    throw new Error("Bunny video ID is required.");
  }

  const { libraryId, tokenKey } = getBunnyStreamConfig();

  const expiration = Math.floor(Date.now() / 1000) + expiresInSeconds;

  const token = crypto
    .createHash("sha256")
    .update(`${tokenKey}${videoId}${expiration}`)
    .digest("hex");

  const url = new URL(`${BUNNY_PLAYER_BASE}/embed/${libraryId}/${videoId}`);

  url.searchParams.set("token", token);
  url.searchParams.set("expires", String(expiration));

  // Player settings
  url.searchParams.set("autoplay", "false");
  url.searchParams.set("preload", "true");
  url.searchParams.set("responsive", "true");
  url.searchParams.set("playsinline", "true");
  url.searchParams.set("showSpeed", "true");
  url.searchParams.set("rememberPosition", "false");

  return url.toString();
}
