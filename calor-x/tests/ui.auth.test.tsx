// @vitest-environment jsdom
import React from "react";
import { describe, test, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Header from "@/components/Header";
import Auth from "@/pages/Auth";
import { MemoryRouter } from "react-router-dom";

describe("Header / Auth UI", () => {
  test("Header renders Login and Sign Up buttons", () => {
    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    );

  expect(screen.getAllByText(/Login/i).length).toBeGreaterThan(0);
  expect(screen.getAllByText(/Sign Up/i).length).toBeGreaterThan(0);
  });

  test("Auth renders in sign-up mode when mode prop is 'signup'", () => {
    render(
      <MemoryRouter>
        <Auth mode="signup" />
      </MemoryRouter>
    );

    // The Auth form shows Arabic and English headings; check for Sign Up text
    expect(screen.getAllByText(/Sign Up/i).length).toBeGreaterThan(0);
    expect(screen.getByRole('heading', { name: /إنشاء حساب/i })).toBeTruthy();
  });
});
