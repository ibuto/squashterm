const tabs = document.querySelectorAll(".nav-button");
const panels = document.querySelectorAll(".panel");

const mediaGrid = document.getElementById("media-grid");
const mediaViewToggle = document.getElementById("media-view-toggle");
const playlistList = document.getElementById("playlist-list");
const favorites = document.getElementById("favorites");
const tagSelect = document.getElementById("tag-track-select");
const tagTitleInput = document.getElementById("tag-title");
const tagArtistInput = document.getElementById("tag-artist");
const tagAlbumInput = document.getElementById("tag-album");
const importForm = document.getElementById("import-form");
const importUrl = document.getElementById("import-url");
const importAutoTag = document.getElementById("import-auto-tag");
const importSubmit = document.getElementById("import-submit");
const importLog = document.getElementById("import-log");

const statusVersion = document.getElementById("status-version");
const statusDevice = document.getElementById("status-device");
const statusTime = document.getElementById("status-time");
const settingsVersionList = document.getElementById("settings-version-list");
const settingsStorageBar = document.getElementById("settings-storage-bar");
const settingsStorageText = document.getElementById("settings-storage-text");
const settingsPlaybackOptions = document.getElementById("settings-playback-options");
const systemInfoList = document.getElementById("system-info-list");

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
const playerStop = document.getElementById("player-stop");
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
const miniStop = document.getElementById("mini-stop");
const miniExpand = document.getElementById("mini-expand");
const miniSeek = document.getElementById("mini-seek");
const miniCurrent = document.getElementById("mini-current");
const miniDuration = document.getElementById("mini-duration");

const state = {
  tracks: [],
  playlists: [],
  favorites: [],
};

const playerState = {
  currentIndex: -1,
  isPlaying: false,
};

const mediaViewState = {
  mode: "grid",
};

const supportsMediaSession = "mediaSession" in navigator;

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
  [playerToggle, miniToggle].forEach((button) => {
    if (!button) {
      return;
    }
    button.classList.toggle("is-playing", playerState.isPlaying);
    button.setAttribute("aria-label", label);
    const labelSpan = button.querySelector(".sr-only");
    if (labelSpan) {
      labelSpan.textContent = label;
    }
  });
  updateMediaPlayingIndicator();
};

const setTagFields = (track) => {
  if (!track) {
    if (tagTitleInput) {
      tagTitleInput.value = "";
    }
    if (tagArtistInput) {
      tagArtistInput.value = "";
    }
    if (tagAlbumInput) {
      tagAlbumInput.value = "";
    }
    return;
  }
  if (tagTitleInput) {
    tagTitleInput.value = track.title;
  }
  if (tagArtistInput) {
    tagArtistInput.value = track.artist;
  }
  if (tagAlbumInput) {
    tagAlbumInput.value = track.album;
  }
};

const updateMediaViewToggle = () => {
  if (!mediaViewToggle) {
    return;
  }
  const isList = mediaViewState.mode === "list";
  mediaViewToggle.textContent = isList ? "アルバム表示" : "リスト表示";
  mediaViewToggle.setAttribute("aria-pressed", isList ? "true" : "false");
};

const updateMediaPlayingIndicator = () => {
  const rows = document.querySelectorAll(".media-list-row");
  if (!rows.length) {
    return;
  }
  const currentTrack = state.tracks[playerState.currentIndex];
  rows.forEach((row) => {
    const isCurrent =
      currentTrack && String(row.dataset.trackId) === String(currentTrack.id);
    row.classList.toggle("is-playing", Boolean(isCurrent && playerState.isPlaying));
  });
};

const updatePlayerUI = () => {
  if (playerState.currentIndex >= state.tracks.length) {
    playerState.currentIndex = -1;
  }
  const track = state.tracks[playerState.currentIndex];
  if (!track) {
    if (playerCover) {
      playerCover.src = "";
      playerCover.alt = "";
    }
    if (playerTitle) {
      playerTitle.textContent = "--";
    }
    if (playerArtist) {
      playerArtist.textContent = "--";
    }
    if (playerAlbum) {
      playerAlbum.textContent = "--";
    }
    if (miniCover) {
      miniCover.src = "";
      miniCover.alt = "";
    }
    if (miniTitle) {
      miniTitle.textContent = "--";
    }
    if (miniArtist) {
      miniArtist.textContent = "--";
    }
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
    if (playerDuration) {
      playerDuration.textContent = "0:00";
    }
    if (miniCurrent) {
      miniCurrent.textContent = "0:00";
    }
    if (miniDuration) {
      miniDuration.textContent = "0:00";
    }
    if (supportsMediaSession) {
      navigator.mediaSession.metadata = null;
      navigator.mediaSession.playbackState = "none";
    }
    updateMediaPlayingIndicator();
    return;
  }
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
  updateMediaSessionMetadata(track);
  updateMediaPlayingIndicator();
};

const openPlayerOverlay = () => {
  if (playerOverlay) {
    playerOverlay.classList.add("is-active");
    playerOverlay.setAttribute("aria-hidden", "false");
  }
  updatePlayerUI();
  updatePlayerButtons();
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

const stopPlayback = () => {
  if (!audioPlayer) {
    return;
  }
  audioPlayer.pause();
  audioPlayer.currentTime = 0;
  audioPlayer.removeAttribute("src");
  audioPlayer.load();
  playerState.currentIndex = -1;
  playerState.isPlaying = false;
  updatePlayerUI();
  updatePlayerButtons();
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
  if (mediaViewState.mode === "list") {
    mediaGrid.classList.add("is-list");
  } else {
    mediaGrid.classList.remove("is-list");
  }
  if (state.tracks.length === 0) {
    mediaGrid.innerHTML = '<div class="empty-state">項目が存在しません。</div>';
    return;
  }
  if (mediaViewState.mode === "list") {
    const list = document.createElement("div");
    list.className = "media-list";
    list.innerHTML = `
      <div class="media-list-header">
        <span></span>
        <span>アート</span>
        <span>タイトル</span>
        <span>アーティスト</span>
        <span>再生時間</span>
      </div>
    `;
    state.tracks.forEach((track) => {
      const row = document.createElement("button");
      row.type = "button";
      row.className = "media-list-row";
      row.dataset.trackId = track.id;
      const hasAudio = Boolean(track.file_url);
      row.disabled = !hasAudio;
      if (!hasAudio) {
        row.classList.add("is-disabled");
      }
      row.innerHTML = `
        <span class="media-list-status" aria-hidden="true">
          <svg class="media-playing-icon" viewBox="0 0 24 24">
            <polygon points="8,5 19,12 8,19" />
          </svg>
        </span>
        <img class="media-list-cover" src="${track.cover}" alt="${track.album}" />
        <span class="media-list-title">${track.title}</span>
        <span class="media-list-artist">${track.artist}</span>
        <span class="media-list-duration">${track.duration}</span>
      `;
      if (hasAudio) {
        row.addEventListener("click", () => {
          const index = state.tracks.findIndex((item) => item.id === track.id);
          if (index >= 0) {
            setTrackByIndex(index);
            togglePlayback();
          }
        });
      }
      list.appendChild(row);
    });
    mediaGrid.appendChild(list);
    updateMediaPlayingIndicator();
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
    playlistList.innerHTML = '<div class="empty-state">項目が存在しません。</div>';
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
    empty.textContent = "項目が存在しません。";
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
    tagSelect.innerHTML = '<option value="">項目が存在しません。</option>';
    setTagFields(null);
    return;
  }
  tagSelect.innerHTML = state.tracks
    .map(
      (track) => `<option value="${track.id}">${track.title} / ${track.artist}</option>`
    )
    .join("");
  if (!tagSelect.value) {
    tagSelect.value = String(state.tracks[0].id);
  }
  const selectedTrack = state.tracks.find(
    (track) => String(track.id) === String(tagSelect.value)
  );
  setTagFields(selectedTrack);
};

const renderSettings = (settings) => {
  if (settingsVersionList) {
    const version = settings?.version || {};
    settingsVersionList.innerHTML = [
      `<li>アプリ: <strong>${version.app || "--"}</strong></li>`,
      `<li>API: <strong>${version.api || "--"}</strong></li>`,
      `<li>ビルド: <strong>${version.build || "--"}</strong></li>`,
    ].join("");
  }
  if (settingsPlaybackOptions) {
    const options = settings?.playback_options || [];
    settingsPlaybackOptions.innerHTML = "";
    if (options.length === 0) {
      settingsPlaybackOptions.innerHTML = '<p class="empty-state">項目が存在しません。</p>';
    } else {
      options.forEach((option) => {
        const label = document.createElement("label");
        label.className = "checkbox";
        const input = document.createElement("input");
        input.type = "checkbox";
        input.checked = Boolean(option.enabled);
        input.disabled = true;
        const span = document.createElement("span");
        span.textContent = option.label || option.id || "--";
        label.appendChild(input);
        label.appendChild(span);
        settingsPlaybackOptions.appendChild(label);
      });
    }
  }
};

const renderSystem = (system) => {
  if (!system) {
    return;
  }
  if (settingsStorageBar && settingsStorageText) {
    const storage = system.storage || {};
    const used = Number(storage.used_gb ?? 0);
    const total = Number(storage.total_gb ?? 0);
    const free = Number(storage.free_gb ?? 0);
    const percent = Math.max(0, Math.min(100, Number(storage.percent ?? 0)));
    settingsStorageBar.style.width = `${percent}%`;
    settingsStorageText.textContent = `使用中: ${used.toFixed(
      1
    )}GB / ${total.toFixed(1)}GB（空き ${free.toFixed(1)}GB）`;
  }
  if (systemInfoList) {
    const os = system.os || "--";
    const hostname = system.hostname || "--";
    systemInfoList.innerHTML = [
      `<li>ホスト名: <strong>${hostname}</strong></li>`,
      `<li>OS: <strong>${os}</strong></li>`,
    ].join("");
  }
};

const updateMediaSessionMetadata = (track) => {
  if (!supportsMediaSession || !track) {
    return;
  }
  const artwork = track.cover
    ? [
        {
          src: track.cover,
          sizes: "512x512",
          type: "image/png",
        },
      ]
    : [];
  navigator.mediaSession.metadata = new MediaMetadata({
    title: track.title || "",
    artist: track.artist || "",
    album: track.album || "",
    artwork,
  });
};

const updateMediaSessionPlaybackState = () => {
  if (!supportsMediaSession || !audioPlayer) {
    return;
  }
  navigator.mediaSession.playbackState = audioPlayer.paused ? "paused" : "playing";
};

const updateMediaSessionPosition = () => {
  if (!supportsMediaSession || !audioPlayer || !audioPlayer.duration) {
    return;
  }
  if (typeof navigator.mediaSession.setPositionState === "function") {
    navigator.mediaSession.setPositionState({
      duration: audioPlayer.duration,
      playbackRate: audioPlayer.playbackRate,
      position: audioPlayer.currentTime,
    });
  }
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
  updateMediaViewToggle();
  renderPlaylists();
  renderFavorites();
  renderTagOptions();
  updatePlayerUI();
};

const appendImportLog = (message) => {
  if (!importLog) {
    return;
  }

  // TODO: このような処理は許されないので修正する
  const maxLength = 3000;
  if (message.length > maxLength) {
    importLog.textContent = `\n\n${message.slice(
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
    const [tracks, playlists, favoritesData, status, settings, system] =
      await Promise.all([
        fetchJson("/api/library"),
        fetchJson("/api/playlists"),
        fetchJson("/api/favorites"),
        fetchJson("/api/status"),
        fetchJson("/api/settings"),
        fetchJson("/api/system"),
      ]);

    state.tracks = tracks;
    state.playlists = playlists;
    state.favorites = favoritesData;

    renderMedia();
    updateMediaViewToggle();
    renderPlaylists();
    renderFavorites();
    renderTagOptions();
    updatePlayerUI();
    if (tracks.length === 0) {
      updatePlayerUI();
    }

    if (statusVersion) {
      statusVersion.textContent = status.version;
    }
    if (statusDevice) {
      statusDevice.textContent = status.device;
    }
    if (statusTime) {
      statusTime.textContent = status.time;
    }
    renderSettings(settings);
    renderSystem(system);
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

if (tagSelect) {
  tagSelect.addEventListener("change", () => {
    const selectedTrack = state.tracks.find(
      (track) => String(track.id) === String(tagSelect.value)
    );
    setTagFields(selectedTrack);
  });
}

if (mediaViewToggle) {
  mediaViewToggle.addEventListener("click", () => {
    mediaViewState.mode = mediaViewState.mode === "list" ? "grid" : "list";
    updateMediaViewToggle();
    renderMedia();
  });
}

if (audioPlayer) {
  audioPlayer.addEventListener("play", () => {
    playerState.isPlaying = true;
    updatePlayerButtons();
    updateMediaSessionPlaybackState();
  });

  audioPlayer.addEventListener("pause", () => {
    playerState.isPlaying = false;
    updatePlayerButtons();
    updateMediaSessionPlaybackState();
  });

  audioPlayer.addEventListener("timeupdate", () => {
    const { currentTime, duration } = audioPlayer;
    const percent = duration ? Math.floor((currentTime / duration) * 100) : 0;
    if (playerSeek) {
      playerSeek.value = percent;
    }
    if (miniSeek) {
      miniSeek.value = percent;
    }
    if (playerCurrent) {
      playerCurrent.textContent = formatTime(currentTime);
    }
    if (playerDuration) {
      playerDuration.textContent = formatTime(duration);
    }
    if (miniCurrent) {
      miniCurrent.textContent = formatTime(currentTime);
    }
    if (miniDuration) {
      miniDuration.textContent = formatTime(duration);
    }
    updateMediaSessionPosition();
  });

  audioPlayer.addEventListener("ended", () => {
    playNext();
  });
}

if (playerSeek && audioPlayer) {
  playerSeek.addEventListener("input", (event) => {
    const value = Number(event.target.value);
    if (Number.isFinite(value) && audioPlayer.duration) {
      audioPlayer.currentTime = (value / 100) * audioPlayer.duration;
    }
  });
}

if (miniSeek && audioPlayer) {
  miniSeek.addEventListener("input", (event) => {
    const value = Number(event.target.value);
    if (Number.isFinite(value) && audioPlayer.duration) {
      audioPlayer.currentTime = Math.round((value / 100) * audioPlayer.duration);
    }
  });
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

if (playerStop) {
  playerStop.addEventListener("click", () => {
    stopPlayback();
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

if (miniStop) {
  miniStop.addEventListener("click", () => {
    stopPlayback();
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

if (supportsMediaSession) {
  navigator.mediaSession.setActionHandler("play", () => {
    togglePlayback();
  });
  navigator.mediaSession.setActionHandler("pause", () => {
    togglePlayback();
  });
  navigator.mediaSession.setActionHandler("previoustrack", () => {
    playPrev();
  });
  navigator.mediaSession.setActionHandler("nexttrack", () => {
    playNext();
  });
  navigator.mediaSession.setActionHandler("stop", () => {
    stopPlayback();
  });
  navigator.mediaSession.setActionHandler("seekto", (event) => {
    if (!audioPlayer || typeof event.seekTime !== "number") {
      return;
    }
    if (event.fastSeek && typeof audioPlayer.fastSeek === "function") {
      audioPlayer.fastSeek(event.seekTime);
    } else {
      audioPlayer.currentTime = event.seekTime;
    }
    updateMediaSessionPosition();
  });
}

init();
