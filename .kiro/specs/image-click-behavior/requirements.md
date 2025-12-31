# Requirements Document

## Introduction

本仕様は、itzpapaブログサイトにおける画像クリック時の動作機能を定義します。ブログ記事内に含まれる画像をクリックした際に、ユーザーが画像を拡大表示で確認できるライトボックス機能を実装します。Obsidianからのコンテンツ移行を前提とし、既存のMarkdown記法との互換性を維持します。

## Project Description (Input)
画像をクリックしたときの動作を追加。

## Requirements

### Requirement 1: 画像クリックによるライトボックス表示
**Objective:** ブログ閲覧者として、記事内の画像をクリックして拡大表示したい。詳細な画像内容を確認できるようにするため。

#### Acceptance Criteria
1. When ユーザーがブログ記事内の画像をクリックする, the Image Viewer shall 画像をフルスクリーンオーバーレイで拡大表示する
2. When ライトボックスが表示されている状態でオーバーレイ背景をクリックする, the Image Viewer shall ライトボックスを閉じて元の記事表示に戻る
3. When ライトボックスが表示されている状態でEscapeキーを押下する, the Image Viewer shall ライトボックスを閉じて元の記事表示に戻る
4. While ライトボックスが表示されている, the Image Viewer shall 背景をオーバーレイで暗くして画像に焦点を当てる
5. The Image Viewer shall 画像のalt属性テキストをキャプションとして表示する

### Requirement 2: 閉じるボタンによる操作
**Objective:** ブログ閲覧者として、明確な閉じるボタンでライトボックスを閉じたい。操作方法が直感的に分かるようにするため。

#### Acceptance Criteria
1. While ライトボックスが表示されている, the Image Viewer shall 閉じるボタン（×アイコン）を右上に表示する
2. When ユーザーが閉じるボタンをクリックする, the Image Viewer shall ライトボックスを閉じる

### Requirement 3: ダークモード対応
**Objective:** サイト管理者として、既存のダークモード設定と統合したい。サイト全体のデザイン一貫性を維持するため。

#### Acceptance Criteria
1. While サイトがダークモードで表示されている, the Image Viewer shall ダークモードに適したスタイルでライトボックスを表示する
2. While サイトがライトモードで表示されている, the Image Viewer shall ライトモードに適したスタイルでライトボックスを表示する

### Requirement 4: アクセシビリティ対応
**Objective:** すべてのユーザーとして、キーボード操作でも画像ビューアーを使用したい。アクセシブルな体験を提供するため。

#### Acceptance Criteria
1. When ライトボックスが開く, the Image Viewer shall フォーカスをライトボックス内に移動する
2. When ライトボックスが閉じる, the Image Viewer shall フォーカスを元のクリックした画像に戻す
3. The Image Viewer shall スクリーンリーダー向けのaria-label属性を適切に設定する

### Requirement 5: レスポンシブ対応
**Objective:** モバイルユーザーとして、スマートフォンでも快適に画像を拡大表示したい。デバイスに関わらず機能を利用できるようにするため。

#### Acceptance Criteria
1. While モバイルデバイスで表示されている, the Image Viewer shall 画面サイズに応じて画像サイズを適切に調整する
2. When タッチデバイスで画像をタップする, the Image Viewer shall ライトボックスを表示する
