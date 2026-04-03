---
name: genlayer
description: Authoritative procedures for writing GenLayer intelligent contracts. Covers equivalence principles, storage rules, LLM resilience, and testing strategies.
---

# Write Intelligent Contract

Guidance for writing GenLayer intelligent contracts that pass consensus, handle errors correctly, and survive production.

Always lint with `genvm-lint check` after writing or modifying a contract.

## Contract Skeleton
```python
# { "Depends": "py-genlayer:test" }

from genlayer import *

class MyContract(gl.Contract):
    # Storage fields — typed, persisted on-chain
    owner: Address
    items: TreeMap[str, Item]
    item_order: DynArray[str]

    def __init__(self, param: str):
        self.owner = gl.message.sender_account

    @gl.public.view
    def get_item(self, item_id: str) -> dict:
        return {"id": item_id, "value": self.items[item_id].value}

    @gl.public.write
    def set_item(self, item_id: str, value: str) -> None:
        if gl.message.sender_account != self.owner:
            raise gl.UserError("Only owner")
        self.items[item_id] = Item(value=value)
        self.item_order.append(item_id)
```

## Equivalence Principle — Which One to Use
This is the most critical decision. Pick wrong and consensus will fail or be trivially exploitable.

### Decision Tree
```
Can validators reproduce the exact same normalized output?
├── YES → strict_eq
│         Exact match. Use when outputs are deterministic or can be
│         canonicalized (e.g., JSON with sort_keys=True).
│         Examples: blockchain RPC, stable REST APIs.
│
└── NO  → Write a custom validator function (run_nondet_unsafe)
          You control the full logic: rerun and compare with tolerances,
          derive status, extract stable fields, or evaluate the leader's
          output directly without rerunning — whatever your contract needs.
```

GenLayer also provides `prompt_comparative` and `prompt_non_comparative` as convenience wrappers, but most contracts outgrow them quickly. Start with a custom validator function for full flexibility.

### strict_eq — Deterministic calls only
```python
def fetch_balance(self) -> int:
    def call_rpc():
        res = gl.nondet.web.post(rpc_url, body=payload, headers=headers)
        return json.loads(res.body.decode("utf-8"))["result"]
    return gl.eq_principle.strict_eq(call_rpc)
```

Never use for LLM calls or web pages that change between requests.

### Custom Validator Function (most common)
The default choice for non-deterministic operations. You write the leader function and a validator function with your own comparison logic.

```python
def score_content(self, content: str) -> dict:
    def leader_fn():
        analysis = gl.nondet.exec_prompt(prompt, response_format="json")
        score = _parse_llm_score(analysis)
        return {"score": score, "analysis": str(analysis.get("analysis", ""))}

    def validator_fn(leaders_res: gl.vm.Result) -> bool:
        if not isinstance(leaders_res, gl.vm.Return):
            return _handle_leader_error(leaders_res, leader_fn)

        validator_result = leader_fn()
        leader_score = leaders_res.calldata["score"]
        validator_score = validator_result["score"]

        # Gate check: if either is zero (reject), both must agree
        if (leader_score == 0) != (validator_score == 0):
            return False

        # Tolerance: within 5x/0.5x bounds
        if leader_score > 0 and validator_score > 0:
            ratio = leader_score / validator_score
            if ratio > 5.0 or ratio < 0.2:
                return False

        return True

    return gl.vm.run_nondet_unsafe(leader_fn, validator_fn)
```

## Error Classification
Classify errors so validators know how to compare them. This is critical for consensus on failure paths.

```python
ERROR_EXPECTED  = "[EXPECTED]"   # Business logic (deterministic) — exact match required
ERROR_EXTERNAL  = "[EXTERNAL]"   # External API 4xx (deterministic) — exact match required
ERROR_TRANSIENT = "[TRANSIENT]"  # Network/5xx (non-deterministic) — agree if both transient
ERROR_LLM       = "[LLM_ERROR]"  # LLM misbehavior — always disagree, force rotation
```

### Canonical error handler for validators
```python
def _handle_leader_error(leaders_res, leader_fn) -> bool:
    leader_msg = leaders_res.message if hasattr(leaders_res, 'message') else ''
    try:
        leader_fn()
        return False  # Leader errored, validator succeeded — disagree
    except gl.vm.UserError as e:
        validator_msg = e.message if hasattr(e, 'message') else str(e)
        # Deterministic errors: must match exactly
        if validator_msg.startswith(ERROR_EXPECTED) or validator_msg.startswith(ERROR_EXTERNAL):
            return validator_msg == leader_msg
        # Transient: agree if both hit transient failure
        if validator_msg.startswith(ERROR_TRANSIENT) and leader_msg.startswith(ERROR_TRANSIENT):
            return True
        # LLM or unknown: disagree — forces consensus retry
        return False
    except Exception:
        return False
```

## Storage Rules
### Types — use GenLayer types, not Python builtins
| Python | GenLayer | Notes |
|--------|----------|-------|
| `dict` | `TreeMap[K, V]` | O(log n) lookup, persisted |
| `list` | `DynArray[T]` | Dynamic array, persisted |
| `int` | `u256` / `i256` | Sized integers for on-chain math |
| `float` | use with care | See float guidance below |
| `enum` | `str` | Store `.value`, not the enum itself |

### Floats
- **In nondet blocks**: native floats work, but they're inherently non-deterministic (hardware differences cause rounding variation). Handle this in your validator logic with tolerances or rounding before comparison.
- **In deterministic blocks**: floats are software-emulated — deterministic but slower.

### Dataclasses for complex state
```python
@allow_storage
@dataclass
class Item:
    name: str
    status: str          # Use str, not Enum
    atto_amount: u256    # Atto-scale (value * 10^18) for money
    created_at: str      # ISO format string
    tags: DynArray[str]
```

### Declaration rules
- **Storage fields are class-level type annotations** — NOT assignments in `__init__`. The type annotation declares the storage slot; `__init__` only sets initial values.

## LLM Resilience
LLMs return unpredictable formats. Always defensively parse.

```python
def _parse_llm_score(analysis: dict) -> int:
    """Extract numeric score from LLM response, handling common variations."""
    if not isinstance(analysis, dict):
        raise gl.vm.UserError(f"{ERROR_LLM} Non-dict response: {type(analysis)}")

    # Key aliasing — LLMs use alternate names
    raw = analysis.get("score")
    if raw is None:
        for alt in ("rating", "points", "value", "result"):
            if alt in analysis:
                raw = analysis[alt]
                break

    if raw is None:
        raise gl.vm.UserError(f"{ERROR_LLM} Missing 'score'. Keys: {list(analysis.keys())}")

    # Coerce aggressively — handles int, float, \"3\", \"3.5\", whitespace
    try:
        return max(0, int(round(float(str(raw).strip()))))
    except (ValueError, TypeError):
        raise gl.vm.UserError(f"{ERROR_LLM} Non-numeric score: {raw}")
```

## Anti-Patterns
| Don't | Do Instead | Why |
|-------|-----------|-----|
| `strict_eq()` for LLM calls | Custom validator function | LLM outputs are non-deterministic — strict_eq always fails consensus |
| Store `list` or `dict` | `DynArray[T]` or `TreeMap[K, V]` | Python builtins aren't persistable |
| Use native `float` for money | Atto-scale `u256` (value * 10^18) | Standard across blockchains for cross-chain interop |
| Insert fields in the middle of a dataclass | Append at END only (for upgradable contracts) | Storage layout is positional — insertion shifts all subsequent fields |
