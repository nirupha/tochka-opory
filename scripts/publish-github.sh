#!/usr/bin/env bash
# Run from the user's terminal where GitHub network access is available.
set -euo pipefail
cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.."
if [[ -n "$(git status --porcelain)" ]]; then
  echo 'Есть несохранённые изменения. Сначала проверь и закоммить их; публикация остановлена.' >&2
  exit 1
fi
account=$(gh api user --jq .login)
repo="$account/tochka-opory"
if git remote get-url origin >/dev/null 2>&1; then
  origin=$(git remote get-url origin)
  case "$origin" in
    "https://github.com/$repo"|"https://github.com/$repo.git"|"git@github.com:$repo.git") ;;
    *) echo "origin указывает на другой репозиторий. Автоматически менять его не буду: $origin" >&2; exit 1 ;;
  esac
  visibility=$(gh repo view "$repo" --json visibility --jq .visibility)
  if [[ "$visibility" != PRIVATE ]]; then
    echo 'Репозиторий не приватный. Публикация учебных исходников остановлена.' >&2
    exit 1
  fi
  git push -u origin main
else
  # If this name already exists, gh stops; existing contents are never overwritten.
  gh repo create "$repo" --private --description 'Матанализ и линейная алгебра: учебник, практика и подготовка к сессии' --source=. --remote=origin --push
fi
printf '\nРепозиторий: https://github.com/%s\n' "$repo"
printf 'Доступ другу: https://github.com/%s/settings/access\n' "$repo"
