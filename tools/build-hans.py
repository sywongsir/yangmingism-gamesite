#!/usr/bin/env python3
"""用法：pip install opencc-python-reimplemented，然後在網站根目錄執行 python3 tools/build-hans.py
產生 js/core/hans-dict.js：繁（港）轉簡對照表。
資料來源：OpenCC（Apache-2.0）字典 HKVariantsRev、TSCharacters、TSPhrases。
字表收錄 TSCharacters 全部單字（學生自填文字也能轉）；詞組只收網站文字用得到、
且逐字轉換會出錯的詞組，以控制檔案大小。"""
import os, re, glob, json, opencc
D = os.path.join(os.path.dirname(opencc.__file__), 'dictionary')
SITE = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..') + os.sep  # 網站根目錄

def load(name):
    m = {}
    for ln in open(os.path.join(D, name), encoding='utf-8'):
        ln = ln.rstrip('\n')
        if not ln or '\t' not in ln: continue
        k, v = ln.split('\t', 1)
        m[k] = v.split(' ')[0]
    return m

hkrev = load('HKVariantsRev.txt')
hkrevp = load('HKVariantsRevPhrases.txt')
tsc = load('TSCharacters.txt')
tsp = load('TSPhrases.txt')

def ch(c):
    c1 = hkrev.get(c, c)
    if c1 != c and c1 not in tsc: return tsc.get(c, c)  # 例：抬→擡 無簡化，保留原字
    return tsc.get(c1, c1)

chars = {}
for k in set(tsc) | set(hkrev):
    if len(k) != 1: continue
    v = ch(k)
    if v != k and len(v) == 1: chars[k] = v

# 網站文字語料
corpus = ''
for f in glob.glob(SITE + 'js/**/*.js', recursive=True) + [SITE + 'index.html']:
    if f.endswith('hans-dict.js'): continue
    corpus += open(f, encoding='utf-8').read() + '\n'
runs = re.findall(r'[\u3400-\u9fff\uf900-\ufaff\U00020000-\U0002ffff]+', corpus)
joined = '\n'.join(runs)

def bychar(s): return ''.join(chars.get(c, c) for c in s)

phr = {}
for src in (hkrevp, tsp):
    for k, v in src.items():
        if len(k) < 2 or k not in joined: continue
        # 詞組先做港→繁異體，再轉簡
        tv = v if src is tsp else ''.join(tsc.get(x, x) for x in v)
        if tv != bychar(k): phr[k] = tv

# 手動補充（OpenCC 未處理的語境）（OpenCC 詞庫未收、按網站語境判斷）
extra = {'甚麼': '什么', '需要藉': '需要借', '藉著': '借着', '憑藉': '凭借'}
# 「著」作助詞時簡體作「着」（著名、著作、顯著等不變）
for v in ('提站望開坐鎖看帶拿想等走寫笑說聽守跟接隨靠向對朝沿急忙留穿抱握點亮燃照閃牽背載抬捧記活睡藏映流裝掛畫唱跑跳哭喊叫做吃喝讀試問指指撐扶摸抓扛推拉拖盯瞪躺趴蹲跪陪'):
    k = v + '著'; extra[k] = ''.join(tsc.get(x, x) for x in v) + '着'
for k, v in extra.items(): phr[k] = v

pairs = ''.join(k + v for k, v in sorted(chars.items()))
js = ('/* 繁（港）轉簡對照表（自動產生，勿手改；產生程式見 README）。\n'
      '   資料取自 OpenCC 字典（Apache License 2.0，https://github.com/BYVoid/OpenCC）。 */\n'
      'window.XC = window.XC || {};\n'
      'XC.hansDict = { c: ' + json.dumps(pairs, ensure_ascii=False) + ',\n  p: ' + json.dumps(phr, ensure_ascii=False, sort_keys=True) + ' };\n')
open(SITE + 'js/core/hans-dict.js', 'w', encoding='utf-8').write(js)

# 參考答案：OpenCC hk2s 對每段網站文字的轉換結果，供 node 比對
cc = opencc.OpenCC('hk2s')
uniq = sorted(set(runs))
json.dump({'src': uniq, 'ref': [cc.convert(s) for s in uniq]}, open('/tmp/w7/hans_ref.json', 'w', encoding='utf-8'), ensure_ascii=False)
print('chars', len(chars), 'phrases', len(phr), 'bytes', len(js.encode()), 'runs', len(uniq))
