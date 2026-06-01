const express = require("express");
const request = require("supertest");

const mockGetUser = jest.fn();
const mockGetEvaluationStatus = jest.fn();
const mockStartEvaluation = jest.fn();

class MockEvaluationError extends Error {
  constructor(status, code, message, extra = null) {
    super(message);
    this.status = status;
    this.code = code;
    this.extra = extra;
  }
}

jest.mock("../lib/supabase", () => ({
  supabaseAdmin: {
    auth: {
      getUser: (...args) => mockGetUser(...args),
    },
  },
}));

jest.mock("../services/evaluationService", () => ({
  EvaluationError: MockEvaluationError,
  getEvaluationStatus: (...args) => mockGetEvaluationStatus(...args),
  startEvaluation: (...args) => mockStartEvaluation(...args),
}));

const evaluationRoutes = require("../routes/evaluation");
const { EvaluationError } = require("../services/evaluationService");

function createApp() {
  const app = express();
  app.use(express.json());
  app.use("/api/evaluation", evaluationRoutes);
  return app;
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe("evaluation routes", () => {
  test("GET /status returns 401 without access token", async () => {
    const app = createApp();
    const response = await request(app).get("/api/evaluation/status");

    expect(response.status).toBe(401);
    expect(response.body.error).toBe("not_signed_in");
  });

  test("GET /status returns payload for signed-in user", async () => {
    const app = createApp();
    mockGetUser.mockResolvedValue({
      data: { user: { id: "user-1" } },
      error: null,
    });
    mockGetEvaluationStatus.mockResolvedValue({
      state: "ready",
      hasCompletedEvaluation: false,
    });

    const response = await request(app)
      .get("/api/evaluation/status")
      .set("Authorization", "Bearer test-token");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      state: "ready",
      hasCompletedEvaluation: false,
    });
  });

  test("POST /start maps EvaluationError to expected status/code", async () => {
    const app = createApp();
    mockGetUser.mockResolvedValue({
      data: { user: { id: "user-1" } },
      error: null,
    });
    mockStartEvaluation.mockRejectedValue(
      new EvaluationError(409, "already_started", "Evaluation already running."),
    );

    const response = await request(app)
      .post("/api/evaluation/start")
      .set("Authorization", "Bearer test-token")
      .send({});

    expect(response.status).toBe(409);
    expect(response.body).toMatchObject({
      error: "already_started",
      message: "Evaluation already running.",
    });
  });
});

