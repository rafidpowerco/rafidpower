import os, json, asyncio, time, chromadb, sys
sys.path.append(os.path.join(os.getcwd(), 'AlRafidain_Universal_AGI'))
from llm_engine import UniversalLLMEngine
chroma_client = chromadb.PersistentClient(path='./chroma_db_vault')
collection = chroma_client.get_or_create_collection(name='rafid_cognitive_memory')
llm = UniversalLLMEngine()

async def forge_answer(q):
    prompt = f'أنت الخادم السيادي رافد. حلل وتعلم من هذه المعلومات أو أجب عليها باحترافية مالية وبرمجية سيادية:\n{q}\nاحتفظ بشخصيتك العبقرية.'
    try: return await llm.generate(prompt, task_type='training_generation')
    except: return None

async def ingest_new():
    files = [f for f in os.listdir(r'C:\Users\Administrator\Desktop\ai_training_questions') if 'الية التداول' in f and f.endswith('.json')]
    print(f'Found {len(files)} new files.')
    for f in files:
        with open(os.path.join(r'C:\Users\Administrator\Desktop\ai_training_questions', f), 'r', encoding='utf-8') as file:
            data = json.load(file)
        print(f'Processing {f}...')
        for idx, item in enumerate(data):
            q = item.get('question') or str(item)
            ans = await forge_answer(q)
            if ans:
                collection.add(
                    documents=[f'Info: {q}\nRafid Deep Analysis: {ans}'],
                    metadatas=[{'category': 'Trading_Mechanism', 'source': 'External_Data'}],
                    ids=[f'mech_{int(time.time())}_{f}_{idx}']
                )
            await asyncio.sleep(2)
        print(f'{f} injected successfully.')

asyncio.run(ingest_new())
