const express = require("express");
const request = require("supertest");
const { TRUST_COOKIE_NAME } = require("../lib/http");

const mockGetUser = jest.fn();
const mockMaskEmail = jest.fn();
const mockGetProfileSecurityState = jest.fn();
const mockCreateCodeChallenge = jest.fn();
const mockVerifyCode = jest.fn();
const mockSetEmail2faEnabled = jest.fn();
const mockCreateTrustedDevice = jest.fn();
const mockClearTrustedDevices = jest.fn();
const mockHasTrustedDevice = jest.fn();
const mockSendTwoFactorCodeEmail = jest.fn();

jest.mock("../lib/supabase", () => ({
  supabaseAdmin: {
    auth: {
      getUser: (...args) => mockGetUser(...args),
    },
  },
}));

jest.mock("../lib/twoFactor", () => ({
  CODE_TTL_MINUTES: 10,
  maskEmail: (...args) => mockMaskEmail(...args),
  getProfileSecurityState: (...args) => mockGetProfileSecurityState(...args),
  createCodeChallenge: (...args) => mockCreateCodeChallenge(...args),
  verifyCode: (...args) => mockVerifyCode(...args),
  setEmail2faEnabled: (...args) => mockSetEmail2faEnabled(...args),
  createTrustedDevice: (...args) => mockCreateTrustedDevice(...args),
  clearTrustedDevices: (...args) => mockClearTrustedDevices(...args),
  hasTrustedDevice: (...args) => mockHasTrustedDevice(...args),
}));

jest.mock("../services/mailService", () => ({
  sendTwoFactorCodeEmail: (...args) => mockSendTwoFactorCodeEmail(...args),
}));

const auth2faRoutes = require("../routes/auth2fa");

function createApp() {
  const app = express();
  app.use(express.json());
  app.use("/api/auth/2fa", auth2faRoutes);
  return app;
}

function mockSignedInUser(overrides = {}) {
  mockGetUser.mockResolvedValue({
    data: {
      user: {
        id: "user-1",
        email: "john@example.com",
        ...overrides,
      },
    },
    error: null,
  });
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe("auth 2fa routes", () => {
  test("POST /setup/init returns 401 without access token", async () => {
    const app = createApp();
    const response = await request(app).post("/api/auth/2fa/setup/init");

    expect(response.status).toBe(401);
    expect(response.body.error).toBe("not_signed_in");
  });

  test("GET /status returns disabled state", async () => {
    const app = createApp();
    mockSignedInUser();
    mockGetProfileSecurityState.mockResolvedValue({
      exists: true,
      email2faEnabled: false,
    });
    mockMaskEmail.mockReturnValue("j***n@example.com");

    const response = await request(app)
      .get("/api/auth/2fa/status")
      .set("Authorization", "Bearer test-token");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      enabled: false,
      requiresVerification: false,
      hasTrustedDevice: false,
      emailMasked: "j***n@example.com",
    });
  });

  test("POST /challenge/verify sets trust cookie when rememberDevice is true", async () => {
    const app = createApp();
    mockSignedInUser();
    mockGetProfileSecurityState.mockResolvedValue({
      exists: true,
      email2faEnabled: true,
    });
    mockVerifyCode.mockResolvedValue(true);
    mockCreateTrustedDevice.mockResolvedValue({
      token: "trusted-token",
      maxAgeMs: 7 * 24 * 60 * 60 * 1000,
    });

    const response = await request(app)
      .post("/api/auth/2fa/challenge/verify")
      .set("Authorization", "Bearer test-token")
      .send({
        code: "123456",
        rememberDevice: true,
      });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ ok: true });
    expect(response.headers["set-cookie"]).toEqual(
      expect.arrayContaining([
        expect.stringContaining(`${TRUST_COOKIE_NAME}=trusted-token`),
      ]),
    );
  });
});

