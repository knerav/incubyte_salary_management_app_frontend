import { getToken, setToken, clearToken, getRefreshToken, setRefreshToken, clearRefreshToken } from "@/lib/auth";

const TOKEN = "test.jwt.token";

beforeEach(() => {
  localStorage.clear();
});

describe("getToken", () => {
  it("returns null when no token has been stored", () => {
    expect(getToken()).toBeNull();
  });

  it("returns the stored token", () => {
    localStorage.setItem("auth_token", TOKEN);
    expect(getToken()).toBe(TOKEN);
  });

  it("returns null in an SSR environment where localStorage is unavailable", () => {
    const original = global.localStorage;
    Object.defineProperty(global, "localStorage", {
      value: undefined,
      configurable: true,
    });

    expect(getToken()).toBeNull();

    Object.defineProperty(global, "localStorage", {
      value: original,
      configurable: true,
    });
  });
});

describe("setToken", () => {
  it("persists the token to localStorage", () => {
    setToken(TOKEN);
    expect(localStorage.getItem("auth_token")).toBe(TOKEN);
  });

  it("also mirrors the token to a cookie for middleware access", () => {
    setToken(TOKEN);
    expect(document.cookie).toContain("auth_token=");
  });
});

describe("clearToken", () => {
  it("removes the token from localStorage", () => {
    localStorage.setItem("auth_token", TOKEN);
    clearToken();
    expect(localStorage.getItem("auth_token")).toBeNull();
  });

  it("removes the token cookie", () => {
    document.cookie = `auth_token=${TOKEN}; path=/`;
    clearToken();
    expect(document.cookie).not.toContain("auth_token=");
  });
});

const REFRESH_TOKEN = "test.refresh.token";

describe("getRefreshToken", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("returns null when no refresh token has been stored", () => {
    expect(getRefreshToken()).toBeNull();
  });

  it("returns the stored refresh token", () => {
    localStorage.setItem("refresh_token", REFRESH_TOKEN);
    expect(getRefreshToken()).toBe(REFRESH_TOKEN);
  });
});

describe("setRefreshToken", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("persists the refresh token to localStorage", () => {
    setRefreshToken(REFRESH_TOKEN);
    expect(localStorage.getItem("refresh_token")).toBe(REFRESH_TOKEN);
  });
});

describe("clearRefreshToken", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("removes the refresh token from localStorage", () => {
    localStorage.setItem("refresh_token", REFRESH_TOKEN);
    clearRefreshToken();
    expect(localStorage.getItem("refresh_token")).toBeNull();
  });
});
