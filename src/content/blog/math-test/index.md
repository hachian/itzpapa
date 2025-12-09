---
title: "数式記法のテスト"
pubDate: 2025-08-13
description: "LaTeX記法による数式の表示をテストするための記事です"
heroImage: "./itzpapa4.jpg"
categories:
  - test
tags:
  - math
  - latex
  - katex
  - test
draft: true
---

# 数式記法のテスト

このページでは、LaTeX記法による数式の表示機能を確認します。KaTeXまたはMathJaxを使用した数式レンダリングをテストします。

## 1. インライン数式

#### Syntax

```markdown
円の面積は $A = \pi r^2$ で計算できます。

二次方程式の解の公式は $x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}$ です。

オイラーの等式 $e^{i\pi} + 1 = 0$ は数学で最も美しい式の一つです。
```

#### Output

円の面積は $A = \pi r^2$ で計算できます。

二次方程式の解の公式は $x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}$ です。

オイラーの等式 $e^{i\pi} + 1 = 0$ は数学で最も美しい式の一つです。

## 2. ブロック数式

#### Syntax

```markdown
$$
\int_{-\infty}^{\infty} e^{-x^2} dx = \sqrt{\pi}
$$

$$
\sum_{n=1}^{\infty} \frac{1}{n^2} = \frac{\pi^2}{6}
$$

$$
\lim_{n \to \infty} \left(1 + \frac{1}{n}\right)^n = e
$$
```

#### Output

$$
\int_{-\infty}^{\infty} e^{-x^2} dx = \sqrt{\pi}
$$

$$
\sum_{n=1}^{\infty} \frac{1}{n^2} = \frac{\pi^2}{6}
$$

$$
\lim_{n \to \infty} \left(1 + \frac{1}{n}\right)^n = e
$$

## 3. 分数と根号

#### Syntax

```markdown
$$
\frac{d}{dx}\left(\frac{x^2 + 1}{x^3 - 2x}\right) = \frac{(2x)(x^3 - 2x) - (x^2 + 1)(3x^2 - 2)}{(x^3 - 2x)^2}
$$

$$
\sqrt{x^2 + y^2} = \sqrt[3]{x^3 + y^3 + z^3}
$$

$$
\frac{1}{\sqrt{2\pi\sigma^2}} e^{-\frac{(x-\mu)^2}{2\sigma^2}}
$$
```

#### Output

$$
\frac{d}{dx}\left(\frac{x^2 + 1}{x^3 - 2x}\right) = \frac{(2x)(x^3 - 2x) - (x^2 + 1)(3x^2 - 2)}{(x^3 - 2x)^2}
$$

$$
\sqrt{x^2 + y^2} = \sqrt[3]{x^3 + y^3 + z^3}
$$

$$
\frac{1}{\sqrt{2\pi\sigma^2}} e^{-\frac{(x-\mu)^2}{2\sigma^2}}
$$

## 4. 行列とベクトル

#### Syntax

```markdown
$$
\begin{pmatrix}
a & b \\
c & d
\end{pmatrix}
\begin{pmatrix}
x \\
y
\end{pmatrix}
=
\begin{pmatrix}
ax + by \\
cx + dy
\end{pmatrix}
$$

$$
\begin{bmatrix}
1 & 2 & 3 \\
4 & 5 & 6 \\
7 & 8 & 9
\end{bmatrix}
$$

$$
\vec{v} = \begin{pmatrix} v_1 \\ v_2 \\ \vdots \\ v_n \end{pmatrix}
$$
```

#### Output

$$
\begin{pmatrix}
a & b \\
c & d
\end{pmatrix}
\begin{pmatrix}
x \\
y
\end{pmatrix}
=
\begin{pmatrix}
ax + by \\
cx + dy
\end{pmatrix}
$$

$$
\begin{bmatrix}
1 & 2 & 3 \\
4 & 5 & 6 \\
7 & 8 & 9
\end{bmatrix}
$$

$$
\vec{v} = \begin{pmatrix} v_1 \\ v_2 \\ \vdots \\ v_n \end{pmatrix}
$$

## 5. 総和と積分

#### Syntax

```markdown
$$
\sum_{i=1}^{n} x_i = x_1 + x_2 + \cdots + x_n
$$

$$
\prod_{i=1}^{n} x_i = x_1 \cdot x_2 \cdot \ldots \cdot x_n
$$

$$
\int_0^1 \int_0^1 f(x,y) \, dx \, dy
$$

$$
\oint_C \vec{F} \cdot d\vec{r} = \iint_S (\nabla \times \vec{F}) \cdot d\vec{S}
$$
```

#### Output

$$
\sum_{i=1}^{n} x_i = x_1 + x_2 + \cdots + x_n
$$

$$
\prod_{i=1}^{n} x_i = x_1 \cdot x_2 \cdot \ldots \cdot x_n
$$

$$
\int_0^1 \int_0^1 f(x,y) \, dx \, dy
$$

$$
\oint_C \vec{F} \cdot d\vec{r} = \iint_S (\nabla \times \vec{F}) \cdot d\vec{S}
$$

## 6. ギリシャ文字と特殊記号

#### Syntax

```markdown
$$
\alpha + \beta + \gamma = \delta
$$

$$
\mu \pm \sigma \approx \epsilon
$$

$$
\forall x \in \mathbb{R}, \exists y \in \mathbb{N} : x < y
$$

$$
A \subset B \cup C \cap D
$$

$$
\neg (P \land Q) \equiv (\neg P) \lor (\neg Q)
$$
```

#### Output

$$
\alpha + \beta + \gamma = \delta
$$

$$
\mu \pm \sigma \approx \epsilon
$$

$$
\forall x \in \mathbb{R}, \exists y \in \mathbb{N} : x < y
$$

$$
A \subset B \cup C \cap D
$$

$$
\neg (P \land Q) \equiv (\neg P) \lor (\neg Q)
$$

## 7. 複雑な数式

#### Syntax

```markdown
$$
f(x) = \begin{cases}
x^2 & \text{if } x \geq 0 \\
-x^2 & \text{if } x < 0
\end{cases}
$$

$$
\lim_{x \to 0} \frac{\sin x}{x} = 1
$$

$$
\frac{\partial^2 u}{\partial t^2} = c^2 \left(\frac{\partial^2 u}{\partial x^2} + \frac{\partial^2 u}{\partial y^2}\right)
$$
```

#### Output

$$
f(x) = \begin{cases}
x^2 & \text{if } x \geq 0 \\
-x^2 & \text{if } x < 0
\end{cases}
$$

$$
\lim_{x \to 0} \frac{\sin x}{x} = 1
$$

$$
\frac{\partial^2 u}{\partial t^2} = c^2 \left(\frac{\partial^2 u}{\partial x^2} + \frac{\partial^2 u}{\partial y^2}\right)
$$

## 8. 統計と確率

#### Syntax

```markdown
正規分布の確率密度関数：
$$
f(x|\mu,\sigma^2) = \frac{1}{\sqrt{2\pi\sigma^2}} e^{-\frac{(x-\mu)^2}{2\sigma^2}}
$$

ベイズの定理：
$$
P(A|B) = \frac{P(B|A) \cdot P(A)}{P(B)}
$$

期待値と分散：
$$
E[X] = \sum_{i} x_i P(X = x_i)
$$
$$
\text{Var}(X) = E[X^2] - (E[X])^2
$$
```

#### Output

正規分布の確率密度関数：
$$
f(x|\mu,\sigma^2) = \frac{1}{\sqrt{2\pi\sigma^2}} e^{-\frac{(x-\mu)^2}{2\sigma^2}}
$$

ベイズの定理：
$$
P(A|B) = \frac{P(B|A) \cdot P(A)}{P(B)}
$$

期待値と分散：
$$
E[X] = \sum_{i} x_i P(X = x_i)
$$
$$
\text{Var}(X) = E[X^2] - (E[X])^2
$$

## 9. 化学式

#### Syntax

```markdown
化学反応式：
$$
\ce{2H2 + O2 -> 2H2O}
$$

複雑な化学式：
$$
\ce{Ca^2+ + CO3^2- -> CaCO3 v}
$$

化学平衡：
$$
\ce{N2 + 3H2 <=> 2NH3}
$$
```

#### Output

化学反応式：
$$
\ce{2H2 + O2 -> 2H2O}
$$

複雑な化学式：
$$
\ce{Ca^2+ + CO3^2- -> CaCO3 v}
$$

化学平衡：
$$
\ce{N2 + 3H2 <=> 2NH3}
$$

## 10. アライメント

#### Syntax

```markdown
$$
\begin{align}
a &= b + c \\
&= d + e + f \\
&= g + h \\
&= i
\end{align}
$$

$$
\begin{aligned}
x &= a + b \\
y &= c + d \\
z &= e + f
\end{aligned}
$$
```

#### Output

$$
\begin{align}
a &= b + c \\
&= d + e + f \\
&= g + h \\
&= i
\end{align}
$$

$$
\begin{aligned}
x &= a + b \\
y &= c + d \\
z &= e + f
\end{aligned}
$$

## 11. Callout内の数式

#### Syntax

```markdown
> [!note] 数式の例
> 円周率は無理数です：$\pi = 3.14159\ldots$
> 
> フーリエ変換：
> $$
> F(\omega) = \int_{-\infty}^{\infty} f(t) e^{-i\omega t} dt
> $$

> [!tip] 微分の公式
> 積の微分法：$(fg)' = f'g + fg'$
> 
> 連鎖律：$\frac{d}{dx}f(g(x)) = f'(g(x)) \cdot g'(x)$
```

#### Output

> [!note] 数式の例
> 円周率は無理数です：$\pi = 3.14159\ldots$
> 
> フーリエ変換：
> $$
> F(\omega) = \int_{-\infty}^{\infty} f(t) e^{-i\omega t} dt
> $$

> [!tip] 微分の公式
> 積の微分法：$(fg)' = f'g + fg'$
> 
> 連鎖律：$\frac{d}{dx}f(g(x)) = f'(g(x)) \cdot g'(x)$

## 12. テーブル内の数式

#### Syntax

```markdown
| 関数 | 導関数 | 応用例 |
|------|--------|--------|
| $f(x) = x^2$ | $f'(x) = 2x$ | 放物線 |
| $f(x) = \sin x$ | $f'(x) = \cos x$ | 三角関数 |
| $f(x) = e^x$ | $f'(x) = e^x$ | 指数関数 |
| $f(x) = \ln x$ | $f'(x) = \frac{1}{x}$ | 対数関数 |
```

#### Output

| 関数 | 導関数 | 応用例 |
|------|--------|--------|
| $f(x) = x^2$ | $f'(x) = 2x$ | 放物線 |
| $f(x) = \sin x$ | $f'(x) = \cos x$ | 三角関数 |
| $f(x) = e^x$ | $f'(x) = e^x$ | 指数関数 |
| $f(x) = \ln x$ | $f'(x) = \frac{1}{x}$ | 対数関数 |

## まとめ

数式記法は技術文書や学術論文で不可欠な機能です。この記事では以下の要素をテストしました：

- インライン数式（$...$）
- ブロック数式（$$...$$）
- 分数、根号、指数
- 行列とベクトル
- 総和と積分記号
- ギリシャ文字と特殊記号
- 場合分けや複雑な数式
- 統計・確率の記法
- 化学式
- 数式のアライメント
- Callout内やテーブル内での数式

これらの機能が正しく動作することで、様々な分野の技術文書を効果的に作成できます。