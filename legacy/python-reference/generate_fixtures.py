"""Generate golden JSON fixtures from the current Python engine.

One-shot oracle generator. Captures v0.1.0 behaviour of `Calculo_Salario_IRPF.py`
for a representative cross-section of (bruto, año) pairs. The TypeScript port
(Phase 1) must match these fixtures exactly.

Run from repo root:

    python3 legacy/python-reference/generate_fixtures.py

Output: ``test/fixtures/golden_YYYY.json`` for every year in 2012-2026.

Implementation note: the source script runs its full Excel build at module
level (no ``if __name__ == "__main__":`` guard). To avoid that minutes-long
side effect, we exec only the section before "6. EJECUCIÓN MAESTRA", giving
us the function definitions without triggering the master loop.
"""
from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent.parent
SCRIPT_PATH = Path(__file__).resolve().parent / "Calculo_Salario_IRPF.py"
FIXTURES_DIR = ROOT / "test" / "fixtures"
SECTION_6_MARKER = "# 6. EJECUCIÓN MAESTRA"


def load_engine_namespace() -> dict[str, object]:
    """Exec the script up to (but excluding) section 6 and return the namespace."""
    source = SCRIPT_PATH.read_text(encoding="utf-8")
    if SECTION_6_MARKER not in source:
        raise RuntimeError(
            f"Marker {SECTION_6_MARKER!r} not found in {SCRIPT_PATH}; "
            "the script structure may have changed."
        )
    defs_only = source.split(SECTION_6_MARKER, 1)[0]
    namespace: dict[str, object] = {}
    exec(compile(defs_only, str(SCRIPT_PATH), "exec"), namespace)
    return namespace


def representative_brutos(base_max: float) -> list[int]:
    """Ten integer brutos covering edges and key bracket transitions.

    Includes int(base_max) so the SS-ceiling boundary is exercised per year
    (Solidaridad applies only above this for años 2025+).
    """
    brutos = [0, 12000, 16000, 18000, 21000, 30000, 45000, 60000, int(base_max), 100000]
    return sorted(set(brutos))


def main() -> None:
    engine = load_engine_namespace()
    obtener_parametros = engine["obtener_parametros"]
    procesar_ano = engine["procesar_ano"]

    FIXTURES_DIR.mkdir(parents=True, exist_ok=True)

    for anio in range(2012, 2027):
        params = obtener_parametros(anio)
        brutos = representative_brutos(params["base_max"])
        df = procesar_ano(anio)

        rows = []
        for bruto in brutos:
            mask = df["Salario Bruto"] == bruto
            if not mask.any():
                raise RuntimeError(f"bruto={bruto} not found in df for año {anio}")
            row = df.loc[mask.idxmax()]
            rows.append({k: (v.item() if hasattr(v, "item") else v) for k, v in row.items()})

        out = FIXTURES_DIR / f"golden_{anio}.json"
        out.write_text(
            json.dumps({"anio": anio, "rows": rows}, indent=2, ensure_ascii=False),
            encoding="utf-8",
        )
        print(f"Wrote {out.relative_to(ROOT)}  ({len(rows)} rows)")


if __name__ == "__main__":
    main()
