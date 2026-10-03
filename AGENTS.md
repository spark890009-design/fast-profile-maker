# Architecture decisions
- Keep authentication state and user profile loading in shared React hooks so every protected screen uses the same verified account state.
- Store the shop/customer account classification on the existing profile record so it follows the user across devices.
