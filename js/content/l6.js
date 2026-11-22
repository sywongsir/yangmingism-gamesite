/* ==========================================================
   第6節《同心圈》由我到天下（國民身份認同・實踐）── 全部文字內容；本節同時是全單元總結
   老師核對史料後可直接修改本檔文字，不用碰程式。
   needsReview:true ＝ 英文為輔助翻譯，待老師核對。
   「自撰」＝網站設計者撰寫（介面指示、不忍度牌說明、英文副字幕），非大綱原文。
   ========================================================== */
window.XC = window.XC || {};
XC.content = XC.content || {};
(function () {
  var I = 'assets/img/l6/';
  XC.content.l6 = {
    id: 'l6', no: 6, game: '同心圈', tagline: '由我到天下',
    title: '萬物一體：命運與共的團結復興之路',
    value: '國民身份認同', level: '實踐', output: '行動承諾卡', icon: 'ripple', theme: 'night',
    coreQuestion: '當我們說「同舟共濟」，我可以先做的一件事是什麼？',
    valueLink: '本節是國民身份認同的實踐與歸屬層面（學習要點：團結），同時是全單元總結。',
    storyline: '全班一張「同心圈」大海報，由「我」向外擴展到家、班校、社區（香港）、國家、世界和自然。學生在每一圈做出連結，清除「隔閡」，最後訂下自己的「行動承諾」。',
    focus: ['陽明的「萬物一體」與「一體之仁」：關懷由身邊人推及萬物', '傳統「一體」觀念與官方論述中「人類命運共同體」、人與自然和諧共生的精神相通', '把理解轉化為行動：設計個人「行動承諾」，並與香港或國家的一個關懷點連結（團結列入學習要點）'],
    noRanking: '設計說明：學生可以由家人、班級、社區開始承諾，但承諾須連結社區（香港）、國家、世界或自然其中至少一圈；不要求每人都選國家層面，也不評價承諾的「愛國程度」。團結值不設組間排名。',

    /* 資源：團結值（每組：合作方式最多 3＋化解隔閡最多 2）；全班共同目標：同心圈小旗＝全班人數 × 0.8（可改） */
    resource: { name: '團結值', unit: '團結值', start: 0, goalName: '同心圈', goalDone: '同心圈亮起', capC: 3, capB: 2, capMsg: '團結值上限 3＋2：每圈有具體合作方式最多 3 分，化解隔閡最多 2 分' },
    roles: [],
    rolesNote: '大綱本節沒有指定角色，小組統稱「同心隊」；教師可在教師面板選擇沿用前幾節的角色。',
    team: '同心隊',
    badges: [
      { id: 'tongxin', name: '同心者', desc: '任務單有跨圈合作' },
      { id: 'poge', name: '破隔者', desc: '能化解隔閡' },
      { id: 'zhumeng', name: '築夢者', desc: '承諾具體可行' }
    ],
    props: [],
    hints: {
      ladder: '先想像自己真的看見那個情境。你在哪一步開始覺得「與我無關」？',
      puzzle: '先按時間排：孟子（戰國）→ 張載（北宋）→ 陽明（明）→ 今日。再為每張卡配「關心的範圍」。',
      task: '先點選受影響的圈層，再為每圈寫「我可以……」「一起做的人是……」。',
      card: '好的承諾不是最大的，而是最能做得到的：誰、做什麼、何時。'
    },
    pre: '課前：提醒學生帶回「單元回顧盒」（志向卡、良知時刻卡、知行對照表、磨煉日誌、解碼卡和契合報告）；網站的「我的回顧盒」就是其電子版。',

    /* 七個圈（由內至外） */
    circles: [
      { id: 'me', name: '我', icon: 'lamp', alt: '一盞燈' },
      { id: 'home', name: '家', icon: 'eaves', alt: '屋簷' },
      { id: 'school', name: '班校', icon: 'desk', alt: '書桌' },
      { id: 'hk', name: '社區（香港）', icon: 'city', alt: '泛化的香港城市剪影' },
      { id: 'nation', name: '國家', icon: 'wall', alt: '山河與長城' },
      { id: 'world', name: '世界', icon: 'globe', alt: '地球輪廓' },
      { id: 'nature', name: '自然', icon: 'crane', alt: '山水白鶴' }
    ],
    outer: ['hk', 'nation', 'world', 'nature'],
    outerRule: '承諾須連結社區（香港）、國家、世界或自然其中至少一圈（可同時選內圈）。',

    /* 環節一：一體階梯 */
    recall: { text: '看見孺子將入井，人人都會不忍。', src: '回顧第2節', img: 'assets/img/l2/l2-well.webp' },
    ladder: [
      { id: 'child', name: '孺子將入井', img: I + 'l6-step-child.webp', alt: '漣漪中的孩童（淡墨意境）' },
      { id: 'bird', name: '鳥獸哀鳴', img: I + 'l6-step-bird.webp', alt: '漣漪中的鳥（淡墨意境）' },
      { id: 'grass', name: '草木被折', img: I + 'l6-step-grass.webp', alt: '漣漪中的草（淡墨意境）' },
      { id: 'stone', name: '瓦石被毀', img: I + 'l6-step-stone.webp', alt: '漣漪中的瓦石（淡墨意境）' }
    ],
    ladderNote: '漣漪中的意境，照短片 91–94 秒；不畫血腥或殘忍畫面。孺子卡取自短片漣漪中的孩童畫面。',
    levels: [{ n: 1, name: '1' }, { n: 2, name: '2' }, { n: 3, name: '3' }],
    levelsNote: '不忍度牌（1 至 3）：1＝少許不忍，3＝十分不忍（說明為自撰）。老師輸入人數，畫面以墨點顯示，不計分。',
    ladderAsk: '思考：你在哪一步開始覺得「與我無關」？',
    explain: {
      text: '陽明在《大學問》中的看法：這種「一體之仁」連普通人也有；只是當人被私欲遮蔽，利害相爭，一體之仁就會失去。',
      note: '《大學問》原文需由教師淺白改寫，並註明出處；原文引述見陳來的論文（儒家網轉載）。',
      gapIntro: '引出「隔閡卡」：只顧自己、怕吃虧、覺得與我無關、意見不同（呼應第2節塵埃卡、第3節裂縫卡）。',
      announce: '你們是同心隊，要把「我」的圈，一圈一圈連到天下。'
    },
    gaps: [
      { id: 'g1', name: '只顧自己' }, { id: 'g2', name: '怕吃虧' }, { id: 'g3', name: '覺得與我無關' }, { id: 'g4', name: '意見不同' }
    ],

    /* 環節二：脈絡拼圖 */
    source: {
      title: '來源說明', en: 'About these sources', ok: '明白，開始',
      text: '接下來的資料，都是官方論述和學者的詮釋。我們先看懂它說什麼，再用自己的頭腦檢驗。本節不要求表態，亦不以立場評分。',
      textEn: 'The materials that follow are official statements and scholarly interpretations. First we understand what they say, then we test them with our own minds. You are not asked to take a side, and no one is graded on their stance.',
      kinds: ['孟子、張載、陽明：傳統典籍（經教師淺白改寫）', '人類命運共同體、人與自然：官方論述', '陽明與共同體的關係：學者詮釋', '脈絡拼圖：教學設計'],
      note: '同第5節來源說明卡（說明文字為自撰）。'
    },
    puzzle: [
      { id: 'A', who: '孟子', era: '戰國', idea: '不忍之心（第2節）', range: '眼前受苦的人', key: ['不忍', '惻隱'], img: 'assets/img/l2/l2-well.webp' },
      { id: 'B', who: '張載', era: '北宋', idea: '「民胞物與」：人人是同胞，萬物是同伴。', range: '同胞與萬物', key: ['同胞', '同伴'], img: I + 'l6-step-grass.webp' },
      { id: 'C', who: '陽明', era: '明', idea: '「萬物一體」：視天下猶一家，中國猶一人。', range: '天地萬物', key: ['一家', '一人'], img: I + 'l6-ripples.webp' },
      { id: 'D', who: '今日論述', era: '今日', idea: '人類命運共同體、人與自然和諧共生。', range: '各國人民與自然', key: ['共同體', '和諧共生'], img: I + 'l6-jade-city.webp' }
    ],
    puzzleRule: '四張概念卡按時間排序，並為每張填「關心的範圍」（可拖放範圍詞條）。每排對一張，畫面多擴出一圈漣漪。',
    puzzleNote: '脈絡拼圖是教學設計；來源和學者觀點見本節補充文獻。',
    teach: [
      { k: '人類命運共同體', t: '官方論述指出，習近平 2013 年 3 月在莫斯科國際關係學院的演講中首次闡述；2017 年寫入黨章；2018 年修憲時增加「推動構建人類命運共同體」。其內涵可概括為持久和平、普遍安全、共同繁榮、開放包容、清潔美麗的世界。' },
      { k: '人與自然', t: '習近平曾引用「順應自然、追求天人合一」，官方論述也強調人與自然是生命共同體。' },
      { k: '學者觀點', t: '有學者認為，陽明的良知與國家、天下貫通，可對接中華民族共同體和人類命運共同體；也有學者指出，傳統思想是人類命運共同體的文化資源。' }
    ],
    distinguish: {
      text: '以上都是「精神相通」或「文化資源」的詮釋，並不是證明今日論述直接源自陽明。',
      tong: { name: '相通', desc: '兩個圓部分重疊：精神上有共同點' },
      lai: { name: '來自', desc: '一條箭嘴：有直接的承繼關係，需要證據' }
    },
    wordNote: '用字：大綱原文「顺应自然」中的「顺」是簡體字，網站一律寫「順應自然」。',

    /* 環節三：同心圈闖關（案例均為假設情境） */
    cases: [
      { id: 'A', name: '樓下的長者', look: 'elder', text: '屋苑裡一位獨居長者，常常一個人在大堂等候，沒有人跟他說話。', alt: '屋苑大堂獨坐的長者（淡墨）' },
      { id: 'B', name: '海灘的垃圾', look: 'beach', text: '假日郊遊後，一個海灘遍地垃圾，海洋生物可能被纏住。', alt: '遍地垃圾的海灘與海龜剪影（淡墨）' },
      { id: 'C', name: '遠方的水災', look: 'flood', text: '某個遠方地區發生嚴重水災，很多家庭失去家園，各地都有人想幫忙，卻不知從何開始。', alt: '遠方水災的淡墨意境（不出現傷亡）', note: '不指涉具體國家；畫面不出現傷亡' }
    ],
    caseNote: '案例均為假設情境，不指涉具體國家或真實個案。',
    drawRule: '說明規則，每組抽一張案例卡和一張隔閡卡（1 分鐘）。',
    sheet: {
      title: '同心圈任務單', en: 'Concentric Circles Task Sheet',
      q1: '①這件事影響哪些圈層的人或事物？（點選圈層，被選的圈亮起）',
      q2: '②每一圈可以怎樣合作？',
      can: '我可以……', with: '一起做的人是……',
      q3: '③抽到的隔閡卡，如何化解？',
      fog: '隔閡在兩圈之間是一道墨霧牆，寫好化解方法後霧散；可引用第3節橋板。',
      fixPH: '我們可以這樣化解：……',
      score: '團結值：每圈有具體合作方式 +1（最多 3 分）；化解隔閡 +1（最多 2 分）。',
      second: '再抽一張隔閡卡（化解隔閡最多 2 分）'
    },
    reportRule: '匯報（3 分鐘）：三個案例各選 1 組，各 1 分鐘。',
    sumText: '合作要由具體的第一步開始，隔閡可以用橋板（第3節）化解。',

    /* 環節四：行動承諾（對接教育局「我的行動承諾」學生手冊六步驟） */
    steps: ['自我評估', '訂定目標', '制定及選擇方案', '檢視修正及確立', '實踐及行動', '檢討及反思'],
    stepsNote: '本節完成步驟一至四，後兩步在課後跟進（開封跟進頁）。教育局手冊步驟名稱以 2026 年版為準。',
    selfEval: {
      title: '步驟一・自我評估', lead: '打開「單元回顧盒」：點選一條最有感的句子，自動貼到行動承諾卡第一欄。',
      none: '讀不到本機紀錄（可能用了另一部裝置）：請手動輸入，或從紙本抄錄。',
      label: '最有感的一句', ph: '從回顧盒點選，或手動輸入'
    },
    promise: {
      title: '行動承諾卡', en: 'My Action Pledge',
      fields: [
        { id: 'zhi', label: '我的志向', ph: '我的志向是……，所以我會……', help: '可由第1節志向卡改寫；有紀錄就預先帶入。' },
        { id: 'act', label: '我的行動：誰、做什麼、何時', ph: '我會在（時間）前，為（對象）做……', help: '小而具體。' },
        { id: 'ring', label: '我的同心圈', help: '至少選社區（香港）、國家、世界或自然其中一圈，可同時選內圈。' },
        { id: 'gap', label: '我可能遇到的隔閡，以及我的橋板（第3節）', ph: '可能的隔閡是……，我的橋板是……' },
        { id: 'mark', label: '完成標記與見證人', ph: '我會用……證明我做到了，見證人是……' }
      ],
      scaffolds: ['我的志向是……，所以我會……', '我會在（時間）前，為（對象）做……', '可能的隔閡是……，我的橋板是……', '我會用……證明我做到了，見證人是……'],
      examples: ['為鄰近長者製作並送上手工咭（延續第4節任務 C）', '向家人講解一個學到的傳統智慧', '參與校內慶祝香港特區成立三十周年的活動', '減少一次性用品', '在班上推動一個「說到做到」的小約定'],
      exNote: '承諾示例供選用，點選帶入再修改；「慶祝香港特區成立三十周年」活動需配合學校實際安排。',
      three: ['夠小、夠具體嗎？', '連結到別人了嗎？', '怎知做到了？'],
      threeLead: '互評「承諾三問」（3 分鐘，步驟四）：對方提出建議，再修訂。',
      adviceLabel: '對方的建議（可不寫）', adviceSelf: '自學時：用三問自我檢查，再修訂一次。',
      pledge: '從今天起，我承諾……',
      signLead: '朗讀一句「從今天起，我承諾……」；在卡上簽名（化名或縮寫，可用手寫簽名板）；卡放進承諾信封，設定開封日期（預設兩至三星期後；日期前信封鎖著）。',
      signName: '簽名（化名或縮寫）', padLabel: '手寫簽名板（可不用）',
      openLabel: '開封日期', defaultDays: 14, quick: [{ d: 14, name: '兩星期後' }, { d: 21, name: '三星期後' }],
      sealBtn: '放進承諾信封・封存', sealed: '已封存：開封日期前信封鎖著。開封時到「開封跟進」頁完成步驟五、六。',
      privacy: '承諾由學生自主決定；教師不評價承諾的「愛國程度」；不要求公開承諾的內容。',
      fb: '好的承諾不是最大的，而是最能做得到的。'
    },

    /* 環節五：同心圈結算 */
    flags: {
      rule: '各組把承諾摘要做成小旗（為保障私隱，小旗只顯示圈層和一個圖示，不顯示內容）插到同心圈對應圈層；全班圈圈相連，金色同心圈逐層亮起。',
      classInput: '輸入各圈小旗數（不記名、不顯示內容）。', selfNote: '你的小旗按承諾卡選的圈層自動插上（只顯示圈層和圖示）。'
    },
    unitQ: { q: '個人的小行動，和「民族復興」「人類命運共同體」這些大目標，有什麼關係？', ref: '大目標由很多人的小行動組成；也有人認為兩者的關係不一定直接，要看行動是否真正連結到別人。官方論述把實現中華民族偉大復興列為新時代堅持和發展中國特色社會主義的奮鬥目標。' },
    exit: '離場券：我承諾的第一步是……',

    /* 跟進頁 #/l6/open（P1） */
    open: {
      title: '開封跟進', en: 'Follow-up: Opening the Pledge Envelope',
      lead: '兩至三星期後開封：檢討與反思（手冊步驟五、六）。',
      locked: '開封日期前信封鎖著。', count: '距離開封還有',
      none: '這部裝置找不到第6節的承諾信封。你可以先寫下承諾，或用紙本信封完成跟進。',
      noneLabel: '我的承諾（手動輸入）',
      results: [{ id: 'done', name: '完成' }, { id: 'part', name: '部分完成' }, { id: 'not', name: '未完成' }],
      s5: { title: '步驟五・實踐及行動', label: '我做了什麼', ph: '我在（日期）為（對象）做了……' },
      s6: { title: '步驟六・檢討及反思', fields: [{ id: 'gap', label: '遇到什麼隔閡', ph: '我遇到的隔閡是……' }, { id: 'plank', label: '橋板有沒有用', ph: '我的橋板……（有用／不太有用），因為……' }, { id: 'next', label: '下一步是什麼', ph: '下一步，我會……' }] },
      save: '存回回顧盒', saved: '開封跟進已存回回顧盒',
      noScore: '不論完成與否都不扣分：重要的是檢討和下一步。',
      teacherOpen: '教師可按「提早開封（教師）」作示範。'
    },

    /* ---------------- 五個環節（5＋8＋10＋12＋5＝40 分鐘） ---------------- */
    scenes: [
      { id: 's0', name: '一體階梯', short: '一體階梯', minutes: 5, shortMinutes: 4,
        goal: '回顧良知與孺子入井，認識陽明所說「一體之仁」由人推及萬物，以及它為什麼會被遮住。',
        mechanic: '一體階梯、不忍度牌、隔閡卡（教材：一體階梯卡 4 張、不忍度牌）',
        phases: [
          { id: 'open', label: '同心圈', bg: I + 'l6-waterside.webp', theme: 'night', strip: false,
            teacher: '序章 89–94 秒：陽明在水邊伸手點出漣漪；漣漪中依次出現鳥、草、瓦石。' + '（課前：提醒學生帶回「單元回顧盒」。）',
            narration: [
              { zh: '陽明晚年倡導「萬物一體」：', en: 'In his later years, Yangming taught “oneness with all things”:', img: I + 'l6-waterside.webp', src: '序章 89–90 秒' },
              { zh: '由人及物，與天地萬物相連。', en: 'from people to plants and stones, all are connected.', img: I + 'l6-ripples.webp', src: '序章 92–94 秒', fx: 'ripple' }
            ] },
          { id: 'recall', label: '回顧第2節', theme: 'night', bg: 'assets/img/l2/l2-well.webp',
            caption: '回顧第2節（1 分鐘）：看見孺子將入井，人人都會不忍。',
            captionEn: 'Recall Lesson 2 (1 minute): anyone who sees a child about to fall into a well feels alarm and compassion.',
            teacher: '（1 分鐘）回顧第2節：看見孺子將入井，人人都會不忍。' },
          { id: 'ladder', label: '一體階梯', theme: 'paper', layout: 'task',
            caption: '一體階梯（2.5 分鐘）：四張卡依次展示，每張卡用「不忍度牌」（1 至 3）表態。你在哪一步開始覺得「與我無關」？',
            captionEn: 'Ladder of oneness (2.5 minutes): four cards in turn; show a 1–3 “can’t-bear-it” card for each. At which step do you start to feel “it has nothing to do with me”?',
            teacher: '（2.5 分鐘）依次展示四張卡：孺子將入井、鳥獸哀鳴、草木被折、瓦石被毀。每張卡學生用「不忍度牌」（1 至 3）表態；老師輸入人數，畫面以墨點顯示。思考：你在哪一步開始覺得「與我無關」？' },
          { id: 'explain', label: '說明與宣布', theme: 'night', bg: I + 'l6-ripples.webp',
            caption: '「你們是同心隊，要把『我』的圈，一圈一圈連到天下。」',
            captionEn: '“You are the Concentric Team: link the circle of ‘me’, ring by ring, to all under heaven.”',
            teacher: '（1.5 分鐘）說明陽明在《大學問》中的看法：這種「一體之仁」連普通人也有；只是當人被私欲遮蔽，利害相爭，一體之仁就會失去。引出「隔閡卡」，宣布遊戲。' },
          { id: 'discuss', label: '提問', theme: 'paper' }
        ],
        questions: [{ q: '為什麼看見草木被折斷，有些人也會覺得可惜？', ref: '覺得它們有生命，或有價值；也有人覺得不會。教師說明，陽明認為這是同一種不忍之心的擴展。' }],
        feedback: '隔閡不是沒有良知，而是良知被蓋住了。這和第2節的塵埃是同一個道理。',
        teacherNotes: ['《大學問》原文需由教師淺白改寫，並註明出處；原文引述見陳來的論文（儒家網轉載）。', '一體階梯卡為漣漪中的淡墨意境（照短片 91–94 秒），不畫血腥或殘忍畫面。'],
        cautions: ['不強迫認同：不忍度牌只作表態，不計分，畫面只顯示墨點。'],
        timeTips: '時間緊張時，四張卡連續展示，只在最後一張請學生舉牌。'
      },
      { id: 's1', name: '脈絡拼圖', short: '脈絡拼圖', minutes: 8, shortMinutes: 7,
        goal: '學生理解傳統「一體」概念與今日論述的精神相通，並學會分辨「相通」與「來源」。',
        mechanic: '來源說明、脈絡拼圖、範圍詞條（教材：脈絡拼圖卡 4 張與資料卡）',
        phases: [
          { id: 'source', label: '來源說明', theme: 'paper', strip: false,
            caption: '來源說明（1 分鐘）：官方論述和學者的詮釋，先理解，再思辨（同第5節來源說明卡）。',
            captionEn: 'About the sources (1 minute): official statements and scholarly interpretations — understand first, then think critically (same as Lesson 5).',
            teacher: '（1 分鐘）來源說明：官方論述和學者的詮釋，先理解，再思辨（同第5節來源說明卡）。' },
          { id: 'puzzle', label: '脈絡拼圖', theme: 'paper', layout: 'task',
            caption: '拼圖（4 分鐘）：四張概念卡按時間排序，並為每張填「關心的範圍」。每排對一張，畫面多擴出一圈漣漪。',
            captionEn: 'Puzzle (4 minutes): put the four idea cards in time order and give each its “circle of care”. Each correct card adds a ripple.',
            teacher: '（4 分鐘）四張概念卡按時間排序，並為每張填「關心的範圍」（可拖放範圍詞條）。每排對一張，畫面多擴出一圈漣漪。' },
          { id: 'teach', label: '講解與辨析', theme: 'paper', bg: I + 'l6-boat-circle.webp',
            caption: '教師講解與辨析（3 分鐘）：「相通」不等於「來自」。',
            captionEn: 'Teacher explains (3 minutes): “resonating with” is not the same as “coming from”.',
            teacher: '（3 分鐘）教師講解：人類命運共同體、人與自然、學者觀點；辨析：以上都是「精神相通」或「文化資源」的詮釋，並不是證明今日論述直接源自陽明。畫面用兩個圓部分重疊表示「相通」，對比一條箭嘴表示「來自」。',
            narration: [
              { zh: '與今日倡議的人類命運共同體，', en: 'resonating with today’s vision of a community with a shared future for humanity', img: I + 'l6-boat-circle.webp', src: '序章 97–99 秒' },
              { zh: '以及人與自然和諧共生，精神相通。', en: 'and with harmony between humanity and nature.', img: I + 'l6-jade-landscape.webp', src: '序章 100–103 秒' }
            ] },
          { id: 'discuss', label: '提問', theme: 'paper' }
        ],
        questions: [
          { q: '四張卡「關心的範圍」有什麼變化？', ref: '由眼前的人，到同胞和萬物，到天地萬物，再到各國人民與自然，範圍越來越大。' },
          { q: '說兩者「相通」，和說後者「來自」前者，有什麼不同？', ref: '相通是精神上有共同點；來自是有直接的承繼關係，需要證據。' },
          { q: '（進階）有學者認為「生命共同體」克服了「天人合一」的抽象理解。你認為傳統說法和今日說法有什麼不同？', ref: '傳統說法多是世界觀和修養，今日論述強調實踐、發展與保護並重。學生可提出其他看法。' }
        ],
        feedback: '能分清「相通」和「來源」，就是做了好的解碼員。',
        teacherNotes: ['脈絡拼圖是教學設計；來源和學者觀點見本節補充文獻。', '用字：大綱原文「顺应自然」中的「顺」是簡體字，網站一律寫「順應自然」。', '「良知貫通國家與天下」是個別學者詮釋，不要寫成共識。'],
        cautions: ['分清相通與來源：不要說成今日論述直接源自陽明。', '說明來源性質：官方論述和學者的詮釋，先理解，再思辨。'],
        timeTips: '時間緊張時，提問三（進階）留作挑戰卡。'
      },
      { id: 's2', name: '同心圈闖關', short: '同心圈闖關', minutes: 10, shortMinutes: 9,
        goal: '學生把「一體」應用到不同圈層，練習合作（團結），並嘗試化解隔閡。',
        mechanic: '案例卡、隔閡卡、同心圈任務單、團結值（教材：案例卡 A、B、C，隔閡卡 4 張，同心圈任務單）',
        phases: [
          { id: 'draw', label: '抽卡', theme: 'paper', layout: 'task',
            caption: '說明規則，每組抽一張案例卡和一張隔閡卡（1 分鐘）。案例均為假設情境。',
            captionEn: 'Rules: each group draws one case card and one barrier card (1 minute). All cases are hypothetical.',
            teacher: '（1 分鐘）說明規則，每組抽一張案例卡和一張隔閡卡（抽卡動畫）。' },
          { id: 'task', label: '同心圈任務單', theme: 'paper', layout: 'task',
            caption: '同心圈任務單（5 分鐘）：①影響哪些圈層 ②每一圈可以怎樣合作 ③隔閡如何化解。',
            captionEn: 'Task sheet (5 minutes): ① which circles are affected ② how each circle can work together ③ how to clear the barrier.',
            teacher: '（5 分鐘）同心圈任務單：①這件事影響哪些圈層的人或事物？（點選圈層，被選的圈亮起）②每一圈可以怎樣合作？（「我可以……」「一起做的人是……」）③抽到的隔閡卡，如何化解？（墨霧牆，寫好化解方法後霧散；可引用第3節橋板）。團結值：每圈有具體合作方式 +1（最多 3 分）；化解隔閡 +1（最多 2 分）。' },
          { id: 'report', label: '匯報', theme: 'paper', layout: 'task',
            caption: '匯報（3 分鐘）：三個案例各選 1 組，各 1 分鐘。',
            captionEn: 'Reports (3 minutes): one group per case, one minute each.',
            teacher: '（3 分鐘）匯報：三個案例各選 1 組，各 1 分鐘。' },
          { id: 'sum', label: '教師歸納', theme: 'night', bg: I + 'l6-boat-circle.webp',
            caption: '教師歸納（1 分鐘）：合作要由具體的第一步開始，隔閡可以用橋板（第3節）化解。',
            captionEn: 'Teacher sums up (1 minute): cooperation starts with a concrete first step; barriers can be cleared with bridge planks (Lesson 3).',
            teacher: '（1 分鐘）教師歸納：合作要由具體的第一步開始，隔閡可以用橋板（第3節）化解。畫面：光環圓框中的同舟（短片 97–99 秒）。' },
          { id: 'discuss', label: '提問', theme: 'paper' }
        ],
        questions: [
          { q: '這件事，只和誰有關？', ref: '不只當事人，還會影響家人、社區、甚至更遠的人和自然。' },
          { q: '為什麼說「同舟共濟」？', ref: '一個人的處境會影響其他人，大家要合作才能解決問題。（畫面：光環圓框中的同舟，短片 97–99 秒）' },
          { q: '世界上有那麼多隔閡，為什麼合作這麼難？', ref: '官方文件指出，世界仍存在發展差距、安全挑戰和治理不足等問題；學生也可提出其他原因，例如利益不同、互不信任。' }
        ],
        feedback: '隔閡不會自己消失，但可以一塊一塊橋板去拆。',
        teacherNotes: ['「同心圈」「隔閡卡」「團結值」屬教學設計。', '案例均為假設情境，不指涉具體國家或真實個案；遠方的水災畫面不出現傷亡。'],
        cautions: ['案例均為假設，不指涉具體國家或真實個案。'],
        timeTips: '時間緊張時，匯報只選 2 組，教師補充第三個案例。'
      },
      { id: 's3', name: '行動承諾', short: '行動承諾', minutes: 12, shortMinutes: 11,
        goal: '學生把整個單元的學習，轉化為一個具體、可行、連結他人的行動承諾。',
        mechanic: '回顧盒自我評估、行動承諾卡五欄、承諾三問、簽署與承諾信封（教材：行動承諾卡、承諾三問提示卡、承諾信封）',
        phases: [
          { id: 'self', label: '自我評估', theme: 'paper', layout: 'task',
            caption: '自我評估（2 分鐘，步驟一）：打開「單元回顧盒」，點選一條最有感的句子。',
            captionEn: 'Self-assessment (2 minutes, step 1): open your unit review box and pick the sentence that moves you most.',
            teacher: '（2 分鐘，步驟一）打開「單元回顧盒」，顯示學生在第1至5節的產出；學生點選一條最有感的句子，自動貼到行動承諾卡第一欄。讀不到本機紀錄時，讓學生手動輸入或從紙本抄錄。' },
          { id: 'card', label: '行動承諾卡', theme: 'paper', layout: 'task',
            caption: '填寫行動承諾卡五欄（6 分鐘，步驟二、三）。',
            captionEn: 'Fill in the five parts of the action pledge card (6 minutes, steps 2–3).',
            teacher: '（6 分鐘，步驟二、三）填寫行動承諾卡五欄：我的志向；我的行動（誰、做什麼、何時）；我的同心圈（至少選社區（香港）、國家、世界或自然其中一圈）；我可能遇到的隔閡，以及我的橋板；完成標記與見證人。' },
          { id: 'check', label: '承諾三問', theme: 'paper', layout: 'task',
            caption: '互評「承諾三問」（3 分鐘，步驟四）：夠小、夠具體嗎？連結到別人了嗎？怎知做到了？',
            captionEn: 'Peer check (3 minutes, step 4): Small and specific enough? Linked to others? How will you know you did it?',
            teacher: '（3 分鐘，步驟四）互評「承諾三問」：夠小、夠具體嗎？連結到別人了嗎？怎知做到了？對方提出建議，再修訂。' },
          { id: 'sign', label: '簽署', theme: 'night', layout: 'task', bg: I + 'l6-student-lamp.webp',
            caption: '簽署（1 分鐘）：朗讀「從今天起，我承諾……」，簽名，放進承諾信封，設定開封日期。',
            captionEn: 'Sign (1 minute): read aloud “From today on, I pledge…”, sign, seal it in the pledge envelope and set an opening date.',
            teacher: '（1 分鐘）簽署：朗讀一句「從今天起，我承諾……」；在卡上簽名（化名或縮寫，可用手寫簽名板）；卡放進承諾信封，設定開封日期（預設兩至三星期後；日期前信封鎖著）。提供列印版。' }
        ],
        questions: [],
        feedback: '好的承諾不是最大的，而是最能做得到的。',
        teacherNotes: ['本環節最緊：建議在第5節離場前或課前，先讓學生翻閱回顧盒。', '承諾由學生自主決定；教師不評價承諾的「愛國程度」；不要求公開承諾的內容。', '如選本節為第二輪觀課，重點展示環節四（知、情、行的落實）。'],
        cautions: ['不評價承諾的「愛國程度」；不要求公開承諾的內容。'],
        timeTips: '時間緊張時，承諾三問改為同桌互看 1 分鐘，簽署可在課後完成。'
      },
      { id: 's4', name: '同心圈結算', short: '結算', minutes: 5, shortMinutes: 4,
        goal: '把承諾連成全班同心圈，表揚合作、化解隔閡與具體承諾，並完成全單元小結。',
        mechanic: '小旗、同心圈逐層亮起、頒徽章、單元小結、離場券、終章（教材：同心圈大海報與小旗貼紙、徽章卡）',
        phases: [
          { id: 'flags', label: '小旗與同心圈', theme: 'night',
            teacher: '（2 分鐘）各組把承諾摘要做成小旗（只顯示圈層和一個圖示，不顯示內容）插到同心圈對應圈層；全班圈圈相連，金色同心圈逐層亮起（短片 95–96 秒）。小旗數達預設目標（全班人數的八成，可改）即「同心圈亮起」；老師可手動觸發。',
            narration: [{ zh: '仁愛由近及遠，層層推展，', en: 'Care extends outward, circle by circle,', src: '序章 95–96 秒' }] },
          { id: 'badges', label: '頒發徽章', theme: 'paper',
            teacher: '（1 分鐘）頒發徽章：同心者（任務單有跨圈合作）、破隔者（能化解隔閡）、築夢者（承諾具體可行）。' },
          { id: 'discuss', label: '單元小結', theme: 'paper' },
          { id: 'summary', label: '三句總結', theme: 'paper', strip: false, teacher: '板書三句。' },
          { id: 'exit', label: '離場券・終章', theme: 'paper', strip: false, bg: I + 'l6-night-lamps.webp',
            teacher: '離場券：「我承諾的第一步是……」。預告跟進：兩至三星期後開封，檢討與反思（手冊步驟五、六）。最後播放單元終章。' }
        ],
        questions: [{ q: '個人的小行動，和「民族復興」「人類命運共同體」這些大目標，有什麼關係？', ref: '大目標由很多人的小行動組成；也有人認為兩者的關係不一定直接，要看行動是否真正連結到別人。官方論述把實現中華民族偉大復興列為新時代堅持和發展中國特色社會主義的奮鬥目標。' }],
        summary: ['一體之仁，由近及遠', '知行合一，承諾成真', '同心同行，文化自信'],
        nextPreview: '預告跟進：兩至三星期後開封，檢討與反思（手冊步驟五、六）。',
        feedback: '',
        teacherNotes: ['徽章表揚行為，不比較多少；不評價承諾的「愛國程度」。', '本節要回收全單元的學習產出，建議收入學生的學習檔案。'],
        cautions: ['小旗只顯示圈層和一個圖示，不顯示承諾內容。'],
        timeTips: '時間不足時，老師可直接按「觸發同心圈亮起動畫」，終章可在下一節開首播放。'
      }
    ],

    observation: [
      { indicator: '理解一體之仁', standard: '能說明一體之仁由近及遠，以及被私欲遮蔽的情況', scene: '一體階梯', record: '不忍度牌、口頭回答' },
      { indicator: '古今連結', standard: '能說明傳統「一體」概念與今日論述的相通之處，並分辨「相通」與「來源」', scene: '脈絡拼圖', record: '脈絡拼圖卡、口頭回答' },
      { indicator: '團結合作', standard: '能提出涉及不同圈層的合作方式，並化解一個隔閡', scene: '同心圈闖關', record: '同心圈任務單' },
      { indicator: '行動承諾', standard: '承諾具體、可行、連結他人，並有完成標記', scene: '行動承諾', record: '行動承諾卡、離場券' }
    ],
    observationNote: '教師觀察表以「需提示／部分達到／獨立達到」三級快速勾選。',
    differentiation: {
      support: ['脈絡拼圖卡附圖像和關鍵詞；任務單和承諾卡提供句式支架及選項式示例（按「支援」開啟）'],
      challenge: ['比較兩位學者對「天人合一」與「生命共同體」的不同看法，或為承諾加設一個「檢討指標」'],
      crossSubject: '與中文科合作，延伸閱讀《大學問》選段；與地理科或科學科合作，延伸環境議題。'
    },
    challenge: { title: '挑戰卡', text: '比較兩位學者對「天人合一」與「生命共同體」的不同看法，或為承諾加設一個「檢討指標」。', fields: ['兩位學者的不同看法', '或：我的承諾的「檢討指標」'] },
    cautions: ['不強迫認同：不忍度牌、立場只作表態，不計分。', '說明來源性質：官方論述和學者的詮釋，先理解，再思辨。', '分清相通與來源：不要說成今日論述直接源自陽明。',
      '案例均為假設，不指涉具體國家或真實個案。', '承諾由學生自主決定；教師不評價承諾的「愛國程度」；不要求公開承諾的內容。',
      '本節要回收全單元的學習產出，建議收入學生的學習檔案；如選本節為第二輪觀課，重點展示環節四（知、情、行的落實）。'],
    verify: ['《大學問》原文（現由教師淺白改寫；原文引述見陳來的論文，待核對原典）', '張載《西銘》「民胞物與」出處', '「良知貫通國家與天下」是個別學者詮釋，不要寫成共識',
      '人類命運共同體、生態文明的官方原文（2013 年莫斯科演講、2017 年黨章、2018 年修憲）', '教育局「我的行動承諾」學生手冊步驟名稱以 2026 年版為準',
      '「慶祝香港特區成立三十周年」活動需配合學校實際安排', '同心圈、隔閡卡、團結值等屬教學設計', '本節時間分配（5、8、10、12、5 分鐘）與概要表可能不同，網站以詳細流程為準',
      '承諾示例「手工咭」：提示詞作「手工咖」，網站依大綱及第4節任務 C 寫作「手工咭」', '不忍度牌 1 至 3 的文字說明（1＝少許不忍，3＝十分不忍）為網站自撰',
      '孺子卡取自短片 91–92 秒漣漪中的孩童畫面；四張階梯卡及第6節背景均取自序章短片影格（已去除畫面文字）'],
    references: ['張立文（《光明日報》，2017年11月6日）〈中華傳統文化與人類命運共同體〉', '孫聚友（中新社，2022）', '儒家網〈人類命運共同體與儒家思想〉', '儒家網另一篇引述程顥「仁者以天地萬物為一體」的文章',
      '本節補充文獻：陳來（清華大學）關於陽明晚年思想與感應論的論文（儒家網轉載）', '儒家網論陽明共同體思想的文章',
      '賈慶軍（2019）〈王陽明的大人思想及其五個陷阱〉，《寧波大學學報（人文科學版）》2019年第3期', '國務院新聞辦公室（2023年9月）《攜手構建人類命運共同體：中國的倡議與行動》白皮書',
      '中央網信辦（2018年3月2日）文章', '習近平外交思想研究中心〈構建人類命運共同體理念的形成發展和世界意義〉（《人民日報》，人民網，2026年8月7日）',
      '求是網轉載（2021年2月25日）〈共建更加美好世界的行動指南〉', '《中國日報》（2023年8月21日）', '李娟〈人與自然和諧共生現代化的傳統文化根基〉（2023）',
      '劉曉勇〈習近平生態文明思想返本開新的時代意蘊〉（愛思想網，2025年7月14日）', '中國社會科學網（2024年6月13日）', '教育局通函第119/2026號及第76/2026號', '《「我的行動承諾」學生手冊》（2026）'],
    materials: ['來源說明卡', '同心圈大海報（七個圈）與小旗貼紙', '一體階梯卡 4 張與不忍度牌', '脈絡拼圖卡 4 張與資料卡', '案例卡 A、B、C，隔閡卡 4 張', '同心圈任務單',
      '行動承諾卡（含五欄、句式支架、六步驟對接說明）與承諾三問提示卡', '承諾信封', '單元回顧盒標籤', '徽章卡（同心者、破隔者、築夢者）', '教師觀察表'],
    ui: { randomRoles: '隨機分配角色', draw: '全班抽卡', pick: '選這一張', goalBtn: '插上小旗・點亮同心圈', finale: '播放單元終章', openPage: '前往開封跟進頁' }
  };
})();
/* 全班共同目標「同心圈亮起」：小旗數＝全班人數 × 0.8（向上取整；教師控制台可改） */
Object.defineProperty(XC.content.l6.resource, 'classTarget', { get: function () {
  var n = (XC.state && XC.state.settings && XC.state.settings.classSize) || 32;
  return Math.max(1, Math.ceil(n * 0.8));
} });
