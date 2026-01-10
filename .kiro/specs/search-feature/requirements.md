# Requirements Document

## Introduction
itzpapaブログサイトに検索機能を実装する。ユーザーが検索クエリを入力すると、ブログ記事の本文から部分一致で検索を行い、ヒットした箇所のコンテキストを表示する。ユーザーは検索結果をクリックして該当記事の該当箇所に直接ジャンプできる。複数のヒットがある場合はそれぞれ個別に表示し、結果が多数の場合はページネーションで分割表示する。

## Requirements

### Requirement 1: 検索ページの提供
**Objective:** As a 訪問者, I want 検索専用のページにアクセスできる, so that ブログ記事を検索できる

#### Acceptance Criteria
1. The Search Page shall `/search/` パスでアクセス可能な検索ページを提供する
2. The Search Page shall 検索クエリを入力するためのテキスト入力フィールドを表示する
3. The Search Page shall サイトのヘッダー、フッター、パンくずナビゲーションを含む標準的なレイアウトで表示する
4. The Search Page shall レスポンシブデザインでモバイル・デスクトップ両方で適切に表示する

### Requirement 2: 部分一致検索の実行
**Objective:** As a 訪問者, I want 検索語句で記事を検索できる, so that 目的の情報を見つけられる

#### Acceptance Criteria
1. When ユーザーが検索クエリを入力して検索を実行した時, the Search System shall ブログ記事の本文に対して部分一致検索を行う
2. The Search System shall 大文字・小文字を区別しない検索を行う
3. When 検索クエリが空の場合, the Search System shall 検索を実行せず、検索クエリの入力を促すメッセージを表示する
4. The Search System shall 公開済み記事（draft: true でない記事）のみを検索対象とする

### Requirement 3: 検索結果のコンテキスト表示
**Objective:** As a 訪問者, I want 検索結果でヒットした箇所のコンテキストを確認できる, so that クリック前に内容を判断できる

#### Acceptance Criteria
1. When 検索がヒットした時, the Search System shall ヒット箇所を含む周辺テキスト（コンテキスト）を表示する
2. The Search System shall コンテキスト内の検索語句をハイライト表示する
3. When 1つの記事内に複数のヒットがある場合, the Search System shall それぞれのヒット箇所を個別の検索結果アイテムとして表示する
4. The Search System shall 各検索結果アイテムに記事タイトルを表示する

### Requirement 4: 検索結果から該当箇所へのナビゲーション
**Objective:** As a 訪問者, I want 検索結果をクリックして該当箇所に直接ジャンプしたい, so that 素早く目的の情報にアクセスできる

#### Acceptance Criteria
1. When ユーザーが検索結果アイテムをクリックした時, the Search System shall 該当記事ページに遷移する
2. When 遷移後, the Search System shall ヒットした箇所までページをスクロールする
3. The Search System shall 遷移後のページでヒット箇所を視覚的に識別可能にする

### Requirement 5: 検索結果のページネーション
**Objective:** As a 訪問者, I want 検索結果が多数の場合にページ分割で閲覧したい, so that 結果を整理して確認できる

#### Acceptance Criteria
1. When 検索結果が設定された件数を超える場合, the Search System shall 結果をページ分割して表示する
2. The Search System shall ブログ一覧と同様のページネーションUIを提供する
3. The Search System shall 現在のページ番号と総ページ数を表示する
4. The Search System shall 前後のページへ移動するナビゲーションを提供する
5. The Search System shall ページ移動時も検索クエリを維持する

### Requirement 6: 検索結果なしの処理
**Objective:** As a 訪問者, I want 検索結果がない場合に適切なフィードバックを得たい, so that 状況を理解できる

#### Acceptance Criteria
1. If 検索結果が0件の場合, the Search System shall 「検索結果が見つかりませんでした」のようなメッセージを表示する
2. If 検索結果が0件の場合, the Search System shall 検索クエリを変更して再検索できる状態を維持する
