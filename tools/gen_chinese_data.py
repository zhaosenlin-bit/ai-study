# -*- coding: utf-8 -*-
"""生成语文知识图谱与题库(角色 C 数据补齐,对齐 OpenAPI 契约)。

生成内容:
- data/knowledge_graph/chinese/chinese_g3..6.json:24 个知识点(3-6 年级)
- data/question_bank/chinese/chinese_q_g3_*.json:30 题(古诗/阅读/识字/表达)

用法: python tools/gen_chinese_data.py
"""
from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
KG_DIR = ROOT / "data" / "knowledge_graph" / "chinese"
QB_DIR = ROOT / "data" / "question_bank" / "chinese"

# (id, 年级, 名称, 难度, 前置依赖, 常见误区)
KPS = [
    # g3
    ("chinese_g3_pinyin", 3, "拼音与声调", 2, [], ["平翘舌音混淆", "第三声调号位置写错"]),
    ("chinese_g3_radical", 3, "偏旁部首", 2, ["chinese_g3_pinyin"], ["形声字声旁与形旁混淆"]),
    ("chinese_g3_poem_basic", 3, "古诗积累(所见·山行)", 2, ["chinese_g3_pinyin"], ["古诗名句与作者对不上"]),
    ("chinese_g3_reading_nature", 3, "自然主题阅读", 2, ["chinese_g3_radical"], ["概括自然段内容不完整"]),
    ("chinese_g3_idiom_basic", 3, "常用成语", 2, [], ["成语意思望文生义"]),
    ("chinese_g3_sentence_metaphor", 3, "比喻句", 2, [], ["分不清比喻与拟人"]),
    # g4
    ("chinese_g4_poem_image", 4, "古诗画面与情感", 2, ["chinese_g3_poem_basic"], ["只看字面翻译,体会不到情感"]),
    ("chinese_g4_reading_main_idea", 4, "阅读抓主旨", 3, ["chinese_g3_reading_nature"], ["复述情节代替概括中心"]),
    ("chinese_g4_character_meaning", 4, "多义字辨析", 3, [], ["脱离语境猜字义"]),
    ("chinese_g4_idiom_usage", 4, "成语运用", 3, ["chinese_g3_idiom_basic"], ["成语感情色彩误用"]),
    ("chinese_g4_essay_structure", 4, "段落结构(总分总)", 3, ["chinese_g4_reading_main_idea"], ["写段没有中心句"]),
    ("chinese_g4_connective", 4, "关联词运用", 2, [], ["关联词搭配错误"]),
    # g5
    ("chinese_g5_exposition_reading", 5, "说明文阅读", 3, ["chinese_g4_reading_main_idea"], ["分不清说明方法"]),
    ("chinese_g5_poem_emotion", 5, "古诗情感(示儿·题临安邸)", 3, ["chinese_g4_poem_image"], ["忽略写作背景谈情感"]),
    ("chinese_g5_narrative_reading", 5, "记叙文阅读", 3, ["chinese_g4_reading_main_idea"], ["人物品质概括不准确"]),
    ("chinese_g5_essay_detail", 5, "习作技巧(详略得当)", 3, [], ["重点内容一笔带过"]),
    ("chinese_g5_classical_quotes", 5, "文言文启蒙", 3, ["chinese_g4_character_meaning"], ["虚词理解困难"]),
    ("chinese_g5_sentence_exaggeration", 5, "夸张句", 2, ["chinese_g3_sentence_metaphor"], ["夸张与比喻混淆"]),
    # g6
    ("chinese_g6_poem_classic", 6, "古诗词积累(春夜喜雨)", 3, ["chinese_g5_poem_emotion"], ["名句默写错别字"]),
    ("chinese_g6_speech_reading", 6, "演讲稿阅读", 3, ["chinese_g5_narrative_reading"], ["抓不住演讲者的核心观点"]),
    ("chinese_g6_essay_revision", 6, "习作修改", 3, ["chinese_g5_essay_detail"], ["只会删不会改"]),
    ("chinese_g6_character_detail", 6, "人物描写方法", 3, [], ["动作描写与神态描写混淆"]),
    ("chinese_g6_sentence_abbreviation", 6, "缩写句子", 3, ["chinese_g5_sentence_exaggeration"], ["删掉了关键成分"]),
    ("chinese_g6_sentence_parallelism", 6, "排比句", 2, ["chinese_g5_sentence_exaggeration"], ["排比与反复混淆"]),
]

# (知识点id, 题型, 题干, 选项, 答案, 难度, 错因, 讲解)
QUESTIONS = [
    ("chinese_g3_pinyin", "single_choice", "下列加点字的读音完全正确的一组是?", ["牛(niú) 羊(yán)", "山(shān) 水(shuǐ)", "花(huā) 火(hǒ)", "月(yuè) 日(rì)"], "山(shān) 水(shuǐ)", 2, "careless", "注意声母、韵母和声调要读准。"),
    ("chinese_g3_radical", "single_choice", "\u201c江、河、湖、海\u201d这些字的偏旁都跟什么有关?", ["水", "木头", "金属", "火"], "水", 2, "concept_missing", "三点水偏旁的字大多与水有关。"),
    ("chinese_g3_poem_basic", "single_choice", "《山行》中\u201c远上寒山石径斜\u201d的下一句是?", ["白云生处有人家", "霜叶红于二月花", "停车坐爱枫林晚", "两个黄鹂鸣翠柳"], "白云生处有人家", 2, "careless", "按诗句顺序背诵:远上寒山石径斜,白云生处有人家。"),
    ("chinese_g3_reading_nature", "single_choice", "读短文《秋天的雨》,下面哪句话最能概括全文?", ["秋天的雨把颜色给了银杏树", "秋天的雨藏着非常好闻的气味", "秋天的雨,是一把钥匙,打开了秋天的大门", "秋天的雨带来了寒冷"], "秋天的雨,是一把钥匙,打开了秋天的大门", 3, "concept_missing", "中心句常出现在开头或结尾,概括全文内容。"),
    ("chinese_g3_idiom_basic", "single_choice", "\u201c亡羊补牢\u201d这个成语告诉我们?", ["丢了羊就再买一只", "出了问题及时补救,还不算晚", "羊圈不用修补", "羊喜欢跑出去"], "出了问题及时补救,还不算晚", 2, "concept_missing", "理解成语要结合寓言故事的本意。"),
    ("chinese_g3_sentence_metaphor", "single_choice", "下面哪个句子是比喻句?", ["妹妹的脸红得像苹果", "花儿在风中点头", "小鸟在枝头唱歌", "太阳公公露出了笑脸"], "妹妹的脸红得像苹果", 2, "concept_missing", "比喻句要有本体、喻体,常用\u201c像、好像、仿佛\u201d连接。"),
    ("chinese_g4_poem_image", "single_choice", "《静夜思》中\u201c举头望明月\u201d,诗人当时最可能是什么心情?", ["高兴", "想念家乡", "生气", "害怕"], "想念家乡", 2, "concept_missing", "结合\u201c思故乡\u201d体会诗歌画面背后的情感。"),
    ("chinese_g4_poem_image", "single_choice", "《望庐山瀑布》中\u201c飞流直下三千尺\u201d主要用了什么手法?", ["比喻", "夸张", "拟人", "排比"], "夸张", 3, "concept_missing", "三千尺是夸张的说法,突出瀑布的壮观。"),
    ("chinese_g4_reading_main_idea", "single_choice", "短文讲小明扶起摔倒的老人并送他回家,这篇短文主要想告诉我们?", ["小明跑步很快", "要乐于助人、关爱他人", "老人摔倒了很疼", "放学路上要小心"], "要乐于助人、关爱他人", 3, "concept_missing", "概括主旨要从事情中提炼道理或品质。"),
    ("chinese_g4_character_meaning", "single_choice", "下面哪个词语中的\u201c熟\u201d表示\u201c熟练\u201d的意思?", ["饭熟了", "这条路我很熟", "果子熟了", "熟透了"], "这条路我很熟", 3, "concept_missing", "\u201c熟\u201d在不同词语中意思不同,要结合语境判断。"),
    ("chinese_g4_idiom_usage", "single_choice", "下面成语运用不正确的一项是?", ["他做事总是画蛇添足,多此一举", "小明学习很认真,成绩画蛇添足", "这篇文章结尾多余,真是画蛇添足", "你别画蛇添足了,直接说重点"], "小明学习很认真,成绩画蛇添足", 3, "concept_missing", "画蛇添足是贬义,指做多余的事。"),
    ("chinese_g4_essay_structure", "single_choice", "写一段话,\u201c我们的校园真美丽\u201d最适合放在段落的?", ["开头(中心句)", "中间", "结尾", "哪里都行"], "开头(中心句)", 3, "concept_missing", "总分总结构中,中心句常放在段首。"),
    ("chinese_g4_connective", "single_choice", "选词填空:小明( )生病了,( )坚持来上学。", ["因为……所以……", "虽然……但是……", "不但……而且……", "如果……就……"], "虽然……但是……", 2, "concept_missing", "前后是转折关系,用\u201c虽然……但是……\u201d。"),
    ("chinese_g5_exposition_reading", "single_choice", "说明文中,\u201c鲸的体重约三十吨\u201d使用了什么说明方法?", ["列数字", "打比方", "作比较", "举例子"], "列数字", 3, "concept_missing", "用具体数字说明事物特征就是列数字。"),
    ("chinese_g5_poem_emotion", "single_choice", "《示儿》中陆游\u201c但悲不见九州同\u201d,表达了他怎样的情感?", ["悲伤自己老了", "渴望祖国统一的爱国之情", "害怕死亡", "思念家人"], "渴望祖国统一的爱国之情", 3, "concept_missing", "结合诗人写作背景理解诗句情感。"),
    ("chinese_g5_narrative_reading", "single_choice", "短文写雷锋雨中送大娘回家,塑造了雷锋怎样的形象?", ["乐于助人、无私奉献", "勤劳勇敢", "聪明机智", "热爱学习"], "乐于助人、无私奉献", 3, "concept_missing", "通过人物的行为概括其品质。"),
    ("chinese_g5_essay_detail", "single_choice", "写《我的妈妈》,下面哪个是\u201c详\u201d的正确做法?", ["妈妈的外貌、爱好、性格都只写一句", "重点写一件事体现妈妈的爱,写具体", "只写妈妈的外貌", "把全家人都写一遍"], "重点写一件事体现妈妈的爱,写具体", 3, "concept_missing", "详略得当:重点内容要写具体,次要内容简写。"),
    ("chinese_g5_classical_quotes", "single_choice", "\u201c知之为知之,不知为不知,是知也\u201d中最后一个\u201c知\u201d的意思是?", ["知道", "智慧", "知识", "知道的事"], "智慧", 3, "concept_missing", "通假字:\u201c知\u201d通\u201c智\u201d,指智慧。"),
    ("chinese_g5_sentence_exaggeration", "single_choice", "下面哪个句子用了夸张的修辞手法?", ["教室里静得连针掉在地上都能听见", "弯弯的月亮像小船", "太阳像个大火球", "花儿在跳舞"], "教室里静得连针掉在地上都能听见", 2, "concept_missing", "夸张是对事物进行扩大或缩小的描述。"),
    ("chinese_g6_poem_classic", "fill_blank", "《春夜喜雨》中\u201c随风潜入夜,______。\u201d", None, "润物细无声", 3, "careless", "注意\u201c润\u201d字不要写成\u201c闰\u201d。"),
    ("chinese_g6_speech_reading", "single_choice", "读演讲稿《读书的快乐》,作者最想表达的核心观点是?", ["读书很累", "读书能带来快乐和收获", "大家都应该多买书", "图书馆很大"], "读书能带来快乐和收获", 3, "concept_missing", "演讲稿要抓住作者反复强调的观点。"),
    ("chinese_g6_essay_revision", "single_choice", "修改病句:\u201c我断定他大概是小明。\u201d应改为?", ["我断定他是小明。", "我大概是小明。", "他断定我是小明。", "我断定他大概不是小明。"], "我断定他是小明。", 3, "careless", "\u201c断定\u201d与\u201c大概\u201d矛盾,删去一个。"),
    ("chinese_g6_character_detail", "single_choice", "句子\u201c他紧紧握住拳头,咬紧牙关\u201d属于什么描写?", ["动作描写", "外貌描写", "心理描写", "语言描写"], "动作描写", 3, "concept_missing", "写人物的动作的词是动作描写。"),
    ("chinese_g6_sentence_abbreviation", "single_choice", "缩写句子:\u201c勤劳的蜜蜂在美丽的花丛中采蜜。\u201d", ["蜜蜂采蜜。", "蜜蜂在花丛中。", "勤劳的蜜蜂采蜜。", "蜜蜂在花丛中采蜜。"], "蜜蜂采蜜。", 3, "concept_missing", "缩写句子保留主干:谁+干什么。"),
    ("chinese_g6_sentence_parallelism", "single_choice", "句子\u201c爱心是一缕阳光,爱心是一股清泉,爱心是一盏明灯\u201d用了什么修辞?", ["排比", "拟人", "夸张", "反问"], "排比", 2, "concept_missing", "三个或以上结构相似的句子连用是排比。"),
    ("chinese_g4_reading_main_idea", "short_answer", "短文《倔强的小红军》讲了小红军宁可牺牲也不拖累别人的故事。用一两句话概括这篇短文的中心。", None, "赞美小红军宁可牺牲自己也不拖累别人的高贵品质", 4, "concept_missing", "概括中心:通过主要事件提炼人物品质。"),
    ("chinese_g3_poem_basic", "fill_blank", "《所见》中\u201c意欲捕鸣蝉,______。\u201d", None, "忽然闭口立", 3, "careless", "默写时注意\u201c闭\u201d字结构。"),
    ("chinese_g4_essay_structure", "short_answer", "请以\u201c美丽的校园\u201d为总起句,补写一句分述(写出校园的一个具体角落)。", None, "操场的梧桐树像一把大伞,遮出一片阴凉", 4, "concept_missing", "分述要具体,围绕总起句展开。"),
    ("chinese_g6_character_detail", "single_choice", "句子\u201c妈妈笑了,眼角的皱纹像菊花一样绽放\u201d用了哪些描写?", ["神态描写和比喻", "动作描写", "语言描写", "心理描写"], "神态描写和比喻", 3, "concept_missing", "写\u201c笑\u201d是神态描写,\u201c像菊花\u201d是比喻。"),
    ("chinese_g4_connective", "fill_blank", "用关联词填空:( )遇到多大的困难,他( )不放弃。", None, "无论……都……", 3, "concept_missing", "条件关系的关联词用\u201c无论……都……\u201d。"),
]

CONCEPT_NAMES = {kp[0]: kp[2] for kp in KPS}


def build_knowledge_graph() -> None:
    KG_DIR.mkdir(parents=True, exist_ok=True)
    for grade in (3, 4, 5, 6):
        nodes = [
            {
                "id": kid,
                "subject": "chinese",
                "grade": g,
                "name": name,
                "difficulty": diff,
                "prerequisites": pre,
                "common_misconceptions": mis,
            }
            for kid, g, name, diff, pre, mis in KPS
            if g == grade
        ]
        (KG_DIR / f"chinese_g{grade}.json").write_text(
            json.dumps(nodes, ensure_ascii=False, indent=2), encoding="utf-8"
        )
    print(f"知识图谱:{len(KPS)} 个知识点写入 chinese_g3..6.json")


def build_question_bank() -> None:
    QB_DIR.mkdir(parents=True, exist_ok=True)
    seq = 0
    for kp, qtype, stem, opts, ans, diff, err, expl in QUESTIONS:
        seq += 1
        grade = int(kp.split("_")[1][1:])
        q = {
            "id": f"chinese_q_g{grade}_{seq:04d}",
            "subject": "chinese",
            "grade": grade,
            "type": qtype,
            "knowledge_point_ids": [kp],
            "stem": stem,
            "options": opts,
            "answer": ans,
            "rubric": f"考察知识点:{CONCEPT_NAMES[kp]}",
            "explanation": expl,
            "error_type": err,
            "difficulty": diff,
        }
        (QB_DIR / f"{q['id']}.json").write_text(
            json.dumps(q, ensure_ascii=False, indent=2), encoding="utf-8"
        )
    print(f"题库:{len(QUESTIONS)} 题写入 chinese_q_g*.json")


if __name__ == "__main__":
    build_knowledge_graph()
    build_question_bank()
