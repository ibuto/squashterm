const tabs = document.querySelectorAll(".nav-button");
const panels = document.querySelectorAll(".panel");

const mediaGrid = document.getElementById("media-grid");
const mediaViewToggle = document.getElementById("media-view-toggle");
const playlistList = document.getElementById("playlist-list");
const favorites = document.getElementById("favorites");
const playlistCreateToggle = document.getElementById("playlist-create-toggle");
const playlistCreateForm = document.getElementById("playlist-create-form");
const playlistNameInput = document.getElementById("playlist-name");
const playlistTrackOptions = document.getElementById("playlist-track-options");
const playlistDetailTitle = document.getElementById("playlist-detail-title");
const playlistDetailDesc = document.getElementById("playlist-detail-desc");
const playlistDetailBody = document.getElementById("playlist-detail-body");
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
const playerFavorite = document.getElementById("player-favorite");
const playerMenuToggle = document.getElementById("player-menu-toggle");
const playerMenuPanel = document.getElementById("player-menu-panel");
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
const miniFavorite = document.getElementById("mini-favorite");
const miniExpand = document.getElementById("mini-expand");
const miniSeek = document.getElementById("mini-seek");
const miniCurrent = document.getElementById("mini-current");
const miniDuration = document.getElementById("mini-duration");

const state = {
  tracks: [],
  playlists: [],
  favorites: [],
  selectedPlaylist: null,
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

const updateFavoriteButtons = () => {
  const track = state.tracks[playerState.currentIndex];
  const isFavorite = track ? state.favorites.includes(track.id) : false;
  const label = isFavorite ? "お気に入りから削除" : "お気に入りに追加";
  [playerFavorite, miniFavorite].forEach((button) => {
    if (!button) {
      return;
    }
    button.classList.toggle("is-active", isFavorite);
    button.setAttribute("aria-pressed", isFavorite ? "true" : "false");
    button.setAttribute("aria-label", label);
    const labelSpan = button.querySelector(".sr-only");
    if (labelSpan) {
      labelSpan.textContent = label;
    }
  });
};

const toggleFavorite = () => {
  const track = state.tracks[playerState.currentIndex];
  if (!track) {
    return;
  }
  const currentIndex = state.favorites.indexOf(track.id);
  if (currentIndex >= 0) {
    state.favorites.splice(currentIndex, 1);
  } else {
    state.favorites.push(track.id);
  }
  renderFavorites();
  updateFavoriteButtons();
  updateFavoritesTracks(state.favorites).catch((error) => {
    console.error(error);
  });
};

const closePlayerMenu = () => {
  if (!playerMenuPanel || !playerMenuToggle) {
    return;
  }
  playerMenuPanel.classList.remove("is-open");
  playerMenuPanel.setAttribute("aria-hidden", "true");
  playerMenuToggle.setAttribute("aria-expanded", "false");
};

const togglePlayerMenu = () => {
  if (!playerMenuPanel || !playerMenuToggle) {
    return;
  }
  const isOpen = playerMenuPanel.classList.toggle("is-open");
  playerMenuPanel.setAttribute("aria-hidden", isOpen ? "false" : "true");
  playerMenuToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
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
  const rows = document.querySelectorAll(".media-list-row, .playlist-track-row");
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
  updateFavoriteButtons();
};

const openPlayerOverlay = () => {
  if (playerOverlay) {
    playerOverlay.classList.add("is-active");
    playerOverlay.setAttribute("aria-hidden", "false");
  }
  updatePlayerUI();
  updatePlayerButtons();
  updateFavoriteButtons();
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

const renderPlaylistTrackOptions = () => {
  if (!playlistTrackOptions) {
    return;
  }
  if (state.tracks.length === 0) {
    playlistTrackOptions.innerHTML = '<div class="empty-state">項目が存在しません。</div>';
    return;
  }
  playlistTrackOptions.innerHTML = state.tracks
    .map(
      (track) => `
        <label class="playlist-track-option">
          <input type="checkbox" value="${track.id}" />
          <span>${track.title} / ${track.artist}</span>
        </label>
      `
    )
    .join("");
};

const setSelectedPlaylist = (type, playlistId) => {
  state.selectedPlaylist = { type, id: playlistId };
  renderPlaylists();
  renderFavorites();
  renderPlaylistDetail();
};

const getSelectedPlaylistData = () => {
  if (!state.selectedPlaylist) {
    return null;
  }
  if (state.selectedPlaylist.type === "favorites") {
    return {
      id: "favorites",
      name: "お気に入り",
      track_ids: state.favorites,
    };
  }
  return state.playlists.find((playlist) => playlist.id === state.selectedPlaylist.id);
};

const buildPlaylistTrackRow = (track, listType) => {
  const row = document.createElement("div");
  row.className = "playlist-track-row";
  row.dataset.trackId = track.id;
  row.innerHTML = `
    <span class="playlist-drag-handle" draggable="true" aria-label="並び替え">
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="5" y="7" width="14" height="2" rx="1" />
        <rect x="5" y="15" width="14" height="2" rx="1" />
      </svg>
    </span>
    <span class="media-list-status" aria-hidden="true">
      <svg class="media-playing-icon" viewBox="0 0 24 24">
        <polygon points="8,5 19,12 8,19" />
      </svg>
    </span>
    <img class="media-list-cover" src="${track.cover}" alt="${track.album}" />
    <span class="media-list-title">${track.title}</span>
    <span class="media-list-artist">${track.artist}</span>
    <span class="media-list-duration">${track.duration}</span>
    <button class="playlist-remove" type="button" aria-label="削除">
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="M9 3h6l1 2h4v2H4V5h4l1-2zm1 6h2v9h-2V9zm4 0h2v9h-2V9zm-8 0h2v9H6V9z"
        />
      </svg>
    </button>
  `;
  row.addEventListener("click", (event) => {
    if (
      event.target.closest(".playlist-remove") ||
      event.target.closest(".playlist-drag-handle")
    ) {
      return;
    }
    const index = state.tracks.findIndex((item) => item.id === track.id);
    if (index >= 0) {
      setTrackByIndex(index);
      togglePlayback();
    }
  });
  row
    .querySelector(".playlist-drag-handle")
    .addEventListener("dragstart", (event) => {
      row.classList.add("is-dragging");
      event.dataTransfer.effectAllowed = "move";
      event.dataTransfer.setData("text/plain", track.id);
    });
  row
    .querySelector(".playlist-drag-handle")
    .addEventListener("dragend", () => {
      row.classList.remove("is-dragging");
    });
  row.addEventListener("dragover", (event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  });
  row.addEventListener("drop", (event) => {
    event.preventDefault();
    const draggedId = event.dataTransfer.getData("text/plain");
    if (!draggedId || draggedId === track.id) {
      return;
    }
    reorderPlaylistTracks(listType, draggedId, track.id);
  });
  row.querySelector(".playlist-remove").addEventListener("click", () => {
    removePlaylistTrack(listType, track.id);
  });
  return row;
};

const renderPlaylistDetail = () => {
  if (!playlistDetailBody || !playlistDetailTitle || !playlistDetailDesc) {
    return;
  }
  playlistDetailBody.innerHTML = "";
  const selected = getSelectedPlaylistData();
  if (!selected) {
    playlistDetailTitle.textContent = "プレイリストを選択";
    playlistDetailDesc.textContent =
      "左側のリストから表示したいプレイリストを選択してください。";
    return;
  }
  playlistDetailTitle.textContent = selected.name;
  playlistDetailDesc.textContent = `収録曲数: ${selected.track_ids.length}`;
  if (selected.track_ids.length === 0) {
    playlistDetailBody.innerHTML = '<div class="empty-state">項目が存在しません。</div>';
    return;
  }
  const list = document.createElement("div");
  list.className = "playlist-track-list";
  list.innerHTML = `
    <div class="playlist-track-header">
      <span></span>
      <span></span>
      <span>アート</span>
      <span>タイトル</span>
      <span>アーティスト</span>
      <span>再生時間</span>
      <span></span>
    </div>
  `;
  selected.track_ids.forEach((trackId) => {
    const track = state.tracks.find((item) => item.id === trackId);
    if (!track) {
      return;
    }
    list.appendChild(
      buildPlaylistTrackRow(track, selected.id === "favorites" ? "favorites" : "playlist")
    );
  });
  playlistDetailBody.appendChild(list);
  updateMediaPlayingIndicator();
};

const renderPlaylists = () => {
  playlistList.innerHTML = "";
  const title = document.createElement("h4");
  title.className = "playlist-section-title";
  title.textContent = "プレイリスト";
  playlistList.appendChild(title);
  if (state.playlists.length === 0) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.textContent = "項目が存在しません。";
    playlistList.appendChild(empty);
    return;
  }
  state.playlists.forEach((playlist) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "playlist-item";
    if (
      state.selectedPlaylist?.type === "playlist" &&
      state.selectedPlaylist?.id === playlist.id
    ) {
      button.classList.add("is-active");
    }
    button.innerHTML = `
      <span class="playlist-item-title">${playlist.name}</span>
      <span class="playlist-item-meta">収録曲数: ${playlist.track_ids.length}</span>
    `;
    button.addEventListener("click", () => {
      setSelectedPlaylist("playlist", playlist.id);
    });
    playlistList.appendChild(button);
  });
};

const renderFavorites = () => {
  favorites.innerHTML = "";
  const title = document.createElement("h4");
  title.className = "playlist-section-title";
  title.textContent = "お気に入り";
  favorites.appendChild(title);
  const button = document.createElement("button");
  button.type = "button";
  button.className = "playlist-item";
  if (state.selectedPlaylist?.type === "favorites") {
    button.classList.add("is-active");
  }
  button.innerHTML = `
    <span class="playlist-item-title">お気に入り</span>
    <span class="playlist-item-meta">登録数: ${state.favorites.length}</span>
  `;
  button.addEventListener("click", () => {
    setSelectedPlaylist("favorites", "favorites");
  });
  favorites.appendChild(button);
};

const reorderTrackIds = (trackIds, draggedId, targetId) => {
  const fromIndex = trackIds.indexOf(draggedId);
  const toIndex = trackIds.indexOf(targetId);
  if (fromIndex < 0 || toIndex < 0) {
    return trackIds;
  }
  const updated = [...trackIds];
  updated.splice(fromIndex, 1);
  updated.splice(toIndex, 0, draggedId);
  return updated;
};

const updatePlaylistTracks = async (playlistId, trackIds) => {
  await requestJson(`/api/playlists/${playlistId}`, { track_ids: trackIds }, "PUT");
};

const updateFavoritesTracks = async (trackIds) => {
  await requestJson("/api/favorites", { track_ids: trackIds }, "PUT");
};

const reorderPlaylistTracks = async (listType, draggedId, targetId) => {
  const selected = getSelectedPlaylistData();
  if (!selected) {
    return;
  }
  const updatedTrackIds = reorderTrackIds(selected.track_ids, draggedId, targetId);
  if (updatedTrackIds === selected.track_ids) {
    return;
  }
  try {
    if (listType === "favorites") {
      state.favorites = updatedTrackIds;
      await updateFavoritesTracks(updatedTrackIds);
      updateFavoriteButtons();
    } else {
      const playlist = state.playlists.find((item) => item.id === selected.id);
      if (!playlist) {
        return;
      }
      playlist.track_ids = updatedTrackIds;
      await updatePlaylistTracks(playlist.id, updatedTrackIds);
    }
    renderPlaylistDetail();
    renderPlaylists();
    renderFavorites();
  } catch (error) {
    console.error(error);
  }
};

const removePlaylistTrack = async (listType, trackId) => {
  const selected = getSelectedPlaylistData();
  if (!selected) {
    return;
  }
  const updatedTrackIds = selected.track_ids.filter((id) => id !== trackId);
  try {
    if (listType === "favorites") {
      state.favorites = updatedTrackIds;
      await updateFavoritesTracks(updatedTrackIds);
      updateFavoriteButtons();
    } else {
      const playlist = state.playlists.find((item) => item.id === selected.id);
      if (!playlist) {
        return;
      }
      playlist.track_ids = updatedTrackIds;
      await updatePlaylistTracks(playlist.id, updatedTrackIds);
    }
    renderPlaylistDetail();
    renderPlaylists();
    renderFavorites();
  } catch (error) {
    console.error(error);
  }
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

const ensureSelectedPlaylist = () => {
  if (!state.selectedPlaylist) {
    state.selectedPlaylist = { type: "favorites", id: "favorites" };
    return;
  }
  if (
    state.selectedPlaylist.type === "playlist" &&
    !state.playlists.find((playlist) => playlist.id === state.selectedPlaylist.id)
  ) {
    state.selectedPlaylist = { type: "favorites", id: "favorites" };
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

const requestJson = async (path, payload, method) => {
  const response = await fetch(path, {
    method,
    headers: { "Content-Type": "application/json" },
    body: payload ? JSON.stringify(payload) : undefined,
  });
  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Failed to ${method} ${path}`);
  }
  if (response.status === 204) {
    return null;
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
  ensureSelectedPlaylist();
  renderMedia();
  updateMediaViewToggle();
  renderPlaylists();
  renderFavorites();
  renderPlaylistTrackOptions();
  renderPlaylistDetail();
  renderTagOptions();
  updatePlayerUI();
  updateFavoriteButtons();
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

const handlePlaylistCreate = async () => {
  if (!playlistNameInput || !playlistTrackOptions) {
    return;
  }
  const name = playlistNameInput.value.trim();
  if (!name) {
    return;
  }
  const selectedTrackIds = Array.from(
    playlistTrackOptions.querySelectorAll("input[type='checkbox']:checked")
  ).map((input) => input.value);
  try {
    const playlist = await requestJson(
      "/api/playlists",
      { name, track_ids: selectedTrackIds },
      "POST"
    );
    state.playlists.push(playlist);
    playlistNameInput.value = "";
    playlistTrackOptions
      .querySelectorAll("input[type='checkbox']")
      .forEach((input) => {
        input.checked = false;
      });
    if (playlistCreateForm) {
      playlistCreateForm.classList.remove("is-open");
      playlistCreateForm.setAttribute("aria-hidden", "true");
    }
    setSelectedPlaylist("playlist", playlist.id);
  } catch (error) {
    console.error(error);
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
    ensureSelectedPlaylist();

    renderMedia();
    updateMediaViewToggle();
    renderPlaylists();
    renderFavorites();
    renderPlaylistTrackOptions();
    renderPlaylistDetail();
    renderTagOptions();
    updatePlayerUI();
    updateFavoriteButtons();
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

if (playlistCreateToggle && playlistCreateForm) {
  playlistCreateToggle.addEventListener("click", () => {
    const isOpen = playlistCreateForm.classList.toggle("is-open");
    playlistCreateForm.setAttribute("aria-hidden", isOpen ? "false" : "true");
  });
}

if (playlistCreateForm) {
  playlistCreateForm.addEventListener("submit", (event) => {
    event.preventDefault();
    handlePlaylistCreate();
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

if (playerFavorite) {
  playerFavorite.addEventListener("click", () => {
    toggleFavorite();
  });
}

if (miniFavorite) {
  miniFavorite.addEventListener("click", () => {
    toggleFavorite();
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
    closePlayerMenu();
  });
}

if (playerMenuToggle) {
  playerMenuToggle.addEventListener("click", (event) => {
    event.stopPropagation();
    togglePlayerMenu();
  });
}

if (playerMenuPanel) {
  playerMenuPanel.addEventListener("click", (event) => {
    const target = event.target;
    if (target && target.matches("button")) {
      closePlayerMenu();
    }
  });
}

document.addEventListener("click", (event) => {
  if (!playerMenuPanel || !playerMenuToggle) {
    return;
  }
  if (
    playerMenuPanel.classList.contains("is-open") &&
    !playerMenuPanel.contains(event.target) &&
    !playerMenuToggle.contains(event.target)
  ) {
    closePlayerMenu();
  }
});

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
