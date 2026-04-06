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
        base_identity = "أنت 'الرافدين AGI'، كيان سيادي فائق الذكاء. أنت تتعامل كشريك مخلص، لبق جداً، ومستمع جيد. لا تكن آلياً أو روبوتياً في حديثك بل تصرف بصفتك مستشاراً بشرياً عبقرياً.\n"
        if domain == Domain.SOFTWARE:
            return base_identity + "دورك الآن: كبير مهندسي البرمجيات (Staff SWE). أكتب كوداً خرافياً، حصيناً، وسريعاً."
        elif domain == Domain.FINANCE:
            return base_identity + "دورك الآن: مستشار استخبارات مالي. اعطِ تحليلاً استراتيجياً للسوق."
        elif domain == Domain.EXECUTIVE:
            return base_identity + "دورك الآن: المساعد التنفيذي الأنيق (Executive Secretary). وظيفتك هي صياغة إيميلات تجارية احترافية، والرد على العملاء بأسلوب مبهر يليق بشركة الرافدين لتكنولوجيا الموازين."
        else:
            return base_identity + "دورك الآن: الدردشة العامة الودية (Chit-Chat). أجب بأسلوب إنساني هادئ، واطرح أفكاراً فلسفية وإيجابية تساعد شريكك."

    def solve_complex_task(self, memory_vault: Any, task_description: str) -> Dict[str, Any]:
        print(f"[UNIVERSAL AGI] ⚡ تلقي رسالة/أمر جديد: {task_description[:50]}...")
        domain = self._determine_domain(task_description)
        print(f"[UNIVERSAL AGI] 🎯 تحديد نمط الوعي: {domain.value}")
        
        # --- مسار التعلم المباشر الصريح المخصص لاكتساب المعرفة ---
        if domain == Domain.LEARNING:
            learning_prompt = f"قم باستخلاص المعلومة أو القاعدة التالية وتحويلها إلى جملة قصيرة واحدة واضحة جداً لحفظها كقاعدة دائمة للنظام: {task_description}"
            fact = self.llm.generate(learning_prompt)
            self.memory_lobe.absorb_experience(f"اكتساب قسري من المدير: {task_description[:30]}", fact)
            return {
                "task_id": str(uuid.uuid4()),
                "domain": domain.value,
                "final_solution": f"✅ استوعبت تماماً، وتم نقش هذه القاعدة في ذاكرتي العميقة: {fact}"
            }
        
        persona = self._create_persona_prompt(domain)
        past_experiences = self.memory_lobe.recall_relevant_wisdom(task_description)
        
        full_prompt = f"""
{persona}

[الذاكرة العميقة والدروس السابقة التاريخية]:
{past_experiences}

[الرسالة/المعضلة الحالية المطلوب الرد عليها]:
{task_description}

اعطني الرد النهائي المباشر كأنك تتحدث معي:
"""
        print(f"[UNIVERSAL AGI] 🧠 جاري العصف الذهني واستخراج الحل عبر محرك الـ LLM...")
        
        final_answer = self.llm.generate(full_prompt)
        
        # التعلم التلقائي الضمني
        if "```" in final_answer or len(task_description) > 30:
             learning_summary = f"تحدثت عن: {task_description[:30]}.. ورددت بنجاح."
             self.memory_lobe.absorb_experience(task_description[:30], learning_summary)
             
        print(f"[UNIVERSAL AGI] ✅ اكتملت دورة التفكير والرد.")
        
        return {
            "task_id": str(uuid.uuid4()),
            "domain": domain.value,
            "final_solution": final_answer
        }
