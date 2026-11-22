# 素材清單（asset-manifest）

所有圖像只有兩種來源：①序章動畫短片（附件二）的影格，經裁切、調色、轉為 WebP；②以 AI 圖像工具參照短片影格生成的新圖。所有圖像內都沒有文字、標誌、國旗或校徽；影格中原有的字幕與書法字已裁去或以紙紋覆蓋。

## 一、影片

| 檔名 | 來源 | 處理 |
|---|---|---|
| `assets/video/prologue-web.mp4` | 附件二全片 | H.264 720p、AAC 96kbps、`-movflags +faststart`，雙次編碼至約 14.5MB |
| `assets/video/prologue-poster.webp` | 短片 114.9 秒 | 完整標題畫面 |

## 二、短片影格（主頁）

| 檔名 | 用途 | 參考影格（秒） |
|---|---|---|
| `hub/hub-far.webp` | 主頁遠景：月夜山谷 | 4 |
| `hub/mist-1.webp`、`hub/mist-2.webp` | 主頁兩層流動雲霧 | 程序生成（Python 噪聲），非影格 |
| `hub/ridge-front.webp` | 主頁前景山脊剪影 | 程序生成（Python），取色自短片長夜色板 |
| `hub/hub-lights.webp` | 山谷點點燈火（目標達成動畫） | 105 |
| `hub/hub-river.webp` | 人群持燈成燈河（終章） | 111 |
| `hub/hub-lamp-end.webp` | 墨畫油燈（終章）；已裁去上方原有副標字 | 116.5 |
| `hub/st1.webp` 至 `hub/st6.webp` | 六個燈站圓框內的意象 | 49、64、67、71、78、97 |
| `common/paper-tile.webp` | 宣紙紋理 | 程序生成 |
| `common/og-cover.jpg` | 分享封面（無文字） | 105 |

## 三、短片影格（第1節）

| 檔名 | 用途 | 參考影格（秒） |
|---|---|---|
| `l1/l1-study-lamp.webp` | 格窗竹影下的油燈書房 | 7.5 |
| `l1/l1-dialog.webp` | 少年陽明與老師對話 | 11 |
| `l1/l1-teacher.webp` | 老師回答 | 15 |
| `l1/l1-brush.webp` | 毛筆寫字 | 22 |
| `l1/l1-flame-brush.webp` | 毛筆一筆化火 | 24 |
| `l1/l1-hands-flame.webp` | 雙手捧火；已裁去底部字幕 | 27 |
| `l1/l1-bamboo-day.webp` | 竹林庭院（晝） | 30 |
| `l1/l1-bamboo-night.webp` | 竹林庭院（夜）：由 33 秒影格調成藍夜 | 33 |
| `l1/l1-sick-window.webp` | 窗邊燈下（病倒、反思） | 37 |
| `l1/l1-memorial.webp` | 跪呈奏疏 | 40 |
| `l1/l1-exile-river.webp` | 峭壁激流小船；已裁去底部字幕 | 44 |
| `l1/l1-porridge.webp` | 茅屋煮粥照料隨從（揭曉用） | 46 |
| `l1/l1-cave.webp` | 洞中長夜、油燈 | 49 |
| `l1/l1-eyes.webp` | 睜眼 | 53 |
| `l1/l1-burst.webp` | 金光迸發 | 54 |
| `l1/l1-dawn.webp` | 日出山河（上方留空放標題） | 55 |
| `l1/l1-lamp-end.webp` | 墨畫油燈點火（結束畫面）；左方原有直排書法字已以紙紋覆蓋 | 62 |

## 三之二、短片影格（第2至4節）
| 檔名 | 用途 | 參考影格（秒） |
|---|---|---|
| `l2/l2-hand-water.webp` | 古案揭曉：手觸水面（惻隱之心） | 63.2；已以 OpenCV 修補去除字幕 |
| `l2/l2-ripple.webp` | 古案揭曉：水面漣漪（良知收攝惻隱、羞惡） | 63.8；已修補字幕 |
| `l2/l2-moon-lake.webp` | 本節目標「良知鏡重圓」完成畫面、主頁燈站縮圖 | 65.0；已修補字幕 |
| `l2/l2-moon-pale.webp` | 良知鏡（蒙塵狀態）、開場月色 | 65.6；已修補字幕 |
| `l3/l3-ink-stroke.webp` | 「知行合一」書寫動畫底圖 | 66.2 |
| `l3/l3-river-bridge.webp` | 知岸與行岸的墨橋；本節目標「知行橋貫通」畫面、主頁燈站縮圖 | 68.6 |
| `l4/l4-desk.webp` | 第4節「事上磨煉是什麼」：陽明伏案書寫（旁白「人須在事上磨」） | 69.4；裁去字幕，1600×900 |
| `l4/l4-furnace.webp` | 第4節爐火段、煉鋼爐結算背景、「百煉成鋼」goal 動畫畫面 | 71.0；裁去字幕 |
| `l5/l5-ink-river-city.webp` | 第5節開場：墨河流向城市 | 76.0；裁去字幕 |
| `l5/l5-roots-dark.webp` | 根脈樹（樹根未亮）背景 | 77.8；裁去字幕，以程式去除畫面字 |
| `l5/l5-roots-lit.webp` | 樹根卡貼上後的琥珀光樹根 | 79.6；裁去字幕，以程式去除畫面字 |
| `l5/l5-scroll.webp` | 解碼任務：書卷文件背景 | 81.0；裁去字幕 |
| `l5/l5-tree-trunk.webp` | 根脈樹結算（未長葉） | 84.4；裁去字幕，以程式去除畫面字 |
| `l5/l5-tree-leaves.webp` | 根脈樹長葉、「根脈樹長葉」goal 動畫畫面 | 85.0；裁去字幕，以程式去除畫面字 |
| `l5/l5-jar-light.webp` | 質疑與思辨背景：燈罐透光 | 87.0；裁去字幕 |
| `l5/l5-jar-lamp.webp` | 離場券背景：燈罐 | 88.0；裁去字幕，960 闊 |
| `l6/l6-waterside.webp` | 第6節開場：陽明在水邊伸手點水 | 90.0；裁去字幕 |
| `l6/l6-ripples.webp` | 講解「一體之仁」、隔閡卡背景：同心墨圈 | 91.5；裁去字幕 |
| `l6/l6-step-child.webp`、`l6-step-bird.webp`、`l6-step-grass.webp`、`l6-step-stone.webp` | 一體階梯四卡：漣漪中的幼童、鳥、草木、瓦石 | 92、93、93.6、94；中央裁切，520 闊 |
| `l6/l6-rings-glow.webp` | 同心圈結算、「同心圈亮起」goal 動畫畫面：金色同心圈 | 95.0；裁去字幕，以程式去除圈內文字 |
| `l6/l6-boat-circle.webp` | 教師講解、任務單總結背景：光環圓框中眾人同舟 | 98.0；裁去字幕 |
| `l6/l6-jade-landscape.webp`、`l6-jade-city.webp` | 單元終章：白鶴飛越青綠山水至城市 | 101.0、103.0；裁去字幕 |
| `l6/l6-night-lamps.webp` | 第6節離場券、終章：夜山遍佈燈火 | 105.0；裁去字幕 |
| `l6/l6-student-lamp.webp` | 行動承諾簽署、終章：學生捧燈 | 109.0；裁去字幕 |

第5、6節沒有新增 AI 生成圖像；全部由 `mk56.py` 自短片擷取、裁切，畫面上的字以 OpenCV inpaint 去除，網頁文字一律以字型疊加。

## 三之三、程序生成與影格再加工（第2至4節）
| 檔名 | 做法 |
|---|---|
| `l3/l3-bridge-cracked.webp` | 以 `l3-river-bridge.webp` 為底，用 Python（PIL）在橋身畫出裂紋並加暗角；裂紋位置與 `js/content/l3.js` 的 `bridgeCracks` 座標一致，以便橋板落入時對位 |
| `l3/l3-bridge-empty.webp` | 由 68.6 秒影格以影像修補移去橋上人物，作為「人物走過橋」動畫的底圖 |
| `l3/l3-walker.png` | 由 68.6 秒影格裁出的過橋人物精靈（80×116，透明背景） |
| 良知鏡、裂縫、橋板、金色接縫、穩度牌、信封 | 全部以 SVG／CSS 即時繪製，沒有圖檔 |
| 案件B「群組風波」通訊介面 | 以 HTML／CSS 繪製的虛構水墨風對話框，不模仿任何真實通訊軟件 |
| 第4節鋼條、鐵砧、錘、火星、溫度計、信紙、立場卡、任務卡與事件卡插畫 | 全部以 SVG／CSS 即時繪製，沒有圖檔；鋼條顏色按鋼度計算（暗灰→暗紅→橙→金→金白，冷卻後青鋼） |
（67.4 秒影格的橋圖因畫面內有烙印的「知」字，沒有放入網站，只保存在建置環境 `raw/`。）
## 四、AI 生成圖像

生成工具：Manus 內建圖像生成。每張都以短片影格作參考圖，提示詞的共同部分如下（以下為所用提示詞的完整意思，按用途分列）：

> 共同風格：Chinese ink-wash painting on aged xuan rice paper, muted indigo night tones with warm golden lamp light as the only accent, soft bleeding ink edges, visible paper fibre texture, cinematic animated-film look matching the reference frames; no text, no letters, no calligraphy, no logos, no flags, no school badges.

| 檔名 | 用途 | 提示詞（主體部分） | 參考影格（秒） |
|---|---|---|---|
| `common/char-yangming-young.webp` | 角色設定圖：少年陽明 | character turnaround sheet of a Ming-dynasty teenage scholar, hair in a topknot, off-white cross-collar robe, front / three-quarter / side views and three expressions, plain paper background | 11、15 |
| `common/char-yangming-adult.webp` | 角色設定圖：成年陽明 | character turnaround sheet of a Ming-dynasty scholar in his thirties, black scholar's cap, brown robe, long beard, calm resolute expression, front / three-quarter / side views | 40、46、53 |
| `common/char-teacher-follower.webp` | 角色設定圖：塾師與隨從 | character sheet of an elderly Ming-dynasty teacher with grey beard and dark robe, and a humble servant-follower in plain hemp clothes | 15、46 |
| `common/char-students.webp` | 角色設定圖：現代中學生 | group character sheet of modern Hong Kong secondary-school students (mixed genders) in plain uniforms without any badge or logo, rendered in the same ink-wash animated style | 86–89 |
| `l1/l1-night-alone.webp` | 情境卡夜一「孤立」：孤燈 | a single small oil lamp glowing on a bare wooden table inside a dark empty room, cold blue night outside a lattice window, sense of loneliness, vertical 4:5 | 7.5、49 |
| `l1/l1-night-scarcity.webp` | 情境卡夜二「匱乏」：空米缸 | an empty clay rice jar beside a dim oil lamp in a simple thatched hut, a few scattered grains, sense of scarcity, vertical 4:5 | 46 |
| `l1/l1-night-lost.webp` | 情境卡夜三「迷惘」：霧中岔路 | a mountain path splitting into two in thick night fog, a faint distant lamp, sense of uncertainty, vertical 4:5 | 0.5、4 |

| `l2/l2-agency.webp` | 第2節開場：月夜偵探社（圓窗滿月、卷宗、放大鏡、油燈） | a Ming-style scholar's study turned into a night-time detective agency, round moon window with full moon, stacked case files, magnifying glass, scroll and a small oil lamp on a wooden desk, no people, horizontal 16:9 | 63–65（月色）、49（油燈） |
| `l2/l2-well.webp` | 古案「孺子入井」：古井旁爬行的幼童 | an ancient stone well with a wooden pulley frame in a quiet village courtyard, a small toddler crawling towards it, a large tree, faded daylight, horizontal 16:9 | 30（庭院光色） |
| `l2/l2-case-a.webp` | 案件A「教室一角」（虛構） | a modern secondary-school classroom corner, one boy sitting alone by the window while classmates chat and play in the background, plain uniforms with no badge or logo, horizontal 16:9 | 角色設定圖（現代中學生） |
| `l2/l2-case-c.webp` | 案件C「地鐵一刻」（虛構） | a crowded train carriage, an elderly woman standing with heavy shopping bags while people around look down at their phones, a student seated near the door, no signage or logo, horizontal 16:9 | 角色設定圖（現代中學生） |
| `l3/l3-stage.webp` | 第3節「演出與穩度牌」背景：小舞台 | an empty small school stage with heavy curtains drawn open, warm footlight glow, an ink-wash backdrop of an arched bridge over misty water, horizontal 16:9 | 68.6（墨橋） |
| `l4/l4-forge.webp` | 第4節輪三「失誤卡」及鍛打場景背景：鐵砧與錘 | a blacksmith's anvil with a hammer resting on it and a glowing orange steel bar, a few sparks in the air, a bronze ritual furnace cauldron with fire in the soft background, dark ink-wash night with warm ember light as the only accent, horizontal 16:9 | 70–71（爐鼎烈火） |
原圖（PNG）保存在建置環境 `raw/`，網站只放 WebP（最闊 1920px，品質約 75–78）。

## 五、聲音

全部音效以 Web Audio API 即時合成（`js/core/audio.js`）：墨滴、翻卡、燈火、鐘聲、香盡等，沒有外部音檔。背景音樂預設沒有；如需加入，把 mp3 放到 `assets/audio/` 並在 `js/config.js` 的 `bgm` 填上相對路徑。

## 六、字型

| 字型 | 授權 | 載入方式 |
|---|---|---|
| Noto Serif HK | SIL Open Font License 1.1 | Google Fonts（只載 400 字重，頁面載入後才請求）；另自託管只含「為」字的子集 `assets/fonts/hk-fix-400.woff2`、`hk-fix-700.woff2` |
| Noto Serif SC | SIL Open Font License 1.1 | Google Fonts（只在開啟簡體時載入，400 字重） |
| LXGW WenKai TC（霞鶩文楷 TC） | SIL Open Font License 1.1 | Google Fonts |
| EB Garamond | SIL Open Font License 1.1 | Google Fonts |

字型連結由 `index.html` 尾段的腳本在 window load 後加入（最遲 3 秒），另有 `<noscript>` 後備；斷網時改用系統後備字型。

**繁簡對照資料**：`js/core/hans-dict.js` 由 `tools/build-hans.py` 以 OpenCC 字典（HKVariantsRev、TSCharacters、TSPhrases；Apache License 2.0）產生，只作字表資料，網站沒有載入 OpenCC 程式。
