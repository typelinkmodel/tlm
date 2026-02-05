# 000 - Shared Patterns Reference

This document contains templates and boilerplate code that specs can reference to avoid repetition.

## Spec Template

Standard template for new specification documents:

```markdown
# XXX - Feature Name

**Purpose:** One-line description of what this does and why

**Requirements:**
- Key functional requirement 1
- Key functional requirement 2
- Important constraints or non-functional requirements

**Design Approach:**
- High-level design decision 1
- High-level design decision 2
- Key technical choices and rationale

**Implementation Notes:**
- Critical implementation details only
- Dependencies or special considerations
- Integration points with existing code
```

## Code Patterns

### TypeScript Package Structure

Packages in `packages/tlm-*/`:

```
package/
├── src/          # Source code
├── test/         # Tests (*.test.ts)
├── lib/          # Compiled output (generated)
└── package.json
```

### Test Structure

```typescript
describe("featureName", () => {
  it("should handle input correctly", () => {
    expect(feature("input")).toBe("expected");
  });
});
```

### Rust Module Structure

Located in `packages/tlm-rust/`:

```rust
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_feature() {
        assert_eq!(feature("input"), "expected");
    }
}
```
