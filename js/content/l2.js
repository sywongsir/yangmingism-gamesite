/* ==========================================================
   第2節《良知偵探社》破解不忍案件（仁愛）── 全部文字內容
   老師核對史料後可直接修改本檔文字，不用碰程式。
   needsReview:true ＝ 英文為輔助翻譯，待老師核對。
   「自撰」＝網站設計者撰寫（介面指示、請教卡提示、自學模式追問句、英文副字幕、預設詞條），非大綱原文。
   案件人物（小宇、小欣、長者）均為虛構。
   ========================================================== */
window.XC = window.XC || {};
XC.content = XC.content || {};
(function () {
  var I = 'assets/img/l2/';
  XC.content.l2 = {
    id: 'l2', no: 2, game: '良知偵探社', tagline: '破解不忍案件',
    title: '良知本心：惻隱不忍的仁愛同理之心',
    value: '仁愛', level: '個人推及他人', output: '良知時刻卡', icon: 'mirror', theme: 'night',
    coreQuestion: '看見別人受苦時，我們為何會覺得不忍？這種感覺應該被忽視嗎？',
    valueLink: '學生看到，關懷他人的衝動出自本心，不是外加的規定。',
    storyline: '學生扮演「良知偵探」，調查一宗兩千多年前的古案和三宗現代案件，找出「不忍之心」從哪裡來、什麼令人視而不見，最後把答案拼成一面「良知鏡」。',
    focus: ['良知是人人本有、不需要學習就有的是非與惻隱之心',
      '孺子入井的故事：從孟子到陽明',
      '良知如何引導我們判斷是非，並把關懷推及他人（同理心列入學習要點）'],
    noRanking: '本節不為「誰比較善良」計分。碎片只獎勵分析、推理和行動方案，因為良知不是比賽。',

    /* 資源：良知碎片（每組最多 3 塊：惻隱、是非、羞惡） */
    resource: { name: '良知碎片', unit: '碎片', start: 0, classTarget: 1, goalName: '良知鏡', goalDone: '良知鏡重圓' },
    fragments: [
      { id: 'f1', name: '惻隱', no: '一', how: '推理有線索支持（古案）' },
      { id: 'f2', name: '是非', no: '二', how: '說出案件中哪裡不對，並完成良知雷達' },
      { id: 'f3', name: '羞惡', no: '三', how: '完成塵埃卡分析，並寫出自己最可能被哪一張擋住（可寫不讀）' }
    ],
    roles: [
      { id: 'chief', name: '偵探長', duty: '帶領推理、分配工作' },
      { id: 'rec', name: '記錄員', duty: '填寫偵探筆記' },
      { id: 'rep', name: '發言人', duty: '匯報推理' },
      { id: 'keep', name: '守心人', duty: '提醒組員互相尊重、保管碎片' }
    ],
    rolesNote: '角色職責為預設文字，教師可修改（本檔 roles）。沿用第1節的分組（每組 4 人）。',
    badges: [
      { id: 'minrui', name: '敏銳偵探', desc: '能用線索辨別動機' },
      { id: 'nuanxin', name: '暖心偵探', desc: '提出具體援手' },
      { id: 'qingchen', name: '清塵偵探', desc: '能提出清除遮蔽的方法' }
    ],
    props: [{ id: 'ask', name: '請教卡', meaning: '求助是偵探的本領' }],
    /* 請教卡提示（自撰：只提示思考方向，不直接給答案） */
    hints: {
      motive: '逐張讀現場線索：如果「沒時間考慮」，人還來得及計算獎賞嗎？如果「沒有其他人看見」，還會怕被人罵嗎？哪一張嫌疑卡在三條線索下都仍然說得通？',
      radar: '先不要分好壞。把每一個念頭讀一次，問：它是「替他難過」、「覺得不對」、「不想成為那種人」，還是「顧慮自己」？',
      dust: '想像你是旁觀者之一：你最先想到的顧慮是什麼？那一張就可能是蓋住鏡子的塵埃。',
      clean: '最小援手要小到今天就做得到：一句話、一個動作、一個私下的訊息，都可以。',
      moment: '如果想不起親身經歷，可以寫見聞或電影情節。先寫「那一刻我覺得不忍，因為……」。'
    },

    /* 環節一：情境與反應牌 */
    fallScene: '放學路上，一個小孩在你面前跌倒，膝蓋流血。附近很多人經過，但沒有人停下來。',
    fallSceneEn: 'On your way home from school, a small child trips and falls in front of you, knee bleeding. Many people pass by, but no one stops.',
    reactions: [
      { id: 'r1', text: '我會上前幫忙' },
      { id: 'r2', text: '我會看看再決定' },
      { id: 'r3', text: '我會繼續走' },
      { id: 'r4', text: '我不知道' }
    ],
    firstAsk: '不是你「應該」怎樣做，而是你「第一下」感覺到什麼？',

    /* 環節二：動機鑑定 */
    suspects: [
      { id: 'm1', text: '想得到孩子父母的獎賞' },
      { id: 'm2', text: '怕被人罵見死不救' },
      { id: 'm3', text: '純粹覺得不忍' }
    ],
    clues: [
      { id: 'k1', text: '事發在一瞬間，沒時間考慮' },
      { id: 'k2', text: '附近沒有其他人看見' },
      { id: 'k3', text: '孩子與你素不相識' }
    ],
    /* 自學模式：蘇格拉底式追問（不說錯；按提示詞） */
    motiveAsk: {
      m1: '孩子與你素不相識，又沒時間考慮，「想得獎賞」還說得通嗎？',
      m2: '附近沒有其他人看見，「怕被人罵」還成立嗎？'
    },
    motiveNote: '「動機鑑定」的推理過程是教學設計，用來引導學生發現孟子所說的道理。',

    /* 環節三：現代三案（均為虛構） */
    cases: [
      { id: 'A', name: '教室一角', img: I + 'l2-case-a.webp', alt: '課室一角：男生獨坐窗邊，其他同學在遠處玩',
        text: '新來的同學小宇，小息時常獨自坐著。班上有人說他很怪，沒有人邀請他。你看見他望著大家玩。',
        ignored: '小宇', wrongHint: '說他很怪、沒有人邀請他' },
      { id: 'B', name: '群組風波', chat: true, alt: '虛構的水墨風通訊介面：班群組有人截圖取笑',
        text: '班群組有人把同學小欣的一句失言截圖，大家用表情包取笑，你也收到了。',
        ignored: '小欣', wrongHint: '把失言截圖、用表情包取笑' },
      { id: 'C', name: '地鐵一刻', img: I + 'l2-case-c.webp', alt: '擠迫車廂：長者提著重物站立，周圍的人低頭看手機',
        text: '車廂擠迫，一位長者提著很重的購物袋站著，周圍的人都低頭看手機。你坐在近門的座位。',
        ignored: '長者', wrongHint: '長者提重物站著，沒有人留意' }
    ],
    /* 案件 B 的虛構群組畫面（自撰；不出現任何真實軟件標誌、真實截圖或真實同學名字） */
    chat: {
      title: '中二丙 班群組（虛構）',
      msgs: [
        { who: '同學甲', text: '［截圖］小欣剛才在堂上說的那句……', shot: true },
        { who: '同學乙', sticker: 'laugh' },
        { who: '同學丙', sticker: 'point' },
        { who: '同學甲', text: '大家快看', plain: true },
        { who: '同學丁', sticker: 'laugh' }
      ],
      me: '你也收到了這則訊息。'
    },
    radarZones: [
      { id: 'z1', name: '惻隱', note: '不忍、心疼', icon: 'support', eg: '例：替他難過' },
      { id: 'z2', name: '是非', note: '覺得不對', icon: 'check', eg: '例：這樣不對' },
      { id: 'z3', name: '羞惡', note: '慚愧、不想成為那種人', icon: 'mirror', eg: '例：我不想成為旁觀的人' },
      { id: 'z4', name: '其他', note: '怕麻煩、怕被針對、覺得與我無關', icon: 'hourglass', eg: '例：怕麻煩' }
    ],
    radarEgNote: '支援模式的例子為網站自撰，只作提示。',
    radarNote: '「良知雷達」的分類是教學設計：雷達只列惻隱、是非、羞惡，是為配合仁愛主題，對孟子「四端」（還有辭讓）作的簡化。',
    /* 課堂示範用的第一念詞條（自撰；老師可在教師面板加入各組匯報的詞條） */
    thoughtChips: ['替他難過', '心疼他', '這樣不對', '取笑人不應該', '我不想成為旁觀的人', '有點慚愧', '怕麻煩', '怕被針對', '與我無關', '不知道怎樣做'],
    dust: [
      { id: 'd1', name: '怕麻煩', look: 'dust', alt: '灰塵' },
      { id: 'd2', name: '別人也沒做', look: 'crowd', alt: '人群背影' },
      { id: 'd3', name: '怕被針對', look: 'finger', alt: '陰影中的手指' },
      { id: 'd4', name: '不知道怎樣做', look: 'fog', alt: '迷霧' }
    ],
    dustPrivate: '如果我是旁觀者之一，我最可能被哪一張擋住？',
    dustNote: '「塵埃卡」的比喻與黃文樹文中提到的「去除昏蔽」「破除意見」對應。',
    helpExamples: ['走過去說「要不要一起玩」', '私下關心而不轉發截圖', '說一句「我來幫你拿」'],
    summary3: ['第一念常常是不忍或覺得不對', '阻止我們的多是「塵埃」，不是「沒有良知」', '最小援手可以由一句話開始'],
    caseSteps: [
      { id: 'first', name: '第一念', sec: 60 },
      { id: 'radar', name: '良知雷達', sec: 120 },
      { id: 'dust', name: '塵埃卡', sec: 90 },
      { id: 'swap', name: '換位卡', sec: 90 },
      { id: 'clean', name: '清塵行動', sec: 90 }
    ],

    /* 環節四：良知時刻卡 */
    card: {
      title: '良知時刻卡', en: 'My Moment of Conscience',
      fields: [
        { id: 'exp', label: '一次我感到不忍的經歷', help: '可以是親身、見聞或電影情節' },
        { id: 'first', label: '當時我的第一念', help: '' },
        { id: 'did', label: '我當時做了什麼或沒做什麼', help: '' },
        { id: 'help', label: '如果再來一次，我的最小援手', help: '今天就做得到的小事' }
      ],
      scaffolds: ['那一刻我覺得不忍，因為……', '我當時沒有行動，因為被……蓋住了', '下次我可以……'],
      partner: '同伴換位一句', partnerPH: '我猜當時那個人的感受是……',
      partnerNote: '良知配對完全自願：可以把裝置交給同伴，在這一欄寫一句；不想交換也沒關係。',
      exit: '離場券：我的最小援手是……'
    },
    challenge: { title: '挑戰任務', text: '為案件另寫一張塵埃卡，並設計一個能同時幫助被忽視者和旁觀者的行動。', fields: ['案件', '新的塵埃卡', '同時幫助被忽視者和旁觀者的行動'] },

    /* ---------------- 五個環節（5＋8＋14＋8＋5＝40 分鐘） ---------------- */
    scenes: [
      { id: 's0', name: '第一反應（開場）', short: '第一反應', minutes: 5, shortMinutes: 4,
        goal: '讓學生先留意自己的「第一念」，再帶出本節要查的問題。',
        mechanic: '反應牌同時亮牌、領取任務（教材：簡報、反應牌）',
        phases: [
          { id: 'open', label: '偵探社', bg: I + 'l2-agency.webp', theme: 'night', strip: false,
            narration: [{ zh: '月色之下，良知偵探社亮起了燈。', en: 'Under the moonlight, the lamp of the Conscience Detective Agency is lit.', needsReview: true, src: '自撰開場' }] },
          { id: 'scene', label: '情境', bg: I + 'l2-moon-pale.webp', theme: 'night', strip: false,
            teacher: '（1 分鐘）老師口述情境。畫面只用淡墨意境，不畫流血。',
            narration: [{ zh: '放學路上，一個小孩在你面前跌倒，膝蓋流血。', en: 'On your way home from school, a small child trips and falls in front of you, knee bleeding.', needsReview: true, src: '大綱' },
              { zh: '附近很多人經過，但沒有人停下來。', en: 'Many people pass by, but no one stops.', needsReview: true, src: '大綱' }] },
          { id: 'react', label: '反應牌', bg: I + 'l2-moon-pale.webp', theme: 'night',
            caption: '同時亮出反應牌：只點數，不評論。',
            captionEn: 'Show your reaction cards at the same time. We only count — no comments.',
            teacher: '（1.5 分鐘）學生同時亮出實體反應牌。老師在下方輸入各項人數，畫面以墨點顯示分佈；只點數，不評論，不標示好壞。不評價學生的選擇，尤其不批評選「繼續走」的同學。' },
          { id: 'ask', label: '追問', bg: I + 'l2-moon-pale.webp', theme: 'night',
            caption: '不是你「應該」怎樣做，而是你「第一下」感覺到什麼？',
            captionEn: 'Not what you "should" do — what did you feel in that very first moment?',
            teacher: '（1.5 分鐘）追問，請 3 至 4 位學生用一句話回答。' },
          { id: 'announce', label: '宣布遊戲', bg: I + 'l2-agency.webp', theme: 'night',
            narration: [{ zh: '你們是良知偵探社的偵探。今天要查清，這個「第一下」的感覺從哪裡來。', en: 'You are detectives of the Conscience Detective Agency. Today, find out where that "first moment" feeling comes from.', needsReview: true, src: '大綱' }],
            teacher: '（1 分鐘）宣布遊戲，卷宗打開，派發任務袋（角色牌 4 張、請教卡 1 張、偵探筆記、案件卡、雷達圖、塵埃卡 4 張、換位卡、碎片貼紙）。可按「隨機分配角色」。' }
        ],
        questions: [{ q: '看見別人跌倒，為什麼有人會覺得不舒服？', ref: '替他痛、擔心他、想幫他；也有人想到怕麻煩、怕尷尬。' }],
        feedback: '兩種念頭都出現了。偵探社要查的，就是它們各從哪裡來。',
        teacherNotes: ['不評價學生的選擇，尤其不批評選「繼續走」的同學。', '自學模式：私下選一張反應牌（不記分、不評論），再寫一句「第一下的感覺」。'],
        cautions: ['反應牌只點數，不評論，不標示好壞。'],
        timeTips: '時間緊張時，追問只請 2 位學生回答。'
      },
      { id: 's1', name: '古案：孺子入井', short: '孺子入井', minutes: 8, shortMinutes: 7,
        goal: '學生理解「不忍」是人自然生起的反應，不是學回來的；這就是良知的一種表現。',
        mechanic: '動機鑑定，取得碎片一（惻隱）（教材：動機嫌疑卡、現場線索卡）',
        phases: [
          { id: 'story', label: '古案', bg: I + 'l2-well.webp', theme: 'night', strip: false,
            teacher: '教師講，約 2 分鐘。',
            narration: [
              { zh: '兩千多年前，孟子設想一個情境：', en: 'More than two thousand years ago, Mencius imagined a scene:', needsReview: true, src: '大綱' },
              { zh: '忽然看見一個小孩快要掉進井裡，任何人都會緊張和不忍。', en: 'Suddenly seeing a small child about to fall into a well, anyone would feel alarm and distress.', needsReview: true, src: '大綱' },
              { zh: '後來陽明承接這個說法：有仁德的人見到這一幕，自己的心與孩子連成一體。', en: 'Later, Yangming carried this idea forward: when a person of humaneness sees this, their heart becomes one with the child.', needsReview: true, src: '大綱' }
            ] },
          { id: 'task', label: '動機鑑定', theme: 'paper', layout: 'task',
            caption: '把三張現場線索卡，放到最吻合的動機嫌疑卡下，再說明推理。',
            captionEn: 'Place each clue card under the motive it fits best, then explain your reasoning.',
            teacher: '任務 4 分鐘。各組把線索卡貼到最吻合的嫌疑卡下，由發言人說明推理。推理有線索支持 → 取得「良知碎片一：惻隱」。' },
          { id: 'reveal', label: '揭曉', theme: 'night', strip: false, bg: I + 'l2-hand-water.webp',
            teacher: '揭曉 2 分鐘。',
            narration: [
              { zh: '「良知」一詞源自孟子：不用學習、不用思考，就有的是非與惻隱之心。', en: 'The term "liangzhi" comes from Mencius: a sense of right and wrong and of compassion that we have without learning or deliberating.', img: I + 'l2-hand-water.webp', needsReview: true, src: '大綱' },
              { zh: '陽明把惻隱、羞惡等作用，都收攝在良知之內。', en: 'Yangming gathered compassion, shame and other workings of the heart into liangzhi.', img: I + 'l2-ripple.webp', fx: 'ripple', needsReview: true, src: '大綱' },
              { zh: '人人本有良知，如明鏡一般。', en: 'Everyone has innate moral knowing, clear as a mirror.', img: I + 'l2-moon-lake.webp', fx: 'moon', src: '序章 63–65 秒' }
            ] },
          { id: 'discuss', label: '提問', theme: 'paper' }
        ],
        questions: [
          { q: '小孩快要掉進井裡的一刻，人們為什麼不需要先想清楚才緊張？', ref: '因為這種反應是本來就有，不是學回來的。' },
          { q: '如果這個反應人人都有，為什麼有時我們看見別人受苦，卻無動於衷？', ref: '可能被別的想法蓋住，例如怕麻煩、習慣了。（引入下一環節）' }
        ],
        feedback: '不忍之心不需要別人教，但有時需要被喚醒。',
        teacherNotes: ['文獻：孟子《公孫丑上》孺子入井；陽明「一體之仁」相關論述。', '「動機鑑定」的推理過程是教學設計，用來引導學生發現孟子所說的道理。', '自學模式：線索放在①下時問「孩子與你素不相識，又沒時間考慮，『想得獎賞』還說得通嗎？」；放在②下時問「附近沒有其他人看見，『怕被人罵』還成立嗎？」三條線索都放好，並寫出達字數門檻的推理，即得碎片。'],
        cautions: ['畫面溫和：古井與井邊爬行的幼童，不畫跌落。'],
        timeTips: '時間緊張時，全班一起做動機鑑定，由 2 組發言人說明推理；保留揭曉。'
      },
      { id: 's2', name: '現代三案', short: '現代三案', minutes: 14, shortMinutes: 12,
        goal: '學生把良知的概念用在自己的生活情境，學習辨別反應、找出阻礙，並提出具體援手（仁愛），同時練習換位思考（同理心）。',
        mechanic: '良知雷達、塵埃卡、換位卡，取得碎片二、三（教材：案件卡、雷達圖、塵埃卡、換位卡）',
        phases: [
          { id: 'cases', label: '案件卡', theme: 'paper', layout: 'task',
            caption: '三宗現代案件（均為虛構）。每組負責一宗。',
            captionEn: 'Three modern cases (all fictional). Each group takes one case.',
            teacher: '確保案件 A、B、C 各有 2 至 3 組負責；可按「平均分配案件」。案件均為虛構；如學生借題提到班內真實的孤立或欺凌個案，課後交班主任或社工跟進，不在課堂追問。' },
          { id: 'first', label: '①第一念', theme: 'paper', layout: 'task',
            caption: '看完案件，寫一句第一下的感覺（1 分鐘）。',
            captionEn: 'After reading your case, write one sentence about your very first feeling (1 minute).',
            teacher: '（1 分鐘）個人在偵探筆記上寫一句第一下的感覺。' },
          { id: 'radar', label: '②良知雷達', theme: 'paper', layout: 'task',
            caption: '把第一念歸類到雷達四區，雷達隨之填色（2 分鐘）。',
            captionEn: 'Sort first thoughts into the four zones of the radar (2 minutes).',
            teacher: '（2 分鐘）組員把各人的第一念歸類到雷達圖四區。碎片二「是非」：能說出案件中哪裡不對，並完成良知雷達。' },
          { id: 'dust', label: '③塵埃卡', theme: 'paper', layout: 'task',
            caption: '選出最可能阻止行動的兩張塵埃卡，並說明（1.5 分鐘）。',
            captionEn: 'Choose the two dust cards most likely to stop people from acting, and explain (1.5 minutes).',
            teacher: '（1.5 分鐘）每案 4 張塵埃卡，選出最可能阻止行動的兩張並說明。「我最可能被哪一張擋住」是自願私下作答，可寫不讀，不在投影顯示，不強迫。碎片三「羞惡」：完成塵埃卡分析，並寫出自己最可能被哪一張擋住（可寫不讀）。' },
          { id: 'swap', label: '④換位卡', theme: 'paper', layout: 'task',
            caption: '用第一身，寫出被忽視的那個人的一句心裡話（1.5 分鐘）。',
            captionEn: 'In the first person, write one sentence the ignored person might be thinking (1.5 minutes).',
            teacher: '（1.5 分鐘）換位卡：用第一身寫被忽視者的一句心裡話。' },
          { id: 'clean', label: '⑤清塵行動', theme: 'night', layout: 'task',
            caption: '為塵埃卡想一個「最小援手」，寫好後擦去鏡上的塵埃（1.5 分鐘）。',
            captionEn: 'Think of a "smallest helping hand", then wipe the dust off the mirror (1.5 minutes).',
            teacher: '（1.5 分鐘）清塵行動：寫在清塵卡上，再把塵埃卡撕走。畫面可用手指或滑鼠擦拭鏡面。' },
          { id: 'report', label: '匯報', theme: 'paper', layout: 'task',
            caption: '每案由 1 組匯報（各 1.5 分鐘），其他組可補充一條線索。',
            captionEn: 'One group reports on each case (1.5 minutes each); others may add one clue.',
            teacher: '匯報 4.5 分鐘；教師歸納 1.5 分鐘（按「顯示教師歸納」逐條顯示）。現代三案最容易超時。' },
          { id: 'discuss', label: '提問', theme: 'paper' }
        ],
        questions: [
          { q: '這些反應，有沒有出現在你自己的第一念？', ref: '沒有標準答案。教師引導學生承認，不忍和怕麻煩常常同時出現。' },
          { q: '蓋住不忍之心的「塵埃」是什麼？', ref: '怕麻煩、別人也沒做、怕被針對、不知道怎樣做。' },
          { q: '（延伸，可選）如果大家的第一念不同，良知可靠嗎？', ref: '第一念可能受經驗和偏見影響。陽明認為良知本有，但需要「致」，即要擦亮它，並落實為行動。教師可把這個問題留給第3節。' }
        ],
        feedback: '良知沒有消失，只是有時被蓋住了。',
        teacherNotes: ['「塵埃卡」的比喻與黃文樹文中提到的「去除昏蔽」「破除意見」對應；「良知雷達」的分類是教學設計。', '雷達只列惻隱、是非、羞惡，是為配合仁愛主題對孟子「四端」（還有辭讓）作的簡化。', '全程用「塵埃」「蓋住」，不用「冷漠」「自私」等標籤。', '自學模式：選一宗案件做完整五步；雷達由學生寫下自己可能有的多個念頭再歸類。'],
        cautions: ['案件均為虛構；網上嘲笑案不使用真實截圖或真實同學名字。', '「我最可能被哪一張擋住」可寫不讀：此欄不在投影顯示，不強迫。'],
        timeTips: '時間不足：只做一個案件的完整流程，其餘案件由教師簡述。'
      },
      { id: 's3', name: '良知時刻卡', short: '良知時刻', minutes: 8, shortMinutes: 7,
        goal: '學生把課堂所學連結到自己的經驗，並預先想好下次的「最小援手」。',
        mechanic: '個人卡片＋配對換位（教材：良知時刻卡）',
        phases: [
          { id: 'explain', label: '說明', theme: 'paper', strip: false, bg: I + 'l2-agency.webp',
            teacher: '（1 分鐘）派發良知時刻卡，說明四欄。' },
          { id: 'fill', label: '填寫', theme: 'paper', layout: 'task', strip: false,
            caption: '個人填寫四欄（4 分鐘）。分享完全自願，可寫見聞或電影情節。',
            captionEn: 'Fill in the four columns on your own (4 minutes). Sharing is voluntary.',
            teacher: '（4 分鐘）學生個人填寫。分享完全自願，不要求披露私隱；學生可寫見聞或電影情節代替親身經歷。' },
          { id: 'pair', label: '良知配對', theme: 'paper', strip: false,
            caption: '兩人自願交換卡片，對方寫一句「換位一句」（3 分鐘）。',
            captionEn: 'Swap cards with a partner if you wish; your partner writes one line of empathy (3 minutes).',
            teacher: '（3 分鐘）良知配對：兩人自願交換卡片，對方在卡上寫一句「我猜當時那個人的感受是……」。' }
        ],
        questions: [], feedback: '',
        teacherNotes: ['分享完全自願，不要求披露私隱。', '課堂上學生填寫實體良知時刻卡；網站畫面可作示範，自學模式則直接在此填寫並存入回顧盒。'],
        cautions: ['名字欄位一律寫「化名或學號（可留空）」，不要求真實姓名。'],
        timeTips: '時間緊張時，良知配對縮短為 1 分鐘，或留待離場前自願完成。'
      },
      { id: 's4', name: '良知鏡結算', short: '良知鏡', minutes: 5, shortMinutes: 4,
        goal: '拼合碎片點亮良知鏡，表揚行為，並以離場券連結下一節。',
        mechanic: '拼合碎片、頒徽章、離場券（教材：良知鏡海報、徽章卡）',
        phases: [
          { id: 'mirror', label: '良知鏡', theme: 'night', bg: I + 'l2-moon-pale.webp',
            teacher: '（2 分鐘）各組把已得的碎片貼到全班「良知鏡」海報。三種碎片齊全，鏡子「亮起」。' },
          { id: 'badges', label: '頒發徽章', theme: 'night', bg: I + 'l2-agency.webp',
            teacher: '（1 分鐘）頒發徽章：敏銳偵探（能用線索辨別動機）、暖心偵探（提出具體援手）、清塵偵探（能提出清除遮蔽的方法）。' },
          { id: 'summary', label: '三句總結', theme: 'paper', strip: false,
            teacher: '（1 分鐘）板書三句總結。' },
          { id: 'exit', label: '離場券', theme: 'night', strip: false, bg: I + 'l2-moon-lake.webp',
            teacher: '（1 分鐘）離場券：在良知時刻卡背面寫一句「我的最小援手是……」。預告第3節。' }
        ],
        summary: ['不忍之心人人有', '塵埃會蓋住良知', '一句話可以是最小援手'],
        mirrorLine: { zh: '人人本有良知，如明鏡一般。', en: 'Everyone has innate moral knowing, clear as a mirror.', src: '序章 63–65 秒' },
        nextPreview: '預告第3節：知道了，為什麼有時還是做不到？',
        questions: [], feedback: '',
        teacherNotes: ['徽章表揚行為，不單看分數；不顯示「最多徽章」之類統計。', '「三種碎片齊全」：全班合計每種碎片至少有一塊（數量可在教師控制台調整）。'],
        cautions: ['不設組間排名：各組按組號固定排列，不排序，不比較高低。'],
        timeTips: '時間不足時，老師可直接按「觸發良知鏡重圓動畫」，徽章留待下一節開首頒發。'
      }
    ],

    observation: [
      { indicator: '辨別動機', standard: '能用線索排除外在動機，指出不忍自然生起', scene: '古案', record: '動機鑑定紙、口頭匯報' },
      { indicator: '分析反應與阻礙', standard: '能歸類第一念，並找出遮蔽不忍的因素', scene: '現代三案', record: '良知雷達、塵埃卡' },
      { indicator: '換位同理', standard: '能用第一身寫出被忽視者的感受', scene: '現代三案、配對', record: '換位卡' },
      { indicator: '最小援手', standard: '提出具體可行的關懷行動', scene: '清塵卡、良知時刻卡', record: '良知時刻卡、離場券' }
    ],
    differentiation: {
      support: ['提供句式支架、雷達圖的圖像提示，以及已預設選項的塵埃卡（按「支援」開啟）'],
      challenge: ['挑戰任務：為案件另寫一張塵埃卡，並設計一個能同時幫助被忽視者和旁觀者的行動'],
      crossSubject: '與中文科合作，可閱讀孟子「四端」的相關選段。'
    },
    cautions: ['不要讓學生覺得自己「沒有良知」：教師全程用「塵埃」「蓋住」，不用「冷漠」「自私」等標籤。',
      '案件均為虛構：如學生借題提到班內真實的孤立或欺凌個案，課後交班主任或社工跟進，不在課堂追問。',
      '網上嘲笑案：不使用真實的截圖或真實同學的名字。',
      '計分：不為「善良」計分，只獎勵分析與行動方案。',
      '時間：現代三案最容易超時。如時間不足，只做一個案件的完整流程，其餘案件由教師簡述。',
      '匿名與引文：教材不得出現校名、校徽、教師姓名；引用經典和圖像需註明出處。'],
    verify: ['孟子《公孫丑上》孺子入井及「四端」的原文，用於環節二的揭曉文字',
      '陽明《傳習錄》中與「一體之仁」及孺子入井相關的原文（第6節也會用到，建議一併核對）',
      '「良知雷達」只列惻隱、是非、羞惡三項，孟子的「四端」還有辭讓；計劃書內需說明這是為配合仁愛主題而作的簡化',
      '「塵埃卡」「良知碎片」「最小援手」屬教學設計，計劃書內不要寫成陽明原話',
      '仁愛與同理心的分工：首要價值觀填仁愛，同理心寫在學習要點欄'],
    references: ['臺灣期刊論文（華藝線上圖書館，airiti，N202311160006）：良知一詞源自孟子「不學而能、不慮而知」，陽明把惻隱、羞惡等作用收攝到良知之下。',
      '歐陽輝純（2018）〈論王陽明心學的道德結構體系〉，《貴州師範大學學報（社會科學版）》第2期：把良知視為心學道德結構的起點。',
      '孫聚友（中新社，2022）〈如何從中華文化理解人類命運共同體？〉：文中提到陽明所說，仁者見孺子將入井，必有惻隱之心，因其仁心已與孺子合為一體。'],
    materials: ['簡報（由本網站取代）', '反應牌（4款）與偵探筆記', '動機嫌疑卡（3張）與現場線索卡（3張）', '案件卡A、B、C', '良知雷達圖與貼紙（惻隱、是非、羞惡、其他）',
      '塵埃卡（每案4張）、清塵卡、換位卡', '良知碎片貼紙（3種）與全班良知鏡海報', '請教卡、角色牌', '良知時刻卡（附句式支架）', '徽章卡（敏銳偵探、暖心偵探、清塵偵探）', '教師觀察表'],
    ui: {
      randomRoles: '隨機分配角色', openFile: '打開卷宗',
      reactSelfNote: '私下選一張反應牌（不記分、不評論，只存本機）', feelLabel: '一句「第一下的感覺」（可不寫）',
      dotsNote: '墨點＝人數。只點數，不評論，不標示好壞。',
      clueTray: '現場線索卡', motiveReason: '一句推理：線索怎樣支持你的判斷？', motiveSubmit: '提交推理',
      fragGot: '取得良知碎片',
      assignCases: '平均分配案件', myCase: '我負責的案件', pickCase: '選這一宗',
      firstLabel: '我的第一念（一句）', whereWrong: '案件中哪裡不對？',
      addThought: '加入一個念頭', thoughtPH: '再寫一個你可能有的念頭',
      dustReason: '為什麼這兩張最可能阻止行動？', dustPrivate: '自願私下作答（可寫不讀；不在投影顯示）',
      swapLabel: '被忽視的人的一句心裡話（用第一身「我……」）',
      cleanLabel: '清塵卡：我的最小援手（今天就做得到的小事）', wipeHint: '用手指或滑鼠擦去鏡上的塵埃',
      showSum: '顯示教師歸納',
      save: '存入回顧盒', png: '下載 PNG', print: '列印（A5）',
      goalBtn: '碎片飛上良知鏡', exitTitle: '離場券'
    }
  };
})();
