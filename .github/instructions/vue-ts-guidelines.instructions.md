---
applyTo: '**'
---

# Copilot Instructions for a Modern Vue 3 + TypeScript Project

## 🧠 General Guidelines

- Use the **Composition API** and `<script setup lang="ts">` syntax in `.vue` files.
- Always write **strongly typed** TypeScript.
- Avoid the use of `any`; prefer generics or `unknown`.
- Use **Pinia** for global state management.
- Use **Vue Router 4** for routing.
- Use **scoped styles** if styles are specific to a component.
- Use **auto-imported composables** and helpers when possible (e.g., `useXyz()`).
- Write **small and focused components** (ideally under 300 lines).
