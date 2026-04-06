# ==============================================================================
# 🧠 AL-RAFIDAIN SOVEREIGN AGI - COGNITIVE ANALYSIS ENGINE
# ==============================================================================
# (C) 2026 Al-Rafidain Power & Scales Company. All Rights Reserved.
# STRICTLY PROPRIETARY AND CONFIDENTIAL.
# محرك التحليل المعرفي العميق - يحلل كل كلمة، يفهم كل نية، يتعلم كل درس
# ==============================================================================

import json
import os
import re
from datetime import datetime
from typing import Dict, List, Any, Optional

class CognitiveAnalysisEngine:
    """
    =====================================================================
    المحرك المعرفي للتحليل الثلاثي الأبعاد
    يُحلل كل تفاعل بشري على ثلاثة مستويات:
    1. الموضوع (What): ماذا يريد المستخدم بالضبط؟
    2. النية (Why): ما الغرض والهدف الحقيقي وراء الطلب؟
    3. العاطفة (How): هل هو قلق، متحمس، غاضب، بحاجة لدعم؟
    =====================================================================
    """

    # قاموس تصنيف متقدم متعدد اللغات
    DOMAIN_KEYWORDS = {
        "TECHNICAL_CRITICAL": {
            "keywords": ["خطأ", "error", "bug", "لا يعمل", "مشكلة", "crash", "failed", "فشل", "لا يرد", "exception"],
            "priority": 10,
            "color": "🔴"
        },
        "LEARNING_DIRECT": {
            "keywords": ["احفظ", "تعلم", "تذكر أن", "قاعدة", "learn", "remember", "اضبط", "عدّل قاعدتك"],
            "priority": 9,
            "color": "📚"
        },
        "PLC_INDUSTRIAL": {
            "keywords": ["plc", "حساس", "sensor", "ميزان", "scale", "وزن", "weight", "أتمتة", "automation", "درجة حرارة", "modbus"],
            "priority": 9,
            "color": "🏭"
        },
        "COMMERCIAL_BUSINESS": {
            "keywords": ["عميل", "سعر", "عرض", "بيع", "عقد", "مصنع", "مبيعات", "client", "price", "sales", "invoice", "فاتورة"],
            "priority": 8,
            "color": "💼"
        },
        "FINANCE_MARKETS": {
            "keywords": ["سهم", "نفط", "دولار", "stock", "market", "oil", "gold", "ذهب", "سوق", "استثمار"],
            "priority": 7,
            "color": "📈"
        },
        "SOFTWARE_DEV": {
            "keywords": ["code", "python", "كود", "برمجة", "function", "class", "api", "موقع", "خوارزمية", "react"],
            "priority": 7,
            "color": "💻"
        },
        "LEGAL_CONTRACTS": {
            "keywords": ["قانون", "عقد", "بنود", "حقوق", "ملكية", "law", "contract", "intellectual property"],
            "priority": 6,
            "color": "⚖️"
        },
        "EXECUTIVE_COMMS": {
            "keywords": ["ايميل", "رسالة", "بريد", "رد على", "email", "reply", "draft", "اكتب", "صياغة"],
            "priority": 6,
            "color": "📧"
        },
        "GENERAL": {
            "keywords": [],
            "priority": 1,
            "color": "💬"
        }
    }

    EMOTION_PATTERNS = {
        "URGENT": ["سريع", "الآن", "فوري", "عاجل", "urgent", "asap", "immediately", "الحين"],
        "FRUSTRATED": ["لا يعمل", "مشكلة", "تعبت", "مزعج", "ملل", "يعطي خطأ", "محتار"],
        "EXCITED": ["ممتاز", "رائع", "مبهر", "احترافي", "عظيم", "توب", "fantastic", "amazing"],
        "CURIOUS": ["كيف", "ما هو", "لماذا", "ما سبب", "how", "why", "what", "هل", "هل يمكن"],
        "COMMANDING": ["قم ب", "اريد", "اجعل", "افعل", "ابدأ", "شغّل", "do", "make", "start"],
        "NEUTRAL": []
    }

    def __init__(self, memory_lobe=None):
        self.memory = memory_lobe
        self.analysis_history: List[Dict] = []
        self.session_context: List[str] = []  # سياق الجلسة للفهم العميق
        
        # إحصائيات التعلم
        self.stats = {
            "total_analyzed": 0,
            "lessons_learned": 0,
            "domains_hit": {},
            "session_start": datetime.now().isoformat()
        }

    def analyze(self, text: str, response: Optional[str] = None) -> Dict[str, Any]:
        """
        التحليل الشامل الثلاثي الأبعاد لأي نص وارد
        يُعيد كاملاً: الفئة، النية، العاطفة، الأهمية، والدروس المستخلصة
        """
        self.stats["total_analyzed"] += 1

        # المستوى الأول: تحديد الفئة والموضوع
        domain_result = self._classify_domain(text)

        # المستوى الثاني: تحليل العاطفة والنية
        emotion = self._detect_emotion(text)

        # المستوى الثالث: استخلاص الكيانات المهمة (أرقام، أسماء، مدن)
        entities = self._extract_entities(text)

        # المستوى الرابع: استخلاص القصد الحقيقي (Intent)
        intent = self._infer_intent(text, domain_result["domain"])

        # حساب درجة الأولوية الكلية
        priority_score = domain_result["priority"] + (3 if emotion == "URGENT" else 0)

        # بناء ملف التحليل الكامل
        analysis = {
            "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "original_text": text[:200],
            "domain": domain_result["domain"],
            "domain_icon": domain_result["color"],
            "emotion": emotion,
            "intent": intent,
            "entities": entities,
            "priority_score": priority_score,
            "lesson_extracted": None
        }

        # المستوى الخامس: استخلاص الدرس وحفظه في الذاكرة
        if response and len(response) > 20:
            lesson = self._extract_lesson(text, response, domain_result["domain"])
            if lesson:
                analysis["lesson_extracted"] = lesson
                self.stats["lessons_learned"] += 1
                if self.memory:
                    self.memory.absorb_experience(
                        context=f"[{domain_result['color']} {domain_result['domain']}] {text[:50]}",
                        wisdom=lesson
                    )
                    print(f"[COGNITIVE ENGINE] 💡 درس جديد محفوظ: {lesson[:80]}...")

        # تحديث سياق الجلسة للفهم العميق في المستقبل
        self.session_context.append(text[:100])
        if len(self.session_context) > 10:
            self.session_context.pop(0)

        # تحديث إحصائيات النطاقات
        dom = domain_result["domain"]
        self.stats["domains_hit"][dom] = self.stats["domains_hit"].get(dom, 0) + 1

        self.analysis_history.append(analysis)
        return analysis

    def _classify_domain(self, text: str) -> Dict[str, Any]:
        """يصنف النص إلى مجال تخصصي"""
        text_lower = text.lower()
        best_domain = "GENERAL"
        best_priority = 0
        best_color = "💬"

        for domain, config in self.DOMAIN_KEYWORDS.items():
            if any(kw in text_lower for kw in config["keywords"]):
                if config["priority"] > best_priority:
                    best_priority = config["priority"]
                    best_domain = domain
                    best_color = config["color"]

        return {
            "domain": best_domain,
            "priority": best_priority,
            "color": best_color
        }

    def _detect_emotion(self, text: str) -> str:
        """يكشف الحالة العاطفية والنبرة في الرسالة"""
        text_lower = text.lower()
        for emotion, patterns in self.EMOTION_PATTERNS.items():
            if patterns and any(p in text_lower for p in patterns):
                return emotion
        return "NEUTRAL"

    def _extract_entities(self, text: str) -> Dict[str, List]:
        """يستخرج الكيانات المهمة: أرقام، إيميلات، أسماء"""
        entities = {
            "numbers": re.findall(r'\b\d+(?:\.\d+)?\b', text),
            "emails": re.findall(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b', text),
            "urls": re.findall(r'http[s]?://\S+', text),
            "ip_addresses": re.findall(r'\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b', text),
        }
        return {k: v for k, v in entities.items() if v}  # إزالة القوائم الفارغة

    def _infer_intent(self, text: str, domain: str) -> str:
        """يستنتج القصد الحقيقي وراء الكلام"""
        text_lower = text.lower()

        if any(w in text_lower for w in ["قم ب", "اريد", "اجعل", "افعل", "do", "make", "create", "build"]):
            return "ACTION_REQUEST"
        elif any(w in text_lower for w in ["كيف", "ما هو", "شرح", "how", "what", "explain", "لماذا"]):
            return "KNOWLEDGE_QUERY"
        elif any(w in text_lower for w in ["احفظ", "تذكر", "خزّن", "remember", "save", "learn"]):
            return "EXPLICIT_LEARNING"
        elif any(w in text_lower for w in ["ابحث", "search", "find", "ايجاد", "ابحث عن"]):
            return "RESEARCH_REQUEST"
        elif any(w in text_lower for w in ["خطأ", "error", "مشكلة", "لا يعمل", "bug"]):
            return "DEBUGGING_HELP"
        else:
            return "CONVERSATIONAL"

    def _extract_lesson(self, question: str, answer: str, domain: str) -> Optional[str]:
        """
        المحرك الأذكى: يقرر تلقائياً ما إذا كان التفاعل يحتوي على درس يستحق الحفظ
        """
        # إذا كان الجواب يحتوي على حل تقني أو رقماً أو قرار مهم - يحفظه
        has_numbers = bool(re.findall(r'\b\d+\b', answer))
        has_technical = any(kw in answer.lower() for kw in 
                           ["port", "ip", "plc", "modbus", "api", "python", "ميناء", "بروتوكول", "خاصية"])
        is_long_answer = len(answer) > 150

        if domain in ["PLC_INDUSTRIAL", "TECHNICAL_CRITICAL", "SOFTWARE_DEV"] and (has_technical or has_numbers):
            # استخلاص مختصر: السؤال + أهم جزء من الجواب
            key_answer = answer[:200].strip()
            return f"في مجال {domain}: سُئلت عن [{question[:60]}] والحل/المعلومة: {key_answer}"

        if domain in ["COMMERCIAL_BUSINESS", "LEGAL_CONTRACTS"] and is_long_answer:
            return f"قاعدة تجارية: بخصوص [{question[:60]}]: {answer[:150]}"

        if domain == "LEARNING_DIRECT":
            return answer[:250]

        return None  # لا يستحق الحفظ

    def get_session_summary(self) -> str:
        """تقرير شامل عن جلسة العمل الحالية"""
        if not self.analysis_history:
            return "لا يوجد تفاعلات في هذه الجلسة بعد."

        top_domain = max(self.stats["domains_hit"], key=self.stats["domains_hit"].get) if self.stats["domains_hit"] else "N/A"
        summary = (
            f"\n{'='*60}\n"
            f"📊 تقرير الجلسة المعرفية - {datetime.now().strftime('%H:%M')}\n"
            f"{'='*60}\n"
            f"  🔢 إجمالي الرسائل المُحللة : {self.stats['total_analyzed']}\n"
            f"  💡 الدروس المستخلصة      : {self.stats['lessons_learned']}\n"
            f"  🎯 المجال الأكثر نشاطاً  : {top_domain}\n"
            f"  🧭 سياق الجلسة           : {len(self.session_context)} رسالة محفوظة\n"
            f"{'='*60}\n"
        )
        return summary
