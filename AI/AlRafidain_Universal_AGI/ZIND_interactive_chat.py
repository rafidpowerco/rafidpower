import os
import sys
import time
from llm_engine import UniversalLLMEngine
from plugin_vector_memory import VectorLongTermMemory

# Console Colors
RESET = "\033[0m"
GREEN = "\033[92m"
CYAN = "\033[96m"
YELLOW = "\033[93m"
MAGENTA = "\033[95m"

def clear_screen():
    os.system('cls' if os.name == 'nt' else 'clear')

def print_header():
    clear_screen()
    print(f"""{CYAN}
    ███████╗██╗███╗   ██╗██████╗     ██████╗ ██████╗ ██╗███╗   ███╗███████╗
    ╚══███╔╝██║████╗  ██║██╔══██╗    ██╔══██╗██╔══██╗██║████╗ ████║██╔════╝
      ███╔╝ ██║██╔██╗ ██║██║  ██║    ██████╔╝██████╔╝██║██╔████╔██║█████╗  
     ███╔╝  ██║██║╚██╗██║██║  ██║    ██╔═══╝ ██╔══██╗██║██║╚██╔╝██║██╔══╝  
    ███████╗██║██║ ╚████║██████╔╝    ██║     ██║  ██║██║██║ ╚═╝ ██║███████╗
    ╚══════╝╚═╝╚═╝  ╚═══╝╚═════╝     ╚═╝     ╚═╝  ╚═╝╚═╝╚═╝     ╚═╝╚══════╝
    {MAGENTA}======================================================================
    [النظام الذكي التفاعلي المستمر - ZIND Prime Sovereign AGI]
    [متصل بقاعدة البيانات المتجهة ChromaDB للاحتفاظ بالذاكرة العميقة]
    [المحرك العضوي: Gemini (سحابي مجاني) / اللغات المدعومة: العربية والإنجليزية]
    ======================================================================{RESET}
    """)

def main():
    print_header()
    
    # 1. Initialize Memory
    print(f"{YELLOW}[*]{RESET} جاري تفعيل الذاكرة المتجهة (ChromaDB)...")
    memory = VectorLongTermMemory()
    time.sleep(1)

    # 2. API Key is handled by ZIND_SYSTEM_CORE.py centrally

    # 3. Initialize the Core LLM
    print(f"{YELLOW}[*]{RESET} جاري الاتصال بالعقل المركزي (ZIND Prime)...")
    llm = UniversalLLMEngine(provider="gemini")
    print(f"{GREEN}[+] الاتصال جاهز وحالة الاحترافية القصوى مفعلة.{RESET}\n")

    print(f"[{CYAN}كيف يعمل النظام؟{RESET}]")
    print("- سيقوم النظام بتذكر محادثاتك السابقة والاستفادة منها.")
    print("- إذا أردت تعليمه وتلقينه مهارة معينة بشكل صريح، اخبره بذلك وسيرسخها في قواعد دميته المتجهة.")
    print("- للخروج من المحادثة اكتب: 'خروج' أو 'exit'.")
    print("-" * 60)

    # Main Chat Loop
    while True:
        try:
            user_input = input(f"\n{GREEN}[أنت]: {RESET}").strip()
            
            if not user_input:
                continue
                
            if user_input.lower() in ["exit", "quit", "خروج", "انهاء"]:
                print(f"{MAGENTA}[ZIND Prime]: إلى اللقاء. سأقوم بتخزين هذه الجلسة لكيلا أنسى ما تعلمته.{RESET}")
                break

            print(f"{YELLOW}[يتم معالجة وإدراك البيانات...]{RESET}")

            # Recall memories based on User's input
            recalled_memories = memory.recall_knowledge(query=user_input, n_results=2)
            
            # Construct intelligent prompt
            system_prompt = (
                "أنت اسمه 'ZIND Prime' (زند برايم)، وهو نظام AGI (ذكاء اصطناعي سيادي عام) "
                "تم بناؤه ليكون مهندس ومحلل وصديق محترف للغاية. "
                "أنت تتعلم باستمرار من المحادثات السابقة.\n\n"
            )
            
            if "لم يتم العثور" not in recalled_memories and "[-] ذاكرة" not in recalled_memories:
                 system_prompt += f"هذه بعض المعارف والتجارب من الذاكرة العميقة (ChromaDB) حول الموضوع لمعاونتك:\n{recalled_memories}\n\n"
            else:
                 system_prompt += "حتى الآن، لا يوجد معرفة سابقة في الذاكرة عن هذا الموضوع. استخدم ذكائك الاصطناعي للإجابة.\n\n"

            system_prompt += (
                f"رسالة المستخدم الآن: {user_input}\n"
                "كن محترفاً، دقيقاً، ورد باللغة العربية (أو الانجليزية لو تطلب الأمر) بأسلوب راقٍ. لا تتحدث عن كيفية عمل الذاكرة كأنك آلة، بل تصرف كخبير ومستشار مستنير. "
                "إذا طلب منك المستخدم تعلم شيء، أكد له أنك التقطته."
            )

            # Generate Response
            response = llm.generate(system_prompt)
            print(f"\n{CYAN}[ZIND Prime]:{RESET}\n{response}\n")

            # Save the interaction automatically so the AI "Learns"
            doc_id = f"chat_mem_{int(time.time())}"
            # We save a brief of the interaction
            knowledge_text = f"المستخدم سأل/قال: {user_input} | وكانت إجابتي الجوهرية: {response[:300]}..."
            topic_title = user_input[:40] if len(user_input) > 40 else user_input
            
            memory.save_knowledge(
                document_id=doc_id,
                topic=topic_title,
                deep_analysis=knowledge_text,
                agent_name="ZIND Prime Autonomous Chat"
            )

        except KeyboardInterrupt:
            print(f"\n{MAGENTA}[ZIND Prime]: تم إيقاف جلسة التعلم الاستدلالي.{RESET}")
            break
        except Exception as e:
            print(f"\n{YELLOW}[!] أعتذر، حدثت مشكلة في الاتصال العصبي: {e}{RESET}")

if __name__ == "__main__":
    main()
