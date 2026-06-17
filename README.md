# AI Status Dashboard

主要AIサービスの公式ステータスをまとめて確認する軽量ダッシュボードです。

## 目的

- ChatGPT / OpenAI API
- Claude / Anthropic API
- Gemini / Google AI Studio
- GitHub / Actions / Pages

などの障害状況を一画面で確認する。

## 最初の構成

- Vite + React
- GitHub Pagesで公開可能
- Statuspage形式の `/api/v2/summary.json` を直接取得
- CORS等でブラウザ取得できないサービスは、後続でGitHub Actions経由の取得に切り替える

## ローカル起動

```bash
npm install
npm run dev
```

## ビルド

```bash
npm run build
```

## GitHub Pages公開

1. GitHubで新規リポジトリを作成
2. このフォルダの中身をpush
3. Settings → Pages → GitHub Actions を選択
4. `.github/workflows/deploy.yml` を追加して公開

## 今後の拡張

- GitHub Actionsで5〜15分ごとに公式ステータスを取得
- `data/status-history.json` に履歴保存
- 稼働率グラフ
- 障害時だけ通知
- Downdetector等のユーザー報告系も参考値として追加
- ローカルLLM稼働確認欄を追加
