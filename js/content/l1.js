/* ==========================================================
   第1節《龍場闖關》點亮志燈（堅毅）── 全部文字內容
   老師核對史料後可直接修改本檔文字，不用碰程式。
   needsReview:true ＝ 英文為輔助翻譯，待老師核對。
   「自撰」＝網站設計者撰寫（介面指示、請教卡提示、自學模式追問句、英文副字幕），非大綱原文。
   ========================================================== */
window.XC = window.XC || {};
XC.content = XC.content || {};
(function () {
  var I = 'assets/img/l1/', H = 'assets/img/hub/';
  XC.content.l1 = {
    id: 'l1', no: 1, game: '龍場闖關', tagline: '點亮志燈',
    title: '陽明立志：逆境長夜的人生志向確立',
    value: '堅毅', level: '個人', output: '志向卡（第6節會再用）', icon: 'lamp', theme: 'night',
    coreQuestion: '如果你是陽明，被貶到荒遠之地，你憑什麼不放棄？',
    valueLink: '學生要看到，陽明能堅持不是因為「不怕苦」，而是因為志向清楚。',
    storyline: '學生扮演「陽明學堂弟子」，跟隨王陽明走過三個人生長夜，找出他撐下去的「燈油」，最後為自己煉成一張志向卡。',
    focus: ['認識王陽明的生平轉折：少年立志、格竹失敗、貶謫龍場、悟道',
      '理解「立志」的意思：志向是行動的方向，也是撐過困難的力量',
      '辨別有力量的志向有哪些特質：具體、有意義、肯為它付出'],
    noRanking: '不設組間排名，因為本節的價值觀是堅毅，而不是勝負。燈油的作用，是讓學生的決定和理由被看見。',

    resource: { name: '志燈值', unit: '燈油', start: 5, classTarget: 32, goalName: '志燈牆', goalDone: '長夜點亮' },
    roles: [
      { id: 'nav', name: '領航員', duty: '帶領討論、控制時間' },
      { id: 'rec', name: '記錄員', duty: '填寫任務冊' },
      { id: 'rep', name: '匯報員', duty: '代表小組發言' },
      { id: 'keep', name: '守燈人', duty: '管理燈油籌碼與火種貼紙' }
    ],
    rolesNote: '角色職責為預設文字，教師可修改（本檔 roles）。領航員由理解較快的同學擔任。',
    badges: [
      { id: 'lizhi', name: '立志者', desc: '志向卡完整具體' },
      { id: 'buqu', name: '不屈者', desc: '在失敗事件中選擇反思再試' },
      { id: 'tongxing', name: '同行者', desc: '主動幫助或鼓勵他人' }
    ],
    props: [
      { id: 'redo', name: '重來卡', meaning: '失敗可以重來' },
      { id: 'ask', name: '請教卡', meaning: '求助不是弱' }
    ],
    /* 請教卡提示（自撰：只提示思考方向，不直接給答案） */
    hints: {
      touchstone: '先不要急着選。逐張讀出來，問問自己：讀完這句，我知道他「為了什麼」嗎？知道他「要做什麼」嗎？知道他「願意放下什麼」嗎？答不出的那一問，就是這張卡缺少的。',
      event: '想像你就是事件卡中的同學：失敗之後，「再用同一個方法」和「換一個方法」，哪一個比較可能帶來不同的結果？選擇前，先說出你這樣選的原因。',
      nights: '這一輪沒有「猜中歷史」的分數。想一想：哪一個選項是你現在就可以動手去做的？做了之後，處境會有甚麼不同？',
      card: '如果「我的志向」寫得很大，試試把它拆成「今天能做的第一步」。再用志向三問檢查：為了什麼？做什麼？願意放下什麼？',
      clues: '回想三關：少年陽明說得出他為什麼讀書；格竹失敗後他停下來反思；龍場困境中他仍然做眼前能做的事。你的線索最接近哪一種？'
    },

    /* 志向三問（教學設計，不是陽明原話） */
    threeQ: [
      { id: 'q1', short: '意義', text: '為了什麼？（意義）' },
      { id: 'q2', short: '具體', text: '做什麼？（具體）' },
      { id: 'q3', short: '代價', text: '願意放下什麼？（代價）' }
    ],
    cases: [
      { id: 'A', text: '「我的志向是將來很成功。」', ref: [], refNote: '太抽象，缺行動；意義和代價也未說明。' },
      { id: 'B', text: '「我要學會急救，將來在社區幫到有需要的人。」', ref: ['q1', 'q2'], refNote: '最具體，意義也清楚；可再補充願意放下什麼。' },
      { id: 'C', text: '「我想中三考到全級第一。」', ref: ['q2'], refNote: '具體，但意義和代價要補充。' }
    ],
    casesRefNote: '參考分析按大綱參考答案整理（自撰的貼星對照）：不要求唯一答案，只要能用三問解釋。',
    /* 支援模式的句式詞條（自撰） */
    taskChips: ['它說得出為了什麼（意義）', '它說得出要做什麼（具體）', '它說得出願意放下什麼（代價）', '它缺了「為了什麼」', '它缺了「做什麼」', '它缺了「願意放下什麼」'],
    reasonChips: ['我選這個，因為……', '這樣做之後，處境會……', '我想先做的一件小事是……'],
    clueKeywords: ['意義', '為了', '為什麼', '具體', '做什麼', '代價', '放下', '付出', '一問', '二問', '三問'],
    events: [
      { id: 'e1', text: '溫習一星期，測驗仍不合格' },
      { id: 'e2', text: '練了三個月，校隊選拔落選' },
      { id: 'e3', text: '短片上載後幾乎沒人觀看' },
      { id: 'e4', text: '籌辦的活動沒有同學響應' }
    ],
    reactions: [
      { id: 'A', text: '算了，我不適合' },
      { id: 'B', text: '用同一個方法，再用力一次' },
      { id: 'C', text: '停下來檢討，換方法再試' }
    ],
    /* 自學模式：選 A 或 B 後的反思追問（自撰） */
    reflectAsk: {
      A: '暫時休息和放棄不同。這次失敗，是說明「人不行」，還是說明「方法要改」？',
      B: '再用力一次之前，想一想：如果方法不變，結果會不會一樣？'
    },
    nights: [
      { id: 'n1', name: '夜一「孤立」', situation: '身邊沒有人理解你。', img: I + 'l1-night-alone.webp', alt: '孤燈：遠山小屋中，一盞油燈獨自亮着',
        options: [{ id: 'A', text: '等別人先來幫忙' }, { id: 'B', text: '先照顧好身邊的人和自己' }, { id: 'C', text: '放棄原本的追求' }] },
      { id: 'n2', name: '夜二「匱乏」', situation: '資源不足，生活困難。', img: I + 'l1-night-scarcity.webp', alt: '空米缸：簡陋茅屋中幾乎見底的米缸',
        options: [{ id: 'A', text: '等情況好轉' }, { id: 'B', text: '先做眼前能做的小事' }, { id: 'C', text: '向外求助' }] },
      { id: 'n3', name: '夜三「迷惘」', situation: '前路不明，不知道努力有沒有意義。', img: I + 'l1-night-lost.webp', alt: '霧中岔路：夜霧中分成兩條的山路',
        options: [{ id: 'A', text: '先停下來' }, { id: 'B', text: '回想當初為什麼出發' }, { id: 'C', text: '繼續做小事，邊做邊想' }] }
    ],
    nightsNote: '「採取行動」的預設判定（js/config.js 可改）：夜一 B；夜二 B、C；夜三 B、C。各夜 A 屬等待，夜一 C 屬放棄。課堂模式由老師按各組理由最後決定。本環節不以「猜中歷史」計分。',
    revealCard: '龍場處境艱苦，同行者也受環境所困；陽明一面照顧同行的人，一面持續思考，最終悟出向自己內心尋求道理的方向。',
    revealAfter: '他之後提出心即理、知行合一、致良知。',
    clues: [
      { id: 'c1', name: '志向清楚', note: '知道為什麼' },
      { id: 'c2', name: '懂得反思調整', note: '不蠻幹' },
      { id: 'c3', name: '困境中仍然行動', note: '做眼前能做的事' }
    ],
    cluesNote: '這三條是教學設計的歸納，不是陽明原話。',
    card: {
      title: '志向卡', en: 'My Aspiration Card',
      fields: [
        { id: 'zhi', label: '我的志向', help: '用志向三問檢查：為了什麼？做什麼？願意放下什麼？', check: true },
        { id: 'night', label: '我的長夜', help: '最可能遇到的困難' },
        { id: 'oil', label: '我的燈油', help: '遇到困難時的一個做法（可選三線索之一）', clueChips: true }
      ],
      scaffolds: ['我想成為……的人，因為……', '為了這個志向，我願意放下……', '當我想放棄時，我會……'],
      clueChips: ['志向清楚：我會先想清楚為什麼出發', '懂得反思調整：我會停下來檢討，換方法再試', '困境中仍然行動：我會先做眼前能做的一件小事'],
      witness: '見證人簽名（化名或縮寫）',
      exit: '離場券：我的燈油是……',
      teacherAsk: '如果志向太大，可以拆成「今天能做的第一步」是什麼？',
      keepNote: '志向卡會保留到第6節，用於設計行動承諾卡。'
    },
    challenge: { title: '挑戰任務', text: '改寫案例卡 A，並預測這個志向會遇到的三個長夜。', fields: ['改寫後的志向', '長夜一', '長夜二', '長夜三'] },

    /* ---------------- 六個環節（5＋8＋7＋9＋8＋3＝40 分鐘） ---------------- */
    scenes: [
      { id: 's0', name: '夜行令（開場）', short: '夜行令', minutes: 5, shortMinutes: 4,
        goal: '先連結學生自己「想放棄」的經驗，再進入遊戲。',
        mechanic: '領任務、分角色、派燈油（教材：便利貼、簡報、角色牌）',
        phases: [
          { id: 'open', label: '長夜', bg: H + 'hub-far.webp', theme: 'night', strip: false,
            narration: [{ zh: '五百多年前，一盞燈在長夜中亮起。', en: 'More than five hundred years ago, a lamp was lit in the long night.', src: '序章 3–6 秒' }] },
          { id: 'wall', label: '長夜牆', bg: H + 'hub-far.webp', theme: 'night', strip: false,
            caption: '寫下一件你最近想放棄的事。不用署名，不要寫別人的名字。',
            captionEn: 'Write down one thing you have recently wanted to give up. No names — yours or anyone else\'s.',
            teacher: '（2 分鐘）派發便利貼；（1 分鐘）學生貼到黑板「長夜牆」。老師課前已過目，在下方輸入 2 至 3 張（略過涉及私隱或嚴重情緒困擾的），以便利貼形式飄到畫面的長夜牆上。課堂模式不在投影顯示學生個人輸入。' },
          { id: 'announce', label: '宣布遊戲', bg: I + 'l1-study-lamp.webp', theme: 'night',
            narration: [{ zh: '你們是陽明學堂的弟子。五百多年前有一個人，也曾跌入很深的長夜。你們的任務：找出他靠什麼撐下去，再為自己煉成一盞燈。',
              en: 'You are disciples of the Yangming School. Over five hundred years ago, a man also fell into a deep, long night. Your mission: find out what kept him going, then forge a lamp of your own.', needsReview: true, src: '大綱' }],
            teacher: '（2 分鐘）宣布遊戲，派發角色牌、燈油和任務冊。按「注入燈油」播放每組 5 點燈油的動畫；按「隨機分配角色」為每組抽角色。' }
        ],
        questions: [{ q: '為什麼會想放棄？', ref: '太難、看不到進步、沒有人支持、不清楚為什麼要做。' }],
        feedback: '這些原因都很真實。今天我們看一個人怎樣面對同樣的問題。',
        teacherNotes: ['便利貼不用署名，不要寫別人的名字。教師隨機讀 2 至 3 張（事前已看過，略過涉及私隱或嚴重情緒困擾的）。', '自學模式：學生在私人便條寫下想放棄的事（只存本機，可不寫）。'],
        cautions: ['情緒安全：匿名便利貼可能出現較沉重的內容。教師課前先過目，發現涉及嚴重情緒困擾的字句，課後按校本程序轉介學校社工或輔導人員。'],
        timeTips: '時間緊張時，只讀 1 至 2 張便利貼，角色可沿用上一次分配。'
      },
      { id: 's1', name: '關卡一：少年立志', short: '少年立志', minutes: 8, shortMinutes: 7,
        goal: '學生能用「志向三問」分析志向，理解有力量的志向有什麼特質。',
        mechanic: '志向試金石（教材：案例卡、志向三問提示卡）',
        phases: [
          { id: 'story', label: '故事', theme: 'night', strip: false, bg: I + 'l1-dialog.webp',
            teacher: '教師講，約 1 分鐘。',
            narration: [
              { zh: '一位少年問老師：', en: 'A boy once asked his teacher,', img: I + 'l1-dialog.webp', src: '序章 9–10 秒' },
              { zh: '「何為人生第一等事？」', en: '“What is the most important thing in life?”', img: I + 'l1-dialog.webp', src: '序章 11–13 秒' },
              { zh: '「自然是讀書登第。」', en: '“To study and pass the imperial examinations, of course.”', img: I + 'l1-teacher.webp', src: '序章 14–17 秒' },
              { zh: '少年心想：恐怕未必。', en: 'The boy had his doubts.', img: I + 'l1-dialog.webp', src: '序章 18–20 秒' },
              { zh: '「我認為，應是讀書學做聖賢。」', en: '“I think it is to study and learn to become a sage.”', img: I + 'l1-brush.webp', fx: 'brushFlame', src: '序章 21–24 秒' },
              { zh: '他一生的志向，自此確立。', en: 'From that moment, his lifelong aspiration took root.', img: I + 'l1-hands-flame.webp', src: '序章 25–26 秒' }
            ] },
          { id: 'task', label: '志向試金石', theme: 'paper', layout: 'task',
            caption: '每張案例卡答到哪一問，就把一顆星拖到那一問的格子（每張最多 3 星）。',
            captionEn: 'Drag a star onto each question a case card answers (up to 3 stars per card).',
            teacher: '任務 5 分鐘。各組用實體案例卡逐張檢驗，每答到一問就貼一顆星；選出最有力量的一張，寫一句理由。燈油：理由合理 +1；能指出另一張卡缺了哪一問，並寫出改善版本 +1。' },
          { id: 'reveal', label: '揭曉', theme: 'night', bg: I + 'l1-hands-flame.webp',
            teacher: '揭曉 2 分鐘：金光掃過三張卡。' },
          { id: 'discuss', label: '提問', theme: 'paper' }
        ],
        reveal: { text: '連陽明的志向「做聖賢」，也要回答這三問。', text2: '志向不是越大越好，而是說得出為什麼、做什麼、願意付出什麼。' },
        questions: [
          { q: '三張案例中，哪一個志向最有力量？為什麼？', ref: '不要求唯一答案，只要能用三問解釋。例如 B 最具體，意義也清楚；A 太抽象，缺行動；C 具體，但意義和代價要補充。' },
          { q: '如果你要幫 A 的同學把志向補完整，你會問他什麼？', ref: '「你想成為怎樣的人？成功是指什麼？你願意為此放下什麼？」' }
        ],
        feedback: '能問出「為什麼」的同學，已經在立志了。',
        teacherNotes: ['「志向三問」是本節的教學設計，不是陽明原話，計劃書內需寫明。', '自學模式：提交後並排顯示「你的貼星」與「參考分析」，用「相同／不同」呈現，不判對錯；理由達字數門檻且提到其中一問就 +1；寫出改善版本再 +1。'],
        cautions: ['遊戲不要壓過價值：燈油只用來呈現決定與理由。'],
        timeTips: '時間緊張時，縮短討論，保留「揭曉」；可只處理案例卡 A 與 B。'
      },
      { id: 's2', name: '關卡二：格竹之困', short: '格竹之困', minutes: 7, shortMinutes: 6,
        goal: '學生能分辨「堅持」與「硬撐」，明白堅毅包含反思與調整。',
        mechanic: '失敗事件卡＋重來卡（教材：事件卡、反應牌）',
        phases: [
          { id: 'story', label: '故事', theme: 'night', strip: false, bg: I + 'l1-bamboo-day.webp',
            teacher: '教師講，約 1 分鐘。學術依據見臺大碩論第二章「格竹子失敗：錯用工夫」。',
            narration: [
              { zh: '後來，他對竹靜思，欲窮其理。', en: 'Later, he sat before the bamboo, seeking its principle.', img: I + 'l1-bamboo-day.webp', src: '序章 28–30 秒' },
              { zh: '日以繼夜，苦思多日，卻一無所得，反而病倒。', en: 'Day after day he pondered, found nothing, and fell ill.', img: I + 'l1-bamboo-night.webp', src: '序章 31–35 秒' },
              { zh: '他開始反思：是否方法有誤？', en: 'He began to ask: was his method wrong?', img: I + 'l1-sick-window.webp', src: '序章 36–38 秒' }
            ] },
          { id: 'task', label: '失敗事件卡', theme: 'paper', layout: 'task',
            caption: '抽一張事件卡，再在三張反應牌中選一張，並說出理由。',
            captionEn: 'Draw an event card, choose one of three reaction cards, and explain why.',
            teacher: '任務 4 分鐘。燈油：選 A −2；選 B −1；選 C +1；任何選擇只要理由合理 +1。每組有一張重來卡，可抵銷一次扣減，並重新選擇。扣燈油以「燈火搖曳變暗」表示。' },
          { id: 'reveal', label: '揭曉', theme: 'night', bg: I + 'l1-sick-window.webp' },
          { id: 'discuss', label: '提問', theme: 'paper' }
        ],
        reveal: { text: '陽明沒有因格竹失敗而放棄，他繼續尋找自己的路。', text2: '重來卡的意思：失敗不是結束。' },
        questions: [
          { q: '堅持下去，等於一直用同一個方法嗎？', ref: '不等於。堅毅包括停下來反思，再調整方法。' },
          { q: '選 A 的同學，原因合理嗎？', ref: '可能是覺得能力不足、沒有資源。教師回應：暫時休息和放棄不同；失敗多數說明方法要改，不一定說明人不行。' }
        ],
        feedback: '堅毅不是不停用力，而是跌倒後仍然想辦法。',
        teacherNotes: ['學術依據見臺大碩論第二章「格竹子失敗：錯用工夫」。', '選 A 或 B 後，畫面即時提示可以使用重來卡。', '自學模式：隨機抽卡；理由達字數門檻即 +1；選 A 或 B 後先顯示一句反思追問，再讓學生決定是否使用重來卡。'],
        cautions: ['扣燈油不用紅色或警告音；數字用淡墨色。'],
        timeTips: '時間緊張時，全班共用同一張事件卡，各組只選反應牌並由匯報員一句說明理由；保留揭曉。'
      },
      { id: 's3', name: '關卡三：龍場長夜', short: '龍場長夜', minutes: 9, shortMinutes: 8,
        goal: '學生看到陽明在最艱難的處境仍然採取行動，並歸納出他的「燈油」。',
        mechanic: '長夜三抉擇＋燈油線索（教材：情境卡、抉擇紙、揭曉卡）',
        phases: [
          { id: 'story', label: '故事', theme: 'night', strip: false, bg: I + 'l1-memorial.webp',
            teacher: '教師講，約 2 分鐘。為保留懸念，「照料隨從」和「悟道」留到揭曉才播（大綱內容不變，只是拆成「抉擇前」和「揭曉後」兩段）。學術依據見臺大碩論摘要。',
            narration: [
              { zh: '他因上疏直言，觸怒權貴，被貶至偏遠的貴州龍場。', en: 'For speaking out frankly, he offended the powerful and was banished to remote Longchang in Guizhou.', img: I + 'l1-memorial.webp', src: '序章 40–43 秒' },
              { zh: '龍場地處偏遠，環境艱苦。', en: 'Longchang was remote, and life there was harsh.', img: I + 'l1-exile-river.webp', needsReview: true, src: '大綱描述' },
              { zh: '他在長夜中反覆思考。', en: 'Through the long nights, he thought things over again and again.', img: I + 'l1-cave.webp', needsReview: true, src: '大綱描述' }
            ] },
          { id: 'nights', label: '長夜三抉擇', theme: 'night', layout: 'task', bg: I + 'l1-cave.webp',
            caption: '每輪一張情境卡：選一個行動並寫理由，再看揭曉卡，比較自己的決定與陽明的做法。',
            captionEn: 'One situation card per round: choose an action and give a reason, then compare with the reveal card.',
            teacher: '任務 5 分鐘，三輪，每輪約 1.5 分鐘（獨立倒數）。燈油：選擇採取行動的選項 +1；理由合理 +1。本環節不以「猜中歷史」計分。' },
          { id: 'reveal', label: '揭曉', theme: 'night', strip: false, bg: I + 'l1-porridge.webp',
            teacher: '揭曉史實，約 1 分鐘。',
            narration: [
              { zh: '處境艱苦，他仍親自照料隨從。', en: 'In hardship, he still cared for his companions himself.', img: I + 'l1-porridge.webp', src: '序章 45–47 秒' },
              { zh: '長夜漫漫，他獨自靜坐反思，直到一夜，他豁然大悟：', en: 'Through the long nights, he sat alone in reflection, until one night, it dawned on him:', img: I + 'l1-cave.webp', src: '序章 48–53 秒' },
              { zh: '道理不假外求，就在本心。', en: 'truth need not be sought outside; it lies within one’s own heart.', img: I + 'l1-eyes.webp', fx: 'burst', src: '序章 54–56 秒' },
              { zh: '聖人之道，吾性自足', en: 'The Way of the sages is complete within my own nature.', img: I + 'l1-dawn.webp', fx: 'title', src: '序章 55–56 秒（畫面標題）' }
            ] },
          { id: 'clues', label: '燈油線索', theme: 'night', layout: 'task', bg: I + 'l1-dawn.webp',
            caption: '各組匯報一條線索，放進三個燈油瓶。',
            captionEn: 'Each group reports one clue and places it in one of the three oil jars.',
            teacher: '燈油線索匯總（2 分鐘）：各組匯報一條線索，老師把全班答案拖進三個「燈油瓶」。三瓶注滿時燈火更亮。這三條是教學設計的歸納，不是陽明原話。' },
          { id: 'discuss', label: '提問', theme: 'paper' }
        ],
        questions: [
          { q: '陽明在龍場，靠什麼撐下去？', ref: '他有清楚的志向；格竹的經驗使他反思方法；在困境中他仍然思考和行動。' },
          { q: '這三條線索，你最缺哪一條？', ref: '沒有標準答案。教師引導學生把答案帶到下一環節的志向卡。' }
        ],
        feedback: '長夜不會因為你等待而過去，但一點燈火可以讓你繼續走。',
        teacherNotes: ['龍場時期的處境與悟道，學術依據見臺大碩論摘要。', '燈油三線索屬教學設計的歸納，不是陽明原話。'],
        cautions: ['本環節不以「猜中歷史」計分。'],
        timeTips: '時間緊張時，三夜改為全班一起選（舉手或小組牌），每夜約 1 分鐘；保留揭曉與燈油線索匯總。'
      },
      { id: 's4', name: '煉燈：志向卡', short: '煉燈', minutes: 8, shortMinutes: 7,
        goal: '學生把所學轉化為個人志向，作為第6節行動承諾的起點。',
        mechanic: '煉卡三步＋見證人（教材：志向卡、火種貼紙）',
        phases: [
          { id: 'explain', label: '派卡說明', theme: 'paper', bg: I + 'l1-study-lamp.webp', strip: false,
            teacher: '（1 分鐘）派發志向卡，說明三欄：「我的志向」（用志向三問檢查）、「我的長夜」（最可能遇到的困難）、「我的燈油」（遇到困難時的一個做法，可選三線索之一）。' },
          { id: 'forge', label: '煉卡', theme: 'paper', layout: 'task', strip: false,
            caption: '個人填寫：每完成一欄，飛來一枚火種；三欄齊即「點亮」志向卡。',
            captionEn: 'Fill in each column on your own: each one earns a spark; complete all three to light your card.',
            teacher: '（4 分鐘）學生個人填寫。守燈人每完成一欄，向教師換一枚火種貼紙，三欄齊即「點亮」志向卡。教師巡視追問：如果志向太大，可以拆成「今天能做的第一步」是什麼？' },
          { id: 'duel', label: '試金石對決', theme: 'paper', strip: false,
            caption: '兩人一組，互問志向三問的其中一問；聽完回答後，在「見證人」欄簽名。',
            captionEn: 'In pairs, ask each other one of the three questions, then sign as each other’s witness.',
            teacher: '（3 分鐘）兩人一組；畫面隨機抽出志向三問其中一問讓雙方互問；聽完回答後在「見證人」欄簽名（化名或縮寫）。' }
        ],
        questions: [],
        feedback: '',
        teacherNotes: ['志向卡會保留到第6節，用於設計行動承諾卡。', '教師巡視追問：如果志向太大，可以拆成「今天能做的第一步」是什麼？', '課堂上學生填寫實體志向卡（A5）；網站畫面可作示範，自學模式則直接在此填寫並存入回顧盒。'],
        cautions: ['名字欄位一律寫「化名或學號（可留空）」，不要求真實姓名。'],
        timeTips: '時間緊張時，試金石對決縮短為 1 分鐘（只問一問）。'
      },
      { id: 's5', name: '志燈牆結算', short: '志燈牆', minutes: 3, shortMinutes: 3,
        goal: '合併全班燈油點亮志燈牆，表揚行為，並以離場券連結下一節。',
        mechanic: '合併燈油、頒徽章、離場券（教材：志燈牆、徽章卡）',
        phases: [
          { id: 'wall', label: '志燈牆', theme: 'night', bg: H + 'hub-far.webp',
            teacher: '（1 分鐘）各組把燈油換成紙火焰，貼到志燈牆，每點一枚。全班燈火合併，達到預設目標（如 32 枚）即「長夜點亮」。' },
          { id: 'badges', label: '頒發徽章', theme: 'night', bg: H + 'hub-lights.webp',
            teacher: '（1 分鐘）頒發徽章，依據觀察表：立志者（志向卡完整具體）、不屈者（在失敗事件中選擇反思再試）、同行者（主動幫助或鼓勵他人）。' },
          { id: 'exit', label: '離場券', theme: 'night', strip: false, bg: I + 'l1-lamp-end.webp',
            teacher: '（1 分鐘）離場券：在志向卡背面寫一句「我的燈油是……」。預告第2節。',
            narration: [{ zh: '「志不立，天下無可成之事。」', en: '“Without a firm aspiration, nothing in the world can be accomplished.”', src: '序章 60–62 秒' }] }
        ],
        endQuote: '志不立，天下無可成之事',
        endQuoteEn: 'Without a firm aspiration, nothing in the world can be accomplished.',
        nextPreview: '預告第2節：看見別人受苦時，你為什麼會不忍？',
        questions: [],
        feedback: '',
        teacherNotes: ['課堂句：以「志不立，天下無可成之事」作總結（大綱）。', '徽章表揚行為，不單看分數；不顯示「最多徽章」之類統計。', '大綱預設目標 32 枚；8 組起始已共 40 點，老師可按實際人數在教師控制台調整目標。'],
        cautions: ['不設組間排名：各組按組號固定排列，不排序，不比較高低。'],
        timeTips: '時間不足時，老師可直接按「觸發長夜點亮」動畫，徽章留待下一節開首頒發。'
      }
    ],

    observation: [
      { indicator: '運用志向三問', standard: '能用三問解釋志向的優劣', scene: '關卡一', record: '組別任務冊、教師巡視' },
      { indicator: '區分堅持與硬撐', standard: '能說明堅毅包括反思和調整', scene: '關卡二', record: '反應牌理由、口頭回答' },
      { indicator: '困境中的行動', standard: '能提出具體可做的小行動', scene: '關卡三', record: '抉擇紙' },
      { indicator: '個人志向', standard: '志向卡三欄完整，志向具體', scene: '煉燈', record: '志向卡、離場券' }
    ],
    differentiation: {
      support: ['提供句式支架卡、圖像化的志向三問提示卡', '角色分配時，領航員由理解較快的同學擔任'],
      challenge: ['挑戰任務：改寫案例卡 A，並預測這個志向會遇到的三個長夜'],
      crossSubject: '與中文科合作，可延伸閱讀與「立志」相關的名句與短文。'
    },
    cautions: ['情緒安全：匿名便利貼可能出現較沉重的內容。教師課前先過目，發現涉及嚴重情緒困擾的字句，課後按校本程序轉介學校社工或輔導人員。',
      '遊戲不要壓過價值：燈油只用來呈現決定與理由；時間緊張時，縮短討論，保留「揭曉」，因為教學重點在揭曉環節。',
      '匿名要求：所有教材不得出現學校名稱、校徽或教師姓名。',
      '圖像與引文：陽明畫像、插圖等需註明出處，確認可合法使用。'],
    verify: ['少年陽明「人生第一等事」的對話：核對《王陽明年譜》',
      '格竹的細節（時間、同行者、病倒的經過）',
      '龍場時期的處境與悟道細節，揭曉卡文字需按史料寫定',
      '「志向三問」與「燈油三線索」屬教學設計，計劃書內不要寫成陽明或官方論述原話',
      '全班人數與分組數量，燈油目標（如 32 枚）需按實際人數調整'],
    references: ['黃文樹（2021）〈徐復觀對陽明心學教育觀的理解與應用〉，《南臺人文社會學報》第25期：致良知的工夫包括立志、自信、克己精察、事上磨煉等，立志是其中一項。',
      '臺大佛學數位圖書館收錄的陽明與正念療法對比碩士論文：第二章依序討論儒門家風、成聖之志、格竹子失敗、出世與入世的抉擇、龍場悟道，可作三幕故事的骨架。',
      '背景資料（非學術）：香港首屆陽明心學國際論壇暨「陽明學堂」揭牌儀式新聞稿，特首致辭引用「志不立，天下無可成之事」。'],
    materials: ['簡報（由本網站取代）', '夜行令（開場文字）與角色牌（4種）', '燈油籌碼（每組5枚）與志燈牆海報、紙火焰', '志向案例卡（A、B、C）與「志向三問」提示卡',
      '失敗事件卡（4張）與反應牌（A、B、C）', '重來卡、請教卡（每組各1張）', '長夜情境卡（3張）、抉擇紙、史實揭曉卡', '志向卡（A5，附句式支架）與火種貼紙', '徽章卡（立志者、不屈者、同行者）', '教師觀察表'],
    ui: {
      wallTitle: '長夜牆', wallEmpty: '（老師可在教師面板輸入 2 至 3 張已過目的便利貼）', wallInput: '輸入一張已過目的便利貼內容（不含姓名）',
      selfNote: '我的私人便條（只存在本機，可不寫）',
      fillOil: '注入燈油', randomRoles: '隨機分配角色',
      starTray: '星星', bestPick: '我認為最有力量的一張', bestReason: '一句理由（試用志向三問說明）',
      missPick: '另選一張卡：它缺了哪一問？', improve: '寫出改善版本', submit: '提交，看參考分析',
      yourStars: '你的貼星', refStars: '參考分析', same: '相同', diff: '不同',
      drawEvent: '抽事件卡', reasonLabel: '說出理由', redoUse: '使用重來卡', redoHint: '可以使用重來卡：抵銷這次扣減，並重新選擇。',
      reasonOk: '理由合理 +1', improveOk: '指出缺問並改善 +1', actionOk: '採取行動 +1',
      bottlesTitle: '燈油瓶', clueInput: '輸入一組匯報的線索', addClue: '放入燈油瓶',
      duelDraw: '隨機抽一問', duelQ: '請向對方提問：',
      lit: '志向卡已點亮', save: '存入回顧盒', png: '下載 PNG', print: '列印（A5）',
      goalBtn: '燈油化作紙火焰，飛上志燈牆', exitTitle: '離場券'
    }
  };
})();
