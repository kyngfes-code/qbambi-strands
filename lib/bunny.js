const BUNNY_API_BASE = "https://video.bunnycdn.com";

function getBunnyConfig() {
  const apiKey = process.env.BUNNY_STREAM_API_KEY;
  const libraryId = process.env.BUNNY_STREAM_LIBRARY_ID;

  if (!apiKey) {
    throw new Error("BUNNY_STREAM_API_KEY is not configured.");
  }

  if (!libraryId) {
    throw new Error("BUNNY_STREAM_LIBRARY_ID is not configured.");
  }

  return {
    apiKey,
    libraryId,
  };
}

export async function createBunnyVideo({ title }) {
  const { apiKey, libraryId } = getBunnyConfig();

  const response = await fetch(
    `${BUNNY_API_BASE}/library/${libraryId}/videos`,
    {
      method: "POST",
      headers: {
        AccessKey: apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title,
      }),
      cache: "no-store",
    },
  );

  const data = await response.json();

  if (!response.ok) {
    console.error("Bunny create video error:", data);

    throw new Error(
      data?.message || data?.error || "Unable to create Bunny video.",
    );
  }

  return data;
}

export async function getBunnyVideo(videoId) {
  const { apiKey, libraryId } = getBunnyConfig();

  const response = await fetch(
    `${BUNNY_API_BASE}/library/${libraryId}/videos/${videoId}`,
    {
      method: "GET",
      headers: {
        AccessKey: apiKey,
      },
      cache: "no-store",
    },
  );

  const data = await response.json();

  if (!response.ok) {
    console.error("Bunny get video error:", data);

    throw new Error(
      data?.message || data?.error || "Unable to retrieve Bunny video.",
    );
  }

  return data;
}

export async function deleteBunnyVideo(videoId) {
  const { apiKey, libraryId } = getBunnyConfig();

  const response = await fetch(
    `${BUNNY_API_BASE}/library/${libraryId}/videos/${videoId}`,
    {
      method: "DELETE",
      headers: {
        AccessKey: apiKey,
      },
      cache: "no-store",
    },
  );

  if (!response.ok) {
    const data = await response.json().catch(() => null);

    console.error("Bunny delete video error:", data);

    throw new Error(
      data?.message || data?.error || "Unable to delete Bunny video.",
    );
  }

  return true;
}

export async function updateBunnyVideo(videoId, updates = {}) {
  if (!videoId) {
    throw new Error("Bunny video ID is required.");
  }

  if (!process.env.BUNNY_STREAM_API_KEY) {
    throw new Error("BUNNY_STREAM_API_KEY is not configured.");
  }

  const libraryId = process.env.BUNNY_STREAM_LIBRARY_ID;

  if (!libraryId) {
    throw new Error("BUNNY_STREAM_LIBRARY_ID is not configured.");
  }

  const response = await fetch(
    `https://video.bunnycdn.com/library/${libraryId}/videos/${videoId}`,
    {
      method: "POST",
      headers: {
        AccessKey: process.env.BUNNY_STREAM_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updates),
    },
  );

  if (!response.ok) {
    let errorMessage = `Bunny video update failed with status ${response.status}.`;

    try {
      const data = await response.json();

      if (data?.Message) {
        errorMessage = data.Message;
      } else if (data?.message) {
        errorMessage = data.message;
      }
    } catch {
      // Keep default error message.
    }

    throw new Error(errorMessage);
  }

  try {
    return await response.json();
  } catch {
    return {
      success: true,
    };
  }
}
