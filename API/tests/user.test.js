import { describe, expect, test } from "bun:test";

describe("User API", () => {
  test("should register a user", async () => {
    const response = await fetch("http://localhost:3000/register", {
      method: "POST",
      body: JSON.stringify({
        name: "Gabriel",
        email: "gabriel@email.com",
        password: "123456",
        cpf: "12345678900",
      }),
      headers: { "Content-Type": "application/json" },
    });

    const data = await response.json();
    expect(response.status).toBe(201);
    expect(data.message).toBe("Usuário criado!");
  });

  test("should log in", async () => {
    const response = await fetch("http://localhost:3000/login", {
      method: "POST",
      body: JSON.stringify({
        email: "gabriel@email.com",
        password: "123456",
      }),
      headers: { "Content-Type": "application/json" },
    });

    const data = await response.json();
    expect(response.status).toBe(200);
    expect(data.token).toBeTruthy();
  });
});
