import { beforeEach, describe, expect, it } from 'vitest';
import { authApi } from './auth';

describe('authApi', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('isLoggedIn возвращает false без токена', () => {
    expect(authApi.isLoggedIn()).toBe(false);
  });

  it('isLoggedIn возвращает false для строки undefined', () => {
    localStorage.setItem('token', 'undefined');
    expect(authApi.isLoggedIn()).toBe(false);
  });

  it('isLoggedIn возвращает true при валидном токене', () => {
    localStorage.setItem('token', 'valid-jwt-token');
    expect(authApi.isLoggedIn()).toBe(true);
  });

  it('logout очищает данные сессии', () => {
    localStorage.setItem('token', 'valid-jwt-token');
    localStorage.setItem('user', '{"id":"1"}');
    authApi.logout();
    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.getItem('user')).toBeNull();
  });
});
