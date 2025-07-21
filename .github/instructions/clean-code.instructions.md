---
applyTo: '**'
---

# The Essence of _Clean Code_

## Clean Code

- Clean code matters because bad code destroys productivity.
- Clean code is readable, elegant, simple, tested, and shows that the author cares.
- Definitions by Stroustrup, Booch, Jeffries, etc.: Clean code is clear, minimal, and unsurprising.
- Programmers must fight for code quality as much as managers fight for deadlines.
- Readability is key: Code is read more than it is written.
- Refactor continuously to keep the codebase clean.

## Meaningful Names

- Names should reveal intent, be pronounceable, consistent, and avoid disinformation.
- Class names: noun phrases. Method names: verb phrases.
- Longer names for larger scopes.
- Don’t hesitate to globally rename poor names.

## Functions

- Functions should be small and do one thing.
- Each line should be one level below the abstraction.
- Avoid deep nesting and long parameter lists.
- Use descriptive names and eliminate side-effects.
- Minimize duplication and refactor frequently.

## Comments

- Comments are for when code fails to express intent.
- Good comments: legal, informative, intent-explaining, TODOs, public API docs.
- Bad comments: redundant, misleading, obsolete, commented-out code, banners.
- Prefer expressive code over explaining comments.

## Formatting

- Use consistent formatting; it's about communication.
- Keep files < 200 lines; structure like a newspaper article.
- Use blank lines wisely. Keep related code close.
- Follow horizontal and vertical spacing guidelines.
- Use team-wide formatting tools.

## Objects and Data Structures

- Choose carefully what to expose or encapsulate.
- Law of Demeter: Call only methods on self, parameters, or newly created objects.

## Error Handling

- Use exceptions, not return codes.
- Try-catch blocks should act as transactions.
- Provide context, intent, and detail in exceptions.
- Avoid `null`; use null objects or throw exceptions instead.

## Boundaries

- Isolate third-party libraries.
- Don’t spread unstable or flexible types across your code.
- Write learning tests for external APIs.

## Unit Tests

- Tests should accompany the code and be automated.
- Follow the TDD cycle strictly.
- Refactor both tests and code constantly.
- F.I.R.S.T.: Fast, Independent, Repeatable, Self-validating, Timely.

## Classes

- Follow SRP: one reason to change.
- Public → Protected → Private order.
- Keep classes small and cohesive.
- DIP: Depend on abstractions, not concrete implementations.

## Systems

- Separate concerns: Use factories and dependency injection.
- Handle cross-cutting concerns with AOP.
- Prefer POJOs and tech-free designs.
- Use DSLs for clearer, modifiable business logic.

## Emergence

- Simple Design rules (Kent Beck):
  1. All tests pass.
  2. No duplication.
  3. Clear intent.
  4. Minimal classes/methods.
- Refactor relentlessly.

## Concurrency

- Keep concurrency logic separate.
- Prefer immutability, message passing, and limited sharing.
- Know threading models, avoid deadlocks, and test with variations.
- Get single-threaded code working first.

## Successive Refinement

- Design example: `Args` class for argument parsing.
- Evolution from a monolith to clean design.
- Refactoring guided by TDD.
- Continuous refinement prevents long-term decay.
