const API_BASE = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, '') || 'http://localhost:5001';

const TOKEN_KEY = 'codeflow_token';
const DEMO_EMAIL = 'demo@codeflow.local';
const DEMO_PASSWORD = 'demo123';

type ReqOptions = RequestInit & { auth?: boolean };

async function request<T>(path: string, options: ReqOptions = {}): Promise<T> {
  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');

  if (options.auth) {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) headers.set('Authorization', `Bearer ${token}`);
  }

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `HTTP ${res.status}`);
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export interface CourseDto { id: number; title: string; description: string; level: string; color: string; totalLessons: number; }
export interface LessonDto { id: number; courseId: number; chapter: string; title: string; description: string; task: string; initialCode: string; expectedOutput: string; xp: number; isBoss: boolean; hasDebugger: boolean; hint: string; hint2: string; }
export interface LeaderboardEntryDto { rank: number; userId: string; displayName: string; totalXp: number; }
export interface UserDto { id: string; email: string; displayName: string; totalXp: number; createdAtUtc: string; emailConfirmed: boolean; role: string; }
export interface UserProgressSummaryDto { totalXp: number; completedLessonsCount: number; completedLessonIds: number[]; cleanStreak: number; fastBossKill: boolean; }
export interface XpBalanceDto { totalXp: number; }
export interface SubmitResultDto { passed: boolean; output: string; expected: string; error?: string | null; failureReason?: string | null; }
export interface ShopItemDto { id: string; name: string; color: string; bg: string; price: number; }
export interface UserAchievementDto { achievementId: string; unlockedAtUtc: string; }
export interface AchievementDefinitionDto { id: string; title: string; description: string; icon: string; rarity: string; }
export interface FactionDto { id: string; name: string; description: string; icon: string; color: string; bonus: string; requiredRep: number; }
export interface UserReputationDto { factionId: string; reputation: number; }

async function ensureDemoAuth(): Promise<void> {
  if (localStorage.getItem(TOKEN_KEY)) return;

  try {
    const login = await request<{ accessToken: string }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: DEMO_EMAIL, password: DEMO_PASSWORD })
    });
    localStorage.setItem(TOKEN_KEY, login.accessToken);
    return;
  } catch {
    // register and retry login
  }

  await request('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email: DEMO_EMAIL, password: DEMO_PASSWORD, displayName: 'Demo Operative' })
  });

  const login = await request<{ accessToken: string }>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: DEMO_EMAIL, password: DEMO_PASSWORD })
  });
  localStorage.setItem(TOKEN_KEY, login.accessToken);
}

export async function bootstrapAuth(): Promise<void> {
  await ensureDemoAuth();
}

export const api = {
  async getCourses() { return request<CourseDto[]>('/api/courses'); },
  async getCourseLessons(id: number) { return request<LessonDto[]>(`/api/courses/${id}/lessons`); },
  async getLeaderboard(limit = 50) { return request<LeaderboardEntryDto[]>(`/api/leaderboard?limit=${limit}`); },

  async getMe() { await ensureDemoAuth(); return request<UserDto>('/api/users/me', { auth: true }); },
  async getMyProgress() { await ensureDemoAuth(); return request<UserProgressSummaryDto>('/api/progress', { auth: true }); },
  async completeLesson(lessonId: number, wasCleanRun: boolean) {
    await ensureDemoAuth();
    return request('/api/progress/complete', {
      method: 'POST',
      auth: true,
      body: JSON.stringify({ lessonId, wasCleanRun })
    });
  },
  async purchaseHint(price: number) {
    await ensureDemoAuth();
    return request<XpBalanceDto>('/api/progress/purchase-hint', {
      method: 'POST',
      auth: true,
      body: JSON.stringify({ price })
    });
  },
  async moralChoice(factionId: string, xpBonus: number, reputationBonus: number) {
    await ensureDemoAuth();
    return request<XpBalanceDto>('/api/progress/moral-choice', {
      method: 'POST',
      auth: true,
      body: JSON.stringify({ factionId, xpBonus, reputationBonus })
    });
  },
  async resetProgress() {
    await ensureDemoAuth();
    return request<{ message: string }>('/api/progress/reset', {
      method: 'POST',
      auth: true
    });
  },
  async submitLesson(lessonId: number, code: string) {
    await ensureDemoAuth();
    return request<SubmitResultDto>(`/api/lessons/${lessonId}/submit`, {
      method: 'POST',
      auth: true,
      body: JSON.stringify({ code })
    });
  },

  async getShopItems() { return request<ShopItemDto[]>('/api/shop/items'); },
  async getMyShopItems() { await ensureDemoAuth(); return request<ShopItemDto[]>('/api/shop/me', { auth: true }); },
  async purchase(shopItemId: string) {
    await ensureDemoAuth();
    return request<ShopItemDto>('/api/shop/purchase', {
      method: 'POST',
      auth: true,
      body: JSON.stringify({ shopItemId })
    });
  },

  async getAchievementDefinitions() { return request<AchievementDefinitionDto[]>('/api/achievements'); },
  async getMyAchievements() { await ensureDemoAuth(); return request<UserAchievementDto[]>('/api/achievements/me', { auth: true }); },
  async getFactions() { return request<FactionDto[]>('/api/factions'); },
  async getMyReputation() { await ensureDemoAuth(); return request<UserReputationDto[]>('/api/factions/me', { auth: true }); }
};

export async function syncServerStateToLocalStorage(): Promise<void> {
  await ensureDemoAuth();
  const [me, progress, owned, myAchievements, myReputation] = await Promise.all([
    api.getMe(),
    api.getMyProgress(),
    api.getMyShopItems().catch(() => []),
    api.getMyAchievements().catch(() => []),
    api.getMyReputation().catch(() => [])
  ]);

  localStorage.setItem('userXP', String(me.totalXp ?? progress.totalXp));
  localStorage.setItem('completedLessons', JSON.stringify(progress.completedLessonIds || []));
  localStorage.setItem('cleanStreak', String(progress.cleanStreak || 0));
  localStorage.setItem('fastBossKill', progress.fastBossKill ? 'true' : 'false');

  const ownedThemeIds = Array.from(new Set(['classic', ...owned.map(i => i.id)]));
  localStorage.setItem('ownedThemes', JSON.stringify(ownedThemeIds));
  localStorage.setItem('unlockedAchievements', JSON.stringify(myAchievements.map(a => a.achievementId)));
  localStorage.setItem('reputation', JSON.stringify(Object.fromEntries(myReputation.map(r => [r.factionId, r.reputation]))));
}
