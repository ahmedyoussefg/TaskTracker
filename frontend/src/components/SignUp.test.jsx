import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { server } from "../mocks/server";
import { http, HttpResponse } from "msw";
import SignUp from "./SignUp";
import { MemoryRouter } from "react-router-dom";
import { useAuth } from "../contexts/useAuth";
import { vi } from "vitest";
import config from "../apis/config";

/* global beforeEach, test, expect */

vi.mock("../contexts/useAuth", () => ({
  useAuth: vi.fn(),
}));

const mockLogin = vi.fn();
const mockNavigate = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});
beforeEach(() => {
  useAuth.mockReturnValue({ login: mockLogin });
  localStorage.clear();
});

function fillForm({ displayName, username, email, password }) {
  fireEvent.change(screen.getByLabelText(/display name/i), {
    target: { value: displayName },
  });
  fireEvent.change(screen.getByLabelText(/username/i), {
    target: { value: username },
  });
  fireEvent.change(screen.getByLabelText(/email/i), {
    target: { value: email },
  });
  fireEvent.change(screen.getByLabelText(/^password$/i), {
    target: { value: password },
  });
}

test("shows error for weak password", async () => {
  render(
    <MemoryRouter>
      <SignUp />
    </MemoryRouter>
  );

  fillForm({
    displayName: "John Doe",
    username: "johndoe",
    email: "john@example.com",
    password: "weak",
  });

  fireEvent.click(screen.getByRole("button", { name: /sign up/i }));

  expect(
    await screen.findByText(
      /password must be 8\+ characters, include an uppercase/i
    )
  ).toBeInTheDocument();
  expect(mockLogin).not.toHaveBeenCalled();
});

test("successful signup flow", async () => {
  render(
    <MemoryRouter>
      <SignUp />
    </MemoryRouter>
  );

  fillForm({
    displayName: "John Doe",
    username: "johndoe",
    email: "john@example.com",
    password: "StrongPass1",
  });

  fireEvent.click(screen.getByRole("button", { name: /sign up/i }));

  expect(await screen.findByText(/sign-up successful/i)).toBeInTheDocument();

  // Wait a bit longer than 1500ms for navigation to happen
  await new Promise((r) => setTimeout(r, 1600));

  await waitFor(() => {
    expect(localStorage.getItem("token")).toBe("mocked-token");
    expect(mockLogin).toHaveBeenCalledWith("mocked-token");
    expect(mockNavigate).toHaveBeenCalledWith("/dashboard");
  });
});

test("shows backend error message", async () => {
  render(
    <MemoryRouter>
      <SignUp />
    </MemoryRouter>
  );

  fillForm({
    displayName: "Jane Doe",
    username: "errorUser", // triggers error in handler
    email: "jane@example.com",
    password: "StrongPass1",
  });

  fireEvent.click(screen.getByRole("button", { name: /sign up/i }));

  expect(await screen.findByText(/username taken/i)).toBeInTheDocument();
});

test("shows network error message", async () => {
  server.use(
    http.post(`${config.BASE_API_URL}/users/sign-up`, () =>
      HttpResponse.error()
    )
  );

  render(
    <MemoryRouter>
      <SignUp />
    </MemoryRouter>
  );

  fillForm({
    displayName: "Jane Doe",
    username: "janedoe",
    email: "jane@example.com",
    password: "StrongPass1",
  });

  fireEvent.click(screen.getByRole("button", { name: /sign up/i }));

  expect(
    await screen.findByText(/network error\. please try again later\./i)
  ).toBeInTheDocument();
});
