"""Fetch hash-verified first-party source for offline tests, never execute a CLI."""

import hashlib
import io
import tarfile
from pathlib import Path
from urllib.request import urlopen

root = Path(__file__).resolve().parents[1] / ".agent/review-test-deps"
root.mkdir(parents=True, exist_ok=True)
parser_url = "https://raw.githubusercontent.com/anthropics/claude-code-action/2dca132ff0e0c4094ce6048b422c6915a071210b/base-action/src/parse-sdk-options.ts"
with urlopen(parser_url, timeout=60) as response:
    parser = response.read()
assert (
    hashlib.sha256(parser).hexdigest()
    == "b42cc8daa1d15fb00321784cec375b1c855bb2e41bf03b37dfd462385f9e5548"
)
with urlopen(
    "https://registry.npmjs.org/@anthropic-ai/claude-agent-sdk/-/claude-agent-sdk-0.3.295.tgz",
    timeout=60,
) as response:
    archive = response.read()
with tarfile.open(fileobj=io.BytesIO(archive), mode="r:gz") as bundle:
    sdk = bundle.extractfile("package/sdk.mjs").read()
assert (
    hashlib.sha256(sdk).hexdigest()
    == "86ba133f4d52e80d03f04cb47f1022d5c8010a7971c7ed937a45a629c0bf2cf0"
)
(root / "parse-sdk-options.ts").write_bytes(parser)
(root / "sdk.mjs").write_bytes(sdk)
print(
    "Verified pinned action parser and SDK 0.3.295 source cached for offline-only tests."
)
