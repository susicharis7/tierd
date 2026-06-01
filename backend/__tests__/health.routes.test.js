const express = require("express");
const request = require("supertest");
const healthRoutes = require("../routes/health");

describe("health routes", () => {
  test("GET /api/health returns ok", async () => {
    const app = express();
    app.use("/api", healthRoutes);

    const response = await request(app).get("/api/health");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: "ok" });
  });
});

