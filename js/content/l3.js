/* ==========================================================
   第3節《知行橋工程隊》修復知行裂縫（承擔精神・個人）── 全部文字內容
   老師核對史料後可直接修改本檔文字，不用碰程式。
   needsReview:true ＝ 英文為輔助翻譯，待老師核對。
   「自撰」＝網站設計者撰寫（介面指示、自學模式解說、測試員助手提示、英文副字幕、預設詞條），非大綱原文。
   情境及案例人物（小文、阿恆、小欣、志明、小美、阿傑、小傑）均為虛構。
   ========================================================== */
window.XC = window.XC || {};
XC.content = XC.content || {};
(function () {
  var I = 'assets/img/l3/';
  XC.content.l3 = {
    id: 'l3', no: 3, game: '知行橋工程隊', tagline: '修復知行裂縫',
    title: '知行合一：真知必行的落實責任之道',
    value: '承擔精神', level: '個人', output: '知行對照表、承諾信封', icon: 'bridge', theme: 'paper',
    coreQuestion: '知道而沒有做，是真的「知道」了嗎？',
    valueLink: '本節是承擔精神的個人層面，即對自己所知道的事負責。誠信的「言行一致」寫在學習要點欄。',
    storyline: '「知」在河的一岸，「行」在另一岸，中間的橋有裂縫。學生組成工程隊，診斷裂縫、搭起橋板，最後把自己的一個承諾封存，下一節開封回報。',
    focus: ['知與行是一件事的兩面，真知必然表現為行動',
      '「知而不行」的常見原因：怕麻煩、怕被排擠、自我欺騙',
      '把「知而不行」看作迴避責任，從而學習主動承擔（誠信的「言行一致」列入學習要點）'],
    noRanking: '觀眾以穩度牌評橋，評的是方案質素，不是演技；全班橋海報以合作取代排名。',

    /* 資源：橋板（每組 3 塊）；全班橋海報貼滿即「橋通」（預設目標：組數 × 3 塊，可在教師控制台修改） */
    resource: { name: '橋板', unit: '塊', start: 0, perGroup: 3, goalName: '橋海報', goalDone: '知行橋貫通' },
    roles: [
      { id: 'chief', name: '總工程師', duty: '統籌、分工' },
      { id: 'rec', name: '記錄員', duty: '記錄裂縫與橋板' },
      { id: 'rep', name: '發言人', duty: '匯報、演出旁白' },
      { id: 'test', name: '測試員', duty: '檢查橋板是否夠小夠具體，並記錄穩度牌' }
    ],
    rolesNote: '角色職責為預設文字（測試員的職責為大綱所定），教師可修改（本檔 roles）。沿用分組（每組 4 人）。',
    badges: [
      { id: 'zhenzhi', name: '真知者', desc: '真假知行答對 4 題或以上' },
      { id: 'zhuqiao', name: '築橋者', desc: '橋板具體可行' }
    ],
    badgeNext: '第4節開封時加發「守約者」徽章（完成承諾者）。',
    props: [],
    hints: {
      quiz: '先問：主角「知道」什麼？再看他有沒有做。如果是條件真的不許可，可能是「做不到」，不一定是「不去做」。',
      crack: '想像你就是情境中的「你」：手指停住、沒有作聲、遲遲未開始的那一刻，心裡在想什麼？',
      plank: '第一步要小到 30 秒內做得到；第二塊要寫出一個人；第三塊要寫別人看得見的標記。',
      table: '原則可以很平常，例如「答應了的事要做到」。落差不用公開，只圈給自己看。'
    },

    /* 環節一：知行投票 */
    vote: {
      items: ['睡前應該放下手機', '收到未證實的訊息應先核實才轉發', '看見同學被取笑應該說句話', '答應了別人的事應該如期完成', '用過的東西應該放回原位'],
      short: ['睡前放下手機', '先核實才轉發', '替被取笑的同學說句話', '如期完成答應的事', '用完放回原位'],
      options: [{ id: 'o', name: '常常做到' }, { id: 's', name: '有時做到' }, { id: 'r', name: '很少做到' }],
      mapNote: '裂縫寬度＝選「有時做到」和「很少做到」的人數比例。',
      anon: '全程匿名，不點名，不評價個別學生的答案。'
    },

    /* 環節二：真假知行（answer：t＝真知，f＝未真知，d＝討論題不計分） */
    quiz: [
      { text: '小文知道要節約用水，刷牙時卻一直開著水龍頭。', answer: 'f', why: '知道要節約，卻沒有把它放進刷牙這個日常動作裏。' },
      { text: '阿恆知道不應該說謊，發現自己忘了做小組任務後，主動向組員承認。', answer: 't', why: '他知道誠實重要，即使承認會尷尬，也做了出來。' },
      { text: '小欣常說很關心環保，卻從不自備水瓶，還說「別人也這樣」。', answer: 'f', why: '口裏說關心，行動卻沒有跟上；「別人也這樣」是一種藉口。' },
      { text: '志明收到一則驚人的訊息，先查證資料才決定是否轉發。', answer: 't', why: '他知道未證實的訊息不應轉發，於是先查證，知與行一致。' },
      { text: '小美很想幫同學補習，但自己的功課也做不完，實在抽不出時間。', answer: 'd', why: '這是做不到，不一定是不去做。可以想想：她能否求助或調整目標？' },
      { text: '阿傑口頭答應參加義工，到日子卻說忘記了，之後也沒有補救。', answer: 'f', why: '答應了卻沒有做，事後也沒有補救，言行不一。' }
    ],
    quizNames: { t: '真知', f: '未真知', d: '討論' },
    quizWhyNote: '自學模式的逐題解說為網站自撰，只作提示；答案依大綱。',
    quizSec: 10,
    revealNote: '陽明不是說「做不到的人就是壞人」，而是提醒我們檢查自己是不是真的「知道」。',
    revealLinks: [
      { k: '誠信', v: '言行一致：說了、知道了，就去做' },
      { k: '承擔精神', v: '主動對自己所知負責' }
    ],

    /* 環節三：情境卡（均為虛構） */
    scenarios: [
      { id: 'A', name: '轉發', look: 'phone', alt: '家人群組手機畫面（虛構）',
        text: '家人群組有人轉發一則「某食物含致癌物，快轉給所有親友」的訊息。你知道未證實的訊息不應隨便轉發，但你想「寧可信其有」，手指已放在轉發鍵上。',
        bubble: '某食物含致癌物，快轉給所有親友！！' },
      { id: 'B', name: '花名', look: 'corridor', alt: '走廊背影（虛構）',
        text: '同學小傑被人起了一個取笑外貌的花名，大家都這樣叫。你知道這樣不對，但一直沒有作聲。' },
      { id: 'C', name: '承諾', look: 'calendar', alt: '日曆與未完成的報告（虛構）',
        text: '你答應了在星期五前完成小組報告的一部分，現在已經星期四，你仍未開始。你知道這會影響整組。' }
    ],
    crackCards: [
      { id: 'k1', name: '怕麻煩', crack: 1 },
      { id: 'k2', name: '怕被排擠', crack: 3 },
      { id: 'k3', name: '自欺', note: '拖延、找藉口', crack: 0 },
      { id: 'k4', name: '不知道怎樣開始', crack: 4 }
    ],
    crackNote: '四張裂縫卡刻意與第2節的塵埃卡呼應；「橋板」「穩度牌」屬教學設計。',
    planks: [
      { id: 'p1', name: '第一步', help: '30 秒內做得到的事', ph: '例：先打開搜尋，查一查這則訊息' },
      { id: 'p2', name: '求助或盟友', help: '找誰幫忙', ph: '例：私下問班長願不願意一起說' },
      { id: 'p3', name: '完成標記', help: '怎樣知道已經做到', ph: '例：在家人群組回覆查證連結' }
    ],
    /* 測試員助手：只是提示，不擋住提交（詞表可改） */
    tester: {
      vague: ['努力', '盡量', '以後', '有空', '改變自己', '做好'],
      vagueTip: '能不能改成 30 秒內做得到的動作？',
      people: ['同學', '老師', '班主任', '社工', '組員', '組長', '班長', '朋友', '家人', '爸', '媽', '哥', '姐', '弟', '妹', '爺', '嫲', '婆', '公公', '舅', '姨', '叔', '他', '她', '大家', '伙伴', '夥伴', '盟友', '小傑', '誰'],
      peopleTip: '找誰？',
      marks: ['看到', '看得見', '拍', '截圖', '記錄', '紀錄', '打剔', '剔', '交', '傳', '回覆', '簽', '貼', '放回', '日期', '時間', '清單', '打勾', '收到', '說出', '講了', '寫下', '上載', '完成'],
      marksTip: '別人怎樣看得出你做到了？',
      note: '測試員助手只會提示，不會擋住提交；詞表放在本檔 tester，老師可修改。',
      ok: '測試員：這塊橋板夠小、夠具體。'
    },
    rehearse: [{ name: '第一幕「裂縫版」（知而不行）', sec: 20 }, { name: '第二幕「架橋版」（用橋板行動）', sec: 40 }],
    stars: { criteria: ['第一步夠小嗎？', '求助對象清楚嗎？', '完成標記具體嗎？'], note: '穩度牌評的是方案質素，不是演技。' },
    dialogueLabel: '寫一句「架橋版」的對白（自學模式代替演出）',
    challenge: { title: '挑戰任務', text: '為情境另設計一座「第二橋」，處理旁人也不作聲的情況，或把橋板推廣為全班都可使用的做法。', fields: ['情境', '第二橋：第一步', '第二橋：求助或盟友', '第二橋：完成標記'] },

    /* 環節四：知行對照表＋承諾信封 */
    table: {
      title: '知行對照表', en: 'Knowing–Doing Chart',
      left: '我知道的原則', right: '我實際的做法',
      leftPH: ['我知道……是應該做的', '我知道……是應該做的'], rightPH: ['但我實際上……', '但我實際上……'],
      gapHint: '點選一行，為落差加上墨圈（只圈給自己看）。',
      scaffolds: ['我知道……是應該做的', '但我實際上……', '我的第一步是……（今天／明天）', '我會用……證明我做到了']
    },
    promise: {
      fields: [
        { id: 'what', label: '在下一節之前，我會做什麼（小到做得到）', ph: '我會……' },
        { id: 'step', label: '第一步', ph: '我的第一步是……（今天／明天）' },
        { id: 'mark', label: '完成標記', ph: '我會用……證明我做到了' }
      ],
      bigWords: ['改變自己', '做個好人', '永遠', '每一天都', '從此以後'],
      bigTip: '這個承諾有點大。能不能縮小到下一節之前做得到？',
      checks: ['第一步夠小嗎？', '找誰幫忙？', '完成標記是什麼？'],
      witness: '見證人（化名或縮寫）',
      envelope: '承諾信封', envelopeEn: 'Promise Envelope',
      sealBtn: '封存承諾', sealed: '已封存。第4節開封才能打開。',
      printInner: '列印信封內頁', rewrite: '重寫新的承諾（會取代已封存的信封）',
      privacy: '信封內容教師不公開閱讀，由學生自己開封；只存在這部裝置。'
    },
    exit: '離場券：我今天發現我最大的裂縫是……',

    /* 橋圖疊加：五條裂紋（與 l3-bridge-cracked.webp 同一座標，viewBox 0 0 1600 900） */
    bridgeCracks: ['M380 498 L375 508 L379 517 L380 529 L368 541 L355 552 L343 562 L341 576 M379 517 L354 530 M368 541 L347 552', 'M560 408 L573 417 L583 428 L573 437 L568 451 L559 464 L563 475 L564 484 M583 428 L562 440 M568 451 L591 463', 'M800 364 L812 375 L805 385 L813 395 L807 407 L803 418 L806 428 L806 438 M805 385 L821 397 M807 407 L782 415', 'M1040 408 L1042 422 L1051 433 L1046 445 L1055 454 L1043 465 L1049 474 L1055 485 M1051 433 L1068 444 M1055 454 L1069 466', 'M1220 498 L1211 508 L1198 521 L1188 532 L1185 546 L1173 558 L1175 572 L1184 586 M1198 521 L1221 537 M1185 546 L1210 555'],

    /* ---------------- 五個環節（5＋8＋14＋8＋5＝40 分鐘） ---------------- */
    scenes: [
      { id: 's0', name: '知行投票（開場）', short: '知行投票', minutes: 5, shortMinutes: 4,
        goal: '讓學生看見「知道但做不到」很普遍，降低防衛，再帶出本節要解決的問題。',
        mechanic: '匿名投票、裂縫地圖、領任務（教材：簡報、投票牌）',
        phases: [
          { id: 'open', label: '知行橋', bg: I + 'l3-river-bridge.webp', theme: 'paper', strip: false,
            narration: [{ zh: '一筆濃墨，化成石拱橋。', en: 'A single stroke of ink becomes a stone bridge.', img: I + 'l3-ink-stroke.webp', src: '序章 66 秒' },
              { zh: '知而必行，是為知行合一。', en: 'To know is to act; this is the unity of knowing and doing.', img: I + 'l3-river-bridge.webp', needsReview: true, src: '序章 67–68 秒旁白' }] },
          { id: 'vote', label: '匿名投票', theme: 'paper', layout: 'task',
            caption: '5 句「知道應該做」的事：常常做到、有時做到，還是很少做到？',
            captionEn: 'Five things we know we should do: often, sometimes, or rarely done?',
            teacher: '（3 分鐘）學生舉牌（常常／有時／很少），老師輸入各項人數。全程匿名，不點名，不評價個別學生的答案。' },
          { id: 'map', label: '裂縫地圖', theme: 'paper', layout: 'task',
            caption: '裂縫地圖：裂縫越寬，「知道」和「做到」之間的落差越大。',
            captionEn: 'The crack map: the wider the crack, the bigger the gap between knowing and doing.',
            teacher: '展示全班的「裂縫地圖」，自動標出落差最大的兩項。' },
          { id: 'announce', label: '宣布遊戲', bg: I + 'l3-bridge-cracked.webp', theme: 'paper',
            narration: [{ zh: '知岸與行岸之間的橋裂了。', en: 'The bridge between the bank of Knowing and the bank of Doing has cracked.', needsReview: true, src: '大綱' },
              { zh: '你們是工程隊，今天要弄清楚裂縫為什麼出現，再把橋修好。', en: 'You are the engineering crew. Today, find out why the cracks appeared — then repair the bridge.', needsReview: true, src: '大綱' }],
            teacher: '（2 分鐘）宣布遊戲，派發任務袋（角色牌 4 張、情境卡 1 張、裂縫卡 4 張、橋板便利貼至少 3 張、穩度牌、真知／未真知牌各 1 張）。可按「隨機分配角色」。' },
          { id: 'discuss', label: '提問', theme: 'paper' }
        ],
        questions: [{ q: '為什麼「知道」和「做到」之間，會有落差？', ref: '怕麻煩、懶、找藉口、沒時間、不知道怎樣開始。' }],
        feedback: '這些原因，我們待會稱為「裂縫」。',
        teacherNotes: ['全程匿名，不點名，不評價個別學生的答案。', '如有設備，可用即時投票工具，否則用紙牌。', '自學模式：個人作答，生成只屬自己的裂縫地圖（只存本機）。'],
        cautions: ['全程匿名，不點名，不評價個別學生的答案。'],
        timeTips: '時間緊張時，投票只做 3 句（①②④），裂縫地圖照常顯示。'
      },
      { id: 's1', name: '真假知行', short: '真假知行', minutes: 8, shortMinutes: 7,
        goal: '學生理解知行合一的意思，並分辨「做不到」與「不去做」。',
        mechanic: '搶答、真知章（教材：真知／未真知牌、案例句）',
        phases: [
          { id: 'quiz', label: '搶答', theme: 'paper', layout: 'task',
            caption: '每句商量 10 秒，之後各組同時亮牌：真知，還是未真知？',
            captionEn: 'Discuss each case for 10 seconds, then all groups show a card at once: true knowing, or not yet?',
            teacher: '（5 分鐘）逐句顯示案例；按「開始 10 秒」，時間到各組同時亮牌；按「揭曉」後，在畫面點選答對的組別，各得一枚真知章。第 5 句是討論題，不計分。' },
          { id: 'reveal', label: '揭曉', theme: 'paper', strip: false, bg: I + 'l3-river-bridge.webp',
            teacher: '（2 分鐘）揭曉只用白話概述。',
            narration: [
              { zh: '陽明的看法：知得真切，就已經包含行動；做得清楚明白，也就是知。', en: 'Yangming\'s view: knowing truly already includes acting; acting clearly and knowingly is itself knowing.', needsReview: true, src: '大綱（白話概述）' },
              { zh: '知與行不是兩件事，而是一件事的兩面。', en: 'Knowing and doing are not two things, but two sides of one.', needsReview: true, src: '大綱' },
              { zh: '白話濃縮：知而不行，只是未知。', en: 'In plain words: to know without acting is not yet to know.', needsReview: true, src: '大綱（白話濃縮）', fx: 'write' }
            ] },
          { id: 'write', label: '知行合一', theme: 'paper', strip: false,
            caption: '「知行合一」與誠信（言行一致）、承擔精神（主動對自己所知負責）。',
            captionEn: 'The unity of knowing and doing — linked to integrity and to taking responsibility.' },
          { id: 'discuss', label: '提問', theme: 'paper' }
        ],
        questions: [
          { q: '為什麼說「知而不行」，可能是還沒有真正知道？', ref: '如果真的明白並認同一件事重要，通常就會去做；做不到時，往往是還沒有真正放在心上，或被別的想法蓋住。' },
          { q: '「做不到」和「不去做」有什麼不同？', ref: '做不到，是能力或條件不足，要求助或調整目標；不去做，是有能力卻選擇迴避，要處理的是心態。' }
        ],
        feedback: '先分清是哪一種，才知道橋要怎樣修。',
        teacherNotes: ['學術依據見黃文樹（2021）；「知而不行，只是未知」是白話濃縮，不是陽明原話。', '提醒：陽明不是說「做不到的人就是壞人」，而是提醒我們檢查自己是不是真的「知道」。', '自學模式：逐題作答，即時顯示解說；5 條計分題答對 4 題或以上得「真知者」。'],
        cautions: ['不要把「未真知」變成標籤：討論的是案例中的行為，不是任何同學。'],
        timeTips: '時間緊張時，只做 4 句（①②⑤⑥），保留討論題。'
      },
      { id: 's2', name: '知行橋工程', short: '知行橋工程', minutes: 14, shortMinutes: 12,
        goal: '學生能診斷知而不行的原因，並把一個行動拆成「做得到」的步驟，從中練習主動承擔。',
        mechanic: '診斷裂縫、橋板設計、短劇、穩度牌（教材：情境卡、裂縫卡、橋板、穩度牌）',
        phases: [
          { id: 'scen', label: '情境卡', theme: 'paper', layout: 'task',
            caption: '三個情境（均為虛構）。每組負責一個。',
            captionEn: 'Three situations (all fictional). Each group takes one.',
            teacher: '確保情境 A、B、C 各有 2 至 3 組負責；可按「平均分配情境」。情境均為虛構；如學生借題提到班內真實的被取笑個案，課後交班主任或社工跟進，不在課堂追問。' },
          { id: 'diag', label: '①診斷裂縫', theme: 'paper', layout: 'task',
            caption: '從 4 張裂縫卡中選出最大的兩條，並說明理由（2 分鐘）。',
            captionEn: 'Choose the two biggest cracks from the four crack cards and explain why (2 minutes).',
            teacher: '（2 分鐘）診斷裂縫：被選中的裂縫在橋上透出金光。全程用「裂縫」「橋板」等中性詞。' },
          { id: 'plank', label: '②橋板與排練', theme: 'paper', layout: 'task',
            caption: '寫 3 塊橋板：第一步、求助或盟友、完成標記；同時排練兩幕短劇（4 分鐘）。',
            captionEn: 'Write three planks — first step, helper, sign of completion — and rehearse two short scenes (4 minutes).',
            teacher: '（4 分鐘）每寫好一塊，橋板滑入裂縫，裂縫變成金色接縫。課堂：各組寫在橋板便利貼上，貼好後老師（或組內平板）按「貼上橋板」。排練：第一幕「裂縫版」約 20 秒，第二幕「架橋版」約 40 秒。' },
          { id: 'stage', label: '③演出與穩度牌', theme: 'night', layout: 'task', bg: I + 'l3-stage.webp',
            caption: '每個情境 1 組上台（各 2 分鐘）。其餘組舉穩度牌（1 至 3 星）。',
            captionEn: 'One group per situation performs (2 minutes each). Other groups rate with stability cards (1–3 stars).',
            teacher: '（6 分鐘）每個情境抽 1 組上台。其餘組用穩度牌評分：第一步夠小嗎？求助對象清楚嗎？完成標記具體嗎？老師輸入舉牌結果，畫面顯示該橋的穩度（星數平均），測試員記錄。短劇演出最容易超時。' },
          { id: 'sum', label: '④教師歸納', theme: 'paper', layout: 'task',
            caption: '橋板越小越具體，越容易走過去。其他組可補充橋板。',
            captionEn: 'The smaller and more specific the plank, the easier it is to walk across.',
            teacher: '（2 分鐘）教師歸納；其他組可補充橋板，貼到全班橋海報。' },
          { id: 'discuss', label: '提問', theme: 'paper' }
        ],
        questions: [
          { q: '你們的第一塊橋板為什麼這樣小？', ref: '太大的行動容易被「怕麻煩」擋住，小而具體才開始得了。' },
          { q: '主動去做，和等老師要求才做，有什麼不同？', ref: '主動是自己察覺應做的事，並先行動；被動是等指示。' },
          { q: '如果沒有人看見你做，你還會做嗎？', ref: '沒有標準答案。教師引導學生連結「言行一致」，不作道德審判。' }
        ],
        feedback: '承擔不是一下子做一件大事，而是知道了，就先做第一步。',
        teacherNotes: ['四張裂縫卡刻意與第2節的塵埃卡呼應；「橋板」「穩度牌」屬教學設計。', '分清做不到與不去做：對確有能力或條件困難的學生，引導求助或調整目標，不要批評為「不努力」。', '自學模式：選一個情境；診斷、寫橋板、由測試員助手檢查；演出部分改為「寫一句架橋版的對白」。'],
        cautions: ['不要把裂縫變成道德審判：全程用「裂縫」「橋板」等中性詞，避免「說一套做一套」之類標籤。', '情境均為虛構，真實個案課後交班主任或社工跟進。'],
        timeTips: '時間不足：只演兩組，第三組由教師簡述橋板。'
      },
      { id: 's3', name: '承諾挑戰', short: '承諾挑戰', minutes: 8, shortMinutes: 7,
        goal: '學生把課堂所學落到自己身上，訂下一個小而可行的承諾，並在下一節回報。',
        mechanic: '知行對照表、承諾信封（教材：知行對照表、承諾信封）',
        phases: [
          { id: 'explain', label: '派發', theme: 'paper', strip: false, bg: I + 'l3-river-bridge.webp',
            teacher: '（1 分鐘）派發知行對照表和承諾信封。' },
          { id: 'table', label: '知行對照表', theme: 'paper', layout: 'task', strip: false,
            caption: '左欄寫 2 條「我知道的原則」，右欄寫「我實際的做法」，圈出一項落差，再寫承諾（4 分鐘）。',
            captionEn: 'Left: two principles you know. Right: what you actually do. Circle one gap, then write a promise (4 minutes).',
            teacher: '（4 分鐘）個人填寫。不強迫學生披露落差的內容。承諾要小而可行，避免「我要改變自己」這類太大的目標。' },
          { id: 'check', label: '橋板三問互檢', theme: 'paper', layout: 'task', strip: false,
            caption: '兩人互相用「橋板三問」檢查；通過後見證人簽名（化名或縮寫）（2 分鐘）。',
            captionEn: 'Check each other with the three plank questions; the witness signs with an alias or initials (2 minutes).',
            teacher: '（2 分鐘）橋板三問：第一步夠小嗎？找誰幫忙？完成標記是什麼？通過後簽名當見證人。' },
          { id: 'seal', label: '封存承諾', theme: 'night', layout: 'task', strip: false, bg: I + 'l3-river-bridge.webp',
            caption: '把承諾放進信封、封口、寫上名字（化名可）。第4節開封（1 分鐘）。',
            captionEn: 'Seal your promise in the envelope and write your name (an alias is fine). It opens in Lesson 4 (1 minute).',
            teacher: '（1 分鐘）把承諾放進信封封口，寫上名字，由教師收集，下一節開封。信封內容教師不公開閱讀。' }
        ],
        questions: [],
        feedback: '做不到也沒關係，我們可以看看橋哪裡需要加固。',
        teacherNotes: ['與第4節銜接：第4節開始先用 3 分鐘開封，學生自評完成／未完成及原因，完成者獲加發守約者徽章。', '課前預先決定第4節開封的時間。', '承諾私隱：信封內容不公開，教師只在學生自願時了解。'],
        cautions: ['承諾要小而可行，避免「我要改變自己」這類太大的目標。', '不強迫學生披露落差的內容；信封內容教師不公開閱讀，由學生自己開封。'],
        timeTips: '時間緊張時，橋板三問互檢縮短為 1 分鐘。'
      },
      { id: 's4', name: '橋通結算', short: '橋通', minutes: 5, shortMinutes: 4,
        goal: '合併全班橋板讓知行橋貫通，表揚思考與行動，並以離場券連結下一節。',
        mechanic: '橋海報合併、頒徽章、離場券（教材：橋海報、徽章卡）',
        phases: [
          { id: 'bridge', label: '橋海報', theme: 'paper', bg: I + 'l3-river-bridge.webp',
            teacher: '（2 分鐘）各組把橋板貼到全班橋海報，橋貼滿即「橋通」：人物由知岸走到行岸。' },
          { id: 'badges', label: '頒發徽章', theme: 'paper',
            teacher: '頒發徽章：真知者（真假知行答對 4 題或以上）、築橋者（橋板具體可行）。第4節加發守約者。' },
          { id: 'discuss', label: '小結提問', theme: 'paper',
            teacher: '（2 分鐘）小結並連結承擔精神。' },
          { id: 'summary', label: '三句總結', theme: 'paper', strip: false,
            teacher: '板書三句總結。' },
          { id: 'exit', label: '離場券', theme: 'paper', strip: false, bg: I + 'l3-river-bridge.webp',
            teacher: '（1 分鐘）離場券：在知行對照表背面寫「我今天發現我最大的裂縫是……」。預告第4節。' }
        ],
        questions: [{ q: '明明知道該做，卻等別人去做，是承擔嗎？', ref: '不是。承擔精神是主動的，先從對自己知道的事負責開始。' }],
        summary: ['知而不行，只是未知', '裂縫要診斷，橋要一塊塊搭', '承擔，從自己知道的事開始'],
        bridgeLine: { zh: '知而必行，是為知行合一。', en: 'To know is to act; this is the unity of knowing and doing.', src: '序章 67–68 秒旁白' },
        nextPreview: '預告第4節：一個人能承擔，一群人呢？',
        feedback: '',
        teacherNotes: ['徽章表揚思考與行動，不單看分數；不顯示「最多徽章」之類統計。', '「橋通」目標預設為組數 × 3 塊，可在教師控制台修改。'],
        cautions: ['不設組間排名：各組按組號固定排列，不排序，不比較高低。'],
        timeTips: '時間不足時，老師可直接按「觸發知行橋貫通動畫」，徽章留待第4節開首與守約者一併頒發。'
      }
    ],

    observation: [
      { indicator: '理解知行合一', standard: '能說明真知包含行動，並分辨做不到與不去做', scene: '真假知行', record: '搶答牌、口頭回答' },
      { indicator: '診斷知而不行', standard: '能找出至少一條裂縫並說明原因', scene: '知行橋工程', record: '裂縫卡、記錄員筆記' },
      { indicator: '把行動拆小', standard: '橋板包含具體第一步、求助對象和完成標記', scene: '知行橋工程', record: '橋板、穩度牌' },
      { indicator: '個人承諾', standard: '承諾小而可行，並有完成標記', scene: '承諾挑戰', record: '知行對照表、第4節開封' }
    ],
    differentiation: {
      support: ['已預設選項的裂縫卡、橋板句式支架、圖像化的橋板三問提示卡（按「支援」開啟）'],
      challenge: ['挑戰任務：為情境另設計一座「第二橋」，處理旁人也不作聲的情況，或把橋板推廣為全班都可使用的做法'],
      crossSubject: '與中文科合作，研習「言行一致」相關的成語和短文。'
    },
    cautions: ['不要把裂縫變成道德審判：教師全程用「裂縫」「橋板」等中性詞，避免「說一套做一套」之類的標籤。',
      '分清做不到與不去做：對確有能力或條件困難的學生，應引導求助或調整目標，不要批評為「不努力」。',
      '情境均為虛構：如學生借題提到班內真實的被取笑個案，課後交班主任或社工跟進，不在課堂追問。',
      '承諾私隱：信封內容不公開，教師只在學生自願時了解。',
      '時間：短劇演出最容易超時。如時間不足，只演兩組，第三組由教師簡述橋板。',
      '匿名與引文：教材不得出現校名、校徽、教師姓名；引用經典和圖像需註明出處。'],
    verify: ['陽明論知行合一的原話及其出處，核對《傳習錄》（環節二的揭曉只用白話概述）',
      '「知而不行，只是未知」作為白話濃縮，需要確認其在原典中的對應文句',
      '「裂縫卡」「橋板」「穩度牌」「承諾信封」屬教學設計，計劃書內不要寫成陽明原話',
      '承擔精神與責任感的分工：本節是個人層面的承擔，與第4節的群體承擔分開',
      '第4節開封環節需預留 3 分鐘'],
    teacherRemark: '以教育局的定義，「對自己所知負責」其實較貼近責任感。教學設計說明中，建議強調「主動」二字，以承擔精神作解釋，並與第4節的群體承擔作出層次區分。',
    references: ['黃文樹（2021）〈徐復觀對陽明心學教育觀的理解與應用〉，《南臺人文社會學報》第25期：把知行合一歸納為陽明心學教育觀三大要點之一，並指出知行工夫本不可分。',
      '歐陽輝純（2018）〈論王陽明心學的道德結構體系〉，《貴州師範大學學報（社會科學版）》第2期：把知行合一定位為心學道德結構的實踐環節。'],
    materials: ['簡報（由本網站取代）', '知行投票牌（常常／有時／很少）', '真知牌、未真知牌（每組各1張）與6句案例句', '真知章（貼紙或印章）', '情境卡A、B、C',
      '裂縫卡（每組4張）、橋板便利貼', '穩度牌（1至3星）', '「知岸／行岸」橋海報', '知行對照表（附句式支架）與承諾信封', '徽章卡（真知者、築橋者、守約者）', '教師觀察表'],
    ui: {
      randomRoles: '隨機分配角色', assign: '平均分配情境', pick: '選這一個',
      voteSelf: '個人作答（只存本機，不記分）',
      start10: '開始 10 秒', show: '同時亮牌・揭曉', nextQ: '下一句', prevQ: '上一句',
      right: '答對的組別（點選即蓋真知章）',
      crackReason: '為什麼這兩條裂縫最大？', plankPut: '貼上橋板', plankDone: '已貼上',
      testerBtn: '測試員檢查',
      starsIn: '輸入穩度牌（各星數的舉牌組數）', perfGroup: '上台組別',
      addPlank: '補充橋板（貼到全班橋海報）',
      goalBtn: '橋板貼上全班橋海報', exitTitle: '離場券'
    }
  };
})();
/* 全班目標「橋通」：預設＝組數 × 3 塊（教師控制台可改） */
Object.defineProperty(XC.content.l3.resource, 'classTarget', { get: function () { return Math.max(3, ((XC.state && XC.state.groups) ? XC.state.groups().length : 8) * 3); } });
