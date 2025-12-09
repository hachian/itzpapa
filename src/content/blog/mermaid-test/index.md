---
title: "Mermaidダイアグラムのテスト"
pubDate: 2025-08-12
description: "Mermaidによる各種ダイアグラムの表示をテストするための記事です"
heroImage: "./itzpapa5.jpg"
categories:
  - test
tags:
  - mermaid
  - diagram
  - flowchart
  - test
draft: true
---

# Mermaidダイアグラムのテスト

このページでは、Mermaidによる各種ダイアグラムの表示機能を確認します。フローチャート、シーケンス図、ガントチャートなど様々な図表をテストします。

## 1. フローチャート

#### Syntax

````markdown
```mermaid
flowchart TD
    A[開始] --> B{条件分岐}
    B -->|Yes| C[処理1]
    B -->|No| D[処理2]
    C --> E[結果1]
    D --> E
    E --> F[終了]
```
````

#### Output

```mermaid
flowchart TD
    A[開始] --> B{条件分岐}
    B -->|Yes| C[処理1]
    B -->|No| D[処理2]
    C --> E[結果1]
    D --> E
    E --> F[終了]
```

## 2. シーケンス図

#### Syntax

````markdown
```mermaid
sequenceDiagram
    participant A as ユーザー
    participant B as Webサーバー
    participant C as データベース
    
    A->>B: リクエスト送信
    B->>C: データクエリ
    C-->>B: データ返却
    B-->>A: レスポンス返却
    
    Note over A,C: 通信完了
```
````

#### Output

```mermaid
sequenceDiagram
    participant A as ユーザー
    participant B as Webサーバー
    participant C as データベース
    
    A->>B: リクエスト送信
    B->>C: データクエリ
    C-->>B: データ返却
    B-->>A: レスポンス返却
    
    Note over A,C: 通信完了
```

## 3. ガントチャート

#### Syntax

````markdown
```mermaid
gantt
    title プロジェクトスケジュール
    dateFormat  YYYY-MM-DD
    section 開発フェーズ
    設計         :design, 2025-01-01, 2025-01-15
    実装         :impl, after design, 30d
    テスト       :test, after impl, 15d
    section リリース
    リリース準備  :release, after test, 10d
    本番リリース  :prod, after release, 1d
```
````

#### Output

```mermaid
gantt
    title プロジェクトスケジュール
    dateFormat  YYYY-MM-DD
    section 開発フェーズ
    設計         :design, 2025-01-01, 2025-01-15
    実装         :impl, after design, 30d
    テスト       :test, after impl, 15d
    section リリース
    リリース準備  :release, after test, 10d
    本番リリース  :prod, after release, 1d
```

## 4. クラス図

#### Syntax

````markdown
```mermaid
classDiagram
    class User {
        +String name
        +String email
        +login()
        +logout()
    }
    
    class Post {
        +String title
        +String content
        +Date publishDate
        +publish()
        +edit()
    }
    
    class Comment {
        +String content
        +Date createdAt
        +create()
        +delete()
    }
    
    User ||--o{ Post : creates
    Post ||--o{ Comment : has
    User ||--o{ Comment : writes
```
````

#### Output

```mermaid
classDiagram
    class User {
        +String name
        +String email
        +login()
        +logout()
    }
    
    class Post {
        +String title
        +String content
        +Date publishDate
        +publish()
        +edit()
    }
    
    class Comment {
        +String content
        +Date createdAt
        +create()
        +delete()
    }
    
    User ||--o{ Post : creates
    Post ||--o{ Comment : has
    User ||--o{ Comment : writes
```

## 5. ER図

#### Syntax

````markdown
```mermaid
erDiagram
    CUSTOMER {
        int customer_id PK
        string name
        string email
        date created_at
    }
    
    ORDER {
        int order_id PK
        int customer_id FK
        date order_date
        decimal total_amount
    }
    
    PRODUCT {
        int product_id PK
        string name
        decimal price
        int stock
    }
    
    ORDER_ITEM {
        int order_id FK
        int product_id FK
        int quantity
        decimal price
    }
    
    CUSTOMER ||--o{ ORDER : places
    ORDER ||--o{ ORDER_ITEM : contains
    PRODUCT ||--o{ ORDER_ITEM : ordered
```
````

#### Output

```mermaid
erDiagram
    CUSTOMER {
        int customer_id PK
        string name
        string email
        date created_at
    }
    
    ORDER {
        int order_id PK
        int customer_id FK
        date order_date
        decimal total_amount
    }
    
    PRODUCT {
        int product_id PK
        string name
        decimal price
        int stock
    }
    
    ORDER_ITEM {
        int order_id FK
        int product_id FK
        int quantity
        decimal price
    }
    
    CUSTOMER ||--o{ ORDER : places
    ORDER ||--o{ ORDER_ITEM : contains
    PRODUCT ||--o{ ORDER_ITEM : ordered
```

## 6. 状態遷移図

#### Syntax

````markdown
```mermaid
stateDiagram-v2
    [*] --> 待機中
    待機中 --> 処理中 : 開始
    処理中 --> 完了 : 成功
    処理中 --> エラー : 失敗
    エラー --> 待機中 : リトライ
    完了 --> [*]
    エラー --> [*] : 終了
    
    state 処理中 {
        [*] --> 初期化
        初期化 --> 実行中
        実行中 --> 検証中
        検証中 --> [*]
    }
```
````

#### Output

```mermaid
stateDiagram-v2
    [*] --> 待機中
    待機中 --> 処理中 : 開始
    処理中 --> 完了 : 成功
    処理中 --> エラー : 失敗
    エラー --> 待機中 : リトライ
    完了 --> [*]
    エラー --> [*] : 終了
    
    state 処理中 {
        [*] --> 初期化
        初期化 --> 実行中
        実行中 --> 検証中
        検証中 --> [*]
    }
```

## 7. パイチャート

#### Syntax

````markdown
```mermaid
pie title ブラウザシェア
    "Chrome" : 65
    "Safari" : 20
    "Firefox" : 10
    "Edge" : 3
    "その他" : 2
```
````

#### Output

```mermaid
pie title ブラウザシェア
    "Chrome" : 65
    "Safari" : 20
    "Firefox" : 10
    "Edge" : 3
    "その他" : 2
```

## 8. Git図

#### Syntax

````markdown
```mermaid
gitgraph
    commit id: "初期コミット"
    branch feature
    checkout feature
    commit id: "機能A実装"
    commit id: "バグ修正"
    checkout main
    commit id: "ホットフィックス"
    merge feature
    commit id: "リリース v1.0"
    branch bugfix
    checkout bugfix
    commit id: "緊急修正"
    checkout main
    merge bugfix
    commit id: "v1.0.1"
```
````

#### Output

```mermaid
gitgraph
    commit id: "初期コミット"
    branch feature
    checkout feature
    commit id: "機能A実装"
    commit id: "バグ修正"
    checkout main
    commit id: "ホットフィックス"
    merge feature
    commit id: "リリース v1.0"
    branch bugfix
    checkout bugfix
    commit id: "緊急修正"
    checkout main
    merge bugfix
    commit id: "v1.0.1"
```

## 9. ユーザージャーニー

#### Syntax

````markdown
```mermaid
journey
    title ユーザーの購買体験
    section 発見
        商品検索: 5: ユーザー
        商品閲覧: 4: ユーザー
        レビュー確認: 3: ユーザー
    section 購入
        カート追加: 4: ユーザー
        決済情報入力: 2: ユーザー
        注文確定: 5: ユーザー
    section 受取
        配送確認: 4: ユーザー
        商品受取: 5: ユーザー
        満足度評価: 4: ユーザー
```
````

#### Output

```mermaid
journey
    title ユーザーの購買体験
    section 発見
        商品検索: 5: ユーザー
        商品閲覧: 4: ユーザー
        レビュー確認: 3: ユーザー
    section 購入
        カート追加: 4: ユーザー
        決済情報入力: 2: ユーザー
        注文確定: 5: ユーザー
    section 受取
        配送確認: 4: ユーザー
        商品受取: 5: ユーザー
        満足度評価: 4: ユーザー
```

## 10. マインドマップ

#### Syntax

````markdown
```mermaid
mindmap
  root((Webアプリ開発))
    Frontend
      HTML
      CSS
      JavaScript
        React
        Vue
        Angular
    Backend
      Node.js
        Express
        Fastify
      Python
        Django
        Flask
      Database
        MySQL
        PostgreSQL
        MongoDB
    Infrastructure
      Cloud
        AWS
        Azure
        GCP
      CI/CD
        GitHub Actions
        GitLab CI
```
````

#### Output

```mermaid
mindmap
  root((Webアプリ開発))
    Frontend
      HTML
      CSS
      JavaScript
        React
        Vue
        Angular
    Backend
      Node.js
        Express
        Fastify
      Python
        Django
        Flask
      Database
        MySQL
        PostgreSQL
        MongoDB
    Infrastructure
      Cloud
        AWS
        Azure
        GCP
      CI/CD
        GitHub Actions
        GitLab CI
```

## 11. Callout内のMermaid図

#### Syntax

````markdown
> [!note] システム構成図
> 以下は基本的なWebアプリケーションの構成です：
> 
> ```mermaid
> flowchart LR
>     A[ユーザー] --> B[ロードバランサー]
>     B --> C[Webサーバー1]
>     B --> D[Webサーバー2]
>     C --> E[データベース]
>     D --> E
> ```

> [!tip] 開発プロセス
> アジャイル開発のスプリント計画：
> 
> ```mermaid
> gantt
>     title スプリント1
>     dateFormat  YYYY-MM-DD
>     section 計画
>     バックログ整理   :2025-01-01, 2d
>     見積もり         :2025-01-03, 1d
>     section 開発
>     実装           :2025-01-04, 7d
>     テスト         :2025-01-11, 3d
> ```
````

#### Output

> [!note] システム構成図
> 以下は基本的なWebアプリケーションの構成です：
> 
> ```mermaid
> flowchart LR
>     A[ユーザー] --> B[ロードバランサー]
>     B --> C[Webサーバー1]
>     B --> D[Webサーバー2]
>     C --> E[データベース]
>     D --> E
> ```

> [!tip] 開発プロセス
> アジャイル開発のスプリント計画：
> 
> ```mermaid
> gantt
>     title スプリント1
>     dateFormat  YYYY-MM-DD
>     section 計画
>     バックログ整理   :2025-01-01, 2d
>     見積もり         :2025-01-03, 1d
>     section 開発
>     実装           :2025-01-04, 7d
>     テスト         :2025-01-11, 3d
> ```

## 12. 複雑なフローチャート

#### Syntax

````markdown
```mermaid
flowchart TD
    Start([開始]) --> Input[ユーザー入力]
    Input --> Validate{入力検証}
    Validate -->|Valid| Process[データ処理]
    Validate -->|Invalid| Error[エラー表示]
    Error --> Input
    
    Process --> Save{保存処理}
    Save -->|Success| Notify[成功通知]
    Save -->|Failed| Retry{リトライ?}
    
    Retry -->|Yes| Process
    Retry -->|No| ErrorLog[エラーログ記録]
    ErrorLog --> End([終了])
    
    Notify --> Cleanup[クリーンアップ]
    Cleanup --> End
    
    style Start fill:#90EE90
    style End fill:#FFB6C1
    style Error fill:#FFA07A
    style ErrorLog fill:#FFA07A
```
````

#### Output

```mermaid
flowchart TD
    Start([開始]) --> Input[ユーザー入力]
    Input --> Validate{入力検証}
    Validate -->|Valid| Process[データ処理]
    Validate -->|Invalid| Error[エラー表示]
    Error --> Input
    
    Process --> Save{保存処理}
    Save -->|Success| Notify[成功通知]
    Save -->|Failed| Retry{リトライ?}
    
    Retry -->|Yes| Process
    Retry -->|No| ErrorLog[エラーログ記録]
    ErrorLog --> End([終了])
    
    Notify --> Cleanup[クリーンアップ]
    Cleanup --> End
    
    style Start fill:#90EE90
    style End fill:#FFB6C1
    style Error fill:#FFA07A
    style ErrorLog fill:#FFA07A
```

## まとめ

Mermaidダイアグラムは、様々な図表を簡単にMarkdownで記述できる強力なツールです。この記事では以下のダイアグラムタイプをテストしました：

- **フローチャート**: プロセスフローの可視化
- **シーケンス図**: システム間の相互作用
- **ガントチャート**: プロジェクトスケジュール
- **クラス図**: オブジェクト指向設計
- **ER図**: データベース設計
- **状態遷移図**: システムの状態変化
- **パイチャート**: データの割合表示
- **Git図**: バージョン管理の可視化
- **ユーザージャーニー**: ユーザー体験の可視化
- **マインドマップ**: アイデアの階層構造

これらの機能により、技術文書やプレゼンテーション資料を効果的に作成できます。