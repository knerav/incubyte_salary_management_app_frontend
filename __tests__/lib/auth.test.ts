import { getToken, setToken, clearToken } from "@/lib/auth";

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
