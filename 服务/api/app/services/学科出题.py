"""语文/英语题目生成器：内置语料 + 模板生成，全局去重（跨课程不重复）。

- 语文基础：古诗上下句填空（fill_blank）
- 语文拓展：近义词/反义词/形近字选择（single_choice）
- 英语基础：看中文选英文（single_choice）
- 英语拓展：看英文选中文（single_choice）+ 挖空拼写（fill_blank）
"""

import random
import uuid

# ---------- 语文：古诗语料（按年级，每首存 上句/下句） ----------

POEMS_BY_GRADE: dict[int, list[tuple[str, str]]] = {
    3: [
        ("床前明月光", "疑是地上霜"),
        ("举头望明月", "低头思故乡"),
        ("白日依山尽", "黄河入海流"),
        ("欲穷千里目", "更上一层楼"),
        ("锄禾日当午", "汗滴禾下土"),
        ("谁知盘中餐", "粒粒皆辛苦"),
        ("春眠不觉晓", "处处闻啼鸟"),
        ("夜来风雨声", "花落知多少"),
        ("两个黄鹂鸣翠柳", "一行白鹭上青天"),
        ("窗含西岭千秋雪", "门泊东吴万里船"),
        ("飞流直下三千尺", "疑是银河落九天"),
        ("朝辞白帝彩云间", "千里江陵一日还"),
        ("两岸猿声啼不住", "轻舟已过万重山"),
        ("远上寒山石径斜", "白云生处有人家"),
        ("停车坐爱枫林晚", "霜叶红于二月花"),
        ("千山鸟飞绝", "万径人踪灭"),
        ("墙角数枝梅", "凌寒独自开"),
        ("遥知不是雪", "为有暗香来"),
    ],
    4: [
        ("横看成岭侧成峰", "远近高低各不同"),
        ("不识庐山真面目", "只缘身在此山中"),
        ("山重水复疑无路", "柳暗花明又一村"),
        ("莫笑农家腊酒浑", "丰年留客足鸡豚"),
        ("故人西辞黄鹤楼", "烟花三月下扬州"),
        ("孤帆远影碧空尽", "唯见长江天际流"),
        ("渭城朝雨浥轻尘", "客舍青青柳色新"),
        ("劝君更尽一杯酒", "西出阳关无故人"),
        ("独在异乡为异客", "每逢佳节倍思亲"),
        ("遥知兄弟登高处", "遍插茱萸少一人"),
        ("众鸟高飞尽", "孤云独去闲"),
        ("相看两不厌", "只有敬亭山"),
        ("湖光秋月两相和", "潭面无风镜未磨"),
        ("遥望洞庭山水翠", "白银盘里一青螺"),
        ("江南好", "风景旧曾谙"),
        ("日出江花红胜火", "春来江水绿如蓝"),
        ("空山不见人", "但闻人语响"),
        ("返景入深林", "复照青苔上"),
    ],
    5: [
        ("京口瓜洲一水间", "钟山只隔数重山"),
        ("春风又绿江南岸", "明月何时照我还"),
        ("洛阳城里见秋风", "欲作家书意万重"),
        ("复恐匆匆说不尽", "行人临发又开封"),
        ("山一程，水一程", "身向榆关那畔行"),
        ("风一更，雪一更", "聒碎乡心梦不成"),
        ("死去元知万事空", "但悲不见九州同"),
        ("王师北定中原日", "家祭无忘告乃翁"),
        ("山外青山楼外楼", "西湖歌舞几时休"),
        ("暖风熏得游人醉", "直把杭州作汴州"),
        ("九州生气恃风雷", "万马齐喑究可哀"),
        ("我劝天公重抖擞", "不拘一格降人才"),
        ("寒雨连江夜入吴", "平明送客楚山孤"),
        ("洛阳亲友如相问", "一片冰心在玉壶"),
        ("草铺横野六七里", "笛弄晚风三四声"),
        ("归来饱饭黄昏后", "不脱蓑衣卧月明"),
        ("一叶渔船两小童", "收篙停棹坐船中"),
        ("最喜小儿亡赖", "溪头卧剥莲蓬"),
    ],
    6: [
        ("爆竹声中一岁除", "春风送暖入屠苏"),
        ("千门万户曈曈日", "总把新桃换旧符"),
        ("玉颗珊珊下月轮", "殿前拾得露华新"),
        ("至今不会天中事", "应是嫦娥掷与人"),
        ("风雨送春归", "飞雪迎春到"),
        ("已是悬崖百丈冰", "犹有花枝俏"),
        ("待到山花烂漫时", "她在丛中笑"),
        ("千锤万凿出深山", "烈火焚烧若等闲"),
        ("粉骨碎身浑不怕", "要留清白在人间"),
        ("咬定青山不放松", "立根原在破岩中"),
        ("千磨万击还坚劲", "任尔东西南北风"),
        ("剑外忽传收蓟北", "初闻涕泪满衣裳"),
        ("却看妻子愁何在", "漫卷诗书喜欲狂"),
        ("白日放歌须纵酒", "青春作伴好还乡"),
        ("九州生气恃风雷", "万马齐喑究可哀"),
        ("谁道人生无再少", "门前流水尚能西"),
        ("山下兰芽短浸溪", "松间沙路净无泥"),
        ("峨眉山月半轮秋", "影入平羌江水流"),
    ],
}

# ---------- 语文：近义词/反义词/形近字（single_choice） ----------

WORD_CHOICES_BY_GRADE: dict[int, list[dict]] = {
    3: [
        {"stem": "“美丽”的近义词是？", "options": ["漂亮", "难看", "普通", "奇怪"], "answer": "A"},
        {"stem": "“高兴”的近义词是？", "options": ["开心", "难过", "生气", "害怕"], "answer": "A"},
        {"stem": "“高”的反义词是？", "options": ["矮", "大", "长", "宽"], "answer": "A"},
        {"stem": "“快”的反义词是？", "options": ["慢", "急", "赶", "跑"], "answer": "A"},
        {"stem": "下列哪个字的读音与其他不同？", "options": ["鸟", "早", "高", "草"], "answer": "C"},
        {"stem": "“入”的反义词是？", "options": ["出", "进", "来", "去"], "answer": "A"},
        {"stem": "“大”的反义词是？", "options": ["小", "多", "高", "宽"], "answer": "A"},
        {"stem": "“干净”的近义词是？", "options": ["清洁", "肮脏", "混乱", "破旧"], "answer": "A"},
        {"stem": "“冷”的反义词是？", "options": ["热", "凉", "冰", "冻"], "answer": "A"},
        {"stem": "“喜欢”的反义词是？", "options": ["讨厌", "爱好", "热爱", "喜爱"], "answer": "A"},
        {"stem": "“认真”的近义词是？", "options": ["专心", "马虎", "粗心", "大意"], "answer": "A"},
        {"stem": "“黑”的反义词是？", "options": ["白", "暗", "灰", "深"], "answer": "A"},
    ],
    4: [
        {"stem": "“辽阔”的近义词是？", "options": ["广阔", "狭窄", "渺小", "拥挤"], "answer": "A"},
        {"stem": "“安静”的近义词是？", "options": ["宁静", "热闹", "嘈杂", "喧闹"], "answer": "A"},
        {"stem": "“平坦”的反义词是？", "options": ["崎岖", "光滑", "笔直", "宽敞"], "answer": "A"},
        {"stem": "“仔细”的近义词是？", "options": ["细心", "粗心", "马虎", "随便"], "answer": "A"},
        {"stem": "“希望”的近义词是？", "options": ["期望", "失望", "绝望", "无望"], "answer": "A"},
        {"stem": "“明亮”的反义词是？", "options": ["昏暗", "光亮", "雪白", "清晰"], "answer": "A"},
        {"stem": "“茂盛”的近义词是？", "options": ["繁茂", "稀疏", "枯黄", "凋零"], "answer": "A"},
        {"stem": "“骄傲”的近义词是？", "options": ["自豪", "谦虚", "自卑", "平淡"], "answer": "A"},
        {"stem": "“短暂”的反义词是？", "options": ["长久", "瞬间", "片刻", "眨眼"], "answer": "A"},
        {"stem": "“观察”的近义词是？", "options": ["察看", "忽略", "忽视", "无视"], "answer": "A"},
        {"stem": "“奇异”的近义词是？", "options": ["奇特", "普通", "平常", "平凡"], "answer": "A"},
        {"stem": "“诚实”的反义词是？", "options": ["虚伪", "真诚", "老实", "守信"], "answer": "A"},
    ],
    5: [
        {"stem": "“小心翼翼”中“翼”的意思是？", "options": ["翅膀", "小心", "害怕", "谨慎"], "answer": "A"},
        {"stem": "“赞叹不已”中“已”的意思是？", "options": ["停止", "已经", "完了", "已经过去"], "answer": "A"},
        {"stem": "“精神抖擞”的近义词是？", "options": ["神采奕奕", "无精打采", "垂头丧气", "萎靡不振"], "answer": "A"},
        {"stem": "“络绎不绝”中“绝”的意思是？", "options": ["断", "绝妙", "尽头", "绝对"], "answer": "A"},
        {"stem": "“迫不及待”中“及”的意思是？", "options": ["到", "及时", "来得及", "以及"], "answer": "A"},
        {"stem": "“依依不舍”的近义词是？", "options": ["恋恋不忘", "毅然决然", "毫不犹豫", "果断"], "answer": "A"},
        {"stem": "“赞叹”的近义词是？", "options": ["称赞", "批评", "责备", "指责"], "answer": "A"},
        {"stem": "“艰苦”的反义词是？", "options": ["舒适", "困苦", "艰难", "辛苦"], "answer": "A"},
        {"stem": "“平静”的近义词是？", "options": ["宁静", "澎湃", "汹涌", "激动"], "answer": "A"},
        {"stem": "“聪明”的反义词是？", "options": ["愚笨", "机灵", "睿智", "聪慧"], "answer": "A"},
        {"stem": "“沉思”中“沉”的意思是？", "options": ["深", "重", "低", "落"], "answer": "A"},
        {"stem": "“目不转睛”中“睛”的意思是？", "options": ["眼珠", "太阳", "晴朗", "精华"], "answer": "A"},
    ],
    6: [
        {"stem": "“锲而不舍”中“舍”的意思是？", "options": ["放弃", "房屋", "施舍", "宿舍"], "answer": "A"},
        {"stem": "“不假思索”中“假”的意思是？", "options": ["借", "假如", "假期", "假装"], "answer": "A"},
        {"stem": "“肃然起敬”中“敬”的意思是？", "options": ["尊敬", "敬礼", "敬意", "敬爱"], "answer": "A"},
        {"stem": "“迫不及待”的近义词是？", "options": ["急不可待", "从容不迫", "不紧不慢", "慢条斯理"], "answer": "A"},
        {"stem": "“赞叹不已”的近义词是？", "options": ["赞不绝口", "摇头叹息", "唉声叹气", "无动于衷"], "answer": "A"},
        {"stem": "“聚精会神”中“会”的意思是？", "options": ["领会", "会议", "会面", "机会"], "answer": "A"},
        {"stem": "“举世闻名”中“举”的意思是？", "options": ["全", "举起", "举办", "举例"], "answer": "A"},
        {"stem": "“坚持不懈”的反义词是？", "options": ["半途而废", "持之以恒", "坚持不懈", "始终如一"], "answer": "A"},
        {"stem": "“顾全大局”中“顾”的意思是？", "options": ["照顾", "顾客", "回顾", "照顾到"], "answer": "A"},
        {"stem": "“恍然大悟”中“恍”的意思是？", "options": ["忽然", "恍惚", "仿佛", "摇晃"], "answer": "A"},
        {"stem": "“专心致志”的近义词是？", "options": ["聚精会神", "心不在焉", "三心二意", "东张西望"], "answer": "A"},
        {"stem": "“安居乐业”中“安”的意思是？", "options": ["安定", "安全", "安排", "安静"], "answer": "A"},
    ],
}

# ---------- 英语：词汇（word, meaning）按年级 ----------

VOCAB_BY_GRADE: dict[int, list[tuple[str, str]]] = {
    3: [
        ("apple", "苹果"), ("banana", "香蕉"), ("cat", "猫"), ("dog", "狗"), ("book", "书"),
        ("red", "红色"), ("blue", "蓝色"), ("green", "绿色"), ("one", "一"), ("two", "二"),
        ("three", "三"), ("four", "四"), ("five", "五"), ("six", "六"), ("seven", "七"),
        ("eight", "八"), ("nine", "九"), ("ten", "十"), ("pen", "钢笔"), ("pencil", "铅笔"),
        ("ruler", "尺子"), ("eraser", "橡皮"), ("bag", "书包"), ("cake", "蛋糕"), ("milk", "牛奶"),
        ("egg", "鸡蛋"), ("rice", "米饭"), ("fish", "鱼"), ("bird", "鸟"), ("sun", "太阳"),
        ("moon", "月亮"), ("star", "星星"), ("water", "水"), ("tea", "茶"), ("juice", "果汁"),
        ("mother", "妈妈"), ("father", "爸爸"), ("sister", "姐姐"), ("brother", "哥哥"), ("teacher", "老师"),
        ("student", "学生"), ("school", "学校"), ("class", "班级"), ("door", "门"), ("window", "窗户"),
        ("chair", "椅子"), ("desk", "课桌"), ("blackboard", "黑板"), ("white", "白色"), ("yellow", "黄色"),
    ],
    4: [
        ("panda", "熊猫"), ("tiger", "老虎"), ("monkey", "猴子"), ("elephant", "大象"), ("lion", "狮子"),
        ("giraffe", "长颈鹿"), ("rabbit", "兔子"), ("horse", "马"), ("sheep", "绵羊"), ("cow", "奶牛"),
        ("weather", "天气"), ("sunny", "晴朗的"), ("rainy", "下雨的"), ("windy", "有风的"), ("cloudy", "多云的"),
        ("snowy", "下雪的"), ("warm", "温暖的"), ("cold", "寒冷的"), ("hot", "热的"), ("cool", "凉爽的"),
        ("spring", "春天"), ("summer", "夏天"), ("autumn", "秋天"), ("winter", "冬天"), ("clothes", "衣服"),
        ("coat", "外套"), ("sweater", "毛衣"), ("shirt", "衬衫"), ("dress", "连衣裙"), ("shoes", "鞋子"),
        ("socks", "袜子"), ("hat", "帽子"), ("scarf", "围巾"), ("gloves", "手套"), ("morning", "早晨"),
        ("afternoon", "下午"), ("evening", "晚上"), ("night", "夜晚"), ("today", "今天"), ("yesterday", "昨天"),
        ("breakfast", "早餐"), ("lunch", "午餐"), ("dinner", "晚餐"), ("bread", "面包"), ("noodles", "面条"),
        ("vegetables", "蔬菜"), ("fruit", "水果"), ("orange", "橙子"), ("pear", "梨"), ("grape", "葡萄"),
    ],
    5: [
        ("doctor", "医生"), ("nurse", "护士"), ("teacher", "老师"), ("driver", "司机"), ("cook", "厨师"),
        ("farmer", "农民"), ("policeman", "警察"), ("singer", "歌手"), ("dancer", "舞蹈家"), ("worker", "工人"),
        ("football", "足球"), ("basketball", "篮球"), ("swimming", "游泳"), ("running", "跑步"), ("jumping", "跳跃"),
        ("hobby", "爱好"), ("singing", "唱歌"), ("drawing", "画画"), ("reading", "阅读"), ("dancing", "跳舞"),
        ("shop", "商店"), ("market", "市场"), ("price", "价格"), ("cheap", "便宜的"), ("expensive", "昂贵的"),
        ("sport", "运动"), ("game", "游戏"), ("music", "音乐"), ("art", "美术"), ("science", "科学"),
        ("history", "历史"), ("library", "图书馆"), ("museum", "博物馆"), ("park", "公园"), ("zoo", "动物园"),
        ("bus", "公交车"), ("car", "小汽车"), ("bike", "自行车"), ("plane", "飞机"), ("train", "火车"),
        ("happy", "快乐的"), ("sad", "伤心的"), ("angry", "生气的"), ("excited", "兴奋的"), ("tired", "疲倦的"),
        ("healthy", "健康的"), ("delicious", "美味的"), ("beautiful", "美丽的"), ("fast", "快的"), ("slow", "慢的"),
    ],
    6: [
        ("health", "健康"), ("medicine", "药"), ("hospital", "医院"), ("exercise", "锻炼"), ("rest", "休息"),
        ("travel", "旅行"), ("ticket", "票"), ("airport", "机场"), ("hotel", "旅馆"), ("map", "地图"),
        ("camera", "相机"), ("photo", "照片"), ("beach", "海滩"), ("mountain", "山"), ("forest", "森林"),
        ("environment", "环境"), ("protect", "保护"), ("pollution", "污染"), ("clean", "干净的"), ("recycle", "回收"),
        ("future", "未来"), ("robot", "机器人"), ("computer", "电脑"), ("internet", "互联网"), ("phone", "电话"),
        ("letter", "信"), ("email", "电子邮件"), ("postcard", "明信片"), ("penfriend", "笔友"), ("invite", "邀请"),
        ("party", "聚会"), ("birthday", "生日"), ("gift", "礼物"), ("cake", "蛋糕"), ("candle", "蜡烛"),
        ("festival", "节日"), ("springfestival", "春节"), ("lucky", "幸运的"), ("money", "钱"), ("redpacket", "红包"),
        ("past", "过去"), ("present", "现在"), ("yesterday", "昨天"), ("tomorrow", "明天"), ("weekend", "周末"),
        ("visit", "拜访"), ("meeting", "会议"), ("message", "消息"), ("answer", "回答"), ("question", "问题"),
    ],
}


def _qid(prefix: str) -> str:
    return f"{prefix}_{uuid.uuid4().hex[:8]}"


# ---------- 语文 ----------

def generate_chinese_poem(grade: int, count: int, seed: int | None = None, offset: int = 0) -> list[dict]:
    """古诗上下句填空（fill_blank），按固定点列表 offset 切片（全局不重复）。"""
    pairs = POEMS_BY_GRADE.get(grade, [])
    if not pairs:
        return []
    # 所有填空点：每首 2 个方向（上→下、下→上）
    points: list[tuple[str, str]] = []
    for up, down in pairs:
        points.append((f"“{down}”的前一句是？", up))
        points.append((f"“{up}”的下一句是？", down))
    items: list[dict] = []
    start = offset * count
    for i in range(count):
        idx = start + i
        if idx >= len(points):
            break
        stem, ans = points[idx]
        items.append(
            {
                "id": _qid("cn_poem"),
                "subject": "chinese",
                "grade": grade,
                "type": "fill_blank",
                "knowledge_point_ids": [f"chinese_g{grade}_poem"],
                "stem": stem,
                "options": None,
                "answer": ans,
                "rubric": ans,
                "explanation": f"这句出自古诗，答案是：{ans}",
                "error_type": "记忆不牢",
                "difficulty": 2,
            }
        )
    return items


def generate_chinese_words(grade: int, count: int, seed: int | None = None, offset: int = 0) -> list[dict]:
    """词语/近反义词选择（single_choice），按 offset 固定切片（全局不重复）。"""
    pool = WORD_CHOICES_BY_GRADE.get(grade, [])
    if not pool:
        return []
    items: list[dict] = []
    start = offset * count
    for i in range(count):
        idx = start + i
        if idx >= len(pool):
            break
        w = pool[idx]
        items.append(
            {
                "id": _qid("cn_word"),
                "subject": "chinese",
                "grade": grade,
                "type": "single_choice",
                "knowledge_point_ids": [f"chinese_g{grade}_words"],
                "stem": w["stem"],
                "options": w["options"],
                "answer": w["answer"],
                "rubric": w["options"][ord(w["answer"]) - 65],
                "explanation": f"正确答案：{w['options'][ord(w['answer']) - 65]}",
                "error_type": "概念混淆",
                "difficulty": 2,
            }
        )
    return items



def _vocab_pool(grade: int) -> list[tuple[str, str]]:
    return VOCAB_BY_GRADE.get(grade, [])


def generate_english(grade: int, count: int, seed: int | None = None, reverse: bool = False, offset: int = 0) -> list[dict]:
    """英语词汇题（single_choice），按 offset 固定切片（全局不重复）。
    - reverse=False：看中文选英文（基础课）
    - reverse=True：看英文选中文（拓展课）
    """
    pool = _vocab_pool(grade)
    if not pool:
        return []
    items: list[dict] = []
    start = offset * count
    for i in range(count):
        idx = start + i
        if idx >= len(pool):
            break
        word, meaning = pool[idx]
        # 干扰项：取同年级其他词的中文（排除正确项）
        distractors = [meaning]
        for j in range(len(pool)):
            w2, m2 = pool[j]
            if w2 != word and m2 not in distractors and len(distractors) < 4:
                distractors.append(m2)
            if len(distractors) >= 4:
                break
        ans_idx = distractors.index(meaning)
        letters = ["A", "B", "C", "D"]
        if reverse:
            items.append(
                {
                    "id": _qid("en"),
                    "subject": "english",
                    "grade": grade,
                    "type": "single_choice",
                    "knowledge_point_ids": [f"english_g{grade}_vocab"],
                    "stem": f"“{word}”的中文意思是？",
                    "options": distractors,
                    "answer": letters[ans_idx],
                    "rubric": meaning,
                    "explanation": f"{word} → {meaning}",
                    "error_type": "词汇混淆",
                    "difficulty": 1,
                }
            )
        else:
            items.append(
                {
                    "id": _qid("en"),
                    "subject": "english",
                    "grade": grade,
                    "type": "single_choice",
                    "knowledge_point_ids": [f"english_g{grade}_vocab"],
                    "stem": f"“{meaning}”的英文是？",
                    "options": [w[0] for w in pool[idx:idx + 4]] if False else _options_for(word, pool),
                    "answer": _answer_for(word, pool),
                    "rubric": word,
                    "explanation": f"{meaning} → {word}",
                    "error_type": "词汇混淆",
                    "difficulty": 1,
                }
            )
    return items


def _options_for(word: str, pool: list) -> list[str]:
    """为单词生成 4 个英文选项（含正确项）。"""
    opts = [word]
    for w, _m in pool:
        if w not in opts and len(opts) < 4:
            opts.append(w)
    return opts


def _answer_for(word: str, pool: list) -> str:
    opts = _options_for(word, pool)
    return ["A", "B", "C", "D"][opts.index(word)]