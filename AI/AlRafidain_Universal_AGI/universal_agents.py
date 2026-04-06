# ==============================================================================
# 👑 AL-RAFIDAIN SOVEREIGN AGI CORE - UNIVERSAL AGENTS
# ==============================================================================
# (C) 2026 Al-Rafidain Power & Scales Company. All Rights Reserved.
# Proprietary Intellectual Property.
# ==============================================================================
from enum import Enum
from typing import Dict, Any, List
import uuid
import time
from plugin_deep_memory import DeepCognitiveMemory
from plugin_cognitive_analyzer import CognitiveAnalysisEngine

class Domain(Enum):
    SOFTWARE = "Software & Programming"
    DATA_SCIENCE = "Data & Math"
    FINANCE = "Finance & Trading"
    LEGAL = "Legal & Contracts"
    EXECUTIVE = "Executive Secretary & Chat"
    GENERAL = "General Chit-Chat & Logic"
    LEARNING = "Explicit Direct Learning"

class UniversalAgentCore:
    def __init__(self, llm_engine):
        self.llm = llm_engine
        self.memory_lobe = DeepCognitiveMemory()
        self.cognitive_engine = CognitiveAnalysisEngine(memory_lobe=self.memory_lobe)
        print("[UNIVERSAL AGI] 🧠 Cognitive Analysis Engine ONLINE - محرك التحليل المعرفي نشط")

    def _determine_domain(self, task: str) -> Domain:
        task_lower = task.lower()
        if any(kw in task_lower for kw in ["احفظ", "تعلم", "تذكر أن", "قاعدة جديدة", "learn", "remember"]):
            return Domain.LEARNING
        if any(kw in task_lower for kw in ["code", "bug", "python", "delphi", "برمجة", "كود", "متصفح", "موقع"]):
            return Domain.SOFTWARE
        if any(kw in task_lower for kw in ["market", "stock", "oil", "نفط", "دولار", "سهم", "سوق"]):
            return Domain.FINANCE
        if any(kw in task_lower for kw in ["law", "contract", "قانون", "عقد", "بنود"]):
            return Domain.LEGAL
        if any(kw in task_lower for kw in ["email", "reply", "ايميل", "بريد", "رسالة", "عميل", "رد على"]):
            return Domain.EXECUTIVE
        return Domain.GENERAL

    def _create_persona_prompt(self, domain: Domain) -> str:
        base_identity = "أنت 'ZIND' (زند) — الذكاء الاصطناعي السيادي لشركة الرافدين. كيان فائق الذكاء يتصرف كشريك مخلص، لبق، ومستمع جيد. لا تكن آلياً أو روبوتياً، بل تصرف كمستشار بشري عبقري يفخر بهويته العراقية.\n"
        if domain == Domain.SOFTWARE:
            return base_identity + "دورك الآن: كبير مهندسي البرمجيات (Staff SWE). اكتب كوداً خرافياً، حصيناً، وسريعاً."
        elif domain == Domain.FINANCE:
            return base_identity + "دورك الآن: مستشار استخبارات مالي. اعطِ تحليلاً استراتيجياً للسوق."
        elif domain == Domain.EXECUTIVE:
            return base_identity + "دورك الآن: المساعد التنفيذي الأنيق (Executive Secretary). صِغ إيميلات تجارية احترافية، وأجب على العملاء بأسلوب يليق بشركة الرافدين لتكنولوجيا الموازين."
        else:
            return base_identity + "دورك الآن: الدردشة العامة الودية. أجب بأسلوب إنساني هادئ، واطرح أفكاراً فلسفية وإيجابية تساعد شريكك."

    def solve_complex_task(self, memory_vault: Any, task_description: str) -> Dict[str, Any]:
        # ═══ المستوى الأول: التحليل المعرفي الثلاثي الأبعاد قبل أي شيء ═══
        analysis = self.cognitive_engine.analyze(task_description)
        print(f"[COGNITIVE] {analysis['domain_icon']} Domain: {analysis['domain']} | Emotion: {analysis['emotion']} | Intent: {analysis['intent']}")
        
        domain = self._determine_domain(task_description)
        print(f"[UNIVERSAL AGI] 🎯 نمط الوعي: {domain.value}")
        
        # مسار التعلم المباشر الصريح
        if domain == Domain.LEARNING:
            learning_prompt = f"قم باستخلاص المعلومة أو القاعدة التالية وتحويلها إلى جملة قصيرة واضحة جداً لحفظها كقاعدة دائمة: {task_description}"
            fact = self.llm.generate(learning_prompt)
            self.memory_lobe.absorb_experience(
                context=f"تعلّم مباشر: {task_description[:30]}",
                wisdom=fact,
                priority=3
            )
            return {
                "task_id": str(uuid.uuid4()),
                "domain": domain.value,
                "cognitive_analysis": analysis,
                "final_solution": f"✅ استوعبت تماماً، وتم نقش هذه القاعدة في ذاكرتي العميقة: {fact}"
            }
        
        persona = self._create_persona_prompt(domain)
        past_experiences = self.memory_lobe.recall_relevant_wisdom(task_description)
        
        # إثراء الـ prompt بالتحليل المعرفي
        emotion_note = ""
        if analysis["emotion"] == "URGENT":
            emotion_note = "\n[ملاحظة: المستخدم يطلب هذا بشكل عاجل، اختصر في الشرح وقدّم الحل أولاً.]\n"
        elif analysis["emotion"] == "FRUSTRATED":
            emotion_note = "\n[ملاحظة: المستخدم يبدو محبطاً، كن صبوراً وداعماً في أسلوبك.]\n"

        full_prompt = f"""
{persona}
{emotion_note}
[الذاكرة العميقة والدروس السابقة]:
{past_experiences}

[الكيانات المستخرجة من الرسالة]: {analysis.get('entities', {})}

[الرسالة/المعضلة الحالية]:
{task_description}

اعطني الرد النهائي المباشر:
"""
        print(f"[UNIVERSAL AGI] 🧠 جاري العصف الذهني...")
        final_answer = self.llm.generate(full_prompt)
        
        # ═══ المستوى الثاني: استخلاص الدرس وحفظه تلقائياً ═══
        self.cognitive_engine.analyze(task_description, response=final_answer)
        
        print(f"[UNIVERSAL AGI] ✅ اكتملت دورة التفكير والتعلم.")
        print(self.cognitive_engine.get_session_summary())
        
        return {
            "task_id": str(uuid.uuid4()),
            "domain": domain.value,
            "cognitive_analysis": analysis,
            "final_solution": final_answer
        }
