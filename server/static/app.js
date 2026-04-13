const tabs = document.querySelectorAll(".nav-button");
const panels = document.querySelectorAll(".panel");
const navPlayerButton = document.getElementById("nav-player-button");
const sidebar = document.getElementById("sidebar");
const mobileNavToggle = document.getElementById("mobile-nav-toggle");

// プレイヤーオーバーレイを閉じた時に戻るタブを記録する
let previousActiveTab = null;

const mediaGrid = document.getElementById("media-grid");
const mediaViewToggle = document.getElementById("media-view-toggle");
const mediaSelectToggle = document.getElementById("media-select-toggle");
const bulkActionBar = document.getElementById("bulk-action-bar");
const bulkSelectedCount = document.getElementById("bulk-selected-count");
const bulkAddFavorite = document.getElementById("bulk-add-favorite");
const bulkAddPlaylist = document.getElementById("bulk-add-playlist");
const bulkDeleteBtn = document.getElementById("bulk-delete");
const bulkSelectCancel = document.getElementById("bulk-select-cancel");
// モバイル選択FAB
const selectionFab = document.getElementById("selection-fab");
const fabCount = document.getElementById("fab-count");
const fabMenuBtn = document.getElementById("fab-menu-btn");
const selectionMenu = document.getElementById("selection-menu");
const mediaSearchInput = document.getElementById("media-search");
const playlistList = document.getElementById("playlist-list");
const favorites = document.getElementById("favorites");
const playlistCreateToggle = document.getElementById("playlist-create-toggle");
const playlistCreateForm = document.getElementById("playlist-create-form");
const playlistNameInput = document.getElementById("playlist-name");
const playlistEditModal = document.getElementById("playlist-edit-modal");
const playlistEditModalTitle = document.getElementById("playlist-edit-modal-title");
const playlistEditForm = document.getElementById("playlist-edit-form");
const playlistModalName = document.getElementById("playlist-modal-name");
const playlistModalUrl = document.getElementById("playlist-modal-url");
const playlistModalInterval = document.getElementById("playlist-modal-interval");
const playlistModalAutosync = document.getElementById("playlist-modal-autosync");
const playlistModalSubmit = document.getElementById("playlist-modal-submit");
const playlistModalCancel = document.getElementById("playlist-modal-cancel");
const playlistEditModalClose = document.getElementById("playlist-edit-modal-close");
const playlistModalSyncBtn = document.getElementById("playlist-modal-sync");
const playlistModalSyncStatus = document.getElementById("playlist-modal-sync-status");
const playlistSearchInput = document.getElementById("playlist-search");
const playlistSelectDropdown = document.getElementById("playlist-select-dropdown");
const playlistDetailTitle = document.getElementById("playlist-detail-title");
const playlistDetailDesc = document.getElementById("playlist-detail-desc");
const playlistDetailBody = document.getElementById("playlist-detail-body");
const playlistTrackSearchInput = document.getElementById("playlist-track-search");
const playlistManageToggle = document.getElementById("playlist-manage-toggle");
const playlistVisibility = document.getElementById("playlist-visibility");
const tagSelect = document.getElementById("tag-track-select");
const tagTitleInput = document.getElementById("tag-title");
const tagArtistInput = document.getElementById("tag-artist");
const tagAlbumInput = document.getElementById("tag-album");
const tagSourceUrlInput = document.getElementById("tag-source-url");
const tagSave = document.getElementById("tag-save");
const importForm = document.getElementById("import-form");
const importUrl = document.getElementById("import-url");
const importAutoTag = document.getElementById("import-auto-tag");
const importPlaylistSelect = document.getElementById("import-playlist-select");
const playlistConcurrencyInput = document.getElementById("playlist-concurrency");
const importSubmit = document.getElementById("import-submit");
const importLog = document.getElementById("import-log");
const importProgressBar = document.getElementById("import-progress-bar");
const importProgressText = document.getElementById("import-progress-text");
const uploadForm = document.getElementById("upload-form");
const uploadAudioInput = document.getElementById("upload-audio");
const uploadCoverInput = document.getElementById("upload-cover");
const uploadAutoTag = document.getElementById("upload-auto-tag");
const uploadTitleInput = document.getElementById("upload-title");
const uploadArtistInput = document.getElementById("upload-artist");
const uploadAlbumInput = document.getElementById("upload-album");
const uploadGenreInput = document.getElementById("upload-genre");
const uploadYearInput = document.getElementById("upload-year");
const uploadSourceUrlInput = document.getElementById("upload-source-url");
const uploadPlaylistSelect = document.getElementById("upload-playlist-select");
const uploadLog = document.getElementById("upload-log");
const localFolderForm = document.getElementById("local-folder-form");
const localFolderPathInput = document.getElementById("local-folder-path");
const localFolderAutoTag = document.getElementById("local-folder-auto-tag");
const localFolderPlaylistSelect = document.getElementById(
  "local-folder-playlist-select"
);
const localFolderLog = document.getElementById("local-folder-log");

const statusVersion = document.getElementById("status-version");
const statusDevice = document.getElementById("status-device");
const statusTime = document.getElementById("status-time");
const settingsVersionList = document.getElementById("settings-version-list");
const settingsStorageBar = document.getElementById("settings-storage-bar");
const settingsStorageText = document.getElementById("settings-storage-text");
const settingsDisplayNameInput = document.getElementById("settings-display-name");
const settingsUserIcon = document.getElementById("settings-user-icon");
const settingsUserIconFile = document.getElementById("settings-user-icon-file");
const settingsProfileSave = document.getElementById("settings-profile-save");
const settingsShowVideoOnPlayer = document.getElementById("settings-show-video-on-player");
const settingsPlaybackOptions = document.getElementById("settings-playback-options");
const systemInfoList = document.getElementById("system-info-list");
const settingsBaseUrlInput = document.getElementById("settings-base-url");
const settingsBaseUrlSave = document.getElementById("settings-base-url-save");
const designAccentColorInput = document.getElementById("design-accent-color");
const designColorsSave = document.getElementById("design-colors-save");
const designLogoFile = document.getElementById("design-logo-file");
const designLogoSave = document.getElementById("design-logo-save");
const designLogoReset = document.getElementById("design-logo-reset");
const designFaviconFile = document.getElementById("design-favicon-file");
const designFaviconSave = document.getElementById("design-favicon-save");
const designFaviconReset = document.getElementById("design-favicon-reset");
const authLoginButton = document.getElementById("auth-login-button");
const authLoginDialog = document.getElementById("auth-login-dialog");
const authLoginForm = document.getElementById("auth-login-form");
const authUsername = document.getElementById("auth-username");
const authPassword = document.getElementById("auth-password");
const authLoginError = document.getElementById("auth-login-error");
const authLoginCancel = document.getElementById("auth-login-cancel");
const authMenu = document.getElementById("auth-menu");
const authMenuPanel = document.getElementById("auth-menu-panel");
const authUserIcon = document.getElementById("auth-user-icon");
const authUserMeta = document.getElementById("auth-user-meta");
const authUserDisplay = document.getElementById("auth-user-display");
const authUserId = document.getElementById("auth-user-id");
const authLoginLabel = document.getElementById("auth-login-label");
const authSettingsButton = document.getElementById("auth-settings-button");
const authLogoutButton = document.getElementById("auth-logout-button");
const adminTabButton = document.getElementById("admin-tab-button");
const aboutSystemCard = document.getElementById("about-system-card");
const adminUserName = document.getElementById("admin-user-name");
const adminUserPassword = document.getElementById("admin-user-password");
const adminUserRole = document.getElementById("admin-user-role");
const adminUserDisplayName = document.getElementById("admin-user-display-name");
const adminUserIconFile = document.getElementById("admin-user-icon-file");
const adminUserCreate = document.getElementById("admin-user-create");
const adminUserList = document.getElementById("admin-user-list");
const adminApiKeyName = document.getElementById("admin-api-key-name");
const adminApiKeyOrigin = document.getElementById("admin-api-key-origin");
const adminApiKeyCreate = document.getElementById("admin-api-key-create");
const adminApiKeyPlain = document.getElementById("admin-api-key-plain");
const adminApiKeyList = document.getElementById("admin-api-key-list");
const adminPlaylistDialog = document.getElementById("admin-playlist-dialog");
const adminPlaylistDialogTitle = document.getElementById("admin-playlist-dialog-title");
const adminPlaylistDialogBody = document.getElementById("admin-playlist-dialog-body");
const adminPlaylistDialogClose = document.getElementById("admin-playlist-dialog-close");

const audioPlayer = document.getElementById("audio-player");
const playerOverlay = document.getElementById("player-overlay");
const playerClose = document.getElementById("player-close");
const playerCover = document.getElementById("player-cover");
const playerVideo = document.getElementById("player-video");
const playerTitle = document.getElementById("player-title");
const playerArtist = document.getElementById("player-artist");
const playerAlbum = document.getElementById("player-album");
const playerFormat = document.getElementById("player-format");
const playerToggle = document.getElementById("player-toggle");
const playerPrev = document.getElementById("player-prev");
const playerSkipBack = document.getElementById("player-skip-back");
const playerNext = document.getElementById("player-next");
const playerSkipForward = document.getElementById("player-skip-forward");
const playerStop = document.getElementById("player-stop");
const playerLoop = document.getElementById("player-loop");
const playerShuffle = document.getElementById("player-shuffle");
const playerFavorite = document.getElementById("player-favorite");
const playerMenuToggle = document.getElementById("player-menu-toggle");
const playerMenuPanel = document.getElementById("player-menu-panel");
const playerQueueView = document.getElementById("player-queue-view");
const playerDownload = document.getElementById("player-download");
const playerAddPlaylist = document.getElementById("player-add-playlist");
const playerOpenSource = document.getElementById("player-open-source");
const playerOpenVideo = document.getElementById("player-open-video");
const playerShareTrack = document.getElementById("player-share-track");
const playerEditInfo = document.getElementById("player-edit-info");
const playerDeleteTrack = document.getElementById("player-delete-track");
const playerSeek = document.getElementById("player-seek");
const playerCurrent = document.getElementById("player-current");
const playerDuration = document.getElementById("player-duration");
const playerVolumeToggle = document.getElementById("player-volume-toggle");
const playerVolumeSlider = document.getElementById("player-volume-slider");
const spVolumeToggle = document.getElementById("sp-volume-toggle");
const spVolumeSlider = document.getElementById("sp-volume-slider");
const videoModal = document.getElementById("video-modal");
const videoModalPlayer = document.getElementById("video-modal-player");
const videoModalClose = document.getElementById("video-modal-close");

const miniPlayer = document.getElementById("mini-player");
const miniCover = document.getElementById("mini-cover");
const miniTitle = document.getElementById("mini-title");
const miniArtist = document.getElementById("mini-artist");
const miniToggle = document.getElementById("mini-toggle");
const miniPrev = document.getElementById("mini-prev");
const miniSkipBack = document.getElementById("mini-skip-back");
const miniNext = document.getElementById("mini-next");
const miniSkipForward = document.getElementById("mini-skip-forward");
const miniStop = document.getElementById("mini-stop");
const miniLoop = document.getElementById("mini-loop");
const miniShuffle = document.getElementById("mini-shuffle");
const miniFavorite = document.getElementById("mini-favorite");
const miniExpand = document.getElementById("mini-expand");
const miniSeek = document.getElementById("mini-seek");
const miniCurrent = document.getElementById("mini-current");
const miniDuration = document.getElementById("mini-duration");

const playlistModal = document.getElementById("playlist-modal");
const playlistModalList = document.getElementById("playlist-modal-list");
const playlistModalClose = document.getElementById("playlist-modal-close");
const trackEditModal = document.getElementById("track-edit-modal");
const trackEditClose = document.getElementById("track-edit-close");
const trackEditCancel = document.getElementById("track-edit-cancel");
const trackEditForm = document.getElementById("track-edit-form");
const trackEditTitle = document.getElementById("track-edit-title");
const trackEditArtist = document.getElementById("track-edit-artist");
const trackEditAlbum = document.getElementById("track-edit-album");
const trackEditSourceUrl = document.getElementById("track-edit-source-url");
const shareDialog = document.getElementById("share-dialog");
const shareDialogUrl = document.getElementById("share-dialog-url");
const shareDialogCopy = document.getElementById("share-dialog-copy");
const shareDialogClose = document.getElementById("share-dialog-close");

const state = {
  tracks: [],
  playlists: [],
  favorites: [],
  selectedPlaylist: null,
  // ソート状態（将来の並び替え機能用スタブ）
  mediaListSort: { key: null, dir: "asc" },
  authUser: null,
  role: "guest",
};

const selectionState = {
  active: false,
  selectedIds: new Set(),
};

const playlistManageState = {
  active: false,
};

const playerState = {
  currentIndex: -1,
  lastIndex: -1,
  isPlaying: false,
  loopMode: "off",
  shuffleMode: false,
  shuffleIndices: [],
  shufflePosition: 0,
  playQueue: [],   // 次に再生するトラックIDのキュー（先頭から消費）
};

const mediaViewState = {
  mode: localStorage.getItem("mediaViewMode") || "grid",
};

const searchState = {
  mediaQuery: "",
  playlistQuery: "",
  playlistTrackQuery: "",
};

let playerVideoSyncPending = false;
let playerVideoSeekInProgress = false;
let lastPlayerVideoSyncMs = 0;
let overlayVideoSyncTimerId = null;

const hasLogin = () => Boolean(state.authUser);

const canManagePlaylist = (playlist) => {
  if (!playlist) {
    return false;
  }
  if (state.role === "admin") {
    return true;
  }
  if (!hasLogin()) {
    return false;
  }
  if (playlist.is_public) {
    return false;
  }
  return playlist.owner_id === state.authUser?.id;
};

const canUsePlaylistActions = () => hasLogin();

const canUseFavoritesActions = () => hasLogin();

const parseErrorMessage = async (response, fallbackMessage) => {
  try {
    const data = await response.json();
    if (typeof data?.detail === "string" && data.detail) {
      return data.detail;
    }
    if (typeof data?.message === "string" && data.message) {
      return data.message;
    }
    return fallbackMessage;
  } catch (_error) {
    const text = await response.text();
    return text || fallbackMessage;
  }
};

const supportsMediaSession = "mediaSession" in navigator;

const closeMobileSidebar = () => {
  if (!sidebar) {
    return;
  }
  sidebar.classList.remove("is-open");
  document.body?.classList.remove("mobile-menu-open");
  mobileNavToggle?.setAttribute("aria-expanded", "false");
};

tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    if (!tab.dataset.tab) return;
    // モバイルプレイヤーが開いている場合は閉じる
    if (mobilePlayerOverlay && mobilePlayerOverlay.getAttribute("aria-hidden") === "false") {
      mobilePlayerOverlay.setAttribute("aria-hidden", "true");
      previousActiveTab = null; // タブクリックで直接遷移するので以前のタブをクリア
    }
    tabs.forEach((button) => button.classList.remove("is-active"));
    panels.forEach((panel) => panel.classList.remove("is-active"));
    tab.classList.add("is-active");
    const target = document.getElementById(`panel-${tab.dataset.tab}`);
    if (target) {
      target.classList.add("is-active");
    }
    closeMobileSidebar();
  });
});

if (mobileNavToggle && sidebar) {
  mobileNavToggle.addEventListener("click", () => {
    const willOpen = !sidebar.classList.contains("is-open");
    sidebar.classList.toggle("is-open", willOpen);
    document.body?.classList.toggle("mobile-menu-open", willOpen);
    mobileNavToggle.setAttribute("aria-expanded", String(willOpen));
  });

  document.addEventListener("click", (event) => {
    if (!sidebar.classList.contains("is-open")) {
      return;
    }
    if (sidebar.contains(event.target) || mobileNavToggle.contains(event.target)) {
      return;
    }
    closeMobileSidebar();
  });
}

const escapeHtml = (str) => {
  return String(str ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
};

const formatTime = (seconds) => {
  if (!Number.isFinite(seconds)) {
    return "0:00";
  }
  const minutes = Math.floor(seconds / 60);
  const remainder = Math.floor(seconds % 60);
  return `${minutes}:${remainder.toString().padStart(2, "0")}`;
};

const showConfirmDialog = ({ title, message, showFileOption = false, buttons }) => {
  return new Promise((resolve) => {
    const dialog = document.getElementById("confirm-dialog");
    const titleEl = document.getElementById("confirm-dialog-title");
    const messageEl = document.getElementById("confirm-dialog-message");
    const fileOption = document.getElementById("confirm-dialog-file-option");
    const deleteFileCheckbox = document.getElementById("confirm-dialog-delete-file");
    const actionsEl = document.getElementById("confirm-dialog-actions");
    if (!dialog || !titleEl || !messageEl || !actionsEl) {
      resolve({ action: buttons[buttons.length - 1]?.value ?? "cancel", deleteFile: true });
      return;
    }
    titleEl.textContent = title;
    messageEl.textContent = message;
    if (fileOption) {
      fileOption.style.display = showFileOption ? "" : "none";
    }
    if (showFileOption && deleteFileCheckbox) {
      deleteFileCheckbox.checked = true;
    }
    actionsEl.innerHTML = "";
    const close = (value) => {
      dialog.classList.remove("is-open");
      dialog.setAttribute("aria-hidden", "true");
      resolve({ action: value, deleteFile: deleteFileCheckbox?.checked ?? true });
    };
    buttons.forEach(({ label, className, value }) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = className;
      btn.textContent = label;
      btn.addEventListener("click", () => close(value));
      actionsEl.appendChild(btn);
    });
    dialog.classList.add("is-open");
    dialog.setAttribute("aria-hidden", "false");
  });
};

const closeShareDialog = () => {
  if (!shareDialog) {
    return;
  }
  shareDialog.classList.remove("is-open");
  shareDialog.setAttribute("aria-hidden", "true");
};

const showShareDialog = (shareUrl) => {
  if (!shareDialog || !shareDialogUrl) {
    window.prompt("共有リンクをコピーしてください", shareUrl);
    return;
  }
  shareDialogUrl.value = shareUrl;
  shareDialog.classList.add("is-open");
  shareDialog.setAttribute("aria-hidden", "false");
};

const copyShareUrl = async () => {
  const shareUrl = shareDialogUrl?.value?.trim();
  if (!shareUrl) {
    return;
  }
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(shareUrl);
      appendImportLog("共有リンクをコピーしました。", { append: true });
      closeShareDialog();
      return;
    }
  } catch (error) {
    console.error(error);
  }
  window.prompt("共有リンクをコピーしてください", shareUrl);
};

const formatFileDetails = (track) => {
  if (!track) {
    return "--";
  }
  const formatLabel = track.file_format
    ? track.file_format.toString().toUpperCase()
    : "不明";
  const bitrateLabel = track.bitrate_kbps ? `${track.bitrate_kbps}kbps` : "不明";
  return `形式: ${formatLabel} ・ ${bitrateLabel}`;
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

const loopModeLabels = {
  off: { label: "オフ", short: "OFF" },
  playlist: { label: "プレイリスト内ループ", short: "PL" },
  track: { label: "1曲ループ", short: "1" },
};

const updateLoopButtons = () => {
  const mode = playerState.loopMode;
  const loopLabel = loopModeLabels[mode] || loopModeLabels.off;
  [playerLoop, miniLoop].forEach((button) => {
    if (!button) {
      return;
    }
    button.setAttribute("aria-label", `ループ: ${loopLabel.label}`);
    button.setAttribute("aria-pressed", mode === "off" ? "false" : "true");
    button.classList.toggle("is-loop", mode !== "off");
    const labelSpan = button.querySelector(".loop-label");
    if (labelSpan) {
      labelSpan.textContent = loopLabel.short;
    }
  });
};

const updateShuffleButtons = () => {
  const isOn = playerState.shuffleMode;
  const ariaLabel = `シャッフル: ${isOn ? "オン" : "オフ"}`;
  
  [playerShuffle, miniShuffle].forEach((btn) => {
    if (!btn) return;
    btn.setAttribute("aria-label", ariaLabel);
    btn.setAttribute("aria-pressed", isOn);
    if (isOn) {
      btn.classList.add("is-active");
    } else {
      btn.classList.remove("is-active");
    }
  });
};

const updateFavoriteButtons = () => {
  const track = state.tracks[playerState.currentIndex];
  const isFavorite = track ? state.favorites.includes(track.id) : false;
  const label = isFavorite ? "お気に入りから削除" : "お気に入りに追加";
  [playerFavorite, miniFavorite].forEach((button) => {
    if (!button) {
      return;
    }
    button.style.display = canUseFavoritesActions() ? "" : "none";
    button.disabled = !canUseFavoritesActions();
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
    if (tagSourceUrlInput) {
      tagSourceUrlInput.value = "";
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
  if (tagSourceUrlInput) {
    tagSourceUrlInput.value = track.source_url || "";
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

const normalizeQuery = (value) => value.trim().toLowerCase();

const resolveTrackVideoUrl = (track) => {
  if (!track) {
    return null;
  }
  if (track.video_url) {
    return track.video_url;
  }
  const fileUrl = String(track.file_url || "");
  if (/\.(mp4|webm|mkv)(?:\?|$)/i.test(fileUrl)) {
    return fileUrl;
  }
  return null;
};

const shouldShowVideoOnPlayer = () => Boolean(state.authUser?.show_video_on_player ?? true);

const syncPlayerVideoWithAudio = (options = {}) => {
  if (!audioPlayer || !playerVideo || !playerVideo.classList.contains("is-visible")) {
    return;
  }
  const { force = false } = options;
  const now = Date.now();
  if (!force && now - lastPlayerVideoSyncMs < 500) {
    return;
  }
  const audioTime = Number(audioPlayer.currentTime || 0);
  const videoTime = Number(playerVideo.currentTime || 0);
  if (Math.abs(videoTime - audioTime) > (force ? 0.2 : 0.8)) {
    try {
      playerVideo.currentTime = audioTime;
      lastPlayerVideoSyncMs = now;
    } catch (_error) {
      // メタデータ未読み込み時は無視し、次回同期で再調整する
    }
  }
};

const applyPlayerVideoSync = () => {
  if (!audioPlayer || !playerVideo || !playerVideo.classList.contains("is-visible")) {
    playerVideoSyncPending = false;
    return;
  }
  if (document.visibilityState !== "visible") {
    playerVideoSyncPending = true;
    return;
  }
  if (playerVideoSeekInProgress) {
    playerVideoSyncPending = true;
    return;
  }
  if (playerVideo.readyState < 1) {
    playerVideoSyncPending = true;
    return;
  }
  syncPlayerVideoWithAudio({ force: true });
  if (audioPlayer.paused) {
    playerVideo.pause();
    playerVideoSyncPending = false;
    return;
  }
  playerVideo.play().then(() => {
    playerVideoSyncPending = false;
  }).catch(() => {
    playerVideoSyncPending = true;
  });
};

const syncVideoStateWithAudioPlayback = () => {
  applyPlayerVideoSync();
};

const warmupPlayerVideo = () => {
  if (!playerVideo || !playerVideo.classList.contains("is-visible")) {
    return;
  }
  if (playerVideo.readyState === 0) {
    playerVideo.load();
    return;
  }
  if (playerVideo.readyState >= 2) {
    return;
  }
  playerVideo.play().then(() => {
    playerVideo.pause();
    syncPlayerVideoWithAudio({ force: true });
  }).catch(() => {
    playerVideoSyncPending = true;
  });
};

const clearOverlayVideoSyncTimer = () => {
  if (overlayVideoSyncTimerId !== null) {
    window.clearTimeout(overlayVideoSyncTimerId);
    overlayVideoSyncTimerId = null;
  }
};

const scheduleOverlayVideoSync = () => {
  clearOverlayVideoSyncTimer();
  let attempts = 0;
  const run = () => {
    if (!isPlayerOverlayActive()) {
      clearOverlayVideoSyncTimer();
      return;
    }
    syncVideoStateWithAudioPlayback();
    attempts += 1;
    if (attempts >= 20) {
      clearOverlayVideoSyncTimer();
      return;
    }
    overlayVideoSyncTimerId = window.setTimeout(run, 80);
  };
  run();
};

const updatePlayerVisual = (track) => {
  const videoUrl = shouldShowVideoOnPlayer() ? resolveTrackVideoUrl(track) : null;
  if (playerVideo) {
    if (videoUrl) {
      if (playerVideo.src !== videoUrl) {
        playerVideo.src = videoUrl;
        playerVideo.load();
      }
      playerVideo.classList.add("is-visible");
      playerVideo.onloadedmetadata = () => {
        applyPlayerVideoSync();
      };
      applyPlayerVideoSync();
      if (!isPlayerOverlayActive()) {
        warmupPlayerVideo();
      }
    } else {
      playerVideo.pause();
      playerVideoSyncPending = false;
      playerVideo.onloadedmetadata = null;
      playerVideo.removeAttribute("src");
      playerVideo.load();
      playerVideo.classList.remove("is-visible");
    }
  }
  if (playerCover) {
    playerCover.classList.toggle("is-hidden", Boolean(videoUrl));
  }
};

const closeVideoModal = () => {
  if (!videoModal || !videoModalPlayer) {
    return;
  }
  if (document.fullscreenElement === videoModalPlayer) {
    document.exitFullscreen().catch(() => {});
  }
  videoModal.classList.remove("is-open");
  videoModal.setAttribute("aria-hidden", "true");
  videoModalPlayer.pause();
  videoModalPlayer.removeAttribute("src");
  videoModalPlayer.load();
};

const openVideoModal = (videoUrl) => {
  if (!videoModal || !videoModalPlayer || !videoUrl) {
    return;
  }
  stopPlayback();
  videoModalPlayer.src = videoUrl;
  videoModal.classList.add("is-open");
  videoModal.setAttribute("aria-hidden", "false");
  videoModalPlayer.play().then(() => {
    videoModalPlayer.requestFullscreen?.().catch(() => {});
  }).catch(() => {});
};

const applyDesignTheme = (design) => {
  const accentColor = design?.accent_color || "#38bdf8";
  document.documentElement.style.setProperty("--theme-accent-color", accentColor);
};

const filterTracks = (tracks, query) => {
  const normalized = normalizeQuery(query);
  if (!normalized) {
    return tracks;
  }
  return tracks.filter((track) => {
    const target = `${track.title} ${track.artist} ${track.album} ${track.genre}`.toLowerCase();
    return target.includes(normalized);
  });
};

const filterPlaylists = (playlists, query) => {
  const normalized = normalizeQuery(query);
  if (!normalized) {
    return playlists;
  }
  return playlists.filter((playlist) =>
    String(playlist.name || "").toLowerCase().includes(normalized)
  );
};

// 一覧ビューの title/artist にマーキースクロールを適用する
// spotify-ui.js の setupMarquee と同ロジック・同CSSクラスを使用
const applyListMarquee = (el, text) => {
  if (!el) return;
  el.classList.remove("sp-scrolling");
  el.textContent = text;
  if (!text || text === "--") return;
  setTimeout(() => {
    const scrollW = el.scrollWidth;
    const clientW = el.offsetWidth;
    if (scrollW <= clientW + 2) return;
    const gap = 48;
    const speed = 50;
    const dist = scrollW + gap;
    const dur = dist / speed;
    const inner = document.createElement("span");
    inner.className = "sp-marquee-inner";
    inner.style.setProperty("--sp-scroll-dist", "-" + dist + "px");
    inner.style.setProperty("--sp-scroll-dur", dur + "s");
    const copy1 = document.createElement("span");
    copy1.textContent = text;
    const copy2 = document.createElement("span");
    copy2.textContent = text;
    copy2.style.paddingLeft = gap + "px";
    inner.appendChild(copy1);
    inner.appendChild(copy2);
    el.innerHTML = "";
    el.appendChild(inner);
    el.classList.add("sp-scrolling");
  }, 80);
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
    updatePlayerVisual(null);
    if (playerTitle) {
      playerTitle.textContent = "--";
    }
    if (playerArtist) {
      playerArtist.textContent = "--";
    }
    if (playerAlbum) {
      playerAlbum.textContent = "--";
    }
    if (playerFormat) {
      playerFormat.textContent = "--";
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
    if (navPlayerButton) {
      navPlayerButton.classList.add("is-hidden");
    }
    document.body?.classList.remove("has-mini-player");
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
      // Keep metadata visible (e.g. on lock screen / CarPlay) so the user can
      // resume playback from the OS media controls after a playlist ends.
      // Only mark it "paused" – setting "none" would remove the controls entirely.
      navigator.mediaSession.playbackState = "paused";
      if (typeof navigator.mediaSession.setPositionState === "function") {
        try { navigator.mediaSession.setPositionState(null); } catch (_) { /* not supported */ }
      }
    }
    updateMediaPlayingIndicator();
    updateLoopButtons();
    renderPlaylistModalList();
    updatePlayerMenuButtons();
    return;
  }
  if (playerCover) {
    playerCover.src = track.cover || "";
    playerCover.alt = track.album || track.title;
    // Spotify theme: set CSS custom property for centered square art
    if (playerOverlay) {
      const artUrl = track.cover ? `url("${track.cover.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}")` : "none";
      playerOverlay.style.setProperty("--player-art", artUrl);
    }
  }
  updatePlayerVisual(track);
  if (playerTitle) {
    playerTitle.textContent = track.title;
  }
  if (playerArtist) {
    playerArtist.textContent = track.artist;
  }
  if (playerAlbum) {
    playerAlbum.textContent = track.album;
  }
  if (playerFormat) {
    playerFormat.textContent = formatFileDetails(track);
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
  if (navPlayerButton) {
    navPlayerButton.classList.remove("is-hidden");
  }
  document.body?.classList.add("has-mini-player");
  updatePlayerButtons();
  updateMediaSessionMetadata(track);
  updateMediaPlayingIndicator();
  updateFavoriteButtons();
  updateLoopButtons();
  renderPlaylistModalList();
  updatePlayerMenuButtons();
  
  // モバイルプレイヤーが開いている場合は更新
  if (mobilePlayerOverlay && mobilePlayerOverlay.getAttribute("aria-hidden") === "false") {
    updateMobilePlayerUI();
  }
};

const closePlayerOverlay = () => {
  if (playerOverlay) {
    playerOverlay.classList.remove("is-active");
    playerOverlay.setAttribute("aria-hidden", "true");
  }
  clearOverlayVideoSyncTimer();
  if (playerVideo) {
    playerVideo.pause();
  }
  document.body?.classList.remove("player-overlay-open");
  closePlayerMenu();
  // 直前のタブに戻す
  if (previousActiveTab) {
    activateTab(previousActiveTab);
    previousActiveTab = null;
  }
};

const isPlayerOverlayActive = () => playerOverlay?.classList.contains("is-active");

const openPlayerOverlay = () => {
  // 現在のアクティブタブを記録（閉じた時に戻すため）
  previousActiveTab = null;
  tabs.forEach((t) => {
    if (t.classList.contains("is-active") && t.dataset.tab) {
      previousActiveTab = t.dataset.tab;
    }
  });
  if (!previousActiveTab) previousActiveTab = "media";
  if (playerOverlay) {
    playerOverlay.classList.add("is-active");
    playerOverlay.setAttribute("aria-hidden", "false");
  }
  document.body?.classList.add("player-overlay-open");
  closeUpNextPanel();
  updatePlayerUI();
  scheduleOverlayVideoSync();
  updatePlayerButtons();
  updateFavoriteButtons();
};

const setTrackByIndex = (index, reshuffle = true) => {
  const track = state.tracks[index];
  if (!track) {
    return;
  }
  if (!track.file_url) {
    appendImportLog("音源が見つかりません。");
    return;
  }
  playerState.currentIndex = index;
  
  // 新規選択時は再シャッフル（playNext/playPrev以外から呼ばれた場合）
  if (playerState.shuffleMode && reshuffle) {
    playerState.shuffleIndices = generateShuffleIndices();
    triggerReshuffleFlash();
    // 選択した曲を先頭に
    const currentPos = playerState.shuffleIndices.indexOf(index);
    if (currentPos > 0) {
      [playerState.shuffleIndices[0], playerState.shuffleIndices[currentPos]] = 
      [playerState.shuffleIndices[currentPos], playerState.shuffleIndices[0]];
    }
    playerState.shufflePosition = 0;
  } else if (playerState.shuffleMode && playerState.shuffleIndices.length > 0) {
    // playNext/playPrevから呼ばれた場合は位置を同期するだけ
    const shufflePos = playerState.shuffleIndices.indexOf(index);
    if (shufflePos >= 0) {
      playerState.shufflePosition = shufflePos;
    }
  }
  
  if (audioPlayer) {
    audioPlayer.src = track.file_url;
  }
  updatePlayerUI();
  refreshUpNextPanel();
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

const playCurrentTrack = async () => {
  if (!audioPlayer) {
    return;
  }
  if (playerState.currentIndex === -1) {
    if (state.tracks.length > 0) {
      // Resume from the last played track if available, otherwise start from first
      const resumeIndex =
        playerState.lastIndex >= 0 && playerState.lastIndex < state.tracks.length
          ? playerState.lastIndex
          : 0;
      setTrackByIndex(resumeIndex);
    } else {
      return;
    }
  }
  if (!audioPlayer.paused) {
    return;
  }
  await audioPlayer.play().catch((err) => {
    console.warn("[squashterm] playCurrentTrack: play() failed:", err);
    updateMediaSessionPlaybackState();
  });
};

const pauseCurrentTrack = () => {
  if (!audioPlayer || audioPlayer.paused) {
    return;
  }
  audioPlayer.pause();
};

const seekBySeconds = (deltaSeconds) => {
  if (!audioPlayer) {
    return;
  }
  const duration = audioPlayer.duration || 0;
  const current = audioPlayer.currentTime || 0;
  const next = duration
    ? Math.min(Math.max(current + deltaSeconds, 0), duration)
    : Math.max(current + deltaSeconds, 0);
  audioPlayer.currentTime = next;
  syncPlayerVideoWithAudio({ force: true });
  updateMediaSessionPosition();
};

const stopPlayback = () => {
  if (!audioPlayer) {
    return;
  }
  // Remember the last track so the MediaSession play handler can resume it
  if (playerState.currentIndex >= 0) {
    playerState.lastIndex = playerState.currentIndex;
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

  // キューに曲がある場合は優先して消費
  if (playerState.playQueue.length > 0) {
    const nextId = playerState.playQueue.shift();
    const nextIndex = state.tracks.findIndex(t => t.id === nextId);
    if (nextIndex >= 0) {
      setTrackByIndex(nextIndex, false);
      if (audioPlayer) {
        audioPlayer.play().catch((err) => {
          console.warn("[squashterm] playNext(queue): play() failed:", err);
          updateMediaSessionPlaybackState();
        });
      }
      refreshUpNextPanel();
      return;
    }
  }

  let nextIndex;
  if (playerState.shuffleMode && playerState.shuffleIndices.length > 0) {
    // シャッフルモード
    const nextPos = playerState.shufflePosition + 1;
    
    // 1周したら再シャッフル
    if (nextPos >= playerState.shuffleIndices.length) {
      playerState.shuffleIndices = generateShuffleIndices();
      playerState.shufflePosition = 0;
      triggerReshuffleFlash();
    } else {
      playerState.shufflePosition = nextPos;
    }
    
    nextIndex = playerState.shuffleIndices[playerState.shufflePosition];
  } else {
    // 通常モード
    nextIndex = (playerState.currentIndex + 1) % state.tracks.length;
  }
  
  setTrackByIndex(nextIndex, false);
  if (audioPlayer) {
    audioPlayer.play().catch((err) => {
      console.warn("[squashterm] playNext: play() failed:", err);
      updateMediaSessionPlaybackState();
    });
  }
};

const playPrev = () => {
  if (!state.tracks.length) {
    return;
  }
  
  // 再生位置が3秒以上なら曲の先頭に戻す
  if (audioPlayer && audioPlayer.currentTime > 3) {
    audioPlayer.currentTime = 0;
    return;
  }
  
  // 3秒以内または連続2度目なら前の曲へ
  let prevIndex;
  if (playerState.shuffleMode && playerState.shuffleIndices.length > 0) {
    // シャッフルモード
    const prevPos = playerState.shufflePosition - 1;
    
    // 先頭から戻ったら再シャッフルして最後尾へ
    if (prevPos < 0) {
      playerState.shuffleIndices = generateShuffleIndices();
      playerState.shufflePosition = playerState.shuffleIndices.length - 1;
    } else {
      playerState.shufflePosition = prevPos;
    }
    
    prevIndex = playerState.shuffleIndices[playerState.shufflePosition];
  } else {
    // 通常モード
    prevIndex =
      (playerState.currentIndex - 1 + state.tracks.length) % state.tracks.length;
  }
  
  setTrackByIndex(prevIndex, false);
  if (audioPlayer) {
    audioPlayer.play().catch((err) => {
      console.warn("[squashterm] playPrev: play() failed:", err);
      updateMediaSessionPlaybackState();
    });
  }
};

const toggleLoopMode = () => {
  const modes = ["off", "playlist", "track"];
  const currentIndex = modes.indexOf(playerState.loopMode);
  const nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % modes.length;
  playerState.loopMode = modes[nextIndex];
  localStorage.setItem("loopMode", playerState.loopMode);
  updateLoopButtons();
};

const generateShuffleIndices = () => {
  const indices = Array.from({ length: state.tracks.length }, (_, i) => i);
  // Fisher-Yatesシャッフル
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }
  return indices;
};

// --- キュー操作 ---
const addToPlayNext = (trackId) => {
  playerState.playQueue.unshift(trackId);
  refreshUpNextPanel();
};

// シャッフルボタンに短いフラッシュアニメーションを適用
const triggerReshuffleFlash = () => {
  [document.getElementById("sp-shuffle"), document.getElementById("mini-shuffle")].forEach(btn => {
    if (!btn) return;
    btn.classList.remove("is-reshuffled");
    void btn.offsetWidth; // reflow で再アニメーション
    btn.classList.add("is-reshuffled");
    setTimeout(() => btn.classList.remove("is-reshuffled"), 600);
  });
};

// Up Nextパネルが開いていれば再描画（閉じていればnoop）
const refreshUpNextPanel = () => {
  const panel = document.getElementById("up-next-panel");
  if (panel && panel.getAttribute("aria-hidden") === "false") {
    renderUpNextPanel();
  }
};

const toggleShuffleMode = () => {
  playerState.shuffleMode = !playerState.shuffleMode;
  localStorage.setItem("shuffleMode", playerState.shuffleMode);
  
  if (playerState.shuffleMode) {
    // シャッフルON: ランダム配列生成
    playerState.shuffleIndices = generateShuffleIndices();
    triggerReshuffleFlash();
    // 現在再生中の曲を先頭に
    if (playerState.currentIndex >= 0) {
      const currentPos = playerState.shuffleIndices.indexOf(playerState.currentIndex);
      if (currentPos > 0) {
        [playerState.shuffleIndices[0], playerState.shuffleIndices[currentPos]] = 
        [playerState.shuffleIndices[currentPos], playerState.shuffleIndices[0]];
      }
      playerState.shufflePosition = 0;
    } else {
      playerState.shufflePosition = -1;
    }
  } else {
    // シャッフルOFF: 配列クリア
    playerState.shuffleIndices = [];
    playerState.shufflePosition = 0;
  }
  
  updateShuffleButtons();
  refreshUpNextPanel();
};

const renderMedia = () => {
  mediaGrid.innerHTML = "";
  if (mediaViewState.mode === "list") {
    mediaGrid.classList.add("is-list");
  } else {
    mediaGrid.classList.remove("is-list");
  }
  const visibleTracks = filterTracks(state.tracks, searchState.mediaQuery);
  if (visibleTracks.length === 0) {
    mediaGrid.innerHTML = `<div class="empty-state">${
      searchState.mediaQuery ? "該当する曲がありません。" : "項目が存在しません。"
    }</div>`;
    return;
  }
  if (mediaViewState.mode === "list") {
    const list = document.createElement("div");
    list.className = selectionState.active ? "media-list media-list--selecting" : "media-list";
    const isSpotify = window._sqTheme?.spotify;
    const selectingPrefix = selectionState.active ? '<span></span>' : '';
    list.innerHTML = isSpotify ? `
      <div class="media-list-header">
        ${selectingPrefix}
        <span>#</span>
        <span class="col-title" data-sort="title">タイトル</span>
        <span class="col-album" data-sort="album">アルバム</span>
        <span data-sort="duration">再生時間</span>
      </div>
    ` : `
      <div class="media-list-header">
        ${selectingPrefix}
        <span>#</span>
        <span class="col-title" data-sort="title">タイトル</span>
        <span class="col-artist" data-sort="artist">アーティスト</span>
        <span data-sort="duration">再生時間</span>
      </div>
    `;
    visibleTracks.forEach((track, idx) => {
      // <button> 内に interactive 要素（⋯ボタン等）をネストするのは HTML 的に無効なため、
      // 常に div を使い role="button" で再生ボタンとしての意味を付与する
      const row = document.createElement("div");
      row.role = "button";
      row.tabIndex = 0;
      row.className = "media-list-row";
      row.dataset.trackId = track.id;
      const hasAudio = Boolean(track.file_url);
      if (!selectionState.active) {
        if (!hasAudio) {
          row.classList.add("is-disabled");
        }
      }
      if (selectionState.active && selectionState.selectedIds.has(track.id)) {
        row.classList.add("is-selected");
      }

      const numHtml = `
        <span class="media-list-num" aria-hidden="true">
          <span class="num-text">${idx + 1}</span>
          <svg class="num-play" viewBox="0 0 24 24"><polygon points="8,5 19,12 8,19"/></svg>
        </span>`;
      const titleCellHtml = isSpotify ? `
        <span class="media-list-title-cell">
          <img class="media-list-cover" src="${track.cover}" alt="" loading="lazy" />
          <span class="media-list-title-stack">
            <span class="media-list-title">${track.title}</span>
            <span class="media-list-artist">${track.artist}</span>
          </span>
        </span>` : `
        <span class="media-list-title-cell">
          <img class="media-list-cover" src="${track.cover}" alt="" loading="lazy" />
          <span class="media-list-title-stack">
            <span class="media-list-title">${track.title}</span>
          </span>
        </span>`;
      const secondColHtml = isSpotify
        ? `<span class="media-list-album">${track.album || ''}</span>`
        : `<span class="media-list-artist-col">${track.artist}</span>`;
      const durationHtml = `<span class="media-list-duration">${track.duration}</span>`;

      const menuBtnHtml = `<button type="button" class="track-menu-btn" data-track-id="${track.id}" aria-label="曲のメニュー">
        <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/></svg>
      </button>`;

      if (selectionState.active) {
        // 選択モード: checkbox | # | title-cell | second-col | duration
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.className = "media-list-checkbox";
        checkbox.checked = selectionState.selectedIds.has(track.id);
        checkbox.addEventListener("change", () => {
          if (checkbox.checked) {
            selectionState.selectedIds.add(track.id);
            row.classList.add("is-selected");
          } else {
            selectionState.selectedIds.delete(track.id);
            row.classList.remove("is-selected");
          }
          updateBulkBar();
        });
        row.appendChild(checkbox);
        row.insertAdjacentHTML("beforeend", numHtml + titleCellHtml + secondColHtml + durationHtml);
        row.style.cursor = "pointer";
        row.addEventListener("click", (e) => {
          if (e.target.type === "checkbox") return;
          checkbox.checked = !checkbox.checked;
          checkbox.dispatchEvent(new Event("change"));
        });
      } else {
        // 通常モード: # | title-cell | second-col | duration | ⋯
        row.innerHTML = numHtml + titleCellHtml + secondColHtml + durationHtml + menuBtnHtml;
        if (hasAudio) {
          const playRow = (e) => {
            if (e.target.closest(".track-menu-btn")) return;
            const index = state.tracks.findIndex((item) => item.id === track.id);
            if (index >= 0) {
              setTrackByIndex(index);
              togglePlayback();
            }
          };
          row.addEventListener("click", playRow);
          row.addEventListener("keydown", (e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              playRow(e);
            }
          });
        }
        const menuBtn = row.querySelector(".track-menu-btn");
        if (menuBtn) {
          row.addEventListener("pointerenter", () => menuBtn.classList.add("is-hovered"));
          row.addEventListener("pointerleave", () => menuBtn.classList.remove("is-hovered"));
          menuBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            showTrackContextMenu(track.id, menuBtn);
          });
          menuBtn.addEventListener("focus", () => menuBtn.classList.add("is-hovered"));
          menuBtn.addEventListener("blur", () => menuBtn.classList.remove("is-hovered"));
        }
      }
      list.appendChild(row);
    });
    mediaGrid.appendChild(list);
    // 一覧行のタイトル・アーティストにマーキー適用（DOMに追加後に計測）
    list.querySelectorAll(".media-list-title-stack").forEach((stack) => {
      const titleEl = stack.querySelector(".media-list-title");
      const artistEl = stack.querySelector(".media-list-artist");
      if (titleEl) applyListMarquee(titleEl, titleEl.textContent);
      if (artistEl) applyListMarquee(artistEl, artistEl.textContent);
    });
    updateMediaPlayingIndicator();
    return;
  }
  visibleTracks.forEach((track) => {
    const card = document.createElement("div");
    card.className = "media-card";
    const hasAudio = Boolean(track.file_url);
    if (selectionState.active && selectionState.selectedIds.has(track.id)) {
      card.classList.add("is-selected");
    }
    card.innerHTML = `
      ${selectionState.active ? `<input type="checkbox" class="media-list-checkbox" ${selectionState.selectedIds.has(track.id) ? "checked" : ""} style="margin-bottom:6px" />` : ""}
      <img src="${track.cover}" alt="${track.album}" loading="lazy" />
      <h3><span class="scroll-text">${track.title}</span></h3>
      <p><span class="scroll-text">${track.artist}</span></p>
      <p><span class="scroll-text">${track.album}</span></p>
      <div class="media-meta">
        <span>${track.genre} ・ ${track.year}</span>
        <span>${track.duration}</span>
      </div>
      ${!selectionState.active ? `<button class="play-button ${hasAudio ? "" : "is-disabled"}" type="button" ${hasAudio ? "" : "disabled"}>${hasAudio ? "再生" : "音源なし"}</button>` : ""}
    `;
    if (selectionState.active) {
      const cb = card.querySelector(".media-list-checkbox");
      if (cb) {
        cb.addEventListener("change", () => {
          if (cb.checked) {
            selectionState.selectedIds.add(track.id);
            card.classList.add("is-selected");
          } else {
            selectionState.selectedIds.delete(track.id);
            card.classList.remove("is-selected");
          }
          updateBulkBar();
        });
      }
      card.style.cursor = "pointer";
      card.addEventListener("click", (e) => {
        if (e.target.type === "checkbox") return;
        const checkbox = card.querySelector(".media-list-checkbox");
        if (checkbox) {
          checkbox.checked = !checkbox.checked;
          checkbox.dispatchEvent(new Event("change"));
        }
      });
    } else {
      card.querySelector("button")?.addEventListener("click", () => {
        const index = state.tracks.findIndex((item) => item.id === track.id);
        if (index >= 0) {
          setTrackByIndex(index);
          togglePlayback();
        }
      });
    }
    mediaGrid.appendChild(card);
  });

  // はみ出しているテキストにシームレスマーキーを適用
  const GAP_PX = 48; // テキスト繰り返し間の空白幅 (px)
  const SPEED_PX_S = 60; // スクロール速度 (px/s)
  requestAnimationFrame(() => {
    mediaGrid.querySelectorAll(".media-card .scroll-text").forEach((el) => {
      const parent = el.parentElement;
      const singleWidth = el.scrollWidth;
      if (singleWidth <= parent.clientWidth) return;

      // テキストを複製してシームレスループ構造にする
      const originalText = el.textContent;
      el.textContent = "";
      el.appendChild(document.createTextNode(originalText));
      const gap = document.createElement("span");
      gap.style.cssText = `display:inline-block;width:${GAP_PX}px`;
      el.appendChild(gap);
      el.appendChild(document.createTextNode(originalText));

      const totalDist = singleWidth + GAP_PX;
      el.style.setProperty("--overflow-width", `-${totalDist}px`);
      el.style.setProperty("--scroll-duration", `${(totalDist / SPEED_PX_S).toFixed(1)}s`);
      el.classList.add("is-overflowing");
    });
  });
};

const setSelectedPlaylist = (type, playlistId) => {
  state.selectedPlaylist = { type, id: playlistId };
  playlistManageState.active = false; // プレイリスト切り替え時に管理モードをリセット
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

const buildPlaylistTrackRow = (track, listType, idx) => {
  const row = document.createElement("div");
  row.className = "playlist-track-row";
  row.dataset.trackId = track.id;
  const selectedPlaylist = getSelectedPlaylistData();
  const canEditTrackList =
    listType === "favorites" ? canUseFavoritesActions() : canManagePlaylist(selectedPlaylist);
  row.innerHTML = `
    <span class="playlist-drag-handle" draggable="${canEditTrackList ? "true" : "false"}" aria-label="並び替え" ${canEditTrackList ? "" : "hidden"}>
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
    <img class="media-list-cover" src="${escapeHtml(track.cover)}" alt="${escapeHtml(track.album)}" />
    <span class="media-list-title">${escapeHtml(track.title)}</span>
    <span class="media-list-artist">${escapeHtml(track.artist)}</span>
    <span class="media-list-duration">${escapeHtml(track.duration)}</span>
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
      event.target.closest(".playlist-drag-handle") ||
      event.target.closest(".track-menu-btn")
    ) {
      return;
    }
    const index = state.tracks.findIndex((item) => item.id === track.id);
    if (index >= 0) {
      setTrackByIndex(index);
      togglePlayback();
    }
  });
  const dragHandle = row.querySelector(".playlist-drag-handle");
  if (canEditTrackList && dragHandle) {
    dragHandle.addEventListener("dragstart", (event) => {
      row.classList.add("is-dragging");
      event.dataTransfer.effectAllowed = "move";
      event.dataTransfer.setData("text/plain", track.id);
    });
    dragHandle.addEventListener("dragend", () => {
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
  }
  const removeButton = row.querySelector(".playlist-remove");
  if (removeButton) {
    if (!canEditTrackList) {
      removeButton.hidden = true;
    } else {
      removeButton.addEventListener("click", () => {
        removePlaylistTrack(listType, track.id);
      });
    }
  }
  const menuBtn = row.querySelector(".track-menu-btn");
  if (menuBtn) {
    row.addEventListener("pointerenter", () => menuBtn.classList.add("is-hovered"));
    row.addEventListener("pointerleave", () => menuBtn.classList.remove("is-hovered"));
    menuBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      showTrackContextMenu(track.id, menuBtn);
    });
  }
  return row;
};

// --- Up Next パネル ---
const getUpNextTracks = () => {
  const total = state.tracks.length;
  if (total === 0) return [];
  const MAX = 30;
  const result = [];

  // キュー内トラック
  const queued = playerState.playQueue.map(id => {
    const t = state.tracks.find(tr => tr.id === id);
    return t ? { ...t, _queued: true } : null;
  }).filter(Boolean);

  // loopMode=track の場合は候補なし
  if (playerState.loopMode === "track") {
    return [...queued];
  }

  if (playerState.shuffleMode && playerState.shuffleIndices.length > 0) {
    // シャッフルモード: shufflePosition+1 以降
    const startPos = playerState.shufflePosition + 1;
    const remaining = playerState.shuffleIndices.slice(startPos);
    for (let i = 0; i < Math.min(remaining.length, MAX); i++) {
      const t = state.tracks[remaining[i]];
      if (t) result.push(t);
    }
    // loopMode=playlist の場合は折り返し分も追加（残り枠があれば）
    if (playerState.loopMode === "playlist" && result.length < MAX && remaining.length < MAX) {
      const wrap = playerState.shuffleIndices.slice(0, startPos);
      for (let i = 0; i < Math.min(wrap.length, MAX - result.length); i++) {
        const t = state.tracks[wrap[i]];
        if (t) result.push(t);
      }
    }
  } else {
    // 通常モード
    const startIdx = (playerState.currentIndex + 1);
    if (playerState.loopMode === "playlist") {
      // 折り返しあり
      for (let i = 0; i < Math.min(total, MAX); i++) {
        const t = state.tracks[(startIdx + i) % total];
        if (t) result.push(t);
      }
    } else {
      // loopMode=off: 末尾まで
      for (let i = startIdx; i < total && result.length < MAX; i++) {
        const t = state.tracks[i];
        if (t) result.push(t);
      }
    }
  }
  return [...queued, ...result];
};

const renderUpNextPanel = () => {
  const body = document.getElementById("up-next-body");
  if (!body) return;
  body.innerHTML = "";

  const queued = playerState.playQueue.map(id => {
    const t = state.tracks.find(tr => tr.id === id);
    return t ? { ...t, _queued: true } : null;
  }).filter(Boolean);

  const isTrackLoop = playerState.loopMode === "track";

  // キューセクション
  if (queued.length > 0) {
    const sec = document.createElement("div");
    sec.className = "up-next-section";
    sec.innerHTML = `<div class="up-next-section-label">キュー</div>`;
    queued.forEach((track, i) => {
      const item = document.createElement("div");
      item.className = "up-next-item";
      item.innerHTML = `
        <img class="up-next-cover" src="${track.cover}" alt="" loading="lazy" />
        <div class="up-next-info">
          <div class="up-next-track-title">${track.title}</div>
          <div class="up-next-track-artist">${track.artist}</div>
        </div>
        <button class="up-next-remove" type="button" data-queue-idx="${i}" aria-label="キューから削除">✕</button>
      `;
      item.querySelector(".up-next-remove").addEventListener("click", (e) => {
        const idx = parseInt(e.currentTarget.dataset.queueIdx, 10);
        playerState.playQueue.splice(idx, 1);
        renderUpNextPanel();
      });
      sec.appendChild(item);
    });
    body.appendChild(sec);
  }

  // 次の候補セクション
  const nextSec = document.createElement("div");
  nextSec.className = "up-next-section";
  nextSec.innerHTML = `<div class="up-next-section-label">次の候補</div>`;

  if (isTrackLoop) {
    nextSec.innerHTML += `<div class="up-next-empty">1曲ループ中</div>`;
  } else {
    const nextTracks = getUpNextTracks().filter(t => !t._queued);
    if (nextTracks.length === 0) {
      nextSec.innerHTML += `<div class="up-next-empty">再生候補がありません</div>`;
    } else {
      nextTracks.forEach(track => {
        const item = document.createElement("div");
        item.className = "up-next-item";
        item.innerHTML = `
          <img class="up-next-cover" src="${track.cover}" alt="" loading="lazy" />
          <div class="up-next-info">
            <div class="up-next-track-title">${track.title}</div>
            <div class="up-next-track-artist">${track.artist}</div>
          </div>
        `;
        item.addEventListener("click", () => {
          const idx = state.tracks.findIndex(t => t.id === track.id);
          if (idx >= 0) {
            setTrackByIndex(idx, false);
            if (audioPlayer) audioPlayer.play().catch(() => {});
          }
        });
        nextSec.appendChild(item);
      });
    }
  }
  body.appendChild(nextSec);
};

const openUpNextPanel = () => {
  const panel = document.getElementById("up-next-panel");
  if (!panel) return;
  renderUpNextPanel();
  panel.setAttribute("aria-hidden", "false");
  document.getElementById("sp-queue")?.setAttribute("aria-pressed", "true");
};

const closeUpNextPanel = () => {
  const panel = document.getElementById("up-next-panel");
  if (!panel) return;
  panel.setAttribute("aria-hidden", "true");
  document.getElementById("sp-queue")?.setAttribute("aria-pressed", "false");
  document.getElementById("player-queue-view")?.setAttribute("aria-pressed", "false");
  document.getElementById("mobile-player-queue")?.setAttribute("aria-pressed", "false");
};

const toggleUpNextPanel = () => {
  const panel = document.getElementById("up-next-panel");
  if (!panel) return;
  if (panel.getAttribute("aria-hidden") === "false") {
    closeUpNextPanel();
  } else {
    openUpNextPanel();
  }
};

// --- 曲コンテキストメニュー ---
let _trackContextMenuId = null;
let _trackContextMenuBtn = null;

const showTrackContextMenu = (trackId, anchorEl) => {
  // 前のボタンのアクティブ状態をリセット
  if (_trackContextMenuBtn && _trackContextMenuBtn !== anchorEl) {
    _trackContextMenuBtn.classList.remove("is-active");
  }
  _trackContextMenuId = trackId;
  _trackContextMenuBtn = anchorEl;
  anchorEl.classList.add("is-active");

  const menu = document.getElementById("track-context-menu");
  const backdrop = document.getElementById("track-ctx-backdrop");
  if (!menu) return;
  menu.setAttribute("aria-hidden", "false");
  if (backdrop) backdrop.setAttribute("aria-hidden", "false");

  // 位置計算（画面右端クリップを避ける）
  const anchorRect = anchorEl.getBoundingClientRect();
  const menuW = 200;
  const menuH = 180;
  let left = anchorRect.right + 4;
  let top = anchorRect.top;
  if (left + menuW > window.innerWidth) {
    left = anchorRect.left - menuW - 4;
  }
  if (top + menuH > window.innerHeight) {
    top = window.innerHeight - menuH - 8;
  }
  menu.style.left = `${Math.max(4, left)}px`;
  menu.style.top = `${Math.max(4, top)}px`;

  // お気に入り状態を反映
  const track = state.tracks.find(t => t.id === trackId);
  const favBtn = menu.querySelector("[data-action='favorite']");
  if (favBtn && track) {
    const isFav = Array.isArray(state.favorites) && state.favorites.includes(track.id);
    const favSpan = favBtn.querySelector("span");
    if (favSpan) favSpan.textContent = isFav ? "お気に入りから削除" : "お気に入りに追加";
  }
};

const hideTrackContextMenu = () => {
  const menu = document.getElementById("track-context-menu");
  const backdrop = document.getElementById("track-ctx-backdrop");
  if (!menu) return;
  menu.setAttribute("aria-hidden", "true");
  if (backdrop) backdrop.setAttribute("aria-hidden", "true");
  if (_trackContextMenuBtn) {
    _trackContextMenuBtn.classList.remove("is-active", "is-hovered");
    _trackContextMenuBtn.blur();
    _trackContextMenuBtn = null;
  }
  _trackContextMenuId = null;
};

const formatSyncStatus = (playlist) => {
  if (!playlist?.auto_sync_last_run) {
    return "まだ同期されていません。";
  }
  const errorText = playlist.auto_sync_last_error
    ? `（エラー: ${playlist.auto_sync_last_error.split("\n")[0]}）`
    : "";
  return `最終同期: ${playlist.auto_sync_last_run} ${errorText}`.trim();
};

const buildPlaylistSyncCard = (playlist) => {
  const card = document.createElement("div");
  card.className = "card playlist-sync-card";
  card.innerHTML = `
    <h4>プレイリスト自動同期</h4>
    <p class="playlist-sync-lead">
      外部プレイリストとの差分を定期的にチェックして追加曲を取り込みます。
    </p>
    <label>
      <span>同期先プレイリスト URL</span>
      <input type="url" class="playlist-sync-url" placeholder="https://www.youtube.com/playlist?list=..." />
    </label>
    <label>
      <span>同期間隔（分）</span>
      <input type="number" class="playlist-sync-interval" min="1" step="1" placeholder="60" />
    </label>
    <label class="checkbox">
      <input type="checkbox" class="playlist-sync-enabled" />
      <span>自動同期を有効にする</span>
    </label>
    <div class="playlist-sync-actions">
      <button type="button" class="secondary playlist-sync-save">設定を保存</button>
      <button type="button" class="primary playlist-sync-run">手動で同期する</button>
    </div>
    <p class="playlist-sync-status"></p>
  `;
  const urlInput = card.querySelector(".playlist-sync-url");
  const intervalInput = card.querySelector(".playlist-sync-interval");
  const enabledInput = card.querySelector(".playlist-sync-enabled");
  const saveButton = card.querySelector(".playlist-sync-save");
  const runButton = card.querySelector(".playlist-sync-run");
  const statusLabel = card.querySelector(".playlist-sync-status");

  if (urlInput) {
    urlInput.value = playlist.auto_sync_url || "";
  }
  if (intervalInput) {
    intervalInput.value = playlist.auto_sync_interval_minutes || "";
  }
  if (enabledInput) {
    const enabled =
      playlist.auto_sync_enabled ?? Boolean(playlist.auto_sync_url);
    enabledInput.checked = Boolean(enabled);
  }
  if (runButton) {
    runButton.hidden = !playlist.auto_sync_url;
  }
  if (statusLabel) {
    statusLabel.textContent = formatSyncStatus(playlist);
  }
  if (saveButton) {
    saveButton.addEventListener("click", async () => {
      if (!urlInput || !intervalInput || !enabledInput) {
        return;
      }
      const autoSyncUrl = urlInput.value.trim();
      const intervalValue = intervalInput.value.trim();
      const parsedInterval = intervalValue ? Number(intervalValue) : null;
      const payload = {
        auto_sync_url: autoSyncUrl || null,
        auto_sync_interval_minutes: Number.isFinite(parsedInterval)
          ? parsedInterval
          : null,
        auto_sync_enabled: autoSyncUrl ? Boolean(enabledInput.checked) : false,
      };
      try {
        const updated = await updatePlaylistSettings(playlist.id, payload);
        const targetIndex = state.playlists.findIndex(
          (item) => item.id === updated.id
        );
        if (targetIndex >= 0) {
          state.playlists[targetIndex] = updated;
        }
        renderPlaylists();
        renderPlaylistDetail();
      } catch (error) {
        console.error(error);
      }
    });
  }
  if (runButton) {
    runButton.addEventListener("click", async () => {
      if (statusLabel) {
        statusLabel.textContent = "同期中...";
      }
      try {
        await syncPlaylistNow(playlist.id);
        await refreshLibrary();
      } catch (error) {
        if (statusLabel) {
          statusLabel.textContent = `同期に失敗しました: ${error.message}`;
        }
      }
    });
  }
  return card;
};

const renderPlaylistDetail = () => {
  if (!playlistDetailBody || !playlistDetailTitle || !playlistDetailDesc) {
    return;
  }
  if (playlistDetailBody._marqueeObserver) {
    playlistDetailBody._marqueeObserver.disconnect();
    playlistDetailBody._marqueeObserver = null;
  }
  playlistDetailBody.innerHTML = "";
  const selected = getSelectedPlaylistData();
  if (!selected) {
    playlistDetailTitle.textContent = "プレイリストを選択";
    playlistDetailDesc.textContent =
      "左側のリストから表示したいプレイリストを選択してください。";
    if (playlistManageToggle) playlistManageToggle.hidden = true;
    return;
  }
  playlistDetailTitle.textContent = selected.name;
  playlistDetailDesc.textContent = `収録曲数: ${selected.track_ids.length}`;
  // 管理ボタンを表示し、現在の管理モード状態を反映
  if (playlistManageToggle) {
    playlistManageToggle.hidden = false;
    playlistManageToggle.setAttribute("aria-pressed", playlistManageState.active ? "true" : "false");
    playlistManageToggle.classList.toggle("is-active", playlistManageState.active);
  }
  if (selected.id !== "favorites") {
    // sync settings moved to modal
  }
  const visibleTrackIds = selected.track_ids.filter((trackId) => {
    const track = state.tracks.find((item) => item.id === trackId);
    if (!track) {
      return false;
    }
    const query = normalizeQuery(searchState.playlistTrackQuery);
    if (!query) {
      return true;
    }
    const target = `${track.title} ${track.artist} ${track.album}`.toLowerCase();
    return target.includes(query);
  });
  if (visibleTrackIds.length === 0) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.textContent = "該当する曲がありません。";
    playlistDetailBody.appendChild(empty);
    return;
  }
  const list = document.createElement("div");
  list.className = playlistManageState.active
    ? "playlist-track-list playlist-track-list--managing"
    : "playlist-track-list";
  const isSpotify = window._sqTheme && window._sqTheme.spotify;
  if (isSpotify) {
    list.innerHTML = `
      <div class="playlist-track-header">
        <span class="col-manage-placeholder"></span>
        <span>#</span>
        <span class="col-title" data-sort="title">タイトル</span>
        <span class="col-album" data-sort="album">アルバム</span>
        <span data-sort="duration">再生時間</span>
        <span class="col-manage-placeholder"></span>
      </div>
    `;
  } else {
    list.innerHTML = `
      <div class="playlist-track-header">
        <span class="col-manage-placeholder"></span>
        <span class="col-title">タイトル</span>
        <span>アーティスト</span>
        <span>再生時間</span>
        <span class="col-manage-placeholder"></span>
      </div>
    `;
  }
  visibleTrackIds.forEach((trackId, idx) => {
    const track = state.tracks.find((item) => item.id === trackId);
    if (!track) return;
    list.appendChild(
      buildPlaylistTrackRow(track, selected.id === "favorites" ? "favorites" : "playlist", idx)
    );
  });
  playlistDetailBody.appendChild(list);
  if (isSpotify) {
    // Spotify UI: タイトル/アーティスト（スタック内）にマーキー適用
    list.querySelectorAll(".media-list-title-stack").forEach((stack) => {
      const titleEl = stack.querySelector(".media-list-title");
      const artistEl = stack.querySelector(".media-list-artist");
      if (titleEl) applyListMarquee(titleEl, titleEl.textContent);
      if (artistEl) applyListMarquee(artistEl, artistEl.textContent);
    });
  } else {
    // 標準UI: タイトル列とアーティスト列にマーキー適用（幅不足時のみ自動スクロール）
    const applyPlaylistMarquee = () => {
      list.querySelectorAll(".playlist-track-row").forEach((row) => {
        const titleEl = row.querySelector(".media-list-title");
        const artistEl = row.querySelector(".media-list-artist-col");
        if (titleEl) applyListMarquee(titleEl, titleEl.dataset.marqueeText || titleEl.textContent);
        if (artistEl) applyListMarquee(artistEl, artistEl.dataset.marqueeText || artistEl.textContent);
      });
    };
    applyPlaylistMarquee();
    // ResizeObserver でビューポート変化時にマーキーを再評価
    if (playlistDetailBody._marqueeObserver) playlistDetailBody._marqueeObserver.disconnect();
    const marqueeObserver = new ResizeObserver(() => {
      clearTimeout(playlistDetailBody._marqueeTimer);
      playlistDetailBody._marqueeTimer = setTimeout(applyPlaylistMarquee, 150);
    });
    marqueeObserver.observe(playlistDetailBody);
    playlistDetailBody._marqueeObserver = marqueeObserver;
  }
  updateMediaPlayingIndicator();
};

let _playlistEditTarget = null;

const closePlaylistEditModal = () => {
  if (!playlistEditModal) return;
  playlistEditModal.classList.remove("is-open");
  playlistEditModal.setAttribute("aria-hidden", "true");
  _playlistEditTarget = null;
};

const openPlaylistEditModal = (mode, playlist = null) => {
  if (!playlistEditModal) return;
  _playlistEditTarget = mode === "edit" ? playlist : null;
  if (playlistEditModalTitle) {
    playlistEditModalTitle.textContent =
      mode === "edit" ? "プレイリスト設定" : "新規プレイリスト作成";
  }
  if (playlistModalSubmit) {
    playlistModalSubmit.textContent = mode === "edit" ? "保存する" : "作成する";
  }
  if (playlistModalName) playlistModalName.value = playlist?.name || "";
  if (playlistModalUrl) playlistModalUrl.value = playlist?.auto_sync_url || "";
  if (playlistModalInterval) {
    playlistModalInterval.value = playlist?.auto_sync_interval_minutes || "";
  }
  if (playlistModalAutosync) {
    playlistModalAutosync.checked = Boolean(playlist?.auto_sync_enabled);
  }
  if (playlistModalSyncBtn) {
    playlistModalSyncBtn.hidden = !(mode === "edit" && playlist?.auto_sync_url);
  }
  if (playlistModalSyncStatus) {
    playlistModalSyncStatus.hidden = true;
    playlistModalSyncStatus.textContent = "";
  }
  playlistEditModal.classList.add("is-open");
  playlistEditModal.setAttribute("aria-hidden", "false");
  if (playlistModalName) playlistModalName.focus();
};

const renderPlaylists = () => {
  playlistList.innerHTML = "";

  // Populate playlist select dropdown (for auth/visibility UI compatibility)
  if (playlistSelectDropdown) {
    playlistSelectDropdown.innerHTML = "";
    const favoritesOption = document.createElement("option");
    favoritesOption.value = "favorites";
    favoritesOption.textContent = `お気に入り (${state.favorites.length})`;
    playlistSelectDropdown.appendChild(favoritesOption);
    visiblePlaylists.forEach((playlist) => {
      const option = document.createElement("option");
      option.value = playlist.id;
      const visibilityLabel = playlist.is_public ? "公開" : "非公開";
      option.textContent = `${playlist.name} (${visibilityLabel})`;
      playlistSelectDropdown.appendChild(option);
    });
    const selectedValue = state.selectedPlaylist?.type === "playlist"
      ? state.selectedPlaylist.id
      : "favorites";
    playlistSelectDropdown.value = selectedValue;
  }

  const heading = document.createElement("h4");
  heading.className = "playlist-section-title";
  heading.textContent = "プレイリスト一覧";
  playlistList.appendChild(heading);

  // Favorites pinned item always at top
  const favButton = document.createElement("button");
  favButton.type = "button";
  favButton.className = "playlist-item-main-only playlist-item--pinned";
  if (state.selectedPlaylist?.type === "favorites") {
    favButton.classList.add("is-active");
  }
  favButton.innerHTML = `
    <span class="playlist-item-title">★ お気に入り</span>
    <span class="playlist-item-meta">登録数: ${state.favorites.length}</span>
  `;
  favButton.addEventListener("click", () => {
    setSelectedPlaylist("favorites", "favorites");
  });
  playlistList.appendChild(favButton);

  const visiblePlaylists = filterPlaylists(state.playlists, searchState.playlistQuery);
  if (visiblePlaylists.length === 0) {
    if (searchState.playlistQuery) {
      const empty = document.createElement("div");
      empty.className = "empty-state";
      empty.textContent = "該当するプレイリストがありません。";
      playlistList.appendChild(empty);
    }
    return;
  }
  visiblePlaylists.forEach((playlist) => {
    const item = document.createElement("div");
    item.className = "playlist-item";
    if (
      state.selectedPlaylist?.type === "playlist" &&
      state.selectedPlaylist?.id === playlist.id
    ) {
      item.classList.add("is-active");
    }

    let syncBadgeHtml = "";
    if (playlist.auto_sync_last_error) {
      const errTitle = playlist.auto_sync_last_error.replace(/"/g, "&quot;").split("\n")[0];
      syncBadgeHtml = ` <span class="playlist-sync-badge playlist-sync-badge--error" title="${errTitle}">⚠</span>`;
    } else if (playlist.auto_sync_enabled) {
      syncBadgeHtml = ` <span class="playlist-sync-badge playlist-sync-badge--active" title="自動同期有効">⟳</span>`;
    }

    const mainButton = document.createElement("button");
    mainButton.type = "button";
    mainButton.className = "playlist-item-main";
    mainButton.innerHTML = `
      <span class="playlist-item-title">${playlist.name}${syncBadgeHtml}</span>
      <span class="playlist-item-meta">登録数: ${playlist.track_ids.length}</span>
    `;
    mainButton.addEventListener("click", () => {
      setSelectedPlaylist("playlist", playlist.id);
    });

    const menuWrap = document.createElement("div");
    menuWrap.className = "playlist-item-menu";

    const menuBtn = document.createElement("button");
    menuBtn.type = "button";
    menuBtn.className = "icon-button playlist-item-dots";
    menuBtn.setAttribute("aria-label", "オプション");
    menuBtn.textContent = "⋯";

    const dropdown = document.createElement("div");
    dropdown.className = "playlist-item-dropdown";
    dropdown.hidden = true;

    const editOpt = document.createElement("button");
    editOpt.type = "button";
    editOpt.className = "playlist-item-dropdown-item";
    editOpt.textContent = "設定を編集";
    editOpt.addEventListener("click", (e) => {
      e.stopPropagation();
      dropdown.hidden = true;
      openPlaylistEditModal("edit", playlist);
    });

    const delOpt = document.createElement("button");
    delOpt.type = "button";
    delOpt.className = "playlist-item-dropdown-item playlist-item-dropdown-item--danger";
    delOpt.textContent = "削除";
    delOpt.addEventListener("click", async (e) => {
      e.stopPropagation();
      dropdown.hidden = true;
      const result = await showConfirmDialog({
        title: "プレイリストを削除",
        message: `プレイリスト「${playlist.name}」を削除しますか？`,
        showFileOption: false,
        buttons: [
          { label: "キャンセル", className: "secondary", value: "cancel" },
          { label: "削除する", className: "danger", value: "confirm" },
        ],
      });
      if (result.action !== "confirm") {
        return;
      }
      try {
        await deletePlaylist(playlist.id);
        state.playlists = state.playlists.filter((p) => p.id !== playlist.id);
        ensureSelectedPlaylist();
        renderPlaylists();
        renderPlaylistDetail();
      } catch (error) {
        console.error(error);
      }
    });

    menuBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      document.querySelectorAll(".playlist-item-dropdown:not([hidden])").forEach((d) => {
        if (d !== dropdown) d.hidden = true;
      });
      if (dropdown.hidden) {
        const rect = menuBtn.getBoundingClientRect();
        dropdown.style.top = `${rect.bottom + 4}px`;
        dropdown.style.right = `${window.innerWidth - rect.right}px`;
        dropdown.hidden = false;
      } else {
        dropdown.hidden = true;
      }
    });

    dropdown.appendChild(editOpt);
    dropdown.appendChild(delOpt);
    menuWrap.appendChild(menuBtn);
    menuWrap.appendChild(dropdown);
    item.appendChild(mainButton);
    item.appendChild(menuWrap);
    playlistList.appendChild(item);
  });
};

const renderFavorites = () => {
  renderPlaylists();
};

const renderPlaylistModalList = () => {
  if (!playlistModalList) {
    return;
  }
  playlistModalList.innerHTML = "";
  const manageablePlaylists = state.playlists.filter((playlist) => canManagePlaylist(playlist));
  if (!manageablePlaylists.length) {
    const empty = document.createElement("p");
    empty.className = "player-menu-title";
    empty.textContent = "追加可能なプレイリストがありません";
    playlistModalList.appendChild(empty);
    return;
  }
  const isBulkMode = selectionState.active && selectionState.selectedIds.size > 0;
  const track = state.tracks[playerState.currentIndex];
  manageablePlaylists.forEach((playlist) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "modal-item";
    const alreadyAdded = !isBulkMode && track ? playlist.track_ids.includes(track.id) : false;
    button.disabled = !isBulkMode && (!track || alreadyAdded);
    button.innerHTML = `
      <strong>${playlist.name}</strong>
      <span>収録曲数: ${playlist.track_ids.length}</span>
      ${alreadyAdded ? "<span>追加済み</span>" : ""}
    `;
    button.addEventListener("click", async () => {
      if (isBulkMode) {
        const idsToAdd = [...selectionState.selectedIds].filter(
          (id) => !playlist.track_ids.includes(id)
        );
        if (idsToAdd.length) {
          const updatedTrackIds = [...playlist.track_ids, ...idsToAdd];
          try {
            await updatePlaylistTracks(playlist.id, updatedTrackIds);
            playlist.track_ids = updatedTrackIds;
            renderPlaylistDetail();
            renderPlaylists();
          } catch (error) {
            console.error(error);
          }
        }
        closePlaylistModal();
        exitSelectionMode();
      } else {
        addTrackToPlaylist(playlist.id);
        closePlaylistModal();
      }
    });
    playlistModalList.appendChild(button);
  });
};

const renderPlaylistSelectOptions = () => {
  const selects = [
    importPlaylistSelect,
    uploadPlaylistSelect,
    localFolderPlaylistSelect,
  ].filter(Boolean);
  selects.forEach((select) => {
    select.innerHTML = '<option value="">指定なし</option>';
    state.playlists.filter((playlist) => canManagePlaylist(playlist)).forEach((playlist) => {
      const option = document.createElement("option");
      option.value = playlist.id;
      option.textContent = playlist.name;
      select.appendChild(option);
    });
  });
};

const openTrackEditModal = (track) => {
  if (!track || !trackEditModal) {
    return;
  }
  if (trackEditTitle) {
    trackEditTitle.value = track.title || "";
  }
  if (trackEditArtist) {
    trackEditArtist.value = track.artist || "";
  }
  if (trackEditAlbum) {
    trackEditAlbum.value = track.album || "";
  }
  if (trackEditSourceUrl) {
    trackEditSourceUrl.value = track.source_url || "";
  }
  trackEditModal.classList.add("is-open");
  trackEditModal.setAttribute("aria-hidden", "false");
};

const closeTrackEditModal = () => {
  if (!trackEditModal) {
    return;
  }
  trackEditModal.classList.remove("is-open");
  trackEditModal.setAttribute("aria-hidden", "true");
};

const openPlaylistModal = () => {
  if (!playlistModal) {
    return;
  }
  renderPlaylistModalList();
  playlistModal.classList.add("is-open");
  playlistModal.setAttribute("aria-hidden", "false");
};

const closePlaylistModal = () => {
  if (!playlistModal) {
    return;
  }
  playlistModal.classList.remove("is-open");
  playlistModal.setAttribute("aria-hidden", "true");
};

const updatePlayerMenuButtons = () => {
  const track = state.tracks[playerState.currentIndex];
  if (playerOpenSource) {
    const hasSource = Boolean(track?.source_url);
    playerOpenSource.disabled = !hasSource;
  }
  if (playerOpenVideo) {
    playerOpenVideo.disabled = !resolveTrackVideoUrl(track);
  }
  if (playerAddPlaylist) {
    playerAddPlaylist.style.display = canUsePlaylistActions() ? "" : "none";
    playerAddPlaylist.disabled = !track || !canUsePlaylistActions();
  }
  if (playerShareTrack) {
    playerShareTrack.disabled = !track;
  }
  if (playerDeleteTrack) {
    playerDeleteTrack.style.display = state.role === "admin" ? "" : "none";
    playerDeleteTrack.disabled = !track || state.role !== "admin";
  }
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

const deletePlaylist = async (playlistId) => {
  await requestJson(`/api/playlists/${playlistId}`, null, "DELETE");
};

const updatePlaylistSettings = async (playlistId, payload) => {
  return requestJson(`/api/playlists/${playlistId}`, payload, "PUT");
};

const syncPlaylistNow = async (playlistId) => {
  return requestJson(`/api/playlists/${playlistId}/sync`, null, "POST");
};

const updateFavoritesTracks = async (trackIds) => {
  await requestJson("/api/favorites", { track_ids: trackIds }, "PUT");
};

const updateTrackMetadata = async (trackId, payload) => {
  return requestJson(`/api/library/${trackId}`, payload, "PUT");
};

const deleteTrack = async (trackId, deleteFile = true) => {
  return requestJson(`/api/library/${trackId}?delete_file=${deleteFile}`, null, "DELETE");
};

const addTrackToPlaylist = async (playlistId) => {
  const track = state.tracks[playerState.currentIndex];
  if (!track) {
    return;
  }
  const playlist = state.playlists.find((item) => item.id === playlistId);
  if (!playlist) {
    return;
  }
  if (playlist.track_ids.includes(track.id)) {
    appendImportLog("この曲はすでにプレイリストに登録されています。", { append: true });
    return;
  }
  const updatedTrackIds = [...playlist.track_ids, track.id];
  try {
    await updatePlaylistTracks(playlistId, updatedTrackIds);
    playlist.track_ids = updatedTrackIds;
    renderPlaylistDetail();
    renderPlaylists();
    renderPlaylistModalList();
  } catch (error) {
    appendImportLog(`プレイリストへの追加に失敗しました: ${error.message}`, { append: true });
  }
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

const activateTab = (tabName) => {
  const targetTab = document.querySelector(`.nav-button[data-tab="${tabName}"]`);
  const targetPanel = document.getElementById(`panel-${tabName}`);
  if (!targetTab || !targetPanel) {
    return;
  }
  tabs.forEach((tab) => tab.classList.remove("is-active"));
  panels.forEach((panel) => panel.classList.remove("is-active"));
  targetTab.classList.add("is-active");
  targetPanel.classList.add("is-active");
};

const getConfiguredBaseUrl = () => {
  const value = settingsBaseUrlInput?.value?.trim() || "";
  return value.replace(/\/$/, "");
};

const buildShareUrl = (track) => {
  if (!track?.id) {
    return null;
  }
  const configuredBaseUrl = getConfiguredBaseUrl();
  const fallbackBaseUrl = window.location.origin;
  const rootUrl = configuredBaseUrl || fallbackBaseUrl;
  return `${rootUrl}/share/${encodeURIComponent(track.id)}`;
};

const renderSettings = (settings) => {
  if (settingsVersionList) {
    const version = settings?.version || {};
    settingsVersionList.innerHTML = `
      <li class="settings-version-item">
        <a href="https://github.com/ibuto/squashterm" target="_blank" rel="noopener noreferrer"><img class="settings-version-logo" src="/branding/logo" alt="SquashTerm logo" /></a>
        <div class="settings-version-values">
          <div class="settings-version-row">
            <span class="settings-version-label">バージョン</span>
            <strong>${version.app || "--"}</strong>
          </div>
          <div class="settings-version-row">
            <span class="settings-version-label">API</span>
            <strong>${version.api || "--"}</strong>
          </div>
          <div class="settings-version-row">
            <span class="settings-version-label">ビルド日時</span>
            <strong>${version.build || "--"}</strong>
          </div>
        </div>
      </li>
    `;
  }
  if (settingsBaseUrlInput) {
    settingsBaseUrlInput.value = settings?.app?.base_url || "";
  }
  if (designAccentColorInput) {
    designAccentColorInput.value = settings?.design?.accent_color || "#38bdf8";
  }
  if (settingsShowVideoOnPlayer) {
    settingsShowVideoOnPlayer.checked = Boolean(state.authUser?.show_video_on_player ?? true);
  }
  applyDesignTheme(settings?.design);
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
        input.dataset.optionId = option.id;
        input.addEventListener("change", async (e) => {
          try {
            await requestJson(
              "/api/settings/playback-options",
              {
                option_id: option.id,
                enabled: e.target.checked,
              },
              "PUT"
            );
          } catch (err) {
            console.error("設定保存エラー:", err);
            e.target.checked = !e.target.checked;
          }
        });
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
  if (aboutSystemCard) {
    aboutSystemCard.style.display = state.role === "admin" ? "" : "none";
  }
  if (!system) {
    if (systemInfoList) {
      systemInfoList.innerHTML = "";
    }
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
    throw new Error(await parseErrorMessage(response, `Failed to load ${path}`));
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
    throw new Error(await parseErrorMessage(response, `Failed to ${method} ${path}`));
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
  renderPlaylistDetail();
  renderTagOptions();
  renderPlaylistSelectOptions();
  updatePlayerUI();
  updateFavoriteButtons();
  renderPlaylistModalList();
};

const appendImportLog = (message, options = {}) => {
  if (!importLog) {
    return;
  }
  const { append, reset } = options;
  const maxLength = 3000;
  if (reset) {
    importLog.textContent = "";
  }
  const currentText = append ? `${importLog.textContent}\n${message}` : message;
  if (currentText.length > maxLength) {
    importLog.textContent = currentText.slice(-maxLength);
    return;
  }
  importLog.textContent = currentText.trimStart();
};

const appendUploadLog = (message, options = {}) => {
  if (!uploadLog) {
    return;
  }
  const { append, reset } = options;
  const maxLength = 3000;
  if (reset) {
    uploadLog.textContent = "";
  }
  const currentText = append ? `${uploadLog.textContent}\n${message}` : message;
  if (currentText.length > maxLength) {
    uploadLog.textContent = currentText.slice(-maxLength);
    return;
  }
  uploadLog.textContent = currentText.trimStart();
};

const appendLocalFolderLog = (message, options = {}) => {
  if (!localFolderLog) {
    return;
  }
  const { append, reset } = options;
  const maxLength = 3000;
  if (reset) {
    localFolderLog.textContent = "";
  }
  const currentText = append ? `${localFolderLog.textContent}\n${message}` : message;
  if (currentText.length > maxLength) {
    localFolderLog.textContent = currentText.slice(-maxLength);
    return;
  }
  localFolderLog.textContent = currentText.trimStart();
};

const updateImportProgress = (percent, message) => {
  if (!importProgressBar || !importProgressText) {
    return;
  }
  const clamped = Math.max(0, Math.min(100, Math.floor(percent)));
  importProgressBar.style.width = `${clamped}%`;
  importProgressText.textContent = message
    ? `進行状況: ${clamped}% (${message})`
    : `進行状況: ${clamped}%`;
};

const streamImport = async (payload) => {
  const response = await fetch("/api/library/import/stream", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "ストリームの開始に失敗しました。");
  }
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  while (true) {
    const { value, done } = await reader.read();
    if (done) {
      break;
    }
    buffer += decoder.decode(value, { stream: true });
    const chunks = buffer.split("\n\n");
    buffer = chunks.pop() || "";
    chunks.forEach((chunk) => {
      const line = chunk
        .split("\n")
        .find((entry) => entry.startsWith("data: "));
      if (!line) {
        return;
      }
      const data = line.replace("data: ", "").trim();
      if (!data) {
        return;
      }
      try {
        const event = JSON.parse(data);
        if (event.type === "log") {
          appendImportLog(event.message, { append: true });
        }
        if (event.type === "progress") {
          updateImportProgress(event.value, event.message);
        }
        if (event.type === "error") {
          updateImportProgress(0, "エラー");
          appendImportLog(`エラー: ${event.message}`, { append: true });
        }
        if (event.type === "complete") {
          updateImportProgress(100, "完了");
          appendImportLog("取り込み完了。", { append: true });
        }
      } catch (error) {
        console.error(error);
      }
    });
  }
};

const streamPlaylistBatchImport = async (payload) => {
  const response = await fetch("/api/library/import/playlist-batch", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "プレイリストダウンロードの開始に失敗しました。");
  }
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  while (true) {
    const { value, done } = await reader.read();
    if (done) {
      break;
    }
    buffer += decoder.decode(value, { stream: true });
    const chunks = buffer.split("\n\n");
    buffer = chunks.pop() || "";
    chunks.forEach((chunk) => {
      const line = chunk
        .split("\n")
        .find((entry) => entry.startsWith("data: "));
      if (!line) {
        return;
      }
      const data = line.replace("data: ", "").trim();
      if (!data) {
        return;
      }
      try {
        const event = JSON.parse(data);
        if (event.type === "log") {
          appendImportLog(event.message, { append: true });
        }
        if (event.type === "progress") {
          const total = event.total || 1;
          const completed = event.completed || 0;
          const failed = event.failed || 0;
          const percentage = Math.floor((completed + failed) / total * 100);
          updateImportProgress(percentage, `${completed}/${total} 完了 (失敗: ${failed})`);
          appendImportLog(`進行中: ${event.message || ''}`, { append: true });
        }
        if (event.type === "error") {
          updateImportProgress(0, "エラー");
          appendImportLog(`エラー: ${event.message}`, { append: true });
        }
        if (event.type === "complete") {
          const total = event.total || 0;
          const completed = event.completed || 0;
          const failed = event.failed || 0;
          updateImportProgress(100, "完了");
          appendImportLog(`完了: ${completed}件成功, ${failed}件失敗`, { append: true });
        }
      } catch (error) {
        console.error(error);
      }
    });
  }
};

const handleImportSubmit = async () => {
  const url = importUrl?.value?.trim();
  if (!url) {
    appendImportLog("URL を入力してください。");
    return;
  }
  
  // 並列度設定を取得（デフォルト10）
  const concurrency = parseInt(localStorage.getItem("playlistConcurrency") || "10", 10);
  
  // バッチダウンロードAPI（自動判定含む）
  const payload = {
    url,
    concurrency,
  };
  payload.auto_tag = Boolean(importAutoTag?.checked);
  const playlistId = importPlaylistSelect?.value?.trim();
  if (playlistId) {
    payload.playlist_id = playlistId;
  }
  appendImportLog("ダウンロードを開始中...", { reset: true });
  updateImportProgress(0, "開始");
  try {
    await streamPlaylistBatchImport(payload);
    await refreshLibrary();
    importUrl.value = "";
  } catch (error) {
    appendImportLog(`エラー: ${error.message}`, { append: true });
    updateImportProgress(0, "失敗");
  }
};

const handleUploadSubmit = async () => {
  if (!uploadAudioInput || !uploadAudioInput.files?.length) {
    appendUploadLog("音声ファイルを選択してください。");
    return;
  }
  const formData = new FormData();
  formData.append("file", uploadAudioInput.files[0]);
  if (uploadCoverInput?.files?.length) {
    formData.append("cover", uploadCoverInput.files[0]);
  }
  if (uploadTitleInput?.value) {
    formData.append("title", uploadTitleInput.value.trim());
  }
  if (uploadArtistInput?.value) {
    formData.append("artist", uploadArtistInput.value.trim());
  }
  if (uploadAlbumInput?.value) {
    formData.append("album", uploadAlbumInput.value.trim());
  }
  if (uploadGenreInput?.value) {
    formData.append("genre", uploadGenreInput.value.trim());
  }
  if (uploadYearInput?.value) {
    formData.append("year", uploadYearInput.value.trim());
  }
  if (uploadSourceUrlInput?.value) {
    formData.append("source_url", uploadSourceUrlInput.value.trim());
  }
  if (uploadAutoTag) {
    formData.append("auto_tag", uploadAutoTag.checked ? "true" : "false");
  }
  const playlistId = uploadPlaylistSelect?.value?.trim();
  if (playlistId) {
    formData.append("playlist_id", playlistId);
  }
  appendUploadLog("アップロード中...", { reset: true });
  try {
    const response = await fetch("/api/library/upload", {
      method: "POST",
      body: formData,
    });
    if (!response.ok) {
      const message = await response.text();
      throw new Error(message || "アップロードに失敗しました。");
    }
    await response.json();
    appendUploadLog("アップロード完了。", { append: true });
    if (uploadForm) {
      uploadForm.reset();
    }
    await refreshLibrary();
  } catch (error) {
    appendUploadLog(`エラー: ${error.message}`, { append: true });
  }
};

const handleLocalFolderSubmit = async () => {
  if (!localFolderPathInput) {
    return;
  }
  const path = localFolderPathInput.value.trim();
  if (!path) {
    appendLocalFolderLog("フォルダパスを入力してください。");
    return;
  }
  const payload = {
    path,
    auto_tag: Boolean(localFolderAutoTag?.checked),
  };
  const playlistId = localFolderPlaylistSelect?.value?.trim();
  if (playlistId) {
    payload.playlist_id = playlistId;
  }
  appendLocalFolderLog("フォルダを取り込み中...", { reset: true });
  try {
    const result = await requestJson("/api/library/import/local-folder", payload, "POST");
    const addedCount = result?.added ?? 0;
    appendLocalFolderLog(`取り込み完了: ${addedCount}件追加`, { append: true });
    await refreshLibrary();
  } catch (error) {
    appendLocalFolderLog(`エラー: ${error.message}`, { append: true });
  }
};

const handlePlaylistCreate = async () => {
  if (!playlistNameInput || !hasLogin()) {
    appendImportLog("プレイリストを作成するにはログインが必要です。", { append: true });
    return;
  }
  const name = playlistNameInput.value.trim();
  if (!name) {
    return;
  }
  try {
    const playlist = await requestJson(
      "/api/playlists",
      { name, track_ids: [], is_public: playlistVisibility?.value === "public" },
      "POST"
    );
    state.playlists.push(playlist);
    playlistNameInput.value = "";
    if (playlistCreateForm) {
      playlistCreateForm.classList.remove("is-open");
      playlistCreateForm.setAttribute("aria-hidden", "true");
    }
    setSelectedPlaylist("playlist", playlist.id);
    renderPlaylistSelectOptions();
    renderPlaylistModalList();
  } catch (error) {
    appendImportLog(`プレイリスト作成に失敗しました: ${error.message}`, { append: true });
  }
};


const closeAuthMenu = () => {
  if (!authMenuPanel || !authLoginButton) {
    return;
  }
  authMenuPanel.classList.remove("is-open");
  authMenuPanel.setAttribute("aria-hidden", "true");
  authLoginButton.setAttribute("aria-expanded", "false");
};

const openAuthMenu = () => {
  if (!authMenuPanel || !authLoginButton || !state.authUser) {
    return;
  }
  authMenuPanel.classList.add("is-open");
  authMenuPanel.setAttribute("aria-hidden", "false");
  authLoginButton.setAttribute("aria-expanded", "true");
};

const applyAuthUi = () => {
  const settingsTabButton = document.querySelector('.nav-button[data-tab="settings"]');
  if (authLoginButton) {
    authLoginButton.style.display = "";
    authLoginButton.setAttribute("aria-expanded", "false");
    authLoginButton.classList.toggle("is-authenticated", Boolean(state.authUser));
  }
  if (authUserIcon) {
    authUserIcon.src = state.authUser?.icon_url || "/static/images/icon.png";
    authUserIcon.style.display = state.authUser ? "" : "none";
  }
  if (state.authUser) {
    if (authUserMeta) {
      authUserMeta.hidden = false;
    }
    if (authLoginLabel) {
      authLoginLabel.hidden = true;
      authLoginLabel.textContent = "";
    }
    if (authUserDisplay) {
      authUserDisplay.textContent = state.authUser.display_name || state.authUser.username || "-";
    }
    if (authUserId) {
      authUserId.textContent = `@${state.authUser.username || state.authUser.id || "-"}`;
    }
  } else {
    closeAuthMenu();
    if (authUserMeta) {
      authUserMeta.hidden = true;
    }
    if (authLoginLabel) {
      authLoginLabel.hidden = false;
      authLoginLabel.textContent = "ログイン";
    }
  }
  if (adminTabButton) {
    adminTabButton.style.display = state.role === "admin" ? "" : "none";
  }
  if (settingsTabButton) {
    settingsTabButton.style.display = hasLogin() ? "" : "none";
  }
  if (!hasLogin() && document.getElementById("panel-settings")?.classList.contains("is-active")) {
    activateTab("media");
  }
  if (playlistCreateToggle) {
    playlistCreateToggle.style.display = hasLogin() ? "" : "none";
  }
  if (playlistCreateForm) {
    const canEditPlaylist = hasLogin();
    playlistCreateForm.style.display = canEditPlaylist ? "" : "none";
    playlistCreateForm.classList.remove("is-open");
    playlistCreateForm.setAttribute("aria-hidden", "true");
  }
  if (settingsDisplayNameInput) {
    settingsDisplayNameInput.value = state.authUser?.display_name || state.authUser?.username || "";
  }
  if (settingsUserIcon) {
    settingsUserIcon.src = state.authUser?.icon_url || "/static/images/icon.png";
  }
  if (settingsShowVideoOnPlayer) {
    settingsShowVideoOnPlayer.checked = Boolean(state.authUser?.show_video_on_player ?? true);
  }
  updateBulkBar();
  renderPlaylists();
  renderPlaylistDetail();
  renderPlaylistModalList();
  renderPlaylistSelectOptions();
};

const fetchAuthMe = async () => {
  const auth = await fetchJson("/api/auth/me");
  state.authUser = auth.user;
  state.role = auth.role;
  applyAuthUi();
  try {
    const system = await fetchJson("/api/system");
    renderSystem(system);
  } catch (_error) {
    renderSystem(null);
  }
};

const showAdminPlaylistDialog = (userItem) => {
  if (!adminPlaylistDialog || !adminPlaylistDialogBody || !adminPlaylistDialogTitle) {
    return;
  }
  adminPlaylistDialogTitle.textContent = `${userItem.username} のプレイリスト`;
  const playlists = userItem.playlists || [];
  if (playlists.length === 0) {
    adminPlaylistDialogBody.innerHTML = "<p>プレイリストはありません。</p>";
    adminPlaylistDialog.showModal();
    return;
  }
  const blocks = playlists.map((playlistItem) => {
    const tracks = playlistItem.tracks || [];
    const trackValue = tracks.map((trackItem) => trackItem.id).join("\n");
    return `
      <div style="padding:0.75rem;border:1px solid var(--border-color);border-radius:12px;margin-bottom:0.75rem;">
        <p><strong>所有者:</strong> ${escapeHtml(playlistItem.owner_name || "(不明)")}</p>
        <label><span>タイトル</span><input type="text" data-edit="name" data-playlist-id="${escapeHtml(playlistItem.id)}" value="${escapeHtml(playlistItem.name || "")}" /></label>
        <label><span>公開設定</span><select data-edit="isPublic" data-playlist-id="${escapeHtml(playlistItem.id)}"><option value="public" ${playlistItem.is_public ? "selected" : ""}>公開</option><option value="private" ${playlistItem.is_public ? "" : "selected"}>非公開</option></select></label>
        <label><span>内容(トラックID改行区切り)</span><textarea data-edit="trackIds" data-playlist-id="${escapeHtml(playlistItem.id)}" rows="4">${escapeHtml(trackValue)}</textarea></label>
        <button type="button" class="secondary" data-action="savePlaylist" data-playlist-id="${escapeHtml(playlistItem.id)}">保存</button>
      </div>
    `;
  });
  adminPlaylistDialogBody.innerHTML = blocks.join("");
  adminPlaylistDialog.showModal();
};

const renderAdminUsers = (users) => {
  if (!adminUserList) return;
  adminUserList.innerHTML = "";
  users.forEach((userItem) => {
    const row = document.createElement("div");
    row.className = "card";
    row.style.marginBottom = "0.75rem";
    const playlistCount = (userItem.playlists || []).length;
    row.innerHTML = `<div style="display:flex;align-items:center;justify-content:space-between;gap:0.75rem;"><div style="display:flex;align-items:center;gap:0.5rem;"><img src="${escapeHtml(userItem.icon_url || "/static/images/icon.png")}" alt="" style="width:36px;height:36px;border-radius:999px;object-fit:cover;border:1px solid var(--border-color);" /><div><strong>${escapeHtml(userItem.display_name || userItem.username)}</strong><div style="font-size:0.8rem;color:var(--text-secondary);">@${escapeHtml(userItem.username)} / ${escapeHtml(userItem.role)} / playlists: ${playlistCount}</div></div></div></div>`;
    const actionWrap = document.createElement("div");
    actionWrap.style.display = "flex";
    actionWrap.style.gap = "0.5rem";
    actionWrap.style.flexWrap = "wrap";
    const playlistBtn = document.createElement("button");
    playlistBtn.className = "secondary";
    playlistBtn.textContent = "プレイリスト管理";
    playlistBtn.addEventListener("click", () => showAdminPlaylistDialog(userItem));
    const editBtn = document.createElement("button");
    editBtn.className = "secondary";
    editBtn.textContent = "表示名編集";
    editBtn.addEventListener("click", async () => {
      const nextDisplayName = window.prompt("表示名", userItem.display_name || "") ?? userItem.display_name;
      await requestJson(`/api/admin/users/${userItem.id}`, { display_name: nextDisplayName }, "PUT");
      await refreshAdminData();
    });
    const iconInput = document.createElement("input");
    iconInput.type = "file";
    iconInput.accept = "image/*";
    const iconUploadBtn = document.createElement("button");
    iconUploadBtn.className = "secondary";
    iconUploadBtn.textContent = "アイコン再アップロード";
    iconUploadBtn.addEventListener("click", async () => {
      const file = iconInput.files?.[0];
      if (!file) {
        window.alert("先に画像ファイルを選択してください。");
        return;
      }
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch(`/api/admin/users/${userItem.id}/icon`, { method: "POST", body: formData });
      if (!response.ok) {
        throw new Error("アイコン更新に失敗しました。");
      }
      await refreshAdminData();
      await fetchAuthMe();
    });
    const disableBtn = document.createElement("button");
    disableBtn.className = "secondary";
    disableBtn.textContent = userItem.is_active ? "無効化" : "有効化";
    disableBtn.addEventListener("click", async () => {
      await requestJson(`/api/admin/users/${userItem.id}`, { is_active: !Boolean(userItem.is_active) }, "PUT");
      await refreshAdminData();
    });
    const delBtn = document.createElement("button");
    delBtn.className = "danger";
    delBtn.textContent = "削除";
    delBtn.addEventListener("click", async () => {
      await requestJson(`/api/admin/users/${userItem.id}`, null, "DELETE");
      await refreshAdminData();
    });
    actionWrap.appendChild(playlistBtn);
    actionWrap.appendChild(editBtn);
    actionWrap.appendChild(iconInput);
    actionWrap.appendChild(iconUploadBtn);
    actionWrap.appendChild(disableBtn);
    actionWrap.appendChild(delBtn);
    row.appendChild(actionWrap);
    adminUserList.appendChild(row);
  });
};

const renderAdminApiKeys = (keys) => {
  if (!adminApiKeyList) return;
  adminApiKeyList.innerHTML = "";
  keys.forEach((keyItem) => {
    const row = document.createElement("div");
    row.style.marginBottom = "0.75rem";
    row.innerHTML = `<div><strong>${keyItem.name}</strong> (${keyItem.origin || "*"})</div>`;
    const toggle = document.createElement("button");
    toggle.className = "secondary";
    toggle.textContent = keyItem.is_active ? "無効化" : "有効化";
    toggle.addEventListener("click", async () => {
      await requestJson(`/api/admin/api-keys/${keyItem.id}`, { is_active: !Boolean(keyItem.is_active) }, "PUT");
      await refreshAdminData();
    });
    row.appendChild(toggle);
    adminApiKeyList.appendChild(row);
  });
};

const refreshAdminData = async () => {
  if (state.role !== "admin") return;
  const [users, keys] = await Promise.all([fetchJson("/api/admin/users"), fetchJson("/api/admin/api-keys")]);
  renderAdminUsers(users);
  renderAdminApiKeys(keys);
};

const bindAuthAdminEvents = () => {
  authLoginButton?.addEventListener("click", () => {
    if (!state.authUser) {
      if (authLoginError) {
        authLoginError.textContent = "";
      }
      authLoginDialog?.showModal();
      return;
    }
    if (authMenuPanel?.classList.contains("is-open")) {
      closeAuthMenu();
      return;
    }
    openAuthMenu();
  });
  authSettingsButton?.addEventListener("click", () => {
    closeAuthMenu();
    activateTab("settings");
    closeMobileSidebar();
  });
  authLogoutButton?.addEventListener("click", async () => {
    closeAuthMenu();
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/";
  });
  document.addEventListener("click", (event) => {
    if (!authMenuPanel?.classList.contains("is-open")) {
      return;
    }
    if (!(event.target instanceof Node)) {
      return;
    }
    if (authMenu?.contains(event.target)) {
      return;
    }
    closeAuthMenu();
  });
  authLoginCancel?.addEventListener("click", () => {
    if (authLoginError) {
      authLoginError.textContent = "";
    }
    authLoginDialog?.close();
  });
  adminPlaylistDialogClose?.addEventListener("click", () => adminPlaylistDialog?.close());
  playlistSelectDropdown?.addEventListener("change", () => {
    const selectedId = playlistSelectDropdown.value;
    if (selectedId === "favorites") {
      setSelectedPlaylist("favorites", "favorites");
      return;
    }
    setSelectedPlaylist("playlist", selectedId);
  });
  adminPlaylistDialogBody?.addEventListener("click", async (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement) || target.dataset.action !== "savePlaylist") {
      return;
    }
    const playlistId = target.dataset.playlistId;
    if (!playlistId) {
      return;
    }
    const nameInput = adminPlaylistDialogBody.querySelector(`[data-edit="name"][data-playlist-id="${playlistId}"]`);
    const visibilityInput = adminPlaylistDialogBody.querySelector(`[data-edit="isPublic"][data-playlist-id="${playlistId}"]`);
    const trackIdsInput = adminPlaylistDialogBody.querySelector(`[data-edit="trackIds"][data-playlist-id="${playlistId}"]`);
    if (!nameInput || !visibilityInput || !trackIdsInput) {
      return;
    }
    const trackIds = trackIdsInput.value.split("\n").map((item) => item.trim()).filter(Boolean);
    await requestJson(`/api/playlists/${playlistId}`, {
      name: nameInput.value.trim(),
      is_public: visibilityInput.value === "public",
      track_ids: trackIds,
    }, "PUT");
    await refreshAdminData();
    await refreshLibrary();
  });
  authLoginForm?.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (authLoginError) {
      authLoginError.textContent = "";
    }
    try {
      await requestJson("/api/auth/login", { username: authUsername.value.trim(), password: authPassword.value }, "POST");
      authLoginDialog?.close();
      authPassword.value = "";
      await fetchAuthMe();
      await refreshAdminData();
    } catch (error) {
      if (authLoginError) {
        authLoginError.textContent = error.message || "ログインに失敗しました。";
      }
    }
  });
  adminUserCreate?.addEventListener("click", async () => {
    const createdUser = await requestJson("/api/admin/users", { username: adminUserName.value.trim(), password: adminUserPassword.value, role: adminUserRole.value, display_name: adminUserDisplayName?.value?.trim() || null }, "POST");
    const iconFile = adminUserIconFile?.files?.[0];
    if (iconFile) {
      const formData = new FormData();
      formData.append("file", iconFile);
      await fetch(`/api/admin/users/${createdUser.id}/icon`, { method: "POST", body: formData });
    }
    adminUserPassword.value = "";
    if (adminUserDisplayName) adminUserDisplayName.value = "";
    if (adminUserIconFile) adminUserIconFile.value = "";
    await refreshAdminData();
  });
  adminApiKeyCreate?.addEventListener("click", async () => {
    const created = await requestJson("/api/admin/api-keys", { name: adminApiKeyName.value.trim(), origin: adminApiKeyOrigin.value.trim() || null }, "POST");
    if (adminApiKeyPlain) adminApiKeyPlain.textContent = `発行キー: ${created.key}`;
    await refreshAdminData();
  });
};

const init = async () => {
  try {
    const auth = await fetchJson("/api/auth/me");
    state.authUser = auth.user;
    state.role = auth.role;
    const [tracks, playlists, favoritesData, status, settings] =
      await Promise.all([
        fetchJson("/api/library"),
        fetchJson("/api/playlists"),
        fetchJson("/api/favorites"),
        fetchJson("/api/status"),
        fetchJson("/api/settings"),
      ]);

    state.tracks = tracks;
    state.playlists = playlists;
    state.favorites = favoritesData;
    applyAuthUi();
    ensureSelectedPlaylist();

    renderMedia();
    updateMediaViewToggle();
    renderPlaylists();
    renderFavorites();
    renderPlaylistDetail();
    renderTagOptions();
    renderPlaylistSelectOptions();
    updatePlayerUI();
    updateFavoriteButtons();
    renderPlaylistModalList();
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
    try {
      const system = await fetchJson("/api/system");
      renderSystem(system);
    } catch (_error) {
      renderSystem(null);
    }
    await refreshAdminData();

    const query = new URLSearchParams(window.location.search);
    const sharedTrackId = query.get("id");
    if (sharedTrackId) {
      const sharedTrackIndex = state.tracks.findIndex((track) => String(track.id) === String(sharedTrackId));
      if (sharedTrackIndex >= 0) {
        setTrackByIndex(sharedTrackIndex, false);
        openPlayerOverlay();
      }
    }
    
    const savedLoopMode = localStorage.getItem("loopMode");
    if (savedLoopMode && ["off", "playlist", "track"].includes(savedLoopMode)) {
      playerState.loopMode = savedLoopMode;
      updateLoopButtons();
    }
    
    const savedShuffleMode = localStorage.getItem("shuffleMode");
    if (savedShuffleMode === "true") {
      playerState.shuffleMode = true;
      if (state.tracks.length > 0) {
        playerState.shuffleIndices = generateShuffleIndices();
      }
      updateShuffleButtons();
    }
    
    const savedVolume = localStorage.getItem("playerVolume");
    if (savedVolume !== null && audioPlayer) {
      const vol = parseFloat(savedVolume);
      if (vol >= 0 && vol <= 100) {
        audioPlayer.volume = vol / 100;
        syncVolumeSliders(vol);
      }
    } else if (audioPlayer) {
      // デフォルト 100% のまま → スライダーの --seek-pct を初期化
      syncVolumeSliders(audioPlayer.volume * 100);
    }

    const savedTrackIndex = localStorage.getItem("currentTrackIndex");
    const savedTrackTime = localStorage.getItem("currentTrackTime");
    if (savedTrackIndex !== null && state.tracks.length > 0) {
      const trackIndex = parseInt(savedTrackIndex, 10);
      if (trackIndex >= 0 && trackIndex < state.tracks.length) {
        setTrackByIndex(trackIndex, false);
        if (savedTrackTime !== null && audioPlayer) {
          const seekTime = parseFloat(savedTrackTime);
          audioPlayer.addEventListener("loadedmetadata", () => {
            if (audioPlayer.duration >= seekTime) {
              audioPlayer.currentTime = seekTime;
            }
          }, { once: true });
        }
      }
    }
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

if (playlistConcurrencyInput) {
  // 初期値をlocalStorageから読み込み
  const savedConcurrency = localStorage.getItem("playlistConcurrency");
  if (savedConcurrency) {
    playlistConcurrencyInput.value = savedConcurrency;
  }
  
  // 変更時にlocalStorageに保存
  playlistConcurrencyInput.addEventListener("change", () => {
    const value = parseInt(playlistConcurrencyInput.value, 10);
    if (value >= 1 && value <= 20) {
      localStorage.setItem("playlistConcurrency", value.toString());
    }
  });
}

if (settingsBaseUrlSave) {
  settingsBaseUrlSave.addEventListener("click", async () => {
    const baseUrl = settingsBaseUrlInput?.value?.trim() || "";
    try {
      await requestJson("/api/settings/base-url", { base_url: baseUrl }, "PUT");
      appendImportLog("ベースURLを保存しました。", { append: true });
    } catch (error) {
      appendImportLog(`ベースURLの保存に失敗しました: ${error.message}`, { append: true });
    }
  });
}

if (playlistCreateToggle) {
  playlistCreateToggle.addEventListener("click", () => {
    openPlaylistEditModal("create");
  });
}

const applyPlaylistAlbumBtn = document.getElementById("apply-playlist-album-names");
const applyPlaylistAlbumResult = document.getElementById("apply-playlist-album-result");
if (applyPlaylistAlbumBtn) {
  applyPlaylistAlbumBtn.addEventListener("click", async () => {
    applyPlaylistAlbumBtn.disabled = true;
    applyPlaylistAlbumBtn.textContent = "適用中…";
    if (applyPlaylistAlbumResult) applyPlaylistAlbumResult.textContent = "";
    try {
      const res = await fetch("/api/library/apply-playlist-album-names", { method: "POST" });
      if (!res.ok) throw new Error(await res.text());
      const { updated, skipped } = await res.json();
      if (applyPlaylistAlbumResult) {
        applyPlaylistAlbumResult.textContent = `完了: ${updated}件を更新、${skipped}件はスキップ`;
      }
      if (updated > 0) {
        const data = await fetchJson("/api/library");
        state.tracks = data;
        renderMedia();
      }
    } catch (e) {
      if (applyPlaylistAlbumResult) applyPlaylistAlbumResult.textContent = `エラー: ${e.message}`;
    } finally {
      applyPlaylistAlbumBtn.disabled = false;
      applyPlaylistAlbumBtn.textContent = "プレイリスト名をAlbumに適用";
    }
  });
}

if (playlistCreateToggle && playlistCreateForm) {
  playlistCreateToggle.addEventListener("click", () => {
    if (!hasLogin()) {
      appendImportLog("プレイリストを作成するにはログインが必要です。", { append: true });
      return;
    }
    const isOpen = playlistCreateForm.classList.toggle("is-open");
    playlistCreateForm.setAttribute("aria-hidden", isOpen ? "false" : "true");
  });
}

if (playlistEditModalClose) {
  playlistEditModalClose.addEventListener("click", closePlaylistEditModal);
}

if (playlistModalCancel) {
  playlistModalCancel.addEventListener("click", closePlaylistEditModal);
}

if (playlistEditModal) {
  playlistEditModal.addEventListener("click", (event) => {
    if (event.target === playlistEditModal) closePlaylistEditModal();
  });
}

if (playlistModalSyncBtn) {
  playlistModalSyncBtn.addEventListener("click", async () => {
    if (!_playlistEditTarget) return;
    if (playlistModalSyncStatus) {
      playlistModalSyncStatus.textContent = "同期中...";
      playlistModalSyncStatus.hidden = false;
    }
    try {
      await syncPlaylistNow(_playlistEditTarget.id);
      await refreshLibrary();
      closePlaylistEditModal();
    } catch (error) {
      if (playlistModalSyncStatus) {
        playlistModalSyncStatus.textContent = `同期に失敗しました: ${error.message}`;
      }
    }
  });
}

if (playlistEditForm) {
  playlistEditForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const name = playlistModalName?.value.trim();
    if (!name) return;
    const autoSyncUrl = playlistModalUrl?.value.trim() || null;
    const intervalValue = playlistModalInterval?.value.trim();
    const parsedInterval = intervalValue ? Number(intervalValue) : null;
    const autoSyncEnabled = Boolean(playlistModalAutosync?.checked) && Boolean(autoSyncUrl);
    const payload = {
      name,
      auto_sync_url: autoSyncUrl || null,
      auto_sync_interval_minutes: Number.isFinite(parsedInterval) ? parsedInterval : null,
      auto_sync_enabled: autoSyncEnabled,
    };
    try {
      if (_playlistEditTarget) {
        const updated = await updatePlaylistSettings(_playlistEditTarget.id, payload);
        const targetIndex = state.playlists.findIndex((p) => p.id === updated.id);
        if (targetIndex >= 0) state.playlists[targetIndex] = updated;
        renderPlaylistDetail();
      } else {
        const playlist = await requestJson("/api/playlists", { ...payload, track_ids: [] }, "POST");
        state.playlists.push(playlist);
        setSelectedPlaylist("playlist", playlist.id);
        renderPlaylistSelectOptions();
        renderPlaylistModalList();
      }
      closePlaylistEditModal();
      renderPlaylists();
    } catch (error) {
      console.error(error);
    }
  });
}

// Close playlist sidebar dropdowns when clicking elsewhere
document.addEventListener("click", () => {
  document.querySelectorAll(".playlist-item-dropdown:not([hidden])").forEach((d) => {
    d.hidden = true;
  });
});

if (mediaSearchInput) {
  mediaSearchInput.addEventListener("input", (event) => {
    searchState.mediaQuery = event.target.value;
    renderMedia();
  });
}

if (playlistSearchInput) {
  playlistSearchInput.addEventListener("input", (event) => {
    searchState.playlistQuery = event.target.value;
    renderPlaylists();
  });
}

if (playlistTrackSearchInput) {
  playlistTrackSearchInput.addEventListener("input", (event) => {
    searchState.playlistTrackQuery = event.target.value;
    renderPlaylistDetail();
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

if (uploadForm) {
  uploadForm.addEventListener("submit", (event) => {
    event.preventDefault();
    handleUploadSubmit();
  });
}

if (localFolderForm) {
  localFolderForm.addEventListener("submit", (event) => {
    event.preventDefault();
    handleLocalFolderSubmit();
  });
}

if (tagSave) {
  tagSave.addEventListener("click", async () => {
    if (!tagSelect) {
      return;
    }
    const track = state.tracks.find(
      (item) => String(item.id) === String(tagSelect.value)
    );
    if (!track) {
      return;
    }
    const payload = {
      title: tagTitleInput?.value?.trim() ?? "",
      artist: tagArtistInput?.value?.trim() ?? "",
      album: tagAlbumInput?.value?.trim() ?? "",
      source_url: tagSourceUrlInput?.value?.trim() ?? "",
    };
    try {
      const updated = await updateTrackMetadata(track.id, payload);
      const targetIndex = state.tracks.findIndex((item) => item.id === track.id);
      if (targetIndex >= 0) {
        state.tracks[targetIndex] = updated;
      }
      renderMedia();
      renderPlaylistDetail();
      renderTagOptions();
      updatePlayerUI();
      updateFavoriteButtons();
    } catch (error) {
      console.error(error);
    }
  });
}

if (mediaViewToggle) {
  mediaViewToggle.addEventListener("click", () => {
    mediaViewState.mode = mediaViewState.mode === "list" ? "grid" : "list";
    localStorage.setItem("mediaViewMode", mediaViewState.mode);
    updateMediaViewToggle();
    renderMedia();
  });
}

const closeFabMenu = () => {
  if (selectionMenu) selectionMenu.setAttribute("aria-hidden", "true");
};

const updateBulkBar = () => {
  const count = selectionState.selectedIds.size;
  const countText = `${count}件選択中`;
  if (bulkSelectedCount) {
    bulkSelectedCount.textContent = countText;
  }
  if (bulkAddFavorite) {
    bulkAddFavorite.style.display = canUseFavoritesActions() ? "" : "none";
  }
  if (bulkAddPlaylist) {
    bulkAddPlaylist.style.display = canUsePlaylistActions() ? "" : "none";
  }
  if (bulkDeleteBtn) {
    bulkDeleteBtn.style.display = state.role === "admin" ? "" : "none";
  }
  if (bulkActionBar) {
    const hasAnyAction = canUseFavoritesActions() || canUsePlaylistActions() || state.role === "admin";
    bulkActionBar.setAttribute(
      "aria-hidden",
      selectionState.active && hasAnyAction ? "false" : "true"
    );
  }
  // FAB（モバイル）の表示/非表示と件数更新
  if (selectionFab) {
    selectionFab.setAttribute("aria-hidden", selectionState.active ? "false" : "true");
  }
  if (fabCount) {
    fabCount.textContent = countText;
  }
};

// --- 共通バルクアクション関数 ---

const bulkActionAddFavorite = async () => {
  if (!selectionState.selectedIds.size) return;
  closeFabMenu();
  const newFavorites = [...state.favorites];
  selectionState.selectedIds.forEach((id) => {
    if (!newFavorites.includes(id)) newFavorites.push(id);
  });
  try {
    await updateFavoritesTracks(newFavorites);
    state.favorites = newFavorites;
    renderFavorites();
    updateFavoriteButtons();
    exitSelectionMode();
  } catch (error) {
    console.error(error);
  }
};

const bulkActionAddPlaylist = () => {
  if (!selectionState.selectedIds.size) return;
  closeFabMenu();
  if (playlistModal) {
    playlistModal.classList.add("is-open");
    playlistModal.setAttribute("aria-hidden", "false");
    renderPlaylistModalList();
  }
};

const bulkActionDelete = async () => {
  const ids = [...selectionState.selectedIds];
  if (!ids.length) return;
  closeFabMenu();
  const result = await showConfirmDialog({
    title: "楽曲を削除",
    message: `選択した${ids.length}件の楽曲を削除しますか？`,
    showFileOption: true,
    buttons: [
      { label: "キャンセル", className: "secondary", value: "cancel" },
      { label: "削除する", className: "danger", value: "confirm" },
    ],
  });
  if (result.action !== "confirm") return;
  try {
    for (const id of ids) {
      await deleteTrack(id, result.deleteFile);
    }
    exitSelectionMode();
    await refreshLibrary();
  } catch (error) {
    console.error(error);
    appendImportLog("削除中にエラーが発生しました。", { append: true });
  }
};

const bulkActionSelectAll = () => {
  const visibleTracks = filterTracks(state.tracks, searchState.mediaQuery);
  visibleTracks.forEach((t) => selectionState.selectedIds.add(t.id));
  closeFabMenu();
  updateBulkBar();
  renderMedia();
};

const bulkActionDeselectAll = () => {
  selectionState.selectedIds.clear();
  closeFabMenu();
  updateBulkBar();
  renderMedia();
};

// ---

const enterSelectionMode = () => {
  selectionState.active = true;
  selectionState.selectedIds.clear();
  if (mediaSelectToggle) mediaSelectToggle.classList.add("is-active");
  updateBulkBar();
  renderMedia();
};

const exitSelectionMode = () => {
  selectionState.active = false;
  selectionState.selectedIds.clear();
  closeFabMenu();
  if (mediaSelectToggle) mediaSelectToggle.classList.remove("is-active");
  if (bulkActionBar) bulkActionBar.setAttribute("aria-hidden", "true");
  if (selectionFab) selectionFab.setAttribute("aria-hidden", "true");
  renderMedia();
};

if (mediaSelectToggle) {
  mediaSelectToggle.addEventListener("click", () => {
    if (selectionState.active) {
      exitSelectionMode();
    } else {
      enterSelectionMode();
    }
  });
}

// デスクトップ用バルクバーのボタン
if (bulkSelectCancel) {
  bulkSelectCancel.addEventListener("click", () => exitSelectionMode());
}
if (bulkAddFavorite) {
  bulkAddFavorite.addEventListener("click", async () => {
    if (!selectionState.selectedIds.size || !canUseFavoritesActions()) return;
    const newFavorites = [...state.favorites];
    selectionState.selectedIds.forEach((id) => {
      if (!newFavorites.includes(id)) newFavorites.push(id);
    });
    try {
      await updateFavoritesTracks(newFavorites);
      state.favorites = newFavorites;
      renderFavorites();
      updateFavoriteButtons();
      exitSelectionMode();
    } catch (error) {
      console.error(error);
    }
  });
}
if (bulkAddPlaylist) {
  bulkAddPlaylist.addEventListener("click", () => {
    if (!selectionState.selectedIds.size || !canUsePlaylistActions()) return;
    if (playlistModal) {
      playlistModal.classList.add("is-open");
      playlistModal.setAttribute("aria-hidden", "false");
      renderPlaylistModalList();
    }
  });
}

if (bulkDeleteBtn) {
  bulkDeleteBtn.addEventListener("click", async () => {
    if (state.role !== "admin") return;
    const ids = [...selectionState.selectedIds];
    if (!ids.length) return;
    const result = await showConfirmDialog({
      title: "楽曲を削除",
      message: `選択した${ids.length}件の楽曲を削除しますか？`,
      showFileOption: true,
      buttons: [
        { label: "キャンセル", className: "secondary", value: "cancel" },
        { label: "削除する", className: "danger", value: "confirm" },
      ],
    });
    if (result.action !== "confirm") return;
    try {
      for (const id of ids) {
        await deleteTrack(id, result.deleteFile);
      }
      exitSelectionMode();
      await refreshLibrary();
    } catch (error) {
      console.error(error);
      appendImportLog("削除中にエラーが発生しました。", { append: true });
    }
  });
}

// FABメニュートグル
if (fabMenuBtn) {
  fabMenuBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    if (!selectionMenu) return;
    const isHidden = selectionMenu.getAttribute("aria-hidden") !== "false";
    selectionMenu.setAttribute("aria-hidden", isHidden ? "false" : "true");
  });
}

// FABメニュー外クリックで閉じる
document.addEventListener("click", (e) => {
  if (selectionMenu && selectionMenu.getAttribute("aria-hidden") === "false") {
    if (!selectionMenu.contains(e.target) && e.target !== fabMenuBtn) {
      closeFabMenu();
    }
  }
});

// FABメニューの各アクション
const fabAddFavorite = document.getElementById("fab-add-favorite");
const fabAddPlaylist = document.getElementById("fab-add-playlist");
const fabDelete = document.getElementById("fab-delete");
const fabSelectAll = document.getElementById("fab-select-all");
const fabDeselectAll = document.getElementById("fab-deselect-all");
const fabCancel = document.getElementById("fab-cancel");

if (fabAddFavorite) fabAddFavorite.addEventListener("click", bulkActionAddFavorite);
if (fabAddPlaylist) fabAddPlaylist.addEventListener("click", bulkActionAddPlaylist);
if (fabDelete) fabDelete.addEventListener("click", bulkActionDelete);
if (fabSelectAll) fabSelectAll.addEventListener("click", bulkActionSelectAll);
if (fabDeselectAll) fabDeselectAll.addEventListener("click", bulkActionDeselectAll);
if (fabCancel) fabCancel.addEventListener("click", () => { closeFabMenu(); exitSelectionMode(); });

// 管理モードトグル
if (playlistManageToggle) {
  playlistManageToggle.addEventListener("click", () => {
    playlistManageState.active = !playlistManageState.active;
    renderPlaylistDetail();
  });
}

if (audioPlayer) {
  audioPlayer.addEventListener("play", () => {
    playerState.isPlaying = true;
    updatePlayerButtons();
    updateMediaSessionPlaybackState();
    syncMobilePlayerButtons();
    syncVideoStateWithAudioPlayback();
  });

  audioPlayer.addEventListener("pause", () => {
    playerState.isPlaying = false;
    updatePlayerButtons();
    updateMediaSessionPlaybackState();
    syncMobilePlayerButtons();
    syncVideoStateWithAudioPlayback();
  });

  audioPlayer.addEventListener("timeupdate", () => {
    const { currentTime, duration } = audioPlayer;
    const percent = duration ? Math.floor((currentTime / duration) * 100) : 0;
    const pctStr = percent + "%";
    if (playerSeek) {
      playerSeek.value = percent;
      playerSeek.style.setProperty("--seek-pct", pctStr);
    }
    if (miniSeek) {
      miniSeek.value = percent;
      miniSeek.style.setProperty("--seek-pct", pctStr);
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
    if (playerVideo?.classList.contains("is-visible") && playerVideoSyncPending) {
      syncVideoStateWithAudioPlayback();
    }
    updateMediaSessionPosition();
    
    if (playerState.currentIndex >= 0 && currentTime > 0) {
      localStorage.setItem("currentTrackIndex", playerState.currentIndex);
      localStorage.setItem("currentTrackTime", currentTime);
    }
  });

  audioPlayer.addEventListener("ended", () => {
    if (playerState.loopMode === "track") {
      audioPlayer.currentTime = 0;
      audioPlayer.play().catch((err) => {
        console.warn("[squashterm] ended/loop-track: play() failed:", err);
        updateMediaSessionPlaybackState();
      });
      return;
    }
    if (playerState.shuffleMode) {
      playNext();
      return;
    }
    if (playerState.loopMode === "playlist") {
      playNext();
      return;
    }
    if (isPlayerOverlayActive()) {
      closePlayerOverlay();
    }
    stopPlayback();
  });
}

if (playerSeek && audioPlayer) {
  playerSeek.addEventListener("input", (event) => {
    const value = Number(event.target.value);
    if (Number.isFinite(value) && audioPlayer.duration) {
      audioPlayer.currentTime = (value / 100) * audioPlayer.duration;
      playerVideoSyncPending = true;
      updateMediaSessionPosition();
    }
  });
  playerSeek.addEventListener("change", () => {
    playerVideoSeekInProgress = false;
    syncPlayerVideoWithAudio({ force: true });
    syncVideoStateWithAudioPlayback();
  });
}

if (miniSeek && audioPlayer) {
  miniSeek.addEventListener("input", (event) => {
    const value = Number(event.target.value);
    if (Number.isFinite(value) && audioPlayer.duration) {
      audioPlayer.currentTime = Math.round((value / 100) * audioPlayer.duration);
      playerVideoSyncPending = true;
      updateMediaSessionPosition();
    }
  });
  miniSeek.addEventListener("change", () => {
    playerVideoSeekInProgress = false;
    syncPlayerVideoWithAudio({ force: true });
    syncVideoStateWithAudioPlayback();
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

if (playerSkipBack) {
  playerSkipBack.addEventListener("click", () => {
    seekBySeconds(-10);
  });
}

if (playerNext) {
  playerNext.addEventListener("click", () => {
    playNext();
  });
}

if (playerSkipForward) {
  playerSkipForward.addEventListener("click", () => {
    seekBySeconds(10);
  });
}

if (playerStop) {
  playerStop.addEventListener("click", () => {
    stopPlayback();
  });
}

if (playerLoop) {
  playerLoop.addEventListener("click", () => {
    toggleLoopMode();
  });
}

if (playerShuffle) {
  playerShuffle.addEventListener("click", () => {
    toggleShuffleMode();
  });
}

if (playerFavorite) {
  playerFavorite.addEventListener("click", () => {
    if (!canUseFavoritesActions()) {
      return;
    }
    toggleFavorite();
  });
}

if (miniFavorite) {
  miniFavorite.addEventListener("click", () => {
    if (!canUseFavoritesActions()) {
      return;
    }
    toggleFavorite();
  });
}

if (miniPrev) {
  miniPrev.addEventListener("click", () => {
    playPrev();
  });
}

if (miniSkipBack) {
  miniSkipBack.addEventListener("click", () => {
    seekBySeconds(-10);
  });
}

if (miniNext) {
  miniNext.addEventListener("click", () => {
    playNext();
  });
}

if (miniSkipForward) {
  miniSkipForward.addEventListener("click", () => {
    seekBySeconds(10);
  });
}

if (miniStop) {
  miniStop.addEventListener("click", () => {
    stopPlayback();
  });
}

if (miniLoop) {
  miniLoop.addEventListener("click", () => {
    toggleLoopMode();
  });
}

if (miniShuffle) {
  miniShuffle.addEventListener("click", () => {
    toggleShuffleMode();
  });
}

if (miniExpand) {
  miniExpand.addEventListener("click", () => {
    openPlayerOverlay();
  });
}

// Nav player button: opens fullscreen player (mobile)
if (navPlayerButton) {
  navPlayerButton.addEventListener("click", () => {
    if (isMobileDevice()) {
      openMobilePlayer();
    } else {
      openPlayerOverlay();
    }
  });
}

// モバイル判定関数
function isMobileDevice() {
  return window.innerWidth <= 768;
}

// モバイルプレイヤー要素
const mobilePlayerOverlay = document.getElementById("mobile-player-overlay");
const mobilePlayerBg = document.getElementById("mobile-player-bg");
const mobilePlayerClose = document.getElementById("mobile-player-close");
const mobilePlayerCover = document.getElementById("mobile-player-cover");
const mobilePlayerTitle = document.getElementById("mobile-player-title");
const mobilePlayerArtist = document.getElementById("mobile-player-artist");
const mobilePlayerAlbum = document.getElementById("mobile-player-album");
const mobilePlayerFormat = document.getElementById("mobile-player-format");
const mobilePlayerProgressSlider = document.getElementById("mobile-player-progress-slider");
const mobilePlayerCurrentTime = document.getElementById("mobile-player-current-time");
const mobilePlayerDuration = document.getElementById("mobile-player-duration");
const mobilePlayerVolumeToggle = document.getElementById("mobile-player-volume-toggle");
const mobilePlayerVolumeSlider = document.getElementById("mobile-player-volume-slider");
const mobilePlayerToggle = document.getElementById("mobile-player-toggle");
const mobilePlayerPrev = document.getElementById("mobile-player-prev");
const mobilePlayerNext = document.getElementById("mobile-player-next");
const mobilePlayerShuffle      = document.getElementById("mobile-player-shuffle");
const mobilePlayerLoop         = document.getElementById("mobile-player-loop");
const mobilePlayerMenuToggle   = document.getElementById("mobile-player-menu-toggle");
const mobilePlayerFavorite = document.getElementById("mobile-player-favorite");

// 現在のタブを保存する変数（ファイル冒頭で宣言済み）

// モバイルプレイヤーを開く
function openMobilePlayer() {
  if (mobilePlayerOverlay) {
    // 現在アクティブなタブを保存（data-tab属性があるもののみ）
    previousActiveTab = null; // リセット
    tabs.forEach((tab) => {
      if (tab.classList.contains("is-active") && tab.dataset && tab.dataset.tab) {
        previousActiveTab = tab.dataset.tab;
      }
    });
    
    // デフォルトがない場合はmediaをデフォルトに
    if (!previousActiveTab) {
      previousActiveTab = "media";
    }
    
    mobilePlayerOverlay.setAttribute("aria-hidden", "false");
    updateMobilePlayerUI();
  }
}

// モバイルプレイヤーを閉じる
function closeMobilePlayer() {
  if (mobilePlayerOverlay) {
    mobilePlayerOverlay.setAttribute("aria-hidden", "true");
    closeMobilePlayerMenu();
    closeUpNextPanel(); // モバイルプレイヤー閉時にUp Nextも閉じる
    
    // 以前のタブに戻す
    if (previousActiveTab) {
      tabs.forEach((button) => button.classList.remove("is-active"));
      panels.forEach((panel) => panel.classList.remove("is-active"));
      
      const targetTab = document.querySelector(`.nav-button[data-tab="${previousActiveTab}"]`);
      const targetPanel = document.getElementById(`panel-${previousActiveTab}`);
      
      if (targetTab) {
        targetTab.classList.add("is-active");
      }
      if (targetPanel) {
        targetPanel.classList.add("is-active");
      }
      
      previousActiveTab = null;
    }
  }
}

// モバイルプレイヤーUIを更新
function updateMobilePlayerUI() {
  // デスクトップ版のプレイヤーから情報を同期
  if (playerCover && playerCover.src) {
    mobilePlayerCover.src = playerCover.src;
    if (mobilePlayerBg) {
      mobilePlayerBg.style.backgroundImage = `url('${playerCover.src.replace(/'/g, "\\'")}')`;
    }
  }

  // テキストをspan.scroll-textでラップしてセット（XSS対策でtextContent使用）
  const setScrollText = (container, text) => {
    if (!container || !text) return;
    container.innerHTML = "";
    const span = document.createElement("span");
    span.className = "scroll-text";
    span.textContent = text;
    container.appendChild(span);
  };
  setScrollText(mobilePlayerTitle, playerTitle?.textContent);
  setScrollText(mobilePlayerArtist, playerArtist?.textContent);
  setScrollText(mobilePlayerAlbum, playerAlbum?.textContent);

  if (mobilePlayerFormat && playerFormat && playerFormat.textContent) {
    mobilePlayerFormat.textContent = playerFormat.textContent;
  }

  // はみ出しているspan.scroll-textにシームレスマーキーを適用
  const MOBILE_GAP_PX = 64;
  const MOBILE_SPEED_PX_S = 50; // media-cardより少し遅め
  requestAnimationFrame(() => {
    [mobilePlayerTitle, mobilePlayerArtist, mobilePlayerAlbum].forEach((el) => {
      if (!el) return;
      const span = el.querySelector(".scroll-text");
      if (!span) return;
      span.classList.remove("is-overflowing");
      span.style.removeProperty("--overflow-width");
      span.style.removeProperty("--scroll-duration");
      el.style.removeProperty("text-align");

      const singleWidth = span.scrollWidth;
      if (singleWidth <= el.clientWidth) return;

      // シームレスループ構造: テキスト [空白] テキスト
      const originalText = span.textContent;
      span.textContent = "";
      span.appendChild(document.createTextNode(originalText));
      const gap = document.createElement("span");
      gap.style.cssText = `display:inline-block;width:${MOBILE_GAP_PX}px`;
      span.appendChild(gap);
      span.appendChild(document.createTextNode(originalText));

      const totalDist = singleWidth + MOBILE_GAP_PX;
      el.style.textAlign = "left";
      span.style.setProperty("--overflow-width", `-${totalDist}px`);
      span.style.setProperty("--scroll-duration", `${(totalDist / MOBILE_SPEED_PX_S).toFixed(1)}s`);
      span.classList.add("is-overflowing");
    });
  });
  
  // プログレスバーと時間を同期
  if (audioPlayer) {
    const progress = (audioPlayer.currentTime / audioPlayer.duration) * 100 || 0;
    mobilePlayerProgressSlider.value = progress;
    mobilePlayerProgressSlider.style.setProperty("--seek-pct", progress.toFixed(1) + "%");
    mobilePlayerCurrentTime.textContent = formatTime(audioPlayer.currentTime);
    mobilePlayerDuration.textContent = formatTime(audioPlayer.duration);
  }
  
  // 音量スライダーを同期
  if (mobilePlayerVolumeSlider) {
    const v = audioPlayer.volume * 100;
    mobilePlayerVolumeSlider.value = v;
    mobilePlayerVolumeSlider.style.setProperty("--seek-pct", v.toFixed(1) + "%");
  }
  
  // ボタン状態を同期
  syncMobilePlayerButtons();
}

// モバイルプレイヤーボタン状態を同期
function syncMobilePlayerButtons() {
  // 再生/一時停止ボタン
  if (mobilePlayerToggle) {
    if (audioPlayer.paused) {
      mobilePlayerToggle.classList.remove("is-playing");
      mobilePlayerToggle.setAttribute("aria-label", "再生");
    } else {
      mobilePlayerToggle.classList.add("is-playing");
      mobilePlayerToggle.setAttribute("aria-label", "一時停止");
    }
  }
  
  // シャッフルボタン
  if (mobilePlayerShuffle && playerShuffle) {
    const isShuffleOn = playerShuffle.getAttribute("aria-pressed") === "true";
    mobilePlayerShuffle.setAttribute("aria-pressed", isShuffleOn ? "true" : "false");
    if (isShuffleOn) {
      mobilePlayerShuffle.classList.add("is-active");
    } else {
      mobilePlayerShuffle.classList.remove("is-active");
    }
  }
  
  // ループボタン
  if (mobilePlayerLoop && playerLoop) {
    const loopMode = playerLoop.getAttribute("aria-label");
    mobilePlayerLoop.setAttribute("aria-label", loopMode);
    const loopLabel = mobilePlayerLoop.querySelector(".loop-label");
    if (loopLabel) {
      loopLabel.textContent = loopMode.includes("オフ") ? "OFF" : loopMode.includes("1曲") ? "1" : "ALL";
    }
    // ループがオフの場合は色なし、PL/1の場合は色あり
    if (loopMode.includes("オフ")) {
      mobilePlayerLoop.classList.remove("is-active");
    } else {
      mobilePlayerLoop.classList.add("is-active");
    }
  }
  
  // お気に入りボタン
  if (mobilePlayerFavorite && playerFavorite) {
    const isFavorite = playerFavorite.getAttribute("aria-pressed") === "true";
    mobilePlayerFavorite.setAttribute("aria-pressed", isFavorite ? "true" : "false");
    if (isFavorite) {
      mobilePlayerFavorite.classList.add("is-active");
    } else {
      mobilePlayerFavorite.classList.remove("is-active");
    }
  }
}

// モバイルプレイヤーイベントハンドラー
if (mobilePlayerClose) {
  mobilePlayerClose.addEventListener("click", closeMobilePlayer);
}

if (mobilePlayerProgressSlider) {
  const updateProgress = (e) => {
    if (audioPlayer && audioPlayer.duration) {
      const time = (e.target.value / 100) * audioPlayer.duration;
      audioPlayer.currentTime = time;
    }
  };
  mobilePlayerProgressSlider.addEventListener("input", updateProgress);
  mobilePlayerProgressSlider.addEventListener("change", updateProgress);
}

// iOSではJSから音量変更不可のため、スライダーを注意書きに差し替え
const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) ||
  (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

if (mobilePlayerVolumeSlider) {
  if (isIOS) {
    const note = document.createElement("span");
    note.className = "mobile-player-volume-ios-note";
    note.textContent = "音量はデバイスのボタンで調整してください";
    mobilePlayerVolumeSlider.replaceWith(note);
  } else {
    const updateVolume = (e) => {
      if (audioPlayer) {
        audioPlayer.volume = e.target.value / 100;
        syncVolumeSliders(e.target.value);
        localStorage.setItem("playerVolume", e.target.value);
      }
    };
    mobilePlayerVolumeSlider.addEventListener("input", updateVolume);
    mobilePlayerVolumeSlider.addEventListener("change", updateVolume);
  }
}

// ---- 音量スライダー同期ユーティリティ ----
function syncVolumeSliders(val) {
  const pct = parseFloat(val).toFixed(1) + "%";
  [playerVolumeSlider, spVolumeSlider, mobilePlayerVolumeSlider].forEach((el) => {
    if (!el) return;
    if (el.value !== String(val)) el.value = val;
    el.style.setProperty("--seek-pct", pct);
  });
}

// sp-volume-slider / player-volume-slider のイベント登録
[spVolumeSlider, playerVolumeSlider].forEach((slider) => {
  if (!slider) return;
  slider.addEventListener("input", (e) => {
    if (audioPlayer) {
      audioPlayer.volume = e.target.value / 100;
      syncVolumeSliders(e.target.value);
      localStorage.setItem("playerVolume", e.target.value);
    }
  });
});

// ---- ミュート共通処理 ----
const syncMuteButtons = () => {
  if (!audioPlayer) return;
  const muted = audioPlayer.muted;
  [playerVolumeToggle, mobilePlayerVolumeToggle, spVolumeToggle].forEach((btn) => {
    if (!btn) return;
    btn.classList.toggle("is-muted", muted);
    btn.setAttribute("aria-label", muted ? "ミュート解除" : "ミュート切り替え");
    btn.setAttribute("aria-pressed", muted ? "true" : "false");
  });
};

const toggleMute = () => {
  if (!audioPlayer) return;
  audioPlayer.muted = !audioPlayer.muted;
  syncMuteButtons();
};

[playerVolumeToggle, spVolumeToggle].forEach((btn) => {
  if (btn) btn.addEventListener("click", toggleMute);
});

if (mobilePlayerVolumeToggle) {
  if (isIOS) {
    mobilePlayerVolumeToggle.style.display = "none";
  } else {
    mobilePlayerVolumeToggle.addEventListener("click", toggleMute);
  }
}

if (mobilePlayerToggle) {
  mobilePlayerToggle.addEventListener("click", () => {
    if (playerToggle) {
      playerToggle.click();
    }
  });
}

if (mobilePlayerPrev) {
  mobilePlayerPrev.addEventListener("click", () => {
    if (playerPrev) {
      playerPrev.click();
    }
  });
}

if (mobilePlayerNext) {
  mobilePlayerNext.addEventListener("click", () => {
    if (playerNext) {
      playerNext.click();
    }
  });
}

if (mobilePlayerShuffle) {
  mobilePlayerShuffle.addEventListener("click", () => {
    if (playerShuffle) {
      playerShuffle.click();
      setTimeout(syncMobilePlayerButtons, 50);
    }
  });
}

if (mobilePlayerLoop) {
  mobilePlayerLoop.addEventListener("click", () => {
    if (playerLoop) {
      playerLoop.click();
      setTimeout(syncMobilePlayerButtons, 50);
    }
  });
}

const mobilePlayerMenuPanel = document.getElementById("mobile-player-menu-panel");

const openMobilePlayerMenu = () => {
  if (!mobilePlayerMenuPanel) return;
  mobilePlayerMenuPanel.classList.add("is-open");
  mobilePlayerMenuPanel.setAttribute("aria-hidden", "false");
};

const closeMobilePlayerMenu = () => {
  if (!mobilePlayerMenuPanel) return;
  mobilePlayerMenuPanel.classList.remove("is-open");
  mobilePlayerMenuPanel.setAttribute("aria-hidden", "true");
};

const toggleMobilePlayerMenu = () => {
  if (!mobilePlayerMenuPanel) return;
  if (mobilePlayerMenuPanel.classList.contains("is-open")) {
    closeMobilePlayerMenu();
  } else {
    openMobilePlayerMenu();
  }
};

if (mobilePlayerMenuToggle) {
  mobilePlayerMenuToggle.addEventListener("click", (e) => {
    e.stopPropagation();
    togglePlayerMenu();
  });
}

if (mobilePlayerMenuPanel) {
  // 各ボタンをデスクトップ側のボタンに委譲
  const mobilePlayerPlayNext = document.getElementById("mobile-player-play-next");
  const mobilePlayerDownload = document.getElementById("mobile-player-download");
  const mobilePlayerAddPlaylist = document.getElementById("mobile-player-add-playlist");
  const mobilePlayerOpenSource = document.getElementById("mobile-player-open-source");
  const mobilePlayerShareTrack = document.getElementById("mobile-player-share-track");
  const mobilePlayerEditInfo = document.getElementById("mobile-player-edit-info");
  const mobilePlayerDeleteTrack = document.getElementById("mobile-player-delete-track");

  if (mobilePlayerPlayNext) mobilePlayerPlayNext.addEventListener("click", () => {
    closeMobilePlayerMenu();
    const current = state.tracks[playerState.currentIndex];
    if (current) addToPlayNext(current.id);
  });
  if (mobilePlayerDownload) mobilePlayerDownload.addEventListener("click", () => {
    closeMobilePlayerMenu();
    document.getElementById("player-download")?.click();
  });
  if (mobilePlayerAddPlaylist) mobilePlayerAddPlaylist.addEventListener("click", () => {
    closeMobilePlayerMenu();
    document.getElementById("player-add-playlist")?.click();
  });
  if (mobilePlayerOpenSource) mobilePlayerOpenSource.addEventListener("click", () => {
    closeMobilePlayerMenu();
    document.getElementById("player-open-source")?.click();
  });
  if (mobilePlayerShareTrack) mobilePlayerShareTrack.addEventListener("click", () => {
    closeMobilePlayerMenu();
    document.getElementById("player-share-track")?.click();
  });
  if (mobilePlayerEditInfo) mobilePlayerEditInfo.addEventListener("click", () => {
    closeMobilePlayerMenu();
    document.getElementById("player-edit-info")?.click();
  });
  if (mobilePlayerDeleteTrack) mobilePlayerDeleteTrack.addEventListener("click", () => {
    closeMobilePlayerMenu();
    document.getElementById("player-delete-track")?.click();
  });

  // パネル外タップで閉じる
  document.addEventListener("click", (e) => {
    if (
      mobilePlayerMenuPanel.classList.contains("is-open") &&
      !mobilePlayerMenuPanel.contains(e.target) &&
      e.target !== mobilePlayerMenuToggle
    ) {
      closeMobilePlayerMenu();
    }
  });
}

// sp-queue ボタン (Up Nextパネルトグル)
{
  const spQueueBtn = document.getElementById("sp-queue");
  if (spQueueBtn) {
    spQueueBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      toggleUpNextPanel();
    });
  }

  // 標準UIプレイヤーメニューの「キューを見る」
  if (playerQueueView) {
    playerQueueView.addEventListener("click", () => {
      const isOpen = document.getElementById("up-next-panel")?.getAttribute("aria-hidden") === "false";
      toggleUpNextPanel();
      playerQueueView.setAttribute("aria-pressed", isOpen ? "false" : "true");
    });
  }

  // モバイルプレイヤー内の Up Next ボタン
  const mobileQueueBtn = document.getElementById("mobile-player-queue");
  if (mobileQueueBtn) {
    mobileQueueBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      const isOpen = document.getElementById("up-next-panel")?.getAttribute("aria-hidden") === "false";
      toggleUpNextPanel();
      mobileQueueBtn.setAttribute("aria-pressed", isOpen ? "false" : "true");
    });
  }
  const upNextClose = document.getElementById("up-next-close");
  if (upNextClose) {
    upNextClose.addEventListener("click", () => {
      closeUpNextPanel();
      document.getElementById("mobile-player-queue")?.setAttribute("aria-pressed", "false");
    });
  }
  // パネル外クリックで閉じる（デスクトップのみ: モバイルはボトムシートなのでヘッダー部分タップで代用）
  document.addEventListener("click", (e) => {
    const panel = document.getElementById("up-next-panel");
    const queueBtn = document.getElementById("sp-queue");
    const mobileQueueBtnEl = document.getElementById("mobile-player-queue");
    const stdQueueViewBtn = document.getElementById("player-queue-view");
    if (
      panel &&
      panel.getAttribute("aria-hidden") === "false" &&
      !panel.contains(e.target) &&
      e.target !== queueBtn &&
      e.target !== stdQueueViewBtn &&
      !stdQueueViewBtn?.contains(e.target) &&
      e.target !== mobileQueueBtnEl &&
      !mobileQueueBtnEl?.contains(e.target)
    ) {
      closeUpNextPanel();
      mobileQueueBtnEl?.setAttribute("aria-pressed", "false");
      stdQueueViewBtn?.setAttribute("aria-pressed", "false");
    }
  });
}

// 曲コンテキストメニュー
{
  const trackCtxMenu = document.getElementById("track-context-menu");
  if (trackCtxMenu) {
    trackCtxMenu.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-action]");
      if (!btn) return;
      const action = btn.dataset.action;
      const trackId = _trackContextMenuId;
      hideTrackContextMenu();
      if (!trackId) return;

      if (action === "play-next") {
        addToPlayNext(trackId);
      } else if (action === "favorite") {
        const track = state.tracks.find(t => t.id === trackId);
        if (track) {
          // 現在再生中トラックと同じなら既存ボタンを使う（UIも更新される）
          if (playerState.currentIndex >= 0 && state.tracks[playerState.currentIndex]?.id === trackId) {
            document.getElementById("player-favorite")?.click();
          } else {
            // 別トラックの場合は配列を直接操作してAPI呼び出し
            const isFav = Array.isArray(state.favorites) && state.favorites.includes(trackId);
            if (isFav) {
              state.favorites = state.favorites.filter(id => id !== trackId);
            } else {
              if (!Array.isArray(state.favorites)) state.favorites = [];
              state.favorites.push(trackId);
            }
            updateFavoritesTracks(state.favorites).catch(() => {});
            renderFavorites();
            updateFavoriteButtons();
          }
        }
      } else if (action === "add-playlist") {
        document.getElementById("player-add-playlist")?.click();
      } else if (action === "delete") {
        if (confirm("この曲を削除しますか？")) {
          deleteTrack(trackId)
            .then(() => refreshLibrary())
            .catch(() => alert("削除に失敗しました。"));
        }
      }
    });

    // バックドロップクリックでメニューを閉じる（document click より確実）
    const backdrop = document.getElementById("track-ctx-backdrop");
    if (backdrop) {
      backdrop.addEventListener("click", () => hideTrackContextMenu());
    }
    // フォールバック: メニュー外クリックでも閉じる
    document.addEventListener("click", (e) => {
      if (
        trackCtxMenu.getAttribute("aria-hidden") === "false" &&
        !trackCtxMenu.contains(e.target) &&
        !e.target.closest(".track-menu-btn") &&
        e.target !== backdrop
      ) {
        hideTrackContextMenu();
      }
    }, true); // capture フェーズで捕捉（stopPropagation の影響を受けない）
  }
}

if (mobilePlayerFavorite) {
  mobilePlayerFavorite.addEventListener("click", () => {
    if (playerFavorite) {
      playerFavorite.click();
      setTimeout(() => {
        // お気に入り状態を同期
        if (playerFavorite.getAttribute("aria-pressed") === "true") {
          mobilePlayerFavorite.setAttribute("aria-pressed", "true");
          mobilePlayerFavorite.classList.add("is-active");
        } else {
          mobilePlayerFavorite.setAttribute("aria-pressed", "false");
          mobilePlayerFavorite.classList.remove("is-active");
        }
      }, 50);
    }
  });
}

// audioPlayerのtimeupdateイベントでモバイルプレイヤーも更新
const originalTimeUpdateHandler = audioPlayer.ontimeupdate;
audioPlayer.addEventListener("timeupdate", () => {
  if (mobilePlayerOverlay && mobilePlayerOverlay.getAttribute("aria-hidden") === "false") {
    const progress = (audioPlayer.currentTime / audioPlayer.duration) * 100 || 0;
    mobilePlayerProgressSlider.value = progress;
    mobilePlayerProgressSlider.style.setProperty("--seek-pct", progress.toFixed(1) + "%");
    mobilePlayerCurrentTime.textContent = formatTime(audioPlayer.currentTime);
    mobilePlayerDuration.textContent = formatTime(audioPlayer.duration);
  }
});

if (playerClose) {
  playerClose.addEventListener("click", () => {
    closePlayerOverlay();
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
    const targetButton = event.target?.closest("button");
    if (targetButton) {
      closePlayerMenu();
    }
  });
  // Spotify テーマでは .player-overlay の opacity:0 が stacking context を形成し
  // position:fixed の子要素も透明になるため、body 直下に移動して回避する
  if (document.body.classList.contains("theme-spotify")) {
    document.body.appendChild(playerMenuPanel);
  }
}

if (playerAddPlaylist) {
  playerAddPlaylist.addEventListener("click", () => {
    if (!canUsePlaylistActions()) {
      return;
    }
    closePlayerMenu();
    openPlaylistModal();
  });
}

if (playerOpenSource) {
  playerOpenSource.addEventListener("click", () => {
    const track = state.tracks[playerState.currentIndex];
    if (!track?.source_url) {
      appendImportLog("ソース URL が登録されていません。", { append: true });
      return;
    }
    window.open(track.source_url, "_blank", "noopener");
  });
}

if (playerOpenVideo) {
  playerOpenVideo.addEventListener("click", () => {
    const track = state.tracks[playerState.currentIndex];
    const videoUrl = resolveTrackVideoUrl(track);
    if (!videoUrl) {
      appendImportLog("再生可能な保存済み動画が見つかりません。", { append: true });
      return;
    }
    openVideoModal(videoUrl);
  });
}

if (videoModalClose) {
  videoModalClose.addEventListener("click", () => {
    closeVideoModal();
  });
}

if (videoModal) {
  videoModal.addEventListener("click", (event) => {
    if (event.target === videoModal) {
      closeVideoModal();
    }
  });
}

if (playerShareTrack) {
  playerShareTrack.addEventListener("click", () => {
    const track = state.tracks[playerState.currentIndex];
    if (!track) {
      return;
    }
    const shareUrl = buildShareUrl(track);
    if (!shareUrl) {
      appendImportLog("共有リンクを作成できませんでした。", { append: true });
      return;
    }
    showShareDialog(shareUrl);
  });
}

if (shareDialogCopy) {
  shareDialogCopy.addEventListener("click", () => {
    copyShareUrl();
  });
}

if (shareDialogClose) {
  shareDialogClose.addEventListener("click", () => {
    closeShareDialog();
  });
}

if (shareDialog) {
  shareDialog.addEventListener("click", (event) => {
    if (event.target === shareDialog) {
      closeShareDialog();
    }
  });
}

if (playerEditInfo) {
  playerEditInfo.addEventListener("click", () => {
    const track = state.tracks[playerState.currentIndex];
    if (!track) {
      return;
    }
    closePlayerMenu();
    openTrackEditModal(track);
  });
}

if (playerDeleteTrack) {
  playerDeleteTrack.addEventListener("click", async () => {
    if (state.role !== "admin") {
      return;
    }
    const track = state.tracks[playerState.currentIndex];
    if (!track) {
      return;
    }
    closePlayerMenu();
    const result = await showConfirmDialog({
      title: "楽曲を削除",
      message: `「${track.title}」を削除しますか？`,
      showFileOption: true,
      buttons: [
        { label: "キャンセル", className: "secondary", value: "cancel" },
        { label: "削除する", className: "danger", value: "confirm" },
      ],
    });
    if (result.action !== "confirm") {
      return;
    }
    try {
      stopPlayback();
      closePlayerOverlay();
      await deleteTrack(track.id, result.deleteFile);
      await refreshLibrary();
    } catch (error) {
      console.error(error);
      appendImportLog("曲の削除に失敗しました。", { append: true });
    }
  });
}

if (playerDownload) {
  playerDownload.addEventListener("click", () => {
    const track = state.tracks[playerState.currentIndex];
    if (!track?.file_url) {
      appendImportLog("ダウンロードできる音源がありません。", { append: true });
      return;
    }
    const anchor = document.createElement("a");
    const safeTitle = track.title.replace(/[\\/:*?"<>|]/g, "_");
    const ext = String(track.file_url || "").split(".").pop() || "mp3";
    anchor.href = track.file_url;
    anchor.download = `${safeTitle}.${ext}`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
  });
}

if (playlistModalClose) {
  playlistModalClose.addEventListener("click", () => {
    closePlaylistModal();
  });
}

if (playlistModal) {
  playlistModal.addEventListener("click", (event) => {
    if (event.target === playlistModal) {
      closePlaylistModal();
    }
  });
}

if (trackEditClose) {
  trackEditClose.addEventListener("click", () => {
    closeTrackEditModal();
  });
}

if (trackEditCancel) {
  trackEditCancel.addEventListener("click", () => {
    closeTrackEditModal();
  });
}

if (trackEditModal) {
  trackEditModal.addEventListener("click", (event) => {
    if (event.target === trackEditModal) {
      closeTrackEditModal();
    }
  });
}

if (trackEditForm) {
  trackEditForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const track = state.tracks[playerState.currentIndex];
    if (!track) {
      return;
    }
    const payload = {
      title: trackEditTitle?.value?.trim() ?? "",
      artist: trackEditArtist?.value?.trim() ?? "",
      album: trackEditAlbum?.value?.trim() ?? "",
      source_url: trackEditSourceUrl?.value?.trim() ?? "",
    };
    try {
      const updated = await updateTrackMetadata(track.id, payload);
      const targetIndex = state.tracks.findIndex((item) => item.id === track.id);
      if (targetIndex >= 0) {
        state.tracks[targetIndex] = updated;
      }
      renderMedia();
      renderPlaylistDetail();
      renderTagOptions();
      updatePlayerUI();
      updateFavoriteButtons();
      closeTrackEditModal();
    } catch (error) {
      console.error(error);
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
    !playerMenuToggle.contains(event.target) &&
    (!mobilePlayerMenuToggle || !mobilePlayerMenuToggle.contains(event.target))
  ) {
    closePlayerMenu();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && videoModal?.classList.contains("is-open")) {
    closeVideoModal();
    return;
  }
  if (!isPlayerOverlayActive()) {
    return;
  }
  const tagName = event.target?.tagName?.toLowerCase();
  if (tagName === "input" || tagName === "textarea" || event.target?.isContentEditable) {
    return;
  }
  if (event.key === "Escape") {
    closePlayerOverlay();
    return;
  }
  if (event.code === "Space" || event.key === " ") {
    event.preventDefault();
    togglePlayback();
  }
});

window.addEventListener("pageshow", () => {
  if (isPlayerOverlayActive()) {
    scheduleOverlayVideoSync();
    return;
  }
  if (playerVideoSyncPending) {
    syncVideoStateWithAudioPlayback();
  }
});

document.addEventListener("visibilitychange", () => {
  if (document.visibilityState !== "visible") {
    return;
  }
  if (isPlayerOverlayActive()) {
    scheduleOverlayVideoSync();
    return;
  }
  if (playerVideoSyncPending || playerVideo?.classList.contains("is-visible")) {
    syncVideoStateWithAudioPlayback();
  }
});

if (playerVideo) {
  playerVideo.addEventListener("canplay", () => {
    if (playerVideoSyncPending) {
      syncVideoStateWithAudioPlayback();
    }
  });
}

if (supportsMediaSession) {
  const registerMediaSessionHandler = (action, handler) => {
    try {
      navigator.mediaSession.setActionHandler(action, handler);
    } catch (error) {
      console.warn(`Unsupported media session action: ${action}`, error);
    }
  };

  registerMediaSessionHandler("play", () => {
    if (playerState.currentIndex === -1 && state.tracks.length > 0) {
      // Resume from the last played track if available, otherwise start from the first
      const resumeIndex =
        playerState.lastIndex >= 0 && playerState.lastIndex < state.tracks.length
          ? playerState.lastIndex
          : 0;
      setTrackByIndex(resumeIndex);
    }
    audioPlayer && audioPlayer.play().catch((err) => {
      console.warn("[squashterm] MediaSession play failed:", err);
      updateMediaSessionPlaybackState();
    });
  });
  registerMediaSessionHandler("pause", () => {
    pauseCurrentTrack();
  });
  registerMediaSessionHandler("previoustrack", () => {
    playPrev();
  });
  registerMediaSessionHandler("nexttrack", () => {
    playNext();
  });
  // seekbackward/seekforward: sent by car audio, Android Auto, headsets.
  // When the event carries a seekOffset, seek by that many seconds.
  // When no offset is provided, treat as previous/next track.
  registerMediaSessionHandler("seekbackward", (event) => {
    if (!audioPlayer) { playPrev(); return; }
    const offset = typeof event?.seekOffset === "number" ? event.seekOffset : 0;
    if (offset > 0) {
      audioPlayer.currentTime = Math.max(0, audioPlayer.currentTime - offset);
      updateMediaSessionPosition();
    } else {
      playPrev();
    }
  });
  registerMediaSessionHandler("seekforward", (event) => {
    if (!audioPlayer) { playNext(); return; }
    const offset = typeof event?.seekOffset === "number" ? event.seekOffset : 0;
    if (offset > 0) {
      const dur = Number.isFinite(audioPlayer.duration) ? audioPlayer.duration : undefined;
      const newTime = audioPlayer.currentTime + offset;
      audioPlayer.currentTime = dur !== undefined ? Math.min(dur, newTime) : newTime;
      updateMediaSessionPosition();
    } else {
      playNext();
    }
  });
  registerMediaSessionHandler("stop", () => {
    stopPlayback();
  });
  registerMediaSessionHandler("seekto", (event) => {
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


// 画面サイズ変更時に全画面プレイヤーをモバイル/デスクトップ切り替え
{
  let _resizeTimer = null;
  window.addEventListener("resize", () => {
    clearTimeout(_resizeTimer);
    _resizeTimer = setTimeout(() => {
      if (isPlayerOverlayActive() && isMobileDevice()) {
        closePlayerOverlay();
        openMobilePlayer();
      } else if (
        mobilePlayerOverlay?.getAttribute("aria-hidden") === "false" &&
        !isMobileDevice()
      ) {
        closeMobilePlayer();
        openPlayerOverlay();
      }
    }, 200);
  });
}

bindAuthAdminEvents();
init();

if (settingsShowVideoOnPlayer) {
  settingsShowVideoOnPlayer.addEventListener("change", async () => {
    const nextValue = Boolean(settingsShowVideoOnPlayer.checked);
    try {
      const updated = await requestJson(
        "/api/auth/profile",
        { show_video_on_player: nextValue },
        "PUT"
      );
      state.authUser = updated;
      updatePlayerUI();
    } catch (error) {
      settingsShowVideoOnPlayer.checked = !nextValue;
      appendImportLog(`設定の保存に失敗しました: ${error.message}`, { append: true });
    }
  });
}

if (settingsProfileSave) {
  settingsProfileSave.addEventListener("click", async () => {
    try {
      await requestJson("/api/auth/profile", { display_name: settingsDisplayNameInput?.value?.trim() || null }, "PUT");
      const iconFile = settingsUserIconFile?.files?.[0];
      if (iconFile) {
        const formData = new FormData();
        formData.append("file", iconFile);
        const response = await fetch("/api/auth/profile/icon", { method: "POST", body: formData });
        if (!response.ok) {
          throw new Error("アイコンアップロードに失敗しました。");
        }
      }
      await fetchAuthMe();
      await refreshAdminData();
      appendImportLog("プロフィールを保存しました。", { append: true });
    } catch (error) {
      appendImportLog(`プロフィール保存に失敗しました: ${error.message}`, { append: true });
    }
  });
}

if (designColorsSave) {
  designColorsSave.addEventListener("click", async () => {
    const payload = {
      accent_color: designAccentColorInput?.value || "#38bdf8",
    };
    try {
      const response = await requestJson("/api/settings/design", payload, "PUT");
      applyDesignTheme(response.design);
      appendImportLog("デザインカラーを保存しました。", { append: true });
    } catch (error) {
      console.error(error);
    }
  });
}

const uploadDesignAsset = async (path, fileInput) => {
  const file = fileInput?.files?.[0];
  if (!file) {
    appendImportLog("ファイルを選択してください。", { append: true });
    return;
  }
  const formData = new FormData();
  formData.append("file", file);
  const response = await fetch(path, { method: "POST", body: formData });
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  const logos = document.querySelectorAll(".app-logo, .mobile-sticky-logo, .settings-version-logo");
  logos.forEach((img) => {
    img.src = `/branding/logo?t=${Date.now()}`;
  });
};

if (designLogoSave) {
  designLogoSave.addEventListener("click", async () => {
    try {
      await uploadDesignAsset("/api/settings/design/logo", designLogoFile);
      appendImportLog("ロゴを保存しました。", { append: true });
    } catch (error) {
      console.error(error);
    }
  });
}


if (designLogoReset) {
  designLogoReset.addEventListener("click", async () => {
    try {
      await fetch("/api/settings/design/logo", { method: "DELETE" });
      const logos = document.querySelectorAll(".app-logo, .mobile-sticky-logo, .settings-version-logo");
      logos.forEach((img) => {
        img.src = `/branding/logo?t=${Date.now()}`;
      });
      appendImportLog("ロゴをリセットしました。", { append: true });
    } catch (error) {
      console.error(error);
    }
  });
}

if (designFaviconSave) {
  designFaviconSave.addEventListener("click", async () => {
    try {
      await uploadDesignAsset("/api/settings/design/favicon", designFaviconFile);
      const icon = document.querySelector('link[rel="icon"]');
      if (icon) {
        icon.href = `/favicon.ico?t=${Date.now()}`;
      }
      appendImportLog("faviconを保存しました。", { append: true });
    } catch (error) {
      console.error(error);
    }
  });
}


if (designFaviconReset) {
  designFaviconReset.addEventListener("click", async () => {
    try {
      await fetch("/api/settings/design/favicon", { method: "DELETE" });
      const icon = document.querySelector('link[rel="icon"]');
      if (icon) {
        icon.href = `/favicon.ico?t=${Date.now()}`;
      }
      appendImportLog("faviconをリセットしました。", { append: true });
    } catch (error) {
      console.error(error);
    }
  });
}

