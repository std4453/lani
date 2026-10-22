"""先安装稳定依赖，显式约束 Torch 本地版本，应用安装不得替换它。"""
import subprocess
import sys
import tempfile
import tomllib
from pathlib import Path

project = tomllib.loads(Path('pyproject.toml').read_text())['project']
mode = sys.argv[1]
pip = [sys.executable, '-m', 'pip', 'install']
if mode == 'lexical':
    subprocess.run([*pip, *project['dependencies']], check=True)
elif mode in ('cpu', 'cu126'):
    requirement = next(x for x in project['optional-dependencies']['semantic'] if x.startswith('torch=='))
    requirement += '+' + mode
    subprocess.run([*pip, requirement, '--index-url', f'https://download.pytorch.org/whl/{mode}'], check=True)
    with tempfile.TemporaryDirectory() as directory:
        constraint = Path(directory) / 'torch.txt'
        constraint.write_text(requirement + '\n')
        subprocess.run([*pip, '-c', str(constraint), *project['optional-dependencies']['semantic']], check=True)
    subprocess.run([sys.executable, "-m", "pip", "download", "--no-deps", "--no-binary=:all:",
                    "--dest", "/usr/share/licenses/lani-anime-matcher/sources", "pykakasi==2.3.0"], check=True)
    import torch
    assert torch.__version__ == requirement.split('==')[1], 'Unexpected Torch variant'
    assert (torch.version.cuda == '12.6') if mode == 'cu126' else torch.version.cuda is None
else:
    raise ValueError('Unsupported dependency variant')
