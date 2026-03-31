#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SITE_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
REPO_ROOT="$(cd "${SITE_DIR}/.." && pwd)"

SOURCE_ROOT="${REPO_ROOT}/AI_ML"
DOCS_ROOT="${SITE_DIR}/docs"

if ! command -v quarto >/dev/null 2>&1; then
  echo "Quarto CLI is required. Install from https://quarto.org/docs/get-started/"
  exit 1
fi

sanitize_for_mdx() {
  local file_path="$1"
  python3 - <<'PY' "${file_path}"
import sys
from pathlib import Path

path = Path(sys.argv[1])
text = path.read_text(encoding="utf-8")
lines = text.splitlines(keepends=True)

in_fence = False
sanitized = []
for line in lines:
    stripped = line.lstrip()
    if stripped.startswith("```"):
        in_fence = not in_fence
        sanitized.append(line)
        continue

    if in_fence:
        sanitized.append(line)
        continue

    # Escape braces so MDX does not treat prose/math snippets as JS expressions.
    line = line.replace("{", r"\{").replace("}", r"\}")
    sanitized.append(line)

path.write_text("".join(sanitized), encoding="utf-8")
PY
}

if [[ ! -d "${SOURCE_ROOT}" ]]; then
  echo "Notebook source directory not found: ${SOURCE_ROOT}"
  exit 1
fi

echo "Rendering notebooks from ${SOURCE_ROOT} to ${DOCS_ROOT}"

# Collect notebook paths first, then iterate from a here-string.
# This avoids process-substitution edge cases that can block indefinitely.
notebook_list="$(
  python3 - <<'PY' "${SOURCE_ROOT}"
import sys
from pathlib import Path

root = Path(sys.argv[1])
for path in sorted(root.rglob("*.ipynb")):
    print(path)
PY
)"

if [[ -z "${notebook_list}" ]]; then
  echo "No notebooks found under ${SOURCE_ROOT}"
  exit 0
fi

notebooks_found=0
while IFS= read -r notebook; do
  [[ -z "${notebook}" ]] && continue
  notebooks_found=1
  rel_path="${notebook#${SOURCE_ROOT}/}"
  rel_dir="$(dirname "${rel_path}")"
  base_name="$(basename "${notebook}" .ipynb)"
  out_dir="${DOCS_ROOT}/AI_ML/${rel_dir}"
  temp_dir="$(mktemp -d)"

  mkdir -p "${out_dir}"

  cp "${notebook}" "${temp_dir}/${base_name}.ipynb"

  echo "Rendering: AI_ML/${rel_dir}/${base_name}.ipynb"

  (
    cd "${temp_dir}"
    quarto render "${base_name}.ipynb" \
      --to docusaurus-md \
      --no-execute \
      --output "${base_name}.md"
  )

  sanitize_for_mdx "${temp_dir}/${base_name}.md"

  mv "${temp_dir}/${base_name}.md" "${out_dir}/${base_name}.md"

  if [[ -d "${temp_dir}/${base_name}_files" ]]; then
    rm -rf "${out_dir}/${base_name}_files"
    mv "${temp_dir}/${base_name}_files" "${out_dir}/${base_name}_files"
  fi

  rm -rf "${temp_dir}"

  echo "Rendered: AI_ML/${rel_dir}/${base_name}.md"
done <<< "${notebook_list}"

if [[ "${notebooks_found}" -eq 0 ]]; then
  echo "No notebooks found under ${SOURCE_ROOT}"
  exit 0
fi

echo "Notebook render complete."
