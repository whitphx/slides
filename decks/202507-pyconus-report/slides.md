---
theme: ../../themes/alpha
title: "登壇しなくてもPyCon US楽しめたよ: SummitとSprintの話 @ PyCon US 2025 参加報告会"
drawings:
  persist: false
mdc: true
defaults:
  transition: slide-left
transition: fade-out
addons:
  - anipres
  - fancy-arrow
---

<h1 text="5xl/20">
登壇しなくてもPyCon US楽しめたよ: SummitとSprintの話
</h1>

PyCon US 2025 参加報告会

---

<h1 text-4xl>Yuichiro Tachibana</h1>

@whitphx

<div absolute top-40 right-40>
<img src="https://avatars.githubusercontent.com/u/3135397?v=4" alt="whitphx" w="130px">
</div>

<div mt-8>
Software Artisan / Indie Dev / OSS Enthusiast
</div>

<div mt-4>

<v-clicks>

- ML Developer Advocate at <span v-mark.underline.yellow="1">Hugging Face</span> 🤗
- <span v-mark.underline.red="2">Streamlit</span> Creator

</v-clicks>

</div>

<div my-10 w-min flex="~ gap-1" items-center justify-center v-click>
  <div i-ri-user-3-line op50 ma text-2xl />
  <div><a href="https://whitphx.info/" target="_blank" class="border-none! font-300">whitphx.info</a></div>
  <div i-ri-github-line op50 ma text-2xl ml4/>
  <div><a href="https://github.com/whitphx" target="_blank" class="border-none! font-300">whitphx</a></div>
  <div i-ri-linkedin-line op50 ma text-2xl ml4/>
  <div><a href="https://www.linkedin.com/in/whitphx/" target="_blank" class="border-none! font-300">whitphx</a></div>
  <div i-ri-twitter-x-line op50 ma text-2xl ml4/>
  <div><a href="https://twitter.com/whitphx" target="_blank" class="border-none! font-300">whitphx</a></div>
</div>

---

# PyCon US 2025 に初めて参加しました

- 当初は「せっかくアメリカまで行くからには、登壇できる機会を伺おう」と思っていましたが、 \
  それだとずっと行けないなと思い直して決心しました。
- それでもやることが盛り沢山で楽しめました。

---

# PyCon US でやったこと

<div grid="~ cols-3" gap-2 text-sm pt-4>

<div border="~ sky/50 rounded-lg" from-sky:10 to-indigo:10 bg-gradient-to-br>
  <div flex gap-2 items-center bg-sky:10 px4 py2 rounded text-md>
    <span grow>
      Day1 (Thurs., May 15th)
    </span>
    <sup text-sky-500 bg-sky:15 my2 rounded text-md>Tutorials</sup>
  </div>

<div ml2 p2>

- <span v-mark.circle.red="1">WebAssembly Summit</span>
- Sponsor/Community Booths
- Anaconda Party

</div>
</div>

<div border="~ sky/50 rounded-lg" from-sky:10 to-indigo:10 bg-gradient-to-br>
  <div flex gap-2 items-center bg-sky:10 px4 py2 rounded text-md>
    <span grow>
      Day2 (Fri., May 16th)
    </span>
    <sup text-sky-500 bg-sky:15 my2 rounded text-md>Main conference</sup>
  </div>

<div ml2 p2>

- Breakfast
- Talks
- Sponsor/Community Booths
- Lunch
- Duolingo Party

</div>
</div>

<div border="~ sky/50 rounded-lg" from-sky:10 to-indigo:10 bg-gradient-to-br>
  <div flex gap-2 items-center bg-sky:10 px4 py2 rounded text-md>
    <span grow>
      Day3 (Sat., May 17th)
    </span>
    <sup text-sky-500 bg-sky:15 my2 rounded text-md>Main conference</sup>
  </div>

<div ml2 p2>

- Breakfast
- Talks
- Sponsor/Community Booths
- Lunch
- PyLadies Auction

</div>
</div>

<div border="~ sky/50 rounded-lg" from-sky:10 to-indigo:10 bg-gradient-to-br>
  <div flex gap-2 items-center bg-sky:10 px4 py2 rounded text-md>
    <span grow>
      Day4 (Sun., May 18th)
    </span>
    <sup text-sky-500 bg-sky:15 my2 rounded text-md>Main conference</sup>
  </div>

<div ml2 p2>

- Breakfast
- Talks
- Lunch
- PAO Open Space
- PAO Party

</div>
</div>

<div border="~ sky/50 rounded-lg" from-sky:10 to-indigo:10 bg-gradient-to-br>
  <div flex gap-2 items-center bg-sky:10 px4 py2 rounded text-md>
    <span grow>
      Day5 (Mon., May 19th)
    </span>
    <sup text-sky-500 bg-sky:15 my2 rounded text-md>Sprints</sup>
  </div>

<div ml2 p2>

- <span v-mark.circle.red="1">Sprint</span>
- Lunch
- Drinking Party

</div>
</div>

<div border="~ sky/50 rounded-lg" from-sky:10 to-indigo:10 bg-gradient-to-br>
  <div flex gap-2 items-center bg-sky:10 px4 py2 rounded text-md>
    <span grow>
      Day6 (Tues., May 20th)
    </span>
  </div>

<div ml2 p2>

- Driving to Chicago

</div>
</div>

</div>

<style>
  h3 {
    @apply text-base;
  }
</style>

---

# WebAssembly Summit

<img src="/PXL_20250515_131951533.jpg" alt="Summit day">

---

# Summit

- Summitというタイプのイベント
- メイン日程（トークなど）の前に開催
  - チュートリアルなどと同じ期間
- カンファレンス本体でやるには若干ニッチだけど重要なテーマに関して、 \
  興味ある人が集まって発表や議論を行う

---
clicks: 1
---

<a href="https://us.pycon.org/2025/" target="_blank" rel="noopener noreferrer">
<img v-if="$clicks === 0" src="/PyConUS2025_screenshot_event.png" alt="Screenshot of the events menu of PyCon US 2025">
<img v-if="$clicks !== 0" src="/PyConUS2025_screenshot_event_wasm_focus.png" alt="Screenshot of the events menu of PyCon US 2025">
</a>

---

# こんなものを作っているので…

<img src="/stlite-hero.png" alt="stlite hero image" h="85%" m="auto">

<div v-click="1" absolute top-105 left-100 text-5xl transform rotate-60>👉</div>
<div v-click="1" absolute top-116 left-100 text-2xl v-mark.circle.red="1" opacity-0>_______________________</div>

<div text-base flex justify-center>
<a href="https://github.com/whitphx/stlite" target="_blank" rel="noopener noreferrer">https://github.com/whitphx/stlite</a>
</div>

---

<a href="https://us.pycon.org/2025/events/webassembly-summit/" target="_blank" rel="noopener noreferrer">
<img src="/PyConUS2025_screenshot_wasm_summit.png" alt="Screenshot of the WebAssembly Summit page">
</a>

<div v-click absolute top-83 left-44.5 text-2xl v-mark.circle.red="1" opacity-0>_____________</div>

---

# WebAssembly Summitに出てみた

<v-clicks>

- 正直ビビってた…けどせっかくUSまで行くなら後悔しないように
- みんな優しい
- 自分のプロジェクトで困っていることを相談できた
  - Summitでは場違いだったかもしれないが…
- 自分の分野（WebML）に興味のある人と繋がれた
- Wasm Python 関連の話題といっても、レイヤが幅広かった
- そのときのスライド↓ \
  https://slides.whitphx.info/202505-pyconus-wasm-summit/

</v-clicks>

---

# Sprint

<img src="https://gihyo.jp/assets/images/article/2025/06/pycon-us-2025-03/019.png" alt="Sprint day" h-95>

<small text-xs opacity-80>
引用: <a href="https://gihyo.jp/article/2025/06/pycon-us-2025-03#gh3Cv4MSFz" target="_blank" rel="noopener noreferrer">PyCon US 2025参加レポート (gihyo.jp)</a>
</small>

---

# Sprintとは

<div flex="~ row" gap-4>

<div>

- もくもく会みたいなもの
- メイン日程の後に開催
- テーマごとに部屋・テーブルに集まってコードを書く
- テーマごとに有識者（スプリントリーダー）がいて、 \
  案内をしたり相談や議論に乗ってくれる
- 自分のPCだけ持っていけばOK
- https://us.pycon.org/2025/events/dev-sprints/

</div>

<div w="25%">

<img src="https://gihyo.jp/assets/images/article/2025/06/pycon-us-2025-03/018.png" alt="Sprint table" h="90%">

<small text-xs opacity-80>
引用: <a href="https://gihyo.jp/article/2025/06/pycon-us-2025-03#gh3Cv4MSFz" target="_blank" rel="noopener noreferrer">PyCon US 2025参加レポート (gihyo.jp)</a>
</small>

</div>

</div>

---

# "First-time CPython Contributions" に参加してみた

- 初めて[CPython](https://github.com/python/cpython/)にコントリビュートしようという人たちのためのテーブル
- CPythonメンテナの人たちがその場にいる！
- こういう機会は PyCon US と EuroPython くらい？

---
clicks: 3
---

<SlidevAnipres id="sprint-intro" excalidraw-like-font />

---

# ドキュメントが充実

- [What to expect at PyCon US sprints](https://pycon.blogspot.com/2025/04/pyconus-sprints.html)
  - スプリントの概要や注意点などが書かれている
  - スプリント前に読んでくるのが望ましいかも
- [Python Developer’s Guide](https://devguide.python.org/)
  - 書いてある通りにセットアップして手元でCPythonがビルドできた

---

<SlidevAnipres id="sprint-intro" excalidraw-like-font :offset="3" />

---

# Issueを探す

`easy` label で検索...

<img src="/github_cpython_easy_label.png" alt="GitHub search for CPython issues with the 'easy' label">

---

# 空いているissueが見つからない

<img src="/github_cpython_easy_label_list.png" alt="GitHub search for CPython issues with the 'easy' label" w="100%">

<svg v-click absolute top-0 left-0 width="100%" height="100%">
  <rect x="765" y="100" width="100" height="450" stroke="red" stroke-width="5" fill="none" rx="20" ry="20" />
</svg>

---

# `easy` label 以外も見てみる…
- <span flex items-center>Open issueで7000件以上ある <span inline-block> <img src="/github_cpython_issue_num.png" alt="GitHub search for CPython issues with the 'easy' label" h-10> </span></span>
- `easy` が付いている issue は、（ `docs` を除けば） `topic-repl` が多い気がするな
- `topic-repl` で検索してみるか

---

# これとかどうだろう

<a href="https://github.com/python/cpython/issues/127960" target="_blank" rel="noopener noreferrer">
<img src="/github_target_issue.png" alt="GitHub issue" w="100%">
</a>

---

# 再現するぞ

<div>
手元でビルドした最新のrevisionで再現する
</div>

<div v-click>
→（少し問題のアタリをつけてから）やりますと宣言

<img src="/github_issue_my_comment.png" alt="My comment on the GitHub issue" w="100%">
</div>

---

# 直してみる

```diff
diff --git a/Lib/_pyrepl/main.py b/Lib/_pyrepl/main.py
index a6f824dcc4a..71f60790d6b 100644
--- a/Lib/_pyrepl/main.py
+++ b/Lib/_pyrepl/main.py
@@ -35,6 +35,7 @@ def interactive_console(mainmodule=None, quiet=False, pythonstartup=False):
         import __main__
         namespace = __main__.__dict__
         namespace.pop("__pyrepl_interactive_console", None)
+        namespace.pop("__module__", None)

     # sys._baserepl() above does this internally, we do it here
     startup_path = os.getenv("PYTHONSTARTUP")
```

<div v-click>
Issueの指摘事項は直ってるけど…
</div>

<div v-click>
こんなのでいいのか？🤔
場当たり的すぎん？
</div>

---

# より一貫性のある実装を模索…

<v-click>

```diff {*|23-24|54-62|*}{maxHeight:'70%'}
diff --git a/Lib/_pyrepl/main.py b/Lib/_pyrepl/main.py
index a6f824dcc4..447eb1e551 100644
--- a/Lib/_pyrepl/main.py
+++ b/Lib/_pyrepl/main.py
@@ -1,6 +1,7 @@
 import errno
 import os
 import sys
+import types


 CAN_USE_PYREPL: bool
@@ -29,12 +30,10 @@ def interactive_console(mainmodule=None, quiet=False, pythonstartup=False):
             print(FAIL_REASON, file=sys.stderr)
         return sys._baserepl()

-    if mainmodule:
-        namespace = mainmodule.__dict__
-    else:
-        import __main__
-        namespace = __main__.__dict__
-        namespace.pop("__pyrepl_interactive_console", None)
+    if not mainmodule:
+        mainmodule = types.ModuleType("__main__")
+
+    namespace = mainmodule.__dict__

     # sys._baserepl() above does this internally, we do it here
     startup_path = os.getenv("PYTHONSTARTUP")
diff --git a/Modules/main.c b/Modules/main.c
index 2be194bdad..5996f461d3 100644
--- a/Modules/main.c
+++ b/Modules/main.c
@@ -269,13 +269,14 @@ pymain_run_command(wchar_t *command)


 static int
-pymain_start_pyrepl_no_main(void)
+pymain_start_pyrepl(void)
 {
     int res = 0;
     PyObject *console = NULL;
     PyObject *empty_tuple = NULL;
     PyObject *kwargs = NULL;
     PyObject *console_result = NULL;
+    PyObject *main_module = NULL;

     PyObject *pyrepl = PyImport_ImportModule("_pyrepl.main");
     if (pyrepl == NULL) {
@@ -299,7 +300,16 @@ pymain_start_pyrepl_no_main(void)
         res = pymain_exit_err_print();
         goto done;
     }
+    main_module = PyImport_AddModuleRef("__main__");
+    if (main_module == NULL) {
+        res = pymain_exit_err_print();
+        goto done;
+    }
     if (!PyDict_SetItemString(kwargs, "pythonstartup", _PyLong_GetOne())) {
+        if (PyDict_SetItemString(kwargs, "mainmodule", main_module) < 0) {
+            res = pymain_exit_err_print();
+            goto done;
+        }
         console_result = PyObject_Call(console, empty_tuple, kwargs);
         if (console_result == NULL) {
             res = pymain_exit_err_print();
@@ -311,6 +321,7 @@ pymain_start_pyrepl_no_main(void)
     Py_XDECREF(empty_tuple);
     Py_XDECREF(console);
     Py_XDECREF(pyrepl);
+    Py_XDECREF(main_module);
     return res;
 }

@@ -595,7 +606,7 @@ pymain_repl(PyConfig *config, int *exitcode)
         *exitcode = (run != 0);
         return;
     }
-    int run = pymain_start_pyrepl_no_main();
+    int run = pymain_start_pyrepl();
     *exitcode = (run != 0);
     return;
 }
```

</v-click>

<v-clicks text-base at="2">

- 今までやってない手法だし
- Cのコードにまで手を出しているし
- そもそも量が多いし

</v-clicks>

---

<SlidevAnipres id="ask-pablo" excalidraw-like-font />

---

<div flex="~ row" justify-center items-center gap-4 mt-8>

<div inline-flex flex="~ col" justify-center items-center>
<img src="https://avatars.githubusercontent.com/u/11718525?v=4" alt="Pablo Galindo Salgado" w="100px">
Pablo
</div>

<div grow>

<v-clicks depth="2">

- エッジケース寄りのissueなので、あまり頑張っても労力に見合った成果にはならないかもしれない
  - 現状を仕様としてしまってもよい
- 実装を頑張るならそれも良し。 \
  実装方針は支持できるし、レビューするのも問題ない

</v-clicks>

</div>

</div>


<div v-click flex="~ row" justify-center items-center gap-4 mt-8>

<div inline-flex flex="~ col" justify-center items-center>
<img src="https://avatars.githubusercontent.com/u/3135397?v=4" alt="whitphx" w="100px">
whitphx
</div>

<div grow>
とりあえず頑張ってみよう

（ダメなら過程をコメントに残して撤退しよう）
</div>

</div>

---

# もくもく…

<img src="/github_whitphx_day1_late_commits.png" alt="whitphx's late commits" w="100%">

---

<div mt-8>

テストが落ちるな🤔

仕様としてテストで保証してある挙動を変えちゃったみたいだな…

</div>

<div v-click flex="~ row" justify-center items-center gap-4 mt-8>

<div inline-flex flex="~ col" justify-center items-center>
<img src="https://avatars.githubusercontent.com/u/55281?v=4" alt="Łukasz Langa" w="100px">
Łukasz
</div>

<div grow>
そのテスト消した
</div>

</div>

<div v-click mt-8>
<a href="https://github.com/python/cpython/pull/134275/commits/2e21fb58926504c7049ae3e791636929d369271a" target="_blank" rel="noopener noreferrer">
<img src="/github_lukas_deleted_test.png" alt="Łukasz deleted test" w="100%">
<!-- <img src="/github_lukas_deleted_test_detail.png" alt="Łukasz deleted test" w="100%"> -->
</a>
</div>

---

<div flex="~ row" justify-center items-center gap-4 mt-8>

<div inline-flex flex="~ col" justify-center items-center>
<img src="https://avatars.githubusercontent.com/u/3135397?v=4" alt="whitphx" w="100px">
whitphx
</div>

<div grow>
そもそもこのデザイン変更どう思う？
</div>

</div>


<div v-click flex="~ row" justify-center items-center gap-4 mt-8>

<div inline-flex flex="~ col" justify-center items-center>
<img src="https://avatars.githubusercontent.com/u/55281?v=4" alt="Łukasz Langa" w="100px">
Łukasz
</div>

<div grow>
いいと思う
</div>

</div>

<div v-click mt-8>
<a href="https://github.com/python/cpython/issues/127960#issuecomment-2898928699" target="_blank" rel="noopener noreferrer">
<img src="/github_whitphx_question.png" alt="whitphx asked a question" w="100%">
</a>
</div>

---

<div flex="~ row" justify-center items-center gap-4 mt-8>

<div inline-flex flex="~ col" justify-center items-center>
<img src="https://avatars.githubusercontent.com/u/8739637?v=4" alt="Tomas R." w="100px">
Tomas
</div>

<div grow>
この機能にも影響あるから見たほうがいいよ
</div>

</div>

<div v-click mt-8>
<a href="https://github.com/python/cpython/pull/134275#issuecomment-2898549965" target="_blank" rel="noopener noreferrer">
<img src="/github_tomas_discussion.png" alt="Tomas pointed out a good point" w="100%">
</a>
</div>

---

# 修正…

<img src="/github_last_commits.png" alt="whitphx's last commits in the PR" w="100%">

---

# マージされた！

<img src="/github_merged.png" alt="Tomas merged the PR" w="100%">

---

# Sprint の感想

<v-clicks>

- コントリビュートしたコードがマージされた。嬉しい！
  - Python 3.13からの新しいREPLの一部に自分のコードが入った \
    （自分のコードがリリースに含まれるのは3.14から）
- CPythonへの初貢献を手助けしてくれる場がある
  - コア開発者の人たちに気兼ねなくすぐ相談できる
- コア開発者の人たちが親切
  - なんなら向こうから議論に入ってきてくれた
- 今はAIがあるので、飛び込むハードルは下がっているかも
  - e.g. コードを読まずにAIに聞いてプロジェクトの構造を把握

</v-clicks>

---

# まとめ

- PyCon USはコンテンツがたくさんあって楽しめました
- この発表ではSummitとSprintについてだけ紹介しました
  - この2つだけでもかなり密度が高かったです
