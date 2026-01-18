const tabs = document.querySelectorAll(".nav-button");
const panels = document.querySelectorAll(".panel");

const nowPlaying = document.getElementById("now-playing");
const mediaGrid = document.getElementById("media-grid");
const playlistList = document.getElementById("playlist-list");
const favorites = document.getElementById("favorites");
const tagSelect = document.getElementById("tag-track-select");
const importForm = document.getElementById("import-form");
const importUrl = document.getElementById("import-url");
const importAutoTag = document.getElementById("import-auto-tag");
const importSubmit = document.getElementById("import-submit");
const importLog = document.getElementById("import-log");

const statusVersion = document.getElementById("status-version");
const statusDevice = document.getElementById("status-device");
const statusTime = document.getElementById("status-time");

const audioPlayer = document.getElementById("audio-player");
const playerOverlay = document.getElementById("player-overlay");
const playerClose = document.getElementById("player-close");
const playerCover = document.getElementById("player-cover");
const playerTitle = document.getElementById("player-title");
const playerArtist = document.getElementById("player-artist");
const playerAlbum = document.getElementById("player-album");
const playerToggle = document.getElementById("player-toggle");
const playerPrev = document.getElementById("player-prev");
const playerNext = document.getElementById("player-next");
const playerSeek = document.getElementById("player-seek");
const playerCurrent = document.getElementById("player-current");
const playerDuration = document.getElementById("player-duration");

const miniPlayer = document.getElementById("mini-player");
const miniCover = document.getElementById("mini-cover");
const miniTitle = document.getElementById("mini-title");
const miniArtist = document.getElementById("mini-artist");
const miniToggle = document.getElementById("mini-toggle");
const miniPrev = document.getElementById("mini-prev");
const miniNext = document.getElementById("mini-next");
const miniExpand = document.getElementById("mini-expand");
const miniSeek = document.getElementById("mini-seek");
const miniCurrent = document.getElementById("mini-current");

const state = {
  tracks: [],
  playlists: [],
  favorites: [],
};

const playerState = {
  currentIndex: -1,
  isPlaying: false,
};

let isSeeking = false;
let pendingSeekPercent = null;
let lastKnownDuration = 0;
let lastKnownTime = 0;

tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    tabs.forEach((button) => button.classList.remove("is-active"));
    panels.forEach((panel) => panel.classList.remove("is-active"));
    tab.classList.add("is-active");
    const target = document.getElementById(`panel-${tab.dataset.tab}`);
    if (target) {
      target.classList.add("is-active");
    }
  });
});

const renderNowPlaying = (track) => {
  const title = track ? track.title : "空です。";
  const meta = track ? `${track.artist} ・ ${track.album}` : "--";
  nowPlaying.querySelector(".track").textContent = title;
  nowPlaying.querySelector(".meta").textContent = meta;
};

const formatTime = (seconds) => {
  if (!Number.isFinite(seconds)) {
    return "0:00";
  }
  const minutes = Math.floor(seconds / 60);
  const remainder = Math.floor(seconds % 60);
  return `${minutes}:${remainder.toString().padStart(2, "0")}`;
};

const updatePlayerButtons = () => {
  const label = playerState.isPlaying ? "一時停止" : "再生";
  if (playerToggle) {
    playerToggle.textContent = label;
  }
  if (miniToggle) {
    miniToggle.textContent = label;
  }
};

const updatePlayerUI = () => {
  if (playerState.currentIndex >= state.tracks.length) {
    playerState.currentIndex = -1;
  }
  const track = state.tracks[playerState.currentIndex];
  if (!track) {
    renderNowPlaying(null);
    if (miniPlayer) {
      miniPlayer.classList.remove("is-active");
      miniPlayer.setAttribute("aria-hidden", "true");
    }
    if (playerSeek) {
      playerSeek.value = 0;
    }
    if (miniSeek) {
      miniSeek.value = 0;
    }
    if (playerCurrent) {
      playerCurrent.textContent = "0:00";
    }
    if (miniCurrent) {
      miniCurrent.textContent = "0:00";
    }
    if (playerDuration) {
      playerDuration.textContent = "0:00";
    }
    return;
  }
  renderNowPlaying(track);
  if (playerCover) {
    playerCover.src = track.cover || "";
    playerCover.alt = track.album || track.title;
  }
  if (playerTitle) {
    playerTitle.textContent = track.title;
  }
  if (playerArtist) {
    playerArtist.textContent = track.artist;
  }
  if (playerAlbum) {
    playerAlbum.textContent = track.album;
  }
  if (miniCover) {
    miniCover.src = track.cover || "";
    miniCover.alt = track.album || track.title;
  }
  if (miniTitle) {
    miniTitle.textContent = track.title;
  }
  if (miniArtist) {
    miniArtist.textContent = track.artist;
  }
  if (miniPlayer) {
    miniPlayer.classList.add("is-active");
    miniPlayer.setAttribute("aria-hidden", "false");
  }
  updatePlayerButtons();
};

const updateSeekUI = ({ currentTime, duration, percent }) => {
  const hasDuration = Number.isFinite(duration) && duration > 0;
  if (Number.isFinite(percent)) {
    if (playerSeek) {
      playerSeek.value = percent;
    }
    if (miniSeek) {
      miniSeek.value = percent;
    }
  }
  if (Number.isFinite(currentTime) && (hasDuration || currentTime > 0)) {
    lastKnownTime = currentTime;
  }
  if (hasDuration) {
    lastKnownDuration = duration;
  }
  const displayTime = hasDuration
    ? Number.isFinite(currentTime)
      ? currentTime
      : lastKnownTime
    : lastKnownTime || (Number.isFinite(currentTime) ? currentTime : 0);
  const displayDuration = hasDuration ? duration : lastKnownDuration;
  if (playerCurrent) {
    playerCurrent.textContent = formatTime(displayTime);
  }
  if (miniCurrent) {
    miniCurrent.textContent = formatTime(displayTime);
  }
  if (playerDuration) {
    playerDuration.textContent = formatTime(displayDuration);
  }
};

const handleSeekInput = (value, { apply = false } = {}) => {
  if (!audioPlayer) {
    return;
  }
  if (!Number.isFinite(value)) {
    return;
  }
  const { duration } = audioPlayer;
  if (!Number.isFinite(duration) || duration <= 0) {
    pendingSeekPercent = value;
    const fallbackDuration = lastKnownDuration;
    if (fallbackDuration > 0) {
      const nextTime = (value / 100) * fallbackDuration;
      if (!apply) {
        updateSeekUI({
          currentTime: nextTime,
          duration: fallbackDuration,
          percent: value,
        });
      }
      return;
    }
    if (!apply) {
      updateSeekUI({
        currentTime: audioPlayer.currentTime,
        duration: 0,
        percent: value,
      });
    }
    return;
  }
  const nextTime = (value / 100) * duration;
  if (apply) {
    audioPlayer.currentTime = nextTime;
  }
  updateSeekUI({ currentTime: nextTime, duration, percent: value });
};

const openPlayerOverlay = () => {
  if (playerOverlay) {
    playerOverlay.classList.add("is-active");
    playerOverlay.setAttribute("aria-hidden", "false");
  }
};

const setTrackByIndex = (index) => {
  const track = state.tracks[index];
  if (!track) {
    return;
  }
  if (!track.file_url) {
    appendImportLog("音源が見つかりません。");
    return;
  }
  playerState.currentIndex = index;
  if (audioPlayer) {
    audioPlayer.src = track.file_url;
  }
  updatePlayerUI();
};

const togglePlayback = async () => {
  if (!audioPlayer) {
    return;
  }
  if (playerState.currentIndex === -1) {
    if (state.tracks.length > 0) {
      setTrackByIndex(0);
    } else {
      return;
    }
  }
  if (audioPlayer.paused) {
    await audioPlayer.play();
  } else {
    audioPlayer.pause();
  }
};

const playNext = () => {
  if (!state.tracks.length) {
    return;
  }
  const nextIndex = (playerState.currentIndex + 1) % state.tracks.length;
  setTrackByIndex(nextIndex);
  if (audioPlayer) {
    audioPlayer.play();
  }
};

const playPrev = () => {
  if (!state.tracks.length) {
    return;
  }
  const prevIndex =
    (playerState.currentIndex - 1 + state.tracks.length) % state.tracks.length;
  setTrackByIndex(prevIndex);
  if (audioPlayer) {
    audioPlayer.play();
  }
};

const renderMedia = () => {
  mediaGrid.innerHTML = "";
  if (state.tracks.length === 0) {
    mediaGrid.innerHTML = '<div class="empty-state">空です。</div>';
    return;
  }
  state.tracks.forEach((track) => {
    const card = document.createElement("div");
    card.className = "media-card";
    const hasAudio = Boolean(track.file_url);
    card.innerHTML = `
      <img src="${track.cover}" alt="${track.album}" />
      <h3>${track.title}</h3>
      <p>${track.artist}</p>
      <p>${track.album}</p>
      <div class="media-meta">
        <span>${track.genre} ・ ${track.year}</span>
        <span>${track.duration}</span>
      </div>
      <button class="play-button ${hasAudio ? "" : "is-disabled"}" type="button" ${
  hasAudio ? "" : "disabled"
}>${hasAudio ? "再生" : "音源なし"}</button>
    `;
    card.querySelector("button").addEventListener("click", () => {
      const index = state.tracks.findIndex((item) => item.id === track.id);
      if (index >= 0) {
        setTrackByIndex(index);
        togglePlayback();
      }
    });
    mediaGrid.appendChild(card);
  });
};

const renderPlaylists = () => {
  playlistList.innerHTML = "";
  if (state.playlists.length === 0) {
    playlistList.innerHTML = '<div class="empty-state">空です。</div>';
    return;
  }
  state.playlists.forEach((playlist) => {
    const trackNames = playlist.track_ids
      .map((id) => state.tracks.find((track) => track.id === id))
      .filter(Boolean)
      .map((track) => `${track.title} / ${track.artist}`);

    const card = document.createElement("div");
    card.className = "playlist-card";
    card.innerHTML = `
      <h3>${playlist.name}</h3>
      <p>収録曲数: ${playlist.track_ids.length}</p>
      <ul>
        ${trackNames.map((name) => `<li>${name}</li>`).join("")}
      </ul>
      <button class="secondary" type="button">再生キューへ送る</button>
    `;
    playlistList.appendChild(card);
  });
};

const renderFavorites = () => {
  favorites.innerHTML = `
    <h3>お気に入り</h3>
    <p>よく聴く楽曲のショートカット。</p>
  `;
  const favoriteTracks = state.favorites
    .map((id) => state.tracks.find((track) => track.id === id))
    .filter(Boolean);
  if (favoriteTracks.length === 0) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.textContent = "空です。";
    favorites.appendChild(empty);
    return;
  }
  const list = document.createElement("ul");
  favoriteTracks.forEach((track) => {
    const item = document.createElement("li");
    item.textContent = `${track.title} / ${track.artist}`;
    item.addEventListener("click", () => {
      const index = state.tracks.findIndex((itemTrack) => itemTrack.id === track.id);
      if (index >= 0) {
        setTrackByIndex(index);
        togglePlayback();
      }
    });
    list.appendChild(item);
  });
  favorites.appendChild(list);
};

const renderTagOptions = () => {
  if (!tagSelect) {
    return;
  }
  if (state.tracks.length === 0) {
    tagSelect.innerHTML = '<option value="">空です。</option>';
    return;
  }
  tagSelect.innerHTML = state.tracks
    .map(
      (track) => `<option value="${track.id}">${track.title} / ${track.artist}</option>`
    )
    .join("");
};

const fetchJson = async (path) => {
  const response = await fetch(path);
  if (!response.ok) {
    throw new Error(`Failed to load ${path}`);
  }
  return response.json();
};

const postJson = async (path, payload) => {
  const response = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Failed to post ${path}`);
  }
  return response.json();
};

const refreshLibrary = async () => {
  const [tracks, playlists, favoritesData] = await Promise.all([
    fetchJson("/api/library"),
    fetchJson("/api/playlists"),
    fetchJson("/api/favorites"),
  ]);
  state.tracks = tracks;
  state.playlists = playlists;
  state.favorites = favoritesData;
  renderMedia();
  renderPlaylists();
  renderFavorites();
  renderTagOptions();
  updatePlayerUI();
};

const appendImportLog = (message) => {
  if (!importLog) {
    return;
  }
  const maxLength = 3000;
  if (message.length > maxLength) {
    importLog.textContent = `ログが長いため末尾のみ表示します。\n\n${message.slice(
      -maxLength
    )}`;
    return;
  }
  importLog.textContent = message;
};

const handleImportSubmit = async () => {
  const url = importUrl?.value?.trim();
  if (!url) {
    appendImportLog("URL を入力してください。");
    return;
  }
  const payload = {
    url,
  };
  payload.auto_tag = Boolean(importAutoTag?.checked);
  appendImportLog("yt-dlp を実行中...");
  try {
    const response = await postJson("/api/library/import", payload);
    appendImportLog(response.log || "取り込み完了。");
    await refreshLibrary();
    importUrl.value = "";
  } catch (error) {
    appendImportLog(`エラー: ${error.message}`);
  }
};

const init = async () => {
  try {
    const [tracks, playlists, favoritesData, status] = await Promise.all([
      fetchJson("/api/library"),
      fetchJson("/api/playlists"),
      fetchJson("/api/favorites"),
      fetchJson("/api/status"),
    ]);

    state.tracks = tracks;
    state.playlists = playlists;
    state.favorites = favoritesData;

    renderMedia();
    renderPlaylists();
    renderFavorites();
    renderTagOptions();
    updatePlayerUI();
    if (tracks.length === 0) {
      renderNowPlaying(null);
    } else {
      renderNowPlaying(tracks[0]);
    }

    statusVersion.textContent = status.version;
    statusDevice.textContent = status.device;
    statusTime.textContent = status.time;
  } catch (error) {
    console.error(error);
  }
};

if (importSubmit) {
  importSubmit.addEventListener("click", () => {
    handleImportSubmit();
  });
}

if (importForm) {
  importForm.addEventListener("submit", (event) => {
    event.preventDefault();
    handleImportSubmit();
  });
}

if (audioPlayer) {
  audioPlayer.addEventListener("play", () => {
    playerState.isPlaying = true;
    updatePlayerButtons();
  });

  audioPlayer.addEventListener("pause", () => {
    playerState.isPlaying = false;
    updatePlayerButtons();
  });

  audioPlayer.addEventListener("timeupdate", () => {
    const { currentTime, duration } = audioPlayer;
    const percent = duration ? Math.floor((currentTime / duration) * 100) : 0;
    if (isSeeking) {
      return;
    }
    updateSeekUI({ currentTime, duration, percent });
  });

  audioPlayer.addEventListener("loadedmetadata", () => {
    const { duration, currentTime } = audioPlayer;
    if (pendingSeekPercent !== null) {
      handleSeekInput(pendingSeekPercent, { apply: true });
      pendingSeekPercent = null;
      return;
    }
    if (Number.isFinite(duration) && duration > 0) {
      const percent = Math.floor((currentTime / duration) * 100);
      updateSeekUI({ currentTime, duration, percent });
    }
  });

  audioPlayer.addEventListener("ended", () => {
    playNext();
  });
}

const bindSeekEvents = (seekElement) => {
  if (!seekElement) {
    return;
  }
  const startSeek = () => {
    isSeeking = true;
  };
  const endSeek = (event) => {
    isSeeking = false;
    const value = Number(event.target.value);
    handleSeekInput(value, { apply: true });
  };
  seekElement.addEventListener("input", (event) => {
    const value = Number(event.target.value);
    handleSeekInput(value, { apply: false });
  });
  seekElement.addEventListener("pointerdown", startSeek);
  seekElement.addEventListener("pointerup", endSeek);
  seekElement.addEventListener("pointercancel", () => {
    isSeeking = false;
  });
  seekElement.addEventListener("mousedown", startSeek);
  seekElement.addEventListener("mouseup", endSeek);
  seekElement.addEventListener("touchstart", startSeek, { passive: true });
  seekElement.addEventListener("touchend", endSeek);
  seekElement.addEventListener("change", endSeek);
};

if (audioPlayer) {
  bindSeekEvents(playerSeek);
  bindSeekEvents(miniSeek);
}

if (playerToggle) {
  playerToggle.addEventListener("click", () => {
    togglePlayback();
  });
}

if (miniToggle) {
  miniToggle.addEventListener("click", () => {
    togglePlayback();
  });
}

if (playerPrev) {
  playerPrev.addEventListener("click", () => {
    playPrev();
  });
}

if (playerNext) {
  playerNext.addEventListener("click", () => {
    playNext();
  });
}

if (miniPrev) {
  miniPrev.addEventListener("click", () => {
    playPrev();
  });
}

if (miniNext) {
  miniNext.addEventListener("click", () => {
    playNext();
  });
}

if (miniExpand) {
  miniExpand.addEventListener("click", () => {
    openPlayerOverlay();
  });
}

if (playerClose) {
  playerClose.addEventListener("click", () => {
    if (playerOverlay) {
      playerOverlay.classList.remove("is-active");
      playerOverlay.setAttribute("aria-hidden", "true");
    }
  });
}

if (nowPlaying) {
  nowPlaying.addEventListener("click", () => {
    if (playerState.currentIndex >= 0) {
      openPlayerOverlay();
    }
  });
}

init();
