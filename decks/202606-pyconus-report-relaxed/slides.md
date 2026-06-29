---
theme: ../../themes/triangle
title: "肩肘張らずに楽しむPyCon US"
drawings:
  persist: false
mdc: true
themeConfig:
  primary: '#36709E'
defaults:
  transition: slide-left
transition: fade-out
---

<h1 text-5xl leading-16>
肩肘張らずに楽しむPyCon US
<br>
<small text-2xl op80>Enjoying PyCon US, the relaxed way</small>
</h1>

<div mt-12 text-xl op80>
Yuichiro Tachibana (橘 祐一郎) · @whitphx
</div>

<div absolute bottom-8 right-10 text-sm op60>
PyCon US 2026 参加報告会
</div>

<!-- どうも、橘です。今日は「肩肘張らずに楽しむPyCon US」というタイトルで、今年ロングビーチで開催されたPyCon USにゆるっと参加してきた話をします。発表者でもなく、ブース出展でもなく、ただの一参加者として行ってきました。そういう参加の仕方でも全然楽しめたよ、っていうのを共有できればと思います。5分なのでサクッといきます。 -->

---

<h1 text-4xl>Yuichiro Tachibana / 橘 祐一郎</h1>

@whitphx

<div absolute top-40 right-40>
<img src="https://avatars.githubusercontent.com/u/3135397?v=4" alt="whitphx" w="130px">
</div>

<div mt-8>
Software Artisan / Indie Dev / OSS Enthusiast
</div>

<div mt-4>

<v-clicks>

- 学術専門職員 <small op70>(Research Software Engineer)</small><br>@ 東大先端研 <small op70>(UTokyo RCAST)</small>
- Streamlit Creator🎈
- 🐍 旅行がてら各地のPyConに行きます <small op70>(JP / APAC / Euro / TW / DE / FR / LT ...)</small>

</v-clicks>

</div>

<div my-10 w-min flex="~ gap-1" items-center justify-center v-click>
  <div i-ri-user-3-line op50 ma text-2xl />
  <div><a href="https://whitphx.info/" target="_blank" class="border-none! font-300">whitphx.info</a></div>
  <div i-ri-github-line op50 ma text-2xl ml4/>
  <div><a href="https://github.com/whitphx" target="_blank" class="border-none! font-300">whitphx</a></div>
  <div i-ri-linkedin-line op50 ma text-2xl ml4/>
  <div><a href="https://www.linkedin.com/in/whitphx" target="_blank" class="border-none! font-300">whitphx</a></div>
  <div i-ri-twitter-x-line op50 ma text-2xl ml4/>
  <div><a href="https://twitter.com/whitphx" target="_blank" class="border-none! font-300">whitphx</a></div>
</div>

<!-- 簡単に自己紹介を。橘祐一郎、whitphxです。今は東大先端研、東京大学の先端科学技術研究センターで、リサーチソフトウェアエンジニアとして働いてます。あと普段からOSSを作ったりしてます。で、ここで大事なのは一番下、海外のPyConにちょこちょこ顔を出してるってことです。JP、APAC、ヨーロッパ、台湾、ドイツ、フランス、リトアニア…と、まあいろいろ行ってます。なので今日は、その経験からゆるい参加の楽しみ方を話します。 -->

---
layout: section
---

# 今年のスタンス
<div text-xl op70 mt-2>This year: no pressure</div>

---

# ただの一参加者
<div text-xl op70 mt-1>Just another attendee — no pressure</div>

<div mt-8 text-xl>

<v-clicks>

- 発表者でもない / ブース出展でもない / 仕事でもない
- 単純に「去年が楽しかった」+「ロングビーチに行ってみたかった」だけ

</v-clicks>

</div>

<!-- まず今年のスタンスから。今年の僕は、発表者でもないし、ブース出展もしてないし、仕事で行ったわけでもないんですね。じゃあなんで行ったかっていうと、単純に去年のPyCon USが楽しかったのと、ロングビーチに行ってみたかったから、それだけです。実は昔は「トークが採択されたら行く」って自分ルールにしてたんですよ。飛行機もホテルも高いから、行くからには目立ちたいなって。でもPyCon USって採択の競争率がめちゃくちゃ高くて、それを待ってるといつまで経っても行けない。なので去年からは、もう普通の参加者として行こうって割り切りました。 -->

---

# 特に気張らずに行った
<div text-xl op70 mt-1>What I deliberately skipped</div>

<div mt-10 grid="~ cols-3" gap-4 text-center>

<div v-click="1" border="~ red/40 rounded-xl" p-5 bg-red:5>
<div text-4xl>🎤</div>
<div mt-2 font-bold>トークなし</div>
<div text-sm op70 mt-1>No talk</div>
</div>

<div v-click="2" border="~ red/40 rounded-xl" p-5 bg-red:5>
<div text-4xl>🧗</div>
<div mt-2 font-bold>Summitも出ない</div>
<div text-sm op70 mt-1>No Summit</div>
</div>

<div v-click="3" border="~ red/40 rounded-xl" p-5 bg-red:5>
<div text-4xl>🪑</div>
<div mt-2 font-bold>Sprintもゆっくり</div>
<div text-sm op70 mt-1>No full-on Sprint</div>
</div>

</div>

<div v-click="3" mt-10 text-xl text-center op80>

[去年の報告会](https://pyconjp.blogspot.com/2025/06/pyconus2025.html)は[Summit と Sprint を頑張った話](https://slides.whitphx.info/202507-pyconus-report/)だったけど…<br>
今年は何も気張らずに行ってみた

</div>

<!-- しかも今年は、あえて「やらないこと」を決めて行きました。トークはしない。去年はWebAssembly Summitっていうイベントに気合い入れて出たんですけど、今年はそれもなし。Sprintっていう開発合宿みたいなのには参加したんですが、去年みたいにCPythonのOSSテーブルにガッツリ入る、みたいなこともしませんでした。去年のこの報告会、まさにSummitとSprント頑張った話をしたんですけど、今年はその真逆で、特に気張るイベントを作らずに行ってみた、という感じです。で、結論から言うと、それでも十分楽しかったんですよ。 -->

---

# じゃあ何してたの？
<div text-xl op70 mt-1>So what did I actually do?</div>

<div mt-8 grid="~ cols-2" gap-8 items-center>

<div grid="~ cols-2" gap-3 text-center>
  <div v-click="1" border="~ gray/30 rounded-xl" p-3 bg-gray:5>
    <div text-3xl>🎧</div>
    <div mt-1 font-bold text-base>普通にセッション巡り</div>
    <div text-xs op50 mt-0.5>Talks, keynotes & lightning talks</div>
  </div>
  <div v-click="2" border="~ gray/30 rounded-xl" p-3 bg-gray:5>
    <div text-3xl>🏢</div>
    <div mt-1 font-bold text-base>ブース巡り</div>
    <div text-xs op50 mt-0.5>Visit the booths</div>
  </div>
  <div v-click="3" border="~ cyan/50 rounded-xl" p-3 bg-cyan:10>
    <div text-3xl>👋</div>
    <div mt-1 font-bold text-base>歩いてると誰かに会う</div>
    <div text-xs op50 mt-0.5>Bump into people just walking around</div>
  </div>
  <div v-click="4" border="~ gray/30 rounded-xl" p-3 bg-gray:5>
    <div text-3xl>🍻</div>
    <div mt-1 font-bold text-base>イベントで盛り上がる</div>
    <div text-xs op50 mt-0.5>Parties, meetups & social events</div>
  </div>
</div>

<div v-click="1">
<img src="/photos/streamlit-booth.jpg" alt="Streamlitブース" rounded-lg w-full>
<div text-sm op60 text-center mt-1>知り合いの多いStreamlitブースに遊びに行った</div>
</div>

</div>

<!-- じゃあ何して過ごしてたのって話なんですけど、想像通りですね。セッション聞いて、キーノートやライトニングトーク眺めて、ブース回って。ごく普通です。でもこれが意外と楽しい。何がいいって、会場をただ歩いてるだけで知り合いにバッタリ会うんですよ。あと、ブースとか飲み会で初対面の人ともワイワイなる。写真は知り合いの多いStreamlitのブースですね。こういう「人とのゆるい接点」がたくさんある。 -->

---

# パーティーが楽しい
<div text-xl op70 mt-1>The parties are where it happens</div>

<div mt-6 grid="~ cols-3" gap-4>
  <div v-click="1" border="~ gray/25 rounded-xl" overflow-hidden bg-gray:5>
    <img src="/photos/beer-bar.jpg" alt="前夜のビアバー" w-full h-40 object-cover>
    <div p-3>
      <div font-bold>前夜のバー</div>
      <div text-xs op50 mt-0.5>The night before</div>
    </div>
  </div>
  <div v-click="2" border="~ gray/25 rounded-xl" overflow-hidden bg-gray:5>
    <img src="/photos/beer-unofficial.jpg" alt="非公式ビール飲み会" w-full h-40 object-cover>
    <div p-3>
      <div font-bold>Python Asia の飲み会</div>
      <div text-xs op50 mt-0.5>Python Asia meetup</div>
    </div>
  </div>
  <div v-click="3" border="~ gray/25 rounded-xl" overflow-hidden bg-gray:5>
    <img src="/photos/sponsor-party.jpg" alt="スポンサーパーティー" w-full h-40 object-cover>
    <div p-3>
      <div font-bold>スポンサーパーティー</div>
      <div text-xs op50 mt-0.5>Sponsor party</div>
    </div>
  </div>
</div>

<div v-click="4" mt-6 text-center border="~ orange/40 rounded-lg" p-3 bg-orange:5>
<div text-xl>「また別の国のPyConで会いましょう！」</div>
<div text-sm op60 mt-1>"See you at another country's PyCon!"</div>
</div>

<!-- で、個人的に一番楽しいのが飲み会とかパーティーですね。前夜に会場近くのバーで日本から来た人たちと飲んでたら、PyCon USのバッジ付けた初対面の人と自然に相席になったり。Python Asiaが音頭とった飲み会に行ったら、アジア各地から来た人が集まってて、「また別の国のPyConで会おうね」って話になる。これが本当にそうで、別のPyConに行くとまた会うんですよ。そうやってどんどん知り合いの輪が広がっていく。準備なんて要らなくて、同じイベントに来てる時点で話は弾みます。 -->

---

# 会場を抜け出す日があってもいい
<div text-xl op70 mt-1>It's OK to step out</div>

<div mt-6 grid="~ cols-2" gap-6>
  <div v-click="1" border="~ gray/25 rounded-xl" overflow-hidden bg-gray:5>
    <img src="/photos/queen-mary.jpg" alt="クイーンメアリー号" w-full h-48 object-cover>
    <div p-3>
      <div font-bold>Sprint中に抜け出して観光</div>
      <div text-xs op50 mt-0.5>Sneaking out during the sprint</div>
    </div>
  </div>
  <div v-click="2" border="~ gray/25 rounded-xl" overflow-hidden bg-gray:5>
    <img src="/photos/long-beach.jpg" alt="ロングビーチの砂浜" w-full h-48 object-cover>
    <div p-3>
      <div font-bold>海岸を散歩</div>
      <div text-xs op50 mt-0.5>A walk along the shore</div>
    </div>
  </div>
</div>

<div v-click="3" mt-6 text-center border="~ red/40 rounded-lg" p-3 bg-red:5>
<div text-xl>ホテル代・参加費の元を取ろうと気負いすぎない</div>
<div text-sm op60 mt-1>You don't have to squeeze your money's worth out of every session</div>
</div>

<!-- あと、会場をまるっと抜け出す日があってもいいと思うんですよ。3日目は会場抜けて、現地の友人と映画観に行きました。最終日のSprintも、ランチ行くグループに混ぜてもらったら、そのままタコス食べて、クイーンメアリー号っていう観光地見に行って、夕方は海岸散歩して、そのまま飲みに行っちゃった。せっかく高いお金払ってるんだから全部のセッション出なきゃ、って気負いすぎなくていいんです。元を取ろうとしすぎない。これ大事。 -->

---
layout: section
---

# 来年行く人へのTips
<div text-xl op70 mt-2>Tips for next year</div>

---

# Tips ① 行く前の準備
<div text-xl op70 mt-1>Before you go</div>

<div mt-8 grid="~ cols-2" gap-4 text-lg>
  <div v-click="1" border="~ sky/30 rounded-xl" p-4 bg-sky:5>
    <div text-3xl>💸</div>
    <div mt-2 font-bold>Travel Grant（旅費補助）</div>
    <div text-xs op50 mt-0.5>Apply for the Travel Grant</div>
  </div>
  <div v-click="2" border="~ sky/30 rounded-xl" p-4 bg-sky:5>
    <div text-3xl>🛏️</div>
    <div mt-2 font-bold>宿泊費が高い → 相部屋もアリ</div>
    <div text-xs op50 mt-0.5>Lodging is pricey — share a room</div>
  </div>
  <div v-click="3" border="~ sky/30 rounded-xl" p-4 bg-sky:5>
    <div text-3xl>🧥</div>
    <div mt-2 font-bold>意外と寒い、長袖必須</div>
    <div text-xs op50 mt-0.5>Surprisingly cold — bring long sleeves</div>
  </div>
  <div v-click="3" border="~ sky/30 rounded-xl" p-4 bg-sky:5>
    <div text-3xl>🧥</div>
    <div mt-2 font-bold>でも暑い日もある → 日焼け・日除け対策も</div>
    <div text-xs op50 mt-0.5>Hot days too — bring sun protection & umbrella</div>
  </div>
</div>

<!-- ここから来年行く人向けのTipsです。まず行く前。一番は、とにかくTravel Grant、旅費補助に申し込むこと。僕は今回落ちましたけど、出さなきゃ当たらないので。次に宿。とにかく高いので、相部屋っていう手もあります。早く動くほど安い。あと服装、ロングビーチって意外と寒くて長袖必須なんですけど、逆に暑い日もあるので日焼け対策も要ります。あとはステッカー。自分のOSSとか会社のステッカーを持っていくと、名札に貼ったり配ったりして、会話のきっかけになります。 -->

---

# Tips ② 現地で楽しむ
<div text-xl op70 mt-1>Once you're there</div>

<div mt-8 grid="~ cols-2" gap-4 text-lg>
  <div v-click="1" border="~ sky/30 rounded-xl" p-4 bg-sky:5>
    <div text-3xl>🧑‍💻</div>
    <div mt-2 font-bold>Sprint も出よう</div>
    <div text-xs op50 mt-0.5>Join the sprints too</div>
    <div text-sm op70 mt-1>もくもく会みたいなもの。自分のPCだけで参加OK</div>
  </div>
  <div v-click="2" border="~ sky/30 rounded-xl" p-4 bg-sky:5>
    <div text-3xl>🍻</div>
    <div mt-2 font-bold>パーティーに参加</div>
    <div text-xs op50 mt-0.5>Go to the parties</div>
    <div text-sm op70 mt-1>食費・飲み代が浮く + 友達もできて一石二鳥</div>
  </div>
  <div v-click="3" border="~ sky/30 rounded-xl" p-4 bg-sky:5>
    <div text-3xl>🔗</div>
    <div mt-2 font-bold>LinkedIn or X</div>
    <div text-sm op70 mt-1>英語アカウントがあるとなおよし</div>
  </div>
  <div v-click="4" border="~ sky/30 rounded-xl" p-4 bg-sky:5>
    <div text-3xl>😎</div>
    <div mt-2 font-bold>社交的に振る舞ってみる</div>
    <div text-xs op50 mt-0.5>Play a sociable character</div>
    <div text-sm op70 mt-1>話しかける側に回ると一気に広がる</div>
  </div>
</div>

<!-- 次に現地での楽しみ方。Sprintはぜひ出てほしいです。もくもく会みたいなもので、自分のPCだけ持っていけば参加できる。それから、企業や団体がやってるパーティー。これ積極的に行くと食費とか飲み代が浮くし、友達もできて一石二鳥なんですよ。SNSの交換はLinkedInかXが定番です。最後に、ちょっとだけ社交的な人格を演じるっていうのもコツで、自分から話しかける側に回ると、一気に輪が広がります。 -->

---
layout: statement
---

## ゆるく参加してもゆるく楽しめるよ
<div text-xl op70 mt-3>Relax — show up, and just enjoy it</div>

<div mt-10 text-2xl>
来年は<b>あなた</b>もロングビーチで会いましょう 👋
</div>

<!-- というわけでまとめです。発表しなきゃとか、元を取らなきゃとか、肩肘張らなくていいんです。ゆるく参加して、ゆるく楽しむ。それで十分アリだと思います。来年はぜひ皆さんも、ロングビーチで会いましょう。ありがとうございました! -->
