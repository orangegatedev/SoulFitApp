const DEFAULT_TIMEOUT_MINUTES = 480;
const CHECK_INTERVAL_MS = 30_000;
const PERSIST_THROTTLE_MS = 15_000;
const LAST_ACTIVITY_KEY = "soulfit-session-last-activity";
const AUTH_STORAGE_KEY = "soulfit-auth";
const EXPIRATION_MESSAGE_KEY = "soulfit-session-expiration-message";

function readTimeoutMinutes() {
  const configured = Number(process.env.NEXT_PUBLIC_SESSION_IDLE_TIMEOUT_MINUTES);
  return Number.isFinite(configured) && configured >= 1
    ? configured
    : DEFAULT_TIMEOUT_MINUTES;
}

export const SESSION_IDLE_TIMEOUT_MINUTES = readTimeoutMinutes();
const TIMEOUT_MS = SESSION_IDLE_TIMEOUT_MINUTES * 60_000;

type ExpirationListener = () => void;

class SessionTimeoutService {
  private listeners = new Set<ExpirationListener>();
  private intervalId: number | null = null;
  private lastActivityAt = 0;
  private lastPersistedAt = 0;
  private expired = false;

  subscribe(listener: ExpirationListener) {
    this.listeners.add(listener);
    this.ensureStarted();

    return () => {
      this.listeners.delete(listener);
      if (!this.listeners.size) this.stopMonitoring();
    };
  }

  startSession() {
    this.expired = false;
    this.lastActivityAt = Date.now();
    this.persistActivity(true);
    this.ensureStarted();
  }

  endSession() {
    this.expired = false;
    this.lastActivityAt = 0;
    this.lastPersistedAt = 0;
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(LAST_ACTIVITY_KEY);
    }
  }

  registerActivity = () => {
    if (!this.hasAuthenticatedSession()) return;

    if (this.isExpired()) {
      this.expireSession("Tu sesión expiró por inactividad. Inicia sesión nuevamente.");
      return;
    }

    this.expired = false;
    this.lastActivityAt = Date.now();
    this.persistActivity(false);
  };

  registerNavigation() {
    this.registerActivity();
  }

  registerImportantProcess() {
    this.registerActivity();
  }

  checkExpiration = () => {
    if (!this.hasAuthenticatedSession() || this.expired) return false;
    if (!this.isExpired()) return false;

    this.expireSession("Tu sesión expiró por inactividad. Inicia sesión nuevamente.");
    return true;
  };

  isSessionActive() {
    return this.hasAuthenticatedSession() && !this.isExpired();
  }

  expireFromServer(message?: string) {
    this.expireSession(
      message ?? "Tu sesión expiró por inactividad. Inicia sesión nuevamente."
    );
  }

  clearSessionData() {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
    window.localStorage.removeItem(LAST_ACTIVITY_KEY);
  }

  consumeExpirationMessage() {
    if (typeof window === "undefined") return null;
    const message = window.sessionStorage.getItem(EXPIRATION_MESSAGE_KEY);
    window.sessionStorage.removeItem(EXPIRATION_MESSAGE_KEY);
    return message;
  }

  private ensureStarted() {
    if (typeof window === "undefined" || this.intervalId !== null) return;

    this.lastActivityAt = this.readLastActivity() || Date.now();
    if (this.hasAuthenticatedSession() && !this.readLastActivity()) {
      this.persistActivity(true);
    }

    window.addEventListener("mousemove", this.registerActivity, { passive: true });
    window.addEventListener("mousedown", this.registerActivity, { passive: true });
    window.addEventListener("keydown", this.registerActivity);
    window.addEventListener("scroll", this.registerActivity, { passive: true });
    window.addEventListener("touchstart", this.registerActivity, { passive: true });
    window.addEventListener("storage", this.handleStorage);
    window.addEventListener("focus", this.checkExpiration);
    document.addEventListener("visibilitychange", this.handleVisibilityChange);

    this.intervalId = window.setInterval(this.checkExpiration, CHECK_INTERVAL_MS);
    this.checkExpiration();
  }

  private stopMonitoring() {
    if (typeof window === "undefined") return;

    if (this.intervalId !== null) {
      window.clearInterval(this.intervalId);
      this.intervalId = null;
    }

    window.removeEventListener("mousemove", this.registerActivity);
    window.removeEventListener("mousedown", this.registerActivity);
    window.removeEventListener("keydown", this.registerActivity);
    window.removeEventListener("scroll", this.registerActivity);
    window.removeEventListener("touchstart", this.registerActivity);
    window.removeEventListener("storage", this.handleStorage);
    window.removeEventListener("focus", this.checkExpiration);
    document.removeEventListener("visibilitychange", this.handleVisibilityChange);
  }

  private handleStorage = (event: StorageEvent) => {
    if (event.key === LAST_ACTIVITY_KEY && event.newValue) {
      const activity = Number(event.newValue);
      if (Number.isFinite(activity)) this.lastActivityAt = activity;
    }
  };

  private handleVisibilityChange = () => {
    if (document.visibilityState === "visible") this.checkExpiration();
  };

  private hasAuthenticatedSession() {
    if (typeof window === "undefined") return false;
    const persisted = window.localStorage.getItem(AUTH_STORAGE_KEY);
    if (!persisted) return false;

    try {
      const parsed = JSON.parse(persisted) as { state?: { token?: string | null } };
      return Boolean(parsed.state?.token);
    } catch {
      return false;
    }
  }

  private readLastActivity() {
    if (typeof window === "undefined") return 0;
    const value = Number(window.localStorage.getItem(LAST_ACTIVITY_KEY));
    return Number.isFinite(value) && value > 0 ? value : 0;
  }

  private isExpired() {
    const lastActivity = Math.max(this.lastActivityAt, this.readLastActivity());
    return lastActivity > 0 && Date.now() - lastActivity >= TIMEOUT_MS;
  }

  private persistActivity(force: boolean) {
    if (typeof window === "undefined") return;
    const now = Date.now();
    if (!force && now - this.lastPersistedAt < PERSIST_THROTTLE_MS) return;

    window.localStorage.setItem(LAST_ACTIVITY_KEY, String(this.lastActivityAt || now));
    this.lastPersistedAt = now;
  }

  private expireSession(message: string) {
    if (this.expired) return;
    this.expired = true;
    this.clearSessionData();

    if (typeof window !== "undefined") {
      window.sessionStorage.setItem(EXPIRATION_MESSAGE_KEY, message);
    }

    this.listeners.forEach((listener) => listener());
  }
}

export const sessionTimeoutService = new SessionTimeoutService();
