"""显式下载固定版本模型；推理过程不访问网络。"""

import argparse
import hashlib
import json
import os
import tempfile
import urllib.request
from pathlib import Path

ASSETS = Path(__file__).parent / "assets"
MANIFEST = json.loads((ASSETS / "models.json").read_text())


def model_root(value=None):
    return Path(
        value
        or os.environ.get(
            "LANI_MATCHER_MODEL_DIR", Path.home() / ".cache/lani-anime-matcher/models"
        )
    )


def digest(path):
    with path.open("rb") as stream:
        return hashlib.file_digest(stream, "sha256").hexdigest()


def verify(directory, name):
    root = model_root(directory) / name
    for file, info in MANIFEST[name]["files"].items():
        path = root / file
        if not path.is_file() or digest(path) != info["sha256"]:
            raise RuntimeError("模型文件缺失或校验失败，请运行 lani-anime-models")
    if "manifestAsset" in MANIFEST[name]:
        path = root / MANIFEST[name]["manifestFile"]
        if not path.is_file() or digest(path) != MANIFEST[name]["manifestSha256"]:
            raise RuntimeError("模型清单缺失或校验失败，请运行 lani-anime-models")
    return root


def main():
    parser = argparse.ArgumentParser(
        description="Download pinned inference models with SHA256 verification"
    )
    parser.add_argument("--model-dir")
    parser.add_argument("--verify-only", action="store_true")
    parser.add_argument("--model", action="append", choices=sorted(MANIFEST),
                        help="Download only named models; may be repeated")
    args = parser.parse_args()
    root = model_root(args.model_dir)
    default_models = ["e5-base", "qwen-0.6b"] if "qwen-0.6b" in MANIFEST else list(MANIFEST)
    for name in args.model or default_models:
        model = MANIFEST[name]
        if args.verify_only:
            verify(root, name)
            print(f"Verified {name}")
            continue
        target = root / name
        target.mkdir(parents=True, exist_ok=True)
        for file, info in model["files"].items():
            path = target / file
            if path.is_file() and digest(path) == info["sha256"]:
                continue
            tmp = None
            try:
                with tempfile.NamedTemporaryFile(dir=target, delete=False) as out:
                    tmp = Path(out.name)
                    with urllib.request.urlopen(info["url"], timeout=120) as response:
                        while chunk := response.read(1024 * 1024):
                            out.write(chunk)
                if digest(tmp) != info["sha256"]:
                    raise RuntimeError("Downloaded model checksum mismatch")
                tmp.replace(path)
            finally:
                if tmp is not None:
                    tmp.unlink(missing_ok=True)
        if "manifestAsset" in model:
            content = (ASSETS / model["manifestAsset"]).read_bytes()
            if hashlib.sha256(content).hexdigest() != model["manifestSha256"]:
                raise RuntimeError("Packaged model manifest checksum mismatch")
            with tempfile.NamedTemporaryFile(dir=target, delete=False) as out:
                tmp = Path(out.name)
                out.write(content)
            try:
                tmp.replace(target / model["manifestFile"])
            finally:
                tmp.unlink(missing_ok=True)
        verify(root, name)
        print(f"Verified {name}")


if __name__ == "__main__":
    main()
