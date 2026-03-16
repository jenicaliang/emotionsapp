#!/usr/bin/env bash
# Convert "saved_model (3.15)" to TensorFlow.js and write to public/web_model.
# Run from repo root. Requires: pip install --user tensorflowjs (and tensorflow).
# If the converter is not on PATH, use: python3 -m tensorflowjs_converter ...

set -e
REPO_ROOT="$(cd "$(dirname "$0")" && pwd)"
SAVED_MODEL_DIR="$REPO_ROOT/saved_model (3.15)"
OUTPUT_DIR="$REPO_ROOT/public/web_model"

if [[ ! -d "$SAVED_MODEL_DIR" ]]; then
  echo "Error: SavedModel directory not found: $SAVED_MODEL_DIR"
  exit 1
fi

echo "Removing old public/web_model..."
rm -rf "$OUTPUT_DIR"

# Converter chokes on paths with spaces; use a temp copy if needed
CONVERT_INPUT="$SAVED_MODEL_DIR"
TEMP_DIR=""
if [[ "$SAVED_MODEL_DIR" = *" "* ]]; then
  TEMP_DIR="$REPO_ROOT/saved_model_tfjs_temp"
  rm -rf "$TEMP_DIR"
  cp -R "$SAVED_MODEL_DIR" "$TEMP_DIR"
  CONVERT_INPUT="$TEMP_DIR"
  echo "Using temp copy (no spaces): $TEMP_DIR"
fi
trap 'rm -rf "$TEMP_DIR"' EXIT

echo "Converting SavedModel -> TensorFlow.js..."
if command -v tensorflowjs_converter &>/dev/null; then
  tensorflowjs_converter \
    --input_format=tf_saved_model \
    --output_format=tfjs_graph_model \
    --saved_model_tags=serve \
    --signature_name=serving_default \
    "$CONVERT_INPUT" \
    "$OUTPUT_DIR"
elif python3 -c "import tensorflowjs_converter" 2>/dev/null; then
  python3 -m tensorflowjs_converter \
    --input_format=tf_saved_model \
    --output_format=tfjs_graph_model \
    --saved_model_tags=serve \
    --signature_name=serving_default \
    "$CONVERT_INPUT" \
    "$OUTPUT_DIR"
else
  # Try user Python 3.9 bin (e.g. after: pip3 install --user tensorflowjs)
  if [[ -x "$HOME/Library/Python/3.9/bin/tensorflowjs_converter" ]]; then
    "$HOME/Library/Python/3.9/bin/tensorflowjs_converter" \
      --input_format=tf_saved_model \
      --output_format=tfjs_graph_model \
      --saved_model_tags=serve \
      --signature_name=serving_default \
      "$CONVERT_INPUT" \
      "$OUTPUT_DIR"
  else
    echo "Error: tensorflowjs_converter not found. Install with:"
    echo "  pip3 install --user tensorflowjs"
    exit 1
  fi
fi

echo "Done. Output: $OUTPUT_DIR"
ls -la "$OUTPUT_DIR"
