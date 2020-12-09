![GaifaaYeepun](https://user-images.githubusercontent.com/42882840/80269234-b4ad1c80-86e8-11ea-8a02-567b854170d5.png)

![deploy gaifaa](https://github.com/jocv-thai/pleethai/workflows/deploy%20gaifaa/badge.svg)

日本語 | [English](./docs/en/README.md) | [ภาษาไทย](./docs/th/README.md)

# 概要
Djangoによる、日本語、タイ語、英語の単語、例文辞書サイトプロジェクトです。
(タイ人、日本人向け)

# 必要要件
## 運用サーバ

* Webサーバ (Windows Server+IISなど)(本番環境用)
* Python (3.6.7推奨)
* Git

## クライアント

* PC / スマートフォンなど


# インストール
- 本番環境用 (**To Be Determined**)
- [開発環境用](./docs/ja/install_develop.md)


# 使い方 (システムのユーザ向け)
メインページの単語・例文検索画面で、調べたい単語(または例文)を入力して検索する。
また、知りたい単語(または例文)がシステムに登録されていない場合は、リクエスト画面からシステム管理者に通知を送ることが出来る。


## 各画面の詳細

- [単語・例文検索画面](./docs/ja/howtouse_search.md)  
[<img src ="https://user-images.githubusercontent.com/42882840/101600410-96f5b300-3a3e-11eb-946c-67aa101f1ddb.gif" alt="search demo" width="320">](./docs/ja/howtouse_search.md)

- [リクエスト画面](./docs/ja/howtouse_request.md)  
[<img src ="https://user-images.githubusercontent.com/42882840/101600726-0f5c7400-3a3f-11eb-8bad-3a91b21d8d55.png" alt="request demo" width="320">](./docs/ja/howtouse_request.md)


# メンテナンス手順
- システムの更新
  - 本リポジトリから最新ファイルを取得し、Webサーバを再起動する。
- [単語・例文追加、変更](./docs/ja/maintenance_dataedit.md)
- [単語・例文リクエスト受領時の対応](./docs/ja/maintenance_reqreceived.md)


# システム構成
- システム構成図  
![システム構成図](https://docs.google.com/drawings/d/e/2PACX-1vSLFh_yZhKKi0L7hnfksXXx2Rjc6bimx0RjocQRpwrI5KxMZSzmARUx9lNiZXjq-8R6oSboAkMqkxgV/pub?w=2024&h=996)

- [DB構成](./docs/ja/database.md)
